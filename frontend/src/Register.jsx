import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import API from './api';
import Logo from './components/Logo';
import { User, Mail, Calendar, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export default function Register() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    targetExam: 'SSC CGL'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await API.post('/auth/register', {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        targetExam: formData.targetExam
      });

      if (res.data?.success && res.data.token) {
        // Save token and user object securely to localStorage
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Email might already be in use.');
    } finally {
      setLoading(false);
    }
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
            <h2 className="text-xl font-black text-white">Create Student Account</h2>
            <p className="text-xs text-slate-400">Join ShikshaIQ to start your exam preparation.</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-950/60 border border-rose-800 rounded-xl text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#070b19] border border-slate-800 rounded-xl px-10 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-300 uppercase tracking-wide">Target Exam</label>
              <select
                name="targetExam"
                value={formData.targetExam}
                onChange={handleChange}
                className="w-full bg-[#070b19] border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition cursor-pointer"
              >
                <option value="SSC CGL">SSC CGL</option>
                <option value="SSC CHSL">SSC CHSL</option>
                <option value="RRB NTPC">RRB NTPC (Railways)</option>
                <option value="IBPS PO">IBPS PO / Banking</option>
                <option value="UPSC">UPSC Civil Services</option>
              </select>
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
              className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white font-bold rounded-xl transition shadow-lg shadow-orange-600/20 text-sm flex items-center justify-center gap-2 mt-2 cursor-pointer"
            >
              {loading ? <span className="animate-pulse">Creating Account...</span> : <>Register & Open Dashboard <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-xs text-slate-400">Already have an account? </span>
            <Link to="/login" className="text-xs font-bold text-indigo-400 hover:underline">Sign In</Link>
          </div>
        </motion.div>
      </main>

      <footer className="py-6 text-center text-xs text-slate-500 border-t border-slate-800/80">
        © 2026 ShikshaIQ Inc. Secure Student Portal.
      </footer>
    </div>
  );
}