import Link from "next/link";
import { Button } from "@/components/ui/button";

const STAGES = [
  { n: 1, name: "Idea Capture", desc: "Articulate your invention clearly so you can explain it to anyone." },
  { n: 2, name: "Validation", desc: "Confirm your idea solves a real problem worth solving." },
  { n: 3, name: "Market Research", desc: "Understand who needs your invention and why they'll pay for it." },
  { n: 4, name: "Patent Research", desc: "Learn what's already been invented and how your idea is different." },
  { n: 5, name: "Product Design", desc: "Define exactly what you're building before you spend on prototypes." },
  { n: 6, name: "Engineering", desc: "Turn your design into detailed specifications a manufacturer can follow." },
  { n: 7, name: "Prototype", desc: "Build a working version of your invention to test the concept." },
  { n: 8, name: "Testing", desc: "Validate that your prototype works as intended and identify what to improve." },
  { n: 9, name: "IP Protection", desc: "Prepare for patent and IP work with qualified professionals where required." },
  { n: 10, name: "Manufacturing", desc: "Find the right manufacturer and prepare your invention for production." },
  { n: 11, name: "Funding", desc: "Identify funding options and prepare the materials investors want to see." },
  { n: 12, name: "Branding", desc: "Create a brand identity that makes your product instantly recognizable." },
  { n: 13, name: "Marketing", desc: "Build the audience and channels that can drive your first sales." },
  { n: 14, name: "Sales", desc: "Prepare for launch and build a repeatable path to customers." },
  { n: 15, name: "Growth", desc: "Scale what's working and build a sustainable business around your invention." },
];

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
          From the first spark to a market-ready invention, InventSmith organizes the work into a complete path and handles what it safely can along the way.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          The journey is not a checklist for the inventor to carry alone. InventSmith researches, prepares, documents, and coordinates the work, then asks for human input only when a genuine human gate exists.
        </p>
      </div>

      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
        The Workshop — Stages 1–15
      </p>

      <div className="space-y-3 mb-16">
        {STAGES.map((stage) => (
          <div
            key={stage.n}
            className="flex items-start gap-5 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {stage.n}
            </div>
            <div className="flex-1 min-w-0">
              <h2
                className="text-base font-semibold text-foreground"
                style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
              >
                {stage.name}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {stage.desc}
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
