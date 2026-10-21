import React from 'react';

/**
 * Next-Gen GlassCard component with responsive hover lift, gradient border, and glow
 */
export default function GlassCard({
  children,
  className = '',
  hoverEffect = true,
  glowVariant = 'none', // 'none' | 'violet' | 'cyan' | 'pink' | 'green'
  onClick,
  ...props
}) {
  const glowMap = {
    none: '',
    violet: 'hover:shadow-[0_0_30px_rgba(139,92,246,0.25)]',
    cyan: 'hover:shadow-[0_0_30px_rgba(6,182,212,0.22)]',
    pink: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.22)]',
    green: 'hover:shadow-[0_0_30px_rgba(34,211,167,0.22)]',
  };

  const hoverClasses = hoverEffect
    ? 'hover:-translate-y-1 hover:border-white/20 hover:bg-[rgba(24,24,48,0.8)] cursor-pointer'
    : '';

  return (
    <div
      onClick={onClick}
      className={`relative bg-[rgba(20,20,40,0.65)] backdrop-blur-xl border border-white/[0.08] rounded-2xl p-5 sm:p-6 transition-all duration-300 ${hoverClasses} ${glowMap[glowVariant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
