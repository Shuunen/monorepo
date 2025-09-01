import { dateIso10, nbPercentMax, nbSpacesIndent, Result, slugify, toastError, toastSuccess } from '@monorepo/utils'
import { Client, Databases, type Models, Query } from 'appwrite'
import type { AppWriteTask, Task } from '../types'
import { logger } from './logger.utils'
import { state } from './state.utils'

const client = new Client()
const database = new Databases(client)
client.setEndpoint('https://cloud.appwrite.io/v1').setProject('what-now')

export type AppWriteTaskModel = AppWriteTask & Models.Document

export const uuidMaxLength = 36

/**
 * Convert a task from the database to a task in the app
 * @param task the db task to convert
 * @returns the app task
 */
export function modelToLocalTask(task: AppWriteTaskModel) {
  return {
    completedOn: task['completed-on'],
    id: task.$id,
    isDone: task.done,
    minutes: task.minutes,
    name: task.name,
    once: task.once,
    reason: task.reason ?? undefined,
  } satisfies Task
}

/**
 * Create task for database insertion
 * @param model - The uploaded task
 * @returns AppWrite task format
 */
export function modelToRemoteTask(model: AppWriteTaskModel) {
  return {
    'completed-on': model['completed-on'],
    done: model.done,
    minutes: model.minutes,
    name: model.name,
    once: model.once,
    reason: model.reason,
  } satisfies AppWriteTask
}

/**
 * Convert a task from the app to the task format used in the database
 * @param task the app task to convert
 * @returns the db task
 */
export function localToRemoteTask(task: Readonly<Task>) {
  return {
    'completed-on': task.completedOn,
    done: task.isDone,
    minutes: task.minutes,
    name: task.name,
    once: task.once,
    reason: task.reason ?? '',
  } satisfies AppWriteTask
}

/**
 * Add a task to the database
 * @param data the task to add
 * @returns the result of the operation
 */
export function addTask(data: Readonly<AppWriteTask>) {
  const id = slugify(data.name).slice(0, uuidMaxLength)
  return Result.trySafe(database.createDocument(state.apiDatabase, state.apiCollection, id, data))
}

/**
 * Update a task in the database
 * @param task the task to update
 * @returns the result of the operation
 */
export function updateTask(task: Readonly<Task>) {
  const data = localToRemoteTask(task)
  return Result.trySafe(database.updateDocument<AppWriteTaskModel>(state.apiDatabase, state.apiCollection, task.id, data))
}

/**
 * Get all tasks from the database
 * @returns the result of the operation
 */
export async function getTasks() {
  const result = await Result.trySafe(database.listDocuments<AppWriteTaskModel>(state.apiDatabase, state.apiCollection, [Query.limit(nbPercentMax)]))
  if (!result.ok) return result
  const tasks = result.value.documents.map<Task>(task => modelToLocalTask(task))
  logger.info(`found ${tasks.length} tasks on db`, tasks)
  return Result.ok(tasks)
}

/* c8 ignore start */
/**
 * Download the data from the database
 * @returns the result of the operation
 */
export async function downloadData() {
  const result = await Result.trySafe(database.listDocuments<AppWriteTaskModel>(state.apiDatabase, state.apiCollection, [Query.limit(nbPercentMax)]))
  if (!result.ok) {
    toastError('Failed to download data')
    logger.error('failed to download data', result.error)
    return
  }
  const json = JSON.stringify(result.value.documents, undefined, nbSpacesIndent)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${dateIso10()}_what-now_tasks.json`
  document.body.append(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
  toastSuccess('Data downloaded')
}
