import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Bot,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Award,
  Layers,
  Sparkles,
  BookOpen,
  Clock,
  History,
  Activity,
  Code,
  Users,
} from 'lucide-react';
import { getInterviewByIdApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import AIOrb from '../components/ui/AIOrb';
import ProgressRing from '../components/ui/ProgressRing';

export default function MockInterviewResultPage() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedIdeal, setExpandedIdeal] = useState({});

  useEffect(() => {
    setLoading(true);
    getInterviewByIdApi(sessionId)
      .then((data) => {
        if (data.success) {
          setSession(data.session);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview report');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionId]);

  const toggleIdeal = (idx) => {
    setExpandedIdeal((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <AIOrb size="md" state="thinking" showIcon={false} />
        <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
          Compiling AI Evaluation Scorecard...
        </span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4">
        <GlassCard className="p-8 space-y-4">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-[#F8FAFC]">Interview Report Not Found</h2>
          <p className="text-xs text-[#94A3B8]">{error || 'Unable to access this session report.'}</p>
          <Link to="/mock-interview">
            <GradientButton variant="primary" size="sm">
              Back to Interview Dashboard
            </GradientButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const overall = session.overallScore || 0;
  const technical = session.technicalScore || 0;
  const communication = session.communicationScore || 0;
  const relevance = session.relevanceScore || 0;
  const questions = session.questions || [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/mock-interview"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Start New Mock Interview</span>
        </Link>
        <Link to="/mock-interview/history">
          <GradientButton variant="glass" size="xs" icon={History}>
            View All Past Sessions
          </GradientButton>
        </Link>
      </div>

      {/* Main Performance Header Banner */}
      <GlassCard className="p-6 sm:p-8 space-y-6" glowVariant="violet">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3.5 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <GlowBadge variant="violet" size="sm" icon={Bot}>
                Target: {session.targetRole}
              </GlowBadge>
              <GlowBadge variant="cyan" size="sm">Type: {session.type}</GlowBadge>
              <GlowBadge variant="emerald" size="sm">Difficulty: {session.difficulty}</GlowBadge>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">
              AI Interview Evaluation Report
            </h1>

            <p className="text-xs sm:text-sm text-[#CBD5E1] leading-relaxed max-w-2xl">
              Session completed on {new Date(session.completedAt || session.updatedAt).toLocaleDateString()}. Evaluated across {session.questionCount} dynamic role drill questions.
            </p>
          </div>

          <div className="flex items-center justify-center shrink-0">
            <div className="flex flex-col items-center">
              <ProgressRing value={overall * 10} size={130} strokeWidth={9} glowColor="#8B5CF6">
                <div className="flex flex-col items-center">
                  <span className="text-3xl font-black text-[#F8FAFC] tracking-tighter">
                    {overall.toFixed(1)}
                  </span>
                  <span className="text-[9px] text-[#94A3B8] uppercase tracking-widest font-black -mt-1">
                    out of 10
                  </span>
                </div>
              </ProgressRing>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/[0.08]">
          <GlassCard className="p-4 space-y-1 bg-[rgba(10,12,25,0.7)] border-white/[0.08]" glowVariant="cyan">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-bold flex items-center gap-1.5">
                <Code className="w-3.5 h-3.5 text-[#06B6D4]" />
                Technical Accuracy
              </span>
              <span className="font-bold text-[#F8FAFC]">{technical.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#06B6D4] h-full rounded-full transition-all duration-500"
                style={{ width: `${technical * 10}%` }}
              />
            </div>
          </GlassCard>

          <GlassCard className="p-4 space-y-1 bg-[rgba(10,12,25,0.7)] border-white/[0.08]" glowVariant="violet">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-bold flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#A78BFA]" />
                Communication Clarity
              </span>
              <span className="font-bold text-[#F8FAFC]">{communication.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#A78BFA] h-full rounded-full transition-all duration-500"
                style={{ width: `${communication * 10}%` }}
              />
            </div>
          </GlassCard>

          <GlassCard className="p-4 space-y-1 bg-[rgba(10,12,25,0.7)] border-white/[0.08]" glowVariant="pink">
            <div className="flex items-center justify-between text-xs text-[#94A3B8]">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#EC4899]" />
                Role Relevance
              </span>
              <span className="font-bold text-[#F8FAFC]">{relevance.toFixed(1)}/10</span>
            </div>
            <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className="bg-[#EC4899] h-full rounded-full transition-all duration-500"
                style={{ width: `${relevance * 10}%` }}
              />
            </div>
          </GlassCard>
        </div>
      </GlassCard>

      {/* Question-by-Question Detailed Drill Breakdown */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-[#8B5CF6]" />
          <h2 className="text-base sm:text-lg font-black text-[#F8FAFC]">
            Question-by-Question AI Analysis ({questions.length})
          </h2>
        </div>

        <div className="space-y-4">
          {questions.map((q, idx) => {
            const ans = q.answer;
            const isSkipped = ans?.isSkipped;
            const score = ans ? ans.score || 0 : 0;
            const isIdealShown = expandedIdeal[idx];

            return (
              <GlassCard
                key={q.id}
                className="p-6 space-y-5 transition-all duration-200"
                glowVariant={score >= 7 ? 'green' : score >= 4 ? 'amber' : 'pink'}
              >
                {/* Question Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center text-xs font-black text-[#06B6D4]">
                      Q{idx + 1}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <GlowBadge variant="cyan" size="xs">{q.category || session.type}</GlowBadge>
                      <GlowBadge variant="violet" size="xs">{q.difficulty || session.difficulty}</GlowBadge>
                      {isSkipped && <GlowBadge variant="pink" size="xs">Skipped</GlowBadge>}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-[#F8FAFC]">
                      {isSkipped ? '0.0' : score.toFixed(1)}
                      <span className="text-[10px] text-[#64748B] font-normal"> / 10</span>
                    </span>
                  </div>
                </div>

                {/* Question Prompt */}
                <div className="space-y-1">
                  <p className="text-xs sm:text-sm font-bold text-[#F8FAFC] leading-relaxed">
                    "{q.questionText}"
                  </p>
                </div>

                {/* Candidate Typed Answer */}
                {ans && (
                  <div className="p-4 bg-[rgba(10,12,25,0.7)] rounded-2xl border border-white/[0.08] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold text-[#94A3B8] tracking-widest">
                        Your Submitted Answer:
                      </span>
                      {ans.wordCount ? (
                        <span className="text-[10px] text-[#64748B]">{ans.wordCount} words</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-[#E2E8F0] leading-relaxed italic">
                      "{ans.answerText}"
                    </p>
                  </div>
                )}

                {/* AI Constructive Feedback */}
                {ans && (
                  <div className="space-y-4">
                    <div className="p-4 bg-[rgba(10,12,25,0.6)] rounded-2xl border border-white/[0.06] space-y-1.5">
                      <span className="text-[10px] font-bold text-[#06B6D4] uppercase tracking-widest block">
                        AI Evaluator Feedback
                      </span>
                      <p className="text-xs text-[#CBD5E1] leading-relaxed">
                        {ans.feedback}
                      </p>
                    </div>

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-1.5">
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Strengths
                        </span>
                        <ul className="text-xs text-[#CBD5E1] space-y-1 list-disc list-inside">
                          {(Array.isArray(ans.strengths) ? ans.strengths : []).map((s, sIdx) => (
                            <li key={sIdx}>{s}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3.5 bg-rose-500/5 rounded-xl border border-rose-500/20 space-y-1.5">
                        <span className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> Growth Areas
                        </span>
                        <ul className="text-xs text-[#CBD5E1] space-y-1 list-disc list-inside">
                          {(Array.isArray(ans.weaknesses) ? ans.weaknesses : []).map((w, wIdx) => (
                            <li key={wIdx}>{w}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Benchmark Ideal Answer Accordion */}
                    {ans.idealAnswer && (
                      <div className="pt-2">
                        <button
                          onClick={() => toggleIdeal(idx)}
                          className="flex items-center gap-2 text-xs font-bold text-[#8B5CF6] hover:text-[#A78BFA] transition-colors"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>{isIdealShown ? 'Hide Benchmark Answer' : 'View Benchmark Ideal Answer'}</span>
                        </button>

                        {isIdealShown && (
                          <div className="mt-2.5 p-4 bg-[#070714] rounded-2xl border border-[#8B5CF6]/30 text-xs text-[#E2E8F0] leading-relaxed space-y-1 animate-fade-in">
                            <span className="text-[10px] font-mono text-[#A78BFA] uppercase tracking-widest block">
                              Model Benchmark Response:
                            </span>
                            <p>{ans.idealAnswer}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      </div>
    </div>
  );
}
