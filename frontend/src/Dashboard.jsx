import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import CutoffPredictor from './CutoffPredictor';
import {
  BookOpen,
  HelpCircle,
  Award,
  Sliders,
  Database,
  LogOut,
  Sparkles,
  Zap,
  FileText,
  Swords,
  AlertTriangle
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentAffairs, setCurrentAffairs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [userRes, lbRes, caRes] = await Promise.allSettled([
        API.get('/auth/me'),
        API.get('/leaderboard'),
        API.get('/current-affairs')
      ]);

      if (userRes.status === 'fulfilled' && userRes.value.data?.user) {
        setUser(userRes.value.data.user);
      }
      if (lbRes.status === 'fulfilled' && lbRes.value.data?.leaderboard) {
        setLeaderboard(lbRes.value.data.leaderboard.slice(0, 5));
      }
      if (caRes.status === 'fulfilled' && caRes.value.data?.capsules) {
        setCurrentAffairs(caRes.value.data.capsules.slice(0, 3));
      }
    } catch (err) {
      console.error('Error loading dashboard state:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="h-16 bg-slate-900/80 border-b border-slate-800/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-600/30">
            S
          </div>
          <div>
            <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              ShikshaIQ <span className="text-[10px] bg-indigo-500/20 text-indigo-400 font-mono px-1.5 py-0.5 rounded-full border border-indigo-500/30">PRO</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex flex-col text-right">
            <span className="text-xs font-bold text-slate-200">{user?.name || 'Aspirant'}</span>
            <span className="text-[10px] text-slate-400">{user?.targetExam || 'SSC CGL 2026'}</span>
          </div>

          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Hero Welcome Banner */}
        <section className="relative overflow-hidden bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>AI Exam Intelligence Active (gemini-3.6-flash)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
              Ready for today's Tier-1 All-India Mock, {user?.name?.split(' ')[0] || 'Aspirant'}?
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Target your speed, pinpoint time traps, and improve your accuracy across Quantitative Aptitude, Reasoning, GK, and English.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <button
                onClick={() => navigate('/mock-test')}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <Zap className="w-4 h-4" /> Start Daily 100-Q Mock
              </button>
              <button
                onClick={() => navigate('/battle')}
                className="px-5 py-2.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-rose-900/30 cursor-pointer"
              >
                <Swords className="w-4 h-4" /> 1v1 Peer Battle
              </button>
              <button
                onClick={() => navigate('/mistakes')}
                className="px-5 py-2.5 bg-amber-600/90 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-amber-900/30 cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" /> Mistake Vault
              </button>
              <button
                onClick={() => navigate('/flashcards')}
                className="px-5 py-2.5 bg-violet-600/90 hover:bg-violet-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-violet-900/30 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" /> AI Flashcards
              </button>
            </div>
          </div>
        </section>

        {/* Feature Action Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
          <button
            onClick={() => navigate('/mock-test')}
            className="p-4 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 rounded-2xl text-left space-y-2.5 transition duration-200 group shadow-lg cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white group-hover:text-indigo-300 transition">
                Daily 100 Mock
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                Full CBT simulation with negative marking.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/battle')}
            className="p-4 bg-slate-900/80 border border-slate-800 hover:border-rose-500/60 rounded-2xl text-left space-y-2.5 transition duration-200 group shadow-lg cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 group-hover:scale-105 transition">
              <Swords className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white group-hover:text-rose-300 transition">
                1v1 Peer Battle
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                Live WebSocket duel with progress sync.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/mistakes')}
            className="p-4 bg-slate-900/80 border border-slate-800 hover:border-amber-500/60 rounded-2xl text-left space-y-2.5 transition duration-200 group shadow-lg cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-105 transition">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white group-hover:text-amber-300 transition">
                Mistake Vault
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                Spaced repetition review & shortcuts.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/flashcards')}
            className="p-4 bg-slate-900/80 border border-slate-800 hover:border-violet-500/60 rounded-2xl text-left space-y-2.5 transition duration-200 group shadow-lg cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-105 transition">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white group-hover:text-violet-300 transition">
                AI Flashcards
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                High-retention interactive flip decks.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/custom-quiz')}
            className="p-4 bg-slate-900/80 border border-slate-800 hover:border-cyan-500/60 rounded-2xl text-left space-y-2.5 transition duration-200 group shadow-lg cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white group-hover:text-cyan-300 transition">
                Topic Drill
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                Custom section & difficulty quizzes.
              </p>
            </div>
          </button>
<button
  onClick={() => navigate('/analytics')}
  className="p-4 bg-slate-900/80 border border-slate-800 hover:border-indigo-500/60 rounded-2xl text-left space-y-2.5 transition duration-200 group shadow-lg cursor-pointer"
>
  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition">
    <BarChart3 className="w-4 h-4" />
  </div>
  <div>
    <h3 className="font-bold text-xs text-white group-hover:text-indigo-300 transition">
      Analytics Hub
    </h3>
    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
      Historical scorecards & accuracy metrics.
    </p>
  </div>
</button>

          <button
            onClick={() => navigate('/doubts')}
            className="p-4 bg-slate-900/80 border border-slate-800 hover:border-emerald-500/60 rounded-2xl text-left space-y-2.5 transition duration-200 group shadow-lg cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white group-hover:text-emerald-300 transition">
                Doubt Solver
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                Multimodal AI math & diagram solver.
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin')}
            className="p-4 bg-slate-900/80 border border-slate-800 hover:border-purple-500/60 rounded-2xl text-left space-y-2.5 transition duration-200 group shadow-lg cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-xs text-white group-hover:text-purple-300 transition">
                Admin Portal
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                Bulk JSON/CSV question bank imports.
              </p>
            </div>
          </button>
        </section>

        {/* Dual Analytics & Feeds Section */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: All-India Leaderboard */}
          <div className="lg:col-span-7 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-bold text-white">All-India Daily Mock Leaderboard</h2>
              </div>
              <span className="text-[11px] text-slate-400">Live Standings</span>
            </div>

            <div className="space-y-2.5">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, idx) => (
                  <div
                    key={entry._id || idx}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold text-[11px] ${
                          idx === 0
                            ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                            : idx === 1
                            ? 'bg-slate-300/20 text-slate-200 border border-slate-300/40'
                            : idx === 2
                            ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <span className="font-semibold text-slate-200 block">{entry.userName}</span>
                        <span className="text-[10px] text-slate-500">{entry.exam}</span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      <span className="font-bold text-indigo-400 text-sm">{entry.score} pts</span>
                      <span className="text-[10px] text-slate-400 block">{entry.accuracy}% Acc</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-500">
                  Submit today's mock test to claim rank #1 on the leaderboard.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Cut-off Predictor & Exam Capsules */}
          <div className="lg:col-span-5 space-y-6">
            {/* Embedded Tier-1 Cut-Off Predictor Widget */}
            <CutoffPredictor defaultScore={130} exam={user?.targetExam || 'SSC CGL'} />

            {/* Daily Exam Capsules */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-sm font-bold text-white">Daily Exam Capsules</h2>
                </div>
                <span className="text-[11px] text-slate-400">Static GK & PIB</span>
              </div>

              <div className="space-y-3">
                {currentAffairs.length > 0 ? (
                  currentAffairs.map((ca, idx) => (
                    <div
                      key={ca._id || idx}
                      className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                          {ca.category || 'National'}
                        </span>
                        <span className="text-[10px] text-slate-500">{ca.date}</span>
                      </div>
                      <h4 className="font-semibold text-slate-200 leading-snug">{ca.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2">{ca.summary}</p>
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase">National Economy</span>
                      <span className="text-[10px] text-slate-500">Updated Today</span>
                    </div>
                    <h4 className="font-semibold text-slate-200">RBI Monetary Policy Review & Repo Rate Revisions</h4>
                    <p className="text-[11px] text-slate-400">
                      High relevance for upcoming SSC CGL General Awareness and Banking General Economy sections.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}