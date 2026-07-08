"use client";

import { Lock } from "lucide-react";
import Link from "next/link";

/**
 * Journey map — 15 stage pills in a horizontal track.
 * Stages 1–4: active. Stages 5–15: locked / coming soon.
 * Current stage is highlighted.
 */

const ALL_STAGES = [
  { id: 1, name: "Idea Capture", enabled: true },
  { id: 2, name: "Validation", enabled: true },
  { id: 3, name: "Market Research", enabled: true },
  { id: 4, name: "Patent Research", enabled: true },
  { id: 5, name: "Product Design", enabled: false },
  { id: 6, name: "Engineering", enabled: false },
  { id: 7, name: "Prototype", enabled: false },
  { id: 8, name: "Testing", enabled: false },
  { id: 9, name: "IP Protection", enabled: false },
  { id: 10, name: "Manufacturing", enabled: false },
  { id: 11, name: "Funding", enabled: false },
  { id: 12, name: "Branding", enabled: false },
  { id: 13, name: "Marketing", enabled: false },
  { id: 14, name: "Sales", enabled: false },
  { id: 15, name: "Growth", enabled: false },
];

interface JourneyMapProps {
  currentStageId: number;
  inventionId?: string;
}

export function JourneyMap({ currentStageId, inventionId }: JourneyMapProps) {
  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-2 min-w-max">
        {ALL_STAGES.map((stage) => {
          const isCurrent = stage.id === currentStageId;
          const isCompleted = stage.id < currentStageId;
          const isEnabled = stage.enabled;

          if (!isEnabled) {
            return (
              <div
                key={stage.id}
                className="flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground/50 cursor-not-allowed select-none"
                title="Coming Soon — Pro"
              >
                <Lock className="h-3 w-3 shrink-0" />
                <span>{stage.name}</span>
              </div>
            );
          }

          const pill = (
            <div
              key={stage.id}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                isCurrent
                  ? "bg-primary text-primary-foreground border border-primary"
                  : isCompleted
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "bg-muted/50 text-muted-foreground border border-border hover:bg-muted"
              }`}
            >
              <span
                className={`h-4 w-4 rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 ${
                  isCurrent
                    ? "bg-primary-foreground/20 text-primary-foreground"
                    : isCompleted
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {stage.id}
              </span>
              {stage.name}
            </div>
          );

          if (inventionId && (isCurrent || isCompleted)) {
            return (
              <Link key={stage.id} href={`/invention/${inventionId}`} className="no-underline">
                {pill}
              </Link>
            );
          }

          return <div key={stage.id}>{pill}</div>;
        })}
      </div>
    </div>
  );
}
