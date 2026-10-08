import React from 'react';
import { TagInfo } from '../types';
import { Filter, X, ChevronRight } from 'lucide-react';

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          หมวดหมู่วิจัย:
        </span>

        <button
          onClick={() => setSelectedCategory(null)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
            selectedCategory === null
              ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-slate-300 border border-stone-200/80 dark:border-stone-800'
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
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-sm shadow-amber-600/30'
                  : 'bg-stone-100 hover:bg-stone-200 text-stone-700 dark:bg-stone-900 dark:hover:bg-stone-800 dark:text-slate-300 border border-stone-200/80 dark:border-stone-800'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Auto-Tag Cloud */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-stone-500 dark:text-slate-400 uppercase tracking-wider mr-1">
          Tags:
        </span>

        {tags.map((tag) => {
          const isSelected = selectedTag === tag.name;
          return (
            <button
              key={tag.name}
              onClick={() => setSelectedTag(isSelected ? null : tag.name)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all ${
                isSelected
                  ? 'bg-amber-500 text-white font-medium ring-2 ring-amber-400/50'
                  : 'bg-stone-200/60 hover:bg-stone-200 text-stone-700 dark:bg-stone-900/90 dark:hover:bg-stone-800 dark:text-slate-400 dark:hover:text-slate-200 border border-stone-200/60 dark:border-stone-800'
              }`}
            >
              <span>#{tag.name}</span>
              <span
                className={`text-[10px] px-1 rounded ${
                  isSelected
                    ? 'bg-amber-600 text-white'
                    : 'bg-stone-300/60 dark:bg-stone-800 text-stone-500 dark:text-slate-400'
                }`}
              >
                {tag.count}
              </span>
            </button>
          );
        })}

        {/* Clear filter button */}
        {hasFilter && (
          <button
            onClick={() => {
              setSelectedCategory(null);
              setSelectedTag(null);
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-950/60 dark:hover:bg-red-900/80 dark:text-red-300 border border-red-200 dark:border-red-900/60 transition-colors ml-1 font-medium"
          >
            <X className="w-3 h-3" />
            <span>ล้างตัวกรอง ({filteredCount}/{totalCount})</span>
          </button>
        )}
      </div>

    </div>
  );
};
