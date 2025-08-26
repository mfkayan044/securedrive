import React from 'react';
import { 
  Car, 
  Calendar, 
  Clock, 
  Star, 
  TrendingUp, 
  MapPin,
  Phone,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useDriver } from '../../contexts/DriverContext';

const DriverDashboard: React.FC = () => {
  const { currentDriver, driverStats, driverReservations } = useDriver();

  if (!currentDriver) return null;

  // Varsayılan değerlerle stats oluştur
  const safeStats = driverStats || {
    totalTrips: 0,
    completedTrips: 0,
    cancelledTrips: 0,
    averageRating: 0,
    totalEarnings: 0,
    monthlyEarnings: 0,
    onTimePercentage: 0
  };

  const todayReservations = driverReservations.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.tripDetails.departureDate === today;
  });

  const upcomingReservations = driverReservations.filter(r => {
    const today = new Date().toISOString().split('T')[0];
    return r.tripDetails.departureDate > today && r.status !== 'completed' && r.status !== 'cancelled';
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
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
      case 'accepted':
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

  const statCards = [
    {
      title: 'Toplam Transfer',
      value: safeStats.totalTrips.toString(),
      icon: Car,
      color: 'from-blue-500 to-blue-600',
      change: '+12 bu ay'
    },
    {
      title: 'Tamamlanan',
      value: safeStats.completedTrips.toString(),
      icon: CheckCircle,
      color: 'from-green-500 to-green-600',
      change: safeStats.totalTrips > 0 ? `%${Math.round((safeStats.completedTrips / safeStats.totalTrips) * 100)}` : '%0'
    },
    {
      title: 'Ortalama Puan',
      value: safeStats.averageRating.toString(),
      icon: Star,
      color: 'from-yellow-500 to-yellow-600',
      change: '⭐⭐⭐⭐⭐'
    },
    {
      title: 'Aylık Kazanç',
      value: `${safeStats.monthlyEarnings.toLocaleString()} ₺`,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      change: '+0%'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Hoş geldiniz, {currentDriver.name}!</h1>
            <p className="text-green-100">Bugün {todayReservations.length} transferiniz var</p>
            <div className="flex items-center space-x-4 mt-3">
              <div className="flex items-center space-x-1">
                <Car className="w-4 h-4" />
                <span className="text-sm">{currentDriver.vehicle_plate}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span className="text-sm">{currentDriver.rating} puan</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-white bg-opacity-20 rounded-lg p-3">
              <Clock className="w-8 h-8 mx-auto mb-1" />
              <p className="text-sm">Çalışma Saatleri</p>
              <p className="font-semibold">{currentDriver.working_hours_start} - {currentDriver.working_hours_end}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-center justify-between mb-4">
              <div className={`bg-gradient-to-r ${stat.color} w-12 h-12 rounded-lg flex items-center justify-center`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-sm text-green-600 font-medium">
                {stat.change}
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.title}</p>
          </div>
        ))}
      </div>

      {/* Today's Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Bugünkü Transferler ({todayReservations.length})
          </h2>
          
          {todayReservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Bugün için transfer bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayReservations.map((reservation) => (
                <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">{reservation.tripDetails.departureTime}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{reservation.customerInfo.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{reservation.customerInfo.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {reservation.tripDetails.fromLocation} → {reservation.tripDetails.toLocation}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="font-bold text-green-600">{reservation.totalPrice} ₺</span>
                    <span className="text-sm text-gray-500">
                      {reservation.tripDetails.passengers} yolcu
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Reservations */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-600" />
            Yaklaşan Transferler ({upcomingReservations.length})
          </h2>
          
          {upcomingReservations.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Yaklaşan transfer bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingReservations.slice(0, 3).map((reservation) => (
                <div key={reservation.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold">
                        {new Date(reservation.tripDetails.departureDate).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="text-gray-500">-</span>
                      <span className="font-semibold">{reservation.tripDetails.departureTime}</span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {getStatusLabel(reservation.status)}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="font-medium">{reservation.customerInfo.name}</p>
                    <p className="text-sm text-gray-600">
                      {reservation.tripDetails.fromLocation} → {reservation.tripDetails.toLocation}
                    </p>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-green-600">{reservation.totalPrice} ₺</span>
                    <span className="text-sm text-gray-500">
                      {reservation.tripDetails.passengers} yolcu
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboard;