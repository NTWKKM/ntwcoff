import React from 'react';

interface HeroBannerProps {
  totalPapers: number;
  totalCategories: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  totalPapers,
  totalCategories,
}) => {
  return (
    <section className="w-full pt-10 pb-8 sm:pt-12 sm:pb-10 px-4 sm:px-6 lg:px-8 bg-cream-paper border-b border-charcoal/12 transition-colors">
      <div className="max-w-[1200px] mx-auto">
        
        {/* Quiet Unboxed Editorial Kicker */}
        <div className="flex flex-wrap items-center gap-2 text-[12px] text-charcoal/60 font-geist mb-3 tabular-nums">
          <span className="text-marker-orange font-medium">Coffee Science Archive</span>
          <span aria-hidden="true">·</span>
          <span>{totalPapers} peer-reviewed monographs</span>
          <span aria-hidden="true">·</span>
          <span>{totalCategories} scientific disciplines</span>
        </div>

        {/* Display Headline: Fraunces 600, Cocoa Ink, tight line-height, balanced measure */}
        <h1 className="text-3xl sm:text-5xl lg:text-[52px] font-gelica font-semibold lowercase leading-[1.08] text-cocoa-ink tracking-tight max-w-3xl text-balance">
          the chemistry of extraction,{' '}
          <span className="marker-highlight">redefined.</span>
        </h1>

      </div>
    </section>
  );
};
