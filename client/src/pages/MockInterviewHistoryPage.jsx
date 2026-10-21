import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  History,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { getInterviewsApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import PageHeader from '../components/ui/PageHeader';
import AIOrb from '../components/ui/AIOrb';

export default function MockInterviewHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getInterviewsApi()
      .then((data) => {
        if (data.success) {
          setSessions(data.sessions || []);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load interview history');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          icon={History}
          title="Interview Session History"
          description="Review past mock interview drill scores, question answers, and constructive feedback."
        />
        <Link to="/mock-interview" className="shrink-0">
          <GradientButton variant="primary" size="sm" icon={Bot}>
            New Mock Interview
          </GradientButton>
        </Link>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <AIOrb size="md" state="thinking" showIcon={false} />
          <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
            Loading Interview Records...
          </span>
        </div>
      ) : sessions.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center mx-auto text-[#64748B]">
            <Bot className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#F8FAFC]">No Mock Interviews Completed Yet</h3>
            <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
              Test your technical and behavioral responses with AI-generated role questions and get detailed scoring.
            </p>
          </div>
          <Link to="/mock-interview">
            <GradientButton variant="primary" size="sm" icon={Bot}>
              Start Mock Interview
            </GradientButton>
          </Link>
        </GlassCard>
      ) : (
        <div className="bg-[rgba(20,20,40,0.65)] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl divide-y divide-white/[0.08] backdrop-blur-xl">
          {sessions.map((item) => {
            const overall = item.overallScore;
            const isCompleted = item.status === 'COMPLETED';

            return (
              <div
                key={item.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-white/[0.04] transition-colors"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                      Target: {item.targetRole}
                    </span>
                    <GlowBadge variant="violet" size="xs">{item.type}</GlowBadge>
                    <GlowBadge variant="cyan" size="xs">{item.difficulty}</GlowBadge>

                    {isCompleted ? (
                      <GlowBadge variant={overall >= 7 ? 'green' : overall >= 5 ? 'cyan' : 'pink'} size="xs">
                        Score: {overall}/10
                      </GlowBadge>
                    ) : (
                      <GlowBadge variant={item.status === 'IN_PROGRESS' ? 'amber' : 'pink'} size="xs">
                        {item.status?.replace('_', ' ')}
                      </GlowBadge>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#94A3B8]">
                    <span>{item.questionCount} Questions</span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">{new Date(item.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    to={isCompleted ? `/mock-interview/${item.id}/result` : `/mock-interview/${item.id}`}
                  >
                    <GradientButton variant="glass" size="xs" icon={ArrowRight} iconPosition="right">
                      {isCompleted ? 'View Performance Report' : 'Resume Interview'}
                    </GradientButton>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
