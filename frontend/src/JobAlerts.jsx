import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Search,
  ExternalLink,
  Users,
  GraduationCap,
  Calendar,
  IndianRupee,
  Building2,
  Bookmark,
  Share2,
} from 'lucide-react';
import API from './api';

const CATEGORIES = ['All', 'SSC', 'Railways', 'Banking', 'UPSC', 'Defence'];

export default function JobAlerts() {
  const [jobs, setJobs] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await API.get('/jobs', {
        params: {
          category: selectedCategory,
          search: searchQuery,
        },
      });
      setJobs(res.data.data || []);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const getDaysLeft = (dateString) => {
    const diff = new Date(dateString) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days left` : 'Expired';
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-orange-500/20 text-orange-400 rounded-xl border border-orange-500/30">
              <Briefcase className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Verified Government & PSU Openings
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Daily Job Alerts & Vacancies</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Never miss an application deadline. Updated daily with direct application portal links.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Exam, Dept or Post name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-slate-400 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white focus:text-slate-900 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-600/30 transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-orange-600 text-white ring-2 ring-orange-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Job Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-semibold">Loading verified job openings...</div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 mt-6">
            <p className="text-slate-600 font-bold text-base">No active job notifications found.</p>
            <p className="text-xs text-slate-400 mt-1">Try relaxing your search terms or select "All".</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-extrabold uppercase tracking-wide bg-blue-50 text-blue-700 border border-blue-100">
                      {job.category}
                    </span>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <button className="p-1 hover:text-slate-700 rounded transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button className="p-1 hover:text-slate-700 rounded transition-colors">
                        <Share2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-base font-black text-slate-900 leading-snug hover:text-orange-600 transition-colors">
                    {job.title}
                  </h3>

                  <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1.5 font-medium">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.organization}</span>
                  </div>

                  {/* Metadata Matrix */}
                  <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Users className="w-4 h-4 text-orange-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Vacancies</p>
                        <p className="font-bold">{job.vacancies.toLocaleString()} Posts</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700">
                      <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Deadline</p>
                        <p className="font-bold">{getDaysLeft(job.lastDate)}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 col-span-2">
                      <GraduationCap className="w-4 h-4 text-blue-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Qualification</p>
                        <p className="font-semibold text-slate-800">{job.qualification}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-slate-700 col-span-2">
                      <IndianRupee className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase">Pay Scale</p>
                        <p className="font-semibold text-slate-800">{job.salary}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apply Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    Last Date: {new Date(job.lastDate).toLocaleDateString()}
                  </span>
                  <a
                    href={job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all"
                  >
                    Apply Now <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}