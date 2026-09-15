import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({ isAdmin: vi.fn() }));
vi.mock("../../convex/authHelpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../convex/authHelpers")>();
  return { ...actual, isAdmin: authMocks.isAdmin };
});

import { recordProfessionalReviewHandler } from "../../convex/professionalReviewMutation";

function makeState(overrides?: {
  reviewStatus?: string;
  notes?: string;
  staleReason?: string;
}) {
  const review = {
    _id: "review-1",
    inventionId: "inv-1",
    deliverableId: "cad-1",
    specialty: "engineering",
    status: overrides?.reviewStatus ?? "accepted",
    reviewerName: "Dana Engineer",
    reviewerReference: "PE-12345",
    notes: overrides?.notes,
  };
  const deliverable = {
    _id: "cad-1",
    inventionId: "inv-1",
    kind: "native_cad_step",
    version: 3,
    trustState: "ready_for_authorized_use",
    artifactMaturity: "engineering_reviewed",
    staleReason: overrides?.staleReason,
  };
  const patch = vi.fn(async () => undefined);
  const insert = vi.fn(async () => "event-1");
  const ctx = {
    db: {
      get: vi.fn(async (id: string) => id === "review-1" ? review : id === "cad-1" ? deliverable : null),
      query: vi.fn((table: string) => ({
        withIndex: (_index: string, apply: (q: any) => unknown) => {
          const q: any = { eq: vi.fn(() => q) };
          apply(q);
          return {
            collect: vi.fn(async () => table === "professionalReviews" ? [review] : table === "atlasDeliverables" ? [deliverable] : []),
          };
        },
      })),
      patch,
      insert,
    },
  } as any;
  return { ctx, patch, insert };
}

const acceptedArgs = {
  reviewId: "review-1" as any,
  reviewerName: "Dana Engineer",
  reviewerReference: "PE-12345",
  accepted: true,
};

describe("professional review / external authorization separation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    authMocks.isAdmin.mockResolvedValue(true);
  });

  it("keeps a current external-use authorization on an exact accepted-review replay", async () => {
    const state = makeState();
    await expect(recordProfessionalReviewHandler(state.ctx, acceptedArgs)).resolves.toMatchObject({
      trustState: "ready_for_authorized_use",
      artifactMaturity: "engineering_reviewed",
      isCurrentRevision: true,
      idempotent: true,
    });
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
  });

  it("revokes external-use authorization when the professional review changes to changes requested", async () => {
    const state = makeState();
    await expect(recordProfessionalReviewHandler(state.ctx, {
      ...acceptedArgs,
      accepted: false,
      notes: "Rework the load-bearing interface before relying on this revision.",
    })).resolves.toMatchObject({
      trustState: "professional_review_required",
      artifactMaturity: "preliminary_cad",
      idempotent: false,
    });
    expect(state.patch).toHaveBeenCalledWith("cad-1", expect.objectContaining({
      trustState: "professional_review_required",
      artifactMaturity: "preliminary_cad",
    }));
  });

  it("does not preserve authorization for a stale artifact even when review input is replayed", async () => {
    const state = makeState({ staleReason: "Supporting evidence changed." });
    await expect(recordProfessionalReviewHandler(state.ctx, acceptedArgs)).resolves.toMatchObject({
      trustState: "professionally_reviewed",
      artifactMaturity: "preliminary_cad",
      idempotent: false,
    });
    expect(state.patch).toHaveBeenCalledWith("cad-1", expect.objectContaining({
      trustState: "professionally_reviewed",
      artifactMaturity: "preliminary_cad",
    }));
  });
});
