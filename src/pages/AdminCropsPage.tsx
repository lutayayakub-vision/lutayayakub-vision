import { useState, useEffect } from 'react';
import { Card, Button, PageContainer, LoadingSpinner, EmptyState } from '@/components/Layout';
import { Sprout, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Crop } from '@/types';

export function AdminCropsPage() {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadCrops();
  }, []);

  async function loadCrops() {
    const { data } = await supabase.from('crops').select('*').order('name');
    setCrops(data ?? []);
    setLoading(false);
  }

  function openAdd() {
    setEditId(null);
    setName('');
    setDescription('');
    setShowForm(true);
  }

  function openEdit(crop: Crop) {
    setEditId(crop.id);
    setName(crop.name);
    setDescription(crop.description ?? '');
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    if (editId) {
      await supabase.from('crops').update({ name, description }).eq('id', editId);
    } else {
      await supabase.from('crops').insert({ name, description });
    }
    setSaving(false);
    setShowForm(false);
    loadCrops();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this crop? This will also delete related disease records.')) return;
    await supabase.from('crops').delete().eq('id', id);
    loadCrops();
  }

  if (loading) return <PageContainer><LoadingSpinner /></PageContainer>;

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Manage Crops</h1>
          <p className="text-gray-500 mt-1">Add, edit, and remove supported crops</p>
        </div>
        <Button onClick={openAdd} className="!px-3 sm:!px-4">
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Crop</span></span>
        </Button>
      </div>

      {crops.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Sprout className="w-8 h-8" />} title="No crops" message="Add your first crop to get started." action={<Button onClick={openAdd}>Add Crop</Button>} />
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {crops.map(crop => (
            <Card key={crop.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  {crop.image_url ? (
                    <img src={crop.image_url} alt={crop.name} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center flex-shrink-0">
                      <Sprout className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="font-semibold text-primary-900">{crop.name}</h3>
                    <p className="text-xs text-gray-400 line-clamp-1">{crop.description ?? ''}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(crop)} className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(crop.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 animate-fade-in" onClick={() => setShowForm(false)}>
          <Card className="w-full max-w-md p-6 animate-scale-in">
            <div onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary-900">{editId ? 'Edit Crop' : 'Add Crop'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Crop Name *</label>
                  <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none" placeholder="e.g. Maize" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
                  <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none" placeholder="Brief description of the crop" />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
                  <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving…' : 'Save'}</Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </PageContainer>
  );
}
