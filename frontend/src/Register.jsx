import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, BookOpen, CheckCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import API from './api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    targetExam: 'SSC & Railway',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = generateToken(newUser._id, newUser.email, newUser.role);

  const examOptions = [
    'SSC & Railway',
    'Banking & Insurance',
    'UPSC / State PSC',
    'Defence Exams',
    'Teaching Exams',
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/register', formData);
      
      // Save auth details
      if (response.data?.token) {
        localStorage.setItem('shiksha_token', response.data.token);
        localStorage.setItem('shiksha_user', JSON.stringify(response.data.user));
      }

      // Navigate to login or dashboard
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 lg:p-8 font-sans">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-100">
        
        {/* Left Side: Brand Poster Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-white p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg border border-slate-200">
                <span className="text-xl font-extrabold text-blue-950">S</span>
                <span className="w-2 h-2 rounded-full bg-orange-500 absolute -top-1 right-2"></span>
                <span className="text-xl font-black text-emerald-500">Q</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-white flex items-center">
                  Shiksha<span className="text-orange-500">IQ</span>
                </h1>
                <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-400">
                  Learn Smart. Rank Higher.
                </p>
              </div>
            </div>

            <div className="mt-8">
              <span className="inline-block px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold uppercase tracking-wider mb-2 border border-orange-500/30">
                Trusted by 500K+ Students
              </span>
              <h2 className="text-2xl font-bold leading-snug">
                One Platform. <br />Every Solution.
              </h2>
            </div>

            <ul className="mt-8 space-y-4 text-sm text-slate-300">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Daily Free Mock Tests & Detailed Analysis</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>AI Doubt Solver — Instant Explanations</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Govt Job Alerts & Current Affairs Recaps</span>
              </li>
            </ul>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Secure & Ad-Free Learning Experience</span>
          </div>
        </div>

        {/* Right Side: Sign-Up Form */}
        <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h3>
            <p className="text-sm text-slate-500 mt-1">
              Start your exam preparation journey today for free.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-200">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1 tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1 tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@shikshaiq.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1 tracking-wider">Target Competitive Exam</label>
              <div className="relative">
                <BookOpen className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <select
                  name="targetExam"
                  value={formData.targetExam}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-700"
                >
                  {examOptions.map((exam) => (
                    <option key={exam} value={exam}>{exam}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-600 mb-1 tracking-wider">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Creating Account...' : 'Get Started Free'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-orange-600 font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};

export default Register;