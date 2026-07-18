import React, { useEffect, useMemo, useState } from 'react';
import {
  X, Sparkles, Loader2, Send, History, Download, RotateCcw, GitCompareArrows,
  FileText, ShieldAlert, Wand2, TrendingUp, ScrollText, Scissors, Maximize2,
  Table2, ListChecks, BarChart3, Save, Eye,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ProjectDoc, DocVersion, docPublicUrl, isImageExt, isTextExt, formatSize } from '@/hooks/useDocuments';
import { Badge } from '../ui';

// ─── Light markdown renderer ───

export function Markdown({ text }: { text: string }) {
  const html = useMemo(() => {
    const esc = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return esc
      .replace(/^### (.*)$/gm, '<h4 class="mt-3 mb-1 font-semibold text-slate-900 dark:text-white">$1</h4>')
      .replace(/^## (.*)$/gm, '<h3 class="mt-3 mb-1 font-semibold text-slate-900 dark:text-white">$1</h3>')
      .replace(/^# (.*)$/gm, '<h3 class="mt-3 mb-1 font-bold text-slate-900 dark:text-white">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900 dark:text-white">$1</strong>')
      .replace(/^\s*[-*] (.*)$/gm, '<div class="flex gap-2 my-0.5"><span class="text-blue-500 shrink-0">•</span><span>$1</span></div>')
      .replace(/^\|(.+)\|$/gm, '<div class="font-mono text-[11px] whitespace-pre overflow-x-auto text-slate-600 dark:text-slate-300">|$1|</div>')
      .replace(/\n\n/g, '<div class="h-2"></div>')
      .replace(/\n/g, '<br/>');
  }, [text]);
  return <div className="text-[13px] leading-relaxed text-slate-600 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─── Shared helpers ───

async function getDocContent(doc: ProjectDoc): Promise<string> {
  const withContent = [...(doc.versions || [])].reverse().find((v) => v.content);
  if (withContent?.content) return withContent.content.slice(0, 24000);
  if (isTextExt(doc.ext) && doc.storage_path) {
    try {
      const url = docPublicUrl(doc.storage_path);
      if (url) {
        const res = await fetch(url);
        if (res.ok) return (await res.text()).slice(0, 24000);
      }
    } catch { /* ignore */ }
  }
  return '';
}

async function runIntelligence(payload: Record<string, unknown>): Promise<string> {
  const { data, error } = await supabase.functions.invoke('atlas-doc-intelligence', { body: payload });
  if (error) throw new Error(error.message || 'AI request failed');
  if (data?.error) throw new Error(data.error);
  return data?.result || 'No result returned.';
}

function downloadText(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function ModalShell({ title, sub, onClose, children, wide }: { title: string; sub?: string; onClose: () => void; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={onClose}>
      <div
        className={`flex max-h-[88vh] w-full ${wide ? 'max-w-3xl' : 'max-w-2xl'} flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
            {sub && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{sub}</p>}
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

// ─── AI Intelligence modal ───

const AI_ACTIONS: { key: string; label: string; icon: React.ReactNode; saves?: boolean }[] = [
  { key: 'summarize', label: 'Summarize', icon: <FileText size={13} /> },
  { key: 'analyze', label: 'Analyze', icon: <BarChart3 size={13} /> },
  { key: 'risks', label: 'Find Risks', icon: <ShieldAlert size={13} /> },
  { key: 'improve', label: 'Suggest Improvements', icon: <Wand2 size={13} /> },
  { key: 'update-research', label: 'Update with New Research', icon: <TrendingUp size={13} />, saves: true },
  { key: 'rewrite', label: 'Rewrite Professionally', icon: <ScrollText size={13} />, saves: true },
  { key: 'expand', label: 'Expand', icon: <Maximize2 size={13} />, saves: true },
  { key: 'shorten', label: 'Shorten', icon: <Scissors size={13} />, saves: true },
  { key: 'exec-summary', label: 'Executive Summary', icon: <Sparkles size={13} />, saves: true },
  { key: 'extract-data', label: 'Extract Data', icon: <Table2 size={13} /> },
  { key: 'action-items', label: 'Generate Action Items', icon: <ListChecks size={13} /> },
];

interface AiModalProps {
  doc: ProjectDoc;
  projectName: string;
  projectStage: string;
  onClose: () => void;
  onSaveVersion: (doc: ProjectDoc, note: string, content: string) => Promise<string>;
  notify: (msg: string) => void;
}

export function DocumentAiModal({ doc, projectName, projectStage, onClose, onSaveVersion, notify }: AiModalProps) {
  const [running, setRunning] = useState<string | null>(null);
  const [result, setResult] = useState<{ action: string; label: string; text: string; saves?: boolean } | null>(null);
  const [error, setError] = useState('');
  const [chat, setChat] = useState<{ role: 'user' | 'atlas'; text: string }[]>([]);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [saved, setSaved] = useState(false);

  const isSurvey = doc.folder === 'Surveys' || /survey|responses/i.test(doc.name) || doc.ext === 'csv';
  const actions = isSurvey
    ? [{ key: 'survey', label: 'Analyze Survey Results', icon: <BarChart3 size={13} />, saves: true }, ...AI_ACTIONS]
    : AI_ACTIONS;

  const docMeta = { name: doc.name, ext: doc.ext, folder: doc.folder, size: doc.size, docType: doc.ai_meta?.docType };

  const run = async (key: string, label: string, saves?: boolean) => {
    setRunning(key); setError(''); setResult(null); setSaved(false);
    try {
      const content = await getDocContent(doc);
      const text = await runIntelligence({ action: key, document: docMeta, content, projectName, projectStage });
      setResult({ action: key, label, text, saves });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setRunning(null);
    }
  };

  const ask = async () => {
    const q = question.trim();
    if (!q || asking) return;
    setQuestion('');
    setChat((prev) => [...prev, { role: 'user', text: q }]);
    setAsking(true);
    try {
      const content = await getDocContent(doc);
      const text = await runIntelligence({ action: 'ask', document: docMeta, content, question: q, projectName, projectStage });
      setChat((prev) => [...prev, { role: 'atlas', text }]);
    } catch (e) {
      setChat((prev) => [...prev, { role: 'atlas', text: `Something went wrong: ${(e as Error).message}` }]);
    } finally {
      setAsking(false);
    }
  };

  const saveVersion = async () => {
    if (!result) return;
    const v = await onSaveVersion(doc, `AI update: ${result.label}`, result.text);
    setSaved(true);
    notify(`"${doc.name}" updated to Version ${v} (${result.label}) — original formatting preserved`);
  };

  return (
    <ModalShell title={`Atlas Intelligence — ${doc.name}`} sub={`${doc.ai_meta?.docType || doc.ext.toUpperCase()} • ${projectName} • Version ${doc.current_version}`} onClose={onClose} wide>
      <div className="flex flex-wrap gap-1.5 border-b border-slate-200 px-5 py-3 dark:border-slate-800">
        {actions.map((a) => (
          <button
            key={a.key}
            onClick={() => run(a.key, a.label, a.saves)}
            disabled={!!running}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors disabled:opacity-50 ${
              result?.action === a.key
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {running === a.key ? <Loader2 size={13} className="animate-spin" /> : a.icon}
            {a.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4">
        {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</div>}

        {running && !result && (
          <div className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
            <Loader2 size={15} className="animate-spin" />
            Atlas is reading the document — structure, data, branding and context…
          </div>
        )}

        {result && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <Badge color="blue">{result.label}</Badge>
              <div className="flex gap-2">
                <button onClick={() => downloadText(`${doc.name.replace(/\.[^.]+$/, '')} — ${result.label}.md`, result.text)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-white dark:border-slate-600 dark:text-slate-300">
                  <Download size={11} /> Download
                </button>
                {result.saves && (
                  <button onClick={saveVersion} disabled={saved} className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                    <Save size={11} /> {saved ? 'Saved as new version' : `Save as Version ${doc.current_version.split('.')[0]}.${parseInt(doc.current_version.split('.')[1] || '0', 10) + 1}`}
                  </button>
                )}
              </div>
            </div>
            <Markdown text={result.text} />
          </div>
        )}

        {!result && !running && chat.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 p-5 text-center text-xs text-slate-400 dark:border-slate-700">
            Pick a smart action above, or ask Atlas anything about this document below.
            {!isTextExt(doc.ext) && !doc.versions?.some((v) => v.content) && (
              <div className="mt-2 text-[11px]">Binary file — Atlas reasons from its type, name and project context. CSV/TXT exports unlock full-content analysis.</div>
            )}
          </div>
        )}

        {chat.length > 0 && (
          <div className="mt-3 space-y-2">
            {chat.map((m, i) => (
              <div key={i} className={`rounded-xl px-3.5 py-2.5 text-[13px] ${m.role === 'user' ? 'ml-8 bg-blue-600 text-white' : 'mr-8 border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'}`}>
                {m.role === 'user' ? m.text : <Markdown text={m.text} />}
              </div>
            ))}
            {asking && <div className="mr-8 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-400 dark:border-slate-700 dark:bg-slate-800"><Loader2 size={12} className="animate-spin" /> Atlas is checking the document…</div>}
          </div>
        )}
      </div>

      <div className="border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && ask()}
            placeholder={`Ask Atlas about this document — e.g. "What concerns did customers mention most?"`}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button onClick={ask} disabled={asking || !question.trim()} className="rounded-lg bg-blue-600 px-3.5 text-white hover:bg-blue-700 disabled:opacity-50">
            <Send size={15} />
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

// ─── Version history modal ───

interface VersionsModalProps {
  doc: ProjectDoc;
  projectName: string;
  projectStage: string;
  onClose: () => void;
  onRestore: (doc: ProjectDoc, v: DocVersion) => Promise<string>;
  notify: (msg: string) => void;
}

export function DocumentVersionsModal({ doc, projectName, projectStage, onClose, onRestore, notify }: VersionsModalProps) {
  const versions = [...(doc.versions || [])].reverse();
  const [viewing, setViewing] = useState<DocVersion | null>(null);
  const [comparing, setComparing] = useState(false);
  const [compareResult, setCompareResult] = useState('');

  const download = (v: DocVersion) => {
    if (v.content) {
      downloadText(`${doc.name.replace(/\.[^.]+$/, '')} — v${v.version}.md`, v.content);
    } else if (v.storagePath) {
      const url = docPublicUrl(v.storagePath);
      if (url) window.open(url, '_blank');
    }
  };

  const compare = async (v: DocVersion) => {
    const idx = doc.versions.findIndex((x) => x.version === v.version);
    const prev = doc.versions[idx - 1];
    setComparing(true); setCompareResult('');
    try {
      const text = await runIntelligence({
        action: 'compare',
        document: { name: doc.name, ext: doc.ext, folder: doc.folder, size: doc.size },
        content: v.content || `(Version ${v.version} — binary file "${doc.name}", note: ${v.note})`,
        compareWith: prev?.content || `(Version ${prev?.version || '1.0'} — ${prev?.note || 'original upload'})`,
        projectName, projectStage,
      });
      setCompareResult(text);
    } catch (e) {
      setCompareResult(`Comparison failed: ${(e as Error).message}`);
    } finally {
      setComparing(false);
    }
  };

  return (
    <ModalShell title={`Version History — ${doc.name}`} sub={`${versions.length} version${versions.length === 1 ? '' : 's'} • current: v${doc.current_version}`} onClose={onClose} wide>
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="space-y-2">
          {versions.map((v) => (
            <div key={v.version} className="rounded-xl border border-slate-200 p-3.5 dark:border-slate-700">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge color={v.version === doc.current_version ? 'blue' : 'slate'}>Version {v.version}</Badge>
                  {v.version === doc.current_version && <span className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">Current</span>}
                </div>
                <span className="text-[11px] text-slate-400">{new Date(v.createdAt).toLocaleString()}</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-600 dark:text-slate-300">{v.note}</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {v.content && (
                  <button onClick={() => setViewing(viewing?.version === v.version ? null : v)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                    <Eye size={11} /> {viewing?.version === v.version ? 'Hide changes' : 'View changes'}
                  </button>
                )}
                <button onClick={() => download(v)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                  <Download size={11} /> Download
                </button>
                {versions.length > 1 && (
                  <button onClick={() => compare(v)} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
                    <GitCompareArrows size={11} /> Compare with previous
                  </button>
                )}
                {v.version !== doc.current_version && (
                  <button
                    onClick={async () => {
                      const nv = await onRestore(doc, v);
                      notify(`"${doc.name}" restored from v${v.version} → now Version ${nv}`);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                  >
                    <RotateCcw size={11} /> Restore
                  </button>
                )}
              </div>
              {viewing?.version === v.version && v.content && (
                <div className="mt-3 max-h-64 overflow-y-auto rounded-lg bg-slate-50 p-3 dark:bg-slate-800/60">
                  <Markdown text={v.content} />
                </div>
              )}
            </div>
          ))}
        </div>

        {(comparing || compareResult) && (
          <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/5">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-300">
              <GitCompareArrows size={13} /> Version Comparison
            </div>
            {comparing ? (
              <div className="flex items-center gap-2 text-xs text-blue-600 dark:text-blue-300"><Loader2 size={12} className="animate-spin" /> Atlas is comparing versions…</div>
            ) : (
              <Markdown text={compareResult} />
            )}
          </div>
        )}
      </div>
    </ModalShell>
  );
}

// ─── Preview modal ───

export function DocumentPreviewModal({ doc, onClose }: { doc: ProjectDoc; onClose: () => void }) {
  const url = docPublicUrl(doc.storage_path);
  const [text, setText] = useState<string | null>(null);
  const latestContent = [...(doc.versions || [])].reverse().find((v) => v.content)?.content;

  useEffect(() => {
    let alive = true;
    if (isTextExt(doc.ext) && url) {
      fetch(url).then((r) => (r.ok ? r.text() : '')).then((t) => alive && setText(t.slice(0, 40000))).catch(() => {});
    }
    return () => { alive = false; };
  }, [doc.ext, url]);

  return (
    <ModalShell title={doc.name} sub={`${doc.ext.toUpperCase()} • ${formatSize(doc.size)} • v${doc.current_version} • ${doc.folder}`} onClose={onClose} wide>
      <div className="flex-1 overflow-y-auto p-5">
        {isImageExt(doc.ext) && url ? (
          <img src={url} alt={doc.name} className="mx-auto max-h-[60vh] rounded-lg object-contain" />
        ) : doc.ext === 'pdf' && url ? (
          <iframe src={url} title={doc.name} className="h-[60vh] w-full rounded-lg border border-slate-200 dark:border-slate-700" />
        ) : text ? (
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-50 p-4 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">{text}</pre>
        ) : latestContent ? (
          <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-800/60">
            <div className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Latest Atlas-updated content (v{doc.current_version})</div>
            <Markdown text={latestContent} />
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <History size={28} className="text-slate-300" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No inline preview available for {doc.ext.toUpperCase()} files.</p>
            {url && (
              <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                <Download size={14} /> Download file
              </a>
            )}
          </div>
        )}
      </div>
      {url && (isImageExt(doc.ext) || doc.ext === 'pdf' || text) && (
        <div className="border-t border-slate-200 px-5 py-3 text-right dark:border-slate-800">
          <a href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800">
            <Download size={13} /> Download
          </a>
        </div>
      )}
    </ModalShell>
  );
}
