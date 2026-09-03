import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import { ArrowLeft, Sliders, Play, Clock, CheckCircle2, XCircle, RotateCcw } from 'lucide-react';

const TOPICS_BY_SUBJECT = {
  'Quantitative Aptitude': ['All', 'Algebra', 'Geometry', 'Trigonometry', 'Arithmetic', 'Data Interpretation'],
  'General Intelligence & Reasoning': ['All', 'Syllogism', 'Analogy', 'Number Series', 'Coding-Decoding', 'Blood Relations'],
  'General Awareness': ['All', 'Indian Polity', 'Modern History', 'Geography', 'General Science', 'Static GK'],
  'English Comprehension': ['All', 'Error Spotting', 'Cloze Test', 'Idioms & Phrases', 'Synonyms', 'Antonyms']
};

export default function CustomQuiz() {
  const navigate = useNavigate();

  // Config State
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [topic, setTopic] = useState('All');
  const [difficulty, setDifficulty] = useState('Mixed');
  const [questionCount, setQuestionCount] = useState(10);
  const [timeMinutes, setTimeMinutes] = useState(15);

  // Quiz Engine State
  const [isStarted, setIsStarted] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const startQuiz = async () => {
    try {
      setLoading(true);
      const res = await API.get('/questions/custom-quiz', {
        params: { subject, topic, count: questionCount, difficulty }
      });
      if (res.data?.questions?.length > 0) {
        setQuestions(res.data.questions);
        setIsStarted(true);
        setCurrentIndex(0);
        setAnswers({});
        setIsSubmitted(false);
      } else {
        alert('No questions found for this selection. Try selecting "All" topics.');
      }
    } catch (err) {
      alert('Failed to load custom drill.');
    } finally {
      setLoading(false);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    let incorrect = 0;
    questions.forEach((q) => {
      const selected = answers[q._id];
      if (selected !== undefined) {
        if (selected === q.correctOptionIndex) correct++;
        else incorrect++;
      }
    });
    return {
      correct,
      incorrect,
      score: (correct * 2 - incorrect * 0.5).toFixed(2),
      total: questions.length * 2
    };
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-sm sm:text-base">Topic-Wise Custom Quiz Builder</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {!isStarted ? (
          /* CONFIGURATION SCREEN */
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h2 className="text-base font-bold text-white border-b border-slate-700/60 pb-3">Customize Practice Drill</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                    setTopic('All');
                  }}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                >
                  {Object.keys(TOPICS_BY_SUBJECT).map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Topic Focus</label>
                <select
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                >
                  {TOPICS_BY_SUBJECT[subject]?.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Question Volume</label>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 25, 50].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setQuestionCount(num)}
                      className={`py-2.5 rounded-xl font-bold transition cursor-pointer ${
                        questionCount === num ? 'bg-indigo-600 text-white' : 'bg-slate-900 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {num} Qs
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">Difficulty Level</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-white outline-none focus:border-indigo-500"
                >
                  <option value="Mixed">Mixed (Standard Exam Pattern)</option>
                  <option value="Easy">Easy (Foundation Booster)</option>
                  <option value="Moderate">Moderate (Tier-1 Level)</option>
                  <option value="Hard">Hard (Tier-2 Advanced)</option>
                </select>
              </div>
            </div>

            <button
              onClick={startQuiz}
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/30"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{loading ? 'Fetching Selected Questions...' : 'Launch Custom Drill'}</span>
            </button>
          </div>
        ) : (
          /* QUIZ ATTEMPT & REVIEW SCREEN */
          <div className="bg-slate-800/80 border border-slate-700/70 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between text-xs pb-3 border-b border-slate-700/60">
              <span className="font-bold text-indigo-400">
                Question {currentIndex + 1} of {questions.length} • {questions[currentIndex].topic || subject}
              </span>
              <span className="text-slate-400 font-mono">Exam Marks: +2 / -0.5</span>
            </div>

            <p className="text-sm sm:text-base font-medium text-slate-100">
              {questions[currentIndex].questionText}
            </p>

            <div className="space-y-2.5">
              {questions[currentIndex].options.map((opt, i) => {
                const qId = questions[currentIndex]._id;
                const isSelected = answers[qId] === i;
                const isCorrect = isSubmitted && questions[currentIndex].correctOptionIndex === i;
                const isWrong = isSubmitted && isSelected && questions[currentIndex].correctOptionIndex !== i;

                let border = 'border-slate-700 bg-slate-900/60 hover:border-slate-500';
                if (isSelected && !isSubmitted) border = 'border-indigo-500 bg-indigo-600/10 text-white';
                if (isCorrect) border = 'border-emerald-500 bg-emerald-500/10 text-emerald-400';
                if (isWrong) border = 'border-rose-500 bg-rose-500/10 text-rose-400';

                return (
                  <button
                    key={i}
                    onClick={() => !isSubmitted && setAnswers({ ...answers, [qId]: i })}
                    className={`w-full p-3.5 rounded-xl border text-xs sm:text-sm text-left flex items-center justify-between transition cursor-pointer ${border}`}
                  >
                    <span>{String.fromCharCode(65 + i)}. {opt}</span>
                    {isCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                    {isWrong && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
                  </button>
                );
              })}
            </div>

            {isSubmitted && (
              <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 text-xs text-slate-300 font-mono space-y-1">
                <span className="text-indigo-400 font-bold block">Explanation:</span>
                <p>{questions[currentIndex].explanation}</p>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-700/60 text-xs">
              <button
                onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                disabled={currentIndex === 0}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-xl cursor-pointer"
              >
                Previous
              </button>

              {!isSubmitted ? (
                <button
                  onClick={() => setIsSubmitted(true)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl cursor-pointer"
                >
                  Submit & Score Drill
                </button>
              ) : (
                <button
                  onClick={() => setIsStarted(false)}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reconfigure Drill
                </button>
              )}

              <button
                onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                disabled={currentIndex === questions.length - 1}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 rounded-xl cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}