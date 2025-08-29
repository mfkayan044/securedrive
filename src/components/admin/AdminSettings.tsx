import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

interface Coupon {
  id: string;
  code: string;
  discount_type: 'amount' | 'percent';
  discount_value: number;
  expires_at: string | null;
  is_active: boolean;
  assigned_user: string | null;
  created_at: string;
}

const AdminSettings: React.FC = () => {
  // Tüm state ve fonksiyonlar burada
  const TABS = [
    { id: 'general', label: 'Genel' },
    { id: 'coupons', label: 'İndirim Kuponları' },
    { id: 'business', label: 'İş Kuralları' },
  ];
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState({
    site_name: '', site_description: '', contact_email: '', contact_phone: '', language: 'tr', logo_url: '', logo_file: null as File | null,
    homepage_hero_title: '', homepage_hero_desc: '', why_us_title: '', why_us_desc: '', why_us_items: '', regions_title: '', regions_list: '', contact_block: '', footer_text: '', services_list: '', review_block: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponForm, setCouponForm] = useState({ code: '', discount_type: 'amount', discount_value: 0, expires_at: '', is_active: true, assigned_user: '' });
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [couponSuccess, setCouponSuccess] = useState(false);
  const [businessForm, setBusinessForm] = useState({
    minReservationNotice: '',
    maxReservationAdvance: '',
    maxPassengersEconomy: '',
    maxPassengersBus: '',
    paymentRequirement: 'full',
    reservationApproval: 'auto',
    flightCodeRequired: 'no',
    airportRequiredInRoute: 'yes',
    extraNote: ''
  });
  const [businessSuccess, setBusinessSuccess] = useState(false);

  // İş kuralları: business_rules tablosundan min/max notice'ı yükle
  useEffect(() => {
    if (activeTab !== 'business') return;
    const fetchBusinessRules = async () => {
      if (!supabase) return;
      const keys = [
        'min_reservation_notice_hours',
        'max_reservation_notice_days',
        'max_passengers_economy',
        'max_passengers_bus',
        'payment_requirement',
        'reservation_approval',
        'flight_code_required',
        'airport_required_in_route'
      ];
      const { data } = await supabase.from('business_rules').select('key,value').in('key', keys);
      if (data && Array.isArray(data)) {
        const minRule = data.find((r:any) => r.key === 'min_reservation_notice_hours');
        const maxRule = data.find((r:any) => r.key === 'max_reservation_notice_days');
        const maxEco = data.find((r:any) => r.key === 'max_passengers_economy');
        const maxBus = data.find((r:any) => r.key === 'max_passengers_bus');
        const paymentReq = data.find((r:any) => r.key === 'payment_requirement');
        const reservationApproval = data.find((r:any) => r.key === 'reservation_approval');
        const flightCodeRequired = data.find((r:any) => r.key === 'flight_code_required');
        const airportRequired = data.find((r:any) => r.key === 'airport_required_in_route');
        setBusinessForm(f => ({
          ...f,
          minReservationNotice: minRule?.value || '',
          maxReservationAdvance: maxRule?.value || '',
          maxPassengersEconomy: maxEco?.value || '',
          maxPassengersBus: maxBus?.value || '',
          paymentRequirement: paymentReq?.value || 'full',
          reservationApproval: reservationApproval?.value || 'auto',
          flightCodeRequired: flightCodeRequired?.value || 'no',
          airportRequiredInRoute: airportRequired?.value || 'yes'
        }));
      }
    };
    fetchBusinessRules();
  }, [activeTab]);

  // Genel ayarları yükle
  useEffect(() => {
    if (activeTab !== 'general') return;
    const fetchSettings = async () => {
      setLoading(true);
      setErrorMsg(null);
      if (!supabase) return;
      const GENERAL_KEYS = [
        'site_name', 'site_description', 'contact_email', 'contact_phone', 'default_language', 'logo_url',
        'homepage_hero_title', 'homepage_hero_desc', 'why_us_title', 'why_us_desc', 'why_us_items',
        'regions_title', 'regions_list', 'contact_block', 'footer_text', 'services_list', 'review_block'
      ];
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
  }, [activeTab]);

  // Logo seçildiğinde önizleme
  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm(f => ({ ...f, logo_file: e.target.files![0] }));
    }
  };

  // Genel ayarları kaydet
  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let logoUrl = form.logo_url;
    if (form.logo_file) {
      const bucketName = 'site';
      const filePath = 'site/logo.png';
      const fileType = form.logo_file.type || 'image/png';
      if (!supabase) return;
      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, form.logo_file, { upsert: true, contentType: fileType });
      if (uploadError) {
        setErrorMsg('Logo yüklenirken hata oluştu!\n' + uploadError.message);
        setLoading(false);
        return;
      }
      if (!supabase) return;
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
      if (!supabase) return;
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

  // Kuponları yükle
  useEffect(() => {
    if (activeTab !== 'coupons') return;
    const fetchCoupons = async () => {
      setCouponLoading(true);
      setCouponError(null);
      if (!supabase) return;
      const { data, error } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (error) setCouponError(error.message);
      if (data) setCoupons(data);
      setCouponLoading(false);
    };
    fetchCoupons();
  }, [activeTab]);

  // Kupon ekle
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponLoading(true);
    setCouponError(null);
    setCouponSuccess(false);
    const insertData = {
      code: couponForm.code,
      discount_type: couponForm.discount_type,
      discount_value: couponForm.discount_value,
      expires_at: couponForm.expires_at ? new Date(couponForm.expires_at).toISOString() : null,
      is_active: couponForm.is_active,
      assigned_user: couponForm.assigned_user || null,
    };
    if (!supabase) return;
    const { error } = await supabase.from('coupons').insert([insertData]);
    if (error) {
      setCouponError(error.message);
    } else {
      setCouponSuccess(true);
      setCouponForm({ code: '', discount_type: 'amount', discount_value: 0, expires_at: '', is_active: true, assigned_user: '' });
      if (!supabase) return;
      const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
      if (data) setCoupons(data);
    }
    setCouponLoading(false);
    if (!error) setTimeout(() => setCouponSuccess(false), 2000);
  };

  const handleDeleteCoupon = async (id: string) => {
    setCouponLoading(true);
    setCouponError(null);
    if (!supabase) return;
    await supabase.from('coupons').delete().eq('id', id);
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data);
    setCouponLoading(false);
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

      <div className="rounded-xl shadow p-6">
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

        {activeTab === 'coupons' && (
          <div className="space-y-6">
            <form onSubmit={handleAddCoupon} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end bg-gray-50 p-4 rounded-xl shadow">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Kupon Kodu</label>
                <input type="text" placeholder="Kupon Kodu" value={couponForm.code} onChange={e => setCouponForm(f => ({ ...f, code: e.target.value }))} className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Tip</label>
                <select value={couponForm.discount_type} onChange={e => setCouponForm(f => ({ ...f, discount_type: e.target.value as 'amount'|'percent' }))} className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-400">
                  <option value="amount">TL</option>
                  <option value="percent">%</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Değer</label>
                <input type="number" value={couponForm.discount_value} onChange={e => setCouponForm(f => ({ ...f, discount_value: parseFloat(e.target.value) }))} className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Son Kullanma</label>
                <input type="date" value={couponForm.expires_at} onChange={e => setCouponForm(f => ({ ...f, expires_at: e.target.value }))} className="border px-3 py-2 rounded w-full focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <button type="submit" className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded shadow transition disabled:opacity-60" disabled={couponLoading}>{couponLoading ? 'Kaydediliyor...' : 'Kupon Ekle'}</button>
                {couponSuccess && <div className="text-green-600 text-xs mt-1">Kupon eklendi!</div>}
                {couponError && <div className="text-red-600 text-xs mt-1">{couponError}</div>}
              </div>
            </form>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {coupons.length === 0 && (
                <div className="col-span-full text-center text-gray-400 py-8">Henüz kupon eklenmedi.</div>
              )}
              {coupons.map(c => (
                <div key={c.id} className="flex flex-col md:flex-row items-center justify-between bg-white border border-gray-200 rounded-xl shadow-sm p-4 gap-3 hover:shadow-md transition">
                  <div className="flex-1 flex flex-col md:flex-row md:items-center gap-2">
                    <span className="font-bold text-lg text-blue-700 tracking-wider">{c.code}</span>
                    <span className="ml-2 px-2 py-1 rounded bg-blue-100 text-blue-700 text-xs font-semibold">{c.discount_value}{c.discount_type==='percent'?'%':'₺'}</span>
                    {c.expires_at && <span className="ml-2 text-xs text-gray-500">Son: {new Date(c.expires_at).toLocaleDateString()}</span>}
                    {!c.is_active && <span className="ml-2 text-xs text-red-500 font-semibold">Pasif</span>}
                    {c.assigned_user && <span className="ml-2 text-xs text-gray-500">Kullanıcı: {c.assigned_user}</span>}
                  </div>
                  <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded shadow text-xs font-semibold transition" onClick={()=>handleDeleteCoupon(c.id)}>Sil</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'business' && (
          <form className="space-y-6 max-w-2xl mx-auto bg-white p-6 rounded-xl shadow" onSubmit={async e => {
            e.preventDefault();
            // Minimum ve Maksimum Rezervasyon Süresi ve Yolcu Sayıları business_rules tablosuna kaydediliyor
            if (!supabase) return;
            const upserts = [
              {
                key: 'min_reservation_notice_hours',
                value: businessForm.minReservationNotice,
                description: 'Minimum kaç saat önceden rezervasyon yapılabilir?'
              },
              {
                key: 'max_reservation_notice_days',
                value: businessForm.maxReservationAdvance,
                description: 'Maksimum kaç gün sonrasına rezervasyon yapılabilir?'
              },
              {
                key: 'max_passengers_economy',
                value: businessForm.maxPassengersEconomy,
                description: 'Ekonomi class için maksimum yolcu sayısı'
              },
              {
                key: 'max_passengers_bus',
                value: businessForm.maxPassengersBus,
                description: 'Bus class için maksimum yolcu sayısı'
              },
              {
                key: 'payment_requirement',
                value: businessForm.paymentRequirement,
                description: 'Ödeme zorunluluğu (full, partial, none)'
              },
              {
                key: 'reservation_approval',
                value: businessForm.reservationApproval,
                description: 'Rezervasyon onay yöntemi (auto, manual)'
              },
              {
                key: 'flight_code_required',
                value: businessForm.flightCodeRequired,
                description: 'Havaalanı transferinde uçuş kodu zorunlu mu? (yes, no)'
              },
              {
                key: 'airport_required_in_route',
                value: businessForm.airportRequiredInRoute,
                description: 'Nereden veya Nereye alanlarından en az biri havalimanı olmalı mı? (yes, no)'
              }
            ];
            const { error } = await supabase.from('business_rules').upsert(upserts);
            setBusinessSuccess(!error);
            setTimeout(()=>setBusinessSuccess(false), 2000);
          }}>
            <h2 className="text-xl font-bold mb-4 text-blue-700">İş Kuralları</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Minimum Rezervasyon Süresi (saat)</label>
                <input type="number" min="0" className="border px-3 py-2 rounded w-full" value={businessForm.minReservationNotice} onChange={e => setBusinessForm(f => ({ ...f, minReservationNotice: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Maksimum Rezervasyon Süresi (gün)</label>
                <input type="number" min="0" className="border px-3 py-2 rounded w-full" value={businessForm.maxReservationAdvance} onChange={e => setBusinessForm(f => ({ ...f, maxReservationAdvance: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Maksimum Yolcu Sayısı (Ekonomi)</label>
                <input type="number" min="1" max="6" className="border px-3 py-2 rounded w-full" value={businessForm.maxPassengersEconomy} onChange={e => setBusinessForm(f => ({ ...f, maxPassengersEconomy: e.target.value }))} placeholder="Ekonomi için ör: 6" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Maksimum Yolcu Sayısı (Bus)</label>
                <input type="number" min="1" max="14" className="border px-3 py-2 rounded w-full" value={businessForm.maxPassengersBus} onChange={e => setBusinessForm(f => ({ ...f, maxPassengersBus: e.target.value }))} placeholder="Bus için ör: 14" />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Ödeme Zorunluluğu</label>
                <select className="border px-3 py-2 rounded w-full" value={businessForm.paymentRequirement} onChange={e => setBusinessForm(f => ({ ...f, paymentRequirement: e.target.value }))}>
                  <option value="full">Tam Ödeme</option>
                  <option value="partial">Ön Ödeme</option>
                  <option value="none">Yok</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Rezervasyon Onay Yöntemi</label>
                <select className="border px-3 py-2 rounded w-full" value={businessForm.reservationApproval} onChange={e => setBusinessForm(f => ({ ...f, reservationApproval: e.target.value }))}>
                  <option value="auto">Otomatik</option>
                  <option value="manual">Manuel</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Havaalanı Transferinde Uçuş Kodu Zorunlu</label>
                <select className="border px-3 py-2 rounded w-full" value={businessForm.flightCodeRequired} onChange={e => setBusinessForm(f => ({ ...f, flightCodeRequired: e.target.value }))}>
                  <option value="yes">Evet</option>
                  <option value="no">Hayır</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-600">Güzergahda Havalimanı Zorunlu</label>
                <select className="border px-3 py-2 rounded w-full" value={businessForm.airportRequiredInRoute} onChange={e => setBusinessForm(f => ({ ...f, airportRequiredInRoute: e.target.value }))}>
                  <option value="yes">Evet (en az bir uç nokta havalimanı olmalı)</option>
                  <option value="no">Hayır</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-600">Ek Açıklama / Not</label>
                <textarea className="border px-3 py-2 rounded w-full" value={businessForm.extraNote} onChange={e => setBusinessForm(f => ({ ...f, extraNote: e.target.value }))} placeholder="İş kuralları ile ilgili ek açıklama veya notlar"></textarea>
              </div>
            </div>
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded">Kaydet</button>
            {businessSuccess && <div className="text-green-600 font-medium mt-2">İş kuralları başarıyla kaydedildi!</div>}
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminSettings;
