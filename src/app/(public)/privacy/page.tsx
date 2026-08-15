import Link from "next/link";

const sections = [
  ["Information Atlas handles", "Account identifiers; invention descriptions and files; inventor decisions, approvals, and chat; research sources and generated drafts; usage, billing status, security, and audit records; and technical diagnostics needed to operate the service."],
  ["How information is used", "Atlas uses this information to authenticate you, perform authorized invention work, generate and store deliverables, enforce plan and safety limits, provide support, prevent abuse, reconcile subscriptions, and improve reliability. Atlas does not promise that submitted information creates attorney-client, patent-agent, engineer-client, or other professional privilege."],
  ["AI processing", "Relevant invention content may be sent to configured AI and research providers to perform requested work. Atlas minimizes the project context sent for each task and does not expose the API key to the browser. Do not submit information you are not authorized to process."],
  ["Sharing and sale", "Atlas does not sell invention information. Information is shared only with service providers needed to operate Atlas, professionals or third parties you authorize, or when legally required. Atlas does not contact or disclose to an outside professional without the applicable authorization gate."],
  ["Retention and deletion", "Project data is retained while your account or pilot relationship is active and as needed for security, billing, dispute, and legal obligations. Deleting an invention removes its Atlas records, chat, evidence, reviews, and generated storage. Account-level deletion is coordinated with authentication, subscription, and legally required transaction retention."],
  ["Your choices", "Authenticated users can download invention deliverables and request a broader data export or account deletion from Account. You may also correct invention inputs, revoke pending authorizations, or stop using Atlas. Some transaction or security records may be retained where law or fraud prevention requires it."],
  ["Security and incidents", "Atlas uses owner-scoped backend access, administrator controls, signed webhooks, secret isolation, audit events, bounded generation, and dependency monitoring. No system is perfectly secure. Atlas will investigate and respond to suspected incidents under the pilot operations process."],
  ["Children and restricted uses", "Atlas is not intended for children or for safety-critical, medical, weapons, illegal, or other excluded invention categories during the controlled pilot."],
];

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-primary">Controlled-pilot notice · Draft for counsel review</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight">Atlas Privacy Notice</h1>
      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">Effective August 14, 2026. This notice describes the current controlled-pilot implementation. It must receive legal review and jurisdiction-specific updates before public launch.</p>
      <div className="mt-10 space-y-8">
        {sections.map(([title, body]) => <section key={title}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 leading-relaxed text-muted-foreground">{body}</p></section>)}
        <section><h2 className="text-xl font-semibold">Contact and requests</h2><p className="mt-2 leading-relaxed text-muted-foreground">Use the authenticated <Link href="/account" className="font-medium text-primary">Account page</Link> for export or deletion requests. Pilot support: <a href="mailto:support@madethis.com" className="font-medium text-primary">support@madethis.com</a>.</p></section>
      </div>
    </main>
  );
}
