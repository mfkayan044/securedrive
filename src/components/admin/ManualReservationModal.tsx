import React, { useState } from 'react';
import ReservationForm from '../ReservationForm';

const ManualReservationModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 py-12">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl w-full relative mx-auto">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ×
        </button>
        <h2 className="text-xl font-bold mb-4 text-center">Manuel Rezervasyon Ekle</h2>
        <ReservationForm onSuccess={onClose} forceEmptyCustomer />
      </div>
    </div>
  );
};

export default ManualReservationModal;
