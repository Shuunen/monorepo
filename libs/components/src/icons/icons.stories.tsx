import { DebugData } from '@monorepo/components'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { JSX } from 'react'
import { IconAdd } from './icon-add'
import { IconArrowDown } from './icon-arrow-down'
import { IconArrowLeft } from './icon-arrow-left'
import { IconArrowRight } from './icon-arrow-right'
import { IconArrowUp } from './icon-arrow-up'
import { IconCheck } from './icon-check'
import { IconEdit } from './icon-edit'
import { IconError } from './icon-error'
import { IconHome } from './icon-home'
import { IconLoading } from './icon-loading'
import { IconReadonly } from './icon-readonly'
import { IconSelect } from './icon-select'
import { IconSuccess } from './icon-success'
import { IconTooltip } from './icon-tooltip'
import { IconWarning } from './icon-warning'

const icons = [IconAdd, IconArrowDown, IconArrowLeft, IconArrowRight, IconArrowUp, IconCheck, IconEdit, IconError, IconHome, IconLoading, IconReadonly, IconSelect, IconSuccess, IconTooltip, IconWarning]

type Props = { component: ({ className }: { className?: string | undefined }) => JSX.Element }

function Icon({ component: Component }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="size-14 shadow-md flex items-center justify-center transition-colors hover:bg-slate-800 hover:text-blue-300">
        <Component />
      </div>
      <DebugData data={`<${Component.name} />`} />
    </div>
  )
}

const meta = {
  parameters: {
    layout: 'centered',
  },
  render: () => (
    <div className="grid gap-4 w-3xl grid-cols-2">
      {icons.map(icon => (
        <Icon component={icon} key={icon.name} />
      ))}
    </div>
  ),
  tags: ['autodocs'],
  title: 'atoms/Icons',
} satisfies Meta

export default meta

type Story = StoryObj<typeof meta>

export const Icons: Story = {}
