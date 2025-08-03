import { expect, it, vi } from 'vitest'
import { trmnlPayload } from './progress.utils'
import { state } from './state.utils'
import { taskMock } from './tasks.utils'

it('trmnlPayload A should return correct payload with default progress', () => {
  const mockTask = taskMock({
    completedOn: '',
    id: 'task-1',
    minutes: 15,
    name: 'Clean workspace',
    reason: 'Keep workspace organized',
  })

  state.tasks = [mockTask]

  // Mock Date and toTimeString to get predictable output
  const mockDate = new Date('2025-08-03T10:30:45.123Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('10:30:45 GMT+0000 (UTC)')

  const result = trmnlPayload(0, true)

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"date":"10:30","nextSubtitle":"Keep workspace organized","nextTitle":"Clean workspace","progress":0,"remaining":"15 min to take care"}}"`)
})

it('trmnlPayload B should return correct payload with custom progress', () => {
  const mockTask = taskMock({
    completedOn: '',
    id: 'task-2',
    minutes: 30,
    name: 'Review code',
    once: 'week',
    reason: 'Ensure code quality',
  })

  state.tasks = [mockTask]

  const mockDate = new Date('2025-08-03T14:15:30.456Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('14:15:30 GMT+0000 (UTC)')

  const result = trmnlPayload(75, true)

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"date":"14:15","nextSubtitle":"Ensure code quality","nextTitle":"Review code","progress":75,"remaining":"30 min to take care"}}"`)
})

it('trmnlPayload C should handle empty active tasks', () => {
  state.tasks = []

  const mockDate = new Date('2025-08-03T09:45:12.789Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('09:45:12 GMT+0000 (UTC)')

  const result = trmnlPayload(50, true)

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"date":"09:45","progress":50}}"`)
})

it('trmnlPayload D should filter inactive tasks correctly', () => {
  const activeTask = taskMock({
    completedOn: '',
    id: 'active-task',
    minutes: 20,
    name: 'Active task',
    reason: 'This is active',
  })

  const inactiveTask = taskMock({
    completedOn: '2025-08-03',
    id: 'inactive-task',
    isDone: true,
    minutes: 10,
    name: 'Inactive task',
    reason: 'This is inactive',
  })

  state.tasks = [activeTask, inactiveTask]

  const mockDate = new Date('2025-08-03T16:20:55.321Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('16:20:55 GMT+0000 (UTC)')

  const result = trmnlPayload(25, true)

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"date":"16:20","nextSubtitle":"This is active","nextTitle":"Active task","progress":25,"remaining":"20 min to take care"}}"`)
})

it('trmnlPayload E should handle task without reason', () => {
  const taskWithoutReason = taskMock({
    completedOn: '',
    id: 'no-reason-task',
    minutes: 5,
    name: 'Task without reason',
    once: 'month',
  })

  state.tasks = [taskWithoutReason]

  const mockDate = new Date('2025-08-03T12:00:00.000Z')
  vi.spyOn(globalThis, 'Date').mockImplementation(() => mockDate)
  vi.spyOn(mockDate, 'toTimeString').mockReturnValue('12:00:00 GMT+0000 (UTC)')

  const result = trmnlPayload(100)

  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"nextTitle":"Task without reason","progress":100,"remaining":"5 min to take care"}}"`)
})

it('trmnlPayload F send no date or progress', () => {
  state.tasks = [taskMock({ completedOn: '', name: 'Task without reason' })]
  const result = trmnlPayload(100, false)
  expect(result).toMatchInlineSnapshot(`"{"merge_variables":{"nextTitle":"Task without reason","progress":100,"remaining":"20 min to take care"}}"`)
})
