import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const roots = ["src", "convex"];
const changed = [];
const auditTest = "src/__tests__/inventsmith-brand.regression.test.ts";

function walk(path) {
  const absolute = join(root, path);
  for (const entry of readdirSync(absolute)) {
    const child = join(absolute, entry);
    const stat = statSync(child);
    if (stat.isDirectory()) {
      if (entry === "_generated" || entry === "node_modules") continue;
      walk(relative(root, child));
      continue;
    }
    if (!/\.(ts|tsx)$/.test(entry)) continue;
    const relativePath = relative(root, child).replaceAll("\\", "/");
    if (relativePath === auditTest) continue;

    const before = readFileSync(child, "utf8");
    let after = before.replace(/\bAtlas\b/g, "InventSmith");

    // This is a deployed webhook protocol name, not customer-facing branding.
    // It must remain stable until MadeThis and the receiver are migrated together.
    after = after.replaceAll(
      "X-InventSmith-Subscription-Signature",
      "X-Atlas-Subscription-Signature"
    );

    if (after !== before) {
      writeFileSync(child, after, "utf8");
      changed.push(relativePath);
    }
  }
}

for (const path of roots) walk(path);

console.log(`InventSmith sweep updated ${changed.length} file(s).`);
for (const file of changed) console.log(`- ${file}`);
