import SearchIcon from '@mui/icons-material/Search'
import { ellipsis } from '@shuunen/utils'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AppButtonNext } from '../components/app-button-next'
import { AppDisplayToggle } from '../components/app-display-toggle'
import { AppItemList } from '../components/app-item-list'
import { AppPageCard } from '../components/app-page-card'
import type { Item } from '../types/item.types'
import { logger } from '../utils/logger.utils'
import { navigate } from '../utils/navigation.utils'
import { sadAscii } from '../utils/strings.utils'
import { maxNameLength, search } from './page-search.const'

export function PageSearch() {
  const { input = '' } = useParams<{ input: string }>()
  const [header, setHeader] = useState('Loading...')
  const [results, setResults] = useState<Item[]>([])

  useEffect(() => {
    search(input)
      .then(data => {
        setHeader(data.header)
        setResults(data.results)
        if (data.results.length === 1) navigate(`/item/details/${data.results[0]?.$id ?? ''}/single`)
      })
      .catch(error => {
        logger.showError('Search failed', error)
      })
  }, [input])

  return (
    <AppPageCard cardTitle="Search" icon={SearchIcon} pageCode="search" pageTitle={`Search for “${ellipsis(input, maxNameLength)}”`}>
      <div className="flex max-h-[90%] flex-col items-center gap-3 sm:gap-5 md:max-h-full">
        <h2 className="text-center">{header}</h2>
        {results.length > 0 && (
          <>
            <div className="absolute right-7 top-7">
              <AppDisplayToggle />
            </div>
            <AppItemList items={results} />
          </>
        )}
        {results.length === 0 && (
          <>
            <p>{sadAscii()}</p>
            <AppButtonNext label="Add a product" url={`/item/add/${input}`} />
          </>
        )}
      </div>
    </AppPageCard>
  )
}
