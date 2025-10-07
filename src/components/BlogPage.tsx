

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plane, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useAdmin } from '../contexts/AdminContext';

interface BlogItem {
  id: string;
  title: string;
  content: string;
}


const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase!
        .from('site_content')
        .select('id, title, content')
        .eq('type', 'blog')
        .order('order', { ascending: true });
      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  // Header/Footer için HomePage'deki ayarları örnekle
  const { isAuthenticated, logout } = useUser();
  const { logout: adminLogout } = useAdmin();
  // Dummy settings, gerçek projede context veya prop ile alınmalı
  const settings = {
    site_name: 'Secure Drive',
    site_description: 'Havalimanı Transfer Hizmeti',
    logo_url: '/logo/logo.png',
    contact_phone: '+90 (212) 535 3434',
    contact_email: 'operasyon@securedrive.org',
    footer_text: "İstanbul'da güvenilir havalimanı transfer hizmeti. Konforlu, güvenli ve uygun fiyatlı transfer çözümleri sunuyoruz.",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex flex-col">
      {/* Header (Banner) */}
      <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b-2 border-primary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex flex-col items-center p-0 m-0" style={{gap: 0}}>
              {settings.logo_url ? (
                <img src={settings.logo_url} alt="Site Logosu" className="h-10 w-40 object-contain rounded-xl bg-transparent p-0 m-0" style={{background: 'none', padding: 0, margin: 0}} />
              ) : (
                <div className="bg-primary p-2 rounded-xl">
                  <Plane className="w-8 h-8 text-white" />
                </div>
              )}
              <h1 className="text-2xl font-bold text-primary p-0 m-0" style={{margin: 0, padding: 0}}>
                {settings.site_name || ''}
              </h1>
              <p className="text-sm text-secondary p-0 m-0" style={{margin: 0, padding: 0}}>{settings.site_description || ''}</p>
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="text-sm font-medium">{settings.contact_phone || '+90 (212) 535 3434'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <span className="text-sm font-medium">{settings.contact_email || 'operasyon@securedrive.org'}</span>
              </div>
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <button onClick={() => { logout(); adminLogout(); }} className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200">
                    <span className="text-sm font-medium">Çıkış</span>
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Blog İçerik */}
      <main className="flex-1 py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Plane className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-extrabold text-primary tracking-tight">Blog</h1>
          </div>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <div className="text-center text-gray-400 py-16">Henüz blog içeriği yok.</div>
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
              {posts.map((post) => (
                <div key={post.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-primary/10 p-8 flex flex-col justify-between group cursor-pointer hover:-translate-y-1">
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-2 group-hover:text-red-600 transition-colors duration-200">{post.title}</h2>
                    <p className="text-gray-700 mb-4">{post.content}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-xs text-gray-400">Daha fazla bilgi için bizimle iletişime geçin.</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-secondary text-white py-12 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary p-2 rounded-xl">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{settings.site_name || 'Secure Drive'}</h3>
                  <p className="text-white text-sm">{settings.site_description || 'Premium Havalimanı Transfer Hizmeti'}</p>
                </div>
              </div>
              <p className="text-white mb-4">
                {settings.footer_text || "İstanbul'da güvenilir havalimanı transfer hizmeti. Konforlu, güvenli ve uygun fiyatlı transfer çözümleri sunuyoruz."}
              </p>
              <div className="mt-6">
                <ul className="flex flex-wrap gap-6 text-sm text-white">
                  <li>
                    <Link to="/blog" className="hover:underline">Blog</Link>
                  </li>
                  <li>
                    <Link to="/faq" className="hover:underline">Sıkça Sorulan Sorular</Link>
                  </li>
                </ul>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Hizmetler</h4>
              <ul className="space-y-2 text-sm text-white">
                <li>Havalimanı Transferi</li>
                <li>Şehir İçi Transfer</li>
                <li>VIP Transfer</li>
                <li>Grup Transferi</li>
                <li>Engelli Dostu Araçlar</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">İletişim</h4>
              <ul className="space-y-2 text-sm text-white">
                <li>{settings.contact_phone || '+90 (212) 535 3434'}</li>
                <li>{settings.contact_email || 'operasyon@securedrive.org'}</li>
                <li>7/24 Müşteri Hizmetleri</li>
                <li>İstanbul, Türkiye</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-white">
            <p>{settings.footer_text || '© 2025 Secure Drive. Tüm hakları saklıdır.'}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default BlogPage;
