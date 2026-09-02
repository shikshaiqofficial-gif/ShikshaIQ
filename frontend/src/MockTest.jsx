import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  BookOpen,
  Send,
  Loader2,
  ShieldCheck,
  TrendingUp,
  Target,
  Download,
  Flame,
  BarChart2
} from 'lucide-react';

export default function MockTest() {
  const navigate = useNavigate();

  // Test State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes default
  const [testActive, setTestActive] = useState(false);
  const [testFinished, setTestFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [scoreResult, setScoreResult] = useState(null);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  // Benchmarking calculation helper
  const calculateBenchmark = (score, accuracy, totalMarks) => {
    const safeTotal = totalMarks || 40;
    const percentage = Math.max(0, Math.min(100, (score / safeTotal) * 100));
    
    // Normalization formula blending raw score and accuracy discipline
    const weightedRating = (percentage * 0.7) + (accuracy * 0.3);
    const percentile = Math.min(99.8, Math.max(12.5, parseFloat((weightedRating * 0.98).toFixed(1))));
    
    const candidatePool = 150000;
    const predictedRank = Math.max(1, Math.round(candidatePool * (1 - (percentile / 100))));

    let status = 'Safe Zone';
    let statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    let tip = 'Strong chance of clearing the Tier-1 category cutoff. Focus on mock consistency.';

    if (percentile < 70) {
      status = 'Needs Immediate Revision';
      statusColor = 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      tip = 'Below general cutoff threshold. Cut down unforced negative marking.';
    } else if (percentile < 85) {
      status = 'Borderline Cutoff';
      statusColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      tip = 'Hovering around Tier-1 cutoff. Boost Quantitative accuracy to secure selection.';
    }

    return { percentile, predictedRank, candidatePool, status, statusColor, tip };
  };

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await API.get('/questions?limit=20');
      const list = res.data?.questions || [];
      if (list.length > 0) {
        setQuestions(list);
      } else {
        // Fallback questions for zero-downtime testing
        setQuestions([
          {
            _id: 'q1',
            questionText: 'If a + 1/a = 3, find the numerical value of a² + 1/a².',
            options: ['7', '9', '11', '6'],
            correctOptionIndex: 0,
            marks: 2,
            negativeMarks: 0.5,
            subject: 'Quantitative Aptitude',
            explanation: 'Using standard identity: a² + 1/a² = (a + 1/a)² - 2 = 3² - 2 = 9 - 2 = 7.'
          },
          {
            _id: 'q2',
            questionText: 'Which Article of the Indian Constitution is known as the "Heart and Soul of the Constitution"?',
            options: ['Article 19', 'Article 21', 'Article 32', 'Article 14'],
            correctOptionIndex: 2,
            marks: 2,
            negativeMarks: 0.5,
            subject: 'General Awareness',
            explanation: 'Dr. B.R. Ambedkar termed Article 32 (Right to Constitutional Remedies) as the Heart and Soul of the Constitution.'
          },
          {
            _id: 'q3',
            questionText: 'In a certain code, ROAD is written as URDG. How is SWAN written in that code?',
            options: ['VZDQ', 'VXDQ', 'VZDQ', 'UXDQ'],
            correctOptionIndex: 0,
            marks: 2,
            negativeMarks: 0.5,
            subject: 'Reasoning',
            explanation: 'Each alphabet shifts forward by +3 positions: S(+3)=V, W(+3)=Z, A(+3)=D, N(+3)=Q.'
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  // Timer Countdown Effect
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
    setCurrentIndex(0);
    setTimeRemaining(1200);
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

  const handleSubmitTest = async () => {
    if (submitting || testFinished) return;

    try {
      setSubmitting(true);
      setTestActive(false);

      const formattedAnswers = questions.map((q) => ({
        questionId: q._id,
        selectedOptionIndex: selectedAnswers[q._id] !== undefined ? selectedAnswers[q._id] : null
      }));

      const timeSpent = 1200 - timeRemaining;

      // Attempt live server submission with negative marking
      try {
        const res = await API.post('/tests/submit', {
          exam: 'SSC CGL Mock Arena',
          answers: formattedAnswers,
          timeTakenSeconds: timeSpent
        });
        if (res.data?.result) {
          setScoreResult(res.data.result);
          setTestFinished(true);
          return;
        }
      } catch (serverErr) {
        console.warn('Fallback to client scorecard grading:', serverErr);
      }

      // Client-side scoring calculation fallback
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

  // 1-Click PDF Scorecard Export
  const handleDownloadPdf = async () => {
    const element = document.getElementById('test-scorecard-report');
    if (!element) return;

    try {
      setDownloadingPdf(true);
      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: '#0f172a',
        useCORS: true
      });

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
      console.error('PDF export failed:', err);
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
  const benchmark = scoreResult
    ? calculateBenchmark(scoreResult.score, scoreResult.accuracy, scoreResult.totalMarks)
    : null;

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
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-sm sm:text-base">SSC & Railway CBT Mock Arena</h1>
          </div>
        </div>

        {testActive && (
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 rounded-xl font-mono text-xs font-bold text-amber-400">
            <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
            <span>{formatTimer(timeRemaining)}</span>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">

        {/* 1. START SCREEN */}
        {!testActive && !testFinished && (
          <div className="max-w-xl mx-auto w-full bg-slate-800/70 border border-slate-700/70 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-2xl flex items-center justify-center mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                All-India Tier-1 CBT Simulation
              </h2>
              <p className="text-xs sm:text-sm text-slate-300">
                Experience the authentic examination interface with negative marking calculations and real-time national rank prediction.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-2xl border border-slate-800 text-xs text-slate-300">
              <div>
                <span className="text-slate-500 block text-[11px]">Questions</span>
                <strong className="text-white text-sm">{questions.length}</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Duration</span>
                <strong className="text-white text-sm">20 Mins</strong>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Marking</span>
                <strong className="text-emerald-400 text-sm">+2 / -0.5</strong>
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
                  <span>Loading Questions...</span>
                </>
              ) : (
                <>
                  <span>Begin Examination</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* 2. ACTIVE TEST ARENA */}
        {testActive && currentQ && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Question Screen (8 cols) */}
            <div className="lg:col-span-8 bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 text-xs">
                <span className="font-bold text-indigo-400 uppercase tracking-wider">
                  {currentQ.subject || 'General Aptitude'}
                </span>
                <span className="text-slate-400 font-medium font-mono">
                  Question {currentIndex + 1} of {questions.length}
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
                        className={`w-full p-4 rounded-xl border text-left text-xs sm:text-sm font-medium transition cursor-pointer flex items-center gap-3 ${
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

              {/* Bottom Navigation */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentIndex === 0}
                  className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition cursor-pointer flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex gap-2">
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
                      Clear Choice
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
                      <span>Submit Test</span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Question Palette (4 cols) */}
            <div className="lg:col-span-4 bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 shadow-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Question Palette
              </h4>

              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAnswered = selectedAnswers[q._id] !== undefined;
                  const isCurrent = currentIndex === idx;

                  return (
                    <button
                      key={q._id || idx}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-9 rounded-xl font-mono text-xs font-bold transition cursor-pointer border ${
                        isCurrent
                          ? 'border-indigo-400 ring-2 ring-indigo-500/50'
                          : 'border-transparent'
                      } ${
                        isAnswered
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-slate-700/60 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-emerald-600"></span>
                  <span>Answered ({Object.keys(selectedAnswers).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-md bg-slate-900 border border-slate-700"></span>
                  <span>Unattempted ({questions.length - Object.keys(selectedAnswers).length})</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSubmitTest}
                disabled={submitting}
                className="w-full mt-4 py-2.5 bg-rose-600/80 hover:bg-rose-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Finish & Submit</span>
              </button>
            </div>
          </div>
        )}

        {/* 3. POST-TEST BENCHMARK & SCORECARD */}
        {testFinished && scoreResult && (
          <div className="space-y-6" id="test-scorecard-report">
            {/* Top Results Banner */}
            <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Performance Evaluation Complete
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-white mt-2">
                  Official CBT Scorecard
                </h2>
                <p className="text-xs text-slate-400">
                  Test duration: {Math.round(scoreResult.timeTakenSeconds / 60)} mins • Marking policy: +2, -0.5
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

            {/* National Percentile & Rank Prediction Benchmarking Card */}
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
                    <span className="text-[11px] text-slate-400 font-medium block">Tier-1 Cutoff Projection</span>
                    <p className="text-2xl font-black text-emerald-400 font-mono">
                      {scoreResult.score >= (scoreResult.totalMarks * 0.7) ? 'Qualified' : 'Below Cutoff'}
                    </p>
                    <span className="text-[10px] text-slate-500">Tier-1 Expected: ~70%</span>
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center gap-2">
                  <Target className="w-4 h-4 text-purple-400 shrink-0" />
                  <span><strong>Faculty Insight:</strong> {benchmark.tip}</span>
                </div>
              </div>
            )}

            {/* Score Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400">Total Score</span>
                <p className="text-2xl font-black text-white font-mono">
                  {scoreResult.score} <span className="text-xs text-slate-400">/ {scoreResult.totalMarks}</span>
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 space-y-1">
                <span className="text-xs text-slate-400">Accuracy</span>
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

            {/* Step-by-Step Question Review & Answer Key */}
            <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 pb-2 border-b border-slate-700/60">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Detailed Question Review & Shortcut Keys</span>
              </h3>

              <div className="space-y-4">
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
                        <span className="font-bold text-slate-300">Question {idx + 1}</span>
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
                            Faculty Derivation & Shortcut:
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