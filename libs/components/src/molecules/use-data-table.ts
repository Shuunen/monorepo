import {
  type ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type TableOptions,
  type TableState,
  useReactTable,
} from "@tanstack/react-table";
import type { useDataTableState } from "./use-data-table-state";

type UseDataTableProps<TData> = Omit<Partial<TableOptions<TData>>, "columns" | "data"> & {
  columns: ColumnDef<TData>[];
  data: TData[];
  externalState: ReturnType<typeof useDataTableState>;
};

function getOnChangeActions(externalState: ReturnType<typeof useDataTableState>) {
  return {
    onColumnVisibilityChange: externalState.config.visibility?.enabled ? externalState.setColumnVisibility : undefined,
    onPaginationChange: externalState.config.pagination?.enabled ? externalState.setPagination : undefined,
    onSortingChange: externalState.config.sorting?.enabled ? externalState.setSorting : undefined,
  };
}
function getState(externalState: ReturnType<typeof useDataTableState>, state?: Partial<TableState>) {
  return {
    ...state,
    ...(externalState.config.pagination?.enabled && { pagination: externalState.pagination }),
    ...(externalState.config.sorting?.enabled && { sorting: externalState.sorting }),
    ...(externalState.config.visibility?.enabled && {
      columnVisibility: externalState.columnVisibility,
    }),
  };
}

export const useDataTable = <TData>({ columns, data, externalState, ...options }: UseDataTableProps<TData>) => {
  const { config } = externalState;

  const table = useReactTable({
    ...options,
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel:
      config.pagination?.enabled && !options.manualPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: config.sorting?.enabled && !options.manualSorting ? getSortedRowModel() : undefined,
    manualFiltering: options.manualFiltering ?? false,
    manualPagination: options.manualPagination ?? false,
    manualSorting: options.manualSorting ?? false,
    ...getOnChangeActions(externalState),
    state: getState(externalState, options.state),
  });

  return { table };
};
