import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">

      <h1
        className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-16"
        style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
      >
        About InventSmith
      </h1>

      <section className="mb-14">
        <h2
          className="text-xl font-semibold text-foreground mb-4"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          Why InventSmith Exists
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Inventing is one of the most rewarding things a person can do.
            It&rsquo;s also one of the most disorienting.
          </p>
          <p>
            Most inventors don&rsquo;t stall because their idea is bad.
            They stall because turning an idea into something real requires research,
            evidence, design, decisions, documentation, and coordination across many disciplines.
          </p>
          <p>
            InventSmith exists to take on as much of that work as possible.
          </p>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="my-14">
        <h2
          className="text-xl font-semibold text-foreground mb-4"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          Our Mission
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            To give every inventor an operating system that can help move an invention from idea to market.
          </p>
          <p>
            InventSmith researches, organizes evidence, develops work products, tracks dependencies,
            prepares options, and keeps the invention moving. When a real human decision, authorization,
            professional review, payment, private input, or physical-world action is required, InventSmith
            brings the inventor the prepared work instead of handing them a generic to-do list.
          </p>
          <p className="font-medium text-foreground">
            You invent. InventSmith does the work.
          </p>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="my-14">
        <h2
          className="text-xl font-semibold text-foreground mb-4"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          The Inventor OS
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            InventSmith is designed around a simple rule: if the system can safely do the work itself,
            it should do the work instead of turning that work into an inventor task.
          </p>
          <p>
            The inventor remains the inventor. InventSmith is the workshop around them — helping with
            research, market validation, prior-art intelligence, feasibility, product development,
            engineering preparation, commercialization, and the evidence needed for better decisions.
          </p>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="my-14">
        <h2
          className="text-xl font-semibold text-foreground mb-4"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          Privacy
        </h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Your ideas are yours. Always.</p>
          <p>
            InventSmith exists to help you develop your invention — not to claim ownership of it.
            We never assert rights over anything you create, share, or store in InventSmith.
          </p>
          <p>Your invention remains your invention.</p>
        </div>
      </section>

      <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-10 text-center">
        <h2
          className="text-xl font-semibold text-foreground mb-2"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          Put your idea into the Workshop.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground mb-6">
          Start free. No credit card required.
        </p>
        <Button asChild>
          <Link href="/sign-up">Start Your Invention</Link>
        </Button>
      </div>

    </div>
  );
}
