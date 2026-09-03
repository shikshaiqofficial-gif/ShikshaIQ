import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ArrowLeft,
  BookOpen,
  Filter,
  RotateCcw,
  CheckCircle2,
  Trash2,
  AlertTriangle,
  Zap,
  Clock,
  Sparkles
} from 'lucide-react';

const SECTIONS = ['All', 'Quantitative Aptitude', 'General Intelligence & Reasoning', 'General Awareness', 'English Comprehension'];

export default function MistakeVault() {
  const navigate = useNavigate();
  const [mistakes, setMistakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState('All');
  const [revealedAnswers, setRevealedAnswers] = useState({});

  useEffect(() => {
    loadMistakes();
  }, []);

  const loadMistakes = async () => {
    setLoading(true);
    try {
      const res = await API.get('/user/mistakes');
      if (res.data?.mistakes) {
        setMistakes(res.data.mistakes);
      }
    } catch {
      // Offline fallback: pull mistakes saved locally during offline mocks
      const local = JSON.parse(localStorage.getItem('shikshaiq_mistake_vault') || '[]');
      setMistakes(local);
    } finally {
      setLoading(false);
    }
  };

  const toggleReveal = (id) => {
    setRevealedAnswers((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleMarkMastered = async (id) => {
    try {
      await API.delete(`/user/mistakes/${id}`);
    } catch {
      // Local fallback
      const updated = mistakes.filter((m) => m._id !== id);
      localStorage.setItem('shikshaiq_mistake_vault', JSON.stringify(updated));
    }
    setMistakes((prev) => prev.filter((m) => m._id !== id));
  };

  const filtered = mistakes.filter(
    (m) => selectedSection === 'All' || m.subject === selectedSection
  );

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
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base">Mistake Vault & Formula Bank</h1>
              <p className="text-[11px] text-slate-400">Targeted Spaced-Repetition Review</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-1.5 rounded-xl">
          <span className="font-bold">{mistakes.length}</span> Traps Logged
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {/* Section Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          {SECTIONS.map((sec) => (
            <button
              key={sec}
              onClick={() => setSelectedSection(sec)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                selectedSection === sec
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {sec}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Loading your mistake repository...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Unresolved Traps in this Section</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Any question you miss during daily CBT mocks or 1v1 peer duels automatically queues here for spaced revision.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item, idx) => {
              const isRevealed = revealedAnswers[item._id || idx];

              return (
                <div
                  key={item._id || idx}
                  className="bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-lg transition"
                >
                  <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-800">
                    <span className="font-bold text-indigo-400">
                      {item.subject} • {item.topic || 'Core Concept'}
                    </span>
                    <button
                      onClick={() => handleMarkMastered(item._id)}
                      className="text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition cursor-pointer"
                      title="Mark as Mastered"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span className="text-[11px]">Mastered</span>
                    </button>
                  </div>

                  <p className="text-sm font-medium text-slate-100 leading-relaxed">
                    {item.questionText}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {item.options?.map((opt, optIdx) => {
                      let style = 'bg-slate-950/60 border-slate-800 text-slate-300';
                      if (isRevealed && optIdx === item.correctOptionIndex) {
                        style = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 font-bold';
                      }

                      return (
                        <div key={optIdx} className={`p-3 rounded-xl border flex items-center gap-2 ${style}`}>
                          <span className="w-5 h-5 rounded-md bg-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-400 shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Toggle Derivation & Explanation */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <button
                      onClick={() => toggleReveal(item._id || idx)}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5 cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5" />
                      <span>{isRevealed ? 'Hide Formula Derivation' : 'Reveal Solution & Shortcut'}</span>
                    </button>

                    {item.failedIn && (
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Logged from: {item.failedIn}
                      </span>
                    )}
                  </div>

                  {isRevealed && (
                    <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
                      <span className="text-emerald-400 font-bold block">Derivation & Shortcut Trick:</span>
                      <p className="leading-relaxed">{item.explanation}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}