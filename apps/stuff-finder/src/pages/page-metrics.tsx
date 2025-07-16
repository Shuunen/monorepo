import InsightsIcon from '@mui/icons-material/Insights'
import OutboxIcon from '@mui/icons-material/Outbox'
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart'
import SpeedIcon from '@mui/icons-material/Speed'
import { tw } from '@shuunen/shuutils'
import type { ComponentChildren } from 'preact'
import { useMemo } from 'preact/hooks'
import { AppPageCard } from '../components/app-page-card'
import type { MuiIcon } from '../types/icons.types'
import type { Item } from '../types/item.types'
import { itemToImageUrl } from '../utils/database.utils'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'
import { calculateMetrics, formatCurrency, type MetricsData } from './page-metrics.utils'

type MetricCardAmountProps = {
  amount: number | string
  icon: MuiIcon
}

type MetricCardListProps = {
  children?: ComponentChildren
  items?: Item[]
}

type MetricCardProps = {
  title: string
  color: string
} & (MetricCardAmountProps | MetricCardListProps)

function MetricCard(props: MetricCardProps) {
  return (
    <div class={`flex items-center whitespace-nowrap gap-6 rounded-lg border border-gray-200 relative bg-white p-6 shadow-sm ${props.color} ${'items' in props && props.items?.length === 0 ? 'hidden' : ''}`}>
      {'icon' in props && <props.icon className="opacity-30" sx={{ fontSize: '3rem' }} />}
      {'amount' in props && <p class={`text-3xl font-bold`}>{props.amount}</p>}
      <div class="flex flex-col w-full">
        <h2 class="text-xl font-semibold text-current">{props.title}</h2>
        <div class="space-y-3 max-h-80 overflow-y-auto">
          {'children' in props && props.children}
          {'items' in props && props.items && props.items.map(item => <MetricCardEntryItem item={item} key={item.$id} />)}
        </div>
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
        <p class={`font-medium`}>{value}</p>
      </div>
    </div>
  )
}

function MetricCardEntryItem({ item }: { item: Item }) {
  const subtitle = item.brand || 'No brand'
  const value = formatCurrency(item.price)

  return (
    <div class="flex items-center justify-between rounded-md border border-gray-200 p-3 mr-3">
      <img alt={item.name} class="size-10 rounded object-contain flex-shrink-0" loading="lazy" src={itemToImageUrl(item)} />
      <div class="flex-1 max-w-4/5">
        <h4 class="font-medium text-gray-900 truncate">{item.name}</h4>
        <p class="text-sm text-gray-600">{subtitle}</p>
      </div>
      <div class="text-right">
        <p class={`font-medium`}>{value}</p>
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
      <MetricCard amount={metrics.toGiveItems} color={tw('text-green-600')} icon={OutboxIcon} title="items to give" />
      <MetricCard amount={formatCurrency(metrics.totalValue)} color={tw('text-blue-600')} icon={ShoppingCartIcon} title="total value" />
    </div>
  )
}

function MetricCardLists({ metrics }: { metrics: MetricsData }) {
  return (
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <MetricCard color={tw('text-red-600')} items={metrics.itemsNotPrinted} title={`${metrics.itemsNotPrinted.length} items not printed`} />
      <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutLocation} title={`${metrics.itemsWithoutLocation.length} items without location`} />
      <MetricCard color={tw('text-red-600')} items={metrics.itemsWithoutPrice} title={`${metrics.itemsWithoutPrice.length} items without price`} />
      <MetricCard color={tw('text-blue-700')} title="Storage locations">
        {Object.entries(metrics.boxAnalysis)
          .sort((entryA, entryB) => entryA[0].localeCompare(entryB[0]))
          .map(([box, data]) => (
            <MetricCardEntry key={box} subtitle={`${data.count} items`} title={box || 'No box specified'} value={formatCurrency(data.totalValue)} />
          ))}
      </MetricCard>
      <MetricCard color={tw('text-green-700')} items={metrics.topValueItems} title="Most valuable" />
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
