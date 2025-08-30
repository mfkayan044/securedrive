import React, { useState } from 'react';
import { Users, Search, Eye, Edit, Trash2, Mail, Phone, Calendar, Award, MapPin } from 'lucide-react';
import { useAdminData } from '../../hooks/useAdminData';
import type { Database } from '../../lib/supabase';

type UserType = Database['public']['Tables']['users']['Row'];

const CustomerManagement: React.FC = () => {
  const { data: customers = [], loading, error, refetch } = useAdminData('users', {
    orderBy: { column: 'created_at', ascending: false }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [showAdmins, setShowAdmins] = useState(true);
  const [showUsers, setShowUsers] = useState(true);

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch =
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm);
    const isAdmin = customer.role === 'admin' || customer.role === 'super_admin';
    const isUser = !isAdmin;
    return matchesSearch && ((showAdmins && isAdmin) || (showUsers && isUser));
  });

  const viewCustomerDetails = (customer: UserType) => {
    setSelectedCustomer(customer);
    setShowDetailModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Müşteri Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Müşteriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Müşteri Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">Müşteriler yüklenirken bir hata oluştu: {error}</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Müşteri Yönetimi</h1>
        <div className="text-sm text-gray-600">
          Toplam: {customers.length} müşteri
        </div>
      </div>

      {/* Search & Filter & Add Admin */}
      <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri/admın ara (isim, email, telefon)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={showUsers} onChange={() => setShowUsers(v => !v)} /> Kullanıcılar
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input type="checkbox" checked={showAdmins} onChange={() => setShowAdmins(v => !v)} /> Adminler
          </label>
        </div>
        <button
          onClick={() => {
            setSelectedCustomer({
              id: '', name: '', email: '', phone: '', role: 'admin',
              created_at: new Date().toISOString(), loyalty_points: 0, total_reservations: 0, preferred_language: 'tr', is_email_verified: false, is_phone_verified: false
            } as any);
            setShowDetailModal(true);
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm font-medium"
        >+ Admin Ekle</button>
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 rounded-lg">
          <thead>
            <tr className="bg-gray-100 text-gray-700 text-sm">
              <th className="py-2 px-3 border-b">Ad Soyad</th>
              <th className="py-2 px-3 border-b">E-posta</th>
              <th className="py-2 px-3 border-b">Telefon</th>
              <th className="py-2 px-3 border-b">Rol</th>
              <th className="py-2 px-3 border-b">Kayıt Tarihi</th>
              <th className="py-2 px-3 border-b">Son Giriş</th>
              <th className="py-2 px-3 border-b">Rezervasyon</th>
              <th className="py-2 px-3 border-b">Sadakat Puanı</th>
              <th className="py-2 px-3 border-b">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-3">{customer.name}</td>
                <td className="py-2 px-3">{customer.email}</td>
                <td className="py-2 px-3">{customer.phone}</td>
                <td className="py-2 px-3 capitalize">{customer.role}</td>
                <td className="py-2 px-3">{formatDate(customer.created_at)}</td>
                <td className="py-2 px-3">{customer.last_login_at ? formatDate(customer.last_login_at) : '-'}</td>
                <td className="py-2 px-3 text-center">{customer.total_reservations}</td>
                <td className="py-2 px-3 text-center">{customer.loyalty_points}</td>
                <td className="py-2 px-3">
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewCustomerDetails(customer)}
                      className="bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 flex items-center gap-1 text-xs"
                    >
                      <Eye className="w-4 h-4" /> Detay
                    </button>
                    {(customer.role === 'admin' || customer.role === 'super_admin') && (
                      <button
                        onClick={async () => {
                          if (window.confirm('Bu admini silmek istediğinize emin misiniz?')) {
                            await fetch(`/api/deleteUser?id=${customer.id}`);
                            refetch();
                          }
                        }}
                        className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 flex items-center gap-1 text-xs"
                      >
                        <Trash2 className="w-4 h-4" /> Sil
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredCustomers.length === 0 && !loading && (
        <div className="text-center py-8">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">
            {searchTerm 
              ? 'Arama kriterlerine uygun müşteri bulunamadı.' 
              : 'Henüz müşteri bulunmuyor.'}
          </p>
        </div>
      )}

      {/* Detail Modal */}
  {showDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Müşteri Detayları
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Admin ekleme formu */}
              {selectedCustomer.id === '' && (
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    // Supabase ile yeni admin ekle
                    const form = e.target as HTMLFormElement;
                    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
                    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
                    const phone = (form.elements.namedItem('phone') as HTMLInputElement).value;
                    const role = (form.elements.namedItem('role') as HTMLInputElement).value;
                    // Varsayılan şifre: 123456 (güvenlik için daha sonra değiştirilmeli)
                    await fetch(`/api/addAdmin`, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ name, email, phone, role, password: '123456' })
                    });
                    setShowDetailModal(false);
                    refetch();
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium">Ad Soyad</label>
                    <input name="name" required className="w-full border rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">E-posta</label>
                    <input name="email" type="email" required className="w-full border rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Telefon</label>
                    <input name="phone" required className="w-full border rounded px-2 py-1" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Rol</label>
                    <select name="role" className="w-full border rounded px-2 py-1">
                      <option value="admin">Admin</option>
                      <option value="super_admin">Süper Admin</option>
                    </select>
                  </div>
                  <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">Admini Kaydet</button>
                </form>
              )}
              {/* Admin Rolü Değiştir */}
              <div className="flex items-center gap-4">
                <span className="font-semibold">Rol:</span>
                <select
                  value={selectedCustomer.role || 'user'}
                  onChange={async (e) => {
                    const newRole = e.target.value;
                    // Supabase ile güncelle
                    await fetch(`/api/updateUserRole?id=${selectedCustomer.id}&role=${newRole}`);
                    refetch();
                    setSelectedCustomer({ ...selectedCustomer, role: newRole });
                  }}
                  className="border rounded px-2 py-1"
                >
                  <option value="user">Kullanıcı</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Süper Admin</option>
                </select>
              </div>
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Kişisel Bilgiler
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Ad Soyad</label>
                    <p className="font-medium">{selectedCustomer.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">E-posta</label>
                    <p className="font-medium">{selectedCustomer.email}</p>
                    {selectedCustomer.is_email_verified && (
                      <span className="text-xs text-green-600">✓ Doğrulandı</span>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Telefon</label>
                    <p className="font-medium">{selectedCustomer.phone}</p>
                    {selectedCustomer.is_phone_verified && (
                      <span className="text-xs text-green-600">✓ Doğrulandı</span>
                    )}
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Dil Tercihi</label>
                    <p className="font-medium">
                      {selectedCustomer.preferred_language === 'tr' ? 'Türkçe' : 'English'}
                    </p>
                  </div>
                  {selectedCustomer.date_of_birth && (
                    <div>
                      <label className="text-sm text-gray-600">Doğum Tarihi</label>
                      <p className="font-medium">{formatDate(selectedCustomer.date_of_birth)}</p>
                    </div>
                  )}
                  {selectedCustomer.address && (
                    <div className="md:col-span-2">
                      <label className="text-sm text-gray-600">Adres</label>
                      <p className="font-medium">{selectedCustomer.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedCustomer.total_reservations}</div>
                  <div className="text-sm text-gray-600">Toplam Rezervasyon</div>
                </div>
                <div className="bg-green-50 rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedCustomer.loyalty_points}</div>
                  <div className="text-sm text-gray-600">Sadakat Puanı</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-4 text-center">
                  <div className="text-sm font-bold text-purple-600">
                    {selectedCustomer.preferred_language === 'tr' ? 'TR' : 'EN'}
                  </div>
                  <div className="text-sm text-gray-600">Dil</div>
                </div>
              </div>

              {/* Account Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Hesap Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Kayıt Tarihi</label>
                    <p className="font-medium">{formatDate(selectedCustomer.created_at)}</p>
                  </div>
                  {selectedCustomer.last_login_at && (
                    <div>
                      <label className="text-sm text-gray-600">Son Giriş</label>
                      <p className="font-medium">{formatDate(selectedCustomer.last_login_at)}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-600">E-posta Durumu</label>
                    <p className={`font-medium ${selectedCustomer.is_email_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedCustomer.is_email_verified ? 'Doğrulandı' : 'Doğrulanmadı'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Telefon Durumu</label>
                    <p className={`font-medium ${selectedCustomer.is_phone_verified ? 'text-green-600' : 'text-red-600'}`}>
                      {selectedCustomer.is_phone_verified ? 'Doğrulandı' : 'Doğrulanmadı'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerManagement;