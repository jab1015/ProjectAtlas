import React, { useState } from 'react';
import { Landmark, FileText, Presentation, Scale, Download, CheckCircle2, Megaphone } from 'lucide-react';
import { Card, SectionTitle, Badge, ProgressBar, StatCard } from './ui';
import { GRANTS, INVESTORS, LEGAL_DOCS, DOCUMENTS } from '@/data/atlasData';

export function FundingView({ spend }: { spend: (n: number, msg: string) => void }) {
  const [built, setBuilt] = useState(false);
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Grants Matched" value="4" sub="$525K total potential" icon={<Landmark size={16} className="text-emerald-500" />} />
        <StatCard label="Investors Matched" value="18" sub="4 high-fit shown below" />
        <StatCard label="Capital Needed" value="$180K" sub="Through first production run" />
        <StatCard label="Runway Modeled" value="14 mo" sub="With SBIR Phase I award" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title="Grant Discovery" sub="Grant Research scans 137 open programs weekly" />
          <div className="space-y-3">
            {GRANTS.map((g) => (
              <div key={g.name} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{g.name}</span>
                  <span className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{g.amount}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-slate-400">
                  <span>Deadline: {g.deadline}</span>
                  <Badge color={g.status === 'Draft in progress' ? 'blue' : g.status === 'Matched' ? 'green' : 'slate'}>{g.status}</Badge>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <ProgressBar value={g.fit} color="bg-emerald-500" />
                  <span className="font-mono text-[10px] text-slate-400">{g.fit}% fit</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Investor Matching" sub="Ranked by thesis fit for consumer hardware" />
          <div className="space-y-3">
            {INVESTORS.map((v) => (
              <div key={v.name} className="flex items-center justify-between rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{v.name}</div>
                  <div className="text-xs text-slate-400">{v.focus} • {v.check}</div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-blue-600 dark:text-blue-400">{v.match}</div>
                  <div className="text-[10px] uppercase text-slate-400">match</div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => { spend(8, 'Pitch deck v4 generation'); setBuilt(true); }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            <Presentation size={15} /> Regenerate Pitch Deck (8 cr)
          </button>
          {built && <p className="mt-2 text-center text-xs text-emerald-600 dark:text-emerald-400">Pitch Deck Generator queued — v4 with updated unit economics arriving shortly.</p>}
        </Card>
      </div>

      <Card className="p-5">
        <SectionTitle title="Financial Projections" sub="3-year model with sensitivity analysis by Financial Planning AI" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { y: 'Year 1', rev: '$412K', units: '4,300 units', margin: '38%' },
            { y: 'Year 2', rev: '$1.9M', units: '19,800 units', margin: '46%' },
            { y: 'Year 3', rev: '$5.4M', units: '55,000 units', margin: '52%' },
          ].map((p) => (
            <div key={p.y} className="rounded-lg bg-slate-50 p-4 text-center dark:bg-slate-800/60">
              <div className="text-xs uppercase tracking-widest text-slate-400">{p.y}</div>
              <div className="mt-1 font-mono text-2xl font-bold text-slate-900 dark:text-white">{p.rev}</div>
              <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.units} • {p.margin} gross margin</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function MarketingView() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Waitlist Target" value="5,000" sub="Pre-launch signups goal" icon={<Megaphone size={16} className="text-blue-500" />} />
        <StatCard label="Launch Readiness" value="34%" sub="On track for Nov 2026" />
        <StatCard label="Brand Assets" value="Complete" sub="Brand book v1 + 6 logo concepts" />
      </div>
      <Card className="p-5">
        <SectionTitle title="Pre-Launch Campaign Plan" sub="Drafted by Marketing AI — approve to activate" />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {[
            { t: 'Waitlist Landing Page', d: 'Conversion-optimized page with a savings-calculator hook.', s: 'Draft ready' },
            { t: 'Creator Seeding', d: '40 micro-influencers in fitness/outdoor niches, product-for-post.', s: 'List built' },
            { t: 'Kickstarter Pre-Launch', d: '30-day teaser to convert waitlist to backers; $60K goal modeled.', s: 'Planned' },
            { t: 'PR & Awards', d: 'CES Innovation Award submission + 12 tech outlet pitches.', s: 'Planned' },
          ].map((c) => (
            <div key={c.t} className="rounded-lg border border-slate-100 p-4 dark:border-slate-800">
              <Badge color={c.s === 'Draft ready' ? 'blue' : c.s === 'List built' ? 'green' : 'slate'}>{c.s}</Badge>
              <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{c.t}</div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{c.d}</p>
            </div>
          ))}
        </div>
      </Card>
      <Card className="p-5">
        <SectionTitle title="Positioning & Messaging" sub="From the Branding department" />
        <blockquote className="rounded-lg border-l-4 border-blue-600 bg-slate-50 p-4 text-sm italic text-slate-700 dark:bg-slate-800/60 dark:text-slate-300">
          "Your positioning statement appears here once the Branding department completes its first messaging pass
          on your active project — crafted from your validation and competitive research."
        </blockquote>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {[
            { a: 'Fitness enthusiasts 25–44', m: 'Never refill a dirty bottle again.' },
            { a: 'Outdoor / travel', m: 'Purify any tap water, anywhere, verified.' },
            { a: 'Corporate wellness', m: 'The perk employees actually use daily.' },
          ].map((s) => (
            <div key={s.a} className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">{s.a}</div>
              <div className="mt-1 text-sm text-slate-700 dark:text-slate-300">{s.m}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function LegalView({ credits, spend, generatedDocs, onGenerated }: { credits: number; spend: (n: number, msg: string) => void; generatedDocs: string[]; onGenerated: (type: string) => void }) {
  const generate = (type: string, cost: number) => {
    if (credits < cost || generatedDocs.includes(type)) return;
    spend(cost, `Legal document generated: ${type}`);
    onGenerated(type);
  };


  return (
    <div className="space-y-6">
      <Card className="p-5">
        <SectionTitle title="Legal Document Generator" sub="Drafted by the Legal Department AI. Every document includes a mandatory human review checkpoint before official use."
          action={<Scale size={18} className="text-slate-400" />} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {LEGAL_DOCS.map((d) => {
            const done = generatedDocs.includes(d.type);
            return (
              <div key={d.type} className="flex flex-col rounded-lg border border-slate-100 p-4 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <FileText size={16} className="text-blue-500" />
                  <span className="font-mono text-[10px] text-slate-400">{d.credits} cr</span>
                </div>
                <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{d.type}</div>
                <p className="mt-1 flex-1 text-xs text-slate-500 dark:text-slate-400">{d.desc}</p>
                {d.review && <Badge color="amber">Human review required</Badge>}
                <button onClick={() => generate(d.type, d.credits)} disabled={done || credits < d.credits}
                  className={`mt-3 rounded-md py-1.5 text-xs font-semibold ${done
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'}`}>
                  {done ? 'Generated — in Documents' : 'Generate'}
                </button>
              </div>
            );
          })}
        </div>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          Atlas is not a law firm. All generated legal documents must be reviewed by a licensed attorney before signing or filing.
        </p>
      </Card>
    </div>
  );
}

export function DocumentsView({ extraDocs }: { extraDocs: string[] }) {
  const [filter, setFilter] = useState('all');
  const kinds = ['all', 'report', 'plan', 'deck', 'draft', 'spec'];
  const docs = DOCUMENTS.filter((d) => filter === 'all' || d.kind === filter);

  return (
    <div className="space-y-6">
      <Card className="p-5">
        <SectionTitle title="Document Library" sub="Everything Atlas has generated for your projects, versioned automatically"
          action={
            <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
              {kinds.map((k) => (
                <button key={k} onClick={() => setFilter(k)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium capitalize ${filter === k ? 'bg-white text-slate-800 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500'}`}>
                  {k}
                </button>
              ))}
            </div>
          } />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {extraDocs.map((name) => (
            <div key={name} className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
              <div className="flex items-center gap-2"><CheckCircle2 size={14} className="text-emerald-500" /><Badge color="green">New</Badge></div>
              <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{name}</div>
              <div className="text-xs text-slate-400">Legal Department • Today</div>
            </div>
          ))}
          {docs.map((d) => (
            <div key={d.name} className="rounded-lg border border-slate-100 p-4 transition hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900">
              <div className="flex items-center justify-between">
                <FileText size={15} className="text-blue-500" />
                <Badge color="slate">{d.kind}</Badge>
              </div>
              <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{d.name}</div>
              <div className="mt-0.5 text-xs text-slate-400">{d.dept} • {d.date} • {d.pages} pages</div>
              <button className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                <Download size={12} /> Download PDF
              </button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
