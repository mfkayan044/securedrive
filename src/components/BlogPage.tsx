
import { Plane, Star } from 'lucide-react';

const blogPosts = [
  {
    title: 'Transfer Hizmetlerinde Konforun Önemi',
    desc: 'Konforlu bir yolculuk, transfer hizmetlerinde müşteri memnuniyetinin anahtarıdır. Araç seçimi, şoför deneyimi ve ek hizmetler hakkında ipuçları...'
  },
  {
    title: 'Havalimanı Transferinde Sık Yapılan Hatalar',
    desc: 'Rezervasyon sırasında dikkat edilmesi gerekenler, uçuş kodu ve adres bilgilerinin önemi, son dakika değişikliklerinde yapılması gerekenler...'
  },
  {
    title: 'VIP Transfer Nedir? Kimler Tercih Etmeli?',
    desc: 'VIP transferin avantajları, kimler için uygun olduğu ve fiyat/performans değerlendirmesi...'
  }
];

const BlogPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Plane className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Blog</h1>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {blogPosts.map((post, i) => (
            <div key={i} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-primary/10 p-8 flex flex-col justify-between group cursor-pointer hover:-translate-y-1">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2 group-hover:text-red-600 transition-colors duration-200">{post.title}</h2>
                <p className="text-gray-700 mb-4">{post.desc}</p>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Star className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-gray-400">Daha fazla bilgi için bizimle iletişime geçin.</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BlogPage;
