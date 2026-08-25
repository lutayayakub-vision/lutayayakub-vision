import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, Button, PageContainer, LoadingSpinner, EmptyState } from '@/components/Layout';
import { Camera, MessageCircle, Sprout, History, Stethoscope, BookOpen, ArrowRight, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Diagnosis } from '@/types';

export function FarmerDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      supabase
        .from('diagnoses')
        .select('*')
        .eq('farmer_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(5)
        .then(({ data }) => {
          setDiagnoses(data ?? []);
          setLoading(false);
        });
    }
  }, [profile]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const actions = [
    { icon: <Camera className="w-6 h-6" />, label: 'Diagnose My Crop', desc: 'Upload or take a photo', path: '/diagnose', color: 'bg-primary-600' },
    { icon: <MessageCircle className="w-6 h-6" />, label: 'Ask AgriDoctor', desc: 'Ask a farming question', path: '/ask', color: 'bg-sky-600' },
    { icon: <Sprout className="w-6 h-6" />, label: 'My Crops', desc: 'View saved crops', path: '/my-crops', color: 'bg-earth-600' },
    { icon: <History className="w-6 h-6" />, label: 'Diagnosis History', desc: 'See past results', path: '/history', color: 'bg-primary-700' },
    { icon: <Stethoscope className="w-6 h-6" />, label: 'Get Expert Help', desc: 'Talk to an expert', path: '/expert-help', color: 'bg-amber-600' },
    { icon: <BookOpen className="w-6 h-6" />, label: 'Learn', desc: 'About your crops', path: '/learn', color: 'bg-sky-700' },
  ];

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900">
          {greeting}, {profile?.name} <span className="inline-block animate-pulse-soft">👋</span>
        </h1>
        <p className="text-gray-500 mt-1">What would you like to do today?</p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {actions.map((action, i) => (
          <button
            key={i}
            onClick={() => navigate(action.path)}
            className="group bg-white rounded-2xl p-4 sm:p-5 border border-primary-100 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
          >
            <div className={`w-12 h-12 rounded-xl ${action.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-md`}>
              {action.icon}
            </div>
            <h3 className="font-semibold text-primary-900 text-sm sm:text-base">{action.label}</h3>
            <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
          </button>
        ))}
      </div>

      {/* Recent diagnoses */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary-900">Recent Diagnoses</h2>
          <button onClick={() => navigate('/history')} className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : diagnoses.length === 0 ? (
          <EmptyState
            icon={<Camera className="w-8 h-8" />}
            title="No diagnoses yet"
            message="Take a photo of your crop to get your first AI diagnosis."
            action={<Button size="sm" onClick={() => navigate('/diagnose')}>Diagnose My Crop</Button>}
          />
        ) : (
          <div className="space-y-2">
            {diagnoses.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate(`/diagnosis/${d.id}`)}
                className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-primary-50 transition-colors text-left"
              >
                {d.image_url ? (
                  <img src={d.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <Sprout className="w-6 h-6 text-primary-500" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 text-sm">{d.crop_name} — {d.ai_result ?? 'Analyzing…'}</p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    {formatTime(d.created_at)}
                  </p>
                </div>
                {d.confidence && (
                  <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded-lg">
                    {d.confidence}%
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </Card>
    </PageContainer>
  );
}

function formatTime(iso: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}
