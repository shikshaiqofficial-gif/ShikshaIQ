import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  RotateCw,
  Star,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Bookmark
} from 'lucide-react';

const INITIAL_FLASHCARDS = [
  {
    id: 1,
    subject: 'Quantitative Aptitude',
    topic: 'Algebra',
    exam: 'SSC CGL',
    front: 'If x + 1/x = k, what is x² + 1/x² and x³ + 1/x³?',
    back: '• x² + 1/x² = k² - 2\n• x³ + 1/x³ = k³ - 3k\n\nExample: If x + 1/x = 4, then x² + 1/x² = 16 - 2 = 14.',
    shortcut: 'Memorize power-index reduction tricks for rapid 5-second algebra scores.'
  },
  {
    id: 2,
    subject: 'Quantitative Aptitude',
    topic: 'Geometry',
    exam: 'SSC CGL',
    front: 'Inradius (r) and Circumradius (R) of an Equilateral Triangle with side a:',
    back: '• Inradius: r = a / (2√3)\n• Circumradius: R = a / √3\n• Ratio: R : r is always 2 : 1',
    shortcut: 'Circumradius is always double the inradius in any equilateral triangle.'
  },
  {
    id: 3,
    subject: 'Quantitative Aptitude',
    topic: 'Compound Interest',
    exam: 'RRB NTPC',
    front: 'Difference between CI and SI for 2 years and 3 years at rate R%:',
    back: '• 2 Years: Diff = P × (R / 100)²\n• 3 Years: Diff = P × (R / 100)² × (300 + R) / 100',
    shortcut: 'Direct formula application saves 90 seconds versus calculating CI step-by-step.'
  },
  {
    id: 4,
    subject: 'Reasoning',
    topic: 'Clock',
    exam: 'RRB NTPC',
    front: 'Angle (θ) between Hour Hand and Minute Hand at H hours and M minutes:',
    back: 'θ = | 30H - (11/2)M |\n\nExample at 3:30:\nθ = | 30(3) - (11/2)(30) | = | 90 - 165 | = 75°',
    shortcut: 'If the angle exceeds 180°, subtract from 360° to get the acute angle.'
  },
  {
    id: 5,
    subject: 'General Awareness',
    topic: 'Indian Polity',
    exam: 'SSC CGL',
    front: 'The 5 Constitutional Writs under Article 32 & 226:',
    back: '1. Habeas Corpus (To have the body of)\n2. Mandamus (We command)\n3. Prohibition (To forbid)\n4. Certiorari (To be certified/informed)\n5. Quo-Warranto (By what authority)',
    shortcut: 'Mnemonic: "H M P C Q" — Supreme Court (Art 32) vs High Court (Art 226).'
  }
];

export default function FormulaFlashcards() {
  const navigate = useNavigate();
  const [cards] = useState(INITIAL_FLASHCARDS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showStarredOnly, setShowStarredOnly] = useState(false);

  // Persistent bookmarked IDs in localStorage
  const [starredIds, setStarredIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shiksha_starred_flashcards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persistent mastered IDs in localStorage
  const [masteredIds, setMasteredIds] = useState(() => {
    try {
      const saved = localStorage.getItem('shiksha_mastered_flashcards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('shiksha_starred_flashcards', JSON.stringify(starredIds));
  }, [starredIds]);

  useEffect(() => {
    localStorage.setItem('shiksha_mastered_flashcards', JSON.stringify(masteredIds));
  }, [masteredIds]);

  const toggleStar = (id) => {
    setStarredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleMastered = (id) => {
    setMasteredIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredCards = cards.filter((card) => {
    const matchesCategory =
      selectedCategory === 'All' || card.subject === selectedCategory;
    const matchesStarred = !showStarredOnly || starredIds.includes(card.id);
    return matchesCategory && matchesStarred;
  });

  const activeCard = filteredCards[currentIndex] || filteredCards[0];

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const categories = ['All', 'Quantitative Aptitude', 'Reasoning', 'General Awareness'];

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
            <h1 className="font-bold text-lg">High-Yield Formula Flashcards</h1>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs bg-slate-900/80 border border-slate-700 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-slate-300">
            Mastered: {masteredIds.length} / {cards.length}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between space-y-6">
        {/* Filters */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setCurrentIndex(0);
                  setIsFlipped(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-semibold transition cursor-pointer border shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-purple-600 border-purple-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.split(' ')[0]}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setShowStarredOnly(!showStarredOnly);
              setCurrentIndex(0);
              setIsFlipped(false);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border shrink-0 ${
              showStarredOnly
                ? 'bg-amber-500/20 border-amber-500/60 text-amber-300'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${showStarredOnly ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>Starred Only ({starredIds.length})</span>
          </button>
        </div>

        {/* Card View */}
        {activeCard ? (
          <div className="flex-1 flex flex-col justify-center items-center py-4">
            <div
              onClick={() => setIsFlipped(!isFlipped)}
              className="w-full max-w-xl min-h-[300px] bg-gradient-to-br from-slate-800/90 to-slate-900 border border-purple-500/30 rounded-3xl p-8 shadow-2xl flex flex-col justify-between cursor-pointer hover:border-purple-500/60 transition duration-300 relative group"
            >
              {/* Card Meta & Star */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                    {activeCard.subject}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">{activeCard.topic}</span>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(activeCard.id);
                  }}
                  className="p-1.5 rounded-lg hover:bg-slate-700/60 transition cursor-pointer"
                  title="Bookmark Formula"
                >
                  <Star
                    className={`w-5 h-5 ${
                      starredIds.includes(activeCard.id)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-slate-500 hover:text-amber-400'
                    }`}
                  />
                </button>
              </div>

              {/* Front / Back Content */}
              <div className="py-6 text-center">
                {!isFlipped ? (
                  <div className="space-y-4">
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest block">
                      Formula & Concept Prompt
                    </span>
                    <h3 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                      {activeCard.front}
                    </h3>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-widest block">
                      Derivation & Application
                    </span>
                    <pre className="text-sm sm:text-base font-sans text-slate-200 whitespace-pre-line text-left bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
                      {activeCard.back}
                    </pre>
                    {activeCard.shortcut && (
                      <p className="text-xs text-amber-300 italic text-left">
                        💡 Trick: {activeCard.shortcut}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Flip Hint */}
              <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-3 border-t border-slate-800">
                <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition duration-500" />
                <span>Click card to reveal {isFlipped ? 'question' : 'solution'}</span>
              </div>
            </div>

            {/* Mastery Toggle */}
            <button
              onClick={() => toggleMastered(activeCard.id)}
              className={`mt-4 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition cursor-pointer border ${
                masteredIds.includes(activeCard.id)
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {masteredIds.includes(activeCard.id)
                  ? 'Mastered (Click to Unmark)'
                  : 'Mark as Mastered'}
              </span>
            </button>
          </div>
        ) : (
          <div className="py-16 text-center bg-slate-800/40 rounded-3xl border border-slate-800 p-8 space-y-3">
            <Bookmark className="w-10 h-10 text-slate-600 mx-auto" />
            <h4 className="text-base font-bold text-slate-200">No Starred Flashcards Found</h4>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Star flashcards while studying to review them in this filtered list right before mock exams.
            </p>
          </div>
        )}

        {/* Navigation Arrows */}
        {filteredCards.length > 0 && (
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handlePrev}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <span className="text-xs text-slate-400 font-mono">
              {currentIndex + 1} / {filteredCards.length}
            </span>

            <button
              onClick={handleNext}
              className="p-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-2xl text-slate-300 transition cursor-pointer flex items-center gap-2 text-xs font-semibold"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}