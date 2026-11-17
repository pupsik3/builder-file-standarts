import test from 'node:test';
import assert from 'node:assert/strict';
import { canReadFile } from './files.js';
import { fileNeighbors, renderFileNavigation } from './file-navigation.js';

const a = { id: 'a', type: 'photo', name: 'A', thumbnail: 'a.png', content: 'a.png' };
const b = { id: 'b', type: 'pdf', name: 'B', thumbnail: 'b.png', content: 'b.png' };
const survey = { id: 'survey', type: 'survey', name: 'Опрос', thumbnail: 'survey.png' };

test('neighbors follow registry order, skip unsupported files and do not wrap', () => {
  const list = [survey, b, { ...survey, id: 'middle' }, a, { ...survey, id: 'end' }];
  assert.deepEqual(fileNeighbors(list, b.id), { previous: undefined, next: a });
  assert.deepEqual(fileNeighbors(list, a.id), { previous: b, next: undefined });
  assert.deepEqual(fileNeighbors(list, 'absent'), { previous: undefined, next: undefined });
  assert.equal(canReadFile({ ...survey, content: 'unexpected-content' }), false);
});

test('one available file and empty lists have no side arrows', () => {
  assert.deepEqual(fileNeighbors([survey, a, survey], a.id), { previous: undefined, next: undefined });
  assert.deepEqual(fileNeighbors([], a.id), { previous: undefined, next: undefined });
  const html = renderFileNavigation([survey, a], a.id, { open: false });
  assert.equal(html.includes('class="file-nav-arrow'), false);
  assert.match(html, /data-id="survey"[^>]*aria-disabled="true"/);
});
