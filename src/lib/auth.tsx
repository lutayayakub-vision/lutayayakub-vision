import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { localAuth, type MinimalSession } from '@/lib/localAuth';
import type { Profile, UserRole } from '@/types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, name: string, role: UserRole, phone?: string, location?: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        if (session) {
          loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        if (session) {
          loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      });

      return () => subscription.unsubscribe();
    } else {
      // Local fallback mode — no Supabase backend configured.
      localAuth.seedDemoAccounts();
      const { session, profile } = localAuth.getSession();
      setSession(session as unknown as Session);
      setProfile(profile);
      setLoading(false);
    }
  }, []);

  async function loadProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error loading profile:', error);
    }
    setProfile(data as Profile | null);
    setLoading(false);
  }

  async function signIn(email: string, password: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    }
    const { error, profile, session } = await localAuth.signIn(email, password);
    if (!error) {
      setSession(session as unknown as Session);
      setProfile(profile);
    }
    return { error };
  }

  async function signUp(email: string, password: string, name: string, role: UserRole, phone?: string, location?: string) {
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) return { error: error.message };

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          name,
          email,
          phone: phone ?? null,
          role,
          location: location ?? null,
        });
        if (profileError) return { error: profileError.message };
      }

      return { error: null };
    }
    const { error, profile, session } = await localAuth.signUp(email, password, name, role, phone, location);
    if (!error) {
      setSession(session as unknown as Session);
      setProfile(profile);
    }
    return { error };
  }

  async function signOut() {
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      localAuth.signOut();
    }
    setProfile(null);
    setSession(null);
  }

  async function refreshProfile() {
    if (isSupabaseConfigured) {
      if (session?.user.id) {
        await loadProfile(session.user.id);
      }
    } else {
      const { profile } = localAuth.getSession();
      setProfile(profile);
    }
  }

  async function requestPasswordReset(email: string) {
    if (isSupabaseConfigured) {
      const redirectTo = `${window.location.origin}/#/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
      return { error: error?.message ?? null };
    }
    return localAuth.requestPasswordReset(email);
  }

  async function updatePassword(password: string) {
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error?.message ?? null };
    }
    return localAuth.updatePassword(password);
  }

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signUp, signOut, refreshProfile, requestPasswordReset, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
