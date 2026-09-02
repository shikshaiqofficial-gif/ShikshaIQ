import React, { useState, useEffect } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  RotateCcw,
  Trophy,
  Award,
  Download,
  Sparkles,
  Bot,
} from 'lucide-react';
import API from './api';
import { generateScorecardPDF } from './generateScorecardPDF';

export default function MockTest() {
  const [quiz, setQuiz] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);

  // 1. Fetch Today's Mock Test
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const res = await API.get('/mock-test/today');
        if (res.data?.success) {
          setQuiz(res.data.quiz);
          setTimeLeft(res.data.quiz.durationMinutes * 60);
        }
      } catch (err) {
        console.error('Failed to load quiz:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, []);

  // 2. Countdown Timer Loop
  useEffect(() => {
    if (submitted || timeLeft <= 0 || !quiz) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [submitted, timeLeft, quiz]);

  // Handle Option Select
  const handleSelectOption = (optIndex) => {
    if (submitted) return;
    const currentQ = quiz.questions[currentIndex];
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ._id]: optIndex,
    }));
  };

  // Clear Selected Answer
  const handleClearAnswer = () => {
    const currentQ = quiz.questions[currentIndex];
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQ._id];
      return copy;
    });
  };

  // 3. Submit Test and Trigger Gemini Pedagogical Analysis
  const handleSubmitTest = async () => {
    if (submitted || evaluating) return;
    setEvaluating(true);

    try {
      const timeSpent = quiz.durationMinutes * 60 - timeLeft;
      const storedUser = localStorage.getItem('shiksha_user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      const res = await API.post('/mock-test/submit', {
        quizId: quiz._id,
        answers: selectedAnswers,
        timeTakenSeconds: timeSpent,
        userId: user?.id || user?._id || 'guest',
      });

      if (res.data?.success) {
        setResult(res.data.result);
        setSubmitted(true);
      } else {
        throw new Error(res.data?.message || 'Submission failed');
      }
    } catch (err) {
      alert('Error evaluating test with Gemini AI: ' + (err.response?.data?.message || err.message));
    } finally {
      setEvaluating(false);
    }
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // --- LOADING INITIAL QUIZ STATE ---
  if (loading && !quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-slate-500">
        <Clock className="w-5 h-5 animate-spin mr-2 text-orange-500" />
        Preparing Examination Environment...
      </div>
    );
  }

  // --- NO ACTIVE QUIZ STATE ---
  if (!quiz) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <AlertCircle className="w-10 h-10 text-slate-400 mb-2" />
        <p className="text-slate-700 font-bold mb-4">No active mock test available right now.</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer"
        >
          Refresh
        </button>
      </div>
    );
  }

  // --- GEMINI AI EVALUATION SCREEN ---
  if (evaluating) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4 font-sans">
        <div className="w-16 h-16 rounded-3xl bg-orange-500/10 border border-orange-500/20 text-orange-600 flex items-center justify-center animate-bounce shadow-md">
          <Bot className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
            Evaluating Answers with Gemini AI <Sparkles className="w-5 h-5 text-orange-500" />
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Generating step-by-step logic, key formulas, option eliminations, and exam shortcuts for your PDF dossier...
          </p>
        </div>
        <div className="w-48 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="w-full h-full bg-orange-500 animate-pulse"></div>
        </div>
      </div>
    );
  }

  // --- RESULT SUMMARY SCREEN ---
  if (submitted && result) {
    const storedUser = localStorage.getItem('shiksha_user');
    const user = storedUser ? JSON.parse(storedUser) : null;

    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Top Scorecard Header */}
          <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full uppercase tracking-wider border border-emerald-500/30">
                  Assessment Completed
                </span>
                <h1 className="text-2xl sm:text-3xl font-black mt-3 tracking-tight">{quiz.title}</h1>
                <p className="text-slate-400 text-xs mt-1">Official verified evaluation generated by Shiksha IQ engine.</p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 text-center min-w-[150px]">
                <span className="text-xs text-slate-300 font-bold uppercase tracking-wider">Final Score</span>
                <div className="text-4xl font-black text-orange-400 mt-1">
                  {result.score} <span className="text-base text-slate-300 font-medium">/ {result.totalMarks}</span>
                </div>
              </div>
            </div>

            {/* Performance Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Accuracy</p>
                <p className="text-xl font-black text-white mt-0.5">{result.accuracy}%</p>
              </div>
              <div>
                <p className="text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Correct</p>
                <p className="text-xl font-black text-emerald-400 mt-0.5">{result.correctAnswers}</p>
              </div>
              <div>
                <p className="text-[11px] text-red-400 font-bold uppercase tracking-wider">Incorrect</p>
                <p className="text-xl font-black text-red-400 mt-0.5">{result.wrongAnswers}</p>
              </div>
              <div>
                <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">Unattempted</p>
                <p className="text-xl font-black text-slate-300 mt-0.5">{result.unattempted}</p>
              </div>
            </div>
          </div>

          {/* Action Row: PDF Download & Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div>
              <h3 className="text-sm font-black text-slate-800">Complete ShikshaIQ</h3>
              <p className="text-xs text-slate-500">Download the printable PDF scorecard</p>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => generateScorecardPDF({ quiz, result, user })}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
              >
                <Download className="w-4 h-4" />
                Download AI Scorecard (PDF)
              </button>
              <a
                href="/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all text-center"
              >
                Dashboard
              </a>
            </div>
          </div>

          {/* Step-by-Step Question Review */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-lg font-black text-slate-900">Detailed Answer Key & Logic Breakdown</h2>
            
            {result.analysis.map((q, idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Question {idx + 1}</span>
                  {q.status === 'correct' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Correct (+2)
                    </span>
                  )}
                  {q.status === 'wrong' && (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100/80 px-2.5 py-0.5 rounded-full">
                      <XCircle className="w-3.5 h-3.5 text-red-600" /> Wrong (-0.5)
                    </span>
                  )}
                  {q.status === 'unattempted' && (
                    <span className="text-xs font-bold text-slate-500 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                      Unattempted (0)
                    </span>
                  )}
                </div>

                <p className="font-bold text-sm text-slate-900 leading-snug">{q.questionText}</p>

                {/* Option Matrix */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    let style = 'bg-white border-slate-200 text-slate-700';
                    if (optIdx === q.correctOptionIndex) {
                      style = 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold ring-1 ring-emerald-500';
                    } else if (optIdx === q.selectedOptionIndex && optIdx !== q.correctOptionIndex) {
                      style = 'bg-red-50 border-red-400 text-red-800 line-through';
                    }
                    return (
                      <div key={optIdx} className={`p-2.5 rounded-xl border ${style}`}>
                        <span className="font-bold mr-2">{String.fromCharCode(65 + optIdx)}.</span>
                        {opt}
                      </div>
                    );
                  })}
                </div>

                {/* Gemini AI Pedagogical Analysis Box */}
                {(q.aiDescription || q.explanation) && (
                  <div className="p-4 bg-slate-100 text-slate-800 text-xs rounded-2xl border border-slate-200 mt-3 space-y-1 whitespace-pre-line leading-relaxed">
                    <div className="flex items-center gap-1.5 font-black text-slate-900 mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      Gemini AI Solution Breakdown:
                    </div>
                    {q.aiDescription || q.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    );
  }

  // --- ACTIVE TEST TAKING SCREEN ---
  const currentQ = quiz.questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans flex flex-col justify-between">
      
      {/* Test Sticky Header */}
      <header className="bg-white border-b border-slate-200 px-4 sm:px-8 py-3.5 flex items-center justify-between sticky top-0 z-20 shadow-sm">
        <div>
          <h1 className="text-sm sm:text-base font-black text-slate-900 truncate max-w-md">
            {quiz.title}
          </h1>
          <span className="text-[11px] text-slate-400 font-medium">
            Question {currentIndex + 1} of {quiz.totalQuestions}
          </span>
        </div>

        {/* Live Countdown Timer */}
        <div className="flex items-center gap-2 bg-slate-900 text-white px-3.5 py-1.5 rounded-xl shadow-md">
          <Clock className="w-4 h-4 text-orange-400 animate-pulse" />
          <span className="font-mono text-sm font-bold tracking-wider">{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Examination Layout */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-start">
        
        {/* Left: Active Question Box */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[440px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <span>Section: General Awareness & Aptitude</span>
              <span className="text-emerald-600">+2.0 / -0.5 Marks</span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 mt-5 leading-relaxed">
              <span className="text-orange-500 mr-2">Q{currentIndex + 1}.</span>
              {currentQ.questionText}
            </h2>

            {/* Multiple Choice Options */}
            <div className="space-y-3 mt-6">
              {currentQ.options.map((opt, optIdx) => {
                const isSelected = selectedAnswers[currentQ._id] === optIdx;
                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(optIdx)}
                    className={`w-full p-4 rounded-2xl border text-left text-sm font-semibold flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-orange-500 bg-orange-50/60 text-orange-950 shadow-sm ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-800'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        isSelected
                          ? 'bg-orange-500 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </span>
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom Question Controls */}
          <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={handleClearAnswer}
              className="text-xs font-bold text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
            >
              Clear Selection
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => prev - 1)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-30 cursor-pointer transition-all"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentIndex === quiz.totalQuestions - 1}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl disabled:opacity-30 cursor-pointer transition-all"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Right: Question Navigation Palette */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Question Palette
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {quiz.questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q._id] !== undefined;
                const isCurrent = idx === currentIndex;
                return (
                  <button
                    key={q._id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'ring-2 ring-orange-500 ring-offset-2'
                        : ''
                    } ${
                      isAnswered
                        ? 'bg-emerald-500 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Palette Legend */}
          <div className="pt-4 border-t border-slate-100 text-xs space-y-2 text-slate-600 font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              <span>Answered ({Object.keys(selectedAnswers).length})</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-slate-200 rounded-full"></span>
              <span>Unanswered ({quiz.totalQuestions - Object.keys(selectedAnswers).length})</span>
            </div>
          </div>

          {/* Submit Test Button */}
          <button
            type="button"
            onClick={handleSubmitTest}
            className="w-full py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
          >
            <Send className="w-4 h-4" />
            Submit Mock Test
          </button>
        </div>

      </main>
    </div>
  );
}