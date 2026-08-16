import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const PLANS = [
  {
    name: "Explorer",
    price: "Free",
    capacity: "1 active invention · 1 user",
    summary: "Explore InventSmith and build the evidence foundation for your first invention.",
    capabilities: [
      "Idea capture and persistent invention record",
      "Core validation, competitor research, market feasibility, and preliminary prior-art work",
      "Evidence Locker and Ask InventSmith",
    ],
    featured: false,
  },
  {
    name: "Inventor",
    price: "$39/month",
    capacity: "1 active invention · 1 user",
    summary: "Decide whether an invention deserves serious development before committing to the expensive build path.",
    capabilities: [
      "Everything in Explorer",
      "Deeper technical, material, manufacturing, regulatory, and market feasibility",
      "IP readiness, feature/prior-art comparison, requirements, preliminary BOM/cost, and development-risk work",
    ],
    featured: false,
  },
  {
    name: "Pro",
    price: "$99/month",
    capacity: "1 active invention · 1 user",
    summary: "The core complete idea-to-market plan for an individual inventor ready to build and launch.",
    capabilities: [
      "Everything in Inventor",
      "Product Design + native CAD, drawings, exploded views, renders, prototype and manufacturing preparation",
      "Branding, legal/professional routing, pricing, marketing, sales, funding, pitch materials, launch, and growth",
    ],
    featured: true,
  },
  {
    name: "Enterprise",
    price: "$199/month",
    capacity: "2 active inventions · 3 users",
    summary: "Full InventSmith for a small company or invention team developing more than one product.",
    capabilities: [
      "Complete Pro journey for each active invention",
      "Organization workspace with shared subscription capacity",
      "Role-based team access and invention-level permissions",
    ],
    featured: false,
  },
] as const;

const STUDIO_PLANS = [
  {
    name: "Studio 3",
    price: "$299/month",
    capacity: "3 active inventions · 5 users",
  },
  {
    name: "Studio 6",
    price: "$399/month",
    capacity: "6 active inventions · 8 users",
  },
] as const;

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">InventSmith — The Inventor OS</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">A plan for one invention—or an entire invention practice.</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
          Start free. Move to Pro when you are ready for the complete idea-to-market system. Enterprise and Studio add organization capacity, team access, and multiple active invention workspaces.
        </p>
      </div>

      <section className="mt-14 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => (
          <article key={plan.name} className={`flex flex-col rounded-2xl border bg-card p-6 ${plan.featured ? "border-primary/50 shadow-sm" : "border-border"}`}>
            <div>
              {plan.featured && <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-primary">Complete individual journey</p>}
              <h2 className="text-xl font-semibold text-foreground">{plan.name}</h2>
              <p className="mt-2 text-2xl font-bold text-foreground">{plan.price}</p>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
            </div>

            <div className="mt-6 border-y border-border py-5 text-sm">
              <p className="font-medium text-foreground">{plan.capacity}</p>
              <p className="mt-2 text-muted-foreground">Bounded AI, research, CAD, render, and document usage is governed at the account or organization level.</p>
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

      <section className="mt-12 rounded-2xl border border-border bg-card p-7 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_1.95fr] lg:items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">InventSmith Studio</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Built for professional invention work.</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Studio is for consultants, product-development practices, incubators, and teams managing several active inventions. Finished projects can be archived without losing their evidence, CAD, documents, decisions, or history, freeing an active slot for the next invention.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {STUDIO_PLANS.map((plan) => (
              <div key={plan.name} className="rounded-xl border border-border bg-muted/20 p-5">
                <h3 className="font-semibold text-foreground">{plan.name}</h3>
                <p className="mt-1 text-2xl font-bold text-foreground">{plan.price}</p>
                <p className="mt-3 text-sm text-muted-foreground">{plan.capacity}</p>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">Complete idea-to-market capability, organization roles, invention-level access, and shared organization usage governance.</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 border-t border-border pt-5 text-sm text-muted-foreground">
          Need more than six active inventions or a larger team? Studio Custom will be priced from the required capacity and measured cost-to-serve rather than advertised as unlimited.
        </p>
      </section>

      <section className="mx-auto mt-12 max-w-3xl rounded-2xl border border-border bg-muted/30 p-7 text-sm leading-relaxed text-muted-foreground">
        <p className="font-medium text-foreground">Your subscription controls capacity—not the truth standard.</p>
        <p className="mt-2">Every plan preserves evidence provenance, uncertainty, cost controls, real-world evidence gates, and required professional review. Higher tiers do not turn estimates into facts or remove legal, engineering, physical, financial, or authorization gates.</p>
      </section>
    </main>
  );
}
