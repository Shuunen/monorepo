import AddIcon from '@mui/icons-material/Add'
import SpeedDialIcon from '@mui/icons-material/EjectOutlined'
import HomeIcon from '@mui/icons-material/Home'
import HourglassTop from '@mui/icons-material/HourglassTop'
import InsightsIcon from '@mui/icons-material/Insights'
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner'
import SettingsIcon from '@mui/icons-material/Settings'
import type { FabProps } from '@mui/material'
import Fade from '@mui/material/Fade'
import SpeedDial from '@mui/material/SpeedDial'
import SpeedDialAction from '@mui/material/SpeedDialAction'
import { isMobile } from '@shuunen/shuutils'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { logger } from '../utils/logger.utils'
import { navigate } from '../utils/navigation.utils'
import { AppQuickSearch } from './app-quick-search'

const actions = [
  { handleClick: () => navigate('/'), icon: <HomeIcon />, name: 'Home' },
  { handleClick: () => navigate('/item/add'), icon: <AddIcon />, name: 'Add' },
  { handleClick: () => navigate('/settings'), icon: <SettingsIcon />, name: 'Settings' },
  { handleClick: () => navigate('/metrics'), icon: <InsightsIcon />, name: 'Metrics' },
  { handleClick: () => navigate('/scan'), icon: <QrCodeScannerIcon />, name: 'Scan' },
]

// oxlint-disable-next-line max-lines-per-function
export function AppSpeedDial({ isLoading = false, isSettingsRequired = false }: Readonly<{ isLoading?: boolean; isSettingsRequired?: boolean }>) {
  const [isOpen, setOpen] = useState(false)
  const toggleOpen = useCallback(() => {
    setOpen(!isOpen)
  }, [isOpen])
  const onMouse = useCallback((status: 'enter' | 'leave') => {
    if (!isMobile()) {
      logger.debug('open cause mouse', status)
      setOpen(status === 'enter')
    }
  }, [])
  const onMouseEnter = useCallback(() => {
    onMouse('enter')
  }, [onMouse])
  const onMouseLeave = useCallback(() => {
    onMouse('leave')
  }, [onMouse])
  const options: Partial<FabProps> = { color: 'default', sx: { backgroundColor: 'white', color: 'purple', opacity: 0.7 } } as const
  const icon = useMemo(() => (isLoading ? <HourglassTop /> : <SpeedDialIcon />), [isLoading])
  const availableActions = useMemo(() => (isSettingsRequired ? actions.filter(action => ['Home', 'Settings'].includes(action.name)) : actions), [isSettingsRequired])
  const { pathname: path } = useLocation()
  const [isQuickSearchAvailable, setQuickSearchAvailability] = useState(false)
  useEffect(() => {
    setQuickSearchAvailability(path !== '/')
    setOpen(false)
  }, [path])
  return (
    <>
      <Fade in={isOpen}>
        {/* biome-ignore lint/a11y/useKeyWithClickEvents: later */}
        {/* biome-ignore lint/a11y/noStaticElementInteractions: just a div */}
        <div className="absolute bottom-0 right-0 z-10 size-full bg-linear-to-tl" data-component="speed-dial-backdrop" onClick={toggleOpen} />
      </Fade>
      <div className="pointer-events-none fixed bottom-5 right-5 z-20 flex items-end md:bottom-10 md:right-10 print:hidden" data-component="speed-dial">
        <Fade in={isQuickSearchAvailable}>
          <div className="pointer-events-auto mb-2">
            <AppQuickSearch mode="floating" />
          </div>
        </Fade>
        <SpeedDial ariaLabel="Actions" FabProps={options} icon={icon} onClick={toggleOpen} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} open={isOpen}>
          {availableActions.map(action => (
            <SpeedDialAction
              icon={action.icon}
              key={action.name}
              onClick={() => {
                toggleOpen()
                action.handleClick()
              }}
              slotProps={{ tooltip: () => ({ title: action.name }) }}
            />
          ))}
        </SpeedDial>
      </div>
    </>
  )
}
