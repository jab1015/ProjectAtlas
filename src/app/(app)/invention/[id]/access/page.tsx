"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { ArrowLeft, KeyRound, RotateCcw, ShieldCheck } from "lucide-react";

import { AppNav } from "@/components/atlas/app-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Access = "manage" | "edit" | "view" | "review";
type Role = "owner" | "admin" | "member" | "viewer" | "professional";

interface Assignment {
  userId: string;
  name?: string;
  email?: string;
  role: Role;
  inheritedAccess: Access | null;
  explicitAccess: Access | null;
  effectiveAccess: Access | null;
}

const listAssignments = makeFunctionReference<"query", { inventionId: string }, Assignment[]>("inventionSharing:listAssignments");
const setAssignment = makeFunctionReference<"mutation", { inventionId: string; userId: string; access: Access }, string>("inventionSharing:setAssignment");
const clearAssignment = makeFunctionReference<"mutation", { inventionId: string; userId: string }, { cleared: boolean; fallbackAccess: Access | null }>("inventionSharing:clearAssignment");

const ACCESS_LABELS: Record<Access, string> = {
  manage: "Manage",
  edit: "Edit",
  view: "View only",
  review: "Professional review",
};

export default function InventionAccessPage() {
  const params = useParams<{ id: string }>();
  const inventionId = params.id;
  const assignments = useQuery(listAssignments, inventionId ? { inventionId } : "skip");
  const setAccess = useMutation(setAssignment);
  const clearAccess = useMutation(clearAssignment);

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-12">
        <Button asChild variant="ghost" size="sm" className="mb-5 -ml-2">
          <Link href={`/invention/${inventionId}/journey`}><ArrowLeft className="mr-2 h-4 w-4" />Back to Journey</Link>
        </Button>

        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-primary">Invention access</p>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Who can see and work on this invention?</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            Organization membership and invention access are separate. A professional reviewer can belong to the company without seeing any invention until you explicitly assign one here.
          </p>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <div className="flex items-center gap-2 text-muted-foreground"><KeyRound className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">Project permissions</span></div>
            <CardTitle>Organization members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {assignments === undefined ? (
              <p className="text-sm text-muted-foreground">Loading access assignments…</p>
            ) : assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active organization members are available.</p>
            ) : assignments.map((assignment) => (
              <div key={assignment.userId} className="rounded-xl border border-border p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate font-medium">{assignment.name ?? assignment.email ?? "InventSmith user"}</p>
                      <Badge variant="outline" className="capitalize">{assignment.role}</Badge>
                      {assignment.role === "owner" && <Badge><ShieldCheck className="mr-1 h-3 w-3" />Owner</Badge>}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{assignment.email ?? "No email available"}</p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Effective access: <span className="font-medium text-foreground">{assignment.effectiveAccess ? ACCESS_LABELS[assignment.effectiveAccess] : "No invention access"}</span>
                      {assignment.explicitAccess ? " · explicitly assigned" : assignment.inheritedAccess ? " · inherited from organization role" : " · explicit assignment required"}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {assignment.role === "owner" ? (
                      <Badge>Manage</Badge>
                    ) : (
                      <>
                        <select
                          value={assignment.explicitAccess ?? ""}
                          onChange={(event) => {
                            const value = event.target.value as Access | "";
                            if (!value) {
                              void clearAccess({ inventionId, userId: assignment.userId });
                            } else {
                              void setAccess({ inventionId, userId: assignment.userId, access: value });
                            }
                          }}
                          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                          aria-label={`Access for ${assignment.name ?? assignment.email ?? "member"}`}
                        >
                          <option value="">Use role default{assignment.inheritedAccess ? ` (${ACCESS_LABELS[assignment.inheritedAccess]})` : " (no access)"}</option>
                          <option value="manage">Manage</option>
                          <option value="edit">Edit</option>
                          <option value="view">View only</option>
                          <option value="review">Professional review</option>
                        </select>
                        {assignment.explicitAccess && (
                          <Button type="button" variant="ghost" size="sm" title="Return to role default" onClick={() => void clearAccess({ inventionId, userId: assignment.userId })}>
                            <RotateCcw className="h-4 w-4" />
                            <span className="sr-only">Return to role default</span>
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-6 rounded-xl border border-border bg-muted/30 p-5 text-sm leading-relaxed text-muted-foreground">
          <p className="font-medium text-foreground">Professional reviewers are intentionally isolated.</p>
          <p className="mt-1">A Professional organization role receives no portfolio-wide invention access. Assign “Professional review” only to the invention they need. Removing their organization membership immediately invalidates any old project grant.</p>
        </div>
      </main>
    </div>
  );
}
