import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
    expect(existsSync(join(ROOT, "public/Logo.png"))).toBe(true);
  });

  it("does not keep legacy Atlas logo or favicon assets that a deployment could accidentally reuse", () => {
    expect(existsSync(join(ROOT, "public/logo.svg"))).toBe(false);
    expect(existsSync(join(ROOT, "public/logo-mark.svg"))).toBe(false);
    expect(existsSync(join(ROOT, "src/app/icon.svg"))).toBe(false);
    const layout = readFileSync(join(ROOT, "src/app/layout.tsx"), "utf8");
    expect(layout).toContain('{ icon: "/Logo.png", shortcut: "/Logo.png", apple: "/Logo.png" }');
  });

  it("does not expose Atlas as the current customer-facing product name", () => {
    const violations: string[] = [];
    for (const root of SCAN_ROOTS) {
      for (const file of collectSourceFiles(root)) {
        const lines = readFileSync(file, "utf8").split(/\r?\n/);
        lines.forEach((line, index) => {
          if (!/(["'`])[^"'`]*\bAtlas\b[^"'`]*\1/.test(line)) return;
          if (/\/checkout\/atlas\//.test(line)) return; // Managed MadeThis checkout binding.
          if (/X-Atlas-Subscription-Signature/.test(line)) return; // Deployed webhook protocol header.
          violations.push(`${relative(ROOT, file)}:${index + 1}: ${line.trim()}`);
        });
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });
});
