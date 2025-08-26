import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  DollarSign, 
  Car, 
  Calendar, 
  Users, 
  UserCheck, 
  Settings,
  LogOut,
  Plus,
  MessageCircle
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';
import { useUser } from '../../contexts/UserContext';

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onTabChange }) => {
  const { currentAdmin, logout, hasPermission } = useAdmin();
  const { logout: userLogout } = useUser();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: null },
    { id: 'locations', label: 'Lokasyonlar', icon: MapPin, permission: 'manage_locations' },
    { id: 'pricing', label: 'Fiyatlandırma', icon: DollarSign, permission: 'manage_prices' },
    { id: 'vehicles', label: 'Araçlar', icon: Car, permission: 'manage_vehicles' },
    { id: 'extra-services', label: 'Ek Hizmetler', icon: Plus, permission: 'manage_vehicles' },
    { id: 'reservations', label: 'Rezervasyonlar', icon: Calendar, permission: 'manage_reservations' },
    { id: 'drivers', label: 'Sürücüler', icon: UserCheck, permission: 'manage_drivers' },
    { id: 'messaging', label: 'Mesajlaşma', icon: MessageCircle, permission: 'manage_reservations' },
    { id: 'customers', label: 'Müşteriler', icon: Users, permission: 'manage_users' },
    { id: 'settings', label: 'Ayarlar', icon: Settings, permission: 'manage_settings' }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    !item.permission || hasPermission(item.permission)
  );

  return (
    <div className="bg-white shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 w-10 h-10 rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">Admin Panel</h2>
            <p className="text-sm text-gray-600">İstanbul Transfer</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                  activeTab === item.id
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-bold">
              {currentAdmin?.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentAdmin?.name}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {currentAdmin?.email}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => { logout(); userLogout(); window.location.reload(); }}
          className="w-full flex items-center space-x-3 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <LogOut className="w-4 h-4" />
          <span className="text-sm font-medium">Çıkış Yap</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;