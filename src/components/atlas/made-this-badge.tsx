/**
 * Legacy component name retained to avoid a risky broad import rename.
 * Customer-facing provenance belongs to Modern Methods, not the former hosting
 * provider.
 */
export function MadeThisBadge() {
  return (
    <div className="text-center py-3 pb-2 opacity-50 text-xs">
      <span className="text-current inline-flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2L2 7l10 5 10-5-10-5z" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
        Modern Methods
      </span>
    </div>
  );
}
