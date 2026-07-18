import React, { useState } from 'react';
import { Check, X, BarChart3, Brain } from 'lucide-react';
import { Card, SectionTitle, Badge, ProgressBar, StatCard } from './ui';
import { PLANS, CREDIT_COSTS, DEPARTMENTS } from '@/data/atlasData';

export function AnalyticsView() {
  const weekly = [
    { day: 'Mon', tasks: 42 }, { day: 'Tue', tasks: 58 }, { day: 'Wed', tasks: 51 },
    { day: 'Thu', tasks: 67 }, { day: 'Fri', tasks: 73 }, { day: 'Sat', tasks: 39 }, { day: 'Sun', tasks: 44 },
  ];
  const max = Math.max(...weekly.map((w) => w.tasks));
  const topDepts = [...DEPARTMENTS].sort((a, b) => b.tasksToday - a.tasksToday).slice(0, 6);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="AI Tasks (7d)" value="374" sub="+18% vs last week" icon={<BarChart3 size={16} className="text-blue-500" />} />
        <StatCard label="Credits Used (mo)" value="212" sub="Enterprise: unlimited pool" />
        <StatCard label="Docs Generated" value="31" sub="Reports, decks, drafts" />
        <StatCard label="Human Hours Saved" value="~140" sub="Estimated this month" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="AI Tasks Completed — Last 7 Days" />
          <div className="flex h-48 items-end gap-3">
            {weekly.map((w) => (
              <div key={w.day} className="flex flex-1 flex-col items-center gap-2">
                <span className="font-mono text-xs text-slate-400">{w.tasks}</span>
                <div className="w-full rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-500 transition-all" style={{ height: `${(w.tasks / max) * 100}%` }} />
                <span className="text-[10px] uppercase text-slate-400">{w.day}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Most Active Departments Today" />
          <div className="space-y-3.5">
            {topDepts.map((d) => (
              <div key={d.id}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{d.name}</span>
                  <span className="font-mono text-slate-400">{d.tasksToday} tasks</span>
                </div>
                <ProgressBar value={(d.tasksToday / 18) * 100} color="bg-violet-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle title="Launch Readiness Breakdown" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { k: 'Product / Engineering', v: 61 }, { k: 'Patent & Legal', v: 48 },
            { k: 'Manufacturing', v: 37 }, { k: 'Funding', v: 42 },
            { k: 'Marketing', v: 34 }, { k: 'Sales Channels', v: 12 },
            { k: 'Compliance', v: 29 }, { k: 'Overall', v: 38 },
          ].map((s) => (
            <div key={s.k} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-300">{s.k}</span>
                <span className="font-mono text-slate-400">{s.v}%</span>
              </div>
              <div className="mt-2"><ProgressBar value={s.v} color={s.v >= 50 ? 'bg-emerald-500' : 'bg-blue-500'} /></div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function SettingsView({ dark, toggleDark }: { dark: boolean; toggleDark: () => void }) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [smsOptIn, setSmsOptIn] = useState(true);
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'err'>('idle');

  const subscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus('loading');
    try {
      await fetch('https://famous.ai/api/crm/6a598a00382d3920fcf5791a/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name: name || undefined,
          phone: phone || undefined,
          sms_opt_in: smsOptIn === true,
          source: 'newsletter',
          tags: ['newsletter', 'atlas-updates'],
        }),
      });
      setStatus('ok');
      setEmail(''); setName(''); setPhone('');
    } catch {
      setStatus('err');
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Profile & Preferences" />
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-slate-100 p-4 dark:border-slate-800">
              <div>
                <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Appearance</div>
                <div className="text-xs text-slate-400">Currently in {dark ? 'dark' : 'light'} mode</div>
              </div>
              <button onClick={toggleDark} className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700">
                Switch to {dark ? 'Light' : 'Dark'}
              </button>
            </div>
            {[
              { t: 'Plan', d: 'Enterprise — $99/mo', a: 'Manage' },
              { t: 'Autonomous mode', d: 'Departments work continuously in the background', a: 'Enabled' },
              { t: 'Notifications', d: 'Overnight briefing + approval alerts', a: 'Configure' },
            ].map((s) => (
              <div key={s.t} className="flex items-center justify-between rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{s.t}</div>
                  <div className="text-xs text-slate-400">{s.d}</div>
                </div>
                <button className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">{s.a}</button>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <SectionTitle title="Your Inventor Twin" sub="An AI model of you that improves with every interaction" action={<Brain size={18} className="text-violet-500" />} />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { k: 'Risk tolerance', v: 'Moderate — prefers grant funding before equity' },
                { k: 'Budget style', v: 'Lean; approves spend only on critical path' },
                { k: 'Manufacturing', v: 'Prefers Asia MOQ 5K, US assembly considered' },
                { k: 'Communication', v: 'Concise briefings, morning summaries' },
                { k: 'Writing style', v: 'Direct, technical, minimal jargon' },
                { k: 'Goals', v: 'License OR launch DTC by Q4 2026' },
              ].map((t) => (
                <div key={t.k} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <div className="text-[10px] font-semibold uppercase tracking-wide text-violet-500">{t.k}</div>
                  <div className="mt-0.5 text-xs text-slate-600 dark:text-slate-300">{t.v}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <SectionTitle title="Inventor Briefing Newsletter" sub="Grant deadlines, patent-law changes and invention insights, weekly" />
            <form onSubmit={subscribe} className="space-y-3">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number (optional)"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
              <label className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                <input type="checkbox" checked={smsOptIn} onChange={(e) => setSmsOptIn(e.target.checked)} className="mt-0.5" />
                Text me updates. Msg &amp; data rates may apply. Reply STOP to unsubscribe.
              </label>
              <button type="submit" disabled={status === 'loading'}
                className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </button>
              {status === 'ok' && <p className="text-xs text-emerald-600 dark:text-emerald-400">You're subscribed — first briefing arrives Monday.</p>}
              {status === 'err' && <p className="text-xs text-red-500">Something went wrong. Please try again.</p>}
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function PricingView({ currentPlan, onSelect }: { currentPlan: string; onSelect: (id: string) => void }) {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hire an entire invention company</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">From "is this worth pursuing?" to a market-ready product. Cancel anytime.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {PLANS.map((p) => (
          <Card key={p.id} className={`relative flex flex-col p-6 ${p.popular ? 'border-blue-500 ring-1 ring-blue-500' : ''}`}>
            {p.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-3 py-0.5 text-[11px] font-bold text-white">MOST POPULAR</span>
            )}
            <div className="text-sm font-bold uppercase tracking-widest text-slate-400">{p.name}</div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-bold text-slate-900 dark:text-white">${p.price}</span>
              <span className="text-sm text-slate-400">/month</span>
            </div>
            <p className="mt-1 text-sm italic text-slate-500 dark:text-slate-400">"{p.tagline}"</p>
            <div className="mt-2 font-mono text-xs text-blue-600 dark:text-blue-400">{p.credits} credits / month</div>
            <ul className="mt-4 flex-1 space-y-2">
              {p.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Check size={15} className="mt-0.5 shrink-0 text-emerald-500" /> {f}
                </li>
              ))}
              {p.excluded.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-slate-400 line-through">
                  <X size={15} className="mt-0.5 shrink-0 text-slate-300" /> {f}
                </li>
              ))}
            </ul>
            <button onClick={() => onSelect(p.id)}
              className={`mt-6 rounded-lg py-2.5 text-sm font-semibold transition ${currentPlan === p.id
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                : p.popular ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800'}`}>
              {currentPlan === p.id ? 'Current Plan' : p.price === 0 ? 'Start Free' : `Upgrade to ${p.name}`}
            </button>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <SectionTitle title="Credit Costs" sub="Credits are only used for computationally expensive operations. They refresh monthly." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {CREDIT_COSTS.map((c) => (
            <div key={c.op} className="rounded-lg bg-slate-50 p-3 text-center dark:bg-slate-800/60">
              <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{c.credits}</div>
              <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{c.op}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-4 dark:border-slate-800">
          <div>
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">Need more credits?</div>
            <div className="text-xs text-slate-400">Credit packs: 100 for $15 • 500 for $60 • 1,000 for $99</div>
          </div>
          <button className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">Buy Credit Pack</button>
        </div>
      </Card>
    </div>
  );
}
