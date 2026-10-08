import React, { useState } from 'react';
import { TagInfo } from '../types';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

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
  const [showAllTags, setShowAllTags] = useState(false);
  const hasFilter = selectedCategory !== null || selectedTag !== null;

  // Curate initial tags to top 12 to prevent visual overcrowding
  const visibleTags = showAllTags ? tags : tags.slice(0, 12);

  return (
    <section id="taxonomy" className="w-full pt-4 pb-6 space-y-4">
      
      {/* Category Navigation Pills — Schoolyard Segmented Control */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-[1.5px] border-charcoal/15">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-[20px] text-[13px] font-gelica transition-all whitespace-nowrap shadow-subtle ${
              selectedCategory === null
                ? 'bg-charcoal text-cream-paper border-[1.5px] border-charcoal font-medium'
                : 'bg-cream-paper text-charcoal border-[1.5px] border-charcoal/30 hover:border-charcoal hover:bg-dew-drop'
            }`}
          >
            all papers ({totalCount})
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(isSelected ? null : cat)}
                className={`px-4 py-1.5 rounded-[20px] text-[13px] font-gelica transition-all whitespace-nowrap shadow-subtle ${
                  isSelected
                    ? 'bg-charcoal text-cream-paper border-[1.5px] border-charcoal font-medium'
                    : 'bg-cream-paper text-charcoal border-[1.5px] border-charcoal/30 hover:border-charcoal hover:bg-dew-drop'
                }`}
              >
                {cat.toLowerCase()}
              </button>
            );
          })}
        </div>

        {/* Filter Summary Counter */}
        <div className="text-[13px] text-charcoal/70 font-gelica shrink-0">
          showing {filteredCount} of {totalCount} monographs
        </div>
      </div>

      {/* Scientific Auto-Tag Cloud — Dew Drop & Sprout Green Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[13px] font-gelica text-charcoal/70 mr-1">
          keywords:
        </span>

        {visibleTags.map((tag) => {
          const isSelected = selectedTag === tag.name;
          return (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(isSelected ? null : tag.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[20px] text-[12px] font-geist shadow-subtle transition-all ${
                isSelected
                  ? 'bg-marker-orange text-cream-paper border-[1.5px] border-charcoal font-medium'
                  : 'bg-dew-drop text-charcoal border-[1.5px] border-charcoal/30 hover:border-charcoal hover:bg-cream-paper'
              }`}
            >
              <span>#{tag.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-[10px] font-mono ${
                  isSelected ? 'bg-black/20 text-cream-paper' : 'bg-charcoal/10 text-charcoal'
                }`}
              >
                {tag.count}
              </span>
            </button>
          );
        })}

        {/* Toggle more tags */}
        {tags.length > 12 && (
          <button
            onClick={() => setShowAllTags(!showAllTags)}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-[20px] text-[12px] font-gelica text-charcoal bg-cream-paper border-[1.5px] border-charcoal/30 hover:border-charcoal transition-colors"
          >
            <span>{showAllTags ? 'less tags' : `+${tags.length - 12} more`}</span>
            {showAllTags ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}

        {/* Clear Filter Control */}
        {hasFilter && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedTag(null);
            }}
            className="inline-flex items-center gap-1 px-3 py-1 rounded-[20px] text-[12px] font-gelica text-burnt-sienna hover:text-marker-orange border-[1.5px] border-burnt-sienna/40 hover:border-marker-orange transition-colors ml-1"
          >
            <X className="w-3 h-3" />
            <span>reset filters</span>
          </button>
        )}
      </div>

    </section>
  );
};
