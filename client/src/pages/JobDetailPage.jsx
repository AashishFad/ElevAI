import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileText,
  Lock,
  Send,
  ShieldCheck,
  Zap,
  ChevronDown,
} from 'lucide-react';
import {
  getPublicJobByIdApi,
  checkJobApplicationStatusApi,
  getResumesApi,
  createJobOptimizationApi,
} from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlowBadge from '../components/ui/GlowBadge';
import GradientButton from '../components/ui/GradientButton';
import AIOrb from '../components/ui/AIOrb';
import ApplyModal from '../components/application/ApplyModal';

export default function JobDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAvailable, setIsAvailable] = useState(true);
  const [appliedInfo, setAppliedInfo] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);

  // Resume selection & in-page AI analysis state
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      setLoading(true);
      setError(null);
      setIsAvailable(true);
      try {
        const [jobRes, appRes, resumeRes] = await Promise.all([
          getPublicJobByIdApi(id),
          checkJobApplicationStatusApi(id).catch(() => ({ hasApplied: false })),
          getResumesApi().catch(() => ({ success: false, resumes: [] })),
        ]);

        if (isMounted) {
          if (jobRes.success && jobRes.job) {
            setJob(jobRes.job);
          } else {
            setIsAvailable(false);
            setError(jobRes.message || 'Job opportunity is no longer available.');
          }

          if (appRes && appRes.hasApplied) {
            setAppliedInfo(appRes.application);
          } else {
            setAppliedInfo(null);
          }

          if (resumeRes && resumeRes.success && Array.isArray(resumeRes.resumes)) {
            const readyResumes = resumeRes.resumes.filter((r) => r.status === 'READY');
            setResumes(readyResumes);
            if (readyResumes.length > 0) {
              setSelectedResumeId(readyResumes[0].id);
            }
          }
        }
      } catch (err) {
        if (isMounted) {
          setIsAvailable(false);
          setError(err.message || 'This job is no longer active or has been unlisted.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleRunAnalysis = async () => {
    if (!selectedResumeId || !job) return;
    setAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await createJobOptimizationApi({
        resumeId: selectedResumeId,
        jobDescription: job.description,
        companyName: job.companyName,
        jobTitle: job.title,
        jobLocation: job.location,
        requiredSkills: job.requiredSkills || [],
      });

      const opt = response?.optimization || response;
      if (opt && (opt.id || opt.matchScore !== undefined)) {
        setAnalysisResult(opt);
      } else {
        throw new Error('Analysis completed but returned an unexpected format.');
      }
    } catch (err) {
      setAnalysisError(err.message || 'Failed to analyze resume against job description.');
    } finally {
      setAnalyzing(false);
    }
  };

  const formatSalary = (min, max, visible) => {
    if (!visible) return 'Not publicly displayed';
    if (!min && !max) return 'Competitive compensation';
    if (min && max) return `₹${min.toLocaleString()} – ₹${max.toLocaleString()} / year`;
    if (min) return `From ₹${min.toLocaleString()} / year`;
    return `Up to ₹${max.toLocaleString()} / year`;
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <AIOrb size="md" state="thinking" showIcon={false} />
        <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
          Loading Job Specifications...
        </span>
      </div>
    );
  }

  if (!isAvailable || !job) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-5 animate-fade-in">
        <GlassCard className="p-10 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[#F59E0B] flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-bold text-[#F8FAFC]">
            Job Opportunity Unavailable
          </h2>
          <p className="text-xs text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            {error || 'This job requisition has been closed or unlisted by the hiring team.'}
          </p>
          <div className="pt-2">
            <Link to="/jobs">
              <GradientButton variant="primary" size="md" icon={ArrowLeft}>
                Browse Active Opportunities
              </GradientButton>
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-20">
      {/* 1. Header with Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Job Feed</span>
        </Link>

        {/* Action buttons */}
        <div className="flex items-center gap-2.5">
          {appliedInfo ? (
            <Link to={`/applications/${appliedInfo.id}`}>
              <GradientButton variant="glass" size="md" icon={ShieldCheck}>
                View My Application ({appliedInfo.status})
              </GradientButton>
            </Link>
          ) : (
            <GradientButton
              variant="primary"
              size="md"
              icon={Send}
              onClick={() => setShowApplyModal(true)}
            >
              Apply Now
            </GradientButton>
          )}
        </div>
      </div>

      {/* 2. Top Job Overview Hero Card */}
      <GlassCard glowVariant="cyan" className="p-6 sm:p-8 relative overflow-hidden space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <GlowBadge variant="cyan" size="xs">
                {job.department || 'Engineering'}
              </GlowBadge>
              <GlowBadge variant="violet" size="xs">
                {job.employmentType?.replace('_', ' ') || 'Full Time'}
              </GlowBadge>
              <GlowBadge variant="emerald" size="xs">
                {job.experienceLevel?.replace('_', ' ') || 'Any Experience'}
              </GlowBadge>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight">
              {job.title}
            </h1>

            <div className="flex flex-wrap items-center gap-y-2 gap-x-5 text-xs text-[#94A3B8]">
              <div className="flex items-center gap-1.5 text-[#F8FAFC] font-semibold">
                <Building2 className="w-4 h-4 text-[#06B6D4]" />
                <span>{job.companyName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#8B5CF6]" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-[#EC4899]" />
                <span>
                  Posted {new Date(job.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick meta pill row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/[0.08]">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-semibold text-[#64748B] block">Compensation</span>
            <span className="text-xs font-bold text-[#F8FAFC] truncate block mt-0.5">
              {formatSalary(job.salaryMin, job.salaryMax, job.isSalaryVisible)}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-semibold text-[#64748B] block">Location Type</span>
            <span className="text-xs font-bold text-[#F8FAFC] truncate block mt-0.5">
              {job.locationType || 'Onsite'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-semibold text-[#64748B] block">Application Deadline</span>
            <span className="text-xs font-bold text-[#F8FAFC] truncate block mt-0.5">
              {job.applicationDeadline
                ? new Date(job.applicationDeadline).toLocaleDateString()
                : 'Open Rolling'}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            <span className="text-[10px] uppercase font-semibold text-[#64748B] block">Applicants</span>
            <span className="text-xs font-bold text-[#06B6D4] truncate block mt-0.5">
              {job._count?.applications || 0} Submitted
            </span>
          </div>
        </div>
      </GlassCard>

      {/* 3. RESUME VS JOB AI ANALYSIS SECTION */}
      <GlassCard glowVariant="violet" className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
              <h2 className="text-lg font-bold text-[#F8FAFC]">AI Resume Alignment</h2>
            </div>
            <p className="text-xs text-[#94A3B8]">
              Evaluate how well your resume matches this job before applying.
            </p>
          </div>

          {resumes.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative flex items-center min-w-[200px] sm:min-w-[250px]">
                <FileText className="w-4 h-4 text-[#8B5CF6] absolute left-3 pointer-events-none" />
                <select
                  value={selectedResumeId}
                  onChange={(e) => setSelectedResumeId(e.target.value)}
                  disabled={analyzing}
                  className="w-full pl-9 pr-8 py-2 rounded-xl bg-[#0D1020] border border-white/10 text-xs font-medium text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6] shadow-sm appearance-none cursor-pointer transition-colors"
                >
                  {resumes.map((r) => (
                    <option key={r.id} value={r.id} className="bg-[#0D1020] text-[#F8FAFC] py-1">
                      {r.originalFileName || r.fileName || 'Resume Document'}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8] absolute right-3 pointer-events-none" />
              </div>

              <GradientButton
                variant="primary"
                size="sm"
                icon={Sparkles}
                onClick={handleRunAnalysis}
                loading={analyzing}
                disabled={!selectedResumeId || analyzing}
              >
                {analyzing ? 'Analyzing...' : 'Analyze Resume'}
              </GradientButton>
            </div>
          )}
        </div>

        {resumes.length === 0 ? (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] text-center space-y-2">
            <p className="text-xs text-[#94A3B8]">
              You don't have any uploaded resumes in your vault yet.
            </p>
            <Link to="/resumes/upload">
              <GradientButton variant="glass" size="xs" icon={FileText}>
                Upload Resume to Analyze
              </GradientButton>
            </Link>
          </div>
        ) : analysisResult ? (
          /* ANALYSIS RESULT SCORECARD */
          <div className="space-y-5 pt-2 animate-fade-in">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#8B5CF6]/15 via-[#3B82F6]/10 to-transparent border border-[#8B5CF6]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#A78BFA]">
                  AI Suitability Match Score
                </span>
                <p className="text-xs text-[#E2E8F0] leading-relaxed">
                  {analysisResult.summary}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-center px-4 py-2 rounded-xl bg-[#070714]/80 border border-white/10">
                  <span className="text-2xl font-black bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                    {analysisResult.matchScore}%
                  </span>
                  <span className="text-[9px] text-[#64748B] block uppercase tracking-wider">Suitability</span>
                </div>
              </div>
            </div>

            {/* Skills Breakdown Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Matching Skills */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Matching Skills ({analysisResult.matchingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(analysisResult.matchingSkills || []).map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/30"
                    >
                      {sk}
                    </span>
                  ))}
                  {(!analysisResult.matchingSkills || analysisResult.matchingSkills.length === 0) && (
                    <span className="text-[11px] text-[#64748B]">No exact keyword matches found.</span>
                  )}
                </div>
              </div>

              {/* Missing / Gap Skills */}
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] space-y-2.5">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Missing Job Skills ({analysisResult.missingSkills?.length || 0})
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {(analysisResult.missingSkills || []).map((sk) => (
                    <span
                      key={sk}
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/30"
                    >
                      {sk}
                    </span>
                  ))}
                  {(!analysisResult.missingSkills || analysisResult.missingSkills.length === 0) && (
                    <span className="text-[11px] text-emerald-400">All core skills demonstrated!</span>
                  )}
                </div>
              </div>
            </div>

            {/* Recommendations */}
            {analysisResult.sectionRecommendations && (
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.05] text-xs text-[#94A3B8] space-y-1">
                <span className="font-bold text-[#F8FAFC]">AI Tailoring Note:</span>
                <p>{analysisResult.sectionRecommendations.summary || 'Ensure your projects emphasize the required skills.'}</p>
              </div>
            )}

            {/* Quick Apply with Analyzed Resume */}
            {!appliedInfo && (
              <div className="pt-2 flex justify-end">
                <GradientButton
                  variant="primary"
                  size="sm"
                  icon={Send}
                  onClick={() => setShowApplyModal(true)}
                >
                  Apply with Analyzed Resume
                </GradientButton>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04] text-center text-xs text-[#64748B]">
            Select your resume above and click <strong>"Analyze Resume"</strong> to see matching skills and an AI compatibility score.
          </div>
        )}

        {analysisError && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{analysisError}</span>
          </div>
        )}
      </GlassCard>

      {/* 4. Full Job Description & Requirements */}
      <GlassCard className="p-6 sm:p-8 space-y-6">
        <div className="space-y-3">
          <h2 className="text-base font-bold text-[#F8FAFC] flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#06B6D4]" />
            <span>Required Skills & Tech Stack</span>
          </h2>
          <div className="flex flex-wrap gap-2">
            {Array.isArray(job.requiredSkills) &&
              job.requiredSkills.map((sk) => (
                <span
                  key={sk}
                  className="px-3 py-1 rounded-xl bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-[#F8FAFC]"
                >
                  {sk}
                </span>
              ))}
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-white/[0.08]">
          <h2 className="text-base font-bold text-[#F8FAFC]">Job Description</h2>
          <div className="text-xs sm:text-sm text-[#94A3B8] leading-relaxed whitespace-pre-line space-y-4">
            {job.description}
          </div>
        </div>
      </GlassCard>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          isOpen={showApplyModal}
          onClose={() => setShowApplyModal(false)}
          job={job}
          jobOptimizationId={analysisResult?.id}
          matchScore={analysisResult?.matchScore}
          onApplied={(newApp) => {
            setAppliedInfo(newApp);
            setShowApplyModal(false);
          }}
        />
      )}
    </div>
  );
}
