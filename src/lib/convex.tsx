"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";
import { ReactNode } from "react";

const productionConvexUrl = "https://agile-seahorse-379.convex.cloud";
const configuredConvexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.trim();

// NEXT_PUBLIC_* values are inlined during the Next.js build. A placeholder
// URL makes a missing Vercel build variable look like a login hang, because
// the Convex WebSocket retries forever. Keep the production deployment
// usable while making the failure visible during development.
const convexUrl = configuredConvexUrl || productionConvexUrl;

if (!configuredConvexUrl && process.env.NODE_ENV !== "production") {
  console.warn(
    "[InventSmith] NEXT_PUBLIC_CONVEX_URL is missing; using the production Convex deployment."
  );
}

const convex = new ConvexReactClient(convexUrl);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ConvexAuthProvider client={convex}>
      {children}
    </ConvexAuthProvider>
  );
}
