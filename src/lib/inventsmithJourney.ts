export interface PublicJourneyStage {
  id: number;
  name: string;
  description: string;
}

export const INVENTSMITH_PUBLIC_JOURNEY: readonly PublicJourneyStage[] = [
  { id: 1, name: "Idea", description: "Capture the invention clearly and turn the raw idea into a persistent working record." },
  { id: 2, name: "Validation", description: "Test the problem, assumptions, customer need, and early evidence before committing more time or money." },
  { id: 3, name: "Market Research", description: "Understand customers, alternatives, competitors, market size, pricing signals, and commercial context." },
  { id: 4, name: "Patent Readiness", description: "Research prior art, compare features, identify distinguishing hypotheses, and prepare the right questions for qualified patent review." },
  { id: 5, name: "Product Design + CAD", description: "Select an evidence-backed design direction and turn it into preliminary product specifications, CAD, drawings, and presentation renders." },
  { id: 6, name: "Prototype", description: "Plan and evaluate physical prototypes against measurable tests, then feed real findings back into the design." },
  { id: 7, name: "Manufacturing", description: "Prepare factory requirements, RFQs, sourcing, quote comparison, quality considerations, unit economics, and production readiness." },
  { id: 8, name: "Branding", description: "Develop evidence-backed positioning, naming, preliminary trademark screening, visual direction, and brand assets." },
  { id: 9, name: "Intellectual Property / Legal", description: "Prepare IP strategy, invention disclosure, NDA and contract working packages, status tracking, and professional legal handoffs." },
  { id: 10, name: "Pricing", description: "Turn market, value, manufacturing, channel, and willingness-to-pay evidence into pricing and break-even strategy." },
  { id: 11, name: "Marketing", description: "Build the messaging, channels, launch plan, core marketing assets, and pre-launch calendar." },
  { id: 12, name: "Sales", description: "Create the channel strategy, buyer toolkit, funnel model, projections, and post-purchase customer experience." },
  { id: 13, name: "Funding", description: "Match the invention to appropriate funding paths and produce the financial model, source research, pitch deck, and investor diligence package." },
  { id: 14, name: "Launch", description: "Coordinate product, inventory, legal, marketing, sales, support, analytics, and customer-feedback readiness for launch." },
  { id: 15, name: "Growth", description: "Use real post-launch evidence to improve product, economics, acquisition, retention, channels, and operations." },
] as const;
