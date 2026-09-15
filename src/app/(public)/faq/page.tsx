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
      "InventSmith is The Inventor OS from Modern Methods. It is an autonomous invention-development system designed to research, organize evidence, prepare work, generate appropriate deliverables, and advance an invention from idea toward market while escalating only genuine human decisions, authorizations, professional reviews, payments, private inputs, or physical-world actions it cannot safely complete itself.",
  },
  {
    question: "Who is InventSmith for?",
    answer:
      "InventSmith is for independent inventors, entrepreneurs, product teams, and professional invention practices. A solo inventor works in a one-person InventSmith organization; company and Studio plans can support multiple users and multiple invention workspaces without changing the underlying project model.",
  },
  {
    question: "How does InventSmith work?",
    answer:
      "You capture the invention once. InventSmith creates a persistent invention record, runs useful work in dependency order, keeps evidence and limitations attached to conclusions, and advances through a 15-stage journey from Idea through Growth. When a real-world evidence, professional, legal, financial, authorization, or physical gate is reached, InventSmith stops at that boundary instead of inventing completion.",
  },
  {
    question: "Is my invention private?",
    answer:
      "InventSmith uses authenticated, organization-aware and invention-level access controls and does not authorize external sharing without the applicable approval. Approved hosting, AI, and research infrastructure may process the project context needed to provide the service. The Privacy Notice explains current handling, export, deletion, retention, and professional-disclosure boundaries.",
  },
  {
    question: "Who owns my invention?",
    answer:
      "InventSmith makes no claim of ownership over anything you create, share, or develop using the platform. Organization and invention permissions control who can work with a project inside InventSmith; they do not transfer inventorship or intellectual-property ownership.",
  },
  {
    question: "Do I need a patent before using InventSmith?",
    answer:
      "No. InventSmith can research prior art, compare invention features, identify potentially distinguishing hypotheses and design constraints, and prepare a patent-professional handoff. It does not determine patentability, freedom to operate, validity, infringement, or legal clearance, and it does not replace qualified patent counsel.",
  },
  {
    question: "What does the Explorer plan include?",
    answer:
      "Explorer is free for 1 active invention and 1 user. It is designed to let you explore InventSmith and build the core invention record, evidence foundation, early validation, competitor research, market feasibility, preliminary prior-art work, and Ask InventSmith experience. AI and other resource-intensive work remains bounded behind the scenes.",
  },
  {
    question: "What does the Inventor plan include?",
    answer:
      "Inventor is $39/month for 1 active invention and 1 user. It is for serious feasibility and readiness work before the full build path, including deeper technical, material, manufacturing, regulatory and market feasibility, IP readiness, feature/prior-art comparison, product requirements, preliminary BOM/cost, development-risk, evidence-verification, and feasibility work.",
  },
  {
    question: "What does Pro add?",
    answer:
      "Pro is $99/month for 1 active invention and 1 user. Pro unlocks the complete InventSmith work system for an individual inventor, including Product Design + CAD and the downstream Prototype, Manufacturing, Branding, Intellectual Property / Legal, Pricing, Marketing, Sales, Funding, Launch, and Growth departments.",
  },
  {
    question: "What do Enterprise and Studio add?",
    answer:
      "Enterprise is $199/month for 2 active inventions and 3 users, with the complete Pro journey plus organization collaboration and shared subscription capacity. Studio is designed for professional invention work: Studio 3 is $299/month for 3 active inventions and 5 users, and Studio 6 is $399/month for 6 active inventions and 8 users. Larger Studio capacity will be custom-priced rather than advertised as unlimited.",
  },
  {
    question: "What counts as an active invention?",
    answer:
      "An active invention occupies one of the organization’s purchased invention slots and can continue through InventSmith’s autonomous workflow. A completed or paused invention can be archived to free that slot without deleting its evidence, research, CAD, documents, decisions, or history.",
  },
  {
    question: "Do extra users get separate AI or CAD allowances?",
    answer:
      "No. Team members share the organization’s subscription and resource allowance. Adding users does not multiply the company’s AI, research, CAD, rendering, or document-generation budget. InventSmith meters expensive work at the organization level so collaboration does not create uncontrolled cost.",
  },
  {
    question: "Does a paid plan remove professional or real-world gates?",
    answer:
      "No. A higher plan changes capacity and which InventSmith work can run; it does not turn estimates into facts. Patent/legal conclusions still require qualified counsel where applicable, consequential engineering still requires appropriate review and prototype evidence, manufacturer quote comparison waits for real quotes, and launch-performance analysis waits for actual market evidence.",
  },
  {
    question: "How do I change my subscription?",
    answer:
      "Subscription and billing controls belong to the applicable InventSmith organization. Current plan information and available changes appear in the authenticated account/workspace experience. A paid plan is not treated as active until the billing event is confirmed, and access follows the recorded subscription status and paid period.",
  },
  {
    question: "What happens after Patent Readiness?",
    answer:
      "For eligible plans, Patent Readiness feeds its prior-art findings, distinguishing hypotheses, uncertainty, and design constraints directly into Product Design + CAD. InventSmith then develops and scores design candidates, prepares preliminary CAD and engineering artifacts for supported products, and continues into prototype and manufacturing work as evidence and required gates permit.",
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
        Everything you need to know before you put your invention into the Workshop.
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
            <a href="mailto:support@madethis.com">Contact Us</a>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Start Your Invention</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
