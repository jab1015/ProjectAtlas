import Link from "next/link";
import { Button } from "@/components/ui/button";
import { INVENTSMITH_PUBLIC_JOURNEY } from "@/lib/inventsmithJourney";

export default function JourneyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">InventSmith — The Inventor OS</p>
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          The Inventor Journey
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-4">
          From the first spark through launch and growth, InventSmith organizes the work into the same complete path the product engine actually follows and handles what it safely can along the way.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          The journey is not a checklist for the inventor to carry alone. InventSmith researches, prepares, documents, and coordinates the work, then asks for human input only when a genuine human gate exists.
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
        The Workshop — Stages 1–15
      </p>

      <div className="space-y-3 mb-16">
        {INVENTSMITH_PUBLIC_JOURNEY.map((stage) => (
          <div
            key={stage.id}
            className="flex items-start gap-5 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {stage.id}
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="text-base font-semibold text-foreground"
                style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
              >
                {stage.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {stage.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-muted/30 p-10 text-center">
        <h2
          className="text-xl font-semibold text-foreground mb-2"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          Put your invention into the Workshop.
        </h2>
        <p className="mt-2 text-muted-foreground mb-6">
          You bring the invention. InventSmith organizes and advances the work around it.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/sign-up">Start Your Invention</Link>
        </Button>
      </div>
    </div>
  );
}
