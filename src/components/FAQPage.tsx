import React from 'react';

const FAQPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-primary">Sıkça Sorulan Sorular (SSS)</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-2">Transfer rezervasyonumu nasıl yapabilirim?</h2>
          <p className="text-gray-700">Ana sayfadaki rezervasyon formunu doldurarak veya iletişim bilgilerimizden bize ulaşarak kolayca rezervasyon yapabilirsiniz.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Hangi havalimanlarına hizmet veriyorsunuz?</h2>
          <p className="text-gray-700">İstanbul Havalimanı (IST) ve Sabiha Gökçen Havalimanı (SAW) başta olmak üzere İstanbul'un tüm bölgelerine transfer hizmeti sunuyoruz.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Araçlarınız sigortalı mı?</h2>
          <p className="text-gray-700">Tüm araçlarımız tam sigortalıdır ve düzenli bakımları yapılmaktadır.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Şoförleriniz deneyimli mi?</h2>
          <p className="text-gray-700">Evet, tüm şoförlerimiz alanında deneyimli ve gerekli belgelere sahiptir.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">VIP transfer nedir?</h2>
          <p className="text-gray-700">VIP transfer, lüks araçlar ve özel hizmetlerle sunulan üst düzey transfer seçeneğidir.</p>
        </div>
      </div>
    </div>
  );
};

export default FAQPage;
