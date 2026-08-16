"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Hammer, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AtlasLogo } from "@/components/atlas/atlas-logo";
import { INVENTSMITH_PUBLIC_JOURNEY } from "@/lib/inventsmithJourney";
import { useEffect } from "react";
import { trackLandingPageViewed, trackGetStartedClicked } from "@/lib/analytics";

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

export default function HomePage() {
  useEffect(() => {
    trackLandingPageViewed();
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="no-underline transition-opacity hover:opacity-80">
            <AtlasLogo size="sm" className="text-primary" />
          </Link>
          <nav className="flex items-center gap-4 sm:gap-6">
            <Link href="/journey" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">Journey</Link>
            <Link href="/about" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">About</Link>
            <Link href="/pricing" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">Pricing</Link>
            <Link href="/faq" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">FAQ</Link>
            <Button asChild variant="outline" size="sm"><Link href="/sign-in">Sign In</Link></Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-4 pb-24 pt-16 text-center sm:px-6 sm:pt-20">
          <div className="mx-auto mb-8 flex max-w-3xl justify-center">
            <AtlasLogo size="lg" />
          </div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-primary">The Inventor OS</p>
          <h1
            className="text-5xl font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
          >
            You invent.{" "}
            <span className="text-primary">InventSmith does the work.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            InventSmith gives an inventor an autonomous workshop for research, evidence, feasibility,
            product-development preparation, decisions, and commercialization work. If InventSmith can
            safely do the work, it does the work instead of turning it into another task for you.
          </p>
          <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="gap-2 px-8 text-base" onClick={trackGetStartedClicked}>
              <Link href="/sign-up">Start Your Invention <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 text-base">
              <Link href="/about">See how InventSmith works</Link>
            </Button>
          </div>
          <p className="mt-5 text-sm text-muted-foreground">Free to start. No credit card required.</p>
        </section>

        <section className="border-y border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">The Workshop</p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">An entire invention workflow behind your idea.</h2>
              <p className="mt-4 text-muted-foreground">The inventor remains the inventor. InventSmith becomes the workshop around them.</p>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border md:grid-cols-4">
              {[
                { icon: Sparkles, title: "Capture it once", body: "Describe the problem, audience, solution, and working title. InventSmith turns the raw idea into a structured invention record." },
                { icon: Hammer, title: "The Workshop starts", body: "Work is queued in dependency order so research, evidence, feasibility, and deliverables can advance without constant prompting." },
                { icon: ShieldCheck, title: "Evidence stays visible", body: "Sources, confidence, limitations, stale work, and professional-review states stay attached to the work instead of being hidden behind an AI answer." },
                { icon: CheckCircle2, title: "You handle the real gates", body: "InventSmith pauses for genuine human decisions, authorization, private input, professional review, payment, or physical-world work — not busywork." },
              ].map(({ icon: Icon, title, body }) => (
                <article key={title} className="bg-card p-7">
                  <Icon className="h-5 w-5 text-primary" />
                  <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-primary">Built around the inventor</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">The inventor should not have to think about the operating system.</h2>
                <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                  <p>Most invention tools give you information, templates, or another checklist. InventSmith is designed around a different rule: when the system can safely perform the work, it performs the work.</p>
                  <p>Your dashboard becomes a briefing: what InventSmith completed, what it discovered, what genuinely needs you, and what the Workshop is doing next.</p>
                  <p className="font-medium text-foreground">Your idea. Your invention. An entire workshop behind it.</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {INVENTSMITH_PUBLIC_JOURNEY.map((stage) => (
                  <div key={stage.id} className="rounded-xl border border-border bg-card p-4">
                    <p className="text-xs font-semibold text-primary">{String(stage.id).padStart(2, "0")}</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{stage.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-20">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <div className="grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
              {[
                { title: "Your ideas stay yours", body: "InventSmith is built to help develop your invention, not claim ownership of it. Your invention remains your invention." },
                { title: "Trust is part of the work", body: "Draft, evidence-checked, stale, disputed, and professionally reviewed states are kept distinct so polished output is never mistaken for verified truth." },
                { title: "Autonomy has boundaries", body: "Consequential external actions, legal or professional signoff, spending, and physical-world work remain behind explicit gates." },
              ].map((item) => (
                <div key={item.title} className="bg-card p-8">
                  <h3 className="font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 text-center">
          <div className="mx-auto max-w-2xl px-4 sm:px-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">InventSmith — The Inventor OS</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Put your invention into the Workshop.</h2>
            <p className="mt-4 text-lg text-muted-foreground">You bring the invention. InventSmith starts organizing the work around it.</p>
            <Button asChild size="lg" className="mt-8 gap-2 px-8 text-base" onClick={trackGetStartedClicked}>
              <Link href="/sign-up">Start Your Invention <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
            <div>
              <AtlasLogo size="sm" />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">The Inventor OS. You invent. InventSmith does the work.</p>
              <p className="mt-2 text-xs text-muted-foreground">Published by Modern Methods.</p>
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Explore</p>
              <ul className="space-y-3">
                {[
                  { label: "Journey", href: "/journey" },
                  { label: "About", href: "/about" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "FAQ", href: "/faq" },
                ].map((item) => <li key={item.href}><Link href={item.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">{item.label}</Link></li>)}
              </ul>
            </div>
            <div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Legal</p>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Privacy Notice</Link></li>
                <li><Link href="/terms" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Terms of Service</Link></li>
                <li><a href="mailto:support@madethis.com" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-border pt-8">
            <p className="text-xs text-muted-foreground">&copy; 2026 Modern Methods. InventSmith — The Inventor OS.</p>
          </div>
        </div>
        <MadeThisBadge />
      </footer>
    </div>
  );
}
