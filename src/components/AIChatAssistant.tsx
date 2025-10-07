import React, { useState } from 'react';

interface AIChatAssistantProps {
  onReservationExtracted: (data: any) => void;
  open?: boolean;
  onClose?: () => void;
}

const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ onReservationExtracted, open = true, onClose }) => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Merhaba! Transfer rezervasyonu için size yardımcı olacağım. Öncelikle, nereden nereye gitmek istiyorsunuz?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(open);

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
      let data;
      try {
        data = await res.json();
      } catch {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: 'AI yanıtı geçerli JSON formatında değil. Lütfen tekrar deneyin.' }
        ]);
        setLoading(false);
        return;
      }
      if (typeof data === 'object' && (data.reservation || data.message)) {
        if (data.reservation) {
          onReservationExtracted(data.reservation);
          setMessages([
            ...newMessages,
            { role: 'assistant', content: data.message || 'Rezervasyon bilgilerinizi aşağıda özetledim.' }
          ]);
        } else if (data.message) {
          setMessages([
            ...newMessages,
            { role: 'assistant', content: data.message }
          ]);
        }
      } else {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: 'AI yanıtı beklenen JSON formatında değil. Lütfen tekrar deneyin.' }
        ]);
      }
    } catch (e) {
      setMessages([
        ...newMessages,
        { role: 'assistant', content: 'Bir hata oluştu, lütfen tekrar deneyin.' }
      ]);
    }
    setLoading(false);
  };

  if (!isOpen) {
    return (
      <button
        className="fixed bottom-6 right-6 z-50 bg-red-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 hover:bg-red-700 transition"
        onClick={() => setIsOpen(true)}
        aria-label="AI Asistanı Aç"
      >
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Zm-1-7h2v2h-2v-2Zm0-8h2v6h-2V7Z" fill="currentColor"/></svg>
        AI
      </button>
    );
  }
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col">
      <div className="bg-red-600 text-white px-4 py-2 rounded-t-xl font-bold flex items-center justify-between">
        <span>AI Transfer Asistanı</span>
        <button
          className="ml-2 text-white hover:text-gray-200 text-lg font-bold focus:outline-none"
          onClick={() => { setIsOpen(false); onClose && onClose(); }}
          aria-label="Kapat"
        >
          ×
        </button>
      </div>
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
