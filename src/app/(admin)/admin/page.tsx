"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import Link from "next/link";
import {
  Package,
  DollarSign,
  ShoppingCart,
  Users,
  Plus,
  ExternalLink,
} from "lucide-react";
import { AdminHeader, StatsCard, OrderTable } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

export default function AdminDashboardPage() {
  const stats = useQuery(api.purchases.getStats);
  const products = useQuery(api.products.listAll);
  const recentPurchases = useQuery(api.purchases.getRecent);

  const isLoading =
    stats === undefined ||
    products === undefined ||
    recentPurchases === undefined;

  if (isLoading) {
    return (
      <div className="space-y-8">
        <AdminHeader title="Dashboard" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  const totalProducts = products?.length ?? 0;
  const recentOrders = (recentPurchases ?? []).map((p: any) => ({
    _id: p._id,
    productName: p.product?.title ?? "Deleted Product",
    customerEmail: p.customerEmail,
    customerName: p.customerName,
    amountCents: p.amountCents,
    currency: p.currency,
    fulfillmentStatus: p.fulfillmentStatus,
    createdAt: p.createdAt,
  }));

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Dashboard"
        description="Overview of your store performance"
        action={
          <div className="flex gap-2">
            <Button asChild size="sm">
              <Link href="/admin/products/new">
                <Plus className="h-4 w-4" />
                Add Product
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href="/" target="_blank">
                <ExternalLink className="h-4 w-4" />
                View Atlas
              </Link>
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Products"
          value={totalProducts.toString()}
          icon={Package}
        />
        <StatsCard
          title="Total Revenue"
          value={formatCurrency(stats?.totalRevenueCents ?? 0)}
          icon={DollarSign}
        />
        <StatsCard
          title="Total Orders"
          value={(stats?.totalPurchases ?? 0).toString()}
          icon={ShoppingCart}
        />
        <StatsCard
          title="Unique Customers"
          value={(stats?.uniqueCustomers ?? 0).toString()}
          icon={Users}
        />
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Recent Orders</CardTitle>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/orders">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <OrderTable orders={recentOrders} />
        </CardContent>
      </Card>
    </div>
  );
}
