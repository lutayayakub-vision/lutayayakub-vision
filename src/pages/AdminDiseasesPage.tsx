import { useState, useEffect } from 'react';
import { Card, Button, PageContainer, LoadingSpinner, EmptyState, Badge } from '@/components/Layout';
import { Microscope, Plus, X, Pencil, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Crop, Disease } from '@/types';

export function AdminDiseasesPage() {
  const [diseases, setDiseases] = useState<(Disease & { crops?: Crop })[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    crop_id: '', name: '', description: '', symptoms: '', causes: '',
    prevention: '', recommended_actions: '', severity: 'moderate', warning_notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [d, c] = await Promise.all([
      supabase.from('diseases').select('*, crops(*)').order('name'),
      supabase.from('crops').select('*').order('name'),
    ]);
    setDiseases((d.data ?? []) as (Disease & { crops?: Crop })[]);
    setCrops(c.data ?? []);
    setLoading(false);
  }

  function openAdd() {
    setEditId(null);
    setForm({ crop_id: '', name: '', description: '', symptoms: '', causes: '', prevention: '', recommended_actions: '', severity: 'moderate', warning_notes: '' });
    setShowForm(true);
  }

  function openEdit(d: Disease) {
    setEditId(d.id);
    setForm({
      crop_id: d.crop_id ?? '', name: d.name, description: d.description ?? '',
      symptoms: d.symptoms ?? '', causes: d.causes ?? '', prevention: d.prevention ?? '',
      recommended_actions: d.recommended_actions ?? '', severity: d.severity ?? 'moderate',
      warning_notes: d.warning_notes ?? '',
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.crop_id) return;
    setSaving(true);
    const payload = {
      crop_id: form.crop_id,
      name: form.name,
      description: form.description || null,
      symptoms: form.symptoms || null,
      causes: form.causes || null,
      prevention: form.prevention || null,
      recommended_actions: form.recommended_actions || null,
      severity: form.severity,
      warning_notes: form.warning_notes || null,
    };
    if (editId) {
      await supabase.from('diseases').update(payload).eq('id', editId);
    } else {
      await supabase.from('diseases').insert(payload);
    }
    setSaving(false);
    setShowForm(false);
    loadData();
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this disease record?')) return;
    await supabase.from('diseases').delete().eq('id', id);
    loadData();
  }

  if (loading) return <PageContainer><LoadingSpinner /></PageContainer>;

  return (
    <PageContainer>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">Manage Diseases</h1>
          <p className="text-gray-500 mt-1">Add, edit, and remove disease records</p>
        </div>
        <Button onClick={openAdd} className="!px-3 sm:!px-4">
          <span className="flex items-center gap-1.5"><Plus className="w-4 h-4" /> <span className="hidden sm:inline">Add Disease</span></span>
        </Button>
      </div>

      {diseases.length === 0 ? (
        <Card className="p-6">
          <EmptyState icon={<Microscope className="w-8 h-8" />} title="No diseases" message="Add disease records to the database." action={<Button onClick={openAdd}>Add Disease</Button>} />
        </Card>
      ) : (
        <div className="space-y-2">
          {diseases.map(d => (
            <Card key={d.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-primary-900">{d.name}</h3>
                    {d.crops && <Badge>{d.crops.name}</Badge>}
                    <Badge color={d.severity === 'severe' ? 'red' : 'yellow'}>{d.severity}</Badge>
                  </div>
                  {d.description && <p className="text-sm text-gray-500 line-clamp-2">{d.description}</p>}
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg hover:bg-primary-50 text-gray-400 hover:text-primary-600">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500">
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
          <Card className="w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto animate-scale-in">
            <div onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-primary-900">{editId ? 'Edit Disease' : 'Add Disease'}</h2>
                <button onClick={() => setShowForm(false)} className="p-1 rounded-lg hover:bg-gray-100">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop *</label>
                    <select required value={form.crop_id} onChange={(e) => setForm({ ...form, crop_id: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm">
                      <option value="">Select…</option>
                      {crops.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
                    <select value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm">
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Disease Name *</label>
                  <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms (separate with ;)</label>
                  <textarea value={form.symptoms} onChange={(e) => setForm({ ...form, symptoms: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Causes</label>
                  <textarea value={form.causes} onChange={(e) => setForm({ ...form, causes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recommended Actions (separate with .)</label>
                  <textarea value={form.recommended_actions} onChange={(e) => setForm({ ...form, recommended_actions: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prevention (separate with ;)</label>
                  <textarea value={form.prevention} onChange={(e) => setForm({ ...form, prevention: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Warning Notes</label>
                  <textarea value={form.warning_notes} onChange={(e) => setForm({ ...form, warning_notes: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none resize-none text-sm" />
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
