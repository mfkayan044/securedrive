import React, { useState } from 'react';
import { Users, Search, Eye, Edit, Trash2, Mail, Phone, Calendar, Award, MapPin } from 'lucide-react';
import { useAdminData } from '../../hooks/useAdminData';
import type { Database } from '../../lib/supabase';

type UserType = Database['public']['Tables']['users']['Row'];

const CustomerManagement: React.FC = () => {
  const { data: customers = [], loading, error, refetch } = useAdminData('users', {
    select: '*, reservation_count:reservations(count)',
    orderBy: { column: 'created_at', ascending: false }
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<UserType | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm)
  );

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

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Müşteri ara (isim, email, telefon)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Ad Soyad</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">E-posta</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Telefon</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">Adres</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Rezervasyon</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Puan</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Dil</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Kayıt</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">Son Giriş</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600">İşlem</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredCustomers.map((customer) => (
              <tr key={customer.id} className="hover:bg-blue-50 transition">
                <td className="px-4 py-2 whitespace-nowrap font-medium text-gray-900 flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold">{customer.name.charAt(0)}</span>
                  {customer.name}
                  {customer.is_email_verified && <span className="ml-1 w-2 h-2 bg-green-500 rounded-full" title="E-posta doğrulandı"></span>}
                  {customer.is_phone_verified && <span className="ml-1 w-2 h-2 bg-blue-500 rounded-full" title="Telefon doğrulandı"></span>}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{customer.email}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700">{customer.phone}</td>
                <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-700 max-w-[180px] truncate">{customer.address || '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center text-blue-600 font-bold">{customer.reservation_count?.[0]?.count ?? 0}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center text-green-600 font-bold">{customer.loyalty_points}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center text-xs">
                  {customer.preferred_language === 'tr' ? 'Türkçe' : 'English'}
                </td>
                <td className="px-4 py-2 whitespace-nowrap text-center text-xs text-gray-500">{formatDate(customer.created_at)}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center text-xs text-gray-500">{customer.last_login_at ? formatDate(customer.last_login_at) : '-'}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center">
                  <button
                    onClick={() => viewCustomerDetails(customer)}
                    className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-xs font-semibold flex items-center gap-1 mx-auto"
                  >
                    <Eye className="w-4 h-4" /> Detay
                  </button>
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
                  <div className="text-2xl font-bold text-blue-600">{selectedCustomer.reservation_count?.[0]?.count ?? 0}</div>
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