import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Layers,
  Users,
  Send,
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { getUserApplicationByIdApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlowBadge from '../components/ui/GlowBadge';
import GradientButton from '../components/ui/GradientButton';
import ProgressRing from '../components/ui/ProgressRing';
import AIOrb from '../components/ui/AIOrb';

const STATUS_STEPS = [
  { key: 'SUBMITTED', label: '1. Submitted' },
  { key: 'UNDER_REVIEW', label: '2. Under Review' },
  { key: 'SHORTLISTED', label: '3. Shortlisted' },
  { key: 'INTERVIEW', label: '4. Interview' },
  { key: 'SELECTED', label: '5. Decision' },
];

const STATUS_INDEX = {
  SUBMITTED: 0,
  UNDER_REVIEW: 1,
  SHORTLISTED: 2,
  INTERVIEW: 3,
  SELECTED: 4,
  REJECTED: 4,
};

const STATUS_DETAILS = {
  SUBMITTED: { label: 'Application Submitted', variant: 'violet', glow: 'violet' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'cyan', glow: 'cyan' },
  SHORTLISTED: { label: 'Shortlisted for Next Round', variant: 'green', glow: 'green' },
  INTERVIEW: { label: 'Interview Stage', variant: 'amber', glow: 'amber' },
  SELECTED: { label: 'Selected / Offer Extended', variant: 'green', glow: 'green' },
  REJECTED: { label: 'Application Not Selected', variant: 'pink', glow: 'pink' },
};

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    getUserApplicationByIdApi(id)
      .then((data) => {
        if (isMounted && data.success) {
          setApplication(data.application);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load application details.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <AIOrb size="md" state="thinking" showIcon={false} />
        <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
          Retrieving Application History...
        </span>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-4 animate-fade-in">
        <GlassCard className="p-8 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/20 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-[#F8FAFC]">
            {error || 'Application record not found'}
          </h2>
          <Link to="/applications">
            <GradientButton variant="primary" size="sm" icon={ArrowLeft}>
              Back to My Applications
            </GradientButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const statusConfig = STATUS_DETAILS[application.status] || STATUS_DETAILS.SUBMITTED;
  const currentStepIdx = STATUS_INDEX[application.status] ?? 0;
  const isRejected = application.status === 'REJECTED';
  const score = application.matchScore || application.jobOptimization?.matchScore;
  const statusHistory = Array.isArray(application.statusHistory) ? application.statusHistory : [];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in py-4 pb-20">
      {/* 1. Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/applications"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Applications Feed</span>
        </Link>

        <span className="text-xs font-mono text-[#94A3B8] bg-white/[0.05] px-3 py-1 rounded-lg border border-white/[0.08]">
          APP ID: #EVA-{application.id.substring(0, 8).toUpperCase()}
        </span>
      </div>

      {/* 2. Main Status Banner */}
      <GlassCard className="p-6 sm:p-8 space-y-6" glowVariant={statusConfig.glow}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <GlowBadge variant={statusConfig.variant} size="sm">
                {statusConfig.label}
              </GlowBadge>
              <span className="text-xs font-mono text-[#94A3B8] bg-white/[0.05] px-2.5 py-0.5 rounded-md border border-white/[0.06]">
                {application.job?.workMode || 'REMOTE'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
              {application.job?.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5 font-bold text-[#F8FAFC]">
                <Building2 className="w-4 h-4 text-[#8B5CF6]" />
                {application.job?.companyName}
              </span>
              {application.job?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-[#06B6D4]" />
                  {application.job?.location}
                </span>
              )}
              <span className="flex items-center gap-1.5 text-[#64748B]">
                <Calendar className="w-3.5 h-3.5" />
                Submitted on {new Date(application.submittedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {score && (
            <div className="shrink-0 flex items-center gap-4 bg-[rgba(10,12,25,0.7)] p-4 rounded-2xl border border-white/[0.08]">
              <ProgressRing
                score={score}
                max={100}
                size={70}
                strokeWidth={7}
                colorScheme="cyan"
              />
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8]">ATS Alignment</span>
                <div className="text-base font-bold text-[#F8FAFC]">{score}% Match</div>
                {application.jobOptimizationId && (
                  <Link
                    to={`/job-optimization/${application.jobOptimizationId}`}
                    className="text-[11px] text-[#06B6D4] hover:underline font-semibold block"
                  >
                    View AI Report →
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Visual Progression Stepper */}
        <div className="pt-4 border-t border-white/[0.08] space-y-3">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#94A3B8]">
            Application Journey
          </div>

          {isRejected ? (
            <div className="p-4 rounded-xl bg-[#EC4899]/10 border border-[#EC4899]/20 text-xs text-[#F472B6] flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-[#EC4899]" />
              <div>
                <span className="font-bold block text-[#F8FAFC]">Application Process Concluded</span>
                <span>The recruitment team has decided not to proceed with this application at this time.</span>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const isPassed = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      isCurrent && step.key === 'SELECTED'
                        ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                        : isCurrent
                        ? 'border-[#06B6D4] bg-[#06B6D4]/15 shadow-[0_0_15px_rgba(6,182,212,0.25)] text-[#F8FAFC]'
                        : isPassed
                        ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#34D399]'
                        : 'border-white/[0.06] bg-white/[0.02] text-[#64748B]'
                    }`}
                  >
                    <div className="text-xs font-bold">{step.label}</div>
                    <div className="text-[10px] mt-1 font-mono">
                      {isCurrent && step.key === 'SELECTED'
                        ? 'Selected 🎉'
                        : isCurrent
                        ? 'Current'
                        : isPassed
                        ? 'Completed ✓'
                        : 'Upcoming'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </GlassCard>

      {/* 4. Two Column Layout: Resume + Job Snapshot */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submitted Resume Info */}
        <GlassCard className="p-6 space-y-4" glowVariant="violet">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <FileText className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Attached Resume</h3>
          </div>

          <div className="p-4 bg-[rgba(10,12,25,0.7)] border border-white/[0.08] rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#F8FAFC] truncate">
                {application.resume?.originalFileName || 'Resume Document'}
              </span>
              <GlowBadge variant="cyan" size="xs">
                {application.resume?.fileType?.toUpperCase() || 'PDF'}
              </GlowBadge>
            </div>
            <p className="text-[11px] text-[#64748B] font-mono">
              Size: {application.resume?.fileSize ? `${(application.resume.fileSize / 1024).toFixed(1)} KB` : 'Standard'}
            </p>
          </div>

          {application.coverLetter && (
            <div className="space-y-1.5 pt-2">
              <span className="text-[11px] font-bold text-[#94A3B8] uppercase">
                Submitted Cover Letter / Note
              </span>
              <div className="p-3.5 bg-[rgba(10,12,25,0.6)] border border-white/[0.06] rounded-xl text-xs text-[#CBD5E1] whitespace-pre-line leading-relaxed">
                {application.coverLetter}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Job Overview */}
        <GlassCard className="p-6 space-y-4" glowVariant="cyan">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#06B6D4]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Role Requirements</h3>
            </div>
            <Link
              to={`/jobs/${application.job?.id}`}
              className="text-xs font-semibold text-[#06B6D4] hover:underline flex items-center gap-1"
            >
              <span>Full Job Post</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="space-y-3">
            <div className="text-xs text-[#CBD5E1] line-clamp-4 leading-relaxed">
              {application.job?.description}
            </div>

            {Array.isArray(application.job?.requiredSkills) && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-bold text-[#94A3B8] uppercase">
                  Required Core Skills
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {application.job.requiredSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-[11px] rounded-lg bg-[#8B5CF6]/15 text-[#C4B5FD] border border-[#8B5CF6]/30 font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* 5. Status Change Audit Trail */}
      {statusHistory.length > 0 && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <Clock className="w-4 h-4 text-[#06B6D4]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
              Status Updates & Notes History
            </h3>
          </div>

          <div className="space-y-3">
            {statusHistory.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3.5 bg-[rgba(10,12,25,0.7)] border border-white/[0.06] rounded-xl flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F8FAFC]">
                      {STATUS_DETAILS[item.newStatus]?.label || item.newStatus}
                    </span>
                    {item.oldStatus && (
                      <span className="text-[10px] text-[#64748B]">
                        (Previous: {STATUS_DETAILS[item.oldStatus]?.label || item.oldStatus})
                      </span>
                    )}
                  </div>
                  {item.note && (
                    <p className="text-xs text-[#94A3B8] leading-relaxed italic">
                      "{item.note}"
                    </p>
                  )}
                </div>

                <span className="text-[10px] text-[#64748B] font-mono shrink-0">
                  {new Date(item.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
