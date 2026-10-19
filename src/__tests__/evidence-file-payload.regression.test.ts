import { afterEach, describe, expect, it, vi } from "vitest";
import { Buffer } from "node:buffer";
import { extractInventorEvidenceFile } from "@convex/evidenceFileExtraction";

const { create } = vi.hoisted(() => ({ create: vi.fn() }));
vi.mock("openai", () => ({ default: class {
  responses = { create };
} }));

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

async function extract(mimeType: string, fileName: string, data: string) {
  vi.stubEnv("OPENAI_API_KEY", "test-only-placeholder");
  create.mockResolvedValue({ output_text: JSON.stringify({ summary: "Survey findings" }) });
  const bytes = Buffer.from(data);
  const ctx = {
    runQuery: vi.fn().mockResolvedValue({ mimeType, fileName, fileSize: bytes.length, storageId: "stored", evidenceKind: "survey" }),
    storage: { get: vi.fn().mockResolvedValue({ arrayBuffer: async () => bytes }) },
    runMutation: vi.fn(),
  };
  const result = await (extractInventorEvidenceFile as any)._handler(ctx, { evidenceSourceId: "existing-survey" });
  return { result, ctx, part: create.mock.calls[0][0].input[0].content[1], bytes };
}

describe("evidence file Responses API payload", () => {
  it("sends PDF bytes in a complete data URL and records successful extraction", async () => {
    const { result, part, bytes, ctx } = await extract("application/pdf", "survey.pdf", "%PDF-1.7\nfixture");
    expect(part).toEqual({ type: "input_file", filename: "survey.pdf", file_data: `data:application/pdf;base64,${bytes.toString("base64")}` });
    expect(result.extracted).toBe(true);
    expect(ctx.runMutation).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ evidenceSourceId: "existing-survey", extraction: { summary: "Survey findings" } }));
  });

  it("recognizes an extensionless PDF with generic upload MIME", async () => {
    const { part } = await extract("application/octet-stream", "Data_All_260313", "%PDF-1.7\nfixture");
    expect(part.filename).toBe("Data_All_260313.pdf");
    expect(part.file_data).toMatch(/^data:application\/pdf;base64,/);
  });

  it("preserves image input format", async () => {
    const { part, bytes } = await extract("image/png", "survey.png", "image fixture");
    expect(part).toEqual({ type: "input_image", image_url: `data:image/png;base64,${bytes.toString("base64")}`, detail: "high" });
  });
});
