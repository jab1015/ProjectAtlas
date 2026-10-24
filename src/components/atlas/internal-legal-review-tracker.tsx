import { CheckCircle2, Circle, Clock3, LoaderCircle } from "lucide-react";

type InternalLegalReviewState = "waiting" | "running" | "accepted" | "redesign";

interface InternalLegalReviewTrackerProps {
  state?: InternalLegalReviewState;
  compact?: boolean;
}

const STEPS = [
  { label: "Packet prepared", detail: "Prior-art comparison and design-around questions saved." },
  { label: "Internal Legal analysis", detail: "The Legal department compares the packet against the recorded prior-art evidence." },
  { label: "Disposition recorded", detail: "Legal records an accepted handoff or sends the design back for redesign." },
  { label: "Product Design released", detail: "Design work starts only after an accepted Legal disposition." },
];

export function InternalLegalReviewTracker({ state = "waiting", compact = false }: InternalLegalReviewTrackerProps) {
  const activeStep = state === "accepted" ? 3 : state === "redesign" ? 2 : state === "running" ? 1 : 1;
  const status = state === "accepted"
    ? "Accepted — Product Design released"
    : state === "redesign"
      ? "Changes requested — automated redesign queued"
      : state === "running"
        ? "In progress — Internal Legal is analyzing the packet"
        : "Waiting for Internal Legal disposition";

  return (
    <section className={`rounded-xl border border-primary/25 bg-primary/5 ${compact ? "p-4" : "p-5"}`} aria-label="Internal Legal review status">
      <div className="flex items-start gap-3">
        {state === "accepted" ? <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" /> : state === "running" ? <LoaderCircle className="mt-0.5 h-5 w-5 shrink-0 animate-spin text-primary" aria-hidden="true" /> : <Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">Internal Legal review tracker</p>
            <span className="rounded-full bg-background/70 px-2.5 py-1 text-xs font-medium text-foreground">{status}</span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-4">
            {STEPS.map((step, index) => {
              const complete = index < activeStep || (state === "accepted" && index === activeStep);
              const current = index === activeStep && state !== "accepted";
              return <div key={step.label} className="flex items-start gap-2 text-xs">
                {complete ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" aria-hidden="true" /> : current ? <LoaderCircle className="mt-0.5 h-4 w-4 shrink-0 animate-spin text-primary" aria-hidden="true" /> : <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/60" aria-hidden="true" />}
                <div><p className={`font-medium ${current ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>{!compact && <p className="mt-0.5 leading-relaxed text-muted-foreground">{step.detail}</p>}</div>
              </div>;
            })}
          </div>
          <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
            <p><span className="font-semibold text-foreground">Expected timing:</span> usually minutes to a few hours after the worker claims it; redesign requests add another automated cycle.</p>
            <p><span className="font-semibold text-foreground">Next update:</span> when Legal claims, completes, returns, or records the audit result. No inventor action is required.</p>
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">This is an operational routing review. It does not by itself represent a patentability, freedom-to-operate, or legal-clearance opinion.</p>
        </div>
      </div>
    </section>
  );
}
