import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ArrowLeft,
  HelpCircle,
  Upload,
  Sparkles,
  Zap,
  Send,
  CheckCircle2,
  Image as ImageIcon,
  X
} from 'lucide-react';

const SUBJECTS = ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'General Awareness', 'English Comprehension'];

export default function DoubtSolver() {
  const navigate = useNavigate();
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [question, setQuestion] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState('');

  // Handle image upload & base64 conversion
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSolveDoubt = async (e) => {
    e.preventDefault();
    if (!question.trim() && !imageBase64) {
      alert('Please enter a question description or upload a diagram image.');
      return;
    }

    setLoading(true);
    setSolution('');

    try {
      const res = await API.post('/doubts/solve', {
        subject,
        question,
        imageBase64
      });

      if (res.data?.solution) {
        setSolution(res.data.solution);
      }
    } catch (err) {
      console.error('Doubt solver error:', err);
      alert('Failed to resolve doubt. Please check your API key or network connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-slate-900/80 border-b border-slate-800 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base">AI Multimodal Doubt Solver</h1>
              <p className="text-[11px] text-slate-400">Powered by Gemini 3.6 Flash</p>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl hidden sm:block">
          ● Instant Step-by-Step Derivations
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          {/* Query Form Column */}
          <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Sparkles className="w-4 h-4" />
              <span>Ask Your Exam Doubt</span>
            </div>

            <form onSubmit={handleSolveDoubt} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Subject Domain</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Question Description / Equation</label>
                <textarea
                  rows={4}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Type your question or copy statement here..."
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Image Upload Box */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Upload Diagram or Screenshot (Optional)</label>
                {imagePreview ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 p-2 flex items-center justify-center">
                    <img src={imagePreview} alt="Upload Preview" className="max-h-40 rounded-xl object-contain" />
                    <button
                      type="button"
                      onClick={() => { setImageBase64(''); setImagePreview(''); }}
                      className="absolute top-3 right-3 p-1.5 bg-slate-900 text-slate-300 hover:text-rose-400 rounded-full border border-slate-700 shadow-md cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition bg-slate-950/40">
                    <ImageIcon className="w-6 h-6 text-slate-500 mb-1" />
                    <span className="text-slate-300 font-medium">Click to upload image diagram</span>
                    <span className="text-[10px] text-slate-500">PNG, JPG up to 10MB</span>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl transition cursor-pointer shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Solve Doubt with AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Solution Output Column */}
          <div className="md:col-span-6 bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl min-h-[420px] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-emerald-400" /> Expert Faculty Solution
              </span>
              <span className="text-slate-500 font-mono text-[10px]">Gemini 3.6 Flash</span>
            </div>

            <div className="flex-1 flex flex-col justify-center">
              {loading ? (
                <div className="py-16 text-center space-y-3">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-slate-400">Analyzing theorem rules and deriving solution...</p>
                </div>
              ) : solution ? (
                <div className="space-y-3 text-xs sm:text-sm text-slate-200 leading-relaxed font-mono whitespace-pre-wrap bg-slate-950 p-4 rounded-2xl border border-slate-800 max-h-[400px] overflow-y-auto">
                  {solution}
                </div>
              ) : (
                <div className="text-center space-y-2 py-16">
                  <HelpCircle className="w-10 h-10 text-slate-700 mx-auto" />
                  <p className="text-xs text-slate-500">Your AI-generated step-by-step derivation and shortcut trick will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}