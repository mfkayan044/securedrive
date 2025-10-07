import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Trash2, Plus, Edit } from 'lucide-react';

interface ContentItem {
  id: string;
  type: 'blog' | 'faq';
  title: string;
  content: string;
  order: number;
}

const ContentManagement: React.FC = () => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<'blog' | 'faq'>('blog');
  const [form, setForm] = useState<{ id?: string; title: string; content: string }>({ title: '', content: '' });
  const [editMode, setEditMode] = useState(false);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .eq('type', type)
      .order('order', { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line
  }, [type]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (editMode && form.id) {
      await supabase.from('site_content').update({ title: form.title, content: form.content }).eq('id', form.id);
    } else {
      await supabase.from('site_content').insert([{ type, title: form.title, content: form.content }]);
    }
    setForm({ title: '', content: '' });
    setEditMode(false);
    fetchItems();
  };

  const handleEdit = (item: ContentItem) => {
    setForm({ id: item.id, title: item.title, content: item.content });
    setEditMode(true);
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    await supabase.from('site_content').delete().eq('id', id);
    fetchItems();
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex gap-4 mb-6">
        <button onClick={() => { setType('blog'); setForm({ title: '', content: '' }); setEditMode(false); }} className={`px-4 py-2 rounded-lg font-semibold ${type === 'blog' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>Blog</button>
        <button onClick={() => { setType('faq'); setForm({ title: '', content: '' }); setEditMode(false); }} className={`px-4 py-2 rounded-lg font-semibold ${type === 'faq' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'}`}>SSS</button>
      </div>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-8">
        <h2 className="text-xl font-bold mb-4">{editMode ? 'Düzenle' : 'Yeni Ekle'} ({type === 'blog' ? 'Blog' : 'SSS'})</h2>
        <input
          className="w-full mb-3 px-3 py-2 border rounded-lg"
          placeholder={type === 'blog' ? 'Başlık' : 'Soru'}
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          required
        />
        <textarea
          className="w-full mb-3 px-3 py-2 border rounded-lg"
          placeholder={type === 'blog' ? 'Açıklama' : 'Cevap'}
          value={form.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
          required
        />
        <button type="submit" className="bg-primary text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2" disabled={loading}>
          {loading && <Loader2 className="w-4 h-4 animate-spin" />} {editMode ? 'Kaydet' : 'Ekle'}
        </button>
        {editMode && (
          <button type="button" className="ml-4 text-gray-500 underline" onClick={() => { setEditMode(false); setForm({ title: '', content: '' }); }}>Vazgeç</button>
        )}
      </form>
      <div className="space-y-4">
        {loading ? <div className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : items.length === 0 ? <div className="text-center text-gray-400">Henüz içerik yok.</div> : items.map(item => (
          <div key={item.id} className="bg-white rounded-xl shadow p-4 flex justify-between items-start">
            <div>
              <div className="font-semibold text-primary mb-1">{item.title}</div>
              <div className="text-gray-700 text-sm whitespace-pre-line">{item.content}</div>
            </div>
            <div className="flex flex-col gap-2 ml-4">
              <button onClick={() => handleEdit(item)} className="text-blue-500 hover:text-blue-700"><Edit className="w-4 h-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="text-red-500 hover:text-red-700"><Trash2 className="w-4 h-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ContentManagement;
