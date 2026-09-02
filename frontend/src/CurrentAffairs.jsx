import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  Calendar,
  Globe,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowLeft,
  ChevronRight,
  BookOpen,
  Filter,
  Flame,
  Loader2
} from 'lucide-react';

export default function CurrentAffairs() {
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Daily Quiz state
  const [activeTab, setActiveTab] = useState('capsules'); // 'capsules' or 'quiz'
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const categories = ['All', 'National', 'Economy', 'Science & Tech', 'Sports', 'International'];

  useEffect(() => {
    fetchCurrentAffairs();
  }, [selectedCategory]);

  const fetchCurrentAffairs = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/current-affairs?category=${selectedCategory}`);
      if (res.data?.success) {
        setCapsules(res.data.capsules || []);
      }
    } catch (err) {
      console.error('Failed to load current affairs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Flatten all quizzes across available capsules into a 5-question daily set
  const quizList = capsules.flatMap(c => c.quiz || []).slice(0, 5);

  const handleSelectAnswer = (qIndex, optIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    quizList.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctOptionIndex) {
        correct++;
      }
    });
    return correct;
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg">Daily Current Affairs & GK</h1>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium ml-2">
            SSC • Railways
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-900/80 border border-slate-700 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('capsules')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'capsules' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Exam Capsules
          </button>
          <button
            onClick={() => setActiveTab('quiz')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'quiz' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Daily 5-Q Quiz</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        
        {activeTab === 'capsules' ? (
          <>
            {/* Category Pills Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 transition cursor-pointer border ${
                    selectedCategory === cat
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Capsules Feed */}
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Loading daily capsules...</p>
              </div>
            ) : capsules.length === 0 ? (
              <div className="py-16 text-center bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
                <BookOpen className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">No capsules found in this category.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {capsules.map((item) => (
                  <article
                    key={item._id}
                    className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 shadow-xl space-y-3 hover:border-slate-600 transition"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-semibold">
                        {item.category}
                      </span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {item.date}
                      </span>
                    </div>

                    <h2 className="text-lg font-bold text-white leading-snug">
                      {item.title}
                    </h2>

                    <p className="text-sm text-slate-300 leading-relaxed">
                      {item.summary}
                    </p>

                    {item.bulletPoints && item.bulletPoints.length > 0 && (
                      <div className="bg-slate-900/50 rounded-xl p-3.5 border border-slate-700/40 space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                          Key Exam Takeaways:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                          {item.bulletPoints.map((point, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">
                              {point}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Daily 5-Q Practice Quiz View */
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-indigo-900/50 to-purple-900/40 border border-indigo-500/30 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Daily 5-Question GK Challenge</h2>
                <p className="text-xs text-slate-300 mt-1">
                  Test your retention of today's National, Economic, and Science developments.
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-600/30 rounded-full flex items-center justify-center text-indigo-400">
                <Flame className="w-6 h-6" />
              </div>
            </div>

            {quizSubmitted && (
              <div className="bg-slate-800 border border-emerald-500/40 p-5 rounded-2xl text-center space-y-2 shadow-xl">
                <Award className="w-10 h-10 text-emerald-400 mx-auto" />
                <h3 className="text-lg font-bold text-white">Daily Quiz Completed!</h3>
                <p className="text-sm text-slate-300">
                  You scored <span className="text-emerald-400 font-bold">{calculateQuizScore()}</span> out of <span className="font-bold">{quizList.length}</span>!
                </p>
                <button
                  onClick={() => {
                    setQuizAnswers({});
                    setQuizSubmitted(false);
                  }}
                  className="mt-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-xs text-white font-medium rounded-xl transition cursor-pointer"
                >
                  Retry Challenge
                </button>
              </div>
            )}

            <div className="space-y-4">
              {quizList.map((q, qIdx) => {
                const selectedOption = quizAnswers[qIdx];
                return (
                  <div
                    key={qIdx}
                    className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 space-y-4"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>Question {qIdx + 1} of {quizList.length}</span>
                      <span className="text-indigo-400 font-semibold">General Awareness</span>
                    </div>

                    <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                      {q.questionText}
                    </p>

                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        const isCorrect = q.correctOptionIndex === optIdx;
                        
                        let buttonStyle = "bg-slate-900/60 border-slate-700 hover:bg-slate-700/40 text-slate-300";
                        if (quizSubmitted) {
                          if (isCorrect) buttonStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                          else if (isChosen && !isCorrect) buttonStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-semibold";
                        } else if (isChosen) {
                          buttonStyle = "bg-indigo-600/30 border-indigo-500 text-indigo-200 font-semibold";
                        }

                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs flex items-center justify-between transition cursor-pointer ${buttonStyle}`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                            {quizSubmitted && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>

                    {quizSubmitted && q.explanation && (
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-700 text-xs text-slate-300">
                        <span className="text-indigo-400 font-bold">Explanation: </span>
                        {q.explanation}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {!quizSubmitted && quizList.length > 0 && (
              <button
                onClick={() => setQuizSubmitted(true)}
                disabled={Object.keys(quizAnswers).length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold rounded-xl text-sm transition shadow-lg shadow-indigo-900/30 cursor-pointer"
              >
                Submit Daily Quiz
              </button>
            )}
          </div>
        )}

      </main>
    </div>
  );
}