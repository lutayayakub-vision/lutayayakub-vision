import { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Card, Button, PageContainer, LoadingSpinner, EmptyState, Badge } from '@/components/Layout';
import { Sprout, Plus, MapPin, Calendar, X, FileText, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Crop, FarmerCrop } from '@/types';

export function MyCropsPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);
  const [farmerCrops, setFarmerCrops] = useState<FarmerCrop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // form state
  const [cropName, setCropName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [plantingDate, setPlantingDate] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('crops').select('*').order('name').then(({ data }) => {
      if (data) setCrops(data);
    });
    loadFarmerCrops();
  }, [profile]);

  async function loadFarmerCrops() {
    if (!profile?.id) return;
    const { data } = await supabase
      .from('farmer_crops')
      .select('*')
      .eq('farmer_id', profile.id)
      .order('created_at', { ascending: false });
    setFarmerCrops(data ?? []);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!cropName || !profile?.id) return;
    setSaving(true);

    const crop = crops.find(c => c.name === cropName);
    const { error } = await supabase.from('farmer_crops').insert({
      farmer_id: profile.id,
      crop_id: crop?.id ?? null,
      crop_name: cropName,
      farm_name: farmName || null,
      planting_date: plantingDate || null,
      location: location || null,
      notes: notes || null,
    });

    setSaving(false);
    if (!error) {
      setShowForm(false);
      setCropName(''); setFarmName(''); setPlantingDate(''); setLocation(''); setNotes('');
      loadFarmerCrops();
    }
  }

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">My Crops</h1>
          <p className="text-gray-500 mt-1">Manage your crop and field records</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="!px-3 sm:!px-4">
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Crop</span></span>
        </Button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : farmerCrops.length === 0 ? (
        <Card className="p-6">
          <EmptyState
            icon={<Sprout className="w-8 h-8" />}
            title="No crops saved yet"
            message="Add your first crop record to keep track of your farm and fields."
            action={<Button onClick={() => setShowForm(true)}><span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> Add Your First Crop</span></Button>}
          />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmerCrops.map((fc) => {
            const crop = crops.find(c => c.name === fc.crop_name);
            return (
            <Card key={fc.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow">
              {crop?.image_url ? (
                <div className="h-32 overflow-hidden">
                  <img src={crop.image_url} alt={fc.crop_name} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="h-32 bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Sprout className="w-10 h-10" />
                </div>
              )}
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <Badge color={fc.status === 'monitoring' ? 'blue' : 'primary'}>{fc.status}</Badge>
                </div>
                <h3 className="font-bold text-primary-900">{fc.farm_name ?? `${fc.crop_name} Farm`}</h3>
                <p className="text-sm text-gray-500 mb-3">Crop: {fc.crop_name}</p>
                <div className="space-y-1.5 text-xs text-gray-400">
                  {fc.planting_date && (
                    <p className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Planted: {new Date(fc.planting_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  )}
                  {fc.location && (
                    <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {fc.location}</p>
                  )}
                  {fc.notes && (
                    <p className="flex items-start gap-1.5"><FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" /> {fc.notes}</p>
                  )}
                </div>
              </div>
            </Card>
            );
          })}
        </div>
      )}

      {/* Add crop modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto animate-scale-in" >
            <div onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary-900">Add Crop Record</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Crop Name *</label>
                  <select
                    required
                    value={cropName}
                    onChange={(e) => setCropName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  >
                    <option value="">Select a crop…</option>
                    {crops.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Farm / Field Name</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. My Tomato Farm"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Planting Date</label>
                  <input
                    type="date"
                    value={plantingDate}
                    onChange={(e) => setPlantingDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Wakiso"
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Notes</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any notes about this crop…"
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving…' : 'Save Crop'}</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
