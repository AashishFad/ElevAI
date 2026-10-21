import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, LayoutDashboard, Home, LogIn, UserPlus, LogOut, User as UserIcon, Shield } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import AIOrb from '../ui/AIOrb';
import GradientButton from '../ui/GradientButton';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[rgba(7,7,20,0.8)] border-b border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="ElevAI Logo"
              className="w-8 h-8 rounded-xl object-contain shadow-[0_0_15px_rgba(139,92,246,0.35)] transition-transform duration-200 group-hover:scale-105"
            />
            <div className="flex items-baseline gap-1">
              <span className="font-black text-xl tracking-tight text-[#F8FAFC]">
                Elev<span className="text-gradient-ai">AI</span>
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#06B6D4] animate-ping" />
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden sm:flex items-center gap-2">
            <Link
              to="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive('/') 
                  ? 'bg-white/[0.08] text-[#06B6D4] border border-white/[0.12] shadow-inner' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.05]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>

            <Link
              to={isAdmin ? '/admin' : '/dashboard'}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                isActive(isAdmin ? '/admin' : '/dashboard') 
                  ? 'bg-white/[0.08] text-[#8B5CF6] border border-white/[0.12] shadow-inner' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.05]'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Workspace</span>
            </Link>
          </nav>

          {/* User Auth Section */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={isAdmin ? '/admin' : '/dashboard'}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[rgba(20,20,40,0.65)] border border-white/[0.08] rounded-xl text-xs backdrop-blur-md hover:border-white/20 transition-colors"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center font-bold text-[11px]">
                    {user?.name ? user.name.charAt(0).toUpperCase() : <UserIcon className="w-3.5 h-3.5" />}
                  </div>
                  <div className="text-left hidden sm:block">
                    <div className="font-semibold text-[#F8FAFC] leading-none text-xs">{user?.name}</div>
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
                </Link>

                <button
                  onClick={handleLogout}
                  title="Sign Out"
                  className="p-2 text-[#94A3B8] hover:text-[#F87171] hover:bg-[#EF4444]/10 rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.06] transition-colors flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link to="/register">
                  <GradientButton variant="primary" size="sm" icon={UserPlus}>
                    Register
                  </GradientButton>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
