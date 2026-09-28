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

  // Download URL if provided (for current episode or movie)
  const currentDownloadUrl = isSeries 
    ? (currentEpisode?.downloadUrl || item.downloadUrl || '') 
    : (item.downloadUrl || '');

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
    if (!isSeries || !selectedSeason || !currentEpisode) return;
    const sorted = selectedSeason.episodes.slice().sort((a, b) => a.episodeNumber - b.episodeNumber);
    const currentIndex = sorted.findIndex(e => e.id === currentEpisode.id);
    if (currentIndex >= 0 && currentIndex < sorted.length - 1) {
      setCurrentEpisode(sorted[currentIndex + 1]);
    }
  };

  const hasNextEpisode = (): boolean => {
    if (!isSeries || !selectedSeason || !currentEpisode) return false;
    const sorted = selectedSeason.episodes.slice().sort((a, b) => a.episodeNumber - b.episodeNumber);
    const currentIndex = sorted.findIndex(e => e.id === currentEpisode.id);
    return currentIndex >= 0 && currentIndex < sorted.length - 1;
  };

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen().catch(err => {
        console.error('Error attempting to enable fullscreen:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.error('Error attempting to exit fullscreen:', err);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#070b10] flex flex-col overflow-y-auto animate-in fade-in duration-200">
      {/* Top Header Bar */}
      <div className="bg-[#0b1118] border-b border-slate-800 px-4 py-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="رجوع"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>{item.title}</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 hidden sm:inline">
                {item.type === 'movie' ? 'فيلم' : 'مسلسل'}
              </span>
            </h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              {isSeries && currentEpisode && (
                <>
                  <span className="text-cyan-300 font-semibold">{currentEpisode.title}</span>
                  <span>·</span>
                </>
              )}
              {currentServer && (
                <span className="text-slate-400 font-mono">
                  {selectedServerIndex === 0 ? 'سيرفر VIP' : selectedServerIndex === 1 ? 'سيرفر MI' : `سيرفر ${selectedServerIndex + 1}`}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Direct Download button if present */}
          {currentDownloadUrl && (
            <a
              href={currentDownloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-sm"
              title="تحميل الحلقة أو الفيلم"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">تحميل</span>
            </a>
          )}

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
                <span className="text-sm text-cyan-300 font-medium">جاري تحميل البث...</span>
              </div>
            )}

            {/* Video Render */}
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
                  key={currentServer.url}
                  src={currentServer.url}
                  controls
                  autoPlay
                  playsInline
                  onLoadedData={() => setIsLoading(false)}
                  className="w-full h-full object-contain bg-black"
                >
                  متصفحك لا يدعم تشغيل هذا الفيديو مباشرة.
                </video>
              );
            })() : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                <Server className="w-12 h-12 text-cyan-500 mb-2" />
                <p>لا يتوفر سيرفر مشاهدة حالياً لهذا العمل.</p>
              </div>
            )}
          </div>

          {/* Servers Bar: VIP, MI, then 3, 4, 5, etc. + Optional Download Server */}
          <div className="mt-4 p-3.5 sm:p-4 rounded-2xl bg-[#0f1723]/90 border border-slate-800/80 backdrop-blur-md shadow-lg">
            <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3 pb-2.5 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="text-xs sm:text-sm font-bold text-slate-200">سيرفرات المشاهدة:</span>
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

            {/* Seamless Server Chips: VIP, MI, 3, 4, 5... and Download */}
            <div className="flex flex-wrap items-center gap-2">
              {availableServers.map((server, idx) => {
                const isActive = selectedServerIndex === idx;

                // Naming logic:
                // Server 0 -> VIP
                // Server 1 -> MI
                // Server 2+ -> 3, 4, 5...
                let label = '';
                if (idx === 0) {
                  label = 'سيرفر VIP';
                } else if (idx === 1) {
                  label = 'سيرفر MI';
                } else {
                  label = `سيرفر ${idx + 1}`;
                }

                return (
                  <button
                    key={server.id || idx}
                    onClick={() => handleServerSwitch(idx)}
                    title={server.name || label}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all duration-200 active:scale-95 ${
                      isActive 
                        ? 'bg-[#00a8e1] border-cyan-300 text-black shadow-[0_0_14px_rgba(0,168,225,0.5)] scale-105'
                        : 'bg-[#141f2e] border-slate-700 text-slate-200 hover:border-cyan-400 hover:text-white'
                    }`}
                  >
                    <span>{label}</span>
                    {server.quality && (
                      <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${isActive ? 'bg-black/20 text-black' : 'bg-black/50 text-slate-400'}`}>
                        {server.quality}
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Download Server Chip IF link exists */}
              {currentDownloadUrl && (
                <a
                  href={currentDownloadUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-emerald-500/70 bg-emerald-950/60 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                  title="سيرفر تحميل مباشر"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>سيرفر تحميل</span>
                </a>
              )}
            </div>

            {/* Player Banner Ad */}
            {adSettings.isEnabled && adSettings.playerBannerHtml && (
              <AdSlot htmlContent={adSettings.playerBannerHtml} label="إعلان ممول" className="mt-3" />
            )}
          </div>
        </div>

        {/* Series Episodes Drawer (Compact Clean Squares with Episode Number Only) */}
        {isSeries && item.seasons && item.seasons.length > 0 && (
          <div className="w-full lg:w-80 xl:w-96 flex flex-col bg-[#0f1723] rounded-xl border border-slate-800 overflow-hidden shrink-0 max-h-[600px]">
            {/* Season Selector */}
            <div className="p-3.5 border-b border-slate-800 bg-[#121c2a] flex items-center justify-between">
              <span className="text-sm font-bold text-slate-200">الحلقات</span>
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

            {/* Episodes Grid: Compact Clean Squares with Number Only */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-5 sm:grid-cols-6 lg:grid-cols-5 gap-2 content-start">
              {selectedSeason?.episodes
                .slice()
                .sort((a, b) => (a.episodeNumber || 0) - (b.episodeNumber || 0))
                .map((ep) => {
                  const isSelected = currentEpisode?.id === ep.id;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => setCurrentEpisode(ep)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center transition-all border font-mono ${
                        isSelected
                          ? 'bg-[#00a8e1] border-cyan-300 text-black font-black shadow-md scale-105'
                          : 'bg-[#141f2e] border-slate-800 text-slate-200 hover:bg-[#1a293c] hover:border-cyan-500'
                      }`}
                      title={ep.title || `الحلقة ${ep.episodeNumber}`}
                    >
                      <span className="text-[9px] opacity-75 font-sans font-medium">حلقة</span>
                      <span className="text-base font-black leading-none">{ep.episodeNumber}</span>
                    </button>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
