import type { Profile, UserRole } from '@/types';
import { DEMO_ACCOUNTS } from '@/lib/demo';

/**
 * Local fallback auth (localStorage-backed) used when Supabase is not configured.
 * Lets sign in / sign up work in the preview without a real backend. Demo accounts
 * are pre-seeded so the demo login buttons work out of the box.
 */

const USERS_KEY = 'agri_local_users';
const SESSION_KEY = 'agri_local_session';

interface LocalUser {
  id: string;
  email: string;
  password: string;
  profile: Profile;
}

interface LocalSession {
  userId: string;
}

/** Minimal session shape — consumers only use it for truthiness. */
export interface MinimalSession {
  user: { id: string };
}

function readUsers(): LocalUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function writeUsers(users: LocalUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readSession(): LocalSession | null {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null');
  } catch {
    return null;
  }
}

function writeSession(s: LocalSession | null) {
  if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
  else localStorage.removeItem(SESSION_KEY);
}

function genId() {
  return 'local-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const localAuth = {
  seedDemoAccounts() {
    const users = readUsers();
    const existing = new Set(users.map((u) => u.email.toLowerCase()));
    let changed = false;

    for (const a of Object.values(DEMO_ACCOUNTS)) {
      if (!existing.has(a.email.toLowerCase())) {
        const id = genId();
        users.push({
          id,
          email: a.email,
          password: a.password,
          profile: {
            id,
            name: a.name,
            email: a.email,
            phone: null,
            role: a.role,
            location: a.location ?? null,
            created_at: new Date().toISOString(),
          },
        });
        changed = true;
      }
    }

    if (changed) writeUsers(users);
  },

  getSession(): { session: MinimalSession | null; profile: Profile | null } {
    const s = readSession();
    if (!s) return { session: null, profile: null };
    const user = readUsers().find((u) => u.id === s.userId);
    if (!user) return { session: null, profile: null };
    return { session: { user: { id: user.id } }, profile: user.profile };
  },

  async signIn(
    email: string,
    password: string,
  ): Promise<{ error: string | null; profile: Profile | null; session: MinimalSession | null }> {
    const user = readUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user || user.password !== password) {
      return { error: 'Invalid email or password.', profile: null, session: null };
    }
    writeSession({ userId: user.id });
    return { error: null, profile: user.profile, session: { user: { id: user.id } } };
  },

  async signUp(
    email: string,
    password: string,
    name: string,
    role: UserRole,
    phone?: string,
    location?: string,
  ): Promise<{ error: string | null; profile: Profile | null; session: MinimalSession | null }> {
    const users = readUsers();
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return { error: 'An account with this email already exists.', profile: null, session: null };
    }
    const id = genId();
    const profile: Profile = {
      id,
      name,
      email,
      phone: phone ?? null,
      role,
      location: location ?? null,
      created_at: new Date().toISOString(),
    };
    users.push({ id, email, password, profile });
    writeUsers(users);
    writeSession({ userId: id });
    return { error: null, profile, session: { user: { id } } };
  },

  signOut() {
    writeSession(null);
  },

  async updatePassword(password: string): Promise<{ error: string | null }> {
    const s = readSession();
    if (!s) return { error: 'No active session.' };
    const users = readUsers();
    const user = users.find((u) => u.id === s.userId);
    if (!user) return { error: 'User not found.' };
    user.password = password;
    writeUsers(users);
    return { error: null };
  },

  async requestPasswordReset(_email: string): Promise<{ error: string | null }> {
    // No email transport in local mode; report success so the UI flow completes.
    return { error: null };
  },
};
