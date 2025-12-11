import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, within } from "storybook/test";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table";

const invoices = [
  {
    invoice: "INV001",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    totalAmount: "$250.00",
  },
  {
    invoice: "INV002",
    paymentMethod: "PayPal",
    paymentStatus: "Pending",
    totalAmount: "$150.00",
  },
  {
    invoice: "INV003",
    paymentMethod: "Bank Transfer",
    paymentStatus: "Unpaid",
    totalAmount: "$350.00",
  },
  {
    invoice: "INV004",
    paymentMethod: "Credit Card",
    paymentStatus: "Paid",
    totalAmount: "$450.00",
  },
];

/**
 * Powerful table and datagrids built using TanStack Table.
 */
const meta = {
  argTypes: {},
  component: Table,
  render: args => (
    <Table {...args}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Invoice</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Method</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {invoices.map(invoice => (
          <TableRow key={invoice.invoice}>
            <TableCell className="font-medium">{invoice.invoice}</TableCell>
            <TableCell>{invoice.paymentStatus}</TableCell>
            <TableCell>{invoice.paymentMethod}</TableCell>
            <TableCell className="text-right">{invoice.totalAmount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
  tags: ["autodocs"],
  title: "Commons/Atoms/Table",
} satisfies Meta<typeof Table>;

export default meta;

type Story = StoryObj<typeof meta>;

/**
 * The default form of the table.
 */
export const Default: Story = {
  play: ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Table exists
    const table = canvas.getByRole("table");
    expect(table).toBeInTheDocument();

    // Header cells exist
    expect(canvas.getByText("Invoice")).toBeInTheDocument();
    expect(canvas.getByText("Status")).toBeInTheDocument();
    expect(canvas.getByText("Method")).toBeInTheDocument();
    expect(canvas.getByText("Amount")).toBeInTheDocument();

    // There should be exactly 1 header row + 4 data rows = 5 rows
    const rows = canvas.getAllByRole("row");
    expect(rows.length).toBe(5);

    // Check each invoice row individually to avoid "multiple elements" issues
    for (const invoice of invoices) {
      // Find the cell with the invoice id, then go up to the row
      const invoiceCell = canvas.getByText(invoice.invoice);
      const row = invoiceCell.closest("tr");
      expect(row).not.toBeNull();

      const rowUtils = within(row as HTMLTableRowElement);

      // Now within this row, these texts are unique
      expect(rowUtils.getByText(invoice.paymentStatus)).toBeInTheDocument();
      expect(rowUtils.getByText(invoice.paymentMethod)).toBeInTheDocument();
      expect(rowUtils.getByText(invoice.totalAmount)).toBeInTheDocument();
    }
  },
};
