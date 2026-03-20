import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, within } from "storybook/test";
import { Button } from "./button";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta = {
  component: Card,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/Card",
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

// Shared mock to test the button click inside the card
const cardButtonClickMock = fn();

export const TextContent: Story = {
  args: {
    children: (
      <p className="px-6">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat aspernatur ea architecto, consectetur
        dignissimos minima magni sed illum odio assumenda, soluta iure incidunt repudiandae. Incidunt voluptas provident
        eius sequi illum.
      </p>
    ),
    name: "text-content",
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const card = canvas.getByTestId("card-text-content");
    expect(card).toBeInTheDocument();

    // Check that the text content is rendered inside the card
    const paragraph = canvas.getByText(
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat aspernatur ea architecto, consectetur dignissimos minima magni sed illum odio assumenda, soluta iure incidunt repudiandae. Incidunt voluptas provident eius sequi illum.",
    );
    expect(paragraph).toBeInTheDocument();
  },
};

export const Complete: Story = {
  args: {
    name: "complete",
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Check header, description, content, footer
    const card = canvas.getByTestId("card-complete");
    expect(card).toBeInTheDocument();
    const title = within(card).getByText("Card Title");
    const description = within(card).getByText("Card Description");
    const paragraph = within(card).getByText(
      "Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat aspernatur ea architecto, consectetur dignissimos minima magni sed illum odio assumenda, soluta iure incidunt repudiandae. Incidunt voluptas provident eius sequi illum.",
    );
    const footer = within(card).getByText("A nice footer");

    expect(title).toBeInTheDocument();
    expect(description).toBeInTheDocument();
    expect(paragraph).toBeInTheDocument();
    expect(footer).toBeInTheDocument();

    // Check the button exists and is clickable
    const button = within(card).getByTestId("button-card");
    expect(button).toBeInTheDocument();

    button.click();
    expect(cardButtonClickMock).toHaveBeenCalled();
  },
  render: () => (
    <Card name="complete">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
        <CardAction>
          <Button name="card" onClick={cardButtonClickMock}>
            Click me
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Placeat aspernatur ea architecto, consectetur
          dignissimos minima magni sed illum odio assumenda, soluta iure incidunt repudiandae. Incidunt voluptas
          provident eius sequi illum.
        </p>
      </CardContent>
      <CardFooter>A nice footer</CardFooter>
    </Card>
  ),
};
