"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const FAQ_ITEMS = [
  {
    question: "What is InventSmith?",
    answer:
      "InventSmith is The Inventor OS from Modern Methods: an autonomous invention-development assistant. The controlled-pilot release focuses on idea capture, feasibility, preliminary prior-art research, and IP-readiness preparation. Later product-development and market stages remain on the roadmap.",
  },
  {
    question: "Who is InventSmith for?",
    answer:
      "InventSmith is for independent inventors, entrepreneurs, and anyone with an idea they want to bring to life. You don't need a technical background or prior invention experience. You just need an idea and the commitment to develop it.",
  },
  {
    question: "How does InventSmith work?",
    answer:
      "You capture the invention once. InventSmith creates a structured record, runs useful work in dependency order, shows its evidence and limitations, and pauses only for a decision, authorization, private information, professional review, payment, or physical-world action that genuinely requires you.",
  },
  {
    question: "Is my invention private?",
    answer:
      "InventSmith uses authenticated, owner-scoped workspaces and does not authorize external sharing without your approval. Like any hosted service, approved infrastructure and AI processors may handle data to provide the service; final privacy terms and the pilot data-processing review must be completed before public launch.",
  },
  {
    question: "Who owns my invention?",
    answer:
      "You do. Always. InventSmith makes no claim of ownership over anything you create, share, or develop using the platform. Your invention is yours.",
  },
  {
    question: "Do I need a patent before using InventSmith?",
    answer:
      "No. InventSmith can prepare a preliminary prior-art landscape and an organized patent-professional handoff. It does not determine patentability, freedom to operate, validity, or infringement, and it does not replace a patent professional.",
  },
  {
    question: "What does the Explorer plan include?",
    answer:
      "Explorer is free for one active invention and includes a limited feasibility preview, 25 autonomous cost units per day, and 30 Ask InventSmith questions per day. Research remains draft until it passes the applicable evidence checks.",
  },
  {
    question: "What is the Inventor plan?",
    answer:
      "The current Inventor pricing hypothesis is $39/month for 3 active inventions, 125 autonomous cost units per day, 100 Ask InventSmith questions per day, and the feasibility/IP-readiness workspace. Pricing remains subject to controlled-pilot validation.",
  },
  {
    question: "What do Pro and Enterprise add?",
    answer:
      "The current Pro and Enterprise hypotheses provide larger but bounded research budgets, more active inventions, deeper preparation, and professional collaboration as those capabilities are released. Professional services are separately authorized and priced. No plan includes unlimited expensive AI work, automatic legal approval, or production-ready CAD by default.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There are no long-term commitments. You can cancel your subscription at any time from your account settings.",
  },
  {
    question: "What happens after Patent Readiness?",
    answer:
      "The feasibility and IP-readiness package ends with a transparent proceed, revise, pause, or do-not-invest-yet recommendation. Product design, prototyping, professional IP work, manufacturing, funding, and launch remain later roadmap capabilities and require additional human or professional involvement.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
      <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4" style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}>
        Frequently Asked Questions
      </h1>
      <p className="text-muted-foreground mb-12 text-lg leading-relaxed">Everything you need to know before you start.</p>

      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium text-foreground">{item.question}</AccordionTrigger>
            <AccordionContent><p className="text-muted-foreground leading-relaxed pb-2">{item.answer}</p></AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-10 text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2" style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}>Still have questions?</h2>
        <p className="mt-2 text-sm text-muted-foreground mb-6">Reach out — we&rsquo;re happy to help.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline"><a href="mailto:team@atlas.madethis.app">Contact Us</a></Button>
          <Button asChild><Link href="/sign-up">Start Your Invention</Link></Button>
        </div>
      </div>
    </div>
  );
}
