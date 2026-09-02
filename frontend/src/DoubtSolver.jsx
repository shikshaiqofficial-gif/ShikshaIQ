import React, { useState, useRef } from 'react';
import {
  Bot,
  UploadCloud,
  Image as ImageIcon,
  Send,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  X,
  HelpCircle,
  Zap,
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import API from './api';

const SUBJECTS = [
  'Quantitative Aptitude & Math',
  'Logical Reasoning',
  'General Science',
  'English Comprehension',
  'General Awareness',
];

export default function DoubtSolver() {
  const [questionText, setQuestionText] = useState('');
  const [selectedSubject, setSelectedSubject] = useState(SUBJECTS[0]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('Image size exceeds 5MB limit.');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg('');
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionText.trim() && !selectedFile) {
      setErrorMsg('Please type your problem or upload an image of the question.');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSolution('');

    try {
      const formData = new FormData();
      formData.append('questionText', questionText);
      formData.append('subject', selectedSubject);
      if (selectedFile) {
        formData.append('image', selectedFile);
      }

      const res = await API.post('/doubts/solve', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data?.success) {
        setSolution(res.data.solution);
      } else {
        throw new Error(res.data?.message || 'Failed to solve doubt');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Error communicating with AI engine.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
              <Bot className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              24x7 Personalized Exam Tutor
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-2">
            AI Instant Doubt Solver <Sparkles className="w-6 h-6 text-orange-500" />
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Stuck on a tricky quantitative question or puzzle? Upload a photo or type your problem for instant, step-by-step logic.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Input Panel */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col justify-between">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5 tracking-wider">
                  Target Subject
                </label>
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full py-2.5 px-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5 tracking-wider">
                  Type Your Question or Paste Text
                </label>
                <textarea
                  rows="4"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="e.g. A train 150m long is running at 60 km/hr. In how much time will it cross a electric pole?"
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white resize-none transition-all"
                />
              </div>

              {/* Photo Upload Box */}
              <div>
                <label className="block text-xs font-bold uppercase text-slate-600 mb-1.5 tracking-wider">
                  Or Upload Question Photo
                </label>
                
                {previewUrl ? (
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 p-2">
                    <img src={previewUrl} alt="Preview" className="max-h-48 w-full object-contain rounded-xl" />
                    <button
                      type="button"
                      onClick={removeFile}
                      className="absolute top-3 right-3 p-1.5 bg-slate-900/80 text-white rounded-full hover:bg-red-600 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-orange-500 bg-slate-50 hover:bg-orange-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center"
                  >
                    <UploadCloud className="w-8 h-8 text-slate-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700">Click to upload from Gallery or Camera</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">PNG, JPG, WebP up to 5MB</p>
                  </div>
                )}

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold border border-red-200">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99] disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Solving with Shiksha AI...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Get Step-by-Step Solution
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Solution Display Panel */}
          <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm flex flex-col min-h-[420px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-black uppercase tracking-wider text-slate-700">
                  AI Solution Breakdown
                </span>
              </div>
              {solution && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified
                </span>
              )}
            </div>

            <div className="flex-1 mt-4 overflow-y-auto max-h-[550px] pr-1">
              {loading ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center animate-bounce">
                    <Bot className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">Analyzing question & deriving formulas...</p>
                  <p className="text-xs text-slate-400 max-w-xs">
                    Shiksha IQ is calculating step-by-step logic and checking shortcuts for your exam.
                  </p>
                </div>
              ) : solution ? (
                <div className="prose prose-slate prose-sm max-w-none space-y-2 text-slate-800 leading-relaxed">
                  <ReactMarkdown>{solution}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
                  <HelpCircle className="w-10 h-10 stroke-[1.5] text-slate-300" />
                  <p className="text-sm font-bold text-slate-600">Your detailed solution will appear here</p>
                  <p className="text-xs max-w-xs">
                    Ask any question across Arithmetic, Reasoning, General Studies, or Grammatical Rules.
                  </p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}