import React, { useState } from 'react';
import { Plus, Edit, Trash2, DollarSign, Search, ArrowRight } from 'lucide-react';
import { useAdminData, adminOperations } from '../../hooks/useAdminData';
import type { Database } from '../../lib/supabase';

type PriceType = Database['public']['Tables']['price_rules']['Row'];

const PricingManagement: React.FC = () => {
  const { data: prices = [], loading: pricesLoading, error: pricesError, refetch } = useAdminData('price_rules', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: locations = [] } = useAdminData('locations', {
    filter: { is_active: true },
    orderBy: { column: 'priority', ascending: true }
  });
  const { data: vehicleTypes = [] } = useAdminData('vehicle_types', {
    filter: { is_active: true },
    orderBy: { column: 'priority', ascending: true }
  });

  const [showModal, setShowModal] = useState(false);
  const [editingPrice, setEditingPrice] = useState<PriceType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    from_location_id: '',
    to_location_id: '',
    vehicle_type_id: '',
    price: 0,
    is_active: true,
    valid_from: new Date().toISOString().split('T')[0],
    valid_to: ''
  });

  const getLocationName = (id: string) => {
    return locations.find(loc => loc.id === id)?.name || 'Bilinmeyen';
  };

  const getVehicleName = (id: string) => {
    return vehicleTypes.find(vehicle => vehicle.id === id)?.name || 'Bilinmeyen';
  };

  const filteredPrices = prices.filter(price => {
    const fromLocation = getLocationName(price.from_location_id).toLowerCase();
    const toLocation = getLocationName(price.to_location_id).toLowerCase();
    const vehicleName = getVehicleName(price.vehicle_type_id).toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fromLocation.includes(searchLower) || 
           toLocation.includes(searchLower) || 
           vehicleName.includes(searchLower);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPrice) {
        // Update existing price
        const { error } = await adminOperations.update('price_rules', editingPrice.id, {
          from_location_id: formData.from_location_id,
          to_location_id: formData.to_location_id,
          vehicle_type_id: formData.vehicle_type_id,
          price: formData.price,
          is_active: formData.is_active,
          valid_from: formData.valid_from,
          valid_to: formData.valid_to || null,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
      } else {
        // Add new price
        const { error } = await adminOperations.create('price_rules', {
          from_location_id: formData.from_location_id,
          to_location_id: formData.to_location_id,
          vehicle_type_id: formData.vehicle_type_id,
          price: formData.price,
          is_active: formData.is_active,
          valid_from: formData.valid_from,
          valid_to: formData.valid_to || null
        });

        if (error) throw error;
      }

      refetch();
      resetForm();
    } catch (error) {
      console.error('Error saving price:', error);
      alert('Fiyat kaydedilirken bir hata oluştu.');
    }
  };

  const resetForm = () => {
    setFormData({
      from_location_id: '',
      to_location_id: '',
      vehicle_type_id: '',
      price: 0,
      is_active: true,
      valid_from: new Date().toISOString().split('T')[0],
      valid_to: ''
    });
    setEditingPrice(null);
    setShowModal(false);
  };

  const handleEdit = (price: PriceType) => {
    setEditingPrice(price);
    setFormData({
      from_location_id: price.from_location_id,
      to_location_id: price.to_location_id,
      vehicle_type_id: price.vehicle_type_id,
      price: price.price,
      is_active: price.is_active,
      valid_from: price.valid_from,
      valid_to: price.valid_to || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu fiyatı silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await adminOperations.delete('price_rules', id);

        if (error) throw error;
        refetch();
      } catch (error) {
        console.error('Error deleting price:', error);
        alert('Fiyat silinirken bir hata oluştu.');
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const price = prices.find(p => p.id === id);
      if (!price) return;

      const { error } = await adminOperations.toggleStatus('price_rules', id, price.is_active);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error updating price status:', error);
      alert('Fiyat durumu güncellenirken bir hata oluştu.');
    }
  };

  if (pricesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Fiyat Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Fiyatlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (pricesError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Fiyat Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <DollarSign className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">Fiyatlar yüklenirken bir hata oluştu.</p>
          <button
            onClick={refetch}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Fiyat Yönetimi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Fiyat</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Lokasyon veya araç ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Prices Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Güzergah
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Araç Tipi
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fiyat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Geçerlilik
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPrices.map((price) => (
                <tr key={price.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">
                        {getLocationName(price.from_location_id)}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {getLocationName(price.to_location_id)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {getVehicleName(price.vehicle_type_id)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-bold text-gray-900">
                        {price.price} ₺
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(price.valid_from).toLocaleDateString('tr-TR')}
                      {price.valid_to && (
                        <span> - {new Date(price.valid_to).toLocaleDateString('tr-TR')}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleStatus(price.id)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        price.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {price.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleEdit(price)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(price.id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingPrice ? 'Fiyat Düzenle' : 'Yeni Fiyat'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nereden
                </label>
                <select
                  value={formData.from_location_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, from_location_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Lokasyon seçin</option>
                  {locations.map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nereye
                </label>
                <select
                  value={formData.to_location_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, to_location_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Lokasyon seçin</option>
                  {locations.filter(loc => loc.id !== formData.from_location_id).map(location => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Araç Tipi
                </label>
                <select
                  value={formData.vehicle_type_id}
                  onChange={(e) => setFormData(prev => ({ ...prev, vehicle_type_id: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Araç tipi seçin</option>
                  {vehicleTypes.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fiyat (₺)
                </label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geçerli Başlangıç
                  </label>
                  <input
                    type="date"
                    value={formData.valid_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Geçerli Bitiş (Opsiyonel)
                  </label>
                  <input
                    type="date"
                    value={formData.valid_to}
                    onChange={(e) => setFormData(prev => ({ ...prev, valid_to: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.is_active}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200"
                >
                  {editingPrice ? 'Güncelle' : 'Ekle'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200"
                >
                  İptal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingManagement;