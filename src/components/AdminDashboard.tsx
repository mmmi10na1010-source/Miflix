import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit3, 
  Server, 
  Tv, 
  Film, 
  Search, 
  X, 
  Check, 
  RotateCcw, 
  Download, 
  Upload, 
  Shield,
  Eye,
  TrendingUp,
  LayoutGrid,
  Sparkles,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  AlertTriangle,
  Play,
  Megaphone,
  Tag,
  Globe,
  Send,
  Zap
} from 'lucide-react';
import { 
  MediaItem, 
  CategoryId, 
  CATEGORIES_ORDERED, 
  MediaType, 
  ServerSource, 
  Season, 
  Episode,
  AdSettings
} from '../types';
import { AdsManagerModal } from './AdsManagerModal';
import { 
  getStoredAdSettings, 
  saveAdSettings,
  saveSingleMediaItemToCloud,
  deleteMediaItemFromCloud,
  saveMediaItems
} from '../services/storage';
import { normalizeImageUrl, isHtmlViewerImageUrl } from '../utils/imageHelper';

interface AdminDashboardProps {
  items: MediaItem[];
  onSaveItems: (items: MediaItem[]) => void;
  onResetCatalog: () => void;
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  items,
  onSaveItems,
  onResetCatalog,
  onClose
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | 'all'>('all');
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'views' | 'rating' | 'date'>('views');

  // Interactive in-UI deletion confirmation (NO window.confirm!)
  const [itemToDelete, setItemToDelete] = useState<MediaItem | null>(null);

  // Ads Manager state
  const [isAdsModalOpen, setIsAdsModalOpen] = useState<boolean>(false);
  const [isSeoGuideOpen, setIsSeoGuideOpen] = useState<boolean>(false);
  const [adSettings, setAdSettings] = useState<AdSettings>(getStoredAdSettings);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSaveAdSettings = (newSettings: AdSettings) => {
    setAdSettings(newSettings);
    saveAdSettings(newSettings);
    showToast('تم حفظ إعدادات الإعلانات بنجاح.');
  };

  // Filtered and sorted items
  const filteredItems = items
    .filter(item => {
      const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.originalTitle && item.originalTitle.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'views') return (b.views || 0) - (a.views || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Confirmed Delete
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    const deletedTitle = itemToDelete.title;
    try {
      await deleteMediaItemFromCloud(itemToDelete.id);
      const updated = items.filter(i => i.id !== itemToDelete.id);
      onSaveItems(updated);
      setItemToDelete(null);
      showToast(`تم حذف "${deletedTitle}" بنجاح من السحابة وجميع الأجهزة.`);
    } catch (err: any) {
      showToast(`خطأ أثناء الحذف من السحابة: ${err?.message || 'تعذر الحذف'}`);
    }
  };

  // Save (Add or Update)
  const handleSaveItem = async (savedItem: MediaItem) => {
    try {
      await saveSingleMediaItemToCloud(savedItem);
      const exists = items.some(i => i.id === savedItem.id);
      let updated: MediaItem[];
      if (exists) {
        updated = items.map(i => i.id === savedItem.id ? savedItem : i);
        showToast('تم تحديث العمل ومزامنته سحابياً بنجاح.');
      } else {
        updated = [savedItem, ...items];
        showToast('تمت إضافة العمل ومزامنته سحابياً بنجاح.');
      }
      onSaveItems(updated);
      setEditingItem(null);
      setIsNewModalOpen(false);
    } catch (err: any) {
      showToast(`فشل الحفظ في السحابة: ${err?.message || 'خطأ غير متوقع'}`);
    }
  };

  // Export JSON backup
  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(items, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `miflix-backup-${new Date().toISOString().slice(0, 10)}.json`);
    dlAnchor.click();
    showToast('تم تصدير نسخة احتياطية من الكتالوج بنجاح.');
  };

  // Import JSON backup
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            await saveMediaItems(parsed);
            onSaveItems(parsed);
            showToast('تم استيراد الكتالوج ومزامنته سحابياً بنجاح.');
          } else {
            showToast('خطأ: ملف النسخة الاحتياطية غير متطابق.');
          }
        } catch {
          showToast('تعذر قراءة ملف JSON أو الحفظ في السحابة.');
        }
      };
    }
  };

  // Export updated sitemap.xml for Google Search Console
  const handleExportSitemapXml = () => {
    const baseUrl = 'https://maiflix.mmmi10na1010.workers.dev';
    const today = new Date().toISOString().slice(0, 10);
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
    xml += `  <url><loc>${baseUrl}/</loc><lastmod>${today}</lastmod><changefreq>hourly</changefreq><priority>1.0</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/?tab=turkish</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/?tab=arabic</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/?tab=foreign</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/?tab=anime</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/?tab=movies</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;
    xml += `  <url><loc>${baseUrl}/?tab=series</loc><lastmod>${today}</lastmod><changefreq>daily</changefreq><priority>0.9</priority></url>\n`;

    items.forEach(item => {
      xml += `  <url><loc>${baseUrl}/?watch=${item.id}</loc><lastmod>${item.createdAt || today}</lastmod><changefreq>daily</changefreq><priority>0.85</priority></url>\n`;
      if (item.type === 'series' && item.seasons) {
        item.seasons.forEach(s => {
          s.episodes?.forEach(ep => {
            xml += `  <url><loc>${baseUrl}/?watch=${item.id}&amp;ep=${ep.id}</loc><lastmod>${item.createdAt || today}</lastmod><changefreq>daily</changefreq><priority>0.80</priority></url>\n`;
          });
        });
      }
    });

    xml += `</urlset>`;

    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", url);
    dlAnchor.setAttribute("download", "sitemap.xml");
    dlAnchor.click();
    showToast('تم تصدير ملف خريطة الموقع sitemap.xml المحدث لكافة الأعمال بنجاح!');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#090e15] overflow-y-auto text-slate-100">
      {/* Top Header */}
      <header className="sticky top-0 z-30 bg-[#0c1420]/95 backdrop-blur-md border-b border-slate-800 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-sky-600 shadow-md">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <span>لوحة تحكم MIFLIX المتقدمة</span>
              <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                MIFLIX STUDIO
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              إدارة احترافية منظمة للأفلام، المسلسلات، المواسم، الحلقات وسيرفرات البث
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setIsSeoGuideOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-950/60 to-teal-950/60 hover:from-emerald-900/80 hover:to-teal-900/80 border border-emerald-500/50 text-emerald-300 hover:text-white text-xs sm:text-sm font-bold transition-all shadow-sm"
            title="دليل تصدر محرك بحث جوجل وأرشفة الموقع الفورية"
          >
            <Globe className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">سيو وأرشفة جوجل ⚡</span>
          </button>

          <button
            onClick={() => setIsAdsModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#141f2e] hover:bg-slate-800 border border-slate-700 text-cyan-300 hover:text-white text-xs sm:text-sm font-bold transition-all"
            title="إدارة أكواد الإعلانات في الموقع"
          >
            <Megaphone className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">إدارة الإعلانات</span>
          </button>

          <button
            onClick={() => {
              setEditingItem(null);
              setIsNewModalOpen(true);
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#00A8E1] to-[#0284C7] hover:from-[#00B4F5] hover:to-[#0396E5] text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-900/30 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة عمل جديد</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141f2e] border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="خروج من لوحة التحكم"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-[#0c1420] border border-cyan-500/50 text-cyan-300 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <Check className="w-4 h-4 text-cyan-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        {/* KPI Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="p-4 rounded-2xl bg-[#0c1420] border border-slate-800/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">إجمالي الكتالوج</p>
              <h4 className="text-lg sm:text-xl font-black text-white">{items.length} عمل</h4>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0c1420] border border-slate-800/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">أفلام سينمائية</p>
              <h4 className="text-lg sm:text-xl font-black text-white">
                {items.filter(i => i.type === 'movie').length} فيلم
              </h4>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0c1420] border border-slate-800/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Tv className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">مسلسلات وأنمي</p>
              <h4 className="text-lg sm:text-xl font-black text-white">
                {items.filter(i => i.type === 'series').length} مسلسل
              </h4>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#0c1420] border border-slate-800/80 shadow-sm flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400">إجمالي المشاهدات</p>
              <h4 className="text-lg sm:text-xl font-black text-white font-mono">
                {items.reduce((acc, curr) => acc + (curr.views || 0), 0).toLocaleString('ar-EG')}
              </h4>
            </div>
          </div>
        </div>

        {/* Filter, Search & Backup Actions Bar */}
        <div className="p-4 rounded-2xl bg-[#0c1420] border border-slate-800 space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث بالاسم العربي أو الإنجليزي..."
                className="w-full bg-[#141f2e] border border-slate-700/80 focus:border-cyan-400 rounded-xl pr-10 pl-4 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sorting & Backup Utilities */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 bg-[#141f2e] border border-slate-700/80 rounded-xl p-1 text-xs">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan-400 mr-1" />
                <button
                  onClick={() => setSortBy('views')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                    sortBy === 'views' ? 'bg-[#00A8E1] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الأعلى مشاهدة (الرائج)
                </button>
                <button
                  onClick={() => setSortBy('rating')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                    sortBy === 'rating' ? 'bg-[#00A8E1] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  التقييم
                </button>
                <button
                  onClick={() => setSortBy('date')}
                  className={`px-2.5 py-1.5 rounded-lg transition-colors font-medium ${
                    sortBy === 'date' ? 'bg-[#00A8E1] text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الأحدث
                </button>
              </div>

              {/* Backup & Restore Buttons */}
              <div className="flex items-center gap-1.5 mr-auto md:mr-0">
                <button
                  onClick={handleExportJson}
                  className="p-2 rounded-xl bg-[#141f2e] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  title="تصدير نسخة احتياطية من الكتالوج (JSON)"
                >
                  <Download className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">نسخة احتياطية</span>
                </button>

                <label
                  className="p-2 rounded-xl bg-[#141f2e] hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                  title="استيراد كتالوج من ملف JSON"
                >
                  <Upload className="w-4 h-4 text-cyan-400" />
                  <span className="hidden sm:inline">استيراد</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportJson}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => {
                    if (confirm('هل تريد استعادة الكتالوج الافتراضي الأصلي؟')) {
                      onResetCatalog();
                      showToast('تم استعادة الكتالوج الافتراضي الأصلي بنجاح.');
                    }
                  }}
                  className="p-2 rounded-xl bg-[#141f2e] hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 transition-colors"
                  title="استعادة الكتالوج الافتراضي"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-t border-slate-800/80 pt-3">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                  : 'bg-[#141f2e] text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              الكل ({items.length})
            </button>
            {CATEGORIES_ORDERED.map(cat => {
              const count = items.filter(i => i.categoryId === cat.id).length;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50'
                      : 'bg-[#141f2e] text-slate-400 hover:text-white border border-transparent'
                  }`}
                >
                  <span>{cat.titleAr}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/40 text-slate-400">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Media Items Cards Grid */}
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-[#0c1420] border border-slate-800 space-y-3">
            <LayoutGrid className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">لا توجد أعمال مطابقة لبحثك</h3>
            <p className="text-xs text-slate-400">جرب البحث بكلمة أخرى أو تغيير القسم المحدد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map(item => {
              const isSeries = item.type === 'series';
              const serverCount = isSeries 
                ? (item.seasons?.reduce((acc, s) => acc + s.episodes.reduce((eAcc, ep) => eAcc + ep.servers.length, 0), 0) || 0)
                : (item.servers?.length || 0);

              const episodeCount = isSeries
                ? (item.seasons?.reduce((acc, s) => acc + s.episodes.length, 0) || 0)
                : 0;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-[#0c1420] border border-slate-800/80 hover:border-slate-700 p-4 flex flex-col justify-between gap-4 transition-all duration-200 hover:shadow-xl"
                >
                  {/* Card Top: Poster & Info */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={item.posterUrl}
                      alt={item.title}
                      className="w-20 h-28 object-cover rounded-xl shrink-0 border border-slate-700/60 shadow-md"
                    />

                    <div className="flex-1 min-w-0 space-y-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          isSeries 
                            ? 'bg-sky-950 text-sky-300 border border-sky-800' 
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}>
                          {isSeries ? 'مسلسل' : 'فيلم'}
                        </span>

                        {item.isMiflixOriginal && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold">
                            حصري
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400 mr-auto font-mono">
                          {item.releaseYear}
                        </span>
                      </div>

                      <h3 className="font-bold text-sm text-white truncate" title={item.title}>
                        {item.title}
                      </h3>

                      {item.originalTitle && (
                        <p className="text-[11px] text-slate-400 truncate font-mono text-left" dir="ltr">
                          {item.originalTitle}
                        </p>
                      )}

                      {/* Server & Episode Badges */}
                      <div className="flex items-center gap-2 pt-1">
                        <span className="text-[11px] text-cyan-300 bg-cyan-950/70 border border-cyan-800/60 px-2 py-0.5 rounded-md flex items-center gap-1 font-semibold">
                          <Server className="w-3 h-3 text-cyan-400" />
                          <span>{serverCount} سيرفرات</span>
                        </span>

                        {isSeries && (
                          <span className="text-[11px] text-slate-300 bg-[#141f2e] border border-slate-700 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Tv className="w-3 h-3 text-sky-400" />
                            <span>{episodeCount} حلقة ({item.seasons?.length || 1} موسم)</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom: Views and Action Buttons */}
                  <div className="pt-3 border-t border-slate-800/70 flex items-center justify-between gap-2 text-xs">
                    {/* Views Count - Real actual video views */}
                    <div className="flex items-center gap-1.5 text-slate-300 bg-[#141f2e] px-2.5 py-1 rounded-lg border border-slate-700/60" title="مشاهدات فعلية مسجلة تلقائياً من تشغيل الفيديو">
                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono font-bold">{(item.views || 0).toLocaleString('ar-EG')}</span>
                      <span className="text-[10px] text-slate-400">مشاهدة فعلية</span>
                    </div>

                    {/* Action Buttons: Edit & Delete */}
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsNewModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#141f2e] hover:bg-cyan-600/30 text-slate-200 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/50 text-xs font-semibold transition-all"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>تعديل وسيرفرات</span>
                      </button>

                      <button
                        onClick={() => setItemToDelete(item)}
                        className="p-1.5 rounded-lg bg-[#141f2e] hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-700 transition-colors"
                        title="حذف هذا العمل"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* 1. In-UI Interactive Delete Confirmation Modal (Replaces window.confirm) */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#0c1420] border border-rose-900/60 rounded-2xl p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">تأكيد حذف العمل نهائياً</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  هل أنت متأكد من رغبتك في حذف <strong className="text-rose-400 font-bold">"{itemToDelete.title}"</strong>؟
                  سيتم حذف بيانات العمل وكافة روابط سيرفراته نهائياً من MIFLIX.
                </p>
              </div>
            </div>

            {/* Preview Card */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#141f2e] border border-slate-800 text-xs">
              <img
                src={itemToDelete.posterUrl}
                alt={itemToDelete.title}
                className="w-10 h-14 object-cover rounded-lg border border-slate-700"
              />
              <div>
                <p className="font-bold text-white">{itemToDelete.title}</p>
                <p className="text-[11px] text-slate-400">
                  {itemToDelete.type === 'movie' ? 'فيلم سينمائي' : 'مسلسل'} · {itemToDelete.releaseYear}
                </p>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                className="px-4 py-2 rounded-xl bg-[#141f2e] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold transition-colors"
              >
                إلغاء التراجع
              </button>

              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-900/40 transition-all flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>نعم، احذف العمل</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Google SEO & Search Console Modal */}
      {isSeoGuideOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-[#0c1420] border border-emerald-500/50 rounded-2xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Globe className="w-5 h-5" />
                <h3 className="text-base font-bold text-white">دليل أرشفة وظهور الموقع في محرك بحث جوجل (Google SEO)</h3>
              </div>
              <button
                onClick={() => setIsSeoGuideOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1.5">
                <h4 className="font-bold text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>تم تجهيز وبرمجة كل ملفات السيو المتقدمة في موقعك تلقائياً:</span>
                </h4>
                <p className="text-slate-300 text-xs">
                  تم بناء ملف خريطة الموقع الكامل <code>sitemap.xml</code>، وملف <code>robots.txt</code>، ووسوم الميتا تاغ، وبيانات Schema.org المنظمة، وربط أرقام الحلقات والأفلام بروابط مباشرة.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-white text-sm">خطوات ظهور الموقع في الصفحة الأولى بجوجل:</h4>

                <div className="p-3 rounded-xl bg-[#141f2e] border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-300">1. رابط خريطة موقعك (Sitemap URL):</span>
                  <p className="text-xs text-slate-400">انسخ هذا الرابط وضعه في Google Search Console ليقوم روبوت جوجل بفحص كل أعمالك فورياً:</p>
                  <div className="flex items-center gap-2 bg-[#0c1420] p-2 rounded-lg border border-slate-700 font-mono text-xs text-emerald-300 select-all">
                    <span>https://maiflix.mmmi10na1010.workers.dev/sitemap.xml</span>
                  </div>
                  <button
                    onClick={handleExportSitemapXml}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600 border border-emerald-500/50 text-emerald-300 hover:text-white font-bold text-xs transition-all"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>تحميل ملف Sitemap.xml المحدث لجميع أعمالك ({items.length} عمل)</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-[#141f2e] border border-slate-800 space-y-2">
                  <span className="font-bold text-cyan-300">2. إرسال الموقع إلى أدوات مشرفي المواقع (Google Search Console):</span>
                  <p className="text-xs text-slate-400">
                    افتح موقع Google Search Console، واختر "إضافة موقع" (URL Prefix)، ثم ضع رابط موقعك:
                    <br />
                    <code className="text-cyan-300">https://maiflix.mmmi10na1010.workers.dev/</code>
                    <br />
                    تم تضمين كود إثبات الملكية لـ Google تلقائياً داخل كود الموقع وسيتعرف عليه جوجل بضغطة زر!
                  </p>
                  <a
                    href="https://search.google.com/search-console"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#00a8e1] hover:bg-cyan-400 text-black font-bold text-xs"
                  >
                    <span>فتح Google Search Console</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="p-3 rounded-xl bg-[#141f2e] border border-slate-800 space-y-1.5">
                  <span className="font-bold text-cyan-300">3. طلب الفهرسة الفورية (Request Indexing):</span>
                  <p className="text-xs text-slate-400">
                    في شريط البحث بالأعلى داخل Search Console، الصق رابط الموقع واضغط Enter، ثم اضغط على زر <strong className="text-white">"طلب الفهرسة" (Request Indexing)</strong>. سيقوم عنكبوت جوجل بفحص الموقع وخلال ساعات إلى أيام قليلة سيبدأ بالظهور لكل من يبحث عن اسم موقعك أو مسلسلاتك!
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsSeoGuideOpen(false)}
                className="px-4 py-2 rounded-xl bg-[#141f2e] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-semibold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Highly Organized Media Editor Modal with Clean Steps/Tabs */}
      {isNewModalOpen && (
        <OrganizedMediaEditorModal
          initialItem={editingItem}
          onSave={handleSaveItem}
          onClose={() => {
            setIsNewModalOpen(false);
            setEditingItem(null);
          }}
        />
      )}

      {/* Ads Manager Modal */}
      {isAdsModalOpen && (
        <AdsManagerModal
          initialSettings={adSettings}
          onSave={handleSaveAdSettings}
          onClose={() => setIsAdsModalOpen(false)}
        />
      )}
    </div>
  );
};

// ==========================================
// Subcomponent: Highly Organized Media Editor Modal
// Explicitly REMOVED Cast/Crew (طاقم التمثيل)
// Multi-Server, Movies, Seasons, and Episodes Management
// ==========================================

interface OrganizedMediaEditorModalProps {
  initialItem: MediaItem | null;
  onSave: (item: MediaItem) => void;
  onClose: () => void;
}

const OrganizedMediaEditorModal: React.FC<OrganizedMediaEditorModalProps> = ({
  initialItem,
  onSave,
  onClose
}) => {
  const isEdit = !!initialItem;

  // Tabs: 'info' (البيانات العامة) | 'seo' (الكلمات المفتاحية وسيو جوجل) | 'stream_management' (سيرفرات الفيلم أو مواسم المسلسل)
  const [activeTab, setActiveTab] = useState<'info' | 'seo' | 'stream_management'>('info');

  // Form Fields
  const [title, setTitle] = useState(initialItem?.title || '');
  const [originalTitle, setOriginalTitle] = useState(initialItem?.originalTitle || '');
  const [type, setType] = useState<MediaType>(initialItem?.type || 'movie');
  const [categoryId, setCategoryId] = useState<CategoryId>(initialItem?.categoryId || 'turkish_drama');
  const [synopsis, setSynopsis] = useState(initialItem?.synopsis || '');
  const [posterUrl, setPosterUrl] = useState(initialItem?.posterUrl || '');
  const [backdropUrl, setBackdropUrl] = useState(initialItem?.backdropUrl || '');
  const [releaseYear, setReleaseYear] = useState<number | ''>(initialItem?.releaseYear !== undefined ? initialItem.releaseYear : 2024);
  const [rating, setRating] = useState<number | ''>(initialItem?.rating !== undefined ? initialItem.rating : '');
  const [ageRating, setAgeRating] = useState<string>(initialItem?.ageRating || '');
  const [duration, setDuration] = useState(initialItem?.duration || '');
  const [genresInput, setGenresInput] = useState(initialItem?.genres?.join('، ') || 'دراما، تشويق');
  const [keywordsInput, setKeywordsInput] = useState(initialItem?.keywords?.join('، ') || '');
  const [isFeatured, setIsFeatured] = useState(initialItem?.isFeatured || false);
  const [isMiflixOriginal, setIsMiflixOriginal] = useState(initialItem?.isMiflixOriginal || false);
  const [downloadUrl, setDownloadUrl] = useState(initialItem?.downloadUrl || '');

  // Auto Generate High-Ranking SEO Keywords (Focusing strictly on Latest Episode for Series)
  const handleAutoGenerateKeywords = () => {
    const movieTitle = title.trim();
    if (!movieTitle) {
      alert('يرجى كتابة عنوان العمل أولاً لتوليد الكلمات المفتاحية المناسبة له.');
      return;
    }
    const isMovie = type === 'movie';
    let generated: string[] = [];

    if (isMovie) {
      generated = [
        `مشاهدة فيلم ${movieTitle} مترجم كامل`,
        `تحميل فيلم ${movieTitle} 1080p FHD`,
        `ايجي بست ${movieTitle}`,
        `ماي سيما ${movieTitle}`,
        `فشار ${movieTitle}`,
        `${movieTitle} بجودة عالية بدون إعلانات`,
        `${movieTitle} سنة ${releaseYear}`
      ];
      if (originalTitle.trim()) {
        generated.push(`Watch ${originalTitle.trim()} online HD`);
        generated.push(`${originalTitle.trim()} full movie`);
      }
    } else {
      // Find highest / latest episode across all seasons
      let latestEp = 0;
      let latestEpTitle = '';
      let latestEpDesc = '';
      for (const season of seasons) {
        for (const ep of season.episodes) {
          if ((ep.episodeNumber || 0) >= latestEp) {
            latestEp = ep.episodeNumber || 0;
            latestEpTitle = ep.title || '';
            latestEpDesc = ep.description || '';
          }
        }
      }
      const epNum = latestEp > 0 ? latestEp : 1;

      generated = [
        `مسلسل ${movieTitle} الحلقة ${epNum}`,
        `مشاهدة مسلسل ${movieTitle} الحلقة ${epNum} مترجمة كاملة`,
        `تحميل مسلسل ${movieTitle} الحلقة ${epNum} 1080p`,
        `${movieTitle} الحلقة ${epNum} قصة عشق`,
        `${movieTitle} حلقة ${epNum} ايجي بست`,
        `${movieTitle} حلقة ${epNum} ماي سيما`,
        `${movieTitle} الحلقة ${epNum} بدون إعلانات`,
        `الحلقة ${epNum} ${movieTitle}`
      ];

      if (latestEpTitle && !latestEpTitle.startsWith('الحلقة')) {
        generated.push(`${movieTitle} ${latestEpTitle}`);
      }

      if (latestEpDesc.trim()) {
        // Extract key search terms from latest episode description
        const descWords = latestEpDesc.trim().split(/\s+/).slice(0, 10).join(' ');
        generated.push(`${movieTitle} الحلقة ${epNum} ${descWords}`);
      }
    }

    const currentList = keywordsInput
      ? keywordsInput.split(/[,،]/).map(s => s.trim()).filter(Boolean)
      : [];
    const merged = Array.from(new Set([...currentList, ...generated]));
    setKeywordsInput(merged.join('، '));
  };

  // Quick append helper for keyword chips
  const handleAddKeywordChip = (chip: string) => {
    const movieTitle = title.trim() || 'الفيلم';
    const term = `${chip} ${movieTitle}`.trim();
    const currentList = keywordsInput
      ? keywordsInput.split(/[,،]/).map(s => s.trim()).filter(Boolean)
      : [];
    if (!currentList.includes(term)) {
      setKeywordsInput([...currentList, term].join('، '));
    }
  };

  // Movie Servers State
  const [movieServers, setMovieServers] = useState<ServerSource[]>(
    initialItem?.servers || [
      { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p FHD', type: 'direct' },
      { id: 's2', name: 'سيرفر 2 (Ultra 4K)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4', quality: '4K UHD', type: 'direct' }
    ]
  );

  // Series Seasons State
  const [seasons, setSeasons] = useState<Season[]>(
    initialItem?.seasons || [
      {
        id: 's-1',
        seasonNumber: 1,
        title: 'الموسم الأول',
        episodes: [
          {
            id: 'ep-1',
            episodeNumber: 1,
            title: 'الحلقة 1: البداية',
            duration: '45 دقيقة',
            servers: [
              { id: 's1', name: 'سيرفر 1 (سريع VIP)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', quality: '1080p', type: 'direct' },
              { id: 's2', name: 'سيرفر 2 (FHD)', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', quality: '720p', type: 'direct' }
            ]
          }
        ]
      }
    ]
  );

  // Currently selected season index for TV series view
  const [selectedSeasonIdx, setSelectedSeasonIdx] = useState<number>(0);

  // Add Movie Server
  const handleAddMovieServer = () => {
    const newIdx = movieServers.length + 1;
    setMovieServers([
      ...movieServers,
      {
        id: `s-${Date.now()}-${newIdx}`,
        name: newIdx === 1 ? 'سيرفر VIP' : `سيرفر ${newIdx - 1}`,
        url: '',
        type: 'direct'
      }
    ]);
  };

  // Add Free External Preset Server (Telegram, VidSrc, AutoEmbed)
  const handleAddFreePresetServer = (typePreset: 'telegram' | 'vidsrc' | 'autoembed') => {
    if (typePreset === 'telegram') {
      setMovieServers([
        ...movieServers,
        {
          id: `tg-${Date.now()}`,
          name: 'سيرفر تليجرام السحابي (مجاني وسريع 0 إعلانات)',
          url: '',
          quality: '1080p FHD',
          type: 'direct'
        }
      ]);
    } else if (typePreset === 'vidsrc') {
      const cleanTitle = encodeURIComponent(title.trim() || 'avatar');
      setMovieServers([
        ...movieServers,
        {
          id: `vidsrc-${Date.now()}`,
          name: 'سيرفر البث العالمي VidSrc (مجاني ومترجم)',
          url: `https://vidsrc.to/embed/movie/${cleanTitle}`,
          quality: '1080p Multi-Audio',
          type: 'embed'
        }
      ]);
    } else if (typePreset === 'autoembed') {
      setMovieServers([
        ...movieServers,
        {
          id: `autoembed-${Date.now()}`,
          name: 'سيرفر AutoEmbed التلقائي (بدون إعلانات مزعجة)',
          url: `https://autoembed.co/movie/tmdb/`,
          quality: '1080p FHD',
          type: 'embed'
        }
      ]);
    }
  };

  const handleUpdateMovieServer = (idx: number, field: keyof ServerSource, val: string) => {
    const copy = [...movieServers];
    copy[idx] = { ...copy[idx], [field]: val };
    setMovieServers(copy);
  };

  const handleRemoveMovieServer = (idx: number) => {
    setMovieServers(movieServers.filter((_, i) => i !== idx));
  };

  // Add New Season
  const handleAddSeason = () => {
    const newSeasonNum = seasons.length + 1;
    const newSeasonTitle = newSeasonNum === 2 ? 'الموسم الثاني' : newSeasonNum === 3 ? 'الموسم الثالث' : `الموسم ${newSeasonNum}`;
    const newSeason: Season = {
      id: `season-${Date.now()}`,
      seasonNumber: newSeasonNum,
      title: newSeasonTitle,
      episodes: [
        {
          id: `ep-${Date.now()}-1`,
          episodeNumber: 1,
          title: `الحلقة 1`,
          duration: '45 دقيقة',
          servers: [
            {
              id: `s-${Date.now()}-1`,
              name: 'سيرفر 1 (سريع VIP)',
              url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              quality: '1080p',
              type: 'direct'
            }
          ]
        }
      ]
    };
    setSeasons([...seasons, newSeason]);
    setSelectedSeasonIdx(seasons.length);
  };

  // Delete Season
  const handleRemoveSeason = (idxToRemove: number) => {
    if (seasons.length <= 1) {
      alert('يجب أن يحتوي المسلسل على موسم واحد على الأقل.');
      return;
    }
    const updated = seasons.filter((_, i) => i !== idxToRemove);
    setSeasons(updated);
    setSelectedSeasonIdx(Math.max(0, idxToRemove - 1));
  };

  // Add Episode to current season with CUSTOM episode number
  const [customEpNumber, setCustomEpNumber] = useState<number | ''>('');

  const handleAddEpisodeToCurrentSeason = (specifiedNumber?: number) => {
    const copy = [...seasons];
    const targetSeason = copy[selectedSeasonIdx];
    if (!targetSeason) return;

    // Determine episode number: use user specified, or highest + 1, or length + 1
    let epNum: number;
    if (typeof specifiedNumber === 'number' && specifiedNumber > 0) {
      epNum = specifiedNumber;
    } else {
      const highestEp = targetSeason.episodes.reduce((max, ep) => Math.max(max, ep.episodeNumber || 0), 0);
      epNum = highestEp > 0 ? highestEp + 1 : targetSeason.episodes.length + 1;
    }

    const newEp: Episode = {
      id: `ep-${Date.now()}-${epNum}`,
      episodeNumber: epNum,
      title: `الحلقة ${epNum}`,
      servers: [
        {
          id: `s1-${Date.now()}`,
          name: 'سيرفر VIP',
          url: '',
          type: 'embed'
        }
      ]
    };

    targetSeason.episodes.push(newEp);
    // Keep episodes sorted cleanly by episode number
    targetSeason.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
    setSeasons(copy);
    setCustomEpNumber('');
  };

  // Update specific Episode Number directly without forced sequential renumbering
  const handleUpdateEpisodeNumber = (epIdx: number, newNumber: number) => {
    const copy = [...seasons];
    const targetSeason = copy[selectedSeasonIdx];
    if (!targetSeason || !targetSeason.episodes[epIdx]) return;

    targetSeason.episodes[epIdx].episodeNumber = newNumber;
    if (!targetSeason.episodes[epIdx].title || targetSeason.episodes[epIdx].title.startsWith('الحلقة')) {
      targetSeason.episodes[epIdx].title = `الحلقة ${newNumber}`;
    }
    // Sort cleanly
    targetSeason.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber);
    setSeasons(copy);
  };

  // Remove Episode from current season (preserves other episodes' custom numbers!)
  const handleRemoveEpisode = (epIdx: number) => {
    const copy = [...seasons];
    const targetSeason = copy[selectedSeasonIdx];
    if (!targetSeason) return;
    if (targetSeason.episodes.length <= 1) {
      alert('يجب أن يحتوي الموسم على حلقة واحدة على الأقل.');
      return;
    }
    targetSeason.episodes = targetSeason.episodes.filter((_, i) => i !== epIdx);
    setSeasons(copy);
  };

  // Add Server to Episode
  const handleAddEpisodeServer = (epIdx: number) => {
    const copy = [...seasons];
    const targetSeason = copy[selectedSeasonIdx];
    if (!targetSeason) return;
    const ep = targetSeason.episodes[epIdx];
    const sNum = ep.servers.length + 1;
    ep.servers.push({
      id: `srv-${Date.now()}-${sNum}`,
      name: sNum === 1 ? 'سيرفر VIP' : `سيرفر ${sNum - 1}`,
      url: '',
      type: 'embed'
    });
    setSeasons(copy);
  };

  // Remove Server from Episode
  const handleRemoveEpisodeServer = (epIdx: number, srvIdx: number) => {
    const copy = [...seasons];
    const targetSeason = copy[selectedSeasonIdx];
    if (!targetSeason) return;
    targetSeason.episodes[epIdx].servers = targetSeason.episodes[epIdx].servers.filter((_, i) => i !== srvIdx);
    setSeasons(copy);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('يرجى كتابة عنوان العمل.');
      return;
    }

    const genresList = genresInput
      .split(/[,،]/)
      .map(s => s.trim())
      .filter(Boolean);

    const keywordsList = keywordsInput
      .split(/[,،]/)
      .map(s => s.trim())
      .filter(Boolean);

    const saved: MediaItem = {
      id: initialItem?.id || `item-${Date.now()}`,
      title: title.trim(),
      originalTitle: originalTitle.trim() || undefined,
      type,
      categoryId,
      synopsis: synopsis.trim() || 'لا يوجد وصف متوفر.',
      posterUrl: normalizeImageUrl(posterUrl.trim()) || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600',
      backdropUrl: normalizeImageUrl(posterUrl.trim()) || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200',
      releaseYear: releaseYear ? Number(releaseYear) : new Date().getFullYear(),
      rating: rating !== '' && !isNaN(Number(rating)) ? Number(rating) : undefined,
      ageRating: ageRating.trim() || undefined,
      genres: genresList.length > 0 ? genresList : ['دراما'],
      keywords: keywordsList.length > 0 ? keywordsList : undefined,
      duration: duration.trim() || undefined,
      isFeatured,
      views: initialItem?.views || 0,
      isMiflixOriginal,
      downloadUrl: downloadUrl.trim() || undefined,
      servers: type === 'movie' ? movieServers : undefined,
      seasons: type === 'series' ? seasons : undefined,
      createdAt: initialItem?.createdAt || new Date().toISOString().slice(0, 10)
    };

    onSave(saved);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#0c1420] border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl my-auto max-h-[92vh] flex flex-col">
        {/* Modal Top Header with Tabs */}
        <div className="pb-4 border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
              {type === 'movie' ? <Film className="w-5 h-5" /> : <Tv className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {isEdit ? `تعديل: ${title || 'العمل'}` : 'إضافة عمل وسيرفرات جديدة'}
              </h2>
              <p className="text-xs text-slate-400">
                {type === 'movie' ? 'فيلم سينمائي مع سيرفرات متعددة' : 'مسلسل مع مواسم وحلقات وسيرفرات'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-[#141f2e] text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher Navigation */}
        <div className="flex items-center gap-2 pt-4 pb-3 border-b border-slate-800/80 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('info')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'info'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'bg-[#141f2e] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Edit3 className="w-4 h-4 text-cyan-400" />
            <span>1. تفاصيل العمل والبوسترات</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('seo')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'seo'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm ring-1 ring-cyan-400'
                : 'bg-[#141f2e] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Tag className="w-4 h-4 text-cyan-400" />
            <span>2. الكلمات المفتاحية والسيو (SEO)</span>
            {keywordsInput ? (
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            ) : null}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('stream_management')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
              activeTab === 'stream_management'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-sm'
                : 'bg-[#141f2e] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Server className="w-4 h-4 text-cyan-400" />
            <span>
              {type === 'movie' ? '3. سيرفرات الفيلم (Servers)' : '3. المواسم والحلقات والسيرفرات'}
            </span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-5 px-1 space-y-6">
          <form id="media-editor-form" onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'info' ? (
              /* TAB 1: General Details & Artwork (Zero Cast/Crew fields!) */
              <div className="space-y-5">
                {/* Type & Category Switchers */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-[#141f2e] border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      نوع العمل السينمائي *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setType('movie')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          type === 'movie'
                            ? 'bg-[#00A8E1] text-white border-transparent shadow-md'
                            : 'bg-[#0c1420] text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        <span>فيلم سينمائي</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setType('series')}
                        className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                          type === 'series'
                            ? 'bg-[#00A8E1] text-white border-transparent shadow-md'
                            : 'bg-[#0c1420] text-slate-400 border-slate-700 hover:text-white'
                        }`}
                      >
                        <Tv className="w-4 h-4" />
                        <span>مسلسل / أنمي</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-200 mb-1.5">
                      القسم الرئيسي (Category) *
                    </label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value as CategoryId)}
                      className="w-full bg-[#0c1420] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                    >
                      {CATEGORIES_ORDERED.map(cat => (
                        <option key={cat.id} value={cat.id}>
                          {cat.titleAr} ({cat.descriptionAr})
                        </option>
                      ))}
                      <option value="miflix_originals">أعمال MIFLIX الحصرية</option>
                    </select>
                  </div>
                </div>

                {/* Title Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      عنوان العمل (بالعربية) *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="مثال: قيامة عثمان"
                      className="w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      العنوان الأصلي / الإنجليزي
                    </label>
                    <input
                      type="text"
                      value={originalTitle}
                      onChange={(e) => setOriginalTitle(e.target.value)}
                      placeholder="مثال: Kurulus Osman"
                      dir="ltr"
                      className="w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white font-mono text-left outline-none"
                    />
                  </div>
                </div>

                {/* Metadata Row: Year, Rating, Age, Views, Duration */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">سنة الإنتاج</label>
                    <input
                      type="number"
                      value={releaseYear}
                      onChange={(e) => setReleaseYear(Number(e.target.value))}
                      className="w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      التقييم <span className="text-[10px] text-slate-400 font-normal">(اختياري)</span>
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="1"
                      max="10"
                      value={rating}
                      onChange={(e) => setRating(e.target.value ? Number(e.target.value) : '')}
                      placeholder="بدون تقييم"
                      className="w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      التصنيف العمري <span className="text-[10px] text-slate-400 font-normal">(اختياري)</span>
                    </label>
                    <select
                      value={ageRating}
                      onChange={(e) => setAgeRating(e.target.value)}
                      className="w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-2.5 py-2 text-xs text-white outline-none"
                    >
                      <option value="">بدون تحديد (إخفاء)</option>
                      <option value="للجميع">للجميع (G)</option>
                      <option value="+13">+13</option>
                      <option value="+16">+16</option>
                      <option value="+18">+18</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1">المشاهدات الفعلية</label>
                    <div className="w-full bg-[#0c1420] border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono flex items-center gap-1.5 select-none" title="تُحسب تلقائياً وبشكل حصري من تشغيل الفيديو الفعلي">
                      <Eye className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{(initialItem?.views || 0).toLocaleString('ar-EG')} مشاهدة</span>
                    </div>
                  </div>

                  <div className="col-span-2 sm:col-span-1">
                    <label className="block text-xs font-bold text-slate-300 mb-1">
                      المدة <span className="text-[10px] text-slate-400 font-normal">(اختياري)</span>
                    </label>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      placeholder="مثال: ساعتان (اتركه فارغاً للإخفاء)"
                      className="w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white outline-none"
                    />
                  </div>
                </div>

                {/* Genres */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    التصنيفات والأنواع (مفصولة بفواصل)
                  </label>
                  <input
                    type="text"
                    value={genresInput}
                    onChange={(e) => setGenresInput(e.target.value)}
                    placeholder="مثال: أكشن، إثارة، تاريخي"
                    className="w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
                  />
                </div>

                {/* SEO Keywords Quick Box in Tab 1 */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-[#0f1d2e] to-[#0c1624] border border-cyan-700/50 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                      <Tag className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>الكلمات المفتاحية وسيو جوجل (SEO)</span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
                          {keywordsInput ? `${keywordsInput.split(/[,،]/).filter(Boolean).length} كلمة مضافة` : 'جاهز للتوليد'}
                        </span>
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        يمكنك إضافة الكلمات يدوياً أو توليدها بنقرة زر في تبويب السيو
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab('seo')}
                    className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-md active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                    <span>الانتقال لتبويب السيو والكلمات (2) ←</span>
                  </button>
                </div>

                {/* Poster URL with Live Preview and Smart Format Assistant (No confusing backdrop field) */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-300">
                    رابط البوستر (Poster URL) *
                  </label>
                  <input
                    type="text"
                    value={posterUrl}
                    onChange={(e) => setPosterUrl(e.target.value)}
                    placeholder="https://..."
                    dir="ltr"
                    className="w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono outline-none"
                  />
                  {isHtmlViewerImageUrl(posterUrl).isViewer && (
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>تنبيه رابط صفحة ImgBB وليس رابط مباشر للصورة!</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed">
                        الرابط الذي نسخته هو صفحة ويب (<code className="text-amber-200">ibb.co/...</code>). للحصول على الرابط المباشر: افتح الصورة في تبويب جديد أو اضغط كليك يمين / لمسة مطولة عليها واختر <strong className="text-white">"نسخ عنوان الصورة" (Copy Image Address)</strong> بحيث يبدأ بـ <code className="text-cyan-300">https://i.ibb.co/...</code>
                      </p>
                    </div>
                  )}
                  {posterUrl && !isHtmlViewerImageUrl(posterUrl).isViewer && (
                    <div className="flex items-center gap-2 pt-1">
                      <img 
                        src={normalizeImageUrl(posterUrl)} 
                        alt="معاينة البوستر" 
                        className="w-12 h-16 object-cover rounded-lg border border-slate-700 shadow-sm"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> تم التعرف على رابط البوستر بنجاح
                      </span>
                    </div>
                  )}
                </div>

                {/* Synopsis */}
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    ملخص القصة (Synopsis) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={synopsis}
                    onChange={(e) => setSynopsis(e.target.value)}
                    placeholder="اكتب ملخصاً تشويقياً للعمل..."
                    className="w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-xl p-3 text-xs text-white leading-relaxed outline-none"
                  />
                </div>

                {/* Featured & Originals Toggles */}
                <div className="flex flex-wrap items-center gap-6 p-4 rounded-xl bg-[#141f2e] border border-slate-800">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isMiflixOriginal}
                      onChange={(e) => setIsMiflixOriginal(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-600 focus:ring-0 w-4 h-4"
                    />
                    <span>عمل حصري من إنتاجات MIFLIX</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isFeatured}
                      onChange={(e) => setIsFeatured(e.target.checked)}
                      className="rounded border-slate-700 text-cyan-600 focus:ring-0 w-4 h-4"
                    />
                    <span>تثبيت في البانر البارز الرئيسي (Hero Banner)</span>
                  </label>
                </div>
              </div>
            ) : activeTab === 'seo' ? (
              /* TAB 2: Dedicated SEO & Google Search Keywords Engine */
              <div className="space-y-6">
                {/* Header Callout */}
                <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-cyan-950/70 via-[#0d2137] to-blue-950/50 border border-cyan-700/70 shadow-lg space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                        <Tag className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <span>الكلمات المفتاحية ووسوم السيو (SEO Engine)</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-900/80 text-cyan-300 font-mono">
                            Google Ready
                          </span>
                        </h4>
                        <p className="text-xs text-slate-300 mt-0.5">
                          هذه الكلمات تُحقن في شفرة الموقع لمحركات بحث جوجل لتصدر نتائج البحث عند تنزيل العمل
                        </p>
                      </div>
                    </div>

                    {/* Auto-generate Button */}
                    <button
                      type="button"
                      onClick={handleAutoGenerateKeywords}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-lg shadow-cyan-950/60 transition-all active:scale-95"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                      <span>توليد كلمات مفتاحية تلقائية لجوجل ⚡</span>
                    </button>
                  </div>
                </div>

                {/* Keywords Textarea & Chips */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#141f2e] border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-200">
                      قائمة الكلمات والوسوم (مفصولة بفواصل ، أو ,)
                    </label>
                    <span className="text-xs text-cyan-400 font-medium">
                      {keywordsInput ? `${keywordsInput.split(/[,،]/).map(s => s.trim()).filter(Boolean).length} كلمة مفتاحية` : '0 كلمات'}
                    </span>
                  </div>

                  <textarea
                    rows={4}
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    placeholder="مثال: مشاهدة فيلم كذا كامل، تحميل فيلم كذا مترجم 1080p، ايجي بست كذا، ماي سيما كذا، فشار، افلام 2026..."
                    className="w-full bg-[#0c1420] border border-slate-700 focus:border-cyan-400 rounded-xl p-3.5 text-xs sm:text-sm text-white outline-none leading-relaxed placeholder:text-slate-500"
                  />

                  {/* Popular Quick Suggestions Chips */}
                  <div className="space-y-2 pt-1">
                    <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                      <span>إضافة وسوم شائعة فورية (اضغط للإضافة السريعة):</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        'مشاهدة وتحميل',
                        'كامل ومترجم',
                        'بجودة 1080p FHD',
                        'ايجي بست',
                        'ماي سيما',
                        'فشار',
                        'قصة عشق',
                        'بدون إعلانات مزعجة',
                        'مدبلج للعربية',
                        'حصريا سينما 2026'
                      ].map((chip) => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => handleAddKeywordChip(chip)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#0c1420] hover:bg-cyan-950 border border-slate-700 hover:border-cyan-500 text-slate-300 hover:text-cyan-300 text-xs font-medium transition-colors"
                        >
                          + {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Google Search Live Preview */}
                <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1420] border border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>معاينة مظهر العمل في نتائج بحث جوجل (Google Search Preview):</span>
                  </div>

                  <div className="p-4 rounded-xl bg-[#1f1f1f] border border-[#333] space-y-1.5 font-sans" dir="rtl">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-4 h-4 rounded-full bg-cyan-600 flex items-center justify-center text-[9px] text-white font-bold">M</span>
                      <span className="text-[11px] text-slate-300">MIFLIX Cinema</span>
                      <span className="text-[11px] text-slate-500">https://maiflix.mmmi10na1010.workers.dev</span>
                    </div>
                    <h5 className="text-base text-[#8ab4f8] hover:underline cursor-pointer font-medium leading-snug">
                      {title.trim() ? (
                        type === 'series' ? (() => {
                          const maxEp = seasons.reduce((acc, s) => {
                            const epMax = s.episodes.reduce((m, e) => Math.max(m, e.episodeNumber || 0), 0);
                            return Math.max(acc, epMax);
                          }, 0);
                          const epPart = maxEp > 0 ? ` الحلقة ${maxEp}` : '';
                          return `مشاهدة وتحميل مسلسل ${title.trim()}${epPart} مترجم كامل HD 1080p - MIFLIX`;
                        })() : `مشاهدة وتحميل فيلم ${title.trim()} مترجم HD 1080p - MIFLIX`
                      ) : 'مشاهدة وتحميل أحدث الأفلام والمسلسلات بجودة عالية - MIFLIX'}
                    </h5>
                    <p className="text-xs text-[#bdc1c6] leading-relaxed line-clamp-2">
                      {synopsis.trim() ? synopsis.trim() : `شاهد الآن بجودة عالية وبدون تقطيع أحدث الأفلام والمسلسلات مع سيرفرات متعددة وسريعة على منصة MIFLIX العربية.`}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* TAB 3: Clean, Organized Servers, Seasons & Episodes Manager */
              <div className="space-y-6">
                {type === 'movie' ? (
                  /* Movie Servers List */
                  <div className="space-y-4">
                    {/* Free External Servers Presets & DMCA Protection Banner */}
                    <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#0a1c1d] to-[#0f1f2e] border border-emerald-500/50 space-y-3 shadow-lg">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs sm:text-sm">
                          <Shield className="w-4 h-4 text-emerald-400" />
                          <span>سيرفرات خارجية مجانية 100% (ضد حقوق النشر ومتوافقة مع إعلانات أديستيرا):</span>
                        </div>
                        <span className="text-[11px] bg-emerald-950 px-2 py-0.5 rounded text-emerald-400 border border-emerald-800">
                          حماية DMCA + 0 تكلفة
                        </span>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        اختر أحد السيرفرات الخارجية الجاهزة بضغطة زر لحماية موقعك من الإغلاق وتشغيل الأفلام بجودة FHD دون استهلاك باقتك أو دفع أي مليم، مع تشغيل إعلانات أديستيرا بشكل كامل:
                      </p>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => handleAddFreePresetServer('telegram')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-900/80 hover:bg-sky-800 border border-sky-600/70 text-sky-200 text-xs font-bold transition-all shadow active:scale-95"
                          title="رفع الفيلم على تليجرام واستخراج رابط مباشر مجاني"
                        >
                          <Send className="w-3.5 h-3.5 text-sky-400" />
                          <span>+ سيرفر تليجرام المباشر (مجاني وغير محدود)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddFreePresetServer('vidsrc')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-900/80 hover:bg-purple-800 border border-purple-600/70 text-purple-200 text-xs font-bold transition-all shadow active:scale-95"
                          title="بث تلقائي للأفلام العالمية من سيرفرات VidSrc مجاناً"
                        >
                          <Zap className="w-3.5 h-3.5 text-amber-300" />
                          <span>+ سيرفر البث الجاهز VidSrc (مجاني ومترجم)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleAddFreePresetServer('autoembed')}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 border border-emerald-600/70 text-emerald-200 text-xs font-bold transition-all shadow active:scale-95"
                          title="تضمين سريع للأفلام"
                        >
                          <Play className="w-3.5 h-3.5 text-emerald-400" />
                          <span>+ سيرفر AutoEmbed التلقائي</span>
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-400 bg-black/40 p-2.5 rounded-xl border border-slate-800/80 leading-normal">
                        💡 <strong className="text-slate-200">طريقة تليجرام المجانية:</strong> ارفع الفيلم على قناة تليجرام خاصة، واستخدم بوت مجاني مثل <code className="text-cyan-300 font-mono">@FileToLinkBot</code> ليحول ملف الفيلم فوراً لرابط مباشر تضعه هنا مجاناً مدى الحياة!
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#141f2e] border border-slate-800">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Server className="w-4 h-4 text-cyan-400" />
                          <span>سيرفرات الفيلم المضافة ({movieServers.length} سيرفر متوفر)</span>
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          يمكنك إضافة روابط Embed أو روابط بث فيديو مباشرة مع أزرار تبديل فورية
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddMovieServer}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition-all active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                        <span>إضافة سيرفر يدوي جديد</span>
                      </button>
                    </div>

                    <div className="space-y-3">
                      {movieServers.map((server, sIdx) => {
                        const isVip = sIdx === 0;
                        const label = isVip ? 'سيرفر VIP الذهبي' : `سيرفر رقم ${sIdx}`;

                        return (
                          <div
                            key={server.id || sIdx}
                            className={`p-3.5 rounded-2xl border transition-all ${
                              isVip 
                                ? 'bg-amber-950/20 border-amber-500/40' 
                                : 'bg-[#141f2e] border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className={`text-xs font-black flex items-center gap-1.5 ${
                                isVip ? 'text-amber-400' : 'text-cyan-300'
                              }`}>
                                <span className={`w-2 h-2 rounded-full ${isVip ? 'bg-amber-400' : 'bg-cyan-400'}`} />
                                <span>{label}</span>
                              </span>

                              {movieServers.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMovieServer(sIdx)}
                                  className="p-1 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/50 transition-colors"
                                  title="حذف السيرفر"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            <div>
                              <input
                                type="text"
                                value={server.url}
                                onChange={(e) => handleUpdateMovieServer(sIdx, 'url', e.target.value)}
                                placeholder="ضع رابط سيرفر المشاهدة هنا (vidspeed, anafast, dood, mp4, iframe...)"
                                dir="ltr"
                                className="w-full bg-[#0c1420] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Optional Movie Direct Download Link */}
                    <div className="mt-4 p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                      <label className="block text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                        <Download className="w-4 h-4 text-emerald-400" />
                        <span>رابط تحميل الفيلم المباشر (اختياري - لن يظهر للجمهور إلا إذا قمت بوضعه هنا)</span>
                      </label>
                      <input
                        type="text"
                        value={downloadUrl}
                        onChange={(e) => setDownloadUrl(e.target.value)}
                        placeholder="https://... (اتركه فارغاً إذا كنت لا تريد إظهار زر تحميل للجمهور)"
                        dir="ltr"
                        className="w-full bg-[#0c1420] border border-emerald-700/50 focus:border-emerald-400 rounded-xl px-3 py-2 text-xs text-white font-mono outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  /* TV Series: Organized Seasons & Episodes Manager */
                  <div className="space-y-5">
                    {/* Season Selector Tabs */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-800">
                      {seasons.map((season, sIdx) => {
                        const isSelected = selectedSeasonIdx === sIdx;
                        return (
                          <div key={season.id} className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => setSelectedSeasonIdx(sIdx)}
                              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                                isSelected
                                  ? 'bg-[#00A8E1] text-white shadow-md'
                                  : 'bg-[#141f2e] text-slate-400 hover:text-white border border-slate-800'
                              }`}
                            >
                              <Tv className="w-3.5 h-3.5" />
                              <span>{season.title}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30">
                                {season.episodes.length} حلقة
                              </span>
                            </button>

                            {seasons.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveSeason(sIdx)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40"
                                title="حذف هذا الموسم"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        );
                      })}

                      <button
                        type="button"
                        onClick={handleAddSeason}
                        className="flex items-center gap-1 px-3 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-800 text-cyan-300 text-xs font-bold transition-colors shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ إضافة موسم جديد</span>
                      </button>
                    </div>

                    {/* Active Season Episodes and Multi-Servers */}
                    {seasons[selectedSeasonIdx] && (
                      <div className="space-y-4">
                        {/* Enhanced Episodes Control Bar with Custom Episode Number Picker */}
                        <div className="bg-[#141f2e] p-4 rounded-2xl border border-slate-800 space-y-3">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div>
                              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                                <span>حلقات {seasons[selectedSeasonIdx].title}</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono">
                                  {seasons[selectedSeasonIdx].episodes.length} حلقة
                                </span>
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                يمكنك إضافة أي رقم حلقة تريده مباشرة (مثلاً الحلقة 18 مباشرة) دون الحاجة لإضافة الحلقات السابقة!
                              </p>
                            </div>

                            {/* Direct Action: Add Next or Add Specific Episode */}
                            <div className="flex items-center gap-2 w-full sm:w-auto">
                              <button
                                type="button"
                                onClick={() => handleAddEpisodeToCurrentSeason()}
                                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#00A8E1] hover:bg-[#00B4F5] text-white text-xs font-bold transition-all shadow-md active:scale-95"
                              >
                                <Plus className="w-4 h-4" />
                                <span>+ إضافة الحلقة التالية</span>
                              </button>
                            </div>
                          </div>

                          {/* Quick Custom Episode Number Bar */}
                          <div className="pt-2 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs">
                            <span className="text-slate-400 font-semibold">أو اختر إضافة حلقة برقم محدد فوراً:</span>
                            <div className="flex items-center gap-1.5">
                              <input
                                type="number"
                                min={1}
                                max={999}
                                value={customEpNumber}
                                onChange={(e) => setCustomEpNumber(e.target.value ? Number(e.target.value) : '')}
                                placeholder="رقم الحلقة (مثلاً: 18)"
                                className="w-28 sm:w-32 bg-[#0c1420] border border-cyan-700/80 focus:border-cyan-400 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  if (typeof customEpNumber === 'number' && customEpNumber > 0) {
                                    handleAddEpisodeToCurrentSeason(customEpNumber);
                                  } else {
                                    alert('يرجى كتابة رقم الحلقة المراد إضافتها أولاً.');
                                  }
                                }}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all flex items-center gap-1 shadow-sm active:scale-95"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>إضافة الحلقة {customEpNumber ? `#${customEpNumber}` : ''}</span>
                              </button>
                            </div>

                            {/* Popular Quick Jumps */}
                            <div className="flex items-center gap-1 mr-auto text-[11px] text-slate-400">
                              <span>سريع:</span>
                              {[10, 15, 18, 20, 25, 30].map(num => (
                                <button
                                  key={num}
                                  type="button"
                                  onClick={() => handleAddEpisodeToCurrentSeason(num)}
                                  className="px-2 py-0.5 rounded bg-[#0c1420] hover:bg-cyan-900/60 border border-slate-700 hover:border-cyan-500 text-slate-300 font-mono transition-colors"
                                >
                                  +{num}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* List of Episodes */}
                        <div className="space-y-3.5">
                          {seasons[selectedSeasonIdx].episodes.map((ep, epIdx) => (
                            <div
                              key={ep.id}
                              className="p-4 rounded-2xl bg-[#141f2e] border border-slate-800/90 space-y-3 transition-all hover:border-slate-700"
                            >
                              {/* Episode Header Line */}
                              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                                <div className="flex items-center gap-2.5 flex-1">
                                  {/* Editable Episode Number */}
                                  <div className="flex items-center gap-1 bg-cyan-950/80 border border-cyan-800 rounded-xl px-2 py-1 text-cyan-300 shrink-0" title="اضغط لتغيير رقم الحلقة بحرية">
                                    <span className="text-[10px] text-cyan-400 font-bold">حلقة:</span>
                                    <input
                                      type="number"
                                      min={1}
                                      value={ep.episodeNumber}
                                      onChange={(e) => handleUpdateEpisodeNumber(epIdx, Number(e.target.value) || 1)}
                                      className="w-12 bg-transparent text-xs font-black font-mono text-cyan-300 text-center outline-none focus:bg-cyan-900 rounded"
                                    />
                                  </div>

                                  <input
                                    type="text"
                                    value={ep.title}
                                    onChange={(e) => {
                                      const copy = [...seasons];
                                      copy[selectedSeasonIdx].episodes[epIdx].title = e.target.value;
                                      setSeasons(copy);
                                    }}
                                    placeholder="عنوان الحلقة (مثلاً: الحلقة 18)"
                                    className="bg-[#0c1420] border border-slate-700 focus:border-cyan-400 rounded-xl px-3 py-1.5 text-xs text-white flex-1 min-w-[140px]"
                                  />
                                </div>

                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleAddEpisodeServer(epIdx)}
                                    className="flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-cyan-600/30 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-600 hover:text-white transition-all shadow-sm"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                    <span>+ سيرفر للحلقة</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => handleRemoveEpisode(epIdx)}
                                    className="p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/60 transition-colors"
                                    title="حذف هذه الحلقة"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Episode Description Field (للمساعدة في الظهور وبحث جوجل والموقع) */}
                              <div className="space-y-1">
                                <label className="block text-[11px] font-semibold text-slate-400">
                                  وصف مختصر لأحداث الحلقة (يساعد بقوة في تصدر بحث جوجل وظهور الحلقة للزوار):
                                </label>
                                <textarea
                                  rows={2}
                                  value={ep.description || ''}
                                  onChange={(e) => {
                                    const copy = [...seasons];
                                    copy[selectedSeasonIdx].episodes[epIdx].description = e.target.value;
                                    setSeasons(copy);
                                  }}
                                  placeholder="اكتب نبذة أو ملخص تشويقي لأحداث هذه الحلقة للظهور في محركات البحث..."
                                  className="w-full bg-[#0c1420] border border-slate-700/80 focus:border-cyan-400 rounded-xl p-2.5 text-xs text-white outline-none leading-relaxed"
                                />
                              </div>

                              {/* Episode Servers List */}
                              <div className="space-y-2 pr-2 border-r-2 border-cyan-700/60">
                                {/* Optional Episode Direct Download Link */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-[#0c1420] p-2.5 rounded-xl border border-emerald-900/60">
                                  <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950 px-2 py-0.5 rounded flex items-center gap-1 shrink-0">
                                    <Download className="w-3 h-3" />
                                    <span>رابط تحميل الحلقة (اختياري):</span>
                                  </span>
                                  <input
                                    type="text"
                                    value={ep.downloadUrl || ''}
                                    onChange={(e) => {
                                      const copy = [...seasons];
                                      copy[selectedSeasonIdx].episodes[epIdx].downloadUrl = e.target.value;
                                      setSeasons(copy);
                                    }}
                                    placeholder="https://... (اتركه فارغاً إذا كنت لا تريد إظهار زر تحميل لهذه الحلقة)"
                                    dir="ltr"
                                    className="flex-1 w-full bg-[#141f2e] border border-slate-700 focus:border-emerald-400 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                                  />
                                </div>

                                {ep.servers.map((srv, srvIdx) => {
                                  const isVip = srvIdx === 0;
                                  const label = isVip ? 'سيرفر VIP الذهبي' : `سيرفر رقم ${srvIdx}`;

                                  return (
                                    <div 
                                      key={srv.id || srvIdx} 
                                      className={`flex flex-col sm:flex-row items-center gap-2 p-2.5 rounded-xl border ${
                                        isVip ? 'bg-amber-950/20 border-amber-500/40' : 'bg-[#0c1420] border-slate-800'
                                      }`}
                                    >
                                      <span className={`text-[10px] font-black px-2 py-1 rounded-lg shrink-0 ${
                                        isVip ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50' : 'bg-cyan-950/70 text-cyan-400 border border-cyan-800/80'
                                      }`}>
                                        {label}
                                      </span>

                                      <input
                                        type="text"
                                        value={srv.url}
                                        onChange={(e) => {
                                          const copy = [...seasons];
                                          copy[selectedSeasonIdx].episodes[epIdx].servers[srvIdx].url = e.target.value;
                                          setSeasons(copy);
                                        }}
                                        placeholder="رابط البث أو كود التضمين (vidspeed, anafast, dood, mp4, iframe...)"
                                        dir="ltr"
                                        className="flex-1 w-full bg-[#141f2e] border border-slate-700 focus:border-cyan-400 rounded-lg px-2.5 py-1 text-xs text-white font-mono outline-none"
                                      />

                                      {ep.servers.length > 1 && (
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveEpisodeServer(epIdx, srvIdx)}
                                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors self-end sm:self-center"
                                          title="حذف هذا السيرفر"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-[#141f2e] hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs sm:text-sm font-semibold transition-colors"
          >
            إلغاء
          </button>

          <button
            type="submit"
            form="media-editor-form"
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#00A8E1] to-[#0284C7] hover:from-[#00B4F5] hover:to-[#0396E5] text-white text-xs sm:text-sm font-bold shadow-lg shadow-cyan-900/30 transition-all flex items-center gap-2 active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{isEdit ? 'حفظ التعديلات' : 'إضافة العمل والسيرفرات'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
