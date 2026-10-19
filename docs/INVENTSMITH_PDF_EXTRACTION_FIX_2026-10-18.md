# PDF evidence extraction repair — October 18, 2026

- Scope: PR #24 preview and isolated Convex `quick-fox-785` only. No production deployment or merge; `fiery-gazelle-628` untouched.
- Cause: Responses API `input_file.file_data` received bare base64 instead of a MIME-prefixed data URL, causing HTTP 400.
- Repair: send `data:<mime>;base64,<bytes>`; recognize PDF headers when mobile uploads lack a MIME type or extension.
- Verification: 55 regression tests pass, including real action-handler payload tests for PDF, extensionless PDF, unchanged image inputs, authorization, evidence impact, and integrity. Web TypeScript and Convex deployment type checks pass.
- Backend: deployed successfully to `quick-fox-785`. Existing stored evidence and provenance are preserved; extraction does not mark inventor uploads independently verified.
- Recovery: two existing failed `Data_All_260313` uploads were found for the same invention. Retried only the newest copy; preserved both originals. Live action returned `extracted: true`, mode `ai_file`. The older failed duplicate was not removed or reprocessed.
- Reference: https://developers.openai.com/api/docs/guides/file-inputs
