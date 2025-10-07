

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, MessageCircle, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: string;
  title: string;
  content: string;
}


const FAQPage: React.FC = () => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      const { data, error } = await supabase!
        .from('site_content')
        .select('id, title, content')
        .eq('type', 'faq')
        .order('order', { ascending: true });
      if (!error && data) setFaqs(data);
      setLoading(false);
    };
    fetchFaqs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Sıkça Sorulan Sorular (SSS)</h1>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : faqs.length === 0 ? (
          <div className="text-center text-gray-400 py-16">Henüz SSS içeriği yok.</div>
        ) : (
          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.id} className="bg-white rounded-2xl shadow-md border border-primary/10 p-6 group hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-semibold text-primary group-hover:text-red-600 transition-colors duration-200">{faq.title}</h2>
                </div>
                <p className="text-gray-700 pl-7">{faq.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQPage;
