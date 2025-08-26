import React, { useState } from 'react';
import { Plus, Edit, Trash2, Search, Baby, Users, Luggage, UserCheck, Clock, Wifi } from 'lucide-react';
import { useAdminData, adminOperations } from '../../hooks/useAdminData';
import type { Database } from '../../lib/supabase';

type ExtraServiceType = Database['public']['Tables']['extra_services']['Row'];

const ExtraServiceManagement: React.FC = () => {
  const { data: services = [], loading, error, refetch } = useAdminData('extra_services', {
    orderBy: { column: 'priority', ascending: true }
  });

  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState<ExtraServiceType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    icon: 'baby',
    is_active: true,
    category: 'safety' as 'safety' | 'comfort' | 'service' | 'accessibility',
    priority: 1
  });

  const iconOptions = [
    { value: 'baby', label: 'Bebek', icon: Baby },
    { value: 'child', label: 'Çocuk', icon: Users },
    { value: 'luggage', label: 'Bagaj', icon: Luggage },
    { value: 'user-check', label: 'Karşılama', icon: UserCheck },
    { value: 'clock', label: 'Zaman', icon: Clock },
    { value: 'wifi', label: 'Wi-Fi', icon: Wifi }
  ];

  const categoryOptions = [
    { value: 'safety', label: 'Güvenlik' },
    { value: 'comfort', label: 'Konfor' },
    { value: 'service', label: 'Hizmet' },
    { value: 'accessibility', label: 'Erişilebilirlik' }
  ];

  const getIcon = (iconName: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconName);
    const IconComponent = iconOption?.icon || Baby;
    return <IconComponent className="w-4 h-4" />;
  };

  const getCategoryLabel = (category: 'safety' | 'comfort' | 'service' | 'accessibility') => {
    return categoryOptions.find(opt => opt.value === category)?.label || category;
  };

  const filteredServices = services.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || service.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingService) {
        // Update existing service
        const { error } = await adminOperations.update('extra_services', editingService.id, {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          icon: formData.icon,
          is_active: formData.is_active,
          category: formData.category,
          priority: formData.priority,
          updated_at: new Date().toISOString()
        });

        if (error) {
          alert(error.message);
          return;
        }
      } else {
        // Add new service
        const { error } = await adminOperations.create('extra_services', {
          name: formData.name,
          description: formData.description,
          price: formData.price,
          icon: formData.icon,
          is_active: formData.is_active,
          category: formData.category,
          priority: formData.priority
        });

        if (error) {
          alert(error.message);
          return;
        }
      }

      refetch();
      resetForm();
    } catch (error) {
      console.error('Error saving service:', error);
      const errorMessage = error instanceof Error ? error.message : 'Ek hizmet kaydedilirken bir hata oluştu.';
      alert(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      icon: 'baby',
      is_active: true,
      category: 'safety',
      priority: 1
    });
    setEditingService(null);
    setShowModal(false);
  };

  const handleEdit = (service: ExtraServiceType) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      icon: service.icon,
      is_active: service.is_active,
      category: service.category,
      priority: service.priority
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu ek hizmeti silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await adminOperations.delete('extra_services', id);

        if (error) throw error;
        refetch();
      } catch (error) {
        console.error('Error deleting service:', error);
        alert('Ek hizmet silinirken bir hata oluştu.');
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const service = services.find(s => s.id === id);
      if (!service) return;

      const { error } = await adminOperations.toggleStatus('extra_services', id, service.is_active);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error updating service status:', error);
      alert('Hizmet durumu güncellenirken bir hata oluştu.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Ek Hizmet Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Ek hizmetler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Ek Hizmet Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <Plus className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">Ek hizmetler yüklenirken bir hata oluştu.</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Ek Hizmet Yönetimi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Ek Hizmet</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Hizmet ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">Tüm Kategoriler</option>
            {categoryOptions.map(category => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map((service) => (
          <div key={service.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  {getIcon(service.icon)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    {getCategoryLabel(service.category)}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => toggleStatus(service.id)}
                className={`px-2 py-1 rounded-full text-xs font-medium ${
                  service.is_active
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {service.is_active ? 'Aktif' : 'Pasif'}
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-4">{service.description}</p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-bold text-blue-600">
                +{service.price} ₺
              </div>
              <div className="text-sm text-gray-500">
                Öncelik: {service.priority}
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(service)}
                className="flex-1 bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <Edit className="w-4 h-4" />
                <span>Düzenle</span>
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="flex-1 bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors duration-200 flex items-center justify-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sil</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingService ? 'Ek Hizmet Düzenle' : 'Yeni Ek Hizmet'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hizmet Adı
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

              <div className="grid grid-cols-2 gap-4">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  İkon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {iconOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {categoryOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
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
                  {editingService ? 'Güncelle' : 'Ekle'}
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

export default ExtraServiceManagement;