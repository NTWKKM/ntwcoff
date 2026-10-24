import React, { useMemo } from 'react';
import katex from 'katex';

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface KatexRendererProps {
  content?: string;
  html?: string;
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

const normalizeKatexMath = (math: string): string => {
  return math
    .trim()
    .replace(/\u2013/g, '-')
    .replace(/(?<!\\)%/g, '\\%');
};

export const renderKatexToken = (mathToken: string): string => {
  if (mathToken.startsWith('$$') && mathToken.endsWith('$$')) {
    const math = normalizeKatexMath(mathToken.slice(2, -2));
    try {
      return `<div class="katex-display-wrapper overflow-x-auto text-center">${katex.renderToString(
        math,
        { displayMode: true, throwOnError: false }
      )}</div>`;
    } catch {
      return escapeHtml(math);
    }
  }

  if (mathToken.startsWith('$') && mathToken.endsWith('$')) {
    const math = normalizeKatexMath(mathToken.slice(1, -1));
    try {
      return katex.renderToString(math, {
        displayMode: false,
        throwOnError: false,
      });
    } catch {
      return escapeHtml(math);
    }
  }

  return escapeHtml(mathToken);
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

const formatNonMathSegment = (raw: string, applyParams: boolean): string => {
  let text = escapeHtml(raw);
  if (applyParams) {
    text = formatParameters(text);
  }
  // Bold (**...**)
  text = text.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-semibold text-cocoa-ink">$1</strong>'
  );
  // Italic (*...*) — strictly bounded so scientific notation like L*a*b* or 6-311G** is untouched
  text = text.replace(
    /(?<![\w*])\*([^\s*](?:[^*]*[^\s*])?)\*(?![\w*])/g,
    '<em class="italic text-charcoal/80">$1</em>'
  );
  return text;
};

export const formatInlineMarkdown = (raw: string, applyParams = false): string => {
  if (!raw) return '';
  const parts: string[] = [];
  let lastIndex = 0;
  const mathRegex = /(\$\$[\s\S]+?\$\$|\$[^\$\n]+?\$)/g;
  let match: RegExpExecArray | null;

  while ((match = mathRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      parts.push(formatNonMathSegment(raw.slice(lastIndex, match.index), applyParams));
    }
    parts.push(renderKatexToken(match[0]));
    lastIndex = mathRegex.lastIndex;
  }

  if (lastIndex < raw.length) {
    parts.push(formatNonMathSegment(raw.slice(lastIndex), applyParams));
  }

  return parts.join('');
};

const cleanTocTitle = (rawHeading: string): string => {
  return rawHeading
    .replace(/\$([^\$\n]+?)\$/g, (_, math: string) =>
      math
        .replace(/\\times/g, '×')
        .replace(/\\approx/g, '≈')
        .replace(/\\le|\\leq/g, '≤')
        .replace(/\\ge|\\geq/g, '≥')
        .replace(/\\pm/g, '±')
        .replace(/\^2\b/g, '²')
        .replace(/\^3\b/g, '³')
        .replace(/\\text\{([^}]*)\}/g, '$1')
        .replace(/[\\%{}]/g, (m) => (m === '\\%' ? '%' : ''))
        .trim()
    )
    .replace(/[*_`#]/g, '')
    .trim();
};

const slugifyHeading = (
  rawText: string,
  counts: Map<string, number>,
  assigned: Set<string>
): string => {
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

  let count = counts.get(baseId) || 0;
  let candidate = count === 0 ? baseId : `${baseId}-${count}`;

  while (assigned.has(candidate)) {
    count++;
    candidate = `${baseId}-${count}`;
  }
  assigned.add(candidate);
  counts.set(baseId, count + 1);
  return candidate;
};

export const parsePaperMarkdown = (
  content: string
): { html: string; toc: TocItem[] } => {
  if (!content) return { html: '', toc: [] };

  const lines = content.split('\n');
  const processedLines: string[] = [];
  const toc: TocItem[] = [];
  const counts = new Map<string, number>();
  const assigned = new Set<string>();

  let tableBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;
  let listBuffer: string[] = [];

  const flushList = () => {
    if (!listType || listBuffer.length === 0) return;
    const listClass =
      listType === 'ul'
        ? 'ml-5 list-disc my-3 space-y-1.5 text-charcoal font-geist leading-relaxed'
        : 'ml-5 list-decimal my-3 space-y-1.5 text-charcoal font-geist leading-relaxed';
    processedLines.push(
      `<${listType} class="${listClass}">${listBuffer.join('')}</${listType}>`
    );
    listBuffer = [];
    listType = null;
  };

  const flushTable = () => {
    if (tableBuffer.length === 0) return;

    const rows = tableBuffer.map((line) =>
      line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim())
    );

    if (rows.length >= 2) {
      const header = rows[0];
      const dataRows = rows
        .slice(1)
        .filter((r) => !r.every((c) => /^:?-+:?$/.test(c)));

      let tableHtml = `<div class="markdown-table-wrapper"><table class="markdown-table"><thead><tr>`;
      header.forEach((h) => {
        tableHtml += `<th>${formatInlineMarkdown(h)}</th>`;
      });
      tableHtml += `</tr></thead><tbody>`;
      dataRows.forEach((row) => {
        tableHtml += `<tr>`;
        row.forEach((cell, idx) => {
          const isLabel = idx === 0 && row.length === 2;
          tableHtml += `<td class="${isLabel ? 'markdown-table-label' : ''}">${formatInlineMarkdown(cell, true)}</td>`;
        });
        tableHtml += `</tr>`;
      });
      tableHtml += `</tbody></table></div>`;
      processedLines.push(tableHtml);
    }
    tableBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const indent = line.match(/^(\s*)/)?.[1].length ?? 0;
    const isSubItem = indent >= 2;

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      tableBuffer.push(trimmed);
      continue;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    // Bullet list items
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      if (listType !== 'ul') {
        flushList();
        listType = 'ul';
      }
      const text = trimmed.replace(/^[\*\-]\s+/, '');
      const itemClass = isSubItem ? ' class="ml-5 list-[circle]"' : '';
      listBuffer.push(`<li${itemClass}>${formatInlineMarkdown(text, true)}</li>`);
      continue;
    }

    // Numbered list items
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      const [, numStr, text] = numMatch;
      // Keep indented numbered sub-items nested inside an active bullet list
      if (isSubItem && listType === 'ul') {
        listBuffer.push(
          `<li class="ml-5 list-none"><span class="font-mono text-[13px] font-medium text-cocoa-ink mr-1.5 tabular-nums">${numStr}.</span>${formatInlineMarkdown(text, true)}</li>`
        );
        continue;
      }
      if (listType !== 'ol') {
        flushList();
        listType = 'ol';
      }
      listBuffer.push(`<li>${formatInlineMarkdown(text, true)}</li>`);
      continue;
    }

    flushList();

    // Blockquotes
    if (trimmed.startsWith('>')) {
      const quoteText = trimmed.replace(/^>\s?/, '');
      processedLines.push(
        `<blockquote class="markdown-blockquote font-geist">${formatInlineMarkdown(quoteText, true)}</blockquote>`
      );
      continue;
    }

    // Headings
    if (line.startsWith('### ')) {
      const headingText = line.replace('### ', '').trim();
      const id = slugifyHeading(headingText, counts, assigned);
      toc.push({ id, title: cleanTocTitle(headingText), level: 3 });
      processedLines.push(
        `<h3 id="${id}" class="text-base sm:text-[17px] font-gelica font-semibold lowercase mt-8 mb-2.5 text-cocoa-ink scroll-mt-24">${formatInlineMarkdown(
          headingText
        )}</h3>`
      );
    } else if (line.startsWith('## ')) {
      const headingText = line.replace('## ', '').trim();
      const id = slugifyHeading(headingText, counts, assigned);
      const sectionMatch = headingText.match(/^([1-9])\.\s*(.+)$/);

      if (sectionMatch) {
        const secNum = `0${sectionMatch[1]}.`;
        const secTitle = sectionMatch[2];
        toc.push({
          id,
          title: `${secNum} ${cleanTocTitle(secTitle)}`,
          level: 2,
        });
        processedLines.push(
          `<h2 id="${id}" class="text-xl sm:text-[22px] font-gelica font-semibold lowercase mt-11 mb-4 pb-2.5 border-b border-charcoal/12 text-cocoa-ink scroll-mt-24 flex items-baseline gap-2.5">
            <span class="font-mono text-[13px] font-medium text-marker-orange tabular-nums shrink-0">${secNum}</span>
            <span>${formatInlineMarkdown(secTitle)}</span>
          </h2>`
        );
      } else {
        toc.push({ id, title: cleanTocTitle(headingText), level: 2 });
        processedLines.push(
          `<h2 id="${id}" class="text-xl sm:text-[22px] font-gelica font-semibold lowercase mt-11 mb-4 pb-2.5 border-b border-charcoal/12 text-cocoa-ink scroll-mt-24"><span>${formatInlineMarkdown(
            headingText
          )}</span></h2>`
        );
      }
    } else if (line.startsWith('# ')) {
      const headingText = line.replace('# ', '');
      processedLines.push(
        `<h1 class="text-2xl sm:text-3xl font-gelica font-semibold lowercase mt-5 mb-6 text-cocoa-ink">${formatInlineMarkdown(
          headingText
        )}</h1>`
      );
    } else if (line.startsWith('---')) {
      processedLines.push(
        `<hr class="my-8 border-t-[1.5px] border-charcoal/15" />`
      );
    } else if (trimmed.length === 0) {
      processedLines.push(`<div class="h-2"></div>`);
    } else {
      processedLines.push(
        `<p class="my-4 text-charcoal font-geist text-pretty leading-relaxed">${formatInlineMarkdown(line, true)}</p>`
      );
    }
  }

  flushList();
  flushTable();

  return {
    html: processedLines.join('\n'),
    toc,
  };
};

export const KatexRenderer: React.FC<KatexRendererProps> = ({
  content,
  html,
  fontSize = 'md',
}) => {
  const renderedHtml = useMemo(() => {
    if (typeof html === 'string') return html;
    return parsePaperMarkdown(content || '').html;
  }, [content, html]);

  return (
    <div
      className={`prose-size-${fontSize} text-charcoal max-w-none font-geist`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
