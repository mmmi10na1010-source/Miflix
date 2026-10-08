import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Film, Tv, Sparkles, Clapperboard } from 'lucide-react';
import { MediaItem, CategoryInfo } from '../types';
import { MediaCard } from './MediaCard';

interface CategoryRowProps {
  category: CategoryInfo;
  items: MediaItem[];
  onPlay: (item: MediaItem) => void;
  onOpenDetails: (item: MediaItem) => void;
  isSavedInList: (id: string) => boolean;
  onToggleList: (id: string) => void;
}

export const CategoryRow: React.FC<CategoryRowProps> = ({
  category,
  items,
  onPlay,
  onOpenDetails,
  isSavedInList,
  onToggleList
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const offset = direction === 'left' ? -420 : 420;
      scrollContainerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  const getCategoryIcon = () => {
    switch (category.id) {
      case 'turkish_drama':
        return <Tv className="w-4 h-4 text-cyan-400" />;
      case 'arabic_cinema':
        return <Film className="w-4 h-4 text-blue-400" />;
      case 'hollywood':
        return <Clapperboard className="w-4 h-4 text-indigo-400" />;
      case 'anime':
        return <Sparkles className="w-4 h-4 text-cyan-300" />;
      default:
        return <Film className="w-4 h-4 text-cyan-400" />;
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="relative my-7 group">
      {/* Category Section Header */}
      <div className="flex items-end justify-between px-4 md:px-8 mb-3.5">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              {getCategoryIcon()}
              <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                {category.titleAr}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {category.descriptionAr}
            </p>
          </div>
        </div>

        {/* Action / Arrow buttons */}
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

      {/* Horizontal Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex items-stretch gap-4 overflow-x-auto px-4 md:px-8 no-scrollbar scroll-smooth pb-2"
      >
        {items.map((item) => (
          <div key={item.id} className="w-40 sm:w-48 md:w-52 shrink-0">
            <MediaCard
              item={item}
              onPlay={onPlay}
              onOpenDetails={onOpenDetails}
              isSavedInList={isSavedInList(item.id)}
              onToggleList={onToggleList}
            />
          </div>
        ))}
      </div>
    </section>
  );
};
