import { ThemeProvider } from '@mui/material/styles'
import type { ReactNode } from 'react'
import type { MuiIcon } from '../types/icons.types'
import { setPageTitle } from '../utils/browser.utils'
import { theme } from '../utils/theme.utils'
import { AppButtonBack } from './app-button-back'
import { AppPageBottom } from './app-page-bottom'

export function AppPageCard({
  cardTitle,
  children,
  icon: Icon,
  nextLabel = 'Home',
  nextUrl = '/',
  pageCode,
  pageTitle,
  stepsBack = 1,
}: Readonly<{ cardTitle: string; children: ReactNode; icon: MuiIcon; nextLabel?: string; nextUrl?: string; pageCode: string; pageTitle: string; stepsBack?: number }>) {
  setPageTitle(pageTitle)
  return (
    <ThemeProvider theme={theme}>
      <div className="flex max-h-full w-full grow flex-col items-center md:grow-0 print:hidden" data-component="page-card" data-page={pageCode}>
        <h3 className="hidden sm:block">{cardTitle}</h3>
        <div className="relative z-10 block w-full grow overflow-auto text-purple-700 bg-linear-to-b from-white/80 to-white p-4 sm:p-6 md:w-auto md:min-w-[30rem] md:gap-6 md:rounded-md md:shadow-md">
          <div className="mb-2 flex w-full sm:mb-4 md:hidden">
            <AppButtonBack />
          </div>
          {children}
        </div>
        <div className="mb-8 hidden md:block">
          <AppPageBottom icon={Icon} nextLabel={nextLabel} nextUrl={nextUrl} stepsBack={stepsBack} />
        </div>
      </div>
    </ThemeProvider>
  )
}
