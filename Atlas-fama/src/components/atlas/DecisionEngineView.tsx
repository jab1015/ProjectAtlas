import React, { useState, useEffect, useRef } from 'react';
import {
  Brain, CheckCircle2, AlertTriangle, Loader2, Scale, DollarSign, Wrench, Gavel,
  ShieldAlert, Lightbulb, Clock, TrendingUp, Zap, RefreshCcw, Rocket, FileSignature,
} from 'lucide-react';
import { Card, SectionTitle, Badge, StatCard, ProgressBar } from './ui';
import { DecisionRecord } from '@/data/atlasData';

import { useProjects } from '@/hooks/useProjects';
import { getDecisions, getExecutiveSummary, getStageProgress, getAutonomousDecisions } from '@/lib/projectInsights';
import { DecisionHistoryPanel, ExecutiveNotifications } from './DecisionHistory';

const CATEGORY_COLOR: Record<string, string> = {
  Engineering: 'amber', Patent: 'violet', Manufacturing: 'slate', Funding: 'green',
  Marketing: 'blue', Legal: 'red', Operations: 'slate', Research: 'blue',
};

const AUTONOMOUS_ITEMS = [
  'Selecting target customer segments', 'Creating validation surveys', 'Choosing competitors to analyze',
  'Determining research order', 'Patent search classifications', 'Prioritizing engineering tasks',
  'Creating milestones', 'Choosing suppliers to investigate', 'Running cost analyses',
  'Drafting business documents', 'Generating marketing strategies', 'Updating timelines',
];

const APPROVAL_ITEMS = [
  { icon: <DollarSign size={13} />, label: 'Spending money' },
  { icon: <Gavel size={13} />, label: 'Filing legal documents' },
  { icon: <Rocket size={13} />, label: 'Public product launches' },
  { icon: <FileSignature size={13} />, label: 'Licensing agreements' },
  { icon: <Scale size={13} />, label: 'Preference-based product visions' },
  { icon: <Wrench size={13} />, label: 'Physical prototype evaluation' },
  { icon: <ShieldAlert size={13} />, label: 'Changing the invention\u2019s purpose' },
];

function ImpactGrid({ d }: { d: DecisionRecord }) {
  if (!d.impact) return null;
  const cells = [
    { label: 'Confidence', value: `${d.confidence}%` },
    { label: 'Timeline', value: d.impact.timeline },
    { label: 'Cost', value: d.impact.cost },
    { label: 'Risk', value: d.impact.riskReduction },
  ];
  return (
    <div className="mt-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {cells.map((c) => (
          <div key={c.label} className="rounded-lg bg-white/70 p-2.5 dark:bg-slate-900/50">
            <div className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">{c.label}</div>
            <div className="mt-0.5 text-xs font-bold text-slate-800 dark:text-slate-200">{c.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Departments updated:</span>
        {d.impact.departments.map((dep) => (
          <span key={dep} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-slate-800 dark:text-slate-400">{dep}</span>
        ))}
      </div>
    </div>
  );
}

function DecisionCard({ d, onApprove, approved }: { d: DecisionRecord; onApprove: (id: string) => void; approved: boolean }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-bold text-slate-900 dark:text-white">{d.topic}</span>
            <Badge color="blue">{d.project}</Badge>
            <Badge color={CATEGORY_COLOR[d.category] || 'slate'}>{d.category}</Badge>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge color={d.status === 'decided' ? 'green' : d.status === 'in-progress' ? 'amber' : 'red'}>
              {d.status === 'decided' ? 'Decision Complete' : d.status === 'in-progress' ? 'Decision In Progress' : 'Needs Your Approval'}
            </Badge>
            {d.decidedAt && <span className="text-[10px] text-slate-400">{d.decidedAt}</span>}
            {d.reversal && <Badge color="violet">Revised on new evidence</Badge>}
          </div>
        </div>
        {d.status === 'decided' && (
          <div className="text-right">
            <div className="text-[10px] uppercase tracking-wide text-slate-400">Overall confidence</div>
            <div className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">{d.confidence}%</div>
          </div>
        )}
      </div>

      {/* Department inputs — only shown once a decision is complete or escalated.
          Internal deliberation is never exposed while in progress. */}
      {d.status !== 'in-progress' && d.inputs.length > 0 && (
        <div className="mt-4 space-y-2">
          {d.inputs.map((inp) => (
            <div key={inp.dept} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2 dark:border-slate-800">
              <div className="min-w-0">
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{inp.dept}</span>
                <p className="text-xs text-slate-500 dark:text-slate-400">{inp.recommendation}</p>
              </div>
              <span className="font-mono text-[11px] text-slate-400">{inp.confidence}%</span>
            </div>
          ))}
        </div>
      )}

      {/* Reversal block */}
      {d.reversal && (
        <div className="mt-4 rounded-lg border border-violet-200 bg-violet-50 p-4 dark:border-violet-500/20 dark:bg-violet-500/10">
          <div className="flex items-center gap-2 text-sm font-bold text-violet-800 dark:text-violet-300">
            <RefreshCcw size={14} /> Decision reopened on new evidence
          </div>
          <div className="mt-2 space-y-1.5 text-xs text-violet-900/80 dark:text-violet-200/80">
            <p><span className="font-semibold">Previous decision:</span> {d.reversal.previousDecision}</p>
            <p><span className="font-semibold">Reason for reopening:</span> {d.reversal.reasonForReopening}</p>
            <p><span className="font-semibold">New evidence:</span> {d.reversal.newEvidence}</p>
          </div>
        </div>
      )}

      {/* Outcome */}
      {d.status === 'decided' && (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
            <CheckCircle2 size={15} /> {d.reversal ? 'Revised decision' : 'Atlas decided'}: {d.decision}
          </div>
          <p className="mt-1.5 text-xs text-emerald-900/80 dark:text-emerald-200/80"><span className="font-semibold">Reasoning:</span> {d.reasoning}</p>
          <p className="mt-1.5 text-xs text-emerald-900/80 dark:text-emerald-200/80"><span className="font-semibold">Next step:</span> {d.nextStep}</p>
          <ImpactGrid d={d} />
        </div>
      )}

      {d.status === 'in-progress' && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/10">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
            <Loader2 size={15} className="animate-spin" /> Decision In Progress
          </div>
          <p className="mt-1.5 text-xs text-amber-900/80 dark:text-amber-200/80">
            Atlas is evaluating engineering, patent, manufacturing, legal, financial, and market evidence.
          </p>
          <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-amber-900 dark:text-amber-200">
            <Clock size={13} /> Estimated completion: {d.etaMinutes} minutes
          </div>
          <p className="mt-2 text-[11px] text-amber-800/70 dark:text-amber-200/60">
            No action needed — Atlas finalizes automatically once enough evidence exists and records the outcome in the decision history.
          </p>
        </div>
      )}

      {d.status === 'escalated' && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-500/20 dark:bg-red-500/10">
          <div className="flex items-center gap-2 text-sm font-bold text-red-800 dark:text-red-300">
            <ShieldAlert size={15} /> Your approval required: {d.decision}
          </div>
          <p className="mt-1.5 text-xs text-red-900/80 dark:text-red-200/80"><span className="font-semibold">Why Atlas can't decide alone:</span> {d.escalationReason}</p>
          <p className="mt-1.5 text-xs text-red-900/80 dark:text-red-200/80"><span className="font-semibold">Recommendation ({d.confidence}% confidence):</span> {d.reasoning}</p>
          <p className="mt-1.5 text-xs text-red-900/80 dark:text-red-200/80"><span className="font-semibold">On approval:</span> {d.nextStep}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {approved ? (
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                <CheckCircle2 size={14} /> Approved — execution begins within 24 hours
              </span>
            ) : (
              <>
                <button onClick={() => onApprove(d.id)} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700">
                  {d.approvalAction || 'Approve'}
                </button>
                {d.secondaryAction && (
                  <button className="rounded-lg border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-500/10">
                    {d.secondaryAction}
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

export default function DecisionEngineView() {
  const { projects, loaded } = useProjects();
  const project = projects.find((p) => !p.archived) ?? projects[0] ?? null;
  const [decisions, setDecisions] = useState<DecisionRecord[]>([]);
  const [approvedIds, setApprovedIds] = useState<string[]>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Decisions generated from the user's REAL active project — no demo data
  useEffect(() => {
    setDecisions(project ? getDecisions(project) : []);
    setApprovedIds([]);
  }, [project?.id]);

  // AUTOMATIC finalization: in-progress decisions resolve on their own.
  // The user never manages internal AI workflows.
  useEffect(() => {
    const inProgress = decisions.find((d) => d.status === 'in-progress');
    if (!inProgress) return;
    timerRef.current = setTimeout(() => {
      setDecisions((prev) => prev.map((d) =>
        d.id === inProgress.id ? { ...d, status: 'decided' as const, decidedAt: 'Just now' } : d,
      ));
    }, 18000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [decisions]);

  const approve = (id: string) => setApprovedIds((prev) => [...prev, id]);

  const decided = decisions.filter((d) => d.status === 'decided').length;
  const inProgress = decisions.filter((d) => d.status === 'in-progress').length;
  const escalated = decisions.filter((d) => d.status === 'escalated' && !approvedIds.includes(d.id)).length;
  const avgConf = Math.round(decisions.filter((d) => d.status === 'decided').reduce((s, d) => s + d.confidence, 0) / Math.max(1, decided));

  const stageProgress = project ? getStageProgress(project) : null;
  const autonomous = project ? getAutonomousDecisions(project) : [];

  return (
    <div className="space-y-6">
      {/* 1 — CEO AI Executive Summary */}
      {project && (
        <div className="rounded-2xl bg-gradient-to-br from-[#0A1628] via-[#0d2240] to-[#0A1628] p-6 text-white shadow-xl sm:p-7">
          <div className="flex items-center gap-2">
            <Brain size={18} className="text-cyan-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300">CEO AI Executive Summary</span>
            {escalated === 0 && <Badge color="green">No action required today</Badge>}
            {escalated > 0 && <Badge color="red">{escalated} approval{escalated === 1 ? '' : 's'} awaiting you</Badge>}
          </div>
          <p className="mt-3 max-w-4xl text-sm leading-relaxed text-slate-200">
            &ldquo;{getExecutiveSummary(project)}&rdquo;
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Decisions Made" value={String(decided)} sub="autonomously, this sprint" icon={<Brain size={16} className="text-blue-500" />} />
        <StatCard label="In Progress" value={String(inProgress)} sub="auto-finalizing — no action needed" icon={<Loader2 size={16} className="text-amber-500" />} />
        <StatCard label="Awaiting Your Approval" value={String(escalated)} sub="money / legal / physical only" icon={<AlertTriangle size={16} className="text-red-500" />} />
        <StatCard label="Avg. Confidence" value={decided > 0 ? `${avgConf}%` : '—'} sub="on completed decisions" icon={<CheckCircle2 size={16} className="text-emerald-500" />} />
      </div>

      {/* 4 — Automatic stage advancement */}
      {project && stageProgress && (
        <Card className="p-5">
          <SectionTitle
            title="Automatic Stage Advancement"
            sub={`${project.name} — ${stageProgress.stage} advances to ${stageProgress.nextStage} automatically at 100%. You'll be notified after completion.`}
            action={<TrendingUp size={16} className="text-slate-400" />}
          />
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Current progress — {stageProgress.stage}</span>
                <span className="font-mono text-slate-400">{stageProgress.percent}%</span>
              </div>
              <ProgressBar value={stageProgress.percent} />
              <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock size={13} /> Estimated completion: ~{stageProgress.etaDays} day{stageProgress.etaDays === 1 ? '' : 's'} at current velocity
              </div>
              <div className="mt-4 grid gap-1.5 sm:grid-cols-2">
                {stageProgress.requirements.map((r) => (
                  <div key={r.label} className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className={r.done ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-600'} />
                    <span className={r.done ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>{r.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
              <div className="text-xs font-bold uppercase tracking-wide text-amber-700 dark:text-amber-300">Current blockers</div>
              <ul className="mt-2 space-y-2">
                {stageProgress.blockers.map((b) => (
                  <li key={b} className="flex items-start gap-2 text-xs text-slate-600 dark:text-slate-300">
                    <AlertTriangle size={13} className="mt-0.5 shrink-0 text-amber-500" /> {b}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      )}

      {/* 9 — Executive mode: autonomy policy */}
      <Card className="p-5">
        <SectionTitle title="How Atlas Operates" sub="Analyze. Decide. Execute. Document. Report. Atlas asks permission only where a human is genuinely required." />
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-500/20 dark:bg-emerald-500/5">
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 dark:text-emerald-300">
              <Zap size={15} /> Decided autonomously — you're notified afterward
            </div>
            <div className="mt-2.5 grid grid-cols-1 gap-1 sm:grid-cols-2">
              {AUTONOMOUS_ITEMS.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <CheckCircle2 size={12} className="shrink-0 text-emerald-500" /> {item}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-red-100 bg-red-50/50 p-4 dark:border-red-500/20 dark:bg-red-500/5">
            <div className="flex items-center gap-2 text-sm font-bold text-red-800 dark:text-red-300">
              <ShieldAlert size={15} /> Requires your approval — nothing else does
            </div>
            <div className="mt-2.5 space-y-1.5">
              {APPROVAL_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                  <span className="text-red-500">{item.icon}</span> {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {loaded && !project && (
        <Card className="p-8 text-center">
          <Lightbulb size={28} className="mx-auto text-amber-400" />
          <h3 className="mt-3 text-base font-bold text-slate-900 dark:text-white">No decisions yet</h3>
          <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
            The Decision Engine only shows decisions for your real projects. Create a project and Atlas begins executing.
          </p>
        </Card>
      )}

      {/* Autonomous decisions made recently — reported, never asked */}
      {project && autonomous.length > 0 && (
        <Card className="p-5">
          <SectionTitle title="Decided Autonomously — For Your Awareness" sub="Executed without interruption; every decision is documented and reversible on new evidence" />
          <div className="space-y-3">
            {autonomous.map((a, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-slate-100 p-3 dark:border-slate-800">
                <Zap size={15} className="mt-0.5 shrink-0 text-emerald-500" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{a.decision}</span>
                    <Badge color="slate">{a.dept}</Badge>
                    <span className="font-mono text-[10px] text-slate-400">{a.time}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{a.rationale}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Active decisions */}
      <div className="space-y-4">
        {decisions.map((d) => (
          <DecisionCard key={d.id} d={d} onApprove={approve} approved={approvedIds.includes(d.id)} />
        ))}
      </div>

      {/* 6 + 7 — notifications and history */}
      {project && (
        <div className="grid gap-6 xl:grid-cols-2">
          <ExecutiveNotifications project={project} />
          <DecisionHistoryPanel project={project} />
        </div>
      )}
    </div>
  );
}
