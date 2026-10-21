import React from 'react';

export default function Badge({
  children,
  variant = 'violet',
  size = 'sm',
  dot = false,
  className = '',
}) {
  const variantStyles = {
    violet: 'bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/30',
    indigo: 'bg-[#7C3AED]/10 text-[#A78BFA] border-[#7C3AED]/30', // Backward compatibility
    cyan: 'bg-[#22D3EE]/10 text-[#22D3EE] border-[#22D3EE]/30',
    emerald: 'bg-[#22C55E]/10 text-[#4ADE80] border-[#22C55E]/30',
    amber: 'bg-[#F59E0B]/10 text-[#FBBF24] border-[#F59E0B]/30',
    rose: 'bg-[#EF4444]/10 text-[#F87171] border-[#EF4444]/30',
    slate: 'bg-[#111827] text-[#94A3B8] border-[#273449]',
    outline: 'bg-transparent text-[#F8FAFC] border-[#273449]',
  };

  const dotColors = {
    violet: 'bg-[#7C3AED]',
    indigo: 'bg-[#7C3AED]',
    cyan: 'bg-[#22D3EE]',
    emerald: 'bg-[#22C55E]',
    amber: 'bg-[#F59E0B]',
    rose: 'bg-[#EF4444]',
    slate: 'bg-[#94A3B8]',
    outline: 'bg-[#F8FAFC]',
  };

  const sizeStyles = {
    xs: 'px-2 py-0.5 text-[10px]',
    sm: 'px-2.5 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  const activeStyle = variantStyles[variant] || variantStyles.violet;
  const activeDot = dotColors[variant] || dotColors.violet;
  const activeSize = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border tracking-wide transition-colors ${activeSize} ${activeStyle} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${activeDot}`} />}
      {children}
    </span>
  );
}
