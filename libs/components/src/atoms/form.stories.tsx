import { zodResolver } from "@hookform/resolvers/zod";
import { Logger } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useForm } from "react-hook-form";
import { expect, userEvent, within } from "storybook/test";
import { z } from "zod";
import { Button } from "./button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "./form";
import { Textarea } from "./textarea";

const minChars = 3;

const contactFormSchema = z.object({
  message: z.string().min(minChars),
  other: z
    .object({
      primary: z.string(),
      secondary: z.string(),
    })
    .optional(),
  user: z.object({
    firstName: z.string().min(minChars),
    lastName: z.string().min(minChars),
  }),
});

type ContactForm = z.infer<typeof contactFormSchema>;

const logger = new Logger();

function onSubmit(values: ContactForm) {
  logger.info("onSubmit", values);
}

const meta = {
  component: Form,
  parameters: {
    layout: "centered",
  },
  render: () => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const form = useForm<ContactForm>({
      defaultValues: {
        user: {
          firstName: "",
          lastName: "",
        },
      },
      resolver: zodResolver(contactFormSchema),
    });

    return (
      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Message</FormLabel>
                <FormControl>
                  <Textarea placeholder="Type your message here." {...field} />
                </FormControl>
                <FormMessage name={field.name} />
              </FormItem>
            )}
          />
          <Button name="submit" type="submit">
            Submit
          </Button>
        </form>
      </Form>
    );
  },
  tags: ["autodocs"],
  title: "Commons/Atoms/Form",
} satisfies Meta<typeof Form>;

export default meta;

type Story = StoryObj<typeof meta>;

// @ts-expect-error type issue
export const Simple: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    const messageField = canvas.getByTestId("message");
    const submitButton = canvas.getByTestId("submit");

    const errorInvalidMessagePattern = /invalid input/i;
    const errorShortMessagePattern = /too small/i;

    // Initially there should be no validation error
    expect(canvas.queryByText(errorInvalidMessagePattern)).toBeNull();

    // Submit with empty message -> should show an error
    await userEvent.click(submitButton, { delay: 100 });
    expect(canvas.getByText(errorInvalidMessagePattern)).toBeVisible();

    // Type a too short message -> still error after submit
    await userEvent.clear(messageField);
    await userEvent.type(messageField, "hi", { delay: 50 }); // length 2 < minChars
    await userEvent.click(submitButton, { delay: 50 });
    expect(canvas.getByText(errorShortMessagePattern)).toBeVisible();

    // Type a valid message -> error should disappear
    await userEvent.clear(messageField);
    await userEvent.type(messageField, "hello world", { delay: 50 }); // length >= minChars
    await userEvent.click(submitButton, { delay: 50 });

    // Error should no longer be in the document
    expect(canvas.queryByText(errorInvalidMessagePattern)).toBeNull();
    expect(canvas.queryByText(errorShortMessagePattern)).toBeNull();
  },
};
