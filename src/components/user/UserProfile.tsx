import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, MapPin, Globe, Star, Award, Clock, CreditCard } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';

interface UserProfileProps {
  onClose: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ onClose }) => {
  const { currentUser, userReservations, updateProfile, logout, profileError } = useUser();
  const [activeTab, setActiveTab] = useState<'profile' | 'reservations' | 'loyalty'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    dateOfBirth: currentUser?.dateOfBirth || '',
    address: currentUser?.address || '',
    preferredLanguage: currentUser?.preferredLanguage || 'tr'
  });

  if (!currentUser) return null;

  const handleSaveProfile = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'confirmed':
        return 'Onaylandı';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
  {/* Header */}
  <div className="bg-gradient-to-r from-red-600 to-red-400 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{currentUser.name}</h2>
                <p className="text-red-100">{currentUser.email}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">{currentUser.loyaltyPoints} Puan</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">{currentUser.totalReservations} Transfer</span>
                  </div>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors duration-200"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'profile', label: 'Profil Bilgileri', icon: User },
              { id: 'reservations', label: 'Rezervasyonlarım', icon: Calendar },
              { id: 'loyalty', label: 'Sadakat Programı', icon: Award }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 border-b-2 transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">Profil Bilgileri</h3>
                <button
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  {isEditing ? 'Kaydet' : 'Düzenle'}
                </button>
              </div>
              {profileError && (
                <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-2 text-sm font-medium">
                  {profileError}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Ad Soyad
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    E-posta
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser.email}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Telefon
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900 font-medium">{currentUser.phone}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Globe className="w-4 h-4 inline mr-2" />
                    Dil Tercihi
                  </label>
                  {isEditing ? (
                    <select
                      value={formData.preferredLanguage}
                      onChange={(e) => setFormData(prev => ({ ...prev, preferredLanguage: e.target.value as 'tr' | 'en' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="tr">Türkçe</option>
                      <option value="en">English</option>
                    </select>
                  ) : (
                    <p className="text-gray-900 font-medium">
                      {currentUser.preferredLanguage === 'tr' ? 'Türkçe' : 'English'}
                    </p>
                  )}
                </div>
              </div>
              <div className="pt-6 border-t border-gray-200">
                <button
                  onClick={logout}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Çıkış Yap
                </button>
              </div>
            </div>
          )}

          {activeTab === 'reservations' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Rezervasyonlarım</h3>
              
              {userReservations.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Henüz rezervasyonunuz bulunmuyor.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userReservations.map((reservation) => (
                    <div key={reservation.id} className="bg-gray-50 rounded-lg p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold text-gray-900">#{reservation.reservationNumber}</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(reservation.createdAt).toLocaleDateString('tr-TR')}
                          </p>
                           {reservation.departureFlightCode && (
                             <div className="text-xs text-red-600 mt-1">
                               Gidiş Uçuş Kodu: <span className="font-semibold">{reservation.departureFlightCode}</span>
                             </div>
                           )}
                           {reservation.tripType === 'round-trip' && reservation.returnFlightCode && (
                             <div className="text-xs text-green-600 mt-1">
                               Dönüş Uçuş Kodu: <span className="font-semibold">{reservation.returnFlightCode}</span>
                             </div>
                           )}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusLabel(reservation.status)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600">Güzergah</p>
                          <p className="font-medium">{reservation.fromLocation.name} → {reservation.toLocation.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tarih & Saat</p>
                          <p className="font-medium">
                            {new Date(reservation.departureDate).toLocaleDateString('tr-TR')} - {reservation.departureTime}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Araç</p>
                          <p className="font-medium">{reservation.vehicleType.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Tutar</p>
                          <p className="font-bold text-red-600">{reservation.totalPrice} ₺</p>
                        </div>
                      </div>

                      {reservation.driverInfo && (
                        <div className="bg-white rounded-lg p-4 mb-4">
                          <h5 className="font-medium text-gray-900 mb-2">Sürücü Bilgileri</h5>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Sürücü</p>
                              <p className="font-medium">{reservation.driverInfo.name}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Telefon</p>
                              <p className="font-medium">{reservation.driverInfo.phone}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Plaka</p>
                              <p className="font-medium">{reservation.driverInfo.vehiclePlate}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {reservation.rating && (
                        <div className="bg-white rounded-lg p-4">
                          <div className="flex items-center space-x-2 mb-2">
                            <span className="text-sm text-gray-600">Değerlendirmeniz:</span>
                            <div className="flex items-center space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <= reservation.rating!
                                      ? 'text-yellow-400 fill-current'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          {reservation.review && (
                            <p className="text-sm text-gray-700 italic">"{reservation.review}"</p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'loyalty' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-gray-900">Sadakat Programı</h3>
              
              <div className="bg-gradient-to-r from-red-600 to-red-400 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-2xl font-bold">{currentUser.loyaltyPoints} Puan</h4>
                    <p className="text-red-100">Toplam puanınız</p>
                  </div>
                  <Award className="w-12 h-12 text-red-200" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Puan Kazanma</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Her transfer için</span>
                      <span className="font-medium">10 puan</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Değerlendirme yapma</span>
                      <span className="font-medium">5 puan</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Arkadaş davet etme</span>
                      <span className="font-medium">50 puan</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h5 className="font-semibold text-gray-900 mb-4">Puan Kullanma</h5>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>100 puan</span>
                      <span className="font-medium">10₺ indirim</span>
                    </div>
                    <div className="flex justify-between">
                      <span>500 puan</span>
                      <span className="font-medium">60₺ indirim</span>
                    </div>
                    <div className="flex justify-between">
                      <span>1000 puan</span>
                      <span className="font-medium">Ücretsiz transfer</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;