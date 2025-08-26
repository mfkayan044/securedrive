import React, { useState } from 'react';
import { useDriver } from '../../contexts/DriverContext';
import DriverLogin from './DriverLogin';
import DriverDashboard from './DriverDashboard';
import DriverReservations from './DriverReservations';
import MessagingPanel from '../messaging/MessagingPanel';
import { 
  LayoutDashboard, 
  Calendar, 
  User, 
  LogOut,
  Car,
  Settings,
  MessageCircle
} from 'lucide-react';

const DriverPanel: React.FC = () => {
  const { isAuthenticated, currentDriver, logout } = useDriver();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showLoginModal, setShowLoginModal] = useState(!isAuthenticated);
  const [showMessaging, setShowMessaging] = useState(false);

  if (!isAuthenticated) {
    return <DriverLogin onClose={() => setShowLoginModal(false)} />;
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'reservations', label: 'Rezervasyonlarım', icon: Calendar },
    { id: 'profile', label: 'Profilim', icon: User }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DriverDashboard />;
      case 'reservations':
        return <DriverReservations />;
      case 'profile':
        return <div className="text-center py-8">Profil sayfası yakında...</div>;
      default:
        return <DriverDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-2 rounded-xl">
                <Car className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                  Sürücü Paneli
                </h1>
                <p className="text-sm text-gray-600">İstanbul Transfer</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowMessaging(true)}
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors duration-200"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden md:inline">Mesajlar</span>
              </button>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">
                    {currentDriver?.name.charAt(0)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{currentDriver?.name}</p>
                  <p className="text-xs text-gray-600">{currentDriver?.vehicle_plate}</p>
                </div>
              </div>
              
              <button
                onClick={logout}
                className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors duration-200"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Çıkış</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
      
      {/* Messaging Panel */}
      {showMessaging && currentDriver && (
        <MessagingPanel
          userType="driver"
          currentUserId={currentDriver.id}
          isOpen={showMessaging}
          onClose={() => setShowMessaging(false)}
        />
      )}
    </div>
  );
};

export default DriverPanel;