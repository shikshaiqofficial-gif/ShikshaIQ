import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import Logo from './components/Logo';
import { User, Mail, Phone, Calendar, Lock, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [registeredData, setRegisteredData] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    phone: '',
    email: '',
    gmailAccount: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      // Generate Unique ShikshaIQ ID
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const uniqueId = `SIQ-2026-${randomNum}`;
      setRegisteredData({ ...formData, shikshaId: uniqueId });
    }, 1000);
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
          className="w-full max-w-md bg-[#0b132b] border border-slate-800 rounded-3xl p-8 shadow-2xl relative"
        >
          {registeredData ? (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-white">Registration Successful!</h2>
                <p className="text-xs text-slate-400">Welcome aboard, {registeredData.fullName}. Your account is ready.</p>
              </div>

              <div className="p-4 bg-[#070b19] rounded-2xl border border-indigo-500/30 space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Your Unique ShikshaIQ ID</span>
                <div className="text-xl font-mono font-black text-orange-400 tracking-wider">
                  {registeredData.shikshaId}
                </div>
                <p className="text-[11px] text-slate-500">Save this ID for all exam sessions & leaderboards.</p>
              </div>

              <button
                onClick={() => navigate('/dashboard')}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-900/40 text-sm flex items-center justify-center gap-2"
              >
                Go to Student Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-xl font-black text-white">Create Student Account</h2>
                <p className="text-xs text-slate-400">Fill in your details to get your unique ShikshaIQ ID.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="fullName"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full bg-[#070b19] border border-slate-800 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Date of Birth</label>
                    <div className="relative">
                      <Calendar className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="date"
                        name="dob"
                        required
                        value={formData.dob}
                        onChange={handleChange}
                        className="w-full bg-[#070b19] border border-slate-800 rounded-xl px-9 py-3 text-xs text-white focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                      <input
                        type="tel"
                        name="phone"
                        required
                        placeholder="9876543210"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-[#070b19] border border-slate-800 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Gmail Account</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      name="gmailAccount"
                      required
                      placeholder="student@gmail.com"
                      value={formData.gmailAccount}
                      onChange={handleChange}
                      className="w-full bg-[#070b19] border border-slate-800 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Primary Email ID</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      required
                      placeholder="yourname@domain.com"
                      value={formData.email}
                      onChange={handleChange}
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
                      name="password"
                      required
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full bg-[#070b19] border border-slate-800 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold rounded-xl transition shadow-lg shadow-orange-600/20 text-sm flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? <span className="animate-pulse">Generating ID...</span> : <>Generate ShikshaIQ ID & Register <ArrowRight className="w-4 h-4" /></>}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Already have an account? </span>
                <Link to="/login" className="text-xs font-bold text-indigo-400 hover:underline">Sign In</Link>
              </div>
            </div>
          )}
        </motion.div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800/80">
        © 2026 ShikshaIQ Inc. Secure Student Portal.
      </footer>
    </div>
  );
}