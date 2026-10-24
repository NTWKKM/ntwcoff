import React, { useState } from 'react';
import { TagInfo, YearInfo } from '../types';
import { Search, X, SlidersHorizontal } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
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
  searchQuery,
  setSearchQuery,
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
  const [showTagsDrawer, setShowTagsDrawer] = useState(false);

  const hasFilter =
    searchQuery.trim() !== '' ||
    selectedCategory !== null ||
    selectedYear !== null ||
    selectedTag !== null;

  return (
    <section id="taxonomy" className="w-full pb-6 mb-6 border-b border-charcoal/12 space-y-3.5">
      
      {/* Row 1: Search Input + Year Select + Keywords Toggle + Result Count */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        
        {/* Search Form */}
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="relative flex-1 max-w-md"
        >
          <label htmlFor="paper-search" className="sr-only">
            ค้นหางานวิจัย (5-HMF, Acrylamide, Melanoidins, Astringency)
          </label>
          <Search
            className="w-4 h-4 text-charcoal/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            id="paper-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาสารเคมี หัวข้อ หรือชื่อผู้วิจัย..."
            autoComplete="off"
            spellCheck={false}
            className="w-full pl-9 pr-8 py-2 rounded-[8px] bg-cream-paper border border-charcoal/18 text-charcoal placeholder:text-charcoal/45 text-[16px] sm:text-[13px] font-geist focus:outline-none focus:border-charcoal transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-charcoal/50 hover:text-charcoal transition-colors"
              title="ล้างคำค้นหา"
              aria-label="ล้างคำค้นหา"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Right Controls: Year Select + Keywords Drawer Button + Live Count */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Compact Year Filter Select */}
          {years.length > 0 && (
            <div className="flex items-center">
              <label htmlFor="year-select" className="sr-only">
                กรองตามปีที่ตีพิมพ์
              </label>
              <select
                id="year-select"
                value={selectedYear ?? ''}
                onChange={(e) =>
                  setSelectedYear(e.target.value ? Number(e.target.value) : null)
                }
                className="px-3 py-1.5 rounded-[8px] bg-cream-paper border border-charcoal/18 text-[16px] sm:text-[13px] font-geist text-charcoal focus:outline-none focus:border-charcoal transition-colors cursor-pointer tabular-nums"
              >
                <option value="">ทุกปีที่ตีพิมพ์ (All years)</option>
                {years.map(({ year, count }) => (
                  <option key={year} value={year}>
                    ปี {year} ({count})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Keywords Drawer Toggle */}
          {tags.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (selectedTag !== null) {
                  setSelectedTag(null);
                  setShowTagsDrawer(false);
                } else {
                  setShowTagsDrawer((prev) => !prev);
                }
              }}
              aria-expanded={showTagsDrawer || selectedTag !== null}
              className={`px-3 py-1.5 rounded-[8px] border text-[13px] font-geist inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                showTagsDrawer || selectedTag
                  ? 'bg-charcoal text-cream-paper border-charcoal font-medium'
                  : 'bg-cream-paper text-charcoal border-charcoal/18 hover:border-charcoal'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{selectedTag ? `#${selectedTag}` : 'Keywords'}</span>
            </button>
          )}

          {/* Reset All Filters */}
          {hasFilter && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory(null);
                setSelectedYear(null);
                setSelectedTag(null);
              }}
              className="px-2.5 py-1.5 rounded-[8px] text-[12px] font-geist text-burnt-sienna hover:text-marker-orange inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}

          {/* Unboxed Result Count */}
          <span
            aria-live="polite"
            aria-atomic="true"
            className="text-[12px] text-charcoal/60 font-mono tabular-nums ml-auto md:ml-1 whitespace-nowrap shrink-0"
          >
            {filteredCount} / {totalCount}
          </span>
        </div>
      </div>

      {/* Row 2: Clean Segmented Category Tabs */}
      <div
        className="flex flex-wrap items-center gap-1.5"
        role="toolbar"
        aria-label="หมวดหมู่วิทยาศาสตร์"
      >
        <button
          type="button"
          onClick={() => setSelectedCategory(null)}
          aria-pressed={selectedCategory === null}
          className={`px-3 py-1.5 rounded-[6px] text-[13px] font-geist transition-colors whitespace-nowrap shrink-0 ${
            selectedCategory === null
              ? 'bg-charcoal text-cream-paper font-medium'
              : 'text-charcoal/70 hover:text-charcoal hover:bg-cream-paper/70'
          }`}
        >
          All disciplines
        </button>

        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(isSelected ? null : cat)}
              aria-pressed={isSelected}
              className={`px-3 py-1.5 rounded-[6px] text-[13px] font-geist transition-colors whitespace-nowrap shrink-0 ${
                isSelected
                  ? 'bg-charcoal text-cream-paper font-medium'
                  : 'text-charcoal/70 hover:text-charcoal hover:bg-cream-paper/70'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Collapsible Keywords Index — Only visible when toggled or when a tag is active */}
      {(showTagsDrawer || selectedTag !== null) && (
        <div className="pt-3 border-t border-charcoal/10 flex flex-wrap items-center gap-1.5">
          <span className="text-[12px] text-charcoal/55 font-geist mr-1">
            Filter by keyword:
          </span>
          {tags.map((tag) => {
            const isSelected = selectedTag === tag.name;
            return (
              <button
                key={tag.name}
                type="button"
                onClick={() => setSelectedTag(isSelected ? null : tag.name)}
                aria-pressed={isSelected}
                className={`px-2.5 py-1 rounded-[6px] text-[12px] font-geist transition-colors whitespace-nowrap shrink-0 tabular-nums ${
                  isSelected
                    ? 'bg-marker-orange text-cream-paper font-medium'
                    : 'bg-cream-paper/80 text-charcoal/75 border border-charcoal/12 hover:border-charcoal/40 hover:text-charcoal'
                }`}
              >
                #{tag.name} <span className="opacity-60">({tag.count})</span>
              </button>
            );
          })}
        </div>
      )}

    </section>
  );
};
