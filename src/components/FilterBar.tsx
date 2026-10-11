import React, { useState, useMemo } from 'react';
import { TagInfo, YearInfo } from '../types';
import { X, ChevronDown, ChevronUp, Calendar } from 'lucide-react';

interface FilterBarProps {
  categories: string[];
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  years: YearInfo[];
  selectedYear: number | null;
  setSelectedYear: (year: number | null) => void;
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
  years,
  selectedYear,
  setSelectedYear,
  tags,
  selectedTag,
  setSelectedTag,
  filteredCount,
  totalCount,
}) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const [showAllYears, setShowAllYears] = useState(false);
  const hasFilter =
    selectedCategory !== null || selectedYear !== null || selectedTag !== null;

  // Curate initial years to top 8 recent years, but preserve selectedYear
  const visibleYears = useMemo(() => {
    if (showAllYears) return years;
    const initial = years.slice(0, 8);
    if (selectedYear && !initial.some((y) => y.year === selectedYear)) {
      const selected = years.find((y) => y.year === selectedYear);
      if (selected) {
        return [...initial, selected];
      }
    }
    return initial;
  }, [showAllYears, years, selectedYear]);

  // Curate initial tags to top 12 to prevent visual overcrowding, but always preserve selectedTag
  const visibleTags = useMemo(() => {
    if (showAllTags) return tags;
    const initial = tags.slice(0, 12);
    if (selectedTag && !initial.some((t) => t.name === selectedTag)) {
      const selected = tags.find((t) => t.name === selectedTag);
      if (selected) {
        return [...initial, selected];
      }
    }
    return initial;
  }, [showAllTags, tags, selectedTag]);

  return (
    <section id="taxonomy" className="w-full pt-4 pb-6 space-y-4">
      {/* Category Navigation Pills — Wraps naturally, NO horizontal scroll */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b-[1.5px] border-charcoal/15">
        <div
          className="flex flex-wrap items-center gap-2"
          role="toolbar"
          aria-label="หมวดหมู่วิทยาศาสตร์"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            aria-pressed={selectedCategory === null}
            className={`px-4 py-1.5 rounded-[20px] text-[13px] font-gelica transition-all shadow-subtle ${
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
                aria-pressed={isSelected}
                className={`px-4 py-1.5 rounded-[20px] text-[13px] font-gelica transition-all shadow-subtle ${
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

        {/* Filter Summary Counter with live announcement for assistive tech */}
        <div
          aria-live="polite"
          aria-atomic="true"
          className="text-[13px] text-charcoal/70 font-gelica shrink-0 self-start sm:self-center"
        >
          showing {filteredCount} of {totalCount} monographs
        </div>
      </div>

      {/* Publication Year Filter Row — Dew Drop & Marker Orange Pills */}
      {years.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pb-3 border-b-[1.5px] border-charcoal/15">
          <span className="text-[13px] font-gelica text-charcoal/70 mr-1 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-marker-orange" />
            <span>published year:</span>
          </span>

          <button
            onClick={() => setSelectedYear(null)}
            aria-pressed={selectedYear === null}
            className={`px-3 py-1 rounded-[20px] text-[12px] font-gelica transition-all shadow-subtle ${
              selectedYear === null
                ? 'bg-charcoal text-cream-paper border-[1.5px] border-charcoal font-medium'
                : 'bg-cream-paper text-charcoal border-[1.5px] border-charcoal/30 hover:border-charcoal hover:bg-dew-drop'
            }`}
          >
            all years
          </button>

          {visibleYears.map(({ year, count }) => {
            const isSelected = selectedYear === year;
            return (
              <button
                key={year}
                onClick={() => setSelectedYear(isSelected ? null : year)}
                aria-pressed={isSelected}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[20px] text-[12px] font-mono shadow-subtle transition-all ${
                  isSelected
                    ? 'bg-marker-orange text-cream-paper border-[1.5px] border-charcoal font-semibold'
                    : 'bg-dew-drop text-charcoal border-[1.5px] border-charcoal/30 hover:border-charcoal hover:bg-cream-paper'
                }`}
              >
                <span>{year}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-[10px] font-mono ${
                    isSelected
                      ? 'bg-black/20 text-cream-paper'
                      : 'bg-charcoal/10 text-charcoal'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {years.length > 8 && (
            <button
              onClick={() => setShowAllYears(!showAllYears)}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-[20px] text-[12px] font-gelica text-charcoal bg-cream-paper border-[1.5px] border-charcoal/30 hover:border-charcoal transition-colors shadow-subtle"
            >
              <span>{showAllYears ? 'less years' : `+${years.length - 8} more`}</span>
              {showAllYears ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>
          )}
        </div>
      )}

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
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-[20px] text-[12px] font-geist shadow-subtle transition-all ${
                isSelected
                  ? 'bg-marker-orange text-cream-paper border-[1.5px] border-charcoal font-medium'
                  : 'bg-dew-drop text-charcoal border-[1.5px] border-charcoal/30 hover:border-charcoal hover:bg-cream-paper'
              }`}
            >
              <span>#{tag.name}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-[10px] font-mono ${
                  isSelected
                    ? 'bg-black/20 text-cream-paper'
                    : 'bg-charcoal/10 text-charcoal'
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
            className="inline-flex items-center gap-1 px-3 py-1 rounded-[20px] text-[12px] font-gelica text-charcoal bg-cream-paper border-[1.5px] border-charcoal/30 hover:border-charcoal transition-colors shadow-subtle"
          >
            <span>{showAllTags ? 'less tags' : `+${tags.length - 12} more`}</span>
            {showAllTags ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        )}

        {/* Clear Filter Control */}
        {hasFilter && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedYear(null);
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

