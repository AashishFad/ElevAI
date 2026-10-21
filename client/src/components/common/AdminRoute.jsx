import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import AIOrb from '../ui/AIOrb';

/**
 * AdminRoute Guard
 * Protects admin routes on frontend:
 * - Unauthenticated users -> redirected to /login
 * - Authenticated non-admin users -> redirected to /dashboard
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#070714]">
        <div className="flex flex-col items-center gap-4">
          <AIOrb size="md" state="thinking" showIcon={false} />
          <span className="text-xs font-mono text-[#94A3B8] tracking-wider uppercase animate-pulse">
            Verifying Admin Authorization...
          </span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    // Non-admin users are safely redirected to their Student Workspace Dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
