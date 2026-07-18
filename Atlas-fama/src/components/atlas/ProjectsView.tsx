import React, { useState } from 'react';
import { Plus, Lightbulb, Search, Star, MoreVertical, Pencil, Copy, Archive, ArchiveRestore, Trash2, FolderOpen, CloudOff } from 'lucide-react';
import { Card, SectionTitle, Badge, StatusDot, HealthRing, ProgressBar } from './ui';
import { DEPARTMENTS, LIFECYCLE_STAGES, IMAGES, Project } from '@/data/atlasData';
import ProjectDetailModal from './ProjectDetailModal';
import { useAuth } from '@/contexts/AuthContext';
import { useProjects } from '@/hooks/useProjects';

type Filter = 'active' | 'favorites' | 'archived' | 'all';

export default function ProjectsView() {
  const { user } = useAuth();
  const { projects, setProjects, loaded, dbSave, dbDelete } = useProjects();
  const [showCapture, setShowCapture] = useState(false);
  const [ideaName, setIdeaName] = useState('');
  const [idea, setIdea] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('active');
  const [menuId, setMenuId] = useState<string | null>(null);
  const [renameId, setRenameId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Project | null>(null);
  const [groupFilter, setGroupFilter] = useState('All');



  const groups = ['All', ...Array.from(new Set(DEPARTMENTS.map((d) => d.group)))];
  const depts = DEPARTMENTS.filter((d) => groupFilter === 'All' || d.group === groupFilter);

  const update = (id: string, patch: Partial<Project>) =>
    setProjects((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      const next = { ...p, ...patch };
      dbSave(next);
      return next;
    }));

  const submitIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || !ideaName.trim()) return;
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name: ideaName.trim(),
      tagline: idea.trim().slice(0, 80),
      stageIndex: 0,
      health: 55,
      risk: 50,
      image: IMAGES.cadA,
      estCompletion: 'TBD',
      activity: 'Validation & patent research kicked off',
      nextMilestone: 'First validation report — within 1 hour',
      updated: 'Just now',
      favorite: false,
      archived: false,
    };
    setProjects((prev) => [newProject, ...prev]);
    dbSave(newProject);
    setSubmitted(true);
    setTimeout(() => { setShowCapture(false); setSubmitted(false); setIdea(''); setIdeaName(''); }, 2500);
  };

  const duplicate = (p: Project) => {
    const copy = { ...p, id: `p-${Date.now()}`, name: `${p.name} (Copy)`, favorite: false, updated: 'Just now' };
    setProjects((prev) => [copy, ...prev]);
    dbSave(copy);
    setMenuId(null);
  };

  const startRename = (p: Project) => {
    setRenameId(p.id);
    setRenameValue(p.name);
    setMenuId(null);
  };

  const confirmRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (renameId && renameValue.trim()) update(renameId, { name: renameValue.trim(), updated: 'Just now' });
    setRenameId(null);
  };

  const confirmDelete = () => {
    if (deleteId) {
      setProjects((prev) => prev.filter((p) => p.id !== deleteId));
      dbDelete(deleteId);
    }
    setDeleteId(null);
  };

  const visible = projects.filter((p) => {
    if (filter === 'active' && p.archived) return false;
    if (filter === 'favorites' && (!p.favorite || p.archived)) return false;
    if (filter === 'archived' && !p.archived) return false;
    const q = query.trim().toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q);
  });

  const deleting = projects.find((p) => p.id === deleteId);
  const filters: { key: Filter; label: string }[] = [
    { key: 'active', label: `Active (${projects.filter((p) => !p.archived).length})` },
    { key: 'favorites', label: 'Favorites' },
    { key: 'archived', label: `Archived (${projects.filter((p) => p.archived).length})` },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Your Inventions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Each invention is fully isolated — its own research, files, memory and AI activity</p>
        </div>
        <button onClick={() => setShowCapture(true)} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700">
          <Plus size={15} /> New Invention
        </button>
      </div>

      {!user && loaded && (
        <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <CloudOff size={14} className="shrink-0" />
          You're not signed in — projects are only saved in this browser. Sign in to save them permanently across devices.
        </div>
      )}

      {/* Search + filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search projects…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
        </div>
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          {filters.map((f) => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                filter === f.key ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white' : 'text-slate-500 dark:text-slate-400'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {showCapture && (
        <Card className="border-blue-200 p-5 dark:border-blue-900">
          {submitted ? (
            <div className="py-6 text-center">
              <Lightbulb size={28} className="mx-auto text-amber-400" />
              <div className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-200">Idea captured — project created.</div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Atlas auto-created the project file system (Research/, Patent/, Engineering/, CAD/ …) and the Research, Patent Research and Validation departments have started work.
              </p>
            </div>
          ) : (
            <form onSubmit={submitIdea}>
              <SectionTitle title="Capture a New Idea" sub="Describe your invention in plain language — Atlas handles the rest" />
              <input value={ideaName} onChange={(e) => setIdeaName(e.target.value)} required placeholder="Project name (e.g. DroneDock)"
                className="mb-3 w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
              <textarea value={idea} onChange={(e) => setIdea(e.target.value)} rows={4} required
                placeholder="e.g. A collapsible drone landing pad with built-in wind sensors that guides autonomous landings..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" />
              <div className="mt-3 flex gap-2">
                <button type="submit" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
                  Start Atlas Engine
                </button>
                <button type="button" onClick={() => setShowCapture(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </Card>
      )}

      {/* Project cards */}
      {!loaded ? (
        <Card className="p-10 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">Loading your projects…</p>
        </Card>
      ) : visible.length === 0 ? (
        <Card className="p-10 text-center">
          <FolderOpen size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {projects.length === 0 ? 'No projects yet. Click "New Invention" to create one.' : 'No projects match. Try a different search or filter.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visible.map((p) => {
            const completion = Math.round(((p.stageIndex + 1) / LIFECYCLE_STAGES.length) * 100);
            return (
              <Card key={p.id} className={`relative overflow-hidden transition hover:shadow-md ${p.archived ? 'opacity-70' : ''}`}>
                <button onClick={() => setDetail(p)} className="block w-full">
                  <img src={p.image} alt={p.name} className="h-36 w-full object-cover" />
                </button>

                {/* Favorite + menu */}
                <div className="absolute right-2 top-2 flex gap-1.5">
                  <button onClick={() => update(p.id, { favorite: !p.favorite })}
                    className="rounded-full bg-black/45 p-1.5 text-white hover:bg-black/65" title="Favorite">
                    <Star size={13} className={p.favorite ? 'fill-amber-400 text-amber-400' : ''} />
                  </button>
                  <button onClick={() => setMenuId(menuId === p.id ? null : p.id)}
                    className="rounded-full bg-black/45 p-1.5 text-white hover:bg-black/65" title="Actions">
                    <MoreVertical size={13} />
                  </button>
                </div>

                {menuId === p.id && (
                  <div className="absolute right-2 top-10 z-10 w-44 rounded-lg border border-slate-200 bg-white py-1 shadow-xl dark:border-slate-700 dark:bg-slate-800">
                    {[
                      { icon: <FolderOpen size={13} />, label: 'Open workspace', fn: () => { setDetail(p); setMenuId(null); } },
                      { icon: <Pencil size={13} />, label: 'Rename', fn: () => startRename(p) },
                      { icon: <Copy size={13} />, label: 'Duplicate', fn: () => duplicate(p) },
                      p.archived
                        ? { icon: <ArchiveRestore size={13} />, label: 'Restore', fn: () => { update(p.id, { archived: false }); setMenuId(null); } }
                        : { icon: <Archive size={13} />, label: 'Archive', fn: () => { update(p.id, { archived: true }); setMenuId(null); } },
                    ].map((a) => (
                      <button key={a.label} onClick={a.fn}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700/60">
                        {a.icon} {a.label}
                      </button>
                    ))}
                    <button onClick={() => { setDeleteId(p.id); setMenuId(null); }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10">
                      <Trash2 size={13} /> Delete…
                    </button>
                  </div>
                )}

                <div className="p-4">
                  {renameId === p.id ? (
                    <form onSubmit={confirmRename} className="flex gap-2">
                      <input autoFocus value={renameValue} onChange={(e) => setRenameValue(e.target.value)}
                        className="w-full rounded-md border border-blue-300 bg-white px-2 py-1 text-sm outline-none dark:border-blue-500/50 dark:bg-slate-800 dark:text-slate-200" />
                      <button type="submit" className="rounded-md bg-blue-600 px-2.5 text-xs font-semibold text-white">Save</button>
                    </form>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <button onClick={() => setDetail(p)} className="min-w-0 text-left">
                        <div className="text-base font-bold text-slate-900 hover:text-blue-600 dark:text-white dark:hover:text-blue-400">{p.name}</div>
                        <div className="truncate text-xs text-slate-500 dark:text-slate-400">{p.tagline}</div>
                      </button>
                      <HealthRing value={p.health} size={56} />
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="mb-1 flex justify-between text-[10px] text-slate-400">
                      <span>{LIFECYCLE_STAGES[p.stageIndex]}</span><span className="font-mono">{completion}%</span>
                    </div>
                    <ProgressBar value={completion} />
                  </div>

                  <div className="mt-3 space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5"><StatusDot status="working" /> {p.activity}</div>
                    <div>Next: {p.nextMilestone}</div>
                  </div>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <Badge color={p.risk < 30 ? 'green' : p.risk < 45 ? 'amber' : 'red'}>Risk {p.risk}</Badge>
                    {p.archived && <Badge color="slate">Archived</Badge>}
                    <span className="ml-auto text-[10px] text-slate-400">{p.updated}</span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Departments */}
      <Card className="p-5">
        <SectionTitle title="AI Departments" sub={`${DEPARTMENTS.filter((d) => d.status === 'working').length} of ${DEPARTMENTS.length} departments actively working right now`}
          action={
            <select value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {groups.map((g) => <option key={g}>{g}</option>)}
            </select>
          } />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {depts.map((d) => (
            <div key={d.id} className="rounded-lg border border-slate-100 p-3.5 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  <StatusDot status={d.status} /> {d.name}
                </span>
                <span className="font-mono text-[10px] text-slate-400">{d.tasksToday} today</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{d.currentTask}</p>
              <div className="mt-2"><Badge color="slate">{d.group}</Badge></div>
            </div>
          ))}
        </div>
      </Card>

      {/* Delete confirmation */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setDeleteId(null)}>
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 text-sm font-bold text-red-600 dark:text-red-400">
              <Trash2 size={16} /> Delete "{deleting.name}"?
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              This permanently removes the project and all associated files — research, patents, CAD, documents and AI memory. This cannot be undone.
            </p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setDeleteId(null)} className="flex-1 rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:text-slate-300">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700">
                Delete Permanently
              </button>
            </div>
          </div>
        </div>
      )}

      {detail && <ProjectDetailModal project={detail} onClose={() => setDetail(null)} />}
    </div>
  );
}
