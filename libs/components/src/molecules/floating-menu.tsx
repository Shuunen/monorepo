import { cn } from '@monorepo/utils'
import { LoaderCircleIcon, type LucideProps, PackageIcon, PackageOpenIcon } from 'lucide-react'
import { createElement, type ForwardRefExoticComponent, type RefAttributes, useEffect, useMemo, useState } from 'react'
import { Command, CommandEmpty, CommandItem, CommandList } from '../shadcn/command'
import { Popover, PopoverContent, PopoverTrigger } from '../shadcn/popover'

export type FloatingMenuAction = {
  disabled?: boolean
  handleClick: () => void
  icon: ForwardRefExoticComponent<Omit<LucideProps, 'ref'> & RefAttributes<SVGSVGElement>>
  name: string
}

// oxlint-disable-next-line max-lines-per-function
export function FloatingMenu({ actions = [], isLoading = false, isSettingsRequired = false }: Readonly<{ actions: FloatingMenuAction[]; isLoading?: boolean; isSettingsRequired?: boolean }>) {
  const [isOpen, setOpen] = useState(false)
  const iconOpen = isOpen ? <PackageOpenIcon /> : <PackageIcon />
  const icon = useMemo(() => (isLoading ? <LoaderCircleIcon /> : iconOpen), [iconOpen, isLoading])
  // oxlint-disable-next-line max-nested-callbacks
  const availableActions = useMemo(() => (isSettingsRequired ? actions.filter(action => ['Home', 'Settings'].includes(action.name)) : actions), [actions, isSettingsRequired])
  useEffect(() => {
    setOpen(false)
  }, [])
  return (
    <>
      {isOpen && <div className="fixed bottom-0 right-0 z-10 size-full bg-linear-to-tl bg-black/20" data-component="speed-dial-backdrop" />}
      <Popover onOpenChange={setOpen}>
        <PopoverTrigger className={cn('cursor-pointer transition-all bottom-5 right-5 fixed bg-primary p-4 rounded-full', isSettingsRequired ? 'animate-pulse' : 'opacity-50 hover:opacity-100')}>{icon}</PopoverTrigger>
        <PopoverContent className="p-1 mr-5 mb-2 w-fit">
          <Command>
            <CommandList>
              <CommandEmpty>No results found.</CommandEmpty>
              {/* <CommandItem>Profile</CommandItem> */}
              {availableActions.map(action => (
                <CommandItem className="cursor-pointer text-lg" disabled={action.disabled} key={action.name} onSelect={action.handleClick}>
                  {createElement(action.icon, { className: 'size-5' })}
                  {action.name}
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  )
}
