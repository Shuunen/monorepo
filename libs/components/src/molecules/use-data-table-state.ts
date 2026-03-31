// oxlint-disable max-lines-per-function
import type { PaginationState, SortingState, VisibilityState } from "@tanstack/react-table";
import { debounce } from "es-toolkit";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";

const DEFAULT_PAGE_SIZE = 10;
const NO_PAGINATION_SIZE = 10_000;

const paginationSchema = z.object({
  pageIndex: z.number(),
  pageSize: z.number(),
});
const sortingSchema = z.array(
  z.object({
    desc: z.boolean(),
    id: z.string(),
  }),
);
const visibilitySchema = z.record(z.string(), z.boolean());

function tableFeatureConfigSchema<TData extends z.ZodType>(dataSchema: TData) {
  return z
    .union([
      z.object({
        enabled: z.literal(true),
        initial: dataSchema.optional(),
      }),
      z.object({
        enabled: z.literal(false),
      }),
    ])
    .optional();
}

type TableFeatureConfig<TData> =
  | {
      enabled: true;
      initial?: TData;
    }
  | {
      enabled: false;
    }
  | undefined;

function getFeatureInitial<TData>(config?: TableFeatureConfig<TData>): TData | undefined {
  if (config?.enabled) {
    return config.initial;
  }
  return undefined;
}

const useTableStateOptionsSchema = z.object({
  pagination: tableFeatureConfigSchema(paginationSchema),
  searching: tableFeatureConfigSchema(z.string()),
  sorting: tableFeatureConfigSchema(sortingSchema),
  tableId: z.string().optional(),
  visibility: tableFeatureConfigSchema(visibilitySchema),
});

type UseTableStateOptions = z.infer<typeof useTableStateOptionsSchema>;

export function useDataTableState({
  pagination: paginationConfig,
  sorting: sortingConfig,
  searching: searchingConfig,
  tableId,
  visibility: visibilityConfig,
}: UseTableStateOptions) {
  const storageKey = tableId ? `table_config_${tableId}` : undefined;

  const savedConfig = (() => {
    if (!storageKey || typeof globalThis === "undefined") {
      return undefined;
    }
    const saved = globalThis.localStorage.getItem(storageKey);

    if (saved === null) {
      // Empty local storage
      return undefined;
    }

    const parsed = useTableStateOptionsSchema.safeParse(JSON.parse(saved));

    /* v8 ignore start */
    if (parsed.error) {
      return undefined;
    }
    /* v8 ignore stop */

    return parsed.data;
  })();

  function getDefaultValues(): VisibilityState {
    if (visibilityConfig?.enabled) {
      return getFeatureInitial(savedConfig?.visibility) ?? getFeatureInitial(visibilityConfig) ?? {};
    }
    return {};
  }

  const defaultValues = getDefaultValues();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(defaultValues);

  const [pagination, setPagination] = useState<PaginationState>(() => {
    if (!paginationConfig?.enabled) {
      return { pageIndex: 0, pageSize: NO_PAGINATION_SIZE };
    }
    const pConfig = getFeatureInitial<PaginationState>(savedConfig?.pagination) ??
      getFeatureInitial<PaginationState>(paginationConfig) ?? { pageIndex: 0, pageSize: DEFAULT_PAGE_SIZE };
    pConfig.pageIndex = 0;
    return pConfig;
  });

  const aElement =
    getFeatureInitial<SortingState>(savedConfig?.sorting) ?? getFeatureInitial<SortingState>(sortingConfig) ?? [];
  const [sorting, setSorting] = useState<SortingState>(aElement);

  const bElement = getFeatureInitial<string>(searchingConfig) ?? "";
  const [searchQuery, setSearchQuery] = useState<string>(bElement);

  const setSearchQueryValue = useMemo(
    () =>
      // oxlint-disable-next-line max-nested-callbacks
      debounce((value: string) => {
        setSearchQuery(value);
        // oxlint-disable-next-line max-nested-callbacks
        setPagination(prev => ({ pageIndex: 0, pageSize: prev.pageSize }));
        // oxlint-disable-next-line no-magic-numbers
      }, 500),
    [],
  );

  useEffect(() => {
    if (!storageKey || typeof globalThis === "undefined") {
      return;
    }

    const configToSave = {
      ...(paginationConfig?.enabled && { pagination }),
      ...(sortingConfig?.enabled && { sorting }),
      ...(visibilityConfig?.enabled && { visibility: columnVisibility }),
    };

    globalThis.localStorage.setItem(storageKey, JSON.stringify(configToSave));
  }, [
    columnVisibility,
    pagination,
    sorting,
    storageKey,
    paginationConfig?.enabled,
    sortingConfig?.enabled,
    visibilityConfig?.enabled,
  ]);

  return {
    columnVisibility,
    config: {
      pagination: paginationConfig,
      sorting: sortingConfig,
      visibility: visibilityConfig,
    },
    pagination,
    searchQuery,
    setColumnVisibility,
    setPagination,
    setSearchQueryValue,
    setSorting,
    sorting,
  };
}
