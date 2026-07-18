import React, { useState } from 'react';
import { X, Folder, History, Clock, LayoutGrid, RotateCcw, Download, CheckCircle2, Circle } from 'lucide-react';
import { Badge, HealthRing, ProgressBar } from './ui';
import { Project, LIFECYCLE_STAGES, PROJECT_FOLDERS } from '@/data/atlasData';
import { getMilestones, getVersionHistory } from '@/lib/projectInsights';

type Tab = 'overview' | 'files' | 'versions' | 'timeline';

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'overview', label: 'Overview', icon: <LayoutGrid size={13} /> },
  { key: 'files', label: 'Files', icon: <Folder size={13} /> },
  { key: 'versions', label: 'Versions', icon: <History size={13} /> },
  { key: 'timeline', label: 'Timeline', icon: <Clock size={13} /> },
];

export default function ProjectDetailModal({ project, onClose }: { project: Project; onClose: () => void }) {
  const [tab, setTab] = useState<Tab>('overview');
  const [toast, setToast] = useState('');
  const completion = Math.round(((project.stageIndex + 1) / LIFECYCLE_STAGES.length) * 100);
  // Derived from THIS project — no static demo data
  const milestones = getMilestones(project);
  const versions = getVersionHistory(project);

  const ping = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="relative">
          <img src={project.image} alt={project.name} className="h-44 w-full object-cover" />
          <button onClick={onClose} className="absolute right-3 top-3 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"><X size={16} /></button>
          <div className="absolute bottom-3 left-4">
            <h2 className="text-xl font-bold text-white drop-shadow">{project.name}</h2>
            <p className="text-xs text-white/80 drop-shadow">{project.tagline}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 border-b border-slate-200 px-4 pt-3 dark:border-slate-800">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 rounded-t-lg px-3 py-2 text-xs font-semibold transition-colors ${
                tab === t.key
                  ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {toast && (
            <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
              {toast}
            </div>
          )}

          {tab === 'overview' && (
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-6">
                <HealthRing value={project.health} size={88} />
                <div className="min-w-[180px] flex-1 space-y-3">
                  <div>
                    <div className="mb-1 flex justify-between text-xs text-slate-500 dark:text-slate-400">
                      <span>Lifecycle completion</span><span className="font-mono">{completion}%</span>
                    </div>
                    <ProgressBar value={completion} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge color="blue">{LIFECYCLE_STAGES[project.stageIndex]}</Badge>
                    <Badge color={project.risk < 30 ? 'green' : project.risk < 45 ? 'amber' : 'red'}>Risk {project.risk}</Badge>
                    <Badge color="slate">Est. {project.estCompletion}</Badge>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-slate-100 p-3.5 dark:border-slate-800">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">Current AI activity</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{project.activity}</div>
                </div>
                <div className="rounded-lg border border-slate-100 p-3.5 dark:border-slate-800">
                  <div className="text-[10px] uppercase tracking-wide text-slate-400">Next milestone</div>
                  <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{project.nextMilestone}</div>
                </div>
              </div>
              <p className="text-xs text-slate-400">Last updated {project.updated} • All departments report into this workspace automatically.</p>
            </div>
          )}

          {tab === 'files' && (
            <div>
              <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
                Atlas created this folder structure automatically and files every generated deliverable into the right place.
              </p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {PROJECT_FOLDERS.map((f) => (
                  <button key={f.name} onClick={() => ping(`Opening ${project.name}/${f.name}/ — ${f.files} files`)}
                    className="flex items-center gap-3 rounded-lg border border-slate-100 p-3 text-left transition hover:border-blue-300 hover:bg-blue-50/50 dark:border-slate-800 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5">
                    <Folder size={18} className="shrink-0 text-blue-500" />
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{f.name}</div>
                      <div className="text-[10px] text-slate-400">{f.files} files • {f.size}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'versions' && (
            <div className="space-y-2">
              {versions.map((v, i) => (
                <div key={i} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{v.version}</span>
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{v.doc}</span>
                      {v.current && <Badge color="green">Current</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{v.change}</p>
                    <p className="text-[10px] text-slate-400">{v.author} • {v.date}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => ping(`Restored ${v.doc} to ${v.version} — a new version was created`)}
                      className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <RotateCcw size={11} /> Restore
                    </button>
                    <button onClick={() => ping(`Downloading ${v.doc} ${v.version}…`)}
                      className="flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                      <Download size={11} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'timeline' && (
            <div className="space-y-5">
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Lifecycle</div>
                <div className="space-y-1.5">
                  {LIFECYCLE_STAGES.map((s, i) => (
                    <div key={s} className="flex items-center gap-2.5">
                      {i <= project.stageIndex
                        ? <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                        : <Circle size={15} className="shrink-0 text-slate-300 dark:text-slate-600" />}
                      <span className={`text-sm ${i <= project.stageIndex ? 'font-semibold text-slate-800 dark:text-slate-200' : 'text-slate-400'}`}>{s}</span>
                      {i === project.stageIndex && <Badge color="blue">In progress</Badge>}
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Upcoming milestones</div>
                <div className="space-y-1.5">
                  {milestones.map((m) => (
                    <div key={m.title} className="flex items-center gap-3 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
                      <span className="w-14 shrink-0 font-mono text-[11px] font-bold text-blue-600 dark:text-blue-400">{m.date}</span>
                      <span className="text-xs text-slate-700 dark:text-slate-300">{m.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
