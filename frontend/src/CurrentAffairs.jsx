import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import Logo from './components/Logo';
import {
  Calendar,
  Globe,
  Award,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  BookOpen,
  Filter,
  Flame,
  Loader2,
  Sparkles,
  Flag,
  TrendingUp,
  Cpu,
  Trophy,
  Search,
  ChevronRight
} from 'lucide-react';

export default function CurrentAffairs() {
  const navigate = useNavigate();
  const [capsules, setCapsules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(10); // Pagination limit
  
  // Daily Quiz state
  const [activeTab, setActiveTab] = useState('capsules');
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);

  const categories = ['All', 'National', 'International', 'Economy', 'Science & Tech', 'Sports'];

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
      console.error('Failed to load current affairs from backend:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter capsules by search keyword
  const filteredCapsules = capsules.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const displayedCapsules = filteredCapsules.slice(0, visibleCount);

  // Collect up to 50 quiz questions from loaded capsules
  const quizList = capsules.flatMap(c => c.quiz || []).slice(0, 50);

  const handleSelectAnswer = (qIndex, optIndex) => {
    if (quizSubmitted) return;
    setQuizAnswers(prev => ({ ...prev, [qIndex]: optIndex }));
  };

  const calculateQuizScore = () => {
    let correct = 0;
    quizList.forEach((q, idx) => {
      if (quizAnswers[idx] === q.correctOptionIndex) correct++;
    });
    return correct;
  };

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'National': return <Flag className="w-3.5 h-3.5 text-orange-600" />;
      case 'International': return <Globe className="w-3.5 h-3.5 text-blue-600" />;
      case 'Economy': return <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Science & Tech': return <Cpu className="w-3.5 h-3.5 text-indigo-600" />;
      case 'Sports': return <Trophy className="w-3.5 h-3.5 text-amber-600" />;
      default: return <Sparkles className="w-3.5 h-3.5 text-orange-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="h-20 bg-white/90 border-b border-orange-200/60 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-4">
          <Logo size="sm" onClick={() => navigate('/')} />
          <div className="hidden sm:flex items-center gap-2 pl-4 border-l border-slate-200">
            <Globe className="w-4 h-4 text-orange-600" />
            <span className="font-bold text-sm text-slate-900">50+ Daily Current Affairs & Exam Vault</span>
          </div>
          <span className="text-[10px] bg-orange-50 border border-orange-200 text-orange-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
            SSC • Railways • Banking
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 border border-orange-200 p-1 rounded-xl shadow-inner">
            <button
              onClick={() => setActiveTab('capsules')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                activeTab === 'capsules' ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              50 Daily Capsules
            </button>
            <button
              onClick={() => setActiveTab('quiz')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'quiz' ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              <span>Daily 50-Q Quiz</span>
            </button>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl transition flex items-center gap-2 border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" /> Dashboard
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 sm:p-10 space-y-6">
        {activeTab === 'capsules' ? (
          <>
            {/* Search Bar & Filters */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-between">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 w-full sm:w-auto scrollbar-none">
                <Filter className="w-4 h-4 text-slate-400 shrink-0 mr-1" />
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => { setSelectedCategory(cat); setVisibleCount(10); }}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold shrink-0 transition cursor-pointer border shadow-sm ${
                      selectedCategory === cat
                        ? 'bg-gradient-to-r from-orange-500 to-amber-600 border-orange-500 text-white'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-orange-50 hover:border-orange-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search capsules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs focus:outline-none focus:border-orange-400 shadow-sm"
                />
              </div>
            </div>

            {/* Capsules Feed */}
            {loading ? (
              <div className="py-24 text-center space-y-3">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
                <p className="text-xs text-slate-500 font-medium">Loading 50+ daily current affairs capsules...</p>
              </div>
            ) : displayedCapsules.length === 0 ? (
              <div className="py-16 text-center bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-700 font-semibold">No capsules found matching your search.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-xs font-bold text-slate-500 px-1">
                  Showing {displayedCapsules.length} of {filteredCapsules.length} capsules for today
                </div>

                {displayedCapsules.map((item) => (
                  <article
                    key={item._id}
                    className="bg-white border border-slate-200 hover:border-orange-300 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4 transition group"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs bg-orange-50 border border-orange-200 text-orange-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider flex items-center gap-1.5">
                        {getCategoryIcon(item.category)} {item.category}
                      </span>
                      <span className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-orange-500" />
                        {item.date}
                      </span>
                    </div>

                    <h2 className="text-lg sm:text-xl font-black text-slate-900 group-hover:text-orange-600 transition leading-snug">
                      {item.title}
                    </h2>

                    <p className="text-sm text-slate-600 leading-relaxed">
                      {item.summary}
                    </p>

                    {item.bulletPoints && item.bulletPoints.length > 0 && (
                      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Key Exam Takeaways:
                        </span>
                        <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                          {item.bulletPoints.map((point, pIdx) => (
                            <li key={pIdx} className="leading-relaxed">{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                ))}

                {/* Load More Button for 50+ items */}
                {visibleCount < filteredCapsules.length && (
                  <button
                    onClick={() => setVisibleCount(prev => prev + 10)}
                    className="w-full py-3 bg-white hover:bg-orange-50 border border-orange-200 text-orange-700 font-bold rounded-2xl text-xs transition shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <span>Load More Capsules</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          /* Daily Quiz View (Up to 50 Qs) */
          <div className="space-y-6">
            <div className="bg-white border border-orange-200 rounded-3xl p-6 sm:p-8 flex items-center justify-between shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-500 via-blue-600 to-emerald-600"></div>
              <div>
                <h2 className="text-xl font-black text-slate-900">Daily 50-Question Practice Challenge</h2>
                <p className="text-xs text-slate-600 mt-1">Test your retention across all of today's current affairs developments.</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 border border-orange-200 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                <Flame className="w-6 h-6" />
              </div>
            </div>

            {quizSubmitted && (
              <div className="bg-white border border-emerald-300 p-6 rounded-3xl text-center space-y-3 shadow-xl">
                <Award className="w-10 h-10 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-black text-slate-900">Daily Challenge Completed!</h3>
                <p className="text-sm text-slate-600">
                  You scored <span className="text-emerald-600 font-black">{calculateQuizScore()}</span> out of <span className="font-bold">{quizList.length}</span>!
                </p>
                <button
                  onClick={() => { setQuizAnswers({}); setQuizSubmitted(false); }}
                  className="mt-2 px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-bold rounded-xl transition cursor-pointer border border-slate-300"
                >
                  Retry Challenge
                </button>
              </div>
            )}

            <div className="space-y-4">
              {quizList.map((q, qIdx) => {
                const selectedOption = quizAnswers[qIdx];
                return (
                  <div key={qIdx} className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-bold">Question {qIdx + 1} of {quizList.length}</span>
                      <span className="text-orange-600 font-bold">General Awareness Vault</span>
                    </div>
                    <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">{q.questionText}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, optIdx) => {
                        const isChosen = selectedOption === optIdx;
                        const isCorrect = q.correctOptionIndex === optIdx;
                        let buttonStyle = "bg-slate-50 border-slate-200 hover:bg-orange-50/50 text-slate-700";
                        if (quizSubmitted) {
                          if (isCorrect) buttonStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold";
                          else if (isChosen && !isCorrect) buttonStyle = "bg-rose-50 border-rose-300 text-rose-800 font-semibold";
                        } else if (isChosen) {
                          buttonStyle = "bg-orange-50 border-orange-400 text-orange-950 font-semibold";
                        }
                        return (
                          <button
                            key={optIdx}
                            disabled={quizSubmitted}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm flex items-center justify-between transition cursor-pointer ${buttonStyle}`}
                          >
                            <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                            {quizSubmitted && isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />}
                            {quizSubmitted && isChosen && !isCorrect && <XCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                    {quizSubmitted && q.explanation && (
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                        <span className="text-orange-600 font-bold">Explanation: </span>{q.explanation}
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
                className="w-full py-3.5 bg-gradient-to-r from-orange-500 via-blue-600 to-emerald-600 hover:opacity-95 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition shadow-lg shadow-orange-500/20 cursor-pointer"
              >
                Submit Daily Challenge
              </button>
            )}
          </div>
        )}
      </main>
    </div>
  );
}