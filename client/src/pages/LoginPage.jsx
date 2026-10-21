import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  User,
  Briefcase,
  Sparkles,
  CheckCircle2,
  Building2,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import AIOrb from '../components/ui/AIOrb';
import Alert from '../components/ui/Alert';

export default function LoginPage() {
  const { isAuthenticated, isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname;

  // Step 1: 'SELECT_ROLE' | Step 2: 'CREDENTIALS'
  const initialRole = location.state?.role || null;
  const [step, setStep] = useState(initialRole ? 'CREDENTIALS' : 'SELECT_ROLE');
  const [selectedRole, setSelectedRole] = useState(initialRole); // 'CANDIDATE' | 'RECRUITER'
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect immediately to role-specific workspace
  useEffect(() => {
    if (isAuthenticated) {
      if (isAdmin) {
        navigate('/admin', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleContinue = () => {
    if (!selectedRole) return;
    setApiError('');
    setStep('CREDENTIALS');
  };

  const handleChangeRole = () => {
    setApiError('');
    setStep('SELECT_ROLE');
  };

  const onSubmit = async (formData) => {
    setApiError('');
    setSubmitting(true);
    try {
      const res = await login({
        email: formData.email,
        password: formData.password,
        requestedRole: selectedRole,
      });

      const targetUser = res?.user;
      if (targetUser?.role === 'ADMIN') {
        const dest = from && from.startsWith('/admin') ? from : '/admin';
        navigate(dest, { replace: true });
      } else {
        const dest = from && !from.startsWith('/admin') && from !== '/login' ? from : '/dashboard';
        navigate(dest, { replace: true });
      }
    } catch (err) {
      setApiError(err.message || 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center items-center px-4 py-8 sm:py-12 animate-fade-in relative z-10 my-auto">
      <div className="w-full max-w-[480px] flex flex-col items-center">
        {/* Header with Orb */}
        <div className="text-center flex flex-col items-center mb-6">
          <div className="mb-3">
            <AIOrb size="md" state="idle" showIcon={false} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#F8FAFC]">
            {step === 'SELECT_ROLE' ? 'Welcome to ElevAI' : selectedRole === 'RECRUITER' ? 'Recruiter Login' : 'Candidate Login'}
          </h1>
          <p className="text-xs sm:text-sm text-[#94A3B8] mt-1.5 leading-relaxed">
            {step === 'SELECT_ROLE'
              ? 'Select how you want to log in to continue'
              : selectedRole === 'RECRUITER'
              ? 'Sign in to access your recruitment and job pipeline'
              : 'Sign in to access your AI career workspace and jobs'}
          </p>
        </div>

        {/* Main Card Container */}
        <GlassCard className="w-full p-6 sm:p-8 space-y-6" glowVariant={selectedRole === 'RECRUITER' ? 'amber' : 'violet'}>
          {apiError && (
            <Alert variant="error" title="Sign In Notice">
              <div className="space-y-2">
                <p>{apiError}</p>
                {apiError.includes('Candidate') && selectedRole === 'RECRUITER' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('CANDIDATE');
                      setApiError('');
                    }}
                    className="text-xs font-bold text-[#06B6D4] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Switch to Candidate mode &rarr;
                  </button>
                )}
                {apiError.includes('Recruiter') && selectedRole === 'CANDIDATE' && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedRole('RECRUITER');
                      setApiError('');
                    }}
                    className="text-xs font-bold text-[#F59E0B] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Switch to Recruiter mode &rarr;
                  </button>
                )}
              </div>
            </Alert>
          )}

          {step === 'SELECT_ROLE' ? (
            /* STEP 1: Persona Selection */
            <div className="space-y-5">
              <div className="text-center">
                <span className="text-xs font-bold tracking-wider uppercase text-[#94A3B8]">
                  Login as...
                </span>
              </div>

              {/* Two Role Selection Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Candidate Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('CANDIDATE');
                    setApiError('');
                  }}
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    selectedRole === 'CANDIDATE'
                      ? 'bg-gradient-to-b from-[#8B5CF6]/20 via-[#06B6D4]/10 to-[rgba(10,12,25,0.9)] border-[#06B6D4] shadow-[0_0_25px_rgba(6,182,212,0.3)] ring-1 ring-[#06B6D4]'
                      : 'bg-[rgba(10,12,25,0.7)] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Selected Indicator Pill */}
                  {selectedRole === 'CANDIDATE' && (
                    <div className="absolute top-3 right-3 text-[#06B6D4]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-105 ${
                        selectedRole === 'CANDIDATE'
                          ? 'bg-gradient-to-tr from-[#06B6D4] to-[#8B5CF6] text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                          : 'bg-white/[0.06] text-[#94A3B8]'
                      }`}
                    >
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-sm text-[#F8FAFC] tracking-tight">
                      Candidate
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                      Find opportunities, analyze your resume, and apply for jobs.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] font-mono font-semibold text-[#06B6D4]">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Career Preparation</span>
                  </div>
                </button>

                {/* Recruiter Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('RECRUITER');
                    setApiError('');
                  }}
                  className={`relative p-5 rounded-2xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between group ${
                    selectedRole === 'RECRUITER'
                      ? 'bg-gradient-to-b from-[#F59E0B]/20 via-[#8B5CF6]/10 to-[rgba(10,12,25,0.9)] border-[#F59E0B] shadow-[0_0_25px_rgba(245,158,11,0.3)] ring-1 ring-[#F59E0B]'
                      : 'bg-[rgba(10,12,25,0.7)] border-white/[0.08] hover:border-white/20 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Selected Indicator Pill */}
                  {selectedRole === 'RECRUITER' && (
                    <div className="absolute top-3 right-3 text-[#F59E0B]">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3.5 transition-transform duration-300 group-hover:scale-105 ${
                        selectedRole === 'RECRUITER'
                          ? 'bg-gradient-to-tr from-[#F59E0B] to-[#EC4899] text-white shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                          : 'bg-white/[0.06] text-[#94A3B8]'
                      }`}
                    >
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-sm text-[#F8FAFC] tracking-tight">
                      Recruiter
                    </h3>
                    <p className="text-xs text-[#94A3B8] mt-1.5 leading-relaxed">
                      Post jobs, review candidates, and manage applications.
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-1.5 text-[10px] font-mono font-semibold text-[#F59E0B]">
                    <Building2 className="w-3 h-3" />
                    <span>Hiring & Requisitions</span>
                  </div>
                </button>
              </div>

              {/* Continue Button */}
              <div className="pt-2">
                <GradientButton
                  type="button"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={!selectedRole}
                  onClick={handleContinue}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {selectedRole
                    ? `Continue as ${selectedRole === 'RECRUITER' ? 'Recruiter' : 'Candidate'}`
                    : 'Select a role to continue'}
                </GradientButton>
              </div>
            </div>
          ) : (
            /* STEP 2: Credential Entry Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Selected Persona Pill */}
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.08]">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selectedRole === 'RECRUITER'
                        ? 'bg-[#F59E0B]/20 text-[#F59E0B]'
                        : 'bg-[#06B6D4]/20 text-[#06B6D4]'
                    }`}
                  >
                    {selectedRole === 'RECRUITER' ? (
                      <Briefcase className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] text-[#94A3B8] block leading-tight">
                      Logging in as
                    </span>
                    <span className="text-xs font-bold text-[#F8FAFC] leading-tight">
                      {selectedRole === 'RECRUITER' ? 'Recruiter' : 'Candidate'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleChangeRole}
                  className="text-xs font-medium text-[#A78BFA] hover:text-[#C084FC] transition-colors cursor-pointer flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-white/[0.06]"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Change</span>
                </button>
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: 'Enter a valid email address',
                      },
                    })}
                    className={`w-full pl-10 pr-4 py-3 bg-[rgba(10,12,25,0.8)] border rounded-xl text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition-all shadow-inner ${
                      errors.email
                        ? 'border-[#EC4899] focus:border-[#EC4899]'
                        : 'border-white/[0.1] focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                    }`}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-[#EC4899] mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-bold text-[#94A3B8] uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                    })}
                    className={`w-full pl-10 pr-4 py-3 bg-[rgba(10,12,25,0.8)] border rounded-xl text-xs sm:text-sm text-[#F8FAFC] placeholder-[#64748B] focus:outline-none transition-all shadow-inner ${
                      errors.password
                        ? 'border-[#EC4899] focus:border-[#EC4899]'
                        : 'border-white/[0.1] focus:border-[#8B5CF6] focus:shadow-[0_0_15px_rgba(139,92,246,0.25)]'
                    }`}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-[#EC4899] mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <GradientButton
                  type="submit"
                  variant="primary"
                  size="md"
                  fullWidth
                  disabled={submitting}
                  loading={submitting}
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  {submitting
                    ? 'Authenticating...'
                    : `Sign In as ${selectedRole === 'RECRUITER' ? 'Recruiter' : 'Candidate'}`}
                </GradientButton>
              </div>
            </form>
          )}
        </GlassCard>

        {/* Footer Link */}
        <p className="text-center text-xs text-[#94A3B8] mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            state={selectedRole ? { role: selectedRole } : undefined}
            className="font-bold text-[#06B6D4] hover:text-[#67E8F9] transition-colors ml-1"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
