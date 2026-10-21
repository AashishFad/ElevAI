import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Users,
  GraduationCap,
  Sparkles,
  AlertCircle,
  Clock,
  Share2,
  FileCheck2,
} from 'lucide-react';
import {
  getAdminJobByIdApi,
  updateAdminJobStatusApi,
  deleteAdminJobApi,
  getJobApplicationStatsApi,
} from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GlowBadge from '../../components/ui/GlowBadge';
import GradientButton from '../../components/ui/GradientButton';
import AIOrb from '../../components/ui/AIOrb';

export default function AdminJobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState('');

  // Status updating state
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchJob = async () => {
    setLoading(true);
    setError(null);
    try {
      const [jobRes, statsRes] = await Promise.all([
        getAdminJobByIdApi(id),
        getJobApplicationStatsApi(id).catch(() => null),
      ]);

      if (jobRes.success && jobRes.job) {
        setJob(jobRes.job);
      } else {
        setError(jobRes.message || 'Job requisition not found');
      }

      if (statsRes && statsRes.success) {
        setAppStats(statsRes.stats);
      }
    } catch (err) {
      setError(err.message || 'Error fetching job details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    setUpdatingStatus(true);
    try {
      const res = await updateAdminJobStatusApi(id, newStatus);
      if (res.success && res.job) {
        setJob(res.job);
        setActionSuccess(res.message || 'Status updated successfully');
        setTimeout(() => setActionSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update job status');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteAdminJobApi(id);
      if (res.success) {
        navigate('/admin/jobs');
      }
    } catch (err) {
      setError(err.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const formatSalary = (min, max, visible) => {
    if (!visible) return 'Not publicly displayed';
    if (!min && !max) return 'Competitive / Disclosed on interview';
    if (min && max) return `₹${min.toLocaleString()} – ₹${max.toLocaleString()} / year`;
    if (min) return `From ₹${min.toLocaleString()} / year`;
    return `Up to ₹${max.toLocaleString()} / year`;
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
            <span className="w-2 h-2 rounded-full bg-[#34D399] animate-pulse" />
            PUBLISHED (LIVE)
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30">
            <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
            DRAFT (HIDDEN)
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30">
            <span className="w-2 h-2 rounded-full bg-[#F87171]" />
            CLOSED (ARCHIVED)
          </span>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <AIOrb size="md" state="thinking" showIcon={false} />
        <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
          Loading Job Requisition...
        </span>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center space-y-4">
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          {error || 'Job not found'}
        </div>
        <Link to="/admin/jobs">
          <GradientButton variant="glass" size="sm" icon={ArrowLeft}>
            Back to Jobs
          </GradientButton>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* 1. Top Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Job Management</span>
        </Link>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {job.status === 'DRAFT' ? (
            <GradientButton
              variant="primary"
              size="sm"
              icon={Sparkles}
              loading={updatingStatus}
              onClick={() => handleStatusChange('PUBLISHED')}
            >
              Publish Job
            </GradientButton>
          ) : job.status === 'PUBLISHED' ? (
            <>
              <button
                onClick={() => handleStatusChange('DRAFT')}
                disabled={updatingStatus}
                className="px-3.5 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
              >
                Move to Draft
              </button>
              <button
                onClick={() => handleStatusChange('CLOSED')}
                disabled={updatingStatus}
                className="px-3.5 py-1.5 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/30 text-xs font-semibold text-[#F87171] transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Close Job</span>
              </button>
            </>
          ) : (
            <GradientButton
              variant="primary"
              size="sm"
              icon={CheckCircle2}
              loading={updatingStatus}
              onClick={() => handleStatusChange('PUBLISHED')}
            >
              Reopen & Publish
            </GradientButton>
          )}

          <Link to={`/admin/jobs/${job.id}/edit`}>
            <GradientButton variant="glass" size="sm" icon={Edit}>
              Edit Requisition
            </GradientButton>
          </Link>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
            title="Delete Job"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{actionSuccess}</span>
        </div>
      )}

      {/* 2. Hero Header Card */}
      <GlassCard glowVariant="violet" className="p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              {getStatusBadge(job.status)}
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.06] text-[#94A3B8]">
                {job.workMode}
              </span>
              <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-white/[0.06] text-[#94A3B8]">
                {job.employmentType?.replace('_', ' ')}
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#F8FAFC] tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#94A3B8]">
              <span className="flex items-center gap-1.5 font-bold text-[#F8FAFC] text-sm">
                <Building2 className="w-4 h-4 text-[#8B5CF6]" />
                {job.companyName}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#06B6D4]" />
                {job.location}
              </span>
              <span className="flex items-center gap-1.5 text-[#10B981] font-semibold">
                {formatSalary(job.salaryMin, job.salaryMax, job.salaryVisible)}
              </span>
            </div>
          </div>

          <div className="text-left md:text-right text-xs text-[#64748B] space-y-1">
            <div>Created: {new Date(job.createdAt).toLocaleDateString()}</div>
            {job.publishedAt && (
              <div className="text-[#10B981]">
                Published: {new Date(job.publishedAt).toLocaleDateString()}
              </div>
            )}
            {job.closedAt && (
              <div className="text-[#F87171]">
                Closed: {new Date(job.closedAt).toLocaleDateString()}
              </div>
            )}
            {job.creator && <div>Created by: {job.creator.name}</div>}
          </div>
        </div>
      </GlassCard>

      {/* 3. Specs & Metadata Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <GlassCard className="p-4">
          <div className="text-[10px] font-semibold uppercase text-[#64748B] mb-1">
            Experience Tier
          </div>
          <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-[#8B5CF6]" />
            <span>{job.experienceRequired}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-[10px] font-semibold uppercase text-[#64748B] mb-1">
            Open Positions
          </div>
          <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#06B6D4]" />
            <span>{job.openings} opening{job.openings > 1 ? 's' : ''}</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-[10px] font-semibold uppercase text-[#64748B] mb-1">
            Application Deadline
          </div>
          <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#EC4899]" />
            <span>
              {job.applicationDeadline
                ? new Date(job.applicationDeadline).toLocaleDateString()
                : 'Rolling Basis'}
            </span>
          </div>
        </GlassCard>

        <GlassCard className="p-4">
          <div className="text-[10px] font-semibold uppercase text-[#64748B] mb-1">
            Education Requirement
          </div>
          <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-1.5 truncate">
            <GraduationCap className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
            <span className="truncate">{job.educationRequirement || 'Not Specified'}</span>
          </div>
        </GlassCard>
      </div>

      {/* 4. Candidate Applications Pipeline (Phase 4) */}
      <GlassCard className="p-6 space-y-4" glowVariant="cyan">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-[#06B6D4]" />
            <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
              Candidate Applications Pipeline
            </h2>
            <GlowBadge variant="cyan" size="xs">
              {appStats?.TOTAL ?? 0} Total
            </GlowBadge>
          </div>

          <Link to={`/admin/applications?jobId=${job.id}`}>
            <GradientButton variant="primary" size="xs" icon={ArrowRight}>
              View Candidate Applications ({appStats?.TOTAL ?? 0})
            </GradientButton>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          <div className="p-3 bg-[rgba(10,12,25,0.7)] rounded-xl border border-white/[0.06] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Submitted</div>
            <div className="text-base font-bold text-[#8B5CF6] mt-0.5">{appStats?.SUBMITTED ?? 0}</div>
          </div>
          <div className="p-3 bg-[rgba(10,12,25,0.7)] rounded-xl border border-white/[0.06] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Under Review</div>
            <div className="text-base font-bold text-[#06B6D4] mt-0.5">{appStats?.UNDER_REVIEW ?? 0}</div>
          </div>
          <div className="p-3 bg-[rgba(10,12,25,0.7)] rounded-xl border border-white/[0.06] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Shortlisted</div>
            <div className="text-base font-bold text-[#22D3A7] mt-0.5">{appStats?.SHORTLISTED ?? 0}</div>
          </div>
          <div className="p-3 bg-[rgba(10,12,25,0.7)] rounded-xl border border-white/[0.06] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Interview</div>
            <div className="text-base font-bold text-[#F59E0B] mt-0.5">{appStats?.INTERVIEW ?? 0}</div>
          </div>
          <div className="p-3 bg-[rgba(10,12,25,0.7)] rounded-xl border border-white/[0.06] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Selected</div>
            <div className="text-base font-bold text-[#10B981] mt-0.5">{appStats?.SELECTED ?? 0}</div>
          </div>
          <div className="p-3 bg-[rgba(10,12,25,0.7)] rounded-xl border border-white/[0.06] text-center">
            <div className="text-[10px] text-[#94A3B8] uppercase font-semibold">Rejected</div>
            <div className="text-base font-bold text-[#EC4899] mt-0.5">{appStats?.REJECTED ?? 0}</div>
          </div>
        </div>
      </GlassCard>

      {/* 5. Skills Taxonomy */}
      <GlassCard className="p-6 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <Sparkles className="w-4 h-4 text-[#8B5CF6]" />
          Required & Preferred Technical Skills
        </h2>

        {/* Required Skills */}
        <div>
          <div className="text-xs font-semibold text-[#94A3B8] mb-2">
            Mandatory Core Skills:
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 ? (
              job.requiredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 text-xs font-mono text-[#C084FC] shadow-[0_0_10px_rgba(139,92,246,0.15)]"
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-xs text-[#64748B]">None specified</span>
            )}
          </div>
        </div>

        {/* Preferred Skills */}
        {Array.isArray(job.preferredSkills) && job.preferredSkills.length > 0 && (
          <div className="pt-2">
            <div className="text-xs font-semibold text-[#94A3B8] mb-2">
              Preferred / Nice-to-Have:
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {job.preferredSkills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-xl bg-[#06B6D4]/15 border border-[#06B6D4]/30 text-xs font-mono text-[#38BDF8]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </GlassCard>

      {/* 5. Complete Job Description */}
      <GlassCard className="p-6 sm:p-8 space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] border-b border-white/[0.08] pb-3">
          Role Overview & Full Description
        </h2>
        <div className="prose prose-invert max-w-none text-xs text-[#CBD5E1] leading-relaxed whitespace-pre-line font-sans">
          {job.description}
        </div>
      </GlassCard>

      {/* 6. Applicant Pipeline Status Banner */}
      <GlassCard glowVariant="amber" className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/30">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F8FAFC] flex items-center gap-2">
                <span>Candidate Pipeline</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B]">
                  Phase 3
                </span>
              </div>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Total Applications: <strong className="text-white">0</strong>. Direct student applications and AI resume matching scorecards will connect to this job in Phase 3.
              </p>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* 7. Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0D1020] border border-red-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Delete Job Requisition?</h3>
                <p className="text-xs text-[#94A3B8]">
                  "{job.title}" at {job.companyName}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              This action cannot be undone and will permanently remove this opportunity from the system.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                {deleting ? 'Deleting...' : 'Delete Job'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
