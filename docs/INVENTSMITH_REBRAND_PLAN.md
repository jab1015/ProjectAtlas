# InventSmith Rebrand Plan

Status: approved product rename
Previous customer-facing name: Atlas
New customer-facing name: InventSmith
Descriptor: The Inventor OS
Publisher: Modern Methods

## Required customer-facing changes
1. Application metadata, browser titles, descriptions, Open Graph and other public metadata.
2. Navigation, headers, authentication screens, onboarding, dashboard, settings, billing, privacy, admin and operational surfaces.
3. Ask Atlas becomes Ask InventSmith wherever shown to users.
4. Customer-facing AI/system prompts must identify the product as InventSmith.
5. Generated PDF/DOCX package titles, cover pages, footers and product attribution.
6. Emails, subscription copy, privacy/export copy and user-visible error/help text.
7. README and active product/deployment documentation.
8. Representative-pilot and acceptance language where the old product name is user-visible.

## Preserve unless there is a compelling migration reason
- Repository name and Git history.
- Existing Convex table/function identifiers.
- Existing environment-variable names.
- Existing database IDs and stored records.
- Existing Vercel/Convex project identifiers and deployment bindings.
- Historical release records where changing the text would falsify history.

## Safety rule
Do not perform a blind global Atlas-to-InventSmith replacement. Review each occurrence. Rename customer-facing identity; preserve internal identifiers when changing them could break deployed infrastructure or data compatibility.

## Acceptance criteria
- No customer-facing page identifies the current product as Atlas.
- Ask InventSmith is used consistently.
- InventSmith — The Inventor OS is used in primary branding.
- Modern Methods remains the publisher/company identity.
- Existing managed data/infrastructure remains intact.
- TypeScript, regression tests, production dependency audit and production build pass after the rename.
