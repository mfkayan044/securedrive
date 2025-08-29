import React, { useState } from 'react';
import { Plus, Edit, Trash2, Car, User, Phone, Mail, Search, Star, Clock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAdminData, adminOperations } from '../../hooks/useAdminData';
import type { Database } from '../../lib/supabase';

type DriverType = Database['public']['Tables']['drivers']['Row'];

const DriverManagement: React.FC = () => {
  const { data: drivers = [], loading, error, refetch } = useAdminData('drivers', {
    orderBy: { column: 'created_at', ascending: false }
  });
  const { data: vehicleTypes = [] } = useAdminData('vehicle_types', {
    filter: { is_active: true }
  });

  const [showModal, setShowModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState<DriverType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    licenseNumber: '',
    vehiclePlate: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    vehicleColor: '',
    workingHoursStart: '06:00',
    workingHoursEnd: '22:00',
    languages: [] as string[],
    isActive: true
  });

  const languageOptions = [
    { id: 'tr', name: 'Türkçe' },
    { id: 'en', name: 'İngilizce' },
    { id: 'ar', name: 'Arapça' },
    { id: 'de', name: 'Almanca' },
    { id: 'fr', name: 'Fransızca' }
  ];

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm) ||
    driver.vehicle_plate.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password validation for new drivers
    if (!editingDriver) {
    }

    try {
      if (editingDriver) {
        // Update existing driver
        const updateData: any = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          license_number: formData.licenseNumber,
          vehicle_plate: formData.vehiclePlate,
          vehicle_model: formData.vehicleModel,
          vehicle_year: formData.vehicleYear,
          vehicle_color: formData.vehicleColor,
          working_hours_start: formData.workingHoursStart,
          working_hours_end: formData.workingHoursEnd,
          languages: formData.languages,
          is_active: formData.isActive,
          updated_at: new Date().toISOString()
        };

        // Only update password if provided
        if (formData.password && formData.password === formData.confirmPassword) {
          // Update auth user password
          const { error: authError } = await supabase?.auth.admin.updateUserById(
            editingDriver.id,
            { password: formData.password }
          );
          if (authError) {
            console.error('Error updating auth password:', authError);
            // Continue with driver update even if password update fails
          }
        }

        const { error } = await adminOperations.update('drivers', editingDriver.id, updateData);

        if (error) throw error;
      } else {
        // Sadece drivers tablosuna yeni sürücü ekle
        const { error } = await adminOperations.create('drivers', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          license_number: formData.licenseNumber,
          vehicle_plate: formData.vehiclePlate,
          vehicle_model: formData.vehicleModel,
          vehicle_year: formData.vehicleYear,
          vehicle_color: formData.vehicleColor,
          working_hours_start: formData.workingHoursStart,
          working_hours_end: formData.workingHoursEnd,
          languages: formData.languages,
          is_active: formData.isActive,
          rating: 0,
          total_trips: 0
        });
        if (error) throw error;
      }

      // Refresh drivers list
      refetch();
      resetForm();
    } catch (error) {
      console.error('Error saving driver:', error);
      alert('Sürücü kaydedilirken bir hata oluştu.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      licenseNumber: '',
      vehiclePlate: '',
      vehicleModel: '',
      vehicleYear: new Date().getFullYear(),
      vehicleColor: '',
      workingHoursStart: '06:00',
      workingHoursEnd: '22:00',
      languages: [],
      isActive: true
    });
    setEditingDriver(null);
    setShowModal(false);
  };

  const handleEdit = (driver: DriverType) => {
    setEditingDriver(driver);
    setFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      licenseNumber: driver.license_number,
      vehiclePlate: driver.vehicle_plate,
      vehicleModel: driver.vehicle_model,
      vehicleYear: driver.vehicle_year,
      vehicleColor: driver.vehicle_color,
      workingHoursStart: driver.working_hours_start,
      workingHoursEnd: driver.working_hours_end,
      languages: driver.languages,
      isActive: driver.is_active
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bu sürücüyü silmek istediğinizden emin misiniz?')) {
      try {
        const { error } = await adminOperations.delete('drivers', id);
        if (error) throw error;
        refetch();
      } catch (error) {
        console.error('Error deleting driver:', error);
        alert('Sürücü silinirken bir hata oluştu.');
      }
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const driver = drivers.find(d => d.id === id);
      if (!driver) return;

      const { error } = await adminOperations.toggleStatus('drivers', id, driver.is_active);

      if (error) throw error;
      refetch();
    } catch (error) {
      console.error('Error updating driver status:', error);
      alert('Sürücü durumu güncellenirken bir hata oluştu.');
    }
  };

  const handleLanguageChange = (languageId: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(languageId)
        ? prev.languages.filter(id => id !== languageId)
        : [...prev.languages, languageId]
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Sürücü Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sürücüler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Sürücü Yönetimi</h1>
        </div>
        <div className="text-center py-8">
          <div className="text-red-600 mb-4">
            <Car className="w-12 h-12 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Veri Yükleme Hatası</h3>
          <p className="text-gray-600 mb-4">Sürücüler yüklenirken bir hata oluştu: {error}</p>
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
        <h1 className="text-3xl font-bold text-gray-900">Sürücü Yönetimi</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni Sürücü</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Sürücü ara (isim, email, telefon, plaka)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
        </div>
      </div>

      {/* Drivers Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Soyad</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefon</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-posta</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plaka</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Araç</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Puan</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Çalışma Saatleri</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Diller</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Durum</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">İşlemler</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredDrivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{driver.name}</td>
                <td className="px-4 py-2 text-gray-700">{driver.phone}</td>
                <td className="px-4 py-2 text-gray-700">{driver.email}</td>
                <td className="px-4 py-2 text-gray-700">{driver.vehicle_plate}</td>
                <td className="px-4 py-2 text-gray-700">{driver.vehicle_year} {driver.vehicle_model} - {driver.vehicle_color}</td>
                <td className="px-4 py-2 text-gray-700 flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>{driver.rating} ({driver.total_trips})</span>
                </td>
                <td className="px-4 py-2 text-gray-700">{driver.working_hours_start} - {driver.working_hours_end}</td>
                <td className="px-4 py-2 text-gray-700">
                  {driver.languages.map(langId => (
                    <span key={langId} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded mr-1">
                      {langId.toUpperCase()}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => toggleStatus(driver.id)}
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      driver.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {driver.is_active ? 'Aktif' : 'Pasif'}
                  </button>
                </td>
                <td className="px-4 py-2 flex space-x-2">
                  <button
                    onClick={() => handleEdit(driver)}
                    className="bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 text-xs font-semibold"
                  >
                    <Edit className="w-4 h-4 inline" /> Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(driver.id)}
                    className="bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 text-xs font-semibold"
                  >
                    <Trash2 className="w-4 h-4 inline" /> Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {editingDriver ? 'Sürücü Düzenle' : 'Yeni Sürücü'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ad Soyad
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    E-posta
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefon
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Plaka
                  </label>
                  <input
                    type="text"
                    value={formData.vehiclePlate}
                    onChange={(e) => setFormData(prev => ({ ...prev, vehiclePlate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Ehliyet No
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, licenseNumber: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>



              {/* Vehicle Info */}
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Araç Bilgileri</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Model
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleModel}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleModel: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Yıl
                    </label>
                    <input
                      type="number"
                      value={formData.vehicleYear}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleYear: parseInt(e.target.value) }))}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Renk
                    </label>
                    <input
                      type="text"
                      value={formData.vehicleColor}
                      onChange={(e) => setFormData(prev => ({ ...prev, vehicleColor: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Başlangıç Saati
                  </label>
                  <input
                    type="time"
                    value={formData.workingHoursStart}
                    onChange={(e) => setFormData(prev => ({ ...prev, workingHoursStart: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bitiş Saati
                  </label>
                  <input
                    type="time"
                    value={formData.workingHoursEnd}
                    onChange={(e) => setFormData(prev => ({ ...prev, workingHoursEnd: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
              </div>

              {/* Languages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Diller
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {languageOptions.map(option => (
                    <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.languages.includes(option.id)}
                        onChange={() => handleLanguageChange(option.id)}
                        className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                      <span className="text-sm">{option.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 text-sm text-gray-700">
                  Aktif
                </label>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200"
                >
                  {editingDriver ? 'Güncelle' : 'Ekle'}
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

export default DriverManagement;