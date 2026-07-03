import { cn } from "@/lib/utils";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { Package } from "lucide-react";

interface Product {
  title: string;
  slug: string;
  shortDescription?: string;
  priceAmountCents: number;
  compareAtPriceCents?: number;
  coverImageUrl?: string;
  thumbnailUrl?: string;
  currency?: string;
}

interface ProductGridProps {
  products: Product[];
  className?: string;
}

export function ProductGrid({ products, className }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No products yet"
        description="Check back soon for new digital products."
      />
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {products.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  );
}
