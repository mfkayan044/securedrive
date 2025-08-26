export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleTypes: string[]; // araç tiplerinin id'leri
  rating: number;
  totalTrips: number;
  isActive: boolean;
  profileImage?: string;
  vehicleInfo: {
    plate: string;
    model: string;
    year: number;
    color: string;
  };
  workingHours: {
    start: string;
    end: string;
  };
  languages: string[];
  createdAt: string;
  lastActiveAt?: string;
}

export interface DriverReservation {
  id: string;
  reservationId: string;
  driverId: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  tripDetails: {
    fromLocation: string;
    toLocation: string;
    departureDate: string;
    departureTime: string;
    returnDate?: string;
    returnTime?: string;
    passengers: number;
    tripType: 'one-way' | 'round-trip';
  };
  vehicleType: string;
  totalPrice: number;
  status: 'assigned' | 'confirmed' | 'on-route' | 'completed' | 'cancelled';
  specialRequests?: string;
  assignedAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export interface DriverStats {
  totalTrips: number;
  completedTrips: number;
  cancelledTrips: number;
  averageRating: number;
  totalEarnings: number;
  monthlyEarnings: number;
  onTimePercentage: number;
}

export interface DriverLogin {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface DriverRegistration {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  licenseNumber: string;
  vehicleTypes: string[];
  vehicleInfo: {
    plate: string;
    model: string;
    year: number;
    color: string;
  };
  workingHours: {
    start: string;
    end: string;
  };
  languages: string[];
}