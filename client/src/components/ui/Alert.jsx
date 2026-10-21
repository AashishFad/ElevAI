import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Alert({
  variant,
  type,
  title,
  message,
  children,
  onClose,
  className = '',
}) {
  const actualVariant = variant || type || 'info';
  const content = children || message;

  const config = {
    info: {
      icon: Info,
      bg: 'bg-[#22D3EE]/10',
      border: 'border-[#22D3EE]/25',
      text: 'text-[#22D3EE]',
      iconColor: 'text-[#22D3EE]',
    },
    success: {
      icon: CheckCircle2,
      bg: 'bg-[#22C55E]/10',
      border: 'border-[#22C55E]/25',
      text: 'text-[#4ADE80]',
      iconColor: 'text-[#22C55E]',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-[#F59E0B]/10',
      border: 'border-[#F59E0B]/25',
      text: 'text-[#FBBF24]',
      iconColor: 'text-[#F59E0B]',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-[#EF4444]/10',
      border: 'border-[#EF4444]/25',
      text: 'text-[#F87171]',
      iconColor: 'text-[#F87171]',
    },
  };

  const current = config[actualVariant] || config.info;
  const Icon = current.icon;

  if (!content && !title) return null;

  return (
    <div className={`p-4 rounded-xl border ${current.bg} ${current.border} flex items-start justify-between gap-3 text-xs leading-relaxed ${className}`}>
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${current.iconColor}`} />
        <div className="flex-1 space-y-0.5 min-w-0">
          {title && <div className={`font-semibold text-xs ${current.text}`}>{title}</div>}
          {content && <div className="text-[#CBD5E1] break-words">{content}</div>}
        </div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/10 transition-colors shrink-0"
          aria-label="Dismiss alert"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
