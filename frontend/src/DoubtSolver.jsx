import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import ReactMarkdown from 'react-markdown';
import {
  ArrowLeft,
  Sparkles,
  Send,
  Loader2,
  Volume2,
  VolumeX,
  Pause,
  Play,
  RotateCcw,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function DoubtSolver() {
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(null);

  // Speech Synthesis (TTS) State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const speechRef = useRef(null);

  const subjects = [
    'Quantitative Aptitude',
    'Reasoning',
    'General Awareness & Science',
    'English Comprehension'
  ];

  // Clean up speech synthesis when unmounting or loading new answers
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleAskDoubt = async (e) => {
    e?.preventDefault();
    if (!question.trim() || loading) return;

    // Stop ongoing speech if asking a new question
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }

    try {
      setLoading(true);
      setError(null);
      setSolution(null);

      const res = await API.post('/doubts/solve', {
        question: question.trim(),
        subject
      });

      if (res.data?.solution) {
        setSolution(res.data.solution);
      } else {
        setError('No explanation could be generated. Please try phrasing your question clearly.');
      }
    } catch (err) {
      console.error('Doubt solving failed:', err);
      setError(err.response?.data?.message || 'Server error while resolving doubt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Text-to-Speech Controller
  const handleToggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert('Speech synthesis is not supported on this browser.');
      return;
    }

    if (isSpeaking && !isPaused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      return;
    }

    // Prepare plain text: strip markdown characters for natural voice reading
    const cleanText = solution
      .replace(/[#*`_\[\]()]/g, ' ')
      .replace(/\n+/g, '. ')
      .replace(/\s+/g, ' ');

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95; // comfortable study cadence
    utterance.pitch = 1.0;

    // Attempt Indian English voice selection if available in browser
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang.includes('en-IN') || v.name.includes('India')) || voices.find(v => v.lang.startsWith('en'));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    speechRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
    setIsPaused(false);
  };

  const handleStopSpeech = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsPaused(false);
  };

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
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h1 className="font-bold text-lg">AI Doubt Resolution Mentor</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Input Card */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">Select Subject Focus:</span>
            <div className="flex gap-2 overflow-x-auto">
              {subjects.map((sub) => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => setSubject(sub)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition cursor-pointer border ${
                    subject === sub
                      ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sub.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleAskDoubt} className="space-y-4">
            <textarea
              rows="4"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Type your exam question, formula query, or problem statement here..."
              className="w-full bg-slate-900/80 border border-slate-700/80 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 leading-relaxed resize-none"
            ></textarea>

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-purple-400" />
                <span>Powered by Gemini 3.6 Flash for step-by-step reasoning & short-tricks.</span>
              </span>

              <button
                type="submit"
                disabled={loading || !question.trim()}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-purple-900/30 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Solve Doubt</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Solution Container */}
        {solution && (
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Step-by-Step Solution Breakdown</h3>
                  <p className="text-[11px] text-slate-400">Review the pedagogical steps and formulas below</p>
                </div>
              </div>

              {/* Text-to-Speech Control Bar */}
              <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-700/70 px-3 py-1.5 rounded-xl">
                <button
                  type="button"
                  onClick={handleToggleSpeech}
                  className="flex items-center gap-1.5 text-xs font-medium text-purple-300 hover:text-purple-200 transition cursor-pointer"
                  title={isSpeaking && !isPaused ? "Pause Audio" : "Listen to Solution"}
                >
                  {isSpeaking && !isPaused ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause Voice</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span>{isPaused ? "Resume Voice" : "Listen Audio"}</span>
                    </>
                  )}
                </button>

                {isSpeaking && (
                  <button
                    type="button"
                    onClick={handleStopSpeech}
                    className="text-slate-400 hover:text-rose-400 p-1 transition cursor-pointer border-l border-slate-700/60 pl-2"
                    title="Stop Audio"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Markdown Output */}
            <div className="text-sm text-slate-200 leading-relaxed space-y-3 prose prose-invert max-w-none">
              <ReactMarkdown>{solution}</ReactMarkdown>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}