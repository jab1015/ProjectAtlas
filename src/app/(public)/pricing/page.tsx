import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Explorer",
    price: "Free",
    inventions: "1 active invention",
    autonomous: "25 autonomous work units/day",
    chat: "30 Ask InventSmith questions/day",
    summary: "Shape and validate your first invention with the core evidence and research foundation.",
    capabilities: [
      "Idea capture and persistent invention record",
      "Core validation, competitor research, market feasibility, and preliminary prior-art work",
      "Evidence Locker and inventor project record",
    ],
    featured: false,
  },
  {
    name: "Inventor",
    price: "$39/month",
    inventions: "3 active inventions",
    autonomous: "125 autonomous work units/day",
    chat: "100 Ask InventSmith questions/day",
    summary: "Go deeper into feasibility, technical questions, IP readiness, product requirements, and evidence verification.",
    capabilities: [
      "Everything in Explorer",
      "Technical/material/manufacturing feasibility and regulatory screening",
      "IP readiness, feature/prior-art comparison, product requirements, BOM/cost, and development-risk work",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "$79/month",
    inventions: "10 active inventions",
    autonomous: "350 autonomous work units/day",
    chat: "200 Ask InventSmith questions/day",
    summary: "Unlock the complete InventSmith idea-to-market work system, including Product Design + CAD and downstream lifecycle departments.",
    capabilities: [
      "Everything in Inventor",
      "Product Design + CAD, renders, prototype and manufacturing preparation",
      "Branding, legal/professional routing, pricing, marketing, sales, funding, launch, and growth work",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$149/month",
    inventions: "25 active inventions",
    autonomous: "600 autonomous work units/day",
    chat: "300 Ask InventSmith questions/day",
    summary: "The complete Pro work system with the largest bounded workspace for heavier invention pipelines.",
    capabilities: [
      "Complete Pro work capability",
      "Higher active-invention capacity",
      "Higher daily autonomous-work and Ask InventSmith allowances",
    ],
    featured: false,
  },
] as const;

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">InventSmith — The Inventor OS</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">Choose how much of the Workshop you need.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Start free, then expand the amount and depth of autonomous invention work as your project grows. Plan capabilities follow the same entitlement rules enforced inside InventSmith.
        </p>
      </div>

      <section className="mt-14 grid gap-5 lg:grid-cols-4">
        {PLANS.map((plan) => (
          <article key={plan.name} className={`flex flex-col rounded-2xl border bg-card p-6 ${plan.featured ? "border-primary/50 shadow-sm" : "border-border"}`}>
            <div>
              {plan.featured && <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Complete journey</p>}
              <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold text-foreground">{plan.price}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
            </div>

            <div className="mt-6 space-y-2 border-y border-border py-5 text-sm">
              <p className="font-medium text-foreground">{plan.inventions}</p>
              <p className="text-muted-foreground">{plan.autonomous}</p>
              <p className="text-muted-foreground">{plan.chat}</p>
            </div>

            <ul className="mt-6 flex-1 space-y-3">
              {plan.capabilities.map((capability) => (
                <li key={capability} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>{capability}</span>
                </li>
              ))}
            </ul>

            <Button asChild className="mt-7" variant={plan.featured ? "default" : "outline"}>
              <Link href="/sign-up">{plan.name === "Explorer" ? "Start free" : `Start with ${plan.name}`}</Link>
            </Button>
          </article>
        ))}
      </section>

      <section className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-muted/30 p-7 text-sm leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">A plan changes capacity and eligible InventSmith work—not the truth standard.</p>
        <p className="mt-2">Every plan still preserves evidence provenance, uncertainty, real-world evidence gates, and required professional review. Higher tiers do not turn estimates into facts or remove legal, engineering, physical, financial, or authorization gates.</p>
      </section>
    </main>
  );
}
