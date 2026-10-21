import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Building2,
  MapPin,
  Calendar,
  Users,
  AlertCircle,
  MoreVertical,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import {
  getAdminJobsApi,
  updateAdminJobStatusApi,
  deleteAdminJobApi,
} from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GlowBadge from '../../components/ui/GlowBadge';
import GradientButton from '../../components/ui/GradientButton';
import AIOrb from '../../components/ui/AIOrb';

export default function AdminJobsListPage() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [counts, setCounts] = useState({ total: 0, draft: 0, published: 0, closed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('ALL');
  const [empTypeFilter, setEmpTypeFilter] = useState('ALL');

  // Delete modal state
  const [deleteModalJob, setDeleteModalJob] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Status updating state
  const [updatingId, setUpdatingId] = useState(null);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (workModeFilter !== 'ALL') params.workMode = workModeFilter;
      if (empTypeFilter !== 'ALL') params.employmentType = empTypeFilter;

      const res = await getAdminJobsApi(params);
      if (res.success && res.data) {
        setJobs(res.data.jobs || []);
        if (res.data.counts) setCounts(res.data.counts);
      } else {
        setError(res.message || 'Failed to load jobs');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to job management service');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [statusFilter, workModeFilter, empTypeFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const handleStatusChange = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      const res = await updateAdminJobStatusApi(id, newStatus);
      if (res.success) {
        setSuccessMsg(res.message || 'Status updated successfully');
        setTimeout(() => setSuccessMsg(''), 4000);
        fetchJobs();
      }
    } catch (err) {
      setError(err.message || 'Failed to update job status');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModalJob) return;
    setDeleting(true);
    try {
      const res = await deleteAdminJobApi(deleteModalJob.id);
      if (res.success) {
        setSuccessMsg('Job requisition deleted successfully');
        setTimeout(() => setSuccessMsg(''), 4000);
        setDeleteModalJob(null);
        fetchJobs();
      }
    } catch (err) {
      setError(err.message || 'Failed to delete job');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#10B981]/15 text-[#34D399] border border-[#10B981]/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#34D399] animate-pulse" />
            PUBLISHED
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#F59E0B]/15 text-[#FBBF24] border border-[#F59E0B]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FBBF24]" />
            DRAFT
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-[#EF4444]/15 text-[#F87171] border border-[#EF4444]/30">
            <span className="w-1.5 h-1.5 rounded-full bg-[#F87171]" />
            CLOSED
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[rgba(139,92,246,0.15)] via-[rgba(6,182,212,0.1)] to-[rgba(245,158,11,0.08)] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <GlowBadge variant="ai" size="xs" icon={Briefcase}>
              Job Management
            </GlowBadge>
            <span className="text-[11px] font-mono text-[#06B6D4] font-semibold">
              Recruitment OS Active
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
            Job Requisitions
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mt-0.5">
            Create, publish, and manage job opportunities for student candidates across technical disciplines.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link to="/admin/jobs/create">
            <GradientButton variant="primary" size="md" icon={Plus}>
              Create Job
            </GradientButton>
          </Link>
        </div>

        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-[#8B5CF6]/20 blur-3xl pointer-events-none" />
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 flex items-center gap-3 text-xs animate-fade-in shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-center gap-3 text-xs animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Status Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.08] pb-3">
        {[
          { key: 'ALL', label: 'All Jobs', count: counts.total },
          { key: 'PUBLISHED', label: 'Published', count: counts.published },
          { key: 'DRAFT', label: 'Drafts', count: counts.draft },
          { key: 'CLOSED', label: 'Closed', count: counts.closed },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 cursor-pointer ${
              statusFilter === tab.key
                ? 'bg-[#8B5CF6]/20 text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04]'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                statusFilter === tab.key
                  ? 'bg-[#8B5CF6]/40 text-white'
                  : 'bg-white/[0.06] text-[#64748B]'
              }`}
            >
              {tab.count ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* 3. Search and Secondary Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by job title, company, or location..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          >
            Filter
          </button>
        </form>

        {/* Work Mode Filter */}
        <div>
          <select
            value={workModeFilter}
            onChange={(e) => setWorkModeFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors cursor-pointer"
          >
            <option value="ALL">All Work Modes</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
            <option value="ON_SITE">On-Site</option>
          </select>
        </div>

        {/* Employment Type Filter */}
        <div>
          <select
            value={empTypeFilter}
            onChange={(e) => setEmpTypeFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors cursor-pointer"
          >
            <option value="ALL">All Employment Types</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="PART_TIME">Part-time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>
      </div>

      {/* 4. Jobs List / Table View */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <AIOrb size="md" state="thinking" showIcon={false} />
          <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
            Loading Job Requisitions...
          </span>
        </div>
      ) : jobs.length === 0 ? (
        /* Empty State */
        <GlassCard className="p-12 text-center">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] mb-4">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC] mb-1">
              No jobs found
            </h3>
            <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
              {searchQuery || statusFilter !== 'ALL' || workModeFilter !== 'ALL'
                ? 'No job requisitions match your current search and filter criteria.'
                : 'No job requisitions created yet. Create your first job opportunity to begin.'}
            </p>
            <Link to="/admin/jobs/create">
              <GradientButton variant="primary" size="md" icon={Plus}>
                Create Job
              </GradientButton>
            </Link>
          </div>
        </GlassCard>
      ) : (
        /* Job Cards Grid */
        <div className="space-y-3">
          {jobs.map((job) => (
            <GlassCard
              key={job.id}
              className="p-5 hover:border-white/20 transition-all duration-200 group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Job Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      to={`/admin/jobs/${job.id}`}
                      className="text-base font-bold text-[#F8FAFC] hover:text-[#06B6D4] transition-colors flex items-center gap-1.5"
                    >
                      <span>{job.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-[#06B6D4]" />
                    </Link>
                    {getStatusBadge(job.status)}
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-[#94A3B8]">
                      {job.workMode}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-white/[0.06] text-[#94A3B8]">
                      {job.employmentType?.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#94A3B8]">
                    <span className="flex items-center gap-1.5 font-medium text-[#F8FAFC]">
                      <Building2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      {job.companyName}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
                      {job.location}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-[#EC4899]" />
                      Exp: {job.experienceRequired}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#F59E0B]" />
                      Openings: {job.openings}
                    </span>
                    <Link
                      to={`/admin/applications?jobId=${job.id}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#8B5CF6]/15 text-[#C084FC] hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/30 font-semibold transition-colors"
                      title="View all candidates who applied for this job"
                    >
                      <Users className="w-3 h-3 text-[#C084FC]" />
                      <span>{job._count?.applications ?? 0} Applications</span>
                    </Link>
                    {job.applicationDeadline && (
                      <span className="flex items-center gap-1.5 text-[#64748B]">
                        <Calendar className="w-3.5 h-3.5" />
                        Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Skills preview tags */}
                  {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {job.requiredSkills.slice(0, 5).map((skill, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 text-[10px] font-mono text-[#C084FC]"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 5 && (
                        <span className="text-[10px] font-mono text-[#64748B]">
                          +{job.requiredSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Actions & Telemetry */}
                <div className="flex flex-wrap items-center gap-2.5 lg:self-center border-t lg:border-t-0 pt-3 lg:pt-0 border-white/[0.06]">
                  {/* Candidates Review Link */}
                  <Link
                    to={`/admin/applications?jobId=${job.id}`}
                    className="px-3 py-1.5 rounded-xl bg-[#8B5CF6]/15 hover:bg-[#8B5CF6]/25 border border-[#8B5CF6]/30 text-xs font-semibold text-[#C084FC] transition-all flex items-center gap-1.5"
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Candidates ({job._count?.applications ?? 0})</span>
                  </Link>

                  {/* Quick Status Toggle */}
                  {job.status === 'DRAFT' && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                      disabled={updatingId === job.id}
                      className="px-3 py-1.5 rounded-xl bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-xs font-semibold text-[#34D399] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Publish</span>
                    </button>
                  )}

                  {job.status === 'PUBLISHED' && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'CLOSED')}
                      disabled={updatingId === job.id}
                      className="px-3 py-1.5 rounded-xl bg-[#EF4444]/15 hover:bg-[#EF4444]/25 border border-[#EF4444]/30 text-xs font-semibold text-[#F87171] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Close</span>
                    </button>
                  )}

                  {job.status === 'CLOSED' && (
                    <button
                      onClick={() => handleStatusChange(job.id, 'PUBLISHED')}
                      disabled={updatingId === job.id}
                      className="px-3 py-1.5 rounded-xl bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 border border-[#06B6D4]/30 text-xs font-semibold text-[#38BDF8] transition-all cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Reopen</span>
                    </button>
                  )}

                  <Link
                    to={`/admin/jobs/${job.id}`}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F8FAFC] transition-colors"
                    title="View Job Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/admin/jobs/${job.id}/edit`}
                    className="p-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] text-[#F8FAFC] transition-colors"
                    title="Edit Job"
                  >
                    <Edit className="w-4 h-4" />
                  </Link>

                  <button
                    onClick={() => setDeleteModalJob(job)}
                    className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors cursor-pointer"
                    title="Delete Job"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* 5. Delete Confirmation Modal */}
      {deleteModalJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-2xl bg-[#0D1020] border border-red-500/30 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-red-500/15 text-red-400 border border-red-500/20">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#F8FAFC]">Delete Job Requisition?</h3>
                <p className="text-xs text-[#94A3B8]">
                  "{deleteModalJob.title}" at {deleteModalJob.companyName}
                </p>
              </div>
            </div>

            <p className="text-xs text-[#94A3B8] leading-relaxed">
              This action will permanently delete this job requisition. This action cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalJob(null)}
                disabled={deleting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#94A3B8] hover:text-white hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
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
