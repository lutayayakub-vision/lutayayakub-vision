import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, PageContainer, LoadingSpinner, EmptyState, Badge } from '@/components/Layout';
import { History, Sprout, Clock, ArrowRight, Stethoscope } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Diagnosis } from '@/types';

export function HistoryPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('diagnoses')
      .select('*')
      .eq('farmer_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDiagnoses(data ?? []);
        setLoading(false);
      });
  }, [profile]);

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Diagnosis History</h1>
        <p className="text-gray-500 mt-1">All your past AI crop analyses</p>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : diagnoses.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<History className="w-8 h-8" />}
            title="No diagnoses yet"
            message="Your AI diagnoses will appear here once you start analyzing your crops."
            action={<button onClick={() => navigate('/diagnose')} className="text-primary-600 font-medium text-sm hover:text-primary-700">Diagnose your first crop →</button>}
          />
        </Card>
      ) : (
        <div className="space-y-3">
          {diagnoses.map((d) => (
            <Card key={d.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" >
              <div onClick={() => navigate(`/diagnosis/${d.id}`)} className="flex items-center gap-4">
                {d.image_url ? (
                  <img src={d.image_url} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Sprout className="w-7 h-7 text-primary-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-primary-900">{d.crop_name}</h3>
                    {d.confidence != null && <Badge>{d.confidence}%</Badge>}
                    {d.severity && <Badge color={d.severity === 'severe' ? 'red' : 'yellow'}>{d.severity}</Badge>}
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5 truncate">{d.ai_result ?? 'No result'}</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(d.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    {d.expert_review_status === 'reviewed' && (
                      <span className="text-xs text-primary-600 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3" /> Expert reviewed
                      </span>
                    )}
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-300 flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
