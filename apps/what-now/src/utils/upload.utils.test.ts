import { Result, toastError, toastSuccess } from '@shuunen/utils'
import { describe, expect, it, vi } from 'vitest'
import { type AppWriteTaskModel, addTask, getTasks, updateTask } from './database.utils'
import { logger } from './logger.utils'
import { handleTasksUpload, readJsonFile, selectJsonFile, uploadTasksToDatabase } from './upload.utils'

vi.mock('@shuunen/utils', async () => {
  const actual = await vi.importActual('@shuunen/utils')
  return {
    ...actual,
    toastError: vi.fn(),
    toastSuccess: vi.fn(),
  }
})

vi.mock('./database.utils', () => ({
  addTask: vi.fn(),
  getTasks: vi.fn(),
  modelToLocalTask: vi.fn(task => ({ ...task, id: task.$id })),
  modelToRemoteTask: vi.fn(task => task),
  updateTask: vi.fn(),
}))

vi.mock('./logger.utils', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
  },
}))

// Helper function to create a mock file input element
function createMockFileInput(files: File[] = []) {
  const mockClick = vi.fn()
  const mockAddEventListener = vi.fn((event, handler) => {
    if (event === 'change') setTimeout(() => handler({ target: { files } }), 0)
  })
  return {
    accept: '',
    addEventListener: mockAddEventListener,
    click: mockClick,
    type: '',
  } as unknown as HTMLInputElement
}

// Helper function to mock document.createElement for file input
function mockDocumentCreateElement(files: File[] = []) {
  return vi.spyOn(document, 'createElement').mockImplementation(tagName => {
    if (tagName === 'input') return createMockFileInput(files)
    return document.createElement(tagName)
  })
}

// Helper function to create a mock task
function createMockTask(id = '1', name = 'Task 1', minutes = 30, once = 'no'): AppWriteTaskModel {
  return { $id: id, minutes, name, once } as AppWriteTaskModel
}

// Helper function to assert successful upload results
function assertUploadSuccess(result: unknown, created: number, updated: number, errorCount = 0) {
  expect(result).toHaveProperty('ok', true)
  if (typeof result === 'object' && result !== null && 'ok' in result && result.ok && 'value' in result) {
    const value = result.value as { created: number; updated: number; errors: string[] }
    expect(value.created).toBe(created)
    expect(value.updated).toBe(updated)
    expect(value.errors).toHaveLength(errorCount)
  }
}

describe('upload.utils', () => {
  it('selectJsonFile A should create file input and return file when selected', async () => {
    const mockFile = new File(['{}'], 'test.json', { type: 'application/json' })
    const createElementSpy = mockDocumentCreateElement([mockFile])
    const result = await selectJsonFile()
    expect(result).toBe(mockFile)
    createElementSpy.mockRestore()
  })

  it('selectJsonFile B should return undefined when no file selected', async () => {
    const createElementSpy = mockDocumentCreateElement([])
    const result = await selectJsonFile()
    expect(result).toBeUndefined()
    createElementSpy.mockRestore()
  })

  it('readJsonFile A should parse valid JSON file successfully', async () => {
    const validTasks = [createMockTask('1', 'Task 1', 30, 'no'), createMockTask('2', 'Task 2', 60, 'yes')]
    const mockFile = new File([JSON.stringify(validTasks)], 'tasks.json', { type: 'application/json' })
    const result = await readJsonFile(mockFile)
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.value).toEqual(validTasks)
  })

  it('readJsonFile B should return error for invalid JSON', async () => {
    const mockFile = new File(['invalid json'], 'tasks.json', { type: 'application/json' })
    const result = await readJsonFile(mockFile)
    expect(result.ok).toBe(false)
  })

  it('readJsonFile C should return error for tasks missing required properties', async () => {
    const invalidTasks = [{ $id: '1', name: 'Task 1' }]
    const mockFile = new File([JSON.stringify(invalidTasks)], 'tasks.json', { type: 'application/json' })
    const result = await readJsonFile(mockFile)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toContain('missing required properties')
  })

  it('uploadTasksToDatabase A should create new tasks successfully', async () => {
    const uploadTasks = [createMockTask()]
    vi.mocked(getTasks).mockResolvedValue(Result.ok([]))
    vi.mocked(addTask).mockResolvedValue(Result.ok({} as never))
    const result = await uploadTasksToDatabase(uploadTasks)
    assertUploadSuccess(result, 1, 0)
  })

  it('uploadTasksToDatabase B should update existing tasks successfully', async () => {
    const uploadTasks = [createMockTask('1', 'Existing Task')]
    const mockTask = { completedOn: '', id: '1', isDone: false, minutes: 30, name: 'Existing Task', once: 'no' }
    vi.mocked(getTasks).mockResolvedValue(Result.ok([mockTask]))
    vi.mocked(updateTask).mockResolvedValue(Result.ok({} as never))
    const result = await uploadTasksToDatabase(uploadTasks)
    assertUploadSuccess(result, 0, 1)
  })

  it('uploadTasksToDatabase C should handle errors when creating tasks', async () => {
    const uploadTasks = [createMockTask()]
    vi.mocked(getTasks).mockResolvedValue(Result.ok([]))
    vi.mocked(addTask).mockResolvedValue(Result.error('Create failed'))
    const result = await uploadTasksToDatabase(uploadTasks)
    assertUploadSuccess(result, 0, 0, 1)
    if (typeof result === 'object' && result !== null && 'ok' in result && result.ok && 'value' in result) {
      const value = result.value as { errors: string[] }
      expect(value.errors[0]).toContain('Create failed')
    }
  })

  it('uploadTasksToDatabase D should handle errors when updating tasks', async () => {
    const uploadTasks = [createMockTask('1', 'Existing Task')]
    const mockTask = { completedOn: '', id: '1', isDone: false, minutes: 30, name: 'Existing Task', once: 'no' }
    vi.mocked(getTasks).mockResolvedValue(Result.ok([mockTask]))
    vi.mocked(updateTask).mockResolvedValue(Result.error('Update failed'))
    const result = await uploadTasksToDatabase(uploadTasks)
    assertUploadSuccess(result, 0, 0, 1)
    if (typeof result === 'object' && result !== null && 'ok' in result && result.ok && 'value' in result) {
      const value = result.value as { errors: string[] }
      expect(value.errors[0]).toContain('Update failed')
    }
  })

  it('uploadTasksToDatabase E should return error when failed to load existing tasks', async () => {
    const uploadTasks: AppWriteTaskModel[] = []
    vi.mocked(getTasks).mockResolvedValue(Result.error('Failed to load'))
    const result = await uploadTasksToDatabase(uploadTasks)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error).toBe('Failed to load existing tasks for comparison')
  })

  it('handleTasksUpload A should handle successful upload process', async () => {
    const mockTasks = [createMockTask()]
    const mockFile = new File([JSON.stringify(mockTasks)], 'test.json')
    const createElementSpy = mockDocumentCreateElement([mockFile])
    vi.mocked(getTasks).mockResolvedValue(Result.ok([]))
    vi.mocked(addTask).mockResolvedValue(Result.ok({} as never))
    await handleTasksUpload()
    expect(toastSuccess).toHaveBeenCalledWith('Upload successful! Created: 1, Updated: 0')
    createElementSpy.mockRestore()
  })

  it('handleTasksUpload B should handle file selection cancellation', async () => {
    const createElementSpy = mockDocumentCreateElement([])
    await handleTasksUpload()
    expect(toastError).toHaveBeenCalledWith('No file selected')
    createElementSpy.mockRestore()
  })

  it('handleTasksUpload C should handle upload failure', async () => {
    const mockTasks = [createMockTask()]
    const mockFile = new File([JSON.stringify(mockTasks)], 'test.json')
    const createElementSpy = mockDocumentCreateElement([mockFile])
    vi.mocked(getTasks).mockResolvedValue(Result.error('Database error'))
    await handleTasksUpload()
    expect(toastError).toHaveBeenCalledWith('Upload failed: Failed to load existing tasks for comparison')
    createElementSpy.mockRestore()
  })

  it('handleTasksUpload D should handle upload with errors', async () => {
    const mockTasks = [createMockTask()]
    const mockFile = new File([JSON.stringify(mockTasks)], 'test.json')
    const createElementSpy = mockDocumentCreateElement([mockFile])
    vi.mocked(getTasks).mockResolvedValue(Result.ok([]))
    vi.mocked(addTask).mockResolvedValue(Result.error('Create failed'))
    await handleTasksUpload()
    expect(toastError).toHaveBeenCalledWith('Upload completed with 1 errors. Check console for details.')
    expect(logger.error).toHaveBeenCalled()
    createElementSpy.mockRestore()
  })

  it('handleTasksUpload E should handle invalid JSON file', async () => {
    const mockFile = new File(['invalid json'], 'test.json')
    const createElementSpy = mockDocumentCreateElement([mockFile])
    await handleTasksUpload()
    expect(toastError).toHaveBeenCalledWith(expect.stringContaining('Unexpected token'))
    createElementSpy.mockRestore()
  })
})
