import { useState, useEffect } from 'react';
import { useNavigate, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, Button, PageContainer, LoadingSpinner, EmptyState, Badge } from '@/components/Layout';
import { Stethoscope, Clock, Sprout, MessageCircle, CheckCircle, FileSearch, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { ExpertRequest, Diagnosis } from '@/types';

export function ExpertDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [requests, setRequests] = useState<(ExpertRequest & { diagnoses?: Diagnosis })[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ pending: 0, reviewing: 0, answered: 0 });

  useEffect(() => {
    loadRequests();
  }, [profile]);

  async function loadRequests() {
    const { data } = await supabase
      .from('expert_requests')
      .select('*, diagnoses(*)')
      .order('created_at', { ascending: false });
    const reqs = (data ?? []) as (ExpertRequest & { diagnoses?: Diagnosis })[];
    setRequests(reqs);
    setStats({
      pending: reqs.filter(r => r.status === 'pending').length,
      reviewing: reqs.filter(r => r.status === 'reviewing').length,
      answered: reqs.filter(r => r.status === 'answered').length,
    });
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from('expert_requests').update({ status, expert_id: profile?.id }).eq('id', id);
    loadRequests();
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Expert Dashboard</h1>
        <p className="text-gray-500 mt-1">Review farmer requests and provide expert advice</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-gray-500 mt-1">Pending</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-sky-600">{stats.reviewing}</p>
          <p className="text-xs text-gray-500 mt-1">Reviewing</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-3xl font-bold text-primary-600">{stats.answered}</p>
          <p className="text-xs text-gray-500 mt-1">Answered</p>
        </Card>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : requests.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Stethoscope className="w-8 h-8" />}
            title="No requests yet"
            message="When farmers submit expert requests, they will appear here for your review."
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id} className="p-4">
              <div className="flex items-start gap-3">
                {req.diagnoses?.image_url ? (
                  <img src={req.diagnoses.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Sprout className="w-7 h-7 text-primary-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    {req.crop_name && <Badge><span className="flex items-center gap-1"><Sprout className="w-3 h-3" /> {req.crop_name}</span></Badge>}
                    <Badge color={req.status === 'answered' ? 'primary' : req.status === 'reviewing' ? 'blue' : 'yellow'}>
                      {req.status}
                    </Badge>
                    {req.diagnoses?.ai_result && (
                      <span className="text-xs text-gray-500">AI: {req.diagnoses.ai_result} ({req.diagnoses.confidence}%)</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mt-1">{req.question}</p>
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-3 pt-3 border-t border-primary-50">
                {req.status === 'pending' && (
                  <Button size="sm" onClick={() => updateStatus(req.id, 'reviewing')}>
                    <span className="flex items-center gap-1"><FileSearch className="w-4 h-4" /> Start Review</span>
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => navigate(`/chat/${req.id}`)}>
                  <span className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /> Message Farmer</span>
                </Button>
                {req.status !== 'answered' && (
                  <Button size="sm" variant="secondary" onClick={() => updateStatus(req.id, 'answered')}>
                    <span className="flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Confirm Diagnosis</span>
                  </Button>
                )}
                {req.status === 'answered' && (
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/chat/${req.id}`)}>
                    <span className="flex items-center gap-1">View Conversation <ArrowRight className="w-4 h-4" /></span>
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
