/**
 * Readiness badge — shows one of 3 states only.
 * Never shows numeric scores to the user.
 */

type ReadinessState = "Not Ready" | "Getting There" | "Ready to Move Forward";

interface ReadinessBadgeProps {
  state: ReadinessState;
  className?: string;
}

const stateStyles: Record<ReadinessState, string> = {
  "Not Ready": "bg-destructive/10 text-destructive border-destructive/20",
  "Getting There": "bg-amber-50 text-amber-700 border-amber-200",
  "Ready to Move Forward": "bg-accent text-accent-foreground border-accent-foreground/20",
};

export function ReadinessBadge({ state, className }: ReadinessBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${stateStyles[state]} ${className ?? ""}`}
    >
      {state}
    </span>
  );
}
