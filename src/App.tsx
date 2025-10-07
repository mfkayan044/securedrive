import React, { useEffect, useState } from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Plane, Phone, Mail, MapPin, Clock, Shield, Award, Star, Settings, User, LogOut, MessageCircle } from 'lucide-react';
import ReservationForm from './components/ReservationForm';
import AdminPanel from './components/admin/AdminPanel';
import DriverPanel from './components/driver/DriverPanel';
import PaymentPage from './components/PaymentPage';
import { AdminProvider, useAdmin } from './contexts/AdminContext';
import { DriverProvider } from './contexts/DriverContext';
import { UserProvider, useUser } from './contexts/UserContext';
import { MessagingProvider } from './contexts/MessagingContext';
import UserAuthModal from './components/user/UserAuthModal';
import UserProfile from './components/user/UserProfile';
import MessagingPanel from './components/messaging/MessagingPanel';
import DatabaseStatus from './components/DatabaseStatus';
import { supabase } from './lib/supabase';

const HomePage: React.FC = () => {
  // ReservationWizard tamamlandığında çağrılacak fonksiyon
  const handleReservationExtracted = (data: any) => {
    setAiFormData(data);
  };
  // AI ile doldurulacak form state'i
  const [aiFormData, setAiFormData] = useState<any | null>(null);
  const { currentUser, isAuthenticated, logout } = useUser();
  const { logout: adminLogout } = useAdmin();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const [showProfile, setShowProfile] = React.useState(false);
  const [showMessaging, setShowMessaging] = React.useState(false);

  useEffect(() => {
    // Admin olarak müşteri arayüzüne erişim engelleniyor
    if (currentUser && currentUser.email === "operasyon@securedrive.org") {
      logout();
      window.location.href = "/admin";
    }
  }, [currentUser, logout]);

  useEffect(() => {
    const handleOpenRegister = () => {
      setAuthMode('register');
      setShowAuthModal(true);
    };
    const handleOpenProfile = () => setShowProfile(true);
    window.addEventListener('openRegisterModal', handleOpenRegister);
    window.addEventListener('openProfileModal', handleOpenProfile);
    return () => {
      window.removeEventListener('openRegisterModal', handleOpenRegister);
      window.removeEventListener('openProfileModal', handleOpenProfile);
    };
  }, []);

  // Dinamik ayarlar
  const [settings, setSettings] = useState<{ [key: string]: string } | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await supabase.from('settings').select('key,value').eq('is_public', true);
      if (data) {
        const dict: { [key: string]: string } = {};
        data.forEach((row: any) => { dict[row.key] = row.value; });
        setSettings(dict);
      } else {
        setSettings({});
      }
    };
    fetchSettings();
  }, []);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <span className="text-gray-400 text-lg animate-pulse">Ayrıcalıklı ulaşım herkesin hakkı!...</span>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{settings.site_name || 'İstanbul Transfer'} | {settings.site_description || 'Havalimanı Transfer Hizmeti'}</title>
        <meta name="description" content={settings.homepage_hero_desc || 'Havalimanından şehre, şehirden havalimanına 7/24 profesyonel transfer hizmeti. Konforlu araçlar, deneyimli şoförler, uygun fiyatlar.'} />
        <meta property="og:title" content={settings.site_name || 'İstanbul Transfer'} />
        <meta property="og:description" content={settings.homepage_hero_desc || 'Havalimanından şehre, şehirden havalimanına 7/24 profesyonel transfer hizmeti. Konforlu araçlar, deneyimli şoförler, uygun fiyatlar.'} />
        <meta property="og:image" content={settings.logo_url || '/logo/logo.png'} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={settings.site_name || 'İstanbul Transfer'} />
        <meta name="twitter:description" content={settings.homepage_hero_desc || 'Havalimanından şehre, şehirden havalimanına 7/24 profesyonel transfer hizmeti. Konforlu araçlar, deneyimli şoförler, uygun fiyatlar.'} />
        <meta name="twitter:image" content={settings.logo_url || '/logo/logo.png'} />
        {/* Organization JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': settings.site_name || 'İstanbul Transfer',
            'url': typeof window !== 'undefined' ? window.location.origin : '',
            'logo': settings.logo_url || '/logo/logo.png',
            'contactPoint': [
              {
                '@type': 'ContactPoint',
                'telephone': settings.contact_phone || '+90 (212) 555 0123',
                'contactType': 'customer service',
                'email': settings.contact_email || 'info@istanbultransfer.com',
                'areaServed': 'TR',
                'availableLanguage': ['Turkish','English']
              }
            ],
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'İstanbul',
              'addressCountry': 'TR'
            }
          })}
        </script>
        {/* LocalBusiness JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            'name': settings.site_name || 'İstanbul Transfer',
            'image': settings.logo_url || '/logo/logo.png',
            'telephone': settings.contact_phone || '+90 (212) 555 0123',
            'email': settings.contact_email || 'info@istanbultransfer.com',
            'address': {
              '@type': 'PostalAddress',
              'addressLocality': 'İstanbul',
              'addressCountry': 'TR'
            },
            'url': typeof window !== 'undefined' ? window.location.origin : '',
            'openingHours': [
              'Mo-Su 00:00-23:59'
            ],
            'priceRange': '₺₺',
            'servesCuisine': 'Transfer, Ulaşım, VIP Araç',
            'areaServed': 'İstanbul'
          })}
        </script>
        {/* WebSite JSON-LD */}
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': settings.site_name || 'İstanbul Transfer',
            'url': typeof window !== 'undefined' ? window.location.origin : '',
            'potentialAction': {
              '@type': 'SearchAction',
              'target': (typeof window !== 'undefined' ? window.location.origin : '') + '/?s={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          })}
        </script>
      </Helmet>
      {/* Header */}
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
                <Phone className="w-4 h-4" />
                <span className="text-sm font-medium">{settings.contact_phone || '+90 (212) 555 0123'}</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="text-sm font-medium">{settings.contact_email || 'info@istanbultransfer.com'}</span>
              </div>
              {/* User Authentication */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setShowMessaging(true)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="text-sm font-medium">Mesajlar</span>
                  </button>
                  <button
                    onClick={() => setShowProfile(true)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                  >
                    <User className="w-4 h-4" />
                    <span className="text-sm font-medium">{currentUser?.name}</span>
                  </button>
                  <button
                    onClick={() => { logout(); adminLogout(); }}
                    className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors duration-200"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Çıkış</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors duration-200"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => handleAuthClick('register')}
                    className="bg-gradient-to-r from-red-600 to-red-400 text-white px-4 py-2 rounded-lg hover:from-red-700 hover:to-red-500 transition-all duration-200 text-sm font-medium"
                  >
                    Kayıt Ol
                  </button>
                </div>
              )}
              {/* Admin and Driver links removed from homepage UI */}
            </div>
            
            {/* Mobile Menu */}
            <div className="md:hidden">
              {isAuthenticated ? (
                <button
                  onClick={() => setShowProfile(true)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={() => handleAuthClick('login')}
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition-all duration-200 text-sm font-medium"
                >
                  Giriş
                </button>
              )}
            </div>
          </div>
        </div>
  </header>

    {/* Hero Section with Reservation Form */}
    <section className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Database Status */}
          <div className="mb-8">
            {/* <DatabaseStatus /> */}
          </div>
          
          <div className="text-center mb-12">
            <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-4">
              {settings.homepage_hero_title ? (
                settings.homepage_hero_title.split('\n').map((line, i) => (
                  <span key={i}>{line}</span>
                ))
              ) : (
                <>
                  İstanbul'da
                  <span className="block text-primary">Güvenli Transfer</span>
                </>
              )}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              {settings.homepage_hero_desc || 'Havalimanından şehre, şehirden havalimanına 7/24 profesyonel transfer hizmeti. Konforlu araçlar, deneyimli şoförler, uygun fiyatlar.'}
            </p>
          </div>

          {/* Reservation Form */}
          <ReservationForm {...(aiFormData ? {
            forceEmptyCustomer: false,
            noPaymentMode: false,
            onSuccess: () => setAiFormData(null),
            ...aiFormData
          } : {})} />
        </div>
  </section>

    {/* Features Section */}
    <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">{settings.why_us_title || 'Neden Bizi Seçmelisiniz?'}</h3>
            <p className="text-lg text-secondary">{settings.why_us_desc || 'İstanbul\'da transfer hizmetinde öncü olmamızın sebepleri'}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {settings.why_us_items
                ? settings.why_us_items.split('\n').map((item, i) => (
                    <div key={i} className="text-center group">
                      <div className="bg-primary w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                        {/* Sembol ikonları örnek, istersen ikonları da ayarlayabilirsin */}
                        {[<Clock />, <Shield />, <Award />, <MapPin />][i % 4]}
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">{item}</h4>
                    </div>
                  ))
                : [
                    <div className="text-center group" key="why1">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                        <Clock className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">7/24 Hizmet</h4>
                      <p className="text-gray-600">Gece gündüz kesintisiz transfer hizmeti sunuyoruz</p>
                    </div>,
                    <div className="text-center group" key="why2">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                        <Shield className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Güvenli Araçlar</h4>
                      <p className="text-gray-600">Düzenli bakımlı, sigortalı ve temiz araç filosu</p>
                    </div>,
                    <div className="text-center group" key="why3">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                        <Award className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Profesyonel Şoförler</h4>
                      <p className="text-gray-600">Deneyimli, güvenilir ve nazik şoför kadromuz</p>
                    </div>,
                    <div className="text-center group" key="why4">
                      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                        <MapPin className="w-8 h-8" />
                      </div>
                      <h4 className="text-xl font-semibold text-gray-900 mb-2">Tüm İstanbul</h4>
                      <p className="text-gray-600">İstanbul'un her noktasına transfer hizmeti</p>
                    </div>
                  ]
              }
          </div>
        </div>
  </section>

    {/* Service Areas */}
    <section className="py-16 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-primary mb-4">{settings.regions_title || 'Hizmet Verdiğimiz Bölgeler'}</h3>
            <p className="text-lg text-secondary">{settings.regions_list ? settings.regions_list.split('\n')[0] : "İstanbul'un her köşesine güvenli transfer"}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {settings.regions_list
              ? (() => {
                  const lines = settings.regions_list.split('\n').map(l => l.trim()).filter(Boolean);
                  if (lines.length === 3) {
                    return lines.map((line, i) => (
                      <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                        <div className="flex items-center space-x-3 mb-4">
                          {[<Plane className='w-6 h-6 text-blue-600' />, <MapPin className='w-6 h-6 text-green-600' />, <Star className='w-6 h-6 text-yellow-600' />][i % 3]}
                          <h4 className="text-lg font-semibold text-gray-900">{line}</h4>
                        </div>
                      </div>
                    ));
                  }
                  // Eski mantık: başlık:altbaşlık1;altbaşlık2
                  return lines.slice(1).map((item, i) => (
                    <div key={i} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                      <div className="flex items-center space-x-3 mb-4">
                        {[<Plane className='w-6 h-6 text-blue-600' />, <MapPin className='w-6 h-6 text-green-600' />, <Star className='w-6 h-6 text-yellow-600' />][i % 3]}
                        <h4 className="text-lg font-semibold text-gray-900">{item.split(':')[0]}</h4>
                      </div>
                      <ul className="space-y-2 text-gray-600">
                        {item.split(':')[1]?.split(';').map((sub, j) => <li key={j}>• {sub.trim()}</li>)}
                      </ul>
                    </div>
                  ));
                })()
              : (
                <>
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Plane className="w-6 h-6 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Havalimanları</h4>
                    </div>
                    <ul className="space-y-2 text-gray-600">
                      <li>• İstanbul Havalimanı (IST)</li>
                      <li>• Sabiha Gökçen Havalimanı (SAW)</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <MapPin className="w-6 h-6 text-green-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Popüler İlçeler</h4>
                    </div>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Taksim & Beyoğlu</li>
                      <li>• Sultanahmet & Fatih</li>
                      <li>• Beşiktaş & Şişli</li>
                      <li>• Kadıköy & Üsküdar</li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200">
                    <div className="flex items-center space-x-3 mb-4">
                      <Star className="w-6 h-6 text-yellow-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Özel Lokasyonlar</h4>
                    </div>
                    <ul className="space-y-2 text-gray-600">
                      <li>• Lüks Oteller</li>
                      <li>• Tarihi Mekanlar</li>
                      <li>• İş Merkezleri</li>
                      <li>• Özel Adresler</li>
                    </ul>
                  </div>
                </>
              )}
          </div>
        </div>
  </section>

    {/* Contact Section */}
    <section className="py-16 bg-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">7/24 İletişim</h3>
            <p className="text-xl text-blue-100">Size en iyi hizmeti verebilmek için buradayız</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-4">
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Telefon</h4>
                {settings.contact_block
                  ? (() => {
                      const lines = settings.contact_block.split('\n').map(l => l.trim()).filter(Boolean);
                      if (lines.length === 3) {
                        return <p className="text-blue-100">{lines[0]}</p>;
                      }
                      return lines.filter(line => line.toLowerCase().includes('tel') || line.match(/\+?\d+/)).map((line, i) => (
                        <p className="text-blue-100" key={i}>{line}</p>
                      ));
                    })()
                  : <>
                      <p className="text-blue-100">{settings.contact_phone || '+90 (212) 555 0123'}</p>
                      <p className="text-blue-100">+90 (216) 555 0124</p>
                    </>
                }
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Mail className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">E-posta</h4>
                {settings.contact_block
                  ? (() => {
                      const lines = settings.contact_block.split('\n').map(l => l.trim()).filter(Boolean);
                      if (lines.length === 3) {
                        return <p className="text-blue-100">{lines[1]}</p>;
                      }
                      return lines.filter(line => line.includes('@')).map((line, i) => (
                        <p className="text-blue-100" key={i}>{line}</p>
                      ));
                    })()
                  : <>
                      <p className="text-blue-100">{settings.contact_email || 'info@istanbultransfer.com'}</p>
                      <p className="text-blue-100">rezervasyon@istanbultransfer.com</p>
                    </>
                }
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-semibold mb-2">Çalışma Saatleri</h4>
                {settings.contact_block
                  ? (() => {
                      const lines = settings.contact_block.split('\n').map(l => l.trim()).filter(Boolean);
                      if (lines.length === 3) {
                        return <p className="text-blue-100">{lines[2]}</p>;
                      }
                      return lines.filter(line => line.toLowerCase().includes('saat') || line.toLowerCase().includes('hizmet')).map((line, i) => (
                        <p className="text-blue-100" key={i}>{line}</p>
                      ));
                    })()
                  : <>
                      <p className="text-blue-100">7 Gün 24 Saat</p>
                      <p className="text-blue-100">Kesintisiz Hizmet</p>
                    </>
                }
              </div>
            </div>
          </div>
        </div>
  </section>

    {/* Footer */}
    <footer className="bg-secondary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="bg-primary p-2 rounded-xl">
                  <Plane className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{settings.site_name || 'İstanbul Transfer'}</h3>
                  <p className="text-white text-sm">{settings.site_description || 'Premium Havalimanı Transfer Hizmeti'}</p>
                </div>
              </div>
              <p className="text-white mb-4">
                {settings.footer_text || "İstanbul'da güvenilir havalimanı transfer hizmeti. Konforlu, güvenli ve uygun fiyatlı transfer çözümleri sunuyoruz."}
              </p>
              {settings.review_block ? (
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white">{settings.review_block}</span>
                  </div>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <div className="flex items-center space-x-2">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-white">(4.9/5 - 2,847 değerlendirme)</span>
                  </div>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">Hizmetler</h4>
              <ul className="space-y-2 text-sm text-white">
                {settings.services_list
                  ? settings.services_list.split('\n').map((item, i) => <li key={i}>{item}</li>)
                  : <>
                      <li>Havalimanı Transferi</li>
                      <li>Şehir İçi Transfer</li>
                      <li>VIP Transfer</li>
                      <li>Grup Transferi</li>
                      <li>Engelli Dostu Araçlar</li>
                    </>
                }
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-white">İletişim</h4>
              <ul className="space-y-2 text-sm text-white">
                {settings.contact_block
                  ? settings.contact_block.split('\n').map((item, i) => <li key={i}>{item}</li>)
                  : <>
                      <li>{settings.contact_phone || '+90 (212) 555 0123'}</li>
                      <li>{settings.contact_email || 'info@istanbultransfer.com'}</li>
                      <li>7/24 Müşteri Hizmetleri</li>
                      <li>İstanbul, Türkiye</li>
                    </>
                }
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-white">
            <p>{settings.footer_text || '© 2025 İstanbul Transfer. Tüm hakları saklıdır.'}</p>
          </div>
        </div>
  </footer>
      
      {/* Modals */}
      <UserAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />

      {showProfile && (
        <UserProfile onClose={() => setShowProfile(false)} />
      )}

      {/* Messaging Panel */}
      {showMessaging && isAuthenticated && currentUser && (
        <MessagingPanel
          userType="user"
          currentUserId={currentUser.id}
          isOpen={showMessaging}
          onClose={() => setShowMessaging(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <HelmetProvider>
      <UserProvider>
        <DriverProvider>
          <AdminProvider>
            <MessagingProvider>
              <Router>
                <Routes>
                  <Route path="/admin/*" element={<AdminPanel />} />
                  <Route path="/driver" element={<DriverPanel />} />
                  <Route path="/" element={<HomePage />} />
                  <Route path="/payment/:reservationId" element={<PaymentPage />} />
                </Routes>
              </Router>
            </MessagingProvider>
          </AdminProvider>
        </DriverProvider>
      </UserProvider>
    </HelmetProvider>
  );
}

export default App;
