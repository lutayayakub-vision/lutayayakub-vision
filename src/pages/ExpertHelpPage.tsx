import { useState, useEffect } from 'react';
import { useNavigate, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, Button, PageContainer, LoadingSpinner, Badge } from '@/components/Layout';
import { Stethoscope, ArrowLeft, Send, CheckCircle, MapPin, Sprout, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Diagnosis } from '@/types';

export function ExpertHelpPage() {
  const navigate = useNavigate();
  const router = useRouter();
  const { profile } = useAuth();
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [existingRequests, setExistingRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const params = new URLSearchParams(router.path.split('?')[1] ?? '');
  const preselectedDiagnosis = params.get('diagnosis');

  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('diagnoses')
      .select('*')
      .eq('farmer_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setDiagnoses(data ?? []);
        if (preselectedDiagnosis) setSelectedDiagnosis(preselectedDiagnosis);
        setLoading(false);
      });
    loadRequests();
  }, [profile]);

  async function loadRequests() {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('expert_requests')
      .select('*, diagnoses(*)')
      .eq('farmer_id', profile.id)
      .order('created_at', { ascending: false });
    setExistingRequests(data ?? []);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile?.id || !question) return;
    setSubmitting(true);

    const selectedDiag = diagnoses.find(d => d.id === selectedDiagnosis);
    const { error } = await supabase.from('expert_requests').insert({
      farmer_id: profile.id,
      diagnosis_id: selectedDiagnosis || null,
      crop_name: selectedDiag?.crop_name ?? null,
      question,
      status: 'pending',
    });

    setSubmitting(false);
    if (!error) {
      setSubmitted(true);
      setQuestion('');
      loadRequests();
    }
  }

  if (loading) return <PageContainer><LoadingSpinner /></PageContainer>;

  return (
    <PageContainer>
      <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <Stethoscope className="w-6 h-6 text-primary-600" />
          Talk to an Agriculture Expert
        </h1>
        <p className="text-gray-500 mt-1">Submit your case and an expert will review it</p>
      </div>

      {submitted ? (
        <Card className="p-6 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-primary-900 mb-2">Request Submitted!</h2>
          <p className="text-gray-500 mb-6">An agricultural expert will review your case and respond soon. You can check the status below.</p>
          <Button onClick={() => { setSubmitted(false); }} variant="outline">Submit Another Request</Button>
        </Card>
      ) : (
        <Card className="p-5 mb-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Select Diagnosis (optional)</label>
              <select
                value={selectedDiagnosis}
                onChange={(e) => setSelectedDiagnosis(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
              >
                <option value="">No specific diagnosis</option>
                {diagnoses.map(d => (
                  <option key={d.id} value={d.id}>
                    {d.crop_name} — {d.ai_result ?? 'Unknown'} ({d.confidence}%)
                  </option>
                ))}
              </select>
            </div>

            {selectedDiagnosis && (() => {
              const d = diagnoses.find(dd => dd.id === selectedDiagnosis);
              if (!d?.image_url) return null;
              return (
                <div className="flex gap-3 items-center bg-primary-50 rounded-xl p-3">
                  <img src={d.image_url} alt="" className="w-16 h-16 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium text-primary-800">{d.ai_result}</p>
                    <p className="text-xs text-gray-500">Confidence: {d.confidence}% • Severity: {d.severity}</p>
                  </div>
                </div>
              );
            })()}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Question *</label>
              <textarea
                required
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Describe your problem or what you'd like help with…"
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location (optional)</label>
              <div className="relative">
                <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Your district or area"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                />
              </div>
            </div>

            <Button type="submit" size="lg" disabled={submitting || !question} className="w-full">
              <span className="flex items-center justify-center gap-2">
                {submitting ? 'Submitting…' : <><Send className="w-4 h-4" /> Submit Request</>}
              </span>
            </Button>
          </form>
        </Card>
      )}

      {/* Existing requests */}
      {existingRequests.length > 0 && (
        <div>
          <h2 className="font-bold text-primary-900 mb-3">Your Requests</h2>
          <div className="space-y-2">
            {existingRequests.map((req) => (
              <Card key={req.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {req.crop_name && <Badge><span className="flex items-center gap-1"><Sprout className="w-3 h-3" /> {req.crop_name}</span></Badge>}
                      <Badge color={req.status === 'answered' ? 'primary' : req.status === 'reviewing' ? 'blue' : 'yellow'}>
                        {req.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{req.question}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(req.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>
                  {req.status === 'answered' && (
                    <Button size="sm" variant="outline" onClick={() => navigate(`/chat/${req.id}`)}>
                      View Reply
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 bg-amber-50 rounded-xl p-3">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          Expert support is provided by agricultural extension officers. Response times may vary depending on expert availability.
        </p>
      </div>
    </PageContainer>
  );
}
