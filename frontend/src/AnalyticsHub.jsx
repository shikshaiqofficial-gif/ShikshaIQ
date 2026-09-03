import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BarChart3,
  Zap,
  Calendar
} from 'lucide-react';

export default function AnalyticsHub() {
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await API.get('/leaderboard');
      if (res.data?.leaderboard) {
        setSubmissions(res.data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to fetch analytics history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calculate aggregate metrics
  const totalTests = submissions.length;
  const bestScore = totalTests > 0 ? Math.max(...submissions.map((s) => s.score || 0)) : 0;
  const avgAccuracy = totalTests > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.accuracy || 0), 0) / totalTests)
    : 0;
  const avgTimeSeconds = totalTests > 0
    ? Math.round(submissions.reduce((acc, s) => acc + (s.timeTakenSeconds || 0), 0) / totalTests)
    : 0;

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-slate-900/80 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base">Performance Analytics Hub</h1>
              <p className="text-[11px] text-slate-400">Mock History & Accuracy Metrics</p>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
          {totalTests} Tests Recorded
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-8">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Peak Score</span>
              <Award className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{bestScore} pts</div>
            <span className="text-[10px] text-slate-500 block">Personal Best in CBT Mocks</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Average Accuracy</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{avgAccuracy}%</div>
            <span className="text-[10px] text-slate-500 block">Correct vs Attempted Ratio</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Avg Time Taken</span>
              <Clock className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{formatTime(avgTimeSeconds)}</div>
            <span className="text-[10px] text-slate-500 block">Speed & Pacing Benchmark</span>
          </div>

          <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-2 shadow-lg">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Total Tests Taken</span>
              <Zap className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{totalTests}</div>
            <span className="text-[10px] text-slate-500 block">Active Simulation Count</span>
          </div>
        </div>

        {/* Test History List */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
            <h2 className="font-bold text-white">Historical Mock Scorecards</h2>
            <span className="text-slate-400">Detailed Breakdown</span>
          </div>

          {loading ? (
            <div className="py-16 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : submissions.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 space-y-2">
              <Calendar className="w-8 h-8 mx-auto text-slate-600" />
              <p>No test submissions recorded yet.</p>
              <button
                onClick={() => navigate('/mock-test')}
                className="mt-2 px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl cursor-pointer"
              >
                Take Your First Daily Mock
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {submissions.map((sub, idx) => (
                <div
                  key={sub._id || idx}
                  className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-200">{sub.userName || 'Aspirant'}</span>
                      <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold rounded-md text-[10px]">
                        {sub.exam || 'SSC CGL'}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 block font-mono">
                      Attempted: {sub.attempted || 0} / Correct: {sub.correct || 0} / Incorrect: {sub.incorrect || 0}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 font-mono">
                    <div className="text-right">
                      <span className="font-bold text-indigo-400 text-sm block">{sub.score} pts</span>
                      <span className="text-[10px] text-slate-400">{sub.accuracy}% Accuracy</span>
                    </div>
                    <div className="text-right border-l border-slate-800 pl-4">
                      <span className="text-slate-300 block">{formatTime(sub.timeTakenSeconds || 0)}</span>
                      <span className="text-[10px] text-slate-500">Duration</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}