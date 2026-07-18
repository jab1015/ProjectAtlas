import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Clock, Zap, FileCheck2, TrendingUp, Lightbulb } from 'lucide-react';
import { Card, SectionTitle, Badge, ProgressBar, HealthRing } from './ui';
import { LIFECYCLE_STAGES, ViewKey } from '@/data/atlasData';
import { useProjects } from '@/hooks/useProjects';
import {
  getDiscoveries, getRunningTasks, getApprovals, getRisks, getRecommendations, getMilestones,
  getAutonomousDecisions,
} from '@/lib/projectInsights';


const typeColor: Record<string, string> = {
  patent: 'violet', market: 'blue', funding: 'green', engineering: 'amber', manufacturing: 'slate',
};

interface Props {
  approvedIds: string[];
  onApprove: (id: string) => void;
  setView: (v: ViewKey) => void;
  userName: string;
}

export default function DashboardView({ approvedIds, onApprove, setView, userName }: Props) {
  const { projects, loaded } = useProjects();

  // The user's most recent active (non-archived) project — real data only
  const project = projects.find((p) => !p.archived) ?? projects[0] ?? null;
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Everything below is derived from the REAL active project (no demo data)
  const discoveries = project ? getDiscoveries(project) : [];
  const runningTasks = project ? getRunningTasks(project) : [];
  const approvals = project ? getApprovals(project) : [];
  const risks = project ? getRisks(project) : [];
  const recommendations = project ? getRecommendations(project) : [];
  const milestones = project ? getMilestones(project) : [];
  const autonomousDecisions = project ? getAutonomousDecisions(project) : [];
  const pending = approvals.filter((a) => !approvedIds.includes(a.id));


  return (
    <div className="space-y-6">
      {/* Morning briefing hero */}
      <div className="rounded-2xl bg-gradient-to-br from-[#0A1628] via-[#0d2240] to-[#0A1628] p-6 text-white shadow-xl sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{greeting}, {userName}</h1>
            {project ? (
              <p className="mt-1 text-sm text-slate-300">
                Your departments are working on <span className="font-semibold text-cyan-300">{project.name}</span> —
                {' '}<span className="font-semibold text-cyan-300">{discoveries.length} overnight findings</span>.{' '}
                {pending.length > 0 ? (
                  <><span className="font-semibold text-amber-300">{pending.length} decision{pending.length === 1 ? '' : 's'}</span> genuinely need{pending.length === 1 ? 's' : ''} you (money, legal, or physical).</>
                ) : (
                  <>No action is required from you today — Atlas continues autonomous execution.</>
                )}
              </p>

            ) : (
              <p className="mt-1 text-sm text-slate-300">
                No active projects yet — capture your first invention idea and your AI departments get to work.
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              {project ? (
                <>
                  <button onClick={() => setView('projects')} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">
                    Open {project.name}
                  </button>
                  <button onClick={() => setView('decisions')} className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold hover:bg-white/10">
                    Review Decisions
                  </button>
                </>
              ) : (
                <button onClick={() => setView('projects')} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold hover:bg-blue-500">
                  Create your first invention
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-6">
            {!loaded ? (
              <div className="text-sm text-slate-400">Loading your projects…</div>
            ) : project ? (
              <>
                <div className="flex items-center gap-4">
                  <img src={project.image} alt={project.name} className="hidden h-24 w-24 rounded-xl object-cover ring-2 ring-white/10 sm:block" />
                  <div>
                    <div className="text-xs uppercase tracking-widest text-slate-400">Active Project</div>
                    <div className="text-lg font-bold">{project.name}</div>
                    <div className="text-xs text-slate-300">{project.tagline}</div>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-400">
                      <Clock size={12} /> Est. launch {project.estCompletion}
                    </div>
                  </div>
                </div>
                <HealthRing value={project.health} />
              </>
            ) : (
              <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4">
                <Lightbulb size={28} className="shrink-0 text-amber-400" />
                <div>
                  <div className="text-sm font-bold">Your workspace is ready</div>
                  <p className="mt-0.5 text-xs text-slate-300">Every panel on this dashboard fills in from your real project data.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lifecycle timeline */}
      {project && (
        <Card className="p-5">
          <SectionTitle title="Invention Lifecycle" sub={`${project.name} — current stage: ${LIFECYCLE_STAGES[project.stageIndex]} (${project.stageIndex + 1} of ${LIFECYCLE_STAGES.length})`} />
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-[900px] items-center">
              {LIFECYCLE_STAGES.map((stage, i) => (
                <div key={stage} className="flex flex-1 flex-col items-center">
                  <div className="flex w-full items-center">
                    <div className={`h-0.5 flex-1 ${i === 0 ? 'opacity-0' : i <= project.stageIndex ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                    <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                      i < project.stageIndex ? 'bg-blue-600 text-white'
                      : i === project.stageIndex ? 'bg-white text-blue-600 ring-2 ring-blue-600 dark:bg-slate-900'
                      : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                      {i < project.stageIndex ? <CheckCircle2 size={14} /> : i + 1}
                    </div>
                    <div className={`h-0.5 flex-1 ${i === LIFECYCLE_STAGES.length - 1 ? 'opacity-0' : i < project.stageIndex ? 'bg-blue-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                  </div>
                  <span className={`mt-2 text-center text-[10px] font-medium leading-tight ${i === project.stageIndex ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`}>{stage}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      {project && (
        <div className="grid gap-6 xl:grid-cols-3">
          {/* Overnight discoveries — generated from the active project */}
          <Card className="p-5 xl:col-span-2">
            <SectionTitle title="Overnight AI Discoveries" sub={`What your departments found for ${project.name} while you were away`}
              action={<Badge color="green">{discoveries.length} new</Badge>} />
            <div className="space-y-3">
              {discoveries.map((d, i) => (
                <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 transition hover:border-blue-200 dark:border-slate-800 dark:hover:border-blue-900">
                  <Zap size={15} className="mt-0.5 shrink-0 text-blue-500" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color={typeColor[d.type]}>{d.dept}</Badge>
                      <span className="font-mono text-[10px] text-slate-400">{d.time}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{d.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <div className="space-y-6">
            {/* Approvals — only money / legal / launch / physical ever appear here */}
            <Card className="p-5">
              <SectionTitle title="Waiting for You" sub="Only money, legal, launch or physical decisions" action={<Badge color="amber">{pending.length}</Badge>} />
              <div className="space-y-3">
                {pending.length === 0 && (
                  <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">
                    No approvals needed today. Atlas is executing autonomously and will only interrupt you when money, legal documents, or a physical evaluation require a human.
                  </p>
                )}
                {pending.map((a) => (
                  <div key={a.id} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.title}</span>
                      <Badge color="slate">{a.dept}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{a.detail}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <button onClick={() => onApprove(a.id)} className="flex items-center gap-1 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                        <FileCheck2 size={12} /> {a.action}
                      </button>
                      <button className="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
                        {a.secondary}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Autonomous decisions — executed first, reported afterward */}
            <Card className="p-5">
              <SectionTitle title="Decided Autonomously" sub="Executed without asking — documented and reversible on new evidence" action={<Zap size={16} className="text-emerald-500" />} />
              <div className="space-y-3">
                {autonomousDecisions.map((a, i) => (
                  <div key={i} className="rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge color="green">{a.dept}</Badge>
                      <span className="font-mono text-[10px] text-slate-400">{a.time}</span>
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">{a.decision}</div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{a.rationale}</p>
                  </div>
                ))}
              </div>
            </Card>


            {/* Risk alerts */}
            <Card className="p-5">
              <SectionTitle title="Risk Alerts" />
              <div className="space-y-3">
                {risks.map((r, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <AlertTriangle size={15} className={`mt-0.5 shrink-0 ${r.severity === 'high' ? 'text-red-500' : r.severity === 'medium' ? 'text-amber-500' : 'text-slate-400'}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.title}</span>
                        <Badge color={r.severity === 'high' ? 'red' : r.severity === 'medium' ? 'amber' : 'slate'}>{r.severity}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{r.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}

      {project && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Running tasks */}
          <Card className="p-5">
            <SectionTitle title="Tasks Running Now" action={<span className="flex items-center gap-1.5 text-xs text-emerald-600"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />live</span>} />
            <div className="space-y-4">
              {runningTasks.map((t, i) => (
                <div key={i}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-700 dark:text-slate-300">{t.task}</span>
                    <span className="font-mono text-slate-400">{t.progress}%</span>
                  </div>
                  <ProgressBar value={t.progress} />
                  <div className="mt-1 text-[10px] uppercase tracking-wide text-slate-400">{t.dept}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Recommendations */}
          <Card className="p-5">
            <SectionTitle title="Today's Recommendations" sub="Prioritized by the CEO AI" />
            <div className="space-y-3">
              {recommendations.map((r) => (
                <div key={r.priority} className="flex items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{r.priority}</span>
                  <div>
                    <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">{r.action}</div>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{r.why}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Milestones */}
          <Card className="p-5">
            <SectionTitle title="Upcoming Milestones" action={<TrendingUp size={16} className="text-slate-400" />} />
            <div className="space-y-0">
              {milestones.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="h-2.5 w-2.5 rounded-full border-2 border-blue-500 bg-white dark:bg-slate-900" />
                    {i < milestones.length - 1 && <div className="w-px flex-1 bg-slate-200 dark:bg-slate-700" />}
                  </div>
                  <div className="pb-5">
                    <div className="font-mono text-[10px] uppercase text-slate-400">{m.date}</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{m.title}</div>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setView('analytics')} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              View full timeline <ArrowRight size={12} />
            </button>
          </Card>
        </div>
      )}

      {loaded && !project && (
        <Card className="p-8 text-center">
          <Lightbulb size={32} className="mx-auto text-amber-400" />
          <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">Nothing here yet — and that's honest</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            This dashboard only shows real data from your projects. Create your first invention and the discoveries,
            approvals, risks and milestones panels will fill in automatically.
          </p>
          <button onClick={() => setView('projects')} className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Create your first invention
          </button>
        </Card>
      )}
    </div>
  );
}
