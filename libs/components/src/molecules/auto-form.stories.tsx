import { isBrowserEnvironment, Logger, nbPercentMax, sleep, stringify } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactNode, useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";
import { z } from "zod";
import { Paragraph } from "../atoms/typography";
import { AutoForm } from "./auto-form";
import type { AutoFormData, AutoFormProps, AutoFormSubmissionStepProps } from "./auto-form.types";
import { field, mockSubmit, section, step } from "./auto-form.utils";
import { DebugData } from "./debug-data";

// allow dev to see logs in the browser console when running storybook dev but not in headless tests
const logger = new Logger({ minimumLevel: isBrowserEnvironment() ? "3-info" : "5-warn" });

type ExtendedAutoFormProps = AutoFormProps & {
  mockSubmitMessage?: ReactNode;
  mockSubmitStatus?: AutoFormSubmissionStepProps["status"];
};

const meta = {
  component: AutoForm,
  parameters: {
    layout: "centered",
  },
  render: (args: ExtendedAutoFormProps) => {
    const [submittedData, setSubmittedData] = useState<AutoFormData>({});
    function onSubmit(data: AutoFormData) {
      setSubmittedData(data);
      const status = args.mockSubmitStatus ?? "success";
      const message = args.mockSubmitMessage ?? <Paragraph>Form submitted successfully!</Paragraph>;
      return mockSubmit(status, message);
    }
    return (
      <div className="grid gap-4 mt-6">
        <AutoForm {...args} logger={logger} onSubmit={onSubmit} />
        <DebugData data={submittedData} isGhost title="Submitted data" />
      </div>
    );
  },
  tags: ["autodocs"],
  title: "Commons/Molecules/AutoForm",
} satisfies Meta<ExtendedAutoFormProps>;

export default meta;

type Story = StoryObj<typeof meta>;

const basicSchema = z.object({
  email: field(z.email("Invalid email address"), {
    label: "Email Address",
    placeholder: "We'll never share your email",
  }),
  name: field(z.string().min(2, "Name is required"), {
    label: "Full Name",
    placeholder: "Enter your legal name",
  }),
});

/**
 * Single step form with basic fields
 */
export const Basic: Story = {
  args: {
    schemas: [basicSchema],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    const submitButton = canvas.getByRole("button", { name: "Submit" });
    const emailInput = canvas.getByTestId("input-text-email");
    await userEvent.type(emailInput, "example-email@email.com");
    const nameInput = canvas.getByTestId("input-text-name");
    await userEvent.type(nameInput, "John Doe");
    await userEvent.click(submitButton);
    await expect(submittedData).toContainHTML(stringify({ email: "example-email@email.com", name: "John Doe" }, true));
  },
};

const step1Schema = z.object({
  email: field(z.email("Invalid email address"), {
    label: "Email Address",
    placeholder: "We'll never share your email",
  }),
  name: field(z.string().min(2, "Name is required"), {
    label: "Full Name",
    placeholder: "Enter your legal name",
  }),
});

const step2Schema = z.object({
  age: field(z.number().min(0).max(120).optional(), {
    label: "Age",
    placeholder: "Enter your age",
  }),
  subscribe: field(z.boolean(), {
    label: "Subscribe to newsletter",
    placeholder: "Check to subscribe",
  }),
});

const step3Schema = z.object({
  address: field(z.string().min(5, "Address is required"), {
    label: "Street Address",
    placeholder: "Enter your street address",
  }),
  city: field(z.string().min(2, "City is required"), {
    label: "City",
    placeholder: "Enter your city",
  }),
});

/**
 * 3 steps form with basic fields.
 * Tests navigation between steps (Next button bypasses validation).
 */
export const MultiStep: Story = {
  args: {
    schemas: [step1Schema, step2Schema, step3Schema],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("cannot reach step 2 via next button if step 1 invalid", async () => {
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
      const errorsElements = await canvas.findAllByRole("alert");
      const errors = Array.from(errorsElements).map(el => el.textContent);
      expect(errors).toStrictEqual(["Invalid email address", "Invalid input: expected string, received undefined"]);
    });
    await step("navigate to step 2 without filling step 1 (validation bypassed)", async () => {
      // Click Next without filling any fields - should work
      const nextButton = canvas.getByRole("button", { name: "Step 2" });
      await userEvent.click(nextButton);
      // We should be on step 2 now
      const ageInput = canvas.getByTestId("input-number-age");
      expect(ageInput).toBeInTheDocument();
    });
    await step("navigate to step 3 without filling step 2 (validation bypassed)", async () => {
      // Click Next without filling step 2 fields - should work
      const nextButton = canvas.getByRole("button", { name: "Step 3" });
      await userEvent.click(nextButton);
      // We should be on step 3 now - verify all fields are present
      const addressInput = canvas.getByTestId("input-text-address");
      expect(addressInput).toBeInTheDocument();
      const cityInput = canvas.getByTestId("input-text-city");
      expect(cityInput).toBeInTheDocument();
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toBeEnabled();
    });
    await step("go back to step 1 and fill fields", async () => {
      const step1Button = canvas.getByRole("button", { name: "Step 1" });
      await userEvent.click(step1Button);
      const nameInput = canvas.getByTestId("input-text-name");
      await userEvent.type(nameInput, "John Doe");
      const emailInput = canvas.getByTestId("input-text-email");
      await userEvent.type(emailInput, "john.doe@example.com");
    });
    await step("submit button still disabled - step 2 & 3 not filled", async () => {
      const step3Button = canvas.getByRole("button", { name: "Step 3" });
      await userEvent.click(step3Button);
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeEnabled();
    });
    await step("step 2 - fill fields", async () => {
      const stepBackButton = canvas.getByRole("button", { name: "Step 2" });
      await userEvent.click(stepBackButton);
      const ageInput = canvas.getByTestId("input-number-age");
      await userEvent.type(ageInput, "30");
      const subscribeCheckbox = canvas.getByTestId("switch-subscribe");
      await userEvent.click(subscribeCheckbox);
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    step("submit button still disabled - step 3 not filled", () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeEnabled();
    });
    await step("step 3 - fill fields and submit", async () => {
      const addressInput = canvas.getByTestId("input-text-address");
      await userEvent.type(addressInput, "123 Main St");
      const cityInput = canvas.getByTestId("input-text-city");
      await userEvent.type(cityInput, "Metropolis");
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeEnabled();
      await userEvent.click(submitButton);
    });
    step("verify submitted data", () => {
      // biome-ignore assist/source/useSortedKeys: should not sort keys here
      const expectedData = {
        email: "john.doe@example.com",
        name: "John Doe",
        age: 30,
        subscribe: true,
        address: "123 Main St",
        city: "Metropolis",
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};

/**
 * Multi-step form starting at the last step with showLastStep prop.
 * Useful when you want users to review or modify the final step without going through previous steps.
 */
export const ShowLastStep: Story = {
  args: {
    initialData: {
      email: "mary.jane@example.com",
      name: "Mary Jane",
    },
    schemas: [step1Schema, step2Schema, step3Schema],
    showLastStep: true,
  },
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const firstStepTrigger = canvas.queryByRole("button", { name: "Step 1" });
    expect(firstStepTrigger).toHaveAttribute("data-state", "editable");
  },
};

const optionalSectionStep1Schema = step(
  // biome-ignore assist/source/useSortedKeys: we need a specific key order here
  z.object({
    name: field(z.string().min(2, "Name is required"), {
      label: "Full Name",
      placeholder: "Enter your legal name",
    }),
    favouriteColor: field(z.enum(["red", "green", "blue"]).optional(), {
      label: "Favourite Color",
      placeholder: "Select your favourite color",
    }),
    isHacker: field(z.boolean(), {
      dependsOn: "favouriteColor=green", // this field depends on favouriteColor being "green"
      label: "Are you a hacker ?",
      placeholder: "Check if you are a hacker",
    }),
  }),
  {
    subtitle: "Basic personal information",
    title: "My infos",
  },
);

const optionalSectionStep2Schema = step(
  // biome-ignore assist/source/useSortedKeys: we need a specific key order here
  z.object({
    hasPet: field(z.boolean().optional(), {
      excluded: true, // avoid including this field in the final submitted data
      label: "Do you have a pet ?",
      placeholder: "Check if you have a pet",
    }),
    petName: field(z.string().min(2, "Pet name is required"), {
      dependsOn: "hasPet", // this field depends on the truthiness of "hasPet" field
      label: "Pet Name",
      placeholder: "Enter your pet name",
    }),
    petAge: field(z.number().min(0).max(50).optional(), {
      dependsOn: "hasPet", // this field depends on the truthiness of "hasPet" field
      label: "Pet Age",
      placeholder: "Enter your pet age if you know it",
    }),
  }),
  {
    subtitle: "Pet information and details",
    title: "My pet",
  },
);

/**
 * Schema with an optional section
 * If hasPet is checked/true, petName & petAge becomes visible and active (required if not optional)
 * If hasPet is unchecked/false, petName & petAge are hidden and inactive (not part of the final submitted data)
 * The hasPet field is not part of the final data submitted as it is marked with meta: { excluded: true }
 * In this example, the final submitted data will either be { name: "Romain" } or { name: "Romain", petName: "Kookie" }
 */
export const OptionalSection: Story = {
  args: {
    initialData: { age: 14, hasPet: false, name: "Sanders Doe" },
    schemas: [optionalSectionStep1Schema, optionalSectionStep2Schema],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const canvasBody = within(canvasElement.ownerDocument.body);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("fill name", async () => {
      const nameInput = canvas.getByTestId("input-text-name");
      await userEvent.type(nameInput, "Austin Dow");
    });
    await step("filling favouriteColor to see if hacker question appears", async () => {
      expect(canvas.queryByTestId("switch-is-hacker")).not.toBeInTheDocument();
      const favouriteColorTrigger = canvas.getByTestId("select-trigger-favourite-color");
      await userEvent.click(favouriteColorTrigger);
      const favouriteColorOptions = await canvasBody.findAllByRole("option");
      await userEvent.click(favouriteColorOptions[1]); // select "green"
      const isHackerCheckbox = await canvas.findByTestId("switch-is-hacker");
      expect(isHackerCheckbox).toBeVisible();
      await userEvent.click(isHackerCheckbox);
      await userEvent.click(favouriteColorTrigger);
      // oxlint-disable-next-line no-await-expression-member
      await userEvent.click((await canvasBody.findAllByRole("option"))[0]); // select "red"
      expect(canvas.queryByTestId("switch-is-hacker")).not.toBeInTheDocument();
    });
    await step("go to step 2", async () => {
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    await step("go back to step 1 to fix the name", async () => {
      const backButton = canvas.getByRole("button", { name: "Back" });
      await userEvent.click(backButton);
      const nameInput = canvas.getByTestId("input-text-name");
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, "Paul Doughy");
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    await step("succeed at submitting without pet", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      // biome-ignore assist/source/useSortedKeys: it's okay to not sort keys here
      const expectedData = {
        name: "Paul Doughy",
        favouriteColor: "red",
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
    await step("show pet name field", async () => {
      const hasPetCheckbox = canvas.getByTestId("switch-has-pet");
      await userEvent.click(hasPetCheckbox);
      const petNameInput = await canvas.findByTestId("input-text-pet-name");
      expect(petNameInput).toBeVisible();
    });
    step("submit button enabled even with missing fields", () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).toBeEnabled();
    });
    await step("fill pet name", async () => {
      const petNameInput = await canvas.findByTestId("input-text-pet-name");
      await userEvent.type(petNameInput, "Fido");
    });
    await step("submit button enabled and submit successfully", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      // biome-ignore assist/source/useSortedKeys: it's okay to not sort keys here
      const expectedData = {
        name: "Paul Doughy",
        favouriteColor: "red",
        petName: "Fido",
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
    await step("uncheck hasPet to hide pet fields", async () => {
      const hasPetCheckbox = canvas.getByTestId("switch-has-pet");
      await userEvent.click(hasPetCheckbox);
      expect(canvas.queryByTestId("input-text-pet-name")).not.toBeInTheDocument();
      expect(canvas.queryByTestId("input-number-pet-age")).not.toBeInTheDocument();
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    step("verify submitted data", () => {
      // biome-ignore assist/source/useSortedKeys: it's okay to not sort keys here
      expect(submittedData).toContainHTML(stringify({ name: "Paul Doughy", favouriteColor: "red" }, true));
    });
  },
};

const editableStep1Schema = step(
  // biome-ignore assist/source/useSortedKeys: we need a specific key order here
  z.object({
    myInfosSection: section({
      description: "You can fill these fields to tell us more about you",
      title: "My information",
    }),
    name: field(z.string().min(2, "Name is required"), {
      label: "Full Name",
      placeholder: "Enter your legal name",
    }),
    age: field(z.number().min(0).max(120), {
      label: "Age",
      placeholder: "Enter your age",
      state: "readonly",
    }),
    optionalSection: section({
      description: "You can fill these fields if you want to provide more info",
      title: "Optional information",
    }),
    nickname: field(z.string().optional(), {
      label: "Nickname",
      placeholder: "Enter your nickname if you have one",
    }),
  }),
  {
    subtitle: "Basic personal information",
    title: "My infos",
  },
);

const readonlyStep2Schema = step(
  // biome-ignore assist/source/useSortedKeys: we need a specific key order here
  z.object({
    petName: field(z.string().min(2, "Pet name is required"), {
      label: "Pet Name",
      placeholder: "Enter your pet name",
    }),
    petAge: field(z.number().min(0).max(50).optional(), {
      label: "Pet Age",
      placeholder: "Enter your pet age",
    }),
  }),
  {
    state: "readonly",
    subtitle: "Pet information and details",
    title: "My pet",
  },
);

const upcomingStep3Schema = step(
  z.object({
    address: field(z.string().min(5, "Address is required"), {
      label: "Street Address",
      placeholder: "Enter your street address",
    }),
    city: field(z.string().min(2, "City is required"), {
      label: "City",
      placeholder: "Enter your city",
    }),
  }),
  {
    state: "upcoming",
    subtitle: "Address information",
    title: "My address",
  },
);

/**
 * Story to test stepper icons in different states (editable, readonly, upcoming)
 */
export const StepperStates: Story = {
  args: {
    initialData: { age: 28, name: "Jane Doe", petName: "Fido" },
    schemas: [editableStep1Schema, readonlyStep2Schema, upcomingStep3Schema],
    useSummaryStep: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("fill step 1", async () => {
      const currentStepButton = canvas.getByTestId("button-step-my-infos");
      expect(currentStepButton).toHaveAttribute("data-state", "editable");
      expect(currentStepButton).toHaveAttribute("data-active", "true");
      const nameInput = canvas.getByTestId("input-text-name");
      expect(nameInput).toHaveValue("Jane Doe");
      await userEvent.type(nameInput, "-Rollin");
      await userEvent.tab();
      const ageInput = canvas.getByTestId("input-number-age");
      expect(ageInput).toHaveValue(28);
      expect(ageInput).toBeDisabled();
      expect(currentStepButton).toHaveAttribute("data-state", "editable");
      const secondStepButton = canvas.getByTestId("button-step-my-pet");
      expect(secondStepButton).toHaveAttribute("data-state", "readonly");
      expect(secondStepButton).toHaveAttribute("data-active", "false");
    });
    await step("verify step 2 readonly fields", async () => {
      const secondStepButton = canvas.getByRole("button", { name: "My pet Pet information and details" });
      expect(secondStepButton).toHaveAttribute("data-state", "readonly");
      await userEvent.click(secondStepButton);
      await sleep(100);
      expect(secondStepButton).toHaveAttribute("data-active", "true");
      const petNameInput = canvas.getByTestId("input-text-pet-name");
      expect(petNameInput).toBeInTheDocument();
      expect(petNameInput).toBeDisabled();
      expect(petNameInput).toHaveValue("Fido");
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify summary data", async () => {
      const secondStepButton = canvas.getByRole("button", { name: "My pet Pet information and details" });
      expect(secondStepButton).toHaveAttribute("data-active", "false");
      const summaryMyInfo = canvas.getByTestId("form-summary-my-information").textContent;
      expect(canvas.getByText("My information")).toBeInTheDocument();
      expect(summaryMyInfo).toContain("Full NameJane Doe-Rollin");
      expect(summaryMyInfo).toContain("Age28");
      const summaryOptionalInfo = canvas.getByTestId("form-summary-optional-information").textContent;
      expect(canvas.getByText("Optional information")).toBeInTheDocument();
      expect(summaryOptionalInfo).toContain("Nickname");
      expect(summaryOptionalInfo).not.toContain("Pet Name");
      expect(summaryOptionalInfo).not.toContain("Pet Age");
      expect(summaryOptionalInfo).not.toContain("Address");
      const proceedButton = canvas.getByRole("button", { name: "Proceed" });
      await userEvent.click(proceedButton);
    });
    await step("verify submitted data", () => {
      // biome-ignore assist/source/useSortedKeys: we need a specific key order here
      const expectedFormData = {
        name: "Jane Doe-Rollin",
        age: 28,
        petName: "Fido",
      };
      expect(submittedData).toContainHTML(stringify(expectedFormData, true));
    });
  },
};

/**
 * Key mapping with key, keyIn and keyOut properties
 */
export const KeyMapping: Story = {
  args: {
    initialData: {
      // biome-ignore lint/style/useNamingConvention: we use snake_case for testing purposes
      email_address: "james.doe@example.com",
      "userName-Input": "Jam Doe",
    },
    schemas: [
      z.object({
        userEmail: field(z.email("Invalid email address"), {
          key: "email_address", // Maps initialData.email_address to userEmail field and back to email_address in output
          label: "Email Address",
          placeholder: "We'll never share your email",
        }),
        userName: field(z.string().min(2, "Name is required"), {
          keyIn: "userName-Input", // Maps initialData.full_name to userName field
          keyOut: "user-name-output", // Maps userName field back to full_name in output
          label: "Full Name",
          placeholder: "Enter your legal name",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    step("verify initial data was mapped correctly", () => {
      const emailInput = canvas.getByTestId("input-text-user-email");
      expect(emailInput).toHaveValue("james.doe@example.com");
      const nameInput = canvas.getByTestId("input-text-user-name");
      expect(nameInput).toHaveValue("Jam Doe");
    });
    await step("submit and verify output uses mapped keys", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    step("verify submitted data", () => {
      const expectedData = {
        // biome-ignore lint/style/useNamingConvention: we use snake_case for testing purposes
        email_address: "james.doe@example.com",
        "user-name-output": "Jam Doe",
      };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};

/**
 * Nested key mapping with key, keyIn and keyOut properties
 */
export const NestedKeyMapping: Story = {
  args: {
    initialData: {
      user: {
        // biome-ignore lint/style/useNamingConvention: we use snake_case for testing purposes
        contact_info: {
          // biome-ignore lint/style/useNamingConvention: we use snake_case for testing purposes
          email_address: "jane.doe@example.com",
        },
        "personal-Info": {
          fullName: "Jane Doe",
        },
      },
    },
    schemas: [
      z.object({
        userEmail: field(z.email("Invalid email address"), {
          keyIn: "user.contact_info.email_address",
          keyOut: "userInfos.email",
          label: "Email Address",
          placeholder: "We'll never share your email",
        }),
        userName: field(z.string().min(2, "Name is required"), {
          keyIn: "user.personal-Info.fullName",
          keyOut: "userInfos.fullName",
          label: "Full Name",
          placeholder: "Enter your legal name",
        }),
      }),
    ],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    await step("verify initial data was mapped correctly", async () => {
      const emailInput = canvas.getByTestId("input-text-user-email");
      expect(emailInput).toHaveValue("jane.doe@example.com");
      const nameInput = canvas.getByTestId("input-text-user-name");
      expect(nameInput).toHaveValue("Jane Doe");
      await userEvent.click(emailInput);
      expect(submittedData).toContainHTML("{}");
    });
    await step("modify the fields", async () => {
      const emailInput = canvas.getByTestId("input-text-user-email");
      await userEvent.clear(emailInput);
      await userEvent.type(emailInput, "new.email@example.com");
      expect(emailInput).toHaveValue("new.email@example.com");
      const nameInput = canvas.getByTestId("input-text-user-name");
      await userEvent.clear(nameInput);
      await userEvent.type(nameInput, "John Smith");
      expect(nameInput).toHaveValue("John Smith");
    });
    await step("submit the form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      expect(submitButton).not.toBeDisabled();
      await userEvent.click(submitButton);
    });
    await step("verify submitted data uses nested output paths", async () => {
      const emailInput = canvas.getByTestId("input-text-user-email");
      await userEvent.click(emailInput);
      const expectedData = { userInfos: { email: "new.email@example.com", fullName: "John Smith" } };
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};

const step1SummarySchema = step(
  z.object({
    email: field(z.email("Invalid email address"), {
      label: "Email Address",
      placeholder: "We'll never share your email",
    }),
    name: field(z.string().min(2, "Name is required"), {
      label: "Full Name",
      placeholder: "Enter your legal name",
    }),
  }),
  {
    subtitle: "Basic personal details",
    title: "Personal Information",
  },
);

const step2SummarySchema = step(
  z.object({
    age: field(z.number().min(0).max(120).optional(), {
      label: "Age",
      placeholder: "Enter your age",
    }),
    subscribe: field(z.boolean(), {
      label: "Subscribe to newsletter",
      placeholder: "Check to subscribe",
    }),
  }),
  {
    subtitle: "Additional information about you",
    title: "Additional Details",
  },
);

/**
 * Multi-step form with summary step
 */
export const SummaryOnly: Story = {
  args: {
    initialData: {
      age: 28,
      email: "jane.doe@example.com",
      name: "Jane Doe",
      subscribe: true,
    },
    schemas: [step1SummarySchema, step2SummarySchema],
    useSummaryStep: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const submittedData = canvas.getByTestId("debug-data-submitted-data");
    // biome-ignore assist/source/useSortedKeys: we need a specific key order here
    const expectedData = {
      email: "jane.doe@example.com",
      name: "Jane Doe",
      age: 28,
      subscribe: true,
    };
    await step("navigate to last step", async () => {
      const step1Button = canvas.getByTestId("button-step-personal-information");
      expect(step1Button).toBeInTheDocument();
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    step("verify data before summary", () => {
      expect(submittedData).toContainHTML("{}");
    });
    await step("submit to reach summary step", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify summary step displays", () => {
      const summaryStep = canvas.getByTestId("auto-form-summary-step");
      expect(summaryStep).toBeInTheDocument();
      const summaryStepTitle = canvas.getByTestId("title-summary");
      expect(summaryStepTitle).toHaveTextContent("Summary");
      expect(canvas.getByText("Email Address")).toBeInTheDocument();
      expect(canvas.getByText("jane.doe@example.com")).toBeInTheDocument();
      expect(canvas.getByText("Full Name")).toBeInTheDocument();
      expect(canvas.getByText("Jane Doe")).toBeInTheDocument();
      expect(canvas.getByText("Age")).toBeInTheDocument();
      expect(canvas.getByText("28")).toBeInTheDocument();
      expect(canvas.getByText("Subscribe to newsletter")).toBeInTheDocument();
      expect(canvas.getByText("true")).toBeInTheDocument();
    });
    await step("verify data before submission", async () => {
      await sleep(nbPercentMax);
      expect(submittedData).toContainHTML("{}");
    });
    await step("submit from summary step", async () => {
      const proceedButton = canvas.getByRole("button", { name: "Proceed" });
      await userEvent.click(proceedButton);
      await sleep(nbPercentMax);
    });
    await step("verify submitted data", async () => {
      await sleep(nbPercentMax);
      expect(submittedData).toContainHTML(stringify(expectedData, true));
    });
  },
};

/**
 * Multi-step form with submission step (success scenario)
 */
export const SubmissionSuccess: Story = {
  args: {
    schemas: [step1SummarySchema, step2SummarySchema],
    useSubmissionStep: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("fill step 1 form fields", async () => {
      const emailInput = canvas.getByTestId("input-text-email");
      await userEvent.type(emailInput, "test@example.com");
      const nameInput = canvas.getByTestId("input-text-name");
      await userEvent.type(nameInput, "John Doe");
    });
    await step("navigate to step 2", async () => {
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    await step("fill step 2 form fields", async () => {
      const ageInput = canvas.getByTestId("input-number-age");
      await userEvent.type(ageInput, "30");
      const subscribeCheckbox = canvas.getByTestId("switch-subscribe");
      await userEvent.click(subscribeCheckbox);
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      await sleep(nbPercentMax);
      await sleep(nbPercentMax);
    });
    await step("verify submission step shows success", async () => {
      await waitFor(() => {
        const submissionStep = canvas.getByTestId("app-status-success");
        expect(submissionStep).toBeInTheDocument();
      });
    });
    await step("verify home button is displayed", () => {
      const homeButton = canvas.getByTestId("button-home");
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toHaveTextContent("Return to Homepage");
    });
  },
};

/**
 * Multi-step form with submission step (failure scenario)
 */
export const SubmissionError: Story = {
  args: {
    mockSubmitMessage: <Paragraph>Form submission failed!</Paragraph>,
    mockSubmitStatus: "error",
    schemas: [step1SummarySchema, step2SummarySchema],
    useSubmissionStep: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("fill step 1 form fields", async () => {
      const emailInput = canvas.getByTestId("input-text-email");
      await userEvent.type(emailInput, "test@example.com");
      const nameInput = canvas.getByTestId("input-text-name");
      await userEvent.type(nameInput, "John Doe");
    });
    await step("navigate to step 2", async () => {
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    await step("fill step 2 form fields", async () => {
      const ageInput = canvas.getByTestId("input-number-age");
      await userEvent.type(ageInput, "30");
      const subscribeCheckbox = canvas.getByTestId("switch-subscribe");
      await userEvent.click(subscribeCheckbox);
    });
    await step("submit form", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
      await sleep(nbPercentMax);
      await sleep(nbPercentMax);
    });
    await step("verify submission step shows error", async () => {
      await waitFor(() => {
        const submissionStep = canvas.getByTestId("app-status-error");
        expect(submissionStep).toBeInTheDocument();
      });
    });
  },
};

/**
 * Multi-step form with both summary and submission steps
 */
export const SummarySubmissionSuccess: Story = {
  args: {
    initialData: {
      age: 28,
      email: "jane.doe@example.com",
      name: "Jane Doe",
      subscribe: true,
    },
    schemas: [step1SummarySchema, step2SummarySchema],
    useSubmissionStep: true,
    useSummaryStep: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("navigate to last step", async () => {
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    await step("submit to reach summary step", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify summary step displays", () => {
      const summaryStep = canvas.getByTestId("auto-form-summary-step");
      expect(summaryStep).toBeInTheDocument();
    });
    await step("proceed to submission", async () => {
      const proceedButton = canvas.getByRole("button", { name: "Proceed" });
      await userEvent.click(proceedButton);
      await sleep(nbPercentMax);
      await sleep(nbPercentMax);
    });
    await step("verify submission step shows success", async () => {
      await waitFor(() => {
        const submissionStep = canvas.getByTestId("app-status-success");
        expect(submissionStep).toBeInTheDocument();
      });
    });
    await step("verify home button is displayed", () => {
      const homeButton = canvas.getByTestId("button-home");
      expect(homeButton).toBeInTheDocument();
      expect(homeButton).toHaveTextContent("Return to Homepage");
    });
  },
};

/**
 * Multi-step form with both summary and submission steps (failure scenario)
 */
export const SummarySubmissionError: Story = {
  args: {
    initialData: {
      age: 28,
      email: "jane.doe@example.com",
      name: "Jane Doe",
      subscribe: true,
    },
    mockSubmitMessage: <Paragraph>Form submission failed!</Paragraph>,
    mockSubmitStatus: "error",
    schemas: [step1SummarySchema, step2SummarySchema],
    useSubmissionStep: true,
    useSummaryStep: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("navigate to last step", async () => {
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    await step("submit to reach summary step", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify summary step displays", () => {
      const summaryStep = canvas.getByTestId("auto-form-summary-step");
      expect(summaryStep).toBeInTheDocument();
    });
    await step("proceed to submission", async () => {
      const proceedButton = canvas.getByRole("button", { name: "Proceed" });
      await userEvent.click(proceedButton);
      await sleep(nbPercentMax);
      await sleep(nbPercentMax);
    });
    await step("verify submission step shows error", async () => {
      await waitFor(() => {
        const submissionStep = canvas.getByTestId("app-status-error");
        expect(submissionStep).toBeInTheDocument();
      });
    });
  },
};

/**
 * Multi-step form with both summary and submission steps (warning scenario)
 */
export const SummarySubmissionWarning: Story = {
  args: {
    initialData: {
      age: 28,
      email: "jane.doe@example.com",
      name: "Jane Doe",
      subscribe: true,
    },
    mockSubmitMessage: <Paragraph>Form submission completed with warnings!</Paragraph>,
    mockSubmitStatus: "warning",
    schemas: [step1SummarySchema, step2SummarySchema],
    useSubmissionStep: true,
    useSummaryStep: true,
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("navigate to last step", async () => {
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    await step("submit to reach summary step", async () => {
      const submitButton = canvas.getByRole("button", { name: "Submit" });
      await userEvent.click(submitButton);
    });
    await step("verify summary step displays", () => {
      const summaryStep = canvas.getByTestId("auto-form-summary-step");
      expect(summaryStep).toBeInTheDocument();
    });
    await step("proceed to submission", async () => {
      const proceedButton = canvas.getByRole("button", { name: "Proceed" });
      await userEvent.click(proceedButton);
      await sleep(nbPercentMax);
      await sleep(nbPercentMax);
    });
    await step("verify submission step shows warning", async () => {
      await waitFor(() => {
        const submissionStep = canvas.getByTestId("app-status-warning");
        expect(submissionStep).toBeInTheDocument();
      });
    });
    // step('verify buttons are disabled on warning submission step', () => {
    //   const buttons = [canvas.getByTestId('step-personal-information'), canvas.getByTestId('step-additional-details')]
    //   for (const button of buttons) expect(button).toBeDisabled()
    // })
  },
};

/**
 * Multi-step form with cancel button
 * When onCancel is provided, a cancel button appears next to the submit button
 * Clicking cancel invokes the onCancel callback
 */
export const WithCancelButton: Story = {
  args: {
    schemas: [step1SummarySchema, step2SummarySchema],
  },
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await step("fill step 1 form fields", async () => {
      const emailInput = canvas.getByTestId("input-text-email");
      await userEvent.type(emailInput, "test@example.com");
      const nameInput = canvas.getByTestId("input-text-name");
      await userEvent.type(nameInput, "John Doe");
    });
    await step("navigate to step 2", async () => {
      const nextButton = canvas.getByRole("button", { name: "Next" });
      await userEvent.click(nextButton);
    });
    await step("verify cancel button is visible", () => {
      const cancelButton = canvas.getByRole("button", { name: "Cancel" });
      expect(cancelButton).toBeInTheDocument();
      expect(cancelButton).toHaveAttribute("data-testid", "button-step-cancel");
    });
    await step("click cancel button", async () => {
      const cancelButton = canvas.getByRole("button", { name: "Cancel" });
      await userEvent.click(cancelButton);
      await waitFor(() => {
        const cancelMessage = canvas.getByText("Form was cancelled by user");
        expect(cancelMessage).toBeInTheDocument();
      });
    });
  },
  render: (args: ExtendedAutoFormProps) => {
    type FormData = Record<string, unknown> | undefined;
    const [cancelClicked, setCancelClicked] = useState(false);
    const [submittedData, setSubmittedData] = useState<FormData>({});
    function onSubmit(data: FormData) {
      setSubmittedData(data);
      const status = args.mockSubmitStatus ?? "success";
      const message = args.mockSubmitMessage ?? <Paragraph>Form submitted successfully!</Paragraph>;
      return mockSubmit(status, message);
    }
    function onCancel() {
      logger.showInfo("Form cancelled");
      setCancelClicked(true);
    }
    return (
      <div className="grid gap-4 mt-6">
        {cancelClicked && <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-800">Form was cancelled by user</div>}
        <AutoForm {...args} logger={logger} onCancel={onCancel} onSubmit={onSubmit} />
        <DebugData data={submittedData} isGhost title="Submitted data" />
      </div>
    );
  },
};

/*
TODO, ordered by priority :
- Display a red error step if issue
- Display a green success step if valid
- Write a story where we feed the AutoForm a whole new schema after a variant change (for dynamic schemas)
- Allow overriding the mapping of auto-form-field.tsx
- Design with title and navigation on the top right with arrow icons
*/
