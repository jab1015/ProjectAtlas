"use client";

import { FormEvent, useState } from "react";
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
  const [email, setEmail] = useState("");
  const [planKey, setPlanKey] = useState<(typeof PLANS)[number]>("pro");
  const [durationDays, setDurationDays] = useState("30");
  const [reason, setReason] = useState("Beta tester access");
  const [message, setMessage] = useState("");
  const accounts = useQuery(api.betaAccess.listAccounts, { search: search || undefined });
  const grantAccess = useMutation(api.betaAccess.grantComplimentaryAccess);
  const revokeAccess = useMutation(api.betaAccess.revokeComplimentaryAccess);
  const adjustCredits = useMutation(api.betaAccess.adjustCredits);

  async function submitGrant(event: FormEvent) {
    event.preventDefault();
    setMessage("");
    const days = Number(durationDays);
    if (!Number.isInteger(days) || days < 1 || days > 730) {
      setMessage("Enter an access period from 1 to 730 days.");
      return;
    }
    try {
      await grantAccess({
        email,
        planKey,
        expiresAt: Date.now() + days * 24 * 60 * 60 * 1000,
        reason,
      });
      setMessage(`Complimentary ${planKey} access granted to ${email}.`);
      setEmail("");
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
        <h2 className="font-semibold">Grant complimentary access</h2>
        <p className="mt-1 text-sm text-muted-foreground">This creates a dated override. It does not change the customer&apos;s base plan or create lifetime free access.</p>
        <form className="mt-4 grid gap-3 md:grid-cols-4" onSubmit={submitGrant}>
          <Input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="beta tester email" required type="email" />
          <select className="h-10 rounded-md border bg-background px-3 text-sm" value={planKey} onChange={(event) => setPlanKey(event.target.value as (typeof PLANS)[number])}>
            {PLANS.map((plan) => <option key={plan} value={plan}>{plan[0].toUpperCase() + plan.slice(1)}</option>)}
          </select>
          <Input value={durationDays} onChange={(event) => setDurationDays(event.target.value)} placeholder="days" type="number" min={1} max={730} required />
          <Button type="submit">Grant access</Button>
          <Input className="md:col-span-4" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="reason for audit record" required />
        </form>
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
              <thead><tr className="border-b bg-muted/50"><th className="px-3 py-2 text-left">Account</th><th className="px-3 py-2 text-left">Access</th><th className="px-3 py-2 text-right">Credits</th><th className="px-3 py-2 text-right">Actions</th></tr></thead>
              <tbody>{accounts.map((account) => (
                <tr className="border-b last:border-0" key={String(account.userId)}>
                  <td className="px-3 py-3"><div className="font-medium">{account.name || account.email}</div><div className="text-muted-foreground">{account.email}</div></td>
                  <td className="px-3 py-3"><div>{account.planKey}</div>{account.override && <div className="text-xs text-muted-foreground">until {formatDate(account.override.expiresAt)} · {account.override.reason}</div>}</td>
                  <td className="px-3 py-3 text-right font-medium">{account.creditBalance}</td>
                  <td className="space-x-2 whitespace-nowrap px-3 py-3 text-right">
                    {account.organizationId && <><Button size="sm" variant="outline" onClick={() => void changeCredits(String(account.organizationId), 100)}>+100</Button><Button size="sm" variant="outline" onClick={() => void changeCredits(String(account.organizationId), -100)} disabled={account.creditBalance < 100}>-100</Button></>}
                    {account.override && <Button size="sm" variant="destructive" onClick={async () => { const why = window.prompt("Reason for revocation:", "Beta period ended"); if (why?.trim()) await revokeAccess({ overrideId: account.override!._id, reason: why }); }}>Revoke</Button>}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
