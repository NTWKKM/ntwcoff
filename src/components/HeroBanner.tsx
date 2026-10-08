import React from 'react';
import { Search, X, ArrowDown, ArrowRight } from 'lucide-react';

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
    <section className="relative w-full pt-16 pb-16 px-4 sm:px-6 lg:px-8 bg-gallery-white border-b border-hairline-silver transition-colors">
      <div className="max-w-[1280px] mx-auto flex flex-col items-center text-center">
        
        {/* Product Kicker / Category Title: SF Pro Display 19px-21px/600 */}
        <div className="mb-3">
          <span className="text-[17px] sm:text-[19px] font-semibold leading-tight tracking-[0.231px] text-ink font-sf-display">
            NTWK Coffee Science Notebook
          </span>
        </div>

        {/* Hero Display Headline: SF Pro Display 600, responsive 44px to 76px, line-height 1.05, tracking -1.2px */}
        <h1 className="text-4xl sm:text-6xl lg:text-[76px] font-semibold leading-[1.05] tracking-[-1.2px] text-ink font-sf-display max-w-4xl text-balance mb-6">
          The chemistry of extraction. Redefined.
        </h1>

        {/* Body Copy: SF Pro Text 17px/400 at 25px line height, tracking -0.374px */}
        <p className="text-[16px] sm:text-[17px] font-normal leading-[1.47] tracking-[-0.374px] text-slate font-sf-text max-w-2xl text-pretty mb-10">
          สมุดบันทึกและพอร์ทัลวิจัยวิทยาศาสตร์กาแฟเชิงลึก — อุณหพลศาสตร์การคั่ว จลนศาสตร์เคมี และสัมผัสเชิง Oral Tribology จากเอกสารวิจัย Peer-Reviewed
        </p>

        {/* Rounded Search Input: #ffffff fill, #1d1d1f text, 1px #86868b outline, 980px radius */}
        <div className="w-full max-w-2xl mb-8">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-steel absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหางานวิจัย (5-HMF, Acrylamide, Melanoidins, Astringency, ผู้เขียน)..."
              className="w-full pl-11 pr-11 py-3.5 rounded-[980px] bg-gallery-white border border-steel/60 text-ink placeholder:text-steel text-[14px] font-sans focus:outline-none focus:border-apple-blue focus:ring-1 focus:ring-apple-blue shadow-none transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-full text-slate hover:text-ink transition-colors"
                title="ล้างคำค้นหา"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Real Action Conversion Controls: Pricing Blue Pill & Outlined Explore Pill */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-10">
          <a
            href="#catalog"
            className="inline-flex items-center justify-center px-5 py-2 rounded-full text-[12px] font-normal leading-[16px] tracking-[-0.12px] bg-pricing-blue hover:bg-[#0077ed] text-white active:bg-[#0062c4] transition-colors"
          >
            <span>สำรวจ {totalPapers} งานวิจัยฉบับเต็ม</span>
            <ArrowDown className="w-3.5 h-3.5 ml-1.5" />
          </a>

          <a
            href="#taxonomy"
            className="inline-flex items-center justify-center px-4 py-2 rounded-full text-[12px] font-normal leading-[16px] tracking-[-0.12px] bg-transparent text-ink border border-steel hover:border-ink transition-colors"
          >
            <span>จำแนกตาม {totalCategories} หมวดหมู่วิทยาศาสตร์</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </a>
        </div>

        {/* Real Overview Stats: Flat, quiet, monochrome typography directly from papers.json */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-[12px] text-slate font-sf-text pt-4 border-t border-hairline-silver/60 w-full max-w-xl">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink text-sm">{totalPapers}</span>
            <span>Monographs</span>
          </div>
          <span className="text-hairline-silver">•</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink text-sm">{totalCategories}</span>
            <span>Disciplines</span>
          </div>
          <span className="text-hairline-silver">•</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-ink text-sm">{totalTags}</span>
            <span>Taxonomy Tags</span>
          </div>
        </div>

      </div>
    </section>
  );
};
