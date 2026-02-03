import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

/**
 * Pagination with page navigation, next and previous links.
 */
const meta = {
  argTypes: {},
  component: Pagination,
  parameters: {
    layout: "centered",
  },
  render: args => (
    <Pagination {...args}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious href="#" />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink href="#">3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationNext href="#" />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
  tags: ["autodocs"],
  title: "Commons/Atoms/Pagination",
} satisfies Meta<typeof Pagination>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the pagination.
 */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Previous / Next links (Radix-based: sr-only text "Previous" / "Next")
    const previousLink = canvas.getByRole("link", { name: /previous/i });
    const nextLink = canvas.getByRole("link", { name: /next/i });

    expect(previousLink).toBeInTheDocument();
    expect(nextLink).toBeInTheDocument();
    expect(previousLink).toHaveAttribute("href", "#");
    expect(nextLink).toHaveAttribute("href", "#");

    // Page number links
    const page1 = canvas.getByRole("link", { name: "1" });
    const page2 = canvas.getByRole("link", { name: "2" });
    const page3 = canvas.getByRole("link", { name: "3" });

    expect(page1).toBeInTheDocument();
    expect(page2).toBeInTheDocument();
    expect(page3).toBeInTheDocument();

    expect(page1).toHaveAttribute("href", "#");
    expect(page2).toHaveAttribute("href", "#");
    expect(page3).toHaveAttribute("href", "#");
  },
};
