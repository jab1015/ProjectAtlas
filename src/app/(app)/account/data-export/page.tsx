"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery, useConvexAuth } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Download, FileJson, ShieldCheck } from "lucide-react";
import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const getStructuredExport = makeFunctionReference<"query", Record<string, never>, any>("privacyExport:getMyStructuredExport");

function sanitizeFilePart(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "atlas-account";
}

export default function DataExportPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  const exportData = useQuery(getStructuredExport, isAuthenticated ? {} : "skip");
  const serialized = useMemo(() => exportData ? JSON.stringify(exportData, null, 2) : "", [exportData]);

  const downloadExport = () => {
    if (!exportData) return;
    const blob = new Blob([serialized], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    const identity = typeof exportData.profile?.email === "string" ? exportData.profile.email.split("@")[0] : "account";
    const date = new Date(exportData.generatedAt).toISOString().slice(0, 10);
    anchor.href = url;
    anchor.download = `atlas-data-export-${sanitizeFilePart(identity)}-${date}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  if (isLoading || !isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="mb-6">
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Privacy</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Download your Atlas data</h1>
          <p className="mt-2 text-sm text-muted-foreground">Create a portable JSON copy of the structured data stored in your Atlas workspace.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg"><FileJson className="h-5 w-5" />Structured account export</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {exportData === undefined ? (
              <p className="text-sm text-muted-foreground">Preparing your structured export…</p>
            ) : (
              <>
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  <p className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />The export excludes passwords, auth sessions, refresh tokens, verification codes, download bearer tokens, and server/API keys.</p>
                  <p className="mt-3">Uploaded and generated binary file bytes are not embedded in the JSON. Those remain available from the relevant invention workspace, or through the formal privacy-request process when a coordinated package is required.</p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{exportData.inventions?.length ?? 0} invention workspace(s) included.</p>
                  <p>Generated {new Date(exportData.generatedAt).toLocaleString()}.</p>
                </div>
                <Button onClick={downloadExport} className="gap-2"><Download className="h-4 w-4" />Download JSON export</Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="mt-6">
          <Button asChild variant="outline"><Link href="/account">Back to account</Link></Button>
        </div>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
