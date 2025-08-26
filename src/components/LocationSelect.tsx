import React from 'react';
import { MapPin, Plane, Building, Star } from 'lucide-react';
import type { Database } from '../lib/supabase';

type Location = Database['public']['Tables']['locations']['Row'];

interface LocationSelectProps {
  value: string;
  onChange: (locationId: string) => void;
  placeholder: string;
  excludeId?: string;
  locations: Location[];
}

const LocationSelect: React.FC<LocationSelectProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  excludeId,
  locations
}) => {
  const getLocationIcon = (type: Location['type']) => {
    switch (type) {
      case 'airport':
        return <Plane className="w-4 h-4 text-blue-600" />;
      case 'hotel':
        return <Building className="w-4 h-4 text-purple-600" />;
      case 'landmark':
        return <Star className="w-4 h-4 text-yellow-600" />;
      default:
        return <MapPin className="w-4 h-4 text-green-600" />;
    }
  };

  const getLocationTypeLabel = (type: Location['type']) => {
    switch (type) {
      case 'airport':
        return 'Havalimanı';
      case 'hotel':
        return 'Otel';
      case 'landmark':
        return 'Önemli Yer';
      default:
        return 'İlçe';
    }
  };

  const filteredLocations = locations.filter(loc => loc.id !== excludeId);
  const groupedLocations = filteredLocations.reduce((groups, location) => {
    const type = location.type;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(location);
    return groups;
  }, {} as Record<string, Location[]>);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
    >
      <option value="">{placeholder}</option>
      {Object.entries(groupedLocations).map(([type, locs]) => (
        <optgroup key={type} label={getLocationTypeLabel(type as Location['type'])}>
          {locs.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
};

export default LocationSelect;