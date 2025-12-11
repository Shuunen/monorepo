import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, userEvent, within } from "storybook/test";
import { Slider } from "./slider";

/**
 * An input where the user selects a value from within a given range.
 */
const meta = {
  args: {
    defaultValue: [33],
    max: 100,
    step: 1,
  },
  argTypes: {},
  component: Slider,
  tags: ["autodocs"],
  title: "Commons/Atoms/Slider",
} satisfies Meta<typeof Slider>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the slider.
 */
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Radix-based slider thumb has role="slider"
    const slider = canvas.getByRole("slider");

    expect(slider).toBeInTheDocument();

    const initialValue = Number(slider.getAttribute("aria-valuenow"));
    expect(Number.isNaN(initialValue)).toBe(false);

    // Focus the slider and increase the value with ArrowRight
    slider.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");

    const increasedValue = Number(slider.getAttribute("aria-valuenow"));
    expect(increasedValue).toBe(initialValue + 2);

    // Decrease the value with ArrowLeft
    await userEvent.keyboard("{ArrowLeft}");
    const decreasedValue = Number(slider.getAttribute("aria-valuenow"));
    expect(decreasedValue).toBe(increasedValue - 1);
  },
};

/**
 * Use the `inverted` prop to have the slider fill from right to left.
 */
export const Inverted: Story = {
  args: {
    inverted: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const slider = canvas.getByRole("slider");

    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuemax", "100");

    const initialValue = Number(slider.getAttribute("aria-valuenow"));
    expect(Number.isNaN(initialValue)).toBe(false);

    // Interaction should still work even when inverted
    slider.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");

    const newValue = Number(slider.getAttribute("aria-valuenow"));
    expect(newValue).not.toBe(initialValue);
  },
};

/**
 * Use the `disabled` prop to disable the slider.
 */
export const Disabled: Story = {
  args: {
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const slider = canvas.getByRole("slider");

    expect(slider).toBeInTheDocument();
    expect(slider).toHaveAttribute("aria-valuemax", "100");

    const initialValue = Number(slider.getAttribute("aria-valuenow"));
    expect(Number.isNaN(initialValue)).toBe(false);

    slider.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}{ArrowRight}");

    const newValue = Number(slider.getAttribute("aria-valuenow"));
    expect(newValue).toBe(initialValue);
  },
};
