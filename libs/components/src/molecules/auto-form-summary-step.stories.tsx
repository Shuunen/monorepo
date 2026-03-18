import { dateIso10 } from "@monorepo/utils";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { z } from "zod";
import { AutoFormSummaryStep } from "./auto-form-summary-step";
import { field, fields, forms, section, step } from "./auto-form.utils";

const meta = {
  component: AutoFormSummaryStep,
  parameters: {
    layout: "centered",
  },
  title: "Commons/Molecules/AutoFormSummaryStep",
} satisfies Meta<typeof AutoFormSummaryStep>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Simple: Story = {
  args: {
    formData: {
      address: "123 Main St, Anston, USA",
      age: 30,
      email: "john@example.com",
      name: "John Doe",
    },
    schemas: [
      step(
        z.object({
          address: field(z.string().min(1), {
            label: "Address label",
          }),
          age: field(z.number().min(0), {
            label: "Age label",
          }),
          email: field(z.email(), {
            label: "Email label",
          }),
          info: section({
            title: "Custom section title",
          }),
          name: field(z.string().min(1), {
            label: "Name label",
          }),
        }),
      ),
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const tableNoSection = canvas.getByTestId("form-summary-no-title");
    await expect(tableNoSection).toBeVisible();
    await expect(tableNoSection).toHaveTextContent(["Address label", "123 Main St, Anston, USA"].join(""));
    await expect(tableNoSection).toHaveTextContent(["Age label", "30"].join(""));
    await expect(tableNoSection).toHaveTextContent(["Email label", "john@example.com"].join(""));
    const sectionTitle = canvas.getByText("Custom section title");
    await expect(sectionTitle).toBeVisible();
    const tableWithSection = canvas.getByTestId("form-summary-custom-section-title");
    await expect(tableWithSection).toBeVisible();
    await expect(tableWithSection).toHaveTextContent(["Name label", "John Doe"].join(""));
  },
};

export const Empty: Story = {
  args: {
    formData: {},
    schemas: [],
  },
};

const summaryDate = new Date(2026, 2, 16);

const complexSchemas = [
  step(
    z.object({
      profileSection: section({
        title: "Profile",
      }),
      stringRenderText: field(z.string().min(1), {
        label: "String render text",
      }),
      stringRenderEmail: field(z.email(), {
        label: "String render email",
      }),
      stringRenderTextarea: field(z.string().min(1), {
        label: "String render textarea",
        render: "textarea",
      }),
      stringRenderPassword: field(z.string().min(1), {
        label: "String render password",
        render: "password",
      }),
      numberRenderNumber: field(z.number().min(0), {
        label: "Number render number",
      }),
      dateRenderDate: field(z.date(), {
        label: "Date render date",
      }),
      dateRenderDateWithCodec: field(z.date(), {
        label: "Date render date with codec",
        codec: z.codec(z.string(), z.date(), {
          decode: isoDateString => new Date(isoDateString),
          encode: date => `encoded:${dateIso10(date)}`,
        }),
      }),
      stringRenderDate: field(z.string(), {
        label: "String render date",
        render: "date",
      }),
      stringRenderTime: field(z.string(), {
        label: "String render time",
        render: "time",
      }),
      stringRenderDateTime: field(z.string(), {
        label: "String render date-time",
        render: "date-time",
      }),
      booleanRenderSwitch: field(z.boolean(), {
        label: "Boolean render switch",
      }),
      booleanRenderAccept: field(z.boolean(), {
        label: "Boolean render accept",
        render: "accept",
      }),
      booleanRenderCheckbox: field(z.boolean(), {
        label: "Boolean render checkbox",
        render: "checkbox",
      }),
      enumRenderSelect: field(z.enum(["fr", "jp"]), {
        label: "Enum render select",
        options: [
          { label: "France", value: "fr" },
          { label: "Japan", value: "jp" },
        ],
      }),
      enumRenderRadio: field(z.enum(["engineer", "manager"]), {
        label: "Enum render radio",
        options: [
          { label: "Engineer radio label", value: "engineer" },
          { label: "Manager radio label", value: "manager" },
        ],
        render: "radio",
      }),
      fileRenderUpload: field(z.file().optional(), {
        label: "File render upload",
      }),
      arrayRenderFieldListString: fields(
        field(z.string().optional(), {
          label: "Skill",
        }),
        {
          label: "Array render field-list string",
        },
      ),
      stringRenderTextHiddenInSummary: field(z.string().optional(), {
        label: "String render text hidden in summary",
        showInSummary: false,
      }),
      remoteSection: section({
        dependsOn: "booleanRenderSwitch",
        title: "Remote details",
      }),
      stringRenderTextDependsOnBooleanSwitch: field(z.string().optional(), {
        dependsOn: "booleanRenderSwitch",
        label: "String render text depends on boolean render switch",
      }),
      numberRenderNumberDependsOnBooleanSwitch: field(z.number().optional(), {
        dependsOn: "booleanRenderSwitch",
        label: "Number render number depends on boolean render switch",
      }),
      stringRenderTextDependsOnBooleanSwitchFalse: field(z.string().optional(), {
        dependsOn: "booleanRenderSwitch=false",
        label: "String render text depends on boolean render switch false",
      }),
      stringRenderTextIsVisible: field(z.string().optional(), {
        isVisible: data => data.enumRenderRadio === "engineer",
        label: "String render text is visible",
      }),
      stringRenderTextIsHidden: field(z.string().optional(), {
        isVisible: () => false,
        label: "String render text is hidden",
      }),
      hiddenSection: section({
        showInSummary: false,
        title: "Hidden section",
      }),
      stringRenderTextExcluded: field(z.string().optional(), {
        excluded: true,
        label: "String render text excluded",
      }),
    }),
    {
      title: data => `Employee ${data?.stringRenderText ?? "unknown"}`,
    },
  ),
  step(
    z.object({
      arrayRenderFormListObject: forms(
        z.object({
          stringRenderText: field(z.string().min(1), {
            label: "String render text",
          }),
          enumRenderSelect: field(z.enum(["lead", "backup"]), {
            label: "Enum render select",
            options: [
              { label: "Team lead", value: "lead" },
              { label: "Backup", value: "backup" },
            ],
          }),
          stringRenderEmail: field(z.email(), {
            label: "String render email",
          }),
          booleanRenderCheckbox: field(z.boolean(), {
            label: "Boolean render checkbox",
            render: "checkbox",
          }),
          stringRenderTextDependsOnBooleanRenderCheckbox: field(z.string().optional(), {
            dependsOn: "booleanRenderCheckbox",
            label: "String render text depends on boolean render checkbox",
          }),
          stringRenderTextAlsoHiddenInSummary: field(z.string().optional(), {
            label: "String render text also hidden in summary",
            showInSummary: false,
          }),
          stringRenderTextarea: field(z.string().optional(), {
            label: "String render textarea",
            render: "textarea",
          }),
        }),
        {
          identifier: data => `Member ${data?.stringRenderText ?? "unknown"}`,
          label: "Array render form-list object",
        },
      ),
      preferencesSection: section({
        title: "Preferences",
      }),
      arrayRenderFieldListStringFavourite: fields(
        field(z.string().optional(), {
          label: "Tool",
        }),
        {
          label: "Array render field-list string favourite",
        },
      ),
      fileRenderUploadHiddenInSummary: field(z.file().optional(), {
        label: "File render upload hidden in summary",
        showInSummary: false,
      }),
    }),
    {
      title: "Team setup",
    },
  ),
  step(
    z.object({
      stringRenderTextReadonly: field(z.string(), {
        label: "String render text readonly",
      }),
    }),
    {
      state: "readonly",
      title: "Readonly step",
    },
  ),
  step(
    z.object({
      stringRenderTextUpcoming: field(z.string(), {
        label: "String render text upcoming",
      }),
    }),
    {
      state: "upcoming",
      title: "Upcoming step",
    },
  ),
];

export const Complex: Story = {
  args: {
    formData: {
      arrayRenderFieldListString: ["TypeScript", "React", "Zod"],
      arrayRenderFieldListStringFavourite: ["Bun", "Vitest", "Storybook"],
      arrayRenderFormListObject: [
        {
          booleanRenderCheckbox: true,
          enumRenderSelect: "lead",
          stringRenderEmail: "alex@example.com",
          stringRenderText: "Alex",
          stringRenderTextDependsOnBooleanRenderCheckbox: "+33123456789",
          stringRenderTextHiddenInSummary: "A-001",
          stringRenderTextarea: "Primary escalation path.",
        },
        {
          booleanRenderCheckbox: false,
          enumRenderSelect: "backup",
          stringRenderEmail: "sam@example.com",
          stringRenderText: "Sam",
          stringRenderTextDependsOnBooleanRenderCheckbox: "+81 987654321",
          stringRenderTextHiddenInSummary: "B-002",
        },
      ],
      booleanRenderAccept: true,
      booleanRenderCheckbox: false,
      booleanRenderSwitch: true,
      dateRenderDate: summaryDate,
      dateRenderDateWithCodec: new Date(2026, 2, 21),
      enumRenderRadio: "engineer",
      enumRenderSelect: "jp",
      fileRenderUpload: new File(["signed content"], "signed-contract.pdf", { type: "application/pdf" }),
      fileRenderUploadHiddenInSummary: new File(["hidden"], "team-secret.txt", { type: "text/plain" }),
      numberRenderNumber: 34,
      numberRenderNumberDependsOnBooleanSwitch: 1200,
      stringRenderDate: "2026-03-18",
      stringRenderDateTime: "2026-03-20T09:30",
      stringRenderEmail: "jane.doe@example.com",
      stringRenderPassword: "super-secret",
      stringRenderText: "Jane Doe",
      stringRenderTextDependsOnBooleanSwitch: "Asia/Tokyo",
      stringRenderTextDependsOnBooleanSwitchFalse: "HQ-22",
      stringRenderTextExcluded: "must stay hidden",
      stringRenderTextHiddenInSummary: "must stay hidden",
      stringRenderTextIsHidden: "must stay hidden",
      stringRenderTextIsVisible: "Rendered because role is engineer",
      stringRenderTextReadonly: "skip readonly step",
      stringRenderTextarea:
        "Builds resilient product systems across multiple teams lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      stringRenderTime: "09:30",
      stringRenderTextUpcoming: "skip upcoming step",
    },
    schemas: complexSchemas,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const profileSummary = canvas.getByTestId("form-summary-profile");
    await expect(canvas.getByText("Employee Jane Doe")).toBeVisible();
    await expect(canvas.getByText("Team setup")).toBeVisible();
    await expect(profileSummary).toHaveTextContent(["String render text", "Jane Doe"].join(""));
    await expect(profileSummary).toHaveTextContent(["String render email", "jane.doe@example.com"].join(""));
    await expect(profileSummary).toHaveTextContent(
      [
        "String render textarea",
        "Builds resilient product systems across multiple teams lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      ].join(""),
    );
    await expect(profileSummary).toHaveTextContent(["String render password", "super-secret"].join(""));
    await expect(profileSummary).toHaveTextContent(["Number render number", "34"].join(""));
    await expect(profileSummary).toHaveTextContent(["Date render date", "16/03/2026"].join(""));
    await expect(profileSummary).toHaveTextContent(["Date render date with codec", "21/03/2026"].join(""));
    await expect(profileSummary).toHaveTextContent(["String render date", "18/03/2026"].join(""));
    await expect(profileSummary).toHaveTextContent(["String render time", "09:30"].join(""));
    await expect(profileSummary).toHaveTextContent(["String render date-time", "20/03/2026 - 09:30"].join(""));
    await expect(profileSummary).toHaveTextContent(["Boolean render switch", "Yes"].join(""));
    await expect(profileSummary).toHaveTextContent(["Boolean render checkbox", "No"].join(""));
    await expect(profileSummary).toHaveTextContent(["Enum render select", "Japan"].join(""));
    await expect(profileSummary).toHaveTextContent(["Enum render radio", "Engineer radio label"].join(""));
    await expect(profileSummary).toHaveTextContent(
      ["Array render field-list string", "TypeScript, React, Zod"].join(""),
    );
    const contractLink = canvas.getByText("signed-contract.pdf");
    await expect(contractLink).toBeVisible();
    await expect(contractLink).toHaveTextContent("signed-contract.pdf");

    const remoteSummary = canvas.getByTestId("form-summary-remote-details");
    await expect(canvas.getByText("Remote details")).toBeVisible();
    await expect(remoteSummary).toHaveTextContent(
      ["String render text depends on boolean render switch", "Asia/Tokyo"].join(""),
    );
    await expect(remoteSummary).toHaveTextContent(
      ["Number render number depends on boolean render switch", "1200"].join(""),
    );
    await expect(remoteSummary).toHaveTextContent(
      ["String render text is visible", "Rendered because role is engineer"].join(""),
    );

    const alexSummary = canvas.getByTestId("form-summary-member-alex");
    await expect(canvas.getByText("Member Alex")).toBeVisible();
    await expect(alexSummary).toHaveTextContent(["String render text", "Alex"].join(""));
    await expect(alexSummary).toHaveTextContent(["Enum render select", "Team lead"].join(""));
    await expect(alexSummary).toHaveTextContent(["String render email", "alex@example.com"].join(""));
    await expect(alexSummary).toHaveTextContent(["Boolean render checkbox", "Yes"].join(""));
    await expect(alexSummary).toHaveTextContent(
      ["String render text depends on boolean render checkbox", "+33123456789"].join(""),
    );
    await expect(alexSummary).toHaveTextContent(["String render textarea", "Primary escalation path."].join(""));

    const samSummary = canvas.getByTestId("form-summary-member-sam");
    await expect(canvas.getByText("Member Sam")).toBeVisible();
    await expect(samSummary).toHaveTextContent(["Enum render select", "Backup"].join(""));
    await expect(samSummary).toHaveTextContent(["String render email", "sam@example.com"].join(""));
    await expect(samSummary).toHaveTextContent(["String render textarea", "Not specified"].join(""));
    await expect(samSummary).not.toHaveTextContent("String render text depends on boolean render checkbox");

    const preferencesSummary = canvas.getByTestId("form-summary-preferences");
    await expect(canvas.getByText("Preferences")).toBeVisible();
    await expect(preferencesSummary).toHaveTextContent(
      ["Array render field-list string favourite", "Bun, Vitest, Storybook"].join(""),
    );

    await expect(canvas.queryByText("String render text hidden in summary")).toBeNull();
    await expect(canvas.queryByText("String render text depends on boolean render switch false")).toBeNull();
    await expect(canvas.queryByText("String render text is hidden")).toBeNull();
    await expect(canvas.queryByText("String render text excluded")).toBeNull();
    await expect(canvas.queryByText("Hidden section")).toBeNull();
    await expect(canvas.queryByText("File render upload hidden in summary")).toBeNull();
    await expect(canvas.queryByText("Readonly step")).toBeNull();
    await expect(canvas.queryByText("String render text readonly")).toBeNull();
    await expect(canvas.queryByText("Upcoming step")).toBeNull();
    await expect(canvas.queryByText("String render text upcoming")).toBeNull();
  },
};
