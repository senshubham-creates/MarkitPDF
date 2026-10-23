import test from 'node:test';
import assert from 'node:assert/strict';
import {
  generateNotionMarkdown,
  generateNotionCSV,
  generateNotionBlocksJSON,
} from './notionExport';
import { createContinuousExcerpt, appendSegmentToExcerpt } from './excerptManager';
import { DocumentMeta, MarginComment } from '../types/pdf';

const mockDoc: DocumentMeta = {
  id: 'doc-1',
  title: 'Principles of Software Architecture',
  author: 'Dr. Katherine Bell',
  totalPages: 12,
  source: 'builtin',
};

test('generates Notion Markdown with continuous excerpt elisions, start/end points, and callouts', () => {
  let exc = createContinuousExcerpt({
    pageNumber: 1,
    text: 'Architecture represents the significant design decisions.',
    marginNote: 'Crucial definition',
    tags: ['Architecture', 'Fundamentals'],
    startOffset: 10,
    endOffset: 66,
  });
  exc = appendSegmentToExcerpt(exc, {
    pageNumber: 1,
    text: 'Decisions are expensive to change later.',
    startOffset: 200,
    endOffset: 240,
  });

  const comment: MarginComment = {
    id: 'c-1',
    pageNumber: 1,
    yPosition: 20,
    author: 'Alex',
    content: 'Review this with the core engineering group.',
    createdAt: new Date().toISOString(),
    type: 'todo',
  };

  const md = generateNotionMarkdown(mockDoc, [exc], [comment]);

  assert.ok(md.includes('# 📖 Principles of Software Architecture'));
  assert.ok(md.includes('> 💡 **Document Reading Digest**'));
  assert.ok(md.includes('> "Architecture represents the significant design decisions. [...] Decisions are expensive to change later."'));
  assert.ok(md.includes('> 📝 **Margin Note:** Crucial definition'));
  assert.ok(md.includes('Review this with the core engineering group.'));
  assert.ok(md.includes('Chars: `10` to `66`'));
  assert.ok(md.includes('Chars: `200` to `240`'));
  assert.ok(md.includes('`#Architecture`'));
});

test('generates valid Notion CSV with start/end points column', () => {
  const exc = createContinuousExcerpt({
    pageNumber: 2,
    text: 'Line A with "quotes" inside.',
    marginNote: 'Note with, comma',
    startOffset: 15,
    endOffset: 43,
  });

  const csv = generateNotionCSV(mockDoc, [exc], []);
  assert.ok(csv.includes('"Excerpt 1: Line A with ""quotes"" inside."'));
  assert.ok(csv.includes('"Start End Points"'));
  assert.ok(csv.includes('[Part 1 P.2: 15-43]'));
  assert.ok(csv.includes('"Note with, comma"'));
  assert.ok(csv.includes('"Principles of Software Architecture"'));
});

test('generates official Notion Block JSON with start/end metadata', () => {
  const exc = createContinuousExcerpt({
    pageNumber: 3,
    text: 'High cohesion and loose coupling.',
    marginNote: 'Classic design metric',
    startOffset: 0,
    endOffset: 33,
  });

  const jsonStr = generateNotionBlocksJSON(mockDoc, [exc], []);
  const parsed = JSON.parse(jsonStr);

  assert.ok(Array.isArray(parsed.children));
  assert.equal(parsed.children[0].type, 'heading_1');
  assert.equal(parsed.children[1].type, 'callout');
  assert.ok(jsonStr.includes('Start/End Points'));
});
