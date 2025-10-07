import React, { useState } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import AdminLogin from './AdminLogin';
import AdminSidebar from './AdminSidebar';
import AdminDashboard from './AdminDashboard';
import LocationManagement from './LocationManagement';
import PricingManagement from './PricingManagement';
import VehicleManagement from './VehicleManagement';
import ExtraServiceManagement from './ExtraServiceManagement';
import ReservationManagement from './ReservationManagement';
import DriverManagement from './DriverManagement';
import MessagingManagement from './MessagingManagement';
import CustomerManagement from './CustomerManagement';

const AdminPanel: React.FC = () => {
  const { isAuthenticated } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!isAuthenticated) {
    return <AdminLogin />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'locations':
        return <LocationManagement />;
      case 'pricing':
        return <PricingManagement />;
      case 'vehicles':
        return <VehicleManagement />;
      case 'extra-services':
        return <ExtraServiceManagement />;
      case 'reservations':
        return <ReservationManagement />;
      case 'drivers':
        return <DriverManagement />;
      case 'messaging':
        return <MessagingManagement />;
      case 'customers':
        return <CustomerManagement />;
      case 'content':
        return <div className="max-w-3xl mx-auto"><b>İçerik Yönetimi (Blog & SSS)</b> sekmesi yakında... (Buradan blog ve SSS içeriklerini güncelleyebileceksiniz)</div>;
      case 'settings':
        return <div className="text-center py-8">Ayarlar sayfası yakında...</div>;
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0">
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
