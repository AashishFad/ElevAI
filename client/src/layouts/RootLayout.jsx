import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';
import AnimatedBackground from '../components/ui/AnimatedBackground';

export default function RootLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#070714] text-[#F8FAFC] relative selection:bg-[#8B5CF6]/30 selection:text-white">
      <AnimatedBackground />
      <Navbar />
      <main className="flex-grow flex flex-col z-10 relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
