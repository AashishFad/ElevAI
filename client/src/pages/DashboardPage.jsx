import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Target,
  FileText,
  Briefcase,
  Bot,
  Sparkles,
  ArrowRight,
  Edit2,
  PlusCircle,
  Activity,
  CheckCircle2,
  Clock,
  Send,
  Bell,
  Building2,
  MapPin,
  ShieldCheck,
  AlertCircle,
  Award,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getCareerGoalApi,
  getInterviewsApi,
  getResumesApi,
  getPublicJobsApi,
  getUserApplicationsApi,
  getNotificationsApi,
} from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import AIOrb from '../components/ui/AIOrb';
import ProgressRing from '../components/ui/ProgressRing';
import AnimatedMetric from '../components/ui/AnimatedMetric';
import EmptyState from '../components/ui/EmptyState';
import Skeleton from '../components/ui/Skeleton';

const EXP_LABEL_MAP = {
  FRESHER: 'Fresher (0 yrs)',
  ONE_TO_TWO_YEARS: '1–2 Years',
  THREE_TO_FIVE_YEARS: '3–5 Years',
  EXPERIENCED: 'Experienced (5+ yrs)',
};

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', variant: 'violet' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'cyan' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'green' },
  INTERVIEW: { label: 'Interview', variant: 'amber' },
  SELECTED: { label: 'Selected / Offer', variant: 'green' },
  REJECTED: { label: 'Not Selected', variant: 'pink' },
};

function getTimeGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [careerGoal, setCareerGoal] = useState(null);
  const [latestInterview, setLatestInterview] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      getCareerGoalApi().catch(() => ({ success: false })),
      getInterviewsApi().catch(() => ({ success: false, sessions: [] })),
      getResumesApi().catch(() => ({ success: false, resumes: [] })),
      getPublicJobsApi({ limit: 4 }).catch(() => ({ success: false, data: { jobs: [] } })),
      getUserApplicationsApi({ limit: 4 }).catch(() => ({ success: false, applications: [] })),
      getNotificationsApi({ limit: 4 }).catch(() => ({ success: false, notifications: [] })),
    ])
      .then(([goalData, interviewData, resumeData, jobsData, appData, notifData]) => {
        if (isMounted) {
          if (goalData.success && goalData.careerGoal) setCareerGoal(goalData.careerGoal);
          if (interviewData.success && interviewData.sessions?.length > 0) {
            setLatestInterview(interviewData.sessions[0]);
          }
          if (resumeData.success && Array.isArray(resumeData.resumes)) {
            setResumes(resumeData.resumes);
          }
          if (jobsData.success && jobsData.data?.jobs) {
            setFeaturedJobs(jobsData.data.jobs);
          }
          if (appData.success && Array.isArray(appData.applications)) {
            setUserApplications(appData.applications);
          }
          if (notifData.success && Array.isArray(notifData.notifications)) {
            setNotifications(notifData.notifications);
          }
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const primaryResume = resumes.find((r) => r.isPrimary) || resumes[0] || null;
  const recentScore = primaryResume?.analyses?.[0]?.overallScore || primaryResume?.score || 78;

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        <Skeleton height="140px" className="rounded-2xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Skeleton height="90px" count={4} className="rounded-xl" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <Skeleton height="350px" className="lg:col-span-8 rounded-2xl" />
          <Skeleton height="350px" className="lg:col-span-4 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. HERO BANNER: Welcome & Career Target */}
      <GlassCard glowVariant="cyan" className="p-6 sm:p-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <GlowBadge variant="cyan" size="xs">
                Candidate Workspace
              </GlowBadge>
              {careerGoal && (
                <span className="text-[11px] font-semibold text-[#94A3B8]">
                  • Target: <span className="text-[#F8FAFC]">{careerGoal.targetRole}</span>
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#F8FAFC] tracking-tight">
              {getTimeGreeting()},{' '}
              <span className="bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                {user?.name || 'Candidate'}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl">
              Discover verified technical opportunities, analyze your resume alignment with AI, and track your application progress in real time.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/jobs">
              <GradientButton variant="primary" size="sm" icon={Briefcase}>
                Explore Open Jobs
              </GradientButton>
            </Link>
            <Link to="/resumes/upload">
              <GradientButton variant="glass" size="sm" icon={Sparkles}>
                Analyze Resume
              </GradientButton>
            </Link>
          </div>
        </div>

        {/* Ambient background blur */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-[#8B5CF6]/15 to-transparent rounded-full blur-3xl pointer-events-none" />
      </GlassCard>

      {/* 2. RECRUITMENT METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Target Role */}
        <GlassCard className="p-4 flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[#A78BFA]">
            <Target className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-medium text-[#64748B] block truncate">Career Target</span>
            <span className="text-sm font-bold text-[#F8FAFC] truncate block">
              {careerGoal?.targetRole || 'Not Configured'}
            </span>
          </div>
        </GlassCard>

        {/* Metric 2: Open Jobs */}
        <Link to="/jobs" className="group">
          <GlassCard className="p-4 flex items-center gap-3.5 transition-colors group-hover:border-[#06B6D4]/40">
            <div className="p-2.5 rounded-xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 text-[#22D3EE]">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#64748B] block truncate">Available Jobs</span>
              <span className="text-sm font-bold text-[#F8FAFC]">
                {featuredJobs.length > 0 ? `${featuredJobs.length} Active` : 'Browse Jobs'}
              </span>
            </div>
          </GlassCard>
        </Link>

        {/* Metric 3: Active Applications */}
        <Link to="/applications" className="group">
          <GlassCard className="p-4 flex items-center gap-3.5 transition-colors group-hover:border-[#3B82F6]/40">
            <div className="p-2.5 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#60A5FA]">
              <Send className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#64748B] block truncate">My Applications</span>
              <span className="text-sm font-bold text-[#F8FAFC]">
                {userApplications.length} Submitted
              </span>
            </div>
          </GlassCard>
        </Link>

        {/* Metric 4: Primary Resume ATS */}
        <Link to="/resumes" className="group">
          <GlassCard className="p-4 flex items-center gap-3.5 transition-colors group-hover:border-emerald-500/40">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <span className="text-[11px] font-medium text-[#64748B] block truncate">Resume Vault</span>
              <span className="text-sm font-bold text-[#F8FAFC]">
                {resumes.length} {resumes.length === 1 ? 'Resume' : 'Resumes'}
              </span>
            </div>
          </GlassCard>
        </Link>
      </div>

      {/* 3. MAIN SECTION: JOBS FEED & APPLICATIONS TRACKER */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Featured Job Opportunities (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#06B6D4]" />
              <h2 className="text-base font-bold text-[#F8FAFC]">Active Job Requisitions</h2>
            </div>
            <Link to="/jobs" className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 transition-colors">
              <span>View all jobs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredJobs.length === 0 ? (
            <GlassCard className="p-8 text-center">
              <EmptyState
                icon={Briefcase}
                title="No active job postings yet"
                description="Recruiters are currently preparing new requisitions. Check back soon for fresh opportunities."
              />
            </GlassCard>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featuredJobs.map((job) => (
                <GlassCard
                  key={job.id}
                  className="p-5 flex flex-col justify-between hover:border-[#8B5CF6]/40 transition-all duration-200 group relative"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-[#F8FAFC] group-hover:text-[#06B6D4] transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                      <GlowBadge variant="cyan" size="xs">
                        {job.employmentType?.replace('_', ' ') || 'Full Time'}
                      </GlowBadge>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <Building2 className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                      <span className="truncate">{job.companyName}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-[#94A3B8]">
                      <MapPin className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>

                    {/* Skill tags */}
                    {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {job.requiredSkills.slice(0, 3).map((sk) => (
                          <span
                            key={sk}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-white/[0.04] text-[#94A3B8] border border-white/[0.06]"
                          >
                            {sk}
                          </span>
                        ))}
                        {job.requiredSkills.length > 3 && (
                          <span className="text-[10px] text-[#64748B] px-1 py-0.5">
                            +{job.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/[0.06] flex items-center justify-between">
                    <span className="text-[10px] text-[#64748B] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {job.applicationDeadline
                        ? `Deadline: ${new Date(job.applicationDeadline).toLocaleDateString()}`
                        : 'Actively Hiring'}
                    </span>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-xs font-bold text-[#8B5CF6] group-hover:text-[#F8FAFC] flex items-center gap-1 transition-colors"
                    >
                      <span>Details & Apply</span>
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </GlassCard>
              ))}
            </div>
          )}

          {/* Submitted Applications List */}
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#3B82F6]" />
                <h2 className="text-base font-bold text-[#F8FAFC]">My Application Status</h2>
              </div>
              <Link
                to="/applications"
                className="text-xs font-semibold text-[#8B5CF6] hover:text-[#A78BFA] flex items-center gap-1 transition-colors"
              >
                <span>All applications</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {userApplications.length === 0 ? (
              <GlassCard className="p-6 text-center">
                <div className="flex flex-col items-center space-y-2">
                  <Send className="w-8 h-8 text-[#64748B]" />
                  <p className="text-xs text-[#94A3B8]">You haven't submitted any job applications yet.</p>
                  <Link to="/jobs">
                    <GradientButton variant="glass" size="xs" className="mt-2">
                      Browse Jobs & Apply
                    </GradientButton>
                  </Link>
                </div>
              </GlassCard>
            ) : (
              <div className="space-y-2.5">
                {userApplications.map((app) => {
                  const cfg = STATUS_CONFIG[app.status] || { label: app.status, variant: 'violet' };
                  return (
                    <GlassCard
                      key={app.id}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-white/[0.12] transition-colors"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/applications/${app.id}`}
                            className="text-xs sm:text-sm font-bold text-[#F8FAFC] hover:text-[#06B6D4] transition-colors truncate"
                          >
                            {app.job?.title || 'Job Opportunity'}
                          </Link>
                          <GlowBadge variant={cfg.variant} size="xs">
                            {cfg.label}
                          </GlowBadge>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-[#64748B]">
                          <span>{app.job?.companyName}</span>
                          <span>•</span>
                          <span>Applied {new Date(app.createdAt).toLocaleDateString()}</span>
                          {app.matchScore && (
                            <>
                              <span>•</span>
                              <span className="text-[#22D3EE] font-semibold">
                                Match: {app.matchScore}%
                              </span>
                            </>
                          )}
                        </div>
                      </div>

                      <Link to={`/applications/${app.id}`}>
                        <GradientButton variant="glass" size="xs" className="self-start sm:self-center">
                          View Status
                        </GradientButton>
                      </Link>
                    </GlassCard>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Profile, Resume Vault & Interview Practice (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Resume Readiness Card */}
          <GlassCard glowVariant="violet" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8B5CF6]" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">Active Resume</h3>
              </div>
              <Link to="/resumes" className="text-[11px] text-[#8B5CF6] hover:underline font-semibold">
                Manage
              </Link>
            </div>

            {primaryResume ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#F8FAFC] truncate block">
                      {primaryResume.originalFileName || primaryResume.fileName || 'Active Resume'}
                    </span>
                    <span className="text-[10px] text-[#64748B]">
                      Uploaded {new Date(primaryResume.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <GlowBadge variant="green" size="xs">
                    READY
                  </GlowBadge>
                </div>

                <Link to="/resumes/upload" className="block">
                  <GradientButton variant="primary" size="sm" className="w-full" icon={Sparkles}>
                    Analyze Resume with AI
                  </GradientButton>
                </Link>
              </div>
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-xs text-[#94A3B8]">
                  Upload your resume to get instant ATS scores and apply to open jobs.
                </p>
                <Link to="/resumes/upload" className="block">
                  <GradientButton variant="primary" size="sm" className="w-full" icon={PlusCircle}>
                    Upload Resume
                  </GradientButton>
                </Link>
              </div>
            )}
          </GlassCard>

          {/* AI Mock Interview Practice Card */}
          <GlassCard glowVariant="amber" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-[#F59E0B]" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">AI Mock Interview</h3>
              </div>
              <GlowBadge variant="amber" size="xs">
                Text Drill
              </GlowBadge>
            </div>

            <p className="text-xs text-[#94A3B8]">
              Practice rigorous role-tailored technical and HR interview questions evaluated by AI.
            </p>

            {latestInterview && (
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-[#64748B] block">Last Score</span>
                  <span className="text-sm font-bold text-[#F59E0B]">
                    {latestInterview.overallScore ? `${latestInterview.overallScore}/10` : 'In Progress'}
                  </span>
                </div>
                <span className="text-[10px] text-[#64748B]">
                  {new Date(latestInterview.createdAt).toLocaleDateString()}
                </span>
              </div>
            )}

            <Link to="/mock-interview" className="block">
              <GradientButton variant="glass" size="sm" className="w-full" icon={Bot}>
                Start Text Mock Interview
              </GradientButton>
            </Link>
          </GlassCard>

          {/* Recent Notifications Card */}
          <GlassCard className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-[#06B6D4]" />
                <h3 className="text-sm font-bold text-[#F8FAFC]">Notifications</h3>
              </div>
              <Link to="/notifications" className="text-[11px] text-[#06B6D4] hover:underline font-semibold">
                View all
              </Link>
            </div>

            {notifications.length === 0 ? (
              <p className="text-xs text-[#64748B] py-2 text-center">No new notifications.</p>
            ) : (
              <div className="space-y-2">
                {notifications.slice(0, 3).map((n) => (
                  <div key={n.id} className="p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04] space-y-1">
                    <span className="text-xs font-semibold text-[#F8FAFC] block line-clamp-1">{n.title}</span>
                    <span className="text-[11px] text-[#94A3B8] block line-clamp-1">{n.message}</span>
                  </div>
                ))}
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
