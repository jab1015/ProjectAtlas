from pathlib import Path

path = Path("convex/inventionWorkspace.ts")
text = path.read_text()

old_import = 'import { deriveTrustStateFromProfessionalReviews } from "./professionalReviewLogic";'
new_import = 'import { deriveTrustStateFromProfessionalReviews, validateProfessionalReviewRecord } from "./professionalReviewLogic";'
if text.count(old_import) != 1:
    raise SystemExit(f"expected one professionalReviewLogic import, found {text.count(old_import)}")
text = text.replace(old_import, new_import, 1)

old_block = '''    const review = await ctx.db.get(args.reviewId);\n    if (!review) throw new ConvexError("Professional review not found");\n    const reviewerName = args.reviewerName.trim();\n    if (reviewerName.length < 2) throw new ConvexError("Reviewer name is required");\n\n    const now = Date.now();\n    const status = args.accepted ? "accepted" as const : "changes_requested" as const;\n    await ctx.db.patch(review._id, {\n      status,\n      reviewerName,\n      reviewerReference: args.reviewerReference?.trim() || undefined,\n      notes: args.notes?.trim() || undefined,'''
new_block = '''    const review = await ctx.db.get(args.reviewId);\n    if (!review) throw new ConvexError("Professional review not found");\n    const validatedReview = validateProfessionalReviewRecord(args);\n    if (!validatedReview.valid) throw new ConvexError(validatedReview.error);\n\n    const now = Date.now();\n    const status = args.accepted ? "accepted" as const : "changes_requested" as const;\n    await ctx.db.patch(review._id, {\n      status,\n      reviewerName: validatedReview.reviewerName,\n      reviewerReference: validatedReview.reviewerReference,\n      notes: validatedReview.notes,'''
if text.count(old_block) != 1:
    raise SystemExit(f"expected one professional review mutation block, found {text.count(old_block)}")
text = text.replace(old_block, new_block, 1)

path.write_text(text)
print("patched inventionWorkspace.ts to enforce auditable professional review records")
