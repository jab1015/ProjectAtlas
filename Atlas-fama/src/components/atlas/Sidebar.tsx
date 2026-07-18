import React from 'react';
import {
  LayoutDashboard, FolderKanban, Microscope, ScrollText, Cog, Box,
  Factory, Landmark, Megaphone, Scale, FileText, BarChart3, Settings, Sparkles, X, ShieldCheck, BrainCircuit,
} from 'lucide-react';
import { NAV_ITEMS, ViewKey } from '@/data/atlasData';
import { useAuth } from '@/contexts/AuthContext';

const ICONS: Record<ViewKey, React.ReactNode> = {
  dashboard: <LayoutDashboard size={17} />,
  projects: <FolderKanban size={17} />,
  decisions: <BrainCircuit size={17} />,
  research: <Microscope size={17} />,
  patents: <ScrollText size={17} />,
  engineering: <Cog size={17} />,
  cad: <Box size={17} />,
  manufacturing: <Factory size={17} />,
  funding: <Landmark size={17} />,
  marketing: <Megaphone size={17} />,
  legal: <Scale size={17} />,
  documents: <FileText size={17} />,
  analytics: <BarChart3 size={17} />,
  pricing: <Sparkles size={17} />,
  settings: <Settings size={17} />,
  admin: <ShieldCheck size={17} />,
};


interface Props {
  view: ViewKey;
  setView: (v: ViewKey) => void;
  credits: number;
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ view, setView, credits, open, onClose }: Props) {
  const { isAdmin } = useAuth();

  const itemCls = (key: ViewKey) =>
    `mb-0.5 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      view === key
        ? 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
    }`;

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />}
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-slate-200 bg-white transition-transform dark:border-slate-800 dark:bg-[#0A1628] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <button onClick={() => setView('dashboard')} className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg shadow-blue-500/25">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L2 19h20L12 2z" strokeLinejoin="round" />
                <circle cx="12" cy="14" r="2" fill="white" stroke="none" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">Project Atlas</div>
              <div className="text-[10px] uppercase tracking-widest text-slate-400">Inventor OS</div>
            </div>
          </button>
          <button onClick={onClose} className="text-slate-400 lg:hidden"><X size={18} /></button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <button key={item.key} onClick={() => { setView(item.key); onClose(); }} className={itemCls(item.key)}>
              {ICONS[item.key]}
              {item.label}
            </button>
          ))}

          {isAdmin && (
            <>
              <div className="mb-1 mt-4 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Administration</div>
              <button onClick={() => { setView('admin'); onClose(); }} className={itemCls('admin')}>
                {ICONS.admin}
                Admin Panel
                <span className="ml-auto rounded-full bg-purple-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-purple-700 dark:bg-purple-500/15 dark:text-purple-300">Admin</span>
              </button>
            </>
          )}
        </nav>

        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Credits</span>
              <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400">{credits}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" style={{ width: `${Math.min(100, (credits / 1000) * 100)}%` }} />
            </div>
            <button onClick={() => { setView('pricing'); onClose(); }} className="mt-2.5 w-full rounded-md bg-blue-600 py-1.5 text-xs font-semibold text-white hover:bg-blue-700">
              Enterprise Plan
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
