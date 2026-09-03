import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './components/Logo';
import {
  Zap,
  Swords,
  BookOpen,
  Award,
  Sliders,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  Sparkles,
  BarChart3,
  Database,
  AlertTriangle,
  Briefcase,
  Video,
  FileText,
  Clock,
  Share2,
  Tag,
  ShieldCheck
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white overflow-x-hidden font-sans">
      {/* ---------------------------------------------------- */}
      {/* NAVIGATION HEADER */}
      {/* ---------------------------------------------------- */}
      <header className="h-20 bg-[#070b19]/90 border-b border-slate-800/80 px-4 sm:px-12 flex items-center justify-between sticky top-0 z-50 backdrop-blur-xl">
        <Logo size="md" />

        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-xs sm:text-sm font-bold text-slate-300 hover:text-white transition cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-rose-600 hover:from-orange-600 hover:to-rose-700 text-white text-xs sm:text-sm font-bold rounded-xl transition shadow-lg shadow-orange-600/30 cursor-pointer flex items-center gap-1.5"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ---------------------------------------------------- */}
      {/* HERO BANNER SECTION */}
      {/* ---------------------------------------------------- */}
      <section className="relative pt-12 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-[#0b132b] border border-indigo-500/20 rounded-3xl p-6 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold tracking-wide">
              <Sparkles className="w-4 h-4" />
              <span>ONE PLATFORM. EVERY SOLUTION.</span>
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
              Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-orange-400">ShikshaIQ</span>
            </h1>

            <p className="text-xs sm:text-sm uppercase tracking-widest text-orange-400 font-bold">
              — Learn Smart. Rank Higher. —
            </p>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Your All-in-One Learning Platform for Competitive Exams across India. Mock tests, live peer battles, and AI tools built for top ranks.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => navigate('/mock-test')}
                className="px-6 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-2xl transition flex items-center gap-2 shadow-lg shadow-orange-600/30 cursor-pointer text-xs sm:text-sm"
              >
                <Zap className="w-4 h-4" /> Launch Daily 100-Q Mock
              </button>
              <button
                onClick={() => navigate('/battle')}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold rounded-2xl transition flex items-center gap-2 cursor-pointer text-xs sm:text-sm"
              >
                <Swords className="w-4 h-4 text-rose-400" /> Enter Live 1v1 Battle
              </button>
            </div>
          </div>

          {/* Trusted Badge Box */}
          <div className="bg-slate-950/80 border border-slate-800 p-6 rounded-3xl text-center space-y-3 shadow-xl shrink-0 w-full md:w-72">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold block">Trusted By</span>
              <span className="text-2xl font-black text-amber-400 font-mono">500K+</span>
              <span className="text-xs font-semibold text-slate-200 block">Students Across India</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* "EVERYTHING YOU NEED TO SUCCEED" FEATURE GRID */}
      {/* ---------------------------------------------------- */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-block px-4 py-1 rounded-full bg-slate-900 border border-slate-800 text-indigo-400 text-xs font-bold uppercase tracking-widest">
            — EVERYTHING YOU NEED TO SUCCEED —
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">Explore Our Core Prep Modules</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Card 1: Online Courses */}
          <div onClick={() => navigate('/dashboard')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">ONLINE COURSES</h4>
              <p className="text-[10px] text-slate-400 mt-1">Expert-led courses for every exam</p>
            </div>
          </div>

          {/* Card 2: Test Series */}
          <div onClick={() => navigate('/mock-test')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center group-hover:scale-110 transition">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">TEST SERIES</h4>
              <p className="text-[10px] text-slate-400 mt-1">Unlimited tests with detailed analysis</p>
            </div>
          </div>

          {/* Card 3: AI Doubt Solver */}
          <div onClick={() => navigate('/doubts')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">AI DOUBT SOLVER</h4>
              <p className="text-[10px] text-slate-400 mt-1">Instant solutions anytime, anywhere</p>
            </div>
          </div>

          {/* Card 4: Job Alerts */}
          <div onClick={() => navigate('/dashboard')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-rose-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-rose-600/20 text-rose-400 flex items-center justify-center group-hover:scale-110 transition">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">JOB ALERTS</h4>
              <p className="text-[10px] text-slate-400 mt-1">Latest government & private job updates</p>
            </div>
          </div>

          {/* Card 5: Live Classes */}
          <div onClick={() => navigate('/dashboard')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center group-hover:scale-110 transition">
              <Video className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">LIVE CLASSES</h4>
              <p className="text-[10px] text-slate-400 mt-1">Learn live from top educators</p>
            </div>
          </div>

          {/* Card 6: Notes & PDFs */}
          <div onClick={() => navigate('/dashboard')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-violet-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-violet-600/20 text-violet-400 flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">NOTES & PDFS</h4>
              <p className="text-[10px] text-slate-400 mt-1">Download free notes & study material</p>
            </div>
          </div>

          {/* Card 7: Daily Current Affairs */}
          <div onClick={() => navigate('/dashboard')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-orange-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-orange-600/20 text-orange-400 flex items-center justify-center group-hover:scale-110 transition">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">DAILY CURRENT AFFAIRS</h4>
              <p className="text-[10px] text-slate-400 mt-1">Stay updated everyday</p>
            </div>
          </div>

          {/* Card 8: Previous Year Papers */}
          <div onClick={() => navigate('/dashboard')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-pink-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-pink-600/20 text-pink-400 flex items-center justify-center group-hover:scale-110 transition">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">PREVIOUS YEAR PAPERS</h4>
              <p className="text-[10px] text-slate-400 mt-1">Practice with previous year papers</p>
            </div>
          </div>

          {/* Card 9: Performance Tracker */}
          <div onClick={() => navigate('/analytics')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-cyan-600/20 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">PERFORMANCE TRACKER</h4>
              <p className="text-[10px] text-slate-400 mt-1">Track your progress and improve</p>
            </div>
          </div>

          {/* Card 10: Refer & Earn */}
          <div onClick={() => navigate('/dashboard')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-green-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-green-600/20 text-green-400 flex items-center justify-center group-hover:scale-110 transition">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">REFER & EARN</h4>
              <p className="text-[10px] text-slate-400 mt-1">Refer friends & earn exciting rewards</p>
            </div>
          </div>

          {/* Card 11: Coupons & Offers */}
          <div onClick={() => navigate('/dashboard')} className="p-4 bg-slate-900/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl space-y-3 transition cursor-pointer group shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center group-hover:scale-110 transition">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">COUPONS & OFFERS</h4>
              <p className="text-[10px] text-slate-400 mt-1">Save more with amazing offers</p>
            </div>
          </div>

          {/* Card 12: 100% Trusted Platform */}
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3 shadow-lg text-center">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-white">100% TRUSTED PLATFORM</h4>
              <p className="text-[10px] text-slate-400 mt-1">Safe, secure & trusted by 500K+ students</p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------- */}
      {/* FOOTER CALL-TO-ACTION */}
      {/* ---------------------------------------------------- */}
      <section className="py-12 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-gradient-to-r from-orange-600 to-rose-600 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-black text-white">Start Your Success Journey Today!</h3>
            <p className="text-xs sm:text-sm text-orange-100">Download our mobile app or visit our official web portal.</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <div className="px-4 py-2.5 bg-slate-950 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg">
              <span>Google Play (Coming Soon)</span>
            </div>
            <a href="https://www.shikshaiq.com" target="_blank" rel="noopener noreferrer" className="px-6 py-2.5 bg-white text-orange-600 font-extrabold rounded-xl text-xs transition shadow-lg hover:bg-slate-100">
              www.shikshaiq.com
            </a>
          </div>
        </div>
      </section>

      {/* Footer Branding Bar */}
      <footer className="mt-auto bg-[#04060d] border-t border-slate-900 py-6 px-4 sm:px-12 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-6">
          <span>📚 Learn Smart</span>
          <span>⚡ Stay Consistent</span>
          <span>🏆 Crack Every Exam</span>
        </div>
        <p>© 2026 ShikshaIQ. Rank Higher!</p>
      </footer>
    </div>
  );
}