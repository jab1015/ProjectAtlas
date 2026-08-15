import { describe, expect, it } from "vitest";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_ROOTS = ["src/app", "src/components", "src/lib", "convex"];

function collectSourceFiles(path: string): string[] {
  const absolute = join(ROOT, path);
  const output: string[] = [];
  for (const entry of readdirSync(absolute)) {
    const child = join(absolute, entry);
    const stat = statSync(child);
    if (stat.isDirectory()) {
      if (entry === "__tests__" || entry === "_generated") continue;
      output.push(...collectSourceFiles(relative(ROOT, child)));
      continue;
    }
    if (/\.(ts|tsx)$/.test(entry)) output.push(child);
  }
  return output;
}

describe("InventSmith customer-facing brand", () => {
  it("uses the approved InventSmith logo and product metadata", () => {
    const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
    const logo = readFileSync(join(ROOT, "src/components/atlas/atlas-logo.tsx"), "utf8");
    expect(layout).toContain("InventSmith — The Inventor OS");
    expect(layout).toContain("/Logo.png");
    expect(logo).toContain("/Logo.png");
    expect(logo).toContain("InventSmith — The Inventor OS");
  });

  it("does not expose Atlas as the current customer-facing product name", () => {
    const violations: string[] = [];
    for (const root of SCAN_ROOTS) {
      for (const file of collectSourceFiles(root)) {
        const lines = readFileSync(file, "utf8").split(/\r?\n/);
        lines.forEach((line, index) => {
          // Internal compatibility identifiers remain intentionally named Atlas/atlas.
          // We care about quoted customer-facing strings, JSX attributes, and messages.
          if (!/(["'`])[^"'`]*\bAtlas\b[^"'`]*\1/.test(line)) return;
          if (/\/checkout\/atlas\//.test(line)) return; // Managed MadeThis binding.
          violations.push(`${relative(ROOT, file)}:${index + 1}: ${line.trim()}`);
        });
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });
});
