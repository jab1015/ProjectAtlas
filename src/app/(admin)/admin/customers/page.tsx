"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Search, Users } from "lucide-react";
import { AdminHeader } from "@/components/admin";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(timestamp));
}

interface CustomerRow {
  email: string;
  name: string;
  purchaseCount: number;
  totalSpentCents: number;
  lastPurchaseAt: number;
}

export default function CustomersPage() {
  const purchases = useQuery(api.purchases.listAll);
  const [search, setSearch] = useState("");

  const customers = useMemo(() => {
    if (!purchases) return [];

    const customerMap = new Map<string, CustomerRow>();

    for (const purchase of purchases) {
      const existing = customerMap.get(purchase.customerEmail);
      if (existing) {
        existing.purchaseCount += 1;
        existing.totalSpentCents += purchase.amountCents;
        if (purchase.createdAt > existing.lastPurchaseAt) {
          existing.lastPurchaseAt = purchase.createdAt;
          // Update name if this purchase has one and is more recent
          if (purchase.customerName) {
            existing.name = purchase.customerName;
          }
        }
      } else {
        customerMap.set(purchase.customerEmail, {
          email: purchase.customerEmail,
          name: purchase.customerName ?? "",
          purchaseCount: 1,
          totalSpentCents: purchase.amountCents,
          lastPurchaseAt: purchase.createdAt,
        });
      }
    }

    const list = Array.from(customerMap.values());
    // Sort by total spent descending
    list.sort((a, b) => b.totalSpentCents - a.totalSpentCents);
    return list;
  }, [purchases]);

  const filteredCustomers = useMemo(() => {
    if (!search) return customers;

    const q = search.toLowerCase();
    return customers.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q)
    );
  }, [customers, search]);

  if (purchases === undefined) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Customers" />
        <Skeleton className="h-12" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Customers"
        description={`${customers.length} unique customer${customers.length !== 1 ? "s" : ""}`}
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by email or name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Customer list */}
      {filteredCustomers.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <Users className="mx-auto h-8 w-8 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">
            {search
              ? "No customers match your search."
              : "No customers yet. Customers will appear here after their first purchase."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Customer
                </th>
                <th className="hidden px-4 py-3 text-center font-medium text-muted-foreground sm:table-cell">
                  Purchases
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Total Spent
                </th>
                <th className="hidden px-4 py-3 text-right font-medium text-muted-foreground md:table-cell">
                  Last Purchase
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.email}
                  className="border-b last:border-b-0 transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3">
                    <div>
                      {customer.name && (
                        <p className="font-medium">{customer.name}</p>
                      )}
                      <a
                        href={`mailto:${customer.email}`}
                        className="text-primary hover:underline"
                      >
                        {customer.email}
                      </a>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-center sm:table-cell">
                    {customer.purchaseCount}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                    {formatCurrency(customer.totalSpentCents)}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-right text-muted-foreground md:table-cell">
                    {formatDate(customer.lastPurchaseAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

    </div>
  );
}
