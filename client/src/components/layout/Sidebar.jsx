import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  Briefcase,
  Bot,
  User,
  Settings,
  Bell,
  X,
  Target,
  Send,
  ShieldCheck,
} from 'lucide-react';
import AIOrb from '../ui/AIOrb';
import GlowBadge from '../ui/GlowBadge';

export const navSections = [
  {
    title: 'Recruitment & Jobs',
    items: [
      { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { label: 'Jobs', path: '/jobs', icon: Briefcase },
      { label: 'My Applications', path: '/applications', icon: Send },
    ],
  },
  {
    title: 'Candidate Tools',
    items: [
      { label: 'My Resumes', path: '/resumes', icon: FileText },
      { label: 'Resume Analyzer', path: '/resumes/upload', icon: Sparkles },
      { label: 'AI Mock Interview', path: '/mock-interview', icon: Bot },
    ],
  },
  {
    title: 'Account',
    items: [
      { label: 'Notifications', path: '/notifications', icon: Bell },
      { label: 'Career Target', path: '/career-goal', icon: Target },
      { label: 'Profile', path: '/profile', icon: User },
      { label: 'Settings', path: '/settings', icon: Settings },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isActive =
      location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

    return (
      <Link
        key={item.label}
        to={item.path}
        onClick={onClose}
        className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
          isActive
            ? 'bg-gradient-to-r from-[#8B5CF6]/25 via-[#3B82F6]/15 to-transparent text-[#F8FAFC] font-bold border border-[#8B5CF6]/40 shadow-[0_0_20px_rgba(139,92,246,0.25)]'
            : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.05] border border-transparent hover:border-white/[0.08]'
        }`}
      >
        {/* Active glowing indicator line */}
        {isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-gradient-to-b from-[#06B6D4] via-[#8B5CF6] to-[#EC4899] shadow-[0_0_8px_#8B5CF6]" />
        )}

        <div className="flex items-center gap-2.5 min-w-0 pl-1">
          <Icon
            className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
              isActive ? 'text-[#06B6D4]' : 'text-[#64748B] group-hover:text-[#A78BFA]'
            }`}
          />
          <span className="truncate tracking-wide">{item.label}</span>
        </div>

        {item.badge && (
          <span
            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              item.badge === 'NEW'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-violet-500/20 text-violet-300 border border-violet-500/40'
            }`}
          >
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 shrink-0 bg-[#070714]/90 backdrop-blur-2xl border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo and Brand */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-white/[0.08]">
          <Link to="/dashboard" className="flex items-center gap-3 group" onClick={onClose}>
            <AIOrb size="sm" state="idle" showIcon={false} />
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-[#F8FAFC] via-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent group-hover:from-white group-hover:to-[#06B6D4] transition-all">
                Elev<span className="text-[#8B5CF6]">AI</span>
              </span>
              <span className="text-[9px] font-semibold text-[#64748B] tracking-wider uppercase -mt-0.5">
                Candidate Workspace
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.05] md:hidden transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {navSections.map((section) => (
            <div key={section.title} className="space-y-1.5">
              <h4 className="px-3 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                {section.title}
              </h4>
              <div className="space-y-1">{section.items.map(renderNavItem)}</div>
            </div>
          ))}
        </div>

        {/* Local AI Engine Status Badge Footer */}
        <div className="p-3.5 border-t border-white/[0.08] bg-[#070714]/60">
          <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.05]">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
            <div className="flex flex-col min-w-0">
              <span className="text-[11px] font-bold text-[#F8FAFC] truncate">
                Qwen 2.5 7B AI
              </span>
              <span className="text-[9px] text-[#64748B] truncate">
                Local AI Connected
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
