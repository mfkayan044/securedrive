import React, { useState, useEffect } from 'react';
import { ArrowLeftRight, Calendar, Clock, Users, Phone, Mail, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseData, usePrice } from '../hooks/useSupabaseData';
import LocationSelect from './LocationSelect';
import VehicleSelector from './VehicleSelector';
import ExtraServices from './ExtraServices';
import { useUser } from '../contexts/UserContext';

const ReservationForm: React.FC = () => {
  const { currentUser, isAuthenticated } = useUser();
  const { data: locations, loading: locationsLoading, error: locationsError } = useSupabaseData('locations', {
    filter: { is_active: true },
    orderBy: { column: 'priority', ascending: true }
  });
  const { data: vehicleTypes, loading: vehicleTypesLoading, error: vehicleTypesError } = useSupabaseData('vehicle_types', {
    filter: { is_active: true },
    orderBy: { column: 'priority', ascending: true }
  });
  const { data: extraServices, loading: extraServicesLoading, error: extraServicesError } = useSupabaseData('extra_services', {
    filter: { is_active: true },
    orderBy: { column: 'priority', ascending: true }
  });

  const [formData, setFormData] = useState({
    tripType: 'one-way' as 'one-way' | 'round-trip',
    fromLocation: '',
    toLocation: '',
    vehicleType: '',
    departureDate: '',
    departureTime: '',
    returnDate: '',
    returnTime: '',
    passengers: 1,
    customerName: currentUser?.name || '',
    customerEmail: currentUser?.email || '',
    customerPhone: currentUser?.phone || '',
    notes: ''
  });

  // Yolcu adları için state
  const [passengerNames, setPassengerNames] = useState<string[]>(['']);

  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const { price: basePrice } = usePrice(formData.fromLocation, formData.toLocation, formData.vehicleType);

  const [currentPrice, setCurrentPrice] = useState(0);

  // Update form data when user logs in
  React.useEffect(() => {
    if (isAuthenticated && currentUser) {
      setFormData(prev => ({
        ...prev,
        customerName: currentUser.name,
        customerEmail: currentUser.email,
        customerPhone: currentUser.phone
      }));
    }
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (basePrice > 0) {
      const extrasPrice = selectedExtras.reduce((total, extraId) => {
        const extra = extraServices?.find(e => e.id === extraId);
        return total + (extra ? extra.price : 0);
      }, 0);
      
      const tripMultiplier = formData.tripType === 'round-trip' ? 2 : 1;
      setCurrentPrice((basePrice * tripMultiplier) + extrasPrice);
    } else {
      setCurrentPrice(0);
    }
  }, [basePrice, formData.tripType, selectedExtras, extraServices]);

  const toggleExtraService = (extraId: string) => {
    setSelectedExtras(prev => 
      prev.includes(extraId) 
        ? prev.filter(id => id !== extraId)
        : [...prev, extraId]
    );
  };

  const getSelectedExtras = () => {
    return extraServices?.filter(extra => selectedExtras.includes(extra.id)) || [];
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      fromLocation: prev.toLocation,
      toLocation: prev.fromLocation
    }));
  };

  // Yolcu sayısı değişince passengerNames dizisini güncelle
  useEffect(() => {
    const count = typeof formData.passengers === 'string' ? parseInt(formData.passengers) : formData.passengers;
    setPassengerNames((prev) => {
      if (prev.length < count) {
        return [...prev, ...Array(count - prev.length).fill('')];
      } else if (prev.length > count) {
        return prev.slice(0, count);
      }
      return prev;
    });
  }, [formData.passengers]);

  // Yolcu adı değişikliği
  const handlePassengerNameChange = (idx: number, value: string) => {
    setPassengerNames((prev) => {
      const updated = [...prev];
      updated[idx] = value;
      return updated;
    });
  };

  // Handler for flight code change
  const handleFlightCodeChange = (field: 'departureFlightCode' | 'returnFlightCode', value: string) => {
    handleInputChange(field, value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Form validation
    if (!formData.fromLocation || !formData.toLocation || !formData.vehicleType || 
        !formData.departureDate || !formData.departureTime || 
        !formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      alert('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    if (formData.tripType === 'round-trip' && (!formData.returnDate || !formData.returnTime)) {
      alert('Gidiş-dönüş seçimi için dönüş tarih ve saatini belirtin.');
      return;
    }

    try {
      // Create reservation in Supabase
      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          user_id: currentUser?.id || null,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail,
          customer_phone: formData.customerPhone,
          trip_type: formData.tripType,
          from_location_id: formData.fromLocation,
          to_location_id: formData.toLocation,
          vehicle_type_id: formData.vehicleType,
          departure_date: formData.departureDate,
          departure_time: formData.departureTime,
          return_date: formData.returnDate || null,
          return_time: formData.returnTime || null,
          passengers: formData.passengers,
          passenger_names: passengerNames,
          departure_flight_code: formData.departureFlightCode || null,
          return_flight_code: formData.returnFlightCode || null,
          total_price: currentPrice,
          notes: formData.notes || null,
          status: 'pending',
          payment_status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reservation:', error);
        alert('Rezervasyon oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        return;
      }

      // Add extra services if any
      if (selectedExtras.length > 0 && reservation && extraServices) {
        const extraServiceInserts = selectedExtras.map(extraId => {
          const extra = extraServices?.find(e => e.id === extraId);
          return {
            reservation_id: reservation.id,
            extra_service_id: extraId,
            quantity: 1,
            price: extra?.price || 0
          };
        });

        try {
          const { error: extrasError } = await supabase
            .from('reservation_extra_services')
            .insert(extraServiceInserts);

          if (extrasError) {
            console.error('Error adding extra services:', extrasError);
          }
        } catch (extrasError) {
          console.error('Error adding extra services:', extrasError);
          // Don't fail the reservation if extra services fail
        }
      }

      // Create conversation for messaging
      if (reservation) {
        try {
          const { error: conversationError } = await supabase
            .from('conversations')
            .insert({
              reservation_id: reservation.id,
              user_id: currentUser?.id || null,
              status: 'active'
            });

          if (conversationError) {
            console.error('Error creating conversation:', conversationError);
          }
        } catch (conversationError) {
          console.error('Error creating conversation:', conversationError);
          // Don't fail the reservation if conversation creation fails
        }
      }

      alert('Rezervasyonunuz başarıyla alındı! Size en kısa sürede dönüş yapacağız.');
      
      // Reset form
      setFormData({
        tripType: 'one-way',
        fromLocation: '',
        toLocation: '',
        vehicleType: '',
        departureDate: '',
        departureTime: '',
        returnDate: '',
        returnTime: '',
        passengers: 1,
        departureFlightCode: '',
        returnFlightCode: '',
        customerName: currentUser?.name || '',
        customerEmail: currentUser?.email || '',
        customerPhone: currentUser?.phone || '',
        notes: ''
      });
      setSelectedExtras([]);
      setPassengerNames(['']);
    } catch (error) {
      console.error('Error creating reservation:', error);
      alert('Rezervasyon oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const fromLocationName = locations?.find(l => l.id === formData.fromLocation)?.name || '';
  const toLocationName = locations?.find(l => l.id === formData.toLocation)?.name || '';

  // Show loading state
  if (locationsLoading || vehicleTypesLoading || extraServicesLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (locationsError || vehicleTypesError || extraServicesError) {
    return (
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">
            Veriler yüklenirken bir hata oluştu. Lütfen Supabase bağlantınızı kontrol edin.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Sayfayı Yenile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Transfer Rezervasyonu</h2>
        <p className="text-gray-600">İstanbul'da güvenli ve konforlu transfer hizmeti</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Trip Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-gray-700">Transfer Türü</label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="one-way"
                checked={formData.tripType === 'one-way'}
                onChange={(e) => handleInputChange('tripType', e.target.value)}
                className="w-4 h-4 text-red-600 focus:ring-red-500 accent-red-500"
              />
              <span className="text-gray-700">Tek Yön</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="radio"
                name="tripType"
                value="round-trip"
                checked={formData.tripType === 'round-trip'}
                onChange={(e) => handleInputChange('tripType', e.target.value)}
                className="w-4 h-4 text-red-600 focus:ring-red-500 accent-red-500"
              />
              <span className="text-gray-700">Gidiş-Dönüş</span>
            </label>
          </div>
        </div>

        {/* Locations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Nereden</label>
            <LocationSelect
              value={formData.fromLocation}
              onChange={(value) => handleInputChange('fromLocation', value)}
              placeholder="Kalkış noktasını seçin"
              excludeId={formData.toLocation}
             locations={locations || []}
            />
          </div>
          
          <div className="flex justify-center md:justify-start mb-3">
            <button
              type="button"
              onClick={swapLocations}
              className="p-2 bg-red-100 hover:bg-red-200 rounded-full transition-colors duration-200"
              disabled={!formData.fromLocation || !formData.toLocation}
            >
              <ArrowLeftRight className="w-5 h-5 text-red-600" />
            </button>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">Nereye</label>
            <LocationSelect
              value={formData.toLocation}
              onChange={(value) => handleInputChange('toLocation', value)}
              placeholder="Varış noktasını seçin"
              excludeId={formData.fromLocation}
             locations={locations || []}
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              <Calendar className="w-4 h-4 inline mr-1" />
              Gidiş Tarihi
            </label>
            <input
              type="date"
              value={formData.departureDate}
              onChange={(e) => handleInputChange('departureDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700">
              <Clock className="w-4 h-4 inline mr-1" />
              Gidiş Saati
            </label>
            <input
              type="time"
              value={formData.departureTime}
              onChange={(e) => handleInputChange('departureTime', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            />
          </div>

          {formData.tripType === 'round-trip' && (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Dönüş Tarihi
                </label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => handleInputChange('returnDate', e.target.value)}
                  min={formData.departureDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Dönüş Saati
                </label>
                <input
                  type="time"
                  value={formData.returnTime}
                  onChange={(e) => handleInputChange('returnTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                />
              </div>
            </>
          )}
        </div>


        {/* Passengers */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            <Users className="w-4 h-4 inline mr-1" />
            Yolcu Sayısı
          </label>
          <select
            value={formData.passengers}
            onChange={(e) => handleInputChange('passengers', Number(e.target.value))}
            className="w-full md:w-48 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
          >
            {[1,2,3,4,5,6,7,8].map(num => (
              <option key={num} value={num}>{num} Kişi</option>
            ))}
          </select>
        </div>

        {/* Dynamic Passenger Names */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Yolcu Ad Soyad Bilgileri</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {passengerNames.map((name, idx) => (
              <input
                key={idx}
                type="text"
                value={name}
                onChange={e => handlePassengerNameChange(idx, e.target.value)}
                placeholder={`Yolcu ${idx + 1} Ad Soyad`}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                required
              />
            ))}
          </div>
        </div>
        {/* Flight Codes */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Uçuş Kodu</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              value={formData.departureFlightCode || ''}
              onChange={e => handleFlightCodeChange('departureFlightCode', e.target.value)}
              placeholder="Gidiş Uçuş Kodu (varsa)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            />
            {formData.tripType === 'round-trip' && (
              <input
                type="text"
                value={formData.returnFlightCode || ''}
                onChange={e => handleFlightCodeChange('returnFlightCode', e.target.value)}
                placeholder="Dönüş Uçuş Kodu (varsa)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            )}
          </div>
        </div>

        {/* Vehicle Selection */}
        {formData.fromLocation && formData.toLocation && (
          <VehicleSelector
            selectedVehicleId={formData.vehicleType}
            onSelect={(vehicleId) => handleInputChange('vehicleType', vehicleId)}
            vehicleTypes={vehicleTypes || []}
          />
        )}

        {/* Extra Services */}
        {formData.vehicleType && extraServices && (
          <ExtraServices
            selectedExtras={selectedExtras}
            onToggleExtra={toggleExtraService}
            extraServices={extraServices}
          />
        )}

        {/* Customer Information */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">İletişim Bilgileri</h3>
            {isAuthenticated && (
              <span className="text-sm text-green-600 flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>Giriş yapıldı</span>
              </span>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <User className="w-4 h-4 inline mr-1" />
                Ad Soyad *
              </label>
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Adınız ve soyadınız"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                disabled={isAuthenticated}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Mail className="w-4 h-4 inline mr-1" />
                E-posta *
              </label>
              <input
                type="email"
                value={formData.customerEmail}
                onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                placeholder="ornek@email.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                disabled={isAuthenticated}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <Phone className="w-4 h-4 inline mr-1" />
                Telefon *
              </label>
              <input
                type="tel"
                value={formData.customerPhone}
                onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                placeholder="+90 5XX XXX XX XX"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                disabled={isAuthenticated}
                required
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">Özel Notlar</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Varsa özel isteklerinizi belirtin..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
          />
        </div>

        {/* Price Summary */}
        {currentPrice > 0 && (
          <div className="bg-gradient-to-br from-red-100 via-red-50 to-white rounded-xl p-6 border border-red-200 shadow-sm">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">Rezervasyon Özeti</h3>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Güzergah:</span>
                  <span className="font-medium">{fromLocationName} → {toLocationName}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Araç:</span>
                  <span className="font-medium">
                    {vehicleTypes?.find(v => v.id === formData.vehicleType)?.name}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Transfer Türü:</span>
                  <span className="font-medium">
                    {formData.tripType === 'round-trip' ? 'Gidiş-Dönüş' : 'Tek Yön'}
                  </span>
                </div>
                
                {getSelectedExtras().length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ek Hizmetler:</span>
                    <span className="font-medium">
                      {getSelectedExtras().map(e => e.name).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="border-t border-red-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-800">Toplam Tutar:</span>
                  <span className="text-2xl font-bold text-red-600">{currentPrice} ₺</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={currentPrice === 0}
          className="w-full bg-gradient-to-r from-red-600 via-red-500 to-slate-400 text-white py-4 rounded-xl hover:from-red-700 hover:to-slate-500 disabled:from-red-400 disabled:to-red-500 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-200 font-semibold text-lg shadow-lg border-0"
        >
          {currentPrice > 0 ? `Rezervasyon Yap - ${currentPrice} ₺` : 'Rezervasyon Yap'}
        </button>
      </form>
    </div>
  );
};

export default ReservationForm;