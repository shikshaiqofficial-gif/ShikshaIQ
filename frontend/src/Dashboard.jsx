import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid
} from 'recharts';
import {
  BookOpen,
  HelpCircle,
  Trophy,
  Award,
  TrendingUp,
  Target,
  ArrowRight,
  LogOut,
  User
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Performance metrics (sample analytics based on attempts)
  const subjectPerformance = [
    { subject: 'Quant', accuracy: 78, attempted: 45, correct: 35 },
    { subject: 'Reasoning', accuracy: 88, attempted: 50, correct: 44 },
    { subject: 'GK / GS', accuracy: 65, attempted: 40, correct: 26 },
  ];

  const accuracyData = [
    { name: 'Correct', value: 105, color: '#10b981' },
    { name: 'Incorrect', value: 30, color: '#f43f5e' },
  ];

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('shiksha_token');
      if (token) {
        const res = await API.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
        }
      }
    } catch (err) {
      console.warn("Could not fetch authenticated profile, continuing as guest.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('shiksha_token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm">
            IQ
          </div>
          <span className="font-bold text-lg tracking-tight">ShikshaIQ</span>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-medium ml-2">
            SSC & Railways
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-slate-300">
            <User className="w-4 h-4 text-indigo-400" />
            <span>{user ? user.name : 'Aspirant'}</span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-rose-400 transition"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        
        {/* Quick Action Banner */}
        <div className="bg-gradient-to-r from-indigo-900/60 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h1 className="text-2xl font-bold text-white">
              Welcome back, {user ? user.name.split(' ')[0] : 'Aspirant'}! 🎯
            </h1>
            <p className="text-sm text-slate-300 max-w-xl">
              Targeting {user?.targetExam || 'SSC CGL'} 2026. Keep your streak alive with daily mock tests and AI doubt clearance.
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <button
              onClick={() => navigate('/mock-test')}
              className="flex-1 md:flex-initial px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/40"
            >
              <BookOpen className="w-4 h-4" />
              <span>Take Mock Test</span>
            </button>
            <button
              onClick={() => navigate('/doubts')}
              className="flex-1 md:flex-initial px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2"
            >
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>Ask Doubt</span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Average Accuracy</p>
              <p className="text-xl font-bold text-slate-100">77.8%</p>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Total Solved</p>
              <p className="text-xl font-bold text-slate-100">135 Qs</p>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">All-India Rank</p>
              <p className="text-xl font-bold text-slate-100">#42</p>
            </div>
          </div>

          <div className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 rounded-xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Best Score</p>
              <p className="text-xl font-bold text-slate-100">38.5 / 40</p>
            </div>
          </div>
        </div>

        {/* Analytics Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Subject-Wise Accuracy Bar Chart */}
          <div className="lg:col-span-2 bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-200">Subject Accuracy Breakdown (%)</h3>
              <span className="text-xs text-indigo-400 font-medium">Last 5 Tests</span>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectPerformance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="subject" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Correct vs Incorrect Ratio */}
          <div className="bg-slate-800/60 border border-slate-700/60 p-6 rounded-2xl flex flex-col justify-between space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-slate-200">Attempt Ratio</h3>
              <span className="text-xs text-emerald-400 font-medium">Overview</span>
            </div>
            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={accuracyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderColor: '#475569', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-around text-xs text-slate-300 pt-2 border-t border-slate-700/50">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                <span>Correct (78%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                <span>Wrong (22%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Nav Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            onClick={() => navigate('/leaderboard')}
            className="p-5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between cursor-pointer transition group"
          >
            <div>
              <h4 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition">
                All-India Leaderboard
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Check where you stand compared to thousands of SSC and Railway aspirants.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-400 transition" />
          </div>

          <div
            onClick={() => navigate('/doubts')}
            className="p-5 bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 rounded-xl flex items-center justify-between cursor-pointer transition group"
          >
            <div>
              <h4 className="font-semibold text-slate-100 group-hover:text-indigo-400 transition">
                AI Doubt Assistant
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Stuck on tricky Quant formulas or Reasoning puzzles? Get step-by-step solutions instantly.
              </p>
            </div>
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:translate-x-1 group-hover:text-indigo-400 transition" />
          </div>
        </div>

      </main>
    </div>
  );
}