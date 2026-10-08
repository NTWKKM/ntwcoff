import React, { useMemo } from 'react';
import katex from 'katex';

interface KatexRendererProps {
  content: string;
}

export const renderWithKatex = (text: string): string => {
  if (!text) return '';

  // Render display math $$...$$
  let result = text.replace(/\$\$([\s\S]+?)\$\$/g, (_, math) => {
    try {
      return `<div class="katex-display-wrapper my-4 overflow-x-auto py-2 text-center">${katex.renderToString(
        math.trim(),
        { displayMode: true, throwOnError: false }
      )}</div>`;
    } catch {
      return math;
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
      return math;
    }
  });

  return result;
};

export const KatexRenderer: React.FC<KatexRendererProps> = ({ content }) => {
  const renderedHtml = useMemo(() => {
    const lines = content.split('\n');
    const processedLines: string[] = [];
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
        // skip separator row if exists
        const dataRows = rows.slice(1).filter((r) => !r.every((c) => c.match(/^:?-+:?$/)));

        let tableHtml = `<div class="overflow-x-auto my-6 rounded-xl border border-stone-200 dark:border-stone-800 shadow-sm bg-white dark:bg-stone-900/50"><table class="w-full text-left border-collapse text-sm">`;
        tableHtml += `<thead class="bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 font-semibold border-b border-stone-200 dark:border-stone-800"><tr>`;
        header.forEach((h) => {
          tableHtml += `<th class="py-3 px-4">${renderWithKatex(h)}</th>`;
        });
        tableHtml += `</tr></thead><tbody class="divide-y divide-stone-100 dark:divide-stone-800 text-stone-700 dark:text-stone-300">`;
        dataRows.forEach((row) => {
          tableHtml += `<tr class="hover:bg-amber-500/5 transition-colors">`;
          row.forEach((cell, idx) => {
            const isLabel = idx === 0 && row.length === 2;
            tableHtml += `<td class="py-3 px-4 ${isLabel ? 'font-medium text-stone-900 dark:text-amber-200/90 whitespace-nowrap' : ''}">${renderWithKatex(cell)}</td>`;
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

      // Headings
      if (line.startsWith('### ')) {
        const headingText = line.replace('### ', '');
        const id = headingText.replace(/[^\w\u0E00-\u0E7F]+/g, '-').toLowerCase();
        processedLines.push(
          `<h3 id="${id}" class="text-lg md:text-xl font-bold mt-8 mb-3 text-stone-900 dark:text-amber-200 flex items-center gap-2 scroll-mt-24"><span class="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>${renderWithKatex(
            headingText
          )}</h3>`
        );
      } else if (line.startsWith('## ')) {
        const headingText = line.replace('## ', '');
        const id = headingText.replace(/[^\w\u0E00-\u0E7F]+/g, '-').toLowerCase();
        processedLines.push(
          `<h2 id="${id}" class="text-xl md:text-2xl font-bold mt-12 mb-4 pb-2 border-b border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 flex items-center justify-between scroll-mt-24"><span>${renderWithKatex(
            headingText
          )}</span></h2>`
        );
      } else if (line.startsWith('# ')) {
        const headingText = line.replace('# ', '');
        processedLines.push(
          `<h1 class="text-2xl md:text-3xl font-extrabold mt-4 mb-6 text-stone-900 dark:text-white">${renderWithKatex(
            headingText
          )}</h1>`
        );
      } else if (line.startsWith('---')) {
        processedLines.push(
          `<hr class="my-8 border-t border-stone-200 dark:border-stone-800" />`
        );
      } else if (line.trim().startsWith('- ')) {
        // Bullet points
        const text = line.trim().replace(/^- /, '');
        processedLines.push(
          `<li class="ml-5 list-disc my-1.5 text-stone-700 dark:text-slate-300 leading-relaxed">${renderWithKatex(
            text
          )}</li>`
        );
      } else if (/^\d+\.\s/.test(line.trim())) {
        // Numbered list
        const text = line.trim().replace(/^\d+\.\s/, '');
        processedLines.push(
          `<li class="ml-5 list-decimal my-1.5 text-stone-700 dark:text-slate-300 leading-relaxed">${renderWithKatex(
            text
          )}</li>`
        );
      } else if (line.trim().length === 0) {
        processedLines.push(`<div class="h-2"></div>`);
      } else {
        // Normal paragraph
        let formatted = line;
        // Bold
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-stone-900 dark:text-stone-100">$1</strong>');
        // Italic
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
        
        processedLines.push(
          `<p class="my-3 text-stone-700 dark:text-slate-300 leading-relaxed text-base">${renderWithKatex(
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
      className="prose-content text-stone-800 dark:text-slate-300 leading-relaxed max-w-none"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
