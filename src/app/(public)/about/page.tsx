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
          <p>Inventing is one of the most rewarding things a person can do. It&rsquo;s also one of the most disorienting.</p>
          <p>Most inventors don&rsquo;t stall because their idea is bad. They stall because no one has ever shown them what to do next.</p>
          <p>InventSmith exists to change that.</p>
          <p className="font-medium text-foreground">You invent. InventSmith does the work.</p>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="my-14">
        <h2 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}>Our Mission</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>To give inventors an operating system that moves their ideas forward with less confusion, less repetitive work, and clearer human gates.</p>
          <p>Patent readiness is Stage 4 of 15. It&rsquo;s a real milestone, but it&rsquo;s not the finish line. InventSmith is designed to work with you through product design, manufacturing, branding, launch, funding, and growth — all the way to a product in the hands of real customers.</p>
          <p>Every feature in InventSmith is designed around two questions: <em className="text-foreground">&ldquo;What can the system safely do for the inventor?&rdquo;</em> and <em className="text-foreground">&ldquo;What genuinely requires a human?&rdquo;</em></p>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="my-14">
        <h2 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}>Our Promise</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>InventSmith should do useful work autonomously where it safely can, show the evidence and limitations behind that work, and interrupt you only when your judgment, authorization, private information, payment, physical action, or qualified professional review is genuinely required.</p>
        </div>
      </section>

      <div className="border-t border-border" />

      <section className="my-14">
        <h2 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}>Privacy</h2>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>Your ideas are yours. Always.</p>
          <p>InventSmith exists to help you develop your invention — not to claim ownership of it. We never assert rights over anything you create, share, or store in InventSmith.</p>
          <p>Your invention remains your invention.</p>
        </div>
      </section>

      <section className="my-14">
        <h2 className="text-xl font-semibold text-foreground mb-4" style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}>Published by Modern Methods</h2>
        <p className="text-muted-foreground leading-relaxed">InventSmith — The Inventor OS is a Modern Methods product.</p>
      </section>

      <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-10 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}>Ready to take your first step?</h2>
        <p className="mt-2 text-sm text-muted-foreground mb-6">Start free. No credit card required.</p>
        <Button asChild><Link href="/sign-up">Start Your Invention</Link></Button>
      </div>
    </div>
  );
}
