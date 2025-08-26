import { createClient } from '@supabase/supabase-js';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Check if public (anon) environment variables are present
export const isSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey);
};

// Create Supabase client for regular operations (anon key)
export const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Create admin Supabase client with service role key (optional, only if key is present)
export const isAdminSupabaseConfigured = (): boolean => {
  return !!(supabaseUrl && supabaseServiceKey);
};

export const adminSupabase = isAdminSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null;

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          date_of_birth: string | null;
          address: string | null;
          loyalty_points: number;
          total_reservations: number;
          preferred_language: 'tr' | 'en';
          is_email_verified: boolean;
          is_phone_verified: boolean;
          created_at: string;
          last_login_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          date_of_birth?: string | null;
          address?: string | null;
          loyalty_points?: number;
          total_reservations?: number;
          preferred_language?: 'tr' | 'en';
          is_email_verified?: boolean;
          is_phone_verified?: boolean;
          created_at?: string;
          last_login_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          date_of_birth?: string | null;
          address?: string | null;
          loyalty_points?: number;
          total_reservations?: number;
          preferred_language?: 'tr' | 'en';
          is_email_verified?: boolean;
          is_phone_verified?: boolean;
          created_at?: string;
          last_login_at?: string | null;
          updated_at?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          license_number: string;
          rating: number;
          total_trips: number;
          is_active: boolean;
          profile_image: string | null;
          vehicle_plate: string;
          vehicle_model: string;
          vehicle_year: number;
          vehicle_color: string;
          working_hours_start: string;
          working_hours_end: string;
          languages: string[];
          created_at: string;
          last_active_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          license_number: string;
          rating?: number;
          total_trips?: number;
          is_active?: boolean;
          profile_image?: string | null;
          vehicle_plate: string;
          vehicle_model: string;
          vehicle_year: number;
          vehicle_color: string;
          working_hours_start?: string;
          working_hours_end?: string;
          languages?: string[];
          created_at?: string;
          last_active_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          license_number?: string;
          rating?: number;
          total_trips?: number;
          is_active?: boolean;
          profile_image?: string | null;
          vehicle_plate?: string;
          vehicle_model?: string;
          vehicle_year?: number;
          vehicle_color?: string;
          working_hours_start?: string;
          working_hours_end?: string;
          languages?: string[];
          created_at?: string;
          last_active_at?: string | null;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id: string;
          name: string;
          type: 'airport' | 'district' | 'hotel' | 'landmark';
          address: string;
          coordinates: any | null;
          is_active: boolean;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type: 'airport' | 'district' | 'hotel' | 'landmark';
          address: string;
          coordinates?: any | null;
          is_active?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: 'airport' | 'district' | 'hotel' | 'landmark';
          address?: string;
          coordinates?: any | null;
          is_active?: boolean;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      vehicle_types: {
        Row: {
          id: string;
          name: string;
          capacity: number;
          description: string;
          image: string;
          features: string[];
          is_active: boolean;
          base_price: number;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          capacity: number;
          description: string;
          image: string;
          features?: string[];
          is_active?: boolean;
          base_price: number;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          capacity?: number;
          description?: string;
          image?: string;
          features?: string[];
          is_active?: boolean;
          base_price?: number;
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      extra_services: {
        Row: {
          id: string;
          name: string;
          description: string;
          price: number;
          icon: string;
          is_active: boolean;
          category: 'safety' | 'comfort' | 'service' | 'accessibility';
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          price: number;
          icon: string;
          is_active?: boolean;
          category: 'safety' | 'comfort' | 'service' | 'accessibility';
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          price?: number;
          icon?: string;
          is_active?: boolean;
          category?: 'safety' | 'comfort' | 'service' | 'accessibility';
          priority?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      price_rules: {
        Row: {
          id: string;
          from_location_id: string;
          to_location_id: string;
          vehicle_type_id: string;
          price: number;
          is_active: boolean;
          valid_from: string;
          valid_to: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          from_location_id: string;
          to_location_id: string;
          vehicle_type_id: string;
          price: number;
          is_active?: boolean;
          valid_from?: string;
          valid_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          from_location_id?: string;
          to_location_id?: string;
          vehicle_type_id?: string;
          price?: number;
          is_active?: boolean;
          valid_from?: string;
          valid_to?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      reservations: {
        Row: {
          id: string;
          user_id: string | null;
          driver_id: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          trip_type: 'one-way' | 'round-trip';
          from_location_id: string;
          to_location_id: string;
          vehicle_type_id: string;
          departure_date: string;
          departure_time: string;
          return_date: string | null;
          return_time: string | null;
          passengers: number;
          total_price: number;
          status: 'pending' | 'confirmed' | 'assigned' | 'on-route' | 'completed' | 'cancelled';
          payment_status: 'pending' | 'paid' | 'refunded' | 'failed';
          payment_method: string | null;
          payment_id: string | null;
          notes: string | null;
          admin_notes: string | null;
          rating: number | null;
          review: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          driver_id?: string | null;
          customer_name: string;
          customer_email: string;
          customer_phone: string;
          trip_type: 'one-way' | 'round-trip';
          from_location_id: string;
          to_location_id: string;
          vehicle_type_id: string;
          departure_date: string;
          departure_time: string;
          return_date?: string | null;
          return_time?: string | null;
          passengers: number;
          total_price: number;
          status?: 'pending' | 'confirmed' | 'assigned' | 'on-route' | 'completed' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
          payment_method?: string | null;
          payment_id?: string | null;
          notes?: string | null;
          admin_notes?: string | null;
          rating?: number | null;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          driver_id?: string | null;
          customer_name?: string;
          customer_email?: string;
          customer_phone?: string;
          trip_type?: 'one-way' | 'round-trip';
          from_location_id?: string;
          to_location_id?: string;
          vehicle_type_id?: string;
          departure_date?: string;
          departure_time?: string;
          return_date?: string | null;
          return_time?: string | null;
          passengers?: number;
          total_price?: number;
          status?: 'pending' | 'confirmed' | 'assigned' | 'on-route' | 'completed' | 'cancelled';
          payment_status?: 'pending' | 'paid' | 'refunded' | 'failed';
          payment_method?: string | null;
          payment_id?: string | null;
          notes?: string | null;
          admin_notes?: string | null;
          rating?: number | null;
          review?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      conversations: {
        Row: {
          id: string;
          reservation_id: string;
          user_id: string | null;
          driver_id: string | null;
          admin_joined: boolean;
          admin_user_id: string | null;
          status: 'active' | 'completed' | 'archived';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          reservation_id: string;
          user_id?: string | null;
          driver_id?: string | null;
          admin_joined?: boolean;
          admin_user_id?: string | null;
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          reservation_id?: string;
          user_id?: string | null;
          driver_id?: string | null;
          admin_joined?: boolean;
          admin_user_id?: string | null;
          status?: 'active' | 'completed' | 'archived';
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          sender_id: string;
          sender_type: 'user' | 'driver' | 'admin';
          sender_name: string;
          content: string;
          message_type: 'text' | 'system' | 'location' | 'image';
          metadata: any | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          sender_id: string;
          sender_type: 'user' | 'driver' | 'admin';
          sender_name: string;
          content: string;
          message_type?: 'text' | 'system' | 'location' | 'image';
          metadata?: any | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          sender_id?: string;
          sender_type?: 'user' | 'driver' | 'admin';
          sender_name?: string;
          content?: string;
          message_type?: 'text' | 'system' | 'location' | 'image';
          metadata?: any | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
      admin_users: {
        Row: {
          id: string;
          email: string;
          name: string;
          role: 'super_admin' | 'admin' | 'operator';
          permissions: string[];
          is_active: boolean;
          created_at: string;
          last_login_at: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name: string;
          role?: 'super_admin' | 'admin' | 'operator';
          permissions?: string[];
          is_active?: boolean;
          created_at?: string;
          last_login_at?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          role?: 'super_admin' | 'admin' | 'operator';
          permissions?: string[];
          is_active?: boolean;
          created_at?: string;
          last_login_at?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}