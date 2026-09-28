import React from 'react';
import { Tv, Film, Clapperboard, Sparkles, Flame } from 'lucide-react';
import { CategoryId, CATEGORIES_ORDERED } from '../types';

interface BrandHubProps {
  onSelectCategory: (id: CategoryId) => void;
}

export const BrandHub: React.FC<BrandHubProps> = ({ onSelectCategory }) => {
  const getIcon = (id: CategoryId) => {
    switch (id) {
      case 'turkish_drama':
        return <Tv className="w-5 h-5 text-[#00A8E1] group-hover:scale-110 transition-transform" />;
      case 'arabic_cinema':
        return <Film className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />;
      case 'hollywood':
        return <Clapperboard className="w-5 h-5 text-sky-400 group-hover:scale-110 transition-transform" />;
      case 'anime':
        return <Sparkles className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />;
      case 'miflix_originals':
        return <Flame className="w-5 h-5 text-[#00A8E1] group-hover:scale-110 transition-transform" />;
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 md:px-8 py-5">
      {/* Amazon Prime Hub Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {CATEGORIES_ORDERED.map((cat) => (
          <div
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className="group relative cursor-pointer rounded-xl p-3.5 bg-gradient-to-b from-[#131e2d] to-[#0c1420] border border-[#1b2b3f] hover:border-[#00A8E1]/60 shadow-md hover:shadow-[0_0_20px_rgba(0,168,225,0.25)] transition-all duration-300 hover:-translate-y-1 flex items-center gap-3 h-20"
          >
            {/* Ambient Backlight */}
            <div className="p-2.5 rounded-xl bg-[#0a121c] border border-slate-800/80 group-hover:border-[#00A8E1]/40 shrink-0">
              {getIcon(cat.id)}
            </div>

            <div className="flex flex-col min-w-0">
              <span className="text-sm font-bold text-white group-hover:text-[#00A8E1] transition-colors truncate">
                {cat.titleAr}
              </span>
              <span className="text-[11px] text-slate-400 truncate">
                {cat.descriptionAr}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
