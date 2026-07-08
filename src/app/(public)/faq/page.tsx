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
    question: "What is Atlas?",
    answer:
      "Atlas is the operating system for inventors. It guides you through all 15 stages of the invention journey — from idea capture and validation through patent readiness, product design, manufacturing, branding, launch, and growth — one step at a time, all the way to market.",
  },
  {
    question: "Who is Atlas for?",
    answer:
      "Atlas is for independent inventors, entrepreneurs, and anyone with an idea they want to bring to life. You don't need a technical background or prior invention experience. You just need an idea and the commitment to develop it.",
  },
  {
    question: "How does Atlas work?",
    answer:
      "When you create an account, you start by capturing your invention idea. Atlas then guides you through a series of structured stages, each one building on the last. At every point, Atlas tells you exactly what to do next — so you're never staring at a blank screen wondering where to start.",
  },
  {
    question: "Is my invention private?",
    answer:
      "Yes. Your invention information is stored securely and is only accessible to you. Atlas does not share, sell, or distribute your invention details to any third party.",
  },
  {
    question: "Who owns my invention?",
    answer:
      "You do. Always. Atlas makes no claim of ownership over anything you create, share, or develop using the platform. Your invention is yours.",
  },
  {
    question: "Do I need a patent before using Atlas?",
    answer:
      "No. Atlas guides you through the entire pre-patent process. By the time you complete Stage 4, you'll have the research and documentation you need to move forward with IP protection — that comes in a later stage.",
  },
  {
    question: "What does the Explorer plan include?",
    answer:
      "The Explorer plan is free and includes idea capture, competitive research, patent research, and 1 active invention. It gives you the foundation you need before upgrading into validation, market research, design, legal, and launch support.",
  },
  {
    question: "What is the Inventor plan?",
    answer:
      "Inventor is $39/month and includes 3 active inventions, 10 AI tasks/day, 150 credits/month, validation and market research, document upload/download, and agent chat. It does not include design or legal features.",
  },
  {
    question: "What do Pro and Enterprise add?",
    answer:
      "Pro is $79/month and adds legal paperwork, patent drafts, contracts, pitch decks, logo and branding, product design, manufacturing outreach, and investor outreach for up to 10 active inventions. Enterprise is $149/month and adds unlimited usage, CAD, explosion blueprints, team workspaces, and API access.",
  },
  {
    question: "Can I cancel anytime?",
    answer:
      "Yes. There are no long-term commitments. You can cancel your subscription at any time from your account settings.",
  },
  {
    question: "What happens after Patent Readiness?",
    answer:
      "Patent readiness is Stage 4 of 15 — a major milestone, but not the finish line. After Stage 4, you move into product development, IP protection, manufacturing, branding, funding, and launch. Stages 5 through 15 are available with Pro and guide you all the way to market.",
  },
];

export default function FaqPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 sm:px-6 lg:px-8">
      <h1
        className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4"
        style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
      >
        Frequently Asked Questions
      </h1>
      <p className="text-muted-foreground mb-12 text-lg leading-relaxed">
        Everything you need to know before you start.
      </p>

      <Accordion type="single" collapsible className="w-full">
        {FAQ_ITEMS.map((item, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left text-base font-medium text-foreground">
              {item.question}
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-muted-foreground leading-relaxed pb-2">
                {item.answer}
              </p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* Bottom CTA */}
      <div className="mt-16 rounded-2xl border border-border bg-muted/30 p-10 text-center">
        <h2
          className="text-xl font-semibold text-foreground mb-2"
          style={{ fontFamily: "var(--font-heading), ui-sans-serif, system-ui, sans-serif" }}
        >
          Still have questions?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground mb-6">
          Reach out — we&rsquo;re happy to help.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline">
            <a href="mailto:team@atlas.madethis.app">Contact Us</a>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Start Your Invention</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
