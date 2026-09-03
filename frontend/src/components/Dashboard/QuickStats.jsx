// frontend/src/components/Dashboard/QuickStats.jsx
import React from 'react';
import { BarChart3, TrendingUp, Target } from 'lucide-react';

const StatCard = ({ icon: Icon, title, value, change, color }) => (
  <div className="bg-[#080c1e] p-5 rounded-2xl border border-slate-800 flex items-start gap-4">
    <div className={`w-12 h-12 rounded-xl ${color} bg-opacity-10 border ${color} border-opacity-20 flex items-center justify-center ${color.replace('bg', 'text')}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-sm text-slate-400">{title}</p>
      <p className="text-2xl font-black text-white">{value}</p>
      {change && <p className="text-xs text-emerald-400 pt-1">{change}</p>}
    </div>
  </div>
);

export default function QuickStats({ stats, isLoading }) {
  if (isLoading) {
    return <div className="h-32 bg-[#080c1e] rounded-3xl border border-slate-800 animate-pulse" />;
  }

  // Use fallback values if stats prop is missing
  const safeStats = stats || {
    avgScore: '0%',
    testsTaken: 0,
    rank: 'TBD'
  };

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
      <StatCard 
        icon={BarChart3}
        title="Avg. Mock Score"
        value={safeStats.avgScore}
        change="+2.1% vs last week"
        color="bg-indigo-500"
      />
      <StatCard 
        icon={Target}
        title="Mock Tests Taken"
        value={safeStats.testsTaken}
        color="bg-rose-500"
      />
      <StatCard 
        icon={TrendingUp}
        title="Overall Rank"
        value={safeStats.rank}
        color="bg-amber-500"
      />
    </section>
  );
}