import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Medal,
  Award,
  Crown,
  Search,
  Filter,
  Flame,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react';
import API from './api';

export default function Leaderboard() {
  const [board, setBoard] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [loading, setLoading] = useState(true);
  const [examFilter, setExamFilter] = useState('All');
  const [search, setSearch] = useState('');

  const currentUser = JSON.parse(localStorage.getItem('shiksha_user') || '{}');

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/leaderboard?exam=${examFilter}`);
        if (res.data?.success) {
          setBoard(res.data.leaderboard);
          setTotalStudents(res.data.totalParticipants);
        }
      } catch (err) {
        console.error('Failed to load leaderboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [examFilter]);

  const filteredBoard = board.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  const topThree = board.slice(0, 3);
  const userStanding = board.find((u) => u.email === currentUser.email);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white py-12 px-4 sm:px-8 border-b border-slate-800 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full uppercase tracking-wider border border-amber-500/30">
              National Rankings
            </span>
            <h1 className="text-3xl sm:text-4xl font-black mt-3 tracking-tight flex items-center gap-3">
              All-India Leaderboard <Trophy className="w-8 h-8 text-amber-400" />
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Live percentile & score index evaluated across {totalStudents.toLocaleString()} aspirants.
            </p>
          </div>

          {/* User Fast Badge */}
          {userStanding && (
            <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/30">
                #{userStanding.rank}
              </div>
              <div>
                <p className="text-[11px] text-slate-300 font-bold uppercase">Your Standing</p>
                <p className="text-lg font-black text-white">{userStanding.percentile}th Percentile</p>
                <p className="text-[11px] text-emerald-400">{userStanding.totalScore} Total Points</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-4 sm:px-8 mt-8 space-y-8">
        {/* Top 3 Podium Cards */}
        {topThree.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
            {/* Rank 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center order-2 md:order-1">
              <div className="w-12 h-12 bg-slate-100 text-slate-600 rounded-2xl flex items-center justify-center font-black text-lg mb-2">
                2
              </div>
              <h3 className="font-black text-slate-900">{topThree[1].name}</h3>
              <p className="text-[11px] text-slate-400">{topThree[1].targetExam}</p>
              <div className="mt-4 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                {topThree[1].totalScore} pts • {topThree[1].avgAccuracy}% Acc
              </div>
            </div>

            {/* Rank 1 */}
            <div className="bg-gradient-to-b from-amber-500 to-amber-600 text-white p-8 rounded-3xl shadow-xl flex flex-col items-center text-center relative order-1 md:order-2 scale-105 border-2 border-amber-300">
              <Crown className="w-8 h-8 text-white absolute -top-4" />
              <div className="w-16 h-16 bg-white text-amber-600 rounded-2xl flex items-center justify-center font-black text-2xl mb-3 shadow-md">
                1
              </div>
              <h3 className="font-black text-xl text-white">{topThree[0].name}</h3>
              <p className="text-xs text-amber-100">{topThree[0].targetExam}</p>
              <div className="mt-4 px-4 py-1.5 bg-black/20 backdrop-blur-md rounded-full text-xs font-black text-white">
                {topThree[0].totalScore} pts • {topThree[0].avgAccuracy}% Acc
              </div>
            </div>

            {/* Rank 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center order-3">
              <div className="w-12 h-12 bg-orange-100 text-orange-700 rounded-2xl flex items-center justify-center font-black text-lg mb-2">
                3
              </div>
              <h3 className="font-black text-slate-900">{topThree[2].name}</h3>
              <p className="text-[11px] text-slate-400">{topThree[2].targetExam}</p>
              <div className="mt-4 px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-700">
                {topThree[2].totalScore} pts • {topThree[2].avgAccuracy}% Acc
              </div>
            </div>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['All', 'SSC & Railway', 'Banking', 'UPSC & State PSC'].map((cat) => (
              <button
                key={cat}
                onClick={() => setExamFilter(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all ${
                  examFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search aspirant name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  <th className="py-4 px-6">Rank</th>
                  <th className="py-4 px-6">Candidate</th>
                  <th className="py-4 px-6">Target Exam</th>
                  <th className="py-4 px-6 text-center">Tests Taken</th>
                  <th className="py-4 px-6 text-center">Avg Accuracy</th>
                  <th className="py-4 px-6 text-center">Percentile</th>
                  <th className="py-4 px-6 text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredBoard.map((row) => {
                  const isUser = row.email === currentUser.email;
                  return (
                    <tr
                      key={row._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isUser ? 'bg-orange-50/50 font-bold' : ''
                      }`}
                    >
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-black ${
                            row.rank === 1
                              ? 'bg-amber-400 text-white'
                              : row.rank === 2
                              ? 'bg-slate-300 text-slate-800'
                              : row.rank === 3
                              ? 'bg-orange-300 text-orange-900'
                              : 'text-slate-500'
                          }`}
                        >
                          {row.rank}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">
                          {row.name} {isUser && <span className="text-orange-600 ml-1">(You)</span>}
                        </p>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{row.targetExam}</td>
                      <td className="py-4 px-6 text-center text-slate-600">{row.totalAttempts}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="text-emerald-600 font-semibold">{row.avgAccuracy}%</span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 font-bold rounded-md text-[11px]">
                          {row.percentile}th
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right font-black text-slate-900">
                        {row.totalScore}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}