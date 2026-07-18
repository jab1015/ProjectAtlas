import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { Project } from '@/data/atlasData';

const STORAGE_KEY = 'atlas_projects_v1';

// Names of the retired demo/sample projects. They are never seeded anymore,
// and any leftover copies (in the DB or localStorage) are filtered out and purged.
const DEMO_NAMES = new Set(['hydracore', 'gripmate', 'solarleaf']);
const isDemoProject = (p: Project) => DEMO_NAMES.has((p?.name || '').trim().toLowerCase());

function loadLocalProjects(): Project[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.filter((p) => !isDemoProject(p));
    }
  } catch { /* ignore */ }
  return [];
}

/**
 * Single source of truth for the user's projects.
 * Loads from the database when signed in (soft-deleted rows filtered out),
 * from localStorage for guests. NO demo data is ever seeded or shown —
 * every screen (Dashboard, Projects, Assistant) reflects the same live data.
 */
export function useProjects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    async function load() {
      if (user) {
        const { data: rows, error } = await supabase
          .from('projects')
          .select('id, data')
          .eq('user_id', user.id)
          .eq('deleted', false)
          .order('created_at', { ascending: false });
        if (cancelled) return;
        if (!error && rows) {
          const real: Project[] = [];
          const demoRowIds: string[] = [];
          for (const r of rows) {
            const p = r.data as Project;
            if (isDemoProject(p)) demoRowIds.push(r.id as string);
            else real.push(p);
          }
          setProjects(real);
          // Permanently soft-delete any leftover demo rows so they never come back
          if (demoRowIds.length > 0) {
            supabase.from('projects')
              .update({ deleted: true, updated_at: new Date().toISOString() })
              .in('id', demoRowIds)
              .eq('user_id', user.id)
              .then(() => { /* purged */ }, () => { /* ignore */ });
          }
        }
      } else {
        setProjects(loadLocalProjects());
      }
      if (!cancelled) setLoaded(true);
    }
    load();
    return () => { cancelled = true; };
  }, [user]);

  // Persist to localStorage only for signed-out visitors
  useEffect(() => {
    if (!loaded || user) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.filter((p) => !isDemoProject(p))));
    } catch { /* ignore */ }
  }, [projects, loaded, user]);

  const dbSave = (p: Project) => {
    if (!user) return;
    supabase.from('projects')
      .upsert({ id: p.id, user_id: user.id, data: p, deleted: false, updated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.error('Save failed:', error.message); });
  };

  const dbDelete = async (id: string) => {
    if (!user) return;
    // The database's REST layer rejects the DELETE verb (empty-body bug) and its
    // RPC route is unreliable, so we mark the row deleted via UPDATE — a verb
    // that is proven to work — and every load filters these rows out for good.
    const { error } = await supabase
      .from('projects')
      .update({ deleted: true, updated_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', user.id);
    if (error) {
      console.error('Delete failed:', error.message);
      return;
    }
    // Best-effort hard delete to actually purge the row; harmless if it fails
    // because the soft-delete flag above already hides the project permanently.
    supabase.rpc('delete_project', { p_id: id }).then(() => { /* ignore result */ }, () => { /* ignore */ });
  };

  return { projects, setProjects, loaded, dbSave, dbDelete };
}
