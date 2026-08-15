"use client";

import Link from "next/link";

const ALL_STAGES = [
  { id: 1, name: "Idea" },
  { id: 2, name: "Validation" },
  { id: 3, name: "Market Research" },
  { id: 4, name: "Patent Readiness" },
  { id: 5, name: "Product Design + CAD" },
  { id: 6, name: "Prototype" },
  { id: 7, name: "Manufacturing" },
  { id: 8, name: "Branding" },
  { id: 9, name: "Intellectual Property" },
  { id: 10, name: "Pricing" },
  { id: 11, name: "Marketing" },
  { id: 12, name: "Sales" },
  { id: 13, name: "Funding" },
  { id: 14, name: "Launch" },
  { id: 15, name: "Growth" },
] as const;

interface JourneyMapProps {
  currentStageId: number;
  inventionId?: string;
}

function stageHref(inventionId: string, stageId: number) {
  if (stageId <= 3) return `/invention/${inventionId}`;
  if (stageId === 4) return `/invention/${inventionId}/patent`;
  if (stageId === 5) return `/invention/${inventionId}/design`;
  return `/invention/${inventionId}/department/${stageId}`;
}

export function JourneyMap({ currentStageId, inventionId }: JourneyMapProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Idea to market</p>
          <p className="mt-1 text-sm text-muted-foreground">InventSmith keeps the entire journey visible, executes eligible work, and explains dependencies before you spend money or contact outside parties.</p>
        </div>
        <span className="shrink-0 text-xs text-muted-foreground">Stage {currentStageId} of {ALL_STAGES.length}</span>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex min-w-max gap-2">
          {ALL_STAGES.map((stage) => {
            const isCurrent = stage.id === currentStageId;
            const isCompleted = stage.id < currentStageId;
            const isUpcoming = stage.id > currentStageId;
            const pill = (
              <div
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isCurrent
                    ? "border-primary bg-primary text-primary-foreground"
                    : isCompleted
                    ? "border-primary/20 bg-primary/10 text-primary hover:bg-primary/15"
                    : "border-border bg-muted/30 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                }`}
                title={isUpcoming ? `${stage.name} — inspect this department and its dependencies` : stage.name}
              >
                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${isCurrent ? "bg-primary-foreground/20 text-primary-foreground" : isCompleted ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>{stage.id}</span>
                <span>{stage.name}</span>
              </div>
            );

            if (inventionId) {
              return <Link key={stage.id} href={stageHref(inventionId, stage.id)} className="no-underline">{pill}</Link>;
            }
            return <div key={stage.id}>{pill}</div>;
          })}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Upcoming departments are visible for planning, but InventSmith will not treat their work as ready until required upstream evidence, designs, approvals, physical tests, or professional reviews exist.</p>
    </div>
  );
}
