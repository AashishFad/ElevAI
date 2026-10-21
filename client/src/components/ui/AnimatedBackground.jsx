import React from 'react';

/**
 * Next-Gen Animated Ambient Background
 * Creates floating, blurred radial glow blobs (Violet, Cyan, Pink) behind all content.
 */
export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      {/* Deep subtle grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(255, 255, 255, 0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255, 255, 255, 0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Blob 1: Violet ambient glow (Top Left / Center) */}
      <div className="absolute -top-[15%] left-[10%] w-[550px] h-[550px] rounded-full bg-[#8B5CF6]/15 blur-[120px] animate-blob-1" />

      {/* Blob 2: Cyan ambient glow (Bottom Right) */}
      <div className="absolute top-[45%] -right-[10%] w-[600px] h-[600px] rounded-full bg-[#06B6D4]/12 blur-[140px] animate-blob-2" />

      {/* Blob 3: Pink accent glow (Bottom Left) */}
      <div className="absolute -bottom-[10%] left-[20%] w-[500px] h-[500px] rounded-full bg-[#EC4899]/10 blur-[130px] animate-blob-3" />

      {/* Subtle central vignette mask */}
      <div className="absolute inset-0 bg-radial from-transparent via-transparent to-[#070714]/80" />
    </div>
  );
}
