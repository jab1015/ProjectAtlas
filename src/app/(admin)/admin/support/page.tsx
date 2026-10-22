"use client";

import { useState } from "react";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { AdminHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { userFacingError } from "@/lib/userFacingError";

const STATUSES = ["open", "investigating", "waiting_on_user", "resolved"] as const;
type CaseStatus = (typeof STATUSES)[number];
const STATUS_LABELS: Record<CaseStatus, string> = { open: "Open", investigating: "Investigating", waiting_on_user: "Waiting on user", resolved: "Resolved" };

export default function AdminSupportPage() {
  const [filter, setFilter] = useState<CaseStatus | "all">("all");
  const cases = useQuery(api.supportCases.listForAdmin, filter === "all" ? {} : { status: filter });
  const updateCase = useMutation(api.supportCases.updateByAdmin);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function saveCase(item: NonNullable<typeof cases>[number], form: HTMLFormElement) {
    const data = new FormData(form);
    setBusy(String(item._id));
    setMessage("");
    try {
      await updateCase({ caseId: item._id, status: data.get("status") as CaseStatus, adminNotes: String(data.get("adminNotes") ?? "") });
      setMessage(`Case updated: ${item.subject}`);
    } catch (error) {
      setMessage(userFacingError(error, "Could not update this case."));
    } finally {
      setBusy(null);
    }
  }

  return <div className="space-y-6">
    <AdminHeader title="Support cases" description="Investigate user-reported issues, track status, and keep private internal notes." />
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-sm font-medium" htmlFor="support-status-filter">Show</label>
      <select id="support-status-filter" className="h-10 rounded-md border bg-background px-3 text-sm" value={filter} onChange={event => setFilter(event.target.value as CaseStatus | "all")}>
        <option value="all">All cases</option>{STATUSES.map(status => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}
      </select>
      <Link href="/support" className="text-sm text-primary underline">Open customer support form</Link>
    </div>
    {message && <p role="status" className="rounded-md border p-3 text-sm">{message}</p>}
    {cases === undefined ? <p className="text-sm text-muted-foreground">Loading support cases…</p> : cases.length === 0 ? <div className="rounded-lg border p-6"><h2 className="font-semibold">No cases in this view</h2><p className="mt-1 text-sm text-muted-foreground">New reports submitted from the customer support page will appear here.</p></div> : <div className="space-y-4">{cases.map(item => <article key={String(item._id)} className="rounded-lg border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-xs uppercase tracking-wider text-muted-foreground">{item.category.replaceAll("_", " ")} · {STATUS_LABELS[item.status]}</p><h2 className="mt-1 text-lg font-semibold">{item.subject}</h2><p className="text-sm text-muted-foreground">{item.reporter.name || item.reporter.email} · {new Date(item.createdAt).toLocaleString()}</p></div>
        {item.linkedInvention && <div className="text-sm"><p className="text-muted-foreground">Linked invention · Stage {item.linkedInvention.currentStageId}</p><Link className="font-medium text-primary underline" href={`/invention/${item.linkedInvention.id}/evidence`}>{item.linkedInvention.title} — open in authorized workspace</Link><p className="mt-1 max-w-sm text-xs text-muted-foreground">This link uses normal invention access controls. A support case does not grant access to private invention evidence.</p></div>}
      </div>
      <p className="my-4 whitespace-pre-wrap text-sm">{item.description}</p>
      <form className="grid gap-3 border-t pt-4 md:grid-cols-[220px_1fr_auto] md:items-end" onSubmit={event => { event.preventDefault(); void saveCase(item, event.currentTarget); }}>
        <label className="grid gap-1 text-sm font-medium">Case status<select name="status" defaultValue={item.status} className="h-10 rounded-md border bg-background px-3 font-normal">{STATUSES.map(status => <option key={status} value={status}>{STATUS_LABELS[status]}</option>)}</select></label>
        <label className="grid gap-1 text-sm font-medium">Private internal notes<textarea name="adminNotes" defaultValue={item.adminNotes ?? ""} maxLength={5000} rows={2} className="rounded-md border bg-background px-3 py-2 font-normal" placeholder="Investigation notes; not visible to the reporter." /></label>
        <Button type="submit" disabled={busy === String(item._id)}>{busy === String(item._id) ? "Saving…" : "Save case"}</Button>
      </form>
    </article>)}</div>}
  </div>;
}
