import React from 'react';

export default function Skeleton({ className = '', variant = 'text', ...props }) {
  const variantStyles = {
    text: 'h-4 w-full rounded-md',
    circle: 'rounded-full shrink-0',
    card: 'h-32 w-full rounded-2xl border border-white/[0.08]',
    badge: 'h-6 w-16 rounded-full',
  };

  return (
    <div
      className={`skeleton-shimmer bg-white/[0.06] ${variantStyles[variant] || ''} ${className}`}
      {...props}
    />
  );
}

