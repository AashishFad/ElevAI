import React, { forwardRef } from 'react';

const Input = forwardRef(function Input(
  {
    label,
    error,
    helperText,
    icon: Icon,
    rightElement,
    className = '',
    id,
    required,
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
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-[#64748B] pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          required={required}
          className={`w-full px-3.5 py-2.5 rounded-xl bg-[rgba(10,12,25,0.75)] border ${
            error
              ? 'border-[#EC4899] text-[#F8FAFC] focus:ring-1 focus:ring-[#EC4899]/40'
              : 'border-white/[0.1] text-[#F8FAFC] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/40'
          } placeholder-[#64748B] text-xs transition-all outline-none shadow-inner ${Icon ? 'pl-10' : ''} ${
            rightElement ? 'pr-10' : ''
          } ${className}`}
          {...props}
        />
        {rightElement && (
          <div className="absolute right-3.5 flex items-center">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-[11px] text-[#EC4899]">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#64748B]">{helperText}</p>}
    </div>
  );
});

export default Input;

