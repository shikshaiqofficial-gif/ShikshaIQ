import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  Send,
  Loader2,
  ShieldCheck,
  Download,
  Flame,
  Sparkles,
  Layers,
  Target
} from 'lucide-react';

const SECTIONS = [
  { id: 'quant', name: 'Quantitative Aptitude', short: 'Quant', startIndex: 0, endIndex: 24 },
  { id: 'reasoning', name: 'Reasoning & Intelligence', short: 'Reasoning', startIndex: 25, endIndex: 49 },
  { id: 'ga', name: 'General Awareness', short: 'General Awareness', startIndex: 50, endIndex: 74 },
  { id: 'english', name: 'English Comprehension', short: 'English', startIndex: 75, endIndex: 99 }
];

export default function MockTest() {
  const navigate = useNavigate();

  // Test states
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeSectionId, setActiveSectionId] = useState('quant');
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [markedForReview, setMarkedForReview] = useState([]);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 minutes for Tier-1
  const [testActive, setTestActive] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [testMode, setTestMode] = useState('ai_daily');

  useEffect(() => {
    fetchQuestions('ai_daily');
  }, []);

  const fetchQuestions = async (mode = testMode) => {
    try {
      setLoading(true);
      let list = [];

      if (mode === 'ai_daily') {
        const res = await API.get('/tests/daily-100-mock?exam=SSC%20CGL');
        list = res.data?.questions || [];
      } else {
        const res = await API.get('/questions?limit=25');
        list = res.data?.questions || [];
      }

      if (list.length > 0) {
        setQuestions(list);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Sync active section tab when candidate advances question
  useEffect(() => {
    const sec = SECTIONS.find(
      (s) => currentIndex >= s.startIndex && currentIndex <= Math.min(s.endIndex, questions.length - 1)
    );
    if (sec && sec.id !== activeSectionId) {
      setActiveSectionId(sec.id);
    }
  }, [currentIndex, questions.length]);

  // Timer Countdown (60 Minutes)
  useEffect(() => {
    let timer = null;
    if (testActive && timeRemaining > 0 && !testFinished) {
      timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [testActive, timeRemaining, testFinished]);

  const handleStartTest = () => {
    setSelectedAnswers({});
    setMarkedForReview([]);
    setCurrentIndex(0);
    setActiveSectionId('quant');
    setTimeRemaining(3600);
    setTestFinished(false);
    setScoreResult(null);
    setTestActive(true);
  };

  const handleSelectOption = (qId, optionIdx) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qId]: optionIdx
    }));
  };

  const toggleMarkForReview = (idx) => {
    setMarkedForReview((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const switchSection = (sectionId) => {
    setActiveSectionId(sectionId);
    const sec = SECTIONS.find((s) => s.id === sectionId);
    if (sec && questions[sec.startIndex]) {
      setCurrentIndex(sec.startIndex);
    }
  };

  const handleSubmitTest = async () => {
    if (submitting || testFinished) return;

    try {
      setSubmitting(true);
      setTestActive(false);

      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedOptionIndex: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : null
      }));

      const timeSpent = 3600 - timeRemaining;

      try {
        const res = await API.post('/tests/submit', {
          exam: 'SSC CGL 100-Q CBT Mock',
          answers: formattedAnswers,
          timeTakenSeconds: timeSpent
        });
        if (res.data?.result) {
          setScoreResult(res.data.result);
          setTestFinished(true);
          return;
        }
      } catch (serverErr) {
        console.warn('Fallback to client scoring grading:', serverErr);
      }

      // Local scoring fallback
      let correct = 0;
      let incorrect = 0;
      let score = 0;
      let totalMarks = 0;

      questions.forEach((q) => {
        totalMarks += (q.marks || 2);
        const userChoice = selectedAnswers[q._id];
        if (userChoice !== undefined && userChoice !== null) {
          if (userChoice === q.correctOptionIndex) {
            correct++;
            score += (q.marks || 2);
          } else {
            incorrect++;
            score -= (q.negativeMarks || 0.5);
          }
        }
      });

      const attempted = correct + incorrect;
      const accuracy = attempted > 0 ? parseFloat(((correct / attempted) * 100).toFixed(1)) : 0;
      const finalScore = Math.max(0, parseFloat(score.toFixed(2)));

      setScoreResult({
        totalQuestions: questions.length,
        attempted,
        correct,
        incorrect,
        score: finalScore,
        totalMarks,
        accuracy,
        timeTakenSeconds: timeSpent
      });
      setTestFinished(true);
    } catch (err) {
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const calculateBenchmark = (score, accuracy, totalMarks) => {
    const safeTotal = totalMarks || 200;
    const percentage = Math.max(0, Math.min(100, (score / safeTotal) * 100));
    const weightedRating = (percentage * 0.7) + (accuracy * 0.3);
    const percentile = Math.min(99.8, Math.max(15.0, parseFloat((weightedRating * 0.98).toFixed(1))));

    const candidatePool = 150000;
    const predictedRank = Math.max(1, Math.round(candidatePool * (1 - (percentile / 100))));

    let status = 'Safe Zone';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    let tip = 'Strong probability of clearing Tier-1. Maintain speed and accuracy balance.';

    if (percentile < 70) {
      status = 'Needs Immediate Revision';
      statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      tip = 'Score currently falls below the projected UR category cutoff. Eliminate unforced negative guesses.';
    } else if (percentile < 85) {
      status = 'Borderline Cutoff';
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      tip = 'Borderline Tier-1 qualification mark. Raise Quantitative & Reasoning accuracy.';
    }

    return { percentile, predictedRank, candidatePool, status, statusColor, tip };
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('test-scorecard-report');
    if (!element) return;

    try {
      setDownloadingPdf(true);
      const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#0f172a', useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      let heightLeft = pdfHeight;
      let position = 0;
      const pageHeight = pdf.internal.pageSize.getHeight();

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`ShikshaIQ_Scorecard_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF scorecard.');
    } finally {
      setDownloadingPdf(false);
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const currentQ = questions[currentIndex];
  const activeSection = SECTIONS.find((s) => s.id === activeSectionId) || SECTIONS[0];
  const visibleQuestions = questions.slice(activeSection.startIndex, activeSection.endIndex + 1);
  const benchmark = scoreResult ? calculateBenchmark(scoreResult.score, scoreResult.accuracy, scoreResult.totalMarks) : null;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-sm sm:text-base">ShikshaIQ CBT Mock Arena</h1>
          </div>
        </div>

        {testActive && (
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-amber-400 shadow-md">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>Time Left: {formatTimer(timeRemaining)}</span>
          </div>
        )}
      </header>

      {/* Main Screen Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 flex flex-col justify-center">

        {/* 1. START SCREEN */}
        {!testActive && !testFinished && (
          <div className="max-w-xl mx-auto w-full bg-slate-800/70 border border-slate-700/70 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                SSC CGL 100-Question Tier-1 Simulation
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Official Tier-1 examination pattern: 4 sections of 25 questions each, +2 correct, -0.5 negative marking, and real-time national percentile benchmarking.
              </p>
            </div>

            {/* Test Mode Selector */}
            <div className="bg-slate-900/80 p-1.5 rounded-2xl border border-slate-700/80 flex gap-1">
              <button
                type="button"
                onClick={() => {
                  setTestMode('ai_daily');
                  fetchQuestions('ai_daily');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  testMode === 'ai_daily'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-900/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-purple-300" />
                <span>AI 100-Q Daily Mock</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setTestMode('pyq_bank');
                  fetchQuestions('pyq_bank');
                }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  testMode === 'pyq_bank'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-300" />
                <span>Standard PYQ Bank</span>
              </button>
            </div>

            <div className="grid grid-cols-4 gap-2 bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px]">Total Qs</span>
                <strong className="text-white text-xs sm:text-sm font-mono">{questions.length}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Total Marks</span>
                <strong className="text-white text-xs sm:text-sm font-mono">200</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Duration</span>
                <strong className="text-white text-xs sm:text-sm font-mono">60 Mins</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Marking</span>
                <strong className="text-emerald-400 text-xs sm:text-sm font-mono">+2 / -0.5</strong>
              </div>
            </div>

            <button
              onClick={handleStartTest}
              disabled={loading || questions.length === 0}
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition shadow-lg shadow-indigo-900/30 flex items-center justify-center gap-2 cursor-pointer text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading Daily 100 Mock...</span>
                </>
              ) : (
                <>
                  <span>Begin 100-Question Exam</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* 2. ACTIVE TEST ARENA */}
        {testActive && currentQ && (
          <div className="space-y-4">
            {/* Sectional Navigation Tabs */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-2 flex items-center gap-1.5 overflow-x-auto shadow-lg">
              {SECTIONS.map((sec) => {
                const isActive = activeSectionId === sec.id;
                // Count answered in this specific section
                const answeredCount = questions
                  .slice(sec.startIndex, sec.endIndex + 1)
                  .filter((q) => selectedAnswers[q._id] !== undefined).length;

                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => switchSection(sec.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shrink-0 border ${
                      isActive
                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-900/80 border-slate-700/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <span>{sec.short}</span>
                    <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono ${
                      isActive ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {answeredCount}/25
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Split Screen Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
              {/* Question Screen (8 cols) */}
              <div className="lg:col-span-8 bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-indigo-400 uppercase tracking-wider">
                      {currentQ.subject || activeSection.name}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400">{currentQ.topic || 'General'}</span>
                  </div>
                  <span className="text-slate-300 font-bold font-mono">
                    Q {currentIndex + 1} of {questions.length}
                  </span>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                    {currentQ.questionText}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-2.5 pt-2">
                    {currentQ.options?.map((opt, idx) => {
                      const isSelected = selectedAnswers[currentQ._id] === idx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectOption(currentQ._id, idx)}
                          className={`w-full p-3.5 sm:p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-3 ${
                            isSelected
                              ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md'
                              : 'bg-slate-900/70 border-slate-700/70 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                              isSelected
                                ? 'bg-indigo-600 text-white'
                                : 'bg-slate-800 border border-slate-700 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </span>
                          <span className="flex-1">{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Question Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-700/60">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                      disabled={currentIndex === 0}
                      className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer flex items-center gap-1.5"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => toggleMarkForReview(currentIndex)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                        markedForReview.includes(currentIndex)
                          ? 'bg-purple-600/20 border-purple-500 text-purple-300'
                          : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {markedForReview.includes(currentIndex) ? 'Marked for Review' : 'Mark for Review'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {selectedAnswers[currentQ._id] !== undefined && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = { ...selectedAnswers };
                          delete updated[currentQ._id];
                          setSelectedAnswers(updated);
                        }}
                        className="px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                      >
                        Clear
                      </button>
                    )}

                    {currentIndex + 1 < questions.length ? (
                      <button
                        type="button"
                        onClick={() => setCurrentIndex((prev) => prev + 1)}
                        className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-indigo-900/30"
                      >
                        <span>Save & Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSubmitTest}
                        disabled={submitting}
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/30"
                      >
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        <span>Submit 100-Q Test</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sectional Palette Panel (4 cols) */}
              <div className="lg:col-span-4 bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    {activeSection.short} Palette (25 Qs)
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Q{activeSection.startIndex + 1} - Q{activeSection.endIndex + 1}
                  </span>
                </div>

                {/* 5x5 Matrix for current 25 questions */}
                <div className="grid grid-cols-5 gap-2 max-h-[300px] overflow-y-auto pr-1">
                  {visibleQuestions.map((q, localIdx) => {
                    const globalIdx = activeSection.startIndex + localIdx;
                    const isAnswered = selectedAnswers[q._id] !== undefined;
                    const isReview = markedForReview.includes(globalIdx);
                    const isCurrent = currentIndex === globalIdx;

                    return (
                      <button
                        key={q._id || globalIdx}
                        type="button"
                        onClick={() => setCurrentIndex(globalIdx)}
                        className={`h-9 rounded-xl font-mono text-xs font-bold transition cursor-pointer border ${
                          isCurrent
                            ? 'border-indigo-400 ring-2 ring-indigo-500/50'
                            : 'border-transparent'
                        } ${
                          isReview
                            ? 'bg-purple-600 text-white'
                            : isAnswered
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                        }`}
                      >
                        {globalIdx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Palette Legends */}
                <div className="pt-3 border-t border-slate-700/60 grid grid-cols-2 gap-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-md bg-emerald-600"></span>
                    <span>Answered ({Object.keys(selectedAnswers).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-md bg-purple-600"></span>
                    <span>Review ({markedForReview.length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-md bg-slate-900 border border-slate-700"></span>
                    <span>Unattempted ({questions.length - Object.keys(selectedAnswers).length})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-md border-2 border-indigo-400"></span>
                    <span>Current Active</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSubmitTest}
                  disabled={submitting}
                  className="w-full mt-2 py-2.5 bg-rose-600/90 hover:bg-rose-600 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-rose-950/40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Final Exam</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. POST-TEST BENCHMARK & SCORECARD */}
        {testFinished && scoreResult && (
          <div className="space-y-6" id="test-scorecard-report">
            {/* Top Scorecard Banner */}
            <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Tier-1 Evaluation Complete
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Official 100-Question CBT Scorecard
                </h2>
                <p className="text-xs text-slate-400">
                  Total Questions: 100 • Total Marks: 200 • Negative Marking: 0.50 per wrong answer
                </p>
              </div>

              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  disabled={downloadingPdf}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-900/30 cursor-pointer"
                >
                  <Download className={`w-4 h-4 ${downloadingPdf ? 'animate-bounce' : ''}`} />
                  <span>{downloadingPdf ? 'Exporting PDF...' : 'Download PDF Scorecard'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartTest}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4 text-indigo-400" />
                  <span>Retake Test</span>
                </button>
              </div>
            </div>

            {/* All-India Rank & Percentile Prediction */}
            {benchmark && (
              <div className="bg-gradient-to-r from-purple-950/60 via-slate-800/90 to-indigo-950/60 border border-purple-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-700/60">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                      <Flame className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">All-India Benchmarking & Rank Projection</h3>
                      <p className="text-[11px] text-slate-400">
                        Normalized against {benchmark.candidatePool.toLocaleString()} simulated candidates
                      </p>
                    </div>
                  </div>

                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${benchmark.statusColor}`}>
                    {benchmark.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium block">Projected All-India Rank</span>
                    <p className="text-2xl font-black text-amber-400 font-mono">
                      #{benchmark.predictedRank.toLocaleString()}
                    </p>
                    <span className="text-[10px] text-slate-500">out of 1.5 Lakh candidates</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium block">National Percentile</span>
                    <p className="text-2xl font-black text-purple-400 font-mono">
                      {benchmark.percentile}%
                    </p>
                    <span className="text-[10px] text-slate-500">Top {(100 - benchmark.percentile).toFixed(1)}% bracket</span>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-3.5 space-y-1">
                    <span className="text-[11px] text-slate-400 font-medium block">Tier-1 Expected Cutoff</span>
                    <p className="text-2xl font-black text-emerald-400 font-mono">
                      {scoreResult.score >= 135 ? 'Qualified' : 'Below Cutoff'}
                    </p>
                    <span className="text-[10px] text-slate-500">Expected Cutoff: ~135 / 200</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Faculty Analysis:</strong> {benchmark.tip}</span>
                </div>
              </div>
            )}

            {/* Scorecard Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400">Total Score</span>
                <p className="text-2xl font-black text-white font-mono">
                  {scoreResult.score} <span className="text-xs text-slate-400">/ {scoreResult.totalMarks || 200}</span>
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400">Overall Accuracy</span>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  {scoreResult.accuracy}%
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400">Correct Answers</span>
                <p className="text-2xl font-black text-emerald-400 font-mono">
                  {scoreResult.correct}
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400">Negative Deductions</span>
                <p className="text-2xl font-black text-rose-400 font-mono">
                  -{scoreResult.incorrect * 0.5}
                </p>
              </div>
            </div>

            {/* Detailed Question Review by Section */}
            <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Sectional Answer Key & Derivations</span>
              </h3>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {questions.map((q, idx) => {
                  const userChoice = selectedAnswers[q._id];
                  const isCorrect = userChoice === q.correctOptionIndex;
                  const isAttempted = userChoice !== undefined && userChoice !== null;

                  return (
                    <div
                      key={q._id || idx}
                      className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-300">Q{idx + 1}.</span>
                          <span className="text-[11px] text-indigo-400 font-semibold">{q.subject}</span>
                        </div>
                        {isAttempted ? (
                          isCorrect ? (
                            <span className="text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+{q.marks || 2})
                            </span>
                          ) : (
                            <span className="text-rose-400 font-semibold flex items-center gap-1">
                              <XCircle className="w-3.5 h-3.5" /> Incorrect (-{q.negativeMarks || 0.5})
                            </span>
                          )
                        ) : (
                          <span className="text-slate-500">Unattempted (0)</span>
                        )}
                      </div>

                      <p className="text-sm font-medium text-white">{q.questionText}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                        {q.options?.map((opt, oIdx) => {
                          const isRight = oIdx === q.correctOptionIndex;
                          const wasSelected = userChoice === oIdx;

                          return (
                            <div
                              key={oIdx}
                              className={`p-2.5 rounded-lg border flex items-center gap-2 ${
                                isRight
                                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                                  : wasSelected
                                  ? 'bg-rose-500/10 border-rose-500/40 text-rose-300'
                                  : 'bg-slate-950/40 border-slate-800 text-slate-400'
                              }`}
                            >
                              <span className="font-mono text-slate-500">
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>
                          );
                        })}
                      </div>

                      {q.explanation && (
                        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
                          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">
                            Derivation / Trick:
                          </span>
                          <p className="leading-relaxed">{q.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}