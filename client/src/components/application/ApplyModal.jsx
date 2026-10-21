import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  FileText,
  Building2,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  UploadCloud,
  Send,
  X,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import {
  getResumesApi,
  submitApplicationApi,
  checkJobApplicationStatusApi,
} from '../../services/api';
import Modal from '../ui/Modal';
import GlassCard from '../ui/GlassCard';
import GradientButton from '../ui/GradientButton';
import GlowBadge from '../ui/GlowBadge';
import Textarea from '../ui/Textarea';
import Alert from '../ui/Alert';

export default function ApplyModal({
  isOpen,
  onClose,
  job,
  jobOptimizationId,
  matchScore,
  onApplied,
}) {
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [loadingResumes, setLoadingResumes] = useState(true);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedApp, setSubmittedApp] = useState(null);

  useEffect(() => {
    if (!isOpen || !job?.id) return;

    let isMounted = true;
    setError('');
    setSubmittedApp(null);
    setLoadingResumes(true);
    setCheckingStatus(true);

    // 1. Check if user already applied
    checkJobApplicationStatusApi(job.id)
      .then((res) => {
        if (isMounted && res.hasApplied) {
          setAlreadyApplied(res.application);
        } else {
          setAlreadyApplied(null);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setCheckingStatus(false);
      });

    // 2. Load ready resumes
    getResumesApi()
      .then((res) => {
        if (isMounted && res.success) {
          const readyList = (res.resumes || []).filter((r) => r.status === 'READY');
          setResumes(readyList);
          if (readyList.length > 0) {
            setSelectedResumeId(readyList[0].id);
          }
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load your resumes.');
      })
      .finally(() => {
        if (isMounted) setLoadingResumes(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, job?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError('Please select a resume to submit with your application.');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      const response = await submitApplicationApi({
        jobId: job.id,
        resumeId: selectedResumeId,
        jobOptimizationId: jobOptimizationId || undefined,
        coverLetter: coverLetter.trim() || undefined,
      });

      if (response.success && response.application) {
        setSubmittedApp(response.application);
        if (onApplied) onApplied(response.application);
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setAlreadyApplied({ id: err.response.data?.applicationId });
        setError('You have already applied for this job opportunity.');
      } else {
        setError(err.message || 'Failed to submit application. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setError('');
    setSubmittedApp(null);
    onClose();
  };

  if (!isOpen || !job) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="" size="lg">
      <div className="space-y-6">
        {/* SUCCESS CONFIRMATION SCREEN */}
        {submittedApp ? (
          <div className="text-center py-6 space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#22D3A7]/20 to-[#06B6D4]/20 border border-[#22D3A7]/30 flex items-center justify-center mx-auto shadow-[0_0_30px_rgba(34,211,167,0.3)]">
              <CheckCircle2 className="w-9 h-9 text-[#22D3A7]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#22D3A7] bg-[#22D3A7]/10 px-3 py-1 rounded-full border border-[#22D3A7]/20">
                Application Submitted
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-[#F8FAFC]">
                You're in the running!
              </h2>
              <p className="text-xs text-[#94A3B8] max-w-md mx-auto">
                Your application for <span className="font-bold text-[#F8FAFC]">{job.title}</span> at{' '}
                <span className="font-bold text-[#06B6D4]">{job.companyName}</span> has been securely submitted to the recruitment team.
              </p>
            </div>

            <GlassCard className="p-4 bg-[rgba(10,12,25,0.8)] border-white/[0.08] max-w-md mx-auto space-y-2.5 text-left" glowVariant="cyan">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Application Reference:</span>
                <span className="font-mono font-bold text-[#F8FAFC]">
                  #EVA-{submittedApp.id.substring(0, 8).toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#94A3B8]">Initial Status:</span>
                <GlowBadge variant="violet" size="xs">Submitted</GlowBadge>
              </div>
              {submittedApp.matchScore && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#94A3B8]">AI Match Alignment:</span>
                  <span className="font-bold text-[#06B6D4]">{submittedApp.matchScore}%</span>
                </div>
              )}
            </GlassCard>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <GradientButton
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => {
                  handleClose();
                  navigate(`/applications/${submittedApp.id}`);
                }}
              >
                View My Application
              </GradientButton>

              <GradientButton
                variant="glass"
                size="sm"
                onClick={() => {
                  handleClose();
                  navigate('/jobs');
                }}
              >
                Back to Jobs Feed
              </GradientButton>
            </div>
          </div>
        ) : alreadyApplied ? (
          /* ALREADY APPLIED NOTICE SCREEN */
          <div className="text-center py-6 space-y-5 animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/10 text-[#06B6D4] border border-[#06B6D4]/20 flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h3 className="text-lg font-bold text-[#F8FAFC]">Already Applied</h3>
              <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
                You have already submitted an active application for <span className="text-[#F8FAFC] font-semibold">{job.title}</span> at{' '}
                <span className="text-[#06B6D4] font-semibold">{job.companyName}</span>.
              </p>
            </div>

            <div className="pt-2 flex justify-center gap-3">
              <GradientButton
                variant="primary"
                size="sm"
                icon={ArrowRight}
                onClick={() => {
                  handleClose();
                  navigate(`/applications/${alreadyApplied.id}`);
                }}
              >
                View Submitted Application
              </GradientButton>
              <GradientButton variant="glass" size="sm" onClick={handleClose}>
                Close
              </GradientButton>
            </div>
          </div>
        ) : (
          /* STANDARD APPLICATION SUBMISSION FORM */
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Header / Position Overview */}
            <div className="space-y-1.5 border-b border-white/[0.08] pb-3.5 pr-8">
              <div className="flex flex-wrap items-center gap-2">
                <GlowBadge variant="cyan" size="xs">Application Submission</GlowBadge>
                {matchScore !== undefined && matchScore !== null && (
                  <GlowBadge variant="violet" size="xs" icon={Sparkles}>
                    AI Match: {matchScore}%
                  </GlowBadge>
                )}
              </div>
              <h2 className="text-base sm:text-xl font-black text-[#F8FAFC] tracking-tight">{job.title}</h2>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#94A3B8]">
                <span className="flex items-center gap-1 font-semibold text-[#F8FAFC]">
                  <Building2 className="w-3.5 h-3.5 text-[#06B6D4]" />
                  {job.companyName}
                </span>
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#8B5CF6]" />
                    {job.location}
                  </span>
                )}
              </div>
            </div>

            {error && (
              <Alert variant="error" title="Notice">
                {error}
              </Alert>
            )}

            {/* STEP 1: Select Resume */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#F8FAFC]">
                  Select Resume to Attach <span className="text-[#EC4899]">*</span>
                </label>
                <Link
                  to="/resume/analyzer"
                  className="text-[11px] text-[#06B6D4] hover:text-[#38BDF8] font-medium flex items-center gap-1 transition-colors"
                >
                  <UploadCloud className="w-3 h-3" />
                  <span>Upload New Resume</span>
                </Link>
              </div>

              {loadingResumes ? (
                <div className="p-6 text-center text-xs text-[#94A3B8] flex items-center justify-center gap-2 bg-[rgba(10,12,25,0.4)] rounded-2xl border border-white/[0.06]">
                  <div className="w-4 h-4 border-2 border-[#06B6D4] border-t-transparent rounded-full animate-spin"></div>
                  <span>Loading your resumes...</span>
                </div>
              ) : resumes.length === 0 ? (
                <GlassCard className="p-5 text-center space-y-3" glowVariant="pink">
                  <div className="w-10 h-10 rounded-xl bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold text-[#F8FAFC]">No Ready Resumes Found</h4>
                    <p className="text-[11px] text-[#94A3B8]">
                      Please upload or analyze a resume before submitting your application.
                    </p>
                  </div>
                  <Link to="/resume/analyzer">
                    <GradientButton variant="primary" size="xs" icon={UploadCloud}>
                      Upload Resume Now
                    </GradientButton>
                  </Link>
                </GlassCard>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {resumes.map((r) => {
                    const isSelected = r.id === selectedResumeId;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setSelectedResumeId(r.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'border-[#06B6D4] bg-[#06B6D4]/15 shadow-[0_0_15px_rgba(6,182,212,0.25)]'
                            : 'border-white/[0.08] bg-[rgba(10,12,25,0.6)] hover:border-white/20 hover:bg-[rgba(10,12,25,0.8)]'
                        }`}
                      >
                        <div className="min-w-0 space-y-1 truncate flex-1">
                          <div className="flex items-center gap-1.5">
                            <FileText className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-[#06B6D4]' : 'text-[#94A3B8]'}`} />
                            <span className="text-xs font-bold text-[#F8FAFC] truncate">
                              {r.originalFileName || r.fileName || 'Resume Document'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#64748B]">
                            <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                            {r.atsScore !== undefined && r.atsScore !== null && (
                              <>
                                <span>•</span>
                                <span className="text-[#10B981] font-semibold">ATS: {r.atsScore}%</span>
                              </>
                            )}
                          </div>
                        </div>
                        {isSelected ? (
                          <CheckCircle2 className="w-4 h-4 text-[#06B6D4] shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-white/20 shrink-0 mt-0.5" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STEP 2: Optional Cover Letter / Note */}
            <div className="space-y-1.5">
              <Textarea
                label="Note to Recruiter / Cover Letter (Optional)"
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={3}
                placeholder="Highlight specific experience, availability, or motivation for joining this team..."
              />
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.08]">
              <GradientButton
                type="button"
                variant="glass"
                size="sm"
                onClick={handleClose}
                disabled={submitting}
              >
                Cancel
              </GradientButton>

              <GradientButton
                type="submit"
                variant="primary"
                size="sm"
                icon={Send}
                loading={submitting}
                disabled={submitting || resumes.length === 0 || !selectedResumeId}
              >
                Submit Application
              </GradientButton>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
