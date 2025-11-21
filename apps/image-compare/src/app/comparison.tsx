/* v8 ignore file -- @preserve */
/** biome-ignore-all lint/a11y/noStaticElementInteractions: fix me later */
/** biome-ignore-all lint/correctness/useUniqueElementIds: fix me later */
// oxlint-disable no-magic-numbers, id-length
import { Button, Slider } from '@monorepo/components'
import { Logger } from '@monorepo/utils'
import { motion } from 'framer-motion'
// oxlint-disable-next-line no-restricted-imports
import { RotateCcw, Upload } from 'lucide-react'
import { type MouseEvent, type MouseEventHandler, useEffect, useRef, useState, type WheelEvent } from 'react'

// oxlint-disable-next-line max-lines-per-function
export function Comparison() {
  const [sliderPosition, setSliderPosition] = useState([50])
  const [leftImage, setLeftImage] = useState('https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=800&h=600&fit=crop')
  const [rightImage, setRightImage] = useState('https://images.unsplash.com/photo-1682687221038-404cb8830901?w=800&h=600&fit=crop')
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [isHandleDragging, setIsHandleDragging] = useState(false)
  const imageContainerRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ panX: 0, panY: 0, x: 0, y: 0 })

  useEffect(() => {
    // Reset pan when zoom is reset
    if (zoom === 1) setPan({ x: 0, y: 0 })
  }, [zoom])

  type FileInputEvent = {
    target: {
      files?: FileList | null
    }
  }

  const logger = new Logger()

  const handleLeftImageUpload = (e: FileInputEvent): void => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      // oxlint-disable-next-line prefer-add-event-listener
      reader.onload = event => {
        const result = event.target?.result
        if (typeof result === 'string') {
          setLeftImage(result)
          logger.info('Left image updated via upload.')
        } else logger.showError('Failed to read left image file: result is not a string.')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRightImageUpload = (e: FileInputEvent): void => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      // oxlint-disable-next-line prefer-add-event-listener
      reader.onload = event => {
        const result = event.target?.result
        if (typeof result === 'string') {
          setRightImage(result)
          logger.info('Right image updated via upload.')
        } else logger.showError('Failed to read right image file: result is not a string.')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleReset = () => {
    setSliderPosition([50])
    setZoom(1)
    setPan({ x: 0, y: 0 })
    setIsPanning(false)
    setIsHandleDragging(false)
    logger.info('Reset zoom and pan to initial positions.')
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    const newZoom = zoom - e.deltaY * 0.005
    setZoom(Math.min(Math.max(newZoom, 1), 5))
  }

  const handleMouseDownOnImage: MouseEventHandler<HTMLDivElement> = e => {
    if (zoom <= 1) return
    e.preventDefault()
    dragStartRef.current = {
      panX: pan.x,
      panY: pan.y,
      x: e.clientX,
      y: e.clientY,
    }
    setIsPanning(true)
  }

  const handleMouseDownOnHandle = (e: MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setIsHandleDragging(true)
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    setIsHandleDragging(false)
  }

  const handleMouseLeave = () => {
    setIsPanning(false)
    setIsHandleDragging(false)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning && zoom > 1) {
      const dx = e.clientX - dragStartRef.current.x
      const dy = e.clientY - dragStartRef.current.y
      const newPanX = dragStartRef.current.panX + dx
      const newPanY = dragStartRef.current.panY + dy
      setPan({ x: newPanX, y: newPanY })
    } else if (isHandleDragging && imageContainerRef.current) {
      const rect = imageContainerRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const newPosition = (x / rect.width) * 100
      setSliderPosition([Math.max(0, Math.min(100, newPosition))])
    }
  }

  const imageStyle = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
    transition: isPanning ? 'none' : 'transform 0.1s ease-out',
  }

  const getCursor = () => {
    if (isHandleDragging) return 'grabbing'
    if (zoom > 1) return isPanning ? 'grabbing' : 'grab'
    return 'auto'
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 md:p-8">
      <motion.div animate={{ opacity: 1, y: 0 }} className="w-full max-w-6xl" initial={{ opacity: 0, y: -20 }} transition={{ duration: 0.6 }}>
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">Image Compare</h1>
          <p className="text-lg text-blue-200">Comparez, zoomez et analysez vos images avec précision</p>
        </header>

        <motion.div animate={{ opacity: 1, scale: 1 }} className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 md:p-8 shadow-2xl border border-white/20" initial={{ opacity: 0, scale: 0.95 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div
            className="relative w-full aspect-video rounded-xl overflow-hidden bg-slate-800 mb-6"
            onMouseDown={handleMouseDownOnImage}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onWheel={handleWheel}
            ref={imageContainerRef}
            style={{ cursor: getCursor() }}
          >
            <div className="absolute inset-0">
              <img alt="right" className="w-full h-full object-cover" src={rightImage} style={imageStyle} />
            </div>

            <motion.div
              className="absolute inset-0"
              style={{
                clipPath: `inset(0 ${100 - sliderPosition[0]}% 0 0)`,
              }}
              transition={{ damping: 30, stiffness: 300, type: 'spring' }}
            >
              <img alt="left" className="w-full h-full object-cover" src={leftImage} style={imageStyle} />
            </motion.div>

            <div className="absolute top-0 bottom-0 w-1 bg-white shadow-lg" style={{ cursor: 'ew-resize', left: `${sliderPosition[0]}%` }}>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-white rounded-full shadow-xl flex items-center justify-center cursor-grab active:cursor-grabbing" onMouseDown={handleMouseDownOnHandle}>
                <div className="flex gap-1">
                  <div className="w-1 h-6 bg-slate-700 rounded"></div>
                  <div className="w-1 h-6 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded pointer-events-none">Zoom: {Math.round(zoom * 100)}%</div>
          </div>

          <div className="mb-6 px-2">
            <Slider className="w-full" max={100} onValueChange={setSliderPosition} step={1} value={sliderPosition} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="cursor-pointer" htmlFor="left-upload">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-300" name="left-upload" onClick={() => document.querySelector<HTMLButtonElement>('#left-upload')?.click()} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Left Image
                </Button>
              </label>
              <input accept="image/*" className="hidden" id="left-upload" onChange={handleLeftImageUpload} type="file" />
            </div>

            <Button className="w-full bg-slate-700 hover:bg-slate-600 text-white border-0 transition-all duration-300" name="reset" onClick={handleReset} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset View
            </Button>

            <div>
              <label className="cursor-pointer" htmlFor="right-upload">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0 transition-all duration-300" name="right-upload" onClick={() => document.querySelector<HTMLButtonElement>('#right-upload')?.click()} variant="outline">
                  <Upload className="mr-2 h-4 w-4" />
                  Image Droite
                </Button>
              </label>
              <input accept="image/*" className="hidden" id="right-upload" onChange={handleRightImageUpload} type="file" />
            </div>
          </div>
        </motion.div>

        <motion.div animate={{ opacity: 1 }} className="text-center mt-8 text-blue-200" initial={{ opacity: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
          <p className="text-sm">Utilisez la molette pour zoomer • Maintenez le clic pour vous déplacer</p>
        </motion.div>
      </motion.div>
    </div>
  )
}
