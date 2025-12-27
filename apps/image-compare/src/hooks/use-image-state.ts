import { useEffect, useState } from 'react'
import { fetchImageMetadata, type ImageMetadata } from '../utils/image.utils'

type UseImageStateReturn = {
  leftImage: string
  leftImageMetadata: ImageMetadata | undefined
  rightImage: string
  rightImageMetadata: ImageMetadata | undefined
  setLeftImage: (image: string) => void
  setLeftImageMetadata: (metadata: ImageMetadata | undefined) => void
  setRightImage: (image: string) => void
  setRightImageMetadata: (metadata: ImageMetadata | undefined) => void
}

const defaultImages = {
  after: '/sample-image-green.svg',
  before: '/sample-image-blue.svg',
}

export function useImageState(): UseImageStateReturn {
  const [leftImage, setLeftImage] = useState(defaultImages.before)
  const [rightImage, setRightImage] = useState(defaultImages.after)
  const [leftImageMetadata, setLeftImageMetadata] = useState<ImageMetadata | undefined>(undefined)
  const [rightImageMetadata, setRightImageMetadata] = useState<ImageMetadata | undefined>(undefined)

  useEffect(() => {
    const loadDefaultMetadata = async () => {
      const [leftMeta, rightMeta] = await Promise.all([fetchImageMetadata(defaultImages.before), fetchImageMetadata(defaultImages.after)])
      setLeftImageMetadata(leftMeta)
      setRightImageMetadata(rightMeta)
    }
    void loadDefaultMetadata()
  }, [])

  return {
    leftImage,
    leftImageMetadata,
    rightImage,
    rightImageMetadata,
    setLeftImage,
    setLeftImageMetadata,
    setRightImage,
    setRightImageMetadata,
  }
}
