import React, { useState } from 'react';
import { 
  X, 
  Play, 
  Star, 
  Tv, 
  Eye, 
  Download
} from 'lucide-react';
import { MediaItem } from '../types';
import { normalizeImageUrl, getLatestEpisodeNumber } from '../utils/imageHelper';

interface MediaDetailsModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem, episodeId?: string) => void;
  isSavedInList?: boolean;
  onToggleList?: (id: string) => void;
}

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({
  item,
  onClose,
  onPlay
}) => {
  const isSeries = item.type === 'series' && (item.seasons?.length ?? 0) > 0;
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    item.seasons?.[0]?.id || ''
  );

  const activeSeason = item.seasons?.find(s => s.id === selectedSeasonId) || item.seasons?.[0];
  const latestEpisodeNum = getLatestEpisodeNumber(item);

  // Determine if direct download exists for movie or series
  const hasDownloadLink = Boolean(
    (item.downloadUrl && item.downloadUrl.trim()) ||
    (item.type === 'series' && activeSeason?.episodes.some(ep => ep.downloadUrl && ep.downloadUrl.trim()))
  );

  const activeDownloadUrl = (item.downloadUrl && item.downloadUrl.trim()) || 
    (activeSeason?.episodes.find(ep => ep.downloadUrl)?.downloadUrl) || 
    '';

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0c1420] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-black/70 border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-400 flex items-center justify-center transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Backdrop Header */}
        <div className="relative w-full h-64 sm:h-80 md:h-96">
          <img
            src={normalizeImageUrl(item.backdropUrl || item.posterUrl)}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c1420] via-[#0c1420]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0c1420] via-transparent to-transparent" />

          {/* Overlay CTA & Title */}
          <div className="absolute bottom-6 right-6 left-6 flex flex-col justify-end">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-md">
                {item.title}
              </h2>

              {/* Latest episode badge for series in header */}
              {isSeries && latestEpisodeNum !== null && (
                <div className="flex items-center shadow-lg rounded-md overflow-hidden border border-red-500/80 mr-2">
                  <span className="bg-red-600 text-white text-xs font-black px-2 py-0.5">
                    الحلقة
                  </span>
                  <span className="bg-white text-red-700 text-xs font-black font-mono px-2 py-0.5">
                    {latestEpisodeNum}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onPlay(item)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#00a8e1] hover:bg-[#0094c7] text-[#070b10] font-black text-sm shadow-[0_0_20px_rgba(0,168,225,0.4)] transition-all transform hover:scale-[1.02] active:scale-95"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>مشاهدة الآن</span>
              </button>

              {/* Direct Download button shown ONLY IF download link exists */}
              {hasDownloadLink && activeDownloadUrl && (
                <a
                  href={activeDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all transform hover:scale-[1.02]"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل مباشر</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Modal Body Info */}
        <div className="p-5 md:p-7 space-y-6">
          {/* Metadata Row */}
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-300 font-medium">
            {typeof item.rating === 'number' && (
              <>
                <div className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-amber-400" />
                  <span className="tabular-nums">{item.rating.toFixed(1)} / 10</span>
                </div>
                <span className="text-slate-600">·</span>
              </>
            )}
            <span className="tabular-nums text-white font-semibold">{item.releaseYear}</span>
            {item.ageRating && (
              <>
                <span className="text-slate-600">·</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200 border border-slate-700 text-xs">
                  {item.ageRating}
                </span>
              </>
            )}
            <span className="text-slate-600">·</span>
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              <Eye className="w-3.5 h-3.5" />
              <span>{(item.views || 0).toLocaleString('ar-EG')} مشاهدة</span>
            </span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-2">
            {(item.genres || []).map((g) => (
              <span 
                key={g}
                className="text-xs px-3 py-1 rounded-lg bg-[#141f2e] border border-slate-700/80 text-slate-200"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis with Vertical Poster (Clean & Simple) */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <div className="hidden sm:block shrink-0 w-28 md:w-32 aspect-[2/3] rounded-xl overflow-hidden border border-slate-700/80 shadow-md bg-[#0c1420]">
              <img
                src={normalizeImageUrl(item.posterUrl || item.backdropUrl)}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="flex-1 space-y-2">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                قصة العمل
              </h4>
              <p className="text-sm md:text-base text-slate-200 leading-relaxed font-normal">
                {item.synopsis}
              </p>
            </div>
          </div>

          {/* TV Series Seasons & Compact Episode Grid (Square-like clean chips with episode number only) */}
          {isSeries && activeSeason && (
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <h4 className="text-sm sm:text-base font-bold text-white">
                    الحلقات
                  </h4>
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {activeSeason.episodes.length} حلقة
                  </span>
                </div>

                {item.seasons && item.seasons.length > 1 && (
                  <select
                    value={selectedSeasonId}
                    onChange={(e) => setSelectedSeasonId(e.target.value)}
                    className="bg-[#141f2e] border border-slate-700 text-cyan-300 text-xs rounded-xl px-3 py-1.5 focus:outline-none"
                  >
                    {item.seasons.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Clean Small-Square Grid for Episodes (Number only, no clutter, no duration) */}
              <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2.5 max-h-72 overflow-y-auto p-1">
                {activeSeason.episodes
                  .slice()
                  .sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0))
                  .map(ep => (
                    <button
                      key={ep.id}
                      onClick={() => onPlay(item, ep.id)}
                      className="aspect-square flex flex-col items-center justify-center rounded-xl bg-[#141f2e] hover:bg-[#00a8e1] text-slate-200 hover:text-black border border-slate-700/80 hover:border-cyan-300 transition-all transform hover:scale-105 active:scale-95 shadow-sm group"
                      title={`مشاهدة الحلقة ${ep.episodeNumber}`}
                    >
                      <span className="text-[10px] text-slate-400 group-hover:text-black/80 font-normal">
                        حلقة
                      </span>
                      <span className="text-base sm:text-lg font-black font-mono leading-none">
                        {ep.episodeNumber}
                      </span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
