/** biome-ignore-all lint/style/useNamingConvention: it's ok here */
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { SelectLong } from "./select-long";

type BasicOptions = { label: string; value: string | { name: string } };
type CodeVersionOptions = { Code: string; Version: string; label: string };

const shortOptions: BasicOptions[] = [
  { label: "Toto", value: { name: "toto" } },
  { label: "Fred", value: "fred" },
  { label: "Miomio", value: "miomio" },
  { label: "Gaugau", value: "gaugau" },
  { label: "Thim", value: "thim" },
  { label: "Nico", value: "microcks" },
  { label: "Rominu", value: "rominu" },
];

const longOptions: BasicOptions[] = [
  ...shortOptions,
  { label: "Adela", value: "adela" },
  { label: "Alexis", value: "alexis" },
  { label: "Caro", value: "caro" },
  { label: "Georgian", value: "georgian" },
  { label: "Joffrey", value: "joffrey" },
  { label: "Casper the ghost", value: "casper the ghost" },
];

const codeVersionOptions: CodeVersionOptions[] = [
  { Code: "X123", Version: "1.0", label: "Alpha" },
  { Code: "Y234", Version: "2.0", label: "Beta" },
];

function WithState<Option, Value = string>({
  options,
  getValue,
  getLabel,
  onChange,
  ...props
}: React.ComponentProps<typeof SelectLong<Option, Value>>) {
  const [selectedString, setSelectedString] = useState<string | undefined>(undefined);

  return (
    <SelectLong
      {...props}
      options={options}
      getLabel={getLabel}
      getValue={getValue}
      value={selectedString as (string & Value) | undefined}
      onChange={(value, option) => {
        setSelectedString(option !== null ? String(getValue(option as Option)) : undefined);
        // call story's onChange (for assertion)
        onChange?.(value, option);
      }}
    />
  );
}

const meta: Meta<typeof SelectLong> = {
  title: "Commons/Atoms/SelectLong",
  component: SelectLong,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  args: { onChange: fn() },
} satisfies Meta<typeof SelectLong>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: args => (
    <WithState
      {...args}
      className="w-96"
      name="select"
      placeholder="Select a user"
      options={shortOptions}
      getLabel={opt => opt.label}
      getValue={opt => (typeof opt.value === "string" ? opt.value : JSON.stringify(opt.value))}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvasBody = within(canvasElement.ownerDocument.body);
    const select = await canvasBody.findByTestId("select-trigger-select");

    await step("open and select item", async () => {
      await userEvent.click(select);
      expect(canvasBody.queryByTestId("select-search-input")).toBeNull();
      const options = canvasBody.getAllByRole("option");
      await userEvent.click(options[1]);
      expect(select).toHaveTextContent("Fred");
    });

    await step("verify the selected option", async () => {
      await userEvent.click(select);
      const options = canvasBody.getAllByRole("option");
      expect(options[1]).toHaveAttribute("data-state", "checked");
    });
  },
};

export const Long: Story = {
  render: args => (
    <WithState
      {...args}
      name="select"
      className="w-96"
      placeholder="Select a user"
      options={longOptions}
      getLabel={opt => opt.label}
      getValue={opt => (typeof opt.value === "string" ? opt.value : JSON.stringify(opt.value))}
    />
  ),
  play: async ({ canvasElement, step }) => {
    const canvasBody = within(canvasElement.ownerDocument.body);
    const select = await canvasBody.findByTestId("select-trigger-select");

    await step("open and search item and select it", async () => {
      await userEvent.click(select);
      const input = await canvasBody.findByTestId("input-text-search-select");
      await userEvent.type(input, "aspe");
      const options = canvasBody.getAllByRole("option");
      expect(options).toHaveLength(1);
      await userEvent.click(options[0]);
    });

    await step("verify the selected option", async () => {
      await userEvent.click(select);
      const options = canvasBody.getAllByRole("option");
      expect(options[12]).toHaveAttribute("data-state", "checked");
    });
  },
};

export const OnChangeTest: Story = {
  render: args => (
    <WithState
      {...args}
      className="w-96"
      name="select-onchange"
      placeholder="Select a user"
      options={shortOptions}
      getLabel={opt => opt.label}
      getValue={opt => (typeof opt.value === "string" ? opt.value : JSON.stringify(opt.value))}
    />
  ),
  play: async ({ canvasElement, step, args }) => {
    const onChangeSpy = args.onChange;

    const canvasBody = within(canvasElement.ownerDocument.body);
    const select = await canvasBody.findByTestId("select-trigger-select-onchange");

    await step("open and select string item", async () => {
      await userEvent.click(select);
      const options = canvasBody.getAllByRole("option");
      await userEvent.click(options[1]);
      expect(select).toHaveTextContent("Fred");
      expect(onChangeSpy).toHaveBeenCalled();
      expect(onChangeSpy).toHaveBeenCalledWith("fred", expect.objectContaining({ label: "Fred" }));
    });

    await step("open and select object item", async () => {
      await userEvent.click(select);
      const options = canvasBody.getAllByRole("option");
      await userEvent.click(options[0]); // "Toto"
      expect(select).toHaveTextContent("Toto");
      expect(onChangeSpy).toHaveBeenCalledWith('{"name":"toto"}', expect.objectContaining({ label: "Toto" }));
    });
  },
};

export const CodeVersion: Story = {
  render: args => (
    <WithState
      {...args}
      className="w-96"
      name="select-code"
      placeholder="Select a code & version"
      options={codeVersionOptions}
      getLabel={opt => opt.label}
      getValue={opt => `${opt.Code}`}
    />
  ),
  play: async ({ canvasElement, step, args }) => {
    const onChangeSpy = args.onChange;
    const canvasBody = within(canvasElement.ownerDocument.body);
    const select = await canvasBody.findByTestId("select-trigger-select-code");

    await step("open, search and select unique item", async () => {
      await userEvent.click(select);
      const options = canvasBody.getAllByRole("option");
      expect(options).toHaveLength(2);
      await userEvent.click(options[0]);
      expect(select).toHaveTextContent("Alpha");
      expect(onChangeSpy).toHaveBeenCalledWith(
        "X123",
        expect.objectContaining({ Code: "X123", Version: "1.0", label: "Alpha" }),
      );
    });
  },
};
