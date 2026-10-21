import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const SIZE_MAP = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-3xl',
  '2xl': 'max-w-4xl',
  full: 'max-w-5xl',
};

export default function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
  maxWidth,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && onClose) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const widthClass = maxWidth || SIZE_MAP[size] || SIZE_MAP.md;

  const modalElement = (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-3 sm:p-6">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#070714]/85 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full ${widthClass} my-auto bg-[rgba(13,16,32,0.95)] border border-white/[0.12] backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 animate-scale-in max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] flex flex-col`}
      >
        {title ? (
          <div className="flex items-start justify-between p-4 sm:p-6 border-b border-white/[0.08] shrink-0">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-[#F8FAFC] tracking-tight">
                {title}
              </h3>
              {description && (
                <p className="text-xs text-[#94A3B8] mt-1 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl hover:bg-white/[0.08] border border-transparent hover:border-white/[0.08] transition-colors -mr-1 -mt-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : onClose ? (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-[#94A3B8] hover:text-[#F8FAFC] rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/[0.08] transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalElement, document.body);
}

