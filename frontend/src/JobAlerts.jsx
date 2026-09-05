import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from './api';
import {
  Briefcase,
  Calendar,
  Users,
  GraduationCap,
  ExternalLink,
  ArrowLeft,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  RefreshCw,
  Building2
} from 'lucide-react';

export default function JobAlerts() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    fetchJobs();
  }, [selectedCategory]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const endpoint = selectedCategory === 'ALL' 
        ? '/jobs' 
        : `/jobs?category=${selectedCategory}`;
      
      const res = await API.get(endpoint);
      if (res.data?.success && res.data.jobs) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.error('Failed to fetch job alerts from server:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const titleMatch = j.title?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const orgMatch = j.organization?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    const qualMatch = j.qualification?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    return titleMatch || orgMatch || qualMatch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
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
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg text-white">All-India Government Job Alerts</h1>
          </div>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2.5 py-0.5 rounded-full font-medium ml-2 hidden sm:inline-block">
            Live AI Grounding Feed
          </span>
        </div>

        <button
          onClick={fetchJobs}
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          title="Refresh Live Alerts"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span className="hidden sm:inline">Refresh Feed</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        
        {/* Controls Bar */}
        <div className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between shadow-xl">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by exam, organization, or qualification (e.g. Graduate, SSC, Railway)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Sector:</span>
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 cursor-pointer w-full md:w-auto"
            >
              <option value="ALL">All Sectors</option>
              <option value="Central Govt">Central Govt / SSC</option>
              <option value="Banking">Banking & Insurance</option>
              <option value="Railways">Railways</option>
              <option value="UPSC">UPSC & Civil Services</option>
              <option value="Defence">Defence</option>
              <option value="PSU">PSU & Engineering</option>
              <option value="State PSC">State PSC & Teaching</option>
            </select>
          </div>
        </div>

        {/* Job Cards Feed */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Scanning live web for active government job notifications...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No live job alerts found.</p>
            <p className="text-xs text-slate-500">Your AI background script might still be syncing. Click the refresh button above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job._id || job.id}
                className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4 hover:border-indigo-500/50 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                        {job.category || 'Central Govt'}
                      </span>
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Active Application
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-white mt-1">
                      {job.title}
                    </h2>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                      {job.organization}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">Vacancies</span>
                    <span className="text-sm font-extrabold text-amber-400">{job.vacancies || 'Various'}</span>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 text-xs">
                  <div className="flex items-start gap-2.5">
                    <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Qualification Required</span>
                      <span className="font-medium text-slate-200">{job.qualification}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Application Deadline</span>
                      <span className="font-medium text-rose-300">{job.lastDate}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Apply Links */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700/50 text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Official recruitment listing verified by ShikshaIQ AI Engine.
                  </span>

                  <div>
                    {job.applyUrl && (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2 bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-xl transition flex items-center gap-1.5 text-xs font-bold shadow-lg shadow-orange-500/20 cursor-pointer"
                      >
                        <span>Apply on Official Website</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}