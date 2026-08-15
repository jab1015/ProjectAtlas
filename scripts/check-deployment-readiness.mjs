import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const envPath = path.join(root, ".env.local");
const gitignorePath = path.join(root, ".gitignore");

function readEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs.readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
      })
  );
}

const local = { ...readEnv(envPath), ...process.env };
const blockers = [];
const warnings = [];
const passes = [];

function requirePresent(name, description) {
  if (local[name]) passes.push(`${name}: configured (${description})`);
  else blockers.push(`${name}: missing (${description})`);
}

requirePresent("NEXT_PUBLIC_CONVEX_URL", "browser backend endpoint");
requirePresent("CONVEX_DEPLOYMENT", "target backend deployment");

if (local.NEXT_PUBLIC_CONVEX_URL && !/^https:\/\/[a-z0-9-]+\.convex\.cloud\/?$/i.test(local.NEXT_PUBLIC_CONVEX_URL)) {
  blockers.push("NEXT_PUBLIC_CONVEX_URL: must be a real HTTPS convex.cloud deployment URL");
}

if (local.OPENAI_API_KEY) passes.push("OPENAI_API_KEY: present locally; value intentionally hidden");
else warnings.push("OPENAI_API_KEY: not present locally; live AI smoke tests cannot run");

const gitignore = fs.existsSync(gitignorePath) ? fs.readFileSync(gitignorePath, "utf8") : "";
if (/(^|\n)\.env\.local(\r?\n|$)/.test(gitignore) || /\.env\*/.test(gitignore)) {
  passes.push("Secret hygiene: .env.local is ignored");
} else {
  blockers.push("Secret hygiene: .env.local is not explicitly ignored");
}

warnings.push("Cloud check required: confirm OPENAI_API_KEY exists in the Convex deployment environment");
warnings.push("Cloud check required: confirm CONVEX_SITE_URL and Convex Auth keys are provisioned");
warnings.push("Cloud check required: confirm PLATFORM_FULFILLMENT_SECRET and ATLAS_SUBSCRIPTION_WEBHOOK_SECRET are provisioned and rotated independently");
warnings.push("Operations check required: configure error monitoring, backup/export ownership, and a rollback owner");

console.log("Atlas deployment readiness (secret values are never printed)\n");
for (const item of passes) console.log(`PASS  ${item}`);
for (const item of warnings) console.log(`WARN  ${item}`);
for (const item of blockers) console.log(`BLOCK ${item}`);
console.log(`\nResult: ${blockers.length === 0 ? "LOCAL CONFIG READY" : `${blockers.length} BLOCKER(S)`}; ${warnings.length} manual check(s)`);
process.exitCode = blockers.length === 0 ? 0 : 1;
