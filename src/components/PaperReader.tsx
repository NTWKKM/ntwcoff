import React, { useEffect, useState } from 'react';
import { Paper } from '../types';
import { KatexRenderer } from './KatexRenderer';
import {
  X,
  ArrowLeft,
  Share2,
  Copy,
  Check,
  Calendar,
  Clock,
  GraduationCap,
  BookOpen,
  Building,
  Bookmark,
  Award,
} from 'lucide-react';

interface PaperReaderProps {
  paper: Paper | null;
  onClose: () => void;
  onTagClick: (tag: string) => void;
}

export const PaperReader: React.FC<PaperReaderProps> = ({ paper, onClose, onTagClick }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!paper) return null;

  const copyCitation = () => {
    const citation = `${paper.authors || 'Unknown'} (${paper.date || '2026'}). ${paper.title}. ${paper.journal || ''}.`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/70 dark:bg-black/80 backdrop-blur-md flex justify-center p-0 sm:p-4 md:p-6 animate-fadeIn">
      
      {/* Modal Dialog Card */}
      <div className="bg-white dark:bg-espresso-900 w-full max-w-5xl rounded-none sm:rounded-3xl shadow-2xl border border-stone-200 dark:border-stone-800 flex flex-col my-auto max-h-screen sm:max-h-[94vh] overflow-hidden">
        
        {/* Sticky Header */}
        <header className="sticky top-0 z-20 px-6 py-4 bg-white/95 dark:bg-espresso-900/95 backdrop-blur border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-slate-300 hover:text-stone-900 dark:hover:text-white px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>ย้อนกลับ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCitation}
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-slate-300 hover:bg-amber-100 dark:hover:bg-amber-950/80 hover:text-amber-800 dark:hover:text-amber-300 border border-stone-200 dark:border-stone-700 transition-colors"
              title="คัดลอกรายการอ้างอิง (Citation)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอก Citation'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-stone-400 hover:text-stone-700 dark:text-slate-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
              aria-label="Close reader"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Reader Content */}
        <div className="overflow-y-auto px-6 sm:px-10 md:px-12 py-8 space-y-8">
          
          {/* Article Header */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                <Award className="w-3.5 h-3.5" />
                {paper.category}
              </span>

              {paper.date && (
                <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-slate-400 ml-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {paper.date}
                </span>
              )}

              <span className="flex items-center gap-1 text-xs text-stone-500 dark:text-slate-400 ml-1">
                <Clock className="w-3.5 h-3.5" />
                เวลาอ่านโดยประมาณ {paper.readingTimeMinutes} นาที
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-stone-900 dark:text-white leading-tight tracking-tight">
              {paper.title}
            </h1>

            {paper.documentHeader && (
              <p className="mt-2 text-sm text-stone-500 dark:text-slate-400 font-medium">
                เอกสารต้นฉบับ: {paper.documentHeader}
              </p>
            )}
          </div>

          {/* Research Metadata Card */}
          <div className="rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200/80 dark:border-stone-800/80 p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Bookmark className="w-4 h-4" />
              ข้อมูลจำเพาะงานวิจัย (Research Specifications)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {paper.authors && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-stone-800 dark:text-slate-200">คณะผู้วิจัย:</strong>
                    <div className="text-stone-600 dark:text-slate-400 mt-0.5">{paper.authors}</div>
                  </div>
                </div>
              )}

              {paper.institution && (
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-stone-800 dark:text-slate-200">สถาบันวิจัย:</strong>
                    <div className="text-stone-600 dark:text-slate-400 mt-0.5">{paper.institution}</div>
                  </div>
                </div>
              )}

              {paper.journal && (
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-stone-800 dark:text-slate-200">วารสารวิชาการ:</strong>
                    <div className="text-stone-600 dark:text-slate-400 mt-0.5">{paper.journal}</div>
                  </div>
                </div>
              )}

              {paper.links && (
                <div className="flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-stone-800 dark:text-slate-200">แหล่งอ้างอิง:</strong>
                    <div className="text-stone-600 dark:text-slate-400 mt-0.5">{paper.links}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tags row */}
            <div className="pt-3 border-t border-stone-200/60 dark:border-stone-800/60 flex flex-wrap gap-1.5">
              <span className="text-[11px] font-semibold text-stone-500 dark:text-slate-400 mr-1 self-center">
                คีย์เวิร์ดที่วิเคราะห์ได้:
              </span>
              {paper.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onClose();
                    onTagClick(tag);
                  }}
                  className="px-2.5 py-1 rounded-lg text-xs bg-stone-200/70 hover:bg-amber-100 text-stone-700 hover:text-amber-800 dark:bg-stone-800 dark:hover:bg-amber-950 dark:text-slate-300 dark:hover:text-amber-300 transition-colors"
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Markdown & KaTeX Main Content */}
          <div className="pt-2">
            <KatexRenderer content={paper.content} />
          </div>

          {/* Bottom Back Button */}
          <div className="pt-8 pb-4 border-t border-stone-200 dark:border-stone-800 flex justify-center">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-slate-200 font-semibold text-sm transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>ปิดหน้าต่างนี้และกลับสู่คลังวิจัย</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
