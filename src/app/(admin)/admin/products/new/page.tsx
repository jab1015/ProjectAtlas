"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader, ProductForm } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

interface ProductFormData {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  priceAmountCents: number;
  compareAtPriceCents?: number;
  categoryId?: Id<"categories">;
  coverImageUrl: string;
  formatInfo: string;
  fileSize: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
  status: "draft" | "active" | "archived";
}

export default function NewProductPage() {
  const router = useRouter();
  const { toast } = useToast();
  const categories = useQuery(api.categories.list);
  const createProduct = useMutation(api.productsAdmin.create);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (categories === undefined) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Create Product" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  async function handleSubmit(data: ProductFormData) {
    setIsSubmitting(true);
    try {
      const productId = await createProduct({
        title: data.title,
        slug: data.slug,
        description: data.description || undefined,
        shortDescription: data.shortDescription || undefined,
        priceAmountCents: data.priceAmountCents,
        compareAtPriceCents: data.compareAtPriceCents,
        categoryId: data.categoryId,
        coverImageUrl: data.coverImageUrl || undefined,
        status: data.status,
        featured: data.featured,
        formatInfo: data.formatInfo || undefined,
        fileSize: data.fileSize || undefined,
        tags: data.tags.length > 0 ? data.tags : undefined,
        metaTitle: data.metaTitle || undefined,
        metaDescription: data.metaDescription || undefined,
      });

      toast({
        title: "Product created",
        description: "You can now add files to this product.",
      });

      router.push(`/admin/products/${productId}`);
    } catch (error) {
      console.error("Failed to create product:", error);
      toast({
        title: "Error",
        description: "Failed to create product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title="Create Product"
        description="Add a new digital product to your store"
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </Button>
        }
      />

      <div className="mx-auto max-w-2xl">
        <ProductForm
          categories={categories ?? []}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}
