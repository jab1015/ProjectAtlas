import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  storeName?: string;
  tagline?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImageUrl?: string;
  className?: string;
}

export function HeroSection({
  storeName = "Your Atlas",
  tagline = "Premium digital products crafted with care",
  ctaText = "Browse Products",
  ctaLink = "#products",
  backgroundImageUrl,
  className,
}: HeroSectionProps) {
  return (
    <section
      className={cn(
        "relative flex min-h-[60vh] w-full items-center justify-center overflow-hidden",
        className
      )}
    >
      {backgroundImageUrl && (
        <>
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: `url(${backgroundImageUrl})` }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(to bottom, var(--scrim-light), var(--scrim) 50%, var(--scrim-light))",
            }}
          />
        </>
      )}

      {!backgroundImageUrl && (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/20" />
      )}

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1
          className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl"
          style={backgroundImageUrl ? { color: "oklch(99% 0 0)" } : undefined}
        >
          {storeName}
        </h1>
        <p
          className={cn(
            "mx-auto mt-6 max-w-2xl text-lg sm:text-xl",
            !backgroundImageUrl && "text-muted-foreground"
          )}
          style={backgroundImageUrl ? { color: "oklch(99% 0 0 / 0.90)" } : undefined}
        >
          {tagline}
        </p>
        <div className="mt-10">
          <Button asChild size="lg" className="text-base">
            <Link href={ctaLink}>{ctaText}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
