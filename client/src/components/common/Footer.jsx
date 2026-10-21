import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.08] bg-[rgba(7,7,20,0.85)] backdrop-blur-xl text-[#94A3B8] py-8 px-4 sm:px-6 lg:px-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 font-bold text-[#F8FAFC]">
          <img
            src="/logo.png"
            alt="ElevAI Logo"
            className="w-5 h-5 rounded-lg object-contain"
          />
          <span className="text-xs">ElevAI Platform</span>
        </div>
        <p className="text-xs text-[#64748B] text-center sm:text-right">
          &copy; {new Date().getFullYear()} ElevAI. Next-Generation Career Intelligence.
        </p>
      </div>
    </footer>
  );
}
