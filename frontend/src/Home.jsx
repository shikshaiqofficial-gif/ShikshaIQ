import React from 'react';
import { useNavigate } from 'react-router-dom';
import Logo from './components/Logo';
import {
  Zap,
  Swords,
  BookOpen,
  Award,
  BarChart3,
  Sparkles,
  ArrowRight,
  FileText,
  Users,
  Bell,
  ShieldCheck,
  Compass,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans overflow-x-hidden selection:bg-orange-500 selection:text-white">
      {/* Background Soft Tricolour Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* 1. NAVBAR */}
      <header className="sticky top-0 z-50 h-20 bg-white/90 border-b border-orange-200/60 backdrop-blur-md px-6 sm:px-12 lg:px-16 flex items-center justify-between shadow-sm">
        <Logo size="md" />

        {/* Center Nav Links with Tricolour Accent Border */}
        <nav className="hidden xl:flex items-center gap-1 bg-gradient-to-r from-orange-50 via-white to-emerald-50 border border-orange-300 px-3 py-1.5 rounded-full shadow-inner">
          <button
            onClick={() => navigate('/')}
            className="px-4 py-1.5 text-xs font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 text-white rounded-full shadow-md transition cursor-pointer"
          >
            Home
          </button>
          
          {[
            { name: 'Exams', path: '/dashboard', hasDropdown: true },
            { name: 'Mock Tests', path: '/mock-test' },
            { name: 'Live Classes', path: '/live-classes', live: true },
            { name: 'Flashcards', path: '/flashcards' },
            { name: 'Current Affairs', path: '/current-affairs' },
            { name: 'Jobs', path: '/jobs' },
            { name: 'More', path: '/dashboard', hasDropdown: true },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-orange-50/50 rounded-full transition flex items-center gap-1 relative cursor-pointer"
            >
              {item.name}
              {item.hasDropdown && <span className="text-[10px] opacity-70">▼</span>}
              {item.live && (
                <span className="absolute -top-1 right-0 px-1.5 py-0.2 bg-emerald-600 text-white text-[7px] font-bold rounded-full animate-pulse">
                  LIVE
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right Side Actions with Tricolour Join Button */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-full bg-slate-100 border border-orange-200 hover:border-orange-400 flex items-center justify-center text-slate-700 hover:text-orange-600 transition shadow-sm cursor-pointer"
            title="Help / Support"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => navigate('/login')}
            className="px-5 py-2 text-xs font-bold text-slate-700 hover:text-orange-600 transition cursor-pointer"
          >
            Login
          </button>

          <button
            onClick={() => navigate('/register')}
            className="px-6 py-2.5 bg-gradient-to-r from-orange-500 via-blue-600 to-emerald-600 hover:opacity-95 text-white text-xs font-bold rounded-full shadow-lg shadow-orange-500/20 transition hover:scale-105 flex items-center gap-2 cursor-pointer"
          >
            Join Now <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative pt-12 pb-16 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-orange-50 via-white to-emerald-50 border border-orange-200 text-orange-800 text-[11px] font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>AI-Powered platform to practice, learn and compete with the best students across India.</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
            Learn Smart.<br />
            <span className="bg-gradient-to-r from-orange-600 via-blue-600 to-emerald-600 bg-clip-text text-transparent">
              Rank Higher.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
            AI-Powered platform to practice, learn and compete with the best students across India in SSC, Banking, and Railways exams.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => navigate('/register')}
              className="px-7 py-3.5 bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-600 hover:opacity-95 text-white font-bold rounded-xl shadow-xl shadow-orange-500/20 transition hover:scale-105 flex items-center gap-2.5 text-sm cursor-pointer"
            >
              Start Preparing Now <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('/mock-test')}
              className="px-7 py-3.5 bg-white hover:bg-orange-50 text-slate-700 border border-orange-200 font-semibold rounded-xl transition hover:scale-105 flex items-center gap-2.5 text-sm shadow-sm cursor-pointer"
            >
              <Zap className="w-4 h-4 text-orange-500" /> Take Free Mock Test
            </button>
          </div>

          <div className="flex items-center gap-3 pt-4 text-xs text-slate-600">
            <div className="flex -space-x-2">
              <div className="w-7 h-7 rounded-full bg-orange-500 border-2 border-white flex items-center justify-center font-bold text-[10px] text-white">R</div>
              <div className="w-7 h-7 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center font-bold text-[10px] text-white">A</div>
              <div className="w-7 h-7 rounded-full bg-emerald-600 border-2 border-white flex items-center justify-center font-bold text-[10px] text-white">P</div>
            </div>
            <div>
              Trusted by <strong className="text-slate-900">1,00,000+ Students</strong> • <span className="text-amber-500 font-bold">★ 4.8/5</span>
            </div>
          </div>
        </div>

        {/* Hero Visual Card */}
        <div className="lg:col-span-5 relative flex justify-center">
          <div className="w-full max-w-md bg-white border border-orange-200 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Mock Test Score</span>
                <div className="text-2xl font-black text-emerald-600 flex items-center gap-2">
                  92% <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">↑ 12% this week</span>
                </div>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center">
                <Zap className="w-5 h-5" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-bold">AIR Rank</span>
                <div className="text-xl font-black text-slate-900">#124</div>
                <span className="text-[10px] text-orange-600 font-medium">↑ 8 places this week</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <span className="text-[10px] uppercase text-slate-500 font-bold">Questions Solved</span>
                <div className="text-xl font-black text-slate-900">1,248</div>
                <span className="text-[10px] text-emerald-600 font-medium">↑ 156 this week</span>
              </div>
            </div>

            <div className="p-4 mt-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase text-slate-500 font-bold">Accuracy</span>
                <div className="text-lg font-black text-slate-900">87%</div>
              </div>
              <div className="w-8 h-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURE ICON DOCK (10 Core Modules) */}
      <section className="py-8 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
          {[
            { name: 'Flashcards', desc: 'Smart Revision', icon: BookOpen, path: '/flashcards', color: 'from-orange-500 to-amber-600' },
            { name: 'Mock Tests', desc: 'Real Exam Practice', icon: Zap, path: '/mock-test', color: 'from-blue-600 to-indigo-600' },
            { name: 'AI Doubt Solver', desc: 'Instant Solutions', icon: Sparkles, path: '/doubts', color: 'from-emerald-600 to-teal-600' },
            { name: 'Live Classes', desc: 'Learn from Experts', icon: Users, path: '/live-classes', color: 'from-orange-600 to-rose-600', live: true },
            { name: 'Current Affairs', desc: 'Daily Updates', icon: FileText, path: '/current-affairs', color: 'from-blue-600 to-cyan-600' },
            { name: 'Job Updates', desc: 'Daily Alerts', icon: Bell, path: '/jobs', color: 'from-emerald-600 to-green-600' },
            { name: 'Dashboard', desc: 'Track Progress', icon: BarChart3, path: '/dashboard', color: 'from-indigo-600 to-purple-600' },
            { name: 'Battle Arena', desc: 'Compete & Win', icon: Swords, path: '/battle', color: 'from-orange-600 to-red-600', hot: true },
            { name: 'AIR Leaderboard', desc: 'All India Ranking', icon: Award, path: '/dashboard', color: 'from-amber-500 to-yellow-600' },
            { name: 'PDF Notes', desc: 'Download Notes', icon: Compass, path: '/dashboard', color: 'from-emerald-500 to-teal-600' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(item.path)}
              className="bg-white hover:bg-orange-50/50 border border-slate-200 hover:border-orange-400 p-3.5 rounded-2xl flex flex-col items-center text-center cursor-pointer transition group relative shadow-sm"
            >
              {item.live && <span className="absolute -top-1.5 right-1 px-1.5 py-0.5 bg-rose-600 text-white text-[8px] font-bold rounded-full animate-pulse">LIVE</span>}
              {item.hot && <span className="absolute -top-1.5 right-1 px-1.5 py-0.5 bg-orange-600 text-white text-[8px] font-bold rounded-full">HOT</span>}
              
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${item.color} text-white flex items-center justify-center shadow-md mb-2 group-hover:scale-110 transition`}>
                <item.icon className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.name}</h4>
              <p className="text-[10px] text-slate-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Metrics Bar */}
      <section className="py-6 px-6 border-y border-orange-200/60 bg-white shadow-sm my-4">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <div className="text-xl font-black text-orange-600">50K+</div>
            <div className="text-xs text-slate-500">Mock Tests Daily</div>
          </div>
          <div>
            <div className="text-xl font-black text-blue-600">10K+</div>
            <div className="text-xs text-slate-500">Live Students</div>
          </div>
          <div>
            <div className="text-xl font-black text-emerald-600">99.5%</div>
            <div className="text-xs text-slate-500">Success Rate</div>
          </div>
          <div>
            <div className="text-xl font-black text-slate-900">24/7</div>
            <div className="text-xs text-slate-500">AI Support</div>
          </div>
        </div>
      </section>

      {/* 4. EXPLORE EXAMS */}
      <section className="py-12 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Explore Top Exams</h2>
          <button onClick={() => navigate('/mock-test')} className="text-xs font-bold text-orange-600 hover:underline flex items-center gap-1 cursor-pointer">
            View All Exams <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'SSC', subtitle: 'CGL, CHSL, MTS, CPO & More', tests: '32 Tests' },
            { title: 'Railways', subtitle: 'RRB NTPC, Group D, ALP, Technician', tests: '28 Tests' },
            { title: 'Banking', subtitle: 'IBPS, SBI, RBI, NABARD & More', tests: '24 Tests' },
            { title: 'State Exams', subtitle: 'UPSC, State PSC, Police, Patwari', tests: '18 Tests' },
            { title: 'Defence', subtitle: 'NDA, CDS, AFCAT, CAPF, Agniveer', tests: '16 Tests' },
            { title: 'Teaching', subtitle: 'CTET, UPTET, KVS, DSSSB, NVS', tests: '14 Tests' },
          ].map((ex, i) => (
            <div key={i} onClick={() => navigate('/mock-test')} className="p-5 bg-white border border-slate-200 hover:border-orange-400 rounded-2xl space-y-3 cursor-pointer group transition shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-sm">
                {ex.title.charAt(0)}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">{ex.title}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{ex.subtitle}</p>
              </div>
              <div className="text-[11px] font-bold text-emerald-600">{ex.tests}</div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE SPOTLIGHTS */}
      <section className="py-12 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div onClick={() => navigate('/battle')} className="bg-white border border-orange-200 hover:border-orange-400 p-6 rounded-3xl space-y-6 cursor-pointer group transition shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-orange-600">— 1V1 DUEL</span>
            <h3 className="text-xl font-black text-slate-900">Battle Arena</h3>
            <p className="text-xs text-slate-500">Compete. Challenge. Conquer peers in real-time speed tests.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-blue-600 font-bold">You (840 pts)</span>
              <span className="text-orange-600 font-bold">Opponent (790 pts)</span>
            </div>
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
              <div className="w-3/5 bg-blue-600 h-full"></div>
              <div className="w-2/5 bg-orange-500 h-full"></div>
            </div>
          </div>
          <button className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer">
            <Swords className="w-4 h-4" /> Start Battle Now
          </button>
        </div>

        <div onClick={() => navigate('/dashboard')} className="bg-white border border-amber-200 hover:border-amber-400 p-6 rounded-3xl space-y-4 cursor-pointer group transition shadow-sm">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-600">— RANKINGS</span>
              <h3 className="text-xl font-black text-slate-900">AIR Leaderboard</h3>
            </div>
            <span className="text-xs text-orange-600 font-bold">View All →</span>
          </div>
          <div className="space-y-2">
            {[
              { rank: 1, name: 'Rahul Sharma', xp: '9,842 XP' },
              { rank: 2, name: 'Aman Kumar', xp: '9,620 XP' },
              { rank: 3, name: 'Priya Singh', xp: '9,410 XP' },
              { rank: 124, name: 'You', xp: '5,210 XP', active: true },
            ].map((user, i) => (
              <div key={i} className={`flex items-center justify-between p-2.5 rounded-xl text-xs ${user.active ? 'bg-orange-50 border border-orange-200 text-orange-950 font-semibold' : 'bg-slate-50 text-slate-700'}`}>
                <div className="flex items-center gap-2.5 font-bold">
                  <span className="w-5 text-center text-amber-500">#{user.rank}</span>
                  <span>{user.name}</span>
                </div>
                <span className="font-mono text-orange-600">{user.xp}</span>
              </div>
            ))}
          </div>
        </div>

        <div onClick={() => navigate('/doubts')} className="bg-white border border-emerald-200 hover:border-emerald-400 p-6 rounded-3xl space-y-4 cursor-pointer group transition shadow-sm flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600">— INSTANT AI</span>
            <h3 className="text-xl font-black text-slate-900">AI Doubt Solver</h3>
            <p className="text-xs text-slate-500">Get instant, accurate step-by-step solutions.</p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 font-mono">
            <div className="text-slate-500">Q: Why is photosynthesis important?</div>
            <div className="text-emerald-600">Photosynthesis is important because it produces food and releases oxygen...</div>
          </div>
          <button className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer">
            <Sparkles className="w-4 h-4" /> Ask New Question
          </button>
        </div>
      </section>

      {/* 6. CURRENT AFFAIRS & JOB UPDATES */}
      <section className="py-12 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Daily Current Affairs</h3>
            <button onClick={() => navigate('/current-affairs')} className="text-xs text-orange-600 hover:underline font-bold cursor-pointer">View All →</button>
          </div>
          <div className="space-y-3">
            {[
              { cat: 'National', title: 'India Launches New Education Policy Guidelines 2026', time: '2h ago' },
              { cat: 'International', title: '26th SCO Summit Concludes in Bishkek', time: '4h ago' },
              { cat: 'Economy', title: 'India’s Real GDP Grows 7.8% in Q1', time: '6h ago' },
            ].map((news, idx) => (
              <div key={idx} onClick={() => navigate('/current-affairs')} className="p-3.5 bg-slate-50 hover:bg-orange-50/50 cursor-pointer rounded-2xl border border-slate-200 flex items-center justify-between text-xs transition">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-orange-600 uppercase">{news.cat}</span>
                  <div className="font-bold text-slate-900">{news.title}</div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">{news.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">Daily Job Updates</h3>
            <button onClick={() => navigate('/jobs')} className="text-xs text-orange-600 hover:underline font-bold cursor-pointer">View All →</button>
          </div>
          <div className="space-y-3">
            {[
              { title: 'SSC CGL 2026 Notification Out', org: 'Staff Selection Commission', tag: 'SSC', url: 'https://ssc.gov.in' },
              { title: 'RRB Technician Vacancy 2026', org: 'Railway Recruitment Board', tag: 'Railway', url: 'https://indianrailways.gov.in' },
              { title: 'IBPS PO/Clerk Recruitment 2026', org: 'Institute of Banking Personnel', tag: 'Banking', url: 'https://ibps.in' },
            ].map((job, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 px-2 py-0.5 rounded-md">{job.tag}</span>
                  <div className="font-bold text-slate-900 mt-1">{job.title}</div>
                  <div className="text-[10px] text-slate-500">{job.org}</div>
                </div>
                {/* Fixed: Opens external job link in a new browser tab */}
                <a 
                  href={job.url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl text-[11px] shrink-0 inline-block text-center cursor-pointer shadow-sm"
                >
                  Apply Now
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* WHY SHIKSHAIQ & FOOTER */}
      <section className="py-12 px-6 sm:px-12 lg:px-16 max-w-7xl mx-auto w-full grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { title: 'AI Powered', desc: 'Smart learning for better results', icon: Sparkles },
          { title: 'Expert Faculty', desc: 'India’s best educators at your service', icon: Users },
          { title: 'Practice Anywhere', desc: 'Web, Android & iOS Seamless learning', icon: Compass },
          { title: 'Detailed Analytics', desc: 'Track, analyze and improve performance', icon: BarChart3 },
          { title: 'Safe & Reliable', desc: 'Your data is safe and secure', icon: ShieldCheck },
        ].map((feat, i) => (
          <div key={i} className="p-5 bg-white border border-orange-200 rounded-2xl space-y-2 shadow-sm">
            <feat.icon className="w-6 h-6 text-orange-600" />
            <h4 className="text-sm font-bold text-slate-900">{feat.title}</h4>
            <p className="text-[11px] text-slate-500">{feat.desc}</p>
          </div>
        ))}
      </section>

      <section className="py-16 px-6 bg-gradient-to-r from-orange-50 via-white to-emerald-50 border-t border-orange-200 text-center space-y-6">
        <div className="max-w-3xl mx-auto space-y-3">
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Ready to Achieve Your Dream Rank?</h2>
          <p className="text-sm text-slate-600">Join ShikshaIQ today and take the first step towards success.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4">
          <button onClick={() => navigate('/register')} className="px-8 py-3.5 bg-gradient-to-r from-orange-500 via-blue-600 to-emerald-600 hover:opacity-95 text-white font-bold rounded-2xl text-sm shadow-xl shadow-orange-500/20 transition hover:scale-105 cursor-pointer">
            Join Now – It's Free! 🚀
          </button>
          <button onClick={() => navigate('/dashboard')} className="px-8 py-3.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-2xl text-sm transition shadow-sm cursor-pointer">
            Explore More →
          </button>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 py-12 px-6 sm:px-12 lg:px-16 grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
        <div className="space-y-4">
          <Logo size="sm" />
          <p className="text-slate-400">India's most trusted platform for competitive exam preparation.</p>
          <p>© 2026 ShikshaIQ. All rights reserved.</p>
        </div>
        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Quick Links</h4>
          <ul className="space-y-1.5">
            <li><button onClick={() => navigate('/dashboard')} className="hover:text-slate-200 text-left">About Us</button></li>
            <li><button onClick={() => navigate('/dashboard')} className="hover:text-slate-200 text-left">Contact Us</button></li>
            <li><button onClick={() => navigate('/dashboard')} className="hover:text-slate-200 text-left">Privacy Policy</button></li>
            <li><button onClick={() => navigate('/dashboard')} className="hover:text-slate-200 text-left">Terms & Conditions</button></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Exams</h4>
          <ul className="space-y-1.5">
            <li><button onClick={() => navigate('/mock-test')} className="hover:text-slate-200 text-left">SSC</button></li>
            <li><button onClick={() => navigate('/mock-test')} className="hover:text-slate-200 text-left">Railways</button></li>
            <li><button onClick={() => navigate('/mock-test')} className="hover:text-slate-200 text-left">Banking</button></li>
            <li><button onClick={() => navigate('/mock-test')} className="hover:text-slate-200 text-left">Defence</button></li>
          </ul>
        </div>
        <div className="space-y-2">
          <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">Download App</h4>
          <p className="text-slate-400">Get the full experience on Android & iOS.</p>
          <div className="flex gap-2 pt-2">
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold cursor-pointer">Google Play</button>
            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold cursor-pointer">App Store</button>
          </div>
        </div>
      </footer>
    </div>
  );
}