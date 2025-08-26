import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Shield, Mail, Lock, AlertCircle } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Önce Auth ile giriş yap
      const { data: authData, error: authError } = await (supabase!).auth.signInWithPassword({
        email,
        password,
      });
      if (authError || !authData?.user) {
        setError('Şifre hatalı veya kullanıcı bulunamadı.');
        setLoading(false);
        return;
      }
      // Auth başarılıysa admin_users tablosunda kontrol et
      const { data: adminData, error: adminError } = await (supabase!)
        .from('admin_users')
        .select('*')
        .eq('email', email)
        .single();
      console.log('admin sorgu sonucu:', adminData, adminError);
      if ((adminError && adminError.code === '406') || !adminData) {
        setError('Bu e-posta ile aktif bir admin bulunamadı veya yetkiniz yok.');
        setLoading(false);
        return;
      }
      if (adminError) {
        setError('Bir hata oluştu: ' + adminError.message);
        setLoading(false);
        return;
      }
  // Başarılı girişte admin paneline yönlendir ve sayfayı yenile
  navigate('/admin');
  window.location.reload();
    } catch (err) {
      setError('Giriş yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-cyan-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin Paneli</h1>
          <p className="text-gray-600">İstanbul Transfer Yönetim Sistemi</p>
        </div>
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Mail className="w-4 h-4 inline mr-2" />
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@istanbultransfer.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Şifre
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 mb-2">Demo Giriş Bilgileri:</p>
          <p className="text-xs text-gray-800">Email: admin@istanbultransfer.com</p>
          <p className="text-xs text-gray-800">Şifre: admin123</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;