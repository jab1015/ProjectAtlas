"use client";

import Link from "next/link";
import { Activity, ArrowRight, CheckCircle2, CircleDot, Clock3, MessageCircle } from "lucide-react";
import type { StatusBriefing } from "@convex/statusBriefingLogic";
import { Button } from "@/components/ui/button";

interface InventorActivityStripProps {
  inventionId: string;
  inventionTitle: string;
  inventorName?: string | null;
  briefing?: StatusBriefing | null;
}

function getActivity(briefing?: StatusBriefing | null) {
  if (briefing?.needsInventor.length) {
    return {
      label: "Waiting for you",
      detail: briefing.needsInventor[0].title,
      tone: "border-warning/30 bg-warning/5 text-warning",
      Icon: Clock3,
    };
  }
  const running = briefing?.next.find((item) => item.status === "running");
  if (running) {
    return {
      label: "Working now",
      detail: running.title,
      tone: "border-primary/30 bg-primary/5 text-primary",
      Icon: Activity,
    };
  }
  const queued = briefing?.next.find((item) => item.status === "queued");
  if (queued) {
    return {
      label: "Queued next",
      detail: queued.title,
      tone: "border-primary/20 bg-primary/5 text-primary",
      Icon: CircleDot,
    };
  }
  return {
    label: "No work currently queued",
    detail: "InventSmith will show the next action when new work is ready.",
    tone: "border-success/25 bg-success/5 text-success",
    Icon: CheckCircle2,
  };
}

export function InventorActivityStrip({ inventionId, inventionTitle, inventorName, briefing }: InventorActivityStripProps) {
  const activity = getActivity(briefing);
  const ActivityIcon = activity.Icon;
  const firstName = (inventorName ?? "Inventor").trim().split(/\s+/)[0] || "Inventor";

  return (
    <section className={`border-b ${activity.tone}`} aria-label="InventSmith activity status">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-start gap-3">
          <ActivityIcon className={`mt-0.5 h-4 w-4 shrink-0 ${activity.label === "Working now" ? "animate-pulse" : ""}`} aria-hidden="true" />
          <div className="min-w-0 text-sm">
            <p className="font-semibold text-foreground">Hello, {firstName}. Here’s what’s happening with {inventionTitle}.</p>
            <p className="truncate text-xs text-muted-foreground"><span className="font-medium text-foreground">{activity.label}:</span> {activity.detail}</p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button asChild variant="ghost" size="sm" className="h-8 gap-1.5">
            <Link href={`/invention/${inventionId}/chat`}><MessageCircle className="h-3.5 w-3.5" />Ask AI</Link>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-8 gap-1.5">
            <Link href={`/invention/${inventionId}/journey`}>See next step<ArrowRight className="h-3.5 w-3.5" /></Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
