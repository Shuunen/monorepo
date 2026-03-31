// oxlint-disable react/no-multi-comp
// oxlint-disable max-lines-per-function, no-null
// oxlint-disable typescript/no-explicit-any

import { cn } from "@monorepo/utils";
import { flexRender, type Table as TableType } from "@tanstack/react-table";
import { createContext, useContext, useMemo, useState } from "react";
import { Button } from "../atoms/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "../atoms/dropdown-menu";
import { Input } from "../atoms/input";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../atoms/pagination";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../atoms/select";
import { Skeleton } from "../atoms/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../atoms/table";
import { IconArrowDown } from "../icons/icon-arrow-down";
import { IconArrowUp } from "../icons/icon-arrow-up";
import { IconSelect } from "../icons/icon-select";
import { IconSettings } from "../icons/icon-settings";
// oxlint-disable-next-line no-restricted-imports
import { DropdownMenuCheckboxItem, DropdownMenuLabel, DropdownMenuSeparator } from "../shadcn/dropdown-menu";

// oxlint-disable-next-line react/only-export-components
export const order = {
  asc: "ASC",
  desc: "DESC",
} as const;

// oxlint-disable-next-line typescript/no-explicit-any
const TableContext = createContext<{ table: TableType<any>; isLoading: boolean } | null>(null);

function useTableContext() {
  const context = useContext(TableContext);
  if (!context) {
    throw new Error("Table compound components must be used within <DataTable />");
  }
  return context;
}

/* DataTable */
type DataTableProps<TData> = {
  table: TableType<TData>;
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
};

export function DataTable<TData>({ table, isLoading, className, children }: DataTableProps<TData>) {
  const value = useMemo(() => ({ isLoading, table }), [isLoading, table]);
  return (
    <TableContext.Provider value={value}>
      <div className={className || "space-y-4"}>{children}</div>
    </TableContext.Provider>
  );
}

// --- HEADER ---
DataTable.Header = function DataTableHeader({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 px-1">{children}</div>;
};

type DataTableMainProps = {
  selectColumnId?: string;
  onRowClick?: (row: { original: any }) => void;
};

// --- TABLE ---
DataTable.Main = function DataTableMain(props: DataTableMainProps) {
  const { table, isLoading } = useTableContext();
  const visibleColumnCount = table.getVisibleLeafColumns().length;
  const visibleRowCount = table.getRowModel().rows.length;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map(headerGroup => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map(header => {
                if (header.id !== props.selectColumnId) {
                  return (
                    <TableHead className="min-w-[100px]" key={header.id}>
                      <Button
                        variant="ghost"
                        name={`sort-${header.column.id}`}
                        className={cn(
                          "pl-0 select-none",
                          header.column.getCanSort() ? "cursor-pointer" : "pointer-events-none",
                        )}
                        onClick={() => {
                          header.column.toggleSorting(
                            header.column.getIsSorted() !== order.desc.toLocaleLowerCase(),
                            false,
                          );
                        }}
                        onKeyDown={() => {
                          header.column.toggleSorting(
                            header.column.getIsSorted() !== order.desc.toLocaleLowerCase(),
                            false,
                          );
                        }}
                      >
                        <div
                          className={cn("flex items-center gap-1", header.column.getIsSorted() && "text-foreground")}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && header.column.getIsSorted() === false && (
                            <IconSelect className="size-3" />
                          )}
                          {header.column.getCanSort() &&
                            header.column.getIsSorted() === order.asc.toLocaleLowerCase() && (
                              <IconArrowUp className="size-3" />
                            )}
                          {header.column.getCanSort() &&
                            header.column.getIsSorted() === order.desc.toLocaleLowerCase() && (
                              <IconArrowDown className="size-3" />
                            )}
                        </div>
                      </Button>
                    </TableHead>
                  );
                }

                return (
                  <TableHead key={header.id}>
                    {!header.isPlaceholder && flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <>
              {Array.from({ length: table.getState().pagination.pageSize }).map((__, rowIndex) => (
                <TableRow key={`row-${rowIndex}`}>
                  {Array.from({ length: table.getAllColumns().length }).map((___, colIndex) => (
                    <TableCell key={`col-${colIndex}`}>
                      <Skeleton className="h-6 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </>
          ) : null}

          {!isLoading && visibleRowCount === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleColumnCount} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          ) : null}

          {!isLoading && visibleRowCount > 0
            ? table.getPaginationRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  // oxlint-disable-next-line typescript/no-non-null-assertion
                  onClick={props.onRowClick ? () => props.onRowClick!(row) : undefined}
                  className={rowClassname(row.original)}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            : null}
        </TableBody>
      </Table>
    </div>
  );
};

function rowClassname(rowOriginal: any): string {
  if ((rowOriginal as { isRead?: boolean })?.isRead) {
    return "";
  }
  return "bg-gray-50 font-semibold";
}

// --- FOOTER ---
DataTable.Footer = function DataTableFooter({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4 px-1">{children}</div>;
};

// --- ALIGNMENT ---
DataTable.Left = function DataTableLeft({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 items-center justify-start gap-2">{children}</div>;
};

DataTable.Right = function DataTableRight({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-1 items-center justify-end gap-2">{children}</div>;
};

// --- SUB-COMPONENTS ---
type DataTableSearchProps = {
  onChange: (value: string) => void;
};
DataTable.Search = function DataTableSearch(props: DataTableSearchProps) {
  const [searchValue, setSearchValue] = useState("");
  return (
    <Input
      placeholder="Search..."
      className="w-64"
      value={searchValue}
      type="search"
      name="table-search"
      onChange={event => {
        setSearchValue(event.target.value);
        props.onChange(event.target.value);
      }}
    />
  );
};

DataTable.ViewOptions = function DataTableViewOptions() {
  const { table } = useTableContext();
  const columns = table.getAllColumns().filter(
    column =>
      // oxlint-disable-next-line no-typeof-undefined
      typeof column.accessorFn !== "undefined" && column.getCanHide(),
  );

  // oxlint-disable-next-line consistent-function-scoping, no-explicit-any
  function getColumnName(column: any) {
    const { header } = column.columnDef;
    if (typeof header === "string") {
      return header;
    }
    return column.id as string;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild name="columns">
        <Button name="visible-columns" variant="outline" size="sm" className="ml-auto flex h-9 gap-2">
          <IconSettings />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[180px]" name="columns">
        <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {columns.map(column => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={value => column.toggleVisibility(value)}
          >
            {getColumnName(column)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

DataTable.PageSizeSelector = function DataTablePageSizeSelector() {
  const { table } = useTableContext();

  const { pageSize } = table.getState().pagination;

  return (
    <div className="flex items-center gap-2">
      <p className="text-sm font-medium">Rows per page</p>
      <Select
        name="page-select"
        value={`${pageSize}`}
        onValueChange={value => {
          table.setPageSize(Number(value));
        }}
      >
        <SelectTrigger className="h-8 w-[70px]" name="trigger-page">
          <SelectValue placeholder={pageSize} />
        </SelectTrigger>
        <SelectContent side="top">
          {/* oxlint-disable-next-line no-magic-numbers */}
          {[10, 25, 50].map(size => (
            <SelectItem key={size} value={`${size}`} name="page">
              {size}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
DataTable.Pagination = function DataTablePagination() {
  const { table } = useTableContext();
  // Function to generate pagination items using standard logic
  // oxlint-disable-next-line max-statements
  const renderPaginationItems = () => {
    const items = [];
    const { pageIndex } = table.getState().pagination;
    const pageCount = table.getPageCount();
    const siblingCount = 1; // Number of pages on each side of current

    // Add Previous button
    items.push(
      <PaginationItem key="prev">
        <PaginationPrevious
          onClick={event => {
            event.preventDefault();
            table.previousPage();
          }}
          className={table.getCanPreviousPage() ? undefined : cn("pointer-events-none opacity-50")}
        />
      </PaginationItem>,
    );

    // Determine the range of pages to display
    // siblingCount + firstPage + lastPage + currentPage + 2*ellipsis
    // oxlint-disable-next-line no-magic-numbers
    const totalPageNumbers = siblingCount + 5;

    if (pageCount <= totalPageNumbers) {
      // Show all pages if total pages is less than or equal to the max display count
      for (let index = 0; index < pageCount; index += 1) {
        items.push(
          <PaginationItem key={index}>
            <PaginationLink
              onClick={event => {
                event.preventDefault();
                table.setPageIndex(index);
              }}
              isActive={pageIndex === index}
            >
              {index + 1}
            </PaginationLink>
          </PaginationItem>,
        );
      }
    } else {
      // Show first page
      items.push(
        <PaginationItem key={0}>
          <PaginationLink
            onClick={event => {
              event.preventDefault();
              table.setPageIndex(0);
            }}
            isActive={pageIndex === 0}
          >
            1
          </PaginationLink>
        </PaginationItem>,
      );

      // Calculate boundaries for the middle section
      const leftSiblingIndex = Math.max(pageIndex - siblingCount, 1); // Must be at least page 2 (index 1)
      // oxlint-disable-next-line no-magic-numbers
      const rightSiblingIndex = Math.min(pageIndex + siblingCount, pageCount - 2); // Must be at most second to last page (index pageCount - 2)

      const shouldShowLeftEllipsis = leftSiblingIndex > 1;
      // oxlint-disable-next-line no-magic-numbers
      const shouldShowRightEllipsis = rightSiblingIndex < pageCount - 2;

      // Show left ellipsis if needed
      if (shouldShowLeftEllipsis) {
        items.push(
          <PaginationItem key="left-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      // Show pages around the current page
      // Adjust loop range based on ellipsis presence to avoid duplicates near edges
      const startPage = leftSiblingIndex;
      const endPage = rightSiblingIndex;

      for (let index = startPage; index <= endPage; index += 1) {
        items.push(
          <PaginationItem key={index}>
            <PaginationLink
              onClick={event => {
                event.preventDefault();
                table.setPageIndex(index);
              }}
              isActive={pageIndex === index}
            >
              {index + 1}
            </PaginationLink>
          </PaginationItem>,
        );
      }

      // Show right ellipsis if needed
      if (shouldShowRightEllipsis) {
        items.push(
          <PaginationItem key="right-ellipsis">
            <PaginationEllipsis />
          </PaginationItem>,
        );
      }

      // Show last page
      items.push(
        <PaginationItem key={pageCount - 1}>
          <PaginationLink
            onClick={event => {
              event.preventDefault();
              table.setPageIndex(pageCount - 1);
            }}
            isActive={pageIndex === pageCount - 1}
          >
            {pageCount}
          </PaginationLink>
        </PaginationItem>,
      );
    }

    // Add Next button
    items.push(
      <PaginationItem key="next">
        <PaginationNext
          onClick={event => {
            event.preventDefault();
            table.nextPage();
          }}
          className={table.getCanNextPage() ? undefined : cn("pointer-events-none opacity-50")}
        />
      </PaginationItem>,
    );

    return items;
  };

  return (
    <Pagination className="mx-0 w-fit">
      <PaginationContent>{renderPaginationItems()}</PaginationContent>
    </Pagination>
  );
};
