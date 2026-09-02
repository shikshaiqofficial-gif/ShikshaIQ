import React, { useState, useEffect } from 'react';
import {
  Newspaper,
  Search,
  Calendar,
  Clock,
  Tag,
  Share2,
  BookmarkCheck,
  CheckCircle,
} from 'lucide-react';
import API from './api';

const TOPICS = ['All', 'National', 'Economy', 'Science & Tech', 'Sports'];

export default function CurrentAffairs() {
  const [news, setNews] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await API.get('/current-affairs', {
        params: {
          category: selectedTopic,
          search: searchQuery,
        },
      });
      setNews(res.data.data || []);
    } catch (err) {
      console.error('Failed to load news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [selectedTopic]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchNews();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <span className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Newspaper className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Exam-Targeted GK & Analysis
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight">Daily Current Affairs Digest</h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Curated daily headlines with key takeaways customized for SSC, UPSC, and Banking exams.
          </p>

          <form onSubmit={handleSearchSubmit} className="mt-6 flex max-w-xl gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics, schemes, or keywords..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 text-white placeholder-slate-400 text-sm border border-white/20 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white focus:text-slate-900 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-sm cursor-pointer ${
                selectedTopic === topic
                  ? 'bg-emerald-600 text-white ring-2 ring-emerald-600/30'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        {/* Current Affairs Stream */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 font-semibold">Loading daily digest...</div>
        ) : news.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 mt-6">
            <p className="text-slate-600 font-bold text-base">No news found for this category.</p>
          </div>
        ) : (
          <div className="space-y-4 mt-6">
            {news.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {item.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                      <Clock className="w-3.5 h-3.5" />
                      {item.readTimeMinutes} min read
                    </span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-400 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(item.date).toLocaleDateString(undefined, {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h2 className="text-lg font-black text-slate-900 leading-snug">{item.title}</h2>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.summary}</p>

                {/* Exam Relevance Tags & Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-slate-400 mr-1" />
                    {item.tags?.map((t) => (
                      <span
                        key={t}
                        className="text-[11px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[11px] text-slate-400 font-semibold mr-2">
                      Source: {item.source}
                    </span>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                      <BookmarkCheck className="w-4 h-4" />
                    </button>
                    <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors">
                      <Share2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}