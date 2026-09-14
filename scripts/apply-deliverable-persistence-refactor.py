from pathlib import Path

path = Path("convex/atlasWorkState.ts")
text = path.read_text()

old_import = 'import { requiredProfessionalReviews } from "./professionalReviewPolicy";'
new_import = 'import { buildDeliverablePersistencePlan } from "./deliverablePersistenceLogic";'
if text.count(old_import) != 1:
    raise SystemExit(f"expected one professionalReviewPolicy import, found {text.count(old_import)}")
text = text.replace(old_import, new_import, 1)

old_block = '''    const deliverableKind = workItem.deliverableKind ?? workItem.kind;\n    const requiredReviews = requiredProfessionalReviews(deliverableKind);\n    const priorVersions = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId_kind", (q) => q.eq("inventionId", workItem.inventionId).eq("kind", deliverableKind)).collect();\n    const version = priorVersions.reduce((highest, deliverable) => Math.max(highest, deliverable.version), 0) + 1;'''
new_block = '''    const deliverableKind = workItem.deliverableKind ?? workItem.kind;\n    const priorVersions = await ctx.db.query("atlasDeliverables").withIndex("by_inventionId_kind", (q) => q.eq("inventionId", workItem.inventionId).eq("kind", deliverableKind)).collect();\n    const { requiredReviews, trustState, version } = buildDeliverablePersistencePlan(deliverableKind, priorVersions);'''
if text.count(old_block) != 1:
    raise SystemExit(f"expected one deliverable persistence block, found {text.count(old_block)}")
text = text.replace(old_block, new_block, 1)

old_trust = '      trustState: requiredReviews.length ? "professional_review_required" : "atlas_draft",'
new_trust = '      trustState,'
if text.count(old_trust) != 1:
    raise SystemExit(f"expected one generated trust-state expression, found {text.count(old_trust)}")
text = text.replace(old_trust, new_trust, 1)

path.write_text(text)
print("patched atlasWorkState.ts to use buildDeliverablePersistencePlan")
