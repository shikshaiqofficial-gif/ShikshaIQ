import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  ArrowLeft,
  Database,
  PlusCircle,
  Upload,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers
} from 'lucide-react';

const SUBJECTS = ['Quantitative Aptitude', 'General Intelligence & Reasoning', 'General Awareness', 'English Comprehension'];

export default function AdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('add');
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Single Question Form State
  const [formData, setFormData] = useState({
    exam: 'SSC CGL',
    subject: 'Quantitative Aptitude',
    topic: 'Algebra',
    difficulty: 'Moderate',
    questionText: '',
    options: ['', '', '', ''],
    correctOptionIndex: 0,
    marks: 2,
    negativeMarks: 0.5,
    explanation: ''
  });

  // Bulk JSON Import State
  const [bulkJson, setBulkJson] = useState('');

  useEffect(() => {
    if (activeTab === 'manage') {
      fetchQuestions();
    }
  }, [activeTab]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await API.get('/questions?limit=50');
      if (res.data?.questions) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionChange = (idx, val) => {
    const newOpts = [...formData.options];
    newOpts[idx] = val;
    setFormData({ ...formData, options: newOpts });
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await API.post('/questions', formData);
      setMessage('Question added successfully to MongoDB Atlas!');
      setFormData({
        exam: 'SSC CGL',
        subject: 'Quantitative Aptitude',
        topic: 'Algebra',
        difficulty: 'Moderate',
        questionText: '',
        options: ['', '', '', ''],
        correctOptionIndex: 0,
        marks: 2,
        negativeMarks: 0.5,
        explanation: ''
      });
    } catch (err) {
      setMessage('Failed to add question. Check required fields.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const parsed = JSON.parse(bulkJson);
      const res = await API.post('/questions/bulk', { questions: parsed });
      setMessage(`Successfully imported ${res.data?.count || parsed.length} questions!`);
      setBulkJson('');
    } catch (err) {
      setMessage('Invalid JSON format or server error during bulk import.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this question?')) return;
    try {
      await API.delete(`/questions/${id}`);
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      alert('Failed to delete question.');
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
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm sm:text-base">Admin Portal & Question Bank</h1>
              <p className="text-[11px] text-slate-400">Database Seeding & Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setActiveTab('add')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'add' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Add Single
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'bulk' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Bulk JSON
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition cursor-pointer ${
              activeTab === 'manage' ? 'bg-purple-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            Manage Bank
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-8 space-y-6">
        {message && (
          <div className="p-4 bg-purple-950/60 border border-purple-500/40 text-purple-200 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Tab 1: Add Single Question */}
        {activeTab === 'add' && (
          <form onSubmit={handleSingleSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h2 className="text-lg font-black text-white">Add Individual Question</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Exam</label>
                <input
                  type="text"
                  value={formData.exam}
                  onChange={(e) => setFormData({ ...formData, exam: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Subject</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-purple-500"
                >
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Topic</label>
                <input
                  type="text"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g. Geometry, Syllogism"
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-slate-400 font-bold block">Difficulty</label>
                <select
                  value={formData.difficulty}
                  onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-purple-500"
                >
                  <option value="Easy">Easy</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-bold block">Question Statement</label>
              <textarea
                rows={3}
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                placeholder="Enter question text..."
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            <div className="space-y-3 text-xs">
              <label className="text-slate-400 font-bold block">Options (A, B, C, D)</label>
              {formData.options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-[11px] text-slate-300">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    className="flex-1 bg-slate-950 border border-slate-800 p-2.5 rounded-xl text-white outline-none focus:border-purple-500"
                    required
                  />
                  <label className="flex items-center gap-1.5 text-slate-400 cursor-pointer">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={formData.correctOptionIndex === i}
                      onChange={() => setFormData({ ...formData, correctOptionIndex: i })}
                      className="accent-purple-500"
                    />
                    <span>Correct</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-slate-400 font-bold block">Explanation & Shortcut Derivation</label>
              <textarea
                rows={3}
                value={formData.explanation}
                onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                placeholder="Step-by-step solution..."
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-purple-900/30"
            >
              {loading ? 'Adding Question...' : 'Save Question to Database'}
            </button>
          </form>
        )}

        {/* Tab 2: Bulk JSON Import */}
        {activeTab === 'bulk' && (
          <form onSubmit={handleBulkSubmit} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <h2 className="text-lg font-black text-white">Bulk Question Import (JSON Array)</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Paste a valid JSON array matching the question schema to import multiple questions simultaneously.
            </p>

            <div className="space-y-1.5 text-xs font-mono">
              <textarea
                rows={10}
                value={bulkJson}
                onChange={(e) => setBulkJson(e.target.value)}
                placeholder={'[\n  {\n    "exam": "SSC CGL",\n    "subject": "Quantitative Aptitude",\n    "topic": "Algebra",\n    "questionText": "...",\n    "options": ["A", "B", "C", "D"],\n    "correctOptionIndex": 0,\n    "explanation": "..."\n  }\n]'}
                className="w-full bg-slate-950 border border-slate-800 p-4 rounded-2xl text-slate-200 outline-none focus:border-purple-500 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition cursor-pointer shadow-lg shadow-purple-900/30 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Importing Batch...' : 'Import Question Batch'}</span>
            </button>
          </form>
        )}

        {/* Tab 3: Manage Question Bank */}
        {activeTab === 'manage' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs">
              <h2 className="font-bold text-white">Question Bank Inventory ({questions.length})</h2>
              <span className="text-slate-400 font-mono">MongoDB Atlas</span>
            </div>

            {loading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : questions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">No questions found in database.</div>
            ) : (
              <div className="space-y-3">
                {questions.map((q) => (
                  <div key={q._id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold rounded-md text-[10px]">
                          {q.subject}
                        </span>
                        <span className="text-slate-500 text-[10px]">• {q.difficulty}</span>
                      </div>
                      <p className="font-medium text-slate-200 leading-snug">{q.questionText}</p>
                    </div>

                    <button
                      onClick={() => handleDelete(q._id)}
                      className="p-2 text-slate-500 hover:text-rose-400 transition cursor-pointer shrink-0"
                      title="Delete Question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}