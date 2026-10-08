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
    <article className="group flex flex-col justify-between rounded-[20px] bg-warm-taupe border border-stone/70 hover:border-stone p-7 sm:p-8 transition-colors duration-200">
      
      <div>
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-eggshell text-graphite border border-[#e5e5e5]">
            {paper.category}
          </span>

          <div className="flex items-center gap-3 text-xs text-ash font-mono">
            {paper.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-ash" />
                {paper.date}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-ash" />
              {paper.readingTimeMinutes} นาที
            </span>
          </div>
        </div>

        {/* Paper Title — ElevenLabs Whisper-Weight 300 & Tight -0.02em tracking */}
        <h2
          onClick={() => onSelect(paper)}
          className="text-2xl sm:text-[26px] font-light tracking-whisper text-ink font-waldenburg leading-[1.15] hover:opacity-80 transition-opacity cursor-pointer mb-3 text-balance"
        >
          {paper.title}
        </h2>

        {/* Authors & Journal micro-metadata */}
        {(paper.authors || paper.journal) && (
          <div className="flex flex-col gap-0.5 text-xs text-smoke font-sans mb-4">
            {paper.authors && (
              <p className="line-clamp-1">
                <span className="text-graphite font-medium">ผู้วิจัย:</span> {paper.authors}
              </p>
            )}
            {paper.journal && (
              <p className="line-clamp-1 text-ash">
                <span className="text-smoke">วารสาร:</span> {paper.journal}
              </p>
            )}
          </div>
        )}

        {/* Excerpt */}
        <p className="text-sm sm:text-[15px] text-smoke font-sans leading-relaxed line-clamp-3 mb-6 text-pretty">
          {paper.excerpt}
        </p>

        {/* Fully-Pilled 9999px Auto-Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {paper.tags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
              className="px-2.5 py-0.5 rounded-full text-[11px] font-sans bg-eggshell text-smoke hover:text-ink hover:bg-stone/50 border border-[#e5e5e5] transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Card Footer Divider & Filled Pill CTA */}
      <div className="pt-5 border-t border-stone flex items-center justify-between">
        <span className="text-xs text-ash font-mono">
          {paper.wordCount.toLocaleString()} คำ
        </span>

        {/* Filled Pill Button — Primary Action */}
        <button
          onClick={() => onSelect(paper)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-ink text-white border border-[#e5e5e5] hover:bg-graphite transition-colors shadow-none"
        >
          <span>อ่านบทวิเคราะห์ฉบับเต็ม</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </article>
  );
};

