import React, { useState, useEffect, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Assuming you use axios for API calls
import {
  LayoutDashboard,
  Zap,
  Swords,
  AlertTriangle,
  BarChart3,
  BookOpen,
  Bell,
  UserCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ChevronRight
} from 'lucide-react';

// Lazy load secondary components to keep initial bundle small
const QuickStats = lazy(() => import('./components/Dashboard/QuickStats'));

// --- Safe Fallback UI components ---
const DataError = ({ message }) => (
  <div className="p-6 bg-rose-950/50 border border-rose-800 rounded-2xl text-center text-rose-300 flex flex-col items-center gap-3">
    <AlertTriangle className="w-8 h-8 text-rose-400" />
    <p className="text-sm font-semibold">Failed to load data</p>
    <p className="text-xs">{message || "Please check your connection or try again later."}</p>
  </div>
);

const DataLoading = () => (
  <div className="p-6 flex items-center justify-center gap-3 text-slate-500">
    <Loader2 className="w-5 h-5 animate-spin" />
    <p className="text-sm">Loading...</p>
  </div>
);


export default function Dashboard() {
  const navigate = useNavigate();
  
  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dashboard data states (initialized as null or empty array)
  const [stats, setStats] = useState(null);
  const [jobAlerts, setJobAlerts] = useState([]); // Critical fix: initialize as empty array
  const [recentActivity, setRecentActivity] = useState([]);

  // --- Data Fetching (Simulated API calls) ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Replace these endpoints with your actual backend routes
        const token = localStorage.getItem('token');
        const config = { headers: { Authorization: `Bearer ${token}` } };

        // Fetch all data concurrently for better performance
        const [statsRes, jobsRes, activityRes] = await Promise.all([
          axios.get('/api/dashboard/stats', config).catch(() => ({ data: null })), // Catch individual errors
          axios.get('/api/dashboard/jobs', config).catch(() => ({ data: [] })),
          axios.get('/api/dashboard/activity', config).catch(() => ({ data: [] }))
        ]);

        setStats(statsRes.data);
        // Ensure data is an array before setting state, fallback to empty array if null/undefined
        setJobAlerts(Array.isArray(jobsRes.data) ? jobsRes.data : []);
        setRecentActivity(Array.isArray(activityRes.data) ? activityRes.data : []);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError("Could not connect to the ShikshaIQ server. Please refresh.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);


  // --- Helper Components tailored for Dashboard display ---

  const JobAlertCard = ({ job }) => (
    <div className="p-5 bg-[#0b132b] rounded-2xl border border-slate-800 flex items-start gap-4 hover:border-indigo-900 transition group">
      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 group-hover:scale-105 transition">
        <Bell className="w-5 h-5" />
      </div>
      <div className="grow space-y-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-bold text-white">{job?.title || 'Job Title N/A'}</p>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full">New</span>
        </div>
        <p className="text-xs text-slate-400">{job?.organization || 'Organization'} • {job?.location || 'Location'}</p>
        <p className="text-xs text-slate-500 line-clamp-1 pt-1">{job?.description || 'Details pending update...'}</p>
        {job?.applyLink && (
          <a
            href={job.applyLink}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold pt-2 inline-flex items-center gap-1"
          >
            Apply Now <ChevronRight className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );

  const ActivityItem = ({ activity }) => {
    const icons = {
      mock_completed: <CheckCircle className="w-5 h-5 text-emerald-400" />,
      battle_lost: <XCircle className="w-5 h-5 text-rose-400" />,
      flashcard_review: <BookOpen className="w-5 h-5 text-amber-400" />,
    };
    return (
      <div className="flex items-center gap-4 py-3 border-b border-slate-800/50 last:border-0">
        <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center shrink-0">
          {icons[activity?.type] || <Zap className="w-5 h-5 text-slate-400" />}
        </div>
        <div className="grow">
          <p className="text-sm text-slate-200">{activity?.description || 'Activity recorded'}</p>
          <p className="text-xs text-slate-500">{activity?.timestamp || 'Just now'}</p>
        </div>
        {activity?.scoreChange && (
          <span className={`text-sm font-bold ${activity.scoreChange > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {activity.scoreChange > 0 ? '+' : ''}{activity.scoreChange}
          </span>
        )}
      </div>
    );
  };


  // --- Main Render ---

  return (
    <div className="min-h-screen bg-[#070b19] text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation (simplified for this example) */}
      <aside className="w-64 bg-[#070b19] border-r border-slate-800 p-6 flex flex-col gap-10 sticky top-0 h-screen">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-rose-500 flex items-center justify-center font-black text-white shadow-lg">S</div>
          <span className="font-extrabold text-base text-white">ShikshaIQ <span className="text-[9px] text-indigo-400">Dashboard</span></span>
        </div>

        <nav className="flex flex-col gap-2 grow">
          {[
            { name: 'Overview', icon: LayoutDashboard, path: '/dashboard', active: true },
            { name: 'Mock Tests', icon: Zap, path: '/mock-test' },
            { name: 'Live Battles', icon: Swords, path: '/battle' },
            { name: 'Analytics', icon: BarChart3, path: '/analytics' },
            { name: 'Mistake Vault', icon: AlertTriangle, path: '/mistakes' },
          ].map((item) => (
            <button
              key={item.name}
              onClick={() => navigate(item.path)}
              className={`flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                item.active
                  ? 'bg-indigo-600/10 text-indigo-300 shadow-inner'
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 sm:p-10 space-y-10">
        {/* Header */}
        <header className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white tracking-tight">Welcome back, Aspirant! 👋</h1>
            <p className="text-sm text-slate-400">Here is your daily command center for SSC/Banking prep.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500"></span>
            </button>
            <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-slate-800">
                <UserCircle className="w-8 h-8 text-indigo-400" />
                <div>
                    <p className='text-sm font-semibold text-white'>Rahul Sharma</p>
                    <p className='text-[10px] text-slate-400'>Free Tier</p>
                </div>
            </div>
          </div>
        </header>

        {/* Error State Handling */}
        {error && <DataError message={error} />}

        {/* Dashboard Grid */}
        {!error && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column: Quick Stats & Main Actions */}
            <div className="xl:col-span-2 space-y-8">
              <Suspense fallback={<DataLoading />}>
                {/* Pass stats data safely using optional chaining */}
                <QuickStats stats={stats} isLoading={loading} />
              </Suspense>

              {/* Quick Actions Section */}
              <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => navigate('/mock-test')} className="p-8 bg-gradient-to-r from-indigo-600/80 to-indigo-900/80 rounded-3xl text-left space-y-3 shadow-lg shadow-indigo-900/20 hover:scale-[1.02] transition group border border-indigo-500/30">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                    <Zap className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Take Daily Mock Test</h3>
                  <p className="text-sm text-indigo-100 opacity-90">Full 100-Q simulation. Time yourself against the clock.</p>
                  <ArrowRight className="w-5 h-5 text-white absolute top-6 right-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                </button>
                <button onClick={() => navigate('/battle')} className="p-8 bg-gradient-to-r from-rose-600/80 to-rose-900/80 rounded-3xl text-left space-y-3 shadow-lg shadow-rose-900/20 hover:scale-[1.02] transition group border border-rose-500/30">
                  <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-sm">
                    <Swords className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-extrabold text-white">Enter Live Battle</h3>
                  <p className="text-sm text-rose-100 opacity-90">Compete 1v1 against peers in real-time. Sync progress bars.</p>
                  <ArrowRight className="w-5 h-5 text-white absolute top-6 right-6 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition" />
                </button>
              </section>
            </div>

            {/* Right Column: Job Alerts & Activity */}
            <div className="space-y-8">
              {/* --- JOB ALERTS SECTION (SAFE RENDER IMPLEMENTED) --- */}
              <section className="p-6 bg-[#080c1e] rounded-3xl border border-slate-800 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-extrabold text-white tracking-tight flex items-center gap-2.5">
                    <Bell className="w-5 h-5 text-amber-400" />
                    Latest Job Alerts
                  </h3>
                  <button onClick={() => navigate('/dashboard')} className="text-xs text-indigo-400 hover:underline font-semibold">View All</button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                  {/* 1. LOADER STATE */}
                  {loading && <DataLoading />}

                  {/* 2. EMPTY STATE */}
                  {!loading && (!jobAlerts || jobAlerts.length === 0) && (
                    <div className="text-center py-8 px-4 bg-[#0b132b] rounded-2xl border border-dashed border-slate-700">
                        <Bell className='w-10 h-10 text-slate-700 mx-auto mb-3' />
                        <p className="text-sm text-slate-400">No job alerts at the moment.</p>
                        <p className='text-xs text-slate-500 mt-1'>Check back later for updates.</p>
                    </div>
                  )}

                  {/* 3. SAFE DATA MAPPING */}
                  {/* Use optional chaining (?.map) and ensure jobAlerts is initialized as [] */}
                  {!loading && jobAlerts?.length > 0 && (
                    jobAlerts.map((job) => (
                      // Pass individual job object safely. The component handles missing fields.
                      <JobAlertCard key={job?.id || crypto.randomUUID()} job={job} />
                    ))
                  )}
                </div>
              </section>

              {/* Recent Activity Section */}
              <section className="p-6 bg-[#080c1e] rounded-3xl border border-slate-800 shadow-xl">
                <h3 className="text-lg font-extrabold text-white tracking-tight mb-4">Your Recent Activity</h3>
                <div className="flow-root">
                  {loading && <DataLoading />}
                  {!loading && (!recentActivity || recentActivity.length === 0) && <p className='text-xs text-slate-600 italic py-4 text-center'>No recent actions.</p>}
                  {!loading && recentActivity?.length > 0 && (
                     recentActivity.slice(0, 5).map((activity) => (
                      <ActivityItem key={activity?.id || crypto.randomUUID()} activity={activity} />
                    ))
                  )}
                </div>
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

