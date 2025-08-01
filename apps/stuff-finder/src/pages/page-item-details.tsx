import ManageSearchIcon from '@mui/icons-material/ManageSearch'
import { useParams } from 'react-router-dom'
import { AppItemDetails } from '../components/app-item-details'
import { AppPageCard } from '../components/app-page-card'
import { logger } from '../utils/logger.utils'
import { state } from '../utils/state.utils'

export function PageItemDetails() {
  const { id, context } = useParams<{ id: string; context?: string }>()
  if (typeof id !== 'string') return <>An id in the url is required, got "{id}"</>
  const item = state.items.find(one => one.$id === id)
  if (item === undefined) return <>Item with id &quot;{id}&quot; not found ;(</>
  logger.debug('PageItemDetails', { item })
  const stepsBack = context === 'single' ? 2 : 1 // oxlint-disable-line @typescript-eslint/no-magic-numbers
  return (
    <AppPageCard cardTitle="Details" icon={ManageSearchIcon} nextLabel="Edit" nextUrl={`/item/edit/${item.$id}`} pageCode="item-details" pageTitle={`${item.name} - Details`} stepsBack={stepsBack}>
      <AppItemDetails item={item} />
    </AppPageCard>
  )
}
