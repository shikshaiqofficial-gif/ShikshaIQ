import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  Clock, 
  CheckCircle2, 
  XCircle,
  AlertCircle, 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  BookOpen,
  Download,
  Loader2,
  Check,
  X,
  HelpCircle,
  ListOrdered
} from 'lucide-react';

export default function MockTest() {
  const navigate = useNavigate();
  const scorecardRef = useRef(null);

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: selectedIndex }
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Post-test Review State
  const [activeResultTab, setActiveResultTab] = useState('summary'); // 'summary' | 'review'
  const [reviewFilter, setReviewFilter] = useState('ALL'); // 'ALL' | 'INCORRECT' | 'UNATTEMPTED' | 'CORRECT'

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await API.get('/questions?limit=20');
      const list = res.data?.questions || (Array.isArray(res.data) ? res.data : []);
      
      if (list.length === 0) {
        setError("No questions found. Please make sure the database is seeded.");
      } else {
        setQuestions(list);
      }
    } catch (err) {
      console.error("Failed to load questions:", err);
      setError(err.response?.data?.message || "Failed to load questions from server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isSubmitted || loading || questions.length === 0) return;

    if (timeLeft <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted, loading, questions]);

  const handleSelectOption = (questionId, optionIdx) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleClearOption = (questionId) => {
    if (isSubmitted) return;
    setUserAnswers(prev => {
      const updated = { ...prev };
      delete updated[questionId];
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (submitting || isSubmitted) return;
    setSubmitting(true);

    const formattedAnswers = questions.map(q => ({
      questionId: q._id,
      selectedOptionIndex: userAnswers[q._id] !== undefined ? userAnswers[q._id] : null
    }));

    try {
      const token = localStorage.getItem('shiksha_token');
      if (token) {
        const res = await API.post('/tests/submit', {
          exam: questions[0]?.exam || 'SSC Mock Test',
          answers: formattedAnswers,
          timeTakenSeconds: 1200 - timeLeft
        });
        setResult(res.data.result);
      } else {
        let correct = 0;
        let incorrect = 0;
        let totalScore = 0;
        let maxMarks = 0;

        questions.forEach(q => {
          maxMarks += q.marks || 2;
          const userChoice = userAnswers[q._id];
          if (userChoice !== undefined && userChoice !== null) {
            if (userChoice === q.correctOptionIndex) {
              correct++;
              totalScore += (q.marks || 2);
            } else {
              incorrect++;
              totalScore -= (q.negativeMarks || 0.5);
            }
          }
        });

        const attempted = correct + incorrect;
        const accuracy = attempted > 0 ? ((correct / attempted) * 100).toFixed(1) : 0;
        setResult({
          totalQuestions: questions.length,
          attempted,
          correct,
          incorrect,
          score: Math.max(0, parseFloat(totalScore.toFixed(2))),
          totalMarks: maxMarks,
          accuracy: parseFloat(accuracy),
          timeTakenSeconds: 1200 - timeLeft
        });
      }
      setIsSubmitted(true);
    } catch (err) {
      console.error("Submission failed:", err);
      alert("Failed to submit test score. Showing local results instead.");
      setIsSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!scorecardRef.current) return;
    try {
      setDownloadingPdf(true);

      const element = scorecardRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
      pdf.save(`ShikshaIQ_Scorecard_${result?.exam || 'MockTest'}.pdf`);
    } catch (err) {
      console.error("PDF generation failed:", err);
      alert("Failed to generate PDF. Please try again.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-400">Loading Mock Test questions...</p>
        </div>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="bg-slate-800 border border-slate-700 max-w-md w-full p-8 rounded-2xl text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold">No Active Mock Test</h2>
          <p className="text-slate-400 text-sm">
            {error || "No active test questions found in the database."}
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={fetchQuestions}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition"
            >
              Retry Loading
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-medium rounded-xl transition"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  // Filter questions for review
  const filteredReviewQuestions = questions.filter((q) => {
    const userChoice = userAnswers[q._id];
    const isAttempted = userChoice !== undefined && userChoice !== null;
    const isCorrect = isAttempted && userChoice === q.correctOptionIndex;

    if (reviewFilter === 'INCORRECT') return isAttempted && !isCorrect;
    if (reviewFilter === 'UNATTEMPTED') return !isAttempted;
    if (reviewFilter === 'CORRECT') return isCorrect;
    return true;
  });

  // ==========================================
  // RESULT & REVIEW VIEW
  // ==========================================
  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 flex flex-col items-center">
        
        {/* Result Mode Switcher */}
        <div className="max-w-2xl w-full flex items-center justify-center mb-6">
          <div className="bg-slate-800 border border-slate-700 p-1 rounded-xl flex gap-1">
            <button
              onClick={() => setActiveResultTab('summary')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                activeResultTab === 'summary'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Score Summary</span>
            </button>
            <button
              onClick={() => setActiveResultTab('review')}
              className={`px-5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
                activeResultTab === 'review'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListOrdered className="w-4 h-4" />
              <span>Review Solutions ({questions.length})</span>
            </button>
          </div>
        </div>

        {activeResultTab === 'summary' ? (
          <div className="max-w-xl w-full flex flex-col items-center">
            {/* Printable Scorecard */}
            <div 
              ref={scorecardRef}
              className="w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6"
            >
              <div className="text-center space-y-2 border-b border-slate-700/60 pb-5">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                    ShikshaIQ Official Performance Card
                  </span>
                </div>
                <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-8 h-8" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Test Performance Report</h1>
                <p className="text-sm text-slate-400">
                  Exam: <span className="text-slate-200 font-medium">{questions[0]?.exam || 'SSC Examination'}</span> • Completed in {formatTime(result.timeTakenSeconds || 0)}
                </p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-medium">Score Obtained</span>
                  <p className="text-3xl font-extrabold text-indigo-400 mt-1">
                    {result.score} <span className="text-sm text-slate-500 font-normal">/ {result.totalMarks}</span>
                  </p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-medium">Overall Accuracy</span>
                  <p className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {result.accuracy}%
                  </p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-medium">Correct Answers</span>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    {result.correct} <span className="text-xs text-slate-500 font-normal">/{result.totalQuestions} Qs</span>
                  </p>
                </div>
                <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700/50">
                  <span className="text-xs text-slate-400 font-medium">Negative / Incorrect</span>
                  <p className="text-2xl font-bold text-rose-400 mt-1">
                    {result.incorrect} <span className="text-xs text-slate-500 font-normal">penalty</span>
                  </p>
                </div>
              </div>

              {/* Summary Stats */}
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700/40 text-xs text-slate-400 space-y-1.5">
                <div className="flex justify-between">
                  <span>Total Questions:</span>
                  <span className="text-slate-200 font-medium">{result.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span>Attempted:</span>
                  <span className="text-slate-200 font-medium">{result.attempted}</span>
                </div>
                <div className="flex justify-between">
                  <span>Unattempted:</span>
                  <span className="text-slate-200 font-medium">{result.totalQuestions - result.attempted}</span>
                </div>
              </div>

              <p className="text-[11px] text-center text-slate-500 pt-1">
                Generated via ShikshaIQ Platform • AI-Powered Competitive Exam Preparation
              </p>
            </div>

            {/* Actions */}
            <div className="w-full mt-6 space-y-3">
              <button
                onClick={handleDownloadPDF}
                disabled={downloadingPdf}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer text-sm"
              >
                {downloadingPdf ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Preparing PDF Document...</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span>Download Official Scorecard (PDF)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setActiveResultTab('review')}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm cursor-pointer shadow-lg shadow-indigo-900/20"
              >
                <BookOpen className="w-4 h-4" />
                <span>Review All Question Solutions</span>
              </button>

              <div className="flex gap-3">
                <button
                  onClick={() => navigate('/leaderboard')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-xl transition text-xs cursor-pointer"
                >
                  View Leaderboard
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium rounded-xl transition text-xs cursor-pointer"
                >
                  Dashboard
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* ==========================================
             DETAILED QUESTION SOLUTIONS REVIEW
             ========================================== */
          <div className="max-w-3xl w-full space-y-6">
            {/* Filter Chips */}
            <div className="bg-slate-800 border border-slate-700 p-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
              <span className="text-xs font-semibold text-slate-300">Filter Questions:</span>
              <div className="flex gap-2">
                {[
                  { id: 'ALL', label: `All (${questions.length})` },
                  { id: 'INCORRECT', label: `Incorrect (${result.incorrect})` },
                  { id: 'UNATTEMPTED', label: `Skipped (${result.totalQuestions - result.attempted})` },
                  { id: 'CORRECT', label: `Correct (${result.correct})` }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setReviewFilter(f.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer ${
                      reviewFilter === f.id
                        ? 'bg-indigo-600 text-white shadow'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Questions List */}
            {filteredReviewQuestions.length === 0 ? (
              <div className="py-16 text-center bg-slate-800/40 border border-slate-700/60 rounded-2xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-sm text-slate-300 font-medium">No questions match this filter.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReviewQuestions.map((q, idx) => {
                  const originalIndex = questions.findIndex(orig => orig._id === q._id);
                  const userChoice = userAnswers[q._id];
                  const isAttempted = userChoice !== undefined && userChoice !== null;
                  const isCorrect = isAttempted && userChoice === q.correctOptionIndex;

                  return (
                    <div
                      key={q._id || idx}
                      className={`bg-slate-800/80 border rounded-2xl p-6 space-y-4 shadow-xl ${
                        !isAttempted
                          ? 'border-slate-700'
                          : isCorrect
                          ? 'border-emerald-500/40'
                          : 'border-rose-500/40'
                      }`}
                    >
                      {/* Question Header */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300">Q{originalIndex + 1}.</span>
                          <span className="bg-slate-700/70 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            {q.subject}
                          </span>
                        </div>
                        <div>
                          {!isAttempted ? (
                            <span className="text-slate-400 bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-700">
                              Unattempted
                            </span>
                          ) : isCorrect ? (
                            <span className="text-emerald-300 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                              <Check className="w-3 h-3" /> Correct (+{q.marks || 2})
                            </span>
                          ) : (
                            <span className="text-rose-300 bg-rose-500/20 px-2.5 py-0.5 rounded-full border border-rose-500/30 flex items-center gap-1">
                              <X className="w-3 h-3" /> Incorrect (-{q.negativeMarks || 0.5})
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Question Text */}
                      <p className="text-sm font-medium text-slate-100 leading-relaxed">
                        {q.questionText}
                      </p>

                      {/* Options Breakdown */}
                      <div className="space-y-2">
                        {q.options.map((opt, oIdx) => {
                          const isTheCorrectOption = oIdx === q.correctOptionIndex;
                          const isTheUserOption = userChoice === oIdx;

                          let optionStyle = "bg-slate-900/50 border-slate-700/60 text-slate-300";
                          if (isTheCorrectOption) {
                            optionStyle = "bg-emerald-500/15 border-emerald-500/60 text-emerald-200 font-medium";
                          } else if (isTheUserOption && !isTheCorrectOption) {
                            optionStyle = "bg-rose-500/15 border-rose-500/60 text-rose-200 font-medium";
                          }

                          return (
                            <div
                              key={oIdx}
                              className={`p-3 rounded-xl border text-xs flex items-center justify-between ${optionStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className="w-6 h-6 rounded-md bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[11px]">
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>

                              <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                                {isTheCorrectOption && (
                                  <span className="text-emerald-400 flex items-center gap-1">
                                    <CheckCircle2 className="w-3.5 h-3.5" /> Correct Answer
                                  </span>
                                )}
                                {isTheUserOption && !isTheCorrectOption && (
                                  <span className="text-rose-400 flex items-center gap-1">
                                    <XCircle className="w-3.5 h-3.5" /> Your Choice
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Detailed Solution / Explanation */}
                      {q.explanation && (
                        <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-700 text-xs text-slate-300 space-y-1">
                          <span className="text-indigo-400 font-bold block">
                            Step-by-Step Explanation:
                          </span>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    );
  }

  // Active Test Arena View
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-6 flex items-center justify-between backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <BookOpen className="w-5 h-5 text-indigo-400" />
          <h1 className="font-bold text-base text-slate-100">
            {currentQ?.exam || 'Mock Test'}
          </h1>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium">
            {currentQ?.subject || 'Aptitude'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-lg text-sm font-mono">
            <Clock className={`w-4 h-4 ${timeLeft < 300 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`} />
            <span className={timeLeft < 300 ? 'text-rose-400 font-bold' : 'text-slate-200'}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      {/* Arena Grid */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs text-slate-400 pb-4 border-b border-slate-700/50 mb-6">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-indigo-400">+{currentQ.marks} Marks | -{currentQ.negativeMarks} Neg</span>
            </div>

            <h2 className="text-lg font-medium text-slate-100 mb-6 leading-relaxed">
              {currentQ.questionText}
            </h2>

            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = userAnswers[currentQ._id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(currentQ._id, idx)}
                    className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-200'
                        : 'bg-slate-900/50 border-slate-700 hover:bg-slate-700/40 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center ${
                        isSelected ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-sm font-medium">{opt}</span>
                    </div>
                    {isSelected && <CheckCircle2 className="w-5 h-5 text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between border-t border-slate-700/50 mt-6">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {userAnswers[currentQ._id] !== undefined && (
              <button
                onClick={() => handleClearOption(currentQ._id)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Response
              </button>
            )}

            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-sm font-medium transition cursor-pointer"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Palette */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-5 flex flex-col">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Question Palette</h3>
          
          <div className="grid grid-cols-5 gap-2 overflow-y-auto max-h-[360px] p-1">
            {questions.map((q, idx) => {
              const isAnswered = userAnswers[q._id] !== undefined;
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q._id || idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`h-9 rounded-lg text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                    isCurrent ? 'ring-2 ring-indigo-400 font-extrabold' : ''
                  } ${
                    isAnswered ? 'bg-emerald-600 text-white' : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-slate-700/50 space-y-2 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-emerald-600"></span>
              <span>Attempted</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded bg-slate-700"></span>
              <span>Unattempted</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}