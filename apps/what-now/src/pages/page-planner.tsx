// oxlint-disable max-dependencies, max-lines
import { Button, FloatingMenu } from '@monorepo/components'
import { dateIso10, formatDate } from '@monorepo/utils'
import { ArrowLeftRightIcon, CalendarIcon, DownloadIcon, MinusIcon, MoveLeftIcon, MoveRightIcon, PlusIcon, SaveIcon, UploadIcon } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import type { Task } from '../types'
import { downloadData, getTasks } from '../utils/database.utils'
import { logger } from '../utils/logger.utils'
import { useActions } from '../utils/pages.utils'
import { createTaskDistribution, dailyRecurrence, getHigherFrequency, getLowerFrequency, getTaskColor, saveTaskModifications, weekDays } from '../utils/planner.utils'
import { daysRecurrence, daysSinceCompletion, dispatchTasks, isTaskActive } from '../utils/tasks.utils'
import { handleTasksUpload } from '../utils/upload.utils'

type TaskModifications = {
  frequency?: Record<string, number>
  completedOn?: Record<string, string>
}

/**
 * Control buttons component for task card hover actions
 * @param properties - Component properties
 * @param properties.canIncrease - Whether frequency can be increased
 * @param properties.canDecrease - Whether frequency can be decreased
 * @param properties.canMove - Whether task date can be moved
 * @param properties.onIncrease - Handler for frequency increase
 * @param properties.onDecrease - Handler for frequency decrease
 * @param properties.onBefore - Handler for moving date before
 * @param properties.onAfter - Handler for moving date after
 * @returns JSX element for control buttons
 */
function TaskCardControls({ canIncrease, canDecrease, canMove, onIncrease, onDecrease, onBefore, onAfter }: { canIncrease: boolean; canDecrease: boolean; canMove: boolean; onIncrease: () => void; onDecrease: () => void; onBefore: () => void; onAfter: () => void }) {
  const btnClasses = 'size-4 py-2'
  const iconClasses = 'size-3'
  return (
    <div className="absolute right-0.5 top-0.5 grid grid-cols-2 gap-1.5 opacity-10 sepia hover:opacity-100 hover:sepia-0">
      <Button className={btnClasses} disabled={!canIncrease} onClick={onIncrease} variant={canIncrease ? 'destructive' : 'ghost'}>
        <PlusIcon className={iconClasses} />
      </Button>
      <Button className={btnClasses} disabled={!canDecrease} onClick={onDecrease} variant={canDecrease ? 'secondary' : 'ghost'}>
        <MinusIcon className={iconClasses} />
      </Button>
      <Button className={btnClasses} disabled={!canMove} onClick={onBefore} variant={canMove ? 'default' : 'ghost'}>
        <MoveLeftIcon className={iconClasses} />
      </Button>
      <Button className={btnClasses} disabled={!canMove} onClick={onAfter} variant={canMove ? 'default' : 'ghost'}>
        <MoveRightIcon className={iconClasses} />
      </Button>
    </div>
  )
}

/**
 * Component to render a single task card with hover controls for frequency editing
 * @param properties - Component properties containing the task and handlers
 * @param properties.task - The task to display
 * @param properties.modifications - Current modifications to tasks
 * @param properties.onFrequencyChange - Handler for frequency changes
 * @param properties.onDateChange - Handler for date changes
 * @returns JSX element for the task card
 */
function TaskCard({ task, modifications, onFrequencyChange, onDateChange }: { task: Task; modifications: Record<string, number>; onFrequencyChange: (taskId: string, newDays: number) => void; onDateChange: (taskId: string, direction: 'before' | 'after') => void }) {
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

  const handleBefore = useCallback(() => {
    onDateChange(task.id, 'before')
  }, [onDateChange, task.id])

  const handleAfter = useCallback(() => {
    onDateChange(task.id, 'after')
  }, [onDateChange, task.id])

  const canIncrease = getHigherFrequency(currentRecurrence) !== undefined
  const canDecrease = getLowerFrequency(currentRecurrence) !== undefined
  const canMove = task.once !== 'day'
  const title = `${task.name} (${task.minutes} min, completed ${daysSinceCompletion(task)} days ago)`

  return (
    <div className={`px-2 py-1 rounded text-xs border-2 ${colorClass} ${isModified ? 'ring-2 ring-yellow-400/50' : ''} truncate relative group w-full text-left`} data-completed-on={task.completedOn} data-once={task.once} title={title}>
      <div className="font-medium truncate">{task.name}</div>
      <div className="text-xs opacity-75">{recurrenceLabel}</div>
      <TaskCardControls canDecrease={canDecrease} canIncrease={canIncrease} canMove={canMove} onAfter={handleAfter} onBefore={handleBefore} onDecrease={handleDecrease} onIncrease={handleIncrease} />
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
 * @param properties.onDateChange - Handler for date changes
 * @param properties.realDate - Real date string for the day
 * @param properties.isToday - Whether this day is today
 * @returns JSX element for the day column
 */
function DayColumn({
  dayName,
  tasks,
  modifications,
  onFrequencyChange,
  onDateChange,
  realDate,
  isToday,
}: {
  dayName: string
  tasks: Task[]
  modifications: Record<string, number>
  onFrequencyChange: (taskId: string, newDays: number) => void
  onDateChange: (taskId: string, direction: 'before' | 'after') => void
  realDate: string
  isToday?: boolean
}) {
  return (
    <div className={`flex flex-col border-r border-gray-600/30 last:border-r-0 min-h-96 w-full ${isToday ? 'bg-yellow-100/10' : ''}`}>
      <div className="flex flex-col leading-6 bg-gray-800/40 p-3 border-b border-gray-600/30 text-center font-medium text-gray-200">
        {dayName}
        <span className="ml-2 opacity-75">{realDate}</span>
      </div>
      <div className="flex flex-col gap-2 p-3 flex-grow">
        {tasks.map(task => (
          <TaskCard key={`${task.id}-${realDate}`} modifications={modifications} onDateChange={onDateChange} onFrequencyChange={onFrequencyChange} task={task} />
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
 * @param properties.onDateChange - Handler for date changes
 * @returns JSX element for the planner content
 */
function PlannerContent({
  tasksByDay,
  modifications,
  onFrequencyChange,
  onDateChange,
}: {
  tasksByDay: Record<number, Task[]>
  modifications: Record<string, number>
  onFrequencyChange: (taskId: string, newDays: number) => void
  onDateChange: (taskId: string, direction: 'before' | 'after') => void
}) {
  const today = new Date()
  const monday = new Date(today)
  monday.setDate(today.getDate() - today.getDay() + 1)
  return (
    <div className="bg-gray-800/30 rounded-lg shadow-sm border border-gray-600/30 overflow-hidden">
      <div className="flex min-h-96 overflow-x-auto">
        {weekDays.map((dayName, index) => {
          const columnDate = new Date(monday)
          columnDate.setDate(monday.getDate() + index)
          const realDate = formatDate(columnDate, 'dd MMMM')
          const isToday = columnDate.toDateString() === today.toDateString()
          return (
            <div className="min-w-48 flex-shrink-0" key={realDate}>
              <DayColumn dayName={dayName} isToday={isToday} modifications={modifications} onDateChange={onDateChange} onFrequencyChange={onFrequencyChange} realDate={realDate} tasks={tasksByDay[index]} />
            </div>
          )
        })}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
 * Apply modifications to tasks for display purposes
 * @param tasks - Original tasks
 * @param modifications - Current modifications
 * @returns Tasks with modifications applied
 */
function applyModificationsToTasks(tasks: Task[], modifications: TaskModifications): Task[] {
  return tasks.map(task => {
    const modifiedCompletedOn = modifications.completedOn?.[task.id]
    if (modifiedCompletedOn) return { ...task, completedOn: modifiedCompletedOn }
    return task
  })
}

/**
 * Hook for handling frequency modifications
 * @param setModifications - Setter for modifications
 * @returns Frequency change handler
 */
function useFrequencyChange(setModifications: React.Dispatch<React.SetStateAction<TaskModifications>>) {
  return useCallback(
    (taskId: string, newDays: number) => {
      setModifications(previous => ({
        ...previous,
        frequency: { ...previous.frequency, [taskId]: newDays },
      }))
    },
    [setModifications],
  )
}

/**
 * Hook for handling date modifications
 * @param tasks - Current tasks
 * @param modifications - Current modifications
 * @param setModifications - Setter for modifications
 * @returns Date change handler
 */
function useDateChange(tasks: Task[], modifications: TaskModifications, setModifications: React.Dispatch<React.SetStateAction<TaskModifications>>) {
  return useCallback(
    (taskId: string, direction: 'before' | 'after') => {
      const task = tasks.find(currentTask => currentTask.id === taskId)
      if (!task) return
      // Use the modified date if it exists, otherwise use the original task date
      const currentDateString = modifications.completedOn?.[taskId] || task.completedOn
      const currentDate = new Date(currentDateString)
      const newDate = new Date(currentDate)
      if (direction === 'before') newDate.setDate(currentDate.getDate() - 1)
      else newDate.setDate(currentDate.getDate() + 1)
      logger.info(`Changing date of "${task.name}" from ${dateIso10(currentDate)} to ${dateIso10(newDate)}`)
      setModifications(previous => ({
        ...previous,
        completedOn: { ...previous.completedOn, [taskId]: newDate.toISOString() },
      }))
    },
    [tasks, modifications, setModifications],
  )
}

/**
 * Custom hook to handle task loading and modifications
 * @returns Object containing tasks, modifications state and handlers
 */
function usePlannerTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [modifications, setModifications] = useState<TaskModifications>({ completedOn: {}, frequency: {} })
  const [saving, setSaving] = useState(false)
  const hasModifications = Object.keys(modifications.frequency || {}).length > 0 || Object.keys(modifications.completedOn || {}).length > 0

  async function loadTasks() {
    const load = await getTasks()
    if (!load.ok) throw new Error('Failed to load tasks')
    setTasks(load.value.filter(task => task.isDone === false)) // Filter out completed tasks
  }

  // biome-ignore lint/correctness/useExhaustiveDependencies: FIX ME LATER
  useEffect(() => void loadTasks(), [])

  const handleFrequencyChange = useFrequencyChange(setModifications)
  const handleDateChange = useDateChange(tasks, modifications, setModifications)

  // biome-ignore lint/correctness/useExhaustiveDependencies: FIX ME LATER
  const handleSaveModifications = useCallback(async () => {
    if (!hasModifications) return
    setSaving(true)
    const result = await saveTaskModifications(modifications.frequency || {}, modifications.completedOn || {}, tasks)
    if (result.ok) {
      setModifications({ completedOn: {}, frequency: {} })
      await loadTasks() // Reload tasks to reflect changes
    }
    setSaving(false)
  }, [modifications, hasModifications, tasks])

  return {
    handleDateChange,
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
 * Component for the planner header with title and action buttons
 * @param properties - Component properties
 * @param properties.onTasksUpload - Handler for tasks upload
 * @param properties.onTasksDispatch - Handler for tasks dispatch
 * @param properties.onSaveModifications - Handler for saving modifications
 * @param properties.hasModifications - Whether there are unsaved modifications
 * @param properties.saving - Whether save operation is in progress
 * @returns JSX element for the planner header
 */
function PlannerHeader({ onTasksUpload, onTasksDispatch, onSaveModifications, hasModifications, saving }: { onTasksUpload: () => void; onTasksDispatch: () => void; onSaveModifications: () => void; hasModifications: boolean; saving: boolean }) {
  const showDispatch = false
  return (
    <header className="sticky rounded-lg top-0 z-10 backdrop-blur-sm border-b border-gray-600/30">
      <div className="flex flex-col md:flex-row py-4 items-center gap-6">
        <div className="flex items-center gap-3 mr-auto">
          <CalendarIcon className="size-8" />
          <h3 className="mt-0 mb-0">Planner</h3>
        </div>
        <div className="flex gap-3">
          <Button onClick={onTasksUpload} variant="outline">
            <UploadIcon className="size-4" />
            Upload tasks
          </Button>
          <Button onClick={downloadData} variant="outline">
            <DownloadIcon className="size-4" />
            Download tasks
          </Button>
          {showDispatch && (
            <Button onClick={onTasksDispatch} variant="outline">
              <ArrowLeftRightIcon className="size-4" />
              Dispatch tasks
            </Button>
          )}
          {hasModifications && (
            <Button disabled={saving} onClick={onSaveModifications}>
              <SaveIcon className="size-4" />
              {saving ? 'Saving...' : 'Save modifications'}
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}

/**
 * Hook to handle planner actions
 * @param tasks - Current tasks
 * @param setTasks - Setter for tasks
 * @param loadTasks - Function to reload tasks
 * @returns Object containing action handlers
 */
function usePlannerActions(tasks: Task[], setTasks: React.Dispatch<React.SetStateAction<Task[]>>, loadTasks: () => Promise<void>) {
  const handleTasksDispatch = useCallback(async () => {
    const active = tasks.filter(task => isTaskActive(task))
    logger.info('dispatching active tasks...', { active })
    await dispatchTasks(active)
    setTasks([...tasks])
  }, [tasks, setTasks])

  const handleTasksUploadAndReload = useCallback(async () => {
    await handleTasksUpload()
    await loadTasks()
  }, [loadTasks])

  return {
    handleTasksDispatch,
    handleTasksUploadAndReload,
  }
}

/**
 * The main planner page component
 * @returns JSX element for the planner page
 */
export function PagePlanner() {
  const actions = useActions()
  const { handleDateChange, handleFrequencyChange, handleSaveModifications, setTasks, hasModifications, modifications, saving, tasks, loadTasks } = usePlannerTasks()
  const { handleTasksDispatch, handleTasksUploadAndReload } = usePlannerActions(tasks, setTasks, loadTasks)
  const tasksWithModifications = applyModificationsToTasks(tasks, modifications)
  const tasksByDay = createTaskDistribution(tasksWithModifications, modifications.frequency || {})

  return (
    <div className="flex flex-col justify-center grow" data-testid="page-planner">
      <PlannerHeader hasModifications={hasModifications} onSaveModifications={handleSaveModifications} onTasksDispatch={handleTasksDispatch} onTasksUpload={handleTasksUploadAndReload} saving={saving} />
      <PlannerContent modifications={modifications.frequency || {}} onDateChange={handleDateChange} onFrequencyChange={handleFrequencyChange} tasksByDay={tasksByDay} />
      <PlannerMetrics modifications={modifications.frequency || {}} tasks={tasks} />
      <FloatingMenu actions={actions} />
    </div>
  )
}
