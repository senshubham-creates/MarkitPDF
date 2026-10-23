import { AreaAnnotation, ContinuousExcerpt, DocumentMeta, MarginComment } from '../types/pdf';
import { formatMergedExcerptText } from './excerptManager';

/**
 * Generates clean, Notion-optimized Markdown.
 * Notion natively parses callouts (> 💡), quotes (>), headers, toggles (<details>), and markdown tables.
 */
export function generateNotionMarkdown(
  doc: DocumentMeta,
  excerpts: ContinuousExcerpt[],
  comments: MarginComment[],
  areas: AreaAnnotation[] = []
): string {
  const dateStr = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const lines: string[] = [];

  // Frontmatter for Notion Database properties
  lines.push('---');
  lines.push(`Title: "${doc.title.replace(/"/g, '\\"')}"`);
  lines.push(`Author: "${doc.author.replace(/"/g, '\\"')}"`);
  lines.push(`Date Exported: "${dateStr}"`);
  lines.push(`Total Excerpts: ${excerpts.length}`);
  lines.push(`Total Margin Notes: ${comments.length}`);
  lines.push(`Source: "FluentPDF Windows Reader"`);
  lines.push('---');
  lines.push('');

  // Page Header
  lines.push(`# 📖 ${doc.title}`);
  lines.push(`*By ${doc.author} · ${doc.totalPages} Pages · Exported ${dateStr}*`);
  lines.push('');

  // Overview Callout (Notion Callout Block syntax: > 💡)
  lines.push('> 💡 **Document Reading Digest**');
  lines.push(`> This note contains **${excerpts.length} Continuous Excerpts** and **${comments.length} Margin Notes** exported from FluentPDF.`);
  lines.push('');

  // Summary Metrics Table (Notion table format)
  lines.push('### Reading Breakdown');
  lines.push('| Page | Excerpt Count | Focus Area |');
  lines.push('| :--- | :--- | :--- |');
  
  const pageMap = new Map<number, number>();
  excerpts.forEach(e => {
    pageMap.set(e.pageNumber, (pageMap.get(e.pageNumber) || 0) + 1);
  });
  if (pageMap.size === 0) {
    lines.push(`| Page 1 | 0 | General |`);
  } else {
    Array.from(pageMap.entries())
      .sort((a, b) => a[0] - b[0])
      .forEach(([page, count]) => {
        lines.push(`| Page ${page} | ${count} excerpt(s) | Highlights & notes |`);
      });
  }
  lines.push('');
  lines.push('---');
  lines.push('');

  // Continuous Excerpts Section
  lines.push('## 📑 Continuous Excerpts & Highlights');
  lines.push('');

  if (excerpts.length === 0) {
    lines.push('*No excerpts recorded yet.*');
    lines.push('');
  } else {
    excerpts.forEach((excerpt, idx) => {
      const mergedText = formatMergedExcerptText(excerpt.segments, ' [...] ');
      const segCount = excerpt.segments.length;
      const pages = Array.from(new Set(excerpt.segments.map(s => s.pageNumber))).sort((a, b) => a - b);
      const pageLabel = pages.length > 1 ? `Pages ${pages.join(', ')}` : `Page ${excerpt.pageNumber}`;

      lines.push(`### ${idx + 1}. ${excerpt.title || 'Continuous Excerpt'}`);
      lines.push(`*📍 ${pageLabel} · ${segCount} highlighted segment${segCount > 1 ? 's joined with [...]' : ''} · Theme: ${excerpt.color}*`);
      lines.push('');

      // Render merged blockquote
      lines.push(`> "${mergedText}"`);
      lines.push('');

      // If there are multiple segments or metadata, provide details toggle with start/end points
      lines.push('<details>');
      lines.push(`<summary>🔍 View ${segCount} segment${segCount > 1 ? 's' : ''} with start/end offset points</summary>`);
      lines.push('');
      excerpt.segments.forEach((seg, sIdx) => {
        const start = seg.startOffset ?? 0;
        const end = seg.endOffset ?? (start + seg.text.length);
        const sec = seg.sectionId ? ` · [Section: ${seg.sectionId}]` : '';
        lines.push(`${sIdx + 1}. **Page ${seg.pageNumber}** (Chars: \`${start}\` to \`${end}\`${sec}):`);
        lines.push(`   > "${seg.text}"`);
      });
      lines.push('');
      lines.push('</details>');
      lines.push('');

      // Margin note attached to this excerpt
      if (excerpt.marginNote && excerpt.marginNote.trim()) {
        lines.push(`> 📝 **Margin Note:** ${excerpt.marginNote.trim()}`);
        lines.push('');
      }

      // Tags
      if (excerpt.tags && excerpt.tags.length > 0) {
        lines.push(`🏷️ *Tags:* ${excerpt.tags.map(t => `\`#${t}\``).join(' ')}`);
        lines.push('');
      }

      lines.push('');
    });
  }

  // Standalone Margin Notes and Comments
  if (comments.length > 0) {
    lines.push('---');
    lines.push('## ✍️ Standalone Margin Notes & Margin Comments');
    lines.push('');
    comments.forEach((c, idx) => {
      const icon = c.type === 'question' ? '❓' : c.type === 'idea' ? '💡' : c.type === 'todo' ? '✅' : '📌';
      lines.push(`#### ${icon} Margin Note #${idx + 1} (Page ${c.pageNumber})`);
      lines.push(`> ${c.content}`);
      lines.push(`*Added by ${c.author} · ${new Date(c.createdAt).toLocaleDateString()}*`);
      lines.push('');
    });
  }

  // Area Annotations (Diagrams / Figures / Math)
  if (areas.length > 0) {
    lines.push('---');
    lines.push('## 📐 Box & Visual Diagram Annotations');
    lines.push('');
    areas.forEach((a, idx) => {
      lines.push(`#### 🖼️ Box #${idx + 1}: ${a.title} (Page ${a.pageNumber})`);
      if (a.comment) {
        lines.push(`> ${a.comment}`);
      }
      lines.push('');
    });
  }

  return lines.join('\n');
}

/**
 * Generates CSV formatted specifically for Notion Database Import.
 * Dragging or importing this CSV into Notion automatically maps columns to Title, Number, Multi-Select, and Text properties.
 */
export function generateNotionCSV(
  doc: DocumentMeta,
  excerpts: ContinuousExcerpt[],
  comments: MarginComment[]
): string {
  const headers = [
    'Name',
    'Type',
    'Page',
    'Excerpt Text',
    'Start End Points',
    'Margin Note / Comment',
    'Tags',
    'Color',
    'Document'
  ];

  const rows: string[][] = [];

  // Excerpts
  excerpts.forEach((e, idx) => {
    const mergedText = formatMergedExcerptText(e.segments, ' [...] ');
    const spanOffsets = e.segments
      .map((s, i) => {
        const start = s.startOffset ?? 0;
        const end = s.endOffset ?? (start + s.text.length);
        return `[Part ${i + 1} P.${s.pageNumber}: ${start}-${end}]`;
      })
      .join(' ; ');

    rows.push([
      `Excerpt ${idx + 1}: ${e.title}`,
      e.segments.length > 1 ? 'Continuous Excerpt' : 'Highlight',
      String(e.pageNumber),
      mergedText,
      spanOffsets,
      e.marginNote || '',
      (e.tags || []).join(', '),
      e.color,
      doc.title,
    ]);
  });

  // Comments
  comments.forEach((c, idx) => {
    rows.push([
      `Margin Note ${idx + 1}`,
      'Margin Note',
      String(c.pageNumber),
      '',
      `[P.${c.pageNumber} @ Y:${Math.round(c.yPosition)}%]`,
      c.content,
      c.type,
      'neutral',
      doc.title,
    ]);
  });

  // Escape helper for CSV RFC-4180
  const escapeCell = (val: string) => {
    if (val === undefined || val === null) return '""';
    const clean = String(val).replace(/"/g, '""');
    return `"${clean}"`;
  };

  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map(row => row.map(escapeCell).join(',')),
  ].join('\r\n');

  return csvContent;
}

/**
 * Generates official Notion Block JSON payload.
 * Can be sent directly to Notion API /v1/pages or /v1/blocks/children.
 */
export function generateNotionBlocksJSON(
  doc: DocumentMeta,
  excerpts: ContinuousExcerpt[],
  comments: MarginComment[]
): string {
  const blocks: unknown[] = [
    {
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [{ type: 'text', text: { content: `📖 ${doc.title}` } }],
      },
    },
    {
      object: 'block',
      type: 'callout',
      callout: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: `Read and annotated in FluentPDF Windows Reader. ${excerpts.length} continuous excerpts recorded with start and end segment metadata.`,
            },
          },
        ],
        icon: { emoji: '💡' },
      },
    },
    {
      object: 'block',
      type: 'divider',
      divider: {},
    },
  ];

  excerpts.forEach((e, i) => {
    const merged = formatMergedExcerptText(e.segments, ' [...] ');
    const spanMetadata = e.segments
      .map(
        (s, idx) =>
          `Part ${idx + 1} (Page ${s.pageNumber}, char offset ${s.startOffset ?? 0} to ${
            s.endOffset ?? (s.startOffset ?? 0) + s.text.length
          })`
      )
      .join(' • ');

    blocks.push({
      object: 'block',
      type: 'heading_2',
      heading_2: {
        rich_text: [{ type: 'text', text: { content: `${i + 1}. ${e.title} (Page ${e.pageNumber})` } }],
      },
    });

    blocks.push({
      object: 'block',
      type: 'quote',
      quote: {
        rich_text: [{ type: 'text', text: { content: `"${merged}"` } }],
      },
    });

    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: { content: `📍 Start/End Points: ${spanMetadata}` },
            annotations: { italic: true },
          },
        ],
      },
    });

    if (e.marginNote) {
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [{ type: 'text', text: { content: `Margin Note: ${e.marginNote}` } }],
          icon: { emoji: '📝' },
        },
      });
    }
  });

  return JSON.stringify({ children: blocks }, null, 2);
}

/**
 * Generates rich HTML/Markdown clip for instant Ctrl+V into a Notion page
 */
export function generateNotionQuickPasteText(
  doc: DocumentMeta,
  excerpts: ContinuousExcerpt[],
  comments: MarginComment[]
): string {
  return generateNotionMarkdown(doc, excerpts, comments);
}
