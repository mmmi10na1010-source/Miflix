import React, { useState } from 'react';
import { Play, Info, Star, Eye } from 'lucide-react';
import { MediaItem } from '../types';
import { normalizeImageUrl, getLatestEpisodeNumber } from '../utils/imageHelper';

interface MediaCardProps {
  item: MediaItem;
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  isSavedInList?: boolean;
  onToggleList?: (id: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onPlay,
  onOpenDetails
}) => {
  const [imgError, setImgError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Latest episode number for series (Qissat Ishq style)
  const latestEpisodeNum = getLatestEpisodeNumber(item);

  const resolvedImage = normalizeImageUrl(item.posterUrl || item.backdropUrl);

  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-[#0c1420] border border-slate-800/80 hover:border-cyan-400/70 transition-all duration-300 hover:shadow-[0_12px_32px_rgba(0,168,225,0.3)] hover:-translate-y-1.5"
    >
      {/* Netflix & Qissat Ishq Poster Canvas */}
      <a 
        href={`?watch=${item.id}`}
        onClick={(e) => {
          e.preventDefault();
          onOpenDetails(item);
        }}
        className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer bg-gradient-to-b from-[#111c2a] to-[#0a0f16] block"
        title={`مشاهدة ${item.title}`}
      >
        {!imgError && resolvedImage ? (
          <img
            src={resolvedImage}
            alt={item.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            loading="lazy"
            className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#101924] to-[#182638] text-center">
            <span className="text-base font-bold text-cyan-300 mb-1 leading-snug">{item.title}</span>
            <span className="text-xs text-slate-400 font-medium">{item.genres?.[0] || 'عمل سينمائي'}</span>
          </div>
        )}

        {/* Cinematic Multi-Layer Gradient Overlays */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#060b11]/90 via-[#060b11]/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-[#0c1420] via-[#0c1420]/80 to-transparent pointer-events-none group-hover:opacity-90 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 flex items-start justify-between z-10 pointer-events-none">
          {/* Media Type Badge (Right side in RTL) */}
          <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#00a8e1] text-black shadow-md uppercase tracking-wider">
            {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
          </span>

          {/* Qissat Ishq Signature Red & White Badge on Top Left for Series */}
          {item.type === 'series' && latestEpisodeNum !== null && (
            <div className="flex items-center shadow-lg rounded-md overflow-hidden border border-red-500/80 animate-in fade-in zoom-in-95">
              <span className="bg-red-600 text-white text-[11px] font-black px-2 py-0.5 tracking-tight flex items-center gap-0.5">
                <span>الحلقة</span>
              </span>
              <span className="bg-white text-red-700 text-[11px] font-black font-mono px-2 py-0.5">
                {latestEpisodeNum}
              </span>
            </div>
          )}
        </div>

        {/* Center Hover Quick Action Play Icon */}
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
          <div className={`w-14 h-14 rounded-full bg-[#00a8e1]/95 text-black flex items-center justify-center shadow-[0_0_25px_rgba(0,168,225,0.7)] transform transition-all duration-300 ${
            isHovered ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
          }`}>
            <Play className="w-7 h-7 fill-current ml-0.5" />
          </div>
        </div>

        {/* Bottom Floating Quick Actions on Poster Hover (Clean Watch + Details) */}
        <div className={`absolute bottom-2.5 inset-x-2.5 z-20 flex items-center gap-2 transition-all duration-300 ${
          isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
        }`}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="flex-1 py-1.5 px-3 rounded-xl bg-[#00a8e1] hover:bg-[#0094c7] text-[#070b10] text-xs font-black flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all"
            title="مشاهدة الآن"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>مشاهدة</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(item);
            }}
            className="w-8 h-8 rounded-xl bg-black/80 backdrop-blur-sm border border-slate-700 text-slate-300 hover:border-cyan-400 hover:text-white flex items-center justify-center transition-all active:scale-90 shadow-md shrink-0"
            title="تفاصيل الحلقات"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Info Block Below Poster (Clean & Elegant) */}
      <div className="p-3 flex flex-col justify-between flex-1 bg-[#0c1420]">
        <div>
          <h3 className="text-xs sm:text-sm font-black line-clamp-1">
            <a 
              href={`?watch=${item.id}`}
              onClick={(e) => {
                e.preventDefault();
                onOpenDetails(item);
              }}
              className="text-white hover:text-cyan-400 transition-colors cursor-pointer"
              title={item.title}
            >
              {item.title}
              {item.type === 'series' && latestEpisodeNum !== null && (
                <span className="text-red-400 font-normal mr-1.5 text-xs">
                  - الحلقة {latestEpisodeNum}
                </span>
              )}
            </a>
          </h3>

          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400 mt-1 font-medium">
            {typeof item.rating === 'number' && (
              <>
                <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                  <Star className="w-3 h-3 fill-amber-400" />
                  <span className="tabular-nums">{item.rating.toFixed(1)}</span>
                </span>
                <span>·</span>
              </>
            )}
            <span className="tabular-nums text-slate-300 font-semibold">{item.releaseYear}</span>
            {item.ageRating && (
              <>
                <span>·</span>
                <span className="text-[10px] px-1 py-0.2 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
                  {item.ageRating}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Views and Primary Genre Tag */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/70">
          <span className="truncate text-cyan-400 font-semibold">
            {item.genres?.[0] || 'سينمائي'}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 tabular-nums font-mono">
            <Eye className="w-3 h-3 text-slate-500" />
            <span>{(item.views || 0).toLocaleString('ar-EG')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
