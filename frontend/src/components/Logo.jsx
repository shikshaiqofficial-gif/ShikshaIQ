import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logo({ size = 'md', onClick }) {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-2xl'
  };

  return (
    <div
      onClick={onClick || (() => navigate('/'))}
      className="flex items-center gap-3 cursor-pointer group select-none"
    >
      <div className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-rose-500 flex items-center justify-center font-black text-white shadow-xl shadow-indigo-600/30 group-hover:scale-105 transition duration-300`}>
        <span className="relative z-10">S</span>
        {/* Glowing animated background aura */}
        <div className="absolute inset-0 rounded-2xl bg-indigo-500 blur-md opacity-40 animate-ping pointer-events-none"></div>
      </div>
      <div>
        <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5 group-hover:text-indigo-300 transition">
          ShikshaIQ <span className="text-[10px] bg-gradient-to-r from-indigo-500 to-rose-500 text-white font-mono px-2 py-0.5 rounded-full shadow-sm">AI 2026</span>
        </span>
        <span className="text-[10px] text-slate-400 block tracking-wide">Next-Gen Exam Prep</span>
      </div>
    </div>
  );
}