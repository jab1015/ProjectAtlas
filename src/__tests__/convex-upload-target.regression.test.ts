import { afterEach, describe, expect, it, vi } from "vitest";
import { isAllowedConvexUploadTarget } from "@/lib/convexUploadTarget";

afterEach(() => vi.unstubAllEnvs());

describe("Convex upload target validation", () => {
  it("allows the configured local deployment origin", () => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "http://127.0.0.1:3210");

    expect(isAllowedConvexUploadTarget(new URL("http://127.0.0.1:3210/api/upload"))).toBe(true);
  });

  it("does not allow an unconfigured origin that resembles Convex", () => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "http://127.0.0.1:3210");

    expect(isAllowedConvexUploadTarget(new URL("https://attacker.convex.cloud/upload"))).toBe(false);
  });

  it("keeps the production deployment available when explicitly configured or using defaults", () => {
    vi.stubEnv("NEXT_PUBLIC_CONVEX_URL", "");

    expect(isAllowedConvexUploadTarget(new URL("https://agile-seahorse-379.convex.cloud/upload"))).toBe(true);
    expect(isAllowedConvexUploadTarget(new URL("https://agile-seahorse-379.convex.site/upload"))).toBe(true);
  });
});
