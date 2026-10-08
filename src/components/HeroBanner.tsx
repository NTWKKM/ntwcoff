import React, { useState } from 'react';
import { Search, X, Volume2, Play, Pause, Sparkles } from 'lucide-react';

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
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  return (
    <section className="relative w-full pt-16 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 border-b border-stone bg-eggshell">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Editorial Sub-Label / Tag */}
        <div className="mb-6 flex items-center gap-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-warm-taupe text-graphite border border-stone">
            A Bauhaus Notebook on Coffee Science
          </span>
          <span className="text-xs text-ash font-mono hidden sm:inline">
            Vol. 2026 • Curated Knowledge
          </span>
        </div>

        {/* Asymmetric Hero Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center mb-12">
          
          {/* Left Column: Whisper-Weight Headline & Actions */}
          <div className="lg:col-span-7 space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-[48px] font-light tracking-whisper text-ink font-waldenburg leading-[1.08] text-balance">
              Coffee Science Deep Research
            </h1>

            <p className="text-base sm:text-lg text-smoke font-sans leading-relaxed text-pretty max-w-xl">
              สมุดบันทึกและพอร์ทัลวิจัยวิทยาศาสตร์กาแฟเชิงลึก — เชื่อมโยงอุณหพลศาสตร์การคั่ว จลนศาสตร์เคมี 
              และสัมผัสเชิง Tribology สู่การยกระดับกาแฟพิเศษในทางปฏิบัติ
            </p>

            {/* Quick Action Pill Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#catalog"
                className="inline-flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium bg-ink text-white border border-[#e5e5e5] hover:bg-graphite transition-colors"
              >
                อ่าน {totalPapers} งานวิจัยฉบับเต็ม
              </a>
              <a
                href="#taxonomy"
                className="inline-flex items-center justify-center px-3.5 py-2 rounded-full text-sm font-medium bg-eggshell text-ink border border-[#e5e5e5] hover:bg-warm-taupe transition-colors"
              >
                จำแนกตาม {totalCategories} หมวดหมู่
              </a>
            </div>
          </div>

          {/* Right Column: Signature ElevenLabs Audio Sphere Visual */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="relative flex flex-col items-center">
              
              {/* Product Visual Audio Sphere: Radial Violet #0447ff + Ember Orange #ff4704 */}
              <div
                className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full flex items-center justify-center select-none shadow-sm transition-transform hover:scale-[1.02] duration-500"
                style={{
                  background: `radial-gradient(circle at 35% 35%, #0447ff 0%, #ff4704 55%, #f5f3f1 90%)`,
                  filter: 'blur(0.5px)',
                }}
              >
                {/* Secondary inner glow blend */}
                <div
                  className="absolute inset-0 rounded-full opacity-60 mix-blend-screen"
                  style={{
                    background: `radial-gradient(circle at 70% 70%, #ff4704 0%, #0447ff 60%, transparent 80%)`,
                  }}
                />

                {/* Center Play Pill Button — ElevenLabs Signature */}
                <button
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className="relative z-10 w-12 h-12 rounded-full bg-white/95 text-ink flex items-center justify-center shadow-subtle hover:scale-105 active:scale-95 transition-all focus:outline-none"
                  aria-label="Toggle Audio Monograph Brief"
                  title="จำลองเสียงบรรยายสรุปงานวิจัย"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-5 h-5 text-ink fill-ink" />
                  ) : (
                    <Play className="w-5 h-5 text-ink fill-ink ml-0.5" />
                  )}
                </button>
              </div>

              {/* Sphere Caption */}
              <div className="mt-3 text-center">
                <span className="text-[12px] font-mono text-smoke flex items-center justify-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-graphite" />
                  <span>{isPlayingAudio ? 'เล่นเสียงสรุปงานวิจัย (Audio Synthesis)' : 'Audio Synthesis Sphere'}</span>
                </span>
                <span className="text-[11px] text-ash">
                  Violet Spark (#0447ff) & Ember Orange (#ff4704)
                </span>
              </div>

            </div>
          </div>

        </div>

        {/* Minimalist Search Bar — ElevenLabs Bauhaus Style */}
        <div className="relative max-w-3xl mt-4">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-ash absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นคว้าสารประกอบ (เช่น 5-HMF, Acrylamide, Melanoidins, Astringency, ชื่อผู้วิจัย)..."
              className="w-full pl-11 pr-10 py-3 rounded-full bg-eggshell border border-stone text-ink placeholder:text-ash text-sm focus:outline-none focus:border-graphite transition-colors shadow-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 p-1 rounded-full text-smoke hover:text-ink transition-colors"
                title="ล้างคำค้นหา"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Metric Badges — Minimalist Hairline Taupe Plates */}
        <div className="mt-6 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-smoke font-sans">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-taupe border border-stone">
            <span className="font-medium text-graphite">{totalPapers}</span>
            <span>บทความวิจัย</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-taupe border border-stone">
            <span className="font-medium text-graphite">{totalCategories}</span>
            <span>สาขาวิชา</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-taupe border border-stone">
            <span className="font-medium text-graphite">{totalTags}</span>
            <span>ระบบแท็กวิทยาศาสตร์</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-warm-taupe border border-stone">
            <span className="w-1.5 h-1.5 rounded-full bg-ink inline-block" />
            <span>Google Drive Sync Active</span>
          </div>
        </div>

      </div>
    </section>
  );
};

