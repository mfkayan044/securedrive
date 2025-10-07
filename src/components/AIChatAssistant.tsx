import React, { useState } from 'react';

interface AIChatAssistantProps {
  onReservationExtracted: (data: any) => void;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ onReservationExtracted }) => {
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Merhaba! Transfer rezervasyonunuzu kolayca oluşturmak için bana tarih, saat, güzergah, araç tipi ve ek hizmetleri yazabilirsiniz.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { role: 'user', content: input }];
    setMessages(newMessages);
    setLoading(true);
    setInput('');
    try {
      const res = await fetch('/api/aiReservationParser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      });
      const data = await res.json();
      if (data.reservation) {
        onReservationExtracted(data.reservation);
        setMessages([...newMessages, { role: 'assistant', content: data.message || 'Rezervasyon bilgilerinizi aşağıda özetledim.' }]);
      } else {
        setMessages([...newMessages, { role: 'assistant', content: data.message || 'Bilgileri anlamadım, lütfen tekrar deneyin.' }]);
      }
    } catch (e) {
      setMessages([...newMessages, { role: 'assistant', content: 'Bir hata oluştu, lütfen tekrar deneyin.' }]);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
      <div className="bg-red-600 text-white px-4 py-2 rounded-t-xl font-bold">AI Transfer Asistanı</div>
      <div className="flex-1 p-3 overflow-y-auto max-h-96 space-y-2">
        {messages.filter(m => m.role !== 'system').map((msg, i) => (
          <div key={i} className={`text-sm p-2 rounded-lg ${msg.role === 'user' ? 'bg-gray-100 text-right ml-8' : 'bg-red-50 text-left mr-8'}`}>{msg.content}</div>
        ))}
        {loading && <div className="text-xs text-gray-400">Yanıt bekleniyor...</div>}
      </div>
      <div className="flex border-t">
        <input
          className="flex-1 px-3 py-2 outline-none rounded-bl-xl"
          placeholder="Transfer isteğinizi yazın..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          disabled={loading}
        />
        <button className="bg-red-600 text-white px-4 py-2 rounded-br-xl font-semibold" onClick={sendMessage} disabled={loading || !input.trim()}>
          Gönder
        </button>
      </div>
    </div>
  );
};

export default AIChatAssistant;
