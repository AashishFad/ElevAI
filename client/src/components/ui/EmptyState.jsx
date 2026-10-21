import React from 'react';
import { Sparkles } from 'lucide-react';
import GradientButton from './GradientButton';

export default function EmptyState({
  icon: Icon = Sparkles,
  title = 'No items yet',
  description = 'Get started by creating your first item.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`p-8 sm:p-12 text-center bg-[rgba(20,20,40,0.65)] backdrop-blur-xl border border-white/[0.08] rounded-3xl space-y-4 max-w-md mx-auto shadow-2xl ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#8B5CF6]/15 to-[#06B6D4]/15 text-[#06B6D4] border border-white/[0.1] flex items-center justify-center mx-auto shadow-inner">
        <Icon className="w-7 h-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight">{title}</h3>
        <p className="text-xs text-[#94A3B8] leading-relaxed max-w-sm mx-auto">{description}</p>
      </div>
      {actionLabel && (
        <div className="pt-2">
          <GradientButton
            onClick={onAction}
            variant="primary"
            size="sm"
          >
            {actionLabel}
          </GradientButton>
        </div>
      )}
    </div>
  );
}

