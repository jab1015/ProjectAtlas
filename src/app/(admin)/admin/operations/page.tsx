"use client";

import Link from "next/link";
import { useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Activity, AlertTriangle, Clock3, Coins, OctagonX } from "lucide-react";
import { AdminHeader, StatsCard } from "@/components/admin";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface Snapshot {
  generatedAt: number;
  counts: { failed: number; expired: number; blocked: number; reservedCostUnits: number; usedCostUnits: number };
  issues: Array<{
    _id: string; inventionId: string; inventionTitle: string; title: string; kind: string;
    health: "failed" | "expired" | "blocked"; blockedReason?: string; lastError?: string;
    attemptCount: number; leaseExpiresAt?: number; updatedAt: number;
  }>;
  scannedInventionCount: number;
  truncated: boolean;
}

const getSnapshot = makeFunctionReference<"query", Record<string, never>, Snapshot>("operationalHealth:getSnapshot");

const labels = { failed: "Failed", expired: "Expired lease", blocked: "Human gate" } as const;

export default function AtlasOperationsPage() {
  const snapshot = useQuery(getSnapshot);
  if (snapshot === undefined) return <div className="space-y-6"><AdminHeader title="Atlas operations" /><Skeleton className="h-28" /><Skeleton className="h-72" /></div>;

  return (
    <div className="space-y-8">
      <AdminHeader title="Atlas operations" description="Pilot health, autonomous work exceptions, and daily cost activity" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Failed work" value={String(snapshot.counts.failed)} icon={OctagonX} />
        <StatsCard title="Expired leases" value={String(snapshot.counts.expired)} icon={Clock3} />
        <StatsCard title="Human gates" value={String(snapshot.counts.blocked)} icon={AlertTriangle} />
        <StatsCard title="Cost today" value={`${snapshot.counts.usedCostUnits} used · ${snapshot.counts.reservedCostUnits} reserved`} icon={Coins} />
      </div>
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Activity className="h-5 w-5" />Work requiring attention</CardTitle></CardHeader>
        <CardContent>
          {snapshot.issues.length === 0 ? <p className="text-sm text-muted-foreground">No failed, expired, or human-blocked work was found.</p> : (
            <div className="divide-y">
              {snapshot.issues.map((issue) => (
                <div key={issue._id} className="space-y-1 py-4 first:pt-0">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link className="font-medium hover:underline" href={`/invention/${issue.inventionId}/work`}>{issue.inventionTitle}: {issue.title}</Link>
                    <span className="rounded-full border px-2 py-0.5 text-xs font-medium">{labels[issue.health]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{issue.kind.replaceAll("_", " ")} · attempt {issue.attemptCount} · updated {new Date(issue.updatedAt).toLocaleString()}</p>
                  {(issue.lastError || issue.blockedReason) && <p className="break-words text-sm text-muted-foreground">{issue.lastError ?? issue.blockedReason}</p>}
                </div>
              ))}
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">Snapshot {new Date(snapshot.generatedAt).toLocaleString()}. {snapshot.truncated ? "Results reached the pilot scan limit; investigate immediately." : "Scan is within the pilot limit."}</p>
        </CardContent>
      </Card>
    </div>
  );
}
