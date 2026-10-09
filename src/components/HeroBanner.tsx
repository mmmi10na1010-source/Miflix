import React from 'react';
import { Play, Plus, Check, Info, Star } from 'lucide-react';
import { MediaItem } from '../types';
import { normalizeImageUrl } from '../utils/imageHelper';

interface HeroBannerProps {
  item: MediaItem;
  onPlay: (item: MediaItem) => void;
  onMoreInfo: (item: MediaItem) => void;
  isSavedInList: boolean;
  onToggleList: (id: string) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  item,
  onPlay,
  onMoreInfo,
  isSavedInList,
  onToggleList
}) => {
  return (
    <section className="relative w-full h-[65vh] min-h-[480px] max-h-[680px] overflow-hidden select-none">
      {/* Background Media with Anamorphic Fade */}
      <div className="absolute inset-0 z-0">
        <img
          src={normalizeImageUrl(item.backdropUrl || item.posterUrl)}
          alt={item.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.8] contrast-[1.05]"
        />

        {/* Amazon Prime Cinematic Scrims (Deep navy black to cyan/blue ambient fade) */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-[#0b1118]/65 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1118] via-[#0b1118]/75 to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 md:px-8 flex flex-col justify-end pb-12 md:pb-14">
        <div className="max-w-2xl space-y-3.5">
          {/* Subtle Prime-style category indicator */}
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <span>
              {item.isMiflixOriginal ? 'أصلي وحصري' : 'متوفر الآن بأعلى دقة'}
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight text-balance drop-shadow-md">
            {item.title}
          </h1>

          {/* Clean Natural Metadata */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs md:text-sm text-slate-300 font-medium">
            {typeof item.rating === 'number' && (
              <>
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span className="tabular-nums">{item.rating.toFixed(1)}</span>
                </div>
                <span className="text-slate-600">·</span>
              </>
            )}
            <span className="tabular-nums">{item.releaseYear}</span>
            {item.ageRating && (
              <>
                <span className="text-slate-600">·</span>
                <span className="text-slate-300">{item.ageRating}</span>
              </>
            )}
            {item.duration && (
              <>
                <span className="text-slate-600">·</span>
                <span>{item.duration}</span>
              </>
            )}
            <span className="text-slate-600">·</span>
            <span className="text-cyan-400/90 font-medium">
              {(item.views || 0).toLocaleString('ar-EG')} مشاهدة
            </span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {(item.genres || []).map((g, i) => (
              <React.Fragment key={g}>
                <span className="hover:text-cyan-300 transition-colors">{g}</span>
                {i < (item.genres?.length || 0) - 1 && <span className="text-slate-600">·</span>}
              </React.Fragment>
            ))}
          </div>

          {/* Synopsis */}
          <p className="text-sm md:text-base text-slate-300 line-clamp-3 leading-relaxed max-w-xl text-balance">
            {item.synopsis}
          </p>

          {/* Interactive Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onPlay(item)}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#00a8e1] hover:bg-[#0094c7] text-[#0b1118] font-bold text-sm shadow-[0_0_20px_rgba(0,168,225,0.4)] transition-all transform hover:scale-[1.02] active:scale-95"
            >
              <Play className="w-4 h-4 fill-current ml-0.5" />
              <span>مشاهدة الآن</span>
            </button>

            <button
              onClick={() => onToggleList(item.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-semibold transition-all ${
                isSavedInList
                  ? 'bg-cyan-950/60 border-cyan-500 text-cyan-300'
                  : 'bg-[#15202d]/80 border-slate-700 text-slate-200 hover:bg-[#1c2c3e] hover:border-cyan-500/50'
              }`}
            >
              {isSavedInList ? (
                <>
                  <Check className="w-4 h-4 text-cyan-400" />
                  <span>في قائمتي</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>إضافة لقائمتي</span>
                </>
              )}
            </button>

            <button
              onClick={() => onMoreInfo(item)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#15202d]/80 hover:bg-[#1c2c3e] border border-slate-700 hover:border-slate-500 text-slate-200 text-sm font-semibold transition-colors"
            >
              <Info className="w-4 h-4 text-slate-400" />
              <span>التفاصيل</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
