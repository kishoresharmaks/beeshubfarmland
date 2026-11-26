import React from 'react';

// Parses inline bold, italic, inline code, and markdown links
export function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  const tokens: React.ReactNode[] = [];
  let key = 0;

  // Regex to match:
  // 1. Links: [text](url)
  // 2. Bold: **text** or __text__
  // 3. Italic: *text* or _text_
  // 4. Code: `code`
  const regex = /(\[.*?\]\(.*?\)|\*\*.*?\*\*|__.*?__|\*.*?\*|_.*?_|`.*?`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      tokens.push(<span key={key++}>{text.substring(lastIndex, match.index)}</span>);
    }

    const token = match[0];

    // Markdown link: [text](url)
    if (token.startsWith('[') && token.includes('](') && token.endsWith(')')) {
      const closingBracket = token.indexOf('](');
      const linkText = token.substring(1, closingBracket);
      const linkUrl = token.substring(closingBracket + 2, token.length - 1);
      const isExternal = linkUrl.startsWith('http://') || linkUrl.startsWith('https://');

      tokens.push(
        <a
          key={key++}
          href={linkUrl}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noopener noreferrer' : undefined}
          className="text-[#ED3500] hover:text-[#D02E00] underline font-semibold transition-colors"
        >
          {linkText}
        </a>
      );
    }
    // Bold: **text** or __text__
    else if (
      (token.startsWith('**') && token.endsWith('**') && token.length >= 4) ||
      (token.startsWith('__') && token.endsWith('__') && token.length >= 4)
    ) {
      const inner = token.substring(2, token.length - 2);
      tokens.push(
        <strong key={key++} className="font-extrabold text-[#163B5C]">
          {renderInline(inner)}
        </strong>
      );
    }
    // Italic: *text* or _text_
    else if (
      (token.startsWith('*') && token.endsWith('*') && token.length >= 2) ||
      (token.startsWith('_') && token.endsWith('_') && token.length >= 2)
    ) {
      const inner = token.substring(1, token.length - 1);
      tokens.push(
        <em key={key++} className="italic text-slate-800">
          {renderInline(inner)}
        </em>
      );
    }
    // Code: `code`
    else if (token.startsWith('`') && token.endsWith('`') && token.length >= 2) {
      tokens.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] sm:text-xs text-[#ED3500] font-semibold"
        >
          {token.substring(1, token.length - 1)}
        </code>
      );
    } else {
      tokens.push(<span key={key++}>{token}</span>);
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    tokens.push(<span key={key++}>{text.substring(lastIndex)}</span>);
  }

  return tokens.length > 0 ? tokens : text;
}

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  const lines = content.split(/\r?\n/);
  const elements: React.ReactNode[] = [];
  let index = 0;
  let elementKey = 0;

  while (index < lines.length) {
    const rawLine = lines[index];
    const trimmed = rawLine.trim();

    // 1. Skip empty lines
    if (!trimmed) {
      index++;
      continue;
    }

    // 2. Horizontal Rule (--- or ***)
    if (/^(\-{3,}|\*{3,})$/.test(trimmed)) {
      elements.push(
        <hr key={elementKey++} className="my-8 border-t border-[#E8EDF2]" />
      );
      index++;
      continue;
    }

    // 3. Headings (# to ####)
    if (trimmed.startsWith('# ') || trimmed.startsWith('## ') || trimmed.startsWith('### ') || trimmed.startsWith('#### ')) {
      if (trimmed.startsWith('# ')) {
        elements.push(
          <h1 key={elementKey++} className="text-2xl sm:text-3xl font-black text-[#163B5C] pt-6 pb-2 border-b border-[#E8EDF2]">
            {renderInline(trimmed.replace(/^#\s+/, ''))}
          </h1>
        );
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h2 key={elementKey++} className="text-xl sm:text-2xl font-black text-[#163B5C] pt-6 pb-2 border-b border-[#E8EDF2] flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#ED3500] rounded-full inline-block shrink-0"></span>
            <span>{renderInline(trimmed.replace(/^##\s+/, ''))}</span>
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        elements.push(
          <h3 key={elementKey++} className="text-lg sm:text-xl font-extrabold text-[#163B5C] pt-5 pb-1">
            {renderInline(trimmed.replace(/^###\s+/, ''))}
          </h3>
        );
      } else if (trimmed.startsWith('#### ')) {
        elements.push(
          <h4 key={elementKey++} className="text-base sm:text-lg font-bold text-[#163B5C] pt-4 pb-0.5 text-[#ED3500]">
            {renderInline(trimmed.replace(/^####\s+/, ''))}
          </h4>
        );
      }
      index++;
      continue;
    }

    // 4. Blockquotes (> ...)
    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quoteLines.push(lines[index].trim().replace(/^>\s*/, ''));
        index++;
      }
      elements.push(
        <blockquote
          key={elementKey++}
          className="border-l-4 border-[#ED3500] bg-gradient-to-r from-[#FFF8F5] to-transparent pl-4 pr-3 py-3 rounded-r-2xl my-5 text-slate-800 italic leading-relaxed text-sm sm:text-base shadow-2xs"
        >
          {quoteLines.map((ql, qIdx) => (
            <p key={qIdx} className={qIdx > 0 ? 'mt-2' : ''}>
              {renderInline(ql)}
            </p>
          ))}
        </blockquote>
      );
      continue;
    }

    // 5. Tables (rows starting and ending with | or containing multiple |)
    if (trimmed.startsWith('|') && trimmed.endsWith('|') && trimmed.includes('|')) {
      const tableLines: string[] = [];
      while (
        index < lines.length &&
        lines[index].trim().startsWith('|') &&
        lines[index].trim().endsWith('|')
      ) {
        tableLines.push(lines[index].trim());
        index++;
      }

      if (tableLines.length >= 2) {
        // Parse header and rows
        const parseRow = (rowStr: string) =>
          rowStr
            .replace(/^\|/, '')
            .replace(/\|$/, '')
            .split('|')
            .map((c) => c.trim());

        const headerRow = parseRow(tableLines[0]);
        // Row 1 is usually the separator line (| :--- | :--- |)
        const isSeparator = /^[:\-\s|]+$/.test(tableLines[1]);
        const dataRows = (isSeparator ? tableLines.slice(2) : tableLines.slice(1)).map(parseRow);

        elements.push(
          <div key={elementKey++} className="overflow-x-auto my-6 rounded-2xl border border-[#E8EDF2] shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm border-collapse bg-white">
              <thead className="bg-[#FFF8F5] text-[#163B5C] border-b border-[#E8EDF2]">
                <tr>
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="py-3 px-4 font-black whitespace-nowrap">
                      {renderInline(cell)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8EDF2]">
                {dataRows.map((row, rIdx) => (
                  <tr
                    key={rIdx}
                    className={`transition-colors hover:bg-amber-50/40 ${
                      rIdx % 2 === 0 ? 'bg-white' : 'bg-[#FFFCFB]'
                    }`}
                  >
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="py-3 px-4 text-slate-700 leading-normal">
                        {renderInline(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        continue;
      }
    }

    // 6. Unordered List (- or * or •)
    if (/^[-*•]\s+/.test(trimmed)) {
      const listItems: string[] = [];
      while (index < lines.length && /^[-*•]\s+/.test(lines[index].trim())) {
        listItems.push(lines[index].trim().replace(/^[-*•]\s+/, ''));
        index++;
      }
      elements.push(
        <ul key={elementKey++} className="space-y-2 my-4 pl-2 text-slate-700">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-2.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ED3500] mt-2 shrink-0"></span>
              <span className="flex-1 leading-relaxed text-sm sm:text-base">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // 7. Ordered List (1. , 2. , etc.)
    if (/^\d+\.\s+/.test(trimmed)) {
      const listItems: { num: string; text: string }[] = [];
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        const itemLine = lines[index].trim();
        const numMatch = itemLine.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          listItems.push({ num: numMatch[1], text: numMatch[2] });
        }
        index++;
      }
      elements.push(
        <ol key={elementKey++} className="space-y-3 my-4 pl-1 text-slate-700">
          {listItems.map((item, lIdx) => (
            <li key={lIdx} className="flex items-start gap-3">
              <span aria-hidden="true" className="w-6 h-6 rounded-lg bg-[#FFF8F5] border border-[#ED3500]/20 text-[#ED3500] text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                {item.num}
              </span>
              <span className="flex-1 leading-relaxed text-sm sm:text-base">{renderInline(item.text.replace(/^\d+\.\s*/, ''))}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // 8. Regular Paragraphs
    const paraLines: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !lines[index].trim().startsWith('#') &&
      !/^(\-{3,}|\*{3,})$/.test(lines[index].trim()) &&
      !lines[index].trim().startsWith('>') &&
      !(lines[index].trim().startsWith('|') && lines[index].trim().endsWith('|')) &&
      !/^[-*•]\s+/.test(lines[index].trim()) &&
      !/^\d+\.\s+/.test(lines[index].trim())
    ) {
      paraLines.push(lines[index].trim());
      index++;
    }

    if (paraLines.length > 0) {
      elements.push(
        <p key={elementKey++} className="text-slate-700 leading-relaxed text-sm sm:text-base my-3">
          {renderInline(paraLines.join(' '))}
        </p>
      );
    }
  }

  return <div className={`space-y-1 ${className}`}>{elements}</div>;
}
