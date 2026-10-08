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
      
      {/* Category Navigation Pills — Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-hairline-silver/60">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 sm:pb-3 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-normal tracking-[-0.12px] whitespace-nowrap transition-colors ${
              selectedCategory === null
                ? 'bg-ink text-white'
                : 'bg-gallery-white text-slate hover:text-ink hover:bg-studio-mist border border-hairline-silver'
            }`}
          >
            All Papers ({totalCount})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`px-3.5 py-1.5 rounded-full text-[12px] font-normal tracking-[-0.12px] whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'bg-ink text-white'
                    : 'bg-gallery-white text-slate hover:text-ink hover:bg-studio-mist border border-hairline-silver'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Filter Summary Counter */}
        <div className="text-[12px] text-slate font-sf-text shrink-0 pb-1">
          Showing {filteredCount} of {totalCount} monographs
        </div>
      </div>

      {/* Scientific Auto-Tag Cloud — Quiet Hairline Pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[12px] font-sf-text text-steel mr-1.5">
          Keywords:
        </span>

        {tags.map((tag) => {
          const isSelected = selectedTag === tag.name;
          return (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(isSelected ? null : tag.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-sf-text tracking-[-0.12px] transition-colors ${
                isSelected
                  ? 'bg-pricing-blue text-white font-normal'
                  : 'bg-gallery-white hover:bg-studio-mist text-slate hover:text-ink border border-hairline-silver'
              }`}
            >
              <span>#{tag.name}</span>
              <span
                className={`text-[10px] px-1 rounded-full font-mono ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-studio-mist text-slate'
                }`}
              >
                {tag.count}
              </span>
            </button>
          );
        })}

        {/* Clear Filter Control — Outlined Explore Pill */}
        {hasFilter && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedTag(null);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[12px] font-normal text-apple-blue hover:underline transition-colors ml-1"
          >
            <X className="w-3 h-3 text-apple-blue" />
            <span>Reset filters</span>
          </button>
        )}
      </div>

    </section>
  );
};


