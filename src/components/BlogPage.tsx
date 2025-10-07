import React from 'react';

const BlogPage: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-bold mb-6 text-primary">Blog</h1>
      <div className="space-y-8">
        <article>
          <h2 className="text-2xl font-semibold mb-2">Transfer Hizmetlerinde Konforun Önemi</h2>
          <p className="text-gray-700">Konforlu bir yolculuk, transfer hizmetlerinde müşteri memnuniyetinin anahtarıdır. Araç seçimi, şoför deneyimi ve ek hizmetler hakkında ipuçları...</p>
        </article>
        <article>
          <h2 className="text-2xl font-semibold mb-2">Havalimanı Transferinde Sık Yapılan Hatalar</h2>
          <p className="text-gray-700">Rezervasyon sırasında dikkat edilmesi gerekenler, uçuş kodu ve adres bilgilerinin önemi, son dakika değişikliklerinde yapılması gerekenler...</p>
        </article>
        <article>
          <h2 className="text-2xl font-semibold mb-2">VIP Transfer Nedir? Kimler Tercih Etmeli?</h2>
          <p className="text-gray-700">VIP transferin avantajları, kimler için uygun olduğu ve fiyat/performans değerlendirmesi...</p>
        </article>
      </div>
    </div>
  );
};

export default BlogPage;
