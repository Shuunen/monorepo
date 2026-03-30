import { z } from "zod";
import {
  groupedSectionsFromEditableSteps,
  filterDataForSummary,
  isRadioOrSelectMetadata,
  sectionsFromEditableSteps,
  sectionsFromSchema,
} from "./auto-form-summary-step.utils";
import { acceptField, field, fields, forms, section, step } from "./auto-form.utils";

describe("auto-form-summary-step.utils", () => {
  // groupedSectionsFromEditableSteps
  it("groupedSectionsFromEditableSteps A should group sections by step with titles", () => {
    const schema1 = step(z.object({ a: field(z.string(), { label: "A" }) }), { title: "Step One" });
    const schema2 = step(z.object({ b: field(z.string(), { label: "B" }) }), { title: "Step Two" });
    const data = { a: "foo", b: "bar" };
    const groups = groupedSectionsFromEditableSteps([schema1, schema2], data);
    expect(groups).toHaveLength(2);
    expect(groups[0]?.stepTitle).toBe("Step One");
    expect(groups[0]?.sections).toHaveLength(1);
    expect(groups[1]?.stepTitle).toBe("Step Two");
    expect(groups[1]?.sections).toHaveLength(1);
  });
  it("groupedSectionsFromEditableSteps B should skip readonly and upcoming steps", () => {
    const schema1 = step(z.object({ a: field(z.string(), { label: "A" }) }), { state: "readonly", title: "Readonly" });
    const schema2 = step(z.object({ b: field(z.string(), { label: "B" }) }), { title: "Editable" });
    const schema3 = step(z.object({ c: field(z.string(), { label: "C" }) }), { state: "upcoming", title: "Upcoming" });
    const data = { a: "foo", b: "bar", c: "baz" };
    const groups = groupedSectionsFromEditableSteps([schema1, schema2, schema3], data);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.stepTitle).toBe("Editable");
  });
  it("groupedSectionsFromEditableSteps C should handle steps without title", () => {
    const schema = z.object({ a: field(z.string(), { label: "A" }) });
    const data = { a: "foo" };
    const groups = groupedSectionsFromEditableSteps([schema], data);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.stepTitle).toBeUndefined();
  });
  // filterDataForSummary
  it("filterDataForSummary A should filter out fields from readonly steps", () => {
    const schema1 = step(z.object({ a: field(z.string(), { label: "A" }) }), { state: "readonly" });
    const schema2 = step(z.object({ b: field(z.string(), { label: "B" }) }), { state: "editable" });
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema1, schema2], data);
    expect(filtered).toEqual({ b: "bar" });
  });
  it("filterDataForSummary B should filter out fields from upcoming steps", () => {
    const schema1 = step(z.object({ a: field(z.string(), { label: "A" }) }), { state: "upcoming" });
    const schema2 = step(z.object({ b: field(z.string(), { label: "B" }) }), { state: "editable" });
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema1, schema2], data);
    expect(filtered).toEqual({ b: "bar" });
  });
  it("filterDataForSummary C should filter out invisible and excluded fields", () => {
    const schema = step(
      z.object({
        a: field(z.string(), { label: "A" }),
        b: field(z.string(), { excluded: true, label: "B" }),
        c: field(z.string(), { dependsOn: "a", label: "C" }),
      }),
      { state: "editable" },
    );
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema], data);
    expect(filtered).toEqual({ a: "foo" });
  });
  it("filterDataForSummary D should include fields from editable steps", () => {
    const schema = step(
      z.object({
        a: field(z.string(), { label: "A" }),
        b: field(z.string(), { label: "B" }),
      }),
      { state: "editable" },
    );
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema], data);
    expect(filtered).toEqual({ a: "foo", b: "bar" });
  });
  it("filterDataForSummary E should handle steps without metadata", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
    });
    const data = { a: "foo" };
    const filtered = filterDataForSummary([schema], data);
    expect(filtered).toEqual({ a: "foo" });
  });
  it("filterDataForSummary F should handle sections", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      b: section({ title: "B Section" }),
    });
    const data = { a: "foo", b: "bar" };
    const filtered = filterDataForSummary([schema], data);
    expect(filtered).toEqual({ a: "foo" });
  });
  // isRadioOrSelectMetadata
  it("isRadioOrSelectMetadata A should state that metadata are of radio or select type", () => {
    expect(isRadioOrSelectMetadata({ label: "Foo", options: [] })).toBe(true);
  });
  it("isRadioOrSelectMetadata B should state that metadata are not of radio or select type", () => {
    expect(isRadioOrSelectMetadata({ label: "Foo" })).toBe(false);
    expect(isRadioOrSelectMetadata()).toBe(false);
  });
  // sectionsFromEditableSteps
  it("sectionsFromEditableSteps A should skip readonly and upcoming steps", () => {
    const schema1 = step(
      z.object({
        a: field(z.string(), { label: "A" }),
      }),
      { state: "readonly" },
    );
    const schema2 = step(
      z.object({
        b: field(z.string(), { label: "B" }),
      }),
      { state: "editable" },
    );
    const data = { a: "foo", b: "bar" };
    const sections = sectionsFromEditableSteps([schema1, schema2], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data).toEqual({ b: { label: "B", value: "bar" } });
  });
  it("sectionsFromEditableSteps B should handle steps without sections", () => {
    const schema = step(
      z.object({
        a: field(z.string(), { label: "A" }),
        b: field(z.string(), { label: "B" }),
      }),
      { state: "editable" },
    );
    const data = { a: "foo", b: "bar" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBeUndefined();
    expect(sections[0]?.data).toEqual({
      a: { label: "A", value: "foo" },
      b: { label: "B", value: "bar" },
    });
  });
  it("sectionsFromEditableSteps C should handle sections", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      b: section({ title: "B Section" }),
      c: section({}),
    });
    const data = { a: "foo", b: "bar" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBeUndefined();
    expect(sections[0]?.data).toEqual({ a: { label: "A", value: "foo" } });
  });
  it("sectionsFromEditableSteps D should handle invisible fields", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      b: field(z.string(), { isVisible: () => false, label: "B" }),
    });
    const data = { a: "foo", b: "bar" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBeUndefined();
    expect(sections[0]?.data).toEqual({ a: { label: "A", value: "foo" } });
  });
  it("sectionsFromEditableSteps E should handle enum fields", () => {
    const schema = z.object({
      b: field(z.enum(["foo", "bar"]), {
        label: "B",
        options: [
          { label: "Foo", value: "foo" },
          { label: "Bar", value: "bar" },
        ],
      }),
    });
    const data = { b: "bar" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBeUndefined();
    expect(sections[0]?.data).toEqual({ b: { label: "B", value: "Bar" } });
  });
  it("sectionsFromEditableSteps F should handle accept fields with custom labels", () => {
    const schema = z.object({
      consent: acceptField({
        label: "Consent",
        labels: {
          accept: "I agree",
          reject: "I decline",
        },
      }),
    });
    const sections = sectionsFromEditableSteps([schema], { consent: false });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBeUndefined();
    expect(sections[0]?.data).toEqual({ consent: { label: "Consent", value: "I decline" } });
  });
  it("sectionsFromEditableSteps G should create dedicated sections for array of objects", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      pets: forms(
        z.object({ name: field(z.string(), { label: "Name" }), breed: field(z.string(), { label: "Breed" }) }),
      ),
    });
    const data = {
      a: "foo",
      pets: [
        { breed: "Labrador", name: "Buddy" },
        { breed: "Poodle", name: "Max" },
      ],
    };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(3);
    expect(sections[0]).toEqual({ data: { a: { label: "A", value: "foo" } }, title: undefined });
    expect(sections[1]?.title).toBe("pets 1");
    expect(sections[1]?.data).toEqual({
      "pets.0.name": { label: "Name", value: "Buddy" },
      "pets.0.breed": { label: "Breed", value: "Labrador" },
    });
    expect(sections[2]?.title).toBe("pets 2");
  });
  it("sectionsFromEditableSteps H should use identifier for array of objects section titles", () => {
    const schema = z.object({
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) }), {
        identifier: data => `Pet: ${data?.name}`,
        label: "Pets",
      }),
    });
    const data = { pets: [{ name: "Buddy" }, { name: "Max" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(2);
    expect(sections[0]?.title).toBe("Pet: Buddy");
    expect(sections[1]?.title).toBe("Pet: Max");
  });
  it("sectionsFromEditableSteps I should use field label for array of objects when no identifier", () => {
    const schema = z.object({
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) }), { label: "My Pets" }),
    });
    const data = { pets: [{ name: "Buddy" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe("My Pets 1");
  });
  it("sectionsFromEditableSteps J should handle empty array of objects", () => {
    const schema = z.object({
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) })),
    });
    const data = { pets: [] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(0);
  });
  it("sectionsFromEditableSteps K should handle missing array data", () => {
    const schema = z.object({
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) })),
    });
    const data = {};
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(0);
  });
  it("sectionsFromEditableSteps L should handle array of objects with select fields inside", () => {
    const schema = z.object({
      pets: forms(
        z.object({
          type: field(z.enum(["cat", "dog"]), {
            label: "Type",
            options: [
              { label: "Cat", value: "cat" },
              { label: "Dog", value: "dog" },
            ],
            render: "select",
          }),
        }),
      ),
    });
    const data = { pets: [{ type: "dog" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections[0]?.data["pets.0.type"]?.value).toBe("Dog");
  });
  it("sectionsFromEditableSteps M should place array sections after the current section", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) })),
      b: field(z.string(), { label: "B" }),
    });
    const data = { a: "foo", b: "bar", pets: [{ name: "Buddy" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(2);
    expect(sections[0]?.data).toEqual({
      a: { label: "A", value: "foo" },
      b: { label: "B", value: "bar" },
    });
    expect(sections[1]?.title).toBe("pets 1");
  });
  it("sectionsFromEditableSteps N should skip section markers inside array of objects", () => {
    const schema = z.object({
      pets: forms(
        z.object({
          sectionA: section({ title: "Section A" }),
          name: field(z.string(), { label: "Name" }),
        }),
      ),
    });
    const data = { pets: [{ name: "Buddy" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data).toEqual({ "pets.0.name": { label: "Name", value: "Buddy" } });
  });
  it("sectionsFromEditableSteps O should hide regular field when showInSummary is false", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      b: field(z.string(), { label: "B", showInSummary: false }),
      c: field(z.string(), { label: "C" }),
    });
    const data = { a: "foo", b: "bar", c: "baz" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data).toEqual({
      a: { label: "A", value: "foo" },
      c: { label: "C", value: "baz" },
    });
  });
  it("sectionsFromEditableSteps P should hide forms array when showInSummary is false", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) }), { showInSummary: false }),
    });
    const data = { a: "foo", pets: [{ name: "Buddy" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data).toEqual({ a: { label: "A", value: "foo" } });
  });
  it("sectionsFromEditableSteps Q should handle field-list arrays of objects", () => {
    const schema = z.object({
      items: fields(z.object({ value: field(z.string(), { label: "Value" }) })),
    });
    const data = { items: [{ value: "a" }, { value: "b" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(2);
    expect(sections[0]?.title).toBe("items 1");
    expect(sections[1]?.title).toBe("items 2");
  });
  it("sectionsFromEditableSteps R should handle nested forms within forms", () => {
    const schema = z.object({
      pets: forms(
        z.object({
          name: field(z.string(), { label: "Name" }),
          toys: forms(z.object({ toyName: field(z.string(), { label: "Toy Name" }) })),
        }),
      ),
    });
    const data = {
      pets: [{ name: "Buddy", toys: [{ toyName: "Ball" }, { toyName: "Bone" }] }],
    };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe("pets 1");
    expect(sections[0]?.data).toEqual({ "pets.0.name": { label: "Name", value: "Buddy" } });
    expect(sections[0]?.sections).toHaveLength(2);
    expect(sections[0]?.sections?.[0]?.title).toBe("toys 1");
    expect(sections[0]?.sections?.[0]?.data).toEqual({
      "toys.0.toyName": { label: "Toy Name", value: "Ball" },
    });
    expect(sections[0]?.sections?.[1]?.title).toBe("toys 2");
    expect(sections[0]?.sections?.[1]?.data).toEqual({
      "toys.1.toyName": { label: "Toy Name", value: "Bone" },
    });
  });
  it("sectionsFromEditableSteps S should handle nested forms with empty nested array", () => {
    const schema = z.object({
      pets: forms(
        z.object({
          name: field(z.string(), { label: "Name" }),
          toys: forms(z.object({ toyName: field(z.string(), { label: "Toy Name" }) })),
        }),
      ),
    });
    const data = { pets: [{ name: "Buddy", toys: [] }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe("pets 1");
    expect(sections[0]?.data).toEqual({ "pets.0.name": { label: "Name", value: "Buddy" } });
    expect(sections[0]?.sections).toBeUndefined();
  });
  // oxlint-disable-next-line complexity
  it("sectionsFromEditableSteps T should handle deeply nested forms (3 levels)", () => {
    const schema = z.object({
      teams: forms(
        z.object({
          teamName: field(z.string(), { label: "Team" }),
          members: forms(
            z.object({
              memberName: field(z.string(), { label: "Member" }),
              tasks: forms(z.object({ taskName: field(z.string(), { label: "Task" }) })),
            }),
          ),
        }),
      ),
    });
    const data = {
      teams: [{ teamName: "Alpha", members: [{ memberName: "Alice", tasks: [{ taskName: "Fix bug" }] }] }],
    };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe("teams 1");
    expect(sections[0]?.data).toEqual({ "teams.0.teamName": { label: "Team", value: "Alpha" } });
    expect(sections[0]?.sections).toHaveLength(1);
    expect(sections[0]?.sections?.[0]?.title).toBe("members 1");
    expect(sections[0]?.sections?.[0]?.data).toEqual({
      "members.0.memberName": { label: "Member", value: "Alice" },
    });
    expect(sections[0]?.sections?.[0]?.sections).toHaveLength(1);
    expect(sections[0]?.sections?.[0]?.sections?.[0]?.title).toBe("tasks 1");
    expect(sections[0]?.sections?.[0]?.sections?.[0]?.data).toEqual({
      "tasks.0.taskName": { label: "Task", value: "Fix bug" },
    });
  });
  it("sectionsFromEditableSteps U should produce section with only nested sections when parent has no direct fields", () => {
    const schema = z.object({
      pets: forms(
        z.object({
          toys: forms(z.object({ toyName: field(z.string(), { label: "Toy Name" }) })),
        }),
      ),
    });
    const data = { pets: [{ toys: [{ toyName: "Ball" }] }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe("pets 1");
    expect(sections[0]?.data).toEqual({});
    expect(sections[0]?.sections).toHaveLength(1);
    expect(sections[0]?.sections?.[0]?.title).toBe("toys 1");
  });

  // sectionsFromSchema
  it("sectionsFromSchema A should build sections regardless of step state", () => {
    const schema = step(z.object({ a: field(z.string(), { label: "A" }) }), { state: "readonly" });
    const data = { a: "foo" };
    const sections = sectionsFromSchema({ schema, data });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data).toEqual({ a: { label: "A", value: "foo" } });
  });
  it("sectionsFromSchema B should build sections for editable steps too", () => {
    const schema = step(z.object({ b: field(z.string(), { label: "B" }) }), { state: "editable" });
    const data = { b: "bar" };
    const sections = sectionsFromSchema({ schema, data });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data).toEqual({ b: { label: "B", value: "bar" } });
  });
  it("sectionsFromSchema C should build sections for upcoming steps", () => {
    const schema = step(z.object({ c: field(z.string(), { label: "C" }) }), { state: "upcoming" });
    const data = { c: "baz" };
    const sections = sectionsFromSchema({ schema, data });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data).toEqual({ c: { label: "C", value: "baz" } });
  });
  it("sectionsFromSchema D should skip sections with showInSummary set to false", () => {
    const schema = z.object({ section: section({ title: "Section", showInSummary: false }) });
    const sections = sectionsFromSchema({ schema, data: {} });
    expect(sections).toHaveLength(0);
  });
  it("sectionsFromSchema E should encode regular field values with codec for summary", () => {
    const value = new Date(2026, 2, 21);
    const expectedValue = `encoded:${value.toISOString().slice(0, 10)}`;
    const schema = z.object({
      dateField: field(z.date(), {
        codec: z.codec(z.string(), z.date(), {
          decode: input => new Date(input),
          encode: date => `encoded:${date.toISOString().slice(0, 10)}`,
        }),
        label: "Date",
      }),
    });
    const sections = sectionsFromSchema({ schema, data: { dateField: value }, applyCodec: true });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.dateField).toEqual({ label: "Date", value: expectedValue });
  });
  it("sectionsFromSchema F should fallback to raw regular value when codec encode fails", () => {
    const value = new Date(2026, 2, 21);
    const schema = z.object({
      dateField: field(z.date(), {
        codec: z.codec(z.iso.date(), z.date(), {
          decode: input => new Date(input),
          encode: () => "not-an-iso-date",
        }),
        label: "Date",
      }),
    });
    const sections = sectionsFromSchema({ schema, data: { dateField: value }, applyCodec: true });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.dateField).toEqual({ label: "Date", value });
  });
  it("sectionsFromSchema G should encode select label values with codec for summary", () => {
    const schema = z.object({
      role: field(z.enum(["eng", "mgr"]), {
        codec: z.codec(z.string(), z.string(), {
          decode: input => input,
          encode: value => `encoded:${value}`,
        }),
        label: "Role",
        options: [
          { label: "Engineer", value: "eng" },
          { label: "Manager", value: "mgr" },
        ],
        render: "select",
      }),
    });
    const sections = sectionsFromSchema({ schema, data: { role: "eng" }, applyCodec: true });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.role).toEqual({ label: "Role", value: "encoded:Engineer" });
  });
  it("sectionsFromSchema H should fallback to select label when codec encode fails", () => {
    const schema = z.object({
      role: field(z.enum(["eng", "mgr"]), {
        codec: z.codec(z.iso.date(), z.string(), {
          decode: input => input,
          encode: () => "not-an-iso-date",
        }),
        label: "Role",
        options: [
          { label: "Engineer", value: "eng" },
          { label: "Manager", value: "mgr" },
        ],
        render: "select",
      }),
    });
    const sections = sectionsFromSchema({ schema, data: { role: "eng" }, applyCodec: true });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.role).toEqual({ label: "Role", value: "Engineer" });
  });
  it("sectionsFromSchema I should map accept labels in array item sections", () => {
    const schema = z.object({
      items: forms(
        z.object({
          consent: acceptField({
            label: "Consent",
            labels: {
              accept: "Accepted",
              reject: "Rejected",
            },
          }),
        }),
      ),
    });
    const sections = sectionsFromSchema({ schema, data: { items: [{ consent: true }] } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data["items.0.consent"]).toEqual({ label: "Consent", value: "Accepted" });
  });
  it("sectionsFromSchema J should fallback to inner key label when array item field metadata is missing", () => {
    const schema = z.object({
      items: forms(z.object({ rawKey: z.string() })),
    });
    const sections = sectionsFromSchema({ schema, data: { items: [{ rawKey: "alpha" }] } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data["items.0.rawKey"]).toEqual({ label: "rawKey", value: "alpha" });
  });
  it("sectionsFromSchema K should skip empty array-item sections", () => {
    const schema = z.object({
      items: forms(
        z.object({
          hidden: field(z.string().optional(), { excluded: true }),
        }),
      ),
    });
    const sections = sectionsFromSchema({ schema, data: { items: [{ hidden: "secret" }] } });
    expect(sections).toEqual([]);
  });
  it("sectionsFromSchema L should fallback to raw option value when options resolve to non-array", () => {
    const schema = z.object({
      role: field(z.enum(["eng", "mgr"]), {
        label: "Role",
        // @ts-expect-error testing invalid options return
        options: () => undefined,
      }),
    });
    const sections = sectionsFromSchema({ schema, data: { role: "eng" } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.role).toEqual({ label: "Role", value: "eng" });
  });
  it("sectionsFromSchema M should keep null value for codec-backed regular fields", () => {
    const schema = z.object({
      dateField: field(z.date(), {
        codec: z.codec(z.string(), z.date(), {
          decode: input => new Date(input),
          encode: date => `encoded:${date.toISOString()}`,
        }),
        label: "Date",
      }),
    });
    const sections = sectionsFromSchema({ schema, data: { dateField: null }, applyCodec: true });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.dateField).toEqual({ label: "Date", value: null });
  });
  it("sectionsFromSchema N should fallback to key label for top-level fields without metadata", () => {
    const schema = z.object({ rawName: z.string() });
    const sections = sectionsFromSchema({ schema, data: { rawName: "Jane" } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.rawName).toEqual({ label: "rawName", value: "Jane" });
  });
  it("sectionsFromSchema O should use outer key when array field has no metadata", () => {
    const schema = z.object({
      items: z.array(z.object({ name: field(z.string(), { label: "Name" }) })),
    });
    const sections = sectionsFromSchema({ schema, data: { items: [{ name: "Buddy" }] } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe("items 1");
  });
  it("sectionsFromSchema P should keep raw inner value when array item options resolve to non-array", () => {
    const schema = z.object({
      items: z.array(
        z.object({
          role: field(z.enum(["eng", "mgr"]), {
            label: "Role",
            // @ts-expect-error testing invalid options return
            options: () => undefined,
            render: "select",
          }),
        }),
      ),
    });
    const sections = sectionsFromSchema({ schema, data: { items: [{ role: "eng" }] } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data["items.0.role"]).toEqual({ label: "Role", value: "eng" });
  });
  it("sectionsFromSchema Q should fallback to key when array metadata label is explicitly undefined", () => {
    const schema = z.object({
      items: forms(z.object({ name: field(z.string(), { label: "Name" }) }), { label: undefined }),
    });
    const sections = sectionsFromSchema({ schema, data: { items: [{ name: "Buddy" }] } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.title).toBe("items 1");
  });
  it("sectionsFromSchema R should return empty sections when array element resolution fails on second read", async () => {
    vi.resetModules();
    let getElementSchemaCalls = 0;
    vi.doMock("./auto-form.utils", async importOriginal => {
      // oxlint-disable-next-line typescript/consistent-type-imports
      const actual = await importOriginal<typeof import("./auto-form.utils")>();
      return {
        ...actual,
        getElementSchema: vi.fn(() => {
          getElementSchemaCalls += 1;
          if (getElementSchemaCalls === 1) {
            return { ok: true, value: z.object({ name: z.string() }) };
          }
          return { error: "forced-error", ok: false };
        }),
        isZodArray: vi.fn(() => true),
        isZodObject: vi.fn(() => true),
      };
    });
    const utilsModule = await import("./auto-form-summary-step.utils");
    const schema = z.object({
      items: fields(z.object({ name: field(z.string(), { label: "Name" }) })),
    });
    const sections = utilsModule.sectionsFromSchema({ schema, data: { items: [{ name: "Buddy" }] } });
    expect(sections).toEqual([]);
    vi.doUnmock("./auto-form.utils");
    vi.resetModules();
  });
  it("sectionsFromSchema S should skip entries when schema shape contains undefined field", () => {
    const schema = z.object({ a: field(z.string(), { label: "A" }) });
    const shape = schema.shape as Record<string, z.ZodType | undefined>;
    shape.a = undefined;
    const sections = sectionsFromSchema({ schema, data: { a: "foo" } });
    expect(sections).toEqual([]);
  });
  it("sectionsFromSchema T should use default labels for accept fields without custom labels", () => {
    const schema = z.object({
      consent: acceptField({ label: "Consent" }),
      approval: acceptField({ label: "Approval" }),
    });
    const sections = sectionsFromSchema({ schema, data: { approval: false, consent: true } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.consent).toEqual({ label: "Consent", value: "Accept" });
    expect(sections[0]?.data.approval).toEqual({ label: "Approval", value: "Reject" });
  });
  it("sectionsFromSchema U should keep raw value when accept field value is not boolean", () => {
    const schema = z.object({
      consent: acceptField({
        label: "Consent",
        labels: {
          accept: "Accepted",
          reject: "Rejected",
        },
      }),
    });
    const sections = sectionsFromSchema({ schema, data: { consent: "pending" } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.consent).toEqual({ label: "Consent", value: "pending" });
  });
  it("sectionsFromSchema V should use sub field label when field list has no label", () => {
    const schema = z.object({
      list: fields(field(z.string(), { label: "Item" })),
    });
    const sections = sectionsFromSchema({ schema, data: { list: ["item-1"] } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.list).toEqual({ label: "Item", value: ["item-1"] });
  });
  it("sectionsFromSchema W should fallback to field key when field list element resolution fails and no label", async () => {
    vi.resetModules();
    vi.doMock("./auto-form.utils", async importOriginal => {
      // oxlint-disable-next-line typescript/consistent-type-imports
      const actual = await importOriginal<typeof import("./auto-form.utils")>();
      return {
        ...actual,
        getElementSchema: vi.fn(() => ({ ok: false, error: "forced-error" })),
        isZodArray: vi.fn(() => true),
        isZodObject: vi.fn(() => true),
      };
    });
    const utilsModule = await import("./auto-form-summary-step.utils");
    const schema = z.object({
      list: fields(field(z.string(), { label: "Item" })),
    });
    const sections = utilsModule.sectionsFromSchema({ schema, data: { list: ["item-1"] } });
    expect(sections).toHaveLength(1);
    expect(sections[0]?.data.list).toEqual({ label: "list", value: ["item-1"] });
    vi.doUnmock("./auto-form.utils");
    vi.resetModules();
  });
});
