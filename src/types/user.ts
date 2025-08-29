export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  loyaltyPoints: number;
  totalReservations: number;
  preferredLanguage: 'tr' | 'en';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserRegistration {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  acceptMarketing?: boolean;
}

export interface UserLogin {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  dateOfBirth?: string;
  address?: string;
  preferredLanguage: 'tr' | 'en';
}

export interface UserReservation extends Reservation {
  reservationNumber?: number;
  driverInfo?: {
    name: string;
    phone: string;
    vehiclePlate: string;
    rating: number;
  };
  canCancel: boolean;
  canModify: boolean;
  rating?: number;
  review?: string;
}