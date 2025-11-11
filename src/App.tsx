import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Plane, Phone, Mail, MapPin, Clock, Shield, Award, Star, Settings, User, LogOut, MessageCircle } from 'lucide-react';
import ReservationForm from './components/ReservationForm';
import AdminPanel from './components/admin/AdminPanel';
import DriverPanel from './components/driver/DriverPanel';
import PaymentPage from './components/PaymentPage';
import PaymentSuccess from './components/PaymentSuccess';
import PaymentFail from './components/PaymentFail';
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
  const { currentUser, isAuthenticated, logout } = useUser();
  const { logout: adminLogout } = useAdmin();
  const [showAuthModal, setShowAuthModal] = React.useState(false);
  const [authMode, setAuthMode] = React.useState<'login' | 'register'>('login');
  const [showProfile, setShowProfile] = React.useState(false);
  const [showMessaging, setShowMessaging] = React.useState(false);

  useEffect(() => {
    // Admin olarak müşteri arayüzüne erişim engelleniyor
    if (currentUser && currentUser.email === "admin@istanbultransfer.com") {
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
        <span className="text-gray-400 text-lg animate-pulse">Yükleniyor...</span>
      </div>
    );
  }
  return (
  <div className="min-h-screen bg-white">
      {/* Header */}
  <header className="bg-white/90 backdrop-blur-md shadow-lg sticky top-0 z-50 border-b-2 border-primary/30">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex flex-col items-center p-0 m-0" style={{gap: 0}}>
              <div className="flex flex-col items-center p-0 m-0" style={{gap: 0}}>
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
              </div>
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
          <ReservationForm />
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
              : (
                <>
                  <div className="text-center group">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Clock className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">7/24 Hizmet</h4>
                    <p className="text-gray-600">Gece gündüz kesintisiz transfer hizmeti sunuyoruz</p>
                  </div>
                  <div className="text-center group">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Shield className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Güvenli Araçlar</h4>
                    <p className="text-gray-600">Düzenli bakımlı, sigortalı ve temiz araç filosu</p>
                  </div>
                  <div className="text-center group">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <Award className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Profesyonel Şoförler</h4>
                    <p className="text-gray-600">Deneyimli, güvenilir ve nazik şoför kadromuz</p>
                  </div>
                  <div className="text-center group">
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 group-hover:scale-110 transition-transform duration-200">
                      <MapPin className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">Tüm İstanbul</h4>
                    <p className="text-gray-600">İstanbul'un her noktasına transfer hizmeti</p>
                  </div>
                </>
              )}
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

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/905348517444"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-2xl hover:shadow-green-500/50 transition-all duration-300 hover:scale-110 group"
        aria-label="WhatsApp ile iletişime geç"
      >
        <svg
          className="w-8 h-8"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
        <span className="absolute -top-1 -left-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
        </span>
      </a>

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
                <Route path="/payment/success" element={<PaymentSuccess />} />
                <Route path="/payment/fail" element={<PaymentFail />} />
              </Routes>
            </Router>
          </MessagingProvider>
        </AdminProvider>
      </DriverProvider>
    </UserProvider>
  );
}

export default App;
