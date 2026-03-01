"use client";

import React, { useEffect, useState } from 'react';
import { MessageCircle, Car, ShieldCheck, Clock, ChevronRight } from 'lucide-react';

export default function TemporaryLandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const whatsappUrl = "https://wa.me/905348517444?text=Merhaba,%20VIP%20transfer%20rezervasyonu%20yapt%C4%B1rmak%20istiyorum.";

  if (!mounted) return null;

  return (
    <main className="min-h-screen relative bg-slate-950 text-white overflow-x-hidden selection:bg-red-500/30">
      {/* Background Image & Overlay */}
      <div className="fixed inset-0 z-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20s] ease-linear scale-110 motion-safe:animate-slow-pan"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=1920')" }}
        />
        {/* Luxury dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-slate-900/85 to-slate-950/95 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/50" />
      </div>

      {/* Decorative Blur Orbs */}
      <div className="fixed top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent z-20" />
      <div className="fixed top-1/4 -left-64 w-96 h-96 bg-red-600/20 rounded-full blur-[128px] z-0 pointer-events-none" />
      <div className="fixed bottom-1/4 -right-64 w-96 h-96 bg-red-600/10 rounded-full blur-[128px] z-0 pointer-events-none" />

      {/* Navbar (Minimal) */}
      <nav className="relative z-20 w-full p-6 md:p-10 flex justify-between items-center animate-fade-in-down">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-red-600/20 ring-1 ring-white/10 backdrop-blur-md">
            S
          </div>
          <span className="text-xl md:text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 uppercase">
            Secure Drive
          </span>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative z-10 container mx-auto px-6 pt-16 pb-32 flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* VIP Badge */}
        <div 
          className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-10 shadow-[0_0_30px_rgba(0,0,0,0.3)] animate-fade-in-up" 
          style={{ animationDelay: '0.1s' }}
        >
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </div>
          <span className="text-xs md:text-sm font-semibold text-white/90 tracking-widest uppercase">Premium VIP Transfer</span>
        </div>

        {/* Main Title */}
        <h1 
          className="text-6xl md:text-8xl lg:text-[7rem] font-black text-center leading-[1] mb-8 tracking-tighter animate-fade-in-up" 
          style={{ animationDelay: '0.2s' }}
        >
          Konforun <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-red-600 to-red-800 drop-shadow-sm">
            Zirvesi
          </span>
        </h1>

        {/* Subtitle */}
        <p 
          className="text-lg md:text-2xl text-white/60 text-center max-w-3xl mb-14 font-light leading-relaxed animate-fade-in-up" 
          style={{ animationDelay: '0.3s' }}
        >
          İstanbul'un her noktasına, size özel lüks araçlarla güvenli ve prestijli ulaşım. Yolculuğunuzu anında planlayın.
        </p>

        {/* Call To Action - WhatsApp Button */}
        <div className="animate-fade-in-up w-full md:w-auto" style={{ animationDelay: '0.4s' }}>
          <a 
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative flex items-center justify-center gap-5 bg-gradient-to-r from-[#25D366] to-[#128C7E] p-5 md:px-14 md:py-6 rounded-3xl w-full md:w-auto overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_50px_-10px_rgba(37,211,102,0.6)] ring-1 ring-[#25D366]/50"
          >
            {/* Hover shine effect */}
            <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12" />
            
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            
            <div className="flex flex-col items-start relative z-10 text-left">
              <span className="text-xs md:text-sm font-bold text-green-100 uppercase tracking-[0.2em] mb-1">
                Şimdi Rezervasyon Yap
              </span>
              <span className="text-xl md:text-3xl font-black text-white tracking-wide">
                WhatsApp İletişim
              </span>
            </div>
            
            <ChevronRight className="w-8 h-8 text-white/50 group-hover:text-white group-hover:translate-x-2 transition-all duration-300 relative z-10 ml-2 hidden md:block" />
          </a>
        </div>

        {/* Contact Info Text */}
        <div className="mt-8 text-white/50 animate-fade-in-up flex items-center gap-2 font-medium" style={{ animationDelay: '0.5s' }}>
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          7/24 Müşteri Hizmetleri: <span className="text-white">0534 851 7444</span>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32 w-full max-w-6xl animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          {[
            { icon: Car, title: "Lüks Filo", desc: "En yeni model VIP Vito ve Sprinter araçlarla birinci sınıf seyahat." },
            { icon: ShieldCheck, title: "Güvenli Ulaşım", desc: "Deneyimli ve belgeli şoför kadromuzla tamamen güvendesiniz." },
            { icon: Clock, title: "7/24 Hizmet", desc: "Günün her saati, dilediğiniz konumdan havalimanı ve VIP transfer." },
          ].map((feature, i) => (
            <div 
              key={i} 
              className="group relative p-8 rounded-[2rem] bg-white/[0.03] border border-white/[0.05] backdrop-blur-xl hover:bg-white/[0.06] transition-all duration-500 overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:bg-red-500/20" />
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500/20 to-transparent border border-red-500/30 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
                  <feature.icon className="w-8 h-8 text-red-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3 tracking-wide">{feature.title}</h3>
                <p className="text-white/50 font-light leading-relaxed text-sm md:text-base">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Internal Custom Styles for Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(40px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
        @keyframes pan {
          0% { transform: scale(1.1) translateX(0) translateY(0); }
          50% { transform: scale(1.15) translateX(-1%) translateY(-1%); }
          100% { transform: scale(1.1) translateX(0) translateY(0); }
        }
        .animate-fade-in-down {
          animation: fade-in-down 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slow-pan {
          animation: pan 30s ease-in-out infinite;
        }
      `}} />
    </main>
  );
}
