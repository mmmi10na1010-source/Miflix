import React, { useState } from 'react';
import { Play, Plus, Check, Info, Star, Server, Eye } from 'lucide-react';
import { MediaItem } from '../types';

interface MediaCardProps {
  item: MediaItem;
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  isSavedInList: boolean;
  onToggleList: (id: string) => void;
}

export const MediaCard: React.FC<MediaCardProps> = ({
  item,
  onPlay,
  onOpenDetails,
  isSavedInList,
  onToggleList
}) => {
  const [imgError, setImgError] = useState(false);
  const serverCount = item.type === 'movie' 
    ? (item.servers?.length || 0) 
    : (item.seasons?.[0]?.episodes?.[0]?.servers?.length || 0);

  return (
    <div className="group relative flex flex-col rounded-xl overflow-hidden bg-[#101924] border border-slate-800/80 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-[0_0_20px_rgba(0,168,225,0.25)] hover:-translate-y-1">
      {/* Poster Image Container */}
      <div 
        onClick={() => onOpenDetails(item)}
        className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer bg-[#0e1620]"
      >
        {!imgError ? (
          <img
            src={item.posterUrl || item.backdropUrl}
            alt={item.title}
            onError={() => setImgError(true)}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#101924] to-[#182638] text-center">
            <span className="text-base font-bold text-cyan-300 mb-1">{item.title}</span>
            <span className="text-xs text-slate-400 font-medium">{item.genres[0]}</span>
          </div>
        )}

        {/* Prime gradient vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1118] via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Top Badges */}
        <div className="absolute top-2 inset-x-2 flex items-center justify-between z-10 pointer-events-none">
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#0b1118]/85 text-slate-200 border border-slate-700/60">
            {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
          </span>

          {serverCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/85 text-cyan-300 border border-cyan-800/60">
              <Server className="w-2.5 h-2.5" />
              <span>{serverCount} سيرفر</span>
            </span>
          )}
        </div>

        {/* Hover Quick Action Overlay (Amazon Prime video layout) */}
        <div className="absolute inset-0 z-20 flex items-center justify-center gap-2.5 opacity-0 group-hover:opacity-100 bg-[#0b1118]/65 backdrop-blur-[2px] transition-opacity duration-200 p-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay(item);
            }}
            className="w-10 h-10 rounded-full bg-[#00a8e1] hover:bg-[#0094c7] text-[#0b1118] flex items-center justify-center shadow-lg transform hover:scale-110 active:scale-95 transition-all"
            title="مشاهدة الآن"
          >
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleList(item.id);
            }}
            className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
              isSavedInList
                ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                : 'bg-slate-900/90 border-slate-700 text-slate-200 hover:border-cyan-400'
            }`}
            title={isSavedInList ? 'إزالة من قائمتي' : 'إضافة لقائمتي'}
          >
            {isSavedInList ? <Check className="w-3.5 h-3.5 text-cyan-400" /> : <Plus className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(item);
            }}
            className="w-8 h-8 rounded-full bg-slate-900/90 border border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white flex items-center justify-center transition-colors"
            title="التفاصيل"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Info Block Below Poster */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <h3 
            onClick={() => onOpenDetails(item)}
            className="text-xs sm:text-sm font-bold text-white line-clamp-1 cursor-pointer hover:text-cyan-400 transition-colors"
            title={item.title}
          >
            {item.title}
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
            <span className="tabular-nums">{item.releaseYear}</span>
            {item.ageRating && (
              <>
                <span>·</span>
                <span className="text-slate-300">{item.ageRating}</span>
              </>
            )}
            {item.duration && (
              <>
                <span>·</span>
                <span className="text-slate-400">{item.duration}</span>
              </>
            )}
          </div>
        </div>

        {/* Views and Genre */}
        <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400 pt-1.5 border-t border-slate-800/60">
          <span className="truncate text-cyan-400/90 font-medium">
            {item.genres[0]}
          </span>
          <span className="flex items-center gap-1 text-[10px] text-slate-400 shrink-0 tabular-nums">
            <Eye className="w-3 h-3 text-slate-500" />
            <span>{(item.views || 0).toLocaleString('ar-EG')}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
