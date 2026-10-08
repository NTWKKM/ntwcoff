import React, { useMemo } from 'react';
import katex from 'katex';

interface KatexRendererProps {
  content: string;
  fontSize?: 'sm' | 'md' | 'lg';
}

const escapeHtml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

export const renderWithKatex = (text: string): string => {
  if (!text) return '';

  // Render display math $$...$$
  let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return `<div class="katex-display-wrapper my-5 overflow-x-auto py-2 text-center">${katex.renderToString(
        math.trim(),
        { displayMode: true, throwOnError: false }
      )}</div>`;
    } catch {
      return escapeHtml(math);
    }
  });

  // Render inline math $...$
  result = result.replace(/\$([^\$\n]+?)\$/g, (_, math) => {
    try {
      return katex.renderToString(math.trim(), {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return escapeHtml(math);
    }
  });

  return result;
};

export const escapeSourceText = (text: string): string => {
  const parts: string[] = [];
  let lastIndex = 0;
  const regex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    parts.push(escapeHtml(text.slice(lastIndex, match.index)));
    parts.push(match[0]);
    lastIndex = regex.lastIndex;
  }
  parts.push(escapeHtml(text.slice(lastIndex)));
  return parts.join('');
};

export const slugifyHeading = (rawText: string, existingCounts?: Map<string, number>): string => {
  // Strip markdown formatting (*, _, $, `) before slugifying so math or formatting produces clean slugs
  const clean = rawText
    .replace(/\$\$[\s\S]+?\$\$/g, '')
    .replace(/\$[^\$\n]+?\$/g, '')
    .replace(/[*_`#]/g, '')
    .trim();
  let baseId = clean
    .replace(/[^\w\u0E00-\u0E7F]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
  if (!baseId) baseId = 'section';

  if (!existingCounts) return baseId;

  const count = existingCounts.get(baseId) || 0;
  existingCounts.set(baseId, count + 1);
  return count === 0 ? baseId : `${baseId}-${count}`;
};

export const KatexRenderer: React.FC<KatexRendererProps> = ({
  content,
  fontSize = 'md',
}) => {
  const textSizeClass = useMemo(() => {
    if (fontSize === 'sm') return 'text-[15px] leading-[1.75]';
    if (fontSize === 'lg') return 'text-[19px] leading-[1.85]';
    return 'text-[17px] leading-[1.8]'; // standard 'md'
  }, [fontSize]);

  const renderedHtml = useMemo(() => {
    const lines = content.split('\n');
    const processedLines: string[] = [];
    const headingCounts = new Map<string, number>();
    let inTable = false;
    let tableBuffer: string[] = [];

    const flushTable = () => {
      if (tableBuffer.length === 0) return;
      
      const rows = tableBuffer.map((line) => {
        const cols = line
          .split('|')
          .slice(1, -1)
          .map((c) => c.trim());
        return cols;
      });

      if (rows.length >= 2) {
        const header = rows[0];
        const dataRows = rows.slice(1).filter((r) => !r.every((c) => c.match(/^:?-+:?$/)));

        let tableHtml = `<div class="markdown-table-wrapper"><table class="markdown-table">`;
        tableHtml += `<thead><tr>`;
        header.forEach((h) => {
          let formatted = escapeSourceText(h);
          formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
          formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
          tableHtml += `<th>${renderWithKatex(formatted)}</th>`;
        });
        tableHtml += `</tr></thead><tbody>`;
        dataRows.forEach((row) => {
          tableHtml += `<tr>`;
          row.forEach((cell, idx) => {
            const isLabel = idx === 0 && row.length === 2;
            let formatted = escapeSourceText(cell);
            formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
            formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
            tableHtml += `<td class="${isLabel ? 'markdown-table-label' : ''}">${renderWithKatex(formatted)}</td>`;
          });
          tableHtml += `</tr>`;
        });
        tableHtml += `</tbody></table></div>`;
        processedLines.push(tableHtml);
      }
      tableBuffer = [];
      inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table detection
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        inTable = true;
        tableBuffer.push(line.trim());
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Blockquotes
      if (line.trim().startsWith('>')) {
        const quoteText = line.trim().replace(/^>\s?/, '');
        let formatted = escapeSourceText(quoteText);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
        processedLines.push(
          `<blockquote class="markdown-blockquote font-geist ${textSizeClass}">${renderWithKatex(formatted)}</blockquote>`
        );
        continue;
      }

      // Headings — gelica 600, Cocoa Ink, lowercase
      if (line.startsWith('### ')) {
        const headingText = line.replace('### ', '').trim();
        const id = slugifyHeading(headingText, headingCounts);
        processedLines.push(
          `<h3 id="${id}" class="text-lg sm:text-xl font-gelica font-semibold lowercase mt-9 mb-3 text-cocoa-ink scroll-mt-24 flex items-center gap-2">${renderWithKatex(
            escapeSourceText(headingText)
          )}</h3>`
        );
      } else if (line.startsWith('## ')) {
        const headingText = line.replace('## ', '').trim();
        const id = slugifyHeading(headingText, headingCounts);
        processedLines.push(
          `<h2 id="${id}" class="text-xl sm:text-2xl font-gelica font-semibold lowercase mt-12 mb-4 pb-2 border-b-[1.5px] border-charcoal/20 text-cocoa-ink scroll-mt-24"><span>${renderWithKatex(
            escapeSourceText(headingText)
          )}</span></h2>`
        );
      } else if (line.startsWith('# ')) {
        const headingText = line.replace('# ', '');
        processedLines.push(
          `<h1 class="text-2xl sm:text-3xl font-gelica font-semibold lowercase mt-5 mb-6 text-cocoa-ink">${renderWithKatex(
            escapeSourceText(headingText)
          )}</h1>`
        );
      } else if (line.startsWith('---')) {
        processedLines.push(
          `<hr class="my-8 border-t-[1.5px] border-charcoal/15" />`
        );
      } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        // Bullet points
        const text = line.trim().replace(/^[\*\-]\s+/, '');
        let formatted = escapeSourceText(text);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
        processedLines.push(
          `<li class="ml-5 list-disc my-1.5 text-charcoal font-geist ${textSizeClass}">${renderWithKatex(
            formatted
          )}</li>`
        );
      } else if (/^\d+\.\s/.test(line.trim())) {
        // Numbered list
        const text = line.trim().replace(/^\d+\.\s/, '');
        let formatted = escapeSourceText(text);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
        processedLines.push(
          `<li class="ml-5 list-decimal my-1.5 text-charcoal font-geist ${textSizeClass}">${renderWithKatex(
            formatted
          )}</li>`
        );
      } else if (line.trim().length === 0) {
        processedLines.push(`<div class="h-2"></div>`);
      } else {
        // Normal paragraph
        let formatted = escapeSourceText(line);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
        
        processedLines.push(
          `<p class="my-4 text-charcoal font-geist ${textSizeClass} text-pretty">${renderWithKatex(
            formatted
          )}</p>`
        );
      }
    }

    if (inTable) {
      flushTable();
    }

    return processedLines.join('\n');
  }, [content, textSizeClass]);

  return (
    <div
      className="prose-content text-charcoal max-w-none font-geist"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
