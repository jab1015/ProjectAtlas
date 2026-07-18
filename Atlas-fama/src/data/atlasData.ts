// ─── Project Atlas — single source of truth for all domain data ───

export const IMAGES = {
  productA: 'https://d64gsuwffb70l.cloudfront.net/6a598a00382d3920fcf5791a_1784253048709_56039ccb.png',
  productB: 'https://d64gsuwffb70l.cloudfront.net/6a598a00382d3920fcf5791a_1784253028447_2a6993ef.jpg',
  cadA: 'https://d64gsuwffb70l.cloudfront.net/6a598a00382d3920fcf5791a_1784253081675_941bc533.png',
  cadB: 'https://d64gsuwffb70l.cloudfront.net/6a598a00382d3920fcf5791a_1784253067759_96218ebf.jpg',
};

export type ViewKey =
  | 'dashboard' | 'projects' | 'decisions' | 'research' | 'patents' | 'engineering' | 'cad'
  | 'manufacturing' | 'funding' | 'marketing' | 'legal' | 'documents'
  | 'analytics' | 'settings' | 'pricing' | 'admin';



export const LIFECYCLE_STAGES = [
  'Idea', 'Validation', 'Market Research', 'Patent Research', 'Patent Strategy',
  'Engineering', 'Industrial Design', 'CAD Modeling', 'Prototype', 'Manufacturing',
  'Funding', 'Marketing', 'Sales', 'Launch',
];

export interface Department {
  id: string;
  name: string;
  group: 'Leadership' | 'Research' | 'Legal' | 'Engineering' | 'Manufacturing' | 'Funding' | 'Growth' | 'Operations';
  status: 'working' | 'idle' | 'waiting';
  currentTask: string;
  tasksToday: number;
}

export const DEPARTMENTS: Department[] = [
  { id: 'ceo', name: 'CEO AI', group: 'Leadership', status: 'working', currentTask: 'Re-prioritizing roadmap after grant match', tasksToday: 4 },
  { id: 'pm', name: 'Project Manager AI', group: 'Leadership', status: 'working', currentTask: 'Sequencing prototype sprint tasks', tasksToday: 11 },
  { id: 'coach', name: 'Inventor Coach', group: 'Leadership', status: 'idle', currentTask: 'Awaiting your morning check-in', tasksToday: 2 },
  { id: 'research', name: 'Research Dept', group: 'Research', status: 'working', currentTask: 'Scanning 214 new market signals', tasksToday: 18 },
  { id: 'competitive', name: 'Competitive Intelligence', group: 'Research', status: 'working', currentTask: 'Tracking competitor pricing changes', tasksToday: 7 },
  { id: 'patent-research', name: 'Patent Research', group: 'Legal', status: 'working', currentTask: 'Monitoring 3 adjacent patent filings', tasksToday: 5 },
  { id: 'patent-strategy', name: 'Patent Strategy', group: 'Legal', status: 'waiting', currentTask: 'Claim strategy draft awaiting approval', tasksToday: 2 },
  { id: 'legal', name: 'Legal Department', group: 'Legal', status: 'idle', currentTask: 'NDA templates up to date', tasksToday: 1 },
  { id: 'engineering', name: 'Engineering', group: 'Engineering', status: 'working', currentTask: 'Thermal simulation of core module', tasksToday: 9 },
  { id: 'mech', name: 'Mechanical Engineering', group: 'Engineering', status: 'working', currentTask: 'Optimizing cap thread tolerance', tasksToday: 6 },
  { id: 'elec', name: 'Electrical Engineering', group: 'Engineering', status: 'working', currentTask: 'Battery life optimization pass 3', tasksToday: 5 },
  { id: 'id', name: 'Industrial Design', group: 'Engineering', status: 'idle', currentTask: 'Design language finalized (v2)', tasksToday: 3 },
  { id: 'cad', name: 'CAD Design', group: 'Engineering', status: 'working', currentTask: 'Rebuilding housing model v4', tasksToday: 4 },
  { id: '3d', name: '3D Modeling', group: 'Engineering', status: 'working', currentTask: 'Rendering exploded assembly', tasksToday: 3 },
  { id: 'step', name: 'STEP Generator', group: 'Engineering', status: 'idle', currentTask: 'Queued: export after CAD v4 approval', tasksToday: 0 },
  { id: 'stl', name: 'STL Generator', group: 'Engineering', status: 'idle', currentTask: 'Queued: print-ready mesh export', tasksToday: 0 },
  { id: 'blueprint', name: 'Blueprint Generator', group: 'Engineering', status: 'idle', currentTask: 'Awaiting CAD v4 sign-off', tasksToday: 1 },
  { id: 'exploded', name: 'Exploded Assembly', group: 'Engineering', status: 'working', currentTask: 'Annotating 14-part assembly view', tasksToday: 2 },
  { id: 'materials', name: 'Materials Engineering', group: 'Engineering', status: 'working', currentTask: 'Comparing Tritan vs. borosilicate', tasksToday: 4 },
  { id: 'manufacturing', name: 'Manufacturing', group: 'Manufacturing', status: 'working', currentTask: 'Injection-mold feasibility study', tasksToday: 6 },
  { id: 'supplier', name: 'Supplier Research', group: 'Manufacturing', status: 'working', currentTask: 'Vetting 12 shortlisted suppliers', tasksToday: 8 },
  { id: 'cost', name: 'Cost Analysis', group: 'Manufacturing', status: 'working', currentTask: 'Recomputing unit cost @ 5K MOQ', tasksToday: 5 },
  { id: 'prototype', name: 'Prototype Planning', group: 'Manufacturing', status: 'working', currentTask: 'Sprint plan for P1 functional proto', tasksToday: 3 },
  { id: 'funding', name: 'Funding', group: 'Funding', status: 'working', currentTask: 'Preparing NSF SBIR application draft', tasksToday: 4 },
  { id: 'grants', name: 'Grant Research', group: 'Funding', status: 'working', currentTask: 'Scanning 137 open grant programs', tasksToday: 9 },
  { id: 'investors', name: 'Investor Research', group: 'Funding', status: 'idle', currentTask: '18 matched investors on watchlist', tasksToday: 2 },
  { id: 'pitch', name: 'Pitch Deck Generator', group: 'Funding', status: 'waiting', currentTask: 'Deck v3 awaiting your review', tasksToday: 1 },
  { id: 'finplan', name: 'Financial Planning', group: 'Funding', status: 'working', currentTask: '3-year projection sensitivity run', tasksToday: 3 },
  { id: 'branding', name: 'Branding', group: 'Growth', status: 'idle', currentTask: 'Brand book v1 complete', tasksToday: 1 },
  { id: 'logo', name: 'Logo Design', group: 'Growth', status: 'idle', currentTask: '6 concepts delivered', tasksToday: 0 },
  { id: 'marketing', name: 'Marketing', group: 'Growth', status: 'working', currentTask: 'Pre-launch waitlist funnel draft', tasksToday: 5 },
  { id: 'sales', name: 'Sales', group: 'Growth', status: 'idle', currentTask: 'Channel strategy queued post-proto', tasksToday: 0 },
  { id: 'retail', name: 'Retail Distribution', group: 'Growth', status: 'idle', currentTask: 'Target retailer list drafted', tasksToday: 1 },
  { id: 'licensing', name: 'Licensing', group: 'Growth', status: 'working', currentTask: 'Evaluating 2 inbound licensing fits', tasksToday: 2 },
  { id: 'qa', name: 'Quality Assurance', group: 'Operations', status: 'idle', currentTask: 'Test protocol drafted for P1', tasksToday: 1 },
  { id: 'ops', name: 'Operations', group: 'Operations', status: 'working', currentTask: 'Compliance checklist (FDA food-contact)', tasksToday: 3 },
  { id: 'analytics', name: 'Analytics', group: 'Operations', status: 'working', currentTask: 'Weekly project health recompute', tasksToday: 6 },
];

export interface Project {
  id: string;
  name: string;
  tagline: string;
  stageIndex: number;
  health: number;
  risk: number;
  image: string;
  estCompletion: string;
  activity: string;
  nextMilestone: string;
  updated: string;
  favorite: boolean;
  archived: boolean;
}

// NOTE: The retired demo projects (HydraCore, GripMate, SolarLeaf) and all
// dashboard demo arrays (OVERNIGHT_DISCOVERIES, RUNNING_TASKS, APPROVALS,
// RISKS, RECOMMENDATIONS, MILESTONES) have been REMOVED. All of that content
// is now generated from the user's REAL projects — see src/lib/projectInsights.ts
// and src/hooks/useProjects.ts.

// COMPETITORS and PATENT_RESULTS (old demo-product data) have been REMOVED —
// the Research and Patents views now generate everything from the user's real
// active project via src/lib/projectInsights.ts (getMarketResearch, getPatentSnapshot).

export const GRANTS = [
  { name: 'NSF SBIR Phase I', amount: '$275,000', deadline: 'Sep 4, 2026', fit: 88, status: 'Draft in progress' },
  { name: 'State Innovation Fund', amount: '$25,000', deadline: 'Aug 15, 2026', fit: 81, status: 'Matched' },
  { name: 'EPA P3 Sustainability', amount: '$75,000', deadline: 'Oct 30, 2026', fit: 74, status: 'Matched' },
  { name: 'DOE Clean Water Tech', amount: '$150,000', deadline: 'Nov 12, 2026', fit: 63, status: 'Watching' },
];

export const INVESTORS = [
  { name: 'Ridgeline Hardware Fund', focus: 'Consumer hardware, Seed', check: '$250K–$1M', match: 91 },
  { name: 'Bluewater Ventures', focus: 'Water tech, Pre-seed/Seed', check: '$100K–$500K', match: 84 },
  { name: 'Forge Angels Syndicate', focus: 'Inventor-led products', check: '$25K–$150K', match: 79 },
  { name: 'Meridian Consumer', focus: 'DTC brands, Seed–A', check: '$500K–$2M', match: 66 },
];

export const SUPPLIERS = [
  { name: 'OptoLite Technology', location: 'Shenzhen, CN', part: 'Optical LED module', moq: '5,000', unitCost: '$3.20', cert: 'ISO 13485', rating: 4.8 },
  { name: 'Vertex Molding Co.', location: 'Dongguan, CN', part: 'Polymer housing (injection)', moq: '5,000', unitCost: '$2.85', cert: 'ISO 9001', rating: 4.6 },
  { name: 'NovaCell Energy', location: 'Suzhou, CN', part: '280mAh LiPo battery', moq: '10,000', unitCost: '$1.40', cert: 'UN38.3', rating: 4.7 },
  { name: 'Precision Seal Works', location: 'Taichung, TW', part: 'Food-grade silicone seals', moq: '20,000', unitCost: '$0.22', cert: 'FDA 21 CFR', rating: 4.9 },
  { name: 'Apex PCB Assembly', location: 'Penang, MY', part: 'Control PCBA', moq: '5,000', unitCost: '$4.10', cert: 'IPC-A-610', rating: 4.5 },
  { name: 'ClearForm Optics', location: 'Ningbo, CN', part: 'Quartz optical window', moq: '10,000', unitCost: '$0.95', cert: 'RoHS', rating: 4.4 },
];

export const CAD_FILES = [
  { name: 'Housing_v4', type: 'CAD Model', version: 'v4 (in progress)', updated: 'Today, 5:12 AM', size: '24.8 MB', image: IMAGES.cadA },
  { name: 'Assembly_v3', type: 'Exploded View', version: 'v3', updated: 'Yesterday', size: '31.2 MB', image: IMAGES.cadB },
  { name: 'Cap_v3.step', type: 'STEP File', version: 'v3', updated: 'Jul 12', size: '8.4 MB', image: IMAGES.cadA },
  { name: 'Full_v3.stl', type: 'STL File', version: 'v3', updated: 'Jul 12', size: '12.1 MB', image: IMAGES.cadB },
];

export const BOM = [
  { part: 'Tritan Renew housing', qty: 1, material: 'Tritan Renew (50% PCR)', cost: '$2.85' },
  { part: 'Optical LED module', qty: 1, material: 'LED array + driver', cost: '$3.20' },
  { part: 'Control PCBA', qty: 1, material: 'FR-4, 4-layer', cost: '$4.10' },
  { part: 'LiPo battery 280mAh', qty: 1, material: 'Li-polymer', cost: '$1.40' },
  { part: 'Quartz UV window', qty: 1, material: 'Fused quartz', cost: '$0.95' },
  { part: 'Silicone seal set', qty: 3, material: 'Food-grade silicone', cost: '$0.66' },
  { part: 'Stainless inner vessel', qty: 1, material: '304 stainless', cost: '$3.40' },
  { part: 'Fasteners & misc', qty: 8, material: 'Various', cost: '$0.58' },
];

export const LEGAL_DOCS = [
  { type: 'Mutual NDA', desc: 'Protect your idea before sharing with contractors or suppliers.', credits: 5, review: true },
  { type: 'Licensing Agreement', desc: 'License your invention to manufacturers or brands.', credits: 5, review: true },
  { type: 'Manufacturing Agreement', desc: 'Terms, QC standards and IP protection with your factory.', credits: 5, review: true },
  { type: 'Contractor Agreement', desc: 'Work-for-hire terms with IP assignment for freelancers.', credits: 5, review: true },
  { type: 'Operating Agreement', desc: 'LLC structure, ownership and governance for your venture.', credits: 5, review: true },
  { type: 'Patent Prep Package', desc: 'Claims draft, spec outline and drawings brief for your attorney.', credits: 8, review: true },
  { type: 'Trademark Guidance', desc: 'Class selection, clearance search summary and filing roadmap.', credits: 3, review: true },
  { type: 'Compliance Report', desc: 'FDA / FCC / CE requirements mapped to your product category.', credits: 5, review: false },
];

export const DOCUMENTS = [
  { name: 'Market Validation Report v2', dept: 'Research', date: 'Jul 15', pages: 28, kind: 'report' },
  { name: 'Patent Landscape Analysis', dept: 'Patent Research', date: 'Jul 14', pages: 19, kind: 'report' },
  { name: 'Business Plan v3', dept: 'Financial Planning', date: 'Jul 12', pages: 42, kind: 'plan' },
  { name: 'Pitch Deck v3', dept: 'Pitch Deck Generator', date: 'Jul 11', pages: 14, kind: 'deck' },
  { name: 'SWOT Analysis', dept: 'Research', date: 'Jul 10', pages: 6, kind: 'report' },
  { name: 'Supplier Comparison Matrix', dept: 'Supplier Research', date: 'Jul 9', pages: 11, kind: 'report' },
  { name: 'NSF SBIR Draft (sections 1–4)', dept: 'Grant Research', date: 'Today', pages: 22, kind: 'draft' },
  { name: 'Bill of Materials v3', dept: 'Materials Engineering', date: 'Jul 8', pages: 4, kind: 'spec' },
];

export const PLANS = [
  {
    id: 'explorer', name: 'Explorer', price: 0, tagline: 'Is my invention worth pursuing?',
    credits: 20,
    features: ['1 active invention', 'AI chat assistant', 'Idea capture & validation', 'Basic competitive research', 'Basic patent search', 'Basic market validation', 'Dashboard & timeline'],
    excluded: ['Engineering & CAD', 'Legal document generation', 'Funding tools'],
  },
  {
    id: 'pro', name: 'Inventor Pro', price: 49, tagline: 'For inventors actively building products.',
    credits: 200, popular: true,
    features: ['Unlimited inventions', 'Continuous AI background work', 'Advanced patent analysis', 'Unlimited market research', 'Business plans & pitch decks', 'Grant & investor research', 'Manufacturing planning & supplier sourcing', 'Branding & logo generation', 'Financial projections', 'Limited legal documents'],
    excluded: ['CAD generation', 'STEP/STL file export'],
  },
  {
    id: 'enterprise', name: 'Enterprise', price: 99, tagline: 'The complete Atlas platform.',
    credits: 1000,
    features: ['Everything in Pro', 'Unlimited AI tasks & credits', 'Full CAD generation', 'STEP & STL export', 'Manufacturing blueprints', 'Exploded drawings & patent illustrations', 'Bills of Materials', 'Unlimited legal documents', 'Patent monitoring', 'Priority AI processing', 'API access', 'Advanced analytics'],
    excluded: [],
  },
];

export const CREDIT_COSTS = [
  { op: 'Patent Search', credits: 2 },
  { op: 'Market Report', credits: 3 },
  { op: 'Business Plan', credits: 8 },
  { op: 'Pitch Deck', credits: 8 },
  { op: 'Logo Generation', credits: 5 },
  { op: 'Legal Document', credits: 5 },
  { op: 'CAD Concept', credits: 25 },
  { op: 'STEP/STL Generation', credits: 40 },
  { op: 'Full Blueprint', credits: 50 },
];

export const NAV_ITEMS: { key: ViewKey; label: string }[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'projects', label: 'Projects' },
  { key: 'decisions', label: 'Decision Engine' },
  { key: 'research', label: 'Research' },
  { key: 'patents', label: 'Patents' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'cad', label: 'CAD Studio' },
  { key: 'manufacturing', label: 'Manufacturing' },
  { key: 'funding', label: 'Funding' },
  { key: 'marketing', label: 'Marketing' },
  { key: 'legal', label: 'Legal' },
  { key: 'documents', label: 'Documents' },
  { key: 'analytics', label: 'Analytics' },
  { key: 'pricing', label: 'Plans' },
  { key: 'settings', label: 'Settings' },
];

// ─── Intelligent Decision Engine ───

export interface DeptRecommendation {
  dept: string;
  recommendation: string;
  confidence: number;
}

export type DecisionCategory =
  | 'Engineering' | 'Patent' | 'Manufacturing' | 'Funding' | 'Marketing' | 'Legal' | 'Operations' | 'Research';

export interface DecisionImpact {
  timeline: string;       // e.g. "Reduced by ~2 weeks"
  cost: string;           // e.g. "$0 during planning"
  riskReduction: string;  // e.g. "Demand uncertainty reduced"
  departments: string[];  // departments updated by this decision
}

export interface DecisionReversal {
  previousDecision: string;
  reasonForReopening: string;
  newEvidence: string;
}

export interface DecisionRecord {
  id: string;
  topic: string;
  project: string;
  category: DecisionCategory;
  status: 'decided' | 'in-progress' | 'escalated';
  decidedAt?: string;
  inputs: DeptRecommendation[];
  decision: string;
  reasoning: string;
  confidence: number;
  nextStep: string;
  impact?: DecisionImpact;
  etaMinutes?: number;          // for in-progress decisions
  escalationReason?: string;
  approvalAction?: string;      // contextual primary button, e.g. "Approve Patent Filing"
  secondaryAction?: string;     // contextual secondary button, e.g. "Review Cost Breakdown"
  reversal?: DecisionReversal;  // present when a decision was reopened & revised
}

// Decisions are now generated per real project — see src/lib/projectInsights.ts (getDecisions)


// ─── Project file system ───

export const PROJECT_FOLDERS = [
  { name: 'Research', files: 14, size: '52 MB' },
  { name: 'Patent', files: 9, size: '31 MB' },
  { name: 'Engineering', files: 17, size: '88 MB' },
  { name: 'CAD', files: 11, size: '214 MB' },
  { name: 'Manufacturing', files: 8, size: '19 MB' },
  { name: 'Funding', files: 6, size: '12 MB' },
  { name: 'Marketing', files: 10, size: '44 MB' },
  { name: 'Branding', files: 12, size: '96 MB' },
  { name: 'Legal', files: 7, size: '9 MB' },
  { name: 'Pitch Deck', files: 4, size: '28 MB' },
  { name: 'Business Plan', files: 3, size: '11 MB' },
  { name: 'Images', files: 26, size: '182 MB' },
  { name: 'Exports', files: 5, size: '61 MB' },
  { name: 'Reports', files: 13, size: '37 MB' },
];

// Version history is now generated per real project — see src/lib/projectInsights.ts (getVersionHistory)

