import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users,
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
  Download,
  ExternalLink,
  Edit3,
  Layers,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  User,
  Mail,
  Lock,
  MessageSquare,
  Trash2,
  Plus,
} from 'lucide-react';
import {
  getAdminApplicationByIdApi,
  updateApplicationStatusApi,
  getAdminResumeSecureUrlApi,
  addAdminNoteApi,
  deleteAdminNoteApi,
} from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GlowBadge from '../../components/ui/GlowBadge';
import GradientButton from '../../components/ui/GradientButton';
import ProgressRing from '../../components/ui/ProgressRing';
import Textarea from '../../components/ui/Textarea';
import Alert from '../../components/ui/Alert';
import AIOrb from '../../components/ui/AIOrb';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', variant: 'violet', glow: 'violet' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'cyan', glow: 'cyan' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'green', glow: 'green' },
  INTERVIEW: { label: 'Interview', variant: 'amber', glow: 'amber' },
  SELECTED: { label: 'Selected', variant: 'green', glow: 'green' },
  REJECTED: { label: 'Rejected', variant: 'pink', glow: 'pink' },
};

const PIPELINE_STAGES = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

export default function AdminApplicationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Status Change form state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [recruiterNote, setRecruiterNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Confirmation modal state for Rejection
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Private Admin Notes state
  const [adminNoteText, setAdminNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  // Resume Download / Text Viewer state
  const [downloadingResume, setDownloadingResume] = useState(false);
  const [showResumeText, setShowResumeText] = useState(false);

  const fetchApplicationDetails = () => {
    return getAdminApplicationByIdApi(id)
      .then((data) => {
        if (data.success) {
          setApplication(data.application);
          setSelectedStatus(data.application.status);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to load application details.');
      });
  };

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    fetchApplicationDetails().finally(() => {
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusUpdate = async (overrideStatus) => {
    const targetStatus = overrideStatus || selectedStatus;
    if (!targetStatus) return;

    if (targetStatus === 'REJECTED' && !overrideStatus) {
      setShowRejectModal(true);
      return;
    }

    setUpdating(true);
    setUpdateSuccess('');
    setError('');

    try {
      const res = await updateApplicationStatusApi(id, {
        status: targetStatus,
        note: recruiterNote.trim() || undefined,
      });

      if (res.success && res.application) {
        setApplication(res.application);
        setSelectedStatus(res.application.status);
        setUpdateSuccess(`Application status successfully updated to ${STATUS_CONFIG[targetStatus]?.label || targetStatus}!`);
        setRecruiterNote('');
        setShowRejectModal(false);
        setTimeout(() => setUpdateSuccess(''), 4000);
      }
    } catch (err) {
      setError(err.message || 'Failed to update application status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAddAdminNote = async (e) => {
    e.preventDefault();
    if (!adminNoteText.trim()) return;

    setAddingNote(true);
    try {
      const res = await addAdminNoteApi(id, { note: adminNoteText.trim() });
      if (res.success && res.note) {
        setApplication((prev) => ({
          ...prev,
          adminNotes: [res.note, ...(prev.adminNotes || [])],
        }));
        setAdminNoteText('');
      }
    } catch (err) {
      alert(err.message || 'Failed to add admin note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleDeleteAdminNote = async (noteId) => {
    if (!window.confirm('Delete this private admin note?')) return;

    setDeletingNoteId(noteId);
    try {
      const res = await deleteAdminNoteApi(noteId);
      if (res.success) {
        setApplication((prev) => ({
          ...prev,
          adminNotes: (prev.adminNotes || []).filter((n) => n.id !== noteId),
        }));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete note.');
    } finally {
      setDeletingNoteId(null);
    }
  };

  const handleSecureResumeDownload = async () => {
    if (!application?.resume?.id) return;
    setDownloadingResume(true);
    try {
      const res = await getAdminResumeSecureUrlApi(application.resume.id);
      if (res.success && res.signedUrl) {
        window.open(res.signedUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (err) {
      alert(err.message || 'Failed to generate secure resume download link.');
    } finally {
      setDownloadingResume(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <AIOrb size="md" state="thinking" showIcon={false} />
        <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
          Loading Candidate Dossier...
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
          <Link to="/admin/applications">
            <GradientButton variant="primary" size="sm" icon={ArrowLeft}>
              Back to Applications List
            </GradientButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  const statusConfig = STATUS_CONFIG[application.status] || STATUS_CONFIG.SUBMITTED;
  const score = application.matchScore || application.jobOptimization?.matchScore;
  const statusHistory = Array.isArray(application.statusHistory) ? application.statusHistory : [];
  const adminNotes = Array.isArray(application.adminNotes) ? application.adminNotes : [];
  const optimization = application.jobOptimization;

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in py-4 pb-20">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/admin/applications"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Candidate Pipeline</span>
        </Link>

        <span className="text-xs font-mono text-[#94A3B8] bg-white/[0.05] px-3 py-1 rounded-lg border border-white/[0.08]">
          APP ID: #EVA-{application.id.substring(0, 8).toUpperCase()}
        </span>
      </div>

      {updateSuccess && (
        <Alert variant="success" title="Success">
          {updateSuccess}
        </Alert>
      )}

      {/* Pipeline Stage Bar */}
      <GlassCard className="p-4 sm:p-5" glowVariant={statusConfig.glow}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#94A3B8] font-bold">
            Candidate Hiring Pipeline
          </span>
          <span className="text-xs font-mono text-[#CBD5E1]">
            Current Stage: <span className="font-bold text-[#F8FAFC]">{statusConfig.label}</span>
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {PIPELINE_STAGES.map((stg, idx) => {
            const isCurrent = application.status === stg;
            const isPassed =
              application.status !== 'REJECTED' &&
              PIPELINE_STAGES.indexOf(application.status) > idx;
            const isSelectedStage = application.status === 'SELECTED' && stg === 'SELECTED';
            const isRejected = application.status === 'REJECTED';

            return (
              <div
                key={stg}
                className={`p-2.5 rounded-xl border text-center transition-all ${
                  isSelectedStage
                    ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.35)]'
                    : isCurrent
                    ? 'bg-[#8B5CF6]/25 border-[#8B5CF6] text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]'
                    : isPassed
                    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#34D399]'
                    : isRejected
                    ? 'bg-white/[0.02] border-white/[0.04] text-[#64748B] opacity-50'
                    : 'bg-white/[0.02] border-white/[0.06] text-[#64748B]'
                }`}
              >
                <span className="text-[10px] font-mono block text-[#94A3B8]">
                  Step {idx + 1}
                </span>
                <span
                  className={`text-xs font-bold ${
                    isSelectedStage
                      ? 'text-emerald-300'
                      : isCurrent
                      ? 'text-white'
                      : isPassed
                      ? 'text-[#34D399]'
                      : 'text-[#CBD5E1]'
                  }`}
                >
                  {(isPassed || isSelectedStage) && <span className="mr-1">✓</span>}
                  {STATUS_CONFIG[stg]?.label || stg}
                </span>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* Hero Overview Card */}
      <GlassCard className="p-6 sm:p-8 space-y-6" glowVariant={statusConfig.glow}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Candidate Snapshot */}
          <div className="space-y-3 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <GlowBadge variant={statusConfig.variant} size="sm">
                {statusConfig.label}
              </GlowBadge>
              <span className="text-xs font-mono text-[#94A3B8] bg-white/[0.05] px-2.5 py-0.5 rounded-md border border-white/[0.06]">
                Applied: {new Date(application.submittedAt).toLocaleDateString()}
              </span>
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
                {application.user?.name}
              </h1>
              <p className="text-xs text-[#94A3B8] flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#8B5CF6]" />
                  {application.user?.email}
                </span>
                {application.user?.careerGoal?.targetRole && (
                  <span className="flex items-center gap-1 font-semibold text-[#06B6D4]">
                    <User className="w-3.5 h-3.5" />
                    Target: {application.user.careerGoal.targetRole}
                  </span>
                )}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-xs flex items-center gap-2 text-[#CBD5E1]">
              <Briefcase className="w-4 h-4 text-[#06B6D4]" />
              <span>Applied for: </span>
              <span className="font-bold text-[#F8FAFC]">{application.job?.title}</span>
              <span className="text-[#94A3B8]">at {application.job?.companyName}</span>
            </div>
          </div>

          {/* AI Match Score Display */}
          {score && (
            <div className="shrink-0 flex items-center gap-4 bg-[rgba(10,12,25,0.7)] p-4 rounded-2xl border border-white/[0.08]">
              <ProgressRing
                score={score}
                max={100}
                size={80}
                strokeWidth={8}
                colorScheme={score >= 75 ? 'green' : score >= 55 ? 'cyan' : 'pink'}
              />
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-bold text-[#94A3B8]">AI Match Score</span>
                <div className="text-lg font-bold text-[#F8FAFC]">{score}%</div>
                <span className="text-[10px] text-[#22D3A7] font-semibold">
                  {score >= 75 ? 'High Alignment' : score >= 55 ? 'Moderate Fit' : 'Low Match'}
                </span>
              </div>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Recruiter Status Action Panel */}
      <GlassCard className="p-6 space-y-4" glowVariant="violet">
        <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
          <Edit3 className="w-4 h-4 text-[#8B5CF6]" />
          <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
            Update Recruitment Stage & Candidate Status
          </h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleStatusUpdate(); }} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F8FAFC]">Change Status to:</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-[rgba(10,12,25,0.8)] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 cursor-pointer"
              >
                <option value="SUBMITTED">Submitted (Initial)</option>
                <option value="UNDER_REVIEW">Under Review</option>
                <option value="SHORTLISTED">Shortlisted for Next Round</option>
                <option value="INTERVIEW">Interview Scheduled / In Progress</option>
                <option value="SELECTED">Selected / Offer Extended</option>
                <option value="REJECTED">Not Selected / Rejected</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#F8FAFC]">
                Audit Note (Recorded in History & Candidate Notification)
              </label>
              <input
                type="text"
                placeholder="e.g. Cleared technical screening, scheduled panel interview..."
                value={recruiterNote}
                onChange={(e) => setRecruiterNote(e.target.value)}
                className="w-full bg-[rgba(10,12,25,0.8)] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <GradientButton
              type="submit"
              variant="primary"
              size="sm"
              loading={updating}
              disabled={updating || selectedStatus === application.status}
              icon={CheckCircle2}
            >
              Update Application Status
            </GradientButton>
          </div>
        </form>
      </GlassCard>

      {/* 2-Column Details: Resume & AI Evaluation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Candidate Resume & Cover Letter */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4" glowVariant="cyan">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#06B6D4]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                  Candidate Resume Document
                </h3>
              </div>
              <GlowBadge variant="cyan" size="xs">
                {application.resume?.fileType?.toUpperCase() || 'PDF'}
              </GlowBadge>
            </div>

            <div className="p-4 bg-[rgba(10,12,25,0.7)] border border-white/[0.08] rounded-2xl flex items-center justify-between gap-4">
              <div className="space-y-0.5 truncate">
                <div className="text-xs font-bold text-[#F8FAFC] truncate">
                  {application.resume?.originalFileName || 'Resume.pdf'}
                </div>
                <div className="text-[10px] text-[#64748B] font-mono">
                  Uploaded on {new Date(application.resume?.createdAt || application.submittedAt).toLocaleDateString()}
                </div>
              </div>

              <GradientButton
                type="button"
                variant="primary"
                size="xs"
                icon={Download}
                loading={downloadingResume}
                onClick={handleSecureResumeDownload}
              >
                Secure View
              </GradientButton>
            </div>

            {/* Extracted Resume Text Accordion */}
            {application.resume?.extractedText && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowResumeText(!showResumeText)}
                  className="w-full flex items-center justify-between py-2 text-xs text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer border-t border-white/[0.06]"
                >
                  <span>Parsed Resume Text Preview</span>
                  {showResumeText ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showResumeText && (
                  <div className="p-3 bg-[rgba(10,12,25,0.9)] border border-white/[0.06] rounded-xl text-[11px] text-[#CBD5E1] max-h-64 overflow-y-auto whitespace-pre-wrap font-mono leading-relaxed mt-2">
                    {application.resume.extractedText}
                  </div>
                )}
              </div>
            )}
          </GlassCard>

          {/* Candidate Cover Letter */}
          {application.coverLetter && (
            <GlassCard className="p-6 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#F8FAFC] border-b border-white/[0.08] pb-2">
                Candidate Note / Cover Letter
              </h3>
              <p className="text-xs text-[#CBD5E1] whitespace-pre-line leading-relaxed italic">
                "{application.coverLetter}"
              </p>
            </GlassCard>
          )}
        </div>

        {/* Right Column: AI Match & Skill Fit */}
        <div className="space-y-6">
          <GlassCard className="p-6 space-y-4" glowVariant="green">
            <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
              <Sparkles className="w-4 h-4 text-[#22D3A7]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
                AI Match & Competency Diagnosis
              </h3>
            </div>

            {optimization ? (
              <div className="space-y-4">
                {/* Summary */}
                <div className="text-xs text-[#CBD5E1] leading-relaxed p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  {optimization.summary}
                </div>

                {/* Matching Skills */}
                {Array.isArray(optimization.matchingSkills) && optimization.matchingSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#22D3A7] uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Matching Requirements ({optimization.matchingSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {optimization.matchingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[11px] rounded-md bg-[#22D3A7]/15 text-[#22D3A7] border border-[#22D3A7]/30"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Missing Skills */}
                {Array.isArray(optimization.missingSkills) && optimization.missingSkills.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-[#EC4899] uppercase flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Identified Skill Gaps ({optimization.missingSkills.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {optimization.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 text-[11px] rounded-md bg-[#EC4899]/15 text-[#F472B6] border border-[#EC4899]/30"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 space-y-2">
                <p className="text-xs text-[#94A3B8]">
                  Candidate submitted application with parsed resume directly.
                </p>
                {Array.isArray(application.job?.requiredSkills) && (
                  <div className="flex flex-wrap gap-1.5 justify-center pt-2">
                    {application.job.requiredSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 text-[11px] rounded-md bg-white/[0.04] text-[#94A3B8] border border-white/[0.06]"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </GlassCard>
        </div>
      </div>

      {/* Private Admin Notes Section */}
      <GlassCard className="p-6 space-y-4" glowVariant="amber">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-[#F59E0B]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
              Internal Recruiter Notes
            </h3>
          </div>
          <GlowBadge variant="amber" size="xs">
            Private & Confidential
          </GlowBadge>
        </div>

        <form onSubmit={handleAddAdminNote} className="space-y-3">
          <Textarea
            placeholder="Add a private evaluation note, interview impressions, or salary feedback (visible only to admin team)..."
            value={adminNoteText}
            onChange={(e) => setAdminNoteText(e.target.value)}
            rows={3}
            className="w-full text-xs"
          />
          <div className="flex justify-end">
            <GradientButton
              type="submit"
              variant="secondary"
              size="xs"
              loading={addingNote}
              disabled={addingNote || !adminNoteText.trim()}
              icon={Plus}
            >
              Add Private Note
            </GradientButton>
          </div>
        </form>

        {adminNotes.length > 0 ? (
          <div className="space-y-2.5 pt-2 border-t border-white/[0.06]">
            {adminNotes.map((note) => (
              <div
                key={note.id}
                className="p-3.5 bg-[rgba(10,12,25,0.7)] border border-white/[0.06] rounded-xl flex items-start justify-between gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F8FAFC]">
                      {note.admin?.name || note.admin?.email || 'Recruiter'}
                    </span>
                    <span className="text-[10px] text-[#64748B] font-mono">
                      {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#CBD5E1] whitespace-pre-wrap leading-relaxed">
                    {note.note}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteAdminNote(note.id)}
                  disabled={deletingNoteId === note.id}
                  className="p-1.5 rounded-lg text-[#64748B] hover:text-[#EC4899] hover:bg-red-500/10 transition-colors cursor-pointer"
                  title="Delete note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#64748B] italic py-2">
            No private notes recorded yet for this candidate.
          </p>
        )}
      </GlassCard>

      {/* Status History Audit Trail */}
      {statusHistory.length > 0 && (
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <Clock className="w-4 h-4 text-[#8B5CF6]" />
            <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">
              Recruitment Process Audit Trail
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
                      Status: {STATUS_CONFIG[item.newStatus]?.label || item.newStatus}
                    </span>
                    {item.oldStatus && (
                      <span className="text-[10px] text-[#64748B]">
                        (from {STATUS_CONFIG[item.oldStatus]?.label || item.oldStatus})
                      </span>
                    )}
                    {item.changedBy && (
                      <span className="text-[10px] text-[#8B5CF6] font-mono">
                        by {item.changedBy.name || item.changedBy.email}
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

      {/* Rejection Confirmation Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0D1020] border border-red-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Confirm Candidate Rejection</h3>
                <p className="text-xs text-[#94A3B8]">
                  Candidate: {application.user?.name}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              Moving this candidate to <strong className="text-[#F87171]">Rejected</strong> status will notify the candidate that their application for "{application.job?.title}" was not successful.
            </p>

            <div className="space-y-1.5 pt-1">
              <label className="text-[11px] font-bold text-[#CBD5E1]">Feedback / Rejection Reason (Included in notification):</label>
              <input
                type="text"
                placeholder="e.g. Seeking candidates with more hands-on cloud experience..."
                value={recruiterNote}
                onChange={(e) => setRecruiterNote(e.target.value)}
                className="w-full bg-[rgba(10,12,25,0.8)] border border-white/[0.1] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-red-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                disabled={updating}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleStatusUpdate('REJECTED')}
                disabled={updating}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer shadow-lg flex items-center gap-1.5"
              >
                {updating ? 'Updating...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
