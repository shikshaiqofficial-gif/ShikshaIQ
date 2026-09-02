import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import { 
  Send, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  ArrowLeft, 
  BookOpen, 
  CheckCircle, 
  Lightbulb, 
  Loader2,
  HelpCircle
} from 'lucide-react';

export default function DoubtSolver() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [question, setQuestion] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState(null);
  const [error, setError] = useState(null);

  // Quick preset exam queries
  const presets = [
    "Find the unit digit of (7^95 - 3^58)",
    "Explain the shortcut for 2-year CI and SI difference",
    "How to solve Syllogisms with 'Only a few' cases?",
    "Trick to remember the 8 states on Tropic of Cancer"
  ];

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, or WEBP).');
      return;
    }

    // Size limit check (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB. Please choose a smaller image.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage({
        base64: reader.result,
        mimeType: file.type
      });
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSolve = async (queryText = question) => {
    const textToSend = queryText.trim();
    if (!textToSend && !selectedImage) {
      alert('Please type a question or upload an image of the problem.');
      return;
    }

    setLoading(true);
    setError(null);
    setSolution(null);

    try {
      const payload = {
        question: textToSend,
        imageBase64: selectedImage ? selectedImage.base64 : null,
        mimeType: selectedImage ? selectedImage.mimeType : null
      };

      const res = await API.post('/doubts/solve', payload);

      if (res.data?.success) {
        setSolution(res.data.answer);
      } else {
        setError(res.data?.message || 'Failed to generate solution.');
      }
    } catch (err) {
      console.error('Doubt resolution error:', err);
      setError(
        err.response?.data?.message || 
        'Could not connect to Gemini AI. Check if GEMINI_API_KEY is configured on Render.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Navigation */}
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-6 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg">AI Doubt Resolution</h1>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium ml-2">
            Gemini 2.5 Flash
          </span>
        </div>

        <button
          onClick={() => navigate('/mock-test')}
          className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          Take a Mock Test
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 space-y-6">
        
        {/* Input Card */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Type your problem or upload a screenshot
            </label>
            <span className="text-xs text-slate-400">SSC • Railways • Banking</span>
          </div>

          {/* Text Area */}
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Paste your question here, e.g.: A train 180m long passes a telegraph post in 9 seconds. What is its speed in km/h?"
            className="w-full h-32 bg-slate-900/80 border border-slate-700 rounded-xl p-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
          />

          {/* Image Preview if selected */}
          {imagePreview && (
            <div className="relative inline-block bg-slate-900 border border-slate-700 rounded-xl p-2">
              <img 
                src={imagePreview} 
                alt="Selected doubt preview" 
                className="max-h-48 max-w-xs rounded-lg object-contain"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 bg-rose-600 hover:bg-rose-500 text-white rounded-full p-1 shadow-md transition"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-slate-700/70 hover:bg-slate-700 border border-slate-600 text-slate-200 rounded-xl text-sm font-medium transition flex items-center gap-2 cursor-pointer"
              >
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>{imagePreview ? 'Change Photo' : 'Upload Image / Screenshot'}</span>
              </button>
            </div>

            <button
              onClick={() => handleSolve()}
              disabled={loading || (!question.trim() && !selectedImage)}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-900/30 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Solving Step-by-Step...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Solve with AI</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Buttons */}
          <div className="pt-3 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" /> Try these common exam questions:
            </p>
            <div className="flex flex-wrap gap-2">
              {presets.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuestion(p);
                    handleSolve(p);
                  }}
                  className="text-xs bg-slate-900/80 hover:bg-slate-700/80 border border-slate-700/80 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg transition text-left cursor-pointer"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-sm flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-rose-400"></div>
            <span>{error}</span>
          </div>
        )}

        {/* AI Solution Response Card */}
        {solution && (
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                <CheckCircle className="w-5 h-5" />
                <span>AI Verified Solution & Shortcut</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">ShikshaIQ AI Engine</span>
            </div>

            <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed whitespace-pre-wrap font-sans">
              {solution}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}