import { dateIso10, daysAgoIso10, nbBefore, nbDaysInMonth, nbDaysInWeek, nbDaysInYear, nbMsInDay, nbMsInMinute, Result, readableTimeAgo } from '@shuunen/shuutils'
import type { Task } from '../types'
import { getTasks, updateTask } from './database.utils'
import { logger } from './logger.utils'
import { state } from './state.utils'

const recurrenceRegex = /(?<quantity>\d{1,3})?-?(?<unit>day|month|week|year)/u

export function daysRecurrence(task: Task) {
  const matches = recurrenceRegex.exec(task.once)
  if (matches === null) return 0
  const quantity = matches.groups?.quantity ?? '1'
  const unit = matches.groups?.unit as 'day' | 'month' | 'week' | 'year'
  const number = Number.parseInt(quantity, 10)
  if (unit === 'day') return number
  if (unit === 'week') return number * nbDaysInWeek
  if (unit === 'month') return number * nbDaysInMonth
  return number * nbDaysInYear
}

export function daysSinceCompletion(task: Task) {
  const today = dateIso10(new Date())
  const todayTimestamp = new Date(today).getTime()
  const completedOnTimestamp = new Date(task.completedOn).getTime()
  return (todayTimestamp - completedOnTimestamp) / nbMsInDay
}

export function completeTask(task: Task) {
  task.completedOn = dateIso10(new Date()) // task is complete for today
  task.isDone = task.once === 'yes' // but it also can be done totally if it was a one time job
  return updateTask(task)
}

export function unCompleteTask(task: Task) {
  // to un-complete, need to put the last completed on just before the required number of days
  task.completedOn = daysAgoIso10(daysRecurrence(task))
  task.isDone = false
  return updateTask(task)
}

export function isTaskActive(task: Task, shouldIncludeCompletedToday = false) {
  if (task.isDone) return false
  if (task.completedOn === '' || task.once === 'yes') return true
  const recurrence = daysRecurrence(task)
  const days = daysSinceCompletion(task)
  const isActive = (shouldIncludeCompletedToday && days === 0) || days >= recurrence
  return isActive
}

export function byActive(taskA: Task, taskB: Task) {
  const isA = isTaskActive(taskA)
  const isB = isTaskActive(taskB)
  if (isA && !isB) return -1
  if (!isA && isB) return 1
  return 0
}

export async function fetchList() {
  logger.info('fetch list')
  state.statusInfo = 'Loading tasks, please wait...'
  const result = await getTasks()
  if (!result.ok) return result
  state.statusInfo = ''
  state.tasksTimestamp = Date.now()
  const list = result.value.filter(task => isTaskActive(task, true)).sort(byActive)
  return Result.ok(list)
}

export function isDataOlderThan(milliseconds: number) {
  if (!state.tasksTimestamp) return true
  const age = Date.now() - state.tasksTimestamp
  const minutes = Math.round(age / nbMsInMinute)
  /* c8 ignore next */
  if (minutes > 0) logger.info('last activity', minutes, 'minute(s) ago')
  return age >= milliseconds
}

export async function loadTasks() {
  if (!state.isSetup) return Result.error('not setup, cannot load tasks')
  if (state.tasks.length > 0 && !isDataOlderThan(Number(nbMsInMinute))) return Result.ok(`tasks are fresh (${readableTimeAgo(Date.now() - state.tasksTimestamp)})`)
  const result = await fetchList()
  if (!result.ok) return result
  logger.info('found', result.value.length, 'task(s)')
  state.isLoading = false
  state.tasks = result.value
  return Result.ok('tasks loaded')
}

export function dispatchTask(task: Task, index = 0) {
  if (['day', 'yes'].includes(task.once)) return Result.error(task.once === 'yes' ? 'one-time task, cannot dispatch' : 'daily task, nothing to dispatch')
  const delay = daysRecurrence(task)
  const position = index % delay
  const completionDate = daysAgoIso10(nbBefore * position + delay)
  if (completionDate === task.completedOn) return Result.error('task already dispatched')
  task.completedOn = completionDate
  return updateTask(task)
}

export async function dispatchTasks(tasks: Task[]) {
  logger.info('dispatch tasks')
  await Promise.all(tasks.map((task, index) => dispatchTask(task, index)))
  state.tasksTimestamp = 0 // invalidate cache
  await loadTasks()
}

export function toggleComplete(task: Task) {
  if (isTaskActive(task)) return completeTask(task)
  return unCompleteTask(task)
}
