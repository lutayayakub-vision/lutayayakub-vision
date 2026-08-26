import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, PageContainer, LoadingSpinner, Badge } from '@/components/Layout';
import { Users, Stethoscope, Microscope, Clock, TrendingUp, AlertTriangle, Sprout, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    farmers: 0,
    experts: 0,
    diagnoses: 0,
    diagnosesThisWeek: 0,
    pendingReviews: 0,
  });
  const [topCrops, setTopCrops] = useState<{ name: string; count: number }[]>([]);
  const [topDiseases, setTopDiseases] = useState<{ name: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    const [profiles, diagnoses, expertReqs] = await Promise.all([
      supabase.from('profiles').select('role'),
      supabase.from('diagnoses').select('crop_name, ai_result, created_at'),
      supabase.from('expert_requests').select('status').eq('status', 'pending'),
    ]);

    const allProfiles = profiles.data ?? [];
    const allDiagnoses = diagnoses.data ?? [];
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    setStats({
      farmers: allProfiles.filter(p => p.role === 'farmer').length,
      experts: allProfiles.filter(p => p.role === 'expert').length,
      diagnoses: allDiagnoses.length,
      diagnosesThisWeek: allDiagnoses.filter(d => new Date(d.created_at) > weekAgo).length,
      pendingReviews: (expertReqs.data ?? []).length,
    });

    // Top crops
    const cropCounts: Record<string, number> = {};
    allDiagnoses.forEach(d => {
      cropCounts[d.crop_name] = (cropCounts[d.crop_name] ?? 0) + 1;
    });
    setTopCrops(Object.entries(cropCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })));

    // Top diseases
    const diseaseCounts: Record<string, number> = {};
    allDiagnoses.forEach(d => {
      if (d.ai_result) {
        diseaseCounts[d.ai_result] = (diseaseCounts[d.ai_result] ?? 0) + 1;
      }
    });
    setTopDiseases(Object.entries(diseaseCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, count]) => ({ name, count })));

    setLoading(false);
  }

  if (loading) return <PageContainer><LoadingSpinner /></PageContainer>;

  const maxCropCount = Math.max(...topCrops.map(c => c.count), 1);
  const maxDiseaseCount = Math.max(...topDiseases.map(d => d.count), 1);

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Platform overview and statistics</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: <Users className="w-5 h-5" />, label: 'Total Farmers', value: stats.farmers, color: 'bg-primary-100 text-primary-700' },
          { icon: <Stethoscope className="w-5 h-5" />, label: 'Experts', value: stats.experts, color: 'bg-sky-100 text-sky-700' },
          { icon: <Microscope className="w-5 h-5" />, label: 'Total Diagnoses', value: stats.diagnoses, color: 'bg-amber-100 text-amber-700' },
          { icon: <Clock className="w-5 h-5" />, label: 'This Week', value: stats.diagnosesThisWeek, color: 'bg-earth-100 text-earth-700' },
        ].map((stat, i) => (
          <Card key={i} className="p-4">
            <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold text-primary-900">{stat.value}</p>
            <p className="text-xs text-gray-500">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Pending reviews alert */}
      {stats.pendingReviews > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-amber-600" />
          <div className="flex-1">
            <p className="font-semibold text-amber-900 text-sm">{stats.pendingReviews} case(s) awaiting expert review</p>
          </div>
          <button onClick={() => navigate('/admin-users')} className="text-sm text-amber-700 font-medium">View →</button>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Top crops chart */}
        <Card className="p-5">
          <h2 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-500" /> Most Analyzed Crops
          </h2>
          {topCrops.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topCrops.map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 flex items-center gap-1.5"><Sprout className="w-3.5 h-3.5 text-primary-500" /> {c.name}</span>
                    <span className="font-medium text-primary-700">{c.count}</span>
                  </div>
                  <div className="h-2 bg-primary-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all" style={{ width: `${(c.count / maxCropCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Top diseases chart */}
        <Card className="p-5">
          <h2 className="font-bold text-primary-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-500" /> Most Detected Problems
          </h2>
          {topDiseases.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet.</p>
          ) : (
            <div className="space-y-3">
              {topDiseases.map((d, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600 truncate">{d.name}</span>
                    <span className="font-medium text-amber-700">{d.count}</span>
                  </div>
                  <div className="h-2 bg-amber-50 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all" style={{ width: `${(d.count / maxDiseaseCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { icon: <Sprout className="w-5 h-5" />, label: 'Manage Crops', path: '/admin-crops' },
          { icon: <Microscope className="w-5 h-5" />, label: 'Manage Diseases', path: '/admin-diseases' },
          { icon: <Users className="w-5 h-5" />, label: 'Manage Users', path: '/admin-users' },
          { icon: <Stethoscope className="w-5 h-5" />, label: 'Manage Experts', path: '/admin-users' },
        ].map((item, i) => (
          <button key={i} onClick={() => navigate(item.path)} className="bg-white rounded-2xl p-4 border border-primary-100 hover:shadow-md transition-all text-left group">
            <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <p className="text-sm font-medium text-primary-900 flex items-center gap-1">
              {item.label} <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </button>
        ))}
      </div>
    </PageContainer>
  );
}
