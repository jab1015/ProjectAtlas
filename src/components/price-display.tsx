import { cn } from "@/lib/utils";

interface PriceDisplayProps {
  amountCents: number;
  currency?: string;
  compareAtCents?: number;
  className?: string;
}

function formatPrice(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "\u20AC",
    GBP: "\u00A3",
    CAD: "CA$",
    AUD: "A$",
  };
  const symbol = symbols[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;
  return `${symbol}${amount.toFixed(2)}`;
}

export function PriceDisplay({
  amountCents,
  currency = "USD",
  compareAtCents,
  className,
}: PriceDisplayProps) {
  if (amountCents === 0) {
    return (
      <span className={cn("text-lg font-bold text-primary", className)}>
        Free
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="text-lg font-bold text-foreground">
        {formatPrice(amountCents, currency)}
      </span>
      {compareAtCents && compareAtCents > amountCents && (
        <span className="text-sm text-muted-foreground line-through">
          {formatPrice(compareAtCents, currency)}
        </span>
      )}
    </span>
  );
}
