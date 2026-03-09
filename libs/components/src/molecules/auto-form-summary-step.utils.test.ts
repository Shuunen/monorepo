import { z } from "zod";
import {
  groupedSectionsFromEditableSteps,
  filterDataForSummary,
  isRadioOrSelectMetadata,
  sectionsFromEditableSteps,
  sectionsFromSchema,
} from "./auto-form-summary-step.utils";
import { field, fields, forms, section, step } from "./auto-form.utils";

describe("auto-form-summary-step.utils", () => {
  // groupedSectionsFromEditableSteps
  it("groupedSectionsFromEditableSteps A should group sections by step with titles", () => {
    const schema1 = step(z.object({ a: field(z.string(), { label: "A" }) }), { title: "Step One" });
    const schema2 = step(z.object({ b: field(z.string(), { label: "B" }) }), { title: "Step Two" });
    const data = { a: "foo", b: "bar" };
    const groups = groupedSectionsFromEditableSteps([schema1, schema2], data);
    expect(groups).toHaveLength(2);
    expect(groups[0].stepTitle).toBe("Step One");
    expect(groups[0].sections).toHaveLength(1);
    expect(groups[1].stepTitle).toBe("Step Two");
    expect(groups[1].sections).toHaveLength(1);
  });
  it("groupedSectionsFromEditableSteps B should skip readonly and upcoming steps", () => {
    const schema1 = step(z.object({ a: field(z.string(), { label: "A" }) }), { state: "readonly", title: "Readonly" });
    const schema2 = step(z.object({ b: field(z.string(), { label: "B" }) }), { title: "Editable" });
    const schema3 = step(z.object({ c: field(z.string(), { label: "C" }) }), { state: "upcoming", title: "Upcoming" });
    const data = { a: "foo", b: "bar", c: "baz" };
    const groups = groupedSectionsFromEditableSteps([schema1, schema2, schema3], data);
    expect(groups).toHaveLength(1);
    expect(groups[0].stepTitle).toBe("Editable");
  });
  it("groupedSectionsFromEditableSteps C should handle steps without title", () => {
    const schema = z.object({ a: field(z.string(), { label: "A" }) });
    const data = { a: "foo" };
    const groups = groupedSectionsFromEditableSteps([schema], data);
    expect(groups).toHaveLength(1);
    expect(groups[0].stepTitle).toBeUndefined();
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
    expect(sections[0].data).toEqual({ b: { label: "B", value: "bar" } });
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
    expect(sections[0].title).toBeUndefined();
    expect(sections[0].data).toEqual({
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
    expect(sections[0].title).toBeUndefined();
    expect(sections[0].data).toEqual({ a: { label: "A", value: "foo" } });
  });
  it("sectionsFromEditableSteps D should handle invisible fields", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      b: field(z.string(), { isVisible: () => false, label: "B" }),
    });
    const data = { a: "foo", b: "bar" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBeUndefined();
    expect(sections[0].data).toEqual({ a: { label: "A", value: "foo" } });
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
    expect(sections[0].title).toBeUndefined();
    expect(sections[0].data).toEqual({ b: { label: "B", value: "Bar" } });
  });
  it("sectionsFromEditableSteps F should create dedicated sections for array of objects", () => {
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
    expect(sections[1].title).toBe("pets 1");
    expect(sections[1].data).toEqual({
      "pets.0.name": { label: "Name", value: "Buddy" },
      "pets.0.breed": { label: "Breed", value: "Labrador" },
    });
    expect(sections[2].title).toBe("pets 2");
  });
  it("sectionsFromEditableSteps G should use identifier for array of objects section titles", () => {
    const schema = z.object({
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) }), {
        identifier: data => `Pet: ${data?.name}`,
        label: "Pets",
      }),
    });
    const data = { pets: [{ name: "Buddy" }, { name: "Max" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe("Pet: Buddy");
    expect(sections[1].title).toBe("Pet: Max");
  });
  it("sectionsFromEditableSteps H should use field label for array of objects when no identifier", () => {
    const schema = z.object({
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) }), { label: "My Pets" }),
    });
    const data = { pets: [{ name: "Buddy" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0].title).toBe("My Pets 1");
  });
  it("sectionsFromEditableSteps I should handle empty array of objects", () => {
    const schema = z.object({
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) })),
    });
    const data = { pets: [] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(0);
  });
  it("sectionsFromEditableSteps J should handle missing array data", () => {
    const schema = z.object({
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) })),
    });
    const data = {};
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(0);
  });
  it("sectionsFromEditableSteps K should handle array of objects with select fields inside", () => {
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
    expect(sections[0].data["pets.0.type"]?.value).toBe("Dog");
  });
  it("sectionsFromEditableSteps L should place array sections after the current section", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) })),
      b: field(z.string(), { label: "B" }),
    });
    const data = { a: "foo", b: "bar", pets: [{ name: "Buddy" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(2);
    expect(sections[0].data).toEqual({
      a: { label: "A", value: "foo" },
      b: { label: "B", value: "bar" },
    });
    expect(sections[1].title).toBe("pets 1");
  });
  it("sectionsFromEditableSteps M should skip section markers inside array of objects", () => {
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
    expect(sections[0].data).toEqual({ "pets.0.name": { label: "Name", value: "Buddy" } });
  });
  it("sectionsFromEditableSteps N should hide regular field when showInSummary is false", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      b: field(z.string(), { label: "B", showInSummary: false }),
      c: field(z.string(), { label: "C" }),
    });
    const data = { a: "foo", b: "bar", c: "baz" };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0].data).toEqual({
      a: { label: "A", value: "foo" },
      c: { label: "C", value: "baz" },
    });
  });
  it("sectionsFromEditableSteps O should hide forms array when showInSummary is false", () => {
    const schema = z.object({
      a: field(z.string(), { label: "A" }),
      pets: forms(z.object({ name: field(z.string(), { label: "Name" }) }), { showInSummary: false }),
    });
    const data = { a: "foo", pets: [{ name: "Buddy" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(1);
    expect(sections[0].data).toEqual({ a: { label: "A", value: "foo" } });
  });
  it("sectionsFromEditableSteps P should handle field-list arrays of objects", () => {
    const schema = z.object({
      items: fields(z.object({ value: field(z.string(), { label: "Value" }) })),
    });
    const data = { items: [{ value: "a" }, { value: "b" }] };
    const sections = sectionsFromEditableSteps([schema], data);
    expect(sections).toHaveLength(2);
    expect(sections[0].title).toBe("items 1");
    expect(sections[1].title).toBe("items 2");
  });

  // sectionsFromSchema
  it("sectionsFromSchema A should build sections regardless of step state", () => {
    const schema = step(z.object({ a: field(z.string(), { label: "A" }) }), { state: "readonly" });
    const data = { a: "foo" };
    const sections = sectionsFromSchema(schema, data);
    expect(sections).toHaveLength(1);
    expect(sections[0].data).toEqual({ a: { label: "A", value: "foo" } });
  });
  it("sectionsFromSchema B should build sections for editable steps too", () => {
    const schema = step(z.object({ b: field(z.string(), { label: "B" }) }), { state: "editable" });
    const data = { b: "bar" };
    const sections = sectionsFromSchema(schema, data);
    expect(sections).toHaveLength(1);
    expect(sections[0].data).toEqual({ b: { label: "B", value: "bar" } });
  });
  it("sectionsFromSchema C should build sections for upcoming steps", () => {
    const schema = step(z.object({ c: field(z.string(), { label: "C" }) }), { state: "upcoming" });
    const data = { c: "baz" };
    const sections = sectionsFromSchema(schema, data);
    expect(sections).toHaveLength(1);
    expect(sections[0].data).toEqual({ c: { label: "C", value: "baz" } });
  });
  it("sectionsFromSchema D should skip sections with showInSummary set to false", () => {
    const schema = z.object({ section: section({ title: "Section", showInSummary: false }) });
    const sections = sectionsFromSchema(schema, {});
    expect(sections).toHaveLength(0);
  });
});
