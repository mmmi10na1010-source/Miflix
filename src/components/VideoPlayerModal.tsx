import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Server, 
  Play, 
  Maximize2, 
  Minimize2,
  Tv, 
  ChevronLeft,
  Download,
  Zap,
  RotateCw
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
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isForcedLandscape, setIsForcedLandscape] = useState<boolean>(false);
  const [isLandscapeMode, setIsLandscapeMode] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false
  );
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

    // If user pasted an <a href="...">...</a> HTML link snippet
    const hrefMatch = trimmed.match(/<a\s+(?:[^>]*?\s+)?href=["']([^"']+)["']/i);
    if (hrefMatch && hrefMatch[1]) {
      trimmed = hrefMatch[1].trim();
    }

    // If user pasted a full <iframe ... src="url" ...></iframe> snippet
    const iframeSrcMatch = trimmed.match(/<iframe\s+(?:[^>]*?\s+)?src=["']([^"']+)["']/i);
    if (iframeSrcMatch && iframeSrcMatch[1]) {
      trimmed = iframeSrcMatch[1].trim();
    }

    // cdnplus.org / cdnplus.buzz -> embed-{id}.html
    if (trimmed.includes('cdnplus.') && !trimmed.includes('/embed-')) {
      trimmed = trimmed.replace(/cdnplus\.[a-z]+\/([a-zA-Z0-9]+)\.html/, 'cdnplus.org/embed-$1.html');
      return { url: trimmed, isEmbed: true };
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

  // Track device viewport orientation changes
  useEffect(() => {
    const handleOrientationChange = () => {
      setIsLandscapeMode(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', handleOrientationChange);
    window.addEventListener('orientationchange', handleOrientationChange);
    return () => {
      window.removeEventListener('resize', handleOrientationChange);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  // Listen to fullscreen transitions (from both custom UI and inner iframe video player controls)
  useEffect(() => {
    const handleFullscreenChange = async () => {
      const fsElement = 
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement;

      const activeFs = !!fsElement;
      setIsFullscreen(activeFs);

      if (activeFs) {
        // Fullscreen entered (including when user taps the player's internal fullscreen arrows!)
        try {
          if (screen.orientation && typeof screen.orientation.lock === 'function') {
            await screen.orientation.lock('landscape');
          } else if ((screen as any).lockOrientation) {
            (screen as any).lockOrientation('landscape');
          } else if ((screen as any).webkitLockOrientation) {
            (screen as any).webkitLockOrientation('landscape');
          } else if ((screen as any).mozLockOrientation) {
            (screen as any).mozLockOrientation('landscape');
          }
        } catch (err) {
          console.log('Native screen orientation lock not permitted by device settings:', err);
          // If native lock failed and device is held vertically, activate CSS forced landscape
          if (window.innerWidth < window.innerHeight) {
            setIsForcedLandscape(true);
          }
        }
      } else {
        // Exited fullscreen -> release orientation lock
        try {
          if (screen.orientation && typeof screen.orientation.unlock === 'function') {
            screen.orientation.unlock();
          } else if ((screen as any).unlockOrientation) {
            (screen as any).unlockOrientation();
          } else if ((screen as any).webkitUnlockOrientation) {
            (screen as any).webkitUnlockOrientation();
          } else if ((screen as any).mozUnlockOrientation) {
            (screen as any).mozUnlockOrientation();
          }
        } catch (_) {}
        setIsForcedLandscape(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);

      try {
        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
          screen.orientation.unlock();
        }
      } catch (_) {}
    };
  }, []);

  const toggleFullscreen = async () => {
    if (!videoContainerRef.current) return;
    const fsElement =
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement;

    if (!fsElement) {
      try {
        const el = videoContainerRef.current as any;
        if (el.requestFullscreen) {
          await el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
          await el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
          await el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
          await el.msRequestFullscreen();
        }

        // Attempt locking orientation immediately
        if (screen.orientation && typeof screen.orientation.lock === 'function') {
          await screen.orientation.lock('landscape').catch(() => {
            if (window.innerWidth < window.innerHeight) {
              setIsForcedLandscape(true);
            }
          });
        } else if (window.innerWidth < window.innerHeight) {
          setIsForcedLandscape(true);
        }
      } catch (err) {
        console.error('Error attempting to enable fullscreen:', err);
        setIsForcedLandscape(true);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen();
        } else if ((document as any).mozCancelFullScreen) {
          await (document as any).mozCancelFullScreen();
        } else if ((document as any).msExitFullscreen) {
          await (document as any).msExitFullscreen();
        }

        if (screen.orientation && typeof screen.orientation.unlock === 'function') {
          screen.orientation.unlock();
        }
      } catch (err) {
        console.error('Error attempting to exit fullscreen:', err);
      }
      setIsForcedLandscape(false);
    }
  };

  const toggleForcedLandscape = () => {
    setIsForcedLandscape(prev => !prev);
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
                  {selectedServerIndex === 0 ? 'سيرفر VIP' : `سيرفر ${selectedServerIndex}`}
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
          
          {/* Rotate Screen to Landscape button for Mobile and Tablets */}
          <button
            onClick={toggleForcedLandscape}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${
              isForcedLandscape 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.35)]' 
                : 'text-amber-400 hover:text-amber-300 bg-amber-950/20 border-amber-500/30 hover:border-amber-400'
            }`}
            title="تدوير الشاشة بالعرض وملء الشاشة للموبايل"
          >
            <RotateCw className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">شاشة بالعرض</span>
            <span className="sm:hidden text-[11px]">بالعرض</span>
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
          {/* Video Container (16:9 Aspect Ratio or Fullscreen Rotated Landscape) */}
          <div 
            ref={videoContainerRef}
            className={
              isForcedLandscape
                ? "fixed inset-0 z-[100] w-screen h-screen bg-black flex items-center justify-center overflow-hidden"
                : "relative w-full aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 glow-prime"
            }
          >
            {/* Quick Exit Button when in Forced Landscape */}
            {isForcedLandscape && (
              <div className="absolute top-3 right-3 z-50 flex items-center gap-2">
                <button
                  onClick={() => setIsForcedLandscape(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/85 hover:bg-black text-amber-300 hover:text-white text-xs font-bold border border-amber-500/50 backdrop-blur-md shadow-2xl transition-all active:scale-95"
                >
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>الوضع الرأسي (خروج)</span>
                </button>
              </div>
            )}

            {/* Mobile Quick Rotate button over the player in standard mode */}
            {!isForcedLandscape && (
              <button
                onClick={toggleForcedLandscape}
                className="sm:hidden absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/80 hover:bg-black text-amber-300 border border-amber-500/40 text-[11px] font-bold backdrop-blur-md shadow-lg transition-all active:scale-95"
                title="تدوير الشاشة بالعرض لمشاهدة أفضل"
              >
                <RotateCw className="w-3 h-3 text-amber-400" />
                <span>شاشة بالعرض</span>
              </button>
            )}

            <div 
              className={
                isForcedLandscape
                  ? isLandscapeMode
                    ? "w-full h-full relative flex items-center justify-center bg-black"
                    : "w-[100vh] h-[100vw] rotate-90 origin-center relative flex items-center justify-center bg-black"
                  : "w-full h-full relative"
              }
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
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen *; screen-wake-lock; orientation-lock"
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

            {/* Seamless Server Chips: VIP Golden, 1, 2, 3... Blue, and Download */}
            <div className="flex flex-wrap items-center gap-2">
              {availableServers.map((server, idx) => {
                const isActive = selectedServerIndex === idx;
                const isVip = idx === 0;

                // Naming logic:
                // Server 0 -> سيرفر VIP
                // Server 1+ -> سيرفر 1, سيرفر 2, سيرفر 3...
                const label = isVip ? 'سيرفر VIP' : `سيرفر ${idx}`;

                return (
                  <button
                    key={server.id || idx}
                    onClick={() => handleServerSwitch(idx)}
                    title={server.name || label}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-black transition-all duration-200 active:scale-95 ${
                      isVip
                        ? isActive
                          ? 'bg-amber-400 border-amber-300 text-black shadow-[0_0_16px_rgba(251,191,36,0.6)] scale-105'
                          : 'bg-amber-950/40 border-amber-600/70 text-amber-300 hover:border-amber-400 hover:bg-amber-900/50'
                        : isActive
                          ? 'bg-[#00a8e1] border-cyan-300 text-black shadow-[0_0_16px_rgba(0,168,225,0.6)] scale-105'
                          : 'bg-blue-950/50 border-blue-600/70 text-blue-200 hover:border-cyan-400 hover:text-white hover:bg-blue-900/60'
                    }`}
                  >
                    {isVip && <Zap className="w-3.5 h-3.5 text-amber-400 fill-current shrink-0" />}
                    <span>{label}</span>
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
