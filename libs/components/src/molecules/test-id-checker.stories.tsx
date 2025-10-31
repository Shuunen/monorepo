import type { Meta, StoryObj } from '@storybook/react-vite'
import { TestIdChecker } from './test-id-checker'

type DemoProps = {
  testIds: string[]
  description?: string
}

const DemoPage = ({ testIds = [], description }: DemoProps) => (
  <div className="px-4 py-28 space-y-4">
    <div data-testid={testIds[0]}>
      <h1 className="text-2xl font-bold mb-4" data-testid={testIds[1]}>
        Welcome to Our App
      </h1>
      <p data-testid={testIds[2]}>
        This is a sample page to demonstrate the TestIdChecker component.
        <br />
        {description}
      </p>
    </div>

    <div data-testid={testIds[3]}>
      <button className="px-4 py-2 bg-blue-500 text-white rounded" data-testid={testIds[4]} type="button">
        Click Me
      </button>
      <input className="ml-4 px-4 py-2 border rounded" data-testid={testIds[5]} placeholder="Search..." type="text" />
    </div>

    <div data-testid={testIds[6]}>
      <span data-testid={testIds[7]}>© 2025 Sample App</span>
    </div>

    <TestIdChecker forceVisible={true} />
  </div>
)

const meta = {
  component: DemoPage,
  title: 'molecules/TestIdChecker',
} satisfies Meta<typeof DemoPage>

export default meta
type Story = StoryObj<typeof meta>

export const UniqueTestIds: Story = {
  args: {
    description: 'On this page we only have unique data-testid attributes.',
    testIds: ['header-section', 'title', 'description', 'content-section', 'primary-button', 'search-input', 'footer-section', 'copyright-text'],
  },
}

export const DuplicateTestIds: Story = {
  args: {
    description: 'On this page we have duplicate data-testid attributes.',
    testIds: ['header-section', 'title', 'description', 'section', 'primary-button', 'search-input', 'section'],
  },
}

export const NoTestIds: Story = {
  args: {
    description: 'On this page we have no data-testid attributes',
    testIds: [],
  },
}

export const InvalidTestIds: Story = {
  args: {
    description: 'On this page we have invalid data-testid attributes.',
    testIds: ['valid-section', 'valid-title', 'valid-description', 'text with spaces', 'special#chars', 'search.input'],
  },
}
