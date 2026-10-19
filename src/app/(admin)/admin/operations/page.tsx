"use client";

import { useState } from "react";
import Link from "next/link";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Activity, AlertTriangle, Bot, Clock3, Coins, FlaskConical, OctagonX } from "lucide-react";
import { AdminHeader, StatsCard } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { REPRESENTATIVE_PILOT_INTAKE } from "@/lib/representativePilot";

interface Snapshot {
  generatedAt: number;
  // The limited production deployment may return the older snapshot shape.
  // Keep the operations console readable while that backend is intentionally
  // narrower than the branch frontend.
  ai?: { openAiConfigured: boolean; chatModel: string; validationModel: string };
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
const createInvention = makeFunctionReference<"mutation", {
  title: string; problemStatement: string; targetAudience: string; solutionDescription: string;
}, string>("journeyEngine:createInvention");
const kickAutonomousWork = makeFunctionReference<"mutation", { inventionId: string }, { scheduled: boolean; reason?: string }>("inventionWorkspace:kickAutonomousWork");

const labels = { failed: "Failed", expired: "Expired lease", blocked: "Human gate" } as const;

export default function AtlasOperationsPage() {
  const snapshot = useQuery(getSnapshot);
  const createPilotInvention = useMutation(createInvention);
  const kickWork = useMutation(kickAutonomousWork);
  const [pilotState, setPilotState] = useState<{ inventionId?: string; message?: string; creating: boolean }>({ creating: false });

  const launchRepresentativePilot = async () => {
    if (!window.confirm("Create the standard non-safety-critical InventSmith representative invention and start its eligible autonomous work?")) return;
    setPilotState({ creating: true, message: "Creating representative pilot case…" });
    try {
      const inventionId = await createPilotInvention(REPRESENTATIVE_PILOT_INTAKE);
      const result = await kickWork({ inventionId });
      setPilotState({
        creating: false,
        inventionId,
        message: result.scheduled
          ? "Representative pilot created and autonomous work scheduled."
          : `Representative pilot created. Work was not scheduled yet (${result.reason ?? "unknown reason"}).`,
      });
    } catch (error) {
      setPilotState({ creating: false, message: error instanceof Error ? error.message : "Could not create the representative pilot case." });
    }
  };

  if (snapshot === undefined) return <div className="space-y-6"><AdminHeader title="InventSmith operations" /><Skeleton className="h-28" /><Skeleton className="h-72" /></div>;

  const ai = snapshot.ai;
  const aiConfigurationAvailable = ai !== undefined;

  return (
    <div className="space-y-8">
      <AdminHeader title="InventSmith operations" description="Pilot health, AI backend readiness, autonomous work exceptions, and daily cost activity" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Failed work" value={String(snapshot.counts.failed)} icon={OctagonX} />
        <StatsCard title="Expired leases" value={String(snapshot.counts.expired)} icon={Clock3} />
        <StatsCard title="Human gates" value={String(snapshot.counts.blocked)} icon={AlertTriangle} />
        <StatsCard title="Cost today" value={`${snapshot.counts.usedCostUnits} used · ${snapshot.counts.reservedCostUnits} reserved`} icon={Coins} />
      </div>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><Bot className="h-5 w-5" />AI backend</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">OpenAI credentials</p><p className="mt-2 font-medium">{ai?.openAiConfigured ? "Configured" : aiConfigurationAvailable ? "Missing" : "Unavailable"}</p></div>
            <div className="rounded-lg border p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Ask InventSmith model</p><p className="mt-2 break-all font-medium">{ai?.chatModel ?? "Unavailable from this deployment"}</p></div>
            <div className="rounded-lg border p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Validation model</p><p className="mt-2 break-all font-medium">{ai?.validationModel ?? "Unavailable from this deployment"}</p></div>
          </div>
          {!aiConfigurationAvailable && (
            <p className="text-sm text-muted-foreground">AI configuration details are not exposed by this limited deployment. This does not reveal whether the server credential is present; the operations page remains available for health and work monitoring.</p>
          )}
          {aiConfigurationAvailable && !ai.openAiConfigured && (
            <p className="text-sm text-muted-foreground">OPENAI_API_KEY is not configured in this Convex deployment. AI requests will remain unavailable until the production deployment has that secret.</p>
          )}
          <p className="text-xs text-muted-foreground">For security, InventSmith reports only whether the credential exists. The API key value is never returned to the browser.</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-lg"><FlaskConical className="h-5 w-5" />Controlled-pilot launcher</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">Creates the standard adjustable produce-rinsing rack case used by InventSmith regression evaluation, then starts eligible autonomous work. Administrator execution is exempt from customer plan limits, daily usage caps, and AI-credit consumption.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => void launchRepresentativePilot()} disabled={pilotState.creating}>{pilotState.creating ? "Creating…" : "Create representative pilot"}</Button>
            {pilotState.inventionId && <Button asChild variant="outline"><Link href={`/invention/${pilotState.inventionId}/work`}>Open pilot work</Link></Button>}
          </div>
          {pilotState.message && <p role="status" className="text-xs text-muted-foreground">{pilotState.message}</p>}
        </CardContent>
      </Card>

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
