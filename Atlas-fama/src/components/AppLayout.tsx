import React, { useEffect, useState } from 'react';
import Sidebar from './atlas/Sidebar';
import TopBar from './atlas/TopBar';
import DashboardView from './atlas/DashboardView';
import ProjectsView from './atlas/ProjectsView';
import DecisionEngineView from './atlas/DecisionEngineView';
import FloatingAssistant from './atlas/FloatingAssistant';
import AuthModal from './atlas/AuthModal';
import AdminView from './atlas/AdminView';
import { ResearchView, PatentsView } from './atlas/ResearchViews';
import { EngineeringView, CADView, ManufacturingView } from './atlas/EngineeringViews';
import { FundingView, MarketingView, LegalView } from './atlas/BusinessViews';
import DocumentHub from './atlas/documents/DocumentHub';

import { AnalyticsView, SettingsView, PricingView } from './atlas/MiscViews';
import { ViewKey, NAV_ITEMS } from '@/data/atlasData';
import { useAuth } from '@/contexts/AuthContext';

const DEFAULTS = { credits: 788, plan: 'enterprise', approvedIds: [] as string[], generatedDocs: [] as string[] };

const VIEW_TITLES: Record<ViewKey, { title: string; sub: string }> = {
  dashboard: { title: 'Dashboard', sub: 'Your AI invention company at a glance' },
  projects: { title: 'Projects & Departments', sub: 'Every invention, every AI department, one engine' },
  decisions: { title: 'Decision Engine', sub: 'Departments disagree, Atlas decides — you only approve what the law requires' },
  research: { title: 'Research', sub: 'Market intelligence, competitors, customers and SWOT' },
  patents: { title: 'Patents', sub: 'Search, patentability, monitoring and filing strategy' },
  engineering: { title: 'Engineering', sub: 'Simulations, materials and technical analysis' },
  cad: { title: 'CAD Studio', sub: 'Models, STEP/STL export, blueprints and BOM' },
  manufacturing: { title: 'Manufacturing', sub: 'Suppliers, cost analysis and prototype planning' },
  funding: { title: 'Funding', sub: 'Grants, investors, pitch decks and projections' },
  marketing: { title: 'Marketing', sub: 'Brand, campaigns and launch planning' },
  legal: { title: 'Legal', sub: 'AI-drafted documents with human review checkpoints' },
  documents: { title: 'Document Hub', sub: 'Upload, organize and improve every document — Atlas analyzes, versions and keeps them current' },

  analytics: { title: 'Analytics', sub: 'AI activity, launch readiness and insights' },
  pricing: { title: 'Plans & Credits', sub: 'Choose how much of the company you hire' },
  settings: { title: 'Settings', sub: 'Profile, Inventor Twin and preferences' },
  admin: { title: 'Admin Panel', sub: 'Manage users, plans, credits and roles' },
};



export default function AppLayout() {
  const { user, profile, updateProfile } = useAuth();
  const [view, setView] = useState<ViewKey>('dashboard');
  const [dark, setDark] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);

  const [credits, setCredits] = useState(DEFAULTS.credits);
  const [plan, setPlan] = useState(DEFAULTS.plan);
  const [approvedIds, setApprovedIds] = useState<string[]>(DEFAULTS.approvedIds);
  const [generatedDocs, setGeneratedDocs] = useState<string[]>(DEFAULTS.generatedDocs);

  const [notifications, setNotifications] = useState<string[]>([
    'Grant Research matched NSF SBIR Phase I ($275K)',
    'CAD v4 rebuild reached 68% — approval unlocks STEP export',
    'Competitor price move detected — positioning memo ready',
  ]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  // Hydrate per-user state when a profile loads; reset to defaults on sign-out
  useEffect(() => {
    if (profile) {
      setCredits(profile.credits);
      setPlan(profile.plan);
      setApprovedIds(profile.approved_ids || []);
      setGeneratedDocs(profile.generated_docs || []);
    } else {
      setCredits(DEFAULTS.credits);
      setPlan(DEFAULTS.plan);
      setApprovedIds(DEFAULTS.approvedIds);
      setGeneratedDocs(DEFAULTS.generatedDocs);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id]);

  const notify = (msg: string) => setNotifications((prev) => [msg, ...prev].slice(0, 8));

  const spend = (n: number, msg: string) => {
    const next = Math.max(0, credits - n);
    setCredits(next);
    notify(msg);
    if (user) updateProfile({ credits: next });
  };

  const approve = (id: string) => {
    const next = [...approvedIds, id];
    setApprovedIds(next);
    notify('Approval recorded — dependent departments unblocked');
    if (user) updateProfile({ approved_ids: next });
  };

  const onGenerated = (type: string) => {
    const next = [...generatedDocs, type];
    setGeneratedDocs(next);
    if (user) updateProfile({ generated_docs: next });
  };

  const selectPlan = (id: string) => {
    setPlan(id);
    notify(`Plan updated: ${id}`);
    if (user) {
      updateProfile({ plan: id });
    } else {
      setAuthOpen(true);
    }
  };

  const meta = VIEW_TITLES[view];
  const userName = profile?.name || user?.email?.split('@')[0] || 'Inventor';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 dark:bg-[#0A1628] dark:text-white">
      <Sidebar view={view} setView={setView} credits={credits} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="lg:pl-60">
        <TopBar dark={dark} toggleDark={() => setDark(!dark)} onMenu={() => setSidebarOpen(true)} notifications={notifications} onSignIn={() => setAuthOpen(true)} />

        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {!user && (
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-500/20 dark:bg-blue-500/10">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                You're exploring in guest mode. Sign in to save your credits, plan, approvals and documents to your account.
              </p>
              <button onClick={() => setAuthOpen(true)} className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
                Sign In / Sign Up
              </button>
            </div>
          )}

          {view !== 'dashboard' && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{meta.title}</h1>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{meta.sub}</p>
            </div>
          )}

          <div className="animate-fade-in" key={view}>
            {view === 'dashboard' && <DashboardView approvedIds={approvedIds} onApprove={approve} setView={setView} userName={userName} />}
            {view === 'projects' && <ProjectsView />}
            {view === 'decisions' && <DecisionEngineView />}

            {view === 'research' && <ResearchView />}
            {view === 'patents' && <PatentsView credits={credits} spend={spend} />}
            {view === 'engineering' && <EngineeringView />}
            {view === 'cad' && <CADView credits={credits} spend={spend} />}
            {view === 'manufacturing' && <ManufacturingView />}
            {view === 'funding' && <FundingView spend={spend} />}
            {view === 'marketing' && <MarketingView />}
            {view === 'legal' && <LegalView credits={credits} spend={spend} generatedDocs={generatedDocs} onGenerated={onGenerated} />}
            {view === 'documents' && <DocumentHub notify={notify} />}

            {view === 'analytics' && <AnalyticsView />}
            {view === 'pricing' && <PricingView currentPlan={plan} onSelect={selectPlan} />}
            {view === 'settings' && <SettingsView dark={dark} toggleDark={() => setDark(!dark)} />}
            {view === 'admin' && <AdminView />}

          </div>

          <footer className="mt-12 border-t border-slate-200 pb-8 pt-6 text-center dark:border-slate-800">
            <div className="text-xs text-slate-400">
              Project Atlas — AI Inventor Operating System • {NAV_ITEMS.length} modules • 37 AI departments working for you
            </div>
            <div className="mt-1 text-[11px] text-slate-400">
              Atlas prepares everything; humans approve what the law requires. Legal documents always require attorney review.
            </div>
          </footer>
        </main>
      </div>

      <FloatingAssistant />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
