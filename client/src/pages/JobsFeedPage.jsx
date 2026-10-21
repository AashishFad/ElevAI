import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Search,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Users,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2,
  Zap,
} from 'lucide-react';
import { getPublicJobsApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GlowBadge from '../components/ui/GlowBadge';
import GradientButton from '../components/ui/GradientButton';
import AIOrb from '../components/ui/AIOrb';

export default function JobsFeedPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [workMode, setWorkMode] = useState('ALL');
  const [employmentType, setEmploymentType] = useState('ALL');
  const [experience, setExperience] = useState('');

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (workMode !== 'ALL') params.workMode = workMode;
      if (employmentType !== 'ALL') params.employmentType = employmentType;
      if (experience.trim()) params.experience = experience.trim();

      const res = await getPublicJobsApi(params);
      if (res.success && res.data) {
        setJobs(res.data.jobs || []);
      } else {
        setError(res.message || 'Failed to load job opportunities');
      }
    } catch (err) {
      setError(err.message || 'Error connecting to job intelligence feed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [workMode, employmentType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchJobs();
  };

  const formatSalary = (min, max, visible) => {
    if (!visible) return null;
    if (!min && !max) return null;
    if (min && max) return `₹${min.toLocaleString()} – ₹${max.toLocaleString()}`;
    if (min) return `From ₹${min.toLocaleString()}`;
    return `Up to ₹${max.toLocaleString()}`;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[rgba(6,182,212,0.12)] via-[rgba(139,92,246,0.12)] to-[rgba(236,72,153,0.08)] border border-white/[0.08] backdrop-blur-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <GlowBadge variant="cyan" size="xs" icon={Briefcase}>
              Career Opportunities
            </GlowBadge>
            <span className="text-[11px] font-mono text-[#06B6D4] font-semibold">
              Live Job Feed
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
            Technical Job Opportunities
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] max-w-xl mt-0.5">
            Discover verified tech positions from recruiters. Evaluate your resume against any role to
            diagnose ATS compatibility and keyword alignment.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link to="/job-optimization">
            <GradientButton variant="primary" size="md" icon={Sparkles}>
              Custom ATS Matcher
            </GradientButton>
          </Link>
        </div>

        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#06B6D4]/20 blur-3xl pointer-events-none" />
      </div>

      {/* 2. Filter & Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <form onSubmit={handleSearchSubmit} className="md:col-span-2 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by job title, company name, or technology..."
            className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#06B6D4]/50 focus:ring-1 focus:ring-[#06B6D4]/50 transition-colors"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-[11px] font-semibold text-[#94A3B8] hover:text-white transition-colors cursor-pointer"
          >
            Search
          </button>
        </form>

        {/* Work Mode Filter */}
        <div>
          <select
            value={workMode}
            onChange={(e) => setWorkMode(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]/50 transition-colors cursor-pointer"
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
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]/50 transition-colors cursor-pointer"
          >
            <option value="ALL">All Employment Types</option>
            <option value="FULL_TIME">Full-Time</option>
            <option value="PART_TIME">Part-Time</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="CONTRACT">Contract</option>
          </select>
        </div>
      </div>

      {/* 3. Job Feed Content */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center gap-3">
          <AIOrb size="md" state="thinking" showIcon={false} />
          <span className="text-xs font-mono text-[#94A3B8] tracking-widest uppercase animate-pulse">
            Fetching Job Opportunities...
          </span>
        </div>
      ) : error ? (
        <GlassCard className="p-8 text-center text-red-300 text-xs">
          <p>{error}</p>
          <button
            onClick={fetchJobs}
            className="mt-3 px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors cursor-pointer"
          >
            Retry Connection
          </button>
        </GlassCard>
      ) : jobs.length === 0 ? (
        /* Empty State */
        <GlassCard className="p-12 text-center">
          <div className="flex flex-col items-center max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] mb-4">
              <Briefcase className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#F8FAFC] mb-1">
              You're all caught up!
            </h3>
            <p className="text-xs text-[#94A3B8] mb-6 leading-relaxed">
              {search || workMode !== 'ALL' || employmentType !== 'ALL'
                ? 'No published job opportunities match your filter criteria.'
                : 'No new job opportunities right now. New requisitions published by recruiters will appear here automatically.'}
            </p>
            {(search || workMode !== 'ALL' || employmentType !== 'ALL') && (
              <button
                onClick={() => {
                  setSearch('');
                  setWorkMode('ALL');
                  setEmploymentType('ALL');
                }}
                className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] text-xs font-semibold text-white transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        </GlassCard>
      ) : (
        /* Job Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobs.map((job) => {
            const salary = formatSalary(job.salaryMin, job.salaryMax, job.salaryVisible);
            return (
              <GlassCard
                key={job.id}
                glowVariant="cyan"
                className="p-6 flex flex-col justify-between hover:border-white/20 transition-all duration-200 group relative"
              >
                <div className="space-y-3.5">
                  {/* Company & Status header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center font-bold text-sm shadow-md">
                        {job.companyName?.charAt(0)?.toUpperCase() || 'C'}
                      </div>
                      <div>
                        <div className="font-bold text-[#F8FAFC] text-xs flex items-center gap-1.5">
                          <span>{job.companyName}</span>
                        </div>
                        <div className="text-[11px] text-[#94A3B8] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#06B6D4]" />
                          <span>{job.location}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-[#06B6D4]/15 text-[#38BDF8] border border-[#06B6D4]/30">
                        {job.workMode}
                      </span>
                    </div>
                  </div>

                  {/* Job Title */}
                  <div>
                    <Link
                      to={`/jobs/${job.id}`}
                      className="text-base font-bold text-[#F8FAFC] group-hover:text-[#06B6D4] transition-colors line-clamp-1"
                    >
                      {job.title}
                    </Link>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#94A3B8] mt-1">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3 h-3 text-[#8B5CF6]" />
                        {job.experienceRequired}
                      </span>
                      <span>•</span>
                      <span>{job.employmentType?.replace('_', ' ')}</span>
                      {salary && (
                        <>
                          <span>•</span>
                          <span className="text-[#10B981] font-medium">
                            {salary}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Required Skills Chips */}
                  {Array.isArray(job.requiredSkills) && job.requiredSkills.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {job.requiredSkills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg bg-[#8B5CF6]/15 border border-[#8B5CF6]/25 text-[10px] font-mono text-[#C084FC]"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 4 && (
                        <span className="text-[10px] font-mono text-[#64748B]">
                          +{job.requiredSkills.length - 4} more
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer & Action */}
                <div className="pt-4 mt-4 border-t border-white/[0.06] flex items-center justify-between">
                  <span className="text-[11px] text-[#64748B] flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {job.applicationDeadline
                      ? `Deadline: ${new Date(job.applicationDeadline).toLocaleDateString()}`
                      : 'Active Requisition'}
                  </span>

                  <Link
                    to={`/jobs/${job.id}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#06B6D4] hover:text-white transition-colors"
                  >
                    <span>View Role</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
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
