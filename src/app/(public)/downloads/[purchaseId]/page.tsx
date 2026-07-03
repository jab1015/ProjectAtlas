"use client";

import { use } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { DownloadButton } from "@/components/download-button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  Package,
  ShieldCheck,
} from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";

export default function DownloadPage({
  params,
}: {
  params: Promise<{ purchaseId: string }>;
}) {
  const { purchaseId } = use(params);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const purchase = useQuery(
    api.purchases.getByToken,
    token ? { downloadToken: token } : "skip"
  );

  const productFiles = useQuery(
    api.files.getByProduct,
    purchase?.product
      ? { productId: purchase.product._id }
      : "skip"
  );

  // No token provided
  if (!token) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={AlertTriangle}
          title="Invalid Download Link"
          description="This download link is missing a valid token. Please use the link from your purchase confirmation email."
          ctaText="Back to Atlas"
          ctaLink="/"
        />
      </div>
    );
  }

  // Loading
  if (purchase === undefined) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-5 w-64" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Invalid token
  if (purchase === null) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
        <EmptyState
          icon={AlertTriangle}
          title="Download Not Found"
          description="This download link is invalid or has expired. Please check your purchase confirmation email for the correct link."
          ctaText="Back to Atlas"
          ctaLink="/"
        />
      </div>
    );
  }

  const product = purchase.product;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Your Download is Ready</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Product Info */}
          <div className="flex items-start gap-4 rounded-lg border border-border p-4">
            {product?.coverImageUrl ? (
              <img
                src={product.coverImageUrl}
                alt={product.title}
                className="h-16 w-16 rounded-md object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-secondary/20">
                <Package className="h-8 w-8 text-primary/40" />
              </div>
            )}
            <div>
              <h2 className="font-semibold text-foreground">
                {product?.title ?? "Product"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Purchased by {purchase.customerEmail}
              </p>
              {purchase.fulfillmentStatus === "fulfilled" && (
                <Badge variant="default" className="mt-2 gap-1">
                  <ShieldCheck className="h-3 w-3" />
                  Fulfilled
                </Badge>
              )}
            </div>
          </div>

          {/* Download Files */}
          <div>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-foreground">
              <Download className="h-4 w-4" />
              Files
            </h3>
            {productFiles === undefined ? (
              <div className="space-y-2">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-14 w-full" />
              </div>
            ) : productFiles.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No files are available for download yet. Please check back later
                or contact support.
              </p>
            ) : (
              <div className="space-y-2">
                {productFiles.map((file: { _id: string; displayName: string; fileSize: number; storageId: Id<"_storage"> }) => (
                  <DownloadFileItem
                    key={file._id}
                    fileName={file.displayName}
                    fileSize={file.fileSize}
                    storageId={file.storageId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Account CTA */}
          <div className="rounded-lg bg-muted/50 p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Create an account for permanent access to your downloads and
              future purchases.
            </p>
            <div className="mt-3">
              <Button variant="outline" size="sm" asChild>
                <Link href="/sign-up">Create Account</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function DownloadFileItem({
  fileName,
  fileSize,
  storageId,
}: {
  fileName: string;
  fileSize: number;
  storageId: Id<"_storage">;
}) {
  const downloadUrl = useQuery(api.files.getDownloadUrl, { storageId });

  return (
    <DownloadButton
      fileName={fileName}
      fileSize={fileSize}
      downloadUrl={downloadUrl ?? undefined}
    />
  );
}
