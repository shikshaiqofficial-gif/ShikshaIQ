import React from 'react';
import { Link } from 'react-router-dom';
import {
  Flame,
  CheckCircle2,
  BookOpen,
  Bot,
  Briefcase,
  Trophy,
  ArrowRight,
  LogOut,
  Bell,
  Clock,
} from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const student = user || {
    name: 'Rahul Sharma',
    email: 'rahul@shikshaiq.com',
    targetExam: 'SSC & Railway',
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-12">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="relative w-10 h-10 bg-slate-950 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-lg font-black text-white">S</span>
              <span className="w-2 h-2 rounded-full bg-orange-500 absolute -top-0.5 right-1.5"></span>
              <span className="text-lg font-black text-emerald-400">Q</span>
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                Shiksha<span className="text-orange-600">IQ</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] text-slate-400 font-bold ml-2 uppercase tracking-widest">
                Student Portal
              </span>
            </div>
          </Link>

          {/* Quick Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-slate-600">
            <Link to="/doubts" className="hover:text-orange-600 transition-colors flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-orange-500" /> AI Doubt Solver
            </Link>
            <Link to="/jobs" className="hover:text-emerald-600 transition-colors flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-emerald-500" /> Job Alerts
            </Link>
            <Link to="/current-affairs" className="hover:text-blue-600 transition-colors flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" /> Current Affairs
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-100 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="w-2 h-2 bg-orange-500 rounded-full absolute top-1.5 right-1.5"></span>
            </button>

            <div className="flex items-center gap-3 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-600 font-bold flex items-center justify-center text-sm border border-orange-200">
                {student.name ? student.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-tight">{student.name}</p>
                <p className="text-[11px] text-slate-500">{student.targetExam}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors ml-1 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Welcome & Daily Streak Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="relative z-10">
            <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full uppercase tracking-wider border border-orange-500/30">
              Exam Target: {student.targetExam}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">
              Welcome back, {student.name.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Consistency is your key to cracking the cutoff. Attempt today’s Daily Mock Test to keep your streak alive.
            </p>
          </div>

          <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-500/30">
              <Flame className="w-7 h-7 fill-white" />
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-white">4</span>
                <span className="text-xs text-orange-400 font-bold uppercase tracking-wider">Days</span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium">Daily Streak Active</p>
            </div>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mock Tests</span>
              <BookOpen className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-2xl font-black text-slate-900">12</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Attempted this month</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Accuracy</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">84.5%</p>
            <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">+3.2% vs last week</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Doubts Solved</span>
              <Bot className="w-4 h-4 text-orange-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">19</p>
            <p className="text-[11px] text-slate-400 mt-0.5">With AI Doubt Solver</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peer Standing</span>
              <Trophy className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">Top 5%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All India Ranking</p>
          </div>
        </div>

        {/* Feature Hub Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Today's Mock Test */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <BookOpen className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                Live Now
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">Daily Mock Test #42</h3>
              <p className="text-xs text-slate-500 mt-1">
                25 Questions • General Awareness & Reasoning • 30 mins
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-500 mt-4">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Ends tonight at 11:59 PM</span>
              </div>
            </div>
            <Link
              to="/mock-test"
              className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              Start Mock Test <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <Link
  to="/leaderboard"
  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-amber-300 transition-colors block"
>
  <div className="flex items-center justify-between mb-2">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Peer Standing</span>
    <Trophy className="w-4 h-4 text-amber-500" />
  </div>
  <p className="text-2xl font-black text-slate-900">Top 5%</p>
  <p className="text-[11px] text-amber-600 font-semibold mt-0.5 flex items-center gap-1">
    View All-India Leaderboard <ArrowRight className="w-3 h-3" />
  </p>
</Link>

          {/* Card 2: AI Doubt Solver */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mb-4">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider bg-orange-50 px-2 py-0.5 rounded">
                AI Powered
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">Instant Doubt Solver</h3>
              <p className="text-xs text-slate-500 mt-1">
                Stuck on a problem? Snap a photo or type your question for step-by-step guidance.
              </p>
              <div className="mt-4 p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 border border-slate-100">
                💡 "Solve with step-by-step formulas and Hindi / English explanations."
              </div>
            </div>
            <Link
              to="/doubts"
              className="mt-6 w-full py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              Ask a Doubt Now <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Card 3: Latest Job Alerts */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Briefcase className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">
                New Notifications
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">Daily Job Updates</h3>
              <ul className="mt-3 space-y-2.5">
                <li className="text-xs text-slate-700 flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-semibold truncate pr-2">RRB NTPC 2026 Notification</span>
                  <span className="text-[10px] text-emerald-600 font-bold shrink-0">11,558 Posts</span>
                </li>
                <li className="text-xs text-slate-700 flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="font-semibold truncate pr-2">SSC CGL Tier 1 Exam Dates</span>
                  <span className="text-[10px] text-orange-600 font-bold shrink-0">Active</span>
                </li>
              </ul>
            </div>
            <Link
              to="/jobs"
              className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
            >
              View All Job Alerts <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>

      </main>
    </div>
  );
}