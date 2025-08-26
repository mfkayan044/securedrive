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

      {/* Customers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => (
          <div key={customer.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {customer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{customer.name}</h3>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm text-gray-600">{customer.loyalty_points} puan</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {customer.is_email_verified && (
                  <div className="w-2 h-2 bg-green-500 rounded-full" title="E-posta doğrulandı"></div>
                )}
                {customer.is_phone_verified && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full" title="Telefon doğrulandı"></div>
                )}
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <span className="truncate">{customer.email}</span>
              </div>
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{customer.phone}</span>
              </div>
              {customer.address && (
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="truncate">{customer.address}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-lg font-bold text-blue-600">{customer.total_reservations}</p>
                  <p className="text-xs text-gray-600">Rezervasyon</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-green-600">{customer.loyalty_points}</p>
                  <p className="text-xs text-gray-600">Sadakat Puanı</p>
                </div>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>Üye: {formatDate(customer.created_at)}</span>
              </div>
              <div className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {customer.preferred_language === 'tr' ? 'Türkçe' : 'English'}
              </div>
            </div>

            {/* Last Login */}
            {customer.last_login_at && (
              <div className="text-xs text-gray-500 mb-4">
                Son giriş: {formatDate(customer.last_login_at)}
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => viewCustomerDetails(customer)}
                className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Detay</span>
              </button>
            </div>
          </div>
        ))}
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