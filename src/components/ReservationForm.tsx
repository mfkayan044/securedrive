import React, { useEffect, useState } from 'react';
import PaymentModal from './user/PaymentModal';
import { ArrowLeftRight, Calendar, Clock, Users, Phone, Mail, User } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useSupabaseData, usePrice } from '../hooks/useSupabaseData';
import LocationSelect from './LocationSelect';
import VehicleSelector from './VehicleSelector';
import ExtraServices from './ExtraServices';
import { useUser } from '../contexts/UserContext';

type TripType = 'one-way' | 'round-trip';

interface FormData {
  tripType: TripType;
  fromLocation: string;
  toLocation: string;
  vehicleType: string;
  departureDate: string;
  departureTime: string;
  returnDate: string;
  returnTime: string;
  passengers: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
  departureFlightCode?: string;
  returnFlightCode?: string;
}

interface ReservationFormProps {
  onSuccess?: () => void;
  forceEmptyCustomer?: boolean;
  noPaymentMode?: boolean;
}

const ReservationForm: React.FC<ReservationFormProps> = ({ onSuccess, forceEmptyCustomer, noPaymentMode }) => {
  // Rezervasyon başarı modalı için state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  // İş kuralı: Güzergahda havalimanı zorunluluğu için state
  const [airportRequiredInRoute, setAirportRequiredInRoute] = useState<'yes' | 'no'>('yes');
  // İş kuralı: Güzergahda havalimanı zorunluluğu değerini Supabase'den çek
  useEffect(() => {
    const fetchAirportRequired = async () => {
      const { data, error } = await supabase
        .from('business_rules')
        .select('value')
        .eq('key', 'airport_required_in_route')
        .single();
      if (!error && data && (data.value === 'yes' || data.value === 'no')) {
        setAirportRequiredInRoute(data.value);
      }
    };
    fetchAirportRequired();
  }, []);
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

  const [formData, setFormData] = useState<FormData>({
    tripType: 'one-way',
    fromLocation: '',
    toLocation: '',
    vehicleType: '',
    departureDate: '',
    departureTime: '',
    returnDate: '',
    returnTime: '',
    passengers: 1,
    customerName: forceEmptyCustomer ? '' : (currentUser?.name || ''),
    customerEmail: forceEmptyCustomer ? '' : (currentUser?.email || ''),
    customerPhone: forceEmptyCustomer ? '' : (currentUser?.phone || ''),
    notes: '',
    departureFlightCode: '',
    returnFlightCode: '',
  });

  // İş kuralları: Maksimum yolcu sayısı (ekonomi/bus)
  const [maxPassengers, setMaxPassengers] = useState<{ economy: number; bus: number }>({ economy: 8, bus: 14 });

  // İş kuralı: Maksimum yolcu sayısı değerlerini Supabase'den çek
  useEffect(() => {
    const fetchMaxPassengers = async () => {
      const { data, error } = await supabase
        .from('business_rules')
        .select('key,value')
        .in('key', ['max_passengers_economy', 'max_passengers_bus']);
      if (!error && data && Array.isArray(data)) {
        const eco = data.find((r: any) => r.key === 'max_passengers_economy');
        const bus = data.find((r: any) => r.key === 'max_passengers_bus');
        setMaxPassengers({
          economy: eco ? parseInt(eco.value, 10) || 8 : 8,
          bus: bus ? parseInt(bus.value, 10) || 14 : 14
        });
      }
    };
    fetchMaxPassengers();
  }, []);

  // Araç tipi veya yolcu sayısı değişince, limit aşımı varsa düzelt ve uyarı göster
  useEffect(() => {
    let max = 8;
    if (formData.vehicleType) {
      const selectedVehicle = vehicleTypes?.find((v: any) => v.id === formData.vehicleType);
      const name = selectedVehicle?.name?.toLowerCase() || '';
      if (name.includes('bus') || name.includes('otobüs') || name.includes('minibüs')) {
        max = maxPassengers.bus;
      } else {
        max = maxPassengers.economy;
      }
    }
    if (formData.passengers > max) {
      setFormData(prev => ({ ...prev, passengers: max }));
  showNotification(`Seçtiğiniz araç için maksimum yolcu sayısı ${max} olarak güncellendi.`, 'error');
    }
  }, [formData.vehicleType, maxPassengers]);


  const [passengerNames, setPassengerNames] = useState<string[]>(['']);
  const [selectedExtras, setSelectedExtras] = useState<string[]>([]);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingReservation, setPendingReservation] = useState<any>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('error');
  // Bildirim gösterme fonksiyonu
  const showNotification = (msg: string, type: 'success' | 'error' = 'error') => {
    setNotification(msg);
    setNotificationType(type);
    setTimeout(() => setNotification(null), 4000);
  };

  // Baz fiyat (lokasyon + araç tipine göre)
  const { price: basePrice } = usePrice(formData.fromLocation, formData.toLocation, formData.vehicleType);
  const [currentPrice, setCurrentPrice] = useState<number>(0);

  // Auth olunca formu doldur
  useEffect(() => {
    if (forceEmptyCustomer) return;
    if (isAuthenticated && currentUser) {
      setFormData(prev => ({
        ...prev,
        customerName: currentUser.name || '',
        customerEmail: currentUser.email || '',
        customerPhone: currentUser.phone || ''
      }));
    }
  }, [isAuthenticated, currentUser, forceEmptyCustomer]);

  // Yolcu sayısı değişince isim alanlarını senkronize et
  useEffect(() => {
    setPassengerNames(prev => {
      const next = [...prev];
      if (formData.passengers > next.length) {
        return next.concat(Array(formData.passengers - next.length).fill(''));
      }
      return next.slice(0, formData.passengers);
    });
  }, [formData.passengers]);

  // Fiyatı hesapla (tek yön = 1x, gidiş-dönüş = 2x) + ekstra servisler
  useEffect(() => {
    const tripMultiplier = formData.tripType === 'round-trip' ? 2 : 1;
    const extrasSum =
      (extraServices || [])
        .filter((e: any) => selectedExtras.includes(e.id))
        .reduce((sum: number, e: any) => sum + (e.price || 0), 0);

    setCurrentPrice((basePrice || 0) * tripMultiplier + extrasSum);
  }, [basePrice, formData.tripType, selectedExtras, extraServices]);

  const handleInputChange = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const swapLocations = () => {
    setFormData(prev => ({
      ...prev,
      fromLocation: prev.toLocation,
      toLocation: prev.fromLocation
    }));
  };

  const toggleExtraService = (id: string) => {
    setSelectedExtras(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]));
  };

  const handlePassengerNameChange = (idx: number, value: string) => {
    setPassengerNames(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const handleFlightCodeChange = (field: 'departureFlightCode' | 'returnFlightCode', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };


  // İş kuralı: Uçuş kodu zorunluluğu kontrolü için state
  const [flightCodeRequired, setFlightCodeRequired] = useState<'yes' | 'no'>('no');

  // İş kuralı: Uçuş kodu zorunluluğu değerini Supabase'den çek
  useEffect(() => {
    const fetchFlightCodeRequired = async () => {
      const { data, error } = await supabase
        .from('business_rules')
        .select('value')
        .eq('key', 'flight_code_required')
        .single();
      if (!error && data && (data.value === 'yes' || data.value === 'no')) {
        setFlightCodeRequired(data.value);
      }
    };
    fetchFlightCodeRequired();
  }, []);

  // Form submit → ödeme modalı veya direkt kayıt
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fromLocation || !formData.toLocation || !formData.vehicleType ||
        !formData.departureDate || !formData.departureTime ||
        !formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      showNotification('Lütfen tüm gerekli alanları doldurun.');
      return;
    }

    if (formData.tripType === 'round-trip' && (!formData.returnDate || !formData.returnTime)) {
      showNotification('Gidiş-dönüş için dönüş tarih ve saatini belirtin.');
      return;
    }

    // Güzergahda havalimanı zorunluluğu kontrolü
    let isAirportTransfer = false;
    const fromLoc = locations?.find((l: any) => l.id === formData.fromLocation);
    const toLoc = locations?.find((l: any) => l.id === formData.toLocation);
    if (fromLoc && toLoc) {
      const airportKeywords = ['havaalanı', 'havalimanı', 'airport'];
      const fromIsAirport = airportKeywords.some(kw => fromLoc.name?.toLowerCase().includes(kw));
      const toIsAirport = airportKeywords.some(kw => toLoc.name?.toLowerCase().includes(kw));
      isAirportTransfer = fromIsAirport || toIsAirport;
    }
    if (airportRequiredInRoute === 'yes' && !isAirportTransfer) {
      showNotification('İlçeler arası transfer yapılamaz. Nereden veya Nereye alanlarından en az biri havalimanı olmalı.');
      return;
    }
    if (flightCodeRequired === 'yes' && isAirportTransfer) {
      if (!formData.departureFlightCode || formData.departureFlightCode.trim() === '') {
        showNotification('Havaalanı transferlerinde uçuş kodu zorunludur. Lütfen uçuş kodunu girin.');
        return;
      }
    }

    // Minimum ve Maksimum rezervasyon süresi kuralı kontrolü
    try {
      const { data, error } = await supabase
        .from('business_rules')
        .select('key,value')
        .in('key', ['min_reservation_notice_hours', 'max_reservation_notice_days']);
      if (!error && data && Array.isArray(data)) {
        const minRule = data.find((r:any) => r.key === 'min_reservation_notice_hours');
        const maxRule = data.find((r:any) => r.key === 'max_reservation_notice_days');
        const minHours = minRule ? parseInt(minRule.value, 10) || 0 : 0;
        const maxDays = maxRule ? parseInt(maxRule.value, 10) || 0 : 0;
        if (!formData.departureDate || !formData.departureTime) {
          showNotification('Lütfen gidiş tarihi ve saatini seçin.');
          return;
        }
        const depDate = new Date(formData.departureDate + 'T' + formData.departureTime);
        const now = new Date();
        const diffMs = depDate.getTime() - now.getTime();
        const diffHours = diffMs / (1000 * 60 * 60);
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (isNaN(depDate.getTime())) {
          showNotification('Geçerli bir gidiş tarihi ve saati girin.');
          return;
        }
        if (minHours > 0 && diffHours < minHours) {
          showNotification(`Rezervasyonunuzu en az ${minHours} saat önceden yapmalısınız.`);
          return;
        }
        if (maxDays > 0 && diffDays > maxDays) {
          showNotification(`Rezervasyonunuzu en fazla ${maxDays} gün sonrasına yapabilirsiniz.`);
          return;
        }
      }
    } catch (err) {
      console.error('Rezervasyon süresi kuralları okunamadı:', err);
    }

    // noPaymentMode ise doğrudan rezervasyon kaydı
    if (noPaymentMode) {
      setPendingReservation({
        ...formData,
        passengerNames: [...passengerNames],
        selectedExtras: [...selectedExtras],
        currentPrice
      });
      await handlePaymentSuccess();
      return;
    }

    // Anasayfa için: ödeme modalını açma, direkt kayıt
    if (typeof noPaymentMode === 'undefined' || noPaymentMode === false) {
      setPendingReservation({
        ...formData,
        passengerNames: [...passengerNames],
        selectedExtras: [...selectedExtras],
        currentPrice
      });
      await handlePaymentSuccess();
      return;
    }

    // (Gizli bırakılan) ödeme modalı kodu
    // setShowPayment(true);
    // setPendingReservation({
    //   ...formData,
    //   passengerNames: [...passengerNames],
    //   selectedExtras: [...selectedExtras],
    //   currentPrice
    // });
  };

  // Ödeme başarılı → Supabase'e kayıt + extras + conversation
  const handlePaymentSuccess = async () => {

    if (!pendingReservation) return;

    try {
      // 1) reservation_approval iş kuralını çek
      let reservationStatus = 'pending';
      const { data: ruleData, error: ruleError } = await supabase
        .from('business_rules')
        .select('value')
        .eq('key', 'reservation_approval')
        .single();
      if (!ruleError && ruleData && ruleData.value === 'auto') {
        reservationStatus = 'confirmed';
      }

      // 2) Rezervasyon kaydı

      const newReservation = {
        user_id: currentUser?.id || null,
        customer_name: pendingReservation.customerName,
        customer_email: pendingReservation.customerEmail,
        customer_phone: pendingReservation.customerPhone,
        trip_type: pendingReservation.tripType,
        from_location_id: pendingReservation.fromLocation,
        to_location_id: pendingReservation.toLocation,
        vehicle_type_id: pendingReservation.vehicleType,
        departure_date: pendingReservation.departureDate,
        departure_time: pendingReservation.departureTime,
        return_date: pendingReservation.returnDate || null,
        return_time: pendingReservation.returnTime || null,
        passengers: pendingReservation.passengers,
        passenger_names: pendingReservation.passengerNames,
        departure_flight_code: pendingReservation.departureFlightCode || null,
        return_flight_code: pendingReservation.returnFlightCode || null,
        total_price: pendingReservation.currentPrice,
        notes: pendingReservation.notes || null,
        status: reservationStatus,
        payment_status: noPaymentMode ? 'pending' : 'paid'
      };

      const { data: reservation, error } = await supabase
        .from('reservations')
        .insert({
          user_id: currentUser?.id || null,
          customer_name: pendingReservation.customerName,
          customer_email: pendingReservation.customerEmail,
          customer_phone: pendingReservation.customerPhone,
          trip_type: pendingReservation.tripType,
          from_location_id: pendingReservation.fromLocation,
          to_location_id: pendingReservation.toLocation,
          vehicle_type_id: pendingReservation.vehicleType,
          departure_date: pendingReservation.departureDate,
          departure_time: pendingReservation.departureTime,
          return_date: pendingReservation.returnDate || null,
          return_time: pendingReservation.returnTime || null,
          passengers: pendingReservation.passengers,
          passenger_names: pendingReservation.passengerNames,
          departure_flight_code: pendingReservation.departureFlightCode || null,
          return_flight_code: pendingReservation.returnFlightCode || null,
          total_price: pendingReservation.currentPrice,
          notes: pendingReservation.notes || null,
          status: reservationStatus,
          payment_status: noPaymentMode ? 'pending' : 'paid'
        });
  setPassengerNames(['']);
  setSelectedExtras([]);
  setPendingReservation(null);
  setShowPayment(false);
  setShowSuccessModal(true);
    } catch (err) {
      console.error('Error:', err);
  showNotification('Bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const fromLocationName = locations?.find((l: any) => l.id === formData.fromLocation)?.name || '';
  const toLocationName = locations?.find((l: any) => l.id === formData.toLocation)?.name || '';
  const vehicleName = vehicleTypes?.find((v: any) => v.id === formData.vehicleType)?.name || '';

  // Yükleme ekranı
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

  // Hata ekranı
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
          <p className="text-gray-600 mb-4">Veriler yüklenirken bir hata oluştu. Lütfen Supabase bağlantınızı kontrol edin.</p>
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
                onChange={(e) => handleInputChange('tripType', e.target.value as TripType)}
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
                onChange={(e) => handleInputChange('tripType', e.target.value as TripType)}
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
              onChange={(value) => handleInputChange('fromLocation', value as any)}
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
              onChange={(value) => handleInputChange('toLocation', value as any)}
              placeholder="Varış noktasını seçin"
              excludeId={formData.fromLocation}
              locations={locations || []}
            />
          </div>
        </div>
        {/* Güzergahda havalimanı zorunluluğu uyarısı */}
        {(() => {
          const airportKeywords = ['havaalanı', 'havalimanı', 'airport'];
          const fromLoc = locations?.find((l: any) => l.id === formData.fromLocation)?.name?.toLowerCase() || '';
          const toLoc = locations?.find((l: any) => l.id === formData.toLocation)?.name?.toLowerCase() || '';
          const fromIsAirport = airportKeywords.some(kw => fromLoc.includes(kw));
          const toIsAirport = airportKeywords.some(kw => toLoc.includes(kw));
          if (
            formData.fromLocation && formData.toLocation &&
            !fromIsAirport && !toIsAirport
          ) {
            return (
              <div className="mt-2 flex items-center text-yellow-700 bg-yellow-100 border border-yellow-300 rounded px-3 py-2 text-sm font-semibold">
                <svg className="w-5 h-5 mr-2 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 15.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                Güzergahda havalimanı yok! Nereden veya Nereye alanlarından en az biri havalimanı olmalı.
              </div>
            );
          }
          return null;
        })()}

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
            {(() => {
              let max = 8;
              if (formData.vehicleType) {
                const selectedVehicle = vehicleTypes?.find((v: any) => v.id === formData.vehicleType);
                const name = selectedVehicle?.name?.toLowerCase() || '';
                if (name.includes('bus') || name.includes('otobüs') || name.includes('minibüs')) {
                  max = maxPassengers.bus;
                } else {
                  max = maxPassengers.economy;
                }
              }
              // Araç seçilmemişse default 1-8 arası, seçilmişse max'a göre
              return Array.from({ length: max }, (_, i) => i + 1).map(num => (
                <option key={num} value={num}>{num} Kişi</option>
              ));
            })()}
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
              placeholder="Gidiş Uçuş Kodu"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
            />
            {formData.tripType === 'round-trip' && (
              <input
                type="text"
                value={formData.returnFlightCode || ''}
                onChange={e => handleFlightCodeChange('returnFlightCode', e.target.value)}
                placeholder="Dönüş Uçuş Kodu"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
              />
            )}
          </div>
        </div>

        {/* Vehicle Selection */}
        {formData.fromLocation && formData.toLocation && (
          <VehicleSelector
            selectedVehicleId={formData.vehicleType}
            onSelect={(vehicleId) => handleInputChange('vehicleType', vehicleId as any)}
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
                disabled={isAuthenticated && !forceEmptyCustomer}
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
                disabled={isAuthenticated && !forceEmptyCustomer}
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
                disabled={isAuthenticated && !forceEmptyCustomer}
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
                  <span className="font-medium">{vehicleName || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tarih/Saat:</span>
                  <span className="font-medium">
                    {formData.departureDate} {formData.departureTime}
                    {formData.tripType === 'round-trip' && ` • Dönüş: ${formData.returnDate} ${formData.returnTime}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Yolcu:</span>
                  <span className="font-medium">{formData.passengers}</span>
                </div>
                {selectedExtras.length > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Ekstra Hizmetler:</span>
                    <span className="font-medium">
                      {selectedExtras.map(id => extraServices?.find((e: any) => e.id === id)?.name).filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-base">
                  <span className="text-gray-800 font-semibold">Toplam Fiyat:</span>
                  <span className="text-gray-900 font-bold">{currentPrice.toLocaleString('tr-TR')} TL</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
                >
                  Ödeme ve Rezervasyonu Tamamla
                </button>
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Ödeme Modalı */}
      {/*
      {showPayment && !noPaymentMode && (
        <PaymentModal
          isOpen={showPayment}
          totalPrice={currentPrice}
          onClose={() => setShowPayment(false)}
          onPaymentSuccess={handlePaymentSuccess}
        />
      )}
      */}
    {/* Bildirim Toast */}
    {notification && (
      <div
        className={`fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 px-8 py-4 rounded-xl shadow-2xl border animate-fade-in font-semibold text-lg flex items-center justify-center min-w-[320px] max-w-[90vw] text-center transition-colors duration-300
        ${notificationType === 'success' ? 'bg-green-600 text-white border-green-700' : 'bg-red-600 text-white border-red-700'}`}
      >
        {notification}
      </div>
    )}
    {/* Rezervasyon Başarı Modalı */}
    {showSuccessModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-xl p-8 shadow-2xl max-w-md w-full relative">
          <button onClick={() => {
            setShowSuccessModal(false);
            if (onSuccess) onSuccess();
          }} className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl">&times;</button>
          <h2 className="text-2xl font-bold mb-4 text-center text-green-700">Rezervasyon Başarılı!</h2>
          <p className="text-center mb-6">Rezervasyonunuz başarıyla alındı! En kısa sürede sizinle iletişime geçeceğiz.</p>
          {!isAuthenticated ? (
            <>
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold text-lg mb-2"
                onClick={() => {
                  setShowSuccessModal(false);
                  // Üye ol modalı açılacaksa burada tetikleyin
                  const event = new CustomEvent('openRegisterModal');
                  window.dispatchEvent(event);
                }}
              >
                Üye Ol
              </button>
              <a
                href="https://wa.me/905348517444"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center bg-[#25D366] hover:bg-[#1ebe57] text-white py-3 rounded-lg font-semibold text-lg mb-2 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 mr-2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 14.487c-.263-.132-1.558-.77-1.799-.858-.241-.088-.417-.132-.593.132-.175.263-.68.858-.833 1.033-.153.175-.307.197-.57.066-.263-.132-1.11-.409-2.115-1.304-.782-.696-1.31-1.556-1.464-1.819-.153-.263-.016-.405.116-.537.12-.12.263-.307.395-.461.132-.153.175-.263.263-.438.088-.175.044-.329-.022-.461-.066-.132-.593-1.433-.813-1.963-.214-.514-.432-.444-.593-.453l-.504-.009c-.175 0-.461.066-.701.329-.24.263-.92.899-.92 2.192 0 1.293.942 2.544 1.073 2.719.132.175 1.853 2.832 4.492 3.858.629.271 1.12.433 1.503.554.631.201 1.206.173 1.661.105.507-.075 1.558-.637 1.779-1.253.22-.616.22-1.143.153-1.253-.066-.11-.24-.175-.504-.307z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12c0 1.708.438 3.312 1.204 4.704L2.25 21.75l5.16-1.356A9.708 9.708 0 0012 21.75c5.385 0 9.75-4.365 9.75-9.75z" />
                </svg>
                WhatsApp'dan iletişime geçin
              </a>
            </>
          ) : (
            <button
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg mb-2"
              onClick={() => {
                setShowSuccessModal(false);
                // Profil modalı açılacaksa burada tetikleyin
                const event = new CustomEvent('openProfileModal');
                window.dispatchEvent(event);
              }}
            >
              Profilimi Gör
            </button>
          )}
        </div>
      </div>
    )}
    </div>
  );
};

export default ReservationForm;
