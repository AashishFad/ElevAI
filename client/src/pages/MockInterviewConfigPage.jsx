import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bot,
  Target,
  Sparkles,
  History,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  FileText,
  Code,
  Users,
  Layers,
  Zap,
} from 'lucide-react';
import {
  getCareerGoalApi,
  getResumesApi,
  startInterviewApi,
} from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';

export default function MockInterviewConfigPage() {
  const navigate = useNavigate();
  const [careerGoal, setCareerGoal] = useState(null);
  const [resumes, setResumes] = useState([]);

  const [type, setType] = useState('TECHNICAL');
  const [difficulty, setDifficulty] = useState('INTERMEDIATE');
  const [questionCount, setQuestionCount] = useState(5);
  const [selectedResumeId, setSelectedResumeId] = useState('');

  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([getCareerGoalApi(), getResumesApi()])
      .then(([goalData, resData]) => {
        if (isMounted) {
          if (goalData.success) setCareerGoal(goalData.careerGoal);
          if (resData.success) {
            const ready = (resData.resumes || []).filter((r) => r.status === 'READY');
            setResumes(ready);
          }
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load setup configuration');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!careerGoal) {
      setError('Please set your career goal before starting an interview session.');
      return;
    }

    setError('');
    setStarting(true);

    try {
      const data = await startInterviewApi({
        type,
        difficulty,
        inputMode: 'TEXT',
        questionCount: parseInt(questionCount, 10),
        resumeId: selectedResumeId || undefined,
      });

      if (data.success && data.session) {
        navigate(`/mock-interview/${data.session.id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to start interview session. Please try again.');
    } finally {
      setStarting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <PageHeader
          icon={Bot}
          title="AI Mock Interview"
          description="Practice interactive role-tailored technical and behavioral drill questions with instant AI evaluation."
        />
        <Link to="/mock-interview/history" className="shrink-0">
          <GradientButton variant="glass" size="sm" icon={History}>
            Past Sessions
          </GradientButton>
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Missing Career Goal warning */}
      {!loading && !careerGoal && (
        <Alert
          type="warning"
          title="Career Target Required"
          message="You haven't defined a target role yet. Please set your career goal first so AI can tailor questions to your target position."
          action={
            <Link to="/career-goal">
              <GradientButton variant="primary" size="xs">
                Set Career Goal
              </GradientButton>
            </Link>
          }
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* STEP 1: Target Position Calibration */}
        <GlassCard glowVariant="cyan" className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#06B6D4]/10 border border-[#06B6D4]/20 flex items-center justify-center text-[#06B6D4] font-bold text-xs">
              1
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
                Interview Target Calibration
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Questions are synthesized based on your career goal and technical profile.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <span className="text-[11px] font-semibold text-[#64748B] block">TARGET ROLE</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#F8FAFC]">
                  {careerGoal ? careerGoal.targetRole : 'Not Set'}
                </span>
                <Link to="/career-goal" className="text-xs text-[#06B6D4] hover:underline">
                  Edit
                </Link>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-2">
              <span className="text-[11px] font-semibold text-[#64748B] block">EXPERIENCE LEVEL</span>
              <span className="text-sm font-bold text-[#F8FAFC] block">
                {careerGoal ? careerGoal.experienceLevel?.replace('_', ' ') : 'Not Set'}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* STEP 2: Interview Type Selection */}
        <GlassCard glowVariant="violet" className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] font-bold text-xs">
              2
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
                Interview Type & Focus
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Select the interview domain and depth you would like to drill.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
            {[
              {
                id: 'TECHNICAL',
                label: 'Technical Deep-Dive',
                desc: 'Architecture, algorithms, code design, frameworks, and system optimization.',
                icon: Code,
              },
              {
                id: 'HR',
                label: 'Behavioral & Leadership',
                desc: 'STAR method, conflict resolution, cultural alignment, and teamwork dynamics.',
                icon: Users,
              },
              {
                id: 'MIXED',
                label: 'Comprehensive Mixed',
                desc: 'Realistic end-to-end full loop covering both engineering rigor and behavioral fit.',
                icon: Layers,
              },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = type === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setType(item.id)}
                  className={`p-4 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-[#8B5CF6]/15 border-[#8B5CF6]/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                      : 'bg-white/[0.02] border-white/[0.06] hover:border-white/[0.12]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-[#A78BFA]' : 'text-[#64748B]'}`} />
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-[#A78BFA]" />}
                    </div>
                    <span className="text-xs font-bold text-[#F8FAFC] block">{item.label}</span>
                    <p className="text-[11px] text-[#94A3B8] leading-relaxed">{item.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </GlassCard>

        {/* STEP 3: Difficulty & Length */}
        <GlassCard className="p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xs">
              3
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">
                Difficulty & Session Length
              </h3>
              <p className="text-xs text-[#94A3B8]">
                Customize the rigor level and number of questions generated for this practice drill.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            {/* Difficulty */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#94A3B8]">Difficulty Rigor</label>
              <div className="grid grid-cols-3 gap-2">
                {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDifficulty(d)}
                    className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                      difficulty === d
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#94A3B8] hover:border-white/[0.12]'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Question count */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#94A3B8]">
                Question Count: <span className="text-[#F8FAFC] font-bold">{questionCount} questions</span>
              </label>
              <div className="flex gap-2">
                {[3, 5, 7, 10].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setQuestionCount(count)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${
                      questionCount === count
                        ? 'bg-[#06B6D4]/15 border-[#06B6D4]/40 text-[#22D3EE]'
                        : 'bg-white/[0.02] border-white/[0.06] text-[#94A3B8] hover:border-white/[0.12]'
                    }`}
                  >
                    {count}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Optional Resume Context */}
          {resumes.length > 0 && (
            <div className="pt-4 border-t border-white/[0.06] space-y-2">
              <label className="text-xs font-semibold text-[#94A3B8]">
                Ground Interview in Your Resume (Optional)
              </label>
              <select
                value={selectedResumeId}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="w-full bg-[#070714] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-[#F8FAFC] focus:outline-none focus:border-[#8B5CF6]"
              >
                <option value="">No specific resume (Use general role profile)</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.originalFileName || r.fileName || 'Resume Document'} ({new Date(r.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>
          )}
        </GlassCard>

        {/* Start Button */}
        <div className="pt-2 flex justify-end">
          <GradientButton
            type="submit"
            variant="primary"
            size="lg"
            icon={Bot}
            loading={starting}
            disabled={starting || !careerGoal}
          >
            {starting ? 'Synthesizing Questions...' : 'Start Text Mock Interview'}
          </GradientButton>
        </div>
      </form>
    </div>
  );
}
