import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Zap,
  Swords,
  BookOpen,
  Award,
  Sliders,
  HelpCircle,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Play
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white overflow-x-hidden">
      {/* ---------------------------------------------------- */}
      {/* NAVIGATION BAR */}
      {/* ---------------------------------------------------- */}
      <header className="h-20 bg-slate-950/80 border-b border-slate-900 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
          {/* Animated Logo Icon */}
          <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center font-black text-white text-xl shadow-xl shadow-indigo-600/30 animate-pulse">
            <span className="relative z-10">S</span>
            <div className="absolute inset-0 rounded-2xl bg-indigo-500 blur-md opacity-40 animate-ping"></div>
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1.5">
              ShikshaIQ <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-mono px-2 py-0.5 rounded-full shadow-sm">AI 2026</span>
            </span>
            <span className="text-[10px] text-slate-400 block tracking-wide">Next-Gen Exam Prep</span>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-indigo-600/30 cursor-pointer flex items-center gap-1.5"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* HERO SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="relative pt-16 pb-24 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center text-center space-y-8">
        {/* Glowing background gradient elements */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-rose-600/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold shadow-inner">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>Powered by Gemini 3.6 Flash AI & Real-Time WebSockets</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl leading-[1.1]">
          Master Indian Competitive Exams with <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-rose-400 bg-clip-text text-transparent">AI Intelligence</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Experience 100-question CBT mock simulations, live 1v1 peer battle arenas with real-time progress syncing, and adaptive weakness drill engines built for SSC CGL & RRB success.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <button
            onClick={() => navigate('/mock-test')}
            className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl transition flex items-center gap-2.5 shadow-xl shadow-indigo-600/40 cursor-pointer text-sm sm:text-base group"
          >
            <Zap className="w-5 h-5 group-hover:scale-110 transition" />
            <span>Launch Daily 100-Q CBT Mock</span>
          </button>
          <button
            onClick={() => navigate('/battle')}
            className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-700 font-bold rounded-2xl transition flex items-center gap-2.5 cursor-pointer text-sm sm:text-base shadow-lg"
          >
            <Swords className="w-5 h-5 text-rose-400" />
            <span>Enter Live 1v1 Battle</span>
          </button>
        </div>

        {/* Hero Mockup Preview Card */}
        <div className="w-full max-w-5xl mt-12 bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl backdrop-blur-md relative">
          <div className="absolute -top-3 left-8 bg-indigo-600 text-white text-[10px] font-mono px-3 py-1 rounded-full uppercase tracking-wider font-bold">
            Live CBT Interface Preview
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-left space-y-2">
              <span className="text-[10px] text-indigo-400 font-bold uppercase">Quantitative Aptitude</span>
              <p className="text-xs font-semibold text-slate-200">Algebraic Identities & Geometry Theorem Traps</p>
              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 w-3/4"></div>
              </div>
            </div>
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-left space-y-2">
              <span className="text-[10px] text-rose-400 font-bold uppercase">Live 1v1 Duel Arena</span>
              <p className="text-xs font-semibold text-slate-200">Real-Time Opponent Progress Bar Sync</p>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Synced @ 60fps
              </div>
            </div>
            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800/80 text-left space-y-2">
              <span className="text-[10px] text-amber-400 font-bold uppercase">Mistake Vault</span>
              <p className="text-xs font-semibold text-slate-200">Spaced Repetition & Shortcut Derivations</p>
              <div className="text-[10px] text-slate-400 font-mono">Active Review Cadence</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* FEATURE HIGHLIGHTS GRID */}
      {/* ---------------------------------------------------- */}
      py-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-black text-white">Engineered for Top All-India Ranks</h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Everything you need to crack SSC CGL, RRB NTPC, and Banking exams in one high-performance web app.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div
            onClick={() => navigate('/mock-test')}
            className="p-8 bg-slate-900/60 border border-slate-800/80 hover:border-indigo-500/50 rounded-3xl space-y-4 transition duration-300 group cursor-pointer shadow-xl hover:shadow-indigo-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Daily 100-Q CBT Simulation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Full-length 60-minute tests generated daily with authentic exam difficulty ratios, negative marking, and PDF scorecards.
            </p>
            <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              Start Test <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 2 */}
          <div
            onClick={() => navigate('/battle')}
            className="p-8 bg-slate-900/60 border border-slate-800/80 hover:border-rose-500/50 rounded-3xl space-y-4 transition duration-300 group cursor-pointer shadow-xl hover:shadow-rose-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-110 transition">
              <Swords className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Live 1v1 Peer Battle Arena</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Challenge friends or random aspirants via WebSocket rooms. Watch live opponent progress bars advance question by question.
            </p>
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              Start Duel <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>

          {/* Card 3 */}
          <div
            onClick={() => navigate('/mistakes')}
            className="p-8 bg-slate-900/60 border border-slate-800/80 hover:border-amber-500/50 rounded-3xl space-y-4 transition duration-300 group cursor-pointer shadow-xl hover:shadow-amber-500/10"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Mistake Vault & Formula Bank</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automatically captures failed test questions into a spaced-repetition vault with step-by-step shortcut derivations.
            </p>
            <span className="text-xs font-bold text-amber-400 flex items-center gap-1 group-hover:translate-x-1 transition">
              View Vault <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* FOOTER */}
      {/* ---------------------------------------------------- */}
      <footer className="mt-auto bg-slate-950 border-t border-slate-900 py-12 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-3">
        <div className="flex items-center justify-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ShikshaIQ AI Engine Operational • Render & Vercel Cloud Native</span>
        </div>
        <p>© 2026 ShikshaIQ Official. Built for Indian Competitive Exam Aspirants.</p>
      </footer>
    </div>
  );
}