# InventSmith Scoped Evidence Invalidation Checkpoint

**Date:** September 14, 2026  
**Branch:** `inventsmith/full-product-build`  
**Status:** implemented; exact-head CI required before this checkpoint is called verified

## Change

Known real-world evidence classes now invalidate the work that actually depends on them instead of forcing a broad rerun of unrelated completed work.

- **Prototype test evidence** refreshes the physical prototype-evidence gate and its downstream prototype/manufacturing-readiness chain.
- **Manufacturer quote/RFQ evidence** refreshes the quote-evidence gate, production unit economics, quote comparison, agreement/readiness work, and their downstream dependents without rerunning unrelated market work.
- **Actual sales/launch evidence** refreshes the launch evidence gate and its downstream performance/growth chain.
- Unknown/general evidence classes retain conservative broad invalidation because their downstream scope cannot safely be inferred from the evidence label alone.

Removing previously relied-on prototype, manufacturer-quote, or launch evidence now fails the corresponding real-world gate closed again instead of merely leaving a previously satisfied gate in a completed state.

For removals, direct source links are removed only where the removed source was actually referenced. Uploading new evidence no longer strips an existing source link merely because the same change event caused downstream work to become stale.

## Safety boundary

Running work is still protected by the existing invention `updatedAt` stale-input check: an evidence change advances the invention timestamp, so a provider result claimed before the change is discarded on completion and requeued rather than persisted as current output.

This checkpoint does not represent deployment, live functional verification, professional review, or manufacturing approval.
