import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Target,
  BarChart3,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Lightbulb,
  FileText,
  ArrowRight,
  Briefcase,
  Bot,
} from 'lucide-react';
import { getAnalysisByIdApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import ProgressRing from '../components/ui/ProgressRing';
import AnimatedMetric from '../components/ui/AnimatedMetric';
import AIOrb from '../components/ui/AIOrb';

const EXP_LABEL_MAP = {
  FRESHER: 'Fresher (0 yrs)',
  ONE_TO_TWO_YEARS: '1–2 Years',
  THREE_TO_FIVE_YEARS: '3–5 Years',
  EXPERIENCED: 'Experienced (5+ yrs)',
};

export default function AnalysisResultPage() {
  const { id: resumeId, analysisId } = useParams();
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openSection, setOpenSection] = useState('summary');

  useEffect(() => {
    let isMounted = true;
    getAnalysisByIdApi(analysisId)
      .then((data) => {
        if (isMounted && data.success) {
          setAnalysis(data.analysis);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to retrieve AI analysis report');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [analysisId]);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-16 text-center space-y-5 animate-fade-in">
        <AIOrb size="xl" state="thinking" />
        <div className="space-y-1.5">
          <h2 className="text-lg font-black text-[#F8FAFC]">Synthesizing AI Evaluation Report...</h2>
          <p className="text-xs text-[#94A3B8]">Compiling multi-dimensional scores and ATS feedback.</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center space-y-4 animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/20 flex items-center justify-center mx-auto">
          <AlertCircle className="w-7 h-7" />
        </div>
        <h2 className="text-lg font-bold text-[#F8FAFC]">{error || 'Analysis report not found'}</h2>
        <Link to={`/resume/${resumeId}`}>
          <GradientButton variant="glass" size="sm" icon={ArrowLeft}>
            Back to Resume Details
          </GradientButton>
        </Link>
      </div>
    );
  }

  const score = analysis.overallScore || 0;
  const breakdown = analysis.scoreBreakdown || {};
  const strengths = Array.isArray(analysis.strengths) ? analysis.strengths : [];
  const weaknesses = Array.isArray(analysis.weaknesses) ? analysis.weaknesses : [];
  const skillsFound = analysis.skillsFound || {};
  const recommendedSkills = Array.isArray(analysis.recommendedSkills) ? analysis.recommendedSkills : [];
  const actionItems = Array.isArray(analysis.actionItems) ? analysis.actionItems : [];
  const sectionFeedback = analysis.sectionFeedback || {};

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <Link
          to={`/resume/${resumeId}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Resume Details</span>
        </Link>
        <span className="text-[10px] text-[#64748B] font-mono bg-white/[0.05] px-2.5 py-1 rounded-lg border border-white/[0.08]">
          EVALUATION ID: {analysis.id.substring(0, 8)}
        </span>
      </div>

      {/* Main Score & Summary Header Banner */}
      <GlassCard className="p-6 sm:p-8 space-y-6" glowVariant="violet">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <GlowBadge variant="violet" size="sm" icon={Target}>
                Target: {analysis.careerGoal?.targetRole || 'Software Engineering'}
              </GlowBadge>
              <GlowBadge variant="cyan" size="sm">
                Level: {EXP_LABEL_MAP[analysis.careerGoal?.experienceLevel] || 'General'}
              </GlowBadge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">
              AI Career Fit Evaluation
            </h1>

            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed max-w-2xl">
              {analysis.summary}
            </p>
          </div>

          {/* Large Radial Score Gauge */}
          <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-[rgba(10,12,25,0.7)] rounded-3xl border border-white/[0.1] text-center shadow-inner">
            <ProgressRing
              score={score}
              max={100}
              size={130}
              strokeWidth={9}
              glowColor={score >= 80 ? '#22D3A7' : score >= 60 ? '#06B6D4' : '#EC4899'}
            >
              <div className="flex flex-col items-center">
                <span className="text-3xl font-black text-[#F8FAFC] tracking-tighter">
                  {score}
                </span>
                <span className="text-[9px] text-[#94A3B8] uppercase tracking-widest font-black -mt-1">
                  ATS Score
                </span>
              </div>
            </ProgressRing>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-white/[0.08] relative z-10">
          <Link to="/jobs">
            <GradientButton variant="primary" size="sm" icon={Briefcase}>
              Explore Open Jobs
            </GradientButton>
          </Link>
          <Link to="/mock-interview">
            <GradientButton variant="glass" size="sm" icon={Bot}>
              Practice AI Mock Interview
            </GradientButton>
          </Link>
        </div>
      </GlassCard>

      {/* Category Score Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[#06B6D4]" />
          <h2 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">
            Multi-Dimensional Rubric Breakdown
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(breakdown).map(([key, val]) => {
            const formattedKey = key.replace(/([A-Z])/g, ' $1');
            return (
              <GlassCard key={key} className="p-4 text-center space-y-2" glowVariant="cyan">
                <div className="text-[10px] font-black uppercase text-[#94A3B8] tracking-wider truncate">
                  {formattedKey}
                </div>
                <div className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
                  <AnimatedMetric value={val} suffix="%" />
                </div>
                <div className="w-full bg-[rgba(10,12,25,0.9)] h-2 rounded-full overflow-hidden border border-white/[0.08]">
                  <div
                    className="bg-gradient-to-r from-[#06B6D4] to-[#8B5CF6] h-full rounded-full transition-all duration-1000 shadow-sm"
                    style={{ width: `${Math.max(5, val)}%` }}
                  />
                </div>
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Key Strengths & Areas for Improvement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <GlassCard className="p-6 space-y-4" glowVariant="green">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <CheckCircle2 className="w-4 h-4 text-[#22D3A7] shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Identified Strengths</h3>
          </div>
          <ul className="space-y-2.5">
            {strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22D3A7] mt-1.5 shrink-0" />
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </GlassCard>

        {/* Improvement Areas */}
        <GlassCard className="p-6 space-y-4" glowVariant="pink">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <AlertTriangle className="w-4 h-4 text-[#EC4899] shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Areas for Growth</h3>
          </div>
          <ul className="space-y-2.5">
            {weaknesses.map((weak, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-xs text-[#CBD5E1] leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EC4899] mt-1.5 shrink-0" />
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </GlassCard>
      </div>

      {/* Section-by-Section Feedback Accordion */}
      <div className="space-y-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-[#94A3B8]">
          Granular Section Feedback
        </h2>

        <div className="space-y-3">
          {Object.entries(sectionFeedback).map(([section, data]) => {
            const isOpen = openSection === section;
            return (
              <GlassCard key={section} className="overflow-hidden">
                <button
                  onClick={() => setOpenSection(isOpen ? null : section)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-white/[0.02] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-bold text-[#F8FAFC] uppercase tracking-wider">
                      {section}
                    </span>
                    <GlowBadge
                      variant={data.score >= 80 ? 'green' : data.score >= 60 ? 'cyan' : 'pink'}
                      size="xs"
                    >
                      {data.score}%
                    </GlowBadge>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-[#94A3B8]" /> : <ChevronDown className="w-4 h-4 text-[#94A3B8]" />}
                </button>

                {isOpen && (
                  <div className="p-4 pt-0 border-t border-white/[0.06] space-y-3 text-xs text-[#CBD5E1] animate-fade-in mt-2">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#94A3B8] tracking-wider block">Observations</span>
                      <p className="mt-1 leading-relaxed">{data.feedback}</p>
                    </div>
                    {data.suggestions && (
                      <div className="p-3 bg-white/[0.02] rounded-xl border border-white/[0.06]">
                        <span className="text-[10px] font-black uppercase text-[#06B6D4] tracking-wider block">AI Suggestion</span>
                        <p className="mt-1 leading-relaxed text-[#F8FAFC]">{data.suggestions}</p>
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>

      {/* Extracted Skills & Recommended Target Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4" glowVariant="cyan">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <FileText className="w-4 h-4 text-[#06B6D4] shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Skills Detected in Resume</h3>
          </div>

          <div className="space-y-3">
            {Object.entries(skillsFound).map(([category, list]) => {
              if (!Array.isArray(list) || list.length === 0) return null;
              return (
                <div key={category} className="space-y-1.5">
                  <span className="text-[9px] font-black text-[#94A3B8] uppercase tracking-widest capitalize">
                    {category.replace(/([A-Z])/g, ' $1')}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {list.map((skill) => (
                      <span key={skill} className="px-2.5 py-1 bg-white/[0.06] text-[#F8FAFC] rounded-xl text-xs border border-white/[0.08]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-4" glowVariant="violet">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <Lightbulb className="w-4 h-4 text-[#8B5CF6] shrink-0" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Recommended Target Skills</h3>
          </div>

          <div className="flex flex-wrap gap-2">
            {recommendedSkills.map((rec) => (
              <span key={rec} className="px-3 py-1.5 bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30 rounded-xl text-xs font-bold shadow-sm">
                + {rec}
              </span>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Priority Action Plan */}
      <GlassCard className="p-6 sm:p-8 space-y-4" glowVariant="pink">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <Layers className="w-4 h-4 text-[#EC4899] shrink-0" />
          <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Strategic Action Roadmap</h3>
        </div>

        <div className="space-y-3">
          {actionItems.map((item, idx) => (
            <div key={idx} className="p-4 bg-[rgba(10,12,25,0.7)] border border-white/[0.08] rounded-2xl flex items-start gap-4 shadow-sm">
              <GlowBadge
                variant={
                  item.priority === 'HIGH'
                    ? 'pink'
                    : item.priority === 'MEDIUM'
                    ? 'amber'
                    : 'violet'
                }
                size="xs"
              >
                {item.priority}
              </GlowBadge>
              <div className="space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">{item.title}</h4>
                <p className="text-xs text-[#94A3B8] leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
