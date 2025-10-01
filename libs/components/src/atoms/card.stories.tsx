import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

const meta = {
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'atoms/Card',
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const TextContent: Story = {
  args: {
    children: <p className="px-6">Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat aspernatur ea architecto, consectetur dignissimos minima magni sed illum odio assumenda, soluta iure incidunt repudiandae. Incidunt voluptas provident eius sequi illum.</p>,
  },
}

export const CompleteCard: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
        <CardAction>
          <Button testId="card">Click me</Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat aspernatur ea architecto, consectetur dignissimos minima magni sed illum odio assumenda, soluta iure incidunt repudiandae. Incidunt voluptas provident eius sequi illum.</p>
      </CardContent>
      <CardFooter>A nice footer</CardFooter>
    </Card>
  ),
}
