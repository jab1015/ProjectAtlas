import React, { useEffect, useRef, useState } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { LIFECYCLE_STAGES } from '@/data/atlasData';
import { useProjects } from '@/hooks/useProjects';

interface Msg { role: 'user' | 'assistant'; content: string }

const SUGGESTIONS = [
  'What did my departments do overnight?',
  'Is my patent strategy safe?',
  'How do I fund my prototype?',
];

export default function FloatingAssistant() {
  const { projects } = useProjects();
  const activeProject = projects.find((p) => !p.archived) ?? projects[0] ?? null;
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: 'assistant', content: "I'm Atlas — the AI running your invention company. I know your project's research, patents, engineering, CAD, funding and legal status. What do you need?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || loading) return;
    const next: Msg[] = [...messages, { role: 'user', content }];
    setMessages(next);
    setInput('');
    setLoading(true);

    const p = activeProject;
    const policy = 'OPERATING POLICY (Executive AI Mode): Atlas is the executive leadership team of an autonomous invention company, not a task manager. Default behavior: analyze, decide, execute, document, report. Atlas decides AUTONOMOUSLY (then informs the owner afterward): target customer segments, validation surveys, competitor selection, research order, patent search classifications, engineering task priority, milestones, supplier investigation, cost analyses, business document drafts, marketing strategies, timeline updates. Atlas asks for approval ONLY for: spending money, filing legal documents, public product launches, licensing agreements, preference-based product-vision choices, physical prototype evaluation, or decisions that materially change the invention\u2019s intended purpose. Never ask the user permission for autonomous-category work \u2014 report that it is done or in progress. Reconsider past decisions automatically when new evidence appears.';
    const context = p
      ? `${policy} Active project: ${p.name} — ${p.tagline}. Stage: ${LIFECYCLE_STAGES[p.stageIndex]} (${p.stageIndex + 1} of ${LIFECYCLE_STAGES.length}). Health: ${p.health}/100. Risk score: ${p.risk}. Est. launch ${p.estCompletion}. Current activity: ${p.activity}. Next milestone: ${p.nextMilestone}. The user has ${projects.length} project(s) total: ${projects.map((x) => x.name).join(', ')}.`
      : `${policy} The user has no projects yet. Encourage them to capture their first invention idea from the Projects page so Atlas departments can begin research, validation and patent work.`;


    try {
      const { data, error } = await supabase.functions.invoke('atlas-chat', {
        body: { messages: next, context },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      setMessages((m) => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages((m) => [...m, { role: 'assistant', content: 'I hit a connection issue reaching the orchestration engine. Please try again in a moment.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[520px] w-[min(400px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between bg-gradient-to-r from-[#0A1628] to-[#0d2a52] px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
                <Sparkles size={15} />
              </div>
              <div>
                <div className="text-sm font-bold">Atlas Assistant</div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" /> Context-aware{activeProject ? ` • ${activeProject.name}` : ''}
                </div>

              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-300 hover:text-white"><X size={18} /></button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm ${m.role === 'user'
                  ? 'rounded-br-sm bg-blue-600 text-white'
                  : 'rounded-bl-sm bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'}`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3 dark:bg-slate-800">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <span key={i} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            {messages.length === 1 && (
              <div className="space-y-2 pt-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} onClick={() => send(s)}
                    className="block w-full rounded-lg border border-slate-200 px-3 py-2 text-left text-xs text-slate-600 hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-blue-500/5">
                    {s}
                  </button>
                ))}
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="border-t border-slate-100 p-3 dark:border-slate-800">
            <div className="flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()}
                placeholder="Ask Atlas anything..."
                className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
              <button onClick={() => send()} disabled={loading || !input.trim()}
                className="rounded-lg bg-blue-600 px-3 text-white hover:bg-blue-700 disabled:opacity-50">
                <Send size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-xl shadow-blue-500/30 transition hover:scale-105"
        aria-label="Open Atlas Assistant">
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="absolute right-0 top-0 h-3 w-3 animate-pulse rounded-full border-2 border-white bg-emerald-400" />}
      </button>
    </>
  );
}
