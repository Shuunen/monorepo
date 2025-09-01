import { isBrowserEnvironment } from '@monorepo/utils'
import { describe, expect, it } from 'vitest'
import { localToRemoteTask, modelToLocalTask, modelToRemoteTask } from './database.utils'

describe('database.utils', () => {
  const taskModelA = {
    $collectionId: '6796759300059f9201af',
    $createdAt: '2025-01-26T18:46:36.962+00:00',
    $databaseId: '6796758d0018464afda2',
    $id: 'test-task-id',
    $permissions: [],
    $sequence: 175,
    $updatedAt: '2025-08-03T08:59:26.617+00:00',
    'completed-on': '2025-08-03T00:00:00.000+00:00',
    done: false,
    minutes: 5,
    name: 'test task',
    once: 'month',
    reason: 'test reason',
  }

  const taskLocalA = {
    completedOn: '2025-08-03T00:00:00.000+00:00',
    id: 'test-task-id',
    isDone: false,
    minutes: 5,
    name: 'test task',
    once: 'month',
    reason: 'test reason',
  }

  const taskRemoteA = {
    'completed-on': '2025-08-03T00:00:00.000+00:00',
    done: false,
    minutes: 5,
    name: 'test task',
    once: 'month',
    reason: 'test reason',
  }

  it('should detect browser env', () => {
    expect(isBrowserEnvironment()).toMatchInlineSnapshot(`false`)
  })

  it('modelToLocalTask A', () => {
    expect(modelToLocalTask(taskModelA)).toStrictEqual(taskLocalA)
  })

  it('modelToRemoteTask A', () => {
    expect(modelToRemoteTask(taskModelA)).toStrictEqual(taskRemoteA)
  })

  it('localToRemoteTask A', () => {
    expect(localToRemoteTask(taskLocalA)).toStrictEqual(taskRemoteA)
  })
})
