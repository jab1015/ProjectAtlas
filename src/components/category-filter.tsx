"use client";

import { cn } from "@/lib/utils";

interface Category {
  slug: string;
  name: string;
}

interface CategoryFilterProps {
  categories: Category[];
  activeSlug: string | null;
  onSelect: (slug: string | null) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  activeSlug,
  onSelect,
  className,
}: CategoryFilterProps) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-2 scrollbar-none",
        className
      )}
    >
      <button
        onClick={() => onSelect(null)}
        className={cn(
          "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
          activeSlug === null
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
        )}
      >
        All
      </button>
      {categories.map((category) => (
        <button
          key={category.slug}
          onClick={() => onSelect(category.slug)}
          className={cn(
            "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium transition-colors",
            activeSlug === category.slug
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
          )}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
