import React, { useState, useEffect } from 'react';
import AnimatedMetric from './AnimatedMetric';

/**
 * Next-Gen Radial Progress Ring
 * Features animated gradient SVG stroke with central animated counter.
 */
export default function ProgressRing({
  score = 0,
  max = 100,
  size = 120,
  strokeWidth = 10,
  label = '',
  colorScheme = 'ai', // 'ai' | 'purple' | 'cyan' | 'green' | 'pink'
  className = '',
}) {
  const [animatedOffset, setAnimatedOffset] = useState(1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(Math.max(score || 0, 0), max);
  const targetOffset = circumference - (normalizedScore / max) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 150);
    return () => clearTimeout(timer);
  }, [targetOffset]);

  const gradientConfigs = {
    ai: {
      id: `aiGradient_${size}`,
      stops: [
        { offset: '0%', color: '#06B6D4' },
        { offset: '50%', color: '#8B5CF6' },
        { offset: '100%', color: '#EC4899' },
      ],
      glow: 'rgba(139, 92, 246, 0.3)',
    },
    purple: {
      id: `purpleGradient_${size}`,
      stops: [
        { offset: '0%', color: '#8B5CF6' },
        { offset: '100%', color: '#3B82F6' },
      ],
      glow: 'rgba(139, 92, 246, 0.3)',
    },
    cyan: {
      id: `cyanGradient_${size}`,
      stops: [
        { offset: '0%', color: '#06B6D4' },
        { offset: '100%', color: '#22D3A7' },
      ],
      glow: 'rgba(6, 182, 212, 0.3)',
    },
    green: {
      id: `greenGradient_${size}`,
      stops: [
        { offset: '0%', color: '#22D3A7' },
        { offset: '100%', color: '#06B6D4' },
      ],
      glow: 'rgba(34, 211, 167, 0.3)',
    },
    pink: {
      id: `pinkGradient_${size}`,
      stops: [
        { offset: '0%', color: '#EC4899' },
        { offset: '100%', color: '#8B5CF6' },
      ],
      glow: 'rgba(236, 72, 153, 0.3)',
    },
  };

  const currentGradient = gradientConfigs[colorScheme] || gradientConfigs.ai;

  return (
    <div className={`relative flex flex-col items-center justify-center ${className}`}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          className="rotate-[-90deg] overflow-visible"
          style={{ filter: `drop-shadow(0 0 12px ${currentGradient.glow})` }}
        >
          <defs>
            <linearGradient id={currentGradient.id} x1="0%" y1="0%" x2="100%" y2="100%">
              {currentGradient.stops.map((stop, idx) => (
                <stop key={idx} offset={stop.offset} stopColor={stop.color} />
              ))}
            </linearGradient>
          </defs>

          {/* Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress Animated Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${currentGradient.id})`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center select-none">
          <div className="flex items-baseline">
            <AnimatedMetric
              value={normalizedScore}
              className={`text-xl sm:text-2xl font-black text-[#F8FAFC]`}
            />
            <span className="text-[10px] sm:text-xs text-[#94A3B8] font-bold ml-0.5">/{max}</span>
          </div>
          {label && <span className="text-[9px] uppercase tracking-wider text-[#94A3B8] mt-0.5">{label}</span>}
        </div>
      </div>
    </div>
  );
}
