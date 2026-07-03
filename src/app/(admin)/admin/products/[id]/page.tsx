"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { ArrowLeft, FileIcon, Trash2 } from "lucide-react";
import { AdminHeader, ProductForm } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const productId = params.id as Id<"products">;

  const product = useQuery(api.products.getById, { id: productId });
  const categories = useQuery(api.categories.list);
  const updateProduct = useMutation(api.productsAdmin.update);
  const deleteProduct = useMutation(api.productsAdmin.remove);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (product === undefined || categories === undefined) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Edit Product" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Product Not Found" />
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-sm text-muted-foreground">
            This product could not be found. It may have been deleted.
          </p>
          <Button asChild className="mt-4" size="sm" variant="outline">
            <Link href="/admin/products">Back to Products</Link>
          </Button>
        </div>
      </div>
    );
  }

  async function handleSubmit(data: ProductFormData) {
    setIsSubmitting(true);
    try {
      await updateProduct({
        id: productId,
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
        title: "Product updated",
        description: "Your changes have been saved.",
      });
    } catch (error) {
      console.error("Failed to update product:", error);
      toast({
        title: "Error",
        description: "Failed to update product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteProduct({ id: productId });
      toast({
        title: "Product deleted",
        description: "The product and its files have been removed.",
      });
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to delete product:", error);
      toast({
        title: "Error",
        description: "Failed to delete product. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={product.title}
        description="Edit product details"
        action={
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/admin/products">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/products/${productId}/files`}>
                <FileIcon className="h-4 w-4" />
                Manage Files
              </Link>
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </div>
        }
      />

      <div className="mx-auto max-w-2xl">
        <ProductForm
          initialData={{
            title: product.title,
            slug: product.slug,
            shortDescription: product.shortDescription ?? "",
            description: product.description ?? "",
            priceAmountCents: product.priceAmountCents,
            compareAtPriceCents: product.compareAtPriceCents,
            categoryId: product.categoryId,
            coverImageUrl: product.coverImageUrl ?? "",
            formatInfo: product.formatInfo ?? "",
            fileSize: product.fileSize ?? "",
            tags: product.tags ?? [],
            metaTitle: product.metaTitle ?? "",
            metaDescription: product.metaDescription ?? "",
            featured: product.featured ?? false,
            status: product.status,
          }}
          categories={categories ?? []}
          onSubmit={handleSubmit}
          isLoading={isSubmitting}
        />
      </div>

      {/* Delete confirmation dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{product.title}&rdquo;?
              This will also delete all associated files. This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Product"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
