"use client";

import { ChangeEvent, FormEvent, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { Id } from "@convex/_generated/dataModel";
import { AppNav } from "@/components/atlas/app-nav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, FileText, Upload, Trash2, ExternalLink } from "lucide-react";

const MAX_FILE_BYTES = 25 * 1024 * 1024;
const ACCEPTED_FILE_TYPES = [
  ".pdf",
  ".doc",
  ".docx",
  ".txt",
  ".csv",
  ".xls",
  ".xlsx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
  ".ppt",
  ".pptx",
  ".mp4",
  ".mov",
  ".m4a",
  ".mp3",
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

export default function InventionEvidencePage() {
  const router = useRouter();
  const params = useParams();
  const inventionId = params.id as Id<"inventions">;
  const { isAuthenticated, isLoading } = useConvexAuth();
  const generateUploadUrl = useMutation(api.files.generateInventionEvidenceUploadUrl);
  const registerEvidence = useMutation(api.files.registerInventionEvidence);
  const removeEvidence = useMutation(api.files.removeInventionEvidence);
  const evidence = useQuery(
    api.files.listInventionEvidence,
    isAuthenticated && inventionId ? { inventionId } : "skip"
  );

  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [evidenceKind, setEvidenceKind] = useState("survey");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const kindLabels = useMemo(
    () => Object.fromEntries(EVIDENCE_KINDS.map(([value, label]) => [value, label])),
    []
  );

  if (!isLoading && !isAuthenticated) {
    router.replace("/sign-in");
  }

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setError(null);
    if (selected && selected.size > MAX_FILE_BYTES) {
      setFile(null);
      setError("Files must be 25 MB or smaller.");
      return;
    }
    setFile(selected);
    if (selected && !title) setTitle(selected.name.replace(/\.[^.]+$/, ""));
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
      });

      setFile(null);
      setTitle("");
      setNotes("");
      setEvidenceKind("survey");
      const input = document.getElementById("evidence-file") as HTMLInputElement | null;
      if (input) input.value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
        <div>
          <Link
            href={`/invention/${inventionId}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to invention
          </Link>
        </div>

        <section className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Evidence Locker</p>
          <h1 className="text-3xl font-bold text-foreground">Give InventSmith the evidence you already have.</h1>
          <p className="max-w-3xl text-muted-foreground leading-relaxed">
            Upload survey results, interview notes, prototype tests, patents, quotes, drawings, professional reports,
            pitch decks, contracts, or other invention material. InventSmith records the file as inventor-provided
            evidence with its provenance intact so Validation and later departments can use it without pretending the
            evidence was generated by AI.
          </p>
        </section>

        <section className="rounded-xl border border-border bg-card p-6">
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="evidence-file">Evidence file</Label>
                <Input id="evidence-file" type="file" accept={ACCEPTED_FILE_TYPES} onChange={onFileChange} />
                <p className="text-xs text-muted-foreground">Up to 25 MB per file.</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="evidence-kind">What kind of evidence is this?</Label>
                <select
                  id="evidence-kind"
                  value={evidenceKind}
                  onChange={(e) => setEvidenceKind(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {EVIDENCE_KINDS.map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence-title">Title</Label>
              <Input
                id="evidence-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. SurveyMonkey study — 100 target customers"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="evidence-notes">What should InventSmith know about this evidence?</Label>
              <Textarea
                id="evidence-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe who participated, when it was collected, what was tested, methodology, limitations, or anything important about the source."
                rows={4}
              />
            </div>

            {file && (
              <p className="text-sm text-muted-foreground">
                Ready: <span className="font-medium text-foreground">{file.name}</span> ({formatBytes(file.size)})
              </p>
            )}
            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={!file || uploading} className="gap-2">
              <Upload className="h-4 w-4" />
              {uploading ? "Uploading evidence…" : "Upload evidence"}
            </Button>
          </form>
        </section>

        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Inventor-provided evidence</h2>
            <p className="text-sm text-muted-foreground">
              These sources remain marked unverified until InventSmith or a qualified reviewer evaluates them.
            </p>
          </div>

          {evidence === undefined ? (
            <p className="text-sm text-muted-foreground">Loading evidence…</p>
          ) : evidence.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center text-muted-foreground">
              No evidence uploaded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {evidence.map((item) => (
                <article key={item._id} className="rounded-xl border border-border bg-card p-5 flex gap-4 justify-between">
                  <div className="flex gap-3 min-w-0">
                    <FileText className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div className="min-w-0 space-y-1">
                      <p className="font-medium text-foreground truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {kindLabels[item.evidenceKind] ?? item.evidenceKind} · {formatBytes(item.fileSize)} · Uploaded {new Date(item.createdAt).toLocaleDateString()}
                      </p>
                      {item.notes && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>}
                      <p className="text-xs text-amber-700 dark:text-amber-400">Evidence state: unverified inventor upload</p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {item.downloadUrl && (
                      <Button asChild variant="outline" size="sm">
                        <a href={item.downloadUrl} target="_blank" rel="noreferrer" aria-label={`Open ${item.fileName}`}>
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      aria-label={`Delete ${item.fileName}`}
                      onClick={async () => {
                        if (!window.confirm(`Delete ${item.fileName}?`)) return;
                        await removeEvidence({ inventionId, evidenceSourceId: item._id });
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
