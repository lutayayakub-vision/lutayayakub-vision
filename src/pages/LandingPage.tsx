import { useNavigate } from '@/lib/router';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/Layout';
import { Leaf, Camera, Brain, Stethoscope, ShieldCheck, Clock, Users, MessageCircle, ArrowRight, Sprout, BookOpen, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Crop } from '@/types';

export function LandingPage() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [crops, setCrops] = useState<Crop[]>([]);

  useEffect(() => {
    if (session) {
      navigate('/dashboard');
    }
    supabase.from('crops').select('*').order('name').then(({ data }) => {
      if (data) setCrops(data);
    });
  }, [session]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 via-white to-primary-50">
      {/* Nav */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center shadow-md">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-primary-800">AgriDoctor AI</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button size="sm" onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-100/50 via-transparent to-sky-100/30" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-primary-100 text-primary-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-fade-in">
                <Sprout className="w-4 h-4" />
                AI-Powered Crop Health for Ugandan Farmers
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-primary-900 leading-tight mb-5 animate-slide-up">
                Your AI Doctor for<br className="hidden sm:block" /> Healthier Crops
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 mb-8 animate-slide-up">
                Take a photo, understand the problem, and get practical next steps for your crop — in seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start animate-slide-up">
                <Button size="lg" onClick={() => navigate('/register')} className="group">
                  <span className="flex items-center gap-2">
                    <Camera className="w-5 h-5" />
                    Diagnose My Crop
                  </span>
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/register')}>
                  <span className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Ask AgriDoctor
                  </span>
                </Button>
              </div>
              <div className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-gray-500">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-primary-500" /> Fast results</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-primary-500" /> Farmer-friendly</span>
                <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-primary-500" /> Expert support</span>
              </div>
            </div>
            <div className="relative animate-scale-in hidden lg:block">
              <div className="absolute -inset-4 bg-gradient-to-br from-primary-200/40 to-sky-200/30 rounded-3xl blur-2xl" />
              <img
                src="https://images.pexels.com/photos/38668659/pexels-photo-38668659.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Farmer inspecting maize crop in Uganda"
                className="relative rounded-3xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl shadow-xl p-3 flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-primary-100 text-primary-600 flex items-center justify-center">
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-primary-900">AI Analysis</p>
                  <p className="text-xs text-gray-400">Instant results</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-3">How It Works</h2>
          <p className="text-center text-gray-500 mb-12">Three simple steps to healthier crops</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: <Camera className="w-7 h-7" />, step: '1', title: 'Take a Photo', desc: 'Snap or upload a clear photo of your crop leaf, fruit, or stem.' },
              { icon: <Brain className="w-7 h-7" />, step: '2', title: 'AI Analyzes It', desc: 'Our AI compares your image against known crop diseases in seconds.' },
              { icon: <Stethoscope className="w-7 h-7" />, step: '3', title: 'Get Guidance', desc: 'Receive a possible diagnosis with practical next steps you can act on.' },
            ].map((item, i) => (
              <div key={i} className="relative group">
                <div className="bg-primary-50 rounded-2xl p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border border-primary-100">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div className="text-5xl font-extrabold text-primary-200 absolute top-4 right-4">{item.step}</div>
                  <h3 className="font-bold text-lg text-primary-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Crops */}
      <section className="py-16 bg-primary-50/50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-3">Supported Crops</h2>
          <p className="text-center text-gray-500 mb-12">Common crops grown across Uganda</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {crops.length > 0 ? crops.slice(0, 12).map((crop) => (
              <div key={crop.id} className="bg-white rounded-2xl overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 border border-primary-100">
                {crop.image_url ? (
                  <div className="h-28 overflow-hidden">
                    <img src={crop.image_url} alt={crop.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="h-28 bg-primary-100 flex items-center justify-center">
                    <Sprout className="w-10 h-10 text-primary-400" />
                  </div>
                )}
                <div className="p-3 text-center">
                  <h3 className="font-semibold text-primary-900 text-sm">{crop.name}</h3>
                </div>
              </div>
            )) : Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl animate-shimmer h-36" />
            ))}
          </div>
          {crops.length > 12 && (
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">+ {crops.length - 12} more crops supported</p>
            </div>
          )}
        </div>
      </section>

      {/* Why AgriDoctor */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center text-primary-900 mb-12">Why AgriDoctor?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: <Clock className="w-5 h-5" />, title: 'Fast', desc: 'Get results in seconds, not days.' },
              { icon: <Camera className="w-5 h-5" />, title: 'Easy to Use', desc: 'Just take a photo — no technical skills needed.' },
              { icon: <Brain className="w-5 h-5" />, title: 'AI-Powered', desc: 'Smart analysis trained on crop diseases.' },
              { icon: <Users className="w-5 h-5" />, title: 'Farmer-Friendly', desc: 'Simple language, practical advice.' },
              { icon: <Stethoscope className="w-5 h-5" />, title: 'Expert Support', desc: 'Connect with agricultural experts.' },
              { icon: <BookOpen className="w-5 h-5" />, title: 'Learn', desc: 'Educational content about your crops.' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-xl hover:bg-primary-50 transition-colors">
                <div className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-primary-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Notice */}
      <section className="py-16 bg-amber-50/50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-amber-900 mb-1">Important Notice</h3>
              <p className="text-sm text-amber-700">
                AI results are guidance and not a replacement for professional agricultural diagnosis.
                For serious crop problems, consult an agricultural extension officer or plant-health specialist.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-br from-primary-700 to-primary-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to diagnose your crops?</h2>
          <p className="text-primary-100 mb-8">Join AgriDoctor AI and get practical crop guidance in seconds.</p>
          <Button size="lg" variant="secondary" onClick={() => navigate('/register')} className="group">
            <span className="flex items-center gap-2">
              Get Started Free
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-primary-200">
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              <span className="font-semibold text-white">AgriDoctor AI</span>
              <span>— Smarter Decisions. Healthier Crops.</span>
            </div>
            <p className="text-xs text-primary-300">Vet4 | Makerere University UniPod AI Boot Camp</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
