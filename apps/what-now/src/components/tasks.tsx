import { nbPercentMax, nbRgbMax, pickOne, sleep } from '@shuunen/shuutils'
import confetti from 'canvas-confetti'
import { useCallback, useEffect, useRef } from 'react'
import type { Task } from '../types'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { isTaskActive, toggleComplete } from '../utils/tasks.utils'

const emojis = [
  '👨‍🏫',
  '👩‍🏫',
  '🐱',
  '🥃',
  '🧱',
  '🌁',
  '🌃',
  '🌄',
  '🌅',
  '🌆',
  '🌇',
  '🌉',
  '🏧',
  '🚮',
  '🚰',
  '♿',
  '🚹',
  '🚺',
  '🚻',
  '🚼',
  '🚾',
  '🛂',
  '🛃',
  '🛄',
  '🛅',
  '🔃',
  '🔄',
  '🛐',
  '🕎',
  '🔯',
  '♈',
  '♉',
  '♊',
  '♋',
  '♌',
  '♍',
  '♎',
  '♏',
  '♐',
  '♑',
  '♒',
  '♓',
  '⛎',
  '🔀',
  '🔁',
  '🔂',
  '⏩',
  '⏪',
  '🔼',
  '⏫',
  '🔽',
  '⏬',
  '🎦',
  '📶',
  '📳',
  '📴',
  '#️⃣',
  '*️⃣',
  '🔟',
  '🔠',
  '🔡',
  '🔢',
  '🔣',
  '🔤',
  '🆎',
  '🆑',
  '🆒',
  '🆓',
  '🆔',
  '🆕',
  '🆖',
  '🆗',
  '🆘',
  '🆙',
  '🆚',
  '🈁',
  '🈶',
  '🉐',
  '🈹',
  '🈚',
  '🈲',
  '🉑',
  '🈸',
  '🈴',
  '🈳',
  '🈺',
  '🈵',
]

function useConfettiEffects() {
  const fireworksLeftRef = useRef<HTMLAudioElement | null>(null)
  const fireworksRightRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    fireworksLeftRef.current = new Audio('/fireworks.mp3')
    fireworksRightRef.current = new Audio('/fireworks.mp3')
  }, [])

  const confettiProbability = 0.7
  const tossCoin = useCallback(() => Math.random() > confettiProbability, [])

  // oxlint-disable-next-line max-params
  const throwConfetti = useCallback(async (originX: number, originY: number, angle: number, sound: HTMLAudioElement | null) => {
    void sound?.play()
    // oxlint-disable-next-line id-length
    void confetti({ angle, origin: { x: originX, y: originY } })
    await sleep(nbRgbMax)
  }, [])

  const throwConfettiAround = useCallback(
    async (element: HTMLElement) => {
      const { bottom, left, right } = element.getBoundingClientRect()
      // oxlint-disable-next-line no-magic-numbers
      const delta = window.innerWidth < 450 ? 90 : 30
      const positionY = Math.round((bottom / window.innerHeight) * nbPercentMax) / nbPercentMax
      let positionX = Math.round(((left + delta) / window.innerWidth) * nbPercentMax) / nbPercentMax
      const angle = 20
      // oxlint-disable-next-line no-magic-numbers
      if (tossCoin()) await throwConfetti(positionX, positionY, 90 + angle, fireworksLeftRef.current)
      positionX = Math.round(((right - delta) / window.innerWidth) * nbPercentMax) / nbPercentMax
      // oxlint-disable-next-line no-magic-numbers
      if (tossCoin()) await throwConfetti(positionX, positionY, 90 - angle, fireworksRightRef.current)
    },
    [throwConfetti, tossCoin],
  )

  return { throwConfettiAround }
}

export function Tasks({ tasks }: { tasks: Task[] }) {
  const { throwConfettiAround } = useConfettiEffects()

  function onTaskClick(task: Task, event: React.MouseEvent<HTMLButtonElement>) {
    const element = event.currentTarget
    void toggleComplete(task)
    if (!isTaskActive(task)) void throwConfettiAround(element)
    logger.info('task will be updated in state', task)
    state.tasks = state.tasks.map(item => (item.id === task.id ? task : item))
  }

  return (
    <div className="grid gap-2" data-testid="tasks">
      {tasks.map(task => {
        const isActive = isTaskActive(task)
        return (
          <button className={`app-task -ml-2 cursor-pointer mr-auto max-w-full truncate px-2 py-1 text-start transition-transform duration-300 ease-out ${isActive ? '' : 'opacity-60'}`} key={task.id} onClick={event => onTaskClick(task, event)} type="button">
            {isActive ? pickOne(emojis) : '✔️'}&nbsp; {task.name}
          </button>
        )
      })}
    </div>
  )
}
