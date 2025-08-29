import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { User, UserRegistration, UserLogin, UserReservation } from '../types/user';

interface UserContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  userReservations: UserReservation[];
  login: (credentials: UserLogin) => Promise<{ success: boolean; message: string }>;
  register: (userData: UserRegistration) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (profileData: Partial<User>) => Promise<boolean>;
  getUserReservations: () => void;
  cancelReservation: (reservationId: string) => Promise<boolean>;
  rateReservation: (reservationId: string, rating: number, review?: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock user data
const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Ahmet Yılmaz',
    email: 'ahmet@example.com',
    phone: '+90 532 123 45 67',
    loyaltyPoints: 150,
    totalReservations: 5,
    preferredLanguage: 'tr',
    isEmailVerified: true,
    isPhoneVerified: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLoginAt: '2024-01-15T10:30:00Z'
  }
];

const mockUserReservations: UserReservation[] = [
  {
    id: 'R001',
    userId: 'user-1',
    customerInfo: {
      name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      phone: '+90 532 123 45 67'
    },
    tripType: 'one-way',
    fromLocation: { id: 'ist', name: 'İstanbul Havalimanı (IST)', type: 'airport' },
    toLocation: { id: 'taksim', name: 'Taksim', type: 'district' },
    vehicleType: { id: 'economy', name: 'Ekonomi', capacity: 4, description: 'Konforlu ve ekonomik seçenek', image: '', features: [] },
    departureDate: '2024-01-20',
    departureTime: '14:30',
    passengers: 2,
    extraServices: [],
    totalPrice: 180,
    status: 'confirmed',
    createdAt: '2024-01-15T10:00:00Z',
    driverInfo: {
      name: 'Mehmet Şoför',
      phone: '+90 533 987 65 43',
      vehiclePlate: '34 ABC 123',
      rating: 4.8
    },
    canCancel: true,
    canModify: false,
    rating: 5,
    review: 'Çok memnun kaldım, zamanında geldi ve güvenli sürüş yaptı.'
  }
];

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userReservations, setUserReservations] = useState<UserReservation[]>([]);

  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      if (!isSupabaseConfigured()) {
        console.log('Supabase not configured, skipping auth check');
        return;
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await loadUserProfile(session.user.id);
      }
    } catch (error) {
      console.log('Auth check skipped - Supabase not available');
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      if (!isSupabaseConfigured()) {
        return;
      }
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      if (user) {
        setCurrentUser({
          id: user.id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          dateOfBirth: user.date_of_birth,
          address: user.address,
          loyaltyPoints: user.loyalty_points,
          totalReservations: user.total_reservations,
          preferredLanguage: user.preferred_language,
          isEmailVerified: user.is_email_verified,
          isPhoneVerified: user.is_phone_verified,
          createdAt: user.created_at,
          lastLoginAt: user.last_login_at
        });
        await loadUserReservations(userId);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const loadUserReservations = async (userId: string) => {
    try {
      if (!isSupabaseConfigured()) {
        return;
      }
      
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select(`
          *,
          from_location:locations!reservations_from_location_id_fkey(*),
          to_location:locations!reservations_to_location_id_fkey(*),
          vehicle_type:vehicle_types(*),
          driver:drivers(*)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading reservations:', error);
        return;
      }

      const formattedReservations: UserReservation[] = reservations?.map(r => ({
        id: r.id,
        userId: r.user_id,
        reservationNumber: r.reservation_number,
        customerInfo: {
          name: r.customer_name,
          email: r.customer_email,
          phone: r.customer_phone
        },
        tripType: r.trip_type as 'one-way' | 'round-trip',
        fromLocation: {
          id: r.from_location.id,
          name: r.from_location.name,
          type: r.from_location.type
        },
        toLocation: {
          id: r.to_location.id,
          name: r.to_location.name,
          type: r.to_location.type
        },
        vehicleType: {
          id: r.vehicle_type.id,
          name: r.vehicle_type.name,
          capacity: r.vehicle_type.capacity,
          description: r.vehicle_type.description,
          image: r.vehicle_type.image,
          features: r.vehicle_type.features
        },
        departureDate: r.departure_date,
        departureTime: r.departure_time,
        returnDate: r.return_date,
        returnTime: r.return_time,
        passengers: r.passengers,
        extraServices: [], // TODO: Load from junction table
        totalPrice: r.total_price,
        status: r.status as any,
        notes: r.notes,
        createdAt: r.created_at,
        driverInfo: r.driver ? {
          name: r.driver.name,
          phone: r.driver.phone,
          vehiclePlate: r.driver.vehicle_plate,
          rating: r.driver.rating
        } : undefined,
        canCancel: r.status === 'pending' || r.status === 'confirmed',
        canModify: r.status === 'pending',
        rating: r.rating,
        review: r.review
      })) || [];

      setUserReservations(formattedReservations);
    } catch (error) {
      console.log('Reservations loading skipped - Supabase not available');
    }
  };

  const login = async (credentials: UserLogin): Promise<{ success: boolean; message: string }> => {
    try {
      // Check demo credentials first to avoid unnecessary Supabase calls
      if (credentials.email === 'ahmet@example.com' && credentials.password === 'password123') {
        const demoUser = mockUsers[0];
        setCurrentUser(demoUser);
        const demoReservations = mockUserReservations.filter(r => r.userId === demoUser.id);
        setUserReservations(demoReservations);
        
        if (credentials.rememberMe) {
          localStorage.setItem('demo_user', JSON.stringify(demoUser));
        }
        
        return { success: true, message: 'Demo giriş başarılı!' };
      }

      // Check if Supabase is available
      if (isSupabaseConfigured()) {
        // Try to sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password
        });

        if (!error && data.user) {
          await loadUserProfile(data.user.id);
          
          // Update last login
          await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id);
          
          return { success: true, message: 'Giriş başarılı!' };
        }
      }
      
      return { success: false, message: 'E-posta veya şifre hatalı.' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, message: 'Giriş yapılırken bir hata oluştu.' };
    }
  };

  const register = async (userData: UserRegistration): Promise<{ success: boolean; message: string }> => {
    try {
      // Validate password
      if (userData.password !== userData.confirmPassword) {
        return { success: false, message: 'Şifreler eşleşmiyor.' };
      }

      if (userData.password.length < 6) {
        return { success: false, message: 'Şifre en az 6 karakter olmalıdır.' };
      }

      // Check if Supabase is available
      if (isSupabaseConfigured()) {
        // Sign up with Supabase Auth
        const { data, error } = await supabase.auth.signUp({
          email: userData.email,
          password: userData.password
        });

        if (!error && data.user) {
          // Create user profile in our users table
          const { error: profileError } = await supabase
            .from('users')
            .upsert({
              id: data.user.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              preferred_language: 'tr'
            }, { onConflict: 'id' });

          if (!profileError) {
            await loadUserProfile(data.user.id);
            return { success: true, message: 'Kayıt başarılı! Hoş geldiniz!' };
          }
        }
      }
      
      // For demo purposes, show success message even without Supabase
      return { success: true, message: 'Demo kayıt başarılı! Supabase bağlantısı için "Connect to Supabase" butonuna tıklayın.' };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, message: 'Kayıt olurken bir hata oluştu.' };
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
    setCurrentUser(null);
    setUserReservations([]);
    localStorage.removeItem('demo_user');
  };

  const updateProfile = async (profileData: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    try {
      let errorMsg = '';
      if (isSupabaseConfigured()) {
        // Alan eşleşmeleri ve date dönüşümü
        const updateObj: any = {
          name: profileData.name,
          phone: profileData.phone,
          address: profileData.address,
          preferred_language: profileData.preferredLanguage,
        };
        if (profileData.email) updateObj.email = profileData.email;
        if (profileData.dateOfBirth) {
          // Eğer string ise ve boş değilse, date formatına çevir
          updateObj.date_of_birth = profileData.dateOfBirth ? new Date(profileData.dateOfBirth).toISOString().slice(0,10) : null;
        }
        const { error } = await supabase
          .from('users')
          .update(updateObj)
          .eq('id', currentUser.id);
        if (error) {
          errorMsg = error.message || 'Profil güncellenemedi.';
          setProfileError(errorMsg);
          return false;
        }
      }
      const updatedUser = { ...currentUser, ...profileData };
      setCurrentUser(updatedUser);
      setProfileError(null);
      return true;
    } catch (error: any) {
      setProfileError(error?.message || 'Profil güncellenemedi.');
      return false;
    }
  };
  const [profileError, setProfileError] = useState<string | null>(null);

  const getUserReservations = () => {
    if (currentUser) {
      loadUserReservations(currentUser.id);
    }
  };

  const cancelReservation = async (reservationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ status: 'cancelled' })
        .eq('id', reservationId);

      if (error) {
        console.error('Error cancelling reservation:', error);
        return false;
      }

      // Update local state
      setUserReservations(prev => prev.map(r => 
        r.id === reservationId 
          ? { ...r, status: 'cancelled', canCancel: false, canModify: false }
          : r
      ));

      return true;
    } catch (error) {
      console.error('Error cancelling reservation:', error);
      return false;
    }
  };

  const rateReservation = async (reservationId: string, rating: number, review?: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('reservations')
        .update({ rating, review })
        .eq('id', reservationId);

      if (error) {
        console.error('Error rating reservation:', error);
        return false;
      }

      // Update local state
      setUserReservations(prev => prev.map(r => 
        r.id === reservationId 
          ? { ...r, rating, review }
          : r
      ));

      return true;
    } catch (error) {
      console.error('Error rating reservation:', error);
      return false;
    }
  };

  return (
    <UserContext.Provider value={{
      currentUser,
      isAuthenticated: !!currentUser,
      userReservations,
      login,
      register,
      logout,
  updateProfile,
  profileError,
      getUserReservations,
      cancelReservation,
      rateReservation
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};