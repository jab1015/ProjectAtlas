import React, { useState } from 'react';
import { Search, Moon, Sun, Bell, Menu, LogOut, UserCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  dark: boolean;
  toggleDark: () => void;
  onMenu: () => void;
  notifications: string[];
  onSignIn: () => void;
}

export default function TopBar({ dark, toggleDark, onMenu, notifications, onSignIn }: Props) {
  const { user, profile, signOut } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [query, setQuery] = useState('');

  const displayName = profile?.name || user?.email?.split('@')[0] || '';
  const initials = displayName
    ? displayName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-[#0A1628]/80 sm:px-6">
      <button onClick={onMenu} className="text-slate-500 lg:hidden"><Menu size={20} /></button>

      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search projects, patents, documents..."
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200"
        />
      </div>

      <div className="ml-auto flex items-center gap-2">
        <span className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300 md:flex">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          21 AI departments working
        </span>

        <button onClick={toggleDark} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Toggle dark mode">
          {dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="relative">
          <button onClick={() => { setShowNotif(!showNotif); setShowUser(false); }} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800" aria-label="Notifications">
            <Bell size={18} />
            {notifications.length > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 text-[9px] font-bold text-white">
                {notifications.length}
              </span>
            )}
          </button>
          {showNotif && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
              <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Notifications</div>
              {notifications.map((n, i) => (
                <div key={i} className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">{n}</div>
              ))}
            </div>
          )}
        </div>

        {user ? (
          <div className="relative">
            <button onClick={() => { setShowUser(!showUser); setShowNotif(false); }}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-xs font-bold text-white ring-2 ring-transparent transition hover:ring-blue-400"
              aria-label="Account menu">
              {initials}
            </button>
            {showUser && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                  <UserCircle2 size={28} className="text-slate-400" />
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{displayName || 'Inventor'}</div>
                    <div className="truncate text-xs text-slate-400">{user.email}</div>
                  </div>
                </div>
                <div className="mx-3 mb-1 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-xs dark:bg-slate-800/60">
                  <span className="capitalize text-slate-500 dark:text-slate-400">{profile?.plan || 'explorer'} plan</span>
                  <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{profile?.credits ?? 0} cr</span>
                </div>
                <button onClick={() => { setShowUser(false); signOut(); }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                  <LogOut size={15} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button onClick={onSignIn}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            Sign In
          </button>
        )}
      </div>
    </header>
  );
}
