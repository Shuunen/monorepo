import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import { SelectLong } from "./select-long";

type BasicOptions = { label: string; value: string | { name: string } };
// biome-ignore lint/style/useNamingConvention: can't rename this
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
  // biome-ignore lint/style/useNamingConvention: can't rename this
  { Code: "X123", label: "Alpha", Version: "1.0" },
  // biome-ignore lint/style/useNamingConvention: can't rename this
  { Code: "Y234", label: "Beta", Version: "2.0" },
];

function WithState<Option, Value = string>({ options, getValue, getLabel, onChange, ...props }: React.ComponentProps<typeof SelectLong<Option, Value>>) {
  const [selectedString, setSelectedString] = useState<string | undefined>(undefined);

  return (
    <SelectLong
      {...props}
      getLabel={getLabel}
      getValue={getValue}
      onChange={(value, option) => {
        // @ts-expect-error type mismatch
        setSelectedString(option !== null ? String(getValue(option)) : undefined);
        // call story's onChange (for assertion)
        onChange?.(value, option);
      }}
      options={options}
      value={selectedString as (string & Value) | undefined}
    />
  );
}

const meta: Meta<typeof SelectLong> = {
  args: { onChange: fn() },
  component: SelectLong,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/SelectLong",
} satisfies Meta<typeof SelectLong>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
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
  render: args => <WithState {...args} className="w-96" getLabel={opt => opt.label} getValue={opt => (typeof opt.value === "string" ? opt.value : JSON.stringify(opt.value))} name="select" options={shortOptions} placeholder="Select a user" />,
};

export const Long: Story = {
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
  render: args => <WithState {...args} className="w-96" getLabel={opt => opt.label} getValue={opt => (typeof opt.value === "string" ? opt.value : JSON.stringify(opt.value))} name="select" options={longOptions} placeholder="Select a user" />,
};

export const OnChangeTest: Story = {
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
  render: args => <WithState {...args} className="w-96" getLabel={opt => opt.label} getValue={opt => (typeof opt.value === "string" ? opt.value : JSON.stringify(opt.value))} name="select-onchange" options={shortOptions} placeholder="Select a user" />,
};

export const CodeVersion: Story = {
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
      // biome-ignore lint/style/useNamingConvention: can't rename this
      expect(onChangeSpy).toHaveBeenCalledWith("X123", expect.objectContaining({ Code: "X123", label: "Alpha", Version: "1.0" }));
    });
  },
  render: args => <WithState {...args} className="w-96" getLabel={opt => opt.label} getValue={opt => `${opt.Code}`} name="select-code" options={codeVersionOptions} placeholder="Select a code & version" />,
};
