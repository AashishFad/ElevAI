import React from 'react';
import { Menu, LogOut, User as UserIcon, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import NotificationBell from '../common/NotificationBell';

export default function Topbar({ onMenuToggle, title }) {
  const { user, isAdmin, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-16 bg-[rgba(7,7,20,0.75)] backdrop-blur-xl border-b border-white/[0.08] px-4 sm:px-6 flex items-center justify-between transition-colors shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-white/10 border border-white/[0.08] transition-colors cursor-pointer"
          aria-label="Toggle menu"
        >
          <Menu className="w-4 h-4" />
        </button>
        <div className="flex items-center gap-2">
          <h1 className="text-xs sm:text-sm font-bold text-[#F8FAFC] tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6]" />
            {title || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Notification Bell */}
        {user && <NotificationBell />}

        {/* User Profile Chip */}
        {user && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(20,20,40,0.65)] border border-white/[0.08] rounded-xl text-xs backdrop-blur-md shadow-sm">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center font-bold text-[11px] shadow-sm">
              {user.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-semibold text-[#F8FAFC] leading-none text-xs truncate max-w-[120px]">
                {user.name}
              </div>
              <div className="text-[10px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                {isAdmin ? (
                  <>
                    <Shield className="w-2.5 h-2.5 text-[#F59E0B]" />
                    <span className="text-[#F59E0B] font-semibold">Recruiter</span>
                  </>
                ) : (
                  <span className="text-[#06B6D4] font-semibold">Candidate</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={logout}
          title="Sign Out"
          className="p-2 text-[#94A3B8] hover:text-[#F87171] hover:bg-[#EF4444]/10 rounded-xl border border-white/[0.08] hover:border-[#EF4444]/30 transition-all cursor-pointer"
          aria-label="Sign out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
