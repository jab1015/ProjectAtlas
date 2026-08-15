import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { AtlasLogo } from "@/components/atlas/atlas-logo";
import { Check } from "lucide-react";

const TIERS = [
  {
    name: "Explorer",
    price: "$0",
    cadence: "/forever",
    description: "Start with the foundation for one invention.",
    features: [
      "1 active invention",
      "Idea capture",
      "25 autonomous cost units/day",
      "30 Ask InventSmith questions/day",
      "Limited feasibility preview",
    ],
    cta: "Get started free",
    href: "/sign-up",
    featured: false,
  },
  {
    name: "Inventor",
    price: "$39",
    cadence: "/month",
    description: "Develop a small invention portfolio through feasibility.",
    features: [
      "3 active inventions",
      "125 autonomous cost units/day",
      "100 Ask InventSmith questions/day",
      "Feasibility and preliminary IP-readiness work",
      "Evidence and decision ledgers",
      "Versioned InventSmith draft deliverables",
    ],
    cta: "Choose Inventor",
    href: "/sign-up",
    featured: true,
  },
  {
    name: "Pro",
    price: "$79",
    cadence: "/month",
    description: "Deeper research and professional-ready preparation.",
    features: [
      "10 active inventions",
      "350 autonomous cost units/day",
      "200 Ask InventSmith questions/day",
      "Deeper feasibility and prior-art research",
      "Professional handoff preparation",
      "Expanded exports and collaboration as released",
      "Professional services separately authorized",
    ],
    cta: "Choose Pro",
    href: "/sign-up",
    featured: false,
  },
  {
    name: "Enterprise",
    price: "$149",
    cadence: "/month",
    description: "The largest bounded workspace for invention programs.",
    features: [
      "25 active inventions",
      "600 autonomous cost units/day",
      "300 Ask InventSmith questions/day",
      "Priority onboarding and support",
      "No unlimited expensive operations",
      "Custom services separately scoped",
    ],
    cta: "Choose Enterprise",
    href: "/sign-up",
    featured: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="no-underline hover:opacity-80 transition-opacity">
            <AtlasLogo size="sm" className="text-primary" />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/journey" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              Journey
            </Link>
            <Link href="/about" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </Link>
            <Link href="/faq" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Sign In
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-16">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">InventSmith — The Inventor OS</p>
            <h1
              className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              Bounded plans for measurable progress
            </h1>
            <p className="text-muted-foreground text-lg">
              Start free. Research and generation are metered so InventSmith can work persistently without hidden runaway costs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl border bg-card p-6 space-y-6 ${
                  tier.featured ? "border-primary shadow-sm" : "border-border"
                }`}
              >
                <div>
                  {tier.featured && (
                    <span className="mb-3 inline-flex rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                      Recommended
                    </span>
                  )}
                  <h2
                    className="text-xl font-bold text-foreground"
                    style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                  >
                    {tier.name}
                  </h2>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-foreground">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.cadence}</span>
                  </div>
                  <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                    {tier.description}
                  </p>
                </div>
                <ul className="space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button asChild variant={tier.featured ? "default" : "outline"} className="w-full">
                  <Link href={tier.href}>{tier.cta}</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2026 Modern Methods. InventSmith — The Inventor OS.
            </p>
            <nav className="flex items-center gap-6">
              {[
                { label: "Journey", href: "/journey" },
                { label: "About", href: "/about" },
                { label: "FAQ", href: "/faq" },
                { label: "Privacy", href: "/privacy" },
                { label: "Terms", href: "/terms" },
              ].map((link) => (
                <Link key={link.href} href={link.href} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <MadeThisBadge />
      </footer>
    </div>
  );
}
