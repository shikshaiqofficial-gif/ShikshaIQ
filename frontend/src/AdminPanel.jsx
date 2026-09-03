import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import { ArrowLeft, Database, Trash2, Plus, Upload, CheckCircle2, AlertCircle, FileText, Loader2 } from 'lucide-react';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'bulk'

  // Single Question Form State
  const [subject, setSubject] = useState('Quantitative Aptitude');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctOptionIndex, setCorrectOptionIndex] = useState(0);
  const [explanation, setExplanation] = useState('');

  // Bulk Upload State
  const [bulkFile, setBulkFile] = useState(null);
  const [bulkStatus, setBulkStatus] = useState(null);
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const res = await API.get('/questions?limit=50');
      if (res.data?.questions) setQuestions(res.data.questions);
    } catch (err) {
      console.warn('Questions load failure');
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      await API.post('/questions', {
        exam: 'SSC CGL',
        subject,
        topic: 'General Review',
        difficulty: 'Moderate',
        questionText,
        options,
        correctOptionIndex: Number(correctOptionIndex),
        explanation
      });
      setQuestionText('');
      setExplanation('');
      setOptions(['', '', '', '']);
      loadQuestions();
    } catch (err) {
      alert('Failed to insert question.');
    }
  };

  const parseCSV = (text) => {
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      // Regex handling for comma within quotes
      const values = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || lines[i].split(',');
      const row = {};
      headers.forEach((h, idx) => {
        row[h] = values[idx] ? values[idx].replace(/^"|"$/g, '').trim() : '';
      });
      rows.push(row);
    }
    return rows;
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!bulkFile) return;

    setIsImporting(true);
    setBulkStatus(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let parsedQuestions = [];
        const content = event.target.result;

        if (bulkFile.name.endsWith('.json')) {
          parsedQuestions = JSON.parse(content);
        } else if (bulkFile.name.endsWith('.csv')) {
          const rawRows = parseCSV(content);
          parsedQuestions = rawRows.map(r => ({
            exam: r.exam || 'SSC CGL',
            subject: r.subject || 'Quantitative Aptitude',
            topic: r.topic || 'General',
            difficulty: r.difficulty || 'Moderate',
            questionText: r.questionText || r.question,
            options: [r.optionA, r.optionB, r.optionC, r.optionD],
            correctOptionIndex: Number(r.correctOptionIndex ?? 0),
            marks: Number(r.marks || 2),
            negativeMarks: Number(r.negativeMarks || 0.5),
            explanation: r.explanation || 'Standard derivation.'
          }));
        }

        if (!Array.isArray(parsedQuestions) || parsedQuestions.length === 0) {
          throw new Error('No valid question records parsed from file.');
        }

        const res = await API.post('/questions/bulk', { questions: parsedQuestions });
        setBulkStatus({
          type: 'success',
          message: `Success: ${res.data.count} questions inserted into database.`
        });
        setBulkFile(null);
        loadQuestions();
      } catch (err) {
        setBulkStatus({
          type: 'error',
          message: err.response?.data?.message || err.message || 'Bulk upload failed.'
        });
      } finally {
        setIsImporting(false);
      }
    };

    reader.readAsText(bulkFile);
  };

  const handleDelete = async (id) => {
    try {
      await API.delete(`/questions/${id}`);
      loadQuestions();
    } catch (err) {
      alert('Failed to delete question.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
      <header className="h-16 bg-slate-800/80 border-b border-slate-700/60 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-sm sm:text-base">Repository & Content Administration</h1>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('single')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'single' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Manual Form
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('bulk')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                activeTab === 'bulk' ? 'bg-indigo-600 text-white' : 'text-slate-400'
              }`}
            >
              Bulk Import (CSV/JSON)
            </button>
          </div>

          {activeTab === 'single' ? (
            <form onSubmit={handleAddQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="Quantitative Aptitude">Quantitative Aptitude</option>
                  <option value="General Intelligence & Reasoning">General Intelligence & Reasoning</option>
                  <option value="General Awareness">General Awareness</option>
                  <option value="English Comprehension">English Comprehension</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Question Statement</label>
                <textarea
                  required
                  rows={3}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>

              {options.map((opt, idx) => (
                <div key={idx}>
                  <label className="block text-slate-400 mb-0.5">Option {String.fromCharCode(65 + idx)}</label>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[idx] = e.target.value;
                      setOptions(copy);
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white outline-none"
                  />
                </div>
              ))}

              <div>
                <label className="block text-slate-400 mb-1">Correct Option Index (0-3)</label>
                <input
                  type="number"
                  min="0"
                  max="3"
                  value={correctOptionIndex}
                  onChange={(e) => setCorrectOptionIndex(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-white outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Explanation / Derivation</label>
                <textarea
                  required
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Commit to Question Bank
              </button>
            </form>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="border-2 border-dashed border-slate-700 rounded-2xl p-6 text-center hover:border-indigo-500/70 transition">
                <input
                  type="file"
                  id="bulk-file"
                  accept=".csv, .json"
                  onChange={(e) => setBulkFile(e.target.files[0])}
                  className="hidden"
                />
                <label htmlFor="bulk-file" className="cursor-pointer flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-indigo-400" />
                  <span className="font-semibold text-white">
                    {bulkFile ? bulkFile.name : 'Choose CSV or JSON File'}
                  </span>
                  <span className="text-[11px] text-slate-500">Supports .csv and structured .json exports</span>
                </label>
              </div>

              <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5 text-[11px] text-slate-400">
                <p className="font-bold text-slate-300">Expected CSV Headers:</p>
                <code>questionText,optionA,optionB,optionC,optionD,correctOptionIndex,subject,explanation</code>
              </div>

              {bulkStatus && (
                <div
                  className={`p-3 rounded-xl flex items-center gap-2 ${
                    bulkStatus.type === 'success'
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                  }`}
                >
                  {bulkStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                  <span>{bulkStatus.message}</span>
                </div>
              )}

              <button
                onClick={handleBulkUpload}
                disabled={!bulkFile || isImporting}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-indigo-900/30"
              >
                {isImporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Importing into Atlas...</span>
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4" />
                    <span>Upload & Insert Questions</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Existing Records */}
        <div className="lg:col-span-7 bg-slate-800/80 border border-slate-700/70 rounded-2xl p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
            <h2 className="text-sm font-bold text-white">
              Loaded Question Records ({questions.length})
            </h2>
            <button
              onClick={loadQuestions}
              className="text-xs text-indigo-400 hover:text-indigo-300 cursor-pointer"
            >
              Refresh
            </button>
          </div>

          <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
            {questions.map((q) => (
              <div key={q._id} className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-indigo-400 font-bold">{q.subject}</span>
                  <button
                    onClick={() => handleDelete(q._id)}
                    className="text-rose-400 hover:text-rose-300 transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-white font-medium">{q.questionText}</p>
                <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 pt-1">
                  {q.options?.map((opt, i) => (
                    <div
                      key={i}
                      className={i === q.correctOptionIndex ? 'text-emerald-400 font-semibold' : ''}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </div>
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 block pt-1">ID: {q._id}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}