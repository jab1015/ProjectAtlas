"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AdminHeader, FileUploader, FileList } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";

export default function ProductFilesPage() {
  const params = useParams();
  const { toast } = useToast();
  const productId = params.id as Id<"products">;

  const product = useQuery(api.products.getById, { id: productId });
  const files = useQuery(api.productFiles.list, { productId });
  const createFile = useMutation(api.productFiles.create);
  const removeFile = useMutation(api.productFiles.remove);
  const updateSortOrder = useMutation(api.productFiles.updateSortOrder);

  if (product === undefined || files === undefined) {
    return (
      <div className="space-y-6">
        <AdminHeader title="Product Files" />
        <Skeleton className="h-48" />
        <Skeleton className="h-32" />
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

  async function handleUpload(data: {
    storageId: Id<"_storage">;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) {
    try {
      await createFile({
        productId,
        displayName: data.fileName,
        storageId: data.storageId,
        fileName: data.fileName,
        fileSize: data.fileSize,
        mimeType: data.mimeType,
      });

      toast({
        title: "File uploaded",
        description: `${data.fileName} has been added.`,
      });
    } catch (error) {
      console.error("Failed to save file:", error);
      toast({
        title: "Error",
        description: "Failed to save file record. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleDelete(fileId: Id<"productFiles">) {
    try {
      await removeFile({ id: fileId });
      toast({
        title: "File deleted",
        description: "The file has been removed.",
      });
    } catch (error) {
      console.error("Failed to delete file:", error);
      toast({
        title: "Error",
        description: "Failed to delete file. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function handleReorder(
    fileId: Id<"productFiles">,
    direction: "up" | "down"
  ) {
    const currentIndex = files!.findIndex((f: any) => f._id === fileId);
    if (currentIndex === -1) return;

    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= files!.length) return;

    const currentFile = files![currentIndex];
    const targetFile = files![targetIndex];

    try {
      // Swap sort orders
      await updateSortOrder({
        id: currentFile._id,
        sortOrder: targetFile.sortOrder ?? targetIndex,
      });
      await updateSortOrder({
        id: targetFile._id,
        sortOrder: currentFile.sortOrder ?? currentIndex,
      });
    } catch (error) {
      console.error("Failed to reorder files:", error);
      toast({
        title: "Error",
        description: "Failed to reorder files.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader
        title={`Files for ${product.title}`}
        description={`${files.length} file${files.length !== 1 ? "s" : ""} uploaded`}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/products/${productId}`}>
              <ArrowLeft className="h-4 w-4" />
              Back to Product
            </Link>
          </Button>
        }
      />

      {/* Upload area */}
      <FileUploader productId={productId} onUpload={handleUpload} />

      {/* File list */}
      <FileList
        files={files}
        onDelete={handleDelete}
        onReorder={handleReorder}
      />
    </div>
  );
}
