export interface Location {
  id: string;
  name: string;
  type: 'airport' | 'district' | 'hotel' | 'landmark';
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface VehicleType {
  id: string;
  name: string;
  capacity: number;
  description: string;
  image: string;
  features: string[];
}

export interface ExtraService {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: string;
}

export interface PriceRule {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  vehicleTypeId: string;
  price: number;
}

export interface Reservation {
  id: string;
  userId?: string;
  customerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  tripType: 'one-way' | 'round-trip';
  fromLocation: Location;
  toLocation: Location;
  vehicleType: VehicleType;
  departureDate: string;
  departureTime: string;
  returnDate?: string;
  returnTime?: string;
  passengers: number;
  extraServices: ExtraService[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  licenseNumber: string;
  vehicleTypes: string[];
  rating: number;
  totalTrips: number;
  isActive: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  loyaltyPoints: number;
  totalReservations: number;
  createdAt: string;
}