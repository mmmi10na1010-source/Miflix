import React from 'react';

interface MiflixLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  withAnimation?: boolean;
  onClick?: () => void;
  className?: string;
}

// Custom cinematic synth audio pulse (Blue, Turquoise & Cinematic Prime Sonic Ident)
export const playMiflixIntroSound = () => {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    const now = ctx.currentTime;
    
    // Deep bass impact
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(120, now);
    osc1.frequency.exponentialRampToValueAtTime(36, now + 1.2);

    gain1.gain.setValueAtTime(0.55, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    // Oceanic crystal harmonic shimmer
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sawtooth';
    osc2.frequency.setValueAtTime(260, now + 0.06);
    osc2.frequency.exponentialRampToValueAtTime(520, now + 0.7);

    gain2.gain.setValueAtTime(0.01, now);
    gain2.gain.linearRampToValueAtTime(0.16, now + 0.18);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.linearRampToValueAtTime(2400, now + 0.35);
    filter.frequency.exponentialRampToValueAtTime(350, now + 1.3);

    osc2.connect(filter);
    filter.connect(gain2);
    gain2.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now + 0.05);

    osc1.stop(now + 1.5);
    osc2.stop(now + 1.5);
  } catch {
    // Audio context may require user interaction
  }
};

export const MiflixLogo: React.FC<MiflixLogoProps> = ({
  size = 'md',
  onClick,
  className = ''
}) => {
  const sizeConfig = {
    sm: { 
      text: 'text-xl', 
      spacing: 'tracking-tight',
      glow: 'drop-shadow-[0_2px_10px_rgba(0,168,225,0.4)]',
      curveH: 'h-1 w-full max-w-[58px]'
    },
    md: { 
      text: 'text-2xl sm:text-[28px]', 
      spacing: 'tracking-tight',
      glow: 'drop-shadow-[0_2px_14px_rgba(0,168,225,0.45)]',
      curveH: 'h-1.5 w-full max-w-[72px]'
    },
    lg: { 
      text: 'text-3xl sm:text-4xl', 
      spacing: 'tracking-tight',
      glow: 'drop-shadow-[0_3px_18px_rgba(0,168,225,0.5)]',
      curveH: 'h-2 w-full max-w-[96px]'
    },
    xl: { 
      text: 'text-5xl sm:text-6xl', 
      spacing: 'tracking-tight',
      glow: 'drop-shadow-[0_4px_24px_rgba(0,168,225,0.65)]',
      curveH: 'h-2.5 w-full max-w-[150px]'
    }
  }[size];

  const handleClick = () => {
    playMiflixIntroSound();
    if (onClick) onClick();
  };

  return (
    <div 
      dir="ltr"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="MIFLIX Logo"
      className={`group relative inline-flex flex-col items-start cursor-pointer select-none transition-transform duration-200 active:scale-95 ${className}`}
      title="MIFLIX"
    >
      {/* Brand Name: MIFLIX - MI in blue to turquoise, FLIX in pure white */}
      <div className={`font-black font-sans uppercase flex items-baseline leading-none ${sizeConfig.text} ${sizeConfig.spacing} ${sizeConfig.glow}`}>
        {/* "MI" in vivid Blue towards vibrant Turquoise */}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] via-[#0284C7] to-[#00F2FE] font-black group-hover:brightness-110 transition-all select-none">
          MI
        </span>

        {/* "FLIX" in pure solid white */}
        <span className="text-white font-black tracking-normal ml-0.5 group-hover:text-slate-100 transition-colors select-none">
          FLIX
        </span>
      </div>

      {/* Subtle modern Prime-style turquoise-blue smile accent line */}
      <div className={`mt-0.5 ${sizeConfig.curveH} relative overflow-hidden rounded-full`}>
        <div className="w-full h-full bg-gradient-to-r from-transparent via-[#00A8E1] to-[#00F2FE] opacity-85 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};
