import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Server, 
  Play, 
  Maximize2, 
  Tv, 
  ChevronLeft,
  Download,
  Zap
} from 'lucide-react';
import { MediaItem, ServerSource, Episode, Season } from '../types';
import { getStoredAdSettings } from '../services/storage';
import { AdSlot } from './AdSlot';

interface VideoPlayerModalProps {
  item: MediaItem;
  initialEpisodeId?: string;
  onClose: () => void;
  onSelectEpisode?: (episodeId: string) => void;
  onRecordView?: (mediaId: string) => void;
}

export const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({
  item,
  initialEpisodeId,
  onClose,
  onRecordView
}) => {
  const isSeries = item.type === 'series' && (item.seasons?.length ?? 0) > 0;
  
  // Find initial season and episode
  const initialSeason = item.seasons?.[0];
  const [selectedSeason, setSelectedSeason] = useState<Season | undefined>(initialSeason);
  
  const findInitialEp = (): Episode | undefined => {
    if (!isSeries || !item.seasons) return undefined;
    if (initialEpisodeId) {
      for (const season of item.seasons) {
        const found = season.episodes.find(e => e.id === initialEpisodeId);
        if (found) return found;
      }
    }
    return initialSeason?.episodes[0];
  };

  const [currentEpisode, setCurrentEpisode] = useState<Episode | undefined>(findInitialEp);

  // Available servers
  const availableServers: ServerSource[] = isSeries 
    ? (currentEpisode?.servers || []) 
    : (item.servers || []);

  const [selectedServerIndex, setSelectedServerIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isTheaterMode, setIsTheaterMode] = useState<boolean>(false);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const adSettings = getStoredAdSettings();

  // Smart URL resolver: Automatically converts standard page links, extracts iframe SRC, and cleans embed URLs
  const resolveStreamingUrl = (rawUrl: string): { url: string; isEmbed: boolean } => {
    if (!rawUrl) return { url: '', isEmbed: false };
    let trimmed = rawUrl.trim();

    // If user pasted a full <IFRAME ... SRC="url" ...></IFRAME> snippet
    const iframeSrcMatch = trimmed.match(/src=["']([^"']+)["']/i);
    if (iframeSrcMatch && iframeSrcMatch[1]) {
      trimmed = iframeSrcMatch[1].trim();
    }

    // vidspeed.org -> vidspeed.org/embed-{id}.html
    if (trimmed.includes('vidspeed.org') && !trimmed.includes('/embed-')) {
      trimmed = trimmed.replace(/vidspeed\.org\/([a-zA-Z0-9]+)\.html/, 'vidspeed.org/embed-$1.html');
      return { url: trimmed, isEmbed: true };
    }

    // anafast.org -> anafast.org/embed-{id}.html
    if (trimmed.includes('anafast.org') && !trimmed.includes('/embed-')) {
      trimmed = trimmed.replace(/anafast\.org\/([a-zA-Z0-9]+)\.html/, 'anafast.org/embed-$1.html');
      return { url: trimmed, isEmbed: true };
    }

    // doodstream / dood / dser -> /e/{id}
    if ((trimmed.includes('dood.') || trimmed.includes('ds2play') || trimmed.includes('doodstream')) && !trimmed.includes('/e/')) {
      trimmed = trimmed.replace(/\/(d|f)\//, '/e/');
      return { url: trimmed, isEmbed: true };
    }

    // streamtape.com -> /e/{id}
    if (trimmed.includes('streamtape.com') && !trimmed.includes('/e/')) {
      trimmed = trimmed.replace('/v/', '/e/');
      return { url: trimmed, isEmbed: true };
    }

    // vidmoly.me -> /embed-{id}.html
    if (trimmed.includes('vidmoly.me') && !trimmed.includes('/embed-')) {
      trimmed = trimmed.replace(/vidmoly\.me\/([a-zA-Z0-9]+)/, 'vidmoly.me/embed-$1.html');
      return { url: trimmed, isEmbed: true };
    }

    // Check if URL is naturally an embed or web streaming page
    const isEmbedLikely = 
      trimmed.includes('embed') || 
      trimmed.includes('/e/') || 
      trimmed.includes('youtube.com') || 
      trimmed.includes('youtu.be') || 
      trimmed.includes('vimeo.com') || 
      trimmed.includes('vidsrc') || 
      trimmed.includes('autoembed') || 
      trimmed.includes('ok.ru') ||
      trimmed.endsWith('.html');

    return { url: trimmed, isEmbed: isEmbedLikely };
  };

  // Reset server index and record actual view when media or episode changes
  useEffect(() => {
    setSelectedServerIndex(0);
    setIsLoading(true);
    if (onRecordView) {
      onRecordView(item.id);
    }
  }, [currentEpisode?.id, item.id]);

  // Safety fallback: if iframe loading takes more than 3.5s, remove loading overlay to reveal iframe
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, [selectedServerIndex, currentEpisode?.id]);

  const currentServer: ServerSource | undefined = availableServers[selectedServerIndex] || availableServers[0];

  const handleServerSwitch = (index: number) => {
    setIsLoading(true);
    setSelectedServerIndex(index);
  };

  const handleNextEpisode = () => {
    if (!selectedSeason || !currentEpisode) return;
    const currentIndex = selectedSeason.episodes.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex >= 0 && currentIndex < selectedSeason.episodes.length - 1) {
      setCurrentEpisode(selectedSeason.episodes[currentIndex + 1]);
    }
  };

  const hasNextEpisode = () => {
    if (!selectedSeason || !currentEpisode) return false;
    const currentIndex = selectedSeason.episodes.findIndex(e => e.id === currentEpisode.id);
    return currentIndex >= 0 && currentIndex < selectedSeason.episodes.length - 1;
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090e15]/95 backdrop-blur-xl flex flex-col justify-between overflow-y-auto">
      {/* Top Header Bar */}
      <div className="px-4 md:px-8 py-3 bg-[#0c1420] border-b border-slate-800 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00a8e1]" />
          <div className="flex flex-col">
            <h2 className="text-base md:text-lg font-bold text-white flex items-center gap-2">
              <span>{item.title}</span>
              {isSeries && currentEpisode && (
                <span className="text-cyan-400 font-medium text-sm">
                  · {currentEpisode.title}
                </span>
              )}
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>{item.releaseYear}</span>
              {item.ageRating && (
                <>
                  <span>·</span>
                  <span className="text-slate-300 font-medium">{item.ageRating}</span>
                </>
              )}
              {item.duration && (
                <>
                  <span>·</span>
                  <span>{item.duration}</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsTheaterMode(!isTheaterMode)}
            className={`p-2 rounded-lg transition-colors text-slate-300 hover:text-white ${isTheaterMode ? 'bg-cyan-600/30 text-cyan-300' : 'hover:bg-slate-800'}`}
            title={isTheaterMode ? 'الوضع العادي' : 'وضع المسرح'}
          >
            <Tv className="w-5 h-5" />
          </button>
          
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            title="ملء الشاشة"
          >
            <Maximize2 className="w-5 h-5" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#141f2e] border border-slate-700 text-slate-300 hover:text-white hover:border-cyan-500 transition-colors"
            title="إغلاق المشغل"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row p-4 md:p-6 gap-6 max-w-7xl mx-auto w-full">
        {/* Player Column */}
        <div className={`flex flex-col flex-1 ${isTheaterMode ? 'w-full' : ''}`}>
          {/* Video Container (16:9 Aspect Ratio) */}
          <div 
            ref={videoContainerRef}
            className="relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 glow-prime"
          >
            {/* Loading Indicator */}
            {isLoading && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none">
                <div className="w-10 h-10 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-3" />
                <span className="text-sm text-cyan-300 font-medium">جاري تحميل البث من {currentServer?.name || 'السيرفر'}...</span>
              </div>
            )}

            {/* Video Render (Direct MP4, Cloud Stream, or Embed) */}
            {currentServer ? (() => {
              const { url: streamUrl, isEmbed } = resolveStreamingUrl(currentServer.url);
              return isEmbed || currentServer.type === 'embed' ? (
                <iframe
                  key={streamUrl}
                  src={streamUrl}
                  title={item.title}
                  className="w-full h-full border-0 bg-black"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  onLoad={() => setIsLoading(false)}
                />
              ) : (
                <video
                  key={`${streamUrl}-${currentEpisode?.id || 'movie'}`}
                  src={streamUrl}
                  controls
                  autoPlay
                  playsInline
                  onLoadedData={() => setIsLoading(false)}
                  className="w-full h-full object-contain"
                >
                  متصفحك لا يدعم المشغل المباشر.
                </video>
              );
            })() : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Server className="w-12 h-12 text-cyan-500 mb-2" />
                <p>لا يتوفر سيرفر مشاهدة حالياً لهذا العمل.</p>
              </div>
            )}
          </div>

          {/* Functional Server-Switching Bar - Sleek Modern Pill Chips */}
          <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-[#0f1723]/90 border border-slate-800/80 backdrop-blur-md shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-200">سيرفرات المشاهدة:</span>
                <span className="text-[11px] text-slate-400 hidden sm:inline">اختر السيرفر الأنسب لسرعة اتصالك</span>
              </div>

              {hasNextEpisode() && (
                <button
                  onClick={handleNextEpisode}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-[#070b10] text-xs font-bold shadow-[0_0_12px_rgba(6,182,212,0.35)] transition-all transform hover:scale-105 active:scale-95"
                >
                  <span>الحلقة التالية</span>
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Modern Colorful Oval Number Pills / Chic Minimalist Flow */}
            <div className="flex flex-wrap items-center gap-2">
              {/* High-Earning Adsterra VIP Server Chip (Only Golden Ad Chip) */}
              <a
                href="https://www.profitableratecpmnetwork.com/thy1fu7h?key=2355ae6acc47ab23d02f4059424dfa30"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-amber-500/60 bg-gradient-to-r from-amber-500/25 via-amber-400/20 to-amber-600/15 hover:from-amber-500/40 hover:to-amber-600/30 text-amber-300 text-xs font-bold transition-all shadow-[0_0_12px_rgba(245,158,11,0.25)] hover:scale-105 active:scale-95"
                title="سيرفر VIP فائق السرعة"
              >
                <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>VIP</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/30 text-amber-200 rounded-full font-mono">4K</span>
              </a>

              {/* Stream Servers as Clean Numbered Oval Pills with Distinct Colors */}
              {availableServers.map((server, idx) => {
                const isActive = selectedServerIndex === idx;
                const serverNumber = idx + 1;

                // Distinct colors for each server pill
                const colorVariants = [
                  // 1: Cyan / Blue
                  {
                    active: 'bg-cyan-500 border-cyan-300 text-[#070b10] shadow-[0_0_14px_rgba(6,182,212,0.6)] ring-2 ring-cyan-400/40',
                    inactive: 'bg-cyan-950/40 border-cyan-800/60 text-cyan-300 hover:border-cyan-400 hover:bg-cyan-900/50'
                  },
                  // 2: Purple / Indigo
                  {
                    active: 'bg-indigo-500 border-indigo-300 text-white shadow-[0_0_14px_rgba(99,102,241,0.6)] ring-2 ring-indigo-400/40',
                    inactive: 'bg-indigo-950/40 border-indigo-800/60 text-indigo-300 hover:border-indigo-400 hover:bg-indigo-900/50'
                  },
                  // 3: Emerald / Green
                  {
                    active: 'bg-emerald-500 border-emerald-300 text-[#070b10] shadow-[0_0_14px_rgba(16,185,129,0.6)] ring-2 ring-emerald-400/40',
                    inactive: 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/50'
                  },
                  // 4: Rose / Pink
                  {
                    active: 'bg-rose-500 border-rose-300 text-white shadow-[0_0_14px_rgba(244,63,94,0.6)] ring-2 ring-rose-400/40',
                    inactive: 'bg-rose-950/40 border-rose-800/60 text-rose-300 hover:border-rose-400 hover:bg-rose-900/50'
                  },
                  // 5: Sky / Electric
                  {
                    active: 'bg-sky-500 border-sky-300 text-[#070b10] shadow-[0_0_14px_rgba(14,165,233,0.6)] ring-2 ring-sky-400/40',
                    inactive: 'bg-sky-950/40 border-sky-800/60 text-sky-300 hover:border-sky-400 hover:bg-sky-900/50'
                  },
                  // 6+: Violet
                  {
                    active: 'bg-violet-500 border-violet-300 text-white shadow-[0_0_14px_rgba(139,92,246,0.6)] ring-2 ring-violet-400/40',
                    inactive: 'bg-violet-950/40 border-violet-800/60 text-violet-300 hover:border-violet-400 hover:bg-violet-900/50'
                  }
                ];

                const color = colorVariants[idx % colorVariants.length];

                return (
                  <button
                    key={server.id || idx}
                    onClick={() => handleServerSwitch(idx)}
                    title={server.name}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold transition-all duration-200 ${
                      isActive ? `${color.active} scale-105` : `${color.inactive} hover:scale-105`
                    }`}
                  >
                    <span className="font-mono text-sm leading-none font-black">{serverNumber}</span>
                    {server.quality && (
                      <span className={`text-[10px] px-1 py-0.2 rounded-full font-mono ${isActive ? 'bg-black/25 text-inherit' : 'bg-slate-800/80 text-slate-400'}`}>
                        {server.quality}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Player Banner Ad */}
            {adSettings.isEnabled && adSettings.playerBannerHtml && (
              <AdSlot htmlContent={adSettings.playerBannerHtml} label="إعلان ممول" className="mt-3" />
            )}
          </div>
        </div>

        {/* Series Episodes Drawer (if TV Series) */}
        {isSeries && item.seasons && item.seasons.length > 0 && (
          <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-[#0f1723] rounded-xl border border-slate-800 overflow-hidden shrink-0 max-h-[600px]">
            {/* Season Selector */}
            <div className="p-4 border-b border-slate-800 bg-[#121c2a] flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200">قائمة الحلقات</span>
              {item.seasons.length > 1 && (
                <select
                  value={selectedSeason?.id}
                  onChange={(e) => {
                    const s = item.seasons?.find(sn => sn.id === e.target.value);
                    setSelectedSeason(s);
                    if (s && s.episodes.length > 0) {
                      setCurrentEpisode(s.episodes[0]);
                    }
                  }}
                  className="bg-[#141f2e] border border-slate-700 text-cyan-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  {item.seasons.map((sn) => (
                    <option key={sn.id} value={sn.id}>
                      {sn.title}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Episodes List - Sorted cleanly by episodeNumber */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {selectedSeason?.episodes
                .slice()
                .sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0))
                .map((ep) => {
                const isSelected = currentEpisode?.id === ep.id;
                return (
                  <div
                    key={ep.id}
                    onClick={() => setCurrentEpisode(ep)}
                    className={`p-3 rounded-lg cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500 shadow-md'
                        : 'bg-[#141f2e]/60 border-slate-800 hover:bg-[#1a293c] hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {isSelected ? (
                          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        ) : (
                          <span className="text-xs text-slate-500 font-mono">#{ep.episodeNumber}</span>
                        )}
                        <h4 className={`text-xs font-semibold ${isSelected ? 'text-cyan-300' : 'text-slate-200'}`}>
                          {ep.title}
                        </h4>
                      </div>
                      {ep.duration && (
                        <span className="text-[11px] text-slate-400">{ep.duration}</span>
                      )}
                    </div>
                    {ep.description && (
                      <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                        {ep.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
