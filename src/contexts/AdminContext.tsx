import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser, DashboardStats } from '../types/admin';
import { supabase } from '../lib/supabase';

interface AdminContextType {
  currentAdmin: AdminUser | null;
  isAuthenticated: boolean;
  dashboardStats: DashboardStats | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshStats: () => void;
  hasPermission: (permission: string) => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Mock admin data
const mockAdmin: AdminUser = {
  id: 'admin-1',
  email: 'admin@istanbultransfer.com',
  name: 'Admin User',
  role: 'super_admin',
  permissions: [
    { id: 'manage_locations', name: 'Lokasyon Yönetimi', description: 'Lokasyonları ekle, düzenle, sil' },
    { id: 'manage_prices', name: 'Fiyat Yönetimi', description: 'Fiyatları düzenle' },
    { id: 'manage_vehicles', name: 'Araç Yönetimi', description: 'Araç tiplerini yönet' },
    { id: 'manage_reservations', name: 'Rezervasyon Yönetimi', description: 'Rezervasyonları yönet' },
    { id: 'manage_drivers', name: 'Sürücü Yönetimi', description: 'Sürücüleri yönet' },
    { id: 'manage_users', name: 'Kullanıcı Yönetimi', description: 'Kullanıcıları yönet' },
    { id: 'view_reports', name: 'Raporlar', description: 'İstatistik ve raporları görüntüle' },
    { id: 'manage_settings', name: 'Ayarlar', description: 'Site ayarlarını yönet' }
  ],
  createdAt: '2024-01-01T00:00:00Z'
};

const mockStats: DashboardStats = {
  totalReservations: 1247,
  todayReservations: 23,
  pendingReservations: 8,
  totalRevenue: 284750,
  monthlyRevenue: 45680,
  activeDrivers: 15,
  totalCustomers: 892,
  averageRating: 4.8
};

export const AdminProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    // Supabase oturumu kontrolü
    const checkSupabaseSession = async () => {
      const { data: userData } = await supabase.auth.getUser();
      if (userData?.user) {
        // Supabase Auth session varsa admin_users tablosunda kontrol et
        let adminData = null;
        let res = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', userData.user.email)
          .single();
        adminData = res.data;
        if (adminData) {
          setCurrentAdmin({
            id: adminData.id,
            email: adminData.email,
            name: adminData.name,
            role: adminData.role,
            permissions: adminData.permissions && adminData.permissions.length > 0 ? adminData.permissions : mockAdmin.permissions,
            createdAt: adminData.created_at,
          });
          setDashboardStats(mockStats);
          localStorage.setItem('admin_user', JSON.stringify({
            ...adminData,
            permissions: adminData.permissions && adminData.permissions.length > 0 ? adminData.permissions : mockAdmin.permissions
          }));
        } else {
          setCurrentAdmin(null);
          setDashboardStats(null);
          localStorage.removeItem('admin_user');
        }
      } else {
        // Supabase Auth session yoksa, localStorage'daki admin_user'ı temizle
        setCurrentAdmin(null);
        setDashboardStats(null);
        localStorage.removeItem('admin_user');
      }
    };
    checkSupabaseSession();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Önce Supabase Auth ile giriş yapmayı dene
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      // Mock login fallback
      if (email === 'admin@istanbultransfer.com' && password === 'admin123') {
        setCurrentAdmin(mockAdmin);
        setDashboardStats(mockStats);
        localStorage.setItem('admin_user', JSON.stringify(mockAdmin));
        return true;
      }
      return false;
    }
    // Supabase ile giriş başarılıysa, admin_users tablosunda sadece email ile kontrol et
    let adminData = null;
    let res = await supabase
      .from('admin_users')
      .select('*')
      .eq('email', email)
      .single();
    adminData = res.data;
    if (!adminData) {
      await supabase.auth.signOut();
      return false;
    }
    setCurrentAdmin({
      id: adminData.id,
      email: adminData.email,
      name: adminData.name,
      role: adminData.role,
      permissions: adminData.permissions && adminData.permissions.length > 0 ? adminData.permissions : mockAdmin.permissions,
      createdAt: adminData.created_at,
    });
    setDashboardStats(mockStats);
    // localStorage'a da permissions ile birlikte kaydet
    localStorage.setItem('admin_user', JSON.stringify({
      ...adminData,
      permissions: adminData.permissions && adminData.permissions.length > 0 ? adminData.permissions : mockAdmin.permissions
    }));
    return true;
  };

  const logout = async () => {
    setCurrentAdmin(null);
    setDashboardStats(null);
    localStorage.removeItem('admin_user');
    await supabase.auth.signOut();
  };

  const refreshStats = () => {
    // In real app, this would fetch fresh stats from API
    setDashboardStats(mockStats);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentAdmin) return false;
    return currentAdmin.permissions.some(p => p.id === permission);
  };

  return (
    <AdminContext.Provider value={{
      currentAdmin,
      isAuthenticated: !!currentAdmin,
      dashboardStats,
      login,
      logout,
      refreshStats,
      hasPermission
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};