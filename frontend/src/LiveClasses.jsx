import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './components/Logo';
import { Radio, Bell, ArrowLeft, CheckCircle2, Sparkles } from 'lucide-react';

export default function LiveClasses() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/40 via-white to-emerald-50/40 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Top Header */}
      <header className="h-20 bg-white/90 border-b border-orange-200/60 px-6 sm:px-12 flex items-center justify-between shadow-sm backdrop-blur-md">
        <Logo size="md" onClick={() => navigate('/')} />
        <button
          onClick={() => navigate('/dashboard')}
          className="px-4 py-2 bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-600 text-xs font-semibold rounded-xl transition flex items-center gap-2 border border-slate-200"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="max-w-2xl w-full bg-white border border-orange-200 rounded-3xl p-8 sm:p-12 shadow-2xl text-center space-y-8 relative overflow-hidden">
          {/* Tricolour Accent Bar at Top */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-blue-600 to-emerald-600"></div>

          {/* Background Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 bg-gradient-to-r from-orange-500/10 via-blue-500/10 to-emerald-500/10 blur-3xl pointer-events-none"></div>

          <div className="w-20 h-20 bg-gradient-to-tr from-orange-500 via-blue-600 to-emerald-600 text-white rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-orange-500/20">
            <Radio className="w-10 h-10 animate-pulse" />
          </div>

          <div className="space-y-3">
            <span className="px-3 py-1 bg-orange-50 border border-orange-200 text-orange-700 rounded-full text-[11px] font-bold tracking-widest uppercase inline-flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Coming Soon in Tricolour Studio
            </span>
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Interactive Live Classes
            </h1>
            <p className="text-sm sm:text-base text-slate-600 max-w-lg mx-auto leading-relaxed">
              We are building India's most immersive live streaming studio for SSC, Banking, and Railways aspirants with real-time doubt solving and faculty interactions.
            </p>
          </div>

          {/* Notification Form */}
          {subscribed ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-semibold max-w-md mx-auto">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              You're on the VIP waitlist! We’ll notify you when live classes start.
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your email for early access"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-500 transition shadow-sm"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-orange-500 via-blue-600 to-emerald-600 hover:opacity-95 text-white font-bold rounded-xl text-xs shadow-md shadow-orange-500/20 transition hover:scale-105 shrink-0 flex items-center justify-center gap-2"
              >
                <Bell className="w-4 h-4" /> Notify Me
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}