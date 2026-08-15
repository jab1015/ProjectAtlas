import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("production build reproducibility", () => {
  it("does not require Google Fonts during Next.js compilation", () => {
    const layout = readFileSync(join(process.cwd(), "src", "app", "layout.tsx"), "utf8");
    expect(layout).not.toContain('next/font/google');
    expect(layout).not.toContain("Space_Grotesk(");
    expect(layout).not.toContain("IBM_Plex_Sans(");
  });
});
