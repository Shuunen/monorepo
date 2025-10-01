/* c8 ignore start */
import { cn } from '@monorepo/utils'
import { AlertTriangle, XIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '../atoms/button'
import { Card, CardContent, CardHeader, CardTitle } from '../atoms/card'

const STORAGE_KEY = 'showTestIdChecker'
const INTERVAL = 1000
const MIN_OCCURRENCES = 2
const INITIAL_INDEX = 0
const INDEX_INCREMENT = 1
const HIGHLIGHT_CLASSES = ['!outline', '!outline-2', '!outline-dashed', '!outline-blue-500', '!outline-offset-2', '!z-50', '!bg-blue-500/20', '!text-black'] as const

type TestIdInfo = {
  id: string
  isValid: boolean
  occurrences: number
}

const getAllTestIds = () =>
  Array.from(document.querySelectorAll<HTMLElement>('[data-testid]'))
    .map(el => el.dataset.testid)
    // eslint-disable-next-line prefer-native-coercion-functions
    .filter((id): id is string => Boolean(id))

// biome-ignore lint/performance/useTopLevelRegex: Fix later
const isValidTestId = (testId: string) => /^[a-zA-Z0-9-]+$/u.test(testId)

// Helper function to compare arrays of test IDs
const arraysEqual = (arrayA: string[], arrayB: string[]) => {
  if (arrayA.length !== arrayB.length) return false
  // oxlint-disable-next-line no-array-sort
  const sortedA = [...arrayA].sort()
  // oxlint-disable-next-line no-array-sort
  const sortedB = [...arrayB].sort()
  return sortedA.every((val, index) => val === sortedB[index])
}

const highlightManager = {
  add(testid: string) {
    if (this.lastHighlighted === testid) return
    this.remove(this.lastHighlighted)
    const elements = Array.from(document.querySelectorAll<HTMLElement>(`[data-testid="${testid}"]`))
    for (const el of elements) {
      el.classList.add(...HIGHLIGHT_CLASSES)
      el.scrollIntoView({ behavior: 'smooth' })
    }
    this.lastHighlighted = testid
  },
  lastHighlighted: undefined as string | undefined,
  remove(testid?: string) {
    if (!testid) return
    const elements = Array.from(document.querySelectorAll<HTMLElement>(`[data-testid="${testid}"]`))
    for (const el of elements) el.classList.remove(...HIGHLIGHT_CLASSES)
    if (this.lastHighlighted === testid) this.lastHighlighted = undefined
  },
}

function useTestIds(visible: boolean) {
  const [testIds, setTestIds] = useState<string[]>([])
  const timer = useRef<NodeJS.Timeout | undefined>(undefined)
  const lastTestIdsRef = useRef<string[]>([])
  const listElement = useRef<HTMLUListElement>(null)
  useEffect(() => {
    if (!visible) return

    const update = () => {
      const currentTestIds = getAllTestIds()

      // Only update state if test IDs have actually changed
      if (!arraysEqual(currentTestIds, lastTestIdsRef.current)) {
        const prevCount = lastTestIdsRef.current.length
        const newCount = currentTestIds.length

        lastTestIdsRef.current = currentTestIds
        setTestIds(currentTestIds)

        // Only scroll if new items were added (not removed or reordered)
        if (newCount > prevCount && listElement.current)
          // Use setTimeout to ensure DOM has updated
          setTimeout(() => {
            const lastItem = listElement.current?.lastElementChild
            if (lastItem) lastItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
          }, 0)
      }
    }

    update()
    timer.current = setInterval(update, INTERVAL)
    return () => {
      clearInterval(timer.current)
      highlightManager.remove(highlightManager.lastHighlighted)
    }
  }, [visible])

  // eslint-disable-next-line no-array-reduce
  const processedTestIds = testIds.reduce<TestIdInfo[]>((acc, id) => {
    const existing = acc.find(item => item.id === id)
    if (existing) existing.occurrences += INDEX_INCREMENT
    else acc.push({ id, isValid: isValidTestId(id), occurrences: INDEX_INCREMENT })
    return acc
  }, [])

  return { listElement, testIds: processedTestIds }
}

function TestIdListItem({ id, index, occurrences, isValid }: TestIdInfo & { index: number }) {
  return (
    <li
      aria-label={`Highlight element with data-testid ${id}`}
      className={cn('flex gap-2 whitespace-nowrap items-center border-b border-gray-100 cursor-pointer m-0 px-4 py-2 hover:bg-blue-50 transition-colors', isValid ? 'text-black' : 'text-red-500')}
      onMouseEnter={() => {
        highlightManager.add(id)
      }}
      onMouseLeave={() => {
        highlightManager.remove(id)
      }}
      title={isValid ? undefined : 'This data-testid contains un-expected chars'}
    >
      <span className="opacity-50">{index + INDEX_INCREMENT}.</span>
      {id}
      {occurrences >= MIN_OCCURRENCES && ` (${occurrences.toString()} occurrences)`}
      {!isValid && <AlertTriangle className="size-4" />}
    </li>
  )
}

export function TestIdChecker({ forceVisible = false }: { forceVisible?: boolean }) {
  const [visible, setVisible] = useState(() => {
    if (forceVisible) return true
    const actual = localStorage.getItem(STORAGE_KEY)
    if (!actual) localStorage.setItem(STORAGE_KEY, 'false')
    return actual === 'true'
  })
  const { testIds, listElement } = useTestIds(visible)
  const hasErrors = testIds.some(id => !id.isValid)
  if (!visible) return
  return (
    <Card aria-label="data-testid checker" className="fixed text-sm gap-0 overflow-hidden bottom-6 py-0 right-6 z-100 max-h-11/12 w-auto min-w-[260px] shadow-lg">
      <CardHeader className={cn('flex justify-between items-center pl-4 pr-2 py-2 text-white', hasErrors ? 'bg-red-700' : 'bg-blue-700')}>
        <CardTitle className="text-base">Data test id checker</CardTitle>
        <Button
          onClick={() => {
            setVisible(false)
            localStorage.setItem(STORAGE_KEY, 'false')
          }}
          testId="close-test-id-checker"
          variant="ghost"
        >
          <XIcon />
        </Button>
      </CardHeader>
      <CardContent className="p-0 overflow-y-auto">
        {testIds.length === INITIAL_INDEX ? (
          <div className="text-gray-400 p-4 text-center">No data-testid found</div>
        ) : (
          <ul className="text-gray-300" ref={listElement}>
            {testIds.map((info, index) => (
              <TestIdListItem key={info.id} {...info} index={index} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
/* c8 ignore stop */
