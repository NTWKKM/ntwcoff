import React from 'react';
import { Paper } from '../types';
import { ArrowUpRight, Clock, Calendar } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  onSelect: (paper: Paper) => void;
  onTagClick: (tag: string) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onSelect, onTagClick }) => {
  return (
    <article className="group relative flex flex-col justify-between rounded-[28px] bg-gallery-white border border-hairline-silver p-7 sm:p-8 shadow-none hover:border-steel/60 transition-colors duration-200">
      
      <div>
        {/* Top Category Badge & Micro-metadata */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center text-[12px] font-medium text-slate font-sf-text tracking-[-0.12px]">
            {paper.category}
          </span>

          <div className="flex items-center gap-3 text-[12px] text-slate font-sf-text tracking-[-0.12px]">
            {paper.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-steel" />
                {paper.date}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-steel" />
              {paper.readingTimeMinutes} min
            </span>
          </div>
        </div>

        {/* Paper Title — SF Pro Display 600, 24px/26px, Ink, Tight Tracking */}
        <h2
          onClick={() => onSelect(paper)}
          className="text-[22px] sm:text-[24px] font-semibold leading-[1.18] tracking-[-0.3px] text-ink font-sf-display hover:text-apple-blue transition-colors cursor-pointer mb-3 text-balance"
        >
          {paper.title}
        </h2>

        {/* Authors & Journal micro-metadata */}
        {(paper.authors || paper.journal) && (
          <div className="flex flex-col gap-0.5 text-[12px] text-slate font-sf-text mb-4">
            {paper.authors && (
              <p className="line-clamp-1">
                <span className="text-ink font-medium">Authors:</span> {paper.authors}
              </p>
            )}
            {paper.journal && (
              <p className="line-clamp-1 text-slate">
                <span className="text-slate">Journal:</span> {paper.journal}
              </p>
            )}
          </div>
        )}

        {/* Excerpt Body: SF Pro Text 15px, Slate #707070, 1.47 line height */}
        <p className="text-[14px] sm:text-[15px] text-slate font-sf-text leading-[1.47] tracking-[-0.224px] line-clamp-3 mb-6 text-pretty">
          {paper.excerpt}
        </p>

        {/* Scientific Keywords / Tags — Quiet Hairline Pills */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {paper.tags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-sf-text text-slate hover:text-apple-blue hover:bg-studio-mist border border-hairline-silver transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Card Footer Divider & Conversion Control */}
      <div className="pt-5 border-t border-hairline-silver flex items-center justify-between">
        <span className="text-[12px] text-slate font-mono">
          {paper.wordCount.toLocaleString()} words
        </span>

        {/* Conversion Action: Pricing Blue Pill (#0071e3) with white text */}
        <button
          onClick={() => onSelect(paper)}
          className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-[12px] font-normal leading-[16px] tracking-[-0.12px] bg-pricing-blue hover:bg-[#0077ed] active:bg-[#0062c4] text-white transition-colors"
        >
          <span>Read monograph</span>
          <ArrowUpRight className="w-3 h-3 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </button>
      </div>

    </article>
  );
};


