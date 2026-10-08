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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 backdrop-blur-sm flex justify-center p-0 sm:p-4 md:p-6 animate-fadeIn">
      
      {/* Modal Dialog Card — 24px Large Feature Card Radius */}
      <div className="bg-eggshell text-ink w-full max-w-5xl rounded-none sm:rounded-[24px] shadow-2xl border border-stone flex flex-col my-auto max-h-screen sm:max-h-[94vh] overflow-hidden">
        
        {/* Sticky Editorial Header */}
        <header className="sticky top-0 z-20 px-6 py-3.5 bg-eggshell/95 backdrop-blur-sm border-b border-stone flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-xs font-medium text-ink px-3.5 py-1.5 rounded-full bg-eggshell hover:bg-warm-taupe border border-[#e5e5e5] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ย้อนกลับ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCitation}
              className="flex items-center gap-1.5 text-xs font-medium px-3.5 py-1.5 rounded-full bg-eggshell hover:bg-warm-taupe text-ink border border-[#e5e5e5] transition-colors"
              title="คัดลอกรายการอ้างอิง (Citation)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-graphite" /> : <Copy className="w-3.5 h-3.5 text-smoke" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก Citation'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-smoke hover:text-ink hover:bg-warm-taupe transition-colors"
              aria-label="Close reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Scrollable Reader Content */}
        <div className="overflow-y-auto px-6 sm:px-10 md:px-14 py-8 sm:py-10 space-y-8">
          
          {/* Article Header */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-warm-taupe text-graphite border border-stone">
                <span className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-spark to-ember-orange" />
                {paper.category}
              </span>

              {paper.date && (
                <span className="flex items-center gap-1 text-xs text-ash font-mono">
                  <Calendar className="w-3 h-3 text-ash" />
                  {paper.date}
                </span>
              )}

              <span className="flex items-center gap-1 text-xs text-ash font-mono">
                <Clock className="w-3 h-3 text-ash" />
                เวลาอ่าน {paper.readingTimeMinutes} นาที
              </span>
            </div>

            {/* Whisper-Weight 300 Monograph Title */}
            <h1 className="text-3xl sm:text-4xl md:text-[40px] font-light tracking-whisper text-ink font-waldenburg leading-[1.12] text-balance">
              {paper.title}
            </h1>

            {paper.documentHeader && (
              <p className="text-xs text-ash font-mono">
                เอกสารต้นฉบับ: {paper.documentHeader}
              </p>
            )}
          </div>

          {/* Research Specifications Card — Warm Taupe Surface (20px Radius) */}
          <div className="rounded-[20px] bg-warm-taupe border border-stone p-6 space-y-4 border-l-4 border-l-violet-spark">
            <h3 className="text-xs font-medium uppercase tracking-wider text-graphite font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-spark to-ember-orange" />
              ข้อมูลจำเพาะงานวิจัย (Research Specifications)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              {paper.authors && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-violet-spark mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-graphite font-medium">คณะผู้วิจัย:</strong>
                    <div className="text-smoke mt-0.5">{paper.authors}</div>
                  </div>
                </div>
              )}

              {paper.institution && (
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-violet-spark mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-graphite font-medium">สถาบันวิจัย:</strong>
                    <div className="text-smoke mt-0.5">{paper.institution}</div>
                  </div>
                </div>
              )}

              {paper.journal && (
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-ember-orange mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-graphite font-medium">วารสารวิชาการ:</strong>
                    <div className="text-smoke mt-0.5">{paper.journal}</div>
                  </div>
                </div>
              )}

              {paper.links && (
                <div className="flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-ember-orange mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-graphite font-medium">แหล่งอ้างอิง:</strong>
                    <div className="text-smoke mt-0.5 break-all">{paper.links}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tags row with Spark Highlights */}
            <div className="pt-3 border-t border-stone flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-ash font-sans mr-1">
                คีย์เวิร์ด:
              </span>
              {paper.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onClose();
                    onTagClick(tag);
                  }}
                  className="px-2.5 py-0.5 rounded-full text-xs font-sans bg-eggshell text-smoke hover:text-violet-spark hover:border-violet-spark/40 hover:bg-stone/30 border border-[#e5e5e5] transition-colors"
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

          {/* Bottom Back Button — Filled Pill Button with Spark Gradient */}
          <div className="pt-8 pb-4 border-t border-stone flex justify-center">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-violet-spark to-ember-orange hover:opacity-90 text-white font-medium text-xs shadow-sm shadow-violet-spark/20 hover:shadow-md hover:shadow-ember-orange/20 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>ปิดหน้าต่างนี้และกลับสู่คลังวิจัย</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

