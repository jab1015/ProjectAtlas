import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  ctaText?: string;
  ctaLink?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaText,
  ctaLink,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-4 py-16 text-center",
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          {description}
        </p>
      )}
      {ctaText && ctaLink && (
        <div className="mt-6">
          <Button asChild>
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
