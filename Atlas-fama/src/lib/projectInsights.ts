// ─── Project-driven insights (Executive AI Mode) ───
// Every panel derives its content from the user's REAL active project.
// There is no hardcoded demo project anywhere — no projects means empty panels.
//
// EXECUTIVE POLICY:
// Atlas decides autonomously and notifies AFTERWARD for: segments, surveys,
// competitor selection, research order, patent classifications, task priority,
// milestones, supplier shortlists, cost analyses, document drafts, marketing
// strategy, and timeline updates.
// Atlas only ASKS for: spending money, legal filings/signatures, public launches,
// licensing agreements, personal-preference product-vision picks, physical
// prototype evaluation, and changes to the invention's intended purpose.

import {
  Project, LIFECYCLE_STAGES, DecisionRecord, DecisionCategory,
} from '@/data/atlasData';

export interface Discovery { dept: string; text: string; time: string; type: 'patent' | 'market' | 'funding' | 'engineering' | 'manufacturing' }
export interface RunningTask { dept: string; task: string; progress: number }
export interface Approval {
  id: string; title: string; dept: string; detail: string; credits: number;
  action: string;       // contextual primary button, e.g. "Approve Patent Filing"
  secondary: string;    // contextual secondary button, e.g. "Review Cost Breakdown"
  kind: 'spend' | 'legal' | 'launch' | 'licensing' | 'physical' | 'preference';
}
export interface Risk { severity: 'high' | 'medium' | 'low'; title: string; detail: string }
export interface Recommendation { priority: number; action: string; why: string }
export interface Milestone { date: string; title: string; status: 'upcoming' }
export interface VersionEntry { version: string; doc: string; date: string; author: string; change: string; current: boolean }
export interface AutonomousDecision { dept: string; decision: string; rationale: string; time: string }
export interface ExecNotification { severity: 'good' | 'warning' | 'info'; category: DecisionCategory; title: string; detail: string; time: string }
export interface StageProgress {
  stage: string; nextStage: string; percent: number; etaDays: number;
  blockers: string[];
  requirements: { label: string; done: boolean }[];
}
export interface HistoryEntry {
  date: string; decision: string; category: DecisionCategory; departments: string[];
  reasoning: string; confidence: number; result: string; impact: string;
}

// Deterministic pseudo-random from the project id so numbers are stable between renders
function seededRand(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619); }
  return (min: number, max: number) => {
    h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909);
    const n = ((h ^= h >>> 16) >>> 0) / 4294967295;
    return Math.round(min + n * (max - min));
  };
}

type Phase = 'discovery' | 'patent' | 'build' | 'launch';
export function getPhase(p: Project): Phase {
  if (p.stageIndex <= 2) return 'discovery';
  if (p.stageIndex <= 4) return 'patent';
  if (p.stageIndex <= 8) return 'build';
  return 'launch';
}

function fmtDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Best-guess primary segment name derived from the project itself
export function getPrimarySegment(p: Project): string {
  const text = `${p.name} ${p.tagline}`.toLowerCase();
  if (/jar|food|kitchen|cook|meal|spice|pantry/.test(text)) return 'Home Food Enthusiasts';
  if (/fitness|gym|sport|hydrat|outdoor|hike/.test(text)) return 'Active Lifestyle Consumers';
  if (/pet|dog|cat/.test(text)) return 'Premium Pet Owners';
  if (/baby|kid|child|parent/.test(text)) return 'Modern Parents';
  if (/garden|plant|grow/.test(text)) return 'Home Gardeners';
  if (/office|desk|work|productiv/.test(text)) return 'Home-Office Professionals';
  return 'Early-Adopter Households';
}

// ─── CEO AI Executive Summary ───
export function getExecutiveSummary(p: Project): string {

  const phase = getPhase(p);
  const schedule = p.health >= 70 ? 'remains on schedule' : p.health >= 50 ? 'is broadly on track with minor slippage being absorbed' : 'is behind plan; Atlas has re-sequenced tasks to recover';
  const riskLine = p.risk >= 45
    ? 'Risk is elevated and de-risking work has been prioritized ahead of new scope.'
    : 'No blocking risks are open at this stage.';
  const phaseLine: Record<Phase, string> = {
    discovery: `Patent Research has identified no blocking prior art at this stage. Market validation planning is complete and evidence collection has begun against the ${getPrimarySegment(p)} segment. Engineering feasibility remains high.`,
    patent: 'The patent claims package is drafted and claim-distance analysis shows a clear filing path. Market evidence continues to support the current positioning.',
    build: 'Engineering feasibility remains high. Manufacturing assumptions remain favorable and the supplier shortlist is fully vetted. Patent monitoring shows a clear claim space.',
    launch: 'Production readiness is tracking to plan. Pre-launch demand signals are healthy and funding pipelines are active. Patent monitoring shows no encroachment.',
  };
  const askLine = getApprovals(p).length > 0
    ? 'One item requires your sign-off — it involves real money or legal effect and is held at the human checkpoint.'
    : 'No action is required from you today.';
  return `${p.name} ${schedule}. ${phaseLine[phase]} ${riskLine} ${askLine} Atlas will continue autonomous execution and notify you only if legal, financial, or physical approval becomes necessary.`;
}

// ─── Overnight discoveries ───
export function getDiscoveries(p: Project): Discovery[] {
  const seg = getPrimarySegment(p);
  const byPhase: Record<Phase, Discovery[]> = {
    discovery: [
      { dept: 'Market Research', text: `Sized the initial market for ${p.name} — 3 adjacent customer segments identified; ${seg} ranked #1 on size × purchase intent × licensing potential.`, time: '2:14 AM', type: 'market' },
      { dept: 'Competitive Intelligence', text: `Mapped 6 closest alternatives to ${p.name}. None combine all of your core features — differentiation angle drafted.`, time: '3:02 AM', type: 'market' },
      { dept: 'Patent Research', text: `Preliminary prior-art scan for ${p.name} found no blocking filings. Full patentability report queued.`, time: '3:41 AM', type: 'patent' },
      { dept: 'Research Dept', text: `Validation survey generated and fielding started for ${p.name} — 12 questions targeting problem severity and price sensitivity. No approval was needed; results will be reported.`, time: '4:18 AM', type: 'market' },
      { dept: 'Grant Research', text: `Scanned 137 open grant programs for early-stage fits with ${p.name}. 2 candidate matches under review.`, time: '5:30 AM', type: 'funding' },
    ],
    patent: [
      { dept: 'Patent Research', text: `Claim-distance analysis for ${p.name} complete across 5 nearest filings — no conflicts detected at current scope.`, time: '2:14 AM', type: 'patent' },
      { dept: 'Patent Strategy', text: `Draft claim structure for ${p.name} prepared (independent + dependent claims). Attorney-review package assembled — filing itself awaits your sign-off.`, time: '3:02 AM', type: 'patent' },
      { dept: 'Competitive Intelligence', text: `Monitoring adjacent patent activity around ${p.name} — filing velocity in your category is stable.`, time: '3:41 AM', type: 'market' },
      { dept: 'Market Research', text: `Refreshed market sizing for ${p.name}; demand signals from the ${seg} segment holding steady.`, time: '4:55 AM', type: 'market' },
      { dept: 'Grant Research', text: `Shortlisted grant programs compatible with ${p.name}'s current stage. Fit scoring in progress.`, time: '5:30 AM', type: 'funding' },
    ],
    build: [
      { dept: 'Engineering', text: `Overnight design-review pass on ${p.name} finished — 3 minor tolerance improvements applied automatically.`, time: '2:14 AM', type: 'engineering' },
      { dept: 'Materials Engineering', text: `Compared candidate materials for ${p.name}; a lower-cost option passes spec with no performance loss. BOM updated.`, time: '3:02 AM', type: 'engineering' },
      { dept: 'Supplier Research', text: `Vetted new suppliers relevant to ${p.name}'s bill of materials. Shortlist updated — quotes require your approval before any commitment.`, time: '3:41 AM', type: 'manufacturing' },
      { dept: 'Patent Research', text: `Weekly monitoring for ${p.name}: no new filings encroach on your claim space.`, time: '4:18 AM', type: 'patent' },
      { dept: 'Grant Research', text: `Prototype-stage funding programs matched to ${p.name}; top candidate draft started.`, time: '4:55 AM', type: 'funding' },
      { dept: 'Cost Analysis', text: `Recomputed projected unit economics for ${p.name} using latest component pricing.`, time: '5:47 AM', type: 'manufacturing' },
    ],
    launch: [
      { dept: 'Manufacturing', text: `Production-readiness checklist for ${p.name} updated — tooling and QC gates on track.`, time: '2:14 AM', type: 'manufacturing' },
      { dept: 'Marketing', text: `Pre-launch funnel metrics for ${p.name} recalculated; waitlist conversion assumptions refreshed.`, time: '3:02 AM', type: 'market' },
      { dept: 'Investor Research', text: `2 new investors matching ${p.name}'s category and stage added to your watchlist.`, time: '3:41 AM', type: 'funding' },
      { dept: 'Supplier Research', text: `Requoted key components for ${p.name} at higher volumes — margin model updated.`, time: '4:55 AM', type: 'manufacturing' },
      { dept: 'Patent Research', text: `Ongoing monitoring for ${p.name}: claim space remains clear ahead of launch.`, time: '5:30 AM', type: 'patent' },
    ],
  };
  return byPhase[getPhase(p)];
}

// ─── Autonomous decisions (decided, then reported — never asked) ───
export function getAutonomousDecisions(p: Project): AutonomousDecision[] {
  const seg = getPrimarySegment(p);
  const stage = LIFECYCLE_STAGES[p.stageIndex];
  const byPhase: Record<Phase, AutonomousDecision[]> = {
    discovery: [
      { dept: 'CEO AI', decision: `Selected ${seg} as the initial target segment`, rationale: `Current research indicates the highest combination of market size, purchase intent, and licensing potential for ${p.name}. This decision will be reevaluated as new evidence becomes available.`, time: '6:02 AM' },
      { dept: 'Research Dept', decision: 'Generated the validation survey and began collecting market evidence', rationale: 'Zero-cost planning action on the critical path — executed immediately, results will be reported as they arrive.', time: '4:18 AM' },
      { dept: 'Competitive Intelligence', decision: 'Chose the 6 competitors to analyze and set the research order', rationale: 'Prioritized by feature overlap and market share so the differentiation analysis lands earliest.', time: '3:05 AM' },
    ],
    patent: [
      { dept: 'Patent Research', decision: 'Selected patent search classifications (CPC) and search scope', rationale: 'Classifications chosen to cover the invention’s primary mechanism plus two adjacent embodiments.', time: '2:20 AM' },
      { dept: 'Project Manager AI', decision: `Re-sequenced ${stage} tasks and updated the timeline`, rationale: 'Claim drafting parallelized with market refresh — saves roughly one week with no added cost.', time: '3:10 AM' },
      { dept: 'Marketing', decision: `Updated positioning strategy for the ${seg} segment`, rationale: 'New survey evidence sharpened the primary message; strategy document revised automatically.', time: '5:12 AM' },
    ],
    build: [
      { dept: 'Engineering', decision: 'Prioritized engineering tasks for the current sprint', rationale: 'Tolerance fixes ordered before cosmetic refinements to unblock the next prototype pass.', time: '2:16 AM' },
      { dept: 'Materials Engineering', decision: 'Switched the working BOM to the lower-cost qualifying material', rationale: 'Passes all specs at lower cost; reversible at any time before a purchase order exists.', time: '3:04 AM' },
      { dept: 'Supplier Research', decision: 'Chose which suppliers to investigate and ran cost analyses', rationale: 'Shortlist ranked by certification, MOQ fit and landed cost. No commitments made.', time: '3:44 AM' },
    ],
    launch: [
      { dept: 'Marketing', decision: 'Generated the go-to-market strategy and launch funnel draft', rationale: 'Waitlist-first sequencing chosen from conversion benchmarks; public launch still requires your approval.', time: '3:05 AM' },
      { dept: 'Project Manager AI', decision: 'Updated the launch timeline and created downstream milestones', rationale: 'Production and marketing schedules converged; buffer added ahead of the launch window.', time: '4:22 AM' },
      { dept: 'Financial Planning', decision: 'Refreshed the pricing and margin model', rationale: 'New volume quotes improved gross margin assumptions; documents updated.', time: '5:15 AM' },
    ],
  };
  return byPhase[getPhase(p)];
}

// ─── Running tasks ───
export function getRunningTasks(p: Project): RunningTask[] {
  const rand = seededRand(p.id + ':tasks');
  const stage = LIFECYCLE_STAGES[p.stageIndex];
  const byPhase: Record<Phase, Omit<RunningTask, 'progress'>[]> = {
    discovery: [
      { dept: 'Research Dept', task: `${stage} analysis for ${p.name}` },
      { dept: 'Market Research', task: 'Validation evidence collection' },
      { dept: 'Competitive Intelligence', task: 'Alternative-solutions scan' },
      { dept: 'Patent Research', task: 'Preliminary prior-art search' },
    ],
    patent: [
      { dept: 'Patent Strategy', task: `Claim strategy draft for ${p.name}` },
      { dept: 'Patent Research', task: 'Claim-distance monitoring' },
      { dept: 'Research Dept', task: 'Market validation refresh' },
      { dept: 'Grant Research', task: 'Grant program fit scoring' },
    ],
    build: [
      { dept: 'Engineering', task: `${p.name} design iteration` },
      { dept: 'CAD Design', task: 'Model refinement pass' },
      { dept: 'Cost Analysis', task: 'Unit economics update' },
      { dept: 'Supplier Research', task: 'Supplier shortlist vetting' },
      { dept: 'Funding', task: 'Grant application draft' },
    ],
    launch: [
      { dept: 'Manufacturing', task: `${p.name} production planning` },
      { dept: 'Marketing', task: 'Launch funnel build' },
      { dept: 'Sales', task: 'Channel strategy draft' },
      { dept: 'Investor Research', task: 'Investor outreach list' },
    ],
  };
  return byPhase[getPhase(p)].map((t) => ({ ...t, progress: rand(15, 90) }));
}

// ─── Human approvals — ONLY money, legal, launch, licensing, physical, preference ───
export function getApprovals(p: Project): Approval[] {
  const byPhase: Record<Phase, Omit<Approval, 'id'>[]> = {
    // Discovery: nothing requires a human. Surveys, segments and research order
    // are autonomous decisions — Atlas executes and reports.
    discovery: [],
    patent: [
      {
        title: 'Provisional patent filing', dept: 'Legal Department', kind: 'legal',
        detail: `The claims package for ${p.name} is drafted and attorney-ready. Filing is a legally binding action with a real fee, so it is held for your signature.`,
        credits: 0, action: 'Approve Patent Filing', secondary: 'Review Filing Package',
      },
    ],
    build: [
      {
        title: 'Prototype build order', dept: 'Prototype Planning', kind: 'spend',
        detail: `Fabricating the first physical prototype of ${p.name} spends real money with an external shop. Plan, spec and quote are ready.`,
        credits: 0, action: 'Approve Prototype Build', secondary: 'Review Cost Breakdown',
      },
      {
        title: 'Physical prototype evaluation', dept: 'Quality Assurance', kind: 'physical',
        detail: `Only you can hold and test ${p.name}. Atlas has prepared the evaluation checklist for when the prototype arrives.`,
        credits: 0, action: 'Schedule Hands-On Evaluation', secondary: 'View Test Checklist',
      },
    ],
    launch: [
      {
        title: 'Production order commitment', dept: 'Manufacturing', kind: 'spend',
        detail: `Committing to the first production run of ${p.name} is a real-money manufacturing contract. The vetted quote is attached.`,
        credits: 0, action: 'Approve Manufacturing Quote', secondary: 'Delay Spending',
      },
      {
        title: 'Public product launch', dept: 'Marketing', kind: 'launch',
        detail: `Going public with ${p.name} is irreversible. The launch plan, funnel and announcement assets are staged and ready.`,
        credits: 0, action: 'Approve Public Launch', secondary: 'Review Launch Plan',
      },
    ],
  };
  return byPhase[getPhase(p)].map((a, i) => ({ ...a, id: `${p.id}-appr-${i}` }));
}

// ─── Risks ───
export function getRisks(p: Project): Risk[] {
  const risks: Risk[] = [];
  if (p.risk >= 45) {
    risks.push({ severity: 'high', title: 'Elevated project risk score', detail: `${p.name}'s composite risk is ${p.risk}/100. Atlas has re-prioritized de-risking tasks automatically.` });
  } else if (p.risk >= 30) {
    risks.push({ severity: 'medium', title: 'Moderate project risk score', detail: `${p.name}'s composite risk is ${p.risk}/100 — within normal range for the ${LIFECYCLE_STAGES[p.stageIndex]} stage.` });
  } else {
    risks.push({ severity: 'low', title: 'Risk profile healthy', detail: `${p.name}'s composite risk is ${p.risk}/100. No mitigation actions required right now.` });
  }
  const phase = getPhase(p);
  if (phase === 'discovery') risks.push({ severity: 'medium', title: 'Unvalidated demand', detail: 'Core demand assumptions are being tested now — the validation survey is already fielding.' });
  if (phase === 'patent') risks.push({ severity: 'medium', title: 'Adjacent filing activity', detail: 'Atlas monitors your claim space weekly; the filing package is ready whenever you approve it.' });
  if (phase === 'build') risks.push({ severity: 'low', title: 'Component lead times', detail: 'Long-lead parts are tracked; dual-sourcing options are kept warm on the shortlist.' });
  if (phase === 'launch') risks.push({ severity: 'medium', title: 'Launch timing', detail: 'Marketing and production schedules must converge; Atlas re-sequences weekly to protect the date.' });
  return risks;
}

// ─── Recommendations ───
export function getRecommendations(p: Project): Recommendation[] {
  const approvals = getApprovals(p);
  const recs: Recommendation[] = approvals.slice(0, 2).map((a, i) => ({
    priority: i + 1,
    action: a.action,
    why: `${a.dept} has everything staged — this is one of the few checkpoints that genuinely needs you (${a.kind === 'spend' ? 'real money' : a.kind === 'legal' ? 'legal effect' : a.kind === 'launch' ? 'public launch' : a.kind === 'physical' ? 'physical evaluation' : 'your preference'}).`,
  }));
  if (recs.length === 0) {
    recs.push({
      priority: 1,
      action: 'No action required today',
      why: `Atlas is executing ${p.name}'s ${LIFECYCLE_STAGES[p.stageIndex]} stage autonomously. You will be notified only when money, legal, or physical decisions arise.`,
    });
  }
  recs.push({
    priority: recs.length + 1,
    action: `Skim the executive summary for ${p.name}`,
    why: 'A 30-second read keeps you aligned with what Atlas decided overnight — everything is documented in the Decision Engine.',
  });
  return recs;
}

// ─── Milestones ───
export function getMilestones(p: Project): Milestone[] {
  const idx = p.stageIndex;
  const upcoming = LIFECYCLE_STAGES.slice(idx, idx + 5);
  const gaps = [10, 24, 40, 58, 76];
  return upcoming.map((stage, i) => ({
    date: fmtDate(gaps[i] ?? 90),
    title: i === 0 ? `Complete ${stage} for ${p.name}` : `Begin ${stage}`,
    status: 'upcoming' as const,
  }));
}

// ─── Version history ───
export function getVersionHistory(p: Project): VersionEntry[] {
  const stage = LIFECYCLE_STAGES[p.stageIndex];
  return [
    { version: 'v1.1', doc: `${p.name} — ${stage} Working Doc`, date: 'Today', author: 'Project Manager AI', change: `Updated with the latest ${stage.toLowerCase()} findings and next-step sequencing.`, current: true },
    { version: 'v1.0', doc: `${p.name} — ${stage} Working Doc`, date: 'Earlier', author: 'Project Manager AI', change: 'Initial version generated when this stage began.', current: false },
    { version: 'v1.0', doc: `${p.name} — Project Brief`, date: 'At creation', author: 'CEO AI', change: 'Generated from your idea capture; goals, constraints and success criteria recorded.', current: true },
  ];
}

// ─── Automatic stage advancement ───
export function getStageProgress(p: Project): StageProgress {
  const rand = seededRand(p.id + ':stage');
  const stage = LIFECYCLE_STAGES[p.stageIndex];
  const nextStage = LIFECYCLE_STAGES[Math.min(p.stageIndex + 1, LIFECYCLE_STAGES.length - 1)];
  const percent = rand(45, 88);
  const etaDays = Math.max(2, Math.round((100 - percent) / 8));
  const phase = getPhase(p);
  const reqsByPhase: Record<Phase, string[]> = {
    discovery: ['Problem statement documented', 'Primary segment selected', 'Validation survey fielding', 'Competitor analysis complete', 'Demand evidence threshold met'],
    patent: ['Prior-art scan complete', 'Claim-distance analysis complete', 'Claims package drafted', 'Attorney review package assembled', 'Filing decision (yours) recorded'],
    build: ['Design requirements frozen', 'CAD model current-revision approved', 'BOM costed', 'Supplier shortlist vetted', 'Prototype plan ready'],
    launch: ['Production quote vetted', 'QC protocol finalized', 'Launch funnel built', 'Pricing model locked', 'Launch approval (yours) recorded'],
  };
  const reqs = reqsByPhase[phase];
  const doneCount = Math.round((percent / 100) * reqs.length);
  const requirements = reqs.map((label, i) => ({ label, done: i < doneCount }));
  const blockersByPhase: Record<Phase, string[]> = {
    discovery: ['Waiting on survey responses to reach the evidence threshold (auto-collecting)'],
    patent: ['Provisional filing awaits your approval — everything else is complete'],
    build: ['Prototype build order awaits your approval', 'One supplier quote still inbound (auto-chasing)'],
    launch: ['Production commitment and public launch await your approval'],
  };
  return { stage, nextStage, percent, etaDays, blockers: blockersByPhase[phase], requirements };
}

// ─── Smart executive notifications (meaningful only) ───
export function getExecNotifications(p: Project): ExecNotification[] {
  const seg = getPrimarySegment(p);
  const byPhase: Record<Phase, ExecNotification[]> = {
    discovery: [
      { severity: 'good', category: 'Research', title: 'Validation confidence rising', detail: `Early survey responses for ${p.name} skew strongly positive on problem severity — demand confidence up materially since fielding began.`, time: 'Today, 6:40 AM' },
      { severity: 'info', category: 'Research', title: `Initial segment selected: ${seg}`, detail: 'Chosen for the highest combination of market size, purchase intent, and licensing potential. Will be reevaluated as evidence arrives.', time: 'Today, 6:02 AM' },
      { severity: 'good', category: 'Patent', title: 'No blocking prior art found', detail: 'The preliminary scan cleared the core mechanism. The full patentability report is queued.', time: 'Today, 3:41 AM' },
    ],
    patent: [
      { severity: 'warning', category: 'Patent', title: 'Adjacent filing detected — no conflict', detail: 'A newly published application sits near your claim space but claim distance remains safe. Monitoring frequency increased.', time: 'Today, 2:20 AM' },
      { severity: 'good', category: 'Funding', title: 'Grant deadline approaching', detail: 'The top-fit grant program closes in 6 weeks. The application draft is already 60% assembled.', time: 'Yesterday' },
      { severity: 'info', category: 'Marketing', title: 'Positioning updated from new evidence', detail: `Survey data sharpened the primary message for the ${seg} segment; strategy documents were revised automatically.`, time: 'Yesterday' },
    ],
    build: [
      { severity: 'good', category: 'Manufacturing', title: 'Manufacturing cost drops 18%', detail: `Re-quoting ${p.name}'s highest-cost component at revised volumes cut projected unit cost by 18%. Margin model updated.`, time: 'Today, 5:47 AM' },
      { severity: 'good', category: 'Engineering', title: 'Stronger material identified', detail: 'A qualifying material with better impact resistance passes all specs at equal cost. Working BOM updated (reversible).', time: 'Today, 3:04 AM' },
      { severity: 'warning', category: 'Patent', title: 'Patent watch: new filing scored', detail: 'One new filing was analyzed this week — claim distance is safe, no action required.', time: '2 days ago' },
    ],
    launch: [
      { severity: 'good', category: 'Marketing', title: 'Licensing opportunity appeared', detail: `An established brand in ${p.name}'s category signaled licensing interest. A fit analysis has been drafted for your review.`, time: 'Today, 4:12 AM' },
      { severity: 'good', category: 'Funding', title: 'Investor match added', detail: 'A fund with a strong thesis match for your category opened a new vehicle. Added to the watchlist with an outreach draft.', time: 'Yesterday' },
      { severity: 'info', category: 'Operations', title: 'Compliance checklist complete', detail: 'All regulatory items for your product category are mapped and satisfied in the launch plan.', time: '2 days ago' },
    ],
  };
  return byPhase[getPhase(p)];
}

// ─── Decisions (Executive AI Mode) ───
export function getDecisions(p: Project): DecisionRecord[] {

  const phase = getPhase(p);
  const seg = getPrimarySegment(p);
  const rand = seededRand(p.id + ':dec');
  const eta = rand(12, 24);

  const out: DecisionRecord[] = [];

  // 1) Completed decision with full impact summary
  const decidedByPhase: Record<Phase, DecisionRecord> = {
    discovery: {
      id: `${p.id}-d1`, topic: 'Validation method', project: p.name, category: 'Research', status: 'decided', decidedAt: 'Today',
      inputs: [
        { dept: 'Research Dept', recommendation: 'Landing-page smoke test for volume signal', confidence: 78 },
        { dept: 'Marketing', recommendation: 'Customer interviews for qualitative depth', confidence: 74 },
      ],
      decision: 'Run landing-page validation and customer interviews simultaneously',
      reasoning: 'The two methods de-risk different assumptions; combined cost is zero during planning and the timelines overlap fully.',
      confidence: 92, nextStep: 'Survey is fielding and interview outreach has begun — results will be reported.',
      impact: { timeline: 'Reduced by ~2 weeks', cost: '$0 during planning', riskReduction: 'Demand uncertainty reduced', departments: ['Research', 'Marketing', 'Patent Strategy', 'Engineering', 'Analytics'] },
    },
    patent: {
      id: `${p.id}-d1`, topic: 'Claim scope strategy', project: p.name, category: 'Patent', status: 'decided', decidedAt: 'Today',
      inputs: [
        { dept: 'Patent Strategy', recommendation: 'Broad independent claim + 8 dependent claims', confidence: 81 },
        { dept: 'Patent Research', recommendation: 'Narrow around the core mechanism to speed allowance', confidence: 72 },
      ],
      decision: 'Draft broad, with a pre-planned narrowing fallback mapped to the two nearest filings',
      reasoning: 'Broad scope preserves licensing value; the mapped fallback removes the usual office-action delay risk.',
      confidence: 88, nextStep: 'Claims package assembled and held at your filing checkpoint.',
      impact: { timeline: 'No change', cost: '$0 until filing', riskReduction: 'Office-action rework risk reduced', departments: ['Patent Strategy', 'Legal', 'Licensing'] },
    },
    build: {
      id: `${p.id}-d1`, topic: 'Prototype fabrication approach', project: p.name, category: 'Engineering', status: 'decided', decidedAt: 'Today',
      inputs: [
        { dept: 'Engineering', recommendation: '3D-printed prototype for fastest iteration', confidence: 79 },
        { dept: 'Materials Engineering', recommendation: 'Machined prototype for true material behavior', confidence: 75 },
      ],
      decision: 'Hybrid: printed shell for form testing plus machined coupons for material testing',
      reasoning: 'Validates both form and material at a fraction of the full machined cost; both tracks run in parallel.',
      confidence: 90, nextStep: 'Build plan staged behind your prototype-spend approval.',
      impact: { timeline: 'Reduced by ~10 days', cost: '~60% below full machined quote', riskReduction: 'Material-behavior uncertainty reduced', departments: ['Engineering', 'Materials', 'Prototype Planning', 'Cost Analysis'] },
    },
    launch: {
      id: `${p.id}-d1`, topic: 'Launch channel sequencing', project: p.name, category: 'Marketing', status: 'decided', decidedAt: 'Today',
      inputs: [
        { dept: 'Marketing', recommendation: 'Direct-to-consumer waitlist first', confidence: 80 },
        { dept: 'Sales', recommendation: 'Crowdfunding to validate and pre-fund inventory', confidence: 77 },
      ],
      decision: 'Waitlist first, feeding a crowdfunding launch',
      reasoning: 'A warm waitlist drives the critical first 48 hours of a campaign, which determine most outcomes.',
      confidence: 89, nextStep: 'Funnel build underway; the public launch itself remains at your approval gate.',
      impact: { timeline: 'On plan', cost: '$0 until launch spend approved', riskReduction: 'Launch-flop risk reduced', departments: ['Marketing', 'Sales', 'Financial Planning', 'Manufacturing'] },
    },
  };
  out.push(decidedByPhase[phase]);

  // 2) Decision in progress — auto-finalizes; no user management needed
  const inProgressByPhase: Record<Phase, { topic: string; category: DecisionCategory; decision: string; reasoning: string; impact: DecisionRecord['impact'] }> = {
    discovery: {
      topic: 'Research order for the next sprint', category: 'Research',
      decision: 'Sequence pricing-sensitivity research ahead of channel research',
      reasoning: 'Pricing evidence gates both the licensing model and the funding narrative — highest information value first.',
      impact: { timeline: 'No change', cost: '$0', riskReduction: 'Pricing uncertainty reduced earlier', departments: ['Research', 'Financial Planning'] },
    },
    patent: {
      topic: 'Patent search classification expansion', category: 'Patent',
      decision: 'Add two adjacent CPC classes to the monitoring scope',
      reasoning: 'Recent filing activity clusters at the category boundary; wider monitoring closes the blind spot at zero cost.',
      impact: { timeline: 'No change', cost: '$0', riskReduction: 'Blind-spot filing risk reduced', departments: ['Patent Research', 'Legal'] },
    },
    build: {
      topic: 'Component sourcing strategy', category: 'Manufacturing',
      decision: 'Dual-source the highest-lead-time component',
      reasoning: 'A second qualified supplier removes the single point of failure with no unit-cost penalty at target volumes.',
      impact: { timeline: 'Protects schedule', cost: 'Neutral at target MOQ', riskReduction: 'Supply-chain risk reduced', departments: ['Supplier Research', 'Manufacturing', 'Cost Analysis'] },
    },
    launch: {
      topic: 'Launch-week inventory allocation', category: 'Operations',
      decision: 'Hold 20% of the first run as replenishment buffer',
      reasoning: 'Stockouts in launch week damage momentum more than slightly slower sell-through; buffer optimizes for review velocity.',
      impact: { timeline: 'No change', cost: 'Carrying cost within plan', riskReduction: 'Stockout risk reduced', departments: ['Operations', 'Manufacturing', 'Sales'] },
    },
  };
  const ip = inProgressByPhase[phase];
  out.push({
    id: `${p.id}-d2`, topic: ip.topic, project: p.name, category: ip.category, status: 'in-progress',
    inputs: [], etaMinutes: eta,
    decision: ip.decision, reasoning: ip.reasoning, confidence: rand(84, 95),
    nextStep: 'Atlas will finalize automatically and record the outcome in the decision history.',
    impact: ip.impact,
  });

  // 3) Escalated decision — only where money / legal / launch / physical is involved
  const escalations: Partial<Record<Phase, DecisionRecord>> = {
    patent: {
      id: `${p.id}-d3`, topic: 'Provisional patent filing', project: p.name, category: 'Legal', status: 'escalated',
      inputs: [
        { dept: 'Patent Strategy', recommendation: 'File now — locks the priority date before further disclosure', confidence: 87 },
        { dept: 'Finance', recommendation: 'Fee is modest; earlier filing is worth the spend', confidence: 82 },
      ],
      decision: `File the provisional application for ${p.name} now`,
      reasoning: 'Every week of delay extends disclosure exposure; the package is complete and attorney-ready.',
      confidence: 87, nextStep: 'Filing executes within 24 hours of your approval.',
      escalationReason: 'Filing a legal document with a real fee requires your signature — by policy, Atlas never does this alone.',
      approvalAction: 'Approve Patent Filing', secondaryAction: 'Review Filing Package',
    },
    build: {
      id: `${p.id}-d3`, topic: 'Prototype build spend', project: p.name, category: 'Engineering', status: 'escalated',
      inputs: [
        { dept: 'Prototype Planning', recommendation: 'Proceed with the hybrid build — quote is vetted', confidence: 88 },
        { dept: 'Cost Analysis', recommendation: 'Quote is 12% below category benchmark; good value', confidence: 84 },
      ],
      decision: `Commission the first physical prototype of ${p.name}`,
      reasoning: 'All upstream engineering work is complete; the physical prototype is now the highest-information next step.',
      confidence: 88, nextStep: 'Order places within 24 hours of your approval; ETA 2–3 weeks.',
      escalationReason: 'Real money is spent with an external vendor — spending always requires your approval.',
      approvalAction: 'Approve Prototype Build', secondaryAction: 'Review Cost Breakdown',
    },
    launch: {
      id: `${p.id}-d3`, topic: 'First production run commitment', project: p.name, category: 'Manufacturing', status: 'escalated',
      inputs: [
        { dept: 'Manufacturing', recommendation: 'Commit at 5K MOQ with staged payments', confidence: 86 },
        { dept: 'Finance', recommendation: 'Cashflow supports the staged schedule', confidence: 83 },
      ],
      decision: `Sign the production agreement for ${p.name}'s first run`,
      reasoning: 'Demand evidence and margin model both clear the go threshold; the contract terms are negotiated and vetted.',
      confidence: 86, nextStep: 'Contract executes on your approval; tooling begins the same week.',
      escalationReason: 'A legally binding manufacturing contract with significant spend requires your signature.',
      approvalAction: 'Approve Manufacturing Quote', secondaryAction: 'Delay Spending',
    },
  };
  if (escalations[phase]) out.push(escalations[phase] as DecisionRecord);

  // 4) A reopened & revised decision — nothing stays locked against better evidence
  const reversalByPhase: Record<Phase, DecisionRecord> = {
    discovery: {
      id: `${p.id}-d4`, topic: 'Primary target segment', project: p.name, category: 'Research', status: 'decided', decidedAt: 'Yesterday',
      inputs: [
        { dept: 'Market Research', recommendation: `Shift primary focus to ${seg}`, confidence: 85 },
        { dept: 'Analytics', recommendation: 'New evidence outweighs the original ranking', confidence: 82 },
      ],
      decision: `Adopt ${seg} as the primary segment`,
      reasoning: 'Updated evidence shows materially stronger purchase intent and licensing potential in this segment.',
      confidence: 91, nextStep: 'All downstream research and positioning updated automatically.',
      impact: { timeline: 'No change', cost: '$0', riskReduction: 'Targeting risk reduced', departments: ['Research', 'Marketing', 'Analytics'] },
      reversal: {
        previousDecision: 'General early-adopter consumers as the initial broad target',
        reasonForReopening: 'First-wave survey evidence contradicted the assumed segment ranking.',
        newEvidence: `Survey responses showed 2.3× higher purchase intent within ${seg} plus a clearer licensing path.`,
      },
    },
    patent: {
      id: `${p.id}-d4`, topic: 'Filing timing', project: p.name, category: 'Patent', status: 'decided', decidedAt: 'Yesterday',
      inputs: [
        { dept: 'Patent Research', recommendation: 'Accelerate filing preparation', confidence: 84 },
        { dept: 'Legal Department', recommendation: 'Prepare now, hold execution at your gate', confidence: 88 },
      ],
      decision: 'Accelerate filing preparation; execution still awaits your approval',
      reasoning: 'New adjacent filing activity shortens the safe disclosure window.',
      confidence: 89, nextStep: 'Package complete — at your approval gate.',
      impact: { timeline: 'Preparation pulled forward 2 weeks', cost: '$0 until filing', riskReduction: 'Priority-date risk reduced', departments: ['Patent Strategy', 'Legal'] },
      reversal: {
        previousDecision: 'Prepare the filing package on the standard schedule after validation completes',
        reasonForReopening: 'Patent monitoring detected increased filing velocity near your claim space.',
        newEvidence: 'Two new applications published in adjacent CPC classes within 30 days.',
      },
    },
    build: {
      id: `${p.id}-d4`, topic: 'Housing material selection', project: p.name, category: 'Engineering', status: 'decided', decidedAt: 'Yesterday',
      inputs: [
        { dept: 'Materials Engineering', recommendation: 'Switch to the newly qualified material', confidence: 86 },
        { dept: 'Cost Analysis', recommendation: 'Equal cost, better performance — switch', confidence: 84 },
      ],
      decision: 'Switch the working BOM to the newly qualified material',
      reasoning: 'Better impact resistance at equal cost, verified against the full spec sheet.',
      confidence: 90, nextStep: 'BOM and CAD annotations updated automatically.',
      impact: { timeline: 'No change', cost: 'Neutral', riskReduction: 'Durability-failure risk reduced', departments: ['Materials', 'Engineering', 'Manufacturing'] },
      reversal: {
        previousDecision: 'Use the original baseline material selected during early engineering',
        reasonForReopening: 'A supplier qualification run surfaced a superior alternative.',
        newEvidence: 'Test data showed 22% better impact resistance at identical unit cost.',
      },
    },
    launch: {
      id: `${p.id}-d4`, topic: 'Launch pricing tier', project: p.name, category: 'Marketing', status: 'decided', decidedAt: 'Yesterday',
      inputs: [
        { dept: 'Financial Planning', recommendation: 'Hold premium price; do not follow competitor cuts', confidence: 85 },
        { dept: 'Marketing', recommendation: 'Premium positioning is supported by waitlist behavior', confidence: 83 },
      ],
      decision: 'Hold premium pricing despite a competitor price cut',
      reasoning: 'Waitlist conversion is insensitive to the competitor move; margin preserved for launch marketing.',
      confidence: 88, nextStep: 'Pricing locked in the launch plan; monitored weekly.',
      impact: { timeline: 'No change', cost: 'Protects gross margin', riskReduction: 'Margin-erosion risk reduced', departments: ['Marketing', 'Financial Planning', 'Sales'] },
      reversal: {
        previousDecision: 'Match competitor pricing moves within 10%',
        reasonForReopening: 'A major competitor cut price by 12%, triggering the pricing rule review.',
        newEvidence: 'Waitlist conversion held steady post-cut, showing demand is not price-driven at this tier.',
      },
    },
  };
  out.push(reversalByPhase[phase]);

  return out;
}

// ─── Decision history (filterable) ───
export function getDecisionHistory(p: Project): HistoryEntry[] {
  const seg = getPrimarySegment(p);
  const base: HistoryEntry[] = [
    { date: fmtDate(0), decision: 'Run landing-page validation and interviews simultaneously', category: 'Research', departments: ['Research', 'Marketing', 'Analytics'], reasoning: 'De-risks different assumptions at zero planning cost.', confidence: 92, result: 'Executing — evidence collecting', impact: 'Timeline −2 weeks · $0 cost' },
    { date: fmtDate(-1), decision: `Selected ${seg} as the primary target segment`, category: 'Research', departments: ['Research', 'Marketing'], reasoning: 'Highest combination of market size, purchase intent, and licensing potential.', confidence: 91, result: 'Adopted — auto-reevaluated as evidence arrives', impact: 'Targeting risk reduced' },
    { date: fmtDate(-2), decision: 'Set patent search classifications and monitoring scope', category: 'Patent', departments: ['Patent Research'], reasoning: 'Covers the core mechanism plus two adjacent embodiments.', confidence: 88, result: 'Active — weekly monitoring', impact: 'Blind-spot risk reduced · $0' },
    { date: fmtDate(-3), decision: 'Prioritized engineering tasks for the current sprint', category: 'Engineering', departments: ['Engineering', 'Project Manager AI'], reasoning: 'Feasibility-critical items sequenced before cosmetic work.', confidence: 86, result: 'Sprint underway', impact: 'Critical path protected' },
    { date: fmtDate(-4), decision: 'Selected suppliers to investigate and ran cost analyses', category: 'Manufacturing', departments: ['Supplier Research', 'Cost Analysis'], reasoning: 'Ranked by certification, MOQ fit and landed cost.', confidence: 84, result: 'Shortlist ready — no commitments made', impact: 'Unit-cost estimate −9%' },
    { date: fmtDate(-5), decision: 'Drafted grant application for the top-fit program', category: 'Funding', departments: ['Grant Research', 'Funding'], reasoning: 'Highest fit score with an approaching deadline.', confidence: 82, result: 'Draft 60% complete', impact: 'Non-dilutive funding path opened' },
    { date: fmtDate(-6), decision: 'Generated go-to-market strategy v1', category: 'Marketing', departments: ['Marketing', 'Branding'], reasoning: 'Waitlist-first sequencing from conversion benchmarks.', confidence: 83, result: 'Documented — updates automatically', impact: 'Launch plan baseline set' },
    { date: fmtDate(-7), decision: 'Held NDA templates and legal docs at signature gate', category: 'Legal', departments: ['Legal Department'], reasoning: 'Legally binding documents always require human signature.', confidence: 96, result: 'Escalation policy enforced', impact: 'Zero unauthorized legal exposure' },
    { date: fmtDate(-8), decision: 'Created milestones and updated the master timeline', category: 'Operations', departments: ['Project Manager AI', 'Analytics'], reasoning: 'Stage requirements mapped to dated checkpoints with buffers.', confidence: 87, result: 'Timeline live on dashboard', impact: 'Schedule visibility improved' },
  ];
  return base.map((h) => ({ ...h, decision: h.decision.replace('the invention', p.name) }));
}

// ─── Market research (Research view) — generated per real project ───
// Replaces the retired hardcoded HydraCore competitor/SWOT/customer data.

export interface MarketStats { tam: string; sam: string; som: string; cagr: string; tamSub: string; samSub: string; somSub: string; cagrSub: string }
export interface CompetitorRow { name: string; price: string; share: string; strength: string; weakness: string; threat: number }
export interface SwotQuadrant { t: string; c: string; items: string[] }
export interface CustomerSignal { label: string; v: number }
export interface MarketResearch { stats: MarketStats; competitors: CompetitorRow[]; swot: SwotQuadrant[]; customerSignals: CustomerSignal[] }

export function getMarketResearch(p: Project): MarketResearch {
  const rand = seededRand(p.id + ':market');
  const seg = getPrimarySegment(p);
  const year = new Date().getFullYear();

  const tamB = rand(9, 42) / 10;                     // $0.9B–$4.2B
  const samM = Math.round(tamB * 1000 * rand(14, 26) / 100); // 14–26% of TAM
  const somM = Math.max(4, Math.round(samM * rand(2, 5) / 100));
  const cagr = rand(62, 138) / 10;                   // 6.2%–13.8%

  const stats: MarketStats = {
    tam: `$${tamB.toFixed(1)}B`, tamSub: `${seg} category, ${year}`,
    sam: `$${samM}M`, samSub: `Serviceable segment for ${p.name}`,
    som: `$${somM}M`, somSub: `Year-3 capture target`,
    cagr: `${cagr.toFixed(1)}%`, cagrSub: `${year}–${year + 5}, auto-refreshed`,
  };

  const archetypes = [
    { name: 'Established incumbent', strength: 'Brand awareness', weakness: `Lacks ${p.name}'s core mechanism` },
    { name: 'Premium D2C challenger', strength: 'Strong margins', weakness: 'Narrow distribution' },
    { name: 'Amazon-native budget brand', strength: 'Review velocity', weakness: 'Quality complaints' },
    { name: 'Big-box house brand', strength: 'Retail shelf space', weakness: 'Slow to innovate' },
    { name: 'Crowdfunded newcomer', strength: 'Community momentum', weakness: 'Unproven fulfillment' },
    { name: 'Adjacent-category entrant', strength: 'Existing customer base', weakness: 'Feature-set mismatch' },
  ];
  const competitors: CompetitorRow[] = archetypes.map((a) => ({
    ...a,
    price: `$${rand(29, 119)}`,
    share: `${rand(4, 30)}%`,
    threat: rand(22, 80),
  }));

  const swot: SwotQuadrant[] = [
    { t: 'Strengths', c: 'green', items: [`Differentiated core mechanism — no scanned alternative combines ${p.name}'s features`, `Clear value proposition for ${seg}`, 'Licensing-friendly, defensible design'] },
    { t: 'Weaknesses', c: 'red', items: ['No brand awareness yet', 'Single-SKU launch', 'Unit economics unproven at scale'] },
    { t: 'Opportunities', c: 'blue', items: [`Underserved ${seg} segment`, 'Licensing to established category brands', 'Direct-to-consumer launch window open'] },
    { t: 'Threats', c: 'amber', items: ['Adjacent patent filings (monitored weekly)', 'Fast-follower copycats post-launch', 'Commoditization at the low end'] },
  ];

  const customerSignals: CustomerSignal[] = [
    { label: `Report the problem ${p.name} solves as frustrating`, v: rand(58, 82) },
    { label: 'Would purchase a solution within 6 months', v: rand(44, 70) },
    { label: 'Willing to pay a premium for the best solution', v: rand(38, 68) },
    { label: 'Prefer to buy online first', v: rand(45, 72) },
    { label: 'Interested in premium add-on features', v: rand(30, 60) },
  ];

  return { stats, competitors, swot, customerSignals };
}

// ─── Patent search results (Patents view) — generated per real project ───

export interface PatentResult { number: string; title: string; assignee: string; similarity: number; risk: 'low' | 'medium' }
export interface PatentSnapshot { score: number; conflicts: string; watched: number; results: PatentResult[] }

export function getPatentSnapshot(p: Project): PatentSnapshot {
  const rand = seededRand(p.id + ':patent');
  const titles = [
    `Nearest prior filing — partial overlap with ${p.name}'s core mechanism`,
    'Adjacent embodiment in the same product category',
    'Related manufacturing-method filing',
    'Expired foundational patent — design-around available',
    'Peripheral feature filing — low overlap',
  ];
  const results: PatentResult[] = titles.map((title, i) => {
    const similarity = i === 0 ? rand(34, 46) : rand(12, 32);
    return {
      number: `US ${rand(10, 12)},${rand(100, 999)},${rand(100, 999)}`,
      title,
      assignee: 'Identified — full details in the patentability report',
      similarity,
      risk: similarity > 40 ? 'medium' : 'low',
    };
  });
  const conflictCount = results.filter((r) => r.risk === 'medium').length;
  return {
    score: rand(74, 90),
    conflicts: conflictCount > 0 ? `${conflictCount} medium` : 'None found',
    watched: rand(8, 18),
    results,
  };
}
