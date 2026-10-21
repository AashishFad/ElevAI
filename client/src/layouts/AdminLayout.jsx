import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar, { adminNavSections } from '../components/layout/AdminSidebar';
import Topbar from '../components/layout/Topbar';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Find page title based on current path across all adminNavSections
  const allItems = adminNavSections.flatMap((s) => s.items);
  const currentItem = allItems.find(
    (item) =>
      location.pathname === item.path ||
      (item.path !== '/admin' && location.pathname.startsWith(item.path))
  );
  const title = currentItem ? currentItem.label : 'Admin Control Center';

  return (
    <div className="min-h-screen flex bg-[#070714] text-[#F8FAFC] relative selection:bg-[#F59E0B]/30 selection:text-white">
      {/* Global Next-Gen Ambient Background */}
      <AnimatedBackground />

      {/* Admin Sidebar */}
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 z-10 relative">
        <Topbar onMenuToggle={() => setSidebarOpen(true)} title={`Admin: ${title}`} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
