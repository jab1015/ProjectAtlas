import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface Profile {
  id: string;
  email: string | null;
  name: string | null;
  plan: string;
  credits: number;
  role: string;
  approved_ids: string[];
  generated_docs: string[];
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ error?: string; needsConfirm?: boolean }>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<Profile, 'plan' | 'credits' | 'approved_ids' | 'generated_docs' | 'name'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAdmin: false,
  signIn: async () => ({}),
  signUp: async () => ({}),
  signOut: async () => {},
  updateProfile: async () => {},
});

export const useAuth = () => useContext(AuthContext);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (u: User) => {
    // Retry briefly in case the signup trigger hasn't created the row yet
    for (let attempt = 0; attempt < 3; attempt++) {
      const { data } = await supabase.from('profiles').select('*').eq('id', u.id).maybeSingle();
      if (data) {
        setProfile(data as Profile);
        return;
      }
      if (attempt === 2) {
        // Fallback: create the row ourselves
        const fallback = {
          id: u.id,
          email: u.email ?? null,
          name: (u.user_metadata?.name as string) ?? '',
        };
        const { data: created } = await supabase.from('profiles').upsert(fallback).select('*').maybeSingle();
        if (created) setProfile(created as Profile);
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? { error: error.message } : {};
  };

  const signUp = async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) return { error: error.message };
    if (!data.session) return { needsConfirm: true };
    return {};
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
  };

  const updateProfile: AuthContextType['updateProfile'] = async (patch) => {
    if (!user) return;
    setProfile((p) => (p ? { ...p, ...patch } : p));
    await supabase.from('profiles').update({ ...patch, updated_at: new Date().toISOString() }).eq('id', user.id);
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, signIn, signUp, signOut, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

