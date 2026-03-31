import { act, renderHook } from "@testing-library/react";
import { useDataTable } from "./use-data-table";
import { useDataTableState } from "./use-data-table-state";

type TestData = {
  id: number;
  name: string;
};

const columns = [
  { accessorKey: "id", header: "ID" },
  { accessorKey: "name", header: "Name" },
];

const data: TestData[] = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];

describe(useDataTable, () => {
  beforeEach(() => {
    globalThis.localStorage.clear();
    vi.clearAllMocks();
  });

  it("should initialize the table with correct data and columns", () => {
    const { result: stateResult } = renderHook(() =>
      useDataTableState({
        pagination: { enabled: false },
        sorting: { enabled: false },
        visibility: { enabled: false },
        tableId: "test-table",
      }),
    );

    const { result } = renderHook(() =>
      useDataTable({
        columns,
        data,
        externalState: stateResult.current,
        enableMultiSort: false,
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        pageCount: 1,
      }),
    );

    expect(result.current.table.getRowModel().rows).toHaveLength(2);
    expect(result.current.table.getAllColumns()).toHaveLength(2);
  });
  it("should initialize the table with correct data and columns and options", () => {
    const storageKey = "test-table";
    globalThis.localStorage.setItem(`table_config_${storageKey}`, JSON.stringify({}));
    const { result: stateResult } = renderHook(() =>
      useDataTableState({
        pagination: { enabled: true },
        searching: { enabled: true },
        sorting: { enabled: true },
        tableId: storageKey,
        visibility: { enabled: true },
      }),
    );

    const { result } = renderHook(() =>
      useDataTable({
        columns,
        data,
        externalState: stateResult.current,
        enableMultiSort: false,
        manualFiltering: true,
        manualPagination: true,
        manualSorting: true,
        pageCount: 1,
      }),
    );

    expect(result.current.table.getRowModel().rows).toHaveLength(2);
    expect(result.current.table.getAllColumns()).toHaveLength(2);
  });

  it("should reflect pagination state from external state", () => {
    vi.useFakeTimers();
    const { result: stateResult } = renderHook(() =>
      useDataTableState({
        pagination: { enabled: true, initial: { pageIndex: 2, pageSize: 5 } },
        sorting: { enabled: true, initial: [{ desc: true, id: "timestamp" }] },
        searching: { enabled: true },
        visibility: { enabled: true, initial: { id: true, name: true } },
      }),
    );

    const { result } = renderHook(() =>
      useDataTable({
        columns,
        data,
        externalState: stateResult.current,
      }),
    );

    const tableState = result.current.table.getState();
    expect(stateResult.current.pagination).toMatchInlineSnapshot(`
      {
        "pageIndex": 0,
        "pageSize": 5,
      }
    `);
    act(() => {
      stateResult.current.setPagination(prev => ({ ...prev, pageIndex: 2 }));
    });
    expect(stateResult.current.pagination).toMatchInlineSnapshot(`
      {
        "pageIndex": 2,
        "pageSize": 5,
      }
    `);
    expect(tableState.sorting).toMatchInlineSnapshot(`
      [
        {
          "desc": true,
          "id": "timestamp",
        },
      ]
    `);
    expect(tableState.columnVisibility).toMatchInlineSnapshot(`
      {
        "id": true,
        "name": true,
      }
    `);
    act(() => {
      stateResult.current.setSearchQueryValue("lorem ipsum");
    });
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(stateResult.current.pagination).toMatchInlineSnapshot(`
      {
        "pageIndex": 0,
        "pageSize": 5,
      }
    `);
    expect(stateResult.current.searchQuery).toBe("lorem ipsum");
    vi.useRealTimers();
  });
});
