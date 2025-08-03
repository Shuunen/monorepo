import { expect, it, vi } from 'vitest'
import type { Task } from '../types'
import { trmnlPayload } from './progress.utils'
import { state } from './state.utils'
import * as tasksUtils from './tasks.utils'

vi.mock('./tasks.utils', () => ({
  isTaskActive: vi.fn(),
  minutesRemaining: vi.fn(),
}))

it('trmnlPayload A should return correct payload with default progress', () => {
  const mockTask: Task = {
    completedOn: '',
    id: 'task-1',
    isDone: false,
    minutes: 15,
    name: 'Clean workspace',
    once: 'day',
    reason: 'Keep workspace organized',
  }

  state.tasks = [mockTask]

  vi.mocked(tasksUtils.isTaskActive).mockReturnValue(true)
  vi.mocked(tasksUtils.minutesRemaining).mockReturnValue(15)

  // Mock Date and toTimeString to get predictable output
  const mockDate = new Date('2025-08-03T10:30:45.123Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('10:30:45 GMT+0000 (UTC)')

  const result = trmnlPayload()

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"date":"10:30","nextSubtitle":"Keep workspace organized","nextTitle":"Clean workspace","progress":0,"remaining":"15 min to take care"}}"`)
})

it('trmnlPayload B should return correct payload with custom progress', () => {
  const mockTask: Task = {
    completedOn: '',
    id: 'task-2',
    isDone: false,
    minutes: 30,
    name: 'Review code',
    once: 'week',
    reason: 'Ensure code quality',
  }

  state.tasks = [mockTask]

  vi.mocked(tasksUtils.isTaskActive).mockReturnValue(true)
  vi.mocked(tasksUtils.minutesRemaining).mockReturnValue(30)

  const mockDate = new Date('2025-08-03T14:15:30.456Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('14:15:30 GMT+0000 (UTC)')

  const result = trmnlPayload(75)

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"date":"14:15","nextSubtitle":"Ensure code quality","nextTitle":"Review code","progress":75,"remaining":"30 min to take care"}}"`)
})

it('trmnlPayload C should handle empty active tasks', () => {
  state.tasks = []

  vi.mocked(tasksUtils.isTaskActive).mockReturnValue(false)
  vi.mocked(tasksUtils.minutesRemaining).mockReturnValue(0)

  const mockDate = new Date('2025-08-03T09:45:12.789Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('09:45:12 GMT+0000 (UTC)')

  const result = trmnlPayload(50)

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"date":"09:45","progress":50,"remaining":"0 min to take care"}}"`)
})

it('trmnlPayload D should filter inactive tasks correctly', () => {
  const activeTask: Task = {
    completedOn: '',
    id: 'active-task',
    isDone: false,
    minutes: 20,
    name: 'Active task',
    once: 'day',
    reason: 'This is active',
  }

  const inactiveTask: Task = {
    completedOn: '2025-08-03',
    id: 'inactive-task',
    isDone: true,
    minutes: 10,
    name: 'Inactive task',
    once: 'day',
    reason: 'This is inactive',
  }

  state.tasks = [activeTask, inactiveTask]

  vi.mocked(tasksUtils.isTaskActive).mockImplementation(task => task.id === 'active-task')
  vi.mocked(tasksUtils.minutesRemaining).mockReturnValue(20)

  const mockDate = new Date('2025-08-03T16:20:55.321Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('16:20:55 GMT+0000 (UTC)')

  const result = trmnlPayload(25)

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"date":"16:20","nextSubtitle":"This is active","nextTitle":"Active task","progress":25,"remaining":"20 min to take care"}}"`)
})

it('trmnlPayload E should handle task without reason', () => {
  const taskWithoutReason: Task = {
    completedOn: '',
    id: 'no-reason-task',
    isDone: false,
    minutes: 5,
    name: 'Task without reason',
    once: 'month',
  }

  state.tasks = [taskWithoutReason]

  vi.mocked(tasksUtils.isTaskActive).mockReturnValue(true)
  vi.mocked(tasksUtils.minutesRemaining).mockReturnValue(5)

  const mockDate = new Date('2025-08-03T12:00:00.000Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('12:00:00 GMT+0000 (UTC)')

  const result = trmnlPayload(100)

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"date":"12:00","nextTitle":"Task without reason","progress":100,"remaining":"5 min to take care"}}"`)
})
