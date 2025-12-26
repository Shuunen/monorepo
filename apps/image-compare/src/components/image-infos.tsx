// oxlint-disable no-magic-numbers

import { Paragraph } from '@monorepo/components'
import { cn } from '@monorepo/utils'
import type { ImageMetadata } from '../utils/comparison.utils'

function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

function ImageInfosColumn({ infos, doReverse = false }: { infos: ImageMetadata; doReverse?: boolean }) {
  const data = [
    { label: 'name', value: infos.filename },
    { label: 'size', value: formatFileSize(infos.size) },
    { label: 'resolution', value: `${infos.width} × ${infos.height}` },
  ]
  return (
    <div className={cn('flex flex-col gap-2', { 'opacity-50': infos.isWinner === false })}>
      {data.map(item => (
        <div className={cn('flex gap-2 items-center', { 'flex-row-reverse': doReverse })} key={item.label}>
          <Paragraph>{item.label}</Paragraph>
          <Paragraph className="font-sans bg-accent px-2 rounded">{item.value}</Paragraph>
        </div>
      ))}
    </div>
  )
}

export function ImageInfos({ infos }: { infos: Array<ImageMetadata | undefined> }) {
  return (
    <div className="flex justify-between w-full">
      {infos[0] && <ImageInfosColumn infos={infos[0]} />}
      {infos[1] && <ImageInfosColumn doReverse infos={infos[1]} />}
    </div>
  )
}
