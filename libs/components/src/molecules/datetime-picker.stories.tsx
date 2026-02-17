import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { DatetimePicker } from "./datetime-picker";

const meta = {
  component: DatetimePicker,
  tags: ["autodocs"],
  title: "Commons/Molecules/DatetimePicker",
  decorators: [
    Story => (
      <div className="w-62.5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof DatetimePicker>;

export default meta;

type Story = StoryObj<typeof DatetimePicker>;

export const Default: Story = {
  render: () => <DatetimePicker name="date" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByPlaceholderText("DD/MM/YYYY");

    await expect(dateInput).toBeInTheDocument();
    await userEvent.type(dateInput, "29012026");
    await expect(dateInput).toHaveValue("29/01/2026");
  },
};

export const DateOnly: Story = {
  render: () => <DatetimePicker name="dateOnly" time={false} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByPlaceholderText("DD/MM/YYYY");
    const timeInput = canvas.queryByPlaceholderText("--:--");

    await expect(dateInput).toBeInTheDocument();
    await expect(timeInput).not.toBeInTheDocument();
  },
};

export const DateAndTime: Story = {
  render: () => <DatetimePicker name="datetime" time={true} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByPlaceholderText("DD/MM/YYYY");
    const timeInput = canvas.getByPlaceholderText("--:--");

    await userEvent.type(dateInput, "29012026");
    await userEvent.type(timeInput, "1430");

    await expect(dateInput).toHaveValue("29/01/2026");
    await expect(timeInput).toHaveValue("14:30");
  },
};

export const Readonly: Story = {
  render: () => <DatetimePicker name="readonlyDate" readonly defaultValue={new Date(2026, 0, 15, 14, 30)} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByPlaceholderText("DD/MM/YYYY");
    const calendarButton = canvas.getByLabelText("Select date");

    await expect(dateInput).toBeDisabled();
    await expect(calendarButton).toBeDisabled();
    await expect(dateInput).toHaveValue("15/01/2026");
  },
};

export const WithSubmit: Story = {
  render: () => {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();
    const [submittedDate, setSubmittedDate] = useState<string>("");

    function handleSubmit(event: React.ChangeEvent) {
      event.preventDefault();
      if (selectedDate) {
        setSubmittedDate(selectedDate.toISOString());
      } else {
        setSubmittedDate("No date selected");
      }
    }

    return (
      <div className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <DatetimePicker name="submitDate" onChange={setSelectedDate} />
          <button type="submit" className="rounded bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">
            Submit
          </button>
        </form>
        {submittedDate && (
          <div className="rounded border p-4" data-testid="submitted-result">
            <strong>Submitted:</strong> {submittedDate}
          </div>
        )}
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByPlaceholderText("DD/MM/YYYY");
    const timeInput = canvas.getByPlaceholderText("--:--");

    await userEvent.type(dateInput, "15032026");
    await userEvent.type(timeInput, "0930");

    await expect(dateInput).toHaveValue("15/03/2026");
    await expect(timeInput).toHaveValue("09:30");

    const submitButton = canvas.getByRole("button", { name: "Submit" });
    await userEvent.click(submitButton);

    const result = await canvas.findByTestId("submitted-result");
    await expect(result).toBeInTheDocument();
    await expect(result).toHaveTextContent(/2026-03-15T\d{2}:30:00\.\d{3}Z/);
  },
};

export const ClearButton: Story = {
  render: () => <DatetimePicker name="clearableDate" />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dateInput = canvas.getByPlaceholderText("DD/MM/YYYY");

    await userEvent.type(dateInput, "29012026");
    await expect(dateInput).toHaveValue("29/01/2026");

    const clearButton = canvas.getByLabelText("Clear date");
    await userEvent.click(clearButton);

    await expect(dateInput).toHaveValue("");
  },
};
