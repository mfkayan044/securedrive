import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

const AdminSimpleReservationModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [form, setForm] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const { data, error } = await supabase.from('reservations').insert({
        customer_name: form.customerName,
        customer_email: form.customerEmail,
        customer_phone: form.customerPhone,
        notes: form.notes,
        status: 'pending',
        payment_status: 'unpaid',
      }).select();
      if (error) throw error;
      // Admin'e mail gönder
      const reservation = Array.isArray(data) ? data[0] : data;
      await fetch('/api/notifyAdminOnReservation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation: {
            ...reservation,
            from_location_name: '', // Gerekirse lokasyon adını ekle
            to_location_name: '',
          }
        }),
      });
      setSuccess(true);
      setForm({ customerName: '', customerEmail: '', customerPhone: '', notes: '' });
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full relative mx-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Ödemesiz Rezervasyon Ekle</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Ad Soyad</label>
            <input
              type="text"
              name="customerName"
              value={form.customerName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">E-posta</label>
            <input
              type="email"
              name="customerEmail"
              value={form.customerEmail}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Telefon</label>
            <input
              type="tel"
              name="customerPhone"
              value={form.customerPhone}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Notlar</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
              rows={2}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Kaydediliyor...' : 'Rezervasyon Oluştur'}
          </button>
          {success && <div className="text-green-600 text-center font-semibold">Rezervasyon kaydedildi!</div>}
          {error && <div className="text-red-600 text-center font-semibold">{error}</div>}
        </form>
      </div>
    </div>
  );
};

export default AdminSimpleReservationModal;
