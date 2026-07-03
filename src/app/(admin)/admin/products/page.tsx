"use client";

import { useState, useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import { AdminHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

const statusConfig = {
  draft: {
    label: "Draft",
    className: "bg-secondary text-secondary-foreground border-border",
  },
  active: {
    label: "Active",
    className: "bg-accent text-accent-foreground border-accent-foreground/20",
  },
  archived: {
    label: "Archived",
    className: "bg-muted text-muted-foreground border-border",
  },
} as const;

function formatCurrency(cents: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(cents / 100);
}

export default function ProductsPage() {
  const router = useRouter();
  const products = useQuery(api.products.listAll);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filteredProducts = useMemo(() => {
    if (!products) return [];

    return products.filter((product: any) => {
      // Search filter
      if (search) {
        const q = search.toLowerCase();
        if (
          !product.title.toLowerCase().includes(q) &&
          !product.slug.toLowerCase().includes(q)
        ) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && product.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [products, search, statusFilter]);

  if (products === undefined) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Products" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Products"
        description={`${products.length} total product${products.length !== 1 ? "s" : ""}`}
        action={
          <Button asChild size="sm">
            <Link href="/admin/products/new">
              <Plus className="h-4 w-4" />
              Add Product
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Product list */}
      {filteredProducts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            {search || statusFilter !== "all"
              ? "No products match your filters."
              : "No products yet. Create your first product to get started."}
          </p>
          {!search && statusFilter === "all" && (
            <Button asChild className="mt-4" size="sm">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                  Product
                </th>
                <th className="hidden px-4 py-3 text-left font-medium text-muted-foreground sm:table-cell">
                  Category
                </th>
                <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                  Price
                </th>
                <th className="hidden px-4 py-3 text-center font-medium text-muted-foreground sm:table-cell">
                  Sales
                </th>
                <th className="px-4 py-3 text-center font-medium text-muted-foreground">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product: any) => {
                const status = statusConfig[product.status as keyof typeof statusConfig];
                return (
                  <tr
                    key={product._id}
                    className="cursor-pointer border-b last:border-b-0 transition-colors hover:bg-muted/30"
                    onClick={() =>
                      router.push(`/admin/products/${product._id}`)
                    }
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {product.coverImageUrl ? (
                          <img
                            src={product.coverImageUrl}
                            alt={product.title}
                            className="h-10 w-10 rounded object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-muted" />
                        )}
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {product.title}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            /{product.slug}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {product.categoryName ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium">
                      {formatCurrency(
                        product.priceAmountCents,
                        product.currency
                      )}
                    </td>
                    <td className="hidden px-4 py-3 text-center sm:table-cell">
                      {product.totalSales ?? 0}
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
      )}
    </div>
  );
}
