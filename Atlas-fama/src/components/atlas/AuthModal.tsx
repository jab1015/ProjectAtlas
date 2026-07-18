import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function AuthModal({ open, onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (res.error) {
          setError(res.error);
        } else {
          onClose();
        }
      } else {
        const res = await signUp(name, email, password);
        if (res.error) {
          setError(res.error);
        } else if (res.needsConfirm) {
          setInfo('Account created. Check your email to confirm, then sign in.');
          setMode('signin');
        } else {
          onClose();
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-[#0A1628] to-[#0d2a52] px-6 py-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <Sparkles size={16} />
              </div>
              <div>
                <div className="text-base font-bold">{mode === 'signin' ? 'Welcome back' : 'Create your account'}</div>
                <div className="text-xs text-slate-300">
                  {mode === 'signin' ? 'Your AI departments kept working while you were away.' : 'Hire an entire AI invention company in 30 seconds.'}
                </div>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-300 hover:text-white" aria-label="Close"><X size={18} /></button>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-3 p-6">
          {mode === 'signup' && (
            <div className="relative">
              <UserIcon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required className={inputCls} />
            </div>
          )}
          <div className="relative">
            <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com" required className={inputCls} />
          </div>
          <div className="relative">
            <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (6+ characters)" required className={inputCls} />
          </div>

          {error && <p className="rounded-lg bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-500/10 dark:text-red-400">{error}</p>}
          {info && <p className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300">{info}</p>}

          <button type="submit" disabled={loading}
            className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60">
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>

          <p className="pt-1 text-center text-xs text-slate-500 dark:text-slate-400">
            {mode === 'signin' ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button type="button" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setInfo(''); }}
              className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
              {mode === 'signin' ? 'Sign up free' : 'Sign in'}
            </button>
          </p>
          <p className="text-center text-[10px] text-slate-400">
            Your credits, plan, approvals and documents are saved to your account.
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/60">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Quick access — demo accounts</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button type="button"
                onClick={() => { setMode('signin'); setEmail('admin@projectatlas.ai'); setPassword('AtlasAdmin2026!'); setError(''); setInfo('Admin credentials filled — press Sign In.'); }}
                className="rounded-md border border-purple-300 px-2 py-1.5 text-[11px] font-semibold text-purple-700 hover:bg-purple-50 dark:border-purple-500/40 dark:text-purple-300 dark:hover:bg-purple-500/10">
                Administrator
              </button>
              <button type="button"
                onClick={() => { setMode('signin'); setEmail('tester@projectatlas.ai'); setPassword('AtlasTester2026!'); setError(''); setInfo('Tester credentials filled — press Sign In.'); }}
                className="rounded-md border border-amber-300 px-2 py-1.5 text-[11px] font-semibold text-amber-700 hover:bg-amber-50 dark:border-amber-500/40 dark:text-amber-300 dark:hover:bg-amber-500/10">
                Tester
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
}
