import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface TestimonialCardProps {
  customerName: string;
  customerTitle?: string;
  quote: string;
  rating?: number;
  className?: string;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-4 w-4"
          style={
            i < rating
              ? { fill: "var(--star)", color: "var(--star)" }
              : { fill: "none", color: "var(--muted-foreground)", opacity: 0.3 }
          }
        />
      ))}
    </div>
  );
}

export function TestimonialCard({
  customerName,
  customerTitle,
  quote,
  rating,
  className,
}: TestimonialCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="flex h-full flex-col p-6">
        <div className="mb-4 text-4xl leading-none text-primary/20">
          {"\u201C"}
        </div>

        <blockquote className="flex-1 text-foreground">
          <p className="text-sm leading-relaxed">{quote}</p>
        </blockquote>

        <div className="mt-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {customerName}
            </p>
            {customerTitle && (
              <p className="text-xs text-muted-foreground">{customerTitle}</p>
            )}
          </div>
          {rating !== undefined && rating > 0 && <StarRating rating={rating} />}
        </div>
      </CardContent>
    </Card>
  );
}
