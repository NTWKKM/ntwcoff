import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Paper } from '../types';
import { KatexRenderer, slugifyHeading } from './KatexRenderer';
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
  List,
  Type,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface PaperReaderProps {
  paper: Paper | null;
  onClose: () => void;
  onTagClick: (tag: string) => void;
}

interface TocItem {
  id: string;
  title: string;
  level: number;
}

export const PaperReader: React.FC<PaperReaderProps> = ({
  paper,
  onClose,
  onTagClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [columnWidth, setColumnWidth] = useState<'focus' | 'standard' | 'wide'>('standard');
  const [showTocMobile, setShowTocMobile] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState<string>('');

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const modalContentRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Reset scroll and progress when paper changes
  useEffect(() => {
    if (paper?.id) {
      setScrollProgress(0);
      setActiveSection('');
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
    }
  }, [paper?.id]);

  // Extract Table of Contents (TOC) from Markdown headings with unique IDs
  const tocItems = useMemo<TocItem[]>(() => {
    if (!paper) return [];
    const items: TocItem[] = [];
    const headingCounts = new Map<string, number>();
    const lines = paper.content.split('\n');

    for (const line of lines) {
      if (line.startsWith('## ')) {
        const title = line.replace('## ', '').trim();
        const id = slugifyHeading(title, headingCounts);
        items.push({ id, title, level: 2 });
      } else if (line.startsWith('### ')) {
        const title = line.replace('### ', '').trim();
        const id = slugifyHeading(title, headingCounts);
        items.push({ id, title, level: 3 });
      }
    }
    return items;
  }, [paper]);

  // Track scroll progress and active section in reader
  const handleScroll = () => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight - el.clientHeight;
    if (scrollHeight > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100)));
    }

    // Determine active section for scroll-spy
    if (tocItems.length > 0) {
      for (let i = tocItems.length - 1; i >= 0; i--) {
        const sectionEl = document.getElementById(tocItems[i].id);
        if (sectionEl) {
          const rect = sectionEl.getBoundingClientRect();
          if (rect.top <= 180) {
            setActiveSection(tocItems[i].id);
            break;
          }
        }
      }
    }
  };

  if (!paper) return null;

  // Light-dismiss: Click outside modal content box closes the reader
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  const copyCitation = () => {
    const citation = `${paper.authors || 'Unknown'} (${paper.date || '2026'}). ${paper.title}. ${paper.journal || ''}.`;
    navigator.clipboard.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
      setShowTocMobile(false);
    }
  };

  // Determine prose column max-width for optimal reading measure
  const columnWidthClass =
    columnWidth === 'focus'
      ? 'max-w-[65ch]'
      : columnWidth === 'wide'
      ? 'max-w-[88ch]'
      : 'max-w-[72ch]';

  return (
    <div
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 overflow-y-auto bg-charcoal/45 backdrop-blur-sm flex justify-center p-0 sm:p-4 md:p-6 animate-fadeIn"
    >
      {/* Modal Dialog Card — Superr Schoolyard Notebook Canvas */}
      <div
        ref={modalContentRef}
        className="reader-modal-card bg-cream-paper text-charcoal w-full max-w-6xl rounded-none sm:rounded-[16px] border-[1.5px] border-charcoal flex flex-col my-auto max-h-screen sm:max-h-[94vh] overflow-hidden shadow-card relative"
      >
        {/* Native Scroll Progress Indicator in Marker Orange */}
        <div
          aria-hidden="true"
          style={{ width: `${scrollProgress}%` }}
          className="reading-progress-bar absolute top-0 left-0 h-[3px] bg-marker-orange z-30 transition-[width] duration-75 ease-out"
        />

        {/* Sticky Reader Toolbar */}
        <header className="sticky top-0 z-20 px-4 sm:px-6 py-2.5 bg-cream-paper/95 backdrop-blur-md border-b-[1.5px] border-charcoal/20 flex items-center justify-between gap-3">
          {/* Left Action: Return Button */}
          <button
            onClick={onClose}
            className="superr-pill-btn !py-1 !px-3 !text-[12px]"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-charcoal" />
            <span>ย้อนกลับ</span>
          </button>

          {/* Center Reading Controls: Font Size, Column Width, TOC Drawer */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Font Size Adjuster */}
            <div className="flex items-center rounded-[20px] bg-dew-drop border-[1.5px] border-charcoal/30 p-0.5 shadow-subtle">
              <button
                onClick={() => setFontSize('sm')}
                className={`px-2 py-0.5 rounded-[16px] text-[11px] font-gelica transition-all ${
                  fontSize === 'sm'
                    ? 'bg-charcoal text-cream-paper font-semibold'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
                title="ขนาดตัวอักษรเล็ก (15px)"
              >
                A-
              </button>
              <button
                onClick={() => setFontSize('md')}
                className={`px-2 py-0.5 rounded-[16px] text-[11px] font-gelica transition-all ${
                  fontSize === 'md'
                    ? 'bg-charcoal text-cream-paper font-semibold'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
                title="ขนาดตัวอักษรมาตรฐาน (17px)"
              >
                A
              </button>
              <button
                onClick={() => setFontSize('lg')}
                className={`px-2 py-0.5 rounded-[16px] text-[11px] font-gelica transition-all ${
                  fontSize === 'lg'
                    ? 'bg-charcoal text-cream-paper font-semibold'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
                title="ขนาดตัวอักษรใหญ่ (19px)"
              >
                A+
              </button>
            </div>

            {/* Reading Column Measure Adjuster */}
            <div className="hidden sm:flex items-center rounded-[20px] bg-dew-drop border-[1.5px] border-charcoal/30 p-0.5 shadow-subtle">
              <button
                onClick={() => setColumnWidth('focus')}
                className={`px-2.5 py-0.5 rounded-[16px] text-[11px] font-gelica transition-all ${
                  columnWidth === 'focus'
                    ? 'bg-charcoal text-cream-paper font-semibold'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
                title="คอลัมน์โฟกัส (65 ตัวอักษร/บรรทัด)"
              >
                focus
              </button>
              <button
                onClick={() => setColumnWidth('standard')}
                className={`px-2.5 py-0.5 rounded-[16px] text-[11px] font-gelica transition-all ${
                  columnWidth === 'standard'
                    ? 'bg-charcoal text-cream-paper font-semibold'
                    : 'text-charcoal/70 hover:text-charcoal'
                }`}
                title="คอลัมน์มาตรฐาน (72 ตัวอักษร/บรรทัด)"
              >
                standard
              </button>
            </div>

            {/* Mobile TOC Drawer Toggle */}
            {tocItems.length > 0 && (
              <button
                onClick={() => setShowTocMobile(!showTocMobile)}
                className="lg:hidden superr-pill-btn !py-1 !px-2.5 !text-[12px]"
                title="สารบัญงานวิจัย (Table of Contents)"
              >
                <List className="w-3.5 h-3.5 text-charcoal" />
                <span className="hidden xs:inline">สารบัญ</span>
              </button>
            )}
          </div>

          {/* Right Action: Copy Citation & Close */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={copyCitation}
              className="superr-pill-btn !py-1 !px-3 !text-[12px]"
              title="คัดลอกรายการอ้างอิง (Citation)"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-marker-orange" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-charcoal" />
              )}
              <span className="hidden xs:inline">{copied ? 'คัดลอกแล้ว' : 'citation'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-[20px] text-charcoal/70 hover:text-charcoal hover:bg-dew-drop transition-colors"
              aria-label="Close reader"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Mobile TOC Drawer (Collapsible) */}
        {showTocMobile && tocItems.length > 0 && (
          <div className="lg:hidden bg-dew-drop border-b-[1.5px] border-charcoal p-4 max-h-60 overflow-y-auto animate-fadeIn">
            <div className="text-[13px] font-gelica font-semibold text-cocoa-ink mb-2">
              สารบัญเนื้อหาวิจัย:
            </div>
            <ul className="space-y-1.5 text-[13px] font-geist">
              {tocItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => scrollToHeading(item.id)}
                    className={`text-left w-full truncate transition-colors ${
                      item.level === 3 ? 'pl-3 text-[12px]' : ''
                    } ${
                      activeSection === item.id
                        ? 'text-marker-orange font-medium'
                        : 'text-charcoal/80 hover:text-cocoa-ink'
                    }`}
                  >
                    • {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main Content Area: Split Stage with Sticky TOC Sidebar on Large Screens */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="reader-scroll-container flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 py-8 space-y-8"
        >
          <div className="max-w-5xl mx-auto flex gap-10 items-start">
            
            {/* Primary Reading Article Column (Capped Measure for Optimal Ergonomics) */}
            <article className={`flex-1 mx-auto w-full ${columnWidthClass}`}>
              
              {/* Monograph Header */}
              <div className="space-y-3.5 pb-6 border-b-[1.5px] border-charcoal/15">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-0.5 rounded-[20px] bg-dew-drop border-[1.5px] border-charcoal/30 text-[12px] font-gelica text-charcoal">
                    {paper.category}
                  </span>

                  {paper.date && (
                    <span className="flex items-center gap-1 text-[12px] text-charcoal/70 font-geist">
                      <Calendar className="w-3.5 h-3.5 text-charcoal/50" />
                      {paper.date}
                    </span>
                  )}

                  <span className="flex items-center gap-1 text-[12px] text-charcoal/70 font-geist">
                    <Clock className="w-3.5 h-3.5 text-charcoal/50" />
                    เวลาอ่าน {paper.readingTimeMinutes} นาที
                  </span>
                </div>

                {/* Monograph Title: gelica 600 weight, Cocoa Ink, lowercase */}
                <h1 className="text-3xl sm:text-4xl md:text-[42px] font-gelica font-semibold lowercase leading-[1.12] text-cocoa-ink tracking-normal text-balance">
                  {paper.title}
                </h1>

                {paper.documentHeader && (
                  <p className="text-[12px] text-charcoal/60 font-mono">
                    ต้นฉบับ: {paper.documentHeader}
                  </p>
                )}
              </div>

              {/* Research Specifications Card — School Laminated Name Label in Dew Drop */}
              <div className="rounded-[12px] bg-dew-drop border-[1.5px] border-charcoal p-5 sm:p-6 my-6 border-l-4 border-l-marker-orange shadow-subtle">
                <h3 className="text-[13px] font-gelica font-semibold text-cocoa-ink flex items-center gap-2 mb-3">
                  ข้อมูลจำเพาะงานวิจัย (Research Specifications)
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px] font-geist">
                  {paper.authors && (
                    <div className="flex items-start gap-2">
                      <GraduationCap className="w-4 h-4 text-marker-orange mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-cocoa-ink font-medium">คณะผู้วิจัย:</strong>
                        <div className="text-charcoal/80 mt-0.5">{paper.authors}</div>
                      </div>
                    </div>
                  )}

                  {paper.institution && (
                    <div className="flex items-start gap-2">
                      <Building className="w-4 h-4 text-marker-orange mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-cocoa-ink font-medium">สถาบันวิจัย:</strong>
                        <div className="text-charcoal/80 mt-0.5">{paper.institution}</div>
                      </div>
                    </div>
                  )}

                  {paper.journal && (
                    <div className="flex items-start gap-2">
                      <BookOpen className="w-4 h-4 text-charcoal/60 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-cocoa-ink font-medium">วารสารวิชาการ:</strong>
                        <div className="text-charcoal/80 mt-0.5">{paper.journal}</div>
                      </div>
                    </div>
                  )}

                  {paper.links && (
                    <div className="flex items-start gap-2">
                      <Share2 className="w-4 h-4 text-charcoal/60 mt-0.5 shrink-0" />
                      <div>
                        <strong className="text-cocoa-ink font-medium">แหล่งอ้างอิง:</strong>
                        <div className="text-burnt-sienna mt-0.5 break-all hover:underline">{paper.links}</div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Keywords row with 20px pills */}
                <div className="pt-3 mt-3 border-t-[1.5px] border-charcoal/15 flex flex-wrap items-center gap-1.5">
                  <span className="text-[12px] font-gelica text-charcoal/70 mr-1">
                    คีย์เวิร์ด:
                  </span>
                  {paper.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        onClose();
                        onTagClick(tag);
                      }}
                      className="px-2.5 py-0.5 rounded-[20px] text-[11px] font-geist bg-cream-paper text-charcoal hover:bg-dew-drop border-[1.5px] border-charcoal/30 transition-colors shadow-subtle"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Markdown & KaTeX Main Content */}
              <div className="pt-2">
                <KatexRenderer content={paper.content} fontSize={fontSize} />
              </div>

              {/* Bottom Return Button — Superr Pill Action Button */}
              <div className="pt-10 pb-6 border-t-[1.5px] border-charcoal/15 flex justify-center">
                <button
                  onClick={onClose}
                  className="superr-pill-btn !py-2.5 !px-6 !text-[14px]"
                >
                  <ArrowLeft className="w-4 h-4 text-charcoal" />
                  <span>ปิดหน้าต่างนี้และกลับสู่คลังวิจัย</span>
                </button>
              </div>

            </article>

            {/* Sticky Table of Contents Sidebar (Desktop Screens) */}
            {tocItems.length > 0 && (
              <aside className="hidden lg:block w-64 shrink-0 sticky top-4 self-start rounded-[12px] bg-dew-drop border-[1.5px] border-charcoal p-4 shadow-subtle">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b-[1.5px] border-charcoal/15">
                  <List className="w-4 h-4 text-marker-orange" />
                  <span className="text-[13px] font-gelica font-semibold text-cocoa-ink lowercase">
                    สารบัญเนื้อหา
                  </span>
                </div>

                <nav className="max-h-[60vh] overflow-y-auto space-y-1.5 pr-1 text-[13px] font-geist">
                  {tocItems.map((item) => {
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => scrollToHeading(item.id)}
                        className={`text-left w-full block transition-all rounded-[6px] px-2 py-1 ${
                          item.level === 3 ? 'pl-4 text-[12px]' : ''
                        } ${
                          isActive
                            ? 'bg-cream-paper text-marker-orange font-semibold border-l-2 border-l-marker-orange shadow-subtle'
                            : 'text-charcoal/70 hover:text-cocoa-ink hover:bg-cream-paper/50'
                        }`}
                      >
                        <span className="truncate block">{item.title}</span>
                      </button>
                    );
                  })}
                </nav>
              </aside>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};
