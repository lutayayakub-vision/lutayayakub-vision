import { useState, useEffect } from 'react';
import { Card, PageContainer, LoadingSpinner, EmptyState, Badge } from '@/components/Layout';
import { Users, MapPin, Mail, Phone } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'farmer' | 'expert' | 'admin'>('all');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setUsers(data ?? []);
    setLoading(false);
  }

  if (loading) return <PageContainer><LoadingSpinner /></PageContainer>;

  const filtered = filter === 'all' ? users : users.filter(u => u.role === filter);

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Manage Users</h1>
        <p className="text-gray-500 mt-1">View all platform users</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
        {(['all', 'farmer', 'expert', 'admin'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-colors flex-shrink-0 ${
              filter === f ? 'bg-primary-600 text-white' : 'bg-white text-gray-500 border border-primary-100 hover:bg-primary-50'
            }`}
          >
            {f === 'all' ? 'All' : `${f}s`}
            <span className="ml-1.5 text-xs opacity-70">
              ({f === 'all' ? users.length : users.filter(u => u.role === f).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Users className="w-8 h-8" />} title="No users found" message="No users match this filter." />
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map(u => (
            <Card key={u.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center font-bold flex-shrink-0">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-primary-900">{u.name}</h3>
                    <Badge color={u.role === 'admin' ? 'red' : u.role === 'expert' ? 'blue' : 'primary'}>{u.role}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {u.email}</span>
                    {u.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {u.phone}</span>}
                    {u.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {u.location}</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
