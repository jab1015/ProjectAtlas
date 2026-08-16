# InventSmith Production Deployment and Acceptance Runbook

**Status:** Repository implementation green; live replication/acceptance pending  
**Product:** InventSmith — The Inventor OS by Modern Methods  
**Updated:** August 16, 2026  
**Legacy filename:** retained for compatibility with existing documentation links

## 1. Authority and release boundary

This runbook implements the deployment and live-acceptance boundary defined by:

1. `docs/INVENTSMITH_MASTER_PRODUCT_SPEC.md`
2. `docs/INVENTSMITH_CURRENT_PLAN_AND_PROGRESS.md`
3. `docs/ATLAS_BUILD_PROGRESS.md`
4. `docs/INVENTSMITH_DOCUMENT_AUTHORITY.md`

The retired Atlas controlled-pilot scope is historical and must not be used as the release definition. Repository-green is necessary but is not production acceptance.

## 2. Repository readiness before MadeThis handoff

Before pinning a GitHub head for MadeThis replication:

1. Confirm the intended head is on `inventsmith/full-product-build` and draft PR #24 remains unmerged unless the founder explicitly approves otherwise.
2. Run/verify the complete CI stack: operational-script verification; web TypeScript; Convex TypeScript; full regression suite; production dependency audit; Next production build.
3. Confirm authoritative InventSmith documentation reflects the implementation head.
4. Confirm no destructive schema migration, secret, generated credential or environment-specific value was committed.
5. Record the exact commit SHA supplied to MadeThis so replication can be compared deterministically.

Atlas CI #463 on `e533dd96f1768e4cff36a502ee9779f3b97c5cb4` is the latest fully verified classification/routing code checkpoint before the final business-only/documentation updates. The final handoff SHA must itself receive a complete green CI pass.

## 3. Runtime configuration

Use the actual deployment/provider configuration. Do not hand-invent identifiers or copy secrets into source control. Required runtime configuration includes the selected Convex deployment/site URL, authentication key material, OpenAI/provider credentials, fulfillment/subscription webhook secrets, and any production storage/search/image/CAD/software/provider credentials actually enabled by the replicated application.

Secrets belong in secure deployment environment configuration, never browser-exposed `NEXT_PUBLIC_*` variables unless intentionally public. Health/readiness checks may expose sanitized status only and must never expose secret values, tokens, user data or invention data.

## 4. Authentication and organization acceptance

Using disposable production-like accounts, verify:

- sign-up/sign-in/session persistence across refresh/navigation;
- legacy single-user invention migration into the correct personal organization without losing evidence/documents/work/billing/history;
- Owner/Admin/Member/Viewer/Professional-Guest server-side enforcement;
- Viewer cannot mutate state;
- Professional/Guest sees only explicitly granted invention/review access and no broad portfolio/billing;
- invention-level isolation;
- organization-owned inventions survive member departure;
- ownership transfer preserves organization/billing continuity;
- owner deletion cannot orphan a company/studio organization, including suspended-owner cases;
- active/archive capacity follows the plan and archiving preserves history.

## 5. Invitation acceptance

Verify pending invitations reserve seats, cannot overbook capacity, recheck projected capacity at acceptance, require recipient consent, release reservations on revocation/expiry, remain bound to the intended account across email changes/reuse, fail closed for legacy unbound invitations, cannot be bypassed through retired direct-add membership, and do not enable pre-signup email claiming until email ownership is actually verified.

## 6. Shared organization resource accounting

With at least two collaborators acting concurrently, verify Ask InventSmith and autonomous AI/research/generation allowances are organization-shared rather than multiplied per user; concurrent reservations cannot exceed capacity; retries/reclaimed leases do not double-charge; stale/discarded outputs settle correctly; Native CAD/visual generation use the same shared ledger; deletion releases reservations correctly; legacy inventions without `organizationId` continue on the legacy user ledger; and internal provider economics remain appropriately restricted.

## 7. Evidence Locker and Ask InventSmith acceptance

With an authorized Editor/Manager, upload representative CSV/XLSX, PDF/DOCX and image/reference evidence. Verify Edit authorization, server-side binary extraction/retry, uploader provenance, authorized failed-extraction retry, downstream evidence use/staleness propagation, grounded Ask InventSmith responses, material chat-to-evidence write-back, and Viewer/Guest boundaries.

## 8. Invention classification and journey-routing acceptance

Run classification before evaluating a complete journey.

### Physical representative case

Create a non-safety-critical physical product. Verify classification reports `physical`, the journey includes applicable Product Design/CAD/Engineering, physical Prototype and Manufacturing work, and software-only work is not unnecessarily required.

### Software representative case

Create a genuine software product such as an app/SaaS concept. Verify classification reports `software` and the middle journey becomes:

**Software Product Design → Software Prototype & Build → Software Engineering & Release Readiness**

Verify the queue includes software product specification, UX/user-flow design, architecture, data/API design, security/privacy readiness, prototype/build planning, implementation planning, QA/acceptance, beta readiness and distribution/release planning. Confirm pure software is **not** blocked waiting for native CAD, physical prototype evidence, manufacturer RFQs or manufacturer quote evidence.

Do not treat specifications/plans as proof code was implemented, tests passed, a beta ran or production/app-store deployment occurred; require real execution/deployment evidence for those claims.

### Hybrid representative case

Create a connected hardware/software product. Verify classification reports `hybrid`, both physical and software work branches are queued, and combined stages are not marked complete until their applicable requirements are satisfied.

### Regulated representative case

Use a harmless regulated example such as a medical/health, children's safety or privacy-sensitive software concept. Verify it remains supported while `professional_review_required` / applicable engineering, regulatory, security/privacy or legal review boundaries are visible and enforceable. The system must not blanket-reject legitimate regulated invention work merely because qualified review is needed.

### Unsupported scope

Verify harmful/abusive weapon/destructive, malware/credential theft/unauthorized cyberattack, covert surveillance/stalking, fraud/theft/deceptive abuse and dangerous chemical/biological/radiological weaponization concepts do not receive a normal organization invention workspace. This is a product-support/safety boundary and should not be presented as a blanket legal conclusion.

### Non-product business concept

Verify an ordinary service-business idea with no new physical/software/hybrid product is routed outside the invention-development workflow rather than being forced through CAD/patent/prototype/software stages.

## 9. Complete idea-to-market representative journey

Run representative physical, software and hybrid inventions through the complete **applicable** journey as evidence permits. InventSmith must own sequencing/dependencies without requiring the inventor to manually manage departments.

For physical/hybrid cases review validation/research, Product Design Specification, CAD/drawings/renders, engineering handoff, prototype plan, RFQ/manufacturing package and downstream commercial artifacts. For software/hybrid cases review product specification, UX flows, architecture, data/API design, security/privacy readiness, implementation/test/beta/release plans and downstream commercial artifacts. Across all product types review branding, legal/professional drafts, pricing/GTM/sales/funding, editable pitch deck, financial workbook, launch plan and growth reporting.

## 10. Genuine evidence gates

These gates must use real evidence; fixtures, forecasts or AI-generated claims cannot satisfy them merely to mark acceptance complete.

### Physical prototype
InventSmith may prepare prototype/test plans, but prototype assessment requires genuine physical prototype-test evidence.

### Manufacturing
InventSmith may prepare sourcing/RFQ work, but quote comparison and quote-based unit economics require genuine manufacturer/RFQ evidence.

### Software implementation / testing / release
InventSmith may prepare architecture, implementation, QA, beta and release plans, but it must not claim source was implemented, tests passed, a beta succeeded, an app-store submission occurred or production deployment succeeded without corresponding real execution/deployment evidence.

### Launch and growth
Modeled forecasts do not satisfy launch-performance analysis; genuine post-launch sales/analytics/market evidence is required.

### Professional review
Routing/preparation is not completed professional review. Qualified professional outcomes must be recorded before gated conclusions are treated as approved.

## 11. Artifact quality acceptance

Human-review representative outputs rather than checking file existence alone. For physical/hybrid products verify native CAD/editable geometry, STEP/STL/DXF usability, dimensions/exploded views and product renders. For software/hybrid products verify specifications, architecture/data/API artifacts, UX flows, security/privacy readiness and implementation/test/release plans are coherent and traceable to evidence. Across all types verify brand boards, editable PPTX, financial spreadsheet/CSV and PDF/DOCX outputs are usable and carry appropriate limitations.

Generated CAD remains preliminary until engineering/prototype evidence supports production release. Software planning remains planning until real implementation/test/deployment evidence exists.

## 12. Billing and entitlement acceptance

After external billing is configured, verify organization `planKey` authority, signed/idempotent/out-of-order-safe provider events, ownership-transfer continuity, cancellation/past-due behavior, Studio organization-only plans, active-invention/seat limits, organization-shared compute, public/account pricing alignment, and Pro/Enterprise entitlement for the appropriate software work kinds.

Do not finalize compute/storage/premium-generation allowances from guesses; lock them after representative provider/runtime economics support sustainable policy.

## 13. Privacy, deletion and restoration acceptance

Using disposable accounts/organizations, verify personal export boundaries, authorized organization exports, member departure preservation, invitation cleanup, company/studio owner deletion safety, personal-organization deletion lifecycle, external billing resolution before destructive deletion where required, deleted-identity sign-in prevention and retained-record anonymization that cannot transfer identity through mutable/reused email.

## 14. Operational readiness

Before release, assign owners for health/uptime alerts, provider/Convex spend alerts, backups/restoration, incident response/key rotation, privacy/deletion requests, prompt/model/provider changes, rollback/deployment access and billing/webhook incidents.

## 15. Release rule

InventSmith must never be described as providing patentability/FTO/legal/regulatory opinions, production engineering approval, software security certification or proof of unperformed software implementation/testing/deployment. Consequential external actions remain behind appropriate gates.

A GitHub head is **ready to hand to MadeThis** when repository CI is fully green, authoritative docs match the implementation, no known repository-only blocker remains, and the exact commit SHA can be supplied for deterministic replication.

MadeThis replication is **not final product acceptance**. Final production acceptance occurs only after the replicated runtime passes live authentication, organization, classification/routing, resource-accounting, evidence, billing, privacy, applicable complete-journey, artifact-quality and genuine physical/software/professional/market gates above.