import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ user: vi.fn(), admin: vi.fn() }));
vi.mock("@convex-dev/auth/server", () => ({ getAuthUserId: auth.user }));
vi.mock("../../convex/authHelpers", () => ({ requireAdmin: auth.admin }));
import { replyToCaseHandler, updateByAdmin, listMine } from "../../convex/supportCases";

const caseId = "case-1" as any;
function context(overrides = {}) {
  const row = { _id: caseId, userId: "reporter", status: "waiting_on_user", adminNotes: "private", ...overrides };
  const patch = vi.fn(async () => undefined);
  const ctx = { db: { get: vi.fn(async () => row), patch, query: vi.fn(() => ({ withIndex: vi.fn(() => ({ order: vi.fn(() => ({ take: vi.fn(async () => [row]) })) })) })) } } as any;
  return { ctx, patch };
}

describe("Support replies", () => {
  beforeEach(() => { vi.clearAllMocks(); auth.user.mockResolvedValue("reporter"); auth.admin.mockResolvedValue({}); });

  it("accepts the reporter's reply and returns the case to investigation", async () => {
    const { ctx, patch } = context({ customerReplies: [{ message: "Earlier reply", createdAt: 1 }] });
    await replyToCaseHandler(ctx, { caseId, message: "  Here is the requested information.  " });
    expect(patch).toHaveBeenCalledWith(caseId, expect.objectContaining({ status: "investigating", customerReplies: [
      { message: "Earlier reply", createdAt: 1 }, { message: "Here is the requested information.", createdAt: expect.any(Number) },
    ] }));
  });

  it("rejects another user's case before any write", async () => {
    auth.user.mockResolvedValue("another-user");
    const { ctx, patch } = context();
    await expect(replyToCaseHandler(ctx, { caseId, message: "Not my case" })).rejects.toThrow("Support case not found");
    expect(patch).not.toHaveBeenCalled();
  });

  it("requires the case to be waiting for a reply", async () => {
    const { ctx, patch } = context({ status: "resolved" });
    await expect(replyToCaseHandler(ctx, { caseId, message: "Hello" })).rejects.toThrow("not waiting for a reply");
    expect(patch).not.toHaveBeenCalled();
  });

  it.each(["waiting_on_user", "resolved"])("requires an inventor message for %s", async status => {
    const { ctx, patch } = context({ status: "open" });
    await expect((updateByAdmin as any)._handler(ctx, { caseId, status, adminNotes: "Private notes alone are insufficient." })).rejects.toThrow("Add a message");
    expect(patch).not.toHaveBeenCalled();
  });

  it("returns public messages and replies without private notes", async () => {
    const { ctx } = context({ publicMessage: "Please describe the last step.", customerReplies: [] });
    const rows = await (listMine as any)._handler(ctx, {});
    expect(rows[0].publicMessage).toBe("Please describe the last step.");
    expect(rows[0]).not.toHaveProperty("adminNotes");
  });
});
