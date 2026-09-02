import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ArrowLeft,
  Award,
  Medal,
  Trophy,
  Flame,
  Clock,
  Target,
  Search,
  User,
  RefreshCw,
  TrendingUp
} from 'lucide-react';

export default function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedExam, setSelectedExam] = useState('All');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await API.get('/leaderboard');
      const list = res.data?.leaderboard || (Array.isArray(res.data) ? res.data : []);
      setLeaderboard(list);
    } catch (err) {
      console.error('Failed to load leaderboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Safe date formatter that prevents .toLocaleString() crash on undefined/null
  const formatDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    try {
      const d = new Date(dateVal);
      return isNaN(d.getTime()) ? 'Recently' : d.toLocaleDateString();
    } catch {
      return 'Recently';
    }
  };

  // Format seconds into MM:SS
  const formatTime = (secs) => {
    if (!secs || isNaN(secs)) return 'N/A';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}m ${s}s`;
  };

  const filtered = leaderboard.filter((item) => {
    const matchesExam = selectedExam === 'All' || item.exam === selectedExam;
    const matchesSearch =
      !search ||
      (item.userName && item.userName.toLowerCase().includes(search.toLowerCase().trim()));
    return matchesExam && matchesSearch;
  });

  const topThree = filtered.slice(0, 3);
  const restList = filtered.slice(3);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h1 className="font-bold text-lg">All-India Aspirant Leaderboard</h1>
          </div>
        </div>

        <button
          onClick={fetchLeaderboard}
          className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          title="Refresh Rankings"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Filter Controls */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between shadow-xl">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search aspirant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'SSC CGL', 'RRB NTPC', 'SSC Mock Test'].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedExam(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer border ${
                  selectedExam === tab
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Podium Highlight (Top 3) */}
        {topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            {/* Rank 2 */}
            {topThree[1] && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col items-center justify-between text-center relative order-2 md:order-1 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-slate-400 flex items-center justify-center font-bold text-slate-200 mb-2">
                  2
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{topThree[1].userName}</h4>
                  <span className="text-[11px] text-indigo-400 font-medium">{topThree[1].exam || 'Exam'}</span>
                </div>
                <div className="mt-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 w-full flex justify-around text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Score</span>
                    <strong className="text-white font-mono">{topThree[1].score ?? 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Accuracy</span>
                    <strong className="text-emerald-400 font-mono">{topThree[1].accuracy ?? 0}%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 1 */}
            {topThree[0] && (
              <div className="bg-gradient-to-b from-amber-500/10 to-slate-800/80 border border-amber-500/40 rounded-2xl p-6 flex flex-col items-center justify-between text-center relative order-1 md:order-2 shadow-2xl scale-105">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center font-black text-amber-300 mb-2 text-lg">
                  👑 1
                </div>
                <div>
                  <h4 className="font-black text-white text-base">{topThree[0].userName}</h4>
                  <span className="text-xs text-amber-400 font-semibold">{topThree[0].exam || 'Exam'}</span>
                </div>
                <div className="mt-4 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-amber-500/30 w-full flex justify-around text-xs shadow-md">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Score</span>
                    <strong className="text-amber-300 font-mono text-sm">{topThree[0].score ?? 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Accuracy</span>
                    <strong className="text-emerald-400 font-mono text-sm">{topThree[0].accuracy ?? 0}%</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Rank 3 */}
            {topThree[2] && (
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col items-center justify-between text-center relative order-3 md:order-3 shadow-lg">
                <div className="w-10 h-10 rounded-full bg-amber-800/40 border-2 border-amber-700 flex items-center justify-center font-bold text-amber-400 mb-2">
                  3
                </div>
                <div>
                  <h4 className="font-bold text-slate-100 text-sm">{topThree[2].userName}</h4>
                  <span className="text-[11px] text-indigo-400 font-medium">{topThree[2].exam || 'Exam'}</span>
                </div>
                <div className="mt-3 bg-slate-900/80 px-4 py-2 rounded-xl border border-slate-700 w-full flex justify-around text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Score</span>
                    <strong className="text-white font-mono">{topThree[2].score ?? 0}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Accuracy</span>
                    <strong className="text-emerald-400 font-mono">{topThree[2].accuracy ?? 0}%</strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full Rankings Table */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/70 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="px-4 py-3 text-center w-16">Rank</th>
                  <th className="px-4 py-3">Aspirant</th>
                  <th className="px-4 py-3">Exam</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-center">Accuracy</th>
                  <th className="px-4 py-3 text-center">Time</th>
                  <th className="px-4 py-3 text-right">Attempted</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filtered.map((item, index) => (
                  <tr key={item._id || index} className="hover:bg-slate-800/60 transition">
                    <td className="px-4 py-3 text-center font-bold text-slate-300">
                      #{index + 1}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-xs">
                        {item.userName ? item.userName[0].toUpperCase() : 'U'}
                      </div>
                      <span>{item.userName || 'Anonymous Aspirant'}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-400">{item.exam || 'SSC CGL'}</td>
                    <td className="px-4 py-3 text-center font-mono font-bold text-indigo-300">
                      {item.score ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-emerald-400 font-semibold">
                      {item.accuracy ?? 0}%
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-slate-400">
                      {formatTime(item.timeTakenSeconds)}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-400 text-[11px]">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching aspirant scores recorded yet.
            </div>
          )}
        </div>

      </main>
    </div>
  );
}