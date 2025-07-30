import { lazy, Suspense, useMemo } from 'react'
import { BrowserRouter, Route, Routes, useNavigate } from 'react-router-dom'
import { AppLoader } from './components/app-loader'
import { setNavigate } from './utils/navigation.utils'

const AsyncPageHome = lazy(() => import('./pages/page-home').then(({ PageHome }) => ({ default: PageHome })))
const AsyncPageError = lazy(() => import('./pages/page-error').then(({ PageError }) => ({ default: PageError })))
const AsyncPageScan = lazy(() => import('./pages/page-scan').then(({ PageScan }) => ({ default: PageScan })))
const AsyncPageItemAddEdit = lazy(() => import('./pages/page-item-add-edit').then(({ PageItemAddEdit }) => ({ default: PageItemAddEdit })))
const AsyncPageItemDetails = lazy(() => import('./pages/page-item-details').then(({ PageItemDetails }) => ({ default: PageItemDetails })))
const AsyncPageItemPrint = lazy(() => import('./pages/page-item-print').then(({ PageItemPrint }) => ({ default: PageItemPrint })))
const AsyncPageSearch = lazy(() => import('./pages/page-search').then(({ PageSearch }) => ({ default: PageSearch })))
const AsyncPageSettings = lazy(() => import('./pages/page-settings').then(({ PageSettings }) => ({ default: PageSettings })))
const AsyncPageMetrics = lazy(() => import('./pages/page-metrics').then(({ PageMetrics }) => ({ default: PageMetrics })))
const AsyncPageKitchenSink = lazy(() => import('./pages/page-kitchen-sink').then(({ PageKitchenSink }) => ({ default: PageKitchenSink })))
const AsyncAppSpeedDial = lazy(() => import('./components/app-speed-dial').then(({ AppSpeedDial }) => ({ default: AppSpeedDial })))
const AsyncPageSounds = lazy(() => import('./components/app-sounds').then(({ AppSounds }) => ({ default: AppSounds })))

export function App() {
  const fallback = useMemo(() => <AppLoader isLoading />, [])
  const navigate = useNavigate()
  setNavigate(navigate)
  return (
    <Suspense fallback={fallback}>
      <BrowserRouter>
        <Routes>
          <Route element={<AsyncPageHome />} path="/" />
          <Route element={<AsyncPageItemAddEdit />} path="/item/add/:id?" />
          <Route element={<AsyncPageItemAddEdit isEdit />} path="/item/edit/:id" />
          <Route element={<AsyncPageItemDetails />} path="/item/details/:id/:context?" />
          <Route element={<AsyncPageItemPrint />} path="/item/print/:id" />
          <Route element={<AsyncPageScan />} path="/scan" />
          <Route element={<AsyncPageSearch />} path="/search/:input" />
          <Route element={<AsyncPageSettings />} path="/settings" />
          <Route element={<AsyncPageMetrics />} path="/metrics" />
          <Route element={<AsyncPageKitchenSink />} path="/kitchen-sink" />
          <Route element={<AppLoader isLoading={true} />} path="/loading" />
          <Route element={<AsyncPageError code="page-not-found" />} path="*" />
        </Routes>
        <AsyncPageSounds />
        <AsyncAppSpeedDial />
      </BrowserRouter>
    </Suspense>
  )
}
