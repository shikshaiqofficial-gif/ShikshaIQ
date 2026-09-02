import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Award, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw,
  BookOpen
} from 'lucide-react';

export default function MockTest() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [questionId]: selectedIndex }
  const [timeLeft, setTimeLeft] = useState(1200); // 20 minutes in seconds
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch Questions
  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch up to 20 questions
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

  // Timer countdown
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
        // Submit to API for full score calculation and leaderboard recording
        const res = await API.post('/tests/submit', {
          exam: questions[0]?.exam || 'SSC Mock Test',
          answers: formattedAnswers,
          timeTakenSeconds: 1200 - timeLeft
        });
        setResult(res.data.result);
      } else {
        // Fallback local scoring if student is taking test as guest
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading State
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

  // Error / No Questions State
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

  // Result / Scorecard View
  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-slate-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-xl w-full bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <Award className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold">Test Performance Report</h1>
            <p className="text-sm text-slate-400">{questions[0]?.exam || 'SSC Examination'} Mock Test</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400">Total Score</span>
              <p className="text-2xl font-bold text-indigo-400">{result.score} <span className="text-sm text-slate-500">/ {result.totalMarks}</span></p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400">Accuracy</span>
              <p className="text-2xl font-bold text-emerald-400">{result.accuracy}%</p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400">Correct Answers</span>
              <p className="text-xl font-bold text-emerald-400">{result.correct} <span className="text-xs text-slate-500">questions</span></p>
            </div>
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-700/50">
              <span className="text-xs text-slate-400">Negative / Wrong</span>
              <p className="text-xl font-bold text-rose-400">{result.incorrect} <span className="text-xs text-slate-500">questions</span></p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition"
            >
              View Leaderboard
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition"
            >
              Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Test Arena View
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
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
            className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white text-sm font-semibold rounded-lg transition"
          >
            {submitting ? 'Submitting...' : 'Submit Test'}
          </button>
        </div>
      </header>

      {/* Main Content Arena */}
      <div className="flex-1 max-w-6xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left 3 cols: Question Panel */}
        <div className="lg:col-span-3 bg-slate-800/60 border border-slate-700/60 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center text-xs text-slate-400 pb-4 border-b border-slate-700/50 mb-6">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-indigo-400">+{currentQ.marks} Marks | -{currentQ.negativeMarks} Neg</span>
            </div>

            <h2 className="text-lg font-medium text-slate-100 mb-6 leading-relaxed">
              {currentQ.questionText}
            </h2>

            {/* Options List */}
            <div className="space-y-3">
              {currentQ.options.map((opt, idx) => {
                const isSelected = userAnswers[currentQ._id] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(currentQ._id, idx)}
                    className={`w-full text-left p-4 rounded-xl border transition flex items-center justify-between ${
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

          {/* Question Nav Buttons */}
          <div className="pt-8 flex items-center justify-between border-t border-slate-700/50 mt-6">
            <button
              onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 rounded-xl text-sm font-medium transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            {userAnswers[currentQ._id] !== undefined && (
              <button
                onClick={() => handleClearOption(currentQ._id)}
                className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear Response
              </button>
            )}

            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              disabled={currentIndex === questions.length - 1}
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 rounded-xl text-sm font-medium transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Right col: Question Palette */}
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
                  className={`h-9 rounded-lg text-xs font-bold transition flex items-center justify-center ${
                    isCurrent
                      ? 'ring-2 ring-indigo-400 font-extrabold'
                      : ''
                  } ${
                    isAnswered
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700'
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