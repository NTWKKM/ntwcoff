import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Paper } from '../types';
import {
  KatexRenderer,
  parsePaperMarkdown,
} from './KatexRenderer';
import {
  X,
  ArrowLeft,
  Copy,
  Check,
  List,
} from 'lucide-react';

interface PaperReaderProps {
  paper: Paper | null;
  onClose: () => void;
  onTagClick: (tag: string) => void;
}

const closedByAttr: React.DialogHTMLAttributes<HTMLDialogElement> = {
  closedby: 'any',
};

const cleanTrailingPunctuation = (rawToken: string): string => {
  let token = rawToken;

  while (token.length > 0) {
    const lastChar = token[token.length - 1];

    if (/[.,;:!?]/.test(lastChar)) {
      token = token.slice(0, -1);
      continue;
    }

    if (lastChar === ')') {
      const openCount = (token.match(/\(/g) || []).length;
      const closeCount = (token.match(/\)/g) || []).length;
      if (closeCount > openCount) {
        token = token.slice(0, -1);
        continue;
      }
    }

    if (lastChar === ']') {
      const openCount = (token.match(/\[/g) || []).length;
      const closeCount = (token.match(/\]/g) || []).length;
      if (closeCount > openCount) {
        token = token.slice(0, -1);
        continue;
      }
    }

    break;
  }

  return token;
};

const renderSourceLinks = (linksText: string): React.ReactNode => {
  // Match DOIs (10.xxxx/...), PMCID (PMC...), PMID, or direct https:// URLs
  const tokenRegex =
    /(https?:\/\/[^\s]+|10\.\d{4,9}\/[-._;()/:A-Za-z0-9<>]+|PMC\d+|PMID:\s*\d+)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(linksText)) !== null) {
    if (match.index > lastIndex) {
      parts.push(linksText.slice(lastIndex, match.index));
    }
    const rawToken = match[0];
    const cleanToken = cleanTrailingPunctuation(rawToken);
    const trailing = rawToken.slice(cleanToken.length);

    let href = cleanToken;
    if (cleanToken.startsWith('10.')) {
      href = `https://doi.org/${cleanToken}`;
    } else if (cleanToken.startsWith('PMC')) {
      href = `https://pmc.ncbi.nlm.nih.gov/articles/${cleanToken}/`;
    } else if (cleanToken.startsWith('PMID:')) {
      const pmid = cleanToken.replace(/^PMID:\s*/, '');
      href = `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`;
    }

    parts.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-burnt-sienna hover:text-marker-orange underline underline-offset-2 transition-colors"
      >
        {cleanToken}
      </a>
    );
    if (trailing) {
      parts.push(trailing);
    }
    lastIndex = tokenRegex.lastIndex;
  }

  if (lastIndex < linksText.length) {
    parts.push(linksText.slice(lastIndex));
  }

  return parts;
};

export const PaperReader: React.FC<PaperReaderProps> = ({
  paper,
  onClose,
  onTagClick,
}) => {
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg'>('md');
  const [columnWidth, setColumnWidth] = useState<'focus' | 'standard'>('standard');
  const [showTocMobile, setShowTocMobile] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('');

  const dialogRef = useRef<HTMLDialogElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (paper) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
    }
  }, [paper]);

  useEffect(() => {
    if (paper?.id) {
      setActiveSection('');
      setShowTocMobile(false);
      setCopied(false);
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = 'scaleX(0)';
      }
    }
  }, [paper?.id]);

  // Single-pass compilation of both HTML body and TOC items
  const { html: renderedHtml, toc: tocItems } = useMemo(
    () => parsePaperMarkdown(paper?.content || ''),
    [paper?.content]
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !paper || tocItems.length === 0) return;

    const topOffsetPx = Math.round(container.clientHeight * 0.05);
    const bottomOffsetPx = Math.round(container.clientHeight * 0.65);

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: container,
        rootMargin: `-${topOffsetPx}px 0px -${bottomOffsetPx}px 0px`,
        threshold: [0, 0.5, 1.0],
      }
    );

    tocItems.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [tocItems, paper?.id]);

  const handleScroll = () => {
    const el = scrollContainerRef.current;
    const bar = progressBarRef.current;
    if (!el || !bar) return;

    const maxScroll = el.scrollHeight - el.clientHeight;
    const ratio = maxScroll > 0 ? Math.min(1, Math.max(0, el.scrollTop / maxScroll)) : 0;
    bar.style.transform = `scaleX(${ratio})`;
  };

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const dialog = dialogRef.current;
      if (!dialog || e.target !== dialog) return;

      const rect = dialog.getBoundingClientRect();
      const isInside =
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width;

      if (!isInside) {
        onClose();
      }
    }
  };

  const copyCitation = () => {
    if (!paper || !navigator.clipboard) return;
    const citation = `${paper.authors || 'Unknown'} (${paper.publishedYear || 'n.d.'}). ${paper.title}. ${paper.journal || ''}.`;
    navigator.clipboard
      .writeText(citation)
      .then(() => {
        setCopied(true);
        if (copyTimeoutRef.current !== null) {
          window.clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = window.setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Ignore clipboard permission errors in restricted contexts
      });
  };

  const scrollToHeading = (id: string) => {
    const target = document.getElementById(id);
    if (target) {
      const prefersReducedMotion =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({
        behavior: prefersReducedMotion ? 'auto' : 'smooth',
        block: 'start',
      });
      setActiveSection(id);
      setShowTocMobile(false);
    }
  };

  const columnWidthClass =
    columnWidth === 'focus' ? 'max-w-[64ch]' : 'max-w-[70ch]';

  return (
    <dialog
      ref={dialogRef}
      onClick={handleDialogClick}
      onCancel={handleCancel}
      {...closedByAttr}
      className="reader-dialog animate-fadeIn"
      aria-labelledby={paper ? 'reader-dialog-title' : undefined}
    >
      {paper && (
        <div className="bg-cream-paper text-charcoal w-full rounded-none sm:rounded-[12px] border border-charcoal/20 flex flex-col max-h-screen sm:max-h-[92vh] overflow-hidden shadow-card relative">
          {/* Thin Scroll Progress Bar (Direct DOM transform — zero React re-renders) */}
          <div
            ref={progressBarRef}
            aria-hidden="true"
            style={{ transform: 'scaleX(0)' }}
            className="absolute top-0 left-0 w-full h-[2px] bg-marker-orange z-30 origin-left transition-transform duration-75 ease-out motion-reduce:transition-none"
          />

          {/* Sticky Reader Toolbar */}
          <header className="sticky top-0 z-20 px-4 sm:px-6 py-2.5 bg-cream-paper/95 backdrop-blur-md border-b border-charcoal/12 flex items-center justify-between gap-3">
            <button
              onClick={onClose}
              className="superr-pill-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-charcoal" />
              <span>Back</span>
            </button>

            {/* Center Reading Controls */}
            <div className="flex items-center gap-2">
              <div className="flex items-center rounded-[8px] bg-dew-drop border border-charcoal/15 p-0.5" role="group" aria-label="Font size">
                {(['sm', 'md', 'lg'] as const).map((sz, i) => {
                  const sizeLabels = {
                    sm: 'Small text size',
                    md: 'Default text size',
                    lg: 'Large text size',
                  };
                  return (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setFontSize(sz)}
                      aria-label={sizeLabels[sz]}
                      aria-pressed={fontSize === sz}
                      className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-geist transition-colors whitespace-nowrap shrink-0 ${
                        fontSize === sz
                          ? 'bg-cream-paper text-cocoa-ink font-semibold shadow-sm'
                          : 'text-charcoal/65 hover:text-charcoal'
                      }`}
                    >
                      {i === 0 ? 'A-' : i === 1 ? 'A' : 'A+'}
                    </button>
                  );
                })}
              </div>

              <div className="hidden sm:flex items-center rounded-[8px] bg-dew-drop border border-charcoal/15 p-0.5" role="group" aria-label="Reading width">
                {(['focus', 'standard'] as const).map((mode) => {
                  const widthLabels = {
                    focus: 'Focus column width (64ch)',
                    standard: 'Standard column width (70ch)',
                  };
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setColumnWidth(mode)}
                      aria-label={widthLabels[mode]}
                      aria-pressed={columnWidth === mode}
                      className={`px-2.5 py-0.5 rounded-[6px] text-[11px] font-geist transition-colors whitespace-nowrap shrink-0 capitalize ${
                        columnWidth === mode
                          ? 'bg-cream-paper text-cocoa-ink font-semibold shadow-sm'
                          : 'text-charcoal/65 hover:text-charcoal'
                      }`}
                    >
                      {mode}
                    </button>
                  );
                })}
              </div>

              {tocItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowTocMobile(!showTocMobile)}
                  aria-expanded={showTocMobile}
                  aria-label="Table of Contents"
                  className="lg:hidden superr-pill-btn"
                  title="Table of Contents"
                >
                  <List className="w-3.5 h-3.5 text-charcoal" />
                  <span className="hidden sm:inline">Contents</span>
                </button>
              )}
            </div>

            {/* Right Action: Copy Citation & Close */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={copyCitation}
                className="superr-pill-btn"
                title="Copy citation"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-marker-orange" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-charcoal" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copied' : 'Cite'}</span>
              </button>

              <button
                onClick={onClose}
                className="p-1.5 rounded-[8px] text-charcoal/60 hover:text-charcoal hover:bg-dew-drop transition-colors"
                aria-label="Close reader"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Mobile TOC Drawer */}
          {showTocMobile && tocItems.length > 0 && (
            <div className="lg:hidden bg-dew-drop border-b border-charcoal/15 p-4 max-h-60 overflow-y-auto animate-fadeIn">
              <div className="text-[12px] font-geist font-semibold text-charcoal/60 mb-2">
                Contents
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
                          : 'text-charcoal/75 hover:text-cocoa-ink'
                      }`}
                    >
                      {item.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Scrollable Monograph Area */}
          <div
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto px-6 sm:px-10 lg:px-12 py-8 sm:py-10"
          >
            <div className="max-w-5xl mx-auto flex gap-12 items-start">
              
              {/* Primary Reading Column */}
              <article className={`flex-1 mx-auto w-full ${columnWidthClass}`}>
                
                {/* Monograph Header — Clean Unboxed Metadata */}
                <div className="space-y-3 pb-6 border-b border-charcoal/12">
                  <div className="flex flex-wrap items-center gap-2 text-[12px] text-charcoal/60 font-geist tabular-nums">
                    <span className="text-burnt-sienna font-medium">{paper.category}</span>
                    {paper.publishedYear && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono">{paper.publishedYear}</span>
                      </>
                    )}
                    <span aria-hidden="true">·</span>
                    <span>{paper.readingTimeMinutes} min read</span>
                  </div>

                  <h1
                    id="reader-dialog-title"
                    className="text-2xl sm:text-4xl font-gelica font-semibold lowercase leading-[1.14] text-cocoa-ink tracking-tight text-balance"
                  >
                    {paper.title}
                  </h1>
                </div>

                {/* Archival Accession Metadata Grid */}
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 py-5 my-6 px-5 rounded-[8px] bg-dew-drop/70 border border-charcoal/12 text-[13px] font-geist">
                  {paper.authors && (
                    <div>
                      <dt className="text-[11px] text-charcoal/55 mb-0.5">Authors</dt>
                      <dd className="text-cocoa-ink font-medium">{paper.authors}</dd>
                    </div>
                  )}

                  {paper.journal && (
                    <div>
                      <dt className="text-[11px] text-charcoal/55 mb-0.5">Journal</dt>
                      <dd className="text-charcoal/85">{paper.journal}</dd>
                    </div>
                  )}

                  {paper.institution && (
                    <div>
                      <dt className="text-[11px] text-charcoal/55 mb-0.5">Institution</dt>
                      <dd className="text-charcoal/85">{paper.institution}</dd>
                    </div>
                  )}

                  {paper.publishedYear && (
                    <div>
                      <dt className="text-[11px] text-charcoal/55 mb-0.5">Published</dt>
                      <dd className="text-charcoal/85 font-mono tabular-nums">{paper.publishedYear}</dd>
                    </div>
                  )}

                  {paper.links && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] text-charcoal/55 mb-0.5">Source / Reference</dt>
                      <dd className="text-charcoal/85 break-words">{renderSourceLinks(paper.links)}</dd>
                    </div>
                  )}

                  {paper.tags.length > 0 && (
                    <div className="sm:col-span-2 pt-2.5 mt-1 border-t border-charcoal/10 flex flex-wrap items-center gap-x-2 gap-y-1">
                      <dt className="text-[11px] text-charcoal/55 mr-1">Keywords:</dt>
                      {paper.tags.map((tag, idx) => (
                        <React.Fragment key={tag}>
                          <dd>
                            <button
                              type="button"
                              onClick={() => {
                                onClose();
                                onTagClick(tag);
                              }}
                              className="text-[12px] text-charcoal/75 hover:text-marker-orange hover:underline underline-offset-2 transition-colors"
                            >
                              #{tag}
                            </button>
                          </dd>
                          {idx < paper.tags.length - 1 && (
                            <span className="text-charcoal/30" aria-hidden="true">·</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}
                </dl>

                {/* Markdown & KaTeX Main Content */}
                <div className="pt-2">
                  <KatexRenderer html={renderedHtml} fontSize={fontSize} />
                </div>

                {/* Bottom Return Control */}
                <div className="pt-10 pb-4 mt-10 border-t border-charcoal/12 flex justify-between items-center">
                  <button
                    onClick={onClose}
                    className="superr-pill-btn"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 text-charcoal" />
                    <span>Back to archive</span>
                  </button>

                  <span className="text-[12px] text-charcoal/50 font-mono tabular-nums">
                    {paper.wordCount.toLocaleString()} words
                  </span>
                </div>

              </article>

              {/* Minimal Sticky Table of Contents Rail (Desktop) */}
              {tocItems.length > 0 && (
                <aside className="hidden lg:block w-56 shrink-0 sticky top-4 self-start pl-5 border-l border-charcoal/12">
                  <div className="text-[11px] font-geist font-semibold text-charcoal/50 mb-2.5">
                    On this page
                  </div>

                  <nav className="max-h-[65vh] overflow-y-auto space-y-1 text-[12.5px] font-geist">
                    {tocItems.map((item) => {
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => scrollToHeading(item.id)}
                          className={`text-left w-full block transition-colors py-1 ${
                            item.level === 3 ? 'pl-3 text-[12px]' : ''
                          } ${
                            isActive
                              ? 'text-marker-orange font-medium'
                              : 'text-charcoal/60 hover:text-cocoa-ink'
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
      )}
    </dialog>
  );
};
