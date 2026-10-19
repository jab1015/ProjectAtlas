"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { BarChart3, Gauge, Layers3, WalletCards } from "lucide-react";

import { AppNav } from "@/components/atlas/app-nav";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PlanKey = "explorer" | "inventor" | "pro" | "enterprise" | "studio_3" | "studio_6" | "studio_custom";
type Role = "owner" | "admin" | "member" | "viewer" | "professional";
type CostClass = "light" | "standard" | "expensive" | "premium";

interface OrganizationSummary {
  organizationId: string;
  name: string;
  kind: "personal" | "company" | "studio";
  planKey: PlanKey;
  role: Role;
  activeInventionLimit: number | null;
  includedSeatLimit: number | null;
}

interface ClassUsage { costUnits: number; completions: number; }
interface UsageOverview {
  organization: {
    organizationId: string;
    name: string;
    kind: string;
    planKey: PlanKey;
    monthlyPriceUsd: number | null;
    activeInventionLimit: number | null;
    includedSeatLimit: number | null;
  };
  period: { days: number; since: number };
  inventions: {
    active: number;
    archived: number;
    usage: Array<{
      inventionId: string;
      title: string;
      status: string;
      costUnits: number;
      completedWorkEvents: number;
      byOperationClass: Record<CostClass, ClassUsage>;
    }>;
  };
  autonomousUsage: {
    totalCostUnits: number;
    completedWorkEvents: number;
    byOperationClass: Record<CostClass, ClassUsage>;
    byWorkKind: Array<{ kind: string; costUnits: number; completions: number }>;
  };
  economics: {
    estimatedVariableCostUsd: number | null;
    grossMarginEstimate: number | null;
    calibrationReady: boolean;
    note: string;
  };
}

const getMyOrganizations = makeFunctionReference<"query", Record<string, never>, OrganizationSummary[]>("organizations:getMyOrganizations");
const getOrganizationUsageOverview = makeFunctionReference<"query", { organizationId: string; days?: number }, UsageOverview>("organizationUsage:getOrganizationUsageOverview");

const CLASS_LABELS: Record<CostClass, { label: string; detail: string }> = {
  light: { label: "Light", detail: "Routine analysis and operating work" },
  standard: { label: "Standard", detail: "Normal department execution" },
  expensive: { label: "Expensive", detail: "Deep research, design and complex synthesis" },
  premium: { label: "Premium", detail: "CAD and generated visual assets" },
};

function formatPrice(value: number | null) {
  return value === null ? "Custom" : value === 0 ? "Free" : `$${value}/month`;
}

export default function OrganizationUsagePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const organizations = useQuery(getMyOrganizations, isAuthenticated ? {} : "skip");
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!organizationId && organizations?.length) setOrganizationId(organizations[0].organizationId);
  }, [organizationId, organizations]);

  const selected = useMemo(() => organizations?.find((item) => item.organizationId === organizationId) ?? null, [organizationId, organizations]);
  const usage = useQuery(getOrganizationUsageOverview, isAuthenticated && organizationId ? { organizationId, days } : "skip");

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Organization economics</p>
            <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Usage and cost-to-serve</h1>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">See which inventions and work classes consume InventSmith capacity. Team members share one organization allowance, so adding seats does not multiply AI, CAD, rendering, research, or document-generation budgets.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <select aria-label="Organization" value={organizationId ?? ""} onChange={(event) => setOrganizationId(event.target.value)} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              {(organizations ?? []).map((organization) => <option key={organization.organizationId} value={organization.organizationId}>{organization.name}</option>)}
            </select>
            <select aria-label="Usage period" value={days} onChange={(event) => setDays(Number(event.target.value))} className="h-10 rounded-md border border-input bg-background px-3 text-sm">
              <option value={7}>7 days</option><option value={30}>30 days</option><option value={90}>90 days</option><option value={365}>365 days</option>
            </select>
          </div>
        </div>

        {!selected ? (
          <Card className="mt-8"><CardContent className="p-8 text-sm text-muted-foreground">No organization is available yet.</CardContent></Card>
        ) : usage === undefined ? (
          <div className="mt-8 grid gap-4 md:grid-cols-3"><div className="h-32 animate-pulse rounded-xl bg-muted" /><div className="h-32 animate-pulse rounded-xl bg-muted" /><div className="h-32 animate-pulse rounded-xl bg-muted" /></div>
        ) : (
          <>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <Card><CardHeader><div className="flex items-center gap-2 text-muted-foreground"><WalletCards className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">Plan</span></div><CardTitle>{formatPrice(usage.organization.monthlyPriceUsd)}</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{usage.organization.name} · <span className="capitalize">{usage.organization.planKey.replaceAll("_", " ")}</span></p></CardContent></Card>
              <Card><CardHeader><div className="flex items-center gap-2 text-muted-foreground"><Gauge className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">Measured usage</span></div><CardTitle>{usage.autonomousUsage.totalCostUnits} units</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{usage.autonomousUsage.completedWorkEvents} completed autonomous work events in the last {usage.period.days} days.</p></CardContent></Card>
              <Card><CardHeader><div className="flex items-center gap-2 text-muted-foreground"><Layers3 className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">Projects</span></div><CardTitle>{usage.inventions.active} active</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{usage.inventions.archived} archived · {usage.organization.activeInventionLimit === null ? "contracted" : usage.organization.activeInventionLimit} active-slot limit.</p></CardContent></Card>
            </div>

            <section className="mt-8" aria-labelledby="cost-classes-title">
              <div className="mb-4 flex items-center gap-2"><BarChart3 className="h-4 w-4 text-muted-foreground" /><h2 id="cost-classes-title" className="text-lg font-semibold">Where capacity is going</h2></div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {(Object.keys(CLASS_LABELS) as CostClass[]).map((key) => {
                  const item = usage.autonomousUsage.byOperationClass[key];
                  return <Card key={key}><CardHeader><div className="flex items-center justify-between gap-2"><CardTitle className="text-base">{CLASS_LABELS[key].label}</CardTitle><Badge variant="outline">{item.costUnits} units</Badge></div></CardHeader><CardContent><p className="text-sm text-muted-foreground">{CLASS_LABELS[key].detail}</p><p className="mt-2 text-xs text-muted-foreground">{item.completions} completed operations</p></CardContent></Card>;
                })}
              </div>
            </section>

            <section className="mt-8" aria-labelledby="invention-cost-title">
              <h2 id="invention-cost-title" className="text-lg font-semibold">Usage by invention</h2>
              <div className="mt-4 space-y-3">
                {usage.inventions.usage.length === 0 ? <Card><CardContent className="p-6 text-sm text-muted-foreground">No measured invention usage is available in this period.</CardContent></Card> : usage.inventions.usage.map((invention) => (
                  <Card key={invention.inventionId}><CardContent className="p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{invention.title}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{invention.status} · {invention.completedWorkEvents} completed operations</p></div><Badge>{invention.costUnits} units</Badge></div><div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(CLASS_LABELS) as CostClass[]).map((key) => <div key={key} className="rounded-md border border-border bg-muted/30 px-3 py-2"><p className="text-xs text-muted-foreground">{CLASS_LABELS[key].label}</p><p className="mt-1 text-sm font-medium">{invention.byOperationClass[key].costUnits}</p></div>)}</div></CardContent></Card>
                ))}
              </div>
            </section>

            <section className="mt-8 rounded-xl border border-border bg-card p-6" aria-labelledby="calibration-title">
              <h2 id="calibration-title" className="font-semibold">Dollar-cost calibration</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{usage.economics.note}</p>
              <p className="mt-3 text-xs text-muted-foreground">InventSmith will not manufacture a gross-margin percentage from abstract units. Once production model, web-search, image, CAD, extraction, storage and artifact costs are calibrated, this page can convert the same measured history into estimated variable cost and contribution margin by plan and invention.</p>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
