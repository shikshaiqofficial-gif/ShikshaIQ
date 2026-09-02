import React, { useState, useEffect } from 'react';
import {
  Shield,
  Briefcase,
  Newspaper,
  BookOpen,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import API from './api';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('jobs'); // 'jobs', 'news', 'quizzes'
  const [jobs, setJobs] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Form states
  const [jobForm, setJobForm] = useState({
    title: '',
    organization: '',
    category: 'SSC',
    vacancies: 100,
    qualification: "Bachelor's Degree",
    lastDate: '',
    salary: '₹25,000 - ₹80,000',
    applyUrl: '',
  });

  const [newsForm, setNewsForm] = useState({
    title: '',
    summary: '',
    category: 'National',
    tags: 'Govt, Policy',
    source: 'PIB / The Hindu',
    readTimeMinutes: 2,
  });

  const [quizForm, setQuizForm] = useState({
    title: '',
    targetExam: 'SSC & Railway',
    durationMinutes: 15,
    qText: '',
    opt0: '',
    opt1: '',
    opt2: '',
    opt3: '',
    correctIndex: 0,
    explanation: '',
  });

  // Load existing records for jobs and news
  const loadData = async () => {
    try {
      if (activeTab === 'jobs') {
        const res = await API.get('/jobs?category=All');
        setJobs(res.data.data || []);
      } else if (activeTab === 'news') {
        const res = await API.get('/current-affairs?category=All');
        setNews(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await API.post('/admin/jobs', jobForm);
      setStatusMsg('Job alert created successfully!');
      setJobForm({
        title: '',
        organization: '',
        category: 'SSC',
        vacancies: 100,
        qualification: "Bachelor's Degree",
        lastDate: '',
        salary: '₹25,000 - ₹80,000',
        applyUrl: '',
      });
      loadData();
    } catch (err) {
      setStatusMsg('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteJob = async (id) => {
    if (!window.confirm('Delete this job alert?')) return;
    try {
      await API.delete(`/admin/jobs/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...newsForm,
        tags: newsForm.tags.split(',').map((t) => t.trim()),
      };
      await API.post('/admin/current-affairs', payload);
      setStatusMsg('Current affairs item created successfully!');
      setNewsForm({
        title: '',
        summary: '',
        category: 'National',
        tags: 'Govt, Policy',
        source: 'PIB / The Hindu',
        readTimeMinutes: 2,
      });
      loadData();
    } catch (err) {
      setStatusMsg('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteNews = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      await API.delete(`/admin/current-affairs/${id}`);
      loadData();
    } catch (err) {
      alert('Delete failed: ' + err.message);
    }
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        title: quizForm.title,
        targetExam: quizForm.targetExam,
        durationMinutes: Number(quizForm.durationMinutes),
        questions: [
          {
            questionText: quizForm.qText,
            options: [quizForm.opt0, quizForm.opt1, quizForm.opt2, quizForm.opt3],
            correctOptionIndex: Number(quizForm.correctIndex),
            explanation: quizForm.explanation,
            marks: 2,
            negativeMarks: 0.5,
          },
        ],
      };
      await API.post('/admin/mock-tests', payload);
      setStatusMsg('Mock test and question created successfully!');
      setQuizForm({
        title: '',
        targetExam: 'SSC & Railway',
        durationMinutes: 15,
        qText: '',
        opt0: '',
        opt1: '',
        opt2: '',
        opt3: '',
        correctIndex: 0,
        explanation: '',
      });
    } catch (err) {
      setStatusMsg('Error: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-16">
      {/* Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 py-6 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight">Shiksha IQ Admin Console</h1>
              <p className="text-xs text-slate-400">Content Operations & Question Authoring</p>
            </div>
          </div>
          <a
            href="/dashboard"
            className="text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3.5 py-2 rounded-xl transition-all"
          >
            Back to App
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => {
              setActiveTab('jobs');
              setStatusMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'jobs'
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Briefcase className="w-4 h-4" /> Manage Job Alerts
          </button>
          <button
            onClick={() => {
              setActiveTab('news');
              setStatusMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'news'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Newspaper className="w-4 h-4" /> Manage Current Affairs
          </button>
          <button
            onClick={() => {
              setActiveTab('quizzes');
              setStatusMsg('');
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
              activeTab === 'quizzes'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-4 h-4" /> Create Mock Test
          </button>
        </div>

        {statusMsg && (
          <div className="p-3 bg-blue-50 text-blue-900 border border-blue-200 rounded-xl text-xs font-semibold">
            {statusMsg}
          </div>
        )}

        {/* TAB 1: MANAGE JOBS */}
        {activeTab === 'jobs' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleCreateJob}
              className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3"
            >
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Add New Job Alert</h2>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SSC CGL 2026 Notification"
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Organization</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Staff Selection Commission"
                  value={jobForm.organization}
                  onChange={(e) => setJobForm({ ...jobForm, organization: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Category</label>
                  <select
                    value={jobForm.category}
                    onChange={(e) => setJobForm({ ...jobForm, category: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  >
                    {['SSC', 'Railways', 'Banking', 'UPSC', 'Defence', 'State PSC', 'Teaching'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Total Vacancies</label>
                  <input
                    type="number"
                    required
                    value={jobForm.vacancies}
                    onChange={(e) => setJobForm({ ...jobForm, vacancies: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Last Date</label>
                  <input
                    type="date"
                    required
                    value={jobForm.lastDate}
                    onChange={(e) => setJobForm({ ...jobForm, lastDate: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-500 uppercase">Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Direct Apply Link</label>
                <input
                  type="url"
                  required
                  placeholder="https://..."
                  value={jobForm.applyUrl}
                  onChange={(e) => setJobForm({ ...jobForm, applyUrl: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Publish Job Alert
              </button>
            </form>

            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Active Job Postings</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {jobs.map((j) => (
                  <div key={j._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{j.title}</p>
                      <p className="text-[10px] text-slate-500">{j.organization} • {j.vacancies} Posts</p>
                    </div>
                    <button
                      onClick={() => handleDeleteJob(j._id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MANAGE CURRENT AFFAIRS */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <form
              onSubmit={handleCreateNews}
              className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3"
            >
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Publish News Digest</h2>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Headline</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. New Economic Reforms Announced"
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Category</label>
                <select
                  value={newsForm.category}
                  onChange={(e) => setNewsForm({ ...newsForm, category: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  {['National', 'International', 'Economy', 'Science & Tech', 'Sports', 'Awards'].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Exam Summary</label>
                <textarea
                  rows="4"
                  required
                  placeholder="Key points relevant for competitive exams..."
                  value={newsForm.summary}
                  onChange={(e) => setNewsForm({ ...newsForm, summary: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Comma Separated Tags</label>
                <input
                  type="text"
                  value={newsForm.tags}
                  onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Publish Current Affairs
              </button>
            </form>

            <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Published Digests</h2>
              <div className="space-y-2 max-h-[500px] overflow-y-auto">
                {news.map((item) => (
                  <div key={item._id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-xs text-slate-800">{item.title}</p>
                      <p className="text-[10px] text-slate-500">{item.category} • {item.readTimeMinutes} min read</p>
                    </div>
                    <button
                      onClick={() => handleDeleteNews(item._id)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: CREATE MOCK TEST */}
        {activeTab === 'quizzes' && (
          <form
            onSubmit={handleCreateQuiz}
            className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm max-w-3xl space-y-4"
          >
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-700">Create Mock Test & Question</h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="Daily Mock Test #43"
                  value={quizForm.title}
                  onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  value={quizForm.durationMinutes}
                  onChange={(e) => setQuizForm({ ...quizForm, durationMinutes: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-500 uppercase">Question Text</label>
              <textarea
                rows="2"
                required
                placeholder="Type the multiple choice question here..."
                value={quizForm.qText}
                onChange={(e) => setQuizForm({ ...quizForm, qText: e.target.value })}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Option A</label>
                <input
                  type="text"
                  required
                  value={quizForm.opt0}
                  onChange={(e) => setQuizForm({ ...quizForm, opt0: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Option B</label>
                <input
                  type="text"
                  required
                  value={quizForm.opt1}
                  onChange={(e) => setQuizForm({ ...quizForm, opt1: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Option C</label>
                <input
                  type="text"
                  required
                  value={quizForm.opt2}
                  onChange={(e) => setQuizForm({ ...quizForm, opt2: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Option D</label>
                <input
                  type="text"
                  required
                  value={quizForm.opt3}
                  onChange={(e) => setQuizForm({ ...quizForm, opt3: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Correct Option</label>
                <select
                  value={quizForm.correctIndex}
                  onChange={(e) => setQuizForm({ ...quizForm, correctIndex: Number(e.target.value) })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                >
                  <option value={0}>Option A</option>
                  <option value={1}>Option B</option>
                  <option value={2}>Option C</option>
                  <option value={3}>Option D</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Explanation</label>
                <input
                  type="text"
                  placeholder="Step-by-step logic..."
                  value={quizForm.explanation}
                  onChange={(e) => setQuizForm({ ...quizForm, explanation: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              Publish Test & Question
            </button>
          </form>
        )}
      </div>
    </div>
  );
}