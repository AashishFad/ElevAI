import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Building2,
  MapPin,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Filter,
  Search,
} from 'lucide-react';
import { getUserApplicationsApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import PageHeader from '../components/ui/PageHeader';
import EmptyState from '../components/ui/EmptyState';
import AIOrb from '../components/ui/AIOrb';

const STATUS_CONFIG = {
  SUBMITTED: { label: 'Submitted', variant: 'violet', glow: 'violet' },
  UNDER_REVIEW: { label: 'Under Review', variant: 'cyan', glow: 'cyan' },
  SHORTLISTED: { label: 'Shortlisted', variant: 'green', glow: 'green' },
  INTERVIEW: { label: 'Interviewing', variant: 'amber', glow: 'amber' },
  SELECTED: { label: 'Selected / Offer', variant: 'green', glow: 'green' },
  REJECTED: { label: 'Not Selected', variant: 'pink', glow: 'pink' },
};

const TABS = [
  { key: 'ALL', label: 'All Applications' },
  { key: 'SUBMITTED', label: 'Submitted' },
  { key: 'UNDER_REVIEW', label: 'Under Review' },
  { key: 'SHORTLISTED', label: 'Shortlisted' },
  { key: 'INTERVIEW', label: 'Interview' },
  { key: 'SELECTED', label: 'Selected' },
  { key: 'REJECTED', label: 'Archived / Closed' },
];

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError('');

    const params = activeTab !== 'ALL' ? { status: activeTab } : {};
    getUserApplicationsApi(params)
      .then((data) => {
        if (isMounted && data.success) {
          setApplications(data.applications || []);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load your applications.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const filteredApps = applications.filter((app) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const title = app.job?.title?.toLowerCase() || '';
    const company = app.job?.companyName?.toLowerCase() || '';
    return title.includes(query) || company.includes(query);
  });

  return (
    <div className="space-y-8 animate-fade-in py-4 max-w-5xl mx-auto">
      {/* Header */}
      <PageHeader
        title="My Job Applications"
        badge={
          <GlowBadge variant="cyan" size="sm">
            Recruitment Tracker
          </GlowBadge>
        }
        subtitle="Track real-time status updates, review submitted resumes, and follow your application progression."
        action={
          <Link to="/jobs">
            <GradientButton variant="primary" size="sm" icon={Briefcase}>
              Explore Opportunities
            </GradientButton>
          </Link>
        }
      />

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-4">
        {/* Horizontal Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#8B5CF6]/20 text-[#F8FAFC] border border-[#8B5CF6]/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.04] border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search Box */}
        <div className="relative min-w-[220px]">
          <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by role or company..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[rgba(10,12,25,0.7)] border border-white/[0.08] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <AIOrb size="md" state="thinking" showIcon={false} />
          <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
            Loading Applications...
          </span>
        </div>
      ) : error ? (
        <GlassCard className="p-8 text-center space-y-3" glowVariant="pink">
          <AlertCircle className="w-8 h-8 text-[#EC4899] mx-auto" />
          <h3 className="text-sm font-bold text-[#F8FAFC]">{error}</h3>
          <GradientButton
            variant="glass"
            size="xs"
            onClick={() => setActiveTab('ALL')}
          >
            Reset Filters
          </GradientButton>
        </GlassCard>
      ) : filteredApps.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title={searchQuery ? 'No matching applications found' : 'No applications submitted yet'}
          description={
            searchQuery
              ? 'Try changing your search terms or active status filter.'
              : 'Browse active job opportunities, analyze your resume alignment, and submit your candidacies.'
          }
          actionLabel="Browse Available Jobs"
          onAction={() => window.location.assign('/jobs')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredApps.map((app) => {
            const statusConfig = STATUS_CONFIG[app.status] || STATUS_CONFIG.SUBMITTED;
            const score = app.matchScore || app.jobOptimization?.matchScore;

            return (
              <GlassCard
                key={app.id}
                className="p-5 flex flex-col justify-between space-y-4 hover:border-white/20 transition-all group"
                glowVariant={statusConfig.glow}
              >
                {/* Top Row: Ref ID + Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono text-[#64748B] bg-white/[0.04] px-2 py-0.5 rounded-md border border-white/[0.06]">
                    #EVA-{app.id.substring(0, 8).toUpperCase()}
                  </span>

                  <GlowBadge variant={statusConfig.variant} size="xs">
                    {statusConfig.label}
                  </GlowBadge>
                </div>

                {/* Job Title & Company */}
                <div className="space-y-1.5">
                  <h3 className="text-sm sm:text-base font-black text-[#F8FAFC] group-hover:text-[#06B6D4] transition-colors line-clamp-1">
                    {app.job?.title || 'Job Opportunity'}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8]">
                    <span className="flex items-center gap-1 font-semibold text-[#F8FAFC]">
                      <Building2 className="w-3.5 h-3.5 text-[#8B5CF6]" />
                      {app.job?.companyName}
                    </span>
                    {app.job?.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#06B6D4]" />
                        {app.job?.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Resume & Match Score Row */}
                <div className="p-3 bg-[rgba(10,12,25,0.7)] border border-white/[0.06] rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <FileText className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                    <span className="text-[#94A3B8] truncate font-medium">
                      {app.resume?.originalFileName || 'Attached Resume'}
                    </span>
                  </div>

                  {score && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Sparkles className="w-3 h-3 text-[#06B6D4]" />
                      <span className="text-[11px] font-bold text-[#06B6D4]">{score}% Match</span>
                    </div>
                  )}
                </div>

                {/* Footer: Date & Details Button */}
                <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                    <Clock className="w-3 h-3" />
                    <span>Applied: {new Date(app.submittedAt).toLocaleDateString()}</span>
                  </div>

                  <Link
                    to={`/applications/${app.id}`}
                    className="text-xs font-bold text-[#06B6D4] hover:text-[#67E8F9] flex items-center gap-1 group/btn transition-colors"
                  >
                    <span>View Application</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
