import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import FlashcardDeck from './FlashcardDeck';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX,
  ChevronRight,
  ChevronLeft,
  Check,
  Award,
  Zap,
  BarChart3,
  Loader2,
  Download,
  Layers
} from 'lucide-react';

const SECTIONS = [
  'All',
  'Quantitative Aptitude',
  'General Intelligence & Reasoning',
  'General Awareness',
  'English Comprehension'
];

export default function MockTest() {
  const navigate = useNavigate();

  // Primary Exam Simulation State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({}); // 'visited', 'answered', 'marked'
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes default
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('All');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Speed vs Accuracy Tracking
  const [questionTimes, setQuestionTimes] = useState({}); // { [questionId]: seconds }
  const lastSwitchTimeRef = useRef(Date.now());

  // AI Trap Breaker Drill State
  const [isDrillLoading, setIsDrillLoading] = useState(false);
  const [drillQuestions, setDrillQuestions] = useState(null);
  const [drillIndex, setDrillIndex] = useState(0);
  const [drillAnswers, setDrillAnswers] = useState({});
  const [drillSubmitted, setDrillSubmitted] = useState(false);

  // AI Flashcards State
  const [flashcards, setFlashcards] = useState(null);
  const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);

  // 1. Fetch 100-Q Daily Mock with LocalStorage Offline Caching Fallback
  useEffect(() => {
    const fetchMock = async () => {
      try {
        setLoading(true);
        const res = await API.get('/tests/daily-100-mock?exam=SSC CGL');
        if (res.data?.questions?.length) {
          setQuestions(res.data.questions);
          localStorage.setItem('shikshaiq_cached_mock', JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            questions: res.data.questions
          }));
        }
      } catch (err) {
        console.warn('Network offline or error. Checking local cache...');
        const cached = localStorage.getItem('shikshaiq_cached_mock');
        if (cached) {
          const parsed = JSON.parse(cached);
          setQuestions(parsed.questions || []);
        } else {
          alert('Unable to load mock test. Check your internet connection.');
        }
      } finally {
        setLoading(false);
        lastSwitchTimeRef.current = Date.now();
      }
    };
    fetchMock();
  }, []);

  // 2. Exam CBT Countdown Timer
  useEffect(() => {
    if (isSubmitted || loading) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isSubmitted, loading]);

  // 3. Clean up SpeechSynthesis on component unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const recordActiveQuestionTime = () => {
    const now = Date.now();
    const elapsed = Math.round((now - lastSwitchTimeRef.current) / 1000);
    const currentQId = questions[currentIndex]?._id;

    if (currentQId) {
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQId]: (prev[currentQId] || 0) + elapsed
      }));
    }
    lastSwitchTimeRef.current = Date.now();
  };

  const handleNavigateQuestion = (newIndex) => {
    recordActiveQuestionTime();
    setCurrentIndex(newIndex);
  };

  const handleSelectOption = (index) => {
    if (isSubmitted) return;
    const qId = questions[currentIndex]._id;
    setAnswers((prev) => ({ ...prev, [qId]: index }));
    setStatus((prev) => ({ ...prev, [currentIndex]: 'answered' }));
  };

  const handleClear = () => {
    if (isSubmitted) return;
    const qId = questions[currentIndex]._id;
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[qId];
      return next;
    });
    setStatus((prev) => ({ ...prev, [currentIndex]: 'visited' }));
  };

  const handleMarkReview = () => {
    if (isSubmitted) return;
    setStatus((prev) => ({ ...prev, [currentIndex]: 'marked' }));
    if (currentIndex < questions.length - 1) {
      handleNavigateQuestion(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitted) return;
    recordActiveQuestionTime();

    const submissionPayload = {
      exam: 'SSC CGL Daily 100 Mock',
      timeTakenSeconds: 3600 - timeLeft,
      answers: questions.map((q) => ({
        questionId: q._id,
        selectedOptionIndex: answers[q._id] !== undefined ? answers[q._id] : null,
        timeSpentSeconds: questionTimes[q._id] || 0
      }))
    };

    try {
      const res = await API.post('/tests/submit', submissionPayload);
      if (res.data?.result) {
        setResult(res.data.result);
        setIsSubmitted(true);
        setCurrentIndex(0);
      }
    } catch (err) {
      console.warn('Offline submission triggered. Evaluating client-side...');
      let correct = 0;
      let incorrect = 0;
      let score = 0;
      const analytics = [];

      questions.forEach((q) => {
        const selected = answers[q._id];
        const isAttempted = selected !== undefined && selected !== null;
        const isCorrect = isAttempted && selected === q.correctOptionIndex;

        if (isAttempted) {
          if (isCorrect) {
            correct++;
            score += 2;
          } else {
            incorrect++;
            score -= 0.5;
          }
        }

        analytics.push({
          questionId: q._id,
          subject: q.subject,
          timeSpentSeconds: questionTimes[q._id] || 0,
          isCorrect,
          status: !isAttempted ? 'unattempted' : isCorrect ? 'correct' : 'incorrect'
        });
      });

      const localResult = {
        score: Math.max(0, parseFloat(score.toFixed(2))),
        totalMarks: questions.length * 2,
        accuracy: (correct + incorrect) > 0 ? parseFloat(((correct / (correct + incorrect)) * 100).toFixed(1)) : 0,
        attempted: correct + incorrect,
        correct,
        incorrect,
        questionAnalytics: analytics
      };

      const queue = JSON.parse(localStorage.getItem('shikshaiq_pending_sync') || '[]');
      queue.push(submissionPayload);
      localStorage.setItem('shikshaiq_pending_sync', JSON.stringify(queue));

      setResult(localResult);
      setIsSubmitted(true);
      setCurrentIndex(0);
    }
  };

  // Launch AI Trap Breaker Drill
  const handleLaunchTrapBreaker = async () => {
    if (!result || result.incorrect === 0) return;
    setIsDrillLoading(true);

    try {
      const mistakes = questions.filter((q) => {
        const selected = answers[q._id];
        return selected !== undefined && selected !== q.correctOptionIndex;
      });

      const res = await API.post('/study-plan/weakness-drill', {
        mistakes,
        targetExam: 'SSC CGL'
      });

      if (res.data?.drillQuestions?.length > 0) {
        setDrillQuestions(res.data.drillQuestions);
        setDrillIndex(0);
        setDrillAnswers({});
        setDrillSubmitted(false);
      } else {
        alert('Could not synthesize drill questions. Please retry.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to synthesize remedial drill.');
    } finally {
      setIsDrillLoading(false);
    }
  };

  // Launch AI Mistake Flashcard Deck
  const handleGenerateFlashcards = async () => {
    if (!result || result.incorrect === 0) return;
    setIsGeneratingFlashcards(true);

    try {
      const mistakes = questions.filter((q) => {
        const selected = answers[q._id];
        return selected !== undefined && selected !== q.correctOptionIndex;
      });

      const res = await API.post('/study-plan/flashcards', {
        mistakes,
        targetExam: 'SSC CGL'
      });

      if (res.data?.flashcards?.length > 0) {
        setFlashcards(res.data.flashcards);
      } else {
        alert('Could not generate flashcards. Please try again.');
      }
    } catch (err) {
      alert('Failed to synthesize flashcards.');
    } finally {
      setIsGeneratingFlashcards(false);
    }
  };

  // Native Web Speech API Narrator
  const toggleSpeech = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Client-Side Zero-Dependency Printable PDF Scorecard & Solutions Exporter
  const handleDownloadPDF = () => {
    if (!result) return;
    setIsGeneratingPdf(true);

    const timeSpent = 3600 - timeLeft;
    const minutesSpent = Math.floor(timeSpent / 60);
    const secondsSpent = timeSpent % 60;

    const quickSolves = result.questionAnalytics?.filter((q) => q.isCorrect && q.timeSpentSeconds < 45).length || 0;
    const slowSolves = result.questionAnalytics?.filter((q) => q.isCorrect && q.timeSpentSeconds >= 45).length || 0;
    const timeTraps = result.questionAnalytics?.filter((q) => !q.isCorrect && q.status === 'incorrect' && q.timeSpentSeconds > 60).length || 0;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to print the report.');
      setIsGeneratingPdf(false);
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>ShikshaIQ Scorecard - SSC CGL Daily Mock</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.5;
          }
          .header {
            border-bottom: 2px solid #4f46e5;
            padding-bottom: 12px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .logo { font-size: 24px; font-weight: 900; color: #4f46e5; margin: 0; }
          .exam-title { font-size: 13px; color: #64748b; margin: 2px 0 0 0; }
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .card {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 10px 14px;
          }
          .card-label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 4px; }
          .card-value { font-size: 18px; font-weight: 800; color: #0f172a; }
          .section-heading {
            font-size: 14px;
            font-weight: 800;
            color: #0f172a;
            border-bottom: 1px solid #cbd5e1;
            padding-bottom: 6px;
            margin-top: 24px;
            margin-bottom: 14px;
          }
          .q-block {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 12px;
            margin-bottom: 12px;
            page-break-inside: avoid;
          }
          .q-meta {
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            font-weight: 700;
            color: #4f46e5;
            margin-bottom: 6px;
          }
          .q-text { font-weight: 600; color: #0f172a; margin-bottom: 8px; font-size: 12px; }
          .options-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            font-size: 11px;
            margin-bottom: 8px;
          }
          .opt {
            padding: 6px 8px;
            border-radius: 4px;
            background: #f1f5f9;
            border: 1px solid #e2e8f0;
          }
          .opt-correct { background: #dcfce7; border-color: #86efac; color: #166534; font-weight: 700; }
          .opt-wrong { background: #fee2e2; border-color: #fca5a5; color: #991b1b; font-weight: 700; }
          .exp-box {
            background: #f8fafc;
            border-left: 3px solid #6366f1;
            padding: 8px 10px;
            font-size: 11px;
            color: #334155;
            margin-top: 6px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="logo">ShikshaIQ</h1>
            <p class="exam-title">SSC CGL All-India Daily Mock Performance Report</p>
          </div>
          <div style="text-align: right; font-size: 10px; color: #64748b;">
            Date: ${new Date().toLocaleDateString('en-GB')} | Time: ${minutesSpent}m ${secondsSpent}s
          </div>
        </div>

        <div class="metrics-grid">
          <div class="card">
            <div class="card-label">Final Score</div>
            <div class="card-value" style="color: #4f46e5;">${result.score} / ${result.totalMarks}</div>
          </div>
          <div class="card">
            <div class="card-label">Accuracy</div>
            <div class="card-value" style="color: #10b981;">${result.accuracy}%</div>
          </div>
          <div class="card">
            <div class="card-label">Attempted / Total</div>
            <div class="card-value">${result.attempted} / ${questions.length}</div>
          </div>
          <div class="card">
            <div class="card-label">Negative Marks Lost</div>
            <div class="card-value" style="color: #ef4444;">-${result.incorrect * 0.5}</div>
          </div>
        </div>

        <div class="metrics-grid" style="grid-template-columns: repeat(3, 1fr); margin-bottom: 20px;">
          <div class="card" style="background: #f0fdf4; border-color: #bbf7d0;">
            <div class="card-label" style="color: #15803d;">Quick Solves (&lt;45s)</div>
            <div class="card-value" style="color: #166534;">${quickSolves} Questions</div>
          </div>
          <div class="card" style="background: #fffbeb; border-color: #fde68a;">
            <div class="card-label" style="color: #b45309;">Slow Solves (&gt;45s)</div>
            <div class="card-value" style="color: #92400e;">${slowSolves} Questions</div>
          </div>
          <div class="card" style="background: #fef2f2; border-color: #fecaca;">
            <div class="card-label" style="color: #b91c1c;">Time Traps (&gt;60s & Wrong)</div>
            <div class="card-value" style="color: #991b1b;">${timeTraps} Questions</div>
          </div>
        </div>

        <div class="section-heading">Question-by-Question Solutions & Derivations</div>

        ${questions.map((q, idx) => {
          const selected = answers[q._id];
          const isCorrect = selected === q.correctOptionIndex;
          const time = questionTimes[q._id] || 0;

          return `
            <div class="q-block">
              <div class="q-meta">
                <span>Q${idx + 1} • ${q.subject}</span>
                <span>Time Spent: ${time}s | Status: ${selected === undefined ? 'Unattempted' : isCorrect ? 'Correct (+2)' : 'Incorrect (-0.5)'}</span>
              </div>
              <div class="q-text">${q.questionText}</div>
              <div class="options-grid">
                ${q.options.map((opt, i) => {
                  let cls = 'opt';
                  if (i === q.correctOptionIndex) cls += ' opt-correct';
                  else if (selected === i) cls += ' opt-wrong';
                  return `<div class="${cls}">${String.fromCharCode(65 + i)}. ${opt}</div>`;
                }).join('')}
              </div>
              <div class="exp-box">
                <strong>Solution / Formula:</strong> ${q.explanation}
              </div>
            </div>
          `;
        }).join('')}

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setIsGeneratingPdf(false);
  };

  const filteredQuestionIndices = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => (activeSection === 'All' ? true : q.subject === activeSection))
    .map(({ idx }) => idx);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Synthesizing 100-Question Exam Simulation...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col select-none">
      {/* CBT Header */}
      <header className="h-16 bg-slate-900/90 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight">SSC CGL All-India Daily CBT Mock</h1>
            <p className="text-[11px] text-slate-400">Official Exam Interface Pattern</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-sm">
            <Clock className="w-4 h-4 text-amber-400" />
            <span className={timeLeft < 300 ? 'text-rose-400 font-bold animate-pulse' : 'text-slate-200'}>
              {formatTime(timeLeft)}
            </span>
          </div>

          {!isSubmitted && (
            <button
              onClick={handleSubmit}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              Submit Exam
            </button>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Card / Remedial Drill */}
        <div className="lg:col-span-8 space-y-4">
          {!drillQuestions && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
              {SECTIONS.map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    recordActiveQuestionTime();
                    setActiveSection(sec);
                    const firstMatch = questions.findIndex((q) => sec === 'All' || q.subject === sec);
                    if (firstMatch !== -1) setCurrentIndex(firstMatch);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition cursor-pointer ${
                    activeSection === sec
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          )}

          {/* Drill View */}
          {drillQuestions ? (
            <div className="bg-slate-900/90 border border-rose-500/30 rounded-2xl p-5 sm:p-6 space-y-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-rose-500/20 text-rose-400 rounded-lg">
                    <Zap className="w-4 h-4" />
                  </span>
                  <span className="font-bold text-white uppercase tracking-wider">
                    AI Trap Breaker Drill ({drillIndex + 1} of {drillQuestions.length})
                  </span>
                </div>
                <button
                  onClick={() => setDrillQuestions(null)}
                  className="text-slate-400 hover:text-white text-xs underline cursor-pointer"
                >
                  Back to Full Mock Review
                </button>
              </div>

              <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                {drillQuestions[drillIndex].questionText}
              </div>

              <div className="space-y-3">
                {drillQuestions[drillIndex].options.map((opt, i) => {
                  const isSelected = drillAnswers[drillIndex] === i;
                  const isCorrect = drillSubmitted && drillQuestions[drillIndex].correctOptionIndex === i;
                  const isWrong = drillSubmitted && isSelected && drillQuestions[drillIndex].correctOptionIndex !== i;

                  let border = 'border-slate-800 bg-slate-950/60 hover:border-slate-700';
                  if (isSelected && !drillSubmitted) border = 'border-rose-500 bg-rose-600/10 text-white';
                  if (isCorrect) border = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                  if (isWrong) border = 'border-rose-500 bg-rose-500/10 text-rose-400';

                  return (
                    <button
                      key={i}
                      onClick={() => !drillSubmitted && setDrillAnswers({ ...drillAnswers, [drillIndex]: i })}
                      className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left flex items-center justify-between transition cursor-pointer ${border}`}
                    >
                      <span>{String.fromCharCode(65 + i)}. {opt}</span>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {isWrong && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {drillSubmitted && (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
                  <span className="text-emerald-400 font-bold block">Formula Shortcut & Derivation:</span>
                  <p>{drillQuestions[drillIndex].explanation}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                <button
                  onClick={() => setDrillIndex((p) => Math.max(0, p - 1))}
                  disabled={drillIndex === 0}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl cursor-pointer"
                >
                  Previous
                </button>

                {!drillSubmitted ? (
                  <button
                    onClick={() => setDrillSubmitted(true)}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Check Drill Answers
                  </button>
                ) : (
                  <button
                    onClick={() => setDrillQuestions(null)}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Finish Drill
                  </button>
                )}

                <button
                  onClick={() => setDrillIndex((p) => Math.min(drillQuestions.length - 1, p + 1))}
                  disabled={drillIndex === drillQuestions.length - 1}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          ) : (
            /* Standard 100-Q Card */
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
                <span className="font-bold text-indigo-400 uppercase tracking-wider">
                  Question {currentIndex + 1} of {questions.length} • {currentQ?.subject}
                </span>
                <span className="text-slate-400 font-mono">
                  Marks: <strong className="text-emerald-400">+{currentQ?.marks || 2}</strong> / Neg:{' '}
                  <strong className="text-rose-400">-{currentQ?.negativeMarks || 0.5}</strong>
                </span>
              </div>

              <div className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed">
                {currentQ?.questionText}
              </div>

              {/* Options */}
              <div className="space-y-3">
                {currentQ?.options?.map((opt, i) => {
                  const isSelected = answers[currentQ._id] === i;
                  const isCorrect = isSubmitted && currentQ.correctOptionIndex === i;
                  const isWrong = isSubmitted && isSelected && currentQ.correctOptionIndex !== i;

                  let borderStyle = 'border-slate-800 bg-slate-950/60 hover:border-slate-700';
                  if (isSelected && !isSubmitted) borderStyle = 'border-indigo-500 bg-indigo-600/10 text-white';
                  if (isCorrect) borderStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                  if (isWrong) borderStyle = 'border-rose-500 bg-rose-500/10 text-rose-400';

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(i)}
                      className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left flex items-center justify-between transition cursor-pointer ${borderStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-300 shrink-0">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {isWrong && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {/* Post-Submit Review & Audio Explanation */}
              {isSubmitted && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Explanation & Shortcut Derivation
                    </span>
                    <button
                      onClick={() => toggleSpeech(currentQ?.explanation || '')}
                      className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30 transition flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                    >
                      {isSpeaking ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
                      <span>{isSpeaking ? 'Stop Audio' : 'Listen Solution'}</span>
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line font-mono">
                    {currentQ?.explanation}
                  </p>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 text-xs">
                <div className="flex gap-2">
                  <button
                    onClick={handleClear}
                    disabled={isSubmitted}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
                  >
                    Clear Response
                  </button>
                  <button
                    onClick={handleMarkReview}
                    disabled={isSubmitted}
                    className="px-3 py-2 bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30 rounded-xl transition cursor-pointer"
                  >
                    Mark for Review
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleNavigateQuestion(Math.max(0, currentIndex - 1))}
                    disabled={currentIndex === 0}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>
                  <button
                    onClick={() => handleNavigateQuestion(Math.min(questions.length - 1, currentIndex + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Scorecard, Speed vs Accuracy & Palette */}
        <div className="lg:col-span-4 space-y-4">
          {/* Post-Submission Scorecard */}
          {isSubmitted && result && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-sm text-white">Performance Scorecard</h3>
                </div>
                <button
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPdf}
                  className="px-2.5 py-1 bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-indigo-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isGeneratingPdf ? 'Preparing...' : 'PDF Report'}</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-950 rounded-xl">
                  <span className="text-slate-400 block">Final Score</span>
                  <span className="text-lg font-black text-white font-mono">
                    {result.score} / {result.totalMarks}
                  </span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl">
                  <span className="text-slate-400 block">Accuracy</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{result.accuracy}%</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl">
                  <span className="text-slate-400 block">Correct</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{result.correct} Qs</span>
                </div>
                <div className="p-3 bg-slate-950 rounded-xl">
                  <span className="text-slate-400 block">Negative Lost</span>
                  <span className="text-sm font-bold text-rose-400 font-mono">-{result.incorrect * 0.5}</span>
                </div>
              </div>

              {/* AI Remedial Actions */}
              {result.incorrect > 0 && (
                <div className="space-y-2 pt-1">
                  {!drillQuestions && (
                    <button
                      onClick={handleLaunchTrapBreaker}
                      disabled={isDrillLoading}
                      className="w-full py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-rose-900/30 cursor-pointer"
                    >
                      {isDrillLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Synthesizing Remedial Drill...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Break {result.incorrect} Concept Traps with AI</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={isGeneratingFlashcards}
                    className="w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 text-indigo-300 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    {isGeneratingFlashcards ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing Flashcards...</span>
                      </>
                    ) : (
                      <>
                        <Layers className="w-4 h-4 text-indigo-400" />
                        <span>Generate {result.incorrect} AI Revision Flashcards</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Speed vs Accuracy Matrix */}
          {isSubmitted && result?.questionAnalytics && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Speed vs. Accuracy Matrix</h3>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                  <span className="text-emerald-400 font-bold block text-base font-mono">
                    {result.questionAnalytics.filter((q) => q.isCorrect && q.timeSpentSeconds < 45).length}
                  </span>
                  <span className="text-slate-400 text-[10px] block mt-0.5">Quick (&lt;45s)</span>
                </div>

                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                  <span className="text-amber-400 font-bold block text-base font-mono">
                    {result.questionAnalytics.filter((q) => q.isCorrect && q.timeSpentSeconds >= 45).length}
                  </span>
                  <span className="text-slate-400 text-[10px] block mt-0.5">Slow (&gt;45s)</span>
                </div>

                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <span className="text-rose-400 font-bold block text-base font-mono">
                    {result.questionAnalytics.filter((q) => !q.isCorrect && q.status === 'incorrect' && q.timeSpentSeconds > 60).length}
                  </span>
                  <span className="text-slate-400 text-[10px] block mt-0.5">Traps (&gt;60s)</span>
                </div>
              </div>
            </div>
          )}

          {/* Question Status Palette */}
          {!drillQuestions && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-xl">
              <h3 className="font-bold text-xs text-white uppercase tracking-wider pb-2 border-b border-slate-800">
                Question Palette ({filteredQuestionIndices.length} Questions)
              </h3>

              <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
                {filteredQuestionIndices.map((idx) => {
                  const qId = questions[idx]._id;
                  const isAnswered = answers[qId] !== undefined;
                  const isMarked = status[idx] === 'marked';
                  const isCurrent = currentIndex === idx;

                  let colorClass = 'bg-slate-800 text-slate-300';
                  if (isAnswered) colorClass = 'bg-emerald-600 text-white';
                  if (isMarked) colorClass = 'bg-purple-600 text-white';
                  if (isCurrent) colorClass += ' ring-2 ring-indigo-400';

                  return (
                    <button
                      key={idx}
                      onClick={() => handleNavigateQuestion(idx)}
                      className={`h-9 rounded-lg font-mono text-xs font-bold transition cursor-pointer flex items-center justify-center ${colorClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-emerald-600"></span> Answered
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-purple-600"></span> Marked
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-slate-800"></span> Unvisited
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded border border-indigo-400"></span> Current
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* AI Concept Revision Flashcard Modal */}
      {flashcards && (
        <FlashcardDeck
          cards={flashcards}
          onClose={() => setFlashcards(null)}
        />
      )}
    </div>
  );
}