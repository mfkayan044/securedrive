import React from 'react';
import { Users, Check } from 'lucide-react';
import type { Database } from '../lib/supabase';

type VehicleType = Database['public']['Tables']['vehicle_types']['Row'];

interface VehicleSelectorProps {
  selectedVehicleId: string;
  onSelect: (vehicleId: string) => void;
  price?: number;
  vehicleTypes: VehicleType[];
}

const VehicleSelector: React.FC<VehicleSelectorProps> = ({ 
  selectedVehicleId, 
  onSelect, 
  price,
  vehicleTypes
}) => {
  const selectedVehicle = vehicleTypes.find(v => v.id === selectedVehicleId);
  const vehiclePrice = price || selectedVehicle?.base_price || 0;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Araç Seçimi</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicleTypes.map((vehicle) => (
          <div
            key={vehicle.id}
            onClick={() => onSelect(vehicle.id)}
            className={`relative cursor-pointer rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
              selectedVehicleId === vehicle.id
                ? 'border-red-500 bg-red-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            {selectedVehicleId === vehicle.id && (
              <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1">
                <Check className="w-4 h-4" />
              </div>
            )}
            
            <div className="p-4">
              <div className="aspect-w-16 aspect-h-9 mb-3">
                <img
                  src={vehicle.image}
                  alt={vehicle.name}
                  className="w-full h-32 object-cover rounded-lg"
                />
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-1">{vehicle.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{vehicle.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{vehicle.capacity} kişi</span>
                </div>
                  <div className="text-lg font-bold text-blue-600">
                    {/* Price removed, but color changed to red for future use */}
                  </div>
              </div>
              
              <div className="space-y-1">
                {vehicle.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VehicleSelector;