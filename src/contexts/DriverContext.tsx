import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Driver, DriverReservation, DriverStats, DriverLogin } from '../types/driver';

interface DriverContextType {
  currentDriver: Driver | null;
  isAuthenticated: boolean;
  driverReservations: DriverReservation[];
  driverStats: DriverStats | null;
  login: (credentials: DriverLogin) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateReservationStatus: (reservationId: string, status: DriverReservation['status']) => Promise<boolean>;
  getDriverReservations: () => void;
  updateProfile: (profileData: Partial<Driver>) => Promise<boolean>;
}

const DriverContext = createContext<DriverContextType | undefined>(undefined);

// Mock driver data
const mockDrivers: Driver[] = [
  {
    id: 'driver-1',
    name: 'Mehmet Şoför',
    email: 'mehmet@driver.com',
    phone: '+90 533 987 65 43',
    licenseNumber: 'B123456789',
    vehicleTypes: ['economy', 'comfort'],
    rating: 4.8,
    totalTrips: 156,
    isActive: true,
    vehicleInfo: {
      plate: '34 ABC 123',
      model: 'Toyota Corolla',
      year: 2020,
      color: 'Beyaz'
    },
    workingHours: {
      start: '06:00',
      end: '22:00'
    },
    languages: ['tr', 'en'],
    createdAt: '2024-01-01T00:00:00Z',
    lastActiveAt: '2024-01-15T10:30:00Z'
  },
  {
    id: 'driver-2',
    name: 'Ali Sürücü',
    email: 'ali@driver.com',
    phone: '+90 532 123 45 67',
    licenseNumber: 'B987654321',
    vehicleTypes: ['vip', 'minibus'],
    rating: 4.9,
    totalTrips: 203,
    isActive: true,
    vehicleInfo: {
      plate: '34 XYZ 789',
      model: 'Mercedes E-Class',
      year: 2021,
      color: 'Siyah'
    },
    workingHours: {
      start: '05:00',
      end: '23:00'
    },
    languages: ['tr', 'en', 'ar'],
    createdAt: '2024-01-01T00:00:00Z',
    lastActiveAt: '2024-01-15T14:20:00Z'
  }
];

const mockDriverReservations: DriverReservation[] = [
  {
    id: 'DR001',
    reservationId: 'R001',
    driverId: 'driver-1',
    customerInfo: {
      name: 'Ahmet Yılmaz',
      phone: '+90 532 123 45 67',
      email: 'ahmet@example.com'
    },
    tripDetails: {
      fromLocation: 'İstanbul Havalimanı (IST)',
      toLocation: 'Taksim',
      departureDate: '2024-01-20',
      departureTime: '14:30',
      passengers: 2,
      tripType: 'one-way'
    },
    vehicleType: 'economy',
    totalPrice: 180,
  status: 'assigned',
    assignedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 'DR002',
    reservationId: 'R003',
    driverId: 'driver-1',
    customerInfo: {
      name: 'Fatma Kaya',
      phone: '+90 533 987 65 43',
      email: 'fatma@example.com'
    },
    tripDetails: {
      fromLocation: 'Sultanahmet',
      toLocation: 'İstanbul Havalimanı (IST)',
      departureDate: '2024-01-18',
      departureTime: '08:00',
      passengers: 1,
      tripType: 'one-way'
    },
    vehicleType: 'comfort',
    totalPrice: 280,
  status: 'completed',
    assignedAt: '2024-01-16T09:00:00Z',
    acceptedAt: '2024-01-16T09:15:00Z',
    completedAt: '2024-01-18T09:30:00Z'
  }
];

const mockDriverStats: DriverStats = {
  totalTrips: 156,
  completedTrips: 148,
  cancelledTrips: 3,
  averageRating: 4.8,
  totalEarnings: 28450,
  monthlyEarnings: 4680,
  onTimePercentage: 96
};

export const DriverProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentDriver, setCurrentDriver] = useState<Driver | null>(null);
  const [driverReservations, setDriverReservations] = useState<DriverReservation[]>([]);
  const [driverStats, setDriverStats] = useState<DriverStats | null>(null);

  useEffect(() => {
    // Check if driver is already logged in
    const savedDriver = localStorage.getItem('current_driver');
    if (savedDriver) {
      const driver = JSON.parse(savedDriver);
      setCurrentDriver(driver);
      loadDriverData(driver.id);
    }
  }, []);

  const loadDriverData = async (driverId: string) => {
    // Rezervasyonları Supabase'den çek
    const { data: reservations, error: reservationsError } = await supabase
      .from('reservations')
      .select('*')
      .eq('driver_id', driverId);
    if (!reservationsError && reservations) {
      // Supabase'den gelen rezervasyonları UI'ın beklediği yapıya dönüştür
      const mappedReservations = reservations.map((r: any) => ({
        id: r.id,
        customerInfo: {
          name: r.customer_name,
          phone: r.customer_phone,
          email: r.customer_email
        },
        tripDetails: {
          fromLocation: r.from_location_id,
          toLocation: r.to_location_id,
          departureDate: r.departure_date,
          departureTime: r.departure_time,
          returnDate: r.return_date,
          returnTime: r.return_time,
          passengers: r.passengers,
          tripType: r.trip_type
        },
        vehicleType: r.vehicle_type_id,
        totalPrice: r.total_price,
        status: r.status,
        specialRequests: r.notes,
        assignedAt: r.created_at,
        acceptedAt: r.accepted_at,
        completedAt: r.completed_at
      }));
      setDriverReservations(mappedReservations);
    } else {
      setDriverReservations([]);
    }

    // İstatistikleri Supabase'den hesapla (örnek: toplam, tamamlanan, iptal edilen, ortalama puan)
    if (reservations && reservations.length > 0) {
      const completedTrips = reservations.filter(r => r.status === 'completed').length;
      const cancelledTrips = reservations.filter(r => r.status === 'cancelled').length;
      const totalTrips = reservations.length;
      const averageRating = reservations.reduce((acc, r) => acc + (r.rating || 0), 0) / (reservations.filter(r => r.rating).length || 1);
      const totalEarnings = reservations.reduce((acc, r) => acc + (r.total_price || 0), 0);
      // Son 30 gün kazancı
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      const monthlyEarnings = reservations.filter(r => new Date(r.created_at) > lastMonth).reduce((acc, r) => acc + (r.total_price || 0), 0);
      // Zamanında tamamlanan oranı (örnek: status === 'completed' ve completed_at <= scheduled_time)
      const onTimePercentage = 100; // Basit örnek, detaylı hesaplama eklenebilir
      setDriverStats({
        totalTrips,
        completedTrips,
        cancelledTrips,
        averageRating,
        totalEarnings,
        monthlyEarnings,
        onTimePercentage
      });
    } else {
      setDriverStats(null);
    }
  };

  const login = async (credentials: DriverLogin): Promise<{ success: boolean; message: string }> => {
    // Supabase Auth ile giriş
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      console.log('LOGIN DATA:', data, 'ERROR:', error);
      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          return { success: false, message: 'E-posta veya şifre hatalı.' };
        }
        return { success: false, message: error.message };
      }
      // Kullanıcıyı drivers tablosunda bul
      const { data: driverData, error: driverError } = await supabase
        .from('drivers')
        .select('*')
        .eq('email', credentials.email)
        .single();
      if (driverError || !driverData) {
        return { success: false, message: 'Sürücü kaydı bulunamadı.' };
      }
      // Supabase'den gelen alanları, UI'ın beklediği Driver tipine dönüştür
      const mappedDriver = {
        ...driverData,
        vehicleInfo: {
          plate: driverData.vehicle_plate,
          model: driverData.vehicle_model,
          year: driverData.vehicle_year,
          color: driverData.vehicle_color
        },
        workingHours: {
          start: driverData.working_hours_start,
          end: driverData.working_hours_end
        }
      };
      setCurrentDriver(mappedDriver);
      loadDriverData(driverData.id);
      if (credentials.rememberMe) {
        localStorage.setItem('current_driver', JSON.stringify(mappedDriver));
      } else {
        sessionStorage.setItem('current_driver', JSON.stringify(mappedDriver));
      }
      return { success: true, message: 'Giriş başarılı!' };
    } catch (err) {
      return { success: false, message: 'Giriş sırasında bir hata oluştu.' };
    }
  };

  const logout = () => {
    setCurrentDriver(null);
    setDriverReservations([]);
    setDriverStats(null);
    localStorage.removeItem('current_driver');
    sessionStorage.removeItem('current_driver');
  };

  const updateReservationStatus = async (reservationId: string, status: DriverReservation['status']): Promise<boolean> => {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return false;
    }
    // Supabase'de güncelle
    const { error } = await supabase
      .from('reservations')
      .update({ status, 
  accepted_at: status === 'confirmed' ? new Date().toISOString() : undefined,
        completed_at: status === 'completed' ? new Date().toISOString() : undefined
      })
      .eq('id', reservationId);
    if (error) {
      console.error('Rezervasyon durumu güncellenemedi:', error.message);
      return false;
    }
    // Local state'i güncelle
    setDriverReservations(prev => prev.map(reservation => 
      reservation.id === reservationId 
        ? { 
            ...reservation, 
            status,
            acceptedAt: status === 'confirmed' ? new Date().toISOString() : reservation.acceptedAt,
            completedAt: status === 'completed' ? new Date().toISOString() : reservation.completedAt
          }
        : reservation
    ));
    return true;
  };

  const getDriverReservations = () => {
    if (currentDriver) {
      loadDriverData(currentDriver.id);
    }
  };

  const updateProfile = async (profileData: Partial<Driver>): Promise<boolean> => {
    if (!currentDriver) return false;

    const updatedDriver = { ...currentDriver, ...profileData };
    setCurrentDriver(updatedDriver);
    localStorage.setItem('current_driver', JSON.stringify(updatedDriver));
    
    return true;
  };

  return (
    <DriverContext.Provider value={{
      currentDriver,
      isAuthenticated: !!currentDriver,
      driverReservations,
      driverStats,
      login,
      logout,
      updateReservationStatus,
      getDriverReservations,
      updateProfile
    }}>
      {children}
    </DriverContext.Provider>
  );
};

export const useDriver = () => {
  const context = useContext(DriverContext);
  if (context === undefined) {
    throw new Error('useDriver must be used within a DriverProvider');
  }
  return context;
};