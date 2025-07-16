import { useState } from 'preact/hooks'
import type { Item } from '../types/item.types'
import type { Display } from '../types/theme.types'
import { state, watchState } from '../utils/state.utils'
import { AppItemListEntry } from './app-item-list-entry'

type Props = Readonly<{
  display?: Display
  items: Item[]
  showPrice?: boolean
}>

export function AppItemList(props: Props) {
  const [display, setDisplay] = useState<Display>(props.display ?? state.display)

  if (props.display === undefined)
    watchState('display', () => {
      setDisplay(state.display)
    })

  return (
    <nav aria-label="item list" class="mb-20 overflow-y-auto overflow-x-hidden md:mb-0" data-component="item-list">
      <div class={`grid grid-cols-1 bg-gray-100 ${display === 'list' ? '' : 'xs:grid-cols-2 gap-3 p-3 sm:grid-cols-3 sm:gap-5 sm:p-5'}`} data-type="list">
        {props.items.map(item => (
          <AppItemListEntry display={display} item={item} key={item.$id} showPrice={props.showPrice} />
        ))}
      </div>
    </nav>
  )
}
