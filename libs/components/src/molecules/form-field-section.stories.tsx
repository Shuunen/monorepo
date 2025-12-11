import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, within } from 'storybook/test'
import { FormFieldSection } from './form-field-section'

const meta = {
  component: FormFieldSection,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  title: 'Commons/Molecules/FormFieldSection',
} satisfies Meta<typeof FormFieldSection>

export default meta
type Story = StoryObj<typeof meta>

/**
 * Basic section with just a title
 */
export const TitleOnly: Story = {
  args: {
    title: 'Account Information',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { level: 1 })
    expect(title).toBeInTheDocument()
    expect(title).toHaveTextContent('Account Information')
  },
}

/**
 * Section with title and subtitle
 */
export const WithSubtitle: Story = {
  args: {
    subtitle: 'Personal Details',
    title: 'User Profile',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const headings = canvas.getAllByRole('heading')
    expect(headings).toHaveLength(2)
    expect(headings[0]).toHaveTextContent('User Profile')
    expect(headings[1]).toHaveTextContent('Personal Details')
  },
}

/**
 * Section with title and description
 */
export const WithDescription: Story = {
  args: {
    description: 'This section allows you to update your personal information. All fields are optional.',
    title: 'Personal Details',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { level: 1 })
    expect(title).toHaveTextContent('Personal Details')
    expect(canvas.getByText(/This section allows you to update/)).toBeInTheDocument()
  },
}

/**
 * Section with title, description, and code
 */
export const WithCode: Story = {
  args: {
    code: `{
  "id": "user_123",
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2024-01-15T10:30:00Z"
}`,
    description: 'Here is an example of the API response format:',
    title: 'API Response Example',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { level: 1 })
    expect(title).toHaveTextContent('API Response Example')
    expect(canvas.getByText(/Here is an example/)).toBeInTheDocument()
    expect(canvas.getByText(/user_123/)).toBeInTheDocument()
  },
}

/**
 * Section with title and code, no description
 */
export const CodeOnly: Story = {
  args: {
    code: `SELECT * FROM users
WHERE status = 'active'
  AND created_at > NOW() - INTERVAL '30 days'
ORDER BY created_at DESC`,
    title: 'SQL Query',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const title = canvas.getByRole('heading', { level: 1 })
    expect(title).toHaveTextContent('SQL Query')
    expect(canvas.getByText(/SELECT/)).toBeInTheDocument()
  },
}

/**
 * Long description with formatted text
 */
export const LongDescription: Story = {
  args: {
    description: 'By using this service, you agree to our Terms of Service and Privacy Policy. We are committed to protecting your data and ensuring a safe user experience. Please read our full terms before proceeding with your registration. If you have any questions, contact our support team.',
    title: 'Terms and Conditions',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText(/By using this service/)).toBeInTheDocument()
    expect(canvas.getByText(/contact our support team/)).toBeInTheDocument()
  },
}

/**
 * Section with multiline code block
 */
export const MultilineCode: Story = {
  args: {
    code: `interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  dateOfBirth?: Date
  phoneNumber?: string
  address?: {
    street: string
    city: string
    country: string
    zipCode: string
  }
  preferences?: {
    newsletter: boolean
    notifications: boolean
    darkMode: boolean
  }
}`,
    description: 'Type definition for user profile data:',
    subtitle: 'User Profile Interface',
    title: 'TypeScript Type Definition',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('TypeScript Type Definition')
    expect(canvas.getByRole('heading', { level: 2 })).toHaveTextContent('User Profile Interface')
    expect(canvas.getByText(/interface UserProfile/)).toBeInTheDocument()
  },
}

/**
 * Multiple sections stacked (demonstrates reusability)
 */
export const MultipleSections: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText(/Step 1: Prepare Your Data/)).toBeInTheDocument()
    expect(canvas.getByText(/Step 2: Upload File/)).toBeInTheDocument()
    expect(canvas.getByText(/Step 3: Verify Results/)).toBeInTheDocument()
    expect(canvas.getByText(/POST \/api\/upload/)).toBeInTheDocument()
  },
  render: () => (
    <div className="grid gap-6 w-lg">
      <FormFieldSection description="Ensure your data is in the correct format before uploading. Check our documentation for supported formats." line title="Step 1: Prepare Your Data" />
      <FormFieldSection code="POST /api/upload\nContent-Type: multipart/form-data" description="Select a file from your computer and upload it to our system." line title="Step 2: Upload File" />
      <FormFieldSection description="Review the uploaded data and confirm that everything looks correct before finalizing." title="Step 3: Verify Results" />
    </div>
  ),
}

/**
 * Section with error information
 */
export const ErrorInformation: Story = {
  args: {
    code: `Error: Invalid email format
  Expected: user@example.com
  Received: user@example

Error: Phone number too short
  Expected: 10+ digits
  Received: 5 digits`,
    description: 'The following validation errors occurred:',
    subtitle: 'Input Validation Failed',
    title: 'Validation Error',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText(/Validation Error/)).toBeInTheDocument()
    expect(canvas.getByText(/Invalid email format/)).toBeInTheDocument()
  },
}

/**
 * Section with JSON data
 */
export const JsonData: Story = {
  args: {
    code: `{
  "theme": "dark",
  "language": "en",
  "timezone": "UTC-5",
  "emailNotifications": true,
  "privacy": {
    "profileVisible": "friends",
    "shareAnalytics": false
  }
}`,
    description: 'Current user configuration settings:',
    subtitle: 'Settings',
    title: 'User Configuration',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByRole('heading', { level: 1 })).toHaveTextContent('User Configuration')
    expect(canvas.getByText(/"theme": "dark"/)).toBeInTheDocument()
  },
}

/**
 * Section with line separator
 */
export const WithLine: Story = {
  args: {
    description: 'Please read the following information carefully.',
    line: true,
    title: 'Important Notice',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    expect(canvas.getByText(/Important Notice/)).toBeInTheDocument()
    expect(canvas.getByText(/Please read/)).toBeInTheDocument()
  },
}

/**
 * Subtitle only
 */
export const SubtitleOnly: Story = {
  args: {
    subtitle: 'This is a subtitle without a title',
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const heading = canvas.getByRole('heading', { level: 2 })
    expect(heading).toHaveTextContent('This is a subtitle without a title')
  },
}
