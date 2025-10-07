
import { MessageCircle, HelpCircle } from 'lucide-react';

const faqs = [
  {
    q: 'Transfer rezervasyonumu nasıl yapabilirim?',
    a: 'Ana sayfadaki rezervasyon formunu doldurarak veya iletişim bilgilerimizden bize ulaşarak kolayca rezervasyon yapabilirsiniz.'
  },
  {
    q: 'Hangi havalimanlarına hizmet veriyorsunuz?',
    a: 
      "İstanbul Havalimanı (IST) ve Sabiha Gökçen Havalimanı (SAW) başta olmak üzere İstanbul'un tüm bölgelerine transfer hizmeti sunuyoruz."
  },
  {
    q: 'Araçlarınız sigortalı mı?',
    a: 'Tüm araçlarımız tam sigortalıdır ve düzenli bakımları yapılmaktadır.'
  },
  {
    q: 'Şoförleriniz deneyimli mi?',
    a: 'Evet, tüm şoförlerimiz alanında deneyimli ve gerekli belgelere sahiptir.'
  },
  {
    q: 'VIP transfer nedir?',
    a: 'VIP transfer, lüks araçlar ve özel hizmetlerle sunulan üst düzey transfer seçeneğidir.'
  }
];

const FAQPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <HelpCircle className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Sıkça Sorulan Sorular (SSS)</h1>
        </div>
        <div className="space-y-6">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-md border border-primary/10 p-6 group hover:shadow-xl transition-shadow duration-200">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-primary group-hover:text-red-600 transition-colors duration-200">{faq.q}</h2>
              </div>
              <p className="text-gray-700 pl-7">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
