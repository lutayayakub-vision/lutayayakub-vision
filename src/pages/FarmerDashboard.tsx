import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, Button, PageContainer, LoadingSpinner, EmptyState } from '@/components/Layout';
import {
  Camera, MessageCircle, Sprout, History, Stethoscope, BookOpen,
  ArrowRight, Clock, Activity, ShieldCheck, ScanLine, Leaf,
  TrendingUp, AlertTriangle, CheckCircle2, Radar,
} from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Diagnosis } from '@/types';

const SCAN_IMAGE = 'https://images.pexels.com/photos/30309038/pexels-photo-30309038.jpeg?auto=compress&cs=tinysrgb&h=650&w=940';

const SCAN_STATUS_STEPS = [
  'Initializing scan engine…',
  'Preprocessing image data…',
  'Detecting leaf boundaries…',
  'Analyzing pixel patterns…',
  'Matching disease signatures…',
  'Cross-referencing crop database…',
  'Calculating confidence scores…',
  'Compiling diagnostic report…',
];

export function FarmerDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanStep, setScanStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);
  const stepRef = useRef(0);

  useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
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
  }, [profile]);

  // Continuous scan animation — cycles through steps endlessly
  useEffect(() => {
    const interval = setInterval(() => {
      stepRef.current = (stepRef.current + 1) % SCAN_STATUS_STEPS.length;
      setScanStep(stepRef.current);
      setScanProgress(Math.round(((stepRef.current + 1) / SCAN_STATUS_STEPS.length) * 100));
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const actions = [
    { icon: <Camera className="w-5 h-5" />, label: 'Diagnose My Crop', desc: 'Upload or take a photo', path: '/diagnose', color: 'bg-primary-600' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Ask AgriDoctor', desc: 'Ask a farming question', path: '/ask', color: 'bg-sky-600' },
    { icon: <Sprout className="w-5 h-5" />, label: 'My Crops', desc: 'View saved crops', path: '/my-crops', color: 'bg-earth-600' },
    { icon: <History className="w-5 h-5" />, label: 'Diagnosis History', desc: 'See past results', path: '/history', color: 'bg-primary-700' },
    { icon: <Stethoscope className="w-5 h-5" />, label: 'Get Expert Help', desc: 'Talk to an expert', path: '/expert-help', color: 'bg-amber-600' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Learn', desc: 'About your crops', path: '/learn', color: 'bg-sky-700' },
  ];

  return (
    <PageContainer>
      {/* Hero header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="status-blink w-2.5 h-2.5 rounded-full bg-primary-500" />
          <span className="text-xs font-semibold text-primary-600 uppercase tracking-wider">System Active</span>
        </div>
        <h1 className="text-3xl font-extrabold text-primary-900 leading-tight">
          {greeting}, {profile?.name}
        </h1>
        <p className="text-gray-500 mt-1">Your crop health monitoring center</p>
      </div>

      {/* Main grid: Scan panel + side stats */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Live Scan Panel */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-primary-50">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-primary-600 text-white flex items-center justify-center shadow-md">
                <ScanLine className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-primary-900 text-sm">Live Crop Scanner</h2>
                <p className="text-xs text-gray-400">Continuous AI monitoring</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 bg-primary-50 px-2.5 py-1.5 rounded-lg">
              <span className="status-blink w-2 h-2 rounded-full bg-primary-500" />
              <span className="text-xs font-semibold text-primary-700">Scanning</span>
            </div>
          </div>

          {/* Scan viewport */}
          <div className="relative scan-corners bg-primary-900 overflow-hidden" style={{ aspectRatio: '16/10' }}>
            {/* Grid background */}
            <div className="absolute inset-0 scan-grid opacity-40" />

            {/* Crop image */}
            <img
              src={SCAN_IMAGE}
              alt="Crop scan"
              className="absolute inset-0 w-full h-full object-cover opacity-70"
            />

            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-primary-900/30 via-transparent to-primary-900/50" />

            {/* Animated scan line */}
            <div className="absolute left-0 right-0 scan-line" style={{ height: '3px' }}>
              <div className="w-full h-full bg-gradient-to-r from-transparent via-primary-400 to-transparent shadow-[0_0_20px_rgba(74,222,128,0.8)]" />
            </div>

            {/* Radar overlay (top-right) */}
            <div className="absolute top-3 right-3 w-14 h-14 rounded-full border border-primary-400/30 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 rounded-full border-2 border-primary-400/20" />
              <div className="absolute inset-2 rounded-full border border-primary-400/20" />
              <div className="radar-sweep w-full h-full">
                <div className="absolute top-1/2 left-1/2 w-1/2 h-0.5 origin-left bg-gradient-to-r from-primary-400 to-transparent" />
              </div>
            </div>

            {/* Status overlay (bottom) */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-primary-900/90 to-transparent">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-primary-300">
                  <Activity className="w-4 h-4 animate-pulse" />
                  <span className="text-xs font-medium">{SCAN_STATUS_STEPS[scanStep]}</span>
                </div>
                <span className="text-xs font-bold text-primary-300 tabular-nums">{scanProgress}%</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-primary-900/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-300 rounded-full transition-all duration-1000 ease-linear"
                  style={{ width: `${scanProgress}%` }}
                />
              </div>
            </div>
          </div>

          {/* Scan footer */}
          <div className="px-5 py-3 flex items-center justify-between bg-primary-50/50">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Radar className="w-3.5 h-3.5 text-primary-500" />
                Real-time
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-primary-500" />
                AI-Powered
              </span>
            </div>
            <Button size="sm" onClick={() => navigate('/diagnose')} className="group">
              <span className="flex items-center gap-1.5">
                <Camera className="w-4 h-4" />
                New Scan
              </span>
            </Button>
          </div>
        </Card>

        {/* Side stats column */}
        <div className="flex flex-col gap-5">
          {/* Stats cards */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-5">
            <StatCard
              icon={<CheckCircle2 className="w-5 h-5" />}
              label="Total Scans"
              value={diagnoses.length}
              color="primary"
            />
            <StatCard
              icon={<AlertTriangle className="w-5 h-5" />}
              label="Issues Found"
              value={diagnoses.filter((d) => d.ai_result && !d.ai_result.toLowerCase().includes('healthy')).length}
              color="amber"
            />
          </div>

          {/* Quick action highlight */}
          <Card className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-br from-primary-700 to-primary-900 text-white border-0">
            <div>
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-1">Stay Ahead of Crop Disease</h3>
              <p className="text-sm text-primary-100 mb-4">
                Scan your crops regularly to catch problems early and protect your harvest.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/diagnose')}
              className="group w-full"
            >
              <span className="flex items-center justify-center gap-1.5">
                Start Diagnosis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </Button>
          </Card>
        </div>
      </div>

      {/* Quick actions grid */}
      <div className="mb-6">
        <h2 className="font-bold text-primary-900 mb-3 text-sm uppercase tracking-wide">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {actions.map((action, i) => (
            <button
              key={i}
              onClick={() => navigate(action.path)}
              className="group bg-white rounded-2xl p-4 border border-primary-100 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left"
            >
              <div className={`w-11 h-11 rounded-xl ${action.color} text-white flex items-center justify-center mb-2.5 group-hover:scale-110 transition-transform shadow-md`}>
                {action.icon}
              </div>
              <h3 className="font-semibold text-primary-900 text-sm">{action.label}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{action.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Recent diagnoses */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-primary-900">Recent Diagnoses</h2>
          <button
            onClick={() => navigate('/history')}
            className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1"
          >
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
                  <p className="font-medium text-gray-800 text-sm">
                    {d.crop_name} — {d.ai_result ?? 'Analyzing…'}
                  </p>
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

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: 'primary' | 'amber';
}) {
  const colors = {
    primary: { bg: 'bg-primary-50', text: 'text-primary-700', icon: 'bg-primary-600' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', icon: 'bg-amber-500' },
  };
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${colors[color].icon} text-white flex items-center justify-center shadow-md`}>
          {icon}
        </div>
        <div>
          <p className="text-2xl font-extrabold text-primary-900 tabular-nums">{value}</p>
          <p className="text-xs text-gray-400">{label}</p>
        </div>
      </div>
    </Card>
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
