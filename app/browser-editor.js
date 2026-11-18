import { asset, icon, iconButton, saveFileButton, viewerClose } from './ui.js';
import { docxPageBlocks, fitPhoto, officePages, spreadsheet, video } from './file-content.js';
import { officeRibbon } from './office-ribbon.js';

function presentationEditor(file, state) {
  const index = Math.max(0, file.navigation.findIndex(item => item.id === state.selected));
  return `<main class="viewer-workspace editor-presentation">
    <nav class="editor-slide-list" aria-label="Слайды">${file.navigation.map((slide, i) => `<button type="button" data-action="slide-select" data-id="${slide.id}" aria-label="${slide.title}"${i === index ? ' aria-current="page"' : ''}><span>${i + 1}</span><img src="${asset(file.content[i])}" alt=""></button>`).join('')}</nav>
    <div class="editor-slide-stage"><img class="slide-image" src="${asset(file.content[index])}" alt="Слайд ${index + 1} из ${file.content.length}"></div>
  </main><footer class="office-status"><span class="editor-slide-count">Слайд ${index + 1} из ${file.content.length}</span><span>Русский</span><span class="office-status-end">${icon('E747', 12)} Заметки　${icon('E730', 12)}　126%　${icon('EAB9', 12)}</span></footer>`;
}

function officeEditor(file, state, draft) {
  let body;
  if (file.type === 'docx') {
    body = `${officePages(file, draft, true)}<footer class="office-status">
      <span class="editor-page-count">Страница 1 из ${file.navigation.length}</span><span class="editor-word-count"></span>
      <span>Русский</span><span class="office-status-end">100%</span></footer>`;
  } else if (file.type === 'pptx') {
    body = presentationEditor(file, state);
  } else {
    body = spreadsheet(state, draft, true);
  }
  return `<header class="viewer-header"><div class="viewer-title">${icon(file.icon, 24)}<span>${file.name}</span></div>
    <div class="header-actions">
      <button type="button" class="office-app-entry" aria-disabled="true">${icon('E660')} В приложении</button>
      ${saveFileButton()}${viewerClose()}
    </div></header><div class="editor-office-body">${officeRibbon(file.type)}${body}</div>`;
}

const videoTools = [
  ['Выделить', 'EB0C'], ['Вставить', 'E74F'], ['Скриншот', 'E67E'], ['Выбрать обложку', 'E9A3'],
];
const photoTools = [
  ['Стрелка', 'EC1D'], ['Линия', 'E999'], ['Прямоугольник', 'E94E'], ['Текст', 'EAC9'],
  ['Карандаш', 'EAC7'], ['Заливка', 'E664'], ['Нумерация', 'EC2D'],
  ['Распознать', 'E803'], ['Обрезать', 'EB10'], ['Выделение', 'EB0C'],
];

function mediaEditor(file) {
  const photo = file.type === 'photo';
  const left = (photo ? photoTools : videoTools).map(([label, glyph]) => {
    if (photo) return iconButton(label, glyph, { size: 24, className: 'media-tool', extra: 'aria-disabled="true" tabindex="-1"' });
    return `<button type="button" class="media-tool media-tool-label" aria-disabled="true" tabindex="-1">${icon(glyph, 24)}${label}</button>`;
  }).join('');
  const tool = (label, glyph, action, disabled = false) =>
    iconButton(label, glyph, { size: 24, className: 'media-tool', action, extra: disabled ? 'disabled' : '' });
  return `<div class="media-editor-tools">
    <div class="media-tools-bubble" role="group" aria-label="${photo ? 'Инструменты изображения' : 'Инструменты видео'}">${left}</div>
    <div class="media-editor-actions">
      <div class="media-tools-bubble" role="group" aria-label="Просмотр и история">
        ${tool('Уменьшить масштаб', 'E6EA', 'media-zoom-out')}<output class="media-tool media-zoom-value" aria-label="Масштаб">100%</output>${tool('Увеличить масштаб', 'E6E9', 'media-zoom-in')}
        ${photo ? `${tool('Повернуть влево', 'E60A', 'photo-left')}${tool('Повернуть вправо', 'E609', 'photo-right')}` : ''}
        ${tool('Отменить', 'E6CF', photo ? 'photo-undo' : '', true)}${tool('Повторить', 'E6CA', photo ? 'photo-redo' : '', true)}
      </div>
      ${saveFileButton(true)}${viewerClose(true)}
    </div>
  </div>${photo ? `<main class="viewer-workspace photo-workspace"><img src="${asset(file.content)}" alt="Фото"></main>` : video(file, true)}`;
}

export function renderBrowserEditor(file, state, draft) {
  const media = file.type === 'photo' || file.type === 'video';
  return `<section class="viewer-shell editing browser-editor ${media ? 'media-editor' : 'office-editor'}" data-viewer="${file.id}" data-type="${file.type}" data-mode="edit" role="dialog" aria-modal="true" aria-label="${file.name}">
    ${media ? mediaEditor(file) : officeEditor(file, state, draft)}
  </section>`;
}

function bindDocument(root, draft, signal) {
  const workspace = root.querySelector('.office-workspace');
  const pages = [...workspace.querySelectorAll('.office-page-slot')];
  const count = root.querySelector('.editor-word-count');
  const updateWordCount = () => {
    const words = pages.flatMap((_, i) => docxPageBlocks(i, draft)).reduce((total, block) =>
      total + (block.text.match(/[\p{L}\p{N}]+(?:[-–][\p{L}\p{N}]+)*/gu)?.length ?? 0), 0);
    count.textContent = `Число слов: ${words}`;
  };
  const currentPage = () => {
    const top = workspace.getBoundingClientRect().top;
    const index = pages.findIndex(page => page.getBoundingClientRect().bottom > top + 20);
    root.querySelector('.editor-page-count').textContent = `Страница ${index < 0 ? pages.length : index + 1} из ${pages.length}`;
  };
  workspace.addEventListener('input', event => {
    const paragraph = event.target.closest('[data-paragraph]');
    if (!paragraph) return;
    draft.paragraphs ??= {};
    draft.paragraphs[paragraph.dataset.paragraph] = paragraph.innerText;
    updateWordCount();
  }, { signal });
  workspace.addEventListener('scroll', currentPage, { passive: true, signal });
  updateWordCount();
  currentPage();
}

// These ranges are formula cells or references in the supplied workbook,
// including the cross-sheet vacancy and funnel calculations.
function canChangeCell(sheetId, address) {
  const column = address[0];
  const row = Number(address.slice(1));
  if (sheetId === 'hiring-0') {
    return !(row >= 5 && row <= 9 && 'ABDEFG'.includes(column) ||
      row === 10 && 'DEF'.includes(column));
  }
  return !(row >= 5 && row <= 9 && 'ABCDEFGH'.includes(column) ||
    row === 10 && 'CDEFGH'.includes(column));
}

function bindSheet(root, state, draft, signal) {
  const workspace = root.querySelector('.sheet-workspace');
  const form = workspace.querySelector('.sheet-formula');
  const input = form.querySelector('input');
  let active;
  const select = cell => {
    if (!cell) return;
    active?.classList.remove('active-cell');
    if (active) active.tabIndex = -1;
    active = cell;
    active.classList.add('active-cell');
    active.tabIndex = 0;
    const address = cell.dataset.cell;
    const firstColumn = address.charCodeAt(0) - 65;
    workspace.querySelectorAll('.sheet-table th[scope="col"]').forEach((header, index) => {
      header.classList.toggle('sheet-selected-header', index >= firstColumn && index < firstColumn + cell.colSpan);
    });
    workspace.querySelector('.sheet-selected-row')?.classList.remove('sheet-selected-row');
    cell.parentElement.querySelector('th')?.classList.add('sheet-selected-row');
    input.readOnly = !canChangeCell(state.sheet ?? 'hiring-0', address);
    input.title = input.readOnly ? `${address} · Связано с формулами книги` : address;
    input.value = cell.textContent;
  };
  const syncSheet = () => select(workspace.querySelector('[data-cell="A1"]'));
  const commit = () => {
    if (!active || input.readOnly || input.value === active.textContent) return;
    const sheet = state.sheet ?? 'hiring-0';
    draft.cells ??= {};
    draft.cells[sheet] ??= {};
    draft.cells[sheet][active.dataset.cell] = input.value;
    active.textContent = input.value;
    active.setAttribute('aria-label', `${active.dataset.cell}, ${input.value}`);
    active.classList.toggle('numeric', active.classList.contains('sheet-data') &&
      input.value.trim() !== '' && Number.isFinite(Number(input.value)));
  };
  workspace.addEventListener('click', event => {
    const cell = event.target.closest('[data-cell]');
    if (!cell) return;
    select(cell);
    cell.focus({ preventScroll: true });
  }, { signal });
  workspace.addEventListener('keydown', event => {
    const cell = event.target.closest('[data-cell]');
    if (!cell) return;
    if (event.key === 'Enter') {
      event.preventDefault();
      input.focus();
      input.select();
      return;
    }
    const { key } = event;
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) return;
    event.preventDefault();
    const address = cell.dataset.cell;
    const nextRow = Number(address.slice(1)) + (key === 'ArrowUp' ? -1 : key === 'ArrowDown' ? 1 : 0);
    const nextColumn = address.charCodeAt(0) + (key === 'ArrowLeft' ? -1 : key === 'ArrowRight' ? cell.colSpan : 0);
    const row = workspace.querySelectorAll('.sheet-table tbody tr')[nextRow - 1];
    if (nextColumn < 65 || nextColumn > 90) return;
    const merged = row?.querySelector('td[colspan]');
    const neighbor = row?.querySelector(`[data-cell="${String.fromCharCode(nextColumn)}${nextRow}"]`) ??
      (merged && nextColumn < 65 + merged.colSpan ? merged : null);
    if (!neighbor) return;
    select(neighbor);
    neighbor.focus();
  }, { signal });
  form.addEventListener('submit', event => {
    event.preventDefault();
    commit();
  }, { signal });
  input.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    event.stopPropagation();
    input.value = active.textContent;
    active.focus({ preventScroll: true });
  }, { signal });
  syncSheet();
  return { commit, sheetChanged: syncSheet };
}

function bindMedia(root, file, draft, signal) {
  const workspace = root.querySelector('.viewer-workspace');
  const photo = file.type === 'photo' ? workspace.querySelector('img') : null;
  const media = photo ?? workspace.querySelector('video');
  const undo = root.querySelector('[data-action="photo-undo"]');
  const redo = root.querySelector('[data-action="photo-redo"]');
  const previous = [];
  const next = [];
  const zoomOut = root.querySelector('[data-action="media-zoom-out"]');
  const zoomIn = root.querySelector('[data-action="media-zoom-in"]');
  let zoom = 100;
  let rotation = draft.rotation ?? 0;
  const sync = () => {
    if (photo) {
      fitPhoto(workspace, photo, rotation, zoom / 100);
      undo.disabled = !previous.length;
      redo.disabled = !next.length;
    } else {
      media.style.scale = zoom / 100;
    }
    root.querySelector('.media-zoom-value').textContent = `${zoom}%`;
    zoomOut.disabled = zoom <= 25;
    zoomIn.disabled = zoom >= 200;
  };
  root.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    switch (action) {
      case 'media-zoom-out': zoom = Math.max(25, zoom - 25); break;
      case 'media-zoom-in': zoom = Math.min(200, zoom + 25); break;
      case 'photo-left':
      case 'photo-right':
        previous.push(rotation);
        next.length = 0;
        rotation = (rotation + (action === 'photo-left' ? 270 : 90)) % 360;
        break;
      case 'photo-undo':
        if (!previous.length) return;
        next.push(rotation);
        rotation = previous.pop();
        break;
      case 'photo-redo':
        if (!next.length) return;
        previous.push(rotation);
        rotation = next.pop();
        break;
      default: return;
    }
    sync();
  }, { signal });
  const observer = photo ? new ResizeObserver(sync) : undefined;
  if (photo) {
    observer.observe(workspace);
    photo.addEventListener('load', sync, { signal });
  }
  sync();
  return {
    commit() { if (photo) draft.rotation = rotation; },
    cleanup() { observer?.disconnect(); },
  };
}

export function bindBrowserEditor(root, file, state, draft) {
  const controller = new AbortController();
  const { signal } = controller;
  let handlers;
  if (file.type === 'docx') bindDocument(root, draft, signal);
  if (file.type === 'sheet') handlers = bindSheet(root, state, draft, signal);
  if (file.type === 'photo' || file.type === 'video') handlers = bindMedia(root, file, draft, signal);
  return {
    commit: () => handlers?.commit?.(),
    sheetChanged: () => handlers?.sheetChanged?.(),
    cleanup() {
      controller.abort();
      handlers?.cleanup?.();
    },
  };
}
