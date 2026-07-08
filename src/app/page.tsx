"use client";

import Link from "next/link";
import { ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtlasLogo } from "@/components/atlas/atlas-logo";
import { useEffect } from "react";
import { trackLandingPageViewed, trackGetStartedClicked } from "@/lib/analytics";

// ── MadeThis badge ────────────────────────────────────────────────────────────
function MadeThisBadge() {
  return (
    <div className="text-center py-3 pb-2 opacity-50 text-xs">
      <a
        href="https://madethis.com/r/dfy6c9ej"
        target="_blank"
        rel="noopener noreferrer"
        className="text-current no-underline inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
        Built with MadeThis
      </a>
    </div>
  );
}

const ALL_STAGES = [
  { n: 1, name: "Idea Capture" },
  { n: 2, name: "Validation" },
  { n: 3, name: "Market Research" },
  { n: 4, name: "Patent Readiness" },
  { n: 5, name: "Product Design" },
  { n: 6, name: "Engineering" },
  { n: 7, name: "Prototype" },
  { n: 8, name: "Testing" },
  { n: 9, name: "IP Protection" },
  { n: 10, name: "Manufacturing" },
  { n: 11, name: "Funding" },
  { n: 12, name: "Branding" },
  { n: 13, name: "Marketing" },
  { n: 14, name: "Sales" },
  { n: 15, name: "Growth" },
];

export default function HomePage() {
  useEffect(() => {
    trackLandingPageViewed();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">

      {/* ── Top Nav ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
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
            <Link href="/pricing" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/faq" className="hidden sm:block text-sm text-muted-foreground hover:text-foreground transition-colors">
              FAQ
            </Link>
            <Button asChild variant="outline" size="sm">
              <Link href="/sign-in">Sign In</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────────────────────────*/}
        <section className="mx-auto max-w-5xl px-4 sm:px-6 pt-20 pb-24 text-center">
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.05] mb-6"
            style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
          >
            From Idea to Market.{" "}
            <span className="text-primary">One Guided Journey.</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Atlas is the operating system for inventors. It guides you through every stage — from idea validation and patent readiness to product design, manufacturing, branding, launch, and growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              asChild
              size="lg"
              className="gap-2 text-base px-8"
              onClick={trackGetStartedClicked}
            >
              <Link href="/sign-up">
                Start Your Invention
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base px-8">
              <Link href="/about">See how it works</Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">
            Free to start. No credit card required.
          </p>
        </section>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="border-t border-border" />

        {/* ── Emotional Connection ─────────────────────────────────────────────
            Added before the process explanation
        ──────────────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-8"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              You have a great idea. Now what?
            </h2>
            <div className="space-y-5 text-muted-foreground leading-relaxed text-lg">
              <p>
                Most inventors know they have something worth building — but getting from idea to a
                protected, market-ready invention is overwhelming. Where do you start? How do you know
                when you&rsquo;re ready for the next step? What are you missing?
              </p>
              <p>
                Atlas is built for exactly this moment. It guides you through all 15 stages every
                inventor must navigate — from idea capture and patent readiness all the way through
                product design, manufacturing, branding, launch, and growth. One step at a time,
                with the context to understand why each step matters.
              </p>
              <p>
                You don&rsquo;t need to figure it all out at once. You just need to know what to do
                next.
              </p>
            </div>
          </div>
        </section>

        {/* ── Divider ──────────────────────────────────────────────────────── */}
        <div className="border-t border-border" />

        {/* ── How It Works ─────────────────────────────────────────────────────
            4 steps as a numbered sequence — not an icon-card row
        ──────────────────────────────────────────────────────────────────── */}
        <section className="bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
                How it works
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
              >
                15 stages. One guided path to market.
              </h2>
            </div>

            {/* Alternating layout — avoids the forbidden icon-card grid */}
            <div className="space-y-10">
              {[
                {
                  n: "01",
                  title: "Capture your idea",
                  desc: "Describe the problem you're solving, who it affects, and how your invention works. Atlas structures your raw idea into a clear foundation.",
                  right: false,
                },
                {
                  n: "02",
                  title: "Validate demand",
                  desc: "Confirm there's a real market and real need. Define your target customers, size the opportunity, and understand the competitive landscape.",
                  right: true,
                },
                {
                  n: "03",
                  title: "Research your market",
                  desc: "Go deeper into your customer, your segment, and what they'll pay. Clarity here makes every downstream decision sharper.",
                  right: false,
                },
                {
                  n: "04",
                  title: "Prepare for patent readiness",
                  desc: "Search for prior art, assess novelty, and document your invention. Know what you can protect before you spend a dollar on an attorney. Then keep going — 11 more stages stand between here and market.",
                  right: true,
                },
              ].map((step) => (
                <div
                  key={step.n}
                  className={`flex flex-col ${step.right ? "sm:flex-row-reverse" : "sm:flex-row"} gap-8 items-center`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="text-4xl font-bold text-primary/30"
                        style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {step.n}
                      </span>
                    </div>
                    <h3
                      className="text-xl font-semibold text-foreground mb-2"
                      style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="w-full max-w-xs aspect-[4/3] rounded-2xl border border-border bg-card flex items-center justify-center">
                      <span
                        className="text-6xl font-bold text-primary/10"
                        style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {step.n}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Value Props ───────────────────────────────────────────────────────*/}
        <section className="py-20 bg-background">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid sm:grid-cols-3 gap-px border border-border rounded-2xl overflow-hidden bg-border">
              {[
                {
                  headline: "Your progress is always saved",
                  body: "Pick up exactly where you left off — whether you come back tomorrow or next month. Atlas keeps track so you don't have to.",
                },
                {
                  headline: "Your ideas stay yours",
                  body: "Everything you draft, validate, and document in Atlas is your private intellectual property. We don't train on your inventions.",
                },
                {
                  headline: "Built for where you're going, not just where you start",
                  body: "Begin free with Explorer. Inventor adds validation and market research. Pro adds product design, legal paperwork, pitch decks, manufacturing, and investor outreach.",
                },
              ].map((prop) => (
                <div key={prop.headline} className="bg-card p-8">
                  <h3
                    className="text-lg font-semibold text-foreground mb-3"
                    style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                  >
                    {prop.headline}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{prop.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What You'll Accomplish ────────────────────────────────────────────
            Replaces placeholder testimonials
        ──────────────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-muted/30 border-t border-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-14">
              <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
                Stages 1–4 — Available Today
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
              >
                Your foundation for the journey ahead
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                {
                  n: "1",
                  title: "Idea Capture",
                  desc: "Describe your invention clearly enough that anyone can understand it. Atlas helps you articulate what you're building, who it's for, and why it matters.",
                },
                {
                  n: "2",
                  title: "Validation",
                  desc: "Understand whether your idea solves a real problem for real people. You'll know if your invention is worth pursuing before investing time and money.",
                },
                {
                  n: "3",
                  title: "Market Research",
                  desc: "Discover who else is solving this problem, what the market looks like, and where your invention fits. Walk away with a clear picture of the opportunity.",
                },
                {
                  n: "4",
                  title: "Patent Readiness",
                  desc: "Know what makes your invention unique. Understand the patent landscape well enough to have an informed conversation with a patent attorney.",
                },
              ].map((stage) => (
                <div key={stage.n} className="rounded-2xl border border-border bg-card p-8">
                  <div className="flex items-baseline gap-3 mb-3">
                    <span
                      className="text-3xl font-bold text-primary/30"
                      style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {stage.n}
                    </span>
                    <h3
                      className="text-lg font-semibold text-foreground"
                      style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                    >
                      {stage.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{stage.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Visual Roadmap ────────────────────────────────────────────────────
            All 15 stages — 1–4 active, 5–15 muted/locked
        ──────────────────────────────────────────────────────────────────── */}
        <section className="py-20 bg-background border-t border-border">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="text-center mb-12">
              <p className="text-xs font-medium uppercase tracking-widest text-primary mb-3">
                The full picture
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
              >
                The Complete Inventor Journey
              </h2>
            </div>

            {/* Scrollable stage track */}
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-3 min-w-max mx-auto justify-start sm:justify-center px-2">
                {ALL_STAGES.map((stage) => {
                  const active = stage.n <= 4;
                  return (
                    <div
                      key={stage.n}
                      className={`flex flex-col items-center gap-2 ${active ? "" : "opacity-50"}`}
                    >
                      <div
                        className={`
                          flex items-center justify-center rounded-full w-10 h-10 text-sm font-bold border-2
                          ${active
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted text-muted-foreground border-border"
                          }
                        `}
                        style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
                      >
                        {active ? stage.n : <Lock className="h-3.5 w-3.5" />}
                      </div>
                      <span
                        className={`text-xs text-center max-w-[64px] leading-tight ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}
                      >
                        {stage.name}
                      </span>
                      {!active && (
                        <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wide">
                          Pro
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground mt-6">
              Stages 1–4 are available today. Stages 5–15 — already designed and coming in future releases — unlock with Pro.
            </p>
          </div>
        </section>

        {/* ── Closing CTA ───────────────────────────────────────────────────── */}
        <section className="py-24 bg-muted/30 border-t border-border">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
            <h2
              className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-4"
              style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
            >
              Your invention deserves a clear path.
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Start free. Move at your pace. Know what to do next.
            </p>
            <Button
              asChild
              size="lg"
              className="gap-2 text-base px-8"
              onClick={trackGetStartedClicked}
            >
              <Link href="/sign-up">
                Start Your Invention
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

      </main>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            {/* Wordmark + tagline */}
            <div>
              <AtlasLogo size="sm" className="text-foreground" />
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                The operating system for inventors. A clear path from idea to market.
              </p>
            </div>

            {/* Product links */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Explore
              </p>
              <ul className="space-y-3">
                {[
                  { label: "Journey", href: "/journey" },
                  { label: "About", href: "/about" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "FAQ", href: "/faq" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                Legal
              </p>
              <ul className="space-y-3">
                <li>
                  <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <a href="mailto:team@atlas.madethis.app" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-10 border-t border-border pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground">
              &copy; 2025 Atlas. All rights reserved.
            </p>
          </div>
        </div>
        <MadeThisBadge />
      </footer>

    </div>
  );
}
