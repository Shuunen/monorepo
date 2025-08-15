import { FloatingMenu } from '@shuunen/components'
import { clsx } from 'clsx'
import { CalendarIcon, MinusIcon, PlusIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Task } from '../types'
import { getTasks } from '../utils/database.utils'
import { logger } from '../utils/logger.utils'
import { useActions } from '../utils/pages.utils'
import { createTaskDistribution, dailyRecurrence, getHigherFrequency, getLowerFrequency, getTaskColor, saveTaskModifications, weekDays } from '../utils/planner.utils'
import { daysRecurrence, daysSinceCompletion, dispatchTasks, isTaskActive } from '../utils/tasks.utils'
import { handleTasksUpload } from '../utils/upload.utils'

/**
 * Component to render a single task card with hover controls for frequency editing
 * @param properties - Component properties containing the task and handlers
 * @param properties.task - The task to display
 * @param properties.modifications - Current modifications to tasks
 * @param properties.onFrequencyChange - Handler for frequency changes
 * @returns JSX element for the task card
 */
function TaskCard({ task, modifications, onFrequencyChange }: { task: Task; modifications: Record<string, number>; onFrequencyChange: (taskId: string, newDays: number) => void }) {
  const colorClass = getTaskColor(task, modifications)
  const originalRecurrence = daysRecurrence(task)
  const currentRecurrence = modifications[task.id] ?? originalRecurrence
  const recurrenceLabel = currentRecurrence === dailyRecurrence ? 'daily' : `${currentRecurrence}-days`
  const isModified = modifications[task.id] !== undefined

  const handleIncrease = useCallback(() => {
    const higherFrequency = getHigherFrequency(currentRecurrence)
    if (higherFrequency !== undefined) onFrequencyChange(task.id, higherFrequency)
  }, [currentRecurrence, onFrequencyChange, task.id])

  const handleDecrease = useCallback(() => {
    const lowerFrequency = getLowerFrequency(currentRecurrence)
    if (lowerFrequency !== undefined) onFrequencyChange(task.id, lowerFrequency)
  }, [currentRecurrence, onFrequencyChange, task.id])

  const canIncrease = getHigherFrequency(currentRecurrence) !== undefined
  const canDecrease = getLowerFrequency(currentRecurrence) !== undefined
  const title = `${task.name} (${task.minutes} min, completed ${daysSinceCompletion(task)} days ago)`

  return (
    <div className={`px-2 py-1 rounded text-xs border-2 ${colorClass} ${isModified ? 'ring-2 ring-yellow-400/50' : ''} truncate relative group w-full text-left`} data-completed-on={task.completedOn} data-once={task.once} title={title}>
      <div className="font-medium truncate">{task.name}</div>
      <div className="text-xs opacity-75">{recurrenceLabel}</div>
      <div className="absolute right-0.5 top-0 flex flex-col gap-1.5 opacity-10 sepia hover:opacity-100 hover:sepia-0">
        <button className={clsx('size-4 rounded flex items-center justify-center text-xs', { 'cursor-pointer text-white bg-green-600 hover:bg-green-700': canIncrease })} disabled={!canIncrease} onClick={handleIncrease} type="button">
          <PlusIcon className="size-3" />
        </button>
        <button className={clsx('size-4 rounded flex items-center justify-center text-xs', { 'cursor-pointer text-white bg-red-600 hover:bg-red-700': canDecrease })} disabled={!canDecrease} onClick={handleDecrease} type="button">
          <MinusIcon className="size-3" />
        </button>
      </div>
    </div>
  )
}

/**
 * Component to render a single day column
 * @param properties - Component properties
 * @param properties.dayName - Name of the day
 * @param properties.tasks - Tasks to display in this day
 * @param properties.modifications - Current modifications to tasks
 * @param properties.onFrequencyChange - Handler for frequency changes
 * @returns JSX element for the day column
 */
function DayColumn({ dayName, tasks, modifications, onFrequencyChange }: { dayName: string; tasks: Task[]; modifications: Record<string, number>; onFrequencyChange: (taskId: string, newDays: number) => void }) {
  return (
    <div className="flex flex-col border-r border-gray-600/30 last:border-r-0 min-h-96 w-full">
      <div className="bg-gray-800/40 p-3 border-b border-gray-600/30 text-center font-medium text-gray-200">{dayName}</div>
      <div className="flex flex-col gap-2 p-3 flex-grow">
        {tasks.map(task => (
          <TaskCard key={`${task.id}-${dayName}`} modifications={modifications} onFrequencyChange={onFrequencyChange} task={task} />
        ))}
      </div>
    </div>
  )
}

/**
 * Renders the main planner grid and legend
 * @param properties - Component properties
 * @param properties.tasksByDay - Distribution of tasks by day index
 * @param properties.modifications - Current modifications to tasks
 * @param properties.onFrequencyChange - Handler for frequency changes
 * @returns JSX element for the planner content
 */
function PlannerContent({ tasksByDay, modifications, onFrequencyChange }: { tasksByDay: Record<number, Task[]>; modifications: Record<string, number>; onFrequencyChange: (taskId: string, newDays: number) => void }) {
  return (
    <div className="bg-gray-800/30 rounded-lg shadow-sm border border-gray-600/30 overflow-hidden">
      <div className="flex min-h-96 overflow-x-auto">
        {weekDays.map((dayName, index) => (
          <div className="min-w-48 flex-shrink-0" key={dayName}>
            <DayColumn dayName={dayName} modifications={modifications} onFrequencyChange={onFrequencyChange} tasks={tasksByDay[index]} />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Calculate planner metrics based on tasks and modifications
 * @param tasks - Array of tasks
 * @param modifications - Task modifications record
 * @returns Calculated metrics object
 */
function calculatePlannerMetrics(tasks: Task[], modifications: Record<string, number>) {
  const activeTasksCount = tasks.length
  const daysPerWeek = 7
  const decimalPrecision = 10

  // Calculate average time per day considering task frequency and modifications
  let totalWeeklyMinutes = 0
  let totalWeeklyTasks = 0
  for (const task of tasks) {
    const originalRecurrence = daysRecurrence(task)
    const currentRecurrence = modifications[task.id] ?? originalRecurrence
    const weeklyOccurrences = daysPerWeek / currentRecurrence
    totalWeeklyMinutes += task.minutes * weeklyOccurrences
    totalWeeklyTasks += weeklyOccurrences
  }

  const averageTimePerDay = Math.round(totalWeeklyMinutes / daysPerWeek)
  const averageTasksPerDay = Math.round((totalWeeklyTasks / daysPerWeek) * decimalPrecision) / decimalPrecision

  // Calculate average frequency (in days) using current modifications
  let totalFrequency = 0
  for (const task of tasks) {
    const originalRecurrence = daysRecurrence(task)
    const currentRecurrence = modifications[task.id] ?? originalRecurrence
    totalFrequency += currentRecurrence
  }

  const averageFrequency = activeTasksCount > 0 ? Math.round((totalFrequency / activeTasksCount) * decimalPrecision) / decimalPrecision : 0

  return { activeTasksCount, averageFrequency, averageTasksPerDay, averageTimePerDay }
}

/**
 * Component to display planner metrics
 * @param properties - Component properties
 * @param properties.tasks - Array of tasks to calculate metrics from
 * @param properties.modifications - Current modifications to tasks
 * @returns JSX element for the metrics display
 */
function PlannerMetrics({ tasks, modifications }: { tasks: Task[]; modifications: Record<string, number> }) {
  const metrics = useMemo(() => calculatePlannerMetrics(tasks, modifications), [tasks, modifications])

  return (
    <div className="bg-gray-800/30 rounded-lg shadow-sm border border-gray-600/30 p-4 mt-4">
      <h2 className="text-lg font-semibold mb-3 text-gray-200">Planner Metrics</h2>
      <div className="grid grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{metrics.activeTasksCount}</div>
          <div className="text-sm text-gray-400">Active Tasks</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{metrics.averageTimePerDay}</div>
          <div className="text-sm text-gray-400">Avg Minutes/Day</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-400">{metrics.averageTasksPerDay}</div>
          <div className="text-sm text-gray-400">Avg Tasks/Day</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{metrics.averageFrequency}</div>
          <div className="text-sm text-gray-400">Avg Frequency (days)</div>
        </div>
      </div>
    </div>
  )
}

/**
 * Custom hook to handle task loading and modifications
 * @returns Object containing tasks, modifications state and handlers
 */
function usePlannerTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [modifications, setModifications] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const hasModifications = Object.keys(modifications).length > 0

  async function loadTasks() {
    const load = await getTasks()
    if (!load.ok) throw new Error('Failed to load tasks')
    setTasks(load.value.filter(task => task.isDone === false)) // Filter out completed tasks
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: FIX ME LATER
  useEffect(() => void loadTasks(), [])

  const handleFrequencyChange = useCallback((taskId: string, newDays: number) => {
    setModifications(previous => ({
      ...previous,
      [taskId]: newDays,
    }))
  }, [])

  // biome-ignore lint/correctness/useExhaustiveDependencies: FIX ME LATER
  const handleSaveModifications = useCallback(async () => {
    if (!hasModifications) return
    setSaving(true)
    const result = await saveTaskModifications(modifications, tasks)
    if (result.ok) {
      setModifications({})
      await loadTasks() // Reload tasks to reflect changes
    }
    setSaving(false)
  }, [modifications, hasModifications, tasks])

  return {
    handleFrequencyChange,
    handleSaveModifications,
    hasModifications,
    loadTasks,
    modifications,
    saving,
    setTasks,
    tasks,
  }
}

/**
 * The main planner page component
 * @returns JSX element for the planner page
 */
export function PagePlanner() {
  const actions = useActions()
  const { handleFrequencyChange, handleSaveModifications, setTasks, hasModifications, modifications, saving, tasks, loadTasks } = usePlannerTasks()
  const tasksByDay = createTaskDistribution(tasks, modifications)

  async function handleTasksDispatch() {
    const active = tasks.filter(task => isTaskActive(task))
    logger.info('dispatching active tasks...', { active })
    await dispatchTasks(active)
    setTasks([...tasks])
  }

  async function handleTasksUploadAndReload() {
    await handleTasksUpload()
    await loadTasks() // Reload tasks after upload
  }

  return (
    <div className="min-h-screen bg-gradient-to-br">
      <header className="sticky rounded-lg top-0 z-10 backdrop-blur-sm border-b border-gray-600/30">
        <div className="py-4 flex items-center gap-6">
          <div className="flex items-center gap-3">
            <CalendarIcon className="size-8 text-primary" />
            <h1 className="text-2xl font-bold">What-Now Planner</h1>
          </div>
          <button className="flex items-center ml-auto px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg transition-colors" onClick={handleTasksUploadAndReload} type="button">
            Upload tasks
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-700 hover:bg-gray-800 rounded-lg transition-colors" onClick={handleTasksDispatch} type="button">
            Dispatch tasks
          </button>
          {hasModifications && (
            <button className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed rounded-lg transition-colors" disabled={saving} onClick={handleSaveModifications} type="button">
              {saving ? 'Saving...' : 'Save modifications'}
            </button>
          )}
        </div>
      </header>
      <PlannerContent modifications={modifications} onFrequencyChange={handleFrequencyChange} tasksByDay={tasksByDay} />
      <PlannerMetrics modifications={modifications} tasks={tasks} />
      <FloatingMenu actions={actions} />
    </div>
  )
}
