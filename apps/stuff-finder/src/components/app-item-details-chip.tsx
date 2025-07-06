import Chip, { type ChipOwnProps } from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import { copyToClipboard } from '@shuunen/shuutils'
import { useCallback } from 'preact/hooks'
import { route } from 'preact-router'
import type { MuiIcon } from '../types/icons.types'
import { logger } from '../utils/logger.utils'

type Properties = Readonly<{
  color?: ChipOwnProps['color']
  icon?: MuiIcon | undefined
  label: string
  link?: string
  tooltip: string
}>

const chipsStyle = { height: 28, paddingTop: 0.3 }

export function AppItemDetailsChip({ color = 'default', icon: Icon, label, link, tooltip }: Properties) {
  const onChipClick = useCallback(
    async (event: MouseEvent) => {
      event.stopPropagation()
      logger.debug('onChipClick', { event })
      if (link !== undefined) {
        route(link)
        return
      }
      const target = event.currentTarget as HTMLElement
      await copyToClipboard(target.textContent ?? '')
      logger.showSuccess(`${tooltip.split(',')[0]} copied to clipboard`)
    },
    [link, tooltip],
  )

  const attributes: Record<string, unknown> = Icon === undefined ? {} : { className: 'reverse pr-3!', icon: <Icon className="-ml-2!" /> }

  return (
    <Tooltip data-component="item-details-chip" title={tooltip}>
      <Chip {...attributes} color={color} label={label} onClick={onChipClick} sx={chipsStyle} variant="outlined" />
    </Tooltip>
  )
}
