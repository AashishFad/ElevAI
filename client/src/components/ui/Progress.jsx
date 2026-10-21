import React from 'react';

export default function Progress({
  value = 0,
  max = 100,
  variant = 'violet',
  showLabel = false,
  size = 'md',
  className = '',
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const colorStyles = {
    violet: 'bg-[#7C3AED]',
    emerald: 'bg-[#22C55E]',
    cyan: 'bg-[#22D3EE]',
    amber: 'bg-[#F59E0B]',
    rose: 'bg-[#EF4444]',
  };

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  };

  const activeColor = colorStyles[variant] || colorStyles.violet;
  const activeSize = sizeStyles[size] || sizeStyles.md;

  return (
    <div className={`space-y-1.5 w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-[#94A3B8]">
          <span>Progress</span>
          <span className="text-[#F8FAFC]">{percentage}%</span>
        </div>
      )}
      <div className={`w-full bg-[#111827] rounded-full overflow-hidden border border-[#273449]/60 ${activeSize}`}>
        <div
          className={`h-full transition-all duration-500 ease-out rounded-full ${activeColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
