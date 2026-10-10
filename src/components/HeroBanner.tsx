import React from 'react';
import { Search, X, ArrowDown, ArrowRight, Zap, Sparkles } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  totalPapers: number;
  totalCategories: number;
  totalTags: number;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  setSearchQuery,
  totalPapers,
  totalCategories,
  totalTags,
}) => {
  return (
    <section className="relative w-full pt-14 pb-14 px-4 sm:px-6 lg:px-8 bg-cream-paper bg-notebook-dots border-b-[1.5px] border-charcoal/20 transition-colors overflow-hidden">
      
      {/* Decorative Stickers — Schoolyard notebook physical stickers */}
      <div className="absolute top-8 left-6 sm:left-12 hidden md:flex items-center gap-2 rotate-[-8deg] pointer-events-none select-none opacity-85">
        <div className="px-3 py-1 rounded-[8px] bg-dew-drop border-[1.5px] border-charcoal text-[13px] font-gelica text-charcoal shadow-subtle flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-sky-sticker fill-sky-sticker" />
          <span>vol. 2026</span>
        </div>
      </div>

      <div className="absolute top-10 right-8 sm:right-16 hidden md:flex items-center gap-2 rotate-[10deg] pointer-events-none select-none opacity-85">
        <div className="px-3 py-1 rounded-[8px] bg-dew-drop border-[1.5px] border-charcoal text-[13px] font-gelica text-charcoal shadow-subtle flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-marker-orange fill-marker-orange" />
          <span>peer-reviewed</span>
        </div>
      </div>

      <div className="max-w-[1080px] mx-auto flex flex-col items-center text-center">
        
        {/* Handwritten Annotation Caption with SVG Arrow */}
        <div className="mb-2 flex items-center gap-2">
          <span className="handwritten-caption text-[19px] sm:text-[21px] lowercase tracking-normal">
            dear coffee geeks,
          </span>
          <svg
            className="w-8 h-5 text-charcoal rotate-[-10deg]"
            viewBox="0 0 40 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <path d="M2 14 C 15 2, 28 4, 38 12 M38 12 L 31 10 M38 12 L 34 18" />
          </svg>
        </div>

        {/* Display Headline: gelica 600 weight, lowercase, Cocoa Ink, tight line-height 1.08 */}
        <h1 className="text-4xl sm:text-6xl lg:text-[72px] font-gelica font-semibold lowercase leading-[1.08] text-cocoa-ink tracking-normal max-w-4xl text-balance mb-6">
          the chemistry of extraction.{' '}
          <span className="marker-highlight">redefined.</span>
        </h1>

        {/* Body Copy: Geist / Sarabun 18px/400 at 1.6 line height */}
        <p className="text-[16px] sm:text-[18px] font-normal leading-[1.7] text-charcoal/90 font-geist max-w-2xl text-pretty mb-8">
          สมุดบันทึกและพอร์ทัลวิจัยวิทยาศาสตร์กาแฟเชิงลึก — อุณหพลศาสตร์การคั่ว จลนศาสตร์เคมี 5-HMF/Acrylamide และสัมผัส Oral Tribology จากงานวิจัย Peer-Reviewed
        </p>

        {/* Accessible Search Form: 8px radius, 1.5px Charcoal border, Dew Drop background */}
        <form
          role="search"
          onSubmit={(e) => e.preventDefault()}
          className="w-full max-w-xl mb-7"
        >
          <label htmlFor="paper-search" className="sr-only">
            ค้นหางานวิจัย (5-HMF, Acrylamide, Melanoidins, Astringency)
          </label>
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-charcoal/60 absolute left-4 pointer-events-none" aria-hidden="true" />
            <input
              id="paper-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหางานวิจัย (5-HMF, Acrylamide, Melanoidins, Astringency)..."
              autoComplete="off"
              spellCheck={false}
              className="w-full pl-11 pr-11 py-3 rounded-[8px] bg-dew-drop border-[1.5px] border-charcoal text-charcoal placeholder:text-charcoal/50 text-[14px] font-geist focus:outline-none focus:ring-2 focus:ring-marker-orange/40 shadow-subtle transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-[6px] text-charcoal/60 hover:text-charcoal transition-colors"
                title="ล้างคำค้นหา"
                aria-label="ล้างคำค้นหา"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </form>

        {/* Superr Pill Action Buttons: Cream Fill + 1.5px Charcoal border + 20px radius */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          <a
            href="#catalog"
            className="superr-pill-btn !text-[14px] !py-2.5 !px-5"
          >
            <span>สำรวจ {totalPapers} งานวิจัยฉบับเต็ม</span>
            <ArrowDown className="w-3.5 h-3.5 text-charcoal" />
          </a>

          <a
            href="#taxonomy"
            className="superr-pill-btn !text-[14px] !py-2.5 !px-5 !bg-dew-drop"
          >
            <span>จำแนกตาม {totalCategories} หมวดหมู่วิทยาศาสตร์</span>
            <ArrowRight className="w-3.5 h-3.5 text-charcoal" />
          </a>
        </div>

        {/* Real Overview Stats: School sticker name labels */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-[13px] text-charcoal font-gelica pt-4 border-t-[1.5px] border-charcoal/15 w-full max-w-lg">
          <div className="px-3.5 py-1.5 rounded-[8px] bg-dew-drop border-[1.5px] border-charcoal/40 flex items-center gap-2 shadow-subtle">
            <span className="font-semibold text-cocoa-ink text-[14px]">{totalPapers}</span>
            <span className="text-charcoal/80">monographs</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-[8px] bg-dew-drop border-[1.5px] border-charcoal/40 flex items-center gap-2 shadow-subtle">
            <span className="font-semibold text-cocoa-ink text-[14px]">{totalCategories}</span>
            <span className="text-charcoal/80">disciplines</span>
          </div>

          <div className="px-3.5 py-1.5 rounded-[8px] bg-dew-drop border-[1.5px] border-charcoal/40 flex items-center gap-2 shadow-subtle">
            <span className="font-semibold text-cocoa-ink text-[14px]">{totalTags}</span>
            <span className="text-charcoal/80">taxonomy tags</span>
          </div>
        </div>

      </div>
    </section>
  );
};
