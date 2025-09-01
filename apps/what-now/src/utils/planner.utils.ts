import { Result } from '@shuunen/utils'
import type { Task } from '../types'
import { updateTask } from './database.utils'
import { daysRecurrence, daysSinceCompletion } from './tasks.utils'

export const weekDays = ['Mon W1', 'Tue W1', 'Wed W1', 'Thu W1', 'Fri W1', 'Sat W1', 'Sun W1', 'Mon W2', 'Tue W2', 'Wed W2', 'Thu W2', 'Fri W2', 'Sat W2', 'Sun W2']
export const daysInWeek = 14
// oxlint-disable-next-line no-magic-numbers
export const allDayIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
export const dailyRecurrence = 1
export const twoDayRecurrence = 2
export const threeDayRecurrence = 3
export const weeklyRecurrence = 7

// Constants for recurrence patterns
export const dayFrequency = 1
export const weekFrequency = 7
export const biWeeklyFrequency = 14
export const triWeeklyFrequency = 21
export const monthlyFrequency = 28

// Valid frequency options in ascending order (higher frequency = lower number)
// oxlint-disable-next-line no-magic-numbers
export const validFrequencies = [dayFrequency, 2, 3, 4, 5, 6, weekFrequency, biWeeklyFrequency, triWeeklyFrequency, monthlyFrequency]

/**
 * Converts days recurrence to frequency string
 * @param days - Number of days between recurrences
 * @returns Frequency string for the task's once property
 */
export function daysToFrequencyString(days: number): string {
  if (days === dayFrequency) return 'day'
  if (days === weekFrequency) return 'week'
  if (days === biWeeklyFrequency) return '2-weeks'
  if (days === triWeeklyFrequency) return '3-weeks'
  if (days === monthlyFrequency) return '4-weeks'
  return `${days}-days`
}

/**
 * Gets the next higher frequency (lower days)
 * @param currentDays - Current recurrence in days
 * @returns Next higher frequency or undefined if already at maximum
 */
export function getHigherFrequency(currentDays: number): number | undefined {
  const currentIndex = validFrequencies.indexOf(currentDays)
  if (currentIndex <= 0) return undefined // Already at highest frequency (daily)
  return validFrequencies[currentIndex - 1]
}

/**
 * Gets the next lower frequency (higher days)
 * @param currentDays - Current recurrence in days
 * @returns Next lower frequency or undefined if already at minimum
 */
export function getLowerFrequency(currentDays: number): number | undefined {
  const currentIndex = validFrequencies.indexOf(currentDays)
  const notFound = -1
  if (currentIndex === notFound || currentIndex >= validFrequencies.length - 1) return undefined
  return validFrequencies[currentIndex + 1]
}

/**
 * Gets the effective recurrence for a task (considering modifications)
 * @param task - The task
 * @param modifications - Current modifications
 * @returns The effective recurrence in days
 */
export function getEffectiveRecurrence(task: Task, modifications: Record<string, number>): number {
  return modifications[task.id] ?? daysRecurrence(task)
}

/**
 * Gets a color class based on task recurrence for visual distinction
 * @param task - The task to get color for
 * @param modifications - Current modifications (optional)
 * @returns CSS classes for styling the task
 */
export function getTaskColor(task: Task, modifications: Record<string, number> = {}): string {
  const recurrence = getEffectiveRecurrence(task, modifications)
  if (recurrence === dailyRecurrence) return 'bg-red-900/10 border-red-500/30 text-red-300'
  if (recurrence === twoDayRecurrence) return 'bg-orange-900/10 border-orange-500/30 text-orange-300'
  if (recurrence === threeDayRecurrence) return 'bg-blue-900/10 border-blue-500/30 text-blue-300'
  if (recurrence >= weeklyRecurrence) return 'bg-green-900/10 border-green-500/30 text-green-300'
  return 'bg-gray-800/30 border-gray-600/30 text-gray-300'
}

/**
 * Calculates which days of the current two weeks a task should appear based on recurrence
 * @param daysSinceComplete - Days since task was last completed
 * @param recurrence - Task recurrence in days
 * @returns Array of day indices where task should appear
 */
function calculateWeeklyTaskDays(daysSinceComplete: number, recurrence: number): number[] {
  const taskDays: number[] = []
  const today = new Date()
  const sundayToMondayOffset = 6
  const daysInSingleWeekConstant = 7
  const currentDayOfWeek = (today.getDay() + sundayToMondayOffset) % daysInSingleWeekConstant
  for (let dayIndex = 0; dayIndex < daysInWeek; dayIndex += 1) {
    const daysFromToday = dayIndex - currentDayOfWeek
    const totalDaysFromLastCompletion = daysSinceComplete + daysFromToday
    if (totalDaysFromLastCompletion >= recurrence && totalDaysFromLastCompletion % recurrence === 0) taskDays.push(dayIndex)
  }
  return taskDays
}

/**
 * Determines which days of the two weeks a task should appear based on its effective recurrence pattern
 * @param task - The task to analyze
 * @param modifications - Current modifications to tasks
 * @returns Array of day indices (0-13) where the task should appear
 */
export function getTaskDaysWithModifications(task: Task, modifications: Record<string, number>): number[] {
  const recurrence = getEffectiveRecurrence(task, modifications)
  if (recurrence === 0 || task.once === 'yes') return []
  if (recurrence === dailyRecurrence) return allDayIndices
  const daysSinceComplete = daysSinceCompletion(task)
  return calculateWeeklyTaskDays(daysSinceComplete, recurrence)
}

/**
 * Creates the task distribution data structure
 * @param tasks - Array of tasks to distribute
 * @param modifications - Current modifications to tasks
 * @returns Record mapping day indices to task arrays
 */
export function createTaskDistribution(tasks: Task[], modifications: Record<string, number> = {}) {
  // Create a map of day index to tasks for that day
  const tasksByDay: Record<number, Task[]> = {}
  for (let dayIndex = 0; dayIndex < daysInWeek; dayIndex += 1) tasksByDay[dayIndex] = []
  // Distribute tasks across days based on their effective recurrence
  for (const task of tasks) {
    const taskDays = getTaskDaysWithModifications(task, modifications)
    for (const dayIndex of taskDays) tasksByDay[dayIndex].push(task)
  }
  return tasksByDay
}

/**
 * Creates an update promise for a single task modification
 * @param taskId - ID of the task to update
 * @param newDays - New recurrence in days
 * @param tasks - Array of all tasks
 * @returns Promise for updating the task
 */
function createTaskUpdatePromise(taskId: string, newDays: number, tasks: Task[]) {
  const task = tasks.find(currentTask => currentTask.id === taskId)
  if (!task) return Promise.resolve(Result.error(`failed to find task ${taskId}`))
  const frequencyString = daysToFrequencyString(newDays)
  return updateTask({ ...task, once: frequencyString })
}

/**
 * Creates a date update promise for a task
 * @param taskId - Task ID to update
 * @param newCompletedOn - New completion date
 * @param tasks - Array of all tasks
 * @returns Promise that resolves to update result
 */
function createTaskDateUpdatePromise(taskId: string, newCompletedOn: string, tasks: Task[]) {
  const task = tasks.find(currentTask => currentTask.id === taskId)
  if (!task) return Promise.resolve(Result.error(`task with id ${taskId} not found`))
  return updateTask({ ...task, completedOn: newCompletedOn })
}

/**
 * Processes all update promises and checks if they were successful
 * @param updatePromises - Array of update promises
 * @returns Promise that resolves to Result indicating success or failure
 */
async function processUpdatePromises(updatePromises: Promise<unknown>[]) {
  const results = await Promise.allSettled(updatePromises)
  const allSuccessful = results.every(result => {
    if (result.status !== 'fulfilled') return false
    const value = result.value as { ok: boolean }
    return value?.ok
  })
  if (!allSuccessful) return Result.error('failed to save task modifications')
  return Result.ok('successfully saved task modifications')
}

/**
 * Handles saving task frequency modifications
 * @param frequencyModifications - Record of task ID to new frequency in days
 * @param dateModifications - Record of task ID to new completion date
 * @param tasks - Array of all tasks
 * @returns Promise that resolves when save is complete
 */
export function saveTaskModifications(frequencyModifications: Record<string, number>, dateModifications: Record<string, string>, tasks: Task[]) {
  const updatePromises: Promise<unknown>[] = []

  // Handle frequency modifications
  const frequencyEntries = Object.entries(frequencyModifications)
  const frequencyPromises = frequencyEntries.map(([taskId, newDays]) => createTaskUpdatePromise(taskId, newDays, tasks))
  updatePromises.push(...frequencyPromises)

  // Handle date modifications
  const dateEntries = Object.entries(dateModifications)
  const datePromises = dateEntries.map(([taskId, newCompletedOn]) => createTaskDateUpdatePromise(taskId, newCompletedOn, tasks))
  updatePromises.push(...datePromises)

  return processUpdatePromises(updatePromises)
}
