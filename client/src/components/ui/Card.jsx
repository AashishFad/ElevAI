import React from 'react';

export function Card({ children, className = '', hoverLift = false, ...props }) {
  return (
    <div
      className={`bg-[rgba(20,20,40,0.65)] backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-xl transition-all duration-200 ${
        hoverLift
          ? 'hover:border-white/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-purple-950/20 hover:bg-[rgba(26,26,52,0.8)]'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div className={`p-5 sm:p-6 border-b border-white/[0.08] flex items-center justify-between gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3 className={`text-sm sm:text-base font-bold text-[#F8FAFC] tracking-tight ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p className={`text-xs text-[#94A3B8] leading-relaxed mt-0.5 ${className}`} {...props}>
      {children}
    </p>
  );
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-5 sm:p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div className={`p-5 sm:p-6 border-t border-white/[0.08] flex items-center justify-between gap-4 ${className}`} {...props}>
      {children}
    </div>
  );
}

export default Card;

