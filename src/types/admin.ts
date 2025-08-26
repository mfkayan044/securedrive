export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'operator';
  permissions: AdminPermission[];
  createdAt: string;
  lastLogin?: string;
}

export interface AdminPermission {
  id: string;
  name: string;
  description: string;
}

export interface LocationManagement {
  id: string;
  name: string;
  type: 'airport' | 'district' | 'hotel' | 'landmark';
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface PriceManagement {
  id: string;
  fromLocationId: string;
  toLocationId: string;
  vehicleTypeId: string;
  price: number;
  isActive: boolean;
  validFrom: string;
  validTo?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleManagement {
  id: string;
  name: string;
  capacity: number;
  description: string;
  image: string;
  features: string[];
  isActive: boolean;
  basePrice: number;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtraServiceManagement {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: string;
  isActive: boolean;
  category: 'safety' | 'comfort' | 'service' | 'accessibility';
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReservationManagement extends Reservation {
  driverAssigned?: Driver;
  adminNotes?: string;
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paymentMethod?: string;
  paymentId?: string;
}

export interface DashboardStats {
  totalReservations: number;
  todayReservations: number;
  pendingReservations: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeDrivers: number;
  totalCustomers: number;
  averageRating: number;
}

export interface AdminSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  currency: string;
  timezone: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  maintenanceMode: boolean;
  bookingEnabled: boolean;
  autoConfirmReservations: boolean;
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
}