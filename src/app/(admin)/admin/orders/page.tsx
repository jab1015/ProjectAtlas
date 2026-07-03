"use client";

import { useState, useMemo, useCallback } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Search, Download } from "lucide-react";
import { AdminHeader, OrderTable } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

export default function OrdersPage() {
  const purchases = useQuery(api.purchases.listAll);
  const [search, setSearch] = useState("");

  const filteredOrders = useMemo(() => {
    if (!purchases) return [];

    const orders = purchases.map((p: any) => ({
      _id: p._id,
      productName: p.productName,
      customerEmail: p.customerEmail,
      customerName: p.customerName,
      amountCents: p.amountCents,
      currency: p.currency,
      fulfillmentStatus: p.fulfillmentStatus,
      createdAt: p.createdAt,
    }));

    if (!search) return orders;

    const q = search.toLowerCase();
    return orders.filter(
      (order: any) =>
        order.customerEmail.toLowerCase().includes(q) ||
        (order.customerName?.toLowerCase().includes(q) ?? false) ||
        order.productName.toLowerCase().includes(q)
    );
  }, [purchases, search]);

  const handleExportCSV = useCallback(() => {
    if (!purchases || purchases.length === 0) return;

    const headers = [
      "Date",
      "Customer Email",
      "Customer Name",
      "Product",
      "Amount",
      "Currency",
      "Status",
    ];

    const rows = purchases.map((p: any) => [
      formatDate(p.createdAt),
      p.customerEmail,
      p.customerName ?? "",
      p.productName,
      (p.amountCents / 100).toFixed(2),
      p.currency.toUpperCase(),
      p.fulfillmentStatus,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row: any[]) =>
        row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `orders-${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }, [purchases]);

  if (purchases === undefined) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Orders" />
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Orders"
        description={`${purchases.length} total order${purchases.length !== 1 ? "s" : ""}`}
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={purchases.length === 0}
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by customer email, name, or product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Orders table */}
      <OrderTable orders={filteredOrders} />

      {search && filteredOrders.length === 0 && purchases.length > 0 && (
        <p className="text-center text-sm text-muted-foreground">
          No orders match your search.
        </p>
      )}
    </div>
  );
}
