import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ArrowLeft,
  Sparkles,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Zap,
  CheckCircle2,
  HelpCircle
} from 'lucide-react';

export default function FlashcardDeck() {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  const fetchFlashcards = async () => {
    setLoading(true);
    try {
      // Fetch recent mistakes to generate flashcards
      const mistakesRes = await API.get('/user/mistakes');
      const mistakes = mistakesRes.data?.mistakes || [];

      if (mistakes.length > 0) {
        const res = await API.post('/study-plan/flashcards', { mistakes });
        if (res.data?.flashcards) {
          setFlashcards(res.data.flashcards);
        }
      } else {
        // Fallback default high-yield exam flashcards if vault is empty
        setFlashcards([
          {
            id: 1,
            subject: 'Quantitative Aptitude',
            topic: 'Geometry',
            front: 'What is the relation between the angle formed at the incenter and the opposite vertex angle?',
            back: 'Angle BIC = 90° + (∠A / 2). If circumcenter instead, Angle BOC = 2 × ∠A. Never mix these up!',
            mnemonicOrTip: 'Incenter = Add 90° + half; Circumcenter = Direct double.'
          },
          {
            id: 2,
            subject: 'Quantitative Aptitude',
            topic: 'Algebra',
            front: 'If x + 1/x = k, what is the formula for x³ + 1/x³?',
            back: 'k³ - 3k. Always derive from (x + 1/x)³ = x³ + 1/x³ + 3(x + 1/x).',
            mnemonicOrTip: 'Cube minus three times k.'
          },
          {
            id: 3,
            subject: 'General Intelligence',
            topic: 'Number Series',
            front: 'What pattern should you check first when numbers grow exponentially in a series?',
            back: 'Check differences of differences (double difference) or multiplicative growth (n × 2 + 1, n × 3 + 2).',
            mnemonicOrTip: 'If growth is rapid, test multiplication before addition.'
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load flashcards:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % flashcards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  const currentCard = flashcards[currentIndex];

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
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base">AI Smart Flashcard Deck</h1>
              <p className="text-[11px] text-slate-400">High-Retention Concept Revision</p>
            </div>
          </div>
        </div>

        <div className="text-xs font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-xl">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-8 flex flex-col justify-center items-center space-y-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400">Synthesizing AI revision flashcards from your mistake vault...</p>
          </div>
        ) : flashcards.length === 0 ? (
          <div className="p-12 text-center bg-slate-900/40 border border-slate-800/80 rounded-3xl space-y-3">
            <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">No Flashcards Available</h3>
            <p className="text-xs text-slate-400">Take a mock test or log mistakes to generate custom cards.</p>
          </div>
        ) : (
          <>
            {/* Flashcard Container */}
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full h-80 sm:h-96 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-3xl p-6 sm:p-8 flex flex-col justify-between cursor-pointer shadow-2xl relative transition duration-300 group"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="px-3 py-1 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold rounded-full">
                  {currentCard?.subject} • {currentCard?.topic}
                </span>
                <span className="text-slate-500 font-mono text-[11px] flex items-center gap-1 group-hover:text-slate-300 transition">
                  <RotateCw className="w-3.5 h-3.5" /> Click to {isFlipped ? 'Show Front' : 'Flip Card'}
                </span>
              </div>

              <div className="my-auto text-center space-y-4 px-2">
                {!isFlipped ? (
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest block">Concept Trap / Question</span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-100 leading-relaxed">
                      {currentCard?.front}
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-3 animate-fadeIn">
                    <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-widest block">Formula Derivation & Solution</span>
                    <p className="text-sm sm:text-base font-medium text-slate-200 leading-relaxed">
                      {currentCard?.back}
                    </p>
                    {currentCard?.mnemonicOrTip && (
                      <div className="p-3 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs text-indigo-300 font-mono">
                        💡 Tip: {currentCard.mnemonicOrTip}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="text-center text-[11px] text-slate-500 font-mono">
                {isFlipped ? 'Showing Back (Answer)' : 'Showing Front (Question)'}
              </div>
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between w-full">
              <button
                onClick={handlePrev}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <ChevronLeft className="w-4 h-4" /> Previous Card
              </button>
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-600/30"
              >
                <RotateCw className="w-4 h-4" /> Flip Card
              </button>
              <button
                onClick={handleNext}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 rounded-xl font-bold text-xs transition flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                Next Card <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}