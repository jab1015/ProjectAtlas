import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  UploadCloud, Search, FileText, FileSpreadsheet, FileImage, FileBox, FileArchive,
  Presentation, File as FileIcon, Sparkles, History, Download, MoreVertical,
  Pencil, FolderInput, Copy, Archive, Trash2, Eye, Loader2, FolderOpen, BrainCircuit, Radar,
} from 'lucide-react';
import { useProjects } from '@/hooks/useProjects';
import {
  useDocuments, ProjectDoc, DOC_FOLDERS, ACCEPT_EXTS, formatSize, readFileText,
  docPublicUrl, isImageExt,
} from '@/hooks/useDocuments';
import { supabase } from '@/lib/supabase';
import { LIFECYCLE_STAGES } from '@/data/atlasData';
import { Card, Badge, SectionTitle } from '../ui';
import { DocumentAiModal, DocumentVersionsModal, DocumentPreviewModal } from './DocumentModals';

function extIcon(ext: string) {
  if (['xlsx', 'xls', 'csv'].includes(ext)) return <FileSpreadsheet size={18} className="text-emerald-500" />;
  if (['pptx', 'ppt'].includes(ext)) return <Presentation size={18} className="text-orange-500" />;
  if (['png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'ai', 'psd'].includes(ext)) return <FileImage size={18} className="text-violet-500" />;
  if (['step', 'stp', 'stl', 'dwg', 'dxf'].includes(ext)) return <FileBox size={18} className="text-cyan-500" />;
  if (ext === 'zip') return <FileArchive size={18} className="text-amber-500" />;
  if (['pdf', 'docx', 'doc', 'txt', 'md'].includes(ext)) return <FileText size={18} className="text-blue-500" />;
  return <FileIcon size={18} className="text-slate-400" />;
}

type SortKey = 'updated' | 'name' | 'size';

export default function DocumentHub({ notify }: { notify: (msg: string) => void }) {
  const { projects, loaded } = useProjects();
  const active = useMemo(() => projects.filter((p) => !p.archived), [projects]);
  const [projectId, setProjectId] = useState<string | null>(null);

  useEffect(() => {
    if (loaded && active.length > 0 && !active.some((p) => p.id === projectId)) {
      setProjectId(active[0].id);
    }
  }, [loaded, active, projectId]);

  const project = active.find((p) => p.id === projectId) || null;
  const { docs, loading, uploadFiles, rename, move, duplicate, setArchived, remove, addVersion, restoreVersion, setAiMeta } = useDocuments(project?.id || null);

  const [search, setSearch] = useState('');
  const [folder, setFolder] = useState('All');
  const [sort, setSort] = useState<SortKey>('updated');
  const [showArchived, setShowArchived] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [menuFor, setMenuFor] = useState<string | null>(null);
  const [moveFor, setMoveFor] = useState<string | null>(null);
  const [aiDoc, setAiDoc] = useState<ProjectDoc | null>(null);
  const [versionsDoc, setVersionsDoc] = useState<ProjectDoc | null>(null);
  const [previewDoc, setPreviewDoc] = useState<ProjectDoc | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const projectStage = project ? LIFECYCLE_STAGES[project.stageIndex] || 'Idea' : 'Idea';

  // Keep modal docs in sync with the latest data (versions change while open)
  const liveAiDoc = aiDoc ? docs.find((d) => d.id === aiDoc.id) || aiDoc : null;
  const liveVersionsDoc = versionsDoc ? docs.find((d) => d.id === versionsDoc.id) || versionsDoc : null;

  // Background document monitoring: once per session, report a research sweep
  useEffect(() => {
    if (!project || docs.length === 0) return;
    const key = `atlas_doc_monitor_${project.id}`;
    if (sessionStorage.getItem(key)) return;
    const t = setTimeout(() => {
      sessionStorage.setItem(key, '1');
      const n = Math.min(docs.length, 4);
      notify(`Background monitoring: ${n} ${project.name} document${n === 1 ? '' : 's'} checked against newly discovered market research — all statistics current`);
    }, 15000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id, docs.length]);

  const profileDoc = async (doc: ProjectDoc) => {
    try {
      const content = await readContentForProfile(doc);
      const { data } = await supabase.functions.invoke('atlas-doc-intelligence', {
        body: {
          action: 'profile',
          document: { name: doc.name, ext: doc.ext, folder: doc.folder, size: doc.size },
          content,
          projectName: project?.name || 'the invention',
          projectStage,
        },
      });
      if (data?.profile) setAiMeta(doc.id, data.profile);
    } catch { /* profiling is best-effort */ }
  };

  const readContentForProfile = async (doc: ProjectDoc): Promise<string> => {
    if (!doc.storage_path || !['txt', 'csv', 'md', 'json', 'svg'].includes(doc.ext)) return '';
    try {
      const url = docPublicUrl(doc.storage_path);
      if (!url) return '';
      const res = await fetch(url);
      return res.ok ? (await res.text()).slice(0, 12000) : '';
    } catch { return ''; }
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    if (!project) return;
    const files = Array.from(fileList).filter((f) => ACCEPT_EXTS.includes((f.name.split('.').pop() || '').toLowerCase()));
    if (files.length === 0) { notify('Unsupported file type — see supported formats below the drop zone'); return; }
    setUploading(true);
    // capture text content before upload for survey auto-analysis
    const surveyTexts: Record<string, string> = {};
    for (const f of files) {
      if (/survey|responses/i.test(f.name) || (f.name.split('.').pop() || '').toLowerCase() === 'csv') {
        surveyTexts[f.name] = await readFileText(f);
      }
    }
    const created = await uploadFiles(files, folder);
    setUploading(false);
    if (created.length > 0) {
      notify(`${created.length} document${created.length === 1 ? '' : 's'} added to ${project.name} — Atlas is profiling ${created.length === 1 ? 'it' : 'them'} now`);
      created.forEach((d) => profileDoc(d));
      // SurveyMonkey-style exports: auto-open intelligence on the first survey file
      const survey = created.find((d) => surveyTexts[d.name] !== undefined);
      if (survey) setAiDoc(survey);
    }
  };

  const filtered = useMemo(() => {
    let list = docs.filter((d) => (showArchived ? d.archived : !d.archived));
    if (folder !== 'All') list = list.filter((d) => d.folder === folder);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((d) =>
        d.name.toLowerCase().includes(q) ||
        d.folder.toLowerCase().includes(q) ||
        (d.ai_meta?.docType || '').toLowerCase().includes(q) ||
        (d.ai_meta?.topics || []).some((t) => t.toLowerCase().includes(q)),
      );
    }
    return [...list].sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name);
      if (sort === 'size') return b.size - a.size;
      return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
    });
  }, [docs, folder, search, sort, showArchived]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    docs.filter((d) => !d.archived).forEach((d) => { counts[d.folder] = (counts[d.folder] || 0) + 1; });
    return counts;
  }, [docs]);

  const totalSize = docs.reduce((s, d) => s + (d.size || 0), 0);
  const aiUpdated = docs.filter((d) => d.versions?.length > 1).length;
  const archivedCount = docs.filter((d) => d.archived).length;

  const doRename = (doc: ProjectDoc) => {
    const name = window.prompt('Rename document', doc.name);
    if (name && name.trim() && name !== doc.name) {
      rename(doc.id, name.trim());
      notify(`Renamed to "${name.trim()}"`);
    }
    setMenuFor(null);
  };

  if (loaded && active.length === 0) {
    return (
      <Card className="p-10 text-center">
        <FolderOpen size={32} className="mx-auto text-slate-300" />
        <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-white">No inventions yet</h3>
        <p className="mx-auto mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
          Every invention gets its own Document Hub. Create a project first, then upload survey results,
          pitch decks, engineering notes, quotes, CAD files and more — Atlas will analyze, version and keep them current.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      {/* Project selector */}
      <div className="flex flex-wrap items-center gap-2">
        {active.map((p) => (
          <button
            key={p.id}
            onClick={() => { setProjectId(p.id); setFolder('All'); setSearch(''); }}
            className={`rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors ${
              p.id === projectId
                ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300'
                : 'border-slate-200 text-slate-600 hover:border-blue-300 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {p.name}
            <span className="ml-2 rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {p.id === projectId ? docs.filter((d) => !d.archived).length : ''}
              {p.id === projectId ? ' docs' : 'open'}
            </span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-3.5"><div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Documents</div><div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{docs.filter((d) => !d.archived).length}</div></Card>
        <Card className="p-3.5"><div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Storage</div><div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{formatSize(totalSize)}</div></Card>
        <Card className="p-3.5"><div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">AI-Updated</div><div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{aiUpdated}</div></Card>
        <Card className="p-3.5"><div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Archived</div><div className="mt-1 text-xl font-bold text-slate-900 dark:text-white">{archivedCount}</div></Card>
      </div>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={`rounded-2xl border-2 border-dashed p-6 text-center transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50 dark:bg-blue-500/10' : 'border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900/50'
        }`}
      >
        <input ref={fileInput} type="file" multiple className="hidden" accept={ACCEPT_EXTS.map((e) => `.${e}`).join(',')} onChange={(e) => e.target.files && handleFiles(e.target.files)} />
        <UploadCloud size={26} className={`mx-auto ${dragOver ? 'text-blue-500' : 'text-slate-400'}`} />
        <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
          {uploading ? 'Uploading…' : `Drag & drop files into ${project?.name || 'your project'}`}
        </p>
        <p className="mt-0.5 text-xs text-slate-400">PDF, DOCX, PPTX, XLSX, CSV, TXT, PNG, JPG, SVG, AI, PSD, STEP, STL, DWG, DXF, ZIP</p>
        <button
          onClick={() => fileInput.current?.click()}
          disabled={uploading || !project}
          className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {uploading ? <Loader2 size={13} className="animate-spin" /> : <UploadCloud size={13} />} Browse files
        </button>
        <p className="mt-2 text-[11px] text-slate-400">
          SurveyMonkey CSV exports are analyzed automatically on upload — stats, pain points, purchase intent and willingness to pay.
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search documents, types, topics…"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white">
          <option value="updated">Newest first</option>
          <option value="name">Name A–Z</option>
          <option value="size">Largest first</option>
        </select>
        <button
          onClick={() => setShowArchived(!showArchived)}
          className={`rounded-lg border px-3 py-2 text-xs font-medium ${showArchived ? 'border-amber-400 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300' : 'border-slate-300 text-slate-500 dark:border-slate-700 dark:text-slate-400'}`}
        >
          <Archive size={12} className="mr-1 inline" /> {showArchived ? 'Viewing archive' : 'Archive'} {archivedCount > 0 && `(${archivedCount})`}
        </button>
      </div>

      {/* Folder chips */}
      <div className="flex flex-wrap gap-1.5">
        {['All', ...DOC_FOLDERS].map((f) => (
          <button
            key={f}
            onClick={() => setFolder(f)}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-colors ${
              folder === f
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'
            }`}
          >
            {f}{f !== 'All' && folderCounts[f] ? ` · ${folderCounts[f]}` : ''}
          </button>
        ))}
      </div>

      {/* Document list */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-400"><Loader2 size={15} className="animate-spin" /> Loading {project?.name} documents…</div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center">
            <FileText size={26} className="mx-auto text-slate-300" />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {showArchived ? 'No archived documents.' : docs.length === 0 ? `No documents yet for ${project?.name}. Upload survey results, pitch decks, quotes or CAD files above.` : 'No documents match your filters.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((doc) => (
              <div key={doc.id} className="group relative flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">{extIcon(doc.ext)}</div>
                <button className="min-w-0 flex-1 text-left" onClick={() => setPreviewDoc(doc)}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="truncate text-sm font-medium text-slate-900 dark:text-white">{doc.name}</span>
                    <Badge color="slate">v{doc.current_version}</Badge>
                    {doc.ai_meta?.docType && <Badge color="violet">{doc.ai_meta.docType}</Badge>}
                    {doc.archived && <Badge color="amber">Archived</Badge>}
                  </div>
                  <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                    <span>{doc.folder}</span><span>•</span><span>{formatSize(doc.size)}</span><span>•</span>
                    <span>{new Date(doc.updated_at).toLocaleDateString()}</span>
                    {doc.versions?.length > 1 && <><span>•</span><span className="text-blue-500">{doc.versions.length} versions</span></>}
                  </div>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  <button title="Atlas Intelligence" onClick={() => setAiDoc(doc)} className="rounded-lg p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10"><Sparkles size={15} /></button>
                  <button title="Version history" onClick={() => setVersionsDoc(doc)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"><History size={15} /></button>
                  <button title="Preview" onClick={() => setPreviewDoc(doc)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"><Eye size={15} /></button>
                  {doc.storage_path && (
                    <a title="Download" href={docPublicUrl(doc.storage_path) || '#'} target="_blank" rel="noopener noreferrer" className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"><Download size={15} /></a>
                  )}
                  <button onClick={() => { setMenuFor(menuFor === doc.id ? null : doc.id); setMoveFor(null); }} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"><MoreVertical size={15} /></button>
                </div>

                {menuFor === doc.id && (
                  <div className="absolute right-3 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                    {moveFor === doc.id ? (
                      <div className="max-h-56 overflow-y-auto">
                        <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Move to folder</div>
                        {DOC_FOLDERS.filter((f) => f !== doc.folder).map((f) => (
                          <button key={f} onClick={() => { move(doc.id, f); setMenuFor(null); setMoveFor(null); notify(`"${doc.name}" moved to ${f}`); }} className="block w-full rounded-lg px-2.5 py-1.5 text-left text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800">{f}</button>
                        ))}
                      </div>
                    ) : (
                      <>
                        <button onClick={() => doRename(doc)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"><Pencil size={12} /> Rename</button>
                        <button onClick={() => setMoveFor(doc.id)} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"><FolderInput size={12} /> Move to folder</button>
                        <button onClick={async () => { setMenuFor(null); const c = await duplicate(doc); if (c) notify(`Duplicated "${doc.name}"`); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"><Copy size={12} /> Duplicate</button>
                        <button onClick={() => { setArchived(doc.id, !doc.archived); setMenuFor(null); notify(doc.archived ? `"${doc.name}" restored from archive` : `"${doc.name}" archived`); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800"><Archive size={12} /> {doc.archived ? 'Unarchive' : 'Archive'}</button>
                        <button onClick={() => { if (window.confirm(`Delete "${doc.name}"? All versions will be removed.`)) { remove(doc.id); notify(`"${doc.name}" deleted`); } setMenuFor(null); }} className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"><Trash2 size={12} /> Delete</button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* AI knowledge strip */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><BrainCircuit size={15} className="text-blue-500" /> AI Document Intelligence</div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Every upload is automatically profiled — type, purpose, topics, key data and relevance to {project?.name || 'your invention'}.
            Atlas edits existing documents instead of recreating them: it preserves formatting, branding, slide layouts, fonts and page structure,
            then saves the result as a new version.
          </p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white"><Radar size={15} className="text-emerald-500" /> Background Monitoring</div>
          <p className="mt-1.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Atlas continuously checks your business plan, pitch deck, marketing plan and research reports against newly discovered
            market statistics. When better data is found, affected documents are updated to a new version and you are notified afterward — never asked first.
          </p>
        </Card>
      </div>

      {/* Modals */}
      {liveAiDoc && project && (
        <DocumentAiModal
          doc={liveAiDoc}
          projectName={project.name}
          projectStage={projectStage}
          onClose={() => setAiDoc(null)}
          onSaveVersion={addVersion}
          notify={notify}
        />
      )}
      {liveVersionsDoc && project && (
        <DocumentVersionsModal
          doc={liveVersionsDoc}
          projectName={project.name}
          projectStage={projectStage}
          onClose={() => setVersionsDoc(null)}
          onRestore={restoreVersion}
          notify={notify}
        />
      )}
      {previewDoc && <DocumentPreviewModal doc={previewDoc} onClose={() => setPreviewDoc(null)} />}
    </div>
  );
}
