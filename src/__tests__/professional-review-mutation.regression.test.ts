import { beforeEach, describe, expect, it, vi } from "vitest";

const authMocks = vi.hoisted(() => ({ isAdmin: vi.fn() }));

vi.mock("../../convex/authHelpers", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../convex/authHelpers")>();
  return { ...actual, isAdmin: authMocks.isAdmin };
});

import { recordProfessionalReviewHandler } from "../../convex/professionalReviewMutation";

type ReviewRow = {
  _id: string;
  inventionId: string;
  deliverableId: string;
  specialty: string;
  status: string;
  reviewerName?: string;
  reviewerReference?: string;
  notes?: string;
};

type DeliverableRow = {
  _id: string;
  inventionId: string;
  kind: string;
  version: number;
  trustState: string;
  artifactMaturity?: string;
  staleReason?: string;
};

const baseReview = (overrides: Partial<ReviewRow> = {}): ReviewRow => ({
  _id: "review-1",
  inventionId: "inv-1",
  deliverableId: "cad-1",
  specialty: "engineering",
  status: "required",
  ...overrides,
});

const baseCad = (overrides: Partial<DeliverableRow> = {}): DeliverableRow => ({
  _id: "cad-1",
  inventionId: "inv-1",
  kind: "native_cad_step",
  version: 1,
  trustState: "professional_review_required",
  artifactMaturity: "preliminary_cad",
  ...overrides,
});

function makeContext(args?: {
  review?: ReviewRow | null;
  deliverable?: DeliverableRow | null;
  siblingReviews?: ReviewRow[];
  cadRevisions?: DeliverableRow[];
}) {
  const review = args?.review === undefined ? baseReview() : args.review;
  const deliverable = args?.deliverable === undefined ? baseCad() : args.deliverable;
  const siblingReviews = args?.siblingReviews ?? (review ? [review] : []);
  const cadRevisions = args?.cadRevisions ?? (deliverable ? [deliverable] : []);
  const patch = vi.fn(async (_id: string, _value: unknown) => undefined);
  const insert = vi.fn(async (_table: string, _value: unknown) => "event-1");
  const indexEquals: Array<[string, string, unknown]> = [];
  const query = vi.fn((table: string) => ({
    withIndex: (_index: string, apply: (q: any) => unknown) => {
      const q: any = { eq: vi.fn((field: string, value: unknown) => { indexEquals.push([table, field, value]); return q; }) };
      apply(q);
      return {
        collect: vi.fn(async () => {
          if (table === "professionalReviews") return siblingReviews;
          if (table === "atlasDeliverables") return cadRevisions;
          throw new Error(`Unexpected query table ${table}`);
        }),
      };
    },
  }));
  const ctx = {
    db: {
      get: vi.fn(async (id: string) => {
        if (id === "review-1") return review;
        if (id === review?.deliverableId) return deliverable;
        return null;
      }),
      query,
      patch,
      insert,
    },
  } as any;
  return { ctx, patch, insert, query, indexEquals };
}

const acceptedArgs = (overrides: Record<string, unknown> = {}) => ({
  reviewId: "review-1" as any,
  reviewerName: "Dana Engineer",
  reviewerReference: "PE-12345",
  accepted: true,
  ...overrides,
});

describe("recordProfessionalReview mutation handler", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, "now").mockReturnValue(Date.UTC(2026, 8, 15, 17, 0, 0));
    authMocks.isAdmin.mockResolvedValue(true);
  });

  it("promotes the exact newest fresh concrete CAD artifact after all required reviews are accepted", async () => {
    const state = makeContext();
    const result = await recordProfessionalReviewHandler(state.ctx, acceptedArgs());

    expect(result).toMatchObject({
      success: true,
      trustState: "professionally_reviewed",
      artifactMaturity: "engineering_reviewed",
      isCurrentRevision: true,
      idempotent: false,
    });
    expect(state.indexEquals).toContainEqual(["atlasDeliverables", "kind", "native_cad_step"]);
    expect(state.patch).toHaveBeenCalledWith("review-1", expect.objectContaining({
      status: "accepted",
      reviewerName: "Dana Engineer",
      reviewerReference: "PE-12345",
    }));
    expect(state.patch).toHaveBeenCalledWith("cad-1", expect.objectContaining({
      trustState: "professionally_reviewed",
      artifactMaturity: "engineering_reviewed",
    }));
    expect(state.insert).toHaveBeenCalledTimes(1);
    expect(state.insert).toHaveBeenCalledWith("atlasExecutionEvents", expect.objectContaining({
      eventType: "professional_review_recorded",
      metadata: expect.objectContaining({
        reviewId: "review-1",
        deliverableId: "cad-1",
        deliverableVersion: 1,
        isCurrentRevision: true,
      }),
    }));
  });

  it("does not promote an older same-kind CAD revision after a newer revision exists", async () => {
    const oldCad = baseCad({ _id: "cad-1", version: 1 });
    const newCad = baseCad({ _id: "cad-2", version: 2 });
    const state = makeContext({ deliverable: oldCad, cadRevisions: [oldCad, newCad] });

    const result = await recordProfessionalReviewHandler(state.ctx, acceptedArgs());

    expect(result).toMatchObject({ artifactMaturity: "preliminary_cad", isCurrentRevision: false });
    expect(state.patch).toHaveBeenCalledWith("cad-1", expect.objectContaining({
      trustState: "professionally_reviewed",
      artifactMaturity: "preliminary_cad",
    }));
    expect(state.insert).toHaveBeenCalledWith("atlasExecutionEvents", expect.objectContaining({
      metadata: expect.objectContaining({ deliverableVersion: 1, isCurrentRevision: false }),
    }));
  });

  it("fails closed when multiple same-kind CAD rows claim the same latest version", async () => {
    const first = baseCad({ _id: "cad-1", version: 2 });
    const duplicate = baseCad({ _id: "cad-2", version: 2 });
    const state = makeContext({ deliverable: first, cadRevisions: [first, duplicate] });
    const result = await recordProfessionalReviewHandler(state.ctx, acceptedArgs());
    expect(result).toMatchObject({ artifactMaturity: "preliminary_cad", isCurrentRevision: false });
  });

  it("requires every review attached to the exact CAD revision to be accepted before promotion", async () => {
    const review = baseReview();
    const regulatory = baseReview({ _id: "review-2", specialty: "regulatory", status: "in_review" });
    const state = makeContext({ review, siblingReviews: [review, regulatory] });
    const result = await recordProfessionalReviewHandler(state.ctx, acceptedArgs());
    expect(result).toMatchObject({
      trustState: "professional_review_required",
      artifactMaturity: "preliminary_cad",
    });
  });

  it("invalidates engineering maturity when the professional requests changes", async () => {
    const review = baseReview({ status: "accepted", reviewerName: "Dana Engineer", reviewerReference: "PE-12345" });
    const cad = baseCad({ trustState: "professionally_reviewed", artifactMaturity: "engineering_reviewed" });
    const state = makeContext({ review, deliverable: cad, siblingReviews: [review], cadRevisions: [cad] });

    const result = await recordProfessionalReviewHandler(state.ctx, acceptedArgs({ accepted: false, notes: "Increase wall thickness." }));

    expect(result).toMatchObject({
      trustState: "professional_review_required",
      artifactMaturity: "preliminary_cad",
      idempotent: false,
    });
    expect(state.patch).toHaveBeenCalledWith("cad-1", expect.objectContaining({
      trustState: "professional_review_required",
      artifactMaturity: "preliminary_cad",
    }));
  });

  it("revokes manufacturing release when its professional review is reopened", async () => {
    const review = baseReview({ status: "accepted", reviewerName: "Dana Engineer", reviewerReference: "PE-12345" });
    const cad = baseCad({ trustState: "professionally_reviewed", artifactMaturity: "manufacturing_released" });
    const state = makeContext({ review, deliverable: cad, siblingReviews: [review], cadRevisions: [cad] });

    const result = await recordProfessionalReviewHandler(state.ctx, acceptedArgs({ accepted: false, notes: "Recheck load case." }));

    expect(result).toMatchObject({
      trustState: "professional_review_required",
      artifactMaturity: "preliminary_cad",
    });
    expect(state.patch).toHaveBeenCalledWith("cad-1", expect.objectContaining({
      trustState: "professional_review_required",
      artifactMaturity: "preliminary_cad",
    }));
  });

  it("makes an exact accepted-review replay idempotent with no duplicate patches or audit event", async () => {
    const review = baseReview({
      status: "accepted",
      reviewerName: "Dana Engineer",
      reviewerReference: "PE-12345",
    });
    const cad = baseCad({ trustState: "professionally_reviewed", artifactMaturity: "engineering_reviewed" });
    const state = makeContext({ review, deliverable: cad, siblingReviews: [review], cadRevisions: [cad] });

    await expect(recordProfessionalReviewHandler(state.ctx, acceptedArgs())).resolves.toMatchObject({ idempotent: true });
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
  });

  it("rejects missing reviewer evidence before any write", async () => {
    const state = makeContext();
    await expect(recordProfessionalReviewHandler(state.ctx, acceptedArgs({ reviewerReference: " " }))).rejects.toThrow("Reviewer reference is required");
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
  });

  it("rejects non-admin review recording before any write", async () => {
    authMocks.isAdmin.mockResolvedValue(false);
    const state = makeContext();
    await expect(recordProfessionalReviewHandler(state.ctx, acceptedArgs())).rejects.toThrow("Administrator authorization is required");
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
  });

  it("rejects a review whose deliverable belongs to another invention", async () => {
    const state = makeContext({ deliverable: baseCad({ inventionId: "inv-other" }) });
    await expect(recordProfessionalReviewHandler(state.ctx, acceptedArgs())).rejects.toThrow("does not belong to this invention");
    expect(state.patch).not.toHaveBeenCalled();
    expect(state.insert).not.toHaveBeenCalled();
  });
});
