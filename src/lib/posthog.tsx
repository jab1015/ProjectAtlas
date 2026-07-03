// MAD-26 v0 — Storefront analytics provider + helpers.
//
// Initializes PostHog for storefront-side event capture and exposes
// `decorateCheckoutUrl` so the cart can append the visitor's PostHog
// distinct_id + session_id + active UTMs to the platform checkout URL at
// click time. The platform reads these from URL query params, stuffs them
// into Stripe Checkout session metadata, and joins the resulting order back
// to its source.
//
// Env vars (provisioned by the platform on the storefront's Vercel project):
//   NEXT_PUBLIC_POSTHOG_STOREFRONT_KEY   — public phc_ token
//   NEXT_PUBLIC_POSTHOG_STOREFRONT_HOST  — ingestion host (us.i.posthog.com)
//   NEXT_PUBLIC_BUSINESS_ID              — for $groups.business tagging
//   NEXT_PUBLIC_GSC_VERIFICATION_TOKEN   — used by RootLayout for the
//                                          google-site-verification meta tag

"use client";

import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";
import { ReactNode, useEffect } from "react";

const KEY = process.env.NEXT_PUBLIC_POSTHOG_STOREFRONT_KEY;
const HOST =
  process.env.NEXT_PUBLIC_POSTHOG_STOREFRONT_HOST ?? "https://us.i.posthog.com";
const BUSINESS_ID = process.env.NEXT_PUBLIC_BUSINESS_ID;

if (typeof window !== "undefined" && KEY && !(posthog as { __loaded?: boolean }).__loaded) {
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: true,
    persistence: "localStorage+cookie",
    autocapture: true,
    loaded: (ph) => {
      if (BUSINESS_ID) ph.group("business", BUSINESS_ID);
    },
  });
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

export function PostHogProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    // Persist incoming UTMs to sessionStorage so they survive cross-page nav
    // and are available when the visitor reaches the checkout link later.
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) sessionStorage.setItem(`mt_${key}`, value);
    }
  }, []);

  // No-op provider when PostHog isn't configured — keeps the storefront
  // functional even if env vars haven't been provisioned yet.
  if (!KEY) return <>{children}</>;
  return <PHProvider client={posthog}>{children}</PHProvider>;
}

// Decorates a platform checkout URL with the visitor's current PostHog
// distinct_id + session_id + UTMs at click time. The platform's
// /checkout/:slug/:productId handler reads these query params and forwards
// them into Stripe Checkout session metadata for source attribution.
export function decorateCheckoutUrl(url: string): string {
  if (typeof window === "undefined" || !url || url === "#") return url;
  try {
    const u = new URL(url);
    const distinctId = posthog.get_distinct_id?.();
    const sessionId = posthog.get_session_id?.();
    if (distinctId) u.searchParams.set("ph_distinct_id", distinctId);
    if (sessionId) u.searchParams.set("ph_session_id", sessionId);
    for (const key of UTM_KEYS) {
      const value = sessionStorage.getItem(`mt_${key}`);
      if (value) u.searchParams.set(key, value);
    }
    return u.toString();
  } catch {
    return url;
  }
}
