import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Activity,
  Database,
  Server,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  FileText,
  Briefcase,
  Bot,
  ShieldCheck,
  Send,
  Bell,
  Layers,
} from 'lucide-react';
import { checkHealth } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import AIOrb from '../components/ui/AIOrb';

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Recruiter Job Management',
    desc: 'Recruiters create, categorize, and publish verified technical job requisitions with required skills, experience levels, and application deadlines.',
    tag: 'Recruiter Hub',
    glow: 'cyan',
  },
  {
    icon: FileText,
    title: 'AI Resume Analyzer',
    desc: 'Deep multi-dimensional resume evaluation with ATS scoring, technical skill categorization, strengths, and actionable recruiter feedback.',
    tag: 'ATS Scoring',
    glow: 'violet',
  },
  {
    icon: Sparkles,
    title: 'Resume vs Job Alignment',
    desc: 'Analyze candidate resumes against job requisitions to extract matching skills, missing competencies, and calculate explainable suitability scores.',
    tag: 'Job Matching',
    glow: 'pink',
  },
  {
    icon: Send,
    title: 'Application Pipeline & Tracking',
    desc: 'Candidates apply with analyzed resumes. Recruiters review applications, inspect AI match scores, and update candidate stages in real-time.',
    tag: 'Full Workflow',
    glow: 'green',
  },
  {
    icon: Bot,
    title: 'Text AI Mock Interview',
    desc: 'Practice interactive role-tailored technical and behavioral drill questions evaluated with instant scorecards and benchmark answers.',
    tag: 'Interview Drill',
    glow: 'amber',
  },
  {
    icon: Bell,
    title: 'Instant Status Notifications',
    desc: 'Real-time alert notifications for new job postings, application submissions, recruiter status reviews, and interview invitations.',
    tag: 'Real-Time Alerts',
    glow: 'cyan',
  },
];

export default function LandingPage() {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    checkHealth()
      .then((data) => {
        if (isMounted) setHealth(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to connect to backend server');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-16 pb-16 animate-fade-in">
      {/* Hero Section */}
      <div className="text-center space-y-8 max-w-3xl mx-auto pt-6 flex flex-col items-center">
        {/* Central 3D AI Orb Visual */}
        <div className="relative">
          <AIOrb size="hero" state="idle" showIcon={true} />
        </div>

        {/* Pill Badge */}
        <GlowBadge variant="ai" size="sm" icon={Sparkles}>
          AI-Powered Recruitment & Career Acceleration Platform
        </GlowBadge>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-[#F8FAFC] leading-tight">
          Next-Gen Technical Hiring & Application Platform <br className="hidden sm:inline" />
          <span className="text-gradient-ai">ElevAI</span>
        </h1>

        <p className="text-xs sm:text-base text-[#94A3B8] max-w-2xl mx-auto leading-relaxed">
          Connecting verified engineering talent with recruiter job requisitions through intelligent resume alignment, deterministic match scoring, and end-to-end applicant tracking.
        </p>

        {/* Actions */}
        <div className="flex flex-wrap justify-center items-center gap-4 pt-2">
          <Link to="/register">
            <GradientButton variant="primary" size="lg" icon={ArrowRight} iconPosition="right">
              Get Started Free
            </GradientButton>
          </Link>

          <Link to={isAuthenticated ? (isAdmin ? '/admin' : '/dashboard') : '/login'}>
            <GradientButton variant="glass" size="lg">
              Launch Workspace
            </GradientButton>
          </Link>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="w-full space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
            End-to-End Recruitment Workflow
          </h2>
          <p className="text-xs sm:text-sm text-[#94A3B8]">
            Built with local AI intelligence powered by Ollama & Qwen 2.5 7B
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <GlassCard
                key={idx}
                className="p-6 space-y-4 flex flex-col justify-between"
                glowVariant={feat.glow}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-2xl bg-white/[0.06] text-[#F8FAFC] border border-white/[0.1] flex items-center justify-center shadow-inner">
                      <Icon className="w-5 h-5" />
                    </div>
                    <GlowBadge variant={feat.glow === 'green' ? 'green' : feat.glow === 'pink' ? 'pink' : feat.glow === 'amber' ? 'amber' : feat.glow === 'cyan' ? 'cyan' : 'violet'} size="xs">
                      {feat.tag}
                    </GlowBadge>
                  </div>
                  <h3 className="text-sm font-bold text-[#F8FAFC]">{feat.title}</h3>
                  <p className="text-xs text-[#94A3B8] leading-relaxed">{feat.desc}</p>
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Live System Diagnostics / Verification Panel */}
      <GlassCard className="w-full max-w-2xl mx-auto p-6 sm:p-8" glowVariant="violet">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-[#8B5CF6]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">System Integration Status</h2>
          </div>
          <span className="text-[10px] font-mono text-[#64748B] bg-white/[0.05] px-2 py-0.5 rounded border border-white/[0.08]">
            GET /api/health
          </span>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 text-[#94A3B8] py-4 text-xs">
            <div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
            <span>Checking backend health status...</span>
          </div>
        ) : error ? (
          <div className="flex items-start gap-3 text-[#F87171] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl p-4 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Backend Unreachable</p>
              <p className="text-[11px] text-[#FCA5A5] mt-1">{error}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-[#06B6D4]" />
                <span className="text-[#94A3B8]">Node.js / Express API:</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">ONLINE ({health?.status || 'OK'})</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-[#8B5CF6]" />
                <span className="text-[#94A3B8]">PostgreSQL (Supabase Pooler):</span>
              </div>
              <span className="font-mono text-emerald-400 font-bold">
                {health?.database?.status === 'connected' ? 'CONNECTED' : 'ONLINE'}
              </span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#EC4899]" />
                <span className="text-[#94A3B8]">AI Inference Engine:</span>
              </div>
              <span className="font-mono text-[#06B6D4] font-bold">
                Ollama / Qwen 2.5 7B
              </span>
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
