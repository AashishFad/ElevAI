import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Bell,
  CheckCheck,
  FileText,
  Briefcase,
  BarChart3,
  Bot,
  Hammer,
  Sparkles,
  ExternalLink,
  Send,
} from 'lucide-react';
import {
  getNotificationsApi,
  getUnreadNotificationCountApi,
  markNotificationAsReadApi,
  markAllNotificationsAsReadApi,
} from '../../services/api';

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

export default function NotificationBell() {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  const [recentNotifs, setRecentNotifs] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const dropdownRef = useRef(null);

  const fetchUnreadCount = () => {
    getUnreadNotificationCountApi()
      .then((data) => {
        if (data.success) {
          setUnreadCount(data.count || 0);
        }
      })
      .catch(() => {});
  };

  const fetchRecentNotifications = () => {
    setLoading(true);
    getNotificationsApi({ page: 1, limit: 5 })
      .then((data) => {
        if (data.success) {
          setRecentNotifs(data.notifications || []);
          if (data.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUnreadCount();
  }, []);

  const handleToggle = () => {
    if (!isOpen) {
      fetchRecentNotifications();
    }
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notif) => {
    setIsOpen(false);
    if (!notif.isRead) {
      try {
        await markNotificationAsReadApi(notif.id);
        fetchUnreadCount();
      } catch (e) {}
    }
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    try {
      await markAllNotificationsAsReadApi();
      setUnreadCount(0);
      setRecentNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (e) {}
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        className="relative p-2 rounded-xl bg-[#151B2B] border border-[#273449] hover:border-[#3E516D] text-[#94A3B8] hover:text-[#F8FAFC] transition-colors cursor-pointer"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#7C3AED] text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center shadow-md animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#151B2B] border border-[#273449] rounded-2xl shadow-2xl z-50 overflow-hidden animate-scale-in divide-y divide-[#273449]">
          {/* Header */}
          <div className="p-4 flex items-center justify-between bg-[#111827]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#F8FAFC]">Notifications</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-[#7C3AED]/20 text-[#A78BFA] text-[10px] font-bold border border-[#7C3AED]/30">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] font-semibold text-[#7C3AED] hover:text-[#8B5CF6] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#273449]/60">
            {loading ? (
              <div className="p-6 text-center text-xs text-[#94A3B8]">Loading notifications...</div>
            ) : recentNotifs.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#94A3B8] space-y-1">
                <Bell className="w-6 h-6 mx-auto text-[#64748B] mb-2" />
                <p className="font-semibold text-[#F8FAFC]">No notifications yet</p>
                <p className="text-[11px] text-[#64748B]">
                  Updates from your resume analysis, mock interviews, and skill gap reports will appear here.
                </p>
              </div>
            ) : (
              recentNotifs.map((n) => {
                const IconComponent = getNotificationIcon(n.type);
                return (
                  <div
                    key={n.id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 cursor-pointer transition-colors flex items-start gap-3 ${
                      !n.isRead ? 'bg-[#7C3AED]/10 hover:bg-[#7C3AED]/15' : 'hover:bg-[#111827]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl shrink-0 ${!n.isRead ? 'bg-[#7C3AED] text-white shadow-sm' : 'bg-[#111827] text-[#94A3B8] border border-[#273449]'}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <span className={`text-xs truncate ${!n.isRead ? 'font-bold text-[#F8FAFC]' : 'font-semibold text-[#CBD5E1]'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-[#64748B] font-mono shrink-0">
                          {formatRelativeTime(n.createdAt)}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#94A3B8] line-clamp-2 leading-relaxed">{n.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer View All Link */}
          <div className="p-3 bg-[#111827] text-center">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-[#7C3AED] hover:text-[#8B5CF6] inline-flex items-center gap-1 transition-colors"
            >
              <span>View All Notifications</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
