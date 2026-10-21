import React from 'react';
import { Loader2 } from 'lucide-react';

export default function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  ...props
}) {
  const variantStyles = {
    primary:
      'bg-gradient-to-r from-[#8B5CF6] to-[#3B82F6] hover:from-[#7C3AED] hover:to-[#2563EB] text-white shadow-[0_4px_20px_rgba(139,92,246,0.35)] hover:shadow-[0_6px_25px_rgba(139,92,246,0.5)] border border-white/20 font-semibold',
    secondary:
      'bg-[rgba(20,20,40,0.65)] hover:bg-[rgba(26,26,52,0.85)] text-[#F8FAFC] border border-white/[0.12] hover:border-white/25 shadow-md backdrop-blur-md font-semibold',
    outline:
      'bg-transparent hover:bg-white/[0.06] text-[#F8FAFC] border border-white/[0.15] hover:border-[#8B5CF6]/60 font-semibold',
    ghost:
      'bg-transparent hover:bg-white/[0.08] text-[#94A3B8] hover:text-[#F8FAFC]',
    danger:
      'bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#F87171] border border-[#EF4444]/30 hover:border-[#EF4444]/60 font-semibold',
    accent:
      'bg-[#06B6D4]/15 hover:bg-[#06B6D4]/25 text-[#22D3EE] border border-[#06B6D4]/30 hover:border-[#06B6D4]/60 font-semibold',
  };

  const sizeStyles = {
    xs: 'px-2.5 py-1 text-xs rounded-lg gap-1.5',
    sm: 'px-3 py-1.5 text-xs rounded-xl gap-1.5 font-medium',
    md: 'px-4 py-2 text-xs sm:text-sm rounded-xl gap-2 font-semibold',
    lg: 'px-5 py-2.5 text-sm sm:text-base rounded-2xl gap-2.5 font-bold',
  };

  const activeVariant = variantStyles[variant] || variantStyles.primary;
  const activeSize = sizeStyles[size] || sizeStyles.md;

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${activeSize} ${activeVariant} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon className="w-4 h-4 shrink-0" />}
          <span>{children}</span>
          {Icon && iconPosition === 'right' && <Icon className="w-4 h-4 shrink-0" />}
        </>
      )}
    </button>
  );
}

