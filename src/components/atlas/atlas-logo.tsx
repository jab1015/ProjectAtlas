import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface AtlasMarkProps {
  className?: string;
  size?: number;
}

/**
 * Compatibility export retained so existing imports do not require a risky
 * repository-wide technical rename. Customer-facing identity is InventSmith.
 */
export function AtlasMark({ className, size = 32 }: AtlasMarkProps) {
  return (
    <Image
      src="/logo.PNG"
      alt="InventSmith"
      width={size}
      height={size}
      className={cn("shrink-0 object-contain", className)}
      priority
    />
  );
}

interface AtlasLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  markOnly?: boolean;
}

const sizeMap = {
  sm: { height: 38, width: 92 },
  md: { height: 48, width: 116 },
  lg: { height: 64, width: 154 },
};

/**
 * InventSmith logo using the approved shoemaker-workshop artwork.
 * The legacy component name is intentionally retained as an internal
 * compatibility detail until the managed deployment has completed safely.
 */
export function AtlasLogo({ className, size = "md", markOnly = false }: AtlasLogoProps) {
  const dimensions = sizeMap[size];

  if (markOnly) {
    return <AtlasMark size={dimensions.height} className={className} />;
  }

  return (
    <span className={cn("inline-flex items-center", className)} aria-label="InventSmith — The Inventor OS">
      <Image
        src="/logo.PNG"
        alt="InventSmith — The Inventor OS"
        width={dimensions.width}
        height={dimensions.height}
        className="h-auto object-contain"
        priority
      />
    </span>
  );
}
