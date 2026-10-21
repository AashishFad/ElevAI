import React from 'react';

/**
 * Next-Gen GlowBadge component with cyber gradient border and pulsating indicator dot
 */
export default function GlowBadge({
  children,
  variant = 'violet', // 'violet' | 'cyan' | 'pink' | 'green' | 'amber' | 'ai'
  size = 'sm',
  pulsing = true,
  icon: Icon,
  className = '',
}) {
  const variantStyles = {
    violet: 'bg-[#8B5CF6]/10 text-[#C4B5FD] border-[#8B5CF6]/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]',
    cyan: 'bg-[#06B6D4]/10 text-[#67E8F9] border-[#06B6D4]/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]',
    pink: 'bg-[#EC4899]/10 text-[#F472B6] border-[#EC4899]/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]',
    green: 'bg-[#22D3A7]/10 text-[#5EEAD4] border-[#22D3A7]/30 shadow-[0_0_15px_rgba(34,211,167,0.2)]',
    amber: 'bg-[#F59E0B]/10 text-[#FCD34D] border-[#F59E0B]/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    ai: 'bg-gradient-to-r from-[#06B6D4]/15 via-[#8B5CF6]/15 to-[#EC4899]/15 text-[#F8FAFC] border-white/20 shadow-[0_0_20px_rgba(139,92,246,0.3)]',
  };

  const dotStyles = {
    violet: 'bg-[#8B5CF6]',
    cyan: 'bg-[#06B6D4]',
    pink: 'bg-[#EC4899]',
    green: 'bg-[#22D3A7]',
    amber: 'bg-[#F59E0B]',
    ai: 'bg-gradient-to-r from-[#06B6D4] to-[#EC4899]',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-xs sm:text-sm font-semibold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium border rounded-full backdrop-blur-md ${
        variantStyles[variant] || variantStyles.violet
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {pulsing && (
        <span className="relative flex h-2 w-2">
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              dotStyles[variant] || dotStyles.violet
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${
              dotStyles[variant] || dotStyles.violet
            }`}
          />
        </span>
      )}
      {Icon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
