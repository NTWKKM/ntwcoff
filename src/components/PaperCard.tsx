import React from 'react';
import { Paper } from '../types';
import { BookOpen, Calendar, Clock, ChevronRight, GraduationCap, Award } from 'lucide-react';

interface PaperCardProps {
  paper: Paper;
  onSelect: (paper: Paper) => void;
  onTagClick: (tag: string) => void;
}

export const PaperCard: React.FC<PaperCardProps> = ({ paper, onSelect, onTagClick }) => {
  return (
    <article className="group flex flex-col justify-between rounded-2xl bg-white dark:bg-stone-900/90 border border-stone-200/80 dark:border-stone-800 hover:border-amber-500/50 dark:hover:border-amber-500/50 shadow-sm hover:shadow-xl hover:shadow-amber-900/5 transition-all duration-300 p-6 sm:p-7 relative overflow-hidden">
      
      {/* Top accent line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-coffee-500 to-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />

      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60">
            <Award className="w-3.5 h-3.5" />
            {paper.category}
          </span>

          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-slate-400">
            {paper.date && (
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {paper.date}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {paper.readingTimeMinutes} นาที
            </span>
          </div>
        </div>

        {/* Paper Title */}
        <h2
          onClick={() => onSelect(paper)}
          className="text-xl sm:text-2xl font-bold text-stone-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-300 transition-colors cursor-pointer leading-snug tracking-tight mb-3"
        >
          {paper.title}
        </h2>

        {/* Authors & Journal */}
        {(paper.authors || paper.journal) && (
          <div className="flex flex-col gap-1 text-xs text-stone-600 dark:text-slate-400 mb-4 bg-stone-50 dark:bg-stone-950/60 p-3 rounded-xl border border-stone-200/60 dark:border-stone-800/60">
            {paper.authors && (
              <div className="flex items-start gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                <span className="line-clamp-1"><strong className="text-stone-700 dark:text-slate-300">ผู้วิจัย:</strong> {paper.authors}</span>
              </div>
            )}
            {paper.journal && (
              <div className="flex items-start gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-coffee-600 dark:text-coffee-300 mt-0.5 shrink-0" />
                <span className="line-clamp-1"><strong className="text-stone-700 dark:text-slate-300">วารสาร:</strong> {paper.journal}</span>
              </div>
            )}
          </div>
        )}

        {/* Excerpt */}
        <p className="text-sm text-stone-600 dark:text-slate-300 leading-relaxed line-clamp-3 mb-5">
          {paper.excerpt}
        </p>

        {/* Auto-Tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {paper.tags.map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                onTagClick(tag);
              }}
              className="px-2 py-0.5 rounded-md text-[11px] bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-slate-400 hover:bg-amber-100 hover:text-amber-800 dark:hover:bg-amber-950 dark:hover:text-amber-300 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-4 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-between">
        <span className="text-xs text-stone-400 dark:text-slate-500 font-mono">
          {paper.wordCount.toLocaleString()} คำ
        </span>

        <button
          onClick={() => onSelect(paper)}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-sm shadow-amber-600/20 group-hover:shadow-md group-hover:shadow-amber-600/30 transition-all"
        >
          <span>อ่านบทวิเคราะห์ฉบับเต็ม</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

    </article>
  );
};
