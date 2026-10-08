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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/30 backdrop-blur-md flex justify-center p-0 sm:p-4 md:p-6 animate-fadeIn">
      
      {/* Modal Dialog Card — 28px Gallery White Card, Shadowless */}
      <div className="bg-gallery-white text-ink w-full max-w-5xl rounded-none sm:rounded-[28px] border border-hairline-silver flex flex-col my-auto max-h-screen sm:max-h-[94vh] overflow-hidden shadow-none">
        
        {/* Sticky Editorial Header */}
        <header className="sticky top-0 z-20 px-6 py-3.5 bg-gallery-white/90 backdrop-blur-md border-b border-hairline-silver flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 text-[12px] font-normal text-ink px-3.5 py-1 rounded-full bg-transparent hover:bg-studio-mist border border-steel hover:border-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>ย้อนกลับ</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={copyCitation}
              className="flex items-center gap-1.5 text-[12px] font-normal px-3.5 py-1 rounded-full bg-transparent hover:bg-studio-mist text-ink border border-steel hover:border-ink transition-colors"
              title="คัดลอกรายการอ้างอิง (Citation)"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-apple-blue" /> : <Copy className="w-3.5 h-3.5 text-slate" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก Citation'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate hover:text-ink hover:bg-studio-mist transition-colors"
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
              <span className="inline-flex items-center text-[12px] font-medium text-slate font-sf-text">
                {paper.category}
              </span>

              {paper.date && (
                <span className="flex items-center gap-1 text-[12px] text-steel font-sf-text">
                  <Calendar className="w-3 h-3 text-steel" />
                  {paper.date}
                </span>
              )}

              <span className="flex items-center gap-1 text-[12px] text-steel font-sf-text">
                <Clock className="w-3 h-3 text-steel" />
                เวลาอ่าน {paper.readingTimeMinutes} นาที
              </span>
            </div>

            {/* Whisper-Weight Monograph Title */}
            <h1 className="text-3xl sm:text-4xl md:text-[40px] font-semibold tracking-[-0.8px] text-ink font-sf-display leading-[1.12] text-balance">
              {paper.title}
            </h1>

            {paper.documentHeader && (
              <p className="text-[12px] text-steel font-mono">
                เอกสารต้นฉบับ: {paper.documentHeader}
              </p>
            )}
          </div>

          {/* Research Specifications Card — Studio Mist Surface (24px Radius, shadowless) */}
          <div className="rounded-[24px] bg-studio-mist border border-hairline-silver p-6 sm:p-7 space-y-4 border-l-4 border-l-apple-blue shadow-none">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-ink font-sf-display flex items-center gap-2">
              ข้อมูลจำเพาะงานวิจัย (Research Specifications)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px] font-sf-text">
              {paper.authors && (
                <div className="flex items-start gap-2">
                  <GraduationCap className="w-4 h-4 text-apple-blue mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-ink font-medium">คณะผู้วิจัย:</strong>
                    <div className="text-slate mt-0.5">{paper.authors}</div>
                  </div>
                </div>
              )}

              {paper.institution && (
                <div className="flex items-start gap-2">
                  <Building className="w-4 h-4 text-apple-blue mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-ink font-medium">สถาบันวิจัย:</strong>
                    <div className="text-slate mt-0.5">{paper.institution}</div>
                  </div>
                </div>
              )}

              {paper.journal && (
                <div className="flex items-start gap-2">
                  <BookOpen className="w-4 h-4 text-slate mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-ink font-medium">วารสารวิชาการ:</strong>
                    <div className="text-slate mt-0.5">{paper.journal}</div>
                  </div>
                </div>
              )}

              {paper.links && (
                <div className="flex items-start gap-2">
                  <Share2 className="w-4 h-4 text-slate mt-0.5 shrink-0" />
                  <div>
                    <strong className="text-ink font-medium">แหล่งอ้างอิง:</strong>
                    <div className="text-apple-blue mt-0.5 break-all hover:underline">{paper.links}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Tags row with Hairline Pills */}
            <div className="pt-3 border-t border-hairline-silver flex flex-wrap items-center gap-1.5">
              <span className="text-[12px] text-steel font-sf-text mr-1">
                คีย์เวิร์ด:
              </span>
              {paper.tags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onClose();
                    onTagClick(tag);
                  }}
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-sf-text bg-gallery-white text-slate hover:text-apple-blue hover:border-steel border border-hairline-silver transition-colors"
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

          {/* Bottom Back Button — Pricing Blue Pill */}
          <div className="pt-8 pb-4 border-t border-hairline-silver flex justify-center">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-pricing-blue hover:bg-[#0077ed] active:bg-[#0062c4] text-white font-normal text-[12px] tracking-[-0.12px] transition-colors shadow-none"
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

