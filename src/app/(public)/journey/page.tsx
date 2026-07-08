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
  { n: 9, name: "IP Protection", desc: "File patents and protect your intellectual property before going to market." },
  { n: 10, name: "Manufacturing", desc: "Find the right manufacturer and prepare your invention for production." },
  { n: 11, name: "Funding", desc: "Identify funding options and prepare the materials investors want to see." },
  { n: 12, name: "Branding", desc: "Create a brand identity that makes your product instantly recognizable." },
  { n: 13, name: "Marketing", desc: "Build the audience and channels that will drive your first sales." },
  { n: 14, name: "Sales", desc: "Launch your product and close your first customers." },
  { n: 15, name: "Growth", desc: "Scale what's working and build a sustainable business around your invention." },
];

export default function JourneyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">

      {/* Header */}
      <div className="mb-14">
        <h1
          className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          The Inventor Journey
        </h1>
        <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mb-4">
          15 stages. Idea to Market. Atlas guides you through every one — from your first spark to a
          product that sells. Stages 1–4 are live today. Stages 5–15 are already designed and
          arriving with Pro.
        </p>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Atlas is growing into the complete operating system for inventors. Every stage you see below
          is part of the plan.
        </p>
      </div>

      {/* Available now label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
        Available Today — Stages 1–4
      </p>

      {/* Stages 1–4 */}
      <div className="space-y-3 mb-10">
        {STAGES.filter((s) => s.n <= 4).map((stage) => (
          <div
            key={stage.n}
            className="flex items-start gap-5 rounded-xl border border-border bg-card p-5"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
              {stage.n}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2
                  className="text-base font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                >
                  {stage.name}
                </h2>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                  Available Now
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {stage.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-border mb-10" />

      {/* Coming soon label */}
      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
        Coming with Pro — Stages 5–15
      </p>

      {/* Stages 5–15 */}
      <div className="space-y-3 mb-16">
        {STAGES.filter((s) => s.n >= 5).map((stage) => (
          <div
            key={stage.n}
            className="flex items-start gap-5 rounded-xl border border-border bg-card/50 p-5 opacity-70"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold border border-border">
              {stage.n}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 flex-wrap">
                <h2
                  className="text-base font-semibold text-foreground"
                  style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                >
                  {stage.name}
                </h2>
                <span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground border border-border">
                  Coming with Pro
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                {stage.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="rounded-2xl border border-border bg-muted/30 p-10 text-center">
        <h2
          className="text-xl font-semibold text-foreground mb-2"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          Your idea deserves the full journey.
        </h2>
        <p className="mt-2 text-muted-foreground mb-6">
          Start free with Stages 1–4. The complete path to market — all 15 stages — is already mapped and on its way.
        </p>
        <Button asChild size="lg" className="gap-2">
          <Link href="/sign-up">Begin Your Journey</Link>
        </Button>
      </div>

    </div>
  );
}
