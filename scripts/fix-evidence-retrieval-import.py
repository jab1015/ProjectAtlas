from pathlib import Path

path = Path("convex/atlasWorkState.ts")
text = path.read_text()
old = 'import { canPromoteDeliverable, EVIDENCE_FRESHNESS_STALE_REASON, isSourceEligibleForPromotion, normalizeFinding, reliabilityFromVerificationStatus } from "./evidenceIntegrityLogic";'
new = 'import { canPromoteDeliverable, EVIDENCE_FRESHNESS_STALE_REASON, isSourceEligibleForPromotion, normalizeFinding, reliabilityFromVerificationStatus, sanitizeSourceUrls } from "./evidenceIntegrityLogic";'
if old not in text:
    raise SystemExit("atlasWorkState evidence-integrity import anchor not found")
path.write_text(text.replace(old, new, 1))
