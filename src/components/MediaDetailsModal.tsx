import React, { useState, useMemo } from 'react';
import { 
  X, 
  Play, 
  Plus, 
  Check, 
  Star, 
  Server, 
  Tv, 
  Eye, 
  Tag, 
  Copy,
  Download,
  Zap
} from 'lucide-react';
import { MediaItem, Season } from '../types';
import { normalizeImageUrl } from '../utils/imageHelper';

interface MediaDetailsModalProps {
  item: MediaItem;
  onClose: () => void;
  onPlay: (item: MediaItem, episodeId?: string) => void;
  isSavedInList: boolean;
  onToggleList: (id: string) => void;
}

export const MediaDetailsModal: React.FC<MediaDetailsModalProps> = ({
  item,
  onClose,
  onPlay,
  isSavedInList,
  onToggleList
}) => {
  const isSeries = item.type === 'series' && (item.seasons?.length ?? 0) > 0;
  const [showKeywords, setShowKeywords] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedSeasonId, setSelectedSeasonId] = useState<string>(
    item.seasons?.[0]?.id || ''
  );

  // Active Keywords: Uses custom keywords if saved or generates dynamic high-ranking SEO terms
  const activeKeywords = useMemo(() => {
    if (item.keywords && item.keywords.length > 0) {
      return item.keywords;
    }
    const isMovie = item.type === 'movie';
    const prefix = isMovie ? 'فيلم' : 'مسلسل';
    const list = [
      `مشاهدة ${prefix} ${item.title} مترجم كامل`,
      `تحميل ${prefix} ${item.title} 1080p FHD`,
      `ايجي بست ${item.title}`,
      `ماي سيما ${item.title}`,
      `قصة عشق ${item.title}`,
      `فشار ${item.title}`,
      `${item.title} بجودة عالية`,
      `${item.title} بدون إعلانات مزعجة`
    ];
    if (item.originalTitle) {
      list.push(`Watch ${item.originalTitle} online 1080p`);
    }
    item.genres.forEach(g => {
      list.push(`${prefix} ${item.title} ${g}`);
    });
    return list;
  }, [item]);

  const handleCopyKeywords = () => {
    navigator.clipboard.writeText(activeKeywords.join(', '));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const activeSeason = item.seasons?.find(s => s.id === selectedSeasonId) || item.seasons?.[0];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0f1723] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl my-auto animate-in fade-in duration-200">
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
            src={item.backdropUrl || item.posterUrl}
            alt={item.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f1723] via-[#0f1723]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f1723] via-transparent to-transparent" />

          {/* Overlay CTA & Title */}
          <div className="absolute bottom-6 right-6 left-6 flex flex-col justify-end">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white drop-shadow-md mb-2">
              {item.title}
            </h2>

            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => onPlay(item)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#00a8e1] hover:bg-[#0094c7] text-[#0b1118] font-bold text-sm shadow-[0_0_20px_rgba(0,168,225,0.4)] transition-all transform hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
                <span>مشاهدة الآن</span>
              </button>

              {/* High-Earning Download VIP Direct Link */}
              <a
                href="https://www.profitableratecpmnetwork.com/thy1fu7h?key=2355ae6acc47ab23d02f4059424dfa30"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs sm:text-sm shadow-[0_0_15px_rgba(16,185,129,0.35)] transition-all transform hover:scale-[1.02]"
              >
                <Download className="w-4 h-4" />
                <span>تحميل FHD 1080p</span>
              </a>

              <button
                onClick={() => onToggleList(item.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs font-semibold transition-all ${
                  isSavedInList
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                    : 'bg-[#141f2e]/90 border-slate-700 text-slate-200 hover:bg-[#1a293c]'
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

              {/* Keywords SEO Button - Always visible on every movie & series */}
              <button
                type="button"
                onClick={() => setShowKeywords(prev => !prev)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-xs sm:text-sm font-semibold transition-all ${
                  showKeywords
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_16px_rgba(0,168,225,0.4)] ring-1 ring-cyan-400'
                    : 'bg-[#141f2e] border-cyan-800/80 text-cyan-300 hover:text-white hover:bg-[#1a293c] hover:border-cyan-400'
                }`}
                title="عرض الكلمات المفتاحية ووسوم السيو"
              >
                <Tag className="w-4 h-4 text-cyan-400" />
                <span>الكلمات المفتاحية ({activeKeywords.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body Info */}
        <div className="p-6 md:p-8 space-y-5">
          {/* Expanded SEO Keywords Container */}
          {showKeywords && (
            <div className="p-4 rounded-xl bg-[#0b131e] border border-cyan-500/50 shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-cyan-300 border-b border-cyan-900/40 pb-2.5">
                <span className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-cyan-400" />
                  <span>كلمات البحث ووسوم السيو (SEO Tags) الخاصة بالعمل:</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyKeywords}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-700/60 text-cyan-300 text-[11px] transition-colors"
                    title="نسخ جميع الكلمات المفتاحية لمشاركتها في تيك توك أو جوجل"
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">تم النسخ بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>نسخ الكلمات</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] text-slate-400 font-normal hidden sm:inline">
                    تساعد في تصدر محرك بحث جوجل ومحرك الموقع
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {activeKeywords.map((kw, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-950/80 border border-cyan-800/70 text-cyan-200 text-xs font-medium hover:border-cyan-400 transition-colors"
                  >
                    <span className="text-cyan-400/70 font-mono text-[10px]">#</span>
                    <span>{kw}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Hidden SEO Metadata for Googlebot and Crawlers */}
          <div className="sr-only" aria-hidden="true">
            <span>الكلمات المفتاحية ومصطلحات البحث لمشاهدة الفيلم: {activeKeywords.join(', ')}</span>
          </div>
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
            <span className="flex items-center gap-1 text-cyan-400 font-medium">
              <Eye className="w-3.5 h-3.5" />
              <span>{(item.views || 0).toLocaleString('ar-EG')} مشاهدة</span>
            </span>
          </div>

          {/* Genres */}
          <div className="flex flex-wrap items-center gap-2">
            {item.genres.map((g) => (
              <span 
                key={g}
                className="text-xs px-2.5 py-1 rounded-md bg-[#141f2e] border border-slate-700 text-slate-300"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Synopsis with Netflix / Qissat Ishq Poster Feature */}
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            {/* High-res Vertical Poster (Qissat Ishq style) */}
            <div className="hidden sm:block shrink-0 w-32 md:w-36 aspect-[2/3] rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_4px_20px_rgba(0,168,225,0.25)] bg-[#0c1420]">
              <img
                src={normalizeImageUrl(item.posterUrl || item.backdropUrl)}
                alt={item.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            </div>

            <div className="flex-1 space-y-3">
              <div>
                <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>قصة وتفاصيل العمل</span>
                </h4>
                <p className="text-sm md:text-base text-slate-200 leading-relaxed font-normal">
                  {item.synopsis}
                </p>
              </div>

              {/* Multi-Server Information Note */}
              <div className="p-3 rounded-xl bg-[#141f2e] border border-slate-700/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs text-slate-300">
                    يدعم هذا العمل سيرفرات تشغيل فائقة السرعة مع التبديل الفوري والجودة العالية.
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-cyan-400">سيرفرات جاهزة</span>
              </div>
            </div>
          </div>

          {/* TV Series Seasons & Episodes Selector */}
          {isSeries && activeSeason && (
            <div className="pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-base font-bold text-white flex items-center gap-2">
                  <Tv className="w-4 h-4 text-cyan-400" />
                  <span>الحلقات</span>
                </h4>

                {item.seasons && item.seasons.length > 1 && (
                  <select
                    value={selectedSeasonId}
                    onChange={(e) => setSelectedSeasonId(e.target.value)}
                    className="bg-[#141f2e] border border-slate-700 text-cyan-300 text-xs rounded-lg px-3 py-1.5 focus:outline-none"
                  >
                    {item.seasons.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {activeSeason.episodes.map(ep => (
                  <div
                    key={ep.id}
                    className="p-3 rounded-xl bg-[#141f2e] border border-slate-700/70 hover:border-cyan-500/50 flex items-center justify-between gap-4 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-xs font-mono font-bold text-slate-500 mt-1">
                        #{ep.episodeNumber}
                      </span>
                      <div>
                        <h5 className="text-sm font-semibold text-white">
                          {ep.title}
                        </h5>
                        {ep.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {ep.description}
                          </p>
                        )}
                        <span className="text-[11px] text-slate-500 mt-1 inline-block">
                          {ep.duration || '45 دقيقة'} · {ep.servers.length} سيرفرات متوفرة
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => onPlay(item, ep.id)}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-600/20 hover:bg-cyan-600 text-cyan-300 hover:text-white border border-cyan-500/50 text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>مشاهدة</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
