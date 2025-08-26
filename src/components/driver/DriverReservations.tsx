import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Phone, 
  Mail, 
  Car,
  Check,
  X,
  Eye,
  Navigation
} from 'lucide-react';
import { useDriver } from '../../contexts/DriverContext';
import { supabase } from '../../lib/supabase';
const DriverReservations: React.FC = () => {
  const { driverReservations, updateReservationStatus } = useDriver();
  const [locations, setLocations] = useState<any[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);

  React.useEffect(() => {
    // Lokasyon ve araç tiplerini çek
    const fetchData = async () => {
      const [locRes, vehRes] = await Promise.all([
        supabase.from('locations').select('*'),
        supabase.from('vehicle_types').select('*')
      ]);
      setLocations(locRes.data || []);
      setVehicleTypes(vehRes.data || []);
    };
    fetchData();
  }, []);

  const getLocationName = (id: string) => {
    return locations.find(loc => loc.id === id)?.name || id;
  };
  const getVehicleName = (id: string) => {
    return vehicleTypes.find(v => v.id === id)?.name || id;
  };
  const [selectedReservation, setSelectedReservation] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
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
      case 'assigned':
        return 'Atandı';
      case 'confirmed':
        return 'Kabul Edildi';
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

  const filteredReservations = driverReservations.filter(reservation => {
    if (statusFilter === 'all') return true;
    return reservation.status === statusFilter;
  });

  const handleStatusUpdate = async (reservationId: string, newStatus: any) => {
    await updateReservationStatus(reservationId, newStatus);
  };

  const viewReservationDetails = (reservation: any) => {
    setSelectedReservation(reservation);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Rezervasyonlarım</h1>
        <div className="text-sm text-gray-600">
          Toplam: {driverReservations.length} rezervasyon
        </div>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="assigned">Atandı</option>
          <option value="accepted">Kabul Edildi</option>
          <option value="on-route">Yolda</option>
          <option value="completed">Tamamlandı</option>
          <option value="cancelled">İptal Edildi</option>
        </select>
      </div>

      {/* Reservations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReservations.map((reservation) => (
          <div key={reservation.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">
                  {new Date(reservation.tripDetails.departureDate).toLocaleDateString('tr-TR')}
                </span>
                <span className="text-gray-500">-</span>
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-semibold">{reservation.tripDetails.departureTime}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                {getStatusLabel(reservation.status)}
              </span>
            </div>

            {/* Customer Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{reservation.customerInfo.name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{reservation.customerInfo.phone}</span>
              </div>
            </div>

            {/* Trip Details */}
            <div className="bg-gray-50 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium">Nereden:</span>
                <span className="text-sm">{getLocationName(reservation.tripDetails.fromLocation)}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium">Nereye:</span>
                <span className="text-sm">{getLocationName(reservation.tripDetails.toLocation)}</span>
              </div>
            </div>

            {/* Trip Info */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-1">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{reservation.tripDetails.passengers} kişi</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Car className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{getVehicleName(reservation.vehicleType)}</span>
                </div>
              </div>
              <div className="text-lg font-bold text-green-600">
                {reservation.totalPrice} ₺
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-2">
              <button
                onClick={() => viewReservationDetails(reservation)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <Eye className="w-4 h-4" />
                <span>Detay</span>
              </button>

              {reservation.status === 'assigned' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(reservation.id, 'confirmed')}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <Check className="w-4 h-4" />
                    <span>Kabul Et</span>
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(reservation.id, 'cancelled')}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center justify-center space-x-1"
                  >
                    <X className="w-4 h-4" />
                    <span>Reddet</span>
                  </button>
                </>
              )}

              {reservation.status === 'on-route' && (
                <button
                  onClick={() => handleStatusUpdate(reservation.id, 'completed')}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <Check className="w-4 h-4" />
                  <span>Tamamla</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                Rezervasyon Detayları
              </h2>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Müşteri Bilgileri
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Ad Soyad</label>
                    <p className="font-medium">{selectedReservation.customerInfo.name}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Telefon</label>
                    <p className="font-medium">{selectedReservation.customerInfo.phone}</p>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-sm text-gray-600">E-posta</label>
                    <p className="font-medium">{selectedReservation.customerInfo.email}</p>
                  </div>
                </div>
              </div>

              {/* Trip Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Transfer Detayları
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-600">Nereden</label>
                    <p className="font-medium">{getLocationName(selectedReservation.tripDetails.fromLocation)}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Nereye</label>
                    <p className="font-medium">{getLocationName(selectedReservation.tripDetails.toLocation)}</p>
                  </div>
                   {selectedReservation.departureFlightCode && (
                     <div className="md:col-span-2">
                       <label className="text-sm text-blue-600">Gidiş Uçuş Kodu</label>
                       <p className="font-medium">{selectedReservation.departureFlightCode}</p>
                     </div>
                   )}
                   {selectedReservation.tripType === 'round-trip' && selectedReservation.returnFlightCode && (
                     <div className="md:col-span-2">
                       <label className="text-sm text-green-600">Dönüş Uçuş Kodu</label>
                       <p className="font-medium">{selectedReservation.returnFlightCode}</p>
                     </div>
                   )}
                  <div>
                    <label className="text-sm text-gray-600">Tarih</label>
                    <p className="font-medium">
                      {new Date(selectedReservation.tripDetails.departureDate).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Saat</label>
                    <p className="font-medium">{selectedReservation.tripDetails.departureTime}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Yolcu Sayısı</label>
                    <p className="font-medium">{selectedReservation.tripDetails.passengers} kişi</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-600">Araç Tipi</label>
                    <p className="font-medium">{getVehicleName(selectedReservation.vehicleType)}</p>
                  </div>
                </div>
              </div>

              {/* Status Only (Ödeme bilgisi gizli) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Durum</h3>
                  <div className={`inline-block px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(selectedReservation.status)}`}>
                    {getStatusLabel(selectedReservation.status)}
                  </div>
                </div>
              </div>

              {/* Special Requests */}
              {selectedReservation.specialRequests && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Özel İstekler</h3>
                  <p className="text-gray-700">{selectedReservation.specialRequests}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverReservations;