import React from 'react';
import { Search, X, Sparkles, BookOpen, Layers, Tag as TagIcon, CheckCircle2 } from 'lucide-react';

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
    <section className="relative overflow-hidden pt-10 pb-8 px-4 sm:px-6 lg:px-8 border-b border-stone-200/70 dark:border-stone-800/80 bg-gradient-to-b from-stone-100/60 to-transparent dark:from-espresso-900/60 dark:to-transparent">
      
      {/* Decorative background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 max-w-4xl h-48 bg-gradient-to-r from-amber-500/10 via-coffee-500/10 to-amber-600/10 blur-3xl -z-10 pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto text-center">
        
        {/* Header Tag */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 mb-4 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
          <span>Google Drive Cloud Sync & Automated Taxonomy Engine</span>
        </div>

        {/* Main Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-stone-900 dark:text-white leading-tight">
          Coffee Science <span className="bg-gradient-to-r from-amber-600 to-coffee-600 dark:from-amber-400 dark:to-amber-200 bg-clip-text text-transparent">Deep Research</span>
        </h1>

        <p className="mt-3 text-base sm:text-lg text-stone-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          คลังความรู้และบทวิเคราะห์งานวิจัยวิทยาศาสตร์กาแฟเชิงลึก เชื่อมโยงกลไกระดับโมเลกุล การคั่ว และสัมผัสในช่องปาก สู่การยกระดับกาแฟพิเศษในทางปฏิบัติ
        </p>

        {/* Live Search Bar */}
        <div className="mt-8 max-w-2xl mx-auto relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-stone-400 dark:text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหางานวิจัย (เช่น สารประกอบ 5-HMF, ความฝาด, เมลาโนอิดิน, ชื่อผู้วิจัย, หรือคีย์เวิร์ด)..."
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-900 dark:text-slate-100 placeholder-stone-400 dark:placeholder-slate-500 shadow-lg shadow-stone-200/50 dark:shadow-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all text-sm sm:text-base"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:text-slate-400 dark:hover:text-slate-200"
                title="ล้างคำค้นหา"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Metrics Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-stone-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 backdrop-blur-sm shadow-sm">
            <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>งานวิจัยทั้งหมด: <strong className="font-semibold text-stone-900 dark:text-slate-100">{totalPapers}</strong> เรื่อง</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 backdrop-blur-sm shadow-sm">
            <Layers className="w-3.5 h-3.5 text-coffee-600 dark:text-coffee-300" />
            <span>หมวดหมู่: <strong className="font-semibold text-stone-900 dark:text-slate-100">{totalCategories}</strong> สาขา</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 backdrop-blur-sm shadow-sm">
            <TagIcon className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>ระบบแท็ก: <strong className="font-semibold text-stone-900 dark:text-slate-100">{totalTags}</strong> แท็ก</span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 backdrop-blur-sm">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Live Action พร้อมใช้งาน</span>
          </div>
        </div>

      </div>
    </section>
  );
};
