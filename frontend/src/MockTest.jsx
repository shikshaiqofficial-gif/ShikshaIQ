import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ArrowLeft,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Volume2,
  VolumeX,
  RotateCcw,
  Send,
  ChevronRight,
  ChevronLeft,
  Check,
  Award,
  Zap,
  Timer,
  BarChart3
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

  // Test State
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [status, setStatus] = useState({}); // 'visited', 'answered', 'marked'
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('All');
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Speed Tracking State
  const [questionTimes, setQuestionTimes] = useState({}); // { [questionId]: seconds }
  const lastSwitchTimeRef = useRef(Date.now());

  // 1. Fetch Daily Mock Questions
  useEffect(() => {
    const fetchMock = async () => {
      try {
        setLoading(true);
        const res = await API.get('/tests/daily-100-mock?exam=SSC CGL');
        if (res.data?.questions?.length) {
          setQuestions(res.data.questions);
        }
      } catch (err) {
        console.error('Failed to load mock:', err);
      } finally {
        setLoading(false);
        lastSwitchTimeRef.current = Date.now();
      }
    };
    fetchMock();
  }, []);

  // 2. CBT Countdown Timer
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

  // 3. Audio Cleanup on unmount
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

  // Helper to record active seconds spent on current question before switching
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

    try {
      const submissionPayload = {
        exam: 'SSC CGL Daily 100 Mock',
        timeTakenSeconds: 3600 - timeLeft,
        answers: questions.map((q) => ({
          questionId: q._id,
          selectedOptionIndex: answers[q._id] !== undefined ? answers[q._id] : null,
          timeSpentSeconds: questionTimes[q._id] || 0
        }))
      };

      const res = await API.post('/tests/submit', submissionPayload);
      if (res.data?.result) {
        setResult(res.data.result);
        setIsSubmitted(true);
        setCurrentIndex(0);
      }
    } catch (err) {
      alert('Submission failed. Check your network or login session.');
    }
  };

  // Web Speech API Voice Narrator
  const toggleSpeech = (text) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
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

  const filteredQuestionIndices = questions
    .map((q, idx) => ({ q, idx }))
    .filter(({ q }) => (activeSection === 'All' ? true : q.subject === activeSection))
    .map(({ idx }) => idx);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm font-semibold text-slate-400">Synthesizing 100-Question Exam Simulation...</p>
      </div>
    );
  }

  const currentQ = questions[currentIndex];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* CBT Header */}
      <header className="h-16 bg-slate-800/90 border-b border-slate-700/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-sm sm:text-base leading-tight">SSC CGL All-India Daily CBT Mock</h1>
            <p className="text-[11px] text-slate-400">Official Exam Interface Pattern</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl font-mono text-sm">
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

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Question Card & Solution */}
        <div className="lg:col-span-8 space-y-4">
          {/* Sectional Switcher */}
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
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Question Interface */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 sm:p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60 text-xs">
              <span className="font-bold text-indigo-400 uppercase tracking-wider">
                Question {currentIndex + 1} of {questions.length} • {currentQ?.subject}
              </span>
              <span className="text-slate-400">
                Marks: <strong className="text-emerald-400">+{currentQ?.marks || 2}</strong> / Negative:{' '}
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

                let borderStyle = 'border-slate-700 bg-slate-900/60 hover:border-slate-500';
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
              <div className="p-4 bg-slate-900/90 border border-slate-700/80 rounded-xl space-y-3">
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
            <div className="flex items-center justify-between pt-4 border-t border-slate-700/60 text-xs">
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  disabled={isSubmitted}
                  className="px-3 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-300 rounded-xl transition cursor-pointer"
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
                  className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-xl transition flex items-center gap-1 cursor-pointer"
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
        </div>

        {/* Right Column: Scorecard, Speed vs. Accuracy Matrix & Palette */}
        <div className="lg:col-span-4 space-y-4">
          {/* Post-Submission Scorecard */}
          {isSubmitted && result && (
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Performance Scorecard</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/80 rounded-xl">
                  <span className="text-slate-400 block">Final Score</span>
                  <span className="text-lg font-black text-white font-mono">
                    {result.score} / {result.totalMarks}
                  </span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl">
                  <span className="text-slate-400 block">Accuracy</span>
                  <span className="text-lg font-black text-emerald-400 font-mono">{result.accuracy}%</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl">
                  <span className="text-slate-400 block">Correct</span>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{result.correct} Qs</span>
                </div>
                <div className="p-3 bg-slate-900/80 rounded-xl">
                  <span className="text-slate-400 block">Negative Lost</span>
                  <span className="text-sm font-bold text-rose-400 font-mono">-{result.incorrect * 0.5}</span>
                </div>
              </div>
            </div>
          )}

          {/* Speed vs Accuracy Matrix */}
          {isSubmitted && result?.questionAnalytics && (
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-3 shadow-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
                <BarChart3 className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-sm text-white">Speed vs. Accuracy Matrix</h3>
              </div>

              <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
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

          {/* Question Palette */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 space-y-4 shadow-xl">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider pb-2 border-b border-slate-700">
              Question Palette ({filteredQuestionIndices.length} Questions)
            </h3>

            <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1">
              {filteredQuestionIndices.map((idx) => {
                const qId = questions[idx]._id;
                const isAnswered = answers[qId] !== undefined;
                const isMarked = status[idx] === 'marked';
                const isCurrent = currentIndex === idx;

                let colorClass = 'bg-slate-700 text-slate-300';
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
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-2 border-t border-slate-700">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-emerald-600"></span> Answered
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-purple-600"></span> Marked
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-slate-700"></span> Unvisited
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded border border-indigo-400"></span> Current
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}