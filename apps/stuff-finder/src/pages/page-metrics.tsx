import InsightsIcon from '@mui/icons-material/Insights'
import OutboxIcon from '@mui/icons-material/Outbox'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SpeedIcon from '@mui/icons-material/Speed'
import { tw } from '@shuunen/shuutils'
import type { ComponentChildren } from 'preact'
import { useMemo } from 'preact/hooks'
import { AppItemList } from '../components/app-item-list'
import { AppPageCard } from '../components/app-page-card'
import type { MuiIcon } from '../types/icons.types'
import type { Item } from '../types/item.types'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { calculateMetrics, formatCurrency, type MetricsData, topValueItems } from './page-metrics.utils'

type MetricCardAmountProps = {
  amount: number | string
  icon: MuiIcon
}

type MetricCardListProps = {
  children?: ComponentChildren
  items?: Item[]
  showPrice?: boolean
}

type MetricCardProps = {
  title: string
  color: string
} & (MetricCardAmountProps | MetricCardListProps)

function MetricCard(props: MetricCardProps) {
  return (
    <div class={`flex whitespace-nowrap gap-6 rounded-lg border border-gray-200 relative bg-white p-6 shadow-sm ${props.color} ${'items' in props && props.items?.length === 0 ? 'hidden' : ''}`}>
      {'amount' in props && (
        <div class="flex items-center">
          <props.icon className="opacity-30" sx={{ fontSize: '3rem' }} />
          <p class={`text-3xl font-bold`}>{props.amount}</p>
        </div>
      )}
      <div class={`flex flex-col w-full ${'amount' in props ? 'justify-center' : ''}`}>
        <h2 class="text-xl font-semibold text-current">{props.title}</h2>
        {('children' in props || 'items' in props) && (
          <div class="space-y-3 max-h-96 overflow-y-auto">
            {'children' in props && props.children}
            {'items' in props && props.items && <AppItemList display="list" items={props.items} showPrice={'showPrice' in props ? props.showPrice : false} />}
          </div>
        )}
      </div>
    </div>
  )
}

type MetricCardEntryProps = {
  title: string
  subtitle: string
  value: string
}

function MetricCardEntry({ title, subtitle, value }: MetricCardEntryProps) {
  return (
    <div class="flex items-center justify-between rounded-md border border-gray-200 p-3 mr-3">
      <div class="flex-1 max-w-4/5">
        <h4 class="font-medium text-gray-900 truncate">{title}</h4>
        <p class="text-sm text-gray-600">{subtitle}</p>
      </div>
      <div class="text-right">
        <p class="font-medium">{value}</p>
      </div>
    </div>
  )
}

function useMetrics() {
  return useMemo(() => calculateMetrics(state.items), [])
}

function MetricCardAmounts({ metrics }: { metrics: MetricsData }) {
  return (
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <MetricCard amount={metrics.totalItems} color={tw('text-purple-700')} icon={SpeedIcon} title="items registered" />
      <MetricCard amount={metrics.itemsToGive.length} color={tw('text-green-600')} icon={OutboxIcon} title="items to give" />
      <MetricCard amount={formatCurrency(metrics.totalValue)} color={tw('text-blue-600')} icon={ShoppingCartIcon} title="total value" />
    </div>
  )
}

function MetricCardLists({ metrics }: { metrics: MetricsData }) {
  return (
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MetricCard color={tw('text-red-600')} items={metrics.itemsNotPrinted} title={`Items not printed : ${metrics.itemsNotPrinted.length}`} />
      <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutLocation} showPrice={true} title={`Items without location : ${metrics.itemsWithoutLocation.length}`} />
      <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutPhoto} title={`Items without photo : ${metrics.itemsWithoutPhoto.length}`} />
      <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutPrice} title={`Items without price : ${metrics.itemsWithoutPrice.length}`} />
      <MetricCard color={tw('text-blue-700')} title="Storage locations">
        {Object.entries(metrics.boxAnalysis)
          .sort((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
          .map(([box, data]) => (
            <MetricCardEntry key={box} subtitle={`${data.count} items`} title={box || 'No box specified'} value={formatCurrency(data.totalValue)} />
          ))}
      </MetricCard>
      <MetricCard color={tw('text-green-700')} items={metrics.topValueItems} showPrice={true} title={`Top ${topValueItems} most valuable`} />
      <MetricCard color={tw('text-yellow-700')} items={metrics.itemsToGive} title={`Items to give : ${metrics.itemsToGive.length}`} />
    </div>
  )
}

export function PageMetrics({ ...properties }: Readonly<Record<string, unknown>>) {
  logger.debug('PageMetrics', { properties })
  const metrics = useMetrics()

  return (
    <AppPageCard cardTitle="Metrics" icon={InsightsIcon} pageCode="metrics" pageTitle="Metrics">
      <div class="flex flex-col">
        <MetricCardAmounts metrics={metrics} />
        <MetricCardLists metrics={metrics} />
      </div>
    </AppPageCard>
  )
}
