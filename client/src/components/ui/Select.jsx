import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

const Select = forwardRef(function Select(
  {
    label,
    error,
    helperText,
    options = [],
    children,
    className = '',
    id,
    required,
    ...props
  },
  ref
) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="space-y-1.5 w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#94A3B8]">
          {label} {required && <span className="text-[#EC4899]">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          required={required}
          className={`w-full appearance-none px-3.5 py-2.5 pr-10 rounded-xl bg-[rgba(10,12,25,0.75)] border ${
            error
              ? 'border-[#EC4899] text-[#F8FAFC]'
              : 'border-white/[0.1] text-[#F8FAFC] focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6]/40'
          } text-xs transition-all outline-none cursor-pointer shadow-inner ${className}`}
          {...props}
        >
          {options.length > 0
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#0D1020] text-[#F8FAFC]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
      {error && <p className="text-[11px] text-[#EC4899]">{error}</p>}
      {!error && helperText && <p className="text-[11px] text-[#64748B]">{helperText}</p>}
    </div>
  );
});

export default Select;

