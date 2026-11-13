import { asset, icon, iconButton, messagesButton } from './ui.js';
import { commandList, panelClose } from './menus.js';
import { flattenNavigation, renderOutline } from './outline.js';
import { renderDocumentFlow } from './document.js';

const readTools = [
  ['Ссылка/Поделиться', 'E6A7', 'share'], ['Скачать', 'E628', 'download'],
  ['Доступ', 'E654', 'access'], ['Изменения', 'E9C3', 'history'],
];
const siteTools = [
  ['Добавить', 'EADD', '', 'add-tool'], ['Данные', 'EBBC'], ['Структура', 'EBF9'],
  ['Стиль', 'EBBB'], ['Шрифт', 'EAC9'], ['Настройки', 'EAA9'],
];
const docReadTools = [...readTools.slice(0, 2), ['Распечатать', 'E633', 'print'], ...readTools.slice(2)];
const docEditTools = [siteTools[0], siteTools[1], siteTools[5]];
const diagramEditTools = [siteTools[0], siteTools[2], siteTools[5]];
const formattingTools = [
  ['Полужирный', 'E6C3'], ['Курсив', 'E6C6'], ['Подчёркивание', 'E6CE'], ['Зачёркивание', 'E6CB'],
  ['Код', 'EA88', true], ['Цвет текста', 'eee43.svg'], ['Фон текста', 'c78ff.svg', true], ['Шрифт', '1f3c2.svg', true],
  ['Маркированный список', 'E6C7'], ['Нумерованный список', 'E6C8'], ['Чек-лист', 'E76F'], ['Ссылка', 'E6A7'],
  ['Изображение', 'E9A3'], ['Колонки', 'EAEE'], ['Таблица', 'E958'], ['Эмодзи', 'E9A7'], ['Блок кода', 'EA88'],
  ['Информация', 'E64B'], ['Выравнивание', 'EA47'], ['Цитата', 'EBD9'], ['Блок', 'EBDA'], ['Подпись', 'E9FE'],
  ['Спойлер', 'EB7E'], ['Вложение', 'EBDB', true], ['Аудио', 'waveform'], ['SabyGPT', 'c67fd.svg'], ['Другие инструменты', 'EAB4'],
];
const formatDivider = '<span class="format-divider" aria-hidden="true"></span>';

function assetButton(label, image, extra = '') {
  return `<button type="button" class="icon-button" aria-label="${label}" title="${label}" ${extra}><img src="${asset(image)}" alt=""></button>`;
}

function zoom(value) {
  return `<div class="zoom">${iconButton('Уменьшить масштаб', 'E6EA', { size: 24 })}<button class="zoom-value" type="button" aria-label="Масштаб ${value}%">${value}%</button>${iconButton('Увеличить масштаб', 'E6E9', { size: 24 })}</div>`;
}

function lastRevision() {
  return `<div class="last-revision"><img src="${asset('18251.png')}" alt=""><span>15 окт</span></div>`;
}

function deviceSwitch() {
  return `<div class="device-switch" aria-label="Размер экрана">
    ${iconButton('Компьютер', 'E730', { size: 14, extra: 'aria-pressed="true"' })}${iconButton('Планшет', 'E637', { size: 14 })}${iconButton('Другие размеры', 'EAB4', { size: 14 })}
  </div>`;
}

function drawingTools() {
  return `<div class="drawing-tools" aria-label="Инструменты рисования">${assetButton('Выбор', '0a77e.svg', 'aria-pressed="true"')}${iconButton('Текст', 'EAC9', { size: 24 })}${assetButton('Фигура', '56351.svg')}${assetButton('Соединитель', '11dd0.svg')}</div>`;
}

function header(file, editing) {
  const site = file.type === 'site';
  const doc = file.type === 'sabydoc';
  return `<header class="viewer-header">
    <div class="viewer-title">${icon(file.icon, 24)}<span>${file.title ?? file.name}</span></div>
    <div class="viewer-center">${site ? deviceSwitch() : editing && !doc ? drawingTools() : ''}</div>
    <div class="header-actions">
      ${editing ? `<div class="editor-history">${iconButton('Отменить', 'E6CF', { size: 20 })}${iconButton('Повторить', 'E6CA', { size: 20 })}${doc ? '' : iconButton('Сбросить', 'E629', { size: 20, extra: 'disabled' })}${site ? iconButton('Предпросмотр', 'EAB9', { size: 20 }) : ''}</div>` : ''}
      ${zoom(100)}
      ${!editing || doc ? lastRevision() : ''}
      ${editing ? `<button class="header-pill save" type="button" data-command="save">Сохранить <span>${icon('E75E', 16)}</span></button>` : `<button class="header-pill edit" type="button" data-command="edit">Изменить ${icon('E660', 16)}</button>`}
      <button class="viewer-close" type="button" data-action="viewer-close" aria-label="Закрыть окно конструктора"><img src="${asset('da5ab.svg')}" alt=""></button>
    </div>
  </header>`;
}

function toolbar(tools, editing) {
  return `<aside class="viewer-toolbar" aria-label="Инструменты файла"><div class="viewer-tools${editing ? ' editor-tools' : ''}">
    ${tools.map(([label, glyph, command, className]) => iconButton(label, glyph, { size: 24, className: `${editing ? 'viewer-nav-button ' : ''}${className ?? ''}`, extra: command ? `data-command="${command}"` : '' })).join('')}
    ${iconButton('Меню файла', 'E9D9', { size: 20, className: 'viewer-more', action: 'viewer-menu', extra: 'aria-haspopup="dialog" aria-expanded="false"' })}
    </div><div class="support">${messagesButton()}${assetButton('Помощь', editing ? '5c691.svg' : 'd9537.svg', 'data-help')}</div></aside>`;
}

function formattingToolbar() {
  const button = ([label, glyph]) => glyph === 'waveform' ? '<button type="button" class="icon-button" aria-label="Аудио" title="Аудио"><span class="audio-waveform" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span></button>' : glyph.endsWith('.svg') ? assetButton(label, glyph) : iconButton(label, glyph, { size: 24 });
  return `<div class="format-toolbar" aria-label="Форматирование"><div class="format-primary"><button class="text-style" type="button">Основной текст ${icon('E9AA')}</button>${formatDivider}
    ${formattingTools.slice(0, -3).map(tool => {
      const [, , separator] = tool;
      return button(tool) + (separator ? formatDivider : '');
    }).join('')}</div><div class="format-fixed">${formatDivider}${formattingTools.slice(-3).map(button).join('')}</div></div>`;
}

export function bindFormattingToolbar(root) {
  const toolbar = root.querySelector('.format-toolbar');
  if (!toolbar) return;
  const primary = toolbar.querySelector('.format-primary');
  const fixed = toolbar.querySelector('.format-fixed');
  const children = [...primary.children];
  const commands = children.filter(element => element.tagName === 'BUTTON');
  const hideTrailingDividers = () => {
    let hasCommandAfter = false;
    for (const element of [...children].reverse()) {
      if (element.tagName === 'BUTTON' && !element.hidden) hasCommandAfter = true;
      if (element.classList.contains('format-divider')) element.hidden = !hasCommandAfter;
    }
  };
  const requiredWidth = () => {
    const visible = children.filter(element => !element.hidden);
    return visible.reduce((width, element) => width + element.getBoundingClientRect().width, 0) + Math.max(0, visible.length - 1) * 4;
  };
  const fit = () => {
    const style = getComputedStyle(toolbar);
    const available = toolbar.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight) - fixed.getBoundingClientRect().width - 4;
    children.forEach(element => { element.hidden = false; });
    hideTrailingDividers();
    for (const command of [...commands].reverse()) {
      if (requiredWidth() <= available) break;
      if (command === document.activeElement) fixed.querySelector('button:last-child').focus({ preventScroll: true });
      command.hidden = true;
      hideTrailingDividers();
    }
  };
  const observer = new ResizeObserver(fit);
  observer.observe(toolbar);
  fit();
  return () => observer.disconnect();
}

function workspace(file, editing, outlineState) {
  if (file.type === 'site') return `<main class="viewer-workspace site-workspace"><div class="site-page" data-page="${outlineState.selected}"><img src="${asset(file.content)}" alt="Страница сайта"></div></main>`;
  if (file.type === 'diagram') {
    return `<main class="viewer-workspace diagram-workspace" style="--diagram-grid:url('${asset(file.content.grid)}')"><div class="diagram-canvas" role="img" aria-label="Две фигуры, соединённые стрелкой">
      <div class="diagram-shapes"><img class="diagram-connector" src="${asset(file.content.connector)}" alt=""><div class="diagram-shape upper"></div><div class="diagram-shape lower"></div></div>
    </div></main>`;
  }
  return `<div class="document-workspace">
    ${editing ? formattingToolbar() : ''}
    <main class="viewer-workspace document-paper"><div class="document-content"><div class="document-original"><img src="${asset(file.content)}" alt="Документ «Как нанять удаленного сотрудника»">${flattenNavigation(file.navigation).map(item => `<span class="document-anchor" id="heading-${item.id}" data-heading="${item.id}" role="heading" aria-level="${item.id === 'remote-work' || item.id === 'remote-employee' ? 2 : item.id === 'electronic-signature' ? 4 : 3}" aria-label="${item.title}" style="top:${item.anchorY / 1646 * 100}%"></span>`).join('')}</div>${renderDocumentFlow()}</div></main>
  </div>`;
}

export function renderViewer(file, mode, outlineState) {
  const editing = mode === 'edit';
  const hasOutline = file.type === 'sabydoc' || (file.type === 'site' && editing);
  const editTools = { site: siteTools, sabydoc: docEditTools, diagram: diagramEditTools };
  const tools = editing ? editTools[file.type] : file.type === 'sabydoc' ? docReadTools : readTools;
  return `<section class="viewer-shell ${editing ? 'editing' : 'reading'}" data-viewer="${file.id}" data-mode="${mode}" role="dialog" aria-modal="true" aria-label="${file.title ?? file.name}">
    ${header(file, editing)}
    <div class="viewer-main${hasOutline ? ' has-outline' : ''}"${hasOutline ? ` data-outline-placement="${outlineState.placement}"` : ''}>
      ${hasOutline ? renderOutline(file, outlineState) : ''}
      ${workspace(file, editing, outlineState)}
      ${toolbar(tools, editing)}
    </div>
  </section>`;
}

export function viewerMenu(file, mode) {
  return `<section class="floating-panel viewer-menu" role="dialog" aria-label="Меню файла">${commandList(file, mode)}${panelClose(true)}</section>`;
}
