import React, { useState } from 'react';
import {
  Layers,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  X
} from 'lucide-react';

export default function FlashcardDeck({ cards = [], onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mastered, setMastered] = useState({});

  if (!cards || cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.min(cards.length - 1, prev + 1));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const toggleMastered = (idx) => {
    setMastered((prev) => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const masteredCount = Object.values(mastered).filter(Boolean).length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white leading-tight">AI Concept Revision Deck</h3>
              <p className="text-[11px] text-slate-400">Synthesized from test mistakes by Gemini 3.6 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Metric */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            Card <strong className="text-white">{currentIndex + 1}</strong> of <strong className="text-white">{cards.length}</strong>
          </span>
          <span className="font-mono text-emerald-400">
            {masteredCount} of {cards.length} Mastered
          </span>
        </div>

        {/* Interactive 3D Flip Card */}
        <div
          onClick={() => setIsFlipped(!isFlipped)}
          className="min-h-[260px] bg-slate-950 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col justify-between cursor-pointer transition shadow-xl relative select-none"
        >
          <div className="flex items-center justify-between text-xs">
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-bold text-[10px] uppercase tracking-wider">
              {currentCard.subject} • {currentCard.topic || 'Concept'}
            </span>
            <span className="text-[11px] text-slate-500 flex items-center gap-1">
              <RotateCw className="w-3 h-3" /> Click to Flip
            </span>
          </div>

          <div className="my-auto py-4 text-center">
            {!isFlipped ? (
              <p className="text-base sm:text-lg font-semibold text-slate-100 leading-snug">
                {currentCard.front}
              </p>
            ) : (
              <div className="space-y-3">
                <p className="text-sm sm:text-base font-medium text-emerald-300 leading-relaxed">
                  {currentCard.back}
                </p>
                {currentCard.mnemonicOrTip && (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-amber-300 font-mono text-left">
                    <strong className="text-amber-400 block mb-0.5">💡 Shortcut Formula / Mnemonic:</strong>
                    {currentCard.mnemonicOrTip}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="text-center text-[11px] text-slate-500">
            {!isFlipped ? 'Show Core Theorem & Shortcut' : 'Show Concept Trigger'}
          </div>
        </div>

        {/* Deck Navigation & Controls */}
        <div className="flex items-center justify-between pt-2 text-xs">
          <button
            onClick={() => toggleMastered(currentIndex)}
            className={`px-3.5 py-2 rounded-xl border font-semibold flex items-center gap-1.5 transition cursor-pointer ${
              mastered[currentIndex]
                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{mastered[currentIndex] ? 'Mastered' : 'Mark as Mastered'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded-xl cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={handleNext}
              disabled={currentIndex === cards.length - 1}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white rounded-xl cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}