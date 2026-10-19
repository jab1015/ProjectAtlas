"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";
import Link from "next/link";
import { AppNav } from "@/components/atlas/app-nav";
import { Button } from "@/components/ui/button";

const FIELDS = [
  ["problemStatement", "Problem"],
  ["targetAudience", "Who experiences it"],
  ["solutionDescription", "Proposed solution"],
] as const;

export default function IdeaStagePage() {
  const params = useParams();
  const router = useRouter();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const state = useQuery(api.journeyEngine.getInventionState, isAuthenticated && inventionId ? { inventionId } : "skip");

  useEffect(() => { if (!isLoading && !isAuthenticated) router.push("/sign-in"); }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated || state === undefined) return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-3xl px-4 py-12 text-sm text-muted-foreground">Loading idea…</main></div>;
  if (!state) return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-3xl px-4 py-12">Idea not found.</main></div>;

  return <div className="min-h-screen bg-background"><AppNav /><main className="mx-auto max-w-3xl space-y-6 px-4 py-10 sm:px-6">
    <Link href={`/invention/${inventionId}/journey`} className="text-sm text-muted-foreground underline">Back to journey</Link>
    <header><p className="text-xs font-semibold uppercase tracking-widest text-primary">Stage 1 — Idea</p><h1 className="mt-2 text-3xl font-bold">{state.invention.title}</h1><p className="mt-2 text-muted-foreground">Your starting idea and the details that shape the later work.</p></header>
    <section className="space-y-4 rounded-xl border bg-card p-5">
      {FIELDS.map(([key, label]) => <div key={key}><h2 className="text-sm font-semibold">{label}</h2><p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">{state.invention[key] || "Not added yet."}</p></div>)}
      <div className="flex flex-wrap gap-3 pt-2"><Button asChild><Link href={`/invention/${inventionId}`}>{state.currentStage.id === 1 ? "Edit idea" : "Continue validation"}</Link></Button></div>
    </section>
  </main></div>;
}
