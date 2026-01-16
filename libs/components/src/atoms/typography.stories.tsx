import type { Meta, StoryObj } from "@storybook/react-vite";
import { Paragraph, Title } from "./typography";

const meta = {
  component: Title,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/Typography",
} satisfies Meta<typeof Title>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Showcase: Story = {
  args: {
    children: "Showcase",
  },
  render: () => (
    <div className="space-y-8">
      <hr />

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Level 1 Headings</p>
        <Title level={1} variant="default">
          Default Heading
        </Title>
        <Title level={1} variant="primary">
          Primary Heading
        </Title>
        <Title level={1} variant="muted">
          Muted Heading
        </Title>
        <Title level={1} variant="secondary">
          Secondary Heading
        </Title>
      </div>

      <hr />

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Level 2 Headings</p>
        <Title level={2} variant="default">
          Default Heading
        </Title>
        <Title level={2} variant="primary">
          Primary Heading
        </Title>
        <Title level={2} variant="muted">
          Muted Heading
        </Title>
        <Title level={2} variant="secondary">
          Secondary Heading
        </Title>
      </div>

      <hr />

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Level 3 Headings</p>
        <Title level={3} variant="default">
          Default Heading
        </Title>
        <Title level={3} variant="primary">
          Primary Heading
        </Title>
        <Title level={3} variant="muted">
          Muted Heading
        </Title>
        <Title level={3} variant="secondary">
          Secondary Heading
        </Title>
      </div>

      <hr />

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Custom className</p>
        <Title className="italic underline" level={2} variant="primary">
          Custom Styled Heading
        </Title>
      </div>

      <hr />

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">Paragraphs</p>
        <Paragraph variant="default">This is a default paragraph with some sample text to demonstrate the typography styling. It has relaxed leading for better readability.</Paragraph>
        <Paragraph variant="primary">This is a primary paragraph with some sample text to demonstrate the typography styling.</Paragraph>
        <Paragraph variant="muted">This is a muted paragraph with some sample text to demonstrate the typography styling.</Paragraph>
        <Paragraph variant="secondary">This is a secondary paragraph with some sample text to demonstrate the typography styling.</Paragraph>
      </div>
    </div>
  ),
};
