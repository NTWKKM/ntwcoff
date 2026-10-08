import React from 'react';
import { TagInfo } from '../types';
import { X } from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  tags: TagInfo[];
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  filteredCount: number;
  totalCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  tags,
  selectedTag,
  setSelectedTag,
  filteredCount,
  totalCount,
}) => {
  const hasFilter = selectedCategory !== null || selectedTag !== null;

  return (
    <section id="taxonomy" className="w-full pt-8 pb-6 space-y-5">
      
      {/* Category Tab Pills — ElevenLabs Product Switcher Pattern */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              selectedCategory === null
                ? 'bg-gradient-to-r from-violet-spark to-ember-orange text-white border-transparent shadow-sm shadow-violet-spark/20'
                : 'bg-eggshell hover:bg-warm-taupe text-graphite border-[#e5e5e5] hover:border-violet-spark/30'
            }`}
          >
            ทั้งหมด ({totalCount})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  isSelected
                    ? 'bg-gradient-to-r from-violet-spark to-ember-orange text-white border-transparent shadow-sm shadow-violet-spark/20'
                    : 'bg-eggshell hover:bg-warm-taupe text-graphite border-[#e5e5e5] hover:border-violet-spark/30'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter Summary */}
        <div className="text-xs text-smoke font-mono shrink-0">
          แสดงผล {filteredCount} จาก {totalCount} งานวิจัย
        </div>
      </div>

      {/* Scientific Auto-Tag Cloud — Fully-Pilled 9999px with Spark Highlights */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-sans text-ash mr-1.5">
          คีย์เวิร์ด:
        </span>

        {tags.map((tag) => {
          const isSelected = selectedTag === tag.name;
          return (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(isSelected ? null : tag.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all border ${
                isSelected
                  ? 'bg-gradient-to-r from-violet-spark to-ember-orange text-white border-transparent font-medium shadow-sm'
                  : 'bg-warm-taupe hover:bg-eggshell hover:border-violet-spark/40 text-smoke border-stone'
              }`}
            >
              <span>#{tag.name}</span>
              <span
                className={`text-[10px] px-1 rounded-full font-mono ${
                  isSelected ? 'bg-black/30 text-white' : 'bg-stone text-smoke'
                }`}
              >
                {tag.count}
              </span>
            </button>
          );
        })}

        {/* Clear Filter Outline Pill Button */}
        {hasFilter && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedTag(null);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-eggshell hover:bg-warm-taupe text-ink hover:text-ember-orange border border-[#e5e5e5] hover:border-ember-orange/40 transition-colors ml-1"
          >
            <X className="w-3 h-3 text-smoke" />
            <span>ล้างตัวกรอง</span>
          </button>
        )}
      </div>

    </section>
  );
};

