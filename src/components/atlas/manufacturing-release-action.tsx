"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import type { Id } from "@convex/_generated/dataModel";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { selectCurrentSynchronizedCadGeneration, type ManufacturingReleaseCadArtifact } from "@/lib/manufacturing-release-ui-logic";

type InventionAccess = "manage" | "edit" | "view" | "review" | null;

type CadArtifact = ManufacturingReleaseCadArtifact<Id<"atlasDeliverables">>;

type ReleaseResult = {
  success: true;
  idempotent: boolean;
  version: number;
  deliverableIds: Id<"atlasDeliverables">[];
};

const getMyInventionAccess = makeFunctionReference<
  "query",
  { inventionId: Id<"inventions"> },
  InventionAccess
>("organizations:getMyInventionAccess");

const releaseCadGenerationForManufacturing = makeFunctionReference<
  "mutation",
  { deliverableId: Id<"atlasDeliverables"> },
  ReleaseResult
>("manufacturingReleaseMutation:releaseCadGenerationForManufacturing");

export function ManufacturingReleaseAction({
  inventionId,
  artifacts,
}: {
  inventionId: Id<"inventions">;
  artifacts: CadArtifact[];
}) {
  const access = useQuery(getMyInventionAccess, { inventionId });
  const releaseCad = useMutation(releaseCadGenerationForManufacturing);
  const [releasing, setReleasing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (access !== "manage") return null;

  const generation = selectCurrentSynchronizedCadGeneration(artifacts);
  if (!generation) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">
        Manufacturing release is unavailable until one complete, synchronized newest native CAD generation exists.
      </p>
    );
  }

  const version = generation[0].version;
  const hasStaleArtifact = generation.some((artifact) => Boolean(artifact.staleReason));
  const alreadyReleased = generation.every((artifact) => artifact.artifactMaturity === "manufacturing_released");
  const engineeringReviewed = generation.every((artifact) => artifact.artifactMaturity === "engineering_reviewed");

  if (alreadyReleased) {
    return (
      <div className="mt-5 rounded-xl border border-success/25 bg-success/5 p-4 text-sm">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <CheckCircle2 className="h-4 w-4 text-success" /> Manufacturing released — native CAD generation v{version}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          This is an internal artifact-maturity release only. It does not mean a supplier was contacted, files were disclosed, an order or payment was placed, production began, a filing was submitted, or anything was published.
        </p>
      </div>
    );
  }

  if (hasStaleArtifact || !engineeringReviewed) {
    return (
      <p className="mt-4 text-xs text-muted-foreground">
        Manufacturing release remains locked until every artifact in the current synchronized CAD generation is fresh and engineering reviewed.
      </p>
    );
  }

  const release = async () => {
    const confirmed = window.confirm(
      `Release native CAD generation v${version} for manufacturing planning?\n\nThis changes only the exact current CAD generation's artifact maturity. It does NOT contact a supplier, disclose files, purchase anything, make a payment, place a production order, submit a filing, publish anything, or start production.`
    );
    if (!confirmed) return;

    setReleasing(true);
    setMessage(null);
    setError(null);
    try {
      const result = await releaseCad({ deliverableId: generation[0]._id });
      setMessage(
        result.idempotent
          ? `Native CAD generation v${result.version} was already manufacturing released.`
          : `Native CAD generation v${result.version} is now manufacturing released for planning. No external action was performed.`
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "InventSmith could not release this CAD generation.");
    } finally {
      setReleasing(false);
    }
  };

  return (
    <div className="mt-5 rounded-xl border border-warning/25 bg-background p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-foreground">
            <ShieldCheck className="h-4 w-4 text-warning" /> Engineering-reviewed CAD generation v{version}
          </p>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            A manager may deliberately mark this exact reviewed generation Manufacturing Released for planning. This permission does not contact suppliers, disclose files, spend money, order production, file, publish, or execute any external action.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={() => void release()} disabled={releasing}>
          {releasing ? "Releasing…" : "Release for manufacturing planning"}
        </Button>
      </div>
      {message && <p className="mt-3 text-xs text-success">{message}</p>}
      {error && <p role="alert" className="mt-3 text-xs text-destructive">{error}</p>}
    </div>
  );
}
