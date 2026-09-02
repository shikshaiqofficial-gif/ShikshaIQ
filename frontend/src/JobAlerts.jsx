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
  RefreshCw
} from 'lucide-react';

const FALLBACK_JOBS = [
  {
    _id: '1',
    title: "SSC Combined Graduate Level (CGL) Examination",
    examAgency: "SSC",
    vacancies: "14,500+ Posts",
    qualification: "Bachelor's Degree in any discipline",
    ageLimit: "18 - 32 Years",
    applicationStartDate: "June 2026",
    applicationEndDate: "July 2026",
    examDate: "September / October 2026",
    status: "Active",
    notificationUrl: "https://ssc.gov.in",
    applyUrl: "https://ssc.gov.in"
  },
  {
    _id: '2',
    title: "RRB Non-Technical Popular Categories (NTPC)",
    examAgency: "RRB",
    vacancies: "11,558 Posts",
    qualification: "12th Pass / Graduate depending on level",
    ageLimit: "18 - 33 Years",
    applicationStartDate: "September 2026",
    applicationEndDate: "October 2026",
    examDate: "December 2026 - January 2027",
    status: "Active",
    notificationUrl: "https://indianrailways.gov.in",
    applyUrl: "https://indianrailways.gov.in"
  },
  {
    _id: '3',
    title: "Railway Recruitment Cell Group D (Level-1)",
    examAgency: "RRB",
    vacancies: "32,000+ Posts (Projected)",
    qualification: "10th Pass + ITI or equivalent",
    ageLimit: "18 - 33 Years",
    applicationStartDate: "October 2026",
    applicationEndDate: "November 2026",
    examDate: "Early 2027",
    status: "Upcoming",
    notificationUrl: "https://indianrailways.gov.in",
    applyUrl: "https://indianrailways.gov.in"
  }
];

export default function JobAlerts() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(FALLBACK_JOBS);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAgency, setSelectedAgency] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  useEffect(() => {
    fetchJobs();
  }, [selectedAgency, selectedStatus]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/jobs?agency=${selectedAgency}&status=${selectedStatus}`);
      if (res.data?.success && res.data.jobs?.length > 0) {
        setJobs(res.data.jobs);
      }
    } catch (err) {
      console.warn('Backend loading or waking, using cached notifications.');
      let filtered = FALLBACK_JOBS;
      if (selectedAgency !== 'ALL') {
        filtered = filtered.filter(j => j.examAgency === selectedAgency);
      }
      if (selectedStatus !== 'ALL') {
        filtered = filtered.filter(j => j.status === selectedStatus);
      }
      setJobs(filtered);
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter((j) => {
    const matchesSearch = j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          j.qualification.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getStatusBadge = (status) => {
    if (status === 'Active') {
      return (
        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3" /> Active Application
        </span>
      );
    }
    if (status === 'Upcoming') {
      return (
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
          <Clock className="w-3 h-3" /> Notification Awaited
        </span>
      );
    }
    return (
      <span className="bg-slate-700/60 text-slate-400 border border-slate-600 px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
        <AlertCircle className="w-3 h-3" /> Closed
      </span>
    );
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
            <Briefcase className="w-5 h-5 text-indigo-400" />
            <h1 className="font-bold text-lg">Govt Job Alerts & Notifications</h1>
          </div>
          <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-full font-medium ml-2">
            SSC & Railway Portal
          </span>
        </div>

        <button
          onClick={fetchJobs}
          className="p-2 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800 transition cursor-pointer"
          title="Refresh Alerts"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
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
              placeholder="Search exam, posts, or degree requirement..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Filter className="w-3.5 h-3.5" />
              <span>Agency:</span>
            </div>
            <select
              value={selectedAgency}
              onChange={(e) => setSelectedAgency(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Boards</option>
              <option value="SSC">SSC (Staff Selection)</option>
              <option value="RRB">RRB (Railway Recruitment)</option>
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Job Cards Feed */}
        {loading ? (
          <div className="py-24 text-center space-y-3">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading government job announcements...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="py-16 text-center bg-slate-800/40 border border-slate-700/60 rounded-2xl p-6">
            <Briefcase className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-300 font-medium">No matching job alerts found.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the board or status filters.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-slate-800/70 border border-slate-700/70 rounded-2xl p-6 shadow-xl space-y-4 hover:border-slate-600 transition"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase bg-indigo-500/20 text-indigo-300 px-2.5 py-0.5 rounded-md border border-indigo-500/30">
                        {job.examAgency}
                      </span>
                      {getStatusBadge(job.status)}
                    </div>
                    <h2 className="text-base font-bold text-white mt-1">
                      {job.title}
                    </h2>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400">Total Vacancies</span>
                    <p className="text-base font-extrabold text-amber-400">{job.vacancies}</p>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-700/50 text-xs">
                  <div className="flex items-start gap-2.5">
                    <GraduationCap className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Eligibility</span>
                      <span className="font-medium text-slate-200">{job.qualification}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Users className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Age Limit</span>
                      <span className="font-medium text-slate-200">{job.ageLimit}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <Calendar className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 block text-[11px]">Exam Date</span>
                      <span className="font-medium text-emerald-400">{job.examDate}</span>
                    </div>
                  </div>
                </div>

                {/* Footer Dates & Links */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-700/50 text-xs">
                  <div className="text-slate-400">
                    Application Window: <span className="text-slate-200 font-medium">{job.applicationStartDate}</span> — <span className="text-rose-400 font-medium">{job.applicationEndDate}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={job.notificationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-xl transition flex items-center gap-1.5 text-xs font-medium"
                    >
                      <span>Official PDF</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    {job.status === 'Active' && (
                      <a
                        href={job.applyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition flex items-center gap-1.5 text-xs font-semibold shadow-md shadow-indigo-900/30"
                      >
                        <span>Apply Online</span>
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