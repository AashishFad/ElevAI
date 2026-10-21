import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * Next-Gen GradientButton component
 * Variants: 'primary' (Purple->Blue), 'ai' (Cyan->Purple->Pink), 'success' (Green->Cyan), 'glass' (Translucent)
 */
export default function GradientButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#8B5CF6] via-[#6366F1] to-[#3B82F6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:shadow-[0_6px_28px_rgba(139,92,246,0.55)] border border-white/20',
    ai:
      'bg-gradient-to-r from-[#06B6D4] via-[#8B5CF6] to-[#EC4899] text-white shadow-[0_4px_20px_rgba(6,182,212,0.35)] hover:shadow-[0_6px_28px_rgba(236,72,153,0.55)] border border-white/20',
    success:
      'bg-gradient-to-r from-[#22D3A7] to-[#06B6D4] text-[#070714] font-bold shadow-[0_4px_20px_rgba(34,211,167,0.35)] hover:shadow-[0_6px_28px_rgba(34,211,167,0.55)] border border-white/30',
    glass:
      'bg-white/[0.05] hover:bg-white/[0.12] text-[#F8FAFC] border border-white/[0.12] hover:border-white/25 shadow-lg backdrop-blur-md',
    danger:
      'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_6px_25px_rgba(239,68,68,0.5)] border border-white/10',
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-[11px] rounded-lg gap-1.5',
    sm: 'px-3.5 py-1.5 text-xs rounded-xl gap-2',
    md: 'px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl gap-2.5',
    lg: 'px-7 py-3.5 text-sm sm:text-base font-bold rounded-2xl gap-3',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center select-none transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
        variantStyles[variant] || variantStyles.primary
      } ${sizeStyles[size] || sizeStyles.md} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
      {!loading && Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
      <span>{children}</span>
      {!loading && Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
    </button>
  );
}
