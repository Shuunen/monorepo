import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { Breadcrumb } from './breadcrumb'

/**
 * Displays a breadcrumb
 */
const meta = {
  component: Breadcrumb,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Commons/Atoms/Breadcrumb',
} satisfies Meta<typeof Breadcrumb>

export default meta

type Story = StoryObj<typeof meta>

/**
 * The default form of the breadcrumb.
 */
export const Default: Story = {
  args: {
    items: [
      { label: 'Home', link: '/' },
      { label: 'Components', link: '/components' },
      { label: 'Breadcrumb', link: '/components/breadcrumb' },
    ],
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const homeBreadcrumb = canvas.getByText('Home')
    expect(homeBreadcrumb).toBeInTheDocument()
    expect(homeBreadcrumb.closest('a')).toHaveAttribute('href', '/')

    const componentsBreadcrumb = canvas.getByText('Components')
    expect(componentsBreadcrumb).toBeInTheDocument()
    expect(componentsBreadcrumb.closest('a')).toHaveAttribute('href', '/components')

    const atomBreadcrumb = canvas.getByText('Breadcrumb')
    expect(atomBreadcrumb).toHaveClass('text-foreground')
    expect(atomBreadcrumb).toBeInTheDocument()
  },
}
