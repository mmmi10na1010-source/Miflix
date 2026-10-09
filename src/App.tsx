/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  MediaItem, 
  CategoryId, 
  CATEGORIES_ORDERED,
  AdSettings
} from './types';
import { 
  getStoredMediaItems, 
  saveMediaItems, 
  resetMediaCatalogToDefault,
  getMyListIds,
  toggleMyList,
  isAdminLoggedIn,
  logoutAdmin,
  recordMediaView,
  subscribeToGlobalMediaCatalog,
  fetchGlobalMediaCatalog,
  subscribeToAdSettings,
  getStoredAdSettings
} from './services/storage';

import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { BrandHub } from './components/BrandHub';
import { CategoryRow } from './components/CategoryRow';
import { Top10Row } from './components/Top10Row';
import { MediaCard } from './components/MediaCard';
import { MediaDetailsModal } from './components/MediaDetailsModal';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { getLatestEpisodeNumber } from './utils/imageHelper';
import { AdminLoginModal } from './components/AdminLoginModal';
import { AdminDashboard } from './components/AdminDashboard';
import { MiflixIntroModal } from './components/MiflixIntroModal';
import { MiflixLogo } from './components/MiflixLogo';
import { AdSlot } from './components/AdSlot';

import { 
  Film, 
  Bookmark, 
  Search, 
  Shield
} from 'lucide-react';

export default function App() {
  // Application Data & State
  const [mediaItems, setMediaItems] = useState<MediaItem[]>(getStoredMediaItems);
  const [myListIds, setMyListIds] = useState<string[]>(getMyListIds);
  const [isAdmin, setIsAdmin] = useState<boolean>(isAdminLoggedIn);

  // Navigation & Filtering
  const [activeTab, setActiveTab] = useState<string>('home');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryId | null>(null);

  // Active Modals & Viewers
  const [playingMedia, setPlayingMedia] = useState<MediaItem | null>(null);
  const [playingEpisodeId, setPlayingEpisodeId] = useState<string | undefined>(undefined);
  const [detailsMedia, setDetailsMedia] = useState<MediaItem | null>(null);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState<boolean>(false);
  const [isAdminDashboardOpen, setIsAdminDashboardOpen] = useState<boolean>(false);
  const [isIntroOpen, setIsIntroOpen] = useState<boolean>(false);

  // Ad Settings
  const [adSettings, setAdSettings] = useState<AdSettings>(getStoredAdSettings);

  useEffect(() => {
    try {
      if (adSettings?.isEnabled && adSettings?.headerScript) {
        const existing = document.getElementById('miflix-injected-header-script');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'miflix-injected-header-script';
        container.innerHTML = adSettings.headerScript;
        Array.from(container.childNodes).forEach(node => {
          if (node.nodeName === 'SCRIPT') {
            const oldScript = node as HTMLScriptElement;
            const s = document.createElement('script');
            Array.from(oldScript.attributes).forEach(attr => s.setAttribute(attr.name, attr.value));
            if (oldScript.innerHTML) s.innerHTML = oldScript.innerHTML;
            document.head.appendChild(s);
          }
        });
      }
    } catch (e) {
      console.warn('Ad script injection notice:', e);
    }
  }, [adSettings]);

  // Synchronize catalog & settings with Cloud database across all users worldwide
  useEffect(() => {
    // 1. Initial direct fetch from cloud
    fetchGlobalMediaCatalog().then((items) => {
      if (items && items.length > 0) {
        setMediaItems(items);
      }
    });

    // 2. Real-time live listener for catalog changes (adds, edits, deletes)
    const unsubscribeCatalog = subscribeToGlobalMediaCatalog((cloudItems) => {
      if (cloudItems && cloudItems.length > 0) {
        setMediaItems(cloudItems);
      }
    });

    // 3. Real-time ads listener
    const unsubscribeAds = subscribeToAdSettings((newAds) => {
      setAdSettings(newAds);
    });

    return () => {
      if (typeof unsubscribeCatalog === 'function') unsubscribeCatalog();
      if (typeof unsubscribeAds === 'function') unsubscribeAds();
    };
  }, []);

  // Read URL query params on initial load for direct indexing (?watch=id or ?search=query or ?tab=tab)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const watchId = params.get('watch');
      const searchParam = params.get('search');
      const tabParam = params.get('tab');

      if (watchId) {
        const found = mediaItems.find(i => i.id === watchId);
        if (found) {
          setDetailsMedia(found);
        }
      }
      if (searchParam) {
        setSearchQuery(searchParam);
      }
      if (tabParam) {
        setActiveTab(tabParam);
      }
    } catch (e) {
      console.warn('URL param parse error:', e);
    }
  }, []);

  // Sync active item with page title and URL for Googlebot and shareability
  useEffect(() => {
    if (detailsMedia) {
      document.title = `${detailsMedia.title} - مشاهدة أون لاين وتحميل | MIFLIX`;
      const url = new URL(window.location.href);
      url.searchParams.set('watch', detailsMedia.id);
      window.history.replaceState({}, '', url.toString());
    } else if (playingMedia) {
      document.title = `جاري تشغيل ${playingMedia.title} | MIFLIX`;
      const url = new URL(window.location.href);
      url.searchParams.set('watch', playingMedia.id);
      window.history.replaceState({}, '', url.toString());
    } else if (searchQuery.trim()) {
      document.title = `بحث عن "${searchQuery}" | MIFLIX`;
    } else {
      document.title = 'MIFLIX مي فليكس - مشاهدة أحدث الأفلام والمسلسلات والأنمي مترجمة مجاناً';
      const url = new URL(window.location.href);
      if (url.searchParams.has('watch')) {
        url.searchParams.delete('watch');
        window.history.replaceState({}, '', url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ''));
      }
    }
  }, [detailsMedia, playingMedia, searchQuery]);

  // Featured Item for Hero Banner
  const featuredItem = useMemo(() => {
    return mediaItems.find(i => i.isFeatured) || mediaItems[0];
  }, [mediaItems]);

  // Sync media items with storage
  const handleSaveItems = (newItems: MediaItem[]) => {
    setMediaItems(newItems);
  };

  const handleResetCatalog = () => {
    const defaultData = resetMediaCatalogToDefault();
    setMediaItems(defaultData);
  };

  // Toggle watchlist
  const handleToggleWatchlist = (id: string) => {
    const updated = toggleMyList(id);
    setMyListIds(updated);
  };

  const isSavedInList = (id: string) => myListIds.includes(id);

  // Admin handlers
  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    setIsAdminDashboardOpen(true);
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
    setIsAdminDashboardOpen(false);
  };

  // Play handler with AUTOMATIC VIEW COUNTER
  const handlePlayMedia = (item: MediaItem, episodeId?: string) => {
    // Record view in background and update state
    const updated = recordMediaView(item.id);
    setMediaItems(updated);

    setPlayingMedia(item);
    setPlayingEpisodeId(episodeId);
    setDetailsMedia(null);
  };

  // Scroll to category on brand click
  const handleSelectCategoryFromHub = (categoryId: CategoryId) => {
    setSelectedCategoryFilter(categoryId);
    const element = document.getElementById(`section-${categoryId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Filtered Media for Dedicated Tabs or Search
  const filteredMediaList = useMemo(() => {
    let result = mediaItems;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return result.filter(item => {
        const latestEp = getLatestEpisodeNumber(item);
        const latestEpQueries = latestEp !== null ? [
          `الحلقة ${latestEp}`,
          `الحلقه ${latestEp}`,
          `حلقة ${latestEp}`,
          `حلقه ${latestEp}`,
          `الحلقة${latestEp}`,
          `حلقة${latestEp}`,
          `${item.title} ${latestEp}`,
          `${item.title} الحلقة ${latestEp}`,
          `${item.title} الحلقه ${latestEp}`
        ].map(s => s.toLowerCase()) : [];

        // Check if query matches series episode directly
        const matchesLatestEp = latestEpQueries.some(term => term.includes(q) || q.includes(term));

        // Check if query matches any episode description or title
        const matchesEpisodeDesc = item.type === 'series' && item.seasons?.some(s => 
          s.episodes?.some(ep => 
            (ep.description && ep.description.toLowerCase().includes(q)) ||
            (ep.title && ep.title.toLowerCase().includes(q))
          )
        );

        return (
          item.title.toLowerCase().includes(q) ||
          matchesLatestEp ||
          matchesEpisodeDesc ||
          (item.originalTitle && item.originalTitle.toLowerCase().includes(q)) ||
          item.genres.some(g => g.toLowerCase().includes(q)) ||
          item.synopsis.toLowerCase().includes(q) ||
          (item.keywords && item.keywords.some(k => k.toLowerCase().includes(q)))
        );
      });
    }

    if (activeTab === 'turkish') {
      result = result.filter(item => item.categoryId === 'turkish_drama');
    } else if (activeTab === 'arabic') {
      result = result.filter(item => item.categoryId === 'arabic_cinema');
    } else if (activeTab === 'foreign') {
      result = result.filter(item => item.categoryId === 'hollywood');
    } else if (activeTab === 'anime') {
      result = result.filter(item => item.categoryId === 'anime');
    } else if (activeTab === 'movies') {
      result = result.filter(item => item.type === 'movie');
    } else if (activeTab === 'series') {
      result = result.filter(item => item.type === 'series');
    } else if (activeTab === 'mylist') {
      result = result.filter(item => myListIds.includes(item.id));
    }

    if (selectedCategoryFilter && activeTab !== 'home') {
      result = result.filter(item => item.categoryId === selectedCategoryFilter);
    }

    return result;
  }, [mediaItems, searchQuery, activeTab, selectedCategoryFilter, myListIds]);

  return (
    <div className="min-h-screen bg-[#0b1118] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black">
      {/* Top Header Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          setSearchQuery('');
          setSelectedCategoryFilter(null);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
        onOpenAdminLogin={() => setIsAdminLoginOpen(true)}
        onOpenAdminDashboard={() => setIsAdminDashboardOpen(true)}
        onAdminLogout={handleAdminLogout}
        myListCount={myListIds.length}
      />

      {/* Main Content Body */}
      <main className="flex-1 pb-16">
        {/* Case 1: Active Search Query */}
        {searchQuery.trim() ? (
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                  <Search className="w-5 h-5 text-cyan-400" />
                  <span>نتائج البحث عن: "{searchQuery}"</span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  تم العثور على {filteredMediaList.length} عمل
                </p>
              </div>

              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-cyan-400 hover:text-cyan-300 underline"
              >
                مسح البحث
              </button>
            </div>

            {filteredMediaList.length === 0 ? (
              <div className="py-20 text-center text-slate-400 space-y-3">
                <Search className="w-12 h-12 text-slate-600 mx-auto" />
                <p className="text-base">لم نتمكن من العثور على أي عمل يطابق بحثك.</p>
                <p className="text-xs text-slate-500">جرب البحث بكلمات أخرى أو تصفح الأقسام الرئيسية.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredMediaList.map(item => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onPlay={handlePlayMedia}
                    onOpenDetails={setDetailsMedia}
                    isSavedInList={isSavedInList(item.id)}
                    onToggleList={handleToggleWatchlist}
                  />
                ))}
              </div>
            )}
          </div>
        ) : activeTab === 'home' ? (
          /* Case 2: Homepage */
          <div>
            {/* Amazon Prime Cinematic Hero Banner */}
            {featuredItem && (
              <HeroBanner
                item={featuredItem}
                onPlay={handlePlayMedia}
                onMoreInfo={setDetailsMedia}
                isSavedInList={isSavedInList(featuredItem.id)}
                onToggleList={handleToggleWatchlist}
              />
            )}

            {/* Hub for quick categories (تركي، عربي، أجنبي، أنمي) */}
            <BrandHub onSelectCategory={handleSelectCategoryFromHub} />

            {/* AUTOMATIC TRENDING TOP 10 (يحسب الرائج تلقائياً من عدد المشاهدات الفعلي) */}
            <Top10Row
              items={mediaItems}
              onPlay={handlePlayMedia}
              onOpenDetails={setDetailsMedia}
              isSavedInList={isSavedInList}
              onToggleList={handleToggleWatchlist}
            />

            {/* Home Banner Ad */}
            {adSettings.isEnabled && adSettings.homeBannerHtml && (
              <div className="max-w-7xl mx-auto px-4 md:px-8 my-4">
                <AdSlot htmlContent={adSettings.homeBannerHtml} label="إعلان ممول" />
              </div>
            )}

            {/* Category 1: تركي (Turkish Drama) */}
            <div id="section-turkish_drama">
              <CategoryRow
                category={CATEGORIES_ORDERED[0]}
                items={mediaItems.filter(i => i.categoryId === 'turkish_drama')}
                onPlay={handlePlayMedia}
                onOpenDetails={setDetailsMedia}
                isSavedInList={isSavedInList}
                onToggleList={handleToggleWatchlist}
              />
            </div>

            {/* Category 2: عربي (Arabic Cinema) */}
            <div id="section-arabic_cinema">
              <CategoryRow
                category={CATEGORIES_ORDERED[1]}
                items={mediaItems.filter(i => i.categoryId === 'arabic_cinema')}
                onPlay={handlePlayMedia}
                onOpenDetails={setDetailsMedia}
                isSavedInList={isSavedInList}
                onToggleList={handleToggleWatchlist}
              />
            </div>

            {/* Category 3: أجنبي (Foreign / Hollywood) */}
            <div id="section-hollywood">
              <CategoryRow
                category={CATEGORIES_ORDERED[2]}
                items={mediaItems.filter(i => i.categoryId === 'hollywood')}
                onPlay={handlePlayMedia}
                onOpenDetails={setDetailsMedia}
                isSavedInList={isSavedInList}
                onToggleList={handleToggleWatchlist}
              />
            </div>

            {/* Category 4: أنمي (Anime) */}
            <div id="section-anime">
              <CategoryRow
                category={CATEGORIES_ORDERED[3]}
                items={mediaItems.filter(i => i.categoryId === 'anime')}
                onPlay={handlePlayMedia}
                onOpenDetails={setDetailsMedia}
                isSavedInList={isSavedInList}
                onToggleList={handleToggleWatchlist}
              />
            </div>
          </div>
        ) : (
          /* Case 3: Dedicated Grid Tabs (تركي، عربي، أجنبي، أنمي، أفلام، مسلسلات، قائمتي) */
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white">
                  {activeTab === 'turkish' && 'الدراما والأفلام التركية'}
                  {activeTab === 'arabic' && 'السينما والمسلسلات العربية'}
                  {activeTab === 'foreign' && 'السينما الأجنبية والعالمية'}
                  {activeTab === 'anime' && 'عالم الأنمي'}
                  {activeTab === 'movies' && 'الأفلام السينمائية'}
                  {activeTab === 'series' && 'المسلسلات الكاملة'}
                  {activeTab === 'mylist' && 'قائمتي الخاصة'}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  {activeTab === 'mylist' 
                    ? 'الأعمال التي قمت بحفظها لمشاهدتها لاحقاً'
                    : `عرض وتصفح أحدث الأعمال (${filteredMediaList.length} عمل)`}
                </p>
              </div>
            </div>

            {filteredMediaList.length === 0 ? (
              <div className="py-24 text-center text-slate-400 space-y-3">
                {activeTab === 'mylist' ? (
                  <>
                    <Bookmark className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-base font-semibold">قائمتك فارغة حالياً</p>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      يمكنك إضافة أي فيلم أو مسلسل إلى قائمتك بالنقر على زر (+) لحفظه والمشاهدة لاحقاً.
                    </p>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="mt-4 px-4 py-2 rounded-xl bg-[#00a8e1] hover:bg-[#0094c7] text-[#0b1118] text-xs font-bold"
                    >
                      تصفح الأعمال الآن
                    </button>
                  </>
                ) : (
                  <>
                    <Film className="w-12 h-12 text-slate-600 mx-auto" />
                    <p className="text-base">لا توجد أعمال في هذا التصنيف حالياً.</p>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredMediaList.map(item => (
                  <MediaCard
                    key={item.id}
                    item={item}
                    onPlay={handlePlayMedia}
                    onOpenDetails={setDetailsMedia}
                    isSavedInList={isSavedInList(item.id)}
                    onToggleList={handleToggleWatchlist}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modern Prime Cinematic Footer */}
      <footer className="bg-[#090d14] border-t border-slate-800/80 py-8 px-4 md:px-8 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start gap-2">
            <MiflixLogo size="sm" onClick={() => setIsIntroOpen(true)} />
            <p className="text-slate-400 max-w-md text-center md:text-right leading-relaxed text-xs">
              منصة البث السينمائي MIFLIX. تجربة مشاهدة فائقة السرعة مع سيرفرات متعددة وأحدث الأعمال التركية، العربية، الأجنبية، والأنمي.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400">
            <button
              onClick={() => setIsIntroOpen(true)}
              className="hover:text-cyan-400 transition-colors"
            >
              شعار MIFLIX الصوتي
            </button>
            <span className="text-slate-700">·</span>
            <button
              onClick={() => {
                if (isAdmin) {
                  setIsAdminDashboardOpen(true);
                } else {
                  setIsAdminLoginOpen(true);
                }
              }}
              className="hover:text-cyan-400 transition-colors flex items-center gap-1 font-medium"
            >
              <Shield className="w-3.5 h-3.5 text-cyan-400" />
              <span>{isAdmin ? 'لوحة تحكم المشرف' : 'تسجيل دخول المشرف (miflix)'}</span>
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-6 pt-5 border-t border-slate-800/50 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} MIFLIX</span>
          <span className="font-mono">MIFLIX Stream Engine</span>
        </div>
      </footer>

      {/* Video Player Modal with Multi-Server Switcher */}
      {playingMedia && (
        <VideoPlayerModal
          item={playingMedia}
          initialEpisodeId={playingEpisodeId}
          onClose={() => setPlayingMedia(null)}
          onRecordView={(mediaId) => {
            const updated = recordMediaView(mediaId);
            setMediaItems(updated);
          }}
        />
      )}

      {/* Media Details Modal */}
      {detailsMedia && (
        <MediaDetailsModal
          item={detailsMedia}
          onClose={() => setDetailsMedia(null)}
          onPlay={handlePlayMedia}
          isSavedInList={isSavedInList(detailsMedia.id)}
          onToggleList={handleToggleWatchlist}
        />
      )}

      {/* Admin Login Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
      />

      {/* Admin Dashboard */}
      {isAdmin && isAdminDashboardOpen && (
        <AdminDashboard
          items={mediaItems}
          onSaveItems={handleSaveItems}
          onResetCatalog={handleResetCatalog}
          onClose={() => setIsAdminDashboardOpen(false)}
        />
      )}

      {/* Intro Modal */}
      <MiflixIntroModal
        isOpen={isIntroOpen}
        onClose={() => setIsIntroOpen(false)}
      />
    </div>
  );
}
