import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, CheckCircle2, AlertCircle, ArrowRight, Code, Server, Layout, Cloud, Cpu, Database, Smartphone, PenTool, Sparkles, Zap } from 'lucide-react';
import { getCareerGoalApi, createCareerGoalApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Input from '../components/ui/Input';

const PREDEFINED_ROLES = [
  { id: 'Backend Developer', label: 'Backend Developer', icon: Server, desc: 'APIs, Databases & Node.js/Python microservices', glow: 'cyan' },
  { id: 'Frontend Developer', label: 'Frontend Developer', icon: Layout, desc: 'User interfaces, React, Tailwind & web performance', glow: 'violet' },
  { id: 'Full Stack Developer', label: 'Full Stack Developer', icon: Code, desc: 'End-to-end frontend & backend architecture', glow: 'pink' },
  { id: 'DevOps Engineer', label: 'DevOps Engineer', icon: Cloud, desc: 'CI/CD pipelines, Docker, Kubernetes & infrastructure', glow: 'green' },
  { id: 'Cloud Engineer', label: 'Cloud Engineer', icon: Cloud, desc: 'AWS, Azure, GCP cloud solutions & architecture', glow: 'cyan' },
  { id: 'Data Analyst', label: 'Data Analyst', icon: Database, desc: 'Data visualization, SQL, Python & business insights', glow: 'violet' },
  { id: 'AI/ML Engineer', label: 'AI/ML Engineer', icon: Cpu, desc: 'Machine learning models, PyTorch & LLM fine-tuning', glow: 'pink' },
  { id: 'Mobile Developer', label: 'Mobile Developer', icon: Smartphone, desc: 'iOS, Android, React Native & Flutter applications', glow: 'green' },
  { id: 'CUSTOM', label: 'Custom Role', icon: PenTool, desc: 'Specify your unique target position', glow: 'violet' },
];

const EXPERIENCE_LEVELS = [
  { value: 'FRESHER', label: 'Fresher', desc: '0 years / Entry level' },
  { value: 'ONE_TO_TWO_YEARS', label: '1–2 Years', desc: 'Early career / Junior' },
  { value: 'THREE_TO_FIVE_YEARS', label: '3–5 Years', desc: 'Mid-level engineer' },
  { value: 'EXPERIENCED', label: 'Experienced', desc: '5+ years / Senior / Lead' },
];

export default function CareerGoalPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('Backend Developer');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [selectedExp, setSelectedExp] = useState('FRESHER');
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Fetch existing active goal if present
  useEffect(() => {
    let isMounted = true;
    getCareerGoalApi()
      .then((data) => {
        if (isMounted && data.success && data.careerGoal) {
          const goal = data.careerGoal;
          const matchPredefined = PREDEFINED_ROLES.find((r) => r.id === goal.targetRole);
          if (matchPredefined) {
            setSelectedRole(matchPredefined.id);
          } else {
            setSelectedRole('CUSTOM');
            setCustomRoleInput(goal.targetRole);
          }
          setSelectedExp(goal.experienceLevel);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const finalTargetRole = selectedRole === 'CUSTOM' ? customRoleInput.trim() : selectedRole;

    if (!finalTargetRole) {
      setError('Please specify your custom target role');
      return;
    }

    setSubmitting(true);
    try {
      const data = await createCareerGoalApi({
        targetRole: finalTargetRole,
        experienceLevel: selectedExp,
      });

      if (data.success) {
        setSuccessMsg('Career goal calibration saved! Redirecting to workspace...');
        setTimeout(() => {
          navigate('/dashboard');
        }, 1200);
      }
    } catch (err) {
      setError(err.message || 'Failed to save career goal. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-16 animate-fade-in">
        <div className="flex items-center gap-3 text-[#94A3B8]">
          <div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold">Loading career goal configuration...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Target Career Calibration"
        badge={
          <GlowBadge variant="ai" size="sm">
            AI Benchmark
          </GlowBadge>
        }
        subtitle="Select your target role and seniority. ElevAI calibrates all ATS resume evaluations, skill gap diagnostics, and interview questions against this benchmark."
      />

      {error && (
        <Alert variant="error" title="Notice">
          {error}
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" title="Success">
          {successMsg}
        </Alert>
      )}

      <form onSubmit={handleSave} className="space-y-8">
        {/* Step 1: Target Role Selection */}
        <GlassCard className="p-6 space-y-5" glowVariant="violet">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white text-xs font-black flex items-center justify-center shadow-md">
                1
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Select Target Role</h2>
            </div>
            <GlowBadge variant="violet" size="xs">Step 1 of 2</GlowBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {PREDEFINED_ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.id;
              return (
                <div
                  key={role.id}
                  onClick={() => setSelectedRole(role.id)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#8B5CF6]/20 to-[#3B82F6]/15 border-[#8B5CF6] text-[#F8FAFC] shadow-[0_0_20px_rgba(139,92,246,0.25)] ring-1 ring-[#8B5CF6]/60'
                      : 'bg-[rgba(10,12,25,0.7)] border-white/[0.08] text-[#CBD5E1] hover:border-white/20 hover:bg-[rgba(16,18,36,0.8)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2.5">
                    <div className={`p-2.5 rounded-xl transition-colors ${isSelected ? 'bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white shadow-md' : 'bg-white/[0.06] text-[#94A3B8] group-hover:text-white'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />}
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#F8FAFC]">{role.label}</div>
                    <div className="text-[11px] text-[#94A3B8] mt-1 line-clamp-2 leading-relaxed">{role.desc}</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Role Input field */}
          {selectedRole === 'CUSTOM' && (
            <div className="p-4 rounded-2xl bg-[rgba(10,12,25,0.8)] border border-white/[0.1] space-y-2 mt-3 animate-fade-in">
              <Input
                label="Enter Custom Target Role"
                placeholder="e.g. Lead Distributed Systems Engineer, Platform Security Architect"
                value={customRoleInput}
                onChange={(e) => setCustomRoleInput(e.target.value)}
                required
              />
            </div>
          )}
        </GlassCard>

        {/* Step 2: Experience Level Selection */}
        <GlassCard className="p-6 space-y-5" glowVariant="cyan">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] text-white text-xs font-black flex items-center justify-center shadow-md">
                2
              </span>
              <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Select Experience Level</h2>
            </div>
            <GlowBadge variant="cyan" size="xs">Step 2 of 2</GlowBadge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {EXPERIENCE_LEVELS.map((exp) => {
              const isSelected = selectedExp === exp.value;
              return (
                <div
                  key={exp.value}
                  onClick={() => setSelectedExp(exp.value)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between cursor-pointer group ${
                    isSelected
                      ? 'bg-gradient-to-br from-[#06B6D4]/20 to-[#8B5CF6]/15 border-[#06B6D4] text-[#F8FAFC] shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-[#06B6D4]/60'
                      : 'bg-[rgba(10,12,25,0.7)] border-white/[0.08] text-[#CBD5E1] hover:border-white/20 hover:bg-[rgba(16,18,36,0.8)]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-2">
                    <span className="text-[10px] font-mono text-[#94A3B8]">{exp.desc}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-[#06B6D4]" />}
                  </div>
                  <div className="font-bold text-xs sm:text-sm text-[#F8FAFC]">{exp.label}</div>
                </div>
              );
            })}
          </div>
        </GlassCard>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.08]">
          <GradientButton
            type="submit"
            variant="ai"
            size="md"
            disabled={submitting}
            loading={submitting}
            icon={ArrowRight}
            iconPosition="right"
          >
            Save Target Benchmark
          </GradientButton>
        </div>
      </form>
    </div>
  );
}
