import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createContinuousExcerpt,
  appendSegmentToExcerpt,
  removeSegmentFromExcerpt,
  formatMergedExcerptText,
  updateExcerptMarginNote,
  buildTextLocation,
  computeSpanSummary,
  addCommentToExcerpt,
  deleteCommentFromExcerpt,
  getColorPriority,
} from './excerptManager';

test('creates a continuous excerpt with single segment and start/end points metadata', () => {
  const exc = createContinuousExcerpt({
    pageNumber: 1,
    text: 'All models are wrong, but some are useful.',
    color: 'yellow',
    marginNote: 'George Box fundamental rule',
    startOffset: 120,
    endOffset: 162,
    sectionId: 'sec-intro',
  });

  assert.equal(exc.segments.length, 1);
  assert.equal(exc.segments[0].text, 'All models are wrong, but some are useful.');
  assert.equal(exc.segments[0].startOffset, 120);
  assert.equal(exc.segments[0].endOffset, 162);
  assert.equal(exc.segments[0].sectionId, 'sec-intro');
  assert.ok(exc.segments[0].location?.startLabel.includes('120'));
  assert.ok(exc.segments[0].location?.endLabel.includes('162'));
  assert.equal(formatMergedExcerptText(exc.segments), 'All models are wrong, but some are useful.');
});

test('appends a 2nd segment separated by a gap into a continuous excerpt with its own points', () => {
  const exc = createContinuousExcerpt({
    pageNumber: 1,
    text: 'The primary goal is simplicity.',
    color: 'green',
    startOffset: 10,
    endOffset: 41,
  });

  const updated = appendSegmentToExcerpt(exc, {
    pageNumber: 1,
    text: 'Complexity must be justified.',
    color: 'green',
    startOffset: 150,
    endOffset: 179,
  });

  assert.equal(updated.segments.length, 2);
  assert.equal(updated.segments[0].startOffset, 10);
  assert.equal(updated.segments[1].startOffset, 150);
  assert.equal(updated.segments[1].endOffset, 179);
  const formatted = formatMergedExcerptText(updated.segments);
  assert.equal(formatted, 'The primary goal is simplicity. [...] Complexity must be justified.');
  assert.ok(updated.spanSummary?.includes('Page 1 · 2 segments'));
});

test('computes multi-page span summary accurately', () => {
  const loc = buildTextLocation({
    pageNumber: 2,
    text: 'Cross-page excerpt test.',
    startOffset: 50,
    endOffset: 74,
  });
  assert.equal(loc.startOffset, 50);
  assert.equal(loc.endOffset, 74);

  const spanStr = computeSpanSummary([
    { id: '1', pageNumber: 1, text: 'A', color: 'yellow', createdAt: '' },
    { id: '2', pageNumber: 3, text: 'B', color: 'yellow', createdAt: '' },
  ]);
  assert.equal(spanStr, 'Pages 1 & 3 · 2 segments');
});

test('supports removing a segment from continuous excerpt', () => {
  const exc = createContinuousExcerpt({
    pageNumber: 2,
    text: 'First line.',
  });
  const updated = appendSegmentToExcerpt(exc, {
    pageNumber: 2,
    text: 'Second line.',
  });
  assert.equal(updated.segments.length, 2);

  const seg1Id = updated.segments[0].id;
  const pruned = removeSegmentFromExcerpt(updated, seg1Id);

  assert.equal(pruned.segments.length, 1);
  assert.equal(pruned.segments[0].text, 'Second line.');
  assert.equal(formatMergedExcerptText(pruned.segments), 'Second line.');
});

test('updates margin notes attached to continuous excerpt', () => {
  const exc = createContinuousExcerpt({
    pageNumber: 3,
    text: 'Distributed systems are hard.',
  });
  const updated = updateExcerptMarginNote(exc, 'Remember CAP theorem tradeoff');
  assert.equal(updated.marginNote, 'Remember CAP theorem tradeoff');
});

test('adds and removes threaded comments inside margin notes', () => {
  const exc = createContinuousExcerpt({
    pageNumber: 1,
    text: 'Consistency models in distributed databases.',
  });

  const withComment = addCommentToExcerpt(exc, 'Should we use eventual or strong consistency?', 'Alice');
  assert.equal(withComment.comments?.length, 1);
  assert.equal(withComment.comments?.[0].content, 'Should we use eventual or strong consistency?');
  assert.equal(withComment.comments?.[0].author, 'Alice');

  const commentId = withComment.comments![0].id;
  const pruned = deleteCommentFromExcerpt(withComment, commentId);
  assert.equal(pruned.comments?.length, 0);
});

test('maps priority colors correctly', () => {
  assert.equal(getColorPriority('red'), 'P1-Critical');
  assert.equal(getColorPriority('orange'), 'P2-Important');
  assert.equal(getColorPriority('yellow'), 'P3-Standard');
  assert.equal(getColorPriority('green'), 'P4-Review');
});
