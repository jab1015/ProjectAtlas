import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

// ─── Types ───

export interface DocVersion {
  version: string;
  createdAt: string;
  note: string;
  storagePath?: string | null;
  content?: string;
  size?: number;
}

export interface DocAiMeta {
  docType?: string;
  purpose?: string;
  topics?: string[];
  relevance?: string;
  keyData?: string[];
}

export interface ProjectDoc {
  id: string;
  owner_key: string;
  project_id: string;
  name: string;
  folder: string;
  ext: string;
  size: number;
  storage_path: string | null;
  archived: boolean;
  current_version: string;
  versions: DocVersion[];
  ai_meta: DocAiMeta;
  created_at: string;
  updated_at: string;
}

export const DOC_FOLDERS = [
  'General', 'Research', 'Surveys', 'Pitch Deck', 'Business Plan', 'Engineering',
  'CAD Files', 'Manufacturing', 'Patents', 'Legal', 'Marketing', 'Product Photos',
];

export const ACCEPT_EXTS = [
  'pdf', 'docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls', 'csv', 'txt', 'md', 'json',
  'png', 'jpg', 'jpeg', 'svg', 'gif', 'webp', 'ai', 'psd', 'step', 'stp', 'stl', 'dwg', 'dxf', 'zip',
];

const TEXT_EXTS = new Set(['txt', 'csv', 'md', 'json', 'svg']);
const IMAGE_EXTS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

export const getExt = (name: string) => (name.split('.').pop() || '').toLowerCase();
export const isTextExt = (ext: string) => TEXT_EXTS.has(ext);
export const isImageExt = (ext: string) => IMAGE_EXTS.has(ext);

export function formatSize(bytes: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function bumpVersion(v: string, major = false): string {
  const [a, b] = v.split('.').map((n) => parseInt(n, 10) || 0);
  return major ? `${a + 1}.0` : `${a}.${b + 1}`;
}

export function guessFolder(name: string): string {
  const n = name.toLowerCase();
  const ext = getExt(name);
  if (n.includes('survey') || n.includes('responses')) return 'Surveys';
  if (n.includes('pitch') || n.includes('deck') || ext === 'pptx' || ext === 'ppt') return 'Pitch Deck';
  if (n.includes('business plan') || n.includes('financial')) return 'Business Plan';
  if (n.includes('patent')) return 'Patents';
  if (n.includes('quote') || n.includes('manufactur') || n.includes('supplier') || n.includes('bom')) return 'Manufacturing';
  if (['step', 'stp', 'stl', 'dwg', 'dxf'].includes(ext)) return 'CAD Files';
  if (n.includes('nda') || n.includes('agreement') || n.includes('legal')) return 'Legal';
  if (n.includes('interview') || n.includes('research') || n.includes('market')) return 'Research';
  if (n.includes('engineering') || n.includes('spec') || n.includes('notes')) return 'Engineering';
  if (n.includes('marketing') || n.includes('campaign') || n.includes('brand')) return 'Marketing';
  if (IMAGE_EXTS.has(ext)) return 'Product Photos';
  return 'General';
}

export async function readFileText(file: File): Promise<string> {
  const ext = getExt(file.name);
  if (!TEXT_EXTS.has(ext) || file.size > 5 * 1024 * 1024) return '';
  try {
    const text = await file.text();
    return text.slice(0, 24000);
  } catch {
    return '';
  }
}

function guestOwnerKey(): string {
  try {
    let k = localStorage.getItem('atlas_doc_owner');
    if (!k) {
      k = `guest-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      localStorage.setItem('atlas_doc_owner', k);
    }
    return k;
  } catch {
    return 'guest-anon';
  }
}

export function docPublicUrl(path: string | null): string | null {
  if (!path) return null;
  const { data } = supabase.storage.from('project-docs').getPublicUrl(path);
  return data?.publicUrl || null;
}

// ─── jsonb serialization workaround ───
// The database's REST layer converts top-level JS arrays into Postgres array
// literals, which are INVALID for jsonb columns (every insert/update carrying
// `versions` failed with "invalid input syntax for type json" and documents
// silently never persisted). Sending jsonb fields as JSON *strings* makes the
// server cast them correctly, and they read back as real arrays/objects.

const JSONB_FIELDS = ['versions', 'ai_meta'] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toDbFields<T extends Record<string, any>>(fields: T): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const out: Record<string, any> = { ...fields };
  for (const k of JSONB_FIELDS) {
    if (k in out && out[k] !== null && typeof out[k] === 'object') {
      out[k] = JSON.stringify(out[k]);
    }
  }
  return out;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeDoc(row: any): ProjectDoc {
  const d = { ...row };
  for (const k of JSONB_FIELDS) {
    if (typeof d[k] === 'string') {
      try { d[k] = JSON.parse(d[k]); } catch { d[k] = k === 'versions' ? [] : {}; }
    }
  }
  if (!Array.isArray(d.versions)) d.versions = [];
  if (!d.ai_meta || typeof d.ai_meta !== 'object') d.ai_meta = {};
  d.size = Number(d.size) || 0; // bigint comes back as a string
  return d as ProjectDoc;
}

// ─── Hook ───

export function useDocuments(projectId: string | null) {
  const { user } = useAuth();
  const ownerKey = user?.id || guestOwnerKey();
  const [docs, setDocs] = useState<ProjectDoc[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) { setDocs([]); return; }
    setLoading(true);
    const { data, error } = await supabase
      .from('project_documents')
      .select('*')
      .eq('owner_key', ownerKey)
      .eq('project_id', projectId)
      .eq('deleted', false)
      .order('updated_at', { ascending: false });
    if (!error && data) setDocs(data.map(normalizeDoc));
    setLoading(false);
  }, [projectId, ownerKey]);

  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, fields: Partial<ProjectDoc>) => {
    setDocs((prev) => prev.map((d) => (d.id === id ? { ...d, ...fields, updated_at: new Date().toISOString() } : d)));
    const { error } = await supabase.from('project_documents')
      .update(toDbFields({ ...fields, updated_at: new Date().toISOString() }))
      .eq('id', id).eq('owner_key', ownerKey);
    if (error) console.error('Document update failed:', error.message);
  };

  const uploadFiles = async (files: File[], folder?: string): Promise<ProjectDoc[]> => {
    if (!projectId) return [];
    const created: ProjectDoc[] = [];
    for (const file of files) {
      const ext = getExt(file.name);
      const path = `${ownerKey}/${projectId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const { error: upErr } = await supabase.storage.from('project-docs').upload(path, file, { upsert: true });
      const storagePath = upErr ? null : path;
      const now = new Date().toISOString();
      const row = {
        owner_key: ownerKey,
        project_id: projectId,
        name: file.name,
        folder: folder && folder !== 'All' ? folder : guessFolder(file.name),
        ext,
        size: file.size,
        storage_path: storagePath,
        archived: false,
        deleted: false,
        current_version: '1.0',
        versions: [{ version: '1.0', createdAt: now, note: 'Original upload', storagePath, size: file.size }],
        ai_meta: {},
        created_at: now,
        updated_at: now,
      };
      const { data, error } = await supabase.from('project_documents').insert(toDbFields(row)).select('*').single();
      if (error) console.error('Document insert failed:', error.message);
      if (!error && data) created.push(normalizeDoc(data));
    }
    if (created.length) setDocs((prev) => [...created, ...prev]);
    return created;
  };

  const setAiMeta = (id: string, ai_meta: DocAiMeta) => patch(id, { ai_meta });
  const rename = (id: string, name: string) => patch(id, { name });
  const move = (id: string, folder: string) => patch(id, { folder });
  const setArchived = (id: string, archived: boolean) => patch(id, { archived });

  const remove = async (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    await supabase.from('project_documents')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id).eq('owner_key', ownerKey);
  };

  const duplicate = async (doc: ProjectDoc): Promise<ProjectDoc | null> => {
    const now = new Date().toISOString();
    const dot = doc.name.lastIndexOf('.');
    const copyName = dot > 0 ? `${doc.name.slice(0, dot)} (copy)${doc.name.slice(dot)}` : `${doc.name} (copy)`;
    const row = {
      owner_key: ownerKey, project_id: doc.project_id, name: copyName, folder: doc.folder,
      ext: doc.ext, size: doc.size, storage_path: doc.storage_path, archived: false, deleted: false,
      current_version: '1.0',
      versions: [{ version: '1.0', createdAt: now, note: `Duplicated from ${doc.name}`, storagePath: doc.storage_path, size: doc.size }],
      ai_meta: doc.ai_meta, created_at: now, updated_at: now,
    };
    const { data, error } = await supabase.from('project_documents').insert(toDbFields(row)).select('*').single();
    if (error || !data) {
      if (error) console.error('Document duplicate failed:', error.message);
      return null;
    }
    const norm = normalizeDoc(data);
    setDocs((prev) => [norm, ...prev]);
    return norm;
  };

  const addVersion = async (doc: ProjectDoc, note: string, content: string, major = false) => {
    const next = bumpVersion(doc.current_version, major);
    const versions: DocVersion[] = [
      ...doc.versions,
      { version: next, createdAt: new Date().toISOString(), note, content: content.slice(0, 60000) },
    ];
    await patch(doc.id, { current_version: next, versions });
    return next;
  };

  const restoreVersion = async (doc: ProjectDoc, v: DocVersion) => {
    const next = bumpVersion(doc.current_version);
    const versions: DocVersion[] = [
      ...doc.versions,
      { version: next, createdAt: new Date().toISOString(), note: `Restored from Version ${v.version}`, content: v.content, storagePath: v.storagePath },
    ];
    await patch(doc.id, { current_version: next, versions });
    return next;
  };

  return { docs, loading, reload: load, uploadFiles, rename, move, duplicate, setArchived, remove, addVersion, restoreVersion, setAiMeta };
}
