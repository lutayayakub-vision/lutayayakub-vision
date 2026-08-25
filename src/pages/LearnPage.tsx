import { useState, useEffect } from 'react';
import { Card, PageContainer, LoadingSpinner, EmptyState, Badge } from '@/components/Layout';
import { BookOpen, Sprout, ArrowLeft, AlertCircle, ShieldCheck, Lightbulb, Stethoscope } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Crop, Disease, EducationalContent } from '@/types';

export function LearnPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [content, setContent] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('crops').select('*').order('name'),
      supabase.from('diseases').select('*'),
      supabase.from('educational_content').select('*').eq('published', true),
    ]).then(([c, d, e]) => {
      if (c.data) setCrops(c.data);
      if (d.data) setDiseases(d.data);
      if (e.data) setContent(e.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <PageContainer><LoadingSpinner /></PageContainer>;

  if (selectedCrop) {
    const crop = crops.find(c => c.name === selectedCrop);
    const cropDiseases = diseases.filter(d => {
      return crops.find(c => c.id === d.crop_id)?.name === selectedCrop;
    });
    const cropContent = content.find(c => c.crop_name === selectedCrop);

    return (
      <PageContainer>
        <button onClick={() => setSelectedCrop(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-primary-600 mb-4">
          <ArrowLeft className="w-4 h-4" /> All Crops
        </button>

        <div className="mb-6">
          {crop?.image_url && (
            <img src={crop.image_url} alt={selectedCrop} className="w-full h-40 object-cover rounded-2xl mb-4" />
          )}
          <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-600 flex items-center justify-center mb-3">
            <Sprout className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-primary-900">{selectedCrop}</h1>
          {crop?.description && <p className="text-gray-500 mt-1">{crop.description}</p>}
        </div>

        {cropContent?.content && (
          <Card className="p-5 mb-4">
            <h3 className="font-bold text-primary-900 mb-2 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary-500" /> About {selectedCrop}
            </h3>
            <p className="text-sm text-gray-600">{cropContent.content}</p>
          </Card>
        )}

        <h2 className="font-bold text-primary-900 mb-3 mt-6">Common Diseases</h2>
        {cropDiseases.length === 0 ? (
          <p className="text-sm text-gray-400">No disease information available yet.</p>
        ) : (
          <div className="space-y-3">
            {cropDiseases.map(d => (
              <Card key={d.id} className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-primary-900">{d.name}</h3>
                  <Badge color={d.severity === 'severe' ? 'red' : 'yellow'}>{d.severity}</Badge>
                </div>
                {d.description && <p className="text-sm text-gray-600 mb-3">{d.description}</p>}
                {d.symptoms && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Symptoms</p>
                    <p className="text-sm text-gray-600">{d.symptoms}</p>
                  </div>
                )}
                {d.causes && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Causes</p>
                    <p className="text-sm text-gray-600">{d.causes}</p>
                  </div>
                )}
                {d.recommended_actions && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><Lightbulb className="w-3.5 h-3.5" /> Recommended Actions</p>
                    <p className="text-sm text-gray-600">{d.recommended_actions}</p>
                  </div>
                )}
                {d.prevention && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Prevention</p>
                    <p className="text-sm text-gray-600">{d.prevention}</p>
                  </div>
                )}
                {d.warning_notes && (
                  <div className="bg-amber-50 rounded-xl p-3 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700">{d.warning_notes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <div className="mt-6 bg-primary-50 rounded-xl p-4 flex items-start gap-2">
          <Stethoscope className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-primary-800 text-sm">When to Seek Expert Help</p>
            <p className="text-sm text-gray-600 mt-1">
              If symptoms are severe, spreading rapidly, or you're unsure about the diagnosis, contact an agricultural extension officer.
              AI guidance is helpful but not a replacement for professional advice.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-primary-500" />
          Learn About Your Crops
        </h1>
        <p className="text-gray-500 mt-1">Common diseases, symptoms, and prevention tips</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {crops.map(crop => {
          const cropDiseaseCount = diseases.filter(d => crops.find(c => c.id === d.crop_id)?.name === crop.name).length;
          return (
            <button
              key={crop.id}
              onClick={() => setSelectedCrop(crop.name)}
              className="group bg-white rounded-2xl border border-primary-100 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left overflow-hidden"
            >
              {crop.image_url ? (
                <div className="h-32 overflow-hidden">
                  <img src={crop.image_url} alt={crop.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              ) : (
                <div className="h-32 bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Sprout className="w-10 h-10" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-bold text-primary-900">{crop.name}</h3>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{crop.description ?? ''}</p>
                <p className="text-xs text-primary-600 font-medium mt-2">{cropDiseaseCount} known diseases</p>
              </div>
            </button>
          );
        })}
      </div>
    </PageContainer>
  );
}
