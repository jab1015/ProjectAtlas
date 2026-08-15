"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { ShieldCheck } from "lucide-react";
import { AdminHeader } from "@/components/admin/admin-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PrivacyRequest {
  _id: string;
  userId: string;
  requestType: "data_export" | "account_deletion";
  status: "pending" | "in_progress";
  requestedAt: number;
}

interface DeletionSummary {
  inventionsDeleted: number;
  generatedFilesDeleted: number;
  uploadedFilesDeleted: number;
  usageRowsDeleted: number;
  notificationsDeleted: number;
  purchasesAnonymized: number;
  subscriptionEventsAnonymized: number;
  authSessionsDeleted: number;
  authAccountsDeleted: number;
}

const listPending = makeFunctionReference<"query", Record<string, never>, PrivacyRequest[]>("privacyRequests:listPending");
const resolveRequest = makeFunctionReference<"mutation", { requestId: string; status: "in_progress" | "completed" | "declined"; resolutionNotes?: string }, { success: boolean }>("privacyRequests:resolve");
const executeDeletion = makeFunctionReference<"mutation", { requestId: string; externalBillingResolved: boolean; resolutionNotes: string }, { success: boolean; summary: DeletionSummary }>("privacyRequests:executeAccountDeletion");

export default function AdminPrivacyPage() {
  const requests = useQuery(listPending);
  const resolve = useMutation(resolveRequest);
  const runDeletion = useMutation(executeDeletion);
  const [message, setMessage] = useState<string | null>(null);

  const update = async (requestId: string, status: "in_progress" | "completed" | "declined") => {
    const notes = status === "in_progress" ? undefined : window.prompt("Enter auditable resolution notes (required):") ?? undefined;
    if (status !== "in_progress" && !notes) return;
    try {
      await resolve({ requestId, status, resolutionNotes: notes });
      setMessage(`Request marked ${status.replaceAll("_", " ")}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not update the request.");
    }
  };

  const deleteAccount = async (requestId: string) => {
    const confirmed = window.confirm("This permanently removes the inventor's Atlas data and authentication credentials. Continue only after any active external subscription has been cancelled or otherwise resolved.");
    if (!confirmed) return;
    const externalBillingResolved = window.confirm("Confirm that external billing is cancelled/resolved, or that this account has no active paid billing relationship.");
    const notes = window.prompt("Enter auditable deletion notes (required):")?.trim();
    if (!notes) return;

    try {
      const result = await runDeletion({ requestId, externalBillingResolved, resolutionNotes: notes });
      setMessage(`Account deletion completed. ${result.summary.inventionsDeleted} invention(s) removed; ${result.summary.authSessionsDeleted} auth session(s) invalidated.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not execute account deletion.");
    }
  };

  return (
    <div>
      <AdminHeader title="Privacy requests" />
      <main className="space-y-6 p-6">
        <div><h1 className="text-2xl font-bold">Privacy operations</h1><p className="mt-1 text-sm text-muted-foreground">Coordinate exports and deletion across invention data, authentication, subscriptions, and legally retained transactions.</p></div>
        {message && <p role="status" className="text-sm text-muted-foreground">{message}</p>}
        {requests === undefined ? <p className="text-sm text-muted-foreground">Loading requests...</p> : requests.length === 0 ? (
          <Card><CardContent className="flex items-center gap-3 p-6"><ShieldCheck className="h-5 w-5 text-primary" /><p className="text-sm">No open privacy requests.</p></CardContent></Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((request) => (
              <Card key={request._id}>
                <CardHeader><CardTitle className="capitalize">{request.requestType.replaceAll("_", " ")}</CardTitle></CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p className="text-muted-foreground">User {request.userId} · Requested {new Date(request.requestedAt).toLocaleString()} · <span className="capitalize">{request.status.replaceAll("_", " ")}</span></p>
                  {request.requestType === "account_deletion" && <p className="text-xs text-muted-foreground">Deletion is fail-closed: paid billing must be resolved first, then Atlas removes invention data, generated/uploaded storage, usage, auth credentials, and identifying billing links in one transaction.</p>}
                  <div className="flex flex-wrap gap-2">
                    {request.status === "pending" && <Button variant="outline" onClick={() => void update(request._id, "in_progress")}>Start work</Button>}
                    {request.requestType === "account_deletion" ? (
                      <Button variant="destructive" onClick={() => void deleteAccount(request._id)}>Execute deletion</Button>
                    ) : (
                      <Button onClick={() => void update(request._id, "completed")}>Mark completed</Button>
                    )}
                    <Button variant="outline" onClick={() => void update(request._id, "declined")}>Decline with reason</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
