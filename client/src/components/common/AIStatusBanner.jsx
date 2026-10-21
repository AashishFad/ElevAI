import React, { useState, useEffect, useCallback } from 'react';
import { ZapOff, RefreshCw, X, ChevronDown, ChevronUp, Check, ArrowRight } from 'lucide-react';
import { checkAIStatusApi } from '../../services/api';

/**
 * AIStatusBanner — shows a persistent banner when Gemini AI quota is exhausted or unavailable.
 * Polls /api/health/ai-status every 120 seconds.
 */
export default function AIStatusBanner() {
  const [status, setStatus] = useState(null); // null | 'live' | 'quota_exceeded' | 'unavailable'
  const [message, setMessage] = useState('');
  const [checking, setChecking] = useState(true);
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const checkStatus = useCallback(async () => {
    setChecking(true);
    try {
      const data = await checkAIStatusApi();
      setStatus(data.aiStatus);
      setMessage(data.message || '');
      setLastChecked(new Date());
      if (data.aiStatus === 'quota_exceeded' || data.aiStatus === 'unavailable') {
        setDismissed(false);
      }
    } catch {
      setStatus(null);
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 120000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  if (!status || status === 'live' || dismissed) return null;

  const fixSteps = [
    'Ensure Ollama is running: run "ollama serve" in terminal',
    'Verify model is downloaded: run "ollama pull qwen2.5:7b"',
    'Check OLLAMA_BASE_URL in server/.env (default: http://localhost:11434)',
    'Restart backend server if environment variables were updated',
  ];

  const whatWorks = [
    'Resume upload & file storage',
    'Career goal management',
    'Job requisitions & application submissions',
    'Application review & status tracking',
    'All history & saved reports',
  ];

  return (
    <div
      className="w-full rounded-2xl border shadow-xl transition-all duration-200 mb-6 overflow-hidden bg-[#151B2B] border-[#EF4444]/40 shadow-[#EF4444]/5"
    >
      {/* Banner Header */}
      <div className="flex items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 bg-[#EF4444]/15 text-[#F87171]"
          >
            <ZapOff className="w-4 h-4" />
          </div>

          <div className="min-w-0">
            <p className="text-xs sm:text-sm font-bold truncate text-[#F87171]">
              Local AI Engine (Ollama) Unavailable
            </p>
            <p className="text-[11px] text-[#94A3B8] mt-0.5 truncate">
              Ollama is not running or the required model (qwen2.5:7b) is loading.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-3">
          <button
            onClick={checkStatus}
            disabled={checking}
            title="Re-check AI status"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setExpanded((e) => !e)}
            title={expanded ? 'Collapse' : 'Show details'}
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors cursor-pointer"
          >
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => setDismissed(true)}
            title="Dismiss banner"
            className="p-1.5 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#111827] transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-[#273449]/60 space-y-4">
          {message && (
            <p className="text-xs text-[#CBD5E1] bg-[#111827] p-3 rounded-xl border border-[#273449]/60 leading-relaxed font-mono text-[11px]">
              {message}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#273449] space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                What Still Works
              </p>
              <ul className="space-y-1.5">
                {whatWorks.map((item) => (
                  <li key={item} className="text-xs text-[#CBD5E1] flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#22C55E] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-3.5 rounded-xl bg-[#111827] border border-[#273449] space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#94A3B8]">
                How To Fix
              </p>
              <ul className="space-y-1.5">
                {fixSteps.map((item) => (
                  <li key={item} className="text-xs text-[#CBD5E1] flex items-center gap-2">
                    <ArrowRight className="w-3.5 h-3.5 text-[#F59E0B] shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {lastChecked && (
            <p className="text-[11px] text-[#64748B] flex items-center justify-between">
              <span>Last checked: {lastChecked.toLocaleTimeString()}</span>
              <button
                onClick={checkStatus}
                className="text-[#7C3AED] hover:text-[#8B5CF6] hover:underline cursor-pointer"
              >
                Re-check now
              </button>
            </p>
          )}
        </div>
      )}
    </div>
  );
}
