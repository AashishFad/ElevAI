import React from 'react';
import { Bot, Mic, CheckCircle2, Sparkles } from 'lucide-react';

/**
 * Reusable AI Orb visual component powered by the official ElevAI 3D Logo
 * States: 'idle' | 'thinking' | 'listening' | 'success'
 * Sizes: 'sm' | 'md' | 'lg' | 'xl' | 'hero'
 */
export default function AIOrb({
  state = 'idle',
  size = 'md',
  showIcon = false,
  className = '',
  onClick,
}) {
  const sizeMap = {
    sm: { container: 'w-9 h-9', badgeIcon: 'w-2.5 h-2.5', glow: 'blur-md' },
    md: { container: 'w-14 h-14', badgeIcon: 'w-3.5 h-3.5', glow: 'blur-lg' },
    lg: { container: 'w-24 h-24', badgeIcon: 'w-5 h-5', glow: 'blur-xl' },
    xl: { container: 'w-36 h-36', badgeIcon: 'w-6 h-6', glow: 'blur-2xl' },
    hero: { container: 'w-48 h-48 sm:w-56 sm:h-56', badgeIcon: 'w-8 h-8', glow: 'blur-3xl' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Gradient aura and ambient themes based on state
  const stateThemes = {
    idle: {
      gradient: 'from-[#8B5CF6] via-[#06B6D4] to-[#EC4899]',
      glowColor: 'bg-[#8B5CF6]/40',
      badgeColor: 'bg-[#8B5CF6] text-white',
      icon: Sparkles,
    },
    thinking: {
      gradient: 'from-[#EC4899] via-[#8B5CF6] to-[#06B6D4]',
      glowColor: 'bg-[#EC4899]/50',
      badgeColor: 'bg-[#EC4899] text-white',
      icon: Bot,
    },
    listening: {
      gradient: 'from-[#06B6D4] via-[#22D3A7] to-[#8B5CF6]',
      glowColor: 'bg-[#06B6D4]/50',
      badgeColor: 'bg-[#06B6D4] text-white',
      icon: Mic,
    },
    success: {
      gradient: 'from-[#22D3A7] via-[#06B6D4] to-[#8B5CF6]',
      glowColor: 'bg-[#22D3A7]/50',
      badgeColor: 'bg-[#22D3A7] text-white',
      icon: CheckCircle2,
    },
  };

  const theme = stateThemes[state] || stateThemes.idle;
  const BadgeIcon = theme.icon;

  return (
    <div
      onClick={onClick}
      className={`relative flex items-center justify-center select-none ${currentSize.container} ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
    >
      {/* 1. Outer ambient multi-color blur glow */}
      <div
        className={`absolute inset-0 rounded-full ${theme.glowColor} ${currentSize.glow} ${
          state === 'thinking' ? 'animate-pulse' : 'animate-orb-pulse'
        }`}
      />

      {/* 2. Listening acoustic wave rings */}
      {state === 'listening' && (
        <>
          <div className="absolute -inset-2 rounded-full border-2 border-[#06B6D4]/60 animate-ring-pulse" />
          <div className="absolute -inset-4 rounded-full border border-[#22D3A7]/40 animate-ring-pulse [animation-delay:0.6s]" />
        </>
      )}

      {/* 3. Outer rotating cyber energy border */}
      <div
        className={`absolute -inset-[3px] rounded-full bg-gradient-to-tr ${theme.gradient} opacity-80 ${
          state === 'thinking' ? 'animate-orb-spin [animation-duration:3s]' : 'animate-orb-spin [animation-duration:8s]'
        }`}
      />

      {/* 4. Main Circular Glass & ElevAI Logo Container */}
      <div className="relative w-full h-full rounded-full bg-[#070714] p-[2px] shadow-2xl flex items-center justify-center overflow-hidden border border-white/20">
        {/* Floating Logo with subtle levitation */}
        <div className="w-full h-full rounded-full overflow-hidden bg-[#070714] flex items-center justify-center animate-float-logo">
          <img
            src="/logo.png"
            alt="ElevAI"
            className="w-full h-full object-cover rounded-full scale-105 transition-transform duration-300 hover:scale-110"
          />
        </div>

        {/* Glossy glass reflection sweep */}
        <div className="absolute top-1 left-2 w-1/2 h-1/3 rounded-full bg-white/20 blur-[2px] pointer-events-none" />
      </div>

      {/* 5. Optional State Badge (e.g. Microphone during speech / Bot while thinking) */}
      {showIcon && state !== 'idle' && (
        <div className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#070714] border border-white/20 shadow-lg flex items-center justify-center animate-fade-in">
          <div className={`p-1 rounded-full ${theme.badgeColor} shadow-md`}>
            <BadgeIcon className={currentSize.badgeIcon} />
          </div>
        </div>
      )}
    </div>
  );
}
