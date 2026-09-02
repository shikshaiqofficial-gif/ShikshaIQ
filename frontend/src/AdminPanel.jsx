import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ArrowLeft,
  Search,
  PlusCircle,
  Trash2,
  Filter,
  CheckCircle2,
  AlertCircle,
  Database,
  Layers,
  Sparkles,
  Loader2,
  X
} from 'lucide-react';

const SUBJECTS = [
  'All',
  'Quantitative Aptitude',
  'Reasoning',
  'General Awareness',
  'English Comprehension'
];

const DIFFICULTIES = ['All', 'Easy', 'Moderate', 'Hard'];

export default function AdminPanel() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  // New Question Form Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const [formData, setFormData] = useState({
    exam: 'SSC CGL',
    subject: 'Quantitative Aptitude',
    topic: '',
    difficulty: 'Moderate',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: ''
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const res = await API.get('/questions?limit=100');
      if (res.data?.questions) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    try {
      await API.delete(`/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Could not delete question.');
    }
  };

  const handleOptionChange = (idx, value) => {
    const next = [...formData.options];
    next[idx] = value;
    setFormData({ ...formData, options: next });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.options.some((opt) => !opt.trim())) {
      setError('Please provide text for all 4 options.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await API.post('/questions', formData);
      if (res.data?.question) {
        setQuestions((prev) => [res.data.question, ...prev]);
        setSuccessMessage('Question added successfully!');
        setIsModalOpen(false);
        setFormData({
          exam: 'SSC CGL',
          subject: 'Quantitative Aptitude',
          topic: '',
          difficulty: 'Moderate',
          questionText: '',
          options: ['', '', '', ''],
          correctOptionIndex: 0,
          marks: 2,
          negativeMarks: 0.5,
          explanation: ''
        });
        setTimeout(() => setSuccessMessage(null), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit question.');
    } finally {
      setSubmitting(false);
    }
  };

  // Real-time search and filter logic
  const filteredQuestions = questions.filter((q) => {
    const matchesSubject =
      selectedSubject === 'All' || q.subject === selectedSubject;
    const matchesDifficulty =
      selectedDifficulty === 'All' || q.difficulty === selectedDifficulty;
    const matchesSearch =
      !searchTerm ||
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      (q.topic && q.topic.toLowerCase().includes(searchTerm.toLowerCase().trim()));

    return matchesSubject && matchesDifficulty && matchesSearch;
  });

  const getDifficultyBadge = (level) => {
    switch (level) {
      case 'Easy':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Hard':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
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
            <Database className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg">Question Bank Inventory</h1>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg shadow-indigo-900/30 transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-5">
        {successMessage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-xl">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic, formula, or question text..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Subject Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-[11px] text-slate-400 font-semibold mr-1 hidden sm:inline">Subject:</span>
              {SUBJECTS.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition cursor-pointer shrink-0 ${
                    selectedSubject === sub
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sub.split(' ')[0]}
                </button>
              ))}
            </div>

            {/* Difficulty Selector */}
            <div className="flex items-center gap-1.5 pl-2 sm:border-l sm:border-slate-700">
              <span className="text-[11px] text-slate-400 font-semibold mr-1 hidden sm:inline">Level:</span>
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition cursor-pointer ${
                    selectedDifficulty === diff
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Question Counter */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>
            Showing <strong className="text-indigo-400 font-mono">{filteredQuestions.length}</strong> of{' '}
            <strong className="text-slate-200 font-mono">{questions.length}</strong> questions
          </span>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="text-indigo-400 hover:underline cursor-pointer"
            >
              Clear search
            </button>
          )}
        </div>

        {/* Questions Table */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-700/80">
                <tr>
                  <th className="px-4 py-3.5 w-12 text-center">#</th>
                  <th className="px-4 py-3.5">Question Text & Options</th>
                  <th className="px-4 py-3.5 w-36">Subject / Topic</th>
                  <th className="px-4 py-3.5 w-24 text-center">Difficulty</th>
                  <th className="px-4 py-3.5 w-24 text-center">Marks</th>
                  <th className="px-4 py-3.5 w-20 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {filteredQuestions.map((q, idx) => (
                  <tr key={q._id || idx} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-4 text-center font-mono text-slate-400">
                      {idx + 1}
                    </td>

                    <td className="px-4 py-4 space-y-2">
                      <p className="font-medium text-slate-100 line-clamp-2 leading-relaxed">
                        {q.questionText}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {q.options?.map((opt, oIdx) => (
                          <span
                            key={oIdx}
                            className={`px-2 py-0.5 rounded-lg text-[11px] border ${
                              oIdx === q.correctOptionIndex
                                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-semibold'
                                : 'bg-slate-900/60 border-slate-700/60 text-slate-400'
                            }`}
                          >
                            {String.fromCharCode(65 + oIdx)}. {opt}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="px-4 py-4 space-y-1">
                      <span className="block font-semibold text-slate-200">
                        {q.subject}
                      </span>
                      <span className="block text-[11px] text-indigo-400">
                        {q.topic || 'General Topic'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getDifficultyBadge(
                          q.difficulty
                        )}`}
                      >
                        {q.difficulty || 'Moderate'}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center font-mono">
                      <span className="text-emerald-400 font-bold">+{q.marks || 2}</span> /{' '}
                      <span className="text-rose-400">-{q.negativeMarks || 0.5}</span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => handleDelete(q._id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredQuestions.length === 0 && !loading && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No questions match your current search and filter criteria.
            </div>
          )}

          {loading && (
            <div className="py-12 flex justify-center items-center gap-2 text-indigo-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading questions inventory...</span>
            </div>
          )}
        </div>
      </main>

      {/* Add Question Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-indigo-400" />
                <span>Create New Exam Question</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1">Target Exam</label>
                  <select
                    value={formData.exam}
                    onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  >
                    <option value="SSC CGL">SSC CGL</option>
                    <option value="SSC CHSL">SSC CHSL</option>
                    <option value="RRB NTPC">RRB NTPC</option>
                    <option value="Banking">Banking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Subject</label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  >
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Reasoning">Reasoning</option>
                    <option value="General Awareness">General Awareness</option>
                    <option value="English Comprehension">English Comprehension</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Topic Name</label>
                <input
                  type="text"
                  placeholder="e.g. Geometry - Triangles, Time & Work"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Question Statement</label>
                <textarea
                  rows="3"
                  placeholder="Type the complete question text..."
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 resize-none"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-slate-400">Options (Select Correct Radio)</label>
                {formData.options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctOptionIndex === idx}
                      onChange={() => setFormData({ ...formData, correctOptionIndex: idx })}
                      className="cursor-pointer"
                    />
                    <span className="font-mono text-slate-400 w-4">
                      {String.fromCharCode(65 + idx)}.
                    </span>
                    <input
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + idx)} text`}
                      value={opt}
                      onChange={(e) => handleOptionChange(idx, e.target.value)}
                      className="flex-1 bg-slate-800 border border-slate-700 rounded-xl p-2 text-slate-200"
                      required
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Step-by-Step Explanation & Shortcut</label>
                <textarea
                  rows="2"
                  placeholder="Explain why the option is correct and provide shortcuts..."
                  value={formData.explanation}
                  onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-slate-200 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}