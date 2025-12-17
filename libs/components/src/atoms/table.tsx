import { cn } from "@monorepo/utils";
import { TableBody as ShadTableBody, TableCell as ShadTableCell, TableHead as ShadTableHead, TableHeader as ShadTableHeader, TableRow as ShadTableRow } from "../shadcn/table";

export function TableRow({ className, ...props }: React.ComponentProps<typeof ShadTableRow>) {
  const classes = cn(className, "border-slate-200");
  return <ShadTableRow className={classes} data-slot="table-row" {...props} />;
}

export function TableBody({ className, ...props }: React.ComponentProps<typeof ShadTableBody>) {
  const classes = cn(className, "[&_tr:last-child]:border-b border-slate-200");
  return <ShadTableBody className={classes} data-slot="table-body" {...props} />;
}

export function TableHeader({ className, ...props }: React.ComponentProps<typeof ShadTableHeader>) {
  const classes = cn(className, "bg-zinc-100");
  return <ShadTableHeader className={classes} data-slot="table-header" {...props} />;
}

export function TableCell({ className, ...props }: React.ComponentProps<typeof ShadTableCell>) {
  const classes = cn(className, "p-4");
  return <ShadTableCell className={classes} data-slot="table-cell" {...props} />;
}

export function TableHead({ className, ...props }: React.ComponentProps<typeof ShadTableHead>) {
  const classes = cn(className, "px-4 py-3 text-zinc-500 font-medium");
  return <ShadTableHead className={classes} data-slot="table-head" {...props} />;
}

export { Table } from "../shadcn/table";

// TODO : ideally we add data-testid handling (and other customizations) like in button.tsx instead of just exposing the raw shadcn component
