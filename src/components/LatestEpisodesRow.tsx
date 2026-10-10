import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Tv, Play, Sparkles } from 'lucide-react';
import { MediaItem } from '../types';
import { normalizeImageUrl } from '../utils/imageHelper';

interface LatestEpisodeEntry {
  item: MediaItem;
  episodeId: string;
  episodeNumber: number;
  episodeTitle?: string;
}

interface LatestEpisodesRowProps {
  items: MediaItem[];
  onPlayEpisode: (item: MediaItem, episodeId: string) => void;
  onOpenDetails: (item: MediaItem) => void;
}

export const LatestEpisodesRow: React.FC<LatestEpisodesRowProps> = ({
  items,
  onPlayEpisode,
  onOpenDetails
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Extract all episodes from all series, picking the latest 2-3 episodes per series
  const latestEpisodes: LatestEpisodeEntry[] = React.useMemo(() => {
    const list: LatestEpisodeEntry[] = [];

    items.forEach(item => {
      if (item.type === 'series' && item.seasons && item.seasons.length > 0) {
        // Collect all episodes from all seasons
        const allEps: { id: string; num: number; title?: string }[] = [];
        item.seasons.forEach(s => {
          if (s.episodes && s.episodes.length > 0) {
            s.episodes.forEach(ep => {
              if (typeof ep.episodeNumber === 'number') {
                allEps.push({
                  id: ep.id,
                  num: ep.episodeNumber,
                  title: ep.title
                });
              }
            });
          }
        });

        // Sort descending to get latest episodes
        allEps.sort((a, b) => b.num - a.num);

        // Take top 2 latest episodes for this series
        const top = allEps.slice(0, 2);
        top.forEach(ep => {
          list.push({
            item,
            episodeId: ep.id,
            episodeNumber: ep.num,
            episodeTitle: ep.title
          });
        });
      }
    });

    // Sort by episode number descending to surface freshest releases
    return list.sort((a, b) => b.episodeNumber - a.episodeNumber).slice(0, 16);
  }, [items]);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -380 : 380;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  if (latestEpisodes.length === 0) return null;

  return (
    <section className="relative my-7 group">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-8 mb-3.5">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-red-950/80 border border-red-700/60 text-red-400">
            <Tv className="w-4 h-4 text-red-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center gap-2">
              <span>أحدث الحلقات المضافة اليوم</span>
              <span className="text-[11px] px-2 py-0.5 rounded-md bg-red-950/90 border border-red-800 text-red-300 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-red-400" />
                <span>تحديث فوري للسيو وبحث جوجل</span>
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              تصفح وشاهد أحدث حلقات المسلسلات التركية والعربية فور صدورها بروابط مباشرة قابلة للأرشفة
            </p>
          </div>
        </div>

        {/* Navigation Arrows */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-lg bg-[#141f2e] border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
            title="التالي"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-lg bg-[#141f2e] border border-slate-700/80 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
            title="السابق"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Episodes Row */}
      <div
        ref={scrollContainerRef}
        className="flex gap-3.5 overflow-x-auto px-4 md:px-8 pb-3 pt-1 scrollbar-none scroll-smooth"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {latestEpisodes.map(({ item, episodeId, episodeNumber }) => {
          const resolvedImg = normalizeImageUrl(item.posterUrl || item.backdropUrl);
          const epUrl = `?watch=${item.id}&ep=${episodeNumber}`;
          const fullTitle = `مشاهدة مسلسل ${item.title} الحلقة ${episodeNumber} مترجمة HD`;

          return (
            <div
              key={`${item.id}-ep-${episodeNumber}`}
              className="flex-none w-36 sm:w-44 md:w-48 group/card flex flex-col rounded-2xl overflow-hidden bg-[#0c1420] border border-slate-800/80 hover:border-red-500/80 transition-all duration-300 hover:shadow-[0_10px_25px_rgba(239,68,68,0.25)] hover:-translate-y-1"
            >
              {/* Poster Canvas */}
              <a
                href={epUrl}
                onClick={(e) => {
                  e.preventDefault();
                  onPlayEpisode(item, episodeId);
                }}
                className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer bg-gradient-to-b from-[#111c2a] to-[#0a0f16] block"
                title={fullTitle}
              >
                {resolvedImg ? (
                  <img
                    src={resolvedImg}
                    alt={fullTitle}
                    loading="lazy"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center transform group-hover/card:scale-110 transition-transform duration-500 ease-out"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-[#101924]">
                    <span className="text-xs font-bold text-white">{item.title}</span>
                  </div>
                )}

                {/* Overlays */}
                <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-[#060b11]/80 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#0c1420] via-[#0c1420]/80 to-transparent pointer-events-none" />

                {/* Episode Badge on Top Right */}
                <div className="absolute top-2 right-2 z-10 flex items-center shadow-lg rounded-md overflow-hidden border border-red-500">
                  <span className="bg-red-600 text-white text-[10px] font-black px-1.5 py-0.5 tracking-tight">
                    الحلقة
                  </span>
                  <span className="bg-white text-red-700 text-xs font-black font-mono px-1.5 py-0.5">
                    {episodeNumber}
                  </span>
                </div>

                {/* Quick Play Hover Button */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity">
                  <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-xl transform scale-90 group-hover/card:scale-100 transition-transform">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>
              </a>

              {/* Title & Episode Meta */}
              <div className="p-2.5 flex flex-col flex-1 justify-between bg-[#0c1420]">
                <div>
                  <h3 className="text-xs font-black line-clamp-1">
                    <a
                      href={epUrl}
                      onClick={(e) => {
                        e.preventDefault();
                        onPlayEpisode(item, episodeId);
                      }}
                      className="text-white hover:text-red-400 transition-colors"
                      title={fullTitle}
                    >
                      {item.title}
                    </a>
                  </h3>
                  <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                    <span className="text-red-400 font-bold font-mono">الحلقة {episodeNumber}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-medium">1080p</span>
                  </div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between">
                  <button
                    onClick={() => onPlayEpisode(item, episodeId)}
                    className="flex-1 py-1 px-2 rounded-lg bg-red-600/20 hover:bg-red-600 text-red-300 hover:text-white border border-red-500/40 text-[10px] font-black transition-all flex items-center justify-center gap-1"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>تشغيل</span>
                  </button>
                  <button
                    onClick={() => onOpenDetails(item)}
                    className="mr-1.5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 text-[10px] transition-colors"
                    title="كل الحلقات"
                  >
                    المزيد
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
