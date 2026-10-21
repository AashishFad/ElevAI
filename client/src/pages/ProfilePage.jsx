import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Shield, Target, AlertCircle, CheckCircle2, Save, Sparkles, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getProfileApi, updateProfileApi, getCareerGoalApi } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';

const EXP_LABEL_MAP = {
  FRESHER: 'Fresher (0 yrs)',
  ONE_TO_TWO_YEARS: '1–2 Years',
  THREE_TO_FIVE_YEARS: '3–5 Years',
  EXPERIENCED: 'Experienced (5+ yrs)',
};

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [careerGoal, setCareerGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
  });

  useEffect(() => {
    let isMounted = true;
    Promise.all([getProfileApi(), getCareerGoalApi()])
      .then(([profData, goalData]) => {
        if (isMounted) {
          if (profData.success && profData.profile) {
            setProfile(profData.profile);
            setValue('name', profData.profile.name);
            setValue('email', profData.profile.email);
          }
          if (goalData.success) {
            setCareerGoal(goalData.careerGoal);
          }
        }
      })
      .catch((err) => {
        if (isMounted) setApiError(err.message || 'Failed to load profile details');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [setValue]);

  const onSubmit = async (data) => {
    setApiError('');
    setSuccessMsg('');
    setSubmitting(true);

    try {
      const res = await updateProfileApi(data);
      if (res.success) {
        setProfile(res.profile);
        setSuccessMsg('Profile updated successfully');
      }
    } catch (err) {
      setApiError(err.message || 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-16 animate-fade-in">
        <div className="flex items-center gap-3 text-[#94A3B8]">
          <div className="w-5 h-5 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold">Loading user profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Header */}
      <PageHeader
        title="Account Profile"
        subtitle="Manage your profile metadata and inspect active career calibration settings."
      />

      {apiError && (
        <Alert variant="error" title="Notice">
          {apiError}
        </Alert>
      )}

      {successMsg && (
        <Alert variant="success" title="Success">
          {successMsg}
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card Summary */}
        <GlassCard className="p-6 space-y-6" glowVariant="violet">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-18 h-18 rounded-3xl bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white flex items-center justify-center text-2xl font-black shadow-lg shadow-[#8B5CF6]/30">
              {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-[#F8FAFC]">{profile?.name}</h2>
              <p className="text-xs text-[#94A3B8]">{profile?.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <GlowBadge variant={profile?.role === 'ADMIN' ? 'amber' : 'violet'} size="xs">
                {profile?.role === 'ADMIN' && <Shield className="w-3 h-3 text-[#FBBF24]" />}
                <span>Role: {profile?.role}</span>
              </GlowBadge>
            </div>
          </div>

          <div className="border-t border-white/[0.08] pt-4 space-y-3">
            <div className="text-[10px] font-black text-[#94A3B8] uppercase tracking-widest flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#06B6D4]" />
              <span>Target Benchmark</span>
            </div>
            {careerGoal ? (
              <div>
                <div className="text-xs sm:text-sm font-bold text-[#F8FAFC]">{careerGoal.targetRole}</div>
                <div className="text-[11px] text-[#94A3B8] mt-0.5">
                  {EXP_LABEL_MAP[careerGoal.experienceLevel] || careerGoal.experienceLevel}
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#64748B] italic">No career benchmark configured</div>
            )}
          </div>
        </GlassCard>

        {/* Edit Form Container */}
        <GlassCard className="md:col-span-2 p-6 space-y-6" glowVariant="cyan">
          <h3 className="text-xs sm:text-sm font-bold text-[#F8FAFC] border-b border-white/[0.08] pb-3">
            Account Details
          </h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  {...register('name', { required: 'Name is required' })}
                  className="w-full pl-10 pr-4 py-3 bg-[rgba(10,12,25,0.8)] border border-white/[0.1] rounded-2xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>
              {errors.name && <p className="text-xs text-[#EC4899]">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-[#94A3B8] uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#64748B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  {...register('email', { required: 'Email is required' })}
                  className="w-full pl-10 pr-4 py-3 bg-[rgba(10,12,25,0.8)] border border-white/[0.1] rounded-2xl text-xs text-[#F8FAFC] focus:outline-none focus:border-[#06B6D4]"
                />
              </div>
              {errors.email && <p className="text-xs text-[#EC4899]">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-black text-[#64748B] uppercase tracking-widest">
                Account Role (Managed by System)
              </label>
              <input
                type="text"
                disabled
                value={profile?.role}
                className="w-full px-4 py-3 bg-[rgba(10,12,25,0.4)] border border-white/[0.06] rounded-2xl text-xs text-[#64748B] cursor-not-allowed"
              />
            </div>

            <div className="pt-4 flex justify-end">
              <GradientButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={submitting}
                loading={submitting}
                icon={Save}
              >
                Save Changes
              </GradientButton>
            </div>
          </form>
        </GlassCard>
      </div>
    </div>
  );
}
