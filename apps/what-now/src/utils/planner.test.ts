import { Result } from '@shuunen/shuutils'
import type { Models } from 'appwrite'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AppWriteTask, Task } from '../types'
import * as databaseUtils from './database.utils'
import { allDayIndices, createTaskDistribution, daysInWeek, daysToFrequencyString, getEffectiveRecurrence, getHigherFrequency, getLowerFrequency, getTaskColor, getTaskDaysWithModifications, saveTaskModifications, validFrequencies, weekDays } from './planner.utils'
import * as tasksUtils from './tasks.utils'

vi.mock('./database.utils')
vi.mock('./tasks.utils')

type AppWriteTaskModel = AppWriteTask & Models.Document

const mockTask: Task = {
  completedOn: '2023-01-01T10:00:00Z',
  id: 'task-1',
  isDone: false,
  minutes: 30,
  name: 'Test Task',
  once: 'week',
}

const mockAppWriteTask: AppWriteTaskModel = {
  $collectionId: 'collection-id',
  $createdAt: '2023-01-01T10:00:00Z',
  $databaseId: 'database-id',
  $id: 'task-1',
  $permissions: [],
  $sequence: 1,
  $updatedAt: '2023-01-01T10:00:00Z',
  'completed-on': '2023-01-01T10:00:00Z',
  done: false,
  minutes: 30,
  name: 'Test Task',
  once: '2-weeks',
}

describe('planner utils', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock current date for consistent testing
    vi.setSystemTime(new Date('2023-01-08T10:00:00Z')) // Sunday
  })

  it('weekDays A should contain all fourteen days', () => {
    expect(weekDays).toMatchSnapshot()
  })

  it('daysInWeek A should equal 14', () => {
    expect(daysInWeek).toBe(14)
  })

  it('allDayIndices A should contain indices for all days', () => {
    expect(allDayIndices).toMatchSnapshot()
  })

  it('validFrequencies A should be in ascending order', () => {
    expect(validFrequencies).toMatchSnapshot()
  })

  it('daysToFrequencyString A should convert 1 to day', () => {
    expect(daysToFrequencyString(1)).toBe('day')
  })

  it('daysToFrequencyString B should convert 7 to week', () => {
    expect(daysToFrequencyString(7)).toBe('week')
  })

  it('daysToFrequencyString C should convert 14 to 2-weeks', () => {
    expect(daysToFrequencyString(14)).toBe('2-weeks')
  })

  it('daysToFrequencyString D should convert 21 to 3-weeks', () => {
    expect(daysToFrequencyString(21)).toBe('3-weeks')
  })

  it('daysToFrequencyString E should convert 28 to 4-weeks', () => {
    expect(daysToFrequencyString(28)).toBe('4-weeks')
  })

  it('daysToFrequencyString F should convert other numbers to X-days format', () => {
    expect(daysToFrequencyString(5)).toBe('5-days')
  })

  it('getHigherFrequency A should return lower number for higher frequency', () => {
    expect(getHigherFrequency(7)).toBe(6)
  })

  it('getHigherFrequency B should return undefined for daily frequency', () => {
    expect(getHigherFrequency(1)).toBeUndefined()
  })

  it('getHigherFrequency C should return undefined for invalid frequency', () => {
    expect(getHigherFrequency(10)).toBeUndefined()
  })

  it('getLowerFrequency A should return higher number for lower frequency', () => {
    expect(getLowerFrequency(7)).toBe(14)
  })

  it('getLowerFrequency B should return undefined for monthly frequency', () => {
    expect(getLowerFrequency(28)).toBeUndefined()
  })

  it('getLowerFrequency C should return undefined for invalid frequency', () => {
    expect(getLowerFrequency(10)).toBeUndefined()
  })

  it('getEffectiveRecurrence A should return modification when present', () => {
    const modifications = { 'task-1': 14 }
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(7)
    expect(getEffectiveRecurrence(mockTask, modifications)).toBe(14)
  })

  it('getEffectiveRecurrence B should return original recurrence when no modification', () => {
    const modifications = {}
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(7)
    expect(getEffectiveRecurrence(mockTask, modifications)).toBe(7)
  })

  it('getTaskColor A should return red for daily tasks', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(1)
    expect(getTaskColor(mockTask)).toContain('bg-red-900/10')
  })

  it('getTaskColor B should return orange for 2-day tasks', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(2)
    expect(getTaskColor(mockTask)).toContain('bg-orange-900/10')
  })

  it('getTaskColor C should return blue for 3-day tasks', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(3)
    expect(getTaskColor(mockTask)).toContain('bg-blue-900/10')
  })

  it('getTaskColor D should return green for weekly or longer tasks', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(7)
    expect(getTaskColor(mockTask)).toContain('bg-green-900/10')
  })

  it('getTaskColor E should return gray for other tasks', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(0)
    expect(getTaskColor(mockTask)).toContain('bg-gray-800/30')
  })

  it('getTaskColor F should use modifications when provided', () => {
    const modifications = { 'task-1': 1 }
    expect(getTaskColor(mockTask, modifications)).toContain('bg-red-900/10')
  })

  it('getTaskDaysWithModifications A should return empty array for one-time tasks', () => {
    const oneTimeTask = { ...mockTask, once: 'yes' }
    expect(getTaskDaysWithModifications(oneTimeTask, {})).toEqual([])
  })

  it('getTaskDaysWithModifications B should return empty array for zero recurrence', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(0)
    expect(getTaskDaysWithModifications(mockTask, {})).toEqual([])
  })

  it('getTaskDaysWithModifications C should return all days for daily tasks', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(1)
    expect(getTaskDaysWithModifications(mockTask, {})).toEqual(allDayIndices)
  })

  it('getTaskDaysWithModifications D should calculate weekly task days correctly', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(7)
    vi.mocked(tasksUtils.daysSinceCompletion).mockReturnValue(7)
    const result = getTaskDaysWithModifications(mockTask, {})
    expect(result).toMatchInlineSnapshot(`
      [
        6,
        13,
      ]
    `)
  })

  it('createTaskDistribution A should create empty distribution for empty task list', () => {
    const result = createTaskDistribution([])
    expect(result).toMatchSnapshot()
  })

  it('createTaskDistribution B should distribute daily task to all days', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(1)
    const result = createTaskDistribution([mockTask])
    expect(Object.values(result).every(dayTasks => dayTasks.length === 1)).toBe(true)
  })

  it('createTaskDistribution C should distribute weekly task to specific days', () => {
    vi.mocked(tasksUtils.daysRecurrence).mockReturnValue(7)
    vi.mocked(tasksUtils.daysSinceCompletion).mockReturnValue(7)
    const result = createTaskDistribution([mockTask])
    expect(result[6]).toHaveLength(1)
    expect(result[0]).toHaveLength(0)
  })

  it('createTaskDistribution D should use modifications when provided', () => {
    const modifications = { 'task-1': 1 }
    const result = createTaskDistribution([mockTask], modifications)
    expect(Object.values(result).every(dayTasks => dayTasks.length === 1)).toBe(true)
  })

  it('saveTaskModifications A should save all modifications successfully', async () => {
    const modifications = { 'task-1': 14 }
    const dateModifications = {}
    const tasks = [mockTask]
    vi.mocked(databaseUtils.updateTask).mockResolvedValue(Result.ok(mockAppWriteTask))
    const result = await saveTaskModifications(modifications, dateModifications, tasks)
    expect(result.ok).toBe(true)
    expect(databaseUtils.updateTask).toHaveBeenCalledWith({
      ...mockTask,
      once: '2-weeks',
    })
  })

  it('saveTaskModifications B should return error when task not found', async () => {
    const modifications = { 'nonexistent-task': 14 }
    const dateModifications = {}
    const tasks = [mockTask]
    const result = await saveTaskModifications(modifications, dateModifications, tasks)
    expect(result.ok).toBe(false)
  })

  it('saveTaskModifications C should return error when update fails', async () => {
    const modifications = { 'task-1': 14 }
    const dateModifications = {}
    const tasks = [mockTask]
    vi.mocked(databaseUtils.updateTask).mockResolvedValue(Result.error('update failed'))
    const result = await saveTaskModifications(modifications, dateModifications, tasks)
    expect(result.ok).toBe(false)
  })

  it('saveTaskModifications D should handle mixed success and failure', async () => {
    const modifications = { 'task-1': 14, 'task-2': 7 }
    const dateModifications = {}
    const task2 = { ...mockTask, id: 'task-2' }
    const tasks = [mockTask, task2]
    vi.mocked(databaseUtils.updateTask).mockResolvedValueOnce(Result.ok(mockAppWriteTask)).mockResolvedValueOnce(Result.error('failure'))
    const result = await saveTaskModifications(modifications, dateModifications, tasks)
    expect(result.ok).toBe(false)
  })

  it('saveTaskModifications E should save date modifications successfully', async () => {
    const modifications = {}
    const dateModifications = { 'task-1': '2023-10-01T00:00:00.000Z' }
    const tasks = [mockTask]
    vi.mocked(databaseUtils.updateTask).mockResolvedValue(Result.ok(mockAppWriteTask))
    const result = await saveTaskModifications(modifications, dateModifications, tasks)
    expect(result.ok).toBe(true)
    expect(databaseUtils.updateTask).toHaveBeenCalledWith({
      ...mockTask,
      completedOn: '2023-10-01T00:00:00.000Z',
    })
  })

  it('saveTaskModifications F should save both frequency and date modifications', async () => {
    const modifications = { 'task-1': 7 }
    const dateModifications = { 'task-1': '2023-10-01T00:00:00.000Z' }
    const tasks = [mockTask]
    vi.mocked(databaseUtils.updateTask).mockResolvedValue(Result.ok(mockAppWriteTask))
    const result = await saveTaskModifications(modifications, dateModifications, tasks)
    expect(result.ok).toBe(true)
    expect(databaseUtils.updateTask).toHaveBeenCalledTimes(2) // Should be called twice: once for frequency, once for date
  })

  it('saveTaskModifications G should return error when date modification task not found', async () => {
    const modifications = {}
    const dateModifications = { 'nonexistent-task': '2023-10-01T00:00:00.000Z' }
    const tasks = [mockTask]
    const result = await saveTaskModifications(modifications, dateModifications, tasks)
    expect(result.ok).toBe(false)
  })

  it('saveTaskModifications H should handle promise rejection', async () => {
    const modifications = { 'task-1': 7 }
    const dateModifications = {}
    const tasks = [mockTask]
    vi.mocked(databaseUtils.updateTask).mockRejectedValue(new Error('network error'))
    const result = await saveTaskModifications(modifications, dateModifications, tasks)
    expect(result.ok).toBe(false)
  })
})
