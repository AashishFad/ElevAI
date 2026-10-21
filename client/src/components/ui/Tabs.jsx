import React from 'react';

export default function Tabs({
  tabs = [],
  activeTab,
  onChange,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-1.5 p-1.5 bg-[rgba(10,12,25,0.7)] border border-white/[0.08] backdrop-blur-xl rounded-2xl overflow-x-auto ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-gradient-to-r from-[#8B5CF6]/25 to-[#06B6D4]/15 text-[#F8FAFC] shadow-md border border-[#8B5CF6]/40'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-white/[0.05]'
            }`}
          >
            {Icon && <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#06B6D4]' : 'text-[#64748B]'}`} />}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                  isActive ? 'bg-[#8B5CF6]/30 text-[#C4B5FD]' : 'bg-white/[0.06] text-[#64748B]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

