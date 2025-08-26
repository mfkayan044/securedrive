import React from 'react';
import { 
  Baby, 
  Users, 
  Luggage, 
  UserCheck, 
  Clock, 
  Wifi,
  Plus,
  Minus
} from 'lucide-react';
import type { Database } from '../lib/supabase';

type ExtraService = Database['public']['Tables']['extra_services']['Row'];

interface ExtraServicesProps {
  selectedExtras: string[];
  onToggleExtra: (extraId: string) => void;
  extraServices: ExtraService[];
}

const ExtraServices: React.FC<ExtraServicesProps> = ({ 
  selectedExtras, 
  onToggleExtra,
  extraServices
}) => {
  const getIcon = (iconName: string) => {
    const iconProps = { className: "w-5 h-5" };
    switch (iconName) {
      case 'baby':
        return <Baby {...iconProps} />;
      case 'child':
        return <Users {...iconProps} />;
      case 'luggage':
        return <Luggage {...iconProps} />;
      case 'user-check':
        return <UserCheck {...iconProps} />;
      case 'clock':
        return <Clock {...iconProps} />;
      case 'wifi':
        return <Wifi {...iconProps} />;
      default:
        return <Plus {...iconProps} />;
    }
  };

  const totalExtraPrice = selectedExtras.reduce((total, extraId) => {
    const extra = extraServices.find(e => e.id === extraId);
    return total + (extra ? extra.price : 0);
  }, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Ek Hizmetler</h3>
        {totalExtraPrice > 0 && (
          <div className="text-sm font-medium text-red-600">
            Toplam: +{totalExtraPrice} ₺
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {extraServices.map((service) => {
          const isSelected = selectedExtras.includes(service.id);
          
          return (
            <div
              key={service.id}
              onClick={() => onToggleExtra(service.id)}
              className={`cursor-pointer rounded-lg border-2 p-4 transition-all duration-200 hover:shadow-md ${
                isSelected
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getIcon(service.icon)}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{service.name}</h4>
                    <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-gray-900">+{service.price} ₺</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    isSelected 
                      ? 'border-red-500 bg-red-500' 
                      : 'border-gray-300'
                  }`}>
                    {isSelected ? (
                      <Minus className="w-3 h-3 text-white" />
                    ) : (
                      <Plus className="w-3 h-3 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExtraServices;