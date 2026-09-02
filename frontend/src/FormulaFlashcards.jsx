import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  RotateCw,
  CheckCircle2,
  Bookmark,
  BookmarkCheck,
  Search,
  Shuffle,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Layers,
  Award,
  BookOpen
} from 'lucide-react';

const FLASHCARD_DECK = [
  // Quantitative Aptitude - Algebra
  {
    id: 1,
    subject: 'Quantitative Aptitude',
    category: 'Algebra',
    topic: 'Symmetric Polynomials',
    front: 'If x + 1/x = k, what is the shortcut value for x² + 1/x² and x³ + 1/x³?',
    back: '• x² + 1/x² = k² - 2\n• x³ + 1/x³ = k³ - 3k\n\nExam Note: If x - 1/x = k, then x² + 1/x² = k² + 2, and x³ - 1/x³ = k³ + 3k.',
    examTip: 'High-yield SSC CGL Tier-1 pattern. Solve in under 10 seconds without expanding polynomials.'
  },
  {
    id: 2,
    subject: 'Quantitative Aptitude',
    category: 'Algebra',
    topic: 'Special Identity Rule',
    front: 'What happens to a³ + b³ + c³ - 3abc when a + b + c = 0?',
    back: 'If a + b + c = 0, then:\na³ + b³ + c³ = 3abc\n\nAlternative Form:\n½(a + b + c)[(a - b)² + (b - c)² + (c - a)²]',
    examTip: 'Look for cases where (x - y) + (y - z) + (z - x) = 0 to directly equate sum of cubes to 3(a)(b)(c).'
  },

  // Quantitative Aptitude - Arithmetic
  {
    id: 3,
    subject: 'Quantitative Aptitude',
    category: 'Arithmetic',
    topic: 'Compound Interest vs Simple Interest Difference',
    front: 'What is the formula for the difference between CI and SI for 2 years and 3 years at rate R%?',
    back: '• For 2 Years: Diff = P × (R / 100)²\n\n• For 3 Years: Diff = P × (R / 100)² × (300 + R) / 100',
    examTip: 'Directly plug in Principal (P) and Rate (R) without computing intermediate step amounts.'
  },
  {
    id: 4,
    subject: 'Quantitative Aptitude',
    category: 'Arithmetic',
    topic: 'Successive Percentage & Discount',
    front: 'What is the single equivalent discount for two successive discounts of x% and y%?',
    back: 'Equivalent Discount = [x + y - (xy / 100)]%\n\nFor 3 successive discounts (x, y, z), combine first two then combine result with z.',
    examTip: 'If two values increase by x% and decrease by x%, net effect is ALWAYS a loss of (x² / 100)%.'
  },
  {
    id: 5,
    subject: 'Quantitative Aptitude',
    category: 'Arithmetic',
    topic: 'Time, Speed & Average Speed',
    front: 'A person travels from A to B at speed "x" and returns from B to A at speed "y". What is the average speed?',
    back: 'Average Speed = (2xy) / (x + y)\n\nNote: This only holds true when distance traveled in both legs is EQUAL.',
    examTip: 'If time intervals are equal instead of distances, Average Speed is simply (x + y) / 2.'
  },

  // Quantitative Aptitude - Geometry & Mensuration
  {
    id: 6,
    subject: 'Quantitative Aptitude',
    category: 'Geometry',
    topic: 'Equilateral Triangle Properties',
    front: 'What are the formulas for Area, Height, Inradius (r), and Circumradius (R) of an equilateral triangle with side "a"?',
    back: '• Area = (√3 / 4) × a²\n• Height (h) = (√3 / 2) × a\n• Inradius (r) = a / (2√3)\n• Circumradius (R) = a / √3\n\nRatio of R : r is always 2 : 1.',
    examTip: 'Inradius is exactly half the Circumradius in any equilateral triangle.'
  },
  {
    id: 7,
    subject: 'Quantitative Aptitude',
    category: 'Geometry',
    topic: 'Circle Tangent-Secant Theorem',
    front: 'If secant P-A-B and tangent PT meet outside a circle from point P, what is the relation between PT, PA, and PB?',
    back: 'PT² = PA × PB\n\nIf two chords AB and CD intersect externally at P:\nPA × PB = PC × PD',
    examTip: 'PA is the external segment; PB is the entire length from P to the far circle boundary.'
  },

  // Quantitative Aptitude - Trigonometry
  {
    id: 8,
    subject: 'Quantitative Aptitude',
    category: 'Trigonometry',
    topic: 'Maximum and Minimum Values',
    front: 'What are the Maximum and Minimum values of "a sin θ + b cos θ"?',
    back: '• Maximum Value = +√(a² + b²)\n• Minimum Value = -√(a² + b²)\n\nExample for 3 sin θ + 4 cos θ:\nMax = +5, Min = -5.',
    examTip: 'Always identify coefficients "a" and "b" carefully when signs are negative.'
  },

  // Reasoning - Logical & Coding
  {
    id: 9,
    subject: 'Reasoning',
    category: 'Reasoning',
    topic: 'Opposite Letter Pairs (Alphabet Test)',
    front: 'What is the sum of positional ranks of opposite alphabet pairs, and how do you quickly recall them?',
    back: 'Sum is always 27.\n\nQuick Mnemonics:\n• A-Z (Azad), B-Y (Boy), C-X (Crux)\n• D-W (Dew), E-V (EVening), F-U (FUll)\n• G-T (GT Road), H-S (High School)\n• I-R (Indian Railway), J-Q (Jungle Queen)\n• K-P (KanPur), L-O (LOve), M-N (MAN)',
    examTip: 'Positional value of letter from right side = 27 - Rank from left side.'
  },
  {
    id: 10,
    subject: 'Reasoning',
    category: 'Reasoning',
    topic: 'Clock Angle Formula',
    front: 'What is the exact angle between the Hour hand and Minute hand at H hours and M minutes?',
    back: 'Angle θ = | 30H - (11/2)M |\n\nIf the angle exceeds 180°, reflex angle is (360° - θ).',
    examTip: 'Hands overlap (0° angle) 11 times in 12 hours and 22 times in 24 hours.'
  },
  {
    id: 11,
    subject: 'Reasoning',
    category: 'Reasoning',
    topic: 'Calendar Odd Days Shortcut',
    front: 'How many odd days are in 100, 200, 300, and 400 years?',
    back: '• 100 Years = 5 Odd Days\n• 200 Years = 3 Odd Days\n• 300 Years = 1 Odd Day\n• 400 Years = 0 Odd Days (Leap century)',
    examTip: 'Code rule: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat.'
  }
];

export default function FormulaFlashcards() {
  const navigate = useNavigate();

  const [cards, setCards] = useState(FLASHCARD_DECK);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Local storage persistence for mastered cards
  const [masteredCards, setMasteredCards] = useState(() => {
    try {
      const saved = localStorage.getItem('shiksha_mastered_cards');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const categories = ['All', 'Algebra', 'Arithmetic', 'Geometry', 'Trigonometry', 'Reasoning'];

  // Filter cards based on Category and Search Query
  const filteredCards = cards.filter((card) => {
    const matchesCategory = selectedCategory === 'All' || card.category === selectedCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      card.topic.toLowerCase().includes(query) ||
      card.front.toLowerCase().includes(query) ||
      card.back.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  // Clamp index when filter changes
  useEffect(() => {
    setCurrentIndex(0);
    setIsFlipped(false);
  }, [selectedCategory, searchQuery]);

  const toggleFlip = () => setIsFlipped((prev) => !prev);

  const handleNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev < filteredCards.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : filteredCards.length - 1));
  };

  const handleShuffle = () => {
    setIsFlipped(false);
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
  };

  const toggleMastered = (id) => {
    setMasteredCards((prev) => {
      const updated = prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id];
      localStorage.setItem('shiksha_mastered_cards', JSON.stringify(updated));
      return updated;
    });
  };

  const currentCard = filteredCards[currentIndex];
  const isMastered = currentCard && masteredCards.includes(currentCard.id);
  const masteredCount = cards.filter((c) => masteredCards.includes(c.id)).length;
  const progressPercent = Math.round((masteredCount / cards.length) * 100);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg">Formula Flashcards & Shortcuts</h1>
          </div>
        </div>

        {/* Global Progress */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end text-xs">
            <span className="text-slate-400">Mastered: {masteredCount} / {cards.length}</span>
            <span className="text-emerald-400 font-bold">{progressPercent}% Retained</span>
          </div>
          <div className="w-16 sm:w-24 bg-slate-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6 flex flex-col justify-between">
        
        {/* Filter & Controls Bar */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topic or formula (e.g. Algebra, CI, Triangle, Clock)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={handleShuffle}
              className="w-full sm:w-auto px-3.5 py-2 bg-slate-900 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition cursor-pointer"
            >
              <Shuffle className="w-3.5 h-3.5 text-indigo-400" />
              <span>Shuffle Stack</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition cursor-pointer border ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3D Flashcard Section */}
        {filteredCards.length === 0 ? (
          <div className="py-24 text-center bg-slate-800/40 border border-slate-700/60 rounded-3xl p-8 space-y-3">
            <Layers className="w-10 h-10 text-slate-500 mx-auto" />
            <h3 className="text-base font-bold text-white">No Flashcards Found</h3>
            <p className="text-xs text-slate-400">Try changing your search query or select "All" categories.</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            {/* Position Tracker & Status */}
            <div className="w-full max-w-xl flex items-center justify-between text-xs px-2 text-slate-400">
              <span className="font-semibold">
                Card {currentIndex + 1} of {filteredCards.length}
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full border border-indigo-500/30 text-[11px] font-semibold">
                {currentCard.category}
              </span>
            </div>

            {/* 3D Flippable Card Element */}
            <div
              onClick={toggleFlip}
              className="w-full max-w-xl h-80 sm:h-96 perspective-1000 cursor-pointer select-none group"
            >
              <div
                className={`relative w-full h-full duration-500 transform-style-3d transition-transform ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
              >
                {/* FRONT FACE (Question / Prompt) */}
                <div className="absolute inset-0 w-full h-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backface-hidden group-hover:border-indigo-500/50 transition">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                      {currentCard.topic}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMastered(currentCard.id);
                      }}
                      className="text-slate-400 hover:text-amber-400 transition"
                      title={isMastered ? "Mark Needs Review" : "Mark Mastered"}
                    >
                      {isMastered ? (
                        <BookmarkCheck className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="my-auto text-center space-y-3">
                    <p className="text-lg sm:text-xl font-bold text-white leading-relaxed">
                      {currentCard.front}
                    </p>
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 pt-2 border-t border-slate-700/50">
                    <RotateCw className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Click or tap card to reveal solution & shortcut</span>
                  </div>
                </div>

                {/* BACK FACE (Formula & Explanation) */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-950/90 to-slate-800/95 border border-indigo-500/40 rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xl backface-hidden rotate-y-180">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                      Verified Formula & Shortcut
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMastered(currentCard.id);
                      }}
                      className="text-slate-400 hover:text-amber-400 transition"
                    >
                      {isMastered ? (
                        <BookmarkCheck className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Bookmark className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  <div className="my-auto space-y-3">
                    <pre className="text-sm sm:text-base font-semibold text-slate-100 whitespace-pre-line leading-relaxed font-sans">
                      {currentCard.back}
                    </pre>

                    {currentCard.examTip && (
                      <div className="bg-slate-900/70 p-3 rounded-xl border border-indigo-500/30 text-xs text-indigo-200">
                        <strong className="text-indigo-400 font-bold">Exam Pro-Tip: </strong>
                        {currentCard.examTip}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-indigo-900/40">
                    <span>{currentCard.subject}</span>
                    <span className="text-indigo-300 font-medium">Click to flip back</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Navigation Buttons */}
            <div className="w-full max-w-xl flex items-center justify-between gap-3 pt-2">
              <button
                onClick={handlePrev}
                className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={() => toggleMastered(currentCard.id)}
                className={`flex-1 py-3 text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg ${
                  isMastered
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{isMastered ? 'Mastered ✓' : 'Mark as Mastered'}</span>
              </button>

              <button
                onClick={handleNext}
                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/30"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}