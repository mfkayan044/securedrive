import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

const TABS = [
  { id: 'general', label: 'Genel' },
  { id: 'business', label: 'İş Kuralları' },
  { id: 'notifications', label: 'Bildirimler' },
  { id: 'security', label: 'Güvenlik' },
  { id: 'payment', label: 'Ödeme' },
  { id: 'integrations', label: 'Entegrasyonlar' },
];

const GENERAL_KEYS = [
  'site_name', 'site_description', 'contact_email', 'contact_phone', 'default_language', 'logo_url',
  'homepage_hero_title', 'homepage_hero_desc',
  'why_us_title', 'why_us_desc', 'why_us_items',
  'regions_title', 'regions_list',
  'contact_block', 'footer_text', 'services_list', 'review_block'
];

const AdminSettings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({
    site_name: '',
    site_description: '',
    contact_email: '',
    contact_phone: '',
    language: 'tr',
    logo_url: '',
    logo_file: null as File | null,
    homepage_hero_title: '',
    homepage_hero_desc: '',
    why_us_title: '',
    why_us_desc: '',
    why_us_items: '',
    regions_title: '',
    regions_list: '',
    contact_block: '',
    footer_text: '',
    services_list: '',
    review_block: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Ayarları yükle
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      setErrorMsg(null);
      const { data, error } = await supabase.from('settings').select('key,value').in('key', GENERAL_KEYS);
      if (error) setErrorMsg(error.message);
      if (data) {
        const dict: any = {};
        data.forEach((row: any) => { dict[row.key] = row.value; });
        setForm(f => ({
          ...f,
          site_name: dict.site_name || '',
          site_description: dict.site_description || '',
          contact_email: dict.contact_email || '',
          contact_phone: dict.contact_phone || '',
          language: dict.default_language || 'tr',
          logo_url: dict.logo_url || '',
          homepage_hero_title: dict.homepage_hero_title || '',
          homepage_hero_desc: dict.homepage_hero_desc || '',
          why_us_title: dict.why_us_title || '',
          why_us_desc: dict.why_us_desc || '',
          why_us_items: dict.why_us_items || '',
          regions_title: dict.regions_title || '',
          regions_list: dict.regions_list || '',
          contact_block: dict.contact_block || '',
          footer_text: dict.footer_text || '',
          services_list: dict.services_list || '',
          review_block: dict.review_block || ''
        }));
      }
      setLoading(false);
    };
    fetchSettings();
  }, []);

  // Logo seçildiğinde önizleme
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(f => ({ ...f, logo_file: e.target.files![0] }));
    }
  };

  // Form submit
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    // Oturum kontrolü
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError || !userData?.user) {
      setErrorMsg('Oturum bulunamadı. Lütfen tekrar giriş yapın.');
      setLoading(false);
      return;
    }
        let logoUrl = form.logo_url;
        if (form.logo_file) {
          // BUCKET ADINI BURADAN DEĞİŞTİREBİLİRSİN
          const bucketName = 'site';
          const filePath = 'site/logo.png';
          const fileType = form.logo_file.type || 'image/png';
          const { error: uploadError } = await supabase.storage
            .from(bucketName)
            .upload(filePath, form.logo_file, {
              upsert: true,
              contentType: fileType
            });
          if (uploadError) {
            setErrorMsg('Logo yüklenirken hata oluştu!\n' + uploadError.message + '\nBucket adı: ' + bucketName + '\nYol: ' + filePath);
            setLoading(false);
            return;
          }
          // Signed URL al (ör: 7 gün geçerli)
          const { data: signedUrlData, error: signedUrlError } = await supabase.storage
            .from(bucketName)
            .createSignedUrl(filePath, 60 * 60 * 24 * 7);
          if (signedUrlError || !signedUrlData) {
            setErrorMsg('Logo için signed url alınamadı!');
            setLoading(false);
            return;
          }
          logoUrl = signedUrlData.signedUrl;
        }
    const updates = [
      { key: 'site_name', value: form.site_name, category: 'general', is_public: true },
      { key: 'site_description', value: form.site_description, category: 'general', is_public: true },
      { key: 'contact_email', value: form.contact_email, category: 'general', is_public: true },
      { key: 'contact_phone', value: form.contact_phone, category: 'general', is_public: true },
      { key: 'default_language', value: form.language, category: 'general', is_public: true },
      { key: 'logo_url', value: logoUrl, category: 'general', is_public: true },
      { key: 'homepage_hero_title', value: form.homepage_hero_title, category: 'content', is_public: true },
      { key: 'homepage_hero_desc', value: form.homepage_hero_desc, category: 'content', is_public: true },
      { key: 'why_us_title', value: form.why_us_title, category: 'content', is_public: true },
      { key: 'why_us_desc', value: form.why_us_desc, category: 'content', is_public: true },
      { key: 'why_us_items', value: form.why_us_items, category: 'content', is_public: true },
      { key: 'regions_title', value: form.regions_title, category: 'content', is_public: true },
      { key: 'regions_list', value: form.regions_list, category: 'content', is_public: true },
      { key: 'contact_block', value: form.contact_block, category: 'content', is_public: true },
      { key: 'footer_text', value: form.footer_text, category: 'content', is_public: true },
      { key: 'services_list', value: form.services_list, category: 'content', is_public: true },
      { key: 'review_block', value: form.review_block, category: 'content', is_public: true }
    ];
    let hasError = false;
    for (const row of updates) {
      const { error } = await supabase.from('settings').upsert(row);
      if (error) {
        setErrorMsg(error.message);
        hasError = true;
      }
    }
    setForm(f => ({ ...f, logo_url: logoUrl, logo_file: null }));
    setSuccess(!hasError);
    setLoading(false);
    if (!hasError) setTimeout(() => setSuccess(false), 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">Ayarlar</h1>
      <div className="flex border-b mb-8">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`px-4 py-2 -mb-px border-b-2 font-medium transition-colors duration-200 ${activeTab === tab.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-blue-600'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
  <div className="rounded-xl shadow p-6" style={{background: 'none', boxShadow: 'none'}}>
        {activeTab === 'general' && (
          <form className="space-y-6" onSubmit={handleGeneralSubmit}>
            <div>
              <label className="block font-medium mb-1">Site Logosu</label>
              <input type="file" accept="image/*" className="w-full border rounded px-3 py-2" onChange={handleLogoChange} />
              {form.logo_url && (
                <img src={form.logo_url} alt="Site Logosu" className="h-16 mt-2 rounded-lg object-contain bg-transparent" style={{background: 'none', boxShadow: 'none'}} />
              )}
              <p className="text-xs text-gray-400 mt-1">PNG/JPG, max 1MB</p>
            </div>
            <div>
              <label className="block font-medium mb-1">Site Adı</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.site_name} onChange={e => setForm(f => ({ ...f, site_name: e.target.value }))} />
            </div>
            <div>
              <label className="block font-medium mb-1">Site Açıklaması</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.site_description} onChange={e => setForm(f => ({ ...f, site_description: e.target.value }))} />
            </div>
            <div>
              <label className="block font-medium mb-1">Anasayfa Başlığı</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.homepage_hero_title} onChange={e => setForm(f => ({ ...f, homepage_hero_title: e.target.value }))} />
            </div>
            <div>
              <label className="block font-medium mb-1">Anasayfa Açıklaması</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.homepage_hero_desc} onChange={e => setForm(f => ({ ...f, homepage_hero_desc: e.target.value }))} />
            </div>
            <div>
              <label className="block font-medium mb-1">Neden Bizi Seçmelisiniz? Başlık</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.why_us_title} onChange={e => setForm(f => ({ ...f, why_us_title: e.target.value }))} />
            </div>
            <div>
              <label className="block font-medium mb-1">Neden Bizi Seçmelisiniz? Açıklama</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.why_us_desc} onChange={e => setForm(f => ({ ...f, why_us_desc: e.target.value }))} />
            </div>
            <div>
              <label className="block font-medium mb-1">Neden Bizi Seçmelisiniz? Maddeler (her satır bir madde)</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.why_us_items} onChange={e => setForm(f => ({ ...f, why_us_items: e.target.value }))} placeholder="Her satır bir madde" />
            </div>
            <div>
              <label className="block font-medium mb-1">Hizmetler (her satır bir hizmet)</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.services_list} onChange={e => setForm(f => ({ ...f, services_list: e.target.value }))} placeholder="Her satır bir hizmet" />
            </div>
            <div>
              <label className="block font-medium mb-1">Bölgeler Başlık</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.regions_title} onChange={e => setForm(f => ({ ...f, regions_title: e.target.value }))} />
            </div>
            <div>
              <label className="block font-medium mb-1">Bölgeler Listesi (her satır bir bölge veya açıklama)</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.regions_list} onChange={e => setForm(f => ({ ...f, regions_list: e.target.value }))} placeholder="Her satır bir bölge veya açıklama" />
            </div>
            <div>
              <label className="block font-medium mb-1">İletişim Bloğu (çoklu satır, HTML destekler)</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.contact_block} onChange={e => setForm(f => ({ ...f, contact_block: e.target.value }))} placeholder="Telefon, e-posta, adres vb." />
            </div>
            <div>
              <label className="block font-medium mb-1">Yorum/Değerlendirme Bloğu (ör: 4.9/5 - 2,847 değerlendirme)</label>
              <input type="text" className="w-full border rounded px-3 py-2" value={form.review_block} onChange={e => setForm(f => ({ ...f, review_block: e.target.value }))} />
            </div>
            <div>
              <label className="block font-medium mb-1">Footer Metni</label>
              <textarea className="w-full border rounded px-3 py-2" value={form.footer_text} onChange={e => setForm(f => ({ ...f, footer_text: e.target.value }))} placeholder="© 2025 İstanbul Transfer. Tüm hakları saklıdır." />
            </div>
            <div>
              <label className="block font-medium mb-1">Dil</label>
              <select className="w-full border rounded px-3 py-2" value={form.language} onChange={e => setForm(f => ({ ...f, language: e.target.value }))}>
                <option value="tr">Türkçe</option>
                <option value="en">English</option>
              </select>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded" disabled={loading}>{loading ? 'Kaydediliyor...' : 'Kaydet'}</button>
            {success && <div className="text-green-600 font-medium mt-2">Başarıyla kaydedildi!</div>}
            {errorMsg && <div className="text-red-600 font-medium mt-2">Hata: {errorMsg}</div>}
          </form>
        )}
        {/* Diğer sekmeler burada sade bırakıldı */}
        {activeTab !== 'general' && (
          <div className="text-gray-400 text-center">Bu sekme için ayarlar yakında.</div>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
