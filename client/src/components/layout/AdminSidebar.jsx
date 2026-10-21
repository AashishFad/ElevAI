import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileCheck2,
  Bell,
  BarChart3,
  X,
  ShieldCheck,
  Sparkles,
  User,
} from 'lucide-react';
import GlowBadge from '../ui/GlowBadge';

export const adminNavSections = [
  {
    title: 'Recruiter Workspace',
    items: [
      {
        label: 'Recruiter Dashboard',
        path: '/admin',
        icon: LayoutDashboard,
        status: 'active',
      },
      {
        label: 'Jobs',
        path: '/admin/jobs',
        icon: Briefcase,
        status: 'active',
      },
      {
        label: 'Applications',
        path: '/admin/applications',
        icon: FileCheck2,
        status: 'active',
      },
    ],
  },
  {
    title: 'Intelligence & Control',
    items: [
      {
        label: 'Notifications',
        path: '/admin/notifications',
        icon: Bell,
        status: 'active',
      },
      {
        label: 'Profile',
        path: '/profile',
        icon: User,
        status: 'active',
      },
    ],
  },
];

export default function AdminSidebar({ isOpen, onClose }) {
  const location = useLocation();

  const renderNavItem = (item) => {
    const Icon = item.icon;
    const isCurrentActive =
      location.pathname === item.path ||
      (item.path !== '/admin' && location.pathname.startsWith(item.path));

    return (
      <Link
        key={item.label}
        to={item.path}
        onClick={onClose}
        className={`relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
          isCurrentActive
            ? 'bg-gradient-to-r from-[#8B5CF6]/20 to-[#06B6D4]/10 text-[#F8FAFC] border border-[#8B5CF6]/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
            : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`p-1.5 rounded-lg transition-colors ${
              isCurrentActive
                ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]'
                : 'text-[#94A3B8] group-hover:text-[#F8FAFC] group-hover:bg-white/[0.06]'
            }`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <span className="tracking-wide">{item.label}</span>
        </div>

        {item.badge && (
          <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md bg-[#8B5CF6]/15 text-[#C084FC] border border-[#8B5CF6]/30">
            {item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden animate-fade-in"
        />
      )}

      {/* Admin Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-50 h-screen w-64 shrink-0 bg-[rgba(13,16,32,0.85)] backdrop-blur-2xl border-r border-white/[0.08] flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="flex items-center justify-between h-18 px-5 border-b border-white/[0.08]">
          <Link to="/admin" className="flex items-center gap-3 group">
            <div className="relative w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-[#F59E0B] via-[#EC4899] to-[#8B5CF6] shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-transform duration-300 group-hover:scale-110">
              <img
                src="/logo.png"
                alt="ElevAI Logo"
                className="w-full h-full rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1">
                <span className="font-black text-lg tracking-tight text-[#F8FAFC]">
                  Elev<span className="text-gradient-ai">AI</span>
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping" />
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-2.5 h-2.5 text-[#F59E0B]" />
                <span className="text-[9px] font-mono font-bold tracking-widest text-[#F59E0B] uppercase">
                  Admin OS
                </span>
              </div>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
          {adminNavSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-[#64748B] px-3 mb-1.5">
                {section.title}
              </div>
              <div className="space-y-0.5">{section.items.map(renderNavItem)}</div>
            </div>
          ))}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-white/[0.08] bg-black/20">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
            <span className="text-[11px] font-mono text-[#94A3B8]">
              RBAC Mode: <span className="text-[#F8FAFC] font-semibold">ADMIN</span>
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
