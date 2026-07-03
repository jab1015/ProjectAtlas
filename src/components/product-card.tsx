import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PriceDisplay } from "@/components/price-display";

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

interface ProductCardProps {
  product: Product;
  className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
  const imageUrl = product.thumbnailUrl ?? product.coverImageUrl;

  return (
    <Link
      href={`/products/${product.slug}`}
      className={cn(
        "group block overflow-hidden rounded-lg border border-border bg-card transition-all hover:shadow-lg hover:-translate-y-0.5",
        className
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20">
            <span className="text-4xl font-bold text-primary/30">
              {product.title.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {product.priceAmountCents === 0 && (
          <div className="absolute left-3 top-3">
            <Badge variant="default">Free</Badge>
          </div>
        )}

        {product.compareAtPriceCents &&
          product.compareAtPriceCents > product.priceAmountCents &&
          product.priceAmountCents > 0 && (
            <div className="absolute right-3 top-3">
              <Badge variant="destructive">Sale</Badge>
            </div>
          )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
          {product.title}
        </h3>
        {product.shortDescription && (
          <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
            {product.shortDescription}
          </p>
        )}
        <div className="mt-3">
          <PriceDisplay
            amountCents={product.priceAmountCents}
            currency={product.currency ?? "USD"}
            compareAtCents={product.compareAtPriceCents}
          />
        </div>
      </div>
    </Link>
  );
}
