"use client";

import { Fragment, FormEvent, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { AdminHeader } from "@/components/admin";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const PLANS = ["explorer", "inventor", "pro", "enterprise"] as const;

function formatDate(timestamp?: number | null) {
  if (!timestamp) return "No expiration";
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(new Date(timestamp));
}

export default function BetaAccessPage() {
  const [search, setSearch] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [planKey, setPlanKey] = useState<(typeof PLANS)[number]>("pro");
  const [durationDays, setDurationDays] = useState("30");
  const [lifetime, setLifetime] = useState(false);
  const [confirmLifetime, setConfirmLifetime] = useState(false);
  const [message, setMessage] = useState("");
  const accounts = useQuery(api.betaAccess.listAccounts, { search: search || undefined });
  const grantAccess = useMutation(api.betaAccess.grantComplimentaryAccess);
  const revokeAccess = useMutation(api.betaAccess.revokeComplimentaryAccess);
  const adjustCredits = useMutation(api.betaAccess.adjustCredits);

  async function submitGrant(event: FormEvent<HTMLFormElement>, email: string) {
    event.preventDefault();
    setMessage("");
    if (lifetime && !confirmLifetime) {
      setMessage("Confirm that you want this grant to have no expiration.");
      return;
    }
    const days = Number(durationDays);
    if (!lifetime && (!Number.isInteger(days) || days < 1 || days > 730)) {
      setMessage("Enter an access period from 1 to 730 days.");
      return;
    }
    try {
      await grantAccess({
        email,
        planKey,
        ...(lifetime ? {} : { expiresAt: Date.now() + days * 24 * 60 * 60 * 1000 }),
        reason: lifetime
          ? `Admin grant: ${planKey} lifetime access`
          : `Admin grant: ${planKey} access for ${days} days`,
      });
      setMessage(`${lifetime ? "Lifetime" : `Complimentary ${planKey}`} access granted to ${email}.`);
      setConfirmLifetime(false);
      setEditingUserId("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not grant access.");
    }
  }

  async function changeCredits(organizationId: string, deltaUnits: number) {
    const creditReason = window.prompt("Reason for this credit change:", "Beta tester credit adjustment");
    if (!creditReason?.trim()) return;
    try {
      const result = await adjustCredits({ organizationId: organizationId as never, deltaUnits, reason: creditReason });
      setMessage(`Credit balance updated to ${result.balance} units.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not adjust credits.");
    }
  }

  return (
    <div className="space-y-6">
      <AdminHeader title="Beta access & credits" description="Time-limited complimentary plans and audited credit adjustments" />

      <section className="rounded-lg border bg-card p-5">
        <h2 className="font-semibold">Select a user to manage access</h2>
        <p className="mt-1 text-sm text-muted-foreground">Choose a user, set their plan and duration, then apply it on their row. Grants are automatically recorded for auditing. Plan access does not grant administrator privileges; credits remain separate.</p>
      </section>

      {message && <p className="rounded-md border bg-muted/40 p-3 text-sm">{message}</p>}

      <section className="rounded-lg border bg-card p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold">Accounts</h2>
            <p className="text-sm text-muted-foreground">Credits are cost units and are recorded in a separate ledger.</p>
          </div>
          <Input className="max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search email or name" />
        </div>
        {accounts === undefined ? <p className="mt-5 text-sm text-muted-foreground">Loading accounts…</p> : accounts.length === 0 ? <p className="mt-5 text-sm text-muted-foreground">No accounts found.</p> : (
          <div className="mt-5 overflow-x-auto rounded-md border">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-muted/50"><th className="px-3 py-2 text-left">Account</th><th className="px-3 py-2 text-left">Access</th><th className="hidden px-3 py-2 text-right md:table-cell">Credits</th><th className="hidden px-3 py-2 text-right md:table-cell">Actions</th></tr></thead>
              <tbody>{accounts.map((account) => (
                <Fragment key={String(account.userId)}>
                <tr className="border-b last:border-0">
                  <td className="px-3 py-3"><div className="font-medium">{account.name || account.email}</div><div className="text-muted-foreground">{account.email}</div></td>
                  <td className="px-3 py-3"><div>{account.planKey}</div>{account.override && <div className="text-xs text-muted-foreground">{account.override.expiresAt ? `until ${formatDate(account.override.expiresAt)}` : "Lifetime access · no expiration"} · {account.override.reason}</div>}
                    <div className="mt-3 flex flex-wrap gap-2 md:hidden">
                      <Button size="sm" variant="outline" onClick={() => {
                        const userId = String(account.userId);
                        if (editingUserId === userId) {
                          setEditingUserId("");
                        } else {
                          setEditingUserId(userId);
                          setPlanKey(PLANS.includes(account.planKey as (typeof PLANS)[number]) ? account.planKey as (typeof PLANS)[number] : "enterprise");
                          setLifetime(false);
                          setConfirmLifetime(false);
                          setDurationDays("30");
                        }
                      }}>{editingUserId === String(account.userId) ? "Close" : "Manage access"}</Button>
                      {account.organizationId && <><Button size="sm" variant="outline" onClick={() => void changeCredits(String(account.organizationId), 100)}>+100 credits</Button><Button size="sm" variant="outline" onClick={() => void changeCredits(String(account.organizationId), -100)} disabled={account.creditBalance < 100}>-100 credits</Button></>}
                      {account.override && <Button size="sm" variant="destructive" onClick={async () => { const why = window.prompt("Reason for revocation:", "Beta period ended"); if (why?.trim()) await revokeAccess({ overrideId: account.override!._id, reason: why }); }}>Revoke</Button>}
                    </div>
                  </td>
                  <td className="hidden px-3 py-3 text-right font-medium md:table-cell">{account.creditBalance}</td>
                  <td className="hidden space-x-2 whitespace-nowrap px-3 py-3 text-right md:table-cell">
                    <Button size="sm" variant="outline" onClick={() => {
                      const userId = String(account.userId);
                      if (editingUserId === userId) {
                        setEditingUserId("");
                      } else {
                        setEditingUserId(userId);
                        setPlanKey(PLANS.includes(account.planKey as (typeof PLANS)[number]) ? account.planKey as (typeof PLANS)[number] : "enterprise");
                        setLifetime(false);
                        setConfirmLifetime(false);
                        setDurationDays("30");
                      }
                    }}>{editingUserId === String(account.userId) ? "Close" : "Manage access"}</Button>
                    {account.organizationId && <><Button size="sm" variant="outline" onClick={() => void changeCredits(String(account.organizationId), 100)}>+100</Button><Button size="sm" variant="outline" onClick={() => void changeCredits(String(account.organizationId), -100)} disabled={account.creditBalance < 100}>-100</Button></>}
                    {account.override && <Button size="sm" variant="destructive" onClick={async () => { const why = window.prompt("Reason for revocation:", "Beta period ended"); if (why?.trim()) await revokeAccess({ overrideId: account.override!._id, reason: why }); }}>Revoke</Button>}
                  </td>
                </tr>
                {editingUserId === String(account.userId) && <tr className="border-b bg-muted/20"><td colSpan={4} className="p-4 sm:p-5">
                  <form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => void submitGrant(event, account.email)}>
                    <div className="md:col-span-2"><p className="font-medium">Access for {account.name || account.email}</p><p className="text-sm text-muted-foreground">{account.email}</p></div>
                    <label className="grid gap-1.5 text-sm font-medium">Plan access
                      <select className="h-10 w-full rounded-md border bg-background px-3 text-sm font-normal" value={planKey} onChange={(event) => setPlanKey(event.target.value as (typeof PLANS)[number])}>
                        {PLANS.map((plan) => <option key={plan} value={plan}>{plan[0].toUpperCase() + plan.slice(1)}</option>)}
                      </select>
                    </label>
                    {!lifetime && <label className="grid gap-1.5 text-sm font-medium">Duration in days
                      <Input value={durationDays} onChange={(event) => setDurationDays(event.target.value)} type="number" min={1} max={730} required />
                    </label>}
                    <label className="flex items-center gap-2 self-end rounded-md border p-3 text-sm">
                      <input type="checkbox" checked={lifetime} onChange={(event) => { setLifetime(event.target.checked); setConfirmLifetime(false); }} />
                      Lifetime access (no expiration)
                    </label>
                    {lifetime && <label className="md:col-span-2 flex items-start gap-2 rounded-md border border-amber-500/50 bg-amber-50 p-3 text-sm text-amber-950 dark:bg-amber-950/30 dark:text-amber-100">
                      <input className="mt-1" type="checkbox" checked={confirmLifetime} onChange={(event) => setConfirmLifetime(event.target.checked)} />
                      <span>This grant will not expire automatically; I will revoke it manually if access should end.</span>
                    </label>}
                    <Button className="md:col-span-2" type="submit" disabled={lifetime && !confirmLifetime}>{lifetime ? "Grant lifetime access" : "Apply access"}</Button>
                  </form>
                </td></tr>}
                </Fragment>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
