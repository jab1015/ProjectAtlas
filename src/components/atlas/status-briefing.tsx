import Link from "next/link";
import { ArrowRight, CheckCircle2, CircleDot, Compass, Lightbulb, MessageCircle } from "lucide-react";
import type { StatusBriefing as StatusBriefingData } from "@convex/statusBriefingLogic";
import { Button } from "@/components/ui/button";

interface StatusBriefingProps {
  briefing: StatusBriefingData;
  inventionId: string;
}

function EmptyLine({ children }: { children: React.ReactNode }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>;
}

export function StatusBriefing({ briefing, inventionId }: StatusBriefingProps) {
  const primaryNeed = briefing.needsInventor[0];

  return (
    <section aria-labelledby="atlas-briefing-title" className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-medium text-primary">
        <Compass className="h-4 w-4" aria-hidden="true" />
        <h2 id="atlas-briefing-title" className="text-sm text-primary">Your Atlas briefing</h2>
        <Button asChild variant="ghost" size="sm" className="ml-auto gap-2">
          <Link href={`/invention/${inventionId}/chat`}>
            <MessageCircle className="h-4 w-4" aria-hidden="true" />
            Ask Atlas
          </Link>
        </Button>
      </div>

      {primaryNeed ? (
        <div className="rounded-2xl border border-primary/25 bg-accent/65 p-6 sm:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Your input is needed</p>
              <h3 className="text-xl font-semibold text-foreground">{primaryNeed.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{primaryNeed.detail}</p>
              {briefing.needsInventor.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  {briefing.needsInventor.length - 1} more item{briefing.needsInventor.length === 2 ? "" : "s"} will follow.
                </p>
              )}
            </div>
            <Button asChild className="shrink-0 gap-2">
              <Link href={`/invention/${inventionId}/review`}>
                Review and decide
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-success/25 bg-success/5 p-6">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-success" aria-hidden="true" />
            <div>
              <h3 className="text-base font-semibold">Atlas has what it needs for now</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Work will continue in the order shown below. Atlas will ask when your judgment or authorization is required.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CircleDot className="h-4 w-4 text-primary" aria-hidden="true" />
            <h3 className="text-base font-semibold">What Atlas is doing next</h3>
          </div>
          {briefing.next.length > 0 ? (
            <ul className="space-y-3">
              {briefing.next.map((item) => (
                <li key={`${item.status}-${item.title}`} className="flex items-start gap-3 text-sm">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${item.status === "running" ? "bg-primary" : item.status === "locked" ? "bg-warning" : "bg-muted-foreground/45"}`} aria-hidden="true" />
                  <div>
                    <p className="font-medium text-foreground">{item.title}</p>
                    <p className="text-xs capitalize text-muted-foreground">{item.status === "locked" ? `${item.requiredTier ?? "Paid"} plan required` : item.status}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyLine>No autonomous work is queued yet.</EmptyLine>
          )}
          {briefing.next.some((item) => item.status === "locked") && (
            <Link href="/pricing" className="mt-4 inline-flex text-sm font-medium">Compare plans</Link>
          )}
        </article>

        <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-success" aria-hidden="true" />
            <h3 className="text-base font-semibold">Recently completed</h3>
          </div>
          {briefing.completed.length > 0 ? (
            <ul className="space-y-3">
              {briefing.completed.map((item) => (
                <li key={`${item.completedAt}-${item.title}`} className="text-sm">
                  <p className="font-medium text-foreground">{item.title}</p>
                  {item.summary && <p className="mt-0.5 leading-relaxed text-muted-foreground">{item.summary}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <EmptyLine>Completed work will appear here as Atlas begins.</EmptyLine>
          )}
          <Link href={`/invention/${inventionId}/work`} className="mt-4 inline-flex text-sm font-medium">
            View all work
          </Link>
        </article>
      </div>

      <article className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-warning" aria-hidden="true" />
          <h3 className="text-base font-semibold">New discoveries</h3>
        </div>
        {briefing.discoveries.length > 0 ? (
          <ul className="grid gap-3 sm:grid-cols-2">
            {briefing.discoveries.map((finding) => (
              <li key={finding.statement} className="rounded-lg bg-muted/60 px-4 py-3 text-sm leading-relaxed text-foreground">
                {finding.statement}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyLine>Evidence-checked findings will appear here—not guesses or unfinished research.</EmptyLine>
        )}
      </article>
    </section>
  );
}
