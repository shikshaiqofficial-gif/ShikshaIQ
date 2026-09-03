import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Logo({ size = 'md', onClick }) {
  const navigate = useNavigate();

  // Define dimension classes based on size prop
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-16'
  };

  return (
    <div
      onClick={onClick || (() => navigate('/'))}
      className="flex items-center gap-3 cursor-pointer group select-none"
    >
      <img
        src="/logo.png"
        alt="ShikshaIQ Logo"
        className={`${sizeClasses[size] || sizeClasses.md} w-auto object-contain transition-transform duration-300 group-hover:scale-105 drop-shadow-md`}
      />
    </div>
  );
}