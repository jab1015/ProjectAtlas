import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { AtlasLogo } from "@/components/atlas/atlas-logo";
import { Check } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header */}
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
            <h1
              className="text-3xl sm:text-4xl font-bold text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              Simple, transparent pricing
            </h1>
            <p className="text-muted-foreground text-lg">
              Start free. Upgrade when your invention gets serious.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Explorer */}
            <div className="rounded-2xl border border-border bg-card p-8 space-y-6">
              <div>
                <h2
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                >
                  Explorer
                </h2>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground">/forever</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Capture and validate your first idea.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "1 active invention",
                  "Stages 1–4 (Foundation of the journey)",
                  "Readiness engine",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild variant="outline" className="w-full">
                <Link href="/sign-up">Get started free</Link>
              </Button>
            </div>

            {/* Inventor Pro */}
            <div className="rounded-2xl border-2 border-primary bg-card p-8 space-y-6 relative">
              <span className="absolute -top-3 left-8 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                Coming soon
              </span>
              <div>
                <h2
                  className="text-xl font-bold text-foreground"
                  style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                >
                  Inventor Pro
                </h2>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  The complete journey — all 15 stages, idea to market.
                </p>
              </div>
              <ul className="space-y-3">
                {[
                  "Unlimited inventions",
                  "All 15 stages",
                  "Full readiness engine",
                  "IP protection roadmap",
                  "Product design & prototype",
                  "Funding & launch stages",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button disabled className="w-full">
                Coming Soon
              </Button>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2025 Atlas. All rights reserved.
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
