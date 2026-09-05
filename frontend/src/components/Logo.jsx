import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logo({ size = 'md', onClick }) {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-11 w-11',
    lg: 'h-16 w-16'
  };

  return (
    <div
      onClick={onClick || (() => navigate('/'))}
      className="flex items-center gap-3 cursor-pointer group select-none"
    >
      <div className={`relative ${sizeClasses[size] || sizeClasses.md} rounded-2xl bg-gradient-to-tr from-indigo-900 via-slate-900 to-slate-800 border border-indigo-500/30 p-1 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 overflow-hidden`}>
        <img
          src="/logo.png"
          alt="ShikshaIQ Logo"
          className="w-full h-full object-contain rounded-xl relative z-10"
          onError={(e) => {
            // Fallback visual if the browser blocks the png file
            e.target.style.display = 'none';
            e.target.nextSibling.style.display = 'flex';
          }}
        />
        <div className="absolute inset-0 hidden items-center justify-center text-xs font-black text-orange-400 bg-slate-950">
          SIQ
        </div>
      </div>
      <div>
  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-indigo-300">
    <span className="text-blue-100/90 drop-shadow-sm">Shiksha</span>
    <span className="text-orange-400">I</span>
    <span className="text-emerald-400">Q</span>
  </span>
  <span className="text-[10px] block tracking-wide uppercase font-semibold">
    <span className="text-blue-100/90">Learn </span>
    <span className="text-orange-400 font-extrabold">Smart. </span>
    <span className="text-blue-100/90">Rank </span>
    <span className="text-emerald-500">Higher.</span>
  </span>
</div>
    </div>
  );
}