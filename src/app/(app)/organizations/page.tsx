"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { makeFunctionReference } from "convex/server";
import { Building2, Plus, Shield, Trash2, UserPlus, UsersRound } from "lucide-react";

import { AppNav } from "@/components/atlas/app-nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

 type OrganizationRole = "owner" | "admin" | "member" | "viewer" | "professional";
 type AssignableRole = Exclude<OrganizationRole, "owner">;
 type OrganizationPlanKey = "explorer" | "inventor" | "pro" | "enterprise" | "studio_3" | "studio_6" | "studio_custom";

 interface OrganizationSummary {
   organizationId: string;
   name: string;
   kind: "personal" | "company" | "studio";
   planKey: OrganizationPlanKey;
   role: OrganizationRole;
   activeInventionLimit: number | null;
   includedSeatLimit: number | null;
 }

 interface MemberSummary {
   membershipId: string;
   userId: string;
   name?: string;
   email?: string;
   role: OrganizationRole;
   status: string;
 }

 const getMyOrganizations = makeFunctionReference<"query", Record<string, never>, OrganizationSummary[]>("organizations:getMyOrganizations");
 const createOrganization = makeFunctionReference<"mutation", { name: string; kind: "company" | "studio" }, { organizationId: string }>("organizations:createOrganization");
 const listOrganizationMembers = makeFunctionReference<"query", { organizationId: string }, MemberSummary[]>("organizations:listOrganizationMembers");
 const addMemberByEmail = makeFunctionReference<"mutation", { organizationId: string; email: string; role: AssignableRole }, { membershipId: string; added: boolean }>("organizations:addMemberByEmail");
 const updateMemberRole = makeFunctionReference<"mutation", { organizationId: string; userId: string; role: AssignableRole }, { membershipId: string }>("organizations:updateMemberRole");
 const removeMember = makeFunctionReference<"mutation", { organizationId: string; userId: string }, { removed: boolean }>("organizations:removeMember");

 const PLAN_NAMES: Record<OrganizationPlanKey, string> = {
   explorer: "Explorer",
   inventor: "Inventor",
   pro: "Pro",
   enterprise: "Enterprise",
   studio_3: "Studio 3",
   studio_6: "Studio 6",
   studio_custom: "Studio Custom",
 };

 const ASSIGNABLE_ROLES: { value: AssignableRole; label: string; detail: string }[] = [
   { value: "admin", label: "Admin", detail: "Manage organization workspaces and members, but not owner-only billing/ownership actions." },
   { value: "member", label: "Member", detail: "Create and edit invention work according to assigned access." },
   { value: "viewer", label: "Viewer", detail: "Read-only organization/invention access." },
   { value: "professional", label: "Professional", detail: "Bounded reviewer access; cannot edit normal invention work or organization billing." },
 ];

 function capacity(value: number | null, singular: string, plural: string) {
   if (value === null) return "Contracted";
   return `${value} ${value === 1 ? singular : plural}`;
 }

 export default function OrganizationsPage() {
   const router = useRouter();
   const { isAuthenticated, isLoading } = useConvexAuth();
   const organizations = useQuery(getMyOrganizations, isAuthenticated ? {} : "skip");
   const [selectedId, setSelectedId] = useState<string | null>(null);
   const selected = useMemo(() => organizations?.find((organization) => organization.organizationId === selectedId) ?? organizations?.[0] ?? null, [organizations, selectedId]);
   const members = useQuery(listOrganizationMembers, isAuthenticated && selected ? { organizationId: selected.organizationId } : "skip");
   const createOrganizationAction = useMutation(createOrganization);
   const addMemberAction = useMutation(addMemberByEmail);
   const updateRoleAction = useMutation(updateMemberRole);
   const removeMemberAction = useMutation(removeMember);

   const [newOrgName, setNewOrgName] = useState("");
   const [newOrgKind, setNewOrgKind] = useState<"company" | "studio">("company");
   const [memberEmail, setMemberEmail] = useState("");
   const [memberRole, setMemberRole] = useState<AssignableRole>("member");
   const [message, setMessage] = useState<string | null>(null);

   useEffect(() => {
     if (!isLoading && !isAuthenticated) router.push("/sign-in");
   }, [isAuthenticated, isLoading, router]);

   useEffect(() => {
     if (!selectedId && organizations?.length) setSelectedId(organizations[0].organizationId);
   }, [organizations, selectedId]);

   if (isLoading || !isAuthenticated) return null;

   const canManageMembers = selected?.role === "owner" || selected?.role === "admin";

   const handleCreateOrganization = async () => {
     const name = newOrgName.trim();
     if (!name) return;
     try {
       const result = await createOrganizationAction({ name, kind: newOrgKind });
       setNewOrgName("");
       setSelectedId(result.organizationId);
       setMessage(`${newOrgKind === "studio" ? "Studio" : "Company"} created on Explorer. Billing must explicitly activate a paid organization plan.`);
     } catch (error) {
       setMessage(error instanceof Error ? error.message : "InventSmith could not create the organization.");
     }
   };

   const handleAddMember = async () => {
     if (!selected || !memberEmail.trim()) return;
     try {
       const result = await addMemberAction({ organizationId: selected.organizationId, email: memberEmail.trim(), role: memberRole });
       setMemberEmail("");
       setMessage(result.added ? "Team member added." : "That user already belonged to the organization; their role was updated where permitted.");
     } catch (error) {
       setMessage(error instanceof Error ? error.message : "InventSmith could not add that member.");
     }
   };

   return (
     <div className="min-h-screen bg-background">
       <AppNav />
       <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
         <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
           <div>
             <p className="text-xs font-medium uppercase tracking-widest text-primary">Organizations</p>
             <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Teams and invention workspaces</h1>
             <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">A solo inventor is a one-person organization. Company and Studio workspaces add seats and active-invention capacity while sharing one organization-level AI, CAD, rendering, research, and document-generation allowance.</p>
           </div>
         </div>

         {message && <div role="status" className="mt-6 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">{message}</div>}

         <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.6fr]">
           <div className="space-y-6">
             <Card>
               <CardHeader><div className="flex items-center gap-2 text-muted-foreground"><Building2 className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">Your organizations</span></div><CardTitle>Select workspace</CardTitle></CardHeader>
               <CardContent className="space-y-3">
                 {organizations === undefined ? <p className="text-sm text-muted-foreground">Loading organizations…</p> : organizations.length === 0 ? <p className="text-sm text-muted-foreground">Your personal organization is being prepared.</p> : organizations.map((organization) => (
                   <button key={organization.organizationId} type="button" onClick={() => setSelectedId(organization.organizationId)} className={`w-full rounded-lg border p-4 text-left transition-colors ${selected?.organizationId === organization.organizationId ? "border-primary bg-accent/40" : "border-border hover:bg-muted/40"}`}>
                     <div className="flex items-start justify-between gap-3"><div><p className="font-medium">{organization.name}</p><p className="mt-1 text-xs capitalize text-muted-foreground">{organization.kind} · {organization.role}</p></div><Badge variant="outline">{PLAN_NAMES[organization.planKey]}</Badge></div>
                     <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground"><span>{capacity(organization.activeInventionLimit, "invention", "inventions")}</span><span>·</span><span>{capacity(organization.includedSeatLimit, "seat", "seats")}</span></div>
                   </button>
                 ))}
               </CardContent>
             </Card>

             <Card>
               <CardHeader><div className="flex items-center gap-2 text-muted-foreground"><Plus className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">New organization</span></div><CardTitle>Create company or Studio</CardTitle></CardHeader>
               <CardContent className="space-y-4">
                 <Input value={newOrgName} onChange={(event) => setNewOrgName(event.target.value)} placeholder="Organization name" maxLength={160} />
                 <div className="grid grid-cols-2 gap-2">
                   <Button type="button" variant={newOrgKind === "company" ? "default" : "outline"} onClick={() => setNewOrgKind("company")}>Company</Button>
                   <Button type="button" variant={newOrgKind === "studio" ? "default" : "outline"} onClick={() => setNewOrgKind("studio")}>Studio</Button>
                 </div>
                 <p className="text-xs leading-relaxed text-muted-foreground">New organizations start on Explorer. A paid plan must be activated for that specific organization; creating another organization never clones a paid personal subscription.</p>
                 <Button type="button" className="w-full" disabled={!newOrgName.trim()} onClick={() => void handleCreateOrganization()}>Create organization</Button>
               </CardContent>
             </Card>
           </div>

           <div className="space-y-6">
             {!selected ? (
               <Card><CardContent className="p-8 text-sm text-muted-foreground">Select or create an organization to manage its team.</CardContent></Card>
             ) : (
               <>
                 <Card>
                   <CardHeader><div className="flex items-center gap-2 text-muted-foreground"><UsersRound className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">Team</span></div><div className="flex flex-wrap items-start justify-between gap-3"><div><CardTitle>{selected.name}</CardTitle><p className="mt-1 text-sm text-muted-foreground">{PLAN_NAMES[selected.planKey]} · {capacity(selected.includedSeatLimit, "included seat", "included seats")}</p></div><Badge className="capitalize">{selected.role}</Badge></div></CardHeader>
                   <CardContent className="space-y-4">
                     {members === undefined ? <p className="text-sm text-muted-foreground">Loading members…</p> : members.length === 0 ? <p className="text-sm text-muted-foreground">No active members found.</p> : members.map((member) => (
                       <div key={member.membershipId} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                         <div className="min-w-0"><p className="truncate font-medium">{member.name ?? member.email ?? "InventSmith user"}</p><p className="truncate text-xs text-muted-foreground">{member.email ?? "No email available"} · <span className="capitalize">{member.status}</span></p></div>
                         <div className="flex flex-wrap items-center gap-2">
                           {member.role === "owner" ? <Badge><Shield className="mr-1 h-3 w-3" />Owner</Badge> : canManageMembers ? (
                             <select value={member.role} onChange={(event) => void updateRoleAction({ organizationId: selected.organizationId, userId: member.userId, role: event.target.value as AssignableRole }).catch((error) => setMessage(error instanceof Error ? error.message : "Role update failed."))} className="h-9 rounded-md border border-input bg-background px-3 text-sm">
                               {ASSIGNABLE_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                             </select>
                           ) : <Badge variant="outline" className="capitalize">{member.role}</Badge>}
                           {canManageMembers && member.role !== "owner" && <Button type="button" size="sm" variant="ghost" className="text-destructive" onClick={() => void removeMemberAction({ organizationId: selected.organizationId, userId: member.userId }).then(() => setMessage("Team member removed. Any old invention grant no longer provides access.")).catch((error) => setMessage(error instanceof Error ? error.message : "Member removal failed."))}><Trash2 className="h-4 w-4" /><span className="sr-only">Remove member</span></Button>}
                         </div>
                       </div>
                     ))}
                   </CardContent>
                 </Card>

                 {canManageMembers && (
                   <Card>
                     <CardHeader><div className="flex items-center gap-2 text-muted-foreground"><UserPlus className="h-4 w-4" /><span className="text-xs font-medium uppercase tracking-widest">Add teammate</span></div><CardTitle>Add an existing InventSmith user</CardTitle></CardHeader>
                     <CardContent className="space-y-4">
                       <Input type="email" value={memberEmail} onChange={(event) => setMemberEmail(event.target.value)} placeholder="teammate@example.com" />
                       <select value={memberRole} onChange={(event) => setMemberRole(event.target.value as AssignableRole)} className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm">
                         {ASSIGNABLE_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label} — {role.detail}</option>)}
                       </select>
                       <p className="text-xs text-muted-foreground">The person must already have an InventSmith account. Invitation-before-signup will be added as a separate secure flow; this action never bypasses the purchased seat limit.</p>
                       <Button type="button" disabled={!memberEmail.trim()} onClick={() => void handleAddMember()}><UserPlus className="mr-2 h-4 w-4" />Add team member</Button>
                     </CardContent>
                   </Card>
                 )}
               </>
             )}
           </div>
         </div>
       </main>
     </div>
   );
 }
