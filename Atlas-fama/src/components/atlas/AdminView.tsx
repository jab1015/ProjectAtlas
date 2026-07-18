import React, { useEffect, useMemo, useState } from 'react';
import { ShieldCheck, Users, Coins, RefreshCw, Search, Crown, FlaskConical, UserIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { PLANS } from '@/data/atlasData';

interface AdminUser {
  id: string;
  email: string | null;
  name: string | null;
  plan: string;
  credits: number;
  role: string;
  created_at?: string;
}

const ROLE_STYLES: Record<string, string> = {
  admin: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300',
  tester: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  user: 'bg-slate-100 text-slate-600 dark:bg-slate-700/60 dark:text-slate-300',
};

const ROLE_ICONS: Record<string, React.ReactNode> = {
  admin: <Crown size={11} />,
  tester: <FlaskConical size={11} />,
  user: <UserIcon size={11} />,
};

export default function AdminView() {
  const { profile, isAdmin } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, name, plan, credits, role, created_at')
      .order('created_at', { ascending: false });
    if (!error && data) setUsers(data as AdminUser[]);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const patchUser = async (id: string, patch: Partial<AdminUser>, note: string) => {
    setSavingId(id);
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...patch } : u)));
    const { error } = await supabase.from('profiles').update(patch).eq('id', id);
    setSavingId(null);
    setMessage(error ? `Update failed: ${error.message}` : note);
    setTimeout(() => setMessage(''), 3000);
  };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return users.filter(
      (u) => !q || (u.email || '').toLowerCase().includes(q) || (u.name || '').toLowerCase().includes(q) || u.role.includes(q) || u.plan.includes(q),
    );
  }, [users, query]);

  const stats = useMemo(() => ({
    total: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    testers: users.filter((u) => u.role === 'tester').length,
    credits: users.reduce((s, u) => s + (u.credits || 0), 0),
  }), [users]);

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900/60">
        <ShieldCheck size={36} className="mx-auto text-slate-300 dark:text-slate-600" />
        <h2 className="mt-3 text-lg font-bold">Administrator access required</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Sign in with an administrator account to manage users, plans, credits and roles.
          Use <span className="font-mono font-semibold">admin@projectatlas.ai</span> to access this panel.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: 'Total Users', value: stats.total, icon: <Users size={16} className="text-blue-500" /> },
          { label: 'Administrators', value: stats.admins, icon: <Crown size={16} className="text-purple-500" /> },
          { label: 'Testers', value: stats.testers, icon: <FlaskConical size={16} className="text-amber-500" /> },
          { label: 'Credits in circulation', value: stats.credits.toLocaleString(), icon: <Coins size={16} className="text-emerald-500" /> },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
              {s.label} {s.icon}
            </div>
            <div className="mt-1.5 text-2xl font-bold tracking-tight">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Signed-in admin notice */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800 dark:border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-200">
        <ShieldCheck size={15} />
        Signed in as <span className="font-semibold">{profile?.name || profile?.email}</span> (administrator). Changes apply immediately and are audited via row timestamps.
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/60">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search users, roles, plans…"
              className="w-64 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
          <div className="flex items-center gap-3">
            {message && <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{message}</span>}
            <button onClick={load} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="px-4 py-2.5 font-medium">User</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
                <th className="px-4 py-2.5 font-medium">Plan</th>
                <th className="px-4 py-2.5 font-medium">Credits</th>
                <th className="px-4 py-2.5 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">Loading users…</td></tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No users match your search.</td></tr>
              )}
              {!loading && filtered.map((u) => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 dark:border-slate-800/60">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900 dark:text-white">{u.name || '—'}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${ROLE_STYLES[u.role] || ROLE_STYLES.user}`}>
                      {ROLE_ICONS[u.role] || ROLE_ICONS.user} {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={u.plan}
                      onChange={(e) => patchUser(u.id, { plan: e.target.value }, `Plan updated for ${u.email}`)}
                      disabled={savingId === u.id}
                      className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium capitalize outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    >
                      {PLANS.map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 font-mono font-semibold text-blue-600 dark:text-blue-400">{u.credits}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <button
                        onClick={() => patchUser(u.id, { credits: u.credits + 100 }, `+100 credits granted to ${u.email}`)}
                        disabled={savingId === u.id}
                        className="rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
                      >
                        +100 credits
                      </button>
                      <button
                        onClick={() => {
                          const planCredits = PLANS.find((p) => p.id === u.plan)?.credits ?? 20;
                          patchUser(u.id, { credits: planCredits }, `Credits reset to plan allowance for ${u.email}`);
                        }}
                        disabled={savingId === u.id}
                        className="rounded-md border border-slate-200 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                      >
                        Reset to plan
                      </button>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => patchUser(u.id, { role: u.role === 'tester' ? 'user' : 'tester' }, `Role updated for ${u.email}`)}
                          disabled={savingId === u.id}
                          className="rounded-md border border-amber-300 px-2 py-1 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/10"
                        >
                          {u.role === 'tester' ? 'Revoke tester' : 'Make tester'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Test accounts reference */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900/60">
        <h3 className="text-sm font-bold">Built-in test accounts</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use these seeded accounts to test the platform end-to-end.</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-500/20 dark:bg-purple-500/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-purple-700 dark:text-purple-300"><Crown size={12} /> Administrator</div>
            <div className="mt-2 space-y-1 font-mono text-xs text-slate-700 dark:text-slate-300">
              <div>admin@projectatlas.ai</div>
              <div>AtlasAdmin2026!</div>
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
            <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 dark:text-amber-300"><FlaskConical size={12} /> Tester</div>
            <div className="mt-2 space-y-1 font-mono text-xs text-slate-700 dark:text-slate-300">
              <div>tester@projectatlas.ai</div>
              <div>AtlasTester2026!</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
