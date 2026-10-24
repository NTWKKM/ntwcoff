import React from 'react';
import { Paper } from '../types';

interface PaperCardProps {
  paper: Paper;
  isDeferred?: boolean;
  onSelect: (paper: Paper) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isDeferred = false,
  onSelect,
}) => {
  return (
    <article
      onClick={() => onSelect(paper)}
      className={`group relative flex flex-col justify-between rounded-[10px] bg-cream-paper border border-charcoal/14 hover:border-charcoal/45 p-6 transition-colors duration-150 cursor-pointer text-left has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-marker-orange ${
        isDeferred ? 'paper-card-deferred' : ''
      }`}
    >
      <div>
        {/* Unboxed Metadata Kicker (Zero-Pill Discipline) */}
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-charcoal/60 font-geist mb-2.5 tabular-nums">
          <span className="text-burnt-sienna font-medium">{paper.category}</span>
          {paper.publishedYear && (
            <>
              <span aria-hidden="true">·</span>
              <span className="font-mono">{paper.publishedYear}</span>
            </>
          )}
          <span aria-hidden="true">·</span>
          <span>{paper.readingTimeMinutes} min read</span>
        </div>

        {/* Paper Title — Fraunces 600, Cocoa Ink */}
        <h2 className="text-[19px] sm:text-[21px] font-gelica font-semibold leading-[1.25] text-cocoa-ink group-hover:text-marker-orange transition-colors mb-2 text-balance">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(paper);
            }}
            className="text-left font-inherit text-inherit after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {paper.title}
          </button>
        </h2>

        {/* Single-Line Authors & Journal Metadata */}
        {(paper.authors || paper.journal) && (
          <p className="text-[12.5px] text-charcoal/60 font-geist line-clamp-1 mb-3">
            {[paper.authors, paper.journal].filter(Boolean).join(' · ')}
          </p>
        )}

        {/* Concise 2-Line Excerpt */}
        <p className="text-[14px] text-charcoal/80 font-geist leading-[1.6] line-clamp-2 text-pretty">
          {paper.excerpt}
        </p>
      </div>
    </article>
  );
};
