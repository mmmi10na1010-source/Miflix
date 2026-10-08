import React, { useEffect, useState } from 'react';
import { MiflixLogo, playMiflixIntroSound } from './MiflixLogo';

interface MiflixIntroModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MiflixIntroModal: React.FC<MiflixIntroModalProps> = ({
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      playMiflixIntroSound();
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#0b1118] flex flex-col items-center justify-center overflow-hidden animate-in fade-in duration-300">
      {/* Cyan-Blue Ambient Glow */}
      <div className="absolute w-[500px] h-[500px] bg-gradient-to-r from-blue-600/20 via-cyan-500/25 to-sky-600/20 rounded-full blur-[100px] pointer-events-none animate-pulse" />

      {/* Skip Button */}
      <button
        onClick={onClose}
        className="absolute top-6 left-6 px-4 py-2 rounded-xl bg-[#141f2e] border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 text-xs font-semibold transition-colors z-20"
      >
        تخطي
      </button>

      {/* Centered Glowing Logo with Smile Accent */}
      <div className="relative z-10 flex flex-col items-center justify-center transform transition-transform duration-700 scale-125">
        <MiflixLogo size="xl" withAnimation={false} />
      </div>
    </div>
  );
};
