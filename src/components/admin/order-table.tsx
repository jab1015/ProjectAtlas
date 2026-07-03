"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Order {
  _id: string;
  productName: string;
  customerEmail: string;
  customerName?: string;
  amountCents: number;
  currency: string;
  fulfillmentStatus: "pending" | "fulfilled" | "failed";
  createdAt: number;
}

interface OrderTableProps {
  orders: Order[];
}

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

const statusConfig = {
  pending: { label: "Pending", className: "bg-secondary text-secondary-foreground border-border" },
  fulfilled: { label: "Fulfilled", className: "bg-accent text-accent-foreground border-accent-foreground/20" },
  failed: { label: "Failed", className: "bg-destructive/10 text-destructive border-destructive/20" },
} as const;

export function OrderTable({ orders }: OrderTableProps) {
  if (orders.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">No orders yet</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Orders will appear here when customers make purchases.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Date
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Customer
            </th>
            <th className="px-4 py-3 text-left font-medium text-muted-foreground">
              Product
            </th>
            <th className="px-4 py-3 text-right font-medium text-muted-foreground">
              Amount
            </th>
            <th className="px-4 py-3 text-center font-medium text-muted-foreground">
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const status = statusConfig[order.fulfillmentStatus];
            return (
              <tr
                key={order._id}
                className="border-b last:border-b-0 hover:bg-muted/30 transition-colors"
              >
                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">
                  {formatDate(order.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <div>
                    {order.customerName && (
                      <p className="font-medium">{order.customerName}</p>
                    )}
                    <a
                      href={`mailto:${order.customerEmail}`}
                      className="text-primary hover:underline"
                    >
                      {order.customerEmail}
                    </a>
                  </div>
                </td>
                <td className="px-4 py-3 font-medium">{order.productName}</td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                  {formatCurrency(order.amountCents, order.currency)}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", status.className)}
                  >
                    {status.label}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
