import React, { useState } from 'react';
import { History, Bell, TrendingDown, ShieldCheck, Sparkles } from 'lucide-react';
import { Card, SectionTitle, Badge } from './ui';
import { Project, DecisionCategory } from '@/data/atlasData';
import { getDecisionHistory, getExecNotifications, ExecNotification } from '@/lib/projectInsights';

const FILTERS: ('All' | DecisionCategory)[] = ['All', 'Engineering', 'Patent', 'Manufacturing', 'Funding', 'Marketing', 'Legal', 'Operations', 'Research'];

const CATEGORY_COLOR: Record<string, string> = {
  Engineering: 'amber', Patent: 'violet', Manufacturing: 'slate', Funding: 'green',
  Marketing: 'blue', Legal: 'red', Operations: 'slate', Research: 'blue',
};

function severityIcon(n: ExecNotification) {
  if (n.severity === 'good') return <Sparkles size={15} className="mt-0.5 shrink-0 text-emerald-500" />;
  if (n.severity === 'warning') return <TrendingDown size={15} className="mt-0.5 shrink-0 text-amber-500" />;
  return <ShieldCheck size={15} className="mt-0.5 shrink-0 text-blue-500" />;
}

export function ExecutiveNotifications({ project }: { project: Project }) {
  const notifications = getExecNotifications(project);
  return (
    <Card className="p-5">
      <SectionTitle
        title="Executive Notifications"
        sub="Only meaningful events — trivial updates are filtered out"
        action={<Bell size={16} className="text-slate-400" />}
      />
      <div className="space-y-3">
        {notifications.map((n, i) => (
          <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
            {severityIcon(n)}
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{n.title}</span>
                <Badge color={CATEGORY_COLOR[n.category] || 'slate'}>{n.category}</Badge>
                <span className="font-mono text-[10px] text-slate-400">{n.time}</span>
              </div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{n.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

export function DecisionHistoryPanel({ project }: { project: Project }) {
  const [filter, setFilter] = useState<'All' | DecisionCategory>('All');
  const history = getDecisionHistory(project);
  const filtered = filter === 'All' ? history : history.filter((h) => h.category === filter);

  return (
    <Card className="p-5">
      <SectionTitle
        title="Decision History"
        sub={`Complete, documented record of every decision Atlas made for ${project.name}`}
        action={<History size={16} className="text-slate-400" />}
      />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1 text-[11px] font-semibold transition ${
              filter === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {f}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length === 0 && (
          <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
            No {filter} decisions recorded yet for {project.name}.
          </p>
        )}
        {filtered.map((h, i) => (
          <div key={i} className="rounded-lg border border-slate-100 p-3.5 dark:border-slate-800">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] uppercase text-slate-400">{h.date}</span>
                <Badge color={CATEGORY_COLOR[h.category] || 'slate'}>{h.category}</Badge>
              </div>
              <span className="font-mono text-[11px] font-bold text-emerald-600 dark:text-emerald-400">{h.confidence}% confidence</span>
            </div>
            <div className="mt-1.5 text-sm font-semibold text-slate-800 dark:text-slate-200">{h.decision}</div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400"><span className="font-semibold">Reasoning:</span> {h.reasoning}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
              <span className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-400">Result:</span> {h.result}</span>
              <span className="text-slate-600 dark:text-slate-300"><span className="font-semibold text-slate-400">Impact:</span> {h.impact}</span>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {h.departments.map((d) => (
                <span key={d} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">{d}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
