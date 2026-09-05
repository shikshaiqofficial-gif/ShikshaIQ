import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './components/Logo';
import { Mail, Lock, ArrowRight } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate('/dashboard');
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col justify-between font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />

      <header className="h-20 px-6 sm:px-12 flex items-center justify-between border-b border-slate-800/80 backdrop-blur-md">
        <Logo size="md" />
        <Link to="/" className="text-xs font-semibold text-slate-400 hover:text-white transition">
          ← Back to Home
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md bg-[#0b132b] border border-slate-800 rounded-3xl p-8 shadow-2xl relative space-y-6"
        >
          <div className="space-y-1">
            <h2 className="text-xl font-black text-white">Welcome Back Aspirant</h2>
            <p className="text-xs text-slate-400">Sign in with your Email or ShikshaIQ ID.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Email or ShikshaIQ ID</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  placeholder="name@gmail.com or SIQ-2026-XXXX"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-[#070b19] border border-slate-800 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#070b19] border border-slate-800 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold rounded-xl transition shadow-lg shadow-orange-600/20 text-sm flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <span className="animate-pulse">Signing In...</span> : <>Sign In to Dashboard <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Don't have an account? </span>
            <Link to="/register" className="text-xs font-bold text-indigo-400 hover:underline">Register Now</Link>
          </div>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800/80">
        © 2026 ShikshaIQ Inc. Secure Student Portal.
      </footer>
    </div>
  );
}