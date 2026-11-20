import test from 'node:test';
import assert from 'node:assert/strict';
import { canOpenFromStrip, canReadFile, files } from './files.js';
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

test('audio and links can open from the strip but are skipped by the arrows', () => {
  const byId = id => files.find(file => file.id === id);
  const [dashboard, section, link, audio, xml, html, txt] = ['dashboard', 'section', 'link', 'mp3', 'xml', 'html', 'txt'].map(byId);
  assert.deepEqual(fileNeighbors(files, section.id), { previous: dashboard, next: xml });
  assert.deepEqual(fileNeighbors(files, xml.id), { previous: section, next: html });
  assert.deepEqual(fileNeighbors(files, txt.id), { previous: html, next: undefined });
  for (const file of [link, audio]) {
    assert.equal(canReadFile(file), false);
    assert.equal(canOpenFromStrip(file), true);
  }
});
