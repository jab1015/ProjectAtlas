import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("deployment health contract", () => {
  const httpSource = readFileSync(join(process.cwd(), "convex", "http.ts"), "utf8");
  const envExample = readFileSync(join(process.cwd(), ".env.example"), "utf8");

  it("checks the same Convex Auth key material documented by InventSmith", () => {
    expect(envExample).toContain("JWT_PRIVATE_KEY=");
    expect(envExample).toContain("JWKS=");
    expect(httpSource).toContain("process.env.JWT_PRIVATE_KEY && process.env.JWKS");
    expect(httpSource).not.toContain("process.env.AUTH_SECRET");
  });

  it("keeps health output secret-safe", () => {
    expect(httpSource).toContain('path: "/api/health"');
    expect(httpSource).toContain('"Cache-Control": "no-store"');
    expect(httpSource).toContain("Boolean(process.env.OPENAI_API_KEY)");
    expect(httpSource).not.toContain("OPENAI_API_KEY,");
    expect(httpSource).not.toContain("JWT_PRIVATE_KEY,");
  });
});
