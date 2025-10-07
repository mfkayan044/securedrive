

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, Plane, Star } from 'lucide-react';

interface BlogItem {
  id: string;
  title: string;
  content: string;
}


const BlogPage: React.FC = () => {
  const [posts, setPosts] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      const { data, error } = await supabase!
        .from('site_content')
        .select('id, title, content')
        .eq('type', 'blog')
        .order('order', { ascending: true });
      if (!error && data) setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Plane className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-extrabold text-primary tracking-tight">Blog</h1>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-400 py-16">Henüz blog içeriği yok.</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-200 border border-primary/10 p-8 flex flex-col justify-between group cursor-pointer hover:-translate-y-1">
                <div>
                  <h2 className="text-2xl font-bold text-primary mb-2 group-hover:text-red-600 transition-colors duration-200">{post.title}</h2>
                  <p className="text-gray-700 mb-4">{post.content}</p>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-xs text-gray-400">Daha fazla bilgi için bizimle iletişime geçin.</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
