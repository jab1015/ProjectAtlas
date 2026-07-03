"use client";

import posthog from "posthog-js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { decorateCheckoutUrl } from "@/lib/posthog";
import { ShoppingCart } from "lucide-react";

interface BuyButtonProps {
  checkoutUrl?: string;
  priceAmountCents: number;
  currency?: string;
  disabled?: boolean;
  className?: string;
  // Optional product context for event payloads. Falls back to URL-derived
  // values when missing so the funnel still groups by business correctly.
  productId?: string;
  productTitle?: string;
}

function formatPrice(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  const symbols: Record<string, string> = {
    USD: "$",
    EUR: "€",
    GBP: "£",
    CAD: "CA$",
    AUD: "A$",
  };
  const symbol = symbols[currency.toUpperCase()] ?? `${currency.toUpperCase()} `;
  return `${symbol}${amount.toFixed(2)}`;
}

export function BuyButton({
  checkoutUrl,
  priceAmountCents,
  currency = "USD",
  disabled,
  className,
  productId,
  productTitle,
}: BuyButtonProps) {
  const isFree = priceAmountCents === 0;
  const isDisabled = disabled || !checkoutUrl;

  const label = isDisabled
    ? "Coming Soon"
    : isFree
      ? "Get it Free"
      : `Buy Now — ${formatPrice(priceAmountCents, currency)}`;

  if (isDisabled) {
    return (
      <Button
        disabled
        size="lg"
        className={cn("w-full sm:w-auto", className)}
      >
        {label}
      </Button>
    );
  }

  // Decorate at render time so the href on the anchor always carries the
  // PostHog distinct/session ids + persisted UTMs. This is what makes
  // modifier-click (cmd/ctrl/shift/middle-click → open in new tab) preserve
  // attribution — that path bypasses onClick entirely and lands on whatever
  // is in href. The function is a no-op during SSR (returns url unchanged).
  const decoratedHref = decorateCheckoutUrl(checkoutUrl!);

  // Digital-downloads doesn't have a cart concept — buy-button is the
  // single-step commitment. Fire both add_to_cart and begin_checkout so
  // the analytics funnel renders consistently with cart-based templates.
  //
  // No preventDefault + no window.location override: the browser's native
  // anchor navigation handles both same-tab and modifier-click cases, and
  // posthog-js's pagehide/sendBeacon transport gets a normal unload window
  // to flush these captures before the page tears down. Forcing
  // window.location.href synchronously races that flush.
  const handleClick = () => {
    const businessId = process.env.NEXT_PUBLIC_BUSINESS_ID;
    const eventPayload = {
      productId,
      productTitle,
      priceAmountCents,
      currency,
      $groups: { business: businessId },
    };
    posthog.capture("add_to_cart", eventPayload);
    posthog.capture("begin_checkout", eventPayload);
  };

  return (
    <Button asChild size="lg" className={cn("w-full sm:w-auto", className)}>
      <a href={decoratedHref} onClick={handleClick} rel="noopener noreferrer">
        <ShoppingCart className="mr-2 h-4 w-4" />
        {label}
      </a>
    </Button>
  );
}
