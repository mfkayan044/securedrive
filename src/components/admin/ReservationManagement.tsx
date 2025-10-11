import React, { useState, useEffect } from 'react';
  import { Calendar, Clock, User, MapPin, Car, Phone, Mail, Eye, Edit, Check, X, Search, Users } from 'lucide-react';
  import { supabase, isSupabaseConfigured } from '../../lib/supabase';

const ReservationManagement: React.FC = () => {
  // Düzenleme modalı için state'ler
  const [showEditModal, setShowEditModal] = useState(false);
  const [editReservation, setEditReservation] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);
  const [voucherSendingId, setVoucherSendingId] = useState<string | null>(null);

    // Voucher Gönder API çağrısı
const sendVoucherEmail = async (reservation: any) => {
  if (!reservation.customer_email) {
    alert('Müşteri e-posta adresi bulunamadı!');
    return;
  }

  // voucherCode fallback: reservation.voucher_code || reservation.voucherCode || reservation.id?.slice(0,8) || 'VOUCHER'
  const voucherCode = reservation.voucher_code || reservation.voucherCode || (reservation.id ? reservation.id.slice(0,8) : 'VOUCHER');

  setVoucherSendingId(reservation.id);

  try {
    const response = await fetch('/api/sendVoucherEmail', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: reservation.customer_email,
        name: reservation.customer_name,
        voucherCode,
        reservationDetails: JSON.stringify(reservation, null, 2),
        locations,
        vehicleTypes
      }),
    });

    // Buraya ekle
    const data = await response.text(); // önce text al
    try {
      const json = JSON.parse(data); // sonra JSON'a çevir
      if (!response.ok) throw new Error(json.detail || 'Bilinmeyen hata');
      alert('Voucher başarıyla gönderildi!');
    } catch (err) {
      console.error('API JSON parse hatası:', err, data);
      alert('Voucher e-posta gönderilirken hata oluştu.');
    }

  } catch (error) {
    console.error('Fetch hatası:', error);
    alert('Voucher e-posta gönderilirken hata oluştu.');
  } finally {
    setVoucherSendingId(null);
  }
};

// Voucher PDF indirme fonksiyonu
const downloadVoucherPdf = async (reservation: any) => {
  try {
    const response = await fetch('/api/getVoucherPdf', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        reservationDetails: reservation,
        locations,
        vehicleTypes
      })
    });
    if (!response.ok) throw new Error('PDF alınamadı');
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `voucher_${reservation.reservation_number || reservation.id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    alert('PDF indirilemedi: ' + (err as any)?.message);
  }
}

  // Bildirim için state
  const [notification, setNotification] = useState<string | null>(null);
  useEffect(() => {
    if (notification) {
      const timeout = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timeout);
    }
  }, [notification]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);


  useEffect(() => {
    fetchData();
  }, []);

  // Silme modalı için state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reservationToDelete, setReservationToDelete] = useState<string | null>(null);

  // Rezervasyon silme fonksiyonu (modal onaylı)
  const handleDeleteClick = (reservationId: string) => {
    setReservationToDelete(reservationId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteReservation = async () => {
    if (!reservationToDelete) return;
    if (!isSupabaseConfigured()) return;
    const { error } = await supabase.from('reservations').delete().eq('id', reservationToDelete);
    if (!error) {
      setReservations(prev => prev.filter(r => r.id !== reservationToDelete));
      setNotification('Rezervasyon başarıyla silindi.');
    } else {
      setNotification('Rezervasyon silinirken hata oluştu.');
    }
    setDeleteModalOpen(false);
    setReservationToDelete(null);
  };

  const cancelDeleteReservation = () => {
    setDeleteModalOpen(false);
    setReservationToDelete(null);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!isSupabaseConfigured()) {
        console.log('Supabase not configured');
        setReservations([]);
        setLocations([]);
        setVehicleTypes([]);
        setDrivers([]);
        setLoading(false);
        return;
      }

      // Fetch all data
      const [reservationsRes, locationsRes, vehicleTypesRes, driversRes] = await Promise.allSettled([
    supabase.from('reservations').select('*, reservation_number, voucher_code').order('created_at', { ascending: false }),
        supabase.from('locations').select('*'),
        supabase.from('vehicle_types').select('*'),
        supabase.from('drivers').select('*')
      ]);

      // Handle results safely
      if (reservationsRes.status === 'fulfilled' && !reservationsRes.value.error) {
        setReservations(reservationsRes.value.data || []);
      } else {
        console.log('Reservations fetch failed');
        setReservations([]);
      }

      if (locationsRes.status === 'fulfilled' && !locationsRes.value.error) {
        setLocations(locationsRes.value.data || []);
      } else {
        console.log('Locations fetch failed');
        setLocations([]);
      }

      if (vehicleTypesRes.status === 'fulfilled' && !vehicleTypesRes.value.error) {
        setVehicleTypes(vehicleTypesRes.value.data || []);
      } else {
        console.log('Vehicle types fetch failed');
        setVehicleTypes([]);
      }

      if (driversRes.status === 'fulfilled' && !driversRes.value.error) {
        setDrivers(driversRes.value.data || []);
      } else {
        console.log('Drivers fetch failed');
        setDrivers([]);
      }

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Veri yüklenirken hata oluştu');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Lokasyon ismini id'ye göre bul
  const getLocationName = (id: string) => {
    if (!id) return '';
    return locations.find(loc => loc.id === id)?.name || '';
  } 

  const getVehicleName = (id: string) => {
    if (!id) return '';
    return vehicleTypes.find(v => v.id === id)?.name || '';
  };

  const getDriverName = (id: string) => {
    return drivers.find(d => d.id === id)?.name || 'Atanmadı';
  };

  const updateReservationStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ 
          status: status as any,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;
      // Anlık bildirim
      if (status === 'confirmed') {
        setNotification('Sürücü rezervasyonu onayladı.');
      } else if (status === 'cancelled') {
        setNotification('Sürücü rezervasyonu iptal etti.');
      }
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating reservation status:', error);
      alert('Rezervasyon durumu güncellenirken bir hata oluştu.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'assigned':
        return 'bg-blue-100 text-blue-800';
      case 'on-route':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
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
      case 'assigned':
        return 'Atandı';
      case 'on-route':
        return 'Yolda';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'paid':
        return 'Ödendi';
      case 'refunded':
        return 'İade Edildi';
      case 'failed':
        return 'Başarısız';
      default:
        return status;
    }
  };

  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.customer_phone.includes(searchTerm) ||
      reservation.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const viewReservationDetails = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
    setEditReservation(reservation); // Düzenleme için de seçili rezervasyonu ata
  };

  return (
    <div>
      {/* Bildirim Toast */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 bg-blue-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-in">
          {notification}
        </div>
      )}
      {loading ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
          </div>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Rezervasyonlar yükleniyor...</p>
          </div>
        </div>
      ) : error ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
          </div>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">
              <Calendar className="w-12 h-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yükleme Hatası</h3>
            <p className="text-gray-600 mb-4">Rezervasyonlar yüklenirken bir hata oluştu: {error}</p>
            <button
              onClick={fetchData}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              Tekrar Dene
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Rezervasyon Yönetimi</h1>
            <div>
              Toplam: {reservations.length} rezervasyon
            </div>
          </div>
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rezervasyon ara (isim, email, telefon, ID)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="pending">Bekliyor</option>
                <option value="confirmed">Onaylandı</option>
                <option value="completed">Tamamlandı</option>
                <option value="cancelled">İptal Edildi</option>
              </select>
            </div>
          </div>

          {/* Reservations Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rezervasyon</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Müşteri</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Güzergah</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tarih & Saat</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tutar</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredReservations.map((reservation) => (
                    <tr key={reservation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-red-600">
                            #{reservation.reservation_number ? reservation.reservation_number : reservation.id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-gray-500">
                            {reservation.trip_type === 'round-trip' ? 'Gidiş-Dönüş' : 'Tek Yön'}
                          </div>
                          {reservation.departure_flight_code && (
                            <div className="text-xs text-blue-600 mt-1">
                              Gidiş Uçuş Kodu: <span className="font-semibold">{reservation.departure_flight_code}</span>
                            </div>
                          )}
                          {reservation.trip_type === 'round-trip' && reservation.return_flight_code && (
                            <div className="text-xs text-green-600 mt-1">
                              Dönüş Uçuş Kodu: <span className="font-semibold">{reservation.return_flight_code}</span>
                            </div>
                          )}
                          <button
                            onClick={() => handleDeleteClick(reservation.id)}
                            className="text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded text-xs font-semibold transition-colors"
                            title="Rezervasyonu Sil"
                          >
                            Rezervasyonu Sil
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {reservation.customer_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {reservation.customer_phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {reservation.customer_email}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <span>{getLocationName(reservation.from_location_id)} a {getLocationName(reservation.to_location_id)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            <span>{new Date(reservation.departure_date).toLocaleDateString('tr-TR')}</span>
                          </div>
                          <div className="flex items-center space-x-1 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span>{reservation.departure_time}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {reservation.total_price} ₺
                        </div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${getPaymentStatusColor(reservation.payment_status)}`}>
                          {getPaymentStatusLabel(reservation.payment_status)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                          {getStatusLabel(reservation.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => viewReservationDetails(reservation)}
                            className="text-blue-600 hover:text-blue-900 p-1"
                            title="Detayları Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {/* Ödeme Linki Gönder butonu */}
                          {reservation.payment_status === 'pending' && (
                            <a
                              href={`/payment/${reservation.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-white bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded text-xs font-semibold transition-colors"
                              title="Ödeme Linki Gönder"
                            >
                              Ödeme Linki
                            </a>
                          )}
                          {reservation.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'confirmed')}
                                className="text-green-600 hover:text-green-900 p-1"
                                title="Onayla"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => updateReservationStatus(reservation.id, 'cancelled')}
                                className="text-red-600 hover:text-red-900 p-1"
                                title="İptal Et"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {/* Voucher Gönder butonu: her rezervasyon için */}
                          <button
                            onClick={() => sendVoucherEmail(reservation)}
                            className={`text-white bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center space-x-1 ${voucherSendingId === reservation.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title="Voucher Gönder"
                            disabled={voucherSendingId === reservation.id}
                          >
                            {voucherSendingId === reservation.id ? (
                              <span>Gönderiliyor...</span>
                            ) : (
                              <>
                                <Mail className="w-4 h-4 mr-1" />
                                
                              </>
                            )}
                          </button>

                          {/* Voucher PDF İndir butonu */}
                          <button
                            onClick={() => downloadVoucherPdf(reservation)}
                            className="text-white bg-gray-700 hover:bg-gray-900 px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center space-x-1"
                            title=""
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                            
                          </button>
                          {reservation.status === 'confirmed' && (
                            <button
                              onClick={() => updateReservationStatus(reservation.id, 'completed')}
                              className="text-blue-600 hover:text-blue-900 p-1"
                              title="Tamamlandı Olarak İşaretle"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredReservations.length === 0 && !loading && (
              <div className="text-center py-8">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Arama kriterlerine uygun rezervasyon bulunamadı.' 
                    : 'Henüz rezervasyon bulunmuyor.'}
                </p>
              </div>
            )}
          </div>

          {/* Detail Modal */}
          {showDetailModal && selectedReservation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEditReservation(selectedReservation);
                        setShowEditModal(true);
                      }}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-700 transition-colors mr-3"
                    >
                      Rezervasyonu Güncelle
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                      Rezervasyon Detayları - #{selectedReservation.reservation_number ? selectedReservation.reservation_number : selectedReservation.id.slice(0, 8)}
                    </h2>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6 relative">
          {/* Rezervasyon Güncelle Modalı */}
          {showEditModal && selectedReservation && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Rezervasyonu Güncelle</h2>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setEditLoading(true);
                    const { error } = await supabase
                      .from('reservations')
                      .update(editReservation)
                      .eq('id', editReservation.id);
                    setEditLoading(false);
                    if (!error) {
                      setShowEditModal(false);
                      setShowDetailModal(false);
                      fetchData();
                      setNotification('Rezervasyon başarıyla güncellendi.');
                    } else {
                      setNotification('Güncelleme sırasında hata oluştu.');
                    }
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-gray-600">Müşteri Adı</label>
                      <input type="text" className="w-full border rounded px-2 py-1" value={editReservation.customer_name || ''} onChange={e => setEditReservation(r => ({ ...r, customer_name: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">E-posta</label>
                      <input type="email" className="w-full border rounded px-2 py-1" value={editReservation.customer_email || ''} onChange={e => setEditReservation(r => ({ ...r, customer_email: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Telefon</label>
                      <input type="text" className="w-full border rounded px-2 py-1" value={editReservation.customer_phone || ''} onChange={e => setEditReservation(r => ({ ...r, customer_phone: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Yolcu Sayısı</label>
                      <input type="number" className="w-full border rounded px-2 py-1" value={editReservation.passengers || ''} onChange={e => setEditReservation(r => ({ ...r, passengers: e.target.value }))} />
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Alış Lokasyonu</label>
                      <select className="w-full border rounded px-2 py-1" value={editReservation.from_location_id || ''} onChange={e => setEditReservation(r => ({ ...r, from_location_id: e.target.value }))}>
                        <option value="">Seçiniz</option>
                        {locations.map((loc: any) => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Varış Lokasyonu</label>
                      <select className="w-full border rounded px-2 py-1" value={editReservation.to_location_id || ''} onChange={e => setEditReservation(r => ({ ...r, to_location_id: e.target.value }))}>
                        <option value="">Seçiniz</option>
                        {locations.map((loc: any) => (
                          <option key={loc.id} value={loc.id}>{loc.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Araç Tipi</label>
                      <select className="w-full border rounded px-2 py-1" value={editReservation.vehicle_type_id || ''} onChange={e => setEditReservation(r => ({ ...r, vehicle_type_id: e.target.value }))}>
                        <option value="">Seçiniz</option>
                        {vehicleTypes.map((v: any) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-600">Ödeme Durumu</label>
                      <select className="w-full border rounded px-2 py-1" value={editReservation.payment_status || ''} onChange={e => setEditReservation(r => ({ ...r, payment_status: e.target.value }))}>
                        <option value="pending">Bekliyor</option>
                        <option value="paid">Ödendi</option>
                        <option value="refunded">İade Edildi</option>
                        <option value="failed">Başarısız</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Notlar</label>
                    <textarea className="w-full border rounded px-2 py-1" value={editReservation.notes || ''} onChange={e => setEditReservation(r => ({ ...r, notes: e.target.value }))} />
                  </div>
                  <div className="flex justify-end gap-2">
                    <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300">Vazgeç</button>
                    <button type="submit" disabled={editLoading} className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700">Kaydet</button>
                  </div>
                </form>
              </div>
            </div>
          )}
                  {/* Yolcu İsimleri ve Uçuş Kodları */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2" /> Yolcu Bilgileri & Uçuş Kodları
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Yolcu İsimleri</label>
                        <p className="font-medium">
                          {Array.isArray(selectedReservation.passenger_names)
                            ? selectedReservation.passenger_names.join(', ')
                            : (selectedReservation.passenger_names || '-')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Gidiş Uçuş Kodu</label>
                        <p className="font-medium">{selectedReservation.departure_flight_code || '-'}</p>
                      </div>
                      {selectedReservation.trip_type === 'round-trip' && (
                        <div>
                          <label className="text-sm text-gray-600">Dönüş Uçuş Kodu</label>
                          <p className="font-medium">{selectedReservation.return_flight_code || '-'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      Müşteri Bilgileri
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Telefon</label>
                        <p className="font-medium">{selectedReservation.customer_phone}</p>
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-sm text-gray-600">E-posta</label>
                        <p className="font-medium">{selectedReservation.customer_email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Trip Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Seyahat Detayları
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Transfer Türü</label>
                        <p className="font-medium">
                          {selectedReservation.trip_type === 'round-trip' ? 'Gidiş-Dönüş' : 'Tek Yön'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Yolcu Sayısı</label>
                        <p className="font-medium">{selectedReservation.passengers}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Alış Lokasyonu</label>
                        <p className="font-medium">{getLocationName(selectedReservation.from_location_id) || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Varış Lokasyonu</label>
                        <p className="font-medium">{getLocationName(selectedReservation.to_location_id) || '-'}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Alış Tarihi</label>
                        <p className="font-medium">
                          {selectedReservation.departure_date && !isNaN(Date.parse(selectedReservation.departure_date))
                            ? `${new Date(selectedReservation.departure_date).toLocaleDateString('tr-TR')} - ${selectedReservation.departure_time || ''}`
                            : '-'}
                        </p>
                      </div>
                      {selectedReservation.trip_type === 'round-trip' && (
                        <div>
                          <label className="text-sm text-gray-600">Dönüş Tarihi</label>
                          <p className="font-medium">
                            {selectedReservation.return_date && !isNaN(Date.parse(selectedReservation.return_date))
                              ? `${new Date(selectedReservation.return_date).toLocaleDateString('tr-TR')} - ${selectedReservation.return_time || ''}`
                              : '-'}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Vehicle & Payment */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <Car className="w-4 h-4 mr-2" />
                        Araç Bilgileri
                      </h3>
                      <div>
                        <label className="text-sm text-gray-600">Araç Tipi</label>
                        <p className="font-medium">{getVehicleName(selectedReservation.vehicle_type_id) || '-'}</p>
                      </div>
                      <div className="mt-2">
                        <label className="text-sm text-gray-600">Atanan Sürücü</label>
                        {selectedReservation.driver_id ? (
                          <p className="font-medium">{getDriverName(selectedReservation.driver_id)}</p>
                        ) : (
                          <p className="text-gray-400">Henüz atama yapılmadı</p>
                        )}
                        <div className="mt-2">
                          <select
                            className="border rounded px-2 py-1 text-sm"
                            value={selectedReservation.driver_id || ''}
                            onChange={async (e) => {
                              const newDriverId = e.target.value;
                              if (!newDriverId) return;
                              // Supabase'de güncelle
                              const { error } = await supabase
                                .from('reservations')
                                .update({ driver_id: newDriverId, status: 'assigned', updated_at: new Date().toISOString() })
                                .eq('id', selectedReservation.id);
                              if (!error) {
                                setSelectedReservation((prev: any) => ({ ...prev, driver_id: newDriverId, status: 'assigned' }));
                                // Ayrıca ana reservations listesini de güncelle
                                setReservations((prev) => prev.map(r => r.id === selectedReservation.id ? { ...r, driver_id: newDriverId, status: 'assigned' } : r));
                              } else {
                                alert('Sürücü ataması başarısız: ' + error.message);
                              }
                            }}
                          >
                            <option value="">Sürücü Seç</option>
                            {drivers.map((driver: any) => (
                              <option key={driver.id} value={driver.id}>{driver.name} ({driver.email})</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-semibold text-gray-900 mb-3">Ödeme Bilgileri</h3>
                      <div>
                        <label className="text-sm text-gray-600">Toplam Tutar</label>
                        <p className="font-bold text-lg text-blue-600">{selectedReservation.total_price} ₺</p>
                      </div>
                      <div className="mt-2">
                        <label className="text-sm text-gray-600">Ödeme Durumu</label>
                        <div className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${getPaymentStatusColor(selectedReservation.payment_status)}`}>
                          {getPaymentStatusLabel(selectedReservation.payment_status)}
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Trip Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      Seyahat Detayları
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-gray-600">Transfer Türü</label>
                        <p className="font-medium">
                          {selectedReservation.trip_type === 'round-trip' ? 'Gidiş-Dönüş' : 'Tek Yön'}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Yolcu Sayısı</label>
                        <p className="font-medium">{selectedReservation.passengers} kişi</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Yolcu İsimleri</label>
                        <p className="font-medium">
                          {Array.isArray(selectedReservation.passenger_names)
                            ? selectedReservation.passenger_names.join(', ')
                            : (selectedReservation.passenger_names || '-')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Nereden</label>
                        <p className="font-medium">{getLocationName(selectedReservation.from_location_id)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Nereye</label>
                        <p className="font-medium">{getLocationName(selectedReservation.to_location_id)}</p>
                      </div>
                      <div>
                        <label className="text-sm text-gray-600">Gidiş Tarihi</label>
                        <p className="font-medium">
                          {new Date(selectedReservation.departure_date).toLocaleDateString('tr-TR')} - {selectedReservation.departure_time}
                        </p>
                      </div>
                      {selectedReservation.return_date && (
                        <div>
                          <label className="text-sm text-gray-600">Dönüş Tarihi</label>
                          <p className="font-medium">
                            {new Date(selectedReservation.return_date).toLocaleDateString('tr-TR')} - {selectedReservation.return_time}
                          </p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-gray-600">Gidiş Uçuş Kodu</label>
                        <p className="font-medium">{selectedReservation.departure_flight_code || '-'}</p>
                      </div>
                      {selectedReservation.trip_type === 'round-trip' && (
                        <div>
                          <label className="text-sm text-gray-600">Dönüş Uçuş Kodu</label>
                          <p className="font-medium">{selectedReservation.return_flight_code || '-'}</p>
                        </div>
                      )}
                      <div>
                        <label className="text-sm text-gray-600">Ekstra Hizmetler</label>
                        <p className="font-medium">
                          {Array.isArray(selectedReservation.extra_services)
                            ? selectedReservation.extra_services.join(', ')
                            : (selectedReservation.extra_services || '-')}
                        </p>
                      </div>
                      {/* Havalimanı zorunluluğu kodu kaldırıldı, sadece uçuş kodu zorunluluğu aktif */}
                    </div>
                  </div>
                  {/* Status & Actions */}
                  <div className="flex items-center justify-between mt-6">
                    <div className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedReservation.status)}`}>{getStatusLabel(selectedReservation.status)}
                      {selectedReservation.status === 'confirmed' && (
                        <span className="ml-2 text-green-600 font-semibold">(Sürücü tarafından onaylandı)</span>
                      )}
                      {selectedReservation.status === 'cancelled' && (
                        <span className="ml-2 text-red-600 font-semibold">(Sürücü tarafından iptal edildi)</span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      {selectedReservation.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              updateReservationStatus(selectedReservation.id, 'confirmed');
                              setShowDetailModal(false);
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
                          >
                            Onayla
                          </button>
                          <button
                            onClick={() => {
                              updateReservationStatus(selectedReservation.id, 'cancelled');
                              setShowDetailModal(false);
                            }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
                          >
                            İptal Et
                          </button>
                        </>
                      )}
                      {selectedReservation.status === 'confirmed' && (
                        <button
                          onClick={() => {
                            updateReservationStatus(selectedReservation.id, 'completed');
                            setShowDetailModal(false);
                          }}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                        >
                          Tamamlandı
                        </button>
                      )}
                    </div>
                  </div>
                  {/* Notes */}
                  {selectedReservation.notes && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Özel Notlar</h3>
                      <p className="text-gray-700">{selectedReservation.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    {/* Silme Onay Modali */}
    {deleteModalOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full">
          <h2 className="text-lg font-bold mb-4 text-red-600">Rezervasyonu Sil</h2>
          <p className="mb-6">Bu rezervasyonu silmek istediğinize emin misiniz?</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={cancelDeleteReservation}
              className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
            >Vazgeç</button>
            <button
              onClick={confirmDeleteReservation}
              className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
            >Evet, Sil</button>
          </div>
        </div>
      </div>
    )}
  </div>
  );
};

export default ReservationManagement;
