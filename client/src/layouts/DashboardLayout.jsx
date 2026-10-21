import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar, { navSections } from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';
import AIStatusBanner from '../components/common/AIStatusBanner';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Find page title based on current path across all navSections
  const allItems = navSections.flatMap((s) => s.items);
  const currentItem = allItems.find(
    (item) =>
      location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
  );
  const title = currentItem ? currentItem.label : 'ElevAI Workspace';

  return (
    <div className="min-h-screen flex bg-[#070714] text-[#F8FAFC] relative selection:bg-[#8B5CF6]/30 selection:text-white">
      {/* Global Next-Gen Ambient Background */}
      <AnimatedBackground />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          {/* AI Quota / Status Banner — shown when AI is unavailable */}
          <AIStatusBanner />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
