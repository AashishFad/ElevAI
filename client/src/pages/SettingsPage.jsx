import React, { useState, useEffect } from 'react';
import { Settings, Key, Shield, LogOut, Trash2, Bell, Check, Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import {
  getNotificationPreferencesApi,
  updateNotificationPreferencesApi,
} from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import PageHeader from '../components/ui/PageHeader';

export default function SettingsPage() {
  const { user, logout } = useAuth();

  const [prefs, setPrefs] = useState({
    resumeEnabled: true,
    jobEnabled: true,
    skillGapEnabled: true,
    interviewEnabled: true,
    reminderEnabled: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    getNotificationPreferencesApi()
      .then((data) => {
        if (data.success && data.preferences) {
          setPrefs(data.preferences);
        }
      })
      .catch(() => {});
  }, []);

  const handleTogglePref = async (key) => {
    const updated = { ...prefs, [key]: !prefs[key] };
    setPrefs(updated);
    setSavingPrefs(true);
    setSavedSuccess(false);

    try {
      const data = await updateNotificationPreferencesApi(updated);
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (e) {
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      <PageHeader
        title="Account Preferences"
        subtitle="Manage in-app AI notification dispatches, security credentials, and active sessions."
      />

      <div className="space-y-6">
        {/* Section 1: Notification Preferences */}
        <GlassCard className="p-6 space-y-4" glowVariant="violet">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-[#8B5CF6]" />
              <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Smart In-App Notifications</h2>
            </div>
            {savedSuccess ? (
              <GlowBadge variant="green" size="xs">
                <Check className="w-3 h-3" /> Preferences Saved
              </GlowBadge>
            ) : (
              <GlowBadge variant="violet" size="xs">In-App Live</GlowBadge>
            )}
          </div>

          <div className="space-y-3">
            {[
              { key: 'resumeEnabled', label: 'Resume Analysis & AI Improvements', desc: 'Notify when resume evaluation or bullet rewriting completes.' },
              { key: 'jobEnabled', label: 'Job-Specific Optimizations', desc: 'Notify when job-match optimization report is calculated.' },
              { key: 'skillGapEnabled', label: 'Skill Gap Diagnostics', desc: 'Notify when career readiness & skill gap report completes.' },
              { key: 'interviewEnabled', label: 'AI Mock Interviews', desc: 'Notify when mock interview results and scores are synthesized.' },
              { key: 'reminderEnabled', label: 'Preparation Reminders', desc: 'Receive periodic reminders if interview practice is recommended.' },
            ].map((item) => (
              <div
                key={item.key}
                onClick={() => handleTogglePref(item.key)}
                className="flex items-center justify-between p-4 bg-[rgba(10,12,25,0.7)] rounded-2xl border border-white/[0.08] hover:border-white/20 cursor-pointer transition-all"
              >
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-[#F8FAFC] block">{item.label}</span>
                  <span className="text-[11px] text-[#94A3B8]">{item.desc}</span>
                </div>
                <input
                  type="checkbox"
                  checked={Boolean(prefs[item.key])}
                  onChange={() => {}}
                  className="w-4 h-4 accent-[#8B5CF6] rounded cursor-pointer"
                />
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Section 2: Security & Credentials */}
        <GlassCard className="p-6 space-y-4" glowVariant="cyan">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-[#06B6D4]" />
              <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Security & Credentials</h2>
            </div>
            <GlowBadge variant="cyan" size="xs">Protected</GlowBadge>
          </div>
          <div className="text-xs text-[#94A3B8]">
            Authentication and API security are verified through encrypted JWT session tokens.
          </div>
        </GlassCard>

        {/* Section 3: Session Management */}
        <GlassCard className="p-6 space-y-4" glowVariant="pink">
          <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-[#EC4899]" />
              <h2 className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Session Controls</h2>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs sm:text-sm font-bold text-[#F8FAFC]">Sign Out of Workspace</div>
              <div className="text-[11px] text-[#94A3B8] mt-0.5">Clears stored JWT token and active browser session.</div>
            </div>
            <GradientButton
              variant="danger"
              size="sm"
              icon={LogOut}
              onClick={logout}
            >
              Log Out
            </GradientButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
