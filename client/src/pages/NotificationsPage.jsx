import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  Trash2,
  FileText,
  Briefcase,
  BarChart3,
  Bot,
  Hammer,
  Sparkles,
  Settings,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Check,
  Zap,
  Send,
} from 'lucide-react';
import {
  getNotificationsApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
  deleteNotificationApi,
  getNotificationPreferencesApi,
  updateNotificationPreferencesApi,
} from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GradientButton from '../components/ui/GradientButton';
import GlowBadge from '../components/ui/GlowBadge';
import PageHeader from '../components/ui/PageHeader';
import Alert from '../components/ui/Alert';
import Modal from '../components/ui/Modal';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString();
}

function getNotificationIcon(type) {
  switch (type) {
    case 'APPLICATION':
      return Send;
    case 'RESUME':
      return FileText;
    case 'JOB':
      return Briefcase;
    case 'SKILL_GAP':
      return BarChart3;
    case 'INTERVIEW':
      return Bot;
    case 'RESUME_BUILDER':
      return Hammer;
    case 'REMINDER':
      return Bell;
    default:
      return Sparkles;
  }
}

export default function NotificationsPage() {
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Preferences State
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [prefs, setPrefs] = useState({
    resumeEnabled: true,
    jobEnabled: true,
    skillGapEnabled: true,
    interviewEnabled: true,
    reminderEnabled: true,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  const fetchNotifications = (p = page, unread = unreadOnly) => {
    setLoading(true);
    getNotificationsApi({ page: p, limit: 15, unreadOnly: unread })
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications || []);
          setTotal(data.total || 0);
          setHasMore(data.hasMore || false);
          setUnreadCount(data.unreadCount || 0);
        }
      })
      .catch((err) => {
        setError(err.message || 'Failed to fetch notifications');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchNotifications(page, unreadOnly);
  }, [page, unreadOnly]);

  const fetchPreferences = () => {
    getNotificationPreferencesApi()
      .then((data) => {
        if (data.success && data.preferences) {
          setPrefs(data.preferences);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchPreferences();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsAsReadApi();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      alert(err.message || 'Failed to mark all as read.');
    }
  };

  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await markNotificationAsReadApi(notif.id);
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (e) {}
    }
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleDelete = async (e, notifId) => {
    e.stopPropagation();
    try {
      await deleteNotificationApi(notifId);
      setNotifications((prev) => prev.filter((n) => n.id !== notifId));
      setTotal((prev) => Math.max(0, prev - 1));
    } catch (err) {
      alert(err.message || 'Failed to delete notification.');
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const data = await updateNotificationPreferencesApi(prefs);
      if (data.success) {
        setPrefs(data.preferences);
        setShowSettingsModal(false);
      }
    } catch (err) {
      alert(err.message || 'Failed to save preferences.');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 animate-fade-in">
      {/* Header Bar */}
      <PageHeader
        title="Notifications Center"
        badge={
          <GlowBadge variant="ai" size="sm">
            Live Stream
          </GlowBadge>
        }
        subtitle="Track AI resume evaluations, job optimizations, skill gaps, and interview scores in real time."
        action={
          <div className="flex items-center gap-2">
            <GradientButton
              variant="glass"
              size="sm"
              icon={Settings}
              onClick={() => setShowSettingsModal(true)}
            >
              Preferences
            </GradientButton>

            {unreadCount > 0 && (
              <GradientButton
                variant="primary"
                size="sm"
                icon={CheckCheck}
                onClick={handleMarkAllRead}
              >
                Mark All Read
              </GradientButton>
            )}
          </div>
        }
      />

      {error && (
        <Alert variant="error" title="Notice">
          {error}
        </Alert>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-white/[0.08] pb-3">
        <button
          type="button"
          onClick={() => {
            setUnreadOnly(false);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            !unreadOnly
              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          All Notifications
        </button>

        <button
          type="button"
          onClick={() => {
            setUnreadOnly(true);
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            unreadOnly
              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#06B6D4] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'
              : 'text-[#94A3B8] hover:text-[#F8FAFC]'
          }`}
        >
          Unread Only {unreadCount > 0 ? `(${unreadCount})` : ''}
        </button>
      </div>

      {/* Main List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[#94A3B8] flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading notifications...</span>
        </div>
      ) : notifications.length === 0 ? (
        <GlassCard className="p-12 text-center space-y-3" glowVariant="violet">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20 flex items-center justify-center mx-auto shadow-inner">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC]">No Notifications Found</h3>
          <p className="text-xs text-[#94A3B8] max-w-sm mx-auto">
            {unreadOnly ? 'You have caught up with all notifications!' : 'Your event notifications will appear here as you run resume evaluations and mock interviews.'}
          </p>
        </GlassCard>
      ) : (
        <div className="bg-[rgba(20,20,40,0.65)] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl divide-y divide-white/[0.08] backdrop-blur-xl">
          {notifications.map((n) => {
            const IconComponent = getNotificationIcon(n.type);
            return (
              <div
                key={n.id}
                onClick={() => handleItemClick(n)}
                className={`p-5 cursor-pointer transition-colors flex items-start gap-4 ${
                  !n.isRead ? 'bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/15' : 'hover:bg-white/[0.04]'
                }`}
              >
                <div
                  className={`p-2.5 rounded-2xl shrink-0 ${
                    !n.isRead ? 'bg-gradient-to-tr from-[#8B5CF6] to-[#06B6D4] text-white shadow-md shadow-[#8B5CF6]/30' : 'bg-white/[0.06] border border-white/[0.08] text-[#94A3B8]'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs sm:text-sm ${!n.isRead ? 'font-bold text-[#F8FAFC]' : 'font-semibold text-[#CBD5E1]'}`}>
                        {n.title}
                      </span>
                      <GlowBadge variant={!n.isRead ? 'violet' : 'cyan'} size="xs">
                        {n.type?.replace('_', ' ')}
                      </GlowBadge>
                    </div>

                    <span className="text-[10px] text-[#64748B] font-mono">
                      {formatRelativeTime(n.createdAt)}
                    </span>
                  </div>

                  <p className="text-xs text-[#94A3B8] leading-relaxed">{n.message}</p>
                </div>

                <button
                  type="button"
                  onClick={(e) => handleDelete(e, n.id)}
                  title="Delete notification"
                  className="p-2 rounded-xl text-[#64748B] hover:text-[#EC4899] hover:bg-[#EC4899]/10 transition-colors shrink-0 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {total > 15 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-[#94A3B8] font-bold font-mono">
            Showing Page {page} of {Math.ceil(total / 15)} ({total} Total)
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              className="p-2 rounded-xl bg-[rgba(10,12,25,0.7)] border border-white/[0.08] hover:border-white/20 text-[#CBD5E1] disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              disabled={!hasMore}
              onClick={() => setPage((prev) => prev + 1)}
              className="p-2 rounded-xl bg-[rgba(10,12,25,0.7)] border border-white/[0.08] hover:border-white/20 text-[#CBD5E1] disabled:opacity-30 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal: Notification Preferences */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Notification Preferences"
      >
        <form onSubmit={handleSavePreferences} className="space-y-4">
          {[
            { id: 'resumeEnabled', label: 'Resume Analysis & Improvements' },
            { id: 'jobEnabled', label: 'Job-Specific Optimizations' },
            { id: 'skillGapEnabled', label: 'Skill Gap Analyses' },
            { id: 'interviewEnabled', label: 'AI Mock Interviews' },
            { id: 'reminderEnabled', label: 'Preparation Reminders' },
          ].map((item) => (
            <label
              key={item.id}
              className="flex items-center justify-between p-3.5 bg-[rgba(10,12,25,0.7)] rounded-2xl border border-white/[0.08] cursor-pointer transition-colors hover:border-white/20"
            >
              <span className="text-xs font-bold text-[#CBD5E1]">{item.label}</span>
              <input
                type="checkbox"
                checked={Boolean(prefs[item.id])}
                onChange={(e) => setPrefs({ ...prefs, [item.id]: e.target.checked })}
                className="w-4 h-4 accent-[#8B5CF6] rounded cursor-pointer"
              />
            </label>
          ))}

          <div className="flex justify-end gap-3 pt-2">
            <GradientButton
              type="button"
              variant="glass"
              size="sm"
              onClick={() => setShowSettingsModal(false)}
            >
              Cancel
            </GradientButton>
            <GradientButton
              type="submit"
              variant="primary"
              size="sm"
              disabled={savingPrefs}
              loading={savingPrefs}
            >
              Save Preferences
            </GradientButton>
          </div>
        </form>
      </Modal>
    </div>
  );
}
