"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { AppNav } from "@/components/atlas/app-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, ArrowLeft, DatabaseZap, ExternalLink, FileText, RefreshCw, Trash2, Upload } from "lucide-react";
import { extractEvidenceFromFile, type EvidenceExtraction } from "@/lib/evidenceIngestion";

const retryEvidenceExtraction = makeFunctionReference<"mutation", { inventionId: Id<"inventions">; evidenceSourceId: Id<"evidenceSources"> }, { scheduled: boolean; reason: "queued" | "already_queued" }>("evidenceExtractionControl:retryEvidenceExtraction");

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  ".pdf", ".doc", ".docx", ".txt", ".md", ".csv", ".xls", ".xlsx",
  ".png", ".jpg", ".jpeg", ".webp", ".ppt", ".pptx", ".mp4", ".mov", ".m4a", ".mp3",
].join(",");

const EVIDENCE_KINDS = [
  ["survey", "Survey / SurveyMonkey results"],
  ["interview", "Interview notes or transcript"],
  ["customer_discovery", "Customer discovery"],
  ["prototype_test", "Prototype / test evidence"],
  ["competitor", "Competitor material"],
  ["prior_art", "Patent / prior-art document"],
  ["manufacturer_quote", "Manufacturer quote / RFQ"],
  ["professional_report", "Professional report"],
  ["design_reference", "Sketch / drawing / design reference"],
  ["pitch_deck", "Pitch deck / funding material"],
  ["legal", "Contract / legal document"],
  ["other", "Other invention evidence"],
] as const;

function formatBytes(value: number | null | undefined) {
  if (!value) return "";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${Math.round(value / 1024)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function extractionStatusLabel(status: string | null | undefined) {
  if (status === "queued") return "Structured extraction queued";
  if (status === "running") return "Structured extraction running";
  if (status === "completed") return "Structured extraction complete";
  if (status === "failed") return "Structured extraction failed";
  return null;
}

export default function InventionEvidencePage() {
  const router = useRouter();
  const params = useParams();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const generateUploadUrl = useMutation(api.files.generateInventionEvidenceUploadUrl);
  const registerEvidence = useMutation(api.files.registerInventionEvidence);
  const removeEvidence = useMutation(api.files.removeInventionEvidence);
  const retryExtraction = useMutation(retryEvidenceExtraction);
  const evidence = useQuery(
    api.files.listInventionEvidence,
    isAuthenticated && inventionId ? { inventionId } : "skip"
  );

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [evidenceKind, setEvidenceKind] = useState("survey");
  const [extraction, setExtraction] = useState<EvidenceExtraction | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const kindLabels = useMemo(
    () => Object.fromEntries(EVIDENCE_KINDS.map(([value, label]) => [value, label])),
    []
  );

  if (!isLoading && !isAuthenticated) router.replace("/sign-in");

  const onFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    setExtraction(null);
    if (selected && selected.size > MAX_FILE_BYTES) {
      setFile(null);
      setError("Files must be 25 MB or smaller.");
      return;
    }
    setFile(selected);
    if (selected && !title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
    if (!selected) return;

    setExtracting(true);
    try {
      setExtraction(await extractEvidenceFromFile(selected, evidenceKind));
    } catch {
      setExtraction({
        extractionVersion: 1,
        mode: "metadata_only",
        summary: "The file will be preserved, but InventSmith could not create a structured preview in the browser.",
        limitations: ["Content extraction failed; downstream work must not assume the file supports any claim until reviewed."],
      });
    } finally {
      setExtracting(false);
    }
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!file) {
      setError("Choose a file to upload.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const currentExtraction = extraction ?? await extractEvidenceFromFile(file, evidenceKind);
      const uploadUrl = await generateUploadUrl({ inventionId });
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      if (!response.ok) throw new Error("The file could not be uploaded.");
      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };

      await registerEvidence({
        inventionId,
        storageId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type || undefined,
        title: title.trim() || undefined,
        evidenceKind,
        notes: notes.trim() || undefined,
        extraction: currentExtraction,
      });

      setFile(null);
      setTitle("");
      setNotes("");
      setEvidenceKind("survey");
      setExtraction(null);
      const input = document.getElementById("evidence-file") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const retry = async (evidenceSourceId: Id<"evidenceSources">) => {
    setRetryingId(String(evidenceSourceId));
    setError(null);
    try {
      await retryExtraction({ inventionId, evidenceSourceId });
    } catch (err) {
      setError(err instanceof Error ? err.message : "InventSmith could not retry evidence extraction.");
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
        <div>
          <Link href={`/invention/${inventionId}`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Back to invention
          </Link>
        </div>

        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Evidence Locker</p>
          <h1 className="text-3xl font-bold text-foreground">Give InventSmith the evidence you already have.</h1>
          <p className="max-w-3xl text-muted-foreground leading-relaxed">
            Upload survey results, interview notes, prototype tests, patents, quotes, drawings, professional reports,
            pitch decks, contracts, or other invention material. CSV survey results and text evidence are structured at intake;
            supported binary files are preserved first and then structured server-side so Validation and downstream departments
            can reason from the evidence while preserving its provenance.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="evidence-file">Evidence file</Label>
                <Input id="evidence-file" type="file" accept={ACCEPTED_FILE_TYPES} onChange={(event) => void onFileChange(event)} />
                <p className="text-xs text-muted-foreground">Up to 25 MB per file. CSV/text are parsed immediately; supported binary files are queued for structured extraction after upload.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="evidence-kind">What kind of evidence is this?</Label>
                <select
                  id="evidence-kind"
                  value={evidenceKind}
                  onChange={(e) => setEvidenceKind(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {EVIDENCE_KINDS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence-title">Title</Label>
              <Input id="evidence-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. SurveyMonkey study — 100 target customers" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence-notes">What should InventSmith know about this evidence?</Label>
              <Textarea id="evidence-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe who participated, when it was collected, what was tested, methodology, limitations, or anything important about the source." rows={4} />
            </div>

            {file && <p className="text-sm text-muted-foreground">Ready: <span className="font-medium text-foreground">{file.name}</span> ({formatBytes(file.size)})</p>}
            {extracting && <p className="inline-flex items-center gap-2 text-sm text-muted-foreground"><DatabaseZap className="h-4 w-4 animate-pulse text-primary" />Structuring evidence…</p>}
            {extraction && !extracting && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm">
                <p className="font-medium text-foreground">Structured evidence preview</p>
                <p className="mt-1 text-muted-foreground">{extraction.summary}</p>
                {extraction.survey && <p className="mt-2 text-xs text-muted-foreground">Survey rows: {extraction.survey.rowCount} · Questions/columns: {extraction.survey.columnCount}</p>}
                {extraction.mode === "metadata_only" && <p className="mt-2 text-xs text-primary">InventSmith will attempt server-side structured extraction after the file is stored.</p>}
                {extraction.limitations.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Provenance/limitations are preserved with the evidence.</p>}
              </div>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={!file || uploading || extracting} className="gap-2">
              <Upload className="h-4 w-4" />{uploading ? "Uploading evidence…" : "Upload evidence"}
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Inventor-provided evidence</h2>
            <p className="text-sm text-muted-foreground">Uploaded evidence can refresh affected research and design work, but remains inventor-provided and unverified until InventSmith or a qualified reviewer evaluates its provenance and relevance.</p>
          </div>

          {evidence === undefined ? <p className="text-sm text-muted-foreground">Loading evidence…</p> : evidence.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">No evidence uploaded yet.</div>
          ) : (
            <div className="space-y-3">
              {evidence.map((item) => {
                const statusLabel = extractionStatusLabel(item.extractionStatus);
                const retrying = retryingId === String(item._id);
                return (
                  <article key={item._id} className="rounded-xl border border-border bg-card p-5 flex gap-4 justify-between">
                    <div className="flex gap-3 min-w-0">
                      <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium text-foreground truncate">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{kindLabels[item.evidenceKind] ?? item.evidenceKind} · {formatBytes(item.fileSize)} · Uploaded {new Date(item.createdAt).toLocaleDateString()}</p>
                        {item.notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>}
                        {item.extractionSummary && <p className="text-xs text-primary">Structured intake: {item.extractionSummary}</p>}
                        {statusLabel && <p className={`inline-flex items-center gap-1.5 text-xs ${item.extractionStatus === "failed" ? "text-destructive" : item.extractionStatus === "completed" ? "text-success" : "text-primary"}`}>{item.extractionStatus === "failed" ? <AlertTriangle className="h-3.5 w-3.5" /> : item.extractionStatus === "queued" || item.extractionStatus === "running" ? <DatabaseZap className="h-3.5 w-3.5" /> : null}{statusLabel}</p>}
                        {item.extractionError && <p className="max-w-2xl text-xs text-destructive">{item.extractionError}</p>}
                        <p className="text-xs text-amber-700 dark:text-amber-400">Evidence state: unverified inventor upload</p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0 self-start">
                      {item.extractionStatus === "failed" && <Button type="button" variant="outline" size="sm" disabled={retrying} onClick={() => void retry(item._id)} aria-label={`Retry extraction for ${item.fileName}`}><RefreshCw className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`} /></Button>}
                      {item.downloadUrl && <Button asChild variant="outline" size="sm"><a href={item.downloadUrl} target="_blank" rel="noreferrer" aria-label={`Open ${item.fileName}`}><ExternalLink className="h-4 w-4" /></a></Button>}
                      <Button type="button" variant="outline" size="sm" aria-label={`Delete ${item.fileName}`} onClick={async () => { if (!window.confirm(`Delete ${item.fileName}?`)) return; await removeEvidence({ inventionId, evidenceSourceId: item._id }); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
