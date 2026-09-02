import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans">
      {/* Top Navbar */}
      <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 px-4 md:px-8 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-900 rounded-lg flex items-center justify-center font-black text-amber-400 text-lg shadow">
              SIQ
            </div>
            <div>
              <span className="text-xl font-black text-indigo-950 tracking-tight">ShikshaIQ</span>
              <span className="hidden sm:block text-[9px] font-bold text-slate-500 uppercase tracking-widest -mt-1">Learn Smart. Rank Higher.</span>
            </div>
          </Link>

          <div className="hidden lg:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <Link to="/" className="text-orange-500 font-bold">Home</Link>
            <div className="cursor-pointer hover:text-orange-500">Courses ▾</div>
            <div className="cursor-pointer hover:text-orange-500">Test Series ▾</div>
            <div className="cursor-pointer hover:text-orange-500">Live Classes</div>
            <div className="cursor-pointer hover:text-orange-500">Current Affairs</div>
            <div className="cursor-pointer hover:text-orange-500">PYQ</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login" className="px-4 py-2 text-sm font-bold text-slate-700 hover:text-indigo-600 transition">
            Login
          </Link>
          <Link to="/register" className="px-5 py-2 text-sm font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-lg shadow transition">
            Sign Up
          </Link>
        </div>
      </nav>

      {/* Dark Navy Hero Section */}
      <section className="bg-slate-900 text-white relative overflow-hidden px-6 lg:px-12 pt-12 pb-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-block px-3 py-1 text-xs font-bold bg-indigo-950 text-indigo-300 border border-indigo-700 rounded-full">
              #1 Learning Platform for Competitive Exams
            </span>
            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
              Crack Every Exam <br />
              <span className="text-orange-400">With Confidence</span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-xl">
              India's Smart Learning Platform for SSC, Banking, Railway, UPSC, Defence, Teaching, State Exams and more.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/courses" className="px-6 py-3 text-sm font-bold text-slate-900 bg-orange-400 hover:bg-orange-500 rounded-lg shadow-md transition">
                Explore Courses →
              </Link>
              <Link to="/test" className="px-6 py-3 text-sm font-bold text-emerald-950 bg-emerald-400 hover:bg-emerald-500 rounded-lg shadow-md transition flex items-center gap-2">
                <span>📄</span> Free Mock Test
              </Link>
            </div>

            <div className="pt-2 text-xs text-slate-400 flex items-center gap-2">
              <span className="text-amber-400 text-sm">★★★★★</span>
              <span>500K+ Students Trust Us</span>
            </div>
          </div>

          {/* Hero Decorative Visual Box */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl relative">
              <div className="flex items-center justify-between border-b border-slate-700 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center font-bold text-white">
                    SIQ
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">Student Progress</p>
                    <p className="text-xs text-slate-400">Mock Score Analysis</p>
                  </div>
                </div>
                <span className="text-xs font-bold px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded">
                  +120 Score Boost
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Accuracy</span>
                  <span className="font-bold text-emerald-400">88%</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full w-[88%]"></div>
                </div>
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Syllabus Completed</span>
                  <span className="font-bold text-orange-400">80%</span>
                </div>
                <div className="w-full bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div className="bg-orange-400 h-full w-[80%]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Floating Search Bar */}
        <div className="max-w-3xl mx-auto mt-10 relative z-10">
          <div className="bg-white rounded-xl shadow-lg p-2 flex items-center gap-2 border border-slate-200">
            <span className="pl-3 text-slate-400 text-lg">🔍</span>
            <input
              type="text"
              placeholder="Search Courses, Exams, Tests and more..."
              className="w-full bg-transparent px-2 py-2 text-sm text-slate-800 outline-none"
            />
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition">
              Search
            </button>
          </div>
        </div>
      </section>

      {/* Key Metric Stats Banner */}
      <section className="max-w-6xl mx-auto -mt-6 relative z-20 px-4">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-900">500K+</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">Active Students</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-900">1000+</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">Mock Tests</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-900">500+</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">Video Courses</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-black text-indigo-900">95%</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-500">Success Rate</p>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
            Everything You Need To Succeed
          </h2>
          <p className="text-slate-500 text-sm mt-2">Learn Smart. Rank Higher with complete test prep resources.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[
            { title: "Online Courses", desc: "Expert-led courses for every exam", icon: "📚", color: "bg-purple-100 text-purple-700" },
            { title: "Test Series & Mocks", desc: "Unlimited tests with detailed analysis", icon: "📋", color: "bg-blue-100 text-blue-700" },
            { title: "AI Doubt Solver", desc: "Get instant solutions anytime", icon: "🤖", color: "bg-emerald-100 text-emerald-700" },
            { title: "Job Alerts", desc: "Latest government & private updates", icon: "💼", color: "bg-red-100 text-red-700" },
            { title: "Live Classes", desc: "Learn live from top educators", icon: "📹", color: "bg-orange-100 text-orange-700" },
            { title: "Notes & PDFs", desc: "Download free notes & study material", icon: "📑", color: "bg-cyan-100 text-cyan-700" },
            { title: "Previous Year Papers", desc: "Practice with actual PYQs", icon: "📝", color: "bg-amber-100 text-amber-700" },
            { title: "Performance Tracker", desc: "Track progress and improve", icon: "🏆", color: "bg-indigo-100 text-indigo-700" },
          ].map((feat, idx) => (
            <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition">
              <div className={`w-10 h-10 rounded-lg ${feat.color} flex items-center justify-center text-xl mb-3`}>
                {feat.icon}
              </div>
              <h3 className="font-bold text-slate-900 text-sm">{feat.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Dark Navy Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
          <div className="col-span-2">
            <span className="text-lg font-black text-white">ShikshaIQ</span>
            <p className="mt-2 text-slate-400 max-w-sm leading-relaxed">
              India's most trusted learning platform for competitive exams. Learn, Practice, and Rank Higher with us.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-white">Home</Link></li>
              <li><Link to="/test" className="hover:text-white">Test Series</Link></li>
              <li><Link to="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link to="/admin" className="hover:text-white">Admin Panel</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Top Exams</h4>
            <ul className="space-y-2">
              <li>SSC CGL / CHSL</li>
              <li>Banking (IBPS, SBI)</li>
              <li>Railway NTPC</li>
              <li>UPSC CSE</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">Contact Us</h4>
            <p className="leading-relaxed">Support & Query Helpline available 24/7.</p>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 pt-6 border-t border-slate-800 text-center text-slate-500">
          © 2026 ShikshaIQ. All Rights Reserved.
        </div>
      </footer>
    </div>
  );
};

export default Home;