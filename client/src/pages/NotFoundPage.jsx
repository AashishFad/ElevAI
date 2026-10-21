import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Home } from 'lucide-react';
import GradientButton from '../components/ui/GradientButton';
import AIOrb from '../components/ui/AIOrb';

export default function NotFoundPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center animate-fade-in relative z-10 space-y-6">
      <AIOrb size="md" state="idle" showIcon={false} />
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">404 — Node Not Found</h1>
        <p className="text-[#94A3B8] text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
          The requested coordinate does not exist in this neural network.
        </p>
      </div>
      <Link to="/dashboard">
        <GradientButton variant="primary" size="md" icon={Home}>
          Return to Workspace
        </GradientButton>
      </Link>
    </div>
  );
}
