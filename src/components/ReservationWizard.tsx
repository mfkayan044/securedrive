import React, { useState } from 'react';

interface ReservationData {
  fromLocation: string;
  toLocation: string;
  tripType: 'one-way' | 'round-trip';
  departureDate: string;
  departureTime: string;
  returnDate?: string;
  returnTime?: string;
  vehicleType: 'Ekonomi VIP Class' | 'Bus VIP Class';
  passengers: number;
  passengerNames: string[];
  extraServices: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

const initialData: Partial<ReservationData> = {};

const steps = [
  'fromLocation',
  'toLocation',
  'tripType',
  'departureDate',
  'departureTime',
  'returnDate',
  'returnTime',
  'vehicleType',
  'passengers',
  'passengerNames',
  'extraServices',
  'customerName',
  'customerEmail',
  'customerPhone',
  'notes',
];

const labels: Record<string, string> = {
  fromLocation: 'Nereden (şehir, ilçe, havalimanı, otel, vb.)?',
  toLocation: 'Nereye (şehir, ilçe, havalimanı, otel, vb.)?',
  tripType: 'Transfer tipi',
  departureDate: 'Gidiş tarihi',
  departureTime: 'Gidiş saati',
  returnDate: 'Dönüş tarihi (varsa)',
  returnTime: 'Dönüş saati (varsa)',
  vehicleType: 'Araç tipi',
  passengers: 'Kaç kişi?',
  passengerNames: 'Yolcu ad-soyadları',
  extraServices: 'Ek hizmetler (isteğe bağlı)',
  customerName: 'Rezervasyon sahibi adı',
  customerEmail: 'E-posta',
  customerPhone: 'Telefon',
  notes: 'Not (isteğe bağlı)',
};

const vehicleTypes = ['Ekonomi VIP Class', 'Bus VIP Class'];
const extraServicesList = ['Bebek Koltuğu', 'Ek Bagaj', 'Karşılama Hizmeti'];

const ReservationWizard: React.FC<{ onComplete: (data: ReservationData) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<ReservationData>>(initialData);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const currentKey = steps[step];

  const handleNext = () => {
    setError('');
    if (currentKey === 'vehicleType' && !vehicleTypes.includes(input)) {
      setError('Lütfen geçerli bir araç tipi seçin.');
      return;
    }
    if (currentKey === 'passengers' && (isNaN(Number(input)) || Number(input) < 1)) {
      setError('Kişi sayısı en az 1 olmalı.');
      return;
    }
    if (currentKey === 'passengerNames') {
      const names = input.split(',').map(s => s.trim()).filter(Boolean);
      if (names.length !== Number(data.passengers)) {
        setError('Tüm yolcu adlarını virgül ile ayırarak girin.');
        return;
      }
      setData({ ...data, passengerNames: names });
      setInput('');
      setStep(step + 1);
      return;
    }
    if (currentKey === 'extraServices') {
      const selected = input.split(',').map(s => s.trim()).filter(Boolean);
      setData({ ...data, extraServices: selected });
      setInput('');
      setStep(step + 1);
      return;
    }
    setData({ ...data, [currentKey]: input });
    setInput('');
    setStep(step + 1);
  };

  const handleFinish = () => {
    onComplete(data as ReservationData);
  };

  if (step >= steps.length) {
    return (
      <div className="p-4">
        <h2 className="font-bold mb-2">Rezervasyon Özeti</h2>
        <pre className="bg-gray-100 p-2 rounded text-xs mb-2">{JSON.stringify(data, null, 2)}</pre>
        <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleFinish}>Onayla</button>
      </div>
    );
  }

  return (
    <div className="p-4 w-96 bg-white rounded-xl shadow-xl border">
      <div className="mb-2 font-semibold">{labels[currentKey]}</div>
      {currentKey === 'vehicleType' && (
        <div className="mb-2 flex gap-2">
          {vehicleTypes.map(type => (
            <button key={type} className={`px-2 py-1 rounded border ${input === type ? 'bg-red-600 text-white' : 'bg-gray-100'}`} onClick={() => setInput(type)}>{type}</button>
          ))}
        </div>
      )}
      {currentKey === 'extraServices' && (
        <div className="mb-2 flex gap-2 flex-wrap">
          {extraServicesList.map(service => (
            <button key={service} className={`px-2 py-1 rounded border ${input.includes(service) ? 'bg-red-600 text-white' : 'bg-gray-100'}`} onClick={() => setInput(input.includes(service) ? input.replace(service, '').replace(',,', ',').replace(/^,|,$/g, '') : (input ? input + ', ' + service : service))}>{service}</button>
          ))}
        </div>
      )}
      {currentKey !== 'vehicleType' && currentKey !== 'extraServices' && (
        <input
          className="w-full px-3 py-2 border rounded mb-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={labels[currentKey]}
        />
      )}
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleNext} disabled={!input && currentKey !== 'notes'}>
        {step === steps.length - 1 ? 'Bitir' : 'İleri'}
      </button>
    </div>
  );
};

export default ReservationWizard;import React, { useState } from 'react';

interface ReservationData {
  fromLocation: string;
  toLocation: string;
  tripType: 'one-way' | 'round-trip';
  departureDate: string;
  departureTime: string;
  returnDate?: string;
  returnTime?: string;
  vehicleType: 'Ekonomi VIP Class' | 'Bus VIP Class';
  passengers: number;
  passengerNames: string[];
  extraServices: string[];
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes: string;
}

const initialData: Partial<ReservationData> = {};

const steps = [
  'fromLocation',
  'toLocation',
  'tripType',
  'departureDate',
  'departureTime',
  'returnDate',
  'returnTime',
  'vehicleType',
  'passengers',
  'passengerNames',
  'extraServices',
  'customerName',
  'customerEmail',
  'customerPhone',
  'notes',
];

const labels: Record<string, string> = {
  fromLocation: 'Nereden (şehir, ilçe, havalimanı, otel, vb.)?',
  toLocation: 'Nereye (şehir, ilçe, havalimanı, otel, vb.)?',
  tripType: 'Transfer tipi',
  departureDate: 'Gidiş tarihi',
  departureTime: 'Gidiş saati',
  returnDate: 'Dönüş tarihi (varsa)',
  returnTime: 'Dönüş saati (varsa)',
  vehicleType: 'Araç tipi',
  passengers: 'Kaç kişi?',
  passengerNames: 'Yolcu ad-soyadları',
  extraServices: 'Ek hizmetler (isteğe bağlı)',
  customerName: 'Rezervasyon sahibi adı',
  customerEmail: 'E-posta',
  customerPhone: 'Telefon',
  notes: 'Not (isteğe bağlı)',
};

const vehicleTypes = ['Ekonomi VIP Class', 'Bus VIP Class'];
const extraServicesList = ['Bebek Koltuğu', 'Ek Bagaj', 'Karşılama Hizmeti'];

const ReservationWizard: React.FC<{ onComplete: (data: ReservationData) => void }> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<Partial<ReservationData>>(initialData);
  const [input, setInput] = useState('');
  const [error, setError] = useState('');

  const currentKey = steps[step];

  const handleNext = () => {
    setError('');
    if (currentKey === 'vehicleType' && !vehicleTypes.includes(input)) {
      setError('Lütfen geçerli bir araç tipi seçin.');
      return;
    }
    if (currentKey === 'passengers' && (isNaN(Number(input)) || Number(input) < 1)) {
      setError('Kişi sayısı en az 1 olmalı.');
      return;
    }
    if (currentKey === 'passengerNames') {
      const names = input.split(',').map(s => s.trim()).filter(Boolean);
      if (names.length !== Number(data.passengers)) {
        setError('Tüm yolcu adlarını virgül ile ayırarak girin.');
        return;
      }
      setData({ ...data, passengerNames: names });
      setInput('');
      setStep(step + 1);
      return;
    }
    if (currentKey === 'extraServices') {
      const selected = input.split(',').map(s => s.trim()).filter(Boolean);
      setData({ ...data, extraServices: selected });
      setInput('');
      setStep(step + 1);
      return;
    }
    setData({ ...data, [currentKey]: input });
    setInput('');
    setStep(step + 1);
  };

  const handleFinish = () => {
    onComplete(data as ReservationData);
  };

  if (step >= steps.length) {
    return (
      <div className="p-4">
        <h2 className="font-bold mb-2">Rezervasyon Özeti</h2>
        <pre className="bg-gray-100 p-2 rounded text-xs mb-2">{JSON.stringify(data, null, 2)}</pre>
        <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleFinish}>Onayla</button>
      </div>
    );
  }

  return (
    <div className="p-4 w-96 bg-white rounded-xl shadow-xl border">
      <div className="mb-2 font-semibold">{labels[currentKey]}</div>
      {currentKey === 'vehicleType' && (
        <div className="mb-2 flex gap-2">
          {vehicleTypes.map(type => (
            <button key={type} className={`px-2 py-1 rounded border ${input === type ? 'bg-red-600 text-white' : 'bg-gray-100'}`} onClick={() => setInput(type)}>{type}</button>
          ))}
        </div>
      )}
      {currentKey === 'extraServices' && (
        <div className="mb-2 flex gap-2 flex-wrap">
          {extraServicesList.map(service => (
            <button key={service} className={`px-2 py-1 rounded border ${input.includes(service) ? 'bg-red-600 text-white' : 'bg-gray-100'}`} onClick={() => setInput(input.includes(service) ? input.replace(service, '').replace(',,', ',').replace(/^,|,$/g, '') : (input ? input + ', ' + service : service))}>{service}</button>
          ))}
        </div>
      )}
      {currentKey !== 'vehicleType' && currentKey !== 'extraServices' && (
        <input
          className="w-full px-3 py-2 border rounded mb-2"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={labels[currentKey]}
        />
      )}
      {error && <div className="text-red-600 text-xs mb-2">{error}</div>}
      <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={handleNext} disabled={!input && currentKey !== 'notes'}>
        {step === steps.length - 1 ? 'Bitir' : 'İleri'}
      </button>
    </div>
  );
};

export default ReservationWizard;
