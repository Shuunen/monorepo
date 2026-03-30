// oxlint-disable max-lines
import { Result } from "@monorepo/utils";
import { isFunction } from "es-toolkit";
import { z } from "zod";
import type {
  AutoFormData,
  AutoFormFieldAcceptMetadata,
  AutoFormFieldMetadata,
  AutoFormFieldRadioMetadata,
  AutoFormFieldSelectMetadata,
  AutoFormSummarySection,
  AutoFormSummaryStepGroup,
} from "./auto-form.types";
import {
  getElementSchema,
  getFieldMetadata,
  getStepMetadata,
  isFieldVisible,
  isZodArray,
  isZodObject,
  shouldIncludeField,
  typeLikeResolver,
} from "./auto-form.utils";

/**
 * Filters data for summary display by excluding fields from readonly and upcoming steps.
 * Only includes fields from editable steps.
 * @param schemas - Array of Zod schemas for all steps
 * @param data - The complete form data
 * @returns Filtered data containing only fields from editable steps
 */
export function filterDataForSummary(schemas: z.ZodObject[], data: AutoFormData) {
  const result: AutoFormData = {};
  for (const schema of schemas) {
    const stepMeta = getStepMetadata(schema);
    const stepState = stepMeta?.state;
    // Only include fields from editable steps (skip readonly and upcoming)
    if (stepState === "readonly" || stepState === "upcoming") {
      continue;
    }
    const { shape } = schema;
    for (const [key, value] of Object.entries(data)) {
      const fieldSchema = shape[key] as z.ZodType;
      if (!fieldSchema) {
        continue;
      }
      const metadata = getFieldMetadata(fieldSchema);
      if (shouldIncludeField(fieldSchema, metadata, data)) {
        result[key] = value;
      }
    }
  }
  return result;
}

/**
 * Check whether field metadata has options.
 * @param metadata field metadata
 * @returns whether or not field metadata has options
 */
export function isRadioOrSelectMetadata(
  metadata?: AutoFormFieldMetadata,
): metadata is AutoFormFieldRadioMetadata | AutoFormFieldSelectMetadata {
  return metadata ? "options" in metadata : false;
}

function isAcceptMetadata(metadata?: AutoFormFieldMetadata): metadata is AutoFormFieldAcceptMetadata {
  return metadata?.render === "accept";
}

function acceptLabelFromMetadata(metadata: AutoFormFieldAcceptMetadata, value: unknown) {
  if (value === true) {
    return metadata.labels?.accept ?? "Accept";
  }
  if (value === false) {
    return metadata.labels?.reject ?? "Reject";
  }
  return value;
}

function getFieldLabel(fieldSchema: z.ZodType, metadata: AutoFormFieldMetadata | undefined) {
  if (!metadata?.label && metadata?.render === "field-list") {
    const elementResult = getElementSchema(fieldSchema);
    if (elementResult.ok) {
      return getFieldMetadata(elementResult.value)?.label;
    }
  }
  return metadata?.label;
}

type SectionDataFromObjectItemProps = {
  data: AutoFormData;
  index: number;
  innerShape: z.ZodObject["shape"];
  item: AutoFormData;
  key: string;
};

type SectionDataResult = {
  data: AutoFormSummarySection["data"];
  nestedSections: AutoFormSummarySection[];
};

/**
 * Builds the data for a section from an object item.
 * @param SectionData - The data for the section
 * @param SectionData.innerShape - The shape of the inner object
 * @param SectionData.item - The item to build the data for
 * @param SectionData.key - The key of the item
 * @param SectionData.index - The index of the item
 * @param SectionData.data - The full form data for TypeLike resolution
 * @param SectionData.parentData - Optional parent form data for TypeLike resolution
 * @returns The data for the section
 */
// oxlint-disable-next-line max-lines-per-function
function sectionDataFromObjectItem({
  data,
  innerShape,
  item,
  key,
  index,
}: SectionDataFromObjectItemProps): SectionDataResult {
  const sectionData: AutoFormSummarySection["data"] = {};
  const nestedSections: AutoFormSummarySection[] = [];
  for (const innerKey of Object.keys(innerShape)) {
    const innerFieldSchema = innerShape[innerKey] as z.ZodType;
    const innerMetadata = getFieldMetadata(innerFieldSchema);
    if (innerMetadata?.render === "section" || innerMetadata?.excluded || !isFieldVisible(innerFieldSchema, item)) {
      continue;
    }
    if (isArrayOfObjects(innerFieldSchema)) {
      nestedSections.push(
        ...sectionsFromArrayOfObjects({
          data: item,
          fieldSchema: innerFieldSchema,
          key: innerKey,
          metadata: innerMetadata,
        }),
      );
      continue;
    }
    const hasOptions = isRadioOrSelectMetadata(innerMetadata);
    let innerValue = item[innerKey];
    if (hasOptions) {
      const options = typeLikeResolver(innerMetadata.options, item, data);
      if (Array.isArray(options)) {
        innerValue = options.find(opt => opt.value === innerValue)?.label;
      }
    } else if (isAcceptMetadata(innerMetadata)) {
      innerValue = acceptLabelFromMetadata(innerMetadata, innerValue);
    }
    sectionData[`${key}.${index}.${innerKey}`] = {
      label: getFieldLabel(innerFieldSchema, innerMetadata) ?? innerKey,
      value: innerValue,
    };
  }
  return { data: sectionData, nestedSections };
}

type SectionsFromArrayOfObjectsProps = {
  data: AutoFormData;
  fieldSchema: z.ZodType;
  key: string;
  metadata: AutoFormFieldMetadata | undefined;
};

function sectionsFromArrayOfObjects(props: SectionsFromArrayOfObjectsProps) /* NOSONAR */ {
  const { data, fieldSchema, key, metadata } = props;
  const items = data[key];
  if (!Array.isArray(items) || items.length === 0) {
    return [];
  }
  const elementResult = getElementSchema(fieldSchema);
  if (!elementResult.ok) {
    return [];
  }
  const innerShape = (elementResult.value as z.ZodObject).shape;
  const fieldLabel = metadata && "label" in metadata ? (metadata.label ?? key) : key;
  const identifier =
    metadata && "identifier" in metadata && isFunction(metadata.identifier) ? metadata.identifier : undefined;
  const sections: Array<AutoFormSummarySection> = [];
  for (let index = 0; index < items.length; index += 1) {
    const item = items[index] as AutoFormData;
    const itemTitle = identifier ? identifier({ ...item, index: index + 1 }) : `${fieldLabel} ${index + 1}`;
    const { data: sectionData, nestedSections } = sectionDataFromObjectItem({ data, index, innerShape, item, key });
    const hasData = Object.keys(sectionData).length > 0;
    const hasNested = nestedSections.length > 0;
    if (hasData || hasNested) {
      sections.push({ data: sectionData, sections: hasNested ? nestedSections : undefined, title: itemTitle });
    }
  }
  return sections;
}

function isArrayOfObjects(fieldSchema: z.ZodType) {
  if (!isZodArray(fieldSchema)) {
    return false;
  }
  const elementResult = getElementSchema(fieldSchema);
  return elementResult.ok && isZodObject(elementResult.value);
}

function codecFromMetadata(metadata?: AutoFormFieldMetadata) {
  if (!metadata || !("codec" in metadata) || metadata.codec === undefined) {
    return undefined;
  }
  return metadata.codec;
}

function encodedSummaryValue(codec: z.ZodCodec, value: unknown) {
  const result = Result.trySafe(() => z.encode(codec, value));
  if (result.ok) {
    return result.value;
  }
  return value;
}

type ResolveFieldValueProps = {
  applyCodec?: boolean;
  data: AutoFormData;
  key: string;
  metadata: AutoFormFieldMetadata | undefined;
  parentData?: AutoFormData;
};

function resolveFieldValue(props: ResolveFieldValueProps) /* NOSONAR */ {
  const rawValue = props.data[props.key];
  if (isRadioOrSelectMetadata(props.metadata)) {
    const options = typeLikeResolver(props.metadata.options, props.data, props.parentData);
    const selectedValue = Array.isArray(options) ? options.find(opt => opt.value === rawValue)?.label : rawValue;
    const codec = codecFromMetadata(props.metadata);
    if (codec === undefined || selectedValue === undefined || selectedValue === null || !props.applyCodec) {
      return selectedValue;
    }
    return encodedSummaryValue(codec, selectedValue);
  }
  if (isAcceptMetadata(props.metadata)) {
    return acceptLabelFromMetadata(props.metadata, rawValue);
  }
  const codec = codecFromMetadata(props.metadata);
  if (codec === undefined || rawValue === undefined || rawValue === null || !props.applyCodec) {
    return rawValue;
  }
  return encodedSummaryValue(codec, rawValue);
}

type SectionBuilderState = {
  currentSectionData: AutoFormSummarySection["data"];
  currentSectionTitle: AutoFormSummarySection["title"];
  parentData?: AutoFormData;
  pendingArraySections: Array<AutoFormSummarySection>;
  sections: Array<AutoFormSummarySection>;
};

function flushCurrentSection(state: SectionBuilderState) {
  if (Object.keys(state.currentSectionData).length > 0) {
    state.sections.push({ data: state.currentSectionData, title: state.currentSectionTitle });
  }
  state.sections.push(...state.pendingArraySections);
  state.pendingArraySections = [];
}

type ProcessFieldForSectionProps = {
  applyCodec?: boolean;
  data: AutoFormData;
  key: string;
  shape: z.ZodObject["shape"];
  state: SectionBuilderState;
};

function processFieldForSection({ applyCodec = false, key, shape, data, state }: ProcessFieldForSectionProps) {
  const fieldSchema = shape[key] as z.ZodType;
  if (!fieldSchema) {
    return;
  }
  const metadata = getFieldMetadata(fieldSchema);
  if (metadata?.render === "section") {
    const showSectionInSummary = !("showInSummary" in metadata) || metadata?.showInSummary;
    if (!showSectionInSummary) {
      return;
    }
    flushCurrentSection(state);
    state.currentSectionTitle = "title" in metadata ? metadata.title : undefined;
    state.currentSectionData = {};
    return;
  }
  if (metadata?.showInSummary === false) {
    return;
  }
  if (isArrayOfObjects(fieldSchema)) {
    state.pendingArraySections.push(...sectionsFromArrayOfObjects({ data, fieldSchema, key, metadata }));
    return;
  }
  if (shouldIncludeField(fieldSchema, metadata, data)) {
    state.currentSectionData[key] = {
      label: getFieldLabel(fieldSchema, metadata) ?? key,
      value: resolveFieldValue({ applyCodec, data, key, metadata, parentData: state.parentData }),
    };
  }
}

type SectionsFromSchemaOptions = {
  applyCodec?: boolean;
  data: AutoFormData;
  schema: z.ZodObject;
  parentData?: AutoFormData;
};

/**
 * Builds summary sections from a single schema regardless of step state.
 * @param options - The options for building sections from schema
 * @param options.applyCodec - Whether to apply codecs from metadata when resolving field values
 * @param options.data - The complete form data
 * @param options.schema - The Zod schema to build sections from
 * @param options.parentData - Optional parent form data for TypeLike resolution in subforms
 * @returns Array of summary sections
 */
export function sectionsFromSchema({ schema, data, parentData, applyCodec }: SectionsFromSchemaOptions) {
  const state: SectionBuilderState = {
    currentSectionData: {},
    currentSectionTitle: undefined,
    parentData,
    pendingArraySections: [],
    sections: [],
  };
  for (const key of Object.keys(schema.shape)) {
    processFieldForSection({ applyCodec, data, key, shape: schema.shape, state });
  }
  flushCurrentSection(state);
  return state.sections;
}

function sectionsFromEditableStep(schema: z.ZodObject, data: AutoFormData, parentData?: AutoFormData) {
  const stepMeta = getStepMetadata(schema);
  const stepState = stepMeta?.state;
  if (stepState === "readonly" || stepState === "upcoming") {
    return [];
  }
  return sectionsFromSchema({ data, parentData, schema });
}

/**
 * Groups form data by sections for summary display
 * @param schemas - Array of Zod schemas for all steps
 * @param data - The complete form data
 * @returns Array of section groups, each containing a title and data
 */
export function sectionsFromEditableSteps(schemas: z.ZodObject[], data: AutoFormData) {
  const sections: Array<AutoFormSummarySection> = [];
  for (const schema of schemas) {
    const stepSections = sectionsFromEditableStep(schema, data);
    sections.push(...stepSections);
  }
  return sections;
}

/**
 * Groups form data by step and then by sections for summary display.
 * Each group contains the step title and its sections.
 * Skips readonly and upcoming steps.
 * @param schemas - Array of Zod schemas for all steps
 * @param data - The complete form data
 * @param parentData - Optional parent form data when in subform
 * @returns Array of step groups, each containing a step title and sections
 */
export function groupedSectionsFromEditableSteps(
  schemas: z.ZodObject[],
  data: AutoFormData,
  parentData?: AutoFormData,
) {
  const groups: Array<AutoFormSummaryStepGroup> = [];
  for (const schema of schemas) {
    const sections = sectionsFromEditableStep(schema, data, parentData);
    if (sections.length === 0) {
      continue;
    }
    const stepMeta = getStepMetadata(schema);
    groups.push({ sections, stepTitle: typeLikeResolver(stepMeta?.title, data, parentData) ?? undefined });
  }
  return groups;
}
