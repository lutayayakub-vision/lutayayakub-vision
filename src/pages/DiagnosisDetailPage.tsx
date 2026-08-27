import { useState, useEffect } from 'react';
import { useNavigate, useRouter } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, Button, PageContainer, LoadingSpinner, Badge } from '@/components/Layout';
import { ArrowLeft, Sprout, CircleAlert as AlertCircle, Lightbulb, ShieldCheck, Stethoscope, Share2, CircleCheck as CheckCircle, Clock, Microscope, FlaskConical } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Diagnosis, ExpertRequest, DiseaseProduct } from '@/types';

export function DiagnosisDetailPage() {
  const router = useRouter();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null);
  const [expertRequest, setExpertRequest] = useState<ExpertRequest | null>(null);
  const [products, setProducts] = useState<DiseaseProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const diagnosisId = router.path.split('/').pop();

  useEffect(() => {
    if (!diagnosisId) {
      setLoading(false);
      return;
    }
    supabase
      .from('diagnoses')
      .select('*')
      .eq('id', diagnosisId)
      .maybeSingle()
      .then(({ data }) => {
        setDiagnosis(data as Diagnosis | null);
        if (data) {
          supabase
            .from('expert_requests')
            .select('*')
            .eq('diagnosis_id', diagnosisId)
            .maybeSingle()
            .then(({ data: req }) => setExpertRequest(req as ExpertRequest | null));
          if (data.ai_result) {
            supabase
              .from('diseases')
              .select('id')
              .eq('name', data.ai_result)
              .maybeSingle()
              .then(({ data: disease }) => {
                if (disease) {
                  supabase
                    .from('disease_products')
                    .select('*, product:agri_products(*, supplier:agri_suppliers(*))')
                    .eq('disease_id', disease.id)
                    .then(({ data: dps }) => {
                      if (dps) setProducts(dps as unknown as DiseaseProduct[]);
                    });
                }
              });
          }
        }
        setLoading(false);
      });
  }, [diagnosisId]);

  function handleShare() {
    if (!diagnosis) return;
    const text = `AgriDoctor AI Diagnosis\nCrop: ${diagnosis.crop_name}\nPossible problem: ${diagnosis.ai_result ?? 'Unknown'}\nConfidence: ${diagnosis.confidence}%\nSeverity: ${diagnosis.severity}`;
    if (navigator.share) {
      navigator.share({ title: 'AgriDoctor AI Diagnosis', text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text);
    }
  }

  if (loading) return <PageContainer><LoadingSpinner /></PageContainer>;

  if (!diagnosis) {
    return (
      <PageContainer>
        <Card className="p-6 text-center">
          <p className="text-gray-500">Diagnosis not found.</p>
          <Button variant="outline" onClick={() => navigate('/history')} className="mt-4">Back to History</Button>
        </Card>
      </PageContainer>
    );
  }

  const symptoms = diagnosis.symptoms_detected?.split(';').map(s => s.trim()).filter(Boolean) ?? [];
  const causes = diagnosis.causes?.split(';').map(s => s.trim()).filter(Boolean) ?? [];
  const actions = diagnosis.recommended_actions?.split('.').map(s => s.trim()).filter(Boolean) ?? [];
  const prevention = diagnosis.prevention_advice?.split(';').map(s => s.trim()).filter(Boolean) ?? [];

  return (
    <PageContainer>
      <button onClick={() => navigate('/history')} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to History
      </button>

      {diagnosis.image_url && (
        <img src={diagnosis.image_url} alt="" className="w-full h-56 object-cover rounded-2xl shadow-md mb-4" />
      )}

      <Card className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center">
            <Sprout className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Crop</p>
            <p className="font-semibold text-primary-900">{diagnosis.crop_name}</p>
          </div>
        </div>
        <div className="border-t border-primary-50 pt-3">
          <p className="text-xs text-gray-400 mb-1">Possible Problem</p>
          <h2 className="text-xl font-bold text-primary-900">{diagnosis.ai_result ?? 'Unknown'}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-primary-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Confidence</p>
            <p className="text-2xl font-bold text-primary-700">{diagnosis.confidence ?? '—'}{diagnosis.confidence != null ? '%' : ''}</p>
          </div>
          <div className="bg-amber-50 rounded-xl p-3 text-center">
            <p className="text-xs text-gray-400 mb-1">Severity</p>
            <p className="text-lg font-bold text-amber-700 capitalize">{diagnosis.severity ?? '—'}</p>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            {new Date(diagnosis.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </Card>

      {/* Expert review status */}
      <Card className="p-4 mb-4">
        <div className="flex items-center gap-2">
          {diagnosis.expert_review_status === 'reviewed' ? (
            <>
              <CheckCircle className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-semibold text-primary-800 text-sm">Expert Reviewed</p>
                {diagnosis.expert_notes && <p className="text-sm text-gray-600 mt-1">{diagnosis.expert_notes}</p>}
              </div>
            </>
          ) : (
            <>
              <Stethoscope className="w-5 h-5 text-amber-500" />
              <div>
                <p className="font-semibold text-gray-700 text-sm">Not yet reviewed by an expert</p>
                <p className="text-xs text-gray-400">Request expert help for a professional review.</p>
              </div>
            </>
          )}
        </div>
        {expertRequest && (
          <div className="mt-3 pt-3 border-t border-primary-50">
            <Badge color={expertRequest.status === 'answered' ? 'primary' : 'yellow'}>
              Expert request: {expertRequest.status}
            </Badge>
            {expertRequest.status === 'answered' && (
              <Button size="sm" variant="outline" onClick={() => navigate(`/chat/${expertRequest.id}`)} className="ml-2">
                View Conversation
              </Button>
            )}
          </div>
        )}
      </Card>

      {symptoms.length > 0 && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" /> Symptoms Detected
          </h3>
          <ul className="space-y-2">
            {symptoms.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" /> {s}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {causes.length > 0 && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
            <Microscope className="w-5 h-5 text-amber-500" /> Possible Causes
          </h3>
          <ul className="space-y-2">
            {causes.map((c, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0" /> {c}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {actions.length > 0 && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary-500" /> What You Can Do
          </h3>
          <ol className="space-y-2">
            {actions.map((a, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                {a}
              </li>
            ))}
          </ol>
        </Card>
      )}

      {products.length > 0 && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-primary-900 mb-1 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-primary-500" /> Recommended Products
          </h3>
          <p className="text-xs text-gray-400 mb-3">Available from Uganda's leading agri-chemical suppliers</p>
          <div className="space-y-3">
            {products.map((dp) => (
              <div key={dp.id} className="border border-gray-100 rounded-xl p-3 hover:border-primary-200 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-primary-900">{dp.product?.name}</p>
                    {dp.product?.active_ingredient && (
                      <p className="text-xs text-gray-400 mt-0.5">{dp.product.active_ingredient}</p>
                    )}
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium flex-shrink-0 ${
                    dp.product?.type === 'fertilizer' || dp.product?.type === 'micronutrient'
                      ? 'bg-green-100 text-green-700'
                      : dp.product?.type === 'insecticide'
                        ? 'bg-red-100 text-red-700'
                        : dp.product?.type === 'herbicide'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-primary-100 text-primary-700'
                  }`}>
                    {dp.product?.type}
                  </span>
                </div>
                {dp.notes && (
                  <p className="text-xs text-gray-500 mt-2 bg-primary-50 rounded-lg p-2">{dp.notes}</p>
                )}
                {dp.product?.application_rate && (
                  <p className="text-xs text-gray-400 mt-1.5">Rate: {dp.product.application_rate}</p>
                )}
                {dp.supplier?.name && (
                  <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                    <span className="font-medium">Supplier:</span> {dp.supplier.name}
                    {dp.supplier.phone && <span className="text-gray-400">· {dp.supplier.phone}</span>}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {prevention.length > 0 && (
        <Card className="p-5 mb-4">
          <h3 className="font-bold text-primary-900 mb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary-500" /> Prevention Tips
          </h3>
          <ul className="space-y-2">
            {prevention.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <CheckCircle className="w-4 h-4 text-primary-500 mt-0.5 flex-shrink-0" /> {p}
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="bg-gray-50 rounded-xl p-4 flex items-start gap-2 mb-4">
        <AlertCircle className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-500">
          This AI result is an indication, not a final professional diagnosis. For serious crop problems, consult an agricultural extension officer or plant-health specialist.
        </p>
      </div>

      <div className="flex gap-2">
        <Button variant="outline" onClick={handleShare} className="flex-1">
          <span className="flex items-center justify-center gap-1.5"><Share2 className="w-4 h-4" /> Share</span>
        </Button>
        {diagnosis.expert_review_status !== 'reviewed' && (
          <Button onClick={() => navigate(`/expert-help?diagnosis=${diagnosis.id}`)} className="flex-1">
            <span className="flex items-center justify-center gap-1.5"><Stethoscope className="w-4 h-4" /> Get Expert Help</span>
          </Button>
        )}
      </div>
    </PageContainer>
  );
}
