import React, { useMemo } from 'react';
import katex from 'katex';

interface KatexRendererProps {
  content: string;
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
      return `<div class="katex-display-wrapper my-4 overflow-x-auto py-2 text-center">${katex.renderToString(
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
  // Preserve $$...$$ and $...$ math blocks while escaping HTML entities in raw text
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

        let tableHtml = `<div class="overflow-x-auto my-6 rounded-[16px] border border-stone bg-eggshell"><table class="w-full text-left border-collapse text-sm">`;
        tableHtml += `<thead class="bg-warm-taupe text-graphite font-medium border-b border-stone"><tr>`;
        header.forEach((h) => {
          let formatted = escapeSourceText(h);
          formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-ink">$1</strong>');
          formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-graphite">$1</em>');
          tableHtml += `<th class="py-3 px-4 font-medium">${renderWithKatex(formatted)}</th>`;
        });
        tableHtml += `</tr></thead><tbody class="divide-y divide-stone text-smoke">`;
        dataRows.forEach((row) => {
          tableHtml += `<tr class="hover:bg-warm-taupe/40 transition-colors">`;
          row.forEach((cell, idx) => {
            const isLabel = idx === 0 && row.length === 2;
            let formatted = escapeSourceText(cell);
            formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-ink">$1</strong>');
            formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-graphite">$1</em>');
            tableHtml += `<td class="py-3 px-4 ${isLabel ? 'font-medium text-ink whitespace-nowrap' : ''}">${renderWithKatex(formatted)}</td>`;
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

      // Headings — Whisper-Weight 300 & Tight -0.02em tracking with Spark Dot
      if (line.startsWith('### ')) {
        const headingText = line.replace('### ', '');
        const id = headingText.replace(/[^\w\u0E00-\u0E7F]+/g, '-').toLowerCase();
        processedLines.push(
          `<h3 id="${id}" class="text-xl font-light tracking-whisper mt-8 mb-3 text-ink font-waldenburg scroll-mt-24 flex items-center gap-2"><span class="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-violet-spark to-ember-orange inline-block"></span>${renderWithKatex(
            escapeSourceText(headingText)
          )}</h3>`
        );
      } else if (line.startsWith('## ')) {
        const headingText = line.replace('## ', '');
        const id = headingText.replace(/[^\w\u0E00-\u0E7F]+/g, '-').toLowerCase();
        processedLines.push(
          `<h2 id="${id}" class="text-2xl sm:text-[28px] font-light tracking-whisper mt-12 mb-4 pb-2 border-b border-stone text-ink font-waldenburg scroll-mt-24"><span>${renderWithKatex(
            escapeSourceText(headingText)
          )}</span></h2>`
        );
      } else if (line.startsWith('# ')) {
        const headingText = line.replace('# ', '');
        processedLines.push(
          `<h1 class="text-3xl sm:text-[36px] font-light tracking-whisper mt-4 mb-6 text-ink font-waldenburg">${renderWithKatex(
            escapeSourceText(headingText)
          )}</h1>`
        );
      } else if (line.startsWith('---')) {
        processedLines.push(
          `<hr class="my-8 border-t border-stone" />`
        );
      } else if (line.trim().startsWith('- ')) {
        // Bullet points
        const text = line.trim().replace(/^- /, '');
        let formatted = escapeSourceText(text);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-graphite">$1</em>');
        processedLines.push(
          `<li class="ml-5 list-disc my-1.5 text-smoke leading-relaxed font-sans text-[15px]">${renderWithKatex(
            formatted
          )}</li>`
        );
      } else if (/^\d+\.\s/.test(line.trim())) {
        // Numbered list
        const text = line.trim().replace(/^\d+\.\s/, '');
        let formatted = escapeSourceText(text);
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-ink">$1</strong>');
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-graphite">$1</em>');
        processedLines.push(
          `<li class="ml-5 list-decimal my-1.5 text-smoke leading-relaxed font-sans text-[15px]">${renderWithKatex(
            formatted
          )}</li>`
        );
      } else if (line.trim().length === 0) {
        processedLines.push(`<div class="h-2"></div>`);
      } else {
        // Normal paragraph
        let formatted = escapeSourceText(line);
        // Bold
        formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-medium text-ink">$1</strong>');
        // Italic
        formatted = formatted.replace(/\*([^*]+)\*/g, '<em class="italic text-graphite">$1</em>');
        
        processedLines.push(
          `<p class="my-3 text-smoke leading-relaxed font-sans text-[15px] text-pretty">${renderWithKatex(
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
      className="prose-content text-smoke leading-relaxed max-w-none font-sans"
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
