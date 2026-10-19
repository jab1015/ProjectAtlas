"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { makeFunctionReference } from "convex/server";
import Link from "next/link";
import { Archive, ArrowRight, Building2, Plus, RotateCcw, ShieldCheck } from "lucide-react";

import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

 type OrganizationRole = "owner" | "admin" | "member" | "viewer" | "professional";
 type Access = "manage" | "edit" | "view" | "review";
 interface OrganizationSummary {
   organizationId: string;
   name: string;
   kind: "personal" | "company" | "studio";
   planKey: string;
   role: OrganizationRole;
   activeInventionLimit: number | null;
   includedSeatLimit: number | null;
 }
 interface InventionSummary {
   _id: string;
   title: string;
   currentStageId: number;
   status: "active" | "archived";
   updatedAt: number;
   access: Access;
 }

 const getMyOrganizations = makeFunctionReference<"query", Record<string, never>, OrganizationSummary[]>("organizations:getMyOrganizations");
 const ensurePersonalOrganization = makeFunctionReference<"mutation", Record<string, never>, { organizationId: string }>("organizations:ensurePersonalOrganization");
 const migrateMyLegacyInventions = makeFunctionReference<"mutation", Record<string, never>, { organizationId: string; migrated: number }>("organizations:migrateMyLegacyInventions");
 const listForOrganization = makeFunctionReference<"query", { organizationId: string }, InventionSummary[]>("organizationInventions:listForOrganization");
 const archiveInvention = makeFunctionReference<"mutation", { inventionId: string }, { archived: boolean }>("organizationInventions:archive");
 const restoreInvention = makeFunctionReference<"mutation", { inventionId: string }, { restored: boolean }>("organizationInventions:restore");

function formatRelativeDate(ts: number): string {
  const diff = Date.now() - ts;
  const days = Math.floor(diff / 86_400_000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.floor(months / 12)}y ago`;
}

export default function InventionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const organizations = useQuery(getMyOrganizations, isAuthenticated ? {} : "skip");
  const ensureOrganization = useMutation(ensurePersonalOrganization);
  const migrateLegacy = useMutation(migrateMyLegacyInventions);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(() => organizations?.find((organization) => organization.organizationId === selectedId) ?? organizations?.[0] ?? null, [organizations, selectedId]);
  const inventions = useQuery(listForOrganization, isAuthenticated && selected ? { organizationId: selected.organizationId } : "skip");
  const archiveAction = useMutation(archiveInvention);
  const restoreAction = useMutation(restoreInvention);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated || organizations === undefined || organizations.length > 0) return;
    void ensureOrganization({}).then(() => migrateLegacy({})).catch(() => undefined);
  }, [ensureOrganization, isAuthenticated, migrateLegacy, organizations]);

  useEffect(() => {
    if (!selectedId && organizations?.length) setSelectedId(organizations[0].organizationId);
  }, [organizations, selectedId]);

  if (isLoading || !isAuthenticated) return null;

  const active = inventions?.filter((invention) => invention.status === "active") ?? [];
  const archived = inventions?.filter((invention) => invention.status === "archived") ?? [];
  const canCreate = Boolean(selected && (selected.role === "owner" || selected.role === "admin" || selected.role === "member") && (selected.activeInventionLimit === null || active.length < selected.activeInventionLimit));

  const renderInvention = (invention: InventionSummary) => (
    <div key={invention._id} className="relative rounded-xl border border-border bg-card transition-all hover:border-primary/30 hover:shadow-sm">
      <Link href={`/invention/${invention._id}`} className="block p-5 pr-32">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 flex flex-wrap items-center gap-2"><span className="text-xs font-medium text-primary">Stage {invention.currentStageId}</span><Badge variant="outline" className="capitalize">{invention.access}</Badge>{invention.status === "archived" && <Badge variant="secondary">Archived</Badge>}</div>
            <h2 className="truncate text-lg font-semibold text-foreground">{invention.title}</h2>
            <p className="mt-2 text-xs text-muted-foreground">Updated {formatRelativeDate(invention.updatedAt)}</p>
          </div>
          <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
        </div>
      </Link>
      {invention.access === "manage" && (
        <div className="absolute right-3 top-3 flex items-center gap-1">
          <Button asChild size="sm" variant="ghost" title="Manage invention access"><Link href={`/invention/${invention._id}/access`}><ShieldCheck className="h-4 w-4" /><span className="sr-only">Access</span></Link></Button>
          {invention.status === "active" ? <Button size="sm" variant="ghost" title="Archive invention" onClick={() => void archiveAction({ inventionId: invention._id })}><Archive className="h-4 w-4" /><span className="sr-only">Archive</span></Button> : <Button size="sm" variant="ghost" title="Restore invention" onClick={() => void restoreAction({ inventionId: invention._id })}><RotateCcw className="h-4 w-4" /><span className="sr-only">Restore</span></Button>}
        </div>
      )}
    </div>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <AppNav />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-medium uppercase tracking-widest text-primary">Portfolio</p><h1 className="mt-2 text-2xl font-bold text-foreground">Invention workspaces</h1><p className="mt-2 text-sm text-muted-foreground">Active invention slots belong to the selected organization. Archived inventions remain available without consuming an active slot.</p></div>
            {canCreate && selected && <Button asChild size="sm"><Link href={`/onboarding?organizationId=${encodeURIComponent(selected.organizationId)}`}><Plus className="mr-1.5 h-4 w-4" />New invention</Link></Button>}
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {organizations?.map((organization) => <Button key={organization.organizationId} type="button" size="sm" variant={selected?.organizationId === organization.organizationId ? "default" : "outline"} onClick={() => setSelectedId(organization.organizationId)}>{organization.name}</Button>)}
            <Button asChild size="sm" variant="ghost"><Link href="/organizations">Manage teams</Link></Button>
          </div>

          {selected && (
            <div className="mt-5 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{selected.name}</span> · {active.length} active{selected.activeInventionLimit === null ? "" : ` of ${selected.activeInventionLimit}`} · {selected.includedSeatLimit === null ? "contracted seats" : `${selected.includedSeatLimit} included seat${selected.includedSeatLimit === 1 ? "" : "s"}`} · <span className="capitalize">{selected.role}</span>
            </div>
          )}

          {inventions === undefined ? (
            <div className="mt-6 space-y-3"><div className="h-24 animate-pulse rounded-xl bg-muted" /><div className="h-24 animate-pulse rounded-xl bg-muted" /></div>
          ) : active.length === 0 ? (
            <div className="mt-6 rounded-xl border border-border py-16 text-center"><p className="text-muted-foreground">No active inventions are visible in this organization.</p>{canCreate && selected && <Button asChild className="mt-4"><Link href={`/onboarding?organizationId=${encodeURIComponent(selected.organizationId)}`}>Start an invention</Link></Button>}</div>
          ) : (
            <section className="mt-6"><h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Active</h2><div className="space-y-3">{active.map(renderInvention)}</div></section>
          )}

          {archived.length > 0 && <section className="mt-10"><h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">Archived</h2><div className="space-y-3">{archived.map(renderInvention)}</div></section>}

          {selected && !canCreate && selected.role !== "viewer" && selected.role !== "professional" && (
            <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 text-center text-sm text-muted-foreground">This organization is using all of its active invention slots. Archive a completed/paused invention or <Link href="/pricing" className="font-medium text-foreground underline underline-offset-4">compare higher-capacity plans</Link>.</div>
          )}
          {selected?.role === "professional" && <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 text-sm text-muted-foreground">Professional members only see inventions explicitly assigned to them. Other organization projects remain hidden.</div>}
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
