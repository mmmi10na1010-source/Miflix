import React, { useState } from 'react';
import { Search, Shield, LogOut, Menu, X } from 'lucide-react';
import { MiflixLogo } from './MiflixLogo';

interface NavbarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isAdmin: boolean;
  onOpenAdminLogin: () => void;
  onOpenAdminDashboard: () => void;
  onAdminLogout: () => void;
  myListCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  isAdmin,
  onOpenAdminLogin,
  onOpenAdminDashboard,
  onAdminLogout,
  myListCount
}) => {
  const [showSearchInput, setShowSearchInput] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Categories and core navigation (Arabic, Turkish, Foreign, Anime)
  const navLinks = [
    { id: 'home', label: 'الرئيسية' },
    { id: 'turkish', label: 'تركي' },
    { id: 'arabic', label: 'عربي' },
    { id: 'foreign', label: 'أجنبي' },
    { id: 'anime', label: 'أنمي' },
    { id: 'movies', label: 'أفلام' },
    { id: 'series', label: 'مسلسلات' },
    { id: 'mylist', label: `قائمتي${myListCount > 0 ? ` (${myListCount})` : ''}` }
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#0b1118]/95 backdrop-blur-md border-b border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark (No big M, logo is site name with Prime accent) */}
        <div className="flex items-center gap-6 shrink-0">
          <MiflixLogo size="md" onClick={() => onSelectTab('home')} />
        </div>

        {/* Clean text navigation links in Prime style */}
        <nav className="hidden lg:flex items-center gap-5 text-sm font-semibold">
          {navLinks.map((link) => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`transition-colors whitespace-nowrap py-1 relative ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute -bottom-1 inset-x-0 h-0.5 bg-[#00a8e1] rounded-full shadow-[0_0_8px_#00a8e1]" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Search + Admin Access */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Live Search Input */}
          <div className="relative flex items-center">
            {showSearchInput ? (
              <div className="flex items-center bg-[#141f2e] border border-cyan-700/60 rounded-lg px-3 py-1.5 w-44 sm:w-60 transition-all">
                <Search className="w-4 h-4 text-cyan-400 ml-2 shrink-0" />
                <input
                  type="text"
                  placeholder="ابحث باسم العمل أو رقم الحلقة (مثال: حلقة 18)..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  autoFocus
                  className="bg-transparent text-xs text-white placeholder-slate-400 focus:outline-none w-full"
                />
                <button
                  onClick={() => {
                    setShowSearchInput(false);
                    onSearchChange('');
                  }}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className="p-2 text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-lg transition-colors"
                title="بحث"
              >
                <Search className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Admin Access Controls */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <button
                onClick={onOpenAdminDashboard}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/25 border border-cyan-400/40 transition-all hover:scale-105 whitespace-nowrap active:scale-95"
                title="لوحة التحكم الإدارية"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                <Shield className="w-3.5 h-3.5 text-cyan-200" />
                <span>لوحة تحكم MIFLIX</span>
              </button>
              <button
                onClick={onAdminLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/60 transition-colors"
                title="تسجيل الخروج من الإدارة"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAdminLogin}
              className="group flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-cyan-500/15 hover:from-cyan-500/25 hover:to-blue-600/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white text-xs font-bold transition-all hover:shadow-[0_0_15px_rgba(6,182,212,0.35)] hover:scale-105 active:scale-95 whitespace-nowrap"
              title="دخول المشرف (miflix)"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400 group-hover:text-cyan-300 transition-colors" />
              <span>لوحة التحكم الإدارية ⚡</span>
            </button>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0c1420] border-b border-slate-800 px-4 py-3 space-y-1.5">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => {
                onSelectTab(link.id);
                setMobileMenuOpen(false);
              }}
              className={`block w-full text-right px-3 py-2 rounded-lg text-sm font-medium ${
                activeTab === link.id
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/40'
                  : 'text-slate-300 hover:bg-[#141f2e]'
              }`}
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
