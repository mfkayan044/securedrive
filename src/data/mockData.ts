import { Location, VehicleType, ExtraService, PriceRule } from '../types';
import { useSupabaseData } from '../hooks/useSupabaseData';

// Keep mock data as fallback, but prefer Supabase data
export const mockLocations: Location[] = [
  // Havalimanları
  { id: 'ist', name: 'İstanbul Havalimanı (IST)', type: 'airport' },
  { id: 'saw', name: 'Sabiha Gökçen Havalimanı (SAW)', type: 'airport' },
  
  // Ana İlçeler
  { id: 'taksim', name: 'Taksim', type: 'district' },
  { id: 'sultanahmet', name: 'Sultanahmet', type: 'district' },
  { id: 'besiktas', name: 'Beşiktaş', type: 'district' },
  { id: 'kadikoy', name: 'Kadıköy', type: 'district' },
  { id: 'uskudar', name: 'Üsküdar', type: 'district' },
  { id: 'sisli', name: 'Şişli', type: 'district' },
  { id: 'beyoglu', name: 'Beyoğlu', type: 'district' },
  { id: 'fatih', name: 'Fatih', type: 'district' },
  { id: 'bakirkoy', name: 'Bakırköy', type: 'district' },
  { id: 'maltepe', name: 'Maltepe', type: 'district' },
  { id: 'pendik', name: 'Pendik', type: 'district' },
  { id: 'kartal', name: 'Kartal', type: 'district' },
  
  // Önemli Oteller
  { id: 'cvk-taksim', name: 'CVK Park Bosphorus Hotel Taksim', type: 'hotel' },
  { id: 'hilton-bosphorus', name: 'Hilton Istanbul Bosphorus', type: 'hotel' },
  { id: 'four-seasons', name: 'Four Seasons Hotel Sultanahmet', type: 'hotel' },
  { id: 'ritz-carlton', name: 'The Ritz-Carlton Istanbul', type: 'hotel' },
  
  // Önemli Yerler
  { id: 'galata-tower', name: 'Galata Kulesi', type: 'landmark' },
  { id: 'blue-mosque', name: 'Sultan Ahmet Camii', type: 'landmark' },
  { id: 'hagia-sophia', name: 'Ayasofya', type: 'landmark' },
  { id: 'grand-bazaar', name: 'Kapalıçarşı', type: 'landmark' },
  { id: 'bosphorus-bridge', name: 'Boğaziçi Köprüsü', type: 'landmark' }
];

export const mockVehicleTypes: VehicleType[] = [
  {
    id: 'economy',
    name: 'Ekonomi',
    capacity: 4,
    description: 'Konforlu ve ekonomik seçenek',
    image: 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Klima', 'Bagaj Alanı', 'Güvenli Sürüş']
  },
  {
    id: 'comfort',
    name: 'Comfort',
    capacity: 4,
    description: 'Daha konforlu yolculuk deneyimi',
    image: 'https://images.pexels.com/photos/3802510/pexels-photo-3802510.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Premium İç Mekan', 'Klima', 'USB Şarj', 'Su İkramı']
  },
  {
    id: 'vip',
    name: 'VIP',
    capacity: 3,
    description: 'Lüks ve prestijli transfer hizmeti',
    image: 'https://images.pexels.com/photos/1592384/pexels-photo-1592384.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Lüks İç Mekan', 'Deri Koltuklar', 'İkram Servisi', 'Wi-Fi', 'Gazete/Dergi']
  },
  {
    id: 'minibus',
    name: 'Minibüs',
    capacity: 8,
    description: 'Grup transferleri için ideal',
    image: 'https://images.pexels.com/photos/1319838/pexels-photo-1319838.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Geniş Alan', 'Fazla Bagaj Kapasitesi', 'Klima', 'Grup İndirimi']
  },
  {
    id: 'accessible',
    name: 'Engelli Dostu',
    capacity: 3,
    description: 'Engelli yolcular için özel donanımlı araç',
    image: 'https://images.pexels.com/photos/7144176/pexels-photo-7144176.jpeg?auto=compress&cs=tinysrgb&w=400',
    features: ['Rampa', 'Tekerlekli Sandalye Alanı', 'Özel Emniyet Kemeri', 'Yardımcı Ekipman']
  }
];

export const mockExtraServices: ExtraService[] = [
  {
    id: 'baby-seat',
    name: 'Bebek Koltuğu',
    price: 25,
    description: '0-4 yaş arası bebekler için güvenli koltuk',
    icon: 'baby'
  },
  {
    id: 'child-seat',
    name: 'Çocuk Koltuğu',
    price: 20,
    description: '4-12 yaş arası çocuklar için güvenli koltuk',
    icon: 'child'
  },
  {
    id: 'extra-luggage',
    name: 'Ekstra Bagaj',
    price: 15,
    description: 'Fazla bagaj için ek alan',
    icon: 'luggage'
  },
  {
    id: 'meet-greet',
    name: 'Karşılama Servisi',
    price: 30,
    description: 'Havalimanında isim tabelası ile karşılama',
    icon: 'user-check'
  },
  {
    id: 'wait-time',
    name: 'Bekleme Süresi (+30dk)',
    price: 40,
    description: 'Standart bekleme süresine ek 30 dakika',
    icon: 'clock'
  },
  {
    id: 'wifi',
    name: 'Wi-Fi',
    price: 10,
    description: 'Yolculuk boyunca ücretsiz internet',
    icon: 'wifi'
  }
];

// Fiyat tablosu - İstanbul Havalimanı bazlı
export const mockPriceRules: PriceRule[] = [
  // İstanbul Havalimanı -> Şehir Merkezi
  { id: '1', fromLocationId: 'ist', toLocationId: 'taksim', vehicleTypeId: 'economy', price: 180 },
  { id: '2', fromLocationId: 'ist', toLocationId: 'taksim', vehicleTypeId: 'comfort', price: 250 },
  { id: '3', fromLocationId: 'ist', toLocationId: 'taksim', vehicleTypeId: 'vip', price: 400 },
  { id: '4', fromLocationId: 'ist', toLocationId: 'taksim', vehicleTypeId: 'minibus', price: 320 },
  { id: '5', fromLocationId: 'ist', toLocationId: 'taksim', vehicleTypeId: 'accessible', price: 280 },

  { id: '6', fromLocationId: 'ist', toLocationId: 'sultanahmet', vehicleTypeId: 'economy', price: 200 },
  { id: '7', fromLocationId: 'ist', toLocationId: 'sultanahmet', vehicleTypeId: 'comfort', price: 280 },
  { id: '8', fromLocationId: 'ist', toLocationId: 'sultanahmet', vehicleTypeId: 'vip', price: 450 },
  { id: '9', fromLocationId: 'ist', toLocationId: 'sultanahmet', vehicleTypeId: 'minibus', price: 350 },
  { id: '10', fromLocationId: 'ist', toLocationId: 'sultanahmet', vehicleTypeId: 'accessible', price: 320 },

  { id: '11', fromLocationId: 'ist', toLocationId: 'besiktas', vehicleTypeId: 'economy', price: 190 },
  { id: '12', fromLocationId: 'ist', toLocationId: 'besiktas', vehicleTypeId: 'comfort', price: 260 },
  { id: '13', fromLocationId: 'ist', toLocationId: 'besiktas', vehicleTypeId: 'vip', price: 420 },
  { id: '14', fromLocationId: 'ist', toLocationId: 'besiktas', vehicleTypeId: 'minibus', price: 330 },
  { id: '15', fromLocationId: 'ist', toLocationId: 'besiktas', vehicleTypeId: 'accessible', price: 300 },

  // Sabiha Gökçen -> Şehir Merkezi
  { id: '16', fromLocationId: 'saw', toLocationId: 'taksim', vehicleTypeId: 'economy', price: 220 },
  { id: '17', fromLocationId: 'saw', toLocationId: 'taksim', vehicleTypeId: 'comfort', price: 300 },
  { id: '18', fromLocationId: 'saw', toLocationId: 'taksim', vehicleTypeId: 'vip', price: 480 },
  { id: '19', fromLocationId: 'saw', toLocationId: 'taksim', vehicleTypeId: 'minibus', price: 380 },
  { id: '20', fromLocationId: 'saw', toLocationId: 'taksim', vehicleTypeId: 'accessible', price: 350 },

  { id: '21', fromLocationId: 'saw', toLocationId: 'kadikoy', vehicleTypeId: 'economy', price: 150 },
  { id: '22', fromLocationId: 'saw', toLocationId: 'kadikoy', vehicleTypeId: 'comfort', price: 200 },
  { id: '23', fromLocationId: 'saw', toLocationId: 'kadikoy', vehicleTypeId: 'vip', price: 320 },
  { id: '24', fromLocationId: 'saw', toLocationId: 'kadikoy', vehicleTypeId: 'minibus', price: 250 },
  { id: '25', fromLocationId: 'saw', toLocationId: 'kadikoy', vehicleTypeId: 'accessible', price: 230 },

  // Ters yön fiyatları (aynı fiyatlar)
  { id: '26', fromLocationId: 'taksim', toLocationId: 'ist', vehicleTypeId: 'economy', price: 180 },
  { id: '27', fromLocationId: 'taksim', toLocationId: 'ist', vehicleTypeId: 'comfort', price: 250 },
  { id: '28', fromLocationId: 'taksim', toLocationId: 'ist', vehicleTypeId: 'vip', price: 400 },
  { id: '29', fromLocationId: 'taksim', toLocationId: 'ist', vehicleTypeId: 'minibus', price: 320 },
  { id: '30', fromLocationId: 'taksim', toLocationId: 'ist', vehicleTypeId: 'accessible', price: 280 },
];

// Export functions that use Supabase data with fallback to mock data
export const locations = mockLocations;
export const vehicleTypes = mockVehicleTypes;
export const extraServices = mockExtraServices;
export const priceRules = mockPriceRules;