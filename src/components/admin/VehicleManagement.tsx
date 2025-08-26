import React, { useState } from 'react';
import { Plus, Edit, Trash2, Car, Users, Search } from 'lucide-react';
import { useAdminData, adminOperations } from '../../hooks/useAdminData';
import type { Database } from '../../lib/supabase';

type VehicleType = Database['public']['Tables']['vehicle_types']['Row'];

const VehicleManagement: React.FC = () => {
  const { data: vehicles = [], loading, error, refetch } = useAdminData('vehicle_types', {
    orderBy: { column: 'priority', ascending: true }
  });

  const [showModal, setShowModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    capacity: 4,
    description: '',
    image: '',
    features: [''],
    is_active: true,
    base_price: 0,
    priority: 1
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cleanFeatures = formData.features.filter(feature => feature.trim() !== '');
    let imageUrl = formData.image || 'https://images.pexels.com/photos/116675/pexels-photo-116675.jpeg?auto=compress&cs=tinysrgb&w=400';
    
    try {
      if (editingVehicle) {
        // Update existing vehicle
        const { error } = await adminOperations.update('vehicle_types', editingVehicle.id, {
          name: formData.name,
          capacity: formData.capacity,
          description: formData.description,
          image: imageUrl,
          features: cleanFeatures,
          is_active: formData.is_active,
          base_price: formData.base_price,
          priority: formData.priority,
          updated_at: new Date().toISOString()
        });

        if (error) throw error;
      } else {
        // Add new vehicle
        const { error } = await adminOperations.create('vehicle_types', {
          name: formData.name,
          capacity: formData.capacity,
          description: formData.description,
          image: imageUrl,
          features: cleanFeatures,
          is_active: formData.is_active,
          base_price: formData.base_price,
          priority: formData.priority
        });

        if (error) throw error;
      }

      refetch();
      resetForm();
    } catch (error) {
      console.error('Error saving vehicle:', error);
      alert('Araç tipi kaydedilirken bir hata oluştu.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      capacity: 4,
      description: '',
      image: '',
      features: [''],
      is_active: true,
      base_price: 0,
      priority: 1
    });
    setSelectedFile(null);
    setImagePreview('');
    setEditingVehicle(null);
    setShowModal(false);
  };

  const handleEdit = (vehicle: VehicleType) => {
    setEditingVehicle(vehicle);
    setFormData({
      name: vehicle.name,
      capacity: vehicle.capacity,
      description: vehicle.description,
      image: vehicle.image,
      features: [...vehicle.features, ''],
      is_active: vehicle.is_active,
      base_price: vehicle.base_price,
      priority: vehicle.priority
    });
    setSelectedFile(null);
    setImagePreview(vehicle.image);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu araç tipini silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await adminOperations.delete('vehicle_types', id);

        if (error) throw error;
        refetch();
      } catch (error) {
        console.error('Error deleting vehicle:', error);
        alert('Araç tipi silinirken bir hata oluştu.');
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const vehicle = vehicles.find(v => v.id === id);
      if (!vehicle) return;

      const { error } = await adminOperations.toggleStatus('vehicle_types', id, vehicle.is_active);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error updating vehicle status:', error);
      alert('Araç durumu güncellenirken bir hata oluştu.');
    }
  };

  const addFeature = () => {
    setFormData(prev => ({ ...prev, features: [...prev.features, ''] }));
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({ 
      ...prev, 
      features: prev.features.filter((_, i) => i !== index) 
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        // Set the base64 data as the image URL to be saved
        setFormData(prev => ({ ...prev, image: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedFile(null);
    setImagePreview('');
    setFormData(prev => ({ ...prev, image: '' }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Araç Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Araç tipleri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Araç Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <Car className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">Araç tipleri yüklenirken bir hata oluştu.</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Araç Yönetimi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Araç Tipi</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Araç ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div key={vehicle.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
            <div className="aspect-w-16 aspect-h-9">
              <img
                src={vehicle.image}
                alt={vehicle.name}
                className="w-full h-48 object-cover"
              />
            </div>
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900">{vehicle.name}</h3>
                <button
                  onClick={() => toggleStatus(vehicle.id)}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {vehicle.is_active ? 'Aktif' : 'Pasif'}
                </button>
              </div>
              
              <p className="text-gray-600 mb-3">{vehicle.description}</p>
              
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-1 text-sm text-gray-500">
                  <Users className="w-4 h-4" />
                  <span>{vehicle.capacity} kişi</span>
                </div>
                <div className="text-lg font-bold text-blue-600">
                  {vehicle.base_price} ₺
                </div>
              </div>
              
              <div className="space-y-1 mb-4">
                {vehicle.features.slice(0, 3).map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 text-xs text-gray-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
                {vehicle.features.length > 3 && (
                  <div className="text-xs text-gray-500">
                    +{vehicle.features.length - 3} özellik daha
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(vehicle)}
                  className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <Edit className="w-4 h-4" />
                  <span>Düzenle</span>
                </button>
                <button
                  onClick={() => handleDelete(vehicle.id)}
                  className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Sil</span>
                 </button>
               </div>
              </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingVehicle ? 'Araç Düzenle' : 'Yeni Araç Tipi'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Araç Adı
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kapasite
                  </label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                    min="1"
                    max="20"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Açıklama
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Araç Resmi
                </label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-3">
                    <img 
                      src={imagePreview} 
                      alt="Önizleme" 
                      className="w-full h-32 object-cover rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={clearImage}
                      className="mt-2 text-sm text-red-600 hover:text-red-800"
                    >
                      Resmi Kaldır
                    </button>
                  </div>
                )}
                
                {/* File Upload */}
                <div className="space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  
                  <div className="text-center text-gray-500 text-sm">veya</div>
                  
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, image: e.target.value }));
                      if (e.target.value) {
                        setSelectedFile(null);
                        setImagePreview(e.target.value);
                      }
                    }}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Temel Fiyat (₺)
                  </label>
                  <input
                    type="number"
                    value={formData.base_price}
                    onChange={(e) => setFormData(prev => ({ ...prev, base_price: parseFloat(e.target.value) }))}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Öncelik
                  </label>
                  <input
                    type="number"
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Özellikler
                </label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        placeholder="Özellik girin"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {formData.features.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeFeature(index)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Özellik Ekle</span>
                  </button>
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
                  {editingVehicle ? 'Güncelle' : 'Ekle'}
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

export default VehicleManagement;