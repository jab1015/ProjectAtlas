"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { api } from "@convex/_generated/api";
import { Building2, CreditCard, ShieldCheck, UserRound, UsersRound } from "lucide-react";

import { AppNav } from "@/components/atlas/app-nav";
import { MadeThisBadge } from "@/components/atlas/made-this-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type OrganizationPlanKey =
  | "explorer"
  | "inventor"
  | "pro"
  | "enterprise"
  | "studio_3"
  | "studio_6"
  | "studio_custom";

type OrganizationRole = "owner" | "admin" | "member" | "viewer" | "professional";

interface OrganizationSummary {
  organizationId: string;
  name: string;
  kind: "personal" | "company" | "studio";
  planKey: OrganizationPlanKey;
  role: OrganizationRole;
  activeInventionLimit: number | null;
  includedSeatLimit: number | null;
}

interface PrivacyRequest {
  _id: string;
  requestType: "data_export" | "account_deletion";
  status: string;
  requestedAt: number;
}

const getMyOrganizations = makeFunctionReference<"query", Record<string, never>, OrganizationSummary[]>("organizations:getMyOrganizations");
const ensurePersonalOrganization = makeFunctionReference<"mutation", Record<string, never>, { organizationId: string }>("organizations:ensurePersonalOrganization");
const migrateMyLegacyInventions = makeFunctionReference<"mutation", Record<string, never>, { organizationId: string; migrated: number }>("organizations:migrateMyLegacyInventions");
const listPrivacyRequests = makeFunctionReference<"query", Record<string, never>, PrivacyRequest[]>("privacyRequests:listMine");
const createPrivacyRequest = makeFunctionReference<"mutation", { requestType: "data_export" | "account_deletion" }, { requestId: string; duplicate: boolean }>("privacyRequests:request");

const PLAN_LABELS: Record<OrganizationPlanKey, { name: string; price: string }> = {
  explorer: { name: "Explorer", price: "Free" },
  inventor: { name: "Inventor", price: "$39/month" },
  pro: { name: "Pro", price: "$99/month" },
  enterprise: { name: "Enterprise", price: "$199/month" },
  studio_3: { name: "Studio 3", price: "$299/month" },
  studio_6: { name: "Studio 6", price: "$399/month" },
  studio_custom: { name: "Studio Custom", price: "Custom" },
};

function formatLimit(value: number | null, singular: string, plural: string) {
  if (value === null) return "Contracted capacity";
  return `${value} ${value === 1 ? singular : plural}`;
}

function AccountSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
      <div className="h-8 w-52 animate-pulse rounded-md bg-muted" />
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const [privacyMessage, setPrivacyMessage] = useState<string | null>(null);
  const [migrationMessage, setMigrationMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/sign-in");
  }, [isAuthenticated, isLoading, router]);

  const profile = useQuery(api.users.getUserProfile, isAuthenticated ? {} : "skip");
  const organizations = useQuery(getMyOrganizations, isAuthenticated ? {} : "skip");
  const privacyRequests = useQuery(listPrivacyRequests, isAuthenticated ? {} : "skip");
  const ensureOrganization = useMutation(ensurePersonalOrganization);
  const migrateLegacy = useMutation(migrateMyLegacyInventions);
  const requestPrivacyAction = useMutation(createPrivacyRequest);

  useEffect(() => {
    if (!isAuthenticated || organizations === undefined || organizations.length > 0) return;
    void ensureOrganization({}).catch(() => undefined);
  }, [ensureOrganization, isAuthenticated, organizations]);

  const migrateLegacyWorkspaces = async () => {
    try {
      const result = await migrateLegacy({});
      setMigrationMessage(result.migrated > 0
        ? `${result.migrated} existing invention workspace${result.migrated === 1 ? " was" : "s were"} attached to your personal organization.`
        : "Your existing invention workspaces are already organization-ready.");
    } catch {
      setMigrationMessage("InventSmith could not complete the workspace migration. No invention data was removed.");
    }
  };

  const submitPrivacyRequest = async (requestType: "data_export" | "account_deletion") => {
    if (requestType === "account_deletion" && !window.confirm("Request permanent deletion of your InventSmith account? Organization-owned inventions belonging to other members must not be deleted with an individual membership.")) return;
    try {
      const result = await requestPrivacyAction({ requestType });
      setPrivacyMessage(result.duplicate ? "That request is already pending." : requestType === "data_export" ? "Your data export request was recorded." : "Your account deletion request was recorded.");
    } catch {
      setPrivacyMessage("InventSmith could not record the privacy request. Please try again.");
    }
  };

  if (isLoading || !isAuthenticated) return null;
  if (profile === undefined || organizations === undefined || privacyRequests === undefined) {
    return <div className="min-h-screen bg-background"><AppNav /><AccountSkeleton /></div>;
  }

  if (profile === null) {
    return (
      <div className="min-h-screen bg-background">
        <AppNav />
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-3xl items-center justify-center px-4 sm:px-6">
          <Card className="w-full p-6 text-center">
            <p className="text-sm text-muted-foreground">We could not load your account profile.</p>
            <Button asChild className="mt-4"><Link href="/dashboard">Back to dashboard</Link></Button>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-primary">Account</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">Profile, organizations, and billing</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              InventSmith subscriptions belong to an organization. A solo inventor simply works inside a one-member personal organization.
            </p>
          </div>
          <Button asChild variant="outline"><Link href="/pricing">View plan comparison</Link></Button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground"><UserRound className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">Profile</span></div>
              <CardTitle className="text-xl">Inventor details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Name</p><p className="mt-1 font-medium">{profile.name ?? "Name not set"}</p></div>
              <div><p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Email</p><p className="mt-1 break-words font-medium">{profile.email ?? "Email not set"}</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-muted-foreground"><ShieldCheck className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">Migration safety</span></div>
              <CardTitle className="text-xl">Existing inventions</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">Older single-user inventions can be attached additively to your personal organization. This does not delete their evidence, work, CAD, documents, history, or legacy ownership attribution.</p>
              <Button className="mt-5" variant="outline" onClick={() => void migrateLegacyWorkspaces()}>Verify organization migration</Button>
              {migrationMessage && <p role="status" className="mt-3 text-sm text-muted-foreground">{migrationMessage}</p>}
            </CardContent>
          </Card>
        </div>

        <section className="mt-8" aria-labelledby="organizations-title">
          <div className="mb-4 flex items-center gap-2"><Building2 className="h-4 w-4 text-muted-foreground" /><h2 id="organizations-title" className="text-lg font-semibold">Your organizations</h2></div>
          {organizations.length === 0 ? (
            <Card><CardContent className="p-6 text-sm text-muted-foreground">InventSmith is creating your personal organization.</CardContent></Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {organizations.map((organization) => {
                const plan = PLAN_LABELS[organization.planKey];
                return (
                  <Card key={organization.organizationId}>
                    <CardHeader>
                      <div className="flex items-start justify-between gap-3">
                        <div><CardTitle>{organization.name}</CardTitle><p className="mt-1 text-sm capitalize text-muted-foreground">{organization.kind} organization · {organization.role}</p></div>
                        <Badge>{plan.name}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-xl font-semibold">{plan.price}</p>
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-md border border-border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Active inventions</p><p className="mt-1 font-medium">{formatLimit(organization.activeInventionLimit, "slot", "slots")}</p></div>
                        <div className="rounded-md border border-border bg-muted/30 p-3"><p className="text-xs text-muted-foreground">Included users</p><p className="mt-1 font-medium">{formatLimit(organization.includedSeatLimit, "seat", "seats")}</p></div>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">AI, research, CAD, rendering, and document-generation usage is shared by the organization rather than multiplied by each member.</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-6" aria-labelledby="billing-title">
          <div className="flex items-center gap-2"><CreditCard className="h-4 w-4 text-muted-foreground" /><h2 id="billing-title" className="text-lg font-semibold">Plan and billing changes</h2></div>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
            The current commercial plan is Explorer $0, Inventor $39, Pro $99, Enterprise $199, Studio 3 $299, Studio 6 $399, with larger Studio capacity custom-priced. InventSmith will not send you to a legacy checkout product whose configured price may not match these plans.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button asChild><Link href="/pricing">Compare plans</Link></Button>
            <Button asChild variant="outline"><a href="mailto:support@madethis.com?subject=InventSmith%20organization%20billing">Billing assistance</a></Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Direct upgrade checkout will be enabled only after the new billing products are configured and cryptographically bound to the intended organization.</p>
        </section>

        <section className="mt-8 rounded-xl border border-border bg-card p-6" aria-labelledby="privacy-controls-title">
          <div className="flex items-center gap-2"><UsersRound className="h-4 w-4 text-muted-foreground" /><h2 id="privacy-controls-title" className="text-lg font-semibold">Privacy controls</h2></div>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Request a portable account-data export or coordinated deletion. Individual account deletion must not delete inventions owned by an organization that still has other authorized members.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => void submitPrivacyRequest("data_export")}>Request data export</Button>
            <Button variant="destructive" onClick={() => void submitPrivacyRequest("account_deletion")}>Request account deletion</Button>
          </div>
          {privacyMessage && <p role="status" className="mt-3 text-sm text-muted-foreground">{privacyMessage}</p>}
          {privacyRequests.length > 0 && (
            <ul className="mt-5 space-y-2 border-t border-border pt-4 text-sm">
              {privacyRequests.slice(0, 5).map((request) => (
                <li key={request._id} className="flex flex-wrap justify-between gap-2"><span className="capitalize">{request.requestType.replaceAll("_", " ")}</span><span className="capitalize text-muted-foreground">{request.status.replaceAll("_", " ")} · {new Date(request.requestedAt).toLocaleDateString()}</span></li>
              ))}
            </ul>
          )}
        </section>
      </main>
      <footer className="border-t border-border"><MadeThisBadge /></footer>
    </div>
  );
}
