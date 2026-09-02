import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ShieldCheck,
  PlusCircle,
  Trash2,
  BookOpen,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  Layers
} from 'lucide-react';

export default function AdminPanel() {
  const navigate = useNavigate();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExam, setSelectedExam] = useState('ALL');

  // Form State
  const initialForm = {
    exam: 'SSC CGL',
    subject: 'Quantitative Aptitude',
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctOptionIndex: 0,
    explanation: '',
    difficulty: 'Moderate',
    marks: 2,
    negativeMarks: 0.5
  };
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch up to 100 questions for management
      const res = await API.get('/questions?limit=100');
      const list = res.data?.questions || (Array.isArray(res.data) ? res.data : []);
      setQuestions(list);
    } catch (err) {
      console.error('Failed to load questions:', err);
      setError('Failed to fetch questions from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccessMsg('');

    const options = [
      formData.optionA.trim(),
      formData.optionB.trim(),
      formData.optionC.trim(),
      formData.optionD.trim()
    ].filter(Boolean);

    if (options.length < 2) {
      setError('Please provide at least 2 options for the question.');
      setSubmitting(false);
      return;
    }

    const payload = {
      exam: formData.exam,
      subject: formData.subject,
      questionText: formData.questionText.trim(),
      options,
      correctOptionIndex: Number(formData.correctOptionIndex),
      explanation: formData.explanation.trim() || 'No explanation provided.',
      difficulty: formData.difficulty,
      marks: Number(formData.marks),
      negativeMarks: Number(formData.negativeMarks)
    };

    try {
      const res = await API.post('/questions', payload);
      if (res.data?.success) {
        setSuccessMsg('New question added to database successfully!');
        setFormData(initialForm);
        fetchQuestions();
        setTimeout(() => setSuccessMsg(''), 4000);
      } else {
        setError(res.data?.message || 'Failed to save question.');
      }
    } catch (err) {
      console.error('Error saving question:', err);
      setError(err.response?.data?.message || 'Failed to save question to server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this question?')) {
      return;
    }

    try {
      const res = await API.delete(`/questions/${id}`);
      if (res.data?.success) {
        setQuestions((prev) => prev.filter((q) => q._id !== id));
      } else {
        alert(res.data?.message || 'Failed to delete question.');
      }
    } catch (err) {
      console.error('Error deleting question:', err);
      alert(err.response?.data?.message || 'Failed to delete question.');
    }
  };

  const filteredQuestions = questions.filter((q) => {
    const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          q.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = selectedExam === 'ALL' || q.exam === selectedExam;
    return matchesSearch && matchesExam;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      {/* Top Bar */}
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-700/50 transition cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg">Admin Question Portal</h1>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium ml-2">
            Total Qs: {questions.length}
          </span>
        </div>

        <button
          onClick={() => navigate('/mock-test')}
          className="text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 px-3 py-1.5 rounded-lg transition"
        >
          Go to Mock Test
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left 5 Cols: Question Creation Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl sticky top-24">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-700/60 mb-4">
              <PlusCircle className="w-5 h-5 text-indigo-400" />
              <h2 className="font-semibold text-base text-slate-100">Add New PYQ / Mock Question</h2>
            </div>

            {error && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2 mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleAddQuestion} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Exam Target</label>
                  <select
                    name="exam"
                    value={formData.exam}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="SSC CGL">SSC CGL</option>
                    <option value="SSC CHSL">SSC CHSL</option>
                    <option value="RRB NTPC">RRB NTPC</option>
                    <option value="Railway Group D">Railway Group D</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-300 block mb-1">Subject</label>
                  <select
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                    <option value="Reasoning">Logical Reasoning</option>
                    <option value="General Awareness">General Awareness</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Question Statement</label>
                <textarea
                  name="questionText"
                  required
                  rows={3}
                  value={formData.questionText}
                  onChange={handleInputChange}
                  placeholder="e.g.: If x + 1/x = 4, what is the value of x² + 1/x²?"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Options Inputs */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-300 block">Answer Options & Correct Option</label>
                {[
                  { key: 'optionA', label: 'A', idx: 0 },
                  { key: 'optionB', label: 'B', idx: 1 },
                  { key: 'optionC', label: 'C', idx: 2 },
                  { key: 'optionD', label: 'D', idx: 3 },
                ].map((item) => (
                  <div key={item.key} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOptionIndex"
                      value={item.idx}
                      checked={Number(formData.correctOptionIndex) === item.idx}
                      onChange={handleInputChange}
                      className="text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                      title="Mark as correct answer"
                    />
                    <span className="w-5 text-slate-400 font-bold">{item.label}</span>
                    <input
                      type="text"
                      required
                      name={item.key}
                      value={formData[item.key]}
                      onChange={handleInputChange}
                      placeholder={`Option ${item.label}`}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-100 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="font-semibold text-slate-300 block mb-1">Solution / Explanation</label>
                <textarea
                  name="explanation"
                  rows={2}
                  value={formData.explanation}
                  onChange={handleInputChange}
                  placeholder="Short step-by-step reason or formula used..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-slate-100 placeholder-slate-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">Difficulty</label>
                  <select
                    name="difficulty"
                    value={formData.difficulty}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">+ Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    name="marks"
                    value={formData.marks}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-400 block mb-1">- Negative</label>
                  <input
                    type="number"
                    step="0.1"
                    name="negativeMarks"
                    value={formData.negativeMarks}
                    onChange={handleInputChange}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-1.5 text-slate-200 focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/30 text-sm mt-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Adding Question...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Publish Question</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right 7 Cols: Question Inventory List */}
        <div className="lg:col-span-7 space-y-4">
          {/* Controls Bar */}
          <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search questions by text or subject..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={selectedExam}
                onChange={(e) => setSelectedExam(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
              >
                <option value="ALL">All Exams</option>
                <option value="SSC CGL">SSC CGL</option>
                <option value="SSC CHSL">SSC CHSL</option>
                <option value="RRB NTPC">RRB NTPC</option>
                <option value="Railway Group D">Railway Group D</option>
              </select>
            </div>
          </div>

          {/* List of Questions */}
          {loading ? (
            <div className="py-20 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Loading database questions...</p>
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="py-16 text-center bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
              <Layers className="w-8 h-8 text-slate-500 mx-auto mb-2" />
              <p className="text-sm text-slate-300 font-medium">No matching questions found</p>
              <p className="text-xs text-slate-500">Try adjusting your search terms or filter.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredQuestions.map((q, idx) => (
                <div
                  key={q._id || idx}
                  className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 space-y-2.5 hover:border-slate-600 transition"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded font-medium">
                        {q.exam}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-300 font-medium">{q.subject}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-amber-400">{q.difficulty}</span>
                    </div>

                    <button
                      onClick={() => handleDeleteQuestion(q._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition cursor-pointer"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-sm font-medium text-slate-100">
                    {q.questionText}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = oIdx === q.correctOptionIndex;
                      return (
                        <div
                          key={oIdx}
                          className={`p-2 rounded-lg border text-xs flex items-center gap-2 ${
                            isCorrect
                              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300 font-medium'
                              : 'bg-slate-900/60 border-slate-800 text-slate-400'
                          }`}
                        >
                          <span className="font-bold">{String.fromCharCode(65 + oIdx)}.</span>
                          <span className="truncate">{opt}</span>
                        </div>
                      );
                    })}
                  </div>

                  {q.explanation && (
                    <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800/80">
                      <span className="text-indigo-400 font-semibold">Explanation:</span> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}