"use client";

import { use, useEffect } from "react";
import posthog from "posthog-js";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { BuyButton } from "@/components/buy-button";
import { PriceDisplay } from "@/components/price-display";
import { ProductGrid } from "@/components/product-grid";
import { TestimonialCard } from "@/components/testimonial-card";
import { FaqAccordion } from "@/components/faq-accordion";
import { MarkdownContent } from "@/components/markdown-content";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ChevronRight, FileText, HardDrive, ShoppingBag } from "lucide-react";

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const product = useQuery(api.products.getBySlug, { slug });

  const relatedProducts = useQuery(
    api.products.getRelated,
    product
      ? { productId: product._id, categoryId: product.categoryId }
      : "skip"
  );

  const testimonials = useQuery(
    api.testimonials.list,
    product ? { productId: product._id } : "skip"
  );

  const faqEntries = useQuery(
    api.faqEntries.list,
    product ? { productId: product._id } : "skip"
  );

  // MAD-26: fire product_viewed once product data resolves. $groups.business
  // is set inline as belt-and-suspenders against a posthog.group() global
  // tagging bug; the global tagging in posthog.tsx is the load-bearing path.
  useEffect(() => {
    if (!product) return;
    posthog.capture("product_viewed", {
      productId: product._id,
      productTitle: product.title,
      priceAmountCents: product.priceAmountCents,
      currency: product.currency,
      slug: product.slug,
      $groups: { business: process.env.NEXT_PUBLIC_BUSINESS_ID },
    });
  }, [product?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Loading state
  if (product === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb skeleton */}
        <div className="mb-8 flex items-center gap-2">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-[4/3] w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    );
  }

  // Product not found
  if (product === null) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-foreground">
          Product Not Found
        </h1>
        <p className="mt-2 text-muted-foreground">
          The product you are looking for does not exist or has been removed.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block text-primary hover:underline"
        >
          Browse All Products
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-1 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground transition-colors">
          Home
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link
          href="/products"
          className="hover:text-foreground transition-colors"
        >
          Products
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground">{product.title}</span>
      </nav>

      {/* Product Detail */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Cover Image */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border">
          {product.coverImageUrl ? (
            <img
              src={product.coverImageUrl}
              alt={product.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20">
              <span className="text-6xl font-bold text-primary/30">
                {product.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="flex flex-col">
          {/* Category */}
          {product.categoryName && (
            <p className="mb-2 text-sm font-medium text-primary">
              {product.categoryName}
            </p>
          )}

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            {product.title}
          </h1>

          {/* Price */}
          <div className="mt-4">
            <PriceDisplay
              amountCents={product.priceAmountCents}
              currency={product.currency}
              compareAtCents={product.compareAtPriceCents}
              className="text-2xl"
            />
          </div>

          {/* Badges */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {product.formatInfo && (
              <Badge variant="secondary" className="gap-1">
                <FileText className="h-3 w-3" />
                {product.formatInfo}
              </Badge>
            )}
            {product.fileSize && (
              <Badge variant="secondary" className="gap-1">
                <HardDrive className="h-3 w-3" />
                {product.fileSize}
              </Badge>
            )}
            {(product.totalSales ?? 0) > 0 && (
              <Badge variant="outline" className="gap-1">
                <ShoppingBag className="h-3 w-3" />
                {product.totalSales}+ sold
              </Badge>
            )}
          </div>

          {/* Short Description */}
          {product.shortDescription && (
            <p className="mt-6 text-muted-foreground">
              {product.shortDescription}
            </p>
          )}

          {/* Buy Button */}
          <div className="mt-8">
            <BuyButton
              checkoutUrl={product.checkoutUrl}
              priceAmountCents={product.priceAmountCents}
              currency={product.currency}
              productId={product._id}
              productTitle={product.title}
            />
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {product.tags.map((tag: string) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Full Description */}
      {product.description && (
        <>
          <Separator className="my-12" />
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              About This Product
            </h2>
            <MarkdownContent content={product.description} />
          </div>
        </>
      )}

      {/* Product FAQ */}
      {faqEntries && faqEntries.length > 0 && (
        <>
          <Separator className="my-12" />
          <div className="mx-auto max-w-3xl">
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Frequently Asked Questions
            </h2>
            <FaqAccordion items={faqEntries} />
          </div>
        </>
      )}

      {/* Product Testimonials */}
      {testimonials && testimonials.length > 0 && (
        <>
          <Separator className="my-12" />
          <div>
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              What Customers Say
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((testimonial: { _id: string; customerName: string; customerTitle?: string; quote: string; rating?: number }) => (
                <TestimonialCard
                  key={testimonial._id}
                  customerName={testimonial.customerName}
                  customerTitle={testimonial.customerTitle}
                  quote={testimonial.quote}
                  rating={testimonial.rating}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Related Products */}
      {relatedProducts && relatedProducts.length > 0 && (
        <>
          <Separator className="my-12" />
          <div>
            <h2 className="mb-6 text-2xl font-bold text-foreground">
              Related Products
            </h2>
            <ProductGrid products={relatedProducts} />
          </div>
        </>
      )}
    </div>
  );
}
