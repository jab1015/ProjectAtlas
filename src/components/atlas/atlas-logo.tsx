import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Atlas Logo — mark + wordmark
 *
 * Mark geometry derived from the approved Atlas brand kit (June 2026):
 *   - Two angled stroke-legs forming an open "A" silhouette
 *   - A horizontal crossbar across the middle
 *   - A 4-pointed diamond/star at the apex — the brand's signature element
 * Renders cleanly on both light and dark backgrounds via currentColor.
 */

interface AtlasMarkProps {
  className?: string;
  /** px — renders as a square */
  size?: number;
}

/** Stand-alone mark (no wordmark) — for favicon, auth headers, etc. */
export function AtlasMark({ className, size = 32 }: AtlasMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-label="Atlas mark"
      className={cn("shrink-0", className)}
    >
      {/* Left leg of the A — originates from bottom of star */}
      <path
        d="M16 8.5 L5 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Right leg of the A */}
      <path
        d="M16 8.5 L27 28"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Horizontal crossbar — positioned at the visual midpoint of the A legs */}
      <path
        d="M10.4 19.5 L21.6 19.5"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
      {/*
       * 4-pointed star at the apex — the Atlas brand signature.
       * Center at (16, 4.5). Outer radius 3.5, inner radius 1.3.
       * Points at top / right / bottom / left; inner corners at 45° diagonals.
       */}
      <path
        d="M16 1 L17 3.2 L19.5 4.5 L17 5.8 L16 8 L15 5.8 L12.5 4.5 L15 3.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface AtlasLogoProps {
  className?: string;
  /** Controls mark size; wordmark scales proportionally */
  size?: "sm" | "md" | "lg";
  /** Show mark only (no wordmark) */
  markOnly?: boolean;
}

const sizeMap = {
  sm: { markSize: 22, textClass: "text-lg" },
  md: { markSize: 28, textClass: "text-xl" },
  lg: { markSize: 36, textClass: "text-2xl" },
};

/**
 * Atlas logo — mark + wordmark.
 * Use `markOnly` for small contexts (favicon, loading screen).
 */
export function AtlasLogo({ className, size = "md", markOnly = false }: AtlasLogoProps) {
  const { markSize, textClass } = sizeMap[size];

  if (markOnly) {
    return <AtlasMark size={markSize} className={className} />;
  }

  return (
    <span
      className={cn("inline-flex items-center gap-2 text-foreground", className)}
      aria-label="Atlas"
    >
      <AtlasMark size={markSize} />
      <span
        className={cn("font-bold tracking-tight leading-none", textClass)}
        style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
      >
        Atlas
      </span>
    </span>
  );
}
