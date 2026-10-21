import React, { forwardRef } from 'react';

const Textarea = forwardRef(function Textarea(
  {
    label,
    error,
    helperText,
    className = '',
    id,
    required,
    rows = 4,
    ...props
  },
  ref
) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-[#94A3B8]">
          {label} {required && <span className="text-[#EC4899]">*</span>}
        </label>
      )}
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        required={required}
        className={`w-full px-3.5 py-2.5 rounded-xl bg-[rgba(10,12,25,0.75)] border ${
          error
            ? 'border-[#EC4899] text-[#F8FAFC]'
            : 'border-white/[0.1] text-[#F8FAFC] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/40'
        } placeholder-[#64748B] text-xs transition-all outline-none leading-relaxed shadow-inner ${className}`}
        {...props}
      />
      {error && <p className="text-[11px] text-[#EC4899]">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#64748B]">{helperText}</p>}
    </div>
  );
});

export default Textarea;

