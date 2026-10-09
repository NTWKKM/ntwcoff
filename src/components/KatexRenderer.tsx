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

export const formatParameters = (text: string): string => {
  const thaiUnits =
    'ชั่วโมง|ชม\\.|นาที|วินาที|วัน|กรัม|กิโลกรัม|มก\\.|กก\\.|มล\\.|ลิตร|บาร์|ไมครอน|ซม\\.|มม\\.';
  const engUnits =
    '°\\s*[CF]|K|%|kHz|Hz|MHz|rpm|ppm|ppb|bar|psi|µm|μm|um|mm|cm|mL|ml|mg\\/[Ll]|mg|kg|g|dB|Agtron';
  const numPattern =
    '(?:[~≈≤≥±]|&lt;|&gt;|<|>)?\\s*\\d+(?:\\.\\d+)?(?:\\s*(?:[-–—~]|to|ถึง)\\s*\\d+(?:\\.\\d+)?)*';

  const paramRegex = new RegExp(
    `(?<![\\w\\u0E00-\\u0E7F])(${numPattern}\\s*(?:(?:${thaiUnits})|(?:(?:${engUnits})(?![a-zA-Z]))))`,
    'gu'
  );

  return text.replace(paramRegex, '<span class="param-badge">$1</span>');
};

export const escapeSourceText = (text: string, applyParams = false): string => {
  const parts: string[] = [];
  let lastIndex = 0;
  const regex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
  let match;
  while ((match = regex.exec(text)) !== null) {
    let nonMath = escapeHtml(text.slice(lastIndex, match.index));
    if (applyParams) {
      nonMath = formatParameters(nonMath);
    }
    parts.push(nonMath);
    parts.push(match[0]); // Preserve raw math blocks untouched
    lastIndex = regex.lastIndex;
  }
  let remaining = escapeHtml(text.slice(lastIndex));
  if (applyParams) {
    remaining = formatParameters(remaining);
  }
  parts.push(remaining);
  return parts.join('');
};

export interface HeadingTracker {
  counts: Map<string, number>;
  assigned: Set<string>;
}

export const createHeadingTracker = (): HeadingTracker => ({
  counts: new Map<string, number>(),
  assigned: new Set<string>(),
});

export const slugifyHeading = (
  rawText: string,
  tracker?: HeadingTracker | Map<string, number>
): string => {
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

  if (!tracker) return baseId;

  // Support both HeadingTracker and legacy Map<string, number> for backwards compatibility
  const isTracker = 'assigned' in tracker && 'counts' in tracker;
  const counts = isTracker ? tracker.counts : tracker;
  const assigned = isTracker ? tracker.assigned : undefined;

  let count = counts.get(baseId) || 0;
  let candidate = count === 0 ? baseId : `${baseId}-${count}`;

  if (assigned) {
    while (assigned.has(candidate)) {
      count++;
      candidate = `${baseId}-${count}`;
    }
    assigned.add(candidate);
  }

  counts.set(baseId, count + 1);
  return candidate;
};

export const cleanArticleContent = (content: string): string => {
  if (!content) return '';
  let cleaned = content.replace(/^\ufeff/, '');
  const m = cleaned.search(
    /(?:^|\n)\s*(?:##\s*)?1\.\s*(?:วัตถุประสงค์|บทนำ|ที่มา|ความสำคัญ|ภาพรวม|บทคัดย่อ|จุดประสงค์)[^\n]*/
  );
  if (m !== -1) {
    cleaned = cleaned.slice(m).trim();
  }
  // Remove mock signature / document metadata footer
  cleaned = cleaned.replace(
    /\n+(?:ลงชื่อผู้ตรวจสอบรายงาน|สถานที่จัดทำเอกสาร):[^\n]*/g,
    ''
  );
  // Standardize ## headings
  cleaned = cleaned.replace(
    /(?:^|\n)\s*(?:##\s*)?1\.\s*((?:วัตถุประสงค์|บทนำ|ที่มา|ความสำคัญ|ภาพรวม|บทคัดย่อ|จุดประสงค์)[^\n]*)/g,
    '\n\n## 1. $1\n\n'
  );
  cleaned = cleaned.replace(/(?:^|\n)\s*(?:##\s*)?2\.\s*(ระเบียบวิธี[^\n]*)/g, '\n\n## 2. $1\n\n');
  cleaned = cleaned.replace(/(?:^|\n)\s*(?:##\s*)?3\.\s*(ผลการค้นพบ[^\n]*)/g, '\n\n## 3. $1\n\n');
  cleaned = cleaned.replace(/(?:^|\n)\s*(?:##\s*)?4\.\s*(การนำไปประยุกต์[^\n]*)/g, '\n\n## 4. $1\n\n');
  cleaned = cleaned.replace(/(?:^|\n)\s*(?:###\s*)?(\d+\.\d+)\.?\s+([^\n]+)/g, '\n\n### $1 $2\n\n');
  return cleaned.replace(/\n{3,}/g, '\n\n').trim();
};

export const KatexRenderer: React.FC<KatexRendererProps> = ({
  content,
  fontSize = 'md',
}) => {
  const renderedHtml = useMemo(() => {
    const sanitized = cleanArticleContent(content);
    const lines = sanitized.split('\n');
    const processedLines: string[] = [];
    const tracker = createHeadingTracker();
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
            let formatted = escapeSourceText(cell, true);
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
        let formatted = escapeSourceText(quoteText, true);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
        processedLines.push(
          `<blockquote class="markdown-blockquote font-geist">${renderWithKatex(formatted)}</blockquote>`
        );
        continue;
      }

      // Headings — gelica 600, Cocoa Ink, lowercase
      if (line.startsWith('### ')) {
        const headingText = line.replace('### ', '').trim();
        const id = slugifyHeading(headingText, tracker);
        processedLines.push(
          `<h3 id="${id}" class="text-base sm:text-lg font-gelica font-semibold lowercase mt-8 mb-3 text-cocoa-ink scroll-mt-24 flex items-center gap-2.5">
            <span class="w-2 h-2 rounded-full bg-marker-orange shrink-0"></span>
            <span>${renderWithKatex(escapeSourceText(headingText))}</span>
          </h3>`
        );
      } else if (line.startsWith('## ')) {
        const headingText = line.replace('## ', '').trim();
        const id = slugifyHeading(headingText, tracker);
        const sectionMatch = headingText.match(/^([1-9])\.\s*(.+)$/);

        if (sectionMatch) {
          const secNum = '0' + sectionMatch[1];
          const secTitle = sectionMatch[2];
          const isKeyFindings = sectionMatch[1] === '3' || headingText.includes('ผลการค้นพบ');

          processedLines.push(
            `<h2 id="${id}" class="text-xl sm:text-2xl font-gelica font-semibold lowercase mt-12 mb-5 pb-3 border-b-[1.5px] border-charcoal/20 text-cocoa-ink scroll-mt-24 flex items-center justify-between gap-3 flex-wrap">
              <span class="flex items-center gap-3">
                <span class="section-number-badge">${secNum}</span>
                <span>${renderWithKatex(escapeSourceText(secTitle))}</span>
              </span>
              ${isKeyFindings ? `<span class="key-findings-badge">💡 ข้อค้นพบหลัก (Key Findings)</span>` : ''}
            </h2>`
          );
        } else {
          processedLines.push(
            `<h2 id="${id}" class="text-xl sm:text-2xl font-gelica font-semibold lowercase mt-12 mb-4 pb-2 border-b-[1.5px] border-charcoal/20 text-cocoa-ink scroll-mt-24"><span>${renderWithKatex(
              escapeSourceText(headingText)
            )}</span></h2>`
          );
        }
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
        let formatted = escapeSourceText(text, true);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
        processedLines.push(
          `<li class="ml-5 list-disc my-2 text-charcoal font-geist leading-relaxed">${renderWithKatex(
            formatted
          )}</li>`
        );
      } else if (/^\d+\.\s/.test(line.trim())) {
        // Numbered list
        const text = line.trim().replace(/^\d+\.\s/, '');
        let formatted = escapeSourceText(text, true);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
        processedLines.push(
          `<li class="ml-5 list-decimal my-2 text-charcoal font-geist leading-relaxed">${renderWithKatex(
            formatted
          )}</li>`
        );
      } else if (line.trim().length === 0) {
        processedLines.push(`<div class="h-2"></div>`);
      } else {
        // Normal paragraph
        let formatted = escapeSourceText(line, true);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-cocoa-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-charcoal/80">$1</em>');
        
        processedLines.push(
          `<p class="my-4 text-charcoal font-geist text-pretty leading-relaxed">${renderWithKatex(
            formatted
          )}</p>`
        );
      }
    }

    if (inTable) {
      flushTable();
    }

    return processedLines.join('\n');
  }, [content]);

  return (
    <div
      className={`prose-content prose-size-${fontSize} text-charcoal max-w-none font-geist`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
