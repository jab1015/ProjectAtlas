"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { api } from "@convex/_generated/api";
import { useMutation, useQueries } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Id } from "@convex/_generated/dataModel";
import { AppNav } from "@/components/atlas/app-nav";
import { userFacingError } from "@/lib/userFacingError";
import { Button } from "@/components/ui/button";

const STATUS_LABELS = { open: "Open", investigating: "Being investigated", waiting_on_user: "Waiting on you", resolved: "Resolved" } as const;
const listMyCases = makeFunctionReference<"query", Record<string, never>, Array<{
  _id: Id<"supportCases">; subject: string; category: keyof typeof STATUS_LABELS | "bug" | "other" | "account" | "billing" | "invention";
  status: keyof typeof STATUS_LABELS; createdAt: number; description: string; inventionId?: Id<"inventions">;
}>>("supportCases:listMine");

function SupportForm() {
  const searchParams = useSearchParams();
  const initialInventionId = searchParams.get("inventionId") ?? "";
  const supportQueries = useMemo(() => ({ cases: { query: listMyCases, args: {} } }), []);
  const queryResults = useQueries(supportQueries);
  const cases = queryResults.cases as Array<{ _id: Id<"supportCases">; subject: string; category: string; status: keyof typeof STATUS_LABELS; createdAt: number; description: string; inventionId?: Id<"inventions"> }> | undefined | Error;
  const createCase = useMutation(api.supportCases.create);
  const [category, setCategory] = useState<"account" | "billing" | "invention" | "bug" | "other">("bug");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [inventionId, setInventionId] = useState(initialInventionId);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage("");
    try {
      await createCase({ category, subject, description, ...(inventionId.trim() ? { inventionId: inventionId.trim() as never } : {}) });
      setSubject(""); setDescription(""); setMessage("Support case submitted. You can track its status below.");
    } catch (error) { setMessage(userFacingError(error, "Could not submit your support case.")); }
    finally { setSaving(false); }
  }

  return <><AppNav /><main className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
    <div><p className="text-xs font-semibold uppercase tracking-widest text-primary">Help and support</p><h1 className="mt-2 text-3xl font-bold">Tell us what happened</h1><p className="mt-2 text-muted-foreground">Your report goes to the InventSmith support team. Include only information needed to investigate; never include passwords, reset codes, or API keys.</p></div>
    <form onSubmit={event => void submit(event)} className="space-y-4 rounded-lg border bg-card p-5">
      <label className="grid gap-1.5 text-sm font-medium">What is this about?<select value={category} onChange={event => setCategory(event.target.value as typeof category)} className="h-10 rounded-md border bg-background px-3 font-normal"><option value="bug">A problem or error</option><option value="account">My account</option><option value="billing">Plan or billing</option><option value="invention">My invention workspace</option><option value="other">Something else</option></select></label>
      <label className="grid gap-1.5 text-sm font-medium">Short subject<input required minLength={4} maxLength={140} value={subject} onChange={event => setSubject(event.target.value)} className="h-10 rounded-md border bg-background px-3 font-normal" /></label>
      <label className="grid gap-1.5 text-sm font-medium">What happened?<textarea required minLength={10} maxLength={5000} rows={5} value={description} onChange={event => setDescription(event.target.value)} className="rounded-md border bg-background px-3 py-2 font-normal" /></label>
      <label className="grid gap-1.5 text-sm font-medium">Related invention ID (optional)<input value={inventionId} onChange={event => setInventionId(event.target.value)} placeholder="Prefilled when you open support from an invention" className="h-10 rounded-md border bg-background px-3 font-normal" /><span className="text-xs font-normal text-muted-foreground">If linked, InventSmith verifies you can access that invention. Support staff do not get access to private evidence from this link alone.</span></label>
      {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
      <Button type="submit" disabled={saving}>{saving ? "Submitting…" : "Submit support case"}</Button>
    </form>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Your reports</h2>{cases === undefined ? <p className="text-sm text-muted-foreground">Loading…</p> : cases instanceof Error ? <div role="alert" className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950"><p>Your reports could not be loaded. You can still submit a support case.</p><Link href="/support" className="mt-2 inline-block font-medium underline">Open the support form</Link></div> : cases.length === 0 ? <p className="text-sm text-muted-foreground">You have not submitted a support case yet.</p> : cases.map(item => <article key={String(item._id)} className="rounded-lg border p-4"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-medium">{item.subject}</h3><span className="text-sm text-muted-foreground">{STATUS_LABELS[item.status]}</span></div><p className="mt-1 text-xs text-muted-foreground">{item.category} · {new Date(item.createdAt).toLocaleString()}</p><p className="mt-3 whitespace-pre-wrap text-sm">{item.description}</p>{item.inventionId && <Link className="mt-2 inline-block text-sm text-primary underline" href={`/invention/${item.inventionId}/evidence`}>Open related invention workspace</Link>}</article>)}</section>
    <Link href="/dashboard" className="text-sm text-primary underline">Back to dashboard</Link>
  </main></>;
}

export default function SupportPage() {
  return <Suspense fallback={<main className="mx-auto max-w-3xl px-4 py-10 text-sm text-muted-foreground">Loading support…</main>}><SupportForm /></Suspense>;
}
