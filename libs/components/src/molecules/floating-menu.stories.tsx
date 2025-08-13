import { toastInfo } from '@shuunen/shuutils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { BanIcon, CogIcon, TvIcon } from 'lucide-react'
import { FloatingMenu } from './floating-menu'

const meta: Meta<typeof FloatingMenu> = {
  component: FloatingMenu,
  title: 'molecules/FloatingMenu',
}

export default meta

type Story = StoryObj<typeof FloatingMenu>

export const Basic: Story = {
  args: {
    actions: [
      {
        handleClick: () => toastInfo('Casting to tv...'),
        icon: TvIcon,
        name: 'Cast to TV',
      },
      {
        handleClick: () => toastInfo('Blocking user...'),
        icon: BanIcon,
        name: 'Block User',
      },
      {
        handleClick: () => toastInfo('Opening settings...'),
        icon: CogIcon,
        name: 'Open Settings',
      },
    ],
  },
}

export const NoActions: Story = {
  args: {
    actions: [],
  },
}
