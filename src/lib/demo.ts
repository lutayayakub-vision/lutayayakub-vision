import { supabase } from '@/lib/supabase';

export const DEMO_ACCOUNTS = {
  farmer: { email: 'sarah@agridoctor.demo', password: 'demo1234', name: 'Sarah', role: 'farmer' as const, location: 'Wakiso' },
  expert: { email: 'david@agridoctor.demo', password: 'demo1234', name: 'David', role: 'expert' as const, location: 'Kampala' },
  admin: { email: 'admin@agridoctor.demo', password: 'demo1234', name: 'Vet4 Admin', role: 'admin' as const, location: 'Makerere' },
};

let initialized = false;

export async function ensureDemoAccounts() {
  if (initialized) return;
  initialized = true;

  const savedSession = (await supabase.auth.getSession()).data.session;

  for (const account of Object.values(DEMO_ACCOUNTS)) {
    const { data, error } = await supabase.auth.signUp({
      email: account.email,
      password: account.password,
    });

    if (data.user && !error) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        name: account.name,
        email: account.email,
        role: account.role,
        location: account.location,
      });
    }
  }

  if (savedSession) {
    await supabase.auth.setSession({
      access_token: savedSession.access_token,
      refresh_token: savedSession.refresh_token,
    });
  } else {
    await supabase.auth.signOut();
  }
}
