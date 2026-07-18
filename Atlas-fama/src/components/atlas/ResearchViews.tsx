import React, { useState } from 'react';
import { Search, ShieldCheck, Eye, TrendingUp, Target, Lightbulb } from 'lucide-react';
import { Card, SectionTitle, Badge, ProgressBar, StatCard } from './ui';
import { useProjects } from '@/hooks/useProjects';
import { getMarketResearch, getPatentSnapshot, getPrimarySegment } from '@/lib/projectInsights';

function NoProjectCard({ text }: { text: string }) {
  return (
    <Card className="p-8 text-center">
      <Lightbulb size={28} className="mx-auto text-amber-400" />
      <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">No project yet</h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">{text}</p>
    </Card>
  );
}

export function ResearchView() {
  const { projects, loaded } = useProjects();
  const project = projects.find((p) => !p.archived) ?? projects[0] ?? null;
  const [filter, setFilter] = useState('');

  if (!project) {
    return loaded
      ? <NoProjectCard text="Research is generated from your real inventions. Create a project and Atlas begins market intelligence, competitor tracking and customer research automatically." />
      : null;
  }

  const research = getMarketResearch(project);
  const seg = getPrimarySegment(project);
  const list = research.competitors.filter((c) => c.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="TAM" value={research.stats.tam} sub={research.stats.tamSub} icon={<TrendingUp size={16} className="text-blue-500" />} />
        <StatCard label="SAM" value={research.stats.sam} sub={research.stats.samSub} />
        <StatCard label="SOM (yr 3)" value={research.stats.som} sub={research.stats.somSub} />
        <StatCard label="Market CAGR" value={research.stats.cagr} sub={research.stats.cagrSub} />
      </div>

      <Card className="p-5">
        <SectionTitle title="Competitive Intelligence" sub={`6 closest alternatives to ${project.name} — identities resolve as the Competitive Intelligence scan completes`}
          action={
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Filter competitors"
                className="rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
            </div>
          } />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400 dark:border-slate-800">
                <th className="py-2 pr-4">Competitor</th><th className="py-2 pr-4">Price</th><th className="py-2 pr-4">Share</th>
                <th className="py-2 pr-4">Strength</th><th className="py-2 pr-4">Weakness</th><th className="py-2">Threat</th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.name} className="border-b border-slate-50 dark:border-slate-800/60">
                  <td className="py-3 pr-4 font-semibold text-slate-800 dark:text-slate-200">{c.name}</td>
                  <td className="py-3 pr-4 font-mono text-slate-600 dark:text-slate-300">{c.price}</td>
                  <td className="py-3 pr-4 text-slate-600 dark:text-slate-300">{c.share}</td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{c.strength}</td>
                  <td className="py-3 pr-4 text-slate-500 dark:text-slate-400">{c.weakness}</td>
                  <td className="py-3 w-32">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={c.threat} color={c.threat > 60 ? 'bg-red-500' : c.threat > 40 ? 'bg-amber-500' : 'bg-emerald-500'} />
                      <span className="font-mono text-xs text-slate-400">{c.threat}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <SectionTitle title={`SWOT Analysis — ${project.name}`} action={<Target size={16} className="text-slate-400" />} />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {research.swot.map((q) => (
              <div key={q.t} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <Badge color={q.c}>{q.t}</Badge>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
                  {q.items.map((it) => <li key={it} className="flex gap-1.5"><span className="text-slate-300">•</span>{it}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <SectionTitle title="Customer Research" sub={`${seg} segment — validation survey fielding, evidence auto-collecting`} />
          <div className="space-y-4">
            {research.customerSignals.map((s) => (
              <div key={s.label}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-300">{s.label}</span>
                  <span className="font-mono text-slate-400">{s.v}%</span>
                </div>
                <ProgressBar value={s.v} color="bg-cyan-500" />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export function PatentsView({ credits, spend }: { credits: number; spend: (n: number, msg: string) => void }) {
  const { projects, loaded } = useProjects();
  const project = projects.find((p) => !p.archived) ?? projects[0] ?? null;
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);

  const runSearch = () => {
    if (!query.trim()) return;
    spend(2, `Patent search: "${query}"`);
    setSearched(true);
  };

  if (!project) {
    return loaded
      ? <NoProjectCard text="Patent intelligence is generated from your real inventions. Create a project and Atlas begins prior-art scanning and claim-space monitoring automatically." />
      : null;
  }

  const snapshot = getPatentSnapshot(project);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Patentability Score" value={`${snapshot.score}/100`} sub={`Novelty signal for ${project.name}'s core mechanism`} icon={<ShieldCheck size={16} className="text-emerald-500" />} />
        <StatCard label="Conflicts Found" value={snapshot.conflicts} sub="Claim-distance analysis — monitored" />
        <StatCard label="Patents Watched" value={String(snapshot.watched)} sub="Weekly monitoring active" icon={<Eye size={16} className="text-blue-500" />} />
      </div>

      <Card className="p-5">
        <SectionTitle title="Patent Search" sub="Powered by the Patent Research department • 2 credits per search" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && runSearch()}
            placeholder={`e.g. ${project.tagline || `${project.name} core mechanism`}`}
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
          <button onClick={runSearch} disabled={credits < 2}
            className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50">
            Search (2 cr)
          </button>
        </div>
        {searched && <p className="mt-3 text-xs text-emerald-600 dark:text-emerald-400">Search complete — 5 relevant results, claim-distance analysis below.</p>}

        <div className="mt-5 space-y-3">
          {snapshot.results.map((p) => (
            <div key={p.number} className="flex flex-col gap-2 rounded-lg border border-slate-100 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-blue-600 dark:text-blue-400">{p.number}</span>
                  <Badge color={p.risk === 'medium' ? 'amber' : 'green'}>{p.risk} risk</Badge>
                </div>
                <div className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{p.title}</div>
                <div className="text-xs text-slate-400">Assignee: {p.assignee}</div>
              </div>
              <div className="w-full sm:w-40">
                <div className="mb-1 flex justify-between text-[10px] uppercase tracking-wide text-slate-400">
                  <span>Similarity</span><span className="font-mono">{p.similarity}%</span>
                </div>
                <ProgressBar value={p.similarity} color={p.similarity > 40 ? 'bg-amber-500' : 'bg-emerald-500'} />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <SectionTitle title="Patent Strategy" sub="Drafted by Patent Strategy AI — attorney review required before any filing" />
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { t: 'Provisional Filing', d: `File provisional to lock ${project.name}'s priority date while engineering finalizes.`, s: 'Recommended' },
            { t: 'Claim Architecture', d: 'Independent claims centered on the core mechanism plus dependent claims for key embodiments.', s: 'Draft ready' },
            { t: 'International (PCT)', d: 'PCT decision deferred to month 10; priority markets under evaluation.', s: 'Monitoring' },
          ].map((s) => (
            <div key={s.t} className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
              <Badge color="violet">{s.s}</Badge>
              <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">{s.t}</div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.d}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
          Legal checkpoint: Atlas prepares all patent materials, but a licensed patent attorney must review and file official documents.
        </p>
      </Card>
    </div>
  );
}
