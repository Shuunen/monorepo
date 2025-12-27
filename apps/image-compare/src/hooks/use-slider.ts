// oxlint-disable id-length
import { type MouseEvent, type RefObject, useState } from 'react'
import { calculateSliderPosition, defaultSliderPosition } from '../utils/comparison.utils'

type UseSliderReturn = {
  handleMouseDownOnHandle: (e: MouseEvent) => void
  handleMouseMove: (e: MouseEvent, isPanning: boolean) => void
  handleMouseUpOrLeave: () => void
  isHandleDragging: boolean
  setSliderPosition: (position: number[]) => void
  sliderPosition: number[]
}

export function useSlider(imageContainerRef: RefObject<HTMLDivElement | null>): UseSliderReturn {
  const [sliderPosition, setSliderPosition] = useState([defaultSliderPosition])
  const [isHandleDragging, setIsHandleDragging] = useState(false)

  const handleMouseDownOnHandle = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsHandleDragging(true)
  }

  const handleMouseUpOrLeave = () => {
    setIsHandleDragging(false)
  }

  const handleMouseMove = (e: MouseEvent, isPanning: boolean) => {
    if (isHandleDragging && !isPanning && imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect()
      setSliderPosition([calculateSliderPosition(e.clientX, rect)])
    }
  }

  return {
    handleMouseDownOnHandle,
    handleMouseMove,
    handleMouseUpOrLeave,
    isHandleDragging,
    setSliderPosition,
    sliderPosition,
  }
}
