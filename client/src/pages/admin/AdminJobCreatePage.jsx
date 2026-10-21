import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Briefcase,
  ArrowLeft,
  Plus,
  X,
  Building2,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { createAdminJobApi } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GlowBadge from '../../components/ui/GlowBadge';
import GradientButton from '../../components/ui/GradientButton';

const SUGGESTED_SKILLS = [
  'Java',
  'Python',
  'JavaScript',
  'TypeScript',
  'React',
  'Node.js',
  'Express.js',
  'SQL',
  'PostgreSQL',
  'MongoDB',
  'AWS',
  'Docker',
  'Kubernetes',
  'Git',
  'REST APIs',
  'GraphQL',
  'Linux',
  'C++',
  'Spring Boot',
  'Tailwind CSS',
];

const DEFAULT_DESCRIPTION_TEMPLATE = `About the Role:
We are looking for a passionate technical professional to join our engineering team to design, build, and deploy high-impact distributed systems.

Responsibilities:
• Architect, develop, and maintain responsive web applications and backend APIs.
• Collaborate with cross-functional product and engineering teams.
• Participate in code reviews, automated unit testing, and technical documentation.
• Troubleshoot production bottlenecks and optimize application latency.

Required Qualifications:
• Strong grasp of fundamental data structures, algorithms, and object-oriented design.
• Practical hands-on experience in building modern software applications.
• Clear technical communication and collaborative mindset.

Preferred Qualifications:
• Experience with cloud deployments (AWS / GCP) and containerization (Docker).
• Familiarity with CI/CD deployment pipelines and relational database design.`;

export default function AdminJobCreatePage() {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    workMode: 'REMOTE',
    employmentType: 'FULL_TIME',
    experienceRequired: '0-1 years',
    educationRequirement: 'B.Tech / B.E. / BCA / MCA / B.Sc in Computer Science or related field',
    salaryMin: '',
    salaryMax: '',
    salaryVisible: true,
    description: DEFAULT_DESCRIPTION_TEMPLATE,
    openings: 1,
    applicationDeadline: '',
  });

  // Skills input state
  const [requiredSkills, setRequiredSkills] = useState(['Java', 'SQL', 'Git']);
  const [skillInput, setSkillInput] = useState('');
  const [preferredSkills, setPreferredSkills] = useState(['AWS', 'Docker']);
  const [prefSkillInput, setPrefSkillInput] = useState('');

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Required Skills Tag Management
  const addRequiredSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !requiredSkills.includes(trimmed)) {
      setRequiredSkills([...requiredSkills, trimmed]);
    }
    setSkillInput('');
  };

  const removeRequiredSkill = (skillToRemove) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skillToRemove));
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addRequiredSkill(skillInput);
    }
  };

  // Preferred Skills Tag Management
  const addPreferredSkill = (skill) => {
    const trimmed = skill.trim();
    if (trimmed && !preferredSkills.includes(trimmed)) {
      setPreferredSkills([...preferredSkills, trimmed]);
    }
    setPrefSkillInput('');
  };

  const removePreferredSkill = (skillToRemove) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skillToRemove));
  };

  const handlePrefSkillKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addPreferredSkill(prefSkillInput);
    }
  };

  // Submit Handler
  const handleSubmit = async (targetStatus) => {
    setError(null);

    // Client-side quick checks
    if (!formData.title.trim()) {
      setError('Job title is required');
      return;
    }
    if (!formData.companyName.trim()) {
      setError('Company name is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill');
      return;
    }
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      setError('Job description must be at least 10 characters long');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        requiredSkills,
        preferredSkills,
        status: targetStatus,
        salaryMin: formData.salaryMin ? parseInt(formData.salaryMin, 10) : null,
        salaryMax: formData.salaryMax ? parseInt(formData.salaryMax, 10) : null,
        openings: parseInt(formData.openings || '1', 10),
        applicationDeadline: formData.applicationDeadline || null,
      };

      const res = await createAdminJobApi(payload);
      if (res.success && res.job) {
        navigate('/admin/jobs');
      } else {
        setError(res.message || 'Failed to create job opportunity');
      }
    } catch (err) {
      setError(err.message || 'Server error while creating job opportunity');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* 1. Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin/jobs"
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Job Management</span>
          </Link>
          <div className="flex items-center gap-2">
            <GlowBadge variant="ai" size="xs" icon={Briefcase}>
              New Requisition
            </GlowBadge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#F8FAFC] tracking-tight mt-1">
            Create Job Opportunity
          </h1>
        </div>

        {/* Dual Actions in Header */}
        <div className="flex items-center gap-3">
          <GradientButton
            variant="glass"
            size="md"
            loading={submitting}
            onClick={() => handleSubmit('DRAFT')}
          >
            Save Draft
          </GradientButton>
          <GradientButton
            variant="primary"
            size="md"
            icon={Sparkles}
            loading={submitting}
            onClick={() => handleSubmit('PUBLISHED')}
          >
            Publish Job
          </GradientButton>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/15 border border-red-500/30 text-red-300 flex items-center gap-3 text-xs animate-fade-in shadow-lg">
          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. Main Form */}
      <div className="space-y-6">
        {/* Section A: Basic Job Information */}
        <GlassCard className="p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <Building2 className="w-4 h-4 text-[#8B5CF6]" />
            Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Job Title */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Job Title <span className="text-[#EC4899]">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g. Associate Software Engineer"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-colors"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Company Name <span className="text-[#EC4899]">*</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                placeholder="e.g. Ensono / Acme Corp"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-colors"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Location <span className="text-[#EC4899]">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g. Pune, India / Bengaluru / Remote"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 focus:ring-1 focus:ring-[#8B5CF6]/50 transition-colors"
              />
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Work Mode
              </label>
              <select
                name="workMode"
                value={formData.workMode}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors cursor-pointer"
              >
                <option value="REMOTE">Remote (Work from Anywhere)</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site / In-Office</option>
              </select>
            </div>

            {/* Employment Type */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Employment Type
              </label>
              <select
                name="employmentType"
                value={formData.employmentType}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors cursor-pointer"
              >
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="CONTRACT">Contract</option>
              </select>
            </div>

            {/* Openings */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Number of Openings
              </label>
              <input
                type="number"
                name="openings"
                min="1"
                value={formData.openings}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
              />
            </div>
          </div>
        </GlassCard>

        {/* Section B: Role Requirements & Structured Skills */}
        <GlassCard className="p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <Layers className="w-4 h-4 text-[#06B6D4]" />
            Role Requirements & Skills
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Experience Required */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Experience Required <span className="text-[#EC4899]">*</span>
              </label>
              <input
                type="text"
                name="experienceRequired"
                value={formData.experienceRequired}
                onChange={handleInputChange}
                placeholder="e.g. Fresher / 0–1 years / 2–4 years"
                required
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
              />
            </div>

            {/* Education Requirement */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Education Requirement
              </label>
              <input
                type="text"
                name="educationRequirement"
                value={formData.educationRequirement}
                onChange={handleInputChange}
                placeholder="e.g. B.Tech / BCA / MCA / B.Sc"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
              />
            </div>
          </div>

          {/* Required Skills Tag Input */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-[#94A3B8]">
              Required Technical Skills <span className="text-[#EC4899]">*</span>{' '}
              <span className="text-[10px] text-[#64748B]">
                (Type skill and press Enter or click suggestions)
              </span>
            </label>
            <div className="p-3 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#8B5CF6]/20 text-[#C084FC] border border-[#8B5CF6]/30 text-xs font-mono"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeRequiredSkill(skill)}
                      className="hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder={
                    requiredSkills.length === 0
                      ? 'Add required skill (e.g. Java, React, SQL)...'
                      : 'Add another skill...'
                  }
                  className="flex-1 min-w-[150px] bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                />
              </div>

              {/* Quick suggestions */}
              <div className="pt-2 border-t border-white/[0.04] flex flex-wrap items-center gap-1 text-[10px]">
                <span className="text-[#64748B] mr-1">Quick add:</span>
                {SUGGESTED_SKILLS.filter((s) => !requiredSkills.includes(s))
                  .slice(0, 8)
                  .map((skill) => (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => addRequiredSkill(skill)}
                      className="px-2 py-0.5 rounded bg-white/[0.04] hover:bg-white/[0.1] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
                    >
                      +{skill}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          {/* Preferred Skills Tag Input */}
          <div className="space-y-2 pt-2">
            <label className="block text-xs font-semibold text-[#94A3B8]">
              Preferred / Nice-to-Have Skills
            </label>
            <div className="p-3 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {preferredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#06B6D4]/15 text-[#38BDF8] border border-[#06B6D4]/30 text-xs font-mono"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removePreferredSkill(skill)}
                      className="hover:text-red-400 transition-colors cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={prefSkillInput}
                  onChange={(e) => setPrefSkillInput(e.target.value)}
                  onKeyDown={handlePrefSkillKeyDown}
                  placeholder="Add preferred skill (e.g. AWS, Docker)..."
                  className="flex-1 min-w-[150px] bg-transparent text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Section C: Compensation & Deadline */}
        <GlassCard className="p-6 sm:p-8 space-y-5">
          <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2 border-b border-white/[0.08] pb-3">
            <span className="w-5 h-5 rounded-lg bg-[#10B981]/15 border border-[#10B981]/30 text-[#10B981] flex items-center justify-center text-xs font-bold font-mono">
              ₹
            </span>
            Compensation (INR) & Timeline
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Minimum Salary */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Minimum Annual Salary (₹ INR)
              </label>
              <input
                type="number"
                name="salaryMin"
                value={formData.salaryMin}
                onChange={handleInputChange}
                placeholder="e.g. 500000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
              />
            </div>

            {/* Maximum Salary */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Maximum Annual Salary (₹ INR)
              </label>
              <input
                type="number"
                name="salaryMax"
                value={formData.salaryMax}
                onChange={handleInputChange}
                placeholder="e.g. 800000"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
              />
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-xs font-semibold text-[#94A3B8] mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]/50 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="salaryVisible"
              name="salaryVisible"
              checked={formData.salaryVisible}
              onChange={handleInputChange}
              className="rounded bg-[rgba(20,20,40,0.6)] border-white/20 text-[#8B5CF6] focus:ring-0 cursor-pointer"
            />
            <label htmlFor="salaryVisible" className="text-xs text-[#94A3B8] cursor-pointer">
              Display salary range publicly on student job boards
            </label>
          </div>
        </GlassCard>

        {/* Section D: Complete Job Description */}
        <GlassCard className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <h2 className="text-sm font-bold text-[#F8FAFC] uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#EC4899]" />
              Complete Job Description <span className="text-[#EC4899]">*</span>
            </h2>
            <span className="text-[10px] text-[#64748B]">Structured text format</span>
          </div>

          <p className="text-xs text-[#94A3B8]">
            This description is used by the AI Resume Matcher and Job Optimization engine to
            evaluate applicant resumes against key role requirements.
          </p>

          <textarea
            name="description"
            rows="12"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter comprehensive role description, responsibilities, and qualifications..."
            required
            className="w-full p-4 rounded-xl bg-[rgba(20,20,40,0.6)] border border-white/[0.08] text-xs text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#8B5CF6]/50 font-sans leading-relaxed transition-colors resize-y"
          />
        </GlassCard>

        {/* Bottom Actions Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#0D1020]/90 border border-white/[0.08] backdrop-blur-xl">
          <Link
            to="/admin/jobs"
            className="text-xs font-semibold text-[#94A3B8] hover:text-white transition-colors"
          >
            Cancel & Return
          </Link>

          <div className="flex items-center gap-3">
            <GradientButton
              variant="glass"
              size="md"
              loading={submitting}
              onClick={() => handleSubmit('DRAFT')}
            >
              Save as Draft
            </GradientButton>
            <GradientButton
              variant="primary"
              size="md"
              icon={Sparkles}
              loading={submitting}
              onClick={() => handleSubmit('PUBLISHED')}
            >
              Publish Job Requisition
            </GradientButton>
          </div>
        </div>
      </div>
    </div>
  );
}
