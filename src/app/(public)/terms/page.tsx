const sections = [
  ["What Atlas provides", "Atlas is an invention research, organization, drafting, and workflow-assistance service. It may create preliminary research, product directions, concept visuals, cost ranges, and drafts for professional review. Atlas does not guarantee patentability, freedom to operate, regulatory compliance, engineering fitness, financing, manufacture, sales, or market success."],
  ["No professional relationship", "Atlas outputs are not legal advice, a patentability or freedom-to-operate opinion, regulatory approval, production-release engineering, tax or investment advice, or a substitute for a qualified professional. Labels such as evidence checked or professionally reviewed describe recorded workflow states and do not expand a reviewer's scope."],
  ["Inventor ownership and responsibility", "As between you and Atlas, you retain rights you hold in the invention information you submit. You authorize Atlas to process that information to provide requested services. You are responsible for having submission rights, protecting secrecy before disclosure, evaluating outputs, making decisions, and obtaining required professional approvals, tests, permits, insurance, and filings."],
  ["AI and research limitations", "AI outputs and web research can be incomplete, outdated, inaccurate, or similar to existing material. Patent and competitor searches are preliminary and may miss unpublished, foreign, non-patent, or differently classified prior art. You must not represent an Atlas draft as a professional opinion or approved production document."],
  ["Authorized actions", "Atlas may prepare work autonomously within your plan, but consequential external actions - including disclosure, contact, purchase, publication, filing, and external use - remain behind authorization or professional review gates. You may withdraw a pending authorization before the external action occurs."],
  ["Acceptable use", "You may not use Atlas for unlawful activity, infringement, deception, weapons, malicious surveillance, safety-critical development outside an approved program, unauthorized personal data, attempts to bypass access or usage controls, or interference with the service."],
  ["Plans and payments", "Plans have finite usage and active-invention limits. Paid access begins only after a valid billing event reaches Atlas. Canceled or past-due access may continue through a recorded paid period; unpaid, incomplete, paused, or expired access returns to Explorer. Professional services, filing fees, prototypes, manufacturing, testing, and third-party purchases are separate unless expressly stated."],
  ["Pilot availability and termination", "The controlled pilot may change, pause, or discontinue features. Atlas may suspend access for security, abuse, nonpayment, or excluded-risk use. You may stop using the service and request account deletion, subject to transaction, security, dispute, and legal retention requirements."],
  ["Required legal review", "These pilot terms are an implementation-aligned draft, not final launch terms. Counsel must add the correct contracting entity, governing law, dispute process, warranty disclaimer, liability limits, privacy addenda, refund rules, and jurisdiction-specific consumer notices before public release."],
];

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Controlled-pilot terms · Draft for counsel review</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Atlas Terms of Service</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Effective August 14, 2026. These terms reflect Atlas's current safety and autonomy boundaries but are not approved for public launch.</p>
      <div className="mt-10 space-y-8">{sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 leading-relaxed text-muted-foreground">{body}</p></section>)}</div>
    </main>
  );
}
