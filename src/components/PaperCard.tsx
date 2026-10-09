import React from 'react';
import { Paper } from '../types';
import { ArrowUpRight, Clock, Calendar } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  isDeferred?: boolean;
  onSelect: (paper: Paper) => void;
  onTagClick: (tag: string) => void;
}

const getCategoryTheme = (category: string) => {
  if (category.includes('สกัด') || category.includes('Extraction')) {
    return {
      topBorder: 'bg-sky-500',
      badgeBg: 'bg-sky-100/70 dark:bg-sky-950/40',
      badgeBorder: 'border-sky-400/80 dark:border-sky-700',
      badgeText: 'text-sky-900 dark:text-sky-200',
      dotColor: 'bg-sky-500',
    };
  }
  if (category.includes('กลิ่นรส') || category.includes('Sensory')) {
    return {
      topBorder: 'bg-marker-orange',
      badgeBg: 'bg-orange-100/70 dark:bg-orange-950/40',
      badgeBorder: 'border-marker-orange/60 dark:border-orange-700',
      badgeText: 'text-orange-950 dark:text-orange-200',
      dotColor: 'bg-marker-orange',
    };
  }
  if (category.includes('คั่ว') || category.includes('Roasting')) {
    return {
      topBorder: 'bg-amber-600',
      badgeBg: 'bg-amber-100/70 dark:bg-amber-950/40',
      badgeBorder: 'border-amber-400/80 dark:border-amber-700',
      badgeText: 'text-amber-950 dark:text-amber-200',
      dotColor: 'bg-amber-600',
    };
  }
  if (category.includes('หมัก') || category.includes('แปรรูป') || category.includes('Fermentation')) {
    return {
      topBorder: 'bg-emerald-600',
      badgeBg: 'bg-emerald-100/70 dark:bg-emerald-950/40',
      badgeBorder: 'border-emerald-400/80 dark:border-emerald-700',
      badgeText: 'text-emerald-950 dark:text-emerald-200',
      dotColor: 'bg-emerald-600',
    };
  }
  return {
    topBorder: 'bg-charcoal',
    badgeBg: 'bg-dew-drop',
    badgeBorder: 'border-charcoal/30',
    badgeText: 'text-charcoal',
    dotColor: 'bg-charcoal',
  };
};

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isDeferred = false,
  onSelect,
  onTagClick,
}) => {
  const topTags = paper.tags.slice(0, 3);
  const remainingTagsCount = Math.max(0, paper.tags.length - 3);
  const theme = getCategoryTheme(paper.category);

  return (
    <article
      className={`group relative flex flex-col justify-between rounded-[12px] bg-cream-paper border-[1.5px] border-charcoal p-6 sm:p-8 shadow-card hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 motion-reduce:transform-none motion-reduce:transition-none overflow-hidden ${
        isDeferred ? 'paper-card-deferred' : ''
      }`}
    >
      {/* Category Accent Top Stripe */}
      <div className={`absolute top-0 left-0 right-0 h-[4px] ${theme.topBorder}`} />

      <div>
        {/* Top Category Badge & Micro-metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5 pt-0.5">
          <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-[20px] border-[1.5px] text-[12px] font-gelica ${theme.badgeBg} ${theme.badgeBorder} ${theme.badgeText} shadow-subtle`}>
            <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
            {paper.category}
          </span>

          <div className="flex items-center gap-3 text-[12px] text-charcoal/70 font-geist">
            {paper.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-charcoal/50" />
                {paper.date}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-charcoal/50" />
              {paper.readingTimeMinutes} min
            </span>
          </div>
        </div>

        {/* Paper Title — gelica 600 weight, Cocoa Ink, 21px-23px */}
        <h2
          onClick={() => onSelect(paper)}
          className="text-[20px] sm:text-[22px] font-gelica font-semibold leading-[1.2] text-cocoa-ink hover:text-marker-orange transition-colors cursor-pointer mb-2.5 text-balance"
        >
          {paper.title}
        </h2>

        {/* Authors & Journal micro-metadata */}
        {(paper.authors || paper.journal) && (
          <div className="flex flex-col gap-0.5 text-[12px] text-charcoal/70 font-geist mb-3.5">
            {paper.authors && (
              <p className="line-clamp-1">
                <span className="text-cocoa-ink font-medium">Authors:</span> {paper.authors}
              </p>
            )}
            {paper.journal && (
              <p className="line-clamp-1 text-charcoal/60">
                <span className="text-charcoal/80">Journal:</span> {paper.journal}
              </p>
            )}
          </div>
        )}

        {/* Excerpt Body: Geist 14px/15px, 1.65 line height */}
        <p className="text-[14px] sm:text-[15px] text-charcoal/80 font-geist leading-[1.65] line-clamp-3 mb-5 text-pretty">
          {paper.excerpt}
        </p>

        {/* Scientific Keywords / Tags — Top 3 Pills + N more to prevent visual clutter */}
        <div className="flex flex-wrap items-center gap-1.5 mb-5">
          {topTags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
              className="px-2.5 py-0.5 rounded-[20px] text-[11px] font-geist text-charcoal bg-dew-drop hover:bg-cream-paper border-[1.5px] border-charcoal/30 hover:border-charcoal transition-colors shadow-subtle"
            >
              #{tag}
            </button>
          ))}
          {remainingTagsCount > 0 && (
            <button
              type="button"
              onClick={() => onSelect(paper)}
              className="px-2 py-0.5 rounded-[20px] text-[11px] font-geist text-charcoal/60 bg-cream-paper border-[1.5px] border-charcoal/20 cursor-pointer hover:text-charcoal"
            >
              +{remainingTagsCount} more
            </button>
          )}
        </div>
      </div>

      {/* Card Footer Divider & Conversion Control */}
      <div className="pt-4 border-t-[1.5px] border-charcoal/15 flex items-center justify-between">
        <span className="text-[12px] text-charcoal/60 font-mono">
          {paper.wordCount.toLocaleString()} words
        </span>

        {/* Superr Pill Action Button */}
        <button
          onClick={() => onSelect(paper)}
          className="superr-pill-btn !py-1.5 !px-3.5 !text-[13px]"
        >
          <span>read monograph</span>
          <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

    </article>
  );
};
