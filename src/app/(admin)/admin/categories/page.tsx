"use client";

import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { AdminHeader, CategoryManager } from "@/components/admin";
import { Skeleton } from "@/components/ui/skeleton";

export default function CategoriesPage() {
  const categories = useQuery(api.categories.list);

  if (categories === undefined) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Categories" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Categories"
        description="Organize your products into categories"
      />

      <div className="mx-auto max-w-xl">
        <CategoryManager categories={categories ?? []} />
      </div>
    </div>
  );
}
