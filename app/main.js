import { files, canReadFile } from './files.js';
import { asset, icon, iconButton, messagesButton } from './ui.js';
import { cardCommands, maxCardCommands, previewPanel } from './menus.js';
import { bindFormattingToolbar, renderViewer, viewerMenu } from './viewer.js';
import { bindOutline, createOutlineState, syncOutline } from './outline.js';
import { bindFileContent, selectFileLocation } from './file-content.js';
import { bindFileNavigation } from './file-navigation.js';

const registry = document.querySelector('#registry');
const panels = document.querySelector('#panels');
const viewer = document.querySelector('#viewer');
const fileById = new Map(files.map(file => [file.id, file]));

const navRows = [
  ['Сайты', 'EB5C'], ['Виджеты', 'd15f9.svg'], ['Оформление', 'EBBB'], ['Диск', 'b4b34.svg'],
];
const treeRows = [
  ['Быстрый доступ', 'E73B', '', 'star'], ['Мой диск', 'E9C1', '330 МБ', 'parent'],
  ['Документы', '', '', 'current child'], ['Диск компании', 'E9C2', '23.85 ТБ', 'parent'],
  ['Устройства', 'E9C2', '', 'parent'], ['Из сообщений', 'E65D', '', 'muted'],
  ['Со мной поделились', 'E654', '', 'muted'], ['Шаблоны', 'EA7E', '', 'muted'],
  ['Удаленные', 'E92A', '', 'muted'],
];

function treeRow([label, symbol, amount, variant]) {
  const selected = variant.includes('current');
  return `<div class="tree-row ${variant}">
    <button type="button" class="tree-row-main"${selected ? ' aria-current="page"' : ''}>
      ${symbol ? icon(symbol) : ''}<span class="tree-row-label">${label}</span>${amount ? `<small>${amount}</small>` : ''}
    </button>
    ${variant.includes('child') ? `<span class="tree-row-actions">${iconButton('Открыть раздел', 'E9D5')}${iconButton('Действия раздела', 'E9D9')}</span>` : ''}
  </div>`;
}

function card(file) {
  const dividers = file.media ? ['faba4.svg', '7d239.svg'] : file.type === 'pptx' ? ['074e5.svg', 'a96cf.svg'] : ['99899.svg', '95fee.svg'];
  return `<article class="file-card${file.media ? ' media-card' : ''}${file.contained ? ' contained-card' : ''}" data-file="${file.id}" data-type="${file.type}">
    <img class="thumbnail" src="${asset(file.thumbnail)}" alt="">
    <button class="card-open" type="button" aria-label="${file.name}" data-action="file-open"></button>
    ${file.duration ? `<span class="duration">${icon('E96E', 12)} ${file.duration}</span>` : ''}
    ${file.icon ? `<span class="file-type" style="--file-color:${file.color ?? (['site', 'dashboard', 'section'].includes(file.type) ? '#656c87' : '#2562aa')}">${icon(file.icon)}</span>` : ''}
    <label class="card-select"><input type="checkbox" aria-label="Выбрать ${file.name}"><span></span></label>
    <div class="card-caption"><div class="card-name">${file.name}</div>
      <div class="quick-actions">${cardCommands(file).map(({ id, label, glyph, optional }, index) => `<span class="card-command-slot"${optional ? ' data-extra-command hidden' : ''}>${iconButton(label, glyph, { size: 24, extra: `data-command="${id}"` })}<img class="card-command-divider" src="${asset(dividers[index === 0 ? 0 : 1])}" alt=""></span>`).join('')}
        <span class="card-command-slot">${iconButton(`Действия с файлом ${file.name}`, 'E9D9', { size: 24, action: 'preview-toggle', className: 'card-more', extra: 'aria-haspopup="dialog" aria-expanded="false"' })}</span>
      </div>
    </div>
  </article>`;
}

registry.innerHTML = `<div class="registry-shell">
  <nav class="app-nav" aria-label="SabyDesign">
    <div class="brand"><span class="brand-mark">${icon('E9E2', 24)}</span><img src="${asset('sabydesign-wordmark.svg')}" alt="SabyDesign"></div>
    <div class="nav-subtitle">${icon('EA90')} Конструктор сайтов</div>
    ${navRows.map(([label, symbol]) => `<button type="button" class="nav-row${label === 'Диск' ? ' active' : ''}"${label === 'Диск' ? ' aria-current="page"' : ''}>${symbol.endsWith('.svg') ? `<img src="${asset(symbol)}" alt="">` : icon(symbol, 18)}${label}</button>`).join('')}
  </nav>
  <nav class="drive-tree" aria-label="Разделы Диска">
    <div class="tree-header"><button type="button" class="icon-button primary" aria-label="Создать"><img src="${asset('14005.svg')}" alt=""></button><button type="button" class="icon-button plain" aria-label="Меню Диска"><span class="menu-rest">${icon('EA90')}</span><span class="menu-hover">${icon('EBFA')}</span></button></div>
    ${treeRows.map(treeRow).join('')}
  </nav>
  <main class="documents" aria-label="Мои документы">
    <header class="registry-header">
      <div class="breadcrumbs"><nav class="breadcrumb-path" aria-label="Хлебные крошки"><button type="button" class="breadcrumb-home" aria-label="Мой диск — главная">${icon('E920')}</button><button type="button" class="breadcrumb-link">Мой диск</button></nav><div class="search"><span>Найти</span>${iconButton('Параметры поиска', 'E9AA', { className: 'search-expand' })}</div></div>
      <div class="folder-title"><h1>Мои документы</h1><span>146 файлов&nbsp;&nbsp; 439 МБ</span></div>
    </header>
    <div class="file-scroll-region"><div class="file-scroll" tabindex="0" aria-label="Список файлов"><div class="file-grid">${files.map(card).join('')}</div></div>
      <div class="scroll-shadow at-top"></div><div class="scroll-shadow at-bottom"></div>
      <div class="scroll-track" aria-hidden="true"><div class="scroll-thumb"></div></div>
    </div>
  </main>
  <aside class="registry-tools" aria-label="Действия Диска">
    <button type="button" class="initials" aria-label="Профиль">КС</button>
    <div class="registry-tool-actions">${[['Сортировка', 'EB66'], ['Вид', 'E748'], ['Ссылка', 'E6A7'], ['Скачать', 'E628'], ['Редактировать', 'E660'], ['Ещё', 'E9D9']].map(([label, code]) => iconButton(label, code, { size: code === 'E9D9' ? 18 : 24 })).join('')}</div>
    <div class="support">${[['Заметки', 'EA42'], ['Звонки', 'E636']].map(([label, code]) => iconButton(label, code, { className: 'support-button' })).join('')}${messagesButton()}<button type="button" class="icon-button help-button" aria-label="Помощь"><img src="${asset('d9537.svg')}" alt=""></button></div>
  </aside>
</div>`;

const scroll = registry.querySelector('.file-scroll');
const scrollRegion = scroll.parentElement;
const track = scrollRegion.querySelector('.scroll-track');
const thumb = track.firstElementChild;

function updateCardCommands() {
  const cards = registry.querySelectorAll('.file-card');
  const commandWidth = Number.parseFloat(getComputedStyle(cards[0]).getPropertyValue('--card-command-width'));
  for (const card of cards) {
    const captionStyle = getComputedStyle(card.querySelector('.card-caption'));
    const padding = Number.parseFloat(captionStyle.paddingLeft) + Number.parseFloat(captionStyle.paddingRight);
    const cardWidth = card.getBoundingClientRect().width;
    const iconInset = (commandWidth - 24) / 2;
    const outset = Math.max(iconInset, Math.min(padding / 2, Math.max(0, (3 * commandWidth - cardWidth + padding) / 2)));
    const width = cardWidth - padding + 2 * outset;
    const additionalCount = Math.max(0, Math.min(maxCardCommands, Math.floor(width / commandWidth)) - 3);
    const additional = card.querySelectorAll('[data-extra-command]');
    const visibleCount = 3 + Math.min(additionalCount, additional.length);
    const gap = Math.max(0, (width - visibleCount * commandWidth) / (visibleCount - 1));
    card.style.setProperty('--card-command-outset', `${outset}px`);
    card.style.setProperty('--card-command-gap', `${gap}px`);
    additional.forEach((slot, index) => {
      const hidden = index >= additionalCount;
      if (hidden && slot.contains(document.activeElement)) {
        card.querySelector('.card-more').focus({ preventScroll: true });
      }
      slot.hidden = hidden;
    });
  }
}

function updateScrollbar() {
  const max = scroll.scrollHeight - scroll.clientHeight;
  scrollRegion.classList.toggle('can-scroll', max > 0);
  const length = Math.min(track.clientHeight, track.clientHeight * scroll.clientHeight / scroll.scrollHeight);
  const offset = max ? (track.clientHeight - length) * scroll.scrollTop / max : 0;
  scrollRegion.classList.toggle('has-before', scroll.scrollTop > 0);
  scrollRegion.classList.toggle('has-after', scroll.scrollTop < max - 1);
  thumb.style.height = `${length}px`;
  thumb.style.top = `${offset}px`;
}

let dragStart;
track.addEventListener('pointerdown', event => {
  if (event.target !== thumb) return;
  event.preventDefault();
  dragStart = { y: event.clientY, top: scroll.scrollTop };
  track.setPointerCapture(event.pointerId);
});
track.addEventListener('pointermove', event => {
  if (!dragStart) return;
  const distance = track.clientHeight - thumb.offsetHeight;
  if (distance) scroll.scrollTop = dragStart.top + (event.clientY - dragStart.y) * (scroll.scrollHeight - scroll.clientHeight) / distance;
});
track.addEventListener('lostpointercapture', () => { dragStart = undefined; });
scroll.addEventListener('scroll', updateScrollbar, { passive: true });
new ResizeObserver(() => {
  updateCardCommands();
  updateScrollbar();
}).observe(scroll);
updateCardCommands();

let panelState;
let viewerState;
const outlineStates = new Map();

function positionPanel() {
  if (!panelState) return;
  const { anchor, element } = panelState;
  const rect = anchor.getBoundingClientRect();
  if (panelState.surface === 'viewer') {
    const maxTop = window.innerHeight - element.offsetHeight - 8;
    element.style.top = `${Math.max(8, Math.min(maxTop, rect.top - 6))}px`;
    return;
  }
  const maxLeft = window.innerWidth - element.offsetWidth - 22;
  const maxTop = window.innerHeight - element.offsetHeight - 8;
  element.style.left = `${Math.max(8, Math.min(maxLeft, rect.left + (rect.width - element.offsetWidth) / 2))}px`;
  element.style.top = `${Math.max(8, Math.min(maxTop, rect.top + (rect.height - element.offsetHeight) / 2))}px`;
}

function closePanel(restoreFocus = true) {
  if (!panelState) return;
  const { anchor, trigger } = panelState;
  trigger?.setAttribute('aria-expanded', 'false');
  if (restoreFocus) trigger?.focus({ preventScroll: true });
  anchor.classList.remove('is-active');
  panels.replaceChildren();
  panelState = undefined;
}

function openPreview(file, anchor, trigger) {
  closePanel(false);
  anchor.classList.add('is-active');
  trigger.setAttribute('aria-expanded', 'true');
  panels.innerHTML = previewPanel(file);
  panelState = { surface: 'preview', file, anchor, trigger, element: panels.firstElementChild };
  positionPanel();
  panels.querySelector('.panel-close').focus({ preventScroll: true });
}

function showViewer(file, mode, origin) {
  if (!canReadFile(file)) return;
  const fileNavigation = viewerState?.fileNavigation ?? {
    open: false,
    scrollLeft: 0,
    // Read the rendered registry so sorting/filtering has a single source of order.
    files: [...registry.querySelectorAll('.file-card')]
      .filter(card => card.getClientRects().length)
      .map(card => fileById.get(card.dataset.file)).filter(Boolean),
  };
  if (mode === 'edit') fileNavigation.open = false;
  const contentScroll = viewerState?.file === file ? viewer.querySelector('.viewer-workspace').scrollTop : 0;
  viewerState?.cleanupOutline?.();
  viewerState?.cleanupFormatting?.();
  viewerState?.cleanupContent?.();
  viewerState?.cleanupNavigation?.();
  closePanel(false);
  if (!outlineStates.has(file.id)) outlineStates.set(file.id, createOutlineState(file));
  const outline = outlineStates.get(file.id);
  if (outline.placement === 'overlay') outline.placement = 'collapsed';
  viewerState = { file, mode, origin, outline, fileNavigation };
  registry.inert = true;
  viewer.hidden = false;
  viewer.innerHTML = renderViewer(file, mode, outline, fileNavigation);
  const navigate = id => {
    outline.selected = id;
    selectFileLocation(viewer, file, outline, id);
    syncOutline(viewer, file, outline);
  };
  viewerState.cleanupOutline = bindOutline(viewer, file, outline, ['docx', 'pdf', 'pptx'].includes(file.type) ? navigate : undefined);
  viewerState.cleanupFormatting = bindFormattingToolbar(viewer);
  viewerState.cleanupContent = bindFileContent(viewer, file, outline, navigate);
  viewerState.cleanupNavigation = bindFileNavigation(viewer, fileNavigation, (id, action) => {
    const next = fileNavigation.files.find(item => item.id === id);
    if (!canReadFile(next) || next.id === viewerState.file.id || viewerState.mode !== 'read') return;
    showViewer(next, 'read', origin);
    const focusTarget = action === 'navigate-file'
      ? viewer.querySelector('.file-preview[aria-current]')
      : viewer.querySelector(`[data-action="${action}"]`) ?? viewer.querySelector('.file-nav-arrow');
    focusTarget?.focus({ preventScroll: true });
  });
  viewer.querySelector('.viewer-workspace').scrollTop = contentScroll;
  viewer.querySelector('.viewer-close').focus({ preventScroll: true });
}

function closeViewer() {
  const { origin } = viewerState;
  viewerState.cleanupOutline?.();
  viewerState.cleanupFormatting?.();
  viewerState.cleanupContent?.();
  viewerState.cleanupNavigation?.();
  closePanel(false);
  viewerState = undefined;
  viewer.hidden = true;
  viewer.replaceChildren();
  registry.inert = false;
  origin.closest('.file-card')?.querySelector('.card-open').focus({ preventScroll: true });
  origin.focus({ preventScroll: true });
}

function toggleViewerMenu(trigger) {
  if (panelState) { closePanel(); return; }
  const { file, mode } = viewerState;
  trigger.classList.add('is-active');
  trigger.setAttribute('aria-expanded', 'true');
  panels.innerHTML = viewerMenu(file, mode);
  panelState = { surface: 'viewer', file, anchor: trigger, trigger, element: panels.firstElementChild };
  positionPanel();
  panels.querySelector('.panel-close').focus({ preventScroll: true });
}

function runCommand(id, file, trigger) {
  if (id === 'save' && viewerState?.file === file && viewerState.mode === 'edit') {
    showViewer(file, 'read', viewerState.origin);
    return;
  }
  if (!['edit', 'editor'].includes(id) || !file?.editable) return;
  const origin = viewerState?.origin ?? panelState?.trigger ?? trigger;
  showViewer(file, 'edit', origin);
}

function commandFile(command) {
  const card = command.closest('.file-card');
  return card ? fileById.get(card.dataset.file) : viewerState?.file ?? panelState?.file;
}

registry.addEventListener('click', event => {
  const trigger = event.target.closest('[data-action]');
  const anchor = trigger?.closest('.file-card');
  if (!anchor) return;
  const file = fileById.get(anchor.dataset.file);
  if (trigger.dataset.action === 'file-open' && canReadFile(file)) showViewer(file, 'read', trigger);
  else if (panelState?.anchor === anchor && panelState.trigger === trigger) closePanel();
  else openPreview(file, anchor, trigger);
});
viewer.addEventListener('click', event => {
  const action = event.target.closest('[data-action]');
  if (action?.dataset.action === 'viewer-close') closeViewer();
  if (action?.dataset.action === 'viewer-menu') toggleViewerMenu(action);
});
panels.addEventListener('click', event => {
  if (event.target.closest('[data-action="panel-close"]')) closePanel();
});
document.addEventListener('mousedown', event => {
  const checkbox = event.target.closest('.card-select input');
  if (checkbox) {
    // Pointer selection must not keep the card's keyboard focus-within state open.
    if (document.activeElement === checkbox) checkbox.blur();
    event.preventDefault();
    return;
  }
  const button = event.target.closest('button');
  if (!button || button.dataset.action) return;
  const editsFile = ['edit', 'editor'].includes(button.dataset.command) && commandFile(button)?.editable;
  if (!editsFile) event.preventDefault();
});
document.addEventListener('click', event => {
  const command = event.target.closest('[data-command]');
  if (!command) return;
  runCommand(command.dataset.command, commandFile(command), command);
});
document.addEventListener('keydown', event => {
  if (event.key !== 'Escape') return;
  if (panelState) closePanel();
  else if (viewerState?.mode === 'read' && viewerState.fileNavigation.open) {
    const toggle = viewer.querySelector('.file-strip-toggle');
    toggle.click();
    toggle.focus({ preventScroll: true });
  }
  else if (viewerState?.outline.placement === 'overlay' && viewer.querySelector('.viewer-outline')) {
    viewer.querySelector('.viewer-close').focus({ preventScroll: true });
    viewerState.outline.placement = 'collapsed';
    syncOutline(viewer, viewerState.file, viewerState.outline);
  }
  else if (viewerState) closeViewer();
});
window.addEventListener('resize', positionPanel);
scroll.addEventListener('scroll', positionPanel, { passive: true });
