import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Users,
  Briefcase,
  Search,
  Filter,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  FileText,
  ChevronRight,
  ChevronLeft,
  Layers,
  ShieldCheck,
  ArrowUpDown,
  UserCheck,
  XCircle,
} from 'lucide-react';
import { getAdminApplicationsApi, getAdminJobsApi } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GradientButton from '../../components/ui/GradientButton';
import GlowBadge from '../../components/ui/GlowBadge';
import PageHeader from '../../components/ui/PageHeader';
import AIOrb from '../../components/ui/AIOrb';
import EmptyState from '../../components/ui/EmptyState';
import AnimatedMetric from '../../components/ui/AnimatedMetric';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'SUBMITTED', label: 'Submitted' },
  { value: 'UNDER_REVIEW', label: 'Under Review' },
  { value: 'SHORTLISTED', label: 'Shortlisted' },
  { value: 'INTERVIEW', label: 'Interview' },
  { value: 'SELECTED', label: 'Selected' },
  { value: 'REJECTED', label: 'Rejected' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Submission Date (Newest first)' },
  { value: 'oldest', label: 'Submission Date (Oldest first)' },
  { value: 'match_desc', label: 'AI Match Score (Highest first)' },
  { value: 'match_asc', label: 'AI Match Score (Lowest first)' },
  { value: 'status', label: 'Application Status' },
];

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', variant: 'violet' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'cyan' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'green' },
  INTERVIEW: { label: 'Interview', variant: 'amber' },
  SELECTED: { label: 'Selected', variant: 'green' },
  REJECTED: { label: 'Rejected', variant: 'pink' },
};

export default function AdminApplicationsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialJobId = searchParams.get('jobId') || '';

  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    TOTAL: 0,
    SUBMITTED: 0,
    UNDER_REVIEW: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
  });
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 20, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load jobs list for dropdown filter
  useEffect(() => {
    getAdminJobsApi({ limit: 50 })
      .then((res) => {
        if (res.success && res.data) setJobs(res.data.jobs || []);
      })
      .catch(() => {});
  }, []);

  // Load applications and stats
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const params = {
      jobId: selectedJobId || undefined,
      status: selectedStatus || undefined,
      search: searchQuery.trim() || undefined,
      sortBy,
      page: pagination.page,
      limit: pagination.limit,
    };

    getAdminApplicationsApi(params)
      .then((data) => {
        if (isMounted && data.success) {
          setApplications(data.applications || []);
          if (data.stats) setStats(data.stats);
          if (data.pagination) setPagination(data.pagination);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load applications.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedJobId, selectedStatus, searchQuery, sortBy, pagination.page, pagination.limit]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in py-4 max-w-7xl mx-auto">
      {/* Header */}
      <PageHeader
        title="Candidate Applications Review"
        badge={
          <GlowBadge variant="violet" size="sm">
            Recruitment Command
          </GlowBadge>
        }
        subtitle="Review incoming candidate submissions, evaluate AI match alignments, and progress candidates through hiring stages."
        action={
          <Link to="/admin/jobs">
            <GradientButton variant="glass" size="sm" icon={Briefcase}>
              Manage Requisitions
            </GradientButton>
          </Link>
        }
      />

      {/* Real-time KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { key: '', label: 'Total Apps', count: stats.TOTAL, color: 'border-white/10 text-[#F8FAFC]', glow: 'white' },
          { key: 'SUBMITTED', label: 'Submitted', count: stats.SUBMITTED, color: 'border-[#8B5CF6]/30 text-[#C084FC]', glow: 'violet' },
          { key: 'UNDER_REVIEW', label: 'Reviewing', count: stats.UNDER_REVIEW, color: 'border-[#06B6D4]/30 text-[#38BDF8]', glow: 'cyan' },
          { key: 'SHORTLISTED', label: 'Shortlisted', count: stats.SHORTLISTED, color: 'border-[#22D3A7]/30 text-[#22D3A7]', glow: 'green' },
          { key: 'INTERVIEW', label: 'Interview', count: stats.INTERVIEW, color: 'border-[#F59E0B]/30 text-[#FBBF24]', glow: 'amber' },
          { key: 'SELECTED', label: 'Selected', count: stats.SELECTED, color: 'border-[#10B981]/30 text-[#34D399]', glow: 'green' },
          { key: 'REJECTED', label: 'Rejected', count: stats.REJECTED, color: 'border-[#EC4899]/30 text-[#F472B6]', glow: 'pink' },
        ].map((item) => (
          <button
            key={item.label}
            onClick={() => {
              setSelectedStatus(item.key);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            className={`p-3 rounded-2xl bg-[rgba(10,12,25,0.7)] border transition-all text-left cursor-pointer group ${
              selectedStatus === item.key
                ? `${item.color} bg-white/[0.08] shadow-lg scale-[1.02]`
                : 'border-white/[0.06] hover:border-white/20'
            }`}
          >
            <span className="text-[10px] font-mono uppercase text-[#94A3B8] block truncate">
              {item.label}
            </span>
            <div className="text-xl font-black mt-1 text-[#F8FAFC]">
              <AnimatedMetric value={item.count ?? 0} />
            </div>
          </button>
        ))}
      </div>

      {/* Filter & Search Bar */}
      <GlassCard className="p-4 sm:p-5 space-y-4" glowVariant="violet">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search candidate, email, role..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full bg-[rgba(10,12,25,0.8)] border border-white/[0.08] rounded-xl pl-10 pr-3 py-2 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
            />
          </div>

          {/* Job Filter Dropdown */}
          <div>
            <select
              value={selectedJobId}
              onChange={(e) => {
                setSelectedJobId(e.target.value);
                setSearchParams(e.target.value ? { jobId: e.target.value } : {});
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full bg-[rgba(10,12,25,0.8)] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors cursor-pointer"
            >
              <option value="">All Job Opportunities ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.companyName})
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter Dropdown */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full bg-[rgba(10,12,25,0.8)] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sorting Dropdown */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full bg-[rgba(10,12,25,0.8)] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors cursor-pointer"
            >
              {SORT_OPTIONS.map((sort) => (
                <option key={sort.value} value={sort.value}>
                  Sort: {sort.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </GlassCard>

      {/* Applications Table */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <AIOrb size="md" state="thinking" showIcon={false} />
          <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
            Loading Candidate Applications...
          </span>
        </div>
      ) : error ? (
        <GlassCard className="p-8 text-center space-y-3" glowVariant="pink">
          <AlertCircle className="w-8 h-8 text-[#EC4899] mx-auto" />
          <h3 className="text-sm font-bold text-[#F8FAFC]">{error}</h3>
        </GlassCard>
      ) : applications.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidate applications found"
          description="There are currently no candidate applications matching your filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSelectedJobId('');
            setSelectedStatus('');
            setSearchQuery('');
            setSortBy('newest');
            setSearchParams({});
          }}
        />
      ) : (
        <div className="space-y-4">
          <GlassCard className="overflow-hidden p-0 border-white/[0.08]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-white/[0.02] text-[#94A3B8] uppercase text-[10px] tracking-wider font-semibold">
                    <th className="py-3.5 px-4">Candidate</th>
                    <th className="py-3.5 px-4">Job Requisition</th>
                    <th className="py-3.5 px-4 text-center">AI Match</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4">Submitted</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {applications.map((app) => {
                    const statusConf = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
                    const score = app.matchScore || app.jobOptimization?.matchScore;

                    return (
                      <tr
                        key={app.id}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        {/* Candidate Column */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="font-bold text-[#F8FAFC] group-hover:text-[#06B6D4] transition-colors">
                              {app.user?.name}
                            </div>
                            <div className="text-[11px] text-[#64748B] font-mono">
                              {app.user?.email}
                            </div>
                          </div>
                        </td>

                        {/* Job Column */}
                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-[#F8FAFC]">
                              {app.job?.title}
                            </div>
                            <div className="text-[11px] text-[#94A3B8]">
                              {app.job?.companyName}
                            </div>
                          </div>
                        </td>

                        {/* Match Score Column */}
                        <td className="py-3.5 px-4 text-center">
                          {score ? (
                            <span
                              className={`px-2.5 py-1 rounded-full font-bold font-mono text-[11px] ${
                                score >= 75
                                  ? 'bg-[#22D3A7]/15 text-[#22D3A7] border border-[#22D3A7]/30'
                                  : score >= 55
                                  ? 'bg-[#06B6D4]/15 text-[#06B6D4] border border-[#06B6D4]/30'
                                  : 'bg-[#EC4899]/15 text-[#F472B6] border border-[#EC4899]/30'
                              }`}
                            >
                              {score}%
                            </span>
                          ) : (
                            <span className="text-[11px] text-[#64748B] font-mono">—</span>
                          )}
                        </td>

                        {/* Status Column */}
                        <td className="py-3.5 px-4 text-center">
                          <GlowBadge variant={statusConf.variant} size="xs">
                            {statusConf.label}
                          </GlowBadge>
                        </td>

                        {/* Submitted Date */}
                        <td className="py-3.5 px-4 text-[11px] text-[#64748B] font-mono">
                          {new Date(app.submittedAt).toLocaleDateString()}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
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
          </GlassCard>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-2 py-3 text-xs text-[#94A3B8]">
              <div>
                Showing{' '}
                <span className="font-bold text-[#F8FAFC]">
                  {(pagination.page - 1) * pagination.limit + 1}
                </span>{' '}
                to{' '}
                <span className="font-bold text-[#F8FAFC]">
                  {Math.min(pagination.page * pagination.limit, pagination.total)}
                </span>{' '}
                of <span className="font-bold text-[#F8FAFC]">{pagination.total}</span> candidate applications
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed text-[#F8FAFC] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <span className="px-3 py-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08] font-mono text-[11px] text-[#CBD5E1]">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  type="button"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="px-3 py-1.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] disabled:opacity-40 disabled:cursor-not-allowed text-[#F8FAFC] transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
