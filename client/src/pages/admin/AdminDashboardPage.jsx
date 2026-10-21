import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Briefcase,
  FileCheck2,
  Clock,
  ShieldCheck,
  Sparkles,
  ArrowUpRight,
  RefreshCw,
  FileText,
  Bot,
  UserCheck,
  AlertCircle,
  GraduationCap,
  Activity,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpDown,
  Filter,
  AlertTriangle,
  Award,
  Zap,
  Target,
  Search,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { useAuth } from '../../hooks/useAuth';
import {
  getAdminAnalyticsOverviewApi,
  getAdminAnalyticsTrendsApi,
  getAdminAnalyticsJobPerformanceApi,
  getAdminAnalyticsSkillsApi,
  getAdminAnalyticsDeadlinesApi,
  getAdminAnalyticsInsightsApi,
  getAdminApplicationsApi,
  getAdminActivityFeedApi,
} from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GlowBadge from '../../components/ui/GlowBadge';
import GradientButton from '../../components/ui/GradientButton';
import AnimatedMetric from '../../components/ui/AnimatedMetric';
import AIOrb from '../../components/ui/AIOrb';
import ProgressRing from '../../components/ui/ProgressRing';
import EmptyState from '../../components/ui/EmptyState';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', variant: 'violet', glow: 'violet' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'cyan', glow: 'cyan' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'green', glow: 'green' },
  INTERVIEW: { label: 'Interview', variant: 'amber', glow: 'amber' },
  SELECTED: { label: 'Selected', variant: 'green', glow: 'green' },
  REJECTED: { label: 'Rejected', variant: 'pink', glow: 'pink' },
};

export default function AdminDashboardPage() {
  const { user } = useAuth();

  // State Management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Analytics Datasets
  const [overview, setOverview] = useState(null);
  const [trends, setTrends] = useState({ range: '30d', points: [], totalInRange: 0 });
  const [trendRange, setTrendRange] = useState('30d');
  const [trendsLoading, setTrendsLoading] = useState(false);
  const [jobPerformance, setJobPerformance] = useState({ totalJobs: 0, jobs: [] });
  const [jobSortBy, setJobSortBy] = useState('applications_desc');
  const [skillDemand, setSkillDemand] = useState({ totalPublishedJobs: 0, topSkills: [] });
  const [deadlines, setDeadlines] = useState({ summary: {}, urgentJobs: [], allUpcoming: [] });
  const [insights, setInsights] = useState({ facts: [], topApplicantJobs: [] });
  const [recentApplications, setRecentApplications] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);

  // Fetch all primary dashboard telemetry
  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        overviewRes,
        trendsRes,
        jobsRes,
        skillsRes,
        deadlinesRes,
        insightsRes,
        recentAppsRes,
        feedRes,
      ] = await Promise.all([
        getAdminAnalyticsOverviewApi(),
        getAdminAnalyticsTrendsApi({ range: trendRange }).catch(() => ({ success: false, data: { points: [] } })),
        getAdminAnalyticsJobPerformanceApi({ sortBy: jobSortBy }).catch(() => ({ success: false, data: { jobs: [] } })),
        getAdminAnalyticsSkillsApi({ limit: 10 }).catch(() => ({ success: false, data: { topSkills: [] } })),
        getAdminAnalyticsDeadlinesApi().catch(() => ({ success: false, data: { urgentJobs: [], allUpcoming: [] } })),
        getAdminAnalyticsInsightsApi().catch(() => ({ success: false, data: { facts: [] } })),
        getAdminApplicationsApi({ limit: 5, sortBy: 'newest' }).catch(() => ({ success: false, applications: [] })),
        getAdminActivityFeedApi({ limit: 6 }).catch(() => ({ success: false, activities: [] })),
      ]);

      if (overviewRes.success && overviewRes.data) {
        setOverview(overviewRes.data);
      } else {
        setError(overviewRes.message || 'Failed to fetch recruitment telemetry');
      }

      if (trendsRes.success && trendsRes.data) setTrends(trendsRes.data);
      if (jobsRes.success && jobsRes.data) setJobPerformance(jobsRes.data);
      if (skillsRes.success && skillsRes.data) setSkillDemand(skillsRes.data);
      if (deadlinesRes.success && deadlinesRes.data) setDeadlines(deadlinesRes.data);
      if (insightsRes.success && insightsRes.data) setInsights(insightsRes.data);
      if (recentAppsRes.success && recentAppsRes.applications) setRecentApplications(recentAppsRes.applications);
      if (feedRes.success && feedRes.activities) setActivityFeed(feedRes.activities);
    } catch (err) {
      setError(err.message || 'Error connecting to analytics gateway');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handle Trends range change
  const handleTrendRangeChange = async (newRange) => {
    setTrendRange(newRange);
    setTrendsLoading(true);
    try {
      const res = await getAdminAnalyticsTrendsApi({ range: newRange });
      if (res.success && res.data) {
        setTrends(res.data);
      }
    } catch (err) {
      console.error('Failed to load trends for range:', newRange, err);
    } finally {
      setTrendsLoading(false);
    }
  };

  // Handle Job Performance sorting change
  const handleJobSortChange = async (newSort) => {
    setJobSortBy(newSort);
    try {
      const res = await getAdminAnalyticsJobPerformanceApi({ sortBy: newSort });
      if (res.success && res.data) {
        setJobPerformance(res.data);
      }
    } catch (err) {
      console.error('Failed to sort job performance:', err);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16 max-w-7xl mx-auto">
      {/* 1. Command Center Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-7 rounded-2xl bg-gradient-to-r from-[rgba(139,92,246,0.16)] via-[rgba(6,182,212,0.12)] to-[rgba(245,158,11,0.08)] border border-purple-500/25 backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10 flex items-center gap-4">
          <AIOrb size="md" state="idle" showIcon={false} />
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GlowBadge variant="violet" size="xs" icon={ShieldCheck}>
                Recruitment Intelligence OS
              </GlowBadge>
              <span className="text-[11px] font-mono text-[#06B6D4] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Live PostgreSQL Telemetry
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
              Command Hub &mdash; <span className="text-gradient-ai">{user?.name || 'Administrator'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mt-0.5">
              Comprehensive recruitment analytics, hiring conversion funnel, and candidate pipeline tracking.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <GradientButton
            variant="glass"
            size="sm"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchDashboardData}
          >
            Refresh Metrics
          </GradientButton>
          <Link to="/admin/applications">
            <GradientButton variant="primary" size="sm" icon={FileCheck2}>
              Review Pipeline
            </GradientButton>
          </Link>
        </div>

        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-52 h-52 rounded-full bg-purple-500/20 blur-3xl pointer-events-none" />
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 flex items-center gap-3 text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Primary KPI Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Users */}
        <GlassCard glowVariant="cyan" className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              Total Users
            </span>
            <Users className="w-4 h-4 text-[#06B6D4]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            {loading ? '...' : <AnimatedMetric value={overview?.system?.totalUsers || 0} />}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1.5 flex items-center justify-between">
            <span>{overview?.system?.studentCount ?? 0} Students</span>
            <span className="text-[#06B6D4] font-semibold">{overview?.system?.adminCount ?? 0} Admins</span>
          </div>
        </GlassCard>

        {/* Published Jobs */}
        <GlassCard glowVariant="violet" className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              Active Jobs
            </span>
            <Briefcase className="w-4 h-4 text-[#8B5CF6]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            {loading ? '...' : <AnimatedMetric value={overview?.jobs?.PUBLISHED || 0} />}
          </div>
          <div className="text-[11px] text-[#64748B] mt-1.5 flex items-center justify-between">
            <span>{overview?.jobs?.DRAFT ?? 0} Drafts</span>
            <Link to="/admin/jobs" className="text-[#8B5CF6] hover:underline font-semibold">
              Manage →
            </Link>
          </div>
        </GlassCard>

        {/* Total Applications */}
        <GlassCard glowVariant="pink" className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              Applications
            </span>
            <FileCheck2 className="w-4 h-4 text-[#EC4899]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            {loading ? '...' : <AnimatedMetric value={overview?.applications?.TOTAL || 0} />}
          </div>
          <div className="text-[11px] text-[#EC4899] mt-1.5 font-semibold">
            +{overview?.applications?.newLast7Days ?? 0} in last 7 days
          </div>
        </GlassCard>

        {/* Review Queue (Submitted + Under Review) */}
        <GlassCard glowVariant="amber" className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              Under Review
            </span>
            <Clock className="w-4 h-4 text-[#F59E0B]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            {loading ? (
              '...'
            ) : (
              <AnimatedMetric
                value={(overview?.applications?.SUBMITTED || 0) + (overview?.applications?.UNDER_REVIEW || 0)}
              />
            )}
          </div>
          <div className="text-[11px] text-[#FBBF24] mt-1.5 font-semibold">
            Pending recruiter evaluation
          </div>
        </GlassCard>

        {/* Shortlisted & Interview */}
        <GlassCard glowVariant="green" className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              Shortlisted
            </span>
            <Sparkles className="w-4 h-4 text-[#22D3A7]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            {loading ? (
              '...'
            ) : (
              <AnimatedMetric
                value={(overview?.applications?.SHORTLISTED || 0) + (overview?.applications?.INTERVIEW || 0)}
              />
            )}
          </div>
          <div className="text-[11px] text-[#22D3A7] mt-1.5 font-semibold">
            {overview?.applications?.INTERVIEW ?? 0} in interview round
          </div>
        </GlassCard>

        {/* Selected / Offers */}
        <GlassCard glowVariant="green" className="p-4 sm:p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-mono font-bold text-[#94A3B8] uppercase tracking-wider">
              Selected
            </span>
            <Award className="w-4 h-4 text-[#10B981]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#F8FAFC]">
            {loading ? '...' : <AnimatedMetric value={overview?.applications?.SELECTED || 0} />}
          </div>
          <div className="text-[11px] text-[#10B981] mt-1.5 font-semibold">
            Offers extended
          </div>
        </GlassCard>
      </div>

      {/* 3. Recruitment Analytics Engine: Funnel & Trends */}
      <div id="analytics" className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Application Conversion Funnel (5 Cols) */}
        <GlassCard className="lg:col-span-5 p-6 space-y-5" glowVariant="violet">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Target className="w-4 h-4 text-[#8B5CF6]" />
                Application Conversion Funnel
              </h2>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Stage progression strictly computed from PostgreSQL records
              </p>
            </div>
            <GlowBadge variant="violet" size="xs">
              Exact DB Data
            </GlowBadge>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-[#94A3B8] animate-pulse">
              Computing recruitment funnel...
            </div>
          ) : !overview || overview.applications?.TOTAL === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B] space-y-2">
              <FileCheck2 className="w-8 h-8 text-[#64748B] mx-auto opacity-50" />
              <p>No applications received yet. Funnel will populate once candidates submit applications.</p>
            </div>
          ) : (
            <div className="space-y-3.5">
              {overview.funnel?.map((step, idx) => (
                <div key={step.stage} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#CBD5E1] flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-white/[0.06] text-[10px] font-mono flex items-center justify-center text-[#94A3B8]">
                        {idx + 1}
                      </span>
                      {step.stage}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F8FAFC] font-mono">{step.count}</span>
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        ({step.percentage}%)
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.04] overflow-hidden p-0.5 border border-white/[0.06]">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${Math.max(step.percentage, step.count > 0 ? 3 : 0)}%`,
                        backgroundColor: step.color,
                        boxShadow: `0 0 10px ${step.color}66`,
                      }}
                    />
                  </div>
                </div>
              ))}

              {/* Rejections Separator */}
              <div className="pt-3 border-t border-white/[0.08] flex items-center justify-between text-xs">
                <span className="text-[#EC4899] font-semibold flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Rejected / Ineligible Candidates
                </span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#F472B6] font-mono">
                    {overview.rejections?.count ?? 0}
                  </span>
                  <span className="text-[10px] font-mono text-[#94A3B8]">
                    ({overview.rejections?.percentage ?? 0}%)
                  </span>
                </div>
              </div>
            </div>
          )}
        </GlassCard>

        {/* Right Column: Application Trends Over Time (7 Cols) */}
        <GlassCard className="lg:col-span-7 p-6 space-y-5" glowVariant="cyan">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#06B6D4]" />
                Application Volume Trends
              </h2>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Timestamp-based candidate submission activity
              </p>
            </div>

            {/* Date Range Selector */}
            <div className="flex items-center gap-1 bg-white/[0.04] p-1 rounded-xl border border-white/[0.08]">
              {[
                { key: '7d', label: '7D' },
                { key: '30d', label: '30D' },
                { key: '90d', label: '90D' },
                { key: 'all', label: 'All' },
              ].map((r) => (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => handleTrendRangeChange(r.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold transition-all cursor-pointer ${
                    trendRange === r.key
                      ? 'bg-[#06B6D4]/25 text-[#38BDF8] border border-[#06B6D4]/40 shadow-sm'
                      : 'text-[#94A3B8] hover:text-[#F8FAFC]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          {trendsLoading ? (
            <div className="h-60 flex items-center justify-center text-xs text-[#94A3B8] animate-pulse">
              Aggregating timeline datapoints...
            </div>
          ) : trends.points.length === 0 ? (
            <div className="h-60 flex flex-col items-center justify-center text-center text-xs text-[#64748B] space-y-2">
              <BarChart3 className="w-8 h-8 opacity-40 text-[#64748B]" />
              <p>No submission records found within the selected {trendRange} period.</p>
            </div>
          ) : (
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trends.points} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorSelected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis
                    dataKey="displayDate"
                    stroke="#64748B"
                    fontSize={10}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <YAxis
                    stroke="#64748B"
                    fontSize={10}
                    allowDecimals={false}
                    tickLine={false}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(13, 16, 32, 0.95)',
                      borderColor: 'rgba(139, 92, 246, 0.3)',
                      borderRadius: '12px',
                      color: '#F8FAFC',
                      fontSize: '11px',
                      boxShadow: '0 0 20px rgba(0,0,0,0.6)',
                    }}
                    labelStyle={{ color: '#06B6D4', fontWeight: 'bold', marginBottom: '4px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Applications"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorTotal)"
                  />
                  <Area
                    type="monotone"
                    dataKey="selected"
                    name="Selected / Offers"
                    stroke="#10B981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorSelected)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </GlassCard>
      </div>

      {/* 4. Skill Demand & Factual Recruitment Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top In-Demand Skills (6 Cols) */}
        <GlassCard className="lg:col-span-6 p-6 space-y-4" glowVariant="green">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#22D3A7]" />
                Skill Demand Analytics
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Calculated across {skillDemand.totalPublishedJobs} active published job requisitions
              </p>
            </div>
            <GlowBadge variant="green" size="xs">
              Structured Skills
            </GlowBadge>
          </div>

          {skillDemand.topSkills.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B]">
              No published jobs with structured skill requirements found.
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {skillDemand.topSkills.slice(0, 7).map((skillItem) => (
                <div key={skillItem.skill} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#F8FAFC]">{skillItem.skill}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-[#22D3A7] bg-[#22D3A7]/10 px-2 py-0.5 rounded-md border border-[#22D3A7]/20">
                        {skillItem.requiredCount} {skillItem.requiredCount === 1 ? 'Job' : 'Jobs'}
                      </span>
                      <span className="text-[10px] font-mono text-[#94A3B8]">
                        {skillItem.percentageOfJobs}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#06B6D4] to-[#22D3A7] rounded-full"
                      style={{ width: `${Math.max(5, skillItem.percentageOfJobs)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Factual Recruitment Insights (6 Cols) */}
        <GlassCard className="lg:col-span-6 p-6 space-y-4" glowVariant="amber">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                Recruitment Intelligence Facts
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Deterministic observations synthesized from PostgreSQL metrics
              </p>
            </div>
            <GlowBadge variant="amber" size="xs">
              Platform Intel
            </GlowBadge>
          </div>

          <div className="space-y-3 pt-1">
            {insights.facts.length > 0 ? (
              insights.facts.map((fact) => (
                <div
                  key={fact.id}
                  className="p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-1 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        fact.type === 'warning'
                          ? 'bg-[#F59E0B]'
                          : fact.type === 'conversion'
                          ? 'bg-[#10B981]'
                          : fact.type === 'action'
                          ? 'bg-[#8B5CF6]'
                          : 'bg-[#06B6D4]'
                      }`}
                    />
                    <span className="font-bold text-[#F8FAFC]">{fact.title}</span>
                  </div>
                  <p className="text-[#CBD5E1] text-[11px] leading-relaxed pl-4">
                    {fact.statement}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-xs text-[#64748B] italic py-4 text-center">
                Insights will dynamically generate as candidate applications and job postings grow.
              </p>
            )}

            {/* Upcoming Deadlines Radar Badge */}
            {deadlines.summary?.closingWithin7Days > 0 && (
              <div className="p-3 rounded-xl bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-xs text-[#FBBF24] flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Clock className="w-3.5 h-3.5" />
                  {deadlines.summary.closingWithin7Days} Requisition(s) closing within 7 days
                </span>
                <Link to="/admin/jobs" className="underline font-bold text-white hover:text-[#F59E0B]">
                  Inspect →
                </Link>
              </div>
            )}
          </div>
        </GlassCard>
      </div>

      {/* 5. Job Performance Matrix */}
      <GlassCard className="p-6 space-y-4" glowVariant="violet">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[#8B5CF6]" />
              Requisition Performance & Candidate Breakdown
            </h2>
            <p className="text-[11px] text-[#94A3B8] mt-0.5">
              Live funnel breakdown for every active job opportunity
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-[#64748B] flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" />
              Sort:
            </span>
            <select
              value={jobSortBy}
              onChange={(e) => handleJobSortChange(e.target.value)}
              className="bg-[rgba(10,12,25,0.8)] border border-white/[0.08] rounded-xl px-3 py-1.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 cursor-pointer"
            >
              <option value="applications_desc">Most Applications</option>
              <option value="applications_asc">Fewest Applications</option>
              <option value="match_desc">Highest Avg AI Match</option>
              <option value="deadline_asc">Approaching Deadline</option>
              <option value="newest">Newest Created</option>
            </select>
          </div>
        </div>

        {jobPerformance.jobs.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#64748B]">
            No job requisitions recorded. Create a job to view analytics.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-white/[0.08] text-[#94A3B8] uppercase text-[10px] font-semibold tracking-wider bg-white/[0.02]">
                  <th className="py-3 px-3">Job Position</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Total Apps</th>
                  <th className="py-3 px-3 text-center">Under Review</th>
                  <th className="py-3 px-3 text-center">Shortlist</th>
                  <th className="py-3 px-3 text-center">Interview</th>
                  <th className="py-3 px-3 text-center">Selected</th>
                  <th className="py-3 px-3 text-center">Avg Match</th>
                  <th className="py-3 px-3">Deadline</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {jobPerformance.jobs.map((job) => (
                  <tr key={job.id} className="hover:bg-white/[0.02] transition-colors group">
                    {/* Position */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <Link
                          to={`/admin/jobs/${job.id}`}
                          className="font-bold text-[#F8FAFC] group-hover:text-[#06B6D4] transition-colors block truncate max-w-xs"
                        >
                          {job.title}
                        </Link>
                        <div className="text-[11px] text-[#64748B]">
                          {job.companyName} • {job.location}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-3">
                      <span
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          job.status === 'PUBLISHED'
                            ? 'bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30'
                            : job.status === 'DRAFT'
                            ? 'bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30'
                            : 'bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30'
                        }`}
                      >
                        {job.status}
                      </span>
                    </td>

                    {/* Total Applications */}
                    <td className="py-3 px-3 text-center font-bold font-mono text-[#F8FAFC]">
                      {job.totalApplications}
                    </td>

                    {/* Under Review */}
                    <td className="py-3 px-3 text-center font-mono text-[#38BDF8]">
                      {(job.breakdown?.SUBMITTED || 0) + (job.breakdown?.UNDER_REVIEW || 0)}
                    </td>

                    {/* Shortlisted */}
                    <td className="py-3 px-3 text-center font-mono text-[#22D3A7]">
                      {job.breakdown?.SHORTLISTED || 0}
                    </td>

                    {/* Interview */}
                    <td className="py-3 px-3 text-center font-mono text-[#FBBF24]">
                      {job.breakdown?.INTERVIEW || 0}
                    </td>

                    {/* Selected */}
                    <td className="py-3 px-3 text-center font-mono text-[#34D399] font-bold">
                      {job.breakdown?.SELECTED || 0}
                    </td>

                    {/* Avg Match */}
                    <td className="py-3 px-3 text-center font-mono text-[11px]">
                      {job.averageMatchScore ? (
                        <span className="font-bold text-[#06B6D4]">{job.averageMatchScore}%</span>
                      ) : (
                        <span className="text-[#64748B]">—</span>
                      )}
                    </td>

                    {/* Deadline */}
                    <td className="py-3 px-3 text-[11px] font-mono">
                      {job.applicationDeadline ? (
                        <span
                          className={
                            job.isDeadlinePassed
                              ? 'text-red-400 font-semibold'
                              : job.daysUntilDeadline <= 3
                              ? 'text-amber-400 font-semibold'
                              : 'text-[#94A3B8]'
                          }
                        >
                          {new Date(job.applicationDeadline).toLocaleDateString()}
                          {job.daysUntilDeadline !== null && (
                            <span className="block text-[9px]">
                              {job.isDeadlinePassed ? 'Expired' : `(${job.daysUntilDeadline}d left)`}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-[#64748B]">None</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right">
                      <Link to={`/admin/applications?jobId=${job.id}`}>
                        <GradientButton variant="glass" size="xs" icon={Users}>
                          Candidates
                        </GradientButton>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </GlassCard>

      {/* 6. Recent Applications & Live Activity Feed (Side-by-Side) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Applications Table (7 Cols) */}
        <GlassCard className="lg:col-span-7 p-6 space-y-4" glowVariant="cyan">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#06B6D4]" />
                Recent Candidate Submissions
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Latest candidate applications received across all requisitions
              </p>
            </div>
            <Link
              to="/admin/applications"
              className="text-xs font-semibold text-[#06B6D4] hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentApplications.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#64748B]">
              No recent candidate submissions found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] text-[#94A3B8] uppercase text-[10px] font-semibold">
                    <th className="pb-2.5">Candidate</th>
                    <th className="pb-2.5">Job Requisition</th>
                    <th className="pb-2.5 text-center">Match</th>
                    <th className="pb-2.5 text-center">Status</th>
                    <th className="pb-2.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {recentApplications.map((app) => {
                    const statusConf = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
                    const score = app.matchScore || app.jobOptimization?.matchScore;

                    return (
                      <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-[#F8FAFC]">{app.user?.name}</div>
                          <div className="text-[10px] text-[#64748B] font-mono">{app.user?.email}</div>
                        </td>
                        <td className="py-3">
                          <div className="font-semibold text-[#CBD5E1] truncate max-w-xs">{app.job?.title}</div>
                          <div className="text-[10px] text-[#94A3B8]">{app.job?.companyName}</div>
                        </td>
                        <td className="py-3 text-center font-mono">
                          {score ? (
                            <span className="font-bold text-[#06B6D4]">{score}%</span>
                          ) : (
                            <span className="text-[#64748B]">—</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <GlowBadge variant={statusConf.variant} size="xs">
                            {statusConf.label}
                          </GlowBadge>
                        </td>
                        <td className="py-3 text-right">
                          <Link to={`/admin/applications/${app.id}`}>
                            <GradientButton variant="glass" size="xs" icon={ChevronRight}>
                              Review
                            </GradientButton>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </GlassCard>

        {/* Live Activity Feed (5 Cols) */}
        <GlassCard className="lg:col-span-5 p-6 space-y-4" glowVariant="violet">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#8B5CF6]" />
                Recruitment Activity Feed
              </h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">
                Audit stream of hiring stage transitions
              </p>
            </div>
            <GlowBadge variant="violet" size="xs">
              Live Audit
            </GlowBadge>
          </div>

          {activityFeed.length === 0 ? (
            <p className="text-xs text-[#64748B] italic py-8 text-center">
              No application status transitions recorded in history yet.
            </p>
          ) : (
            <div className="space-y-3">
              {activityFeed.map((act) => {
                const conf = STATUS_CONFIG[act.newStatus] || STATUS_CONFIG.SUBMITTED;
                return (
                  <div
                    key={act.id}
                    className="p-3 bg-[rgba(10,12,25,0.7)] border border-white/[0.06] rounded-xl space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#F8FAFC] truncate">
                        {act.candidateName}
                      </span>
                      <GlowBadge variant={conf.variant} size="xs">
                        {conf.label}
                      </GlowBadge>
                    </div>
                    <p className="text-[11px] text-[#94A3B8] truncate">
                      {act.jobTitle} • {act.companyName}
                    </p>
                    {act.note && (
                      <p className="text-[11px] text-[#CBD5E1] italic bg-white/[0.02] p-1.5 rounded-lg border border-white/[0.04]">
                        "{act.note}"
                      </p>
                    )}
                    <div className="flex items-center justify-between text-[10px] text-[#64748B] font-mono pt-1">
                      <span>by {act.actorName}</span>
                      <span>{new Date(act.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
