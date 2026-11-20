import { asset, icon, iconButton } from './ui.js';
import { docxPages } from './office-pages.js';
import { sheets } from './sheet-data.js';
import { renderDashboard } from './dashboard.js';
import { bindMediaTransport, mediaSeek, mediaSound } from './media-player.js';

export const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

export function docxPageBlocks(index, content) {
  return docxPages[index].map((block, number) => ({
    ...block,
    text: content?.paragraphs?.[`${index}:${number}`] ?? block.text,
  }));
}

function docxFlow(index, content, editing) {
  return `<div class="docx-flow">${docxPageBlocks(index, content).map((block, number) => {
    const attrs = editing ? ` contenteditable="plaintext-only" role="textbox" aria-multiline="true" aria-label="Страница ${index + 1}, блок ${number + 1}" data-paragraph="${index}:${number}"` : '';
    if (block.kind === 'p') return `<p${block.bold ? ' class="docx-heading"' : ''}${attrs}>${escape(block.text)}</p>`;
    const list = block.kind;
    return `<${list}${list === 'ol' ? ` start="${block.start}"` : ''}><li${attrs}>${escape(block.text)}</li></${list}>`;
  }).join('')}</div>`;
}

export function officePages(file, content, editing = false) {
  return `<main class="viewer-workspace office-workspace"><div class="office-pages">${[0, 1].map(index => {
    const target = `${file.type}-page-${index + 1}`;
    const body = file.type === 'pdf'
      ? `<div class="pdf-page-image page-image-${index + 1}"><img src="${asset(file.content)}" alt="Страница ${index + 1} документа ${file.name}"></div>`
      : docxFlow(index, content, editing);
    const page = `<article class="office-page ${file.type}-page" aria-label="Страница ${index + 1}">${body}</article>`;
    return `<div class="office-page-slot" data-page-target="${target}">${page}</div>`;
  }).join('')}</div></main>`;
}

function presentation(file, state) {
  const index = file.navigation.findIndex(item => item.id === state.selected);
  return `<main class="viewer-workspace presentation-workspace"><div class="slide-stage"><img class="slide-image" src="${asset(file.content[index])}" alt="Слайд ${index + 1} из ${file.content.length}"></div>
    <nav class="slide-navigation" aria-label="Навигация по слайдам">
      ${iconButton('Предыдущий слайд', 'E666', { size: 24, action: 'slide-prev', className: 'slide-back', extra: index === 0 ? 'disabled' : '' })}
      <div class="slide-progress">${file.navigation.map((item, number) => `<button type="button" data-action="slide-select" data-id="${item.id}" aria-label="Слайд ${number + 1}"${number === index ? ' aria-current="page"' : ''}><span>${number + 1}</span></button>`).join('')}</div>
      <button type="button" class="slide-total" aria-label="Всего слайдов: ${file.content.length}">${file.content.length} ${icon('E732', 16)}</button>
      <button type="button" class="slide-show" aria-label="Демонстрация">${icon('E666', 24)}</button>
    </nav></main>`;
}

function sheetTable(sheet, content, editing) {
  const columnCount = 26;
  const widths = Array.from({ length: columnCount }, (_, i) => {
    const column = sheet.columns.find(c => i + 1 >= Number(c.min) && i + 1 <= Number(c.max));
    return column ? Math.round(Number(column.width) * 8 * .8) : 58;
  });
  const dataColumns = sheet.columns.length;
  return `<table class="sheet-table" aria-label="${sheet.name}"><colgroup><col style="width:26px">${widths.map(width => `<col style="width:${width}px">`).join('')}</colgroup><thead><tr><th></th>${widths.map((_, i) => `<th scope="col">${String.fromCharCode(65 + i)}</th>`).join('')}</tr></thead><tbody>${Array.from({ length: 70 }, (_, i) => {
    const row = sheet.rows.find(r => r.number === i + 1);
    const merged = i < 2;
    return `<tr style="height:${row ? Math.round(row.height * 1.07) : 18}px"><th scope="row">${i + 1}</th>${widths.map((_, j) => {
      if (merged && j > 0 && j < dataColumns) return '';
      const ref = `${String.fromCharCode(65 + j)}${i + 1}`;
      const cell = row?.cells.find(c => c.ref === ref);
      let value = content?.cells?.[sheet.id]?.[ref] ?? cell?.value ?? '';
      if (sheet.name === 'Воронка' && j === 7 && i >= 4 && i <= 9 && value !== '') value = `${(Number(value) * 100).toFixed(1)}%`;
      const numeric = value !== '' && Number.isFinite(Number(value));
      const cls = j >= dataColumns || i > 9 ? '' : i === 0 ? 'sheet-title' : i === 1 ? 'sheet-note' : i === 3 || i === 9 ? 'sheet-emphasis' : i >= 4 ? `sheet-data${i % 2 ? ' striped' : ''}${numeric ? ' numeric' : ''}${['6','7'].includes(cell?.style) ? ' sheet-blue' : ''}` : '';
      const address = editing ? ` data-cell="${ref}" tabindex="${ref === 'A1' ? '0' : '-1'}" aria-label="${ref}, ${escape(value)}"` : '';
      return `<td class="${cls}${ref === 'A1' ? ' active-cell' : ''}"${address}${merged && j === 0 ? ` colspan="${dataColumns}"` : ''}>${escape(value)}</td>`;
    }).join('')}</tr>`;
  }).join('')}</tbody></table>`;
}

export function spreadsheet(state, content, editing = false) {
  const sheet = sheets.find(item => item.id === state.sheet) ?? sheets[0];
  const formula = editing ? `<form class="sheet-formula" aria-label="Строка формул"><label for="cell-value" title="Значение ячейки">ƒx</label><input id="cell-value" aria-label="Значение ячейки" autocomplete="off" spellcheck="false"></form>` : '';
  return `<main class="viewer-workspace sheet-workspace">${formula}<div class="sheet-scroll" tabindex="0" aria-label="Лист ${sheet.name}">${sheetTable(sheet, content, editing)}</div><nav class="sheet-tabs" aria-label="Листы книги"><span class="sheet-tab-arrows" aria-hidden="true">‹　‹　›　›</span>${sheets.map(item => `<button type="button" data-action="sheet-select" data-id="${item.id}" aria-pressed="${item.id === sheet.id}">${item.name}</button>`).join('')}${editing ? '<button class="sheet-add" type="button" aria-disabled="true" aria-label="Добавить лист">⊕</button>' : ''}</nav></main>`;
}

export function video(file, editing = false) {
  return `<main class="viewer-workspace video-workspace"><div class="video-player"><video src="${asset(file.content)}" width="1920" height="1080" preload="metadata" playsinline aria-label="Видео.mp4"></video>
    <div class="video-controls">${mediaSeek('video-progress')}<div class="video-control-row">
      <button type="button" class="video-step" aria-label="Назад">◀◀</button><button type="button" class="video-play" data-action="media-play" aria-label="Воспроизвести">▶</button><button type="button" class="video-step" aria-label="Вперёд">▶▶</button>
      ${editing ? '' : '<button type="button" class="video-rate" aria-label="Скорость воспроизведения 1x">1x</button>'}<div class="video-sound">${mediaSound('video-volume')}</div>
      <output class="video-time" aria-live="off"><span data-media-current>0:00</span> / <span data-media-duration>0:00</span></output><span class="video-control-spacer"></span>${editing ? `<span class="video-editor-chevron" aria-hidden="true">${icon('EB8A')}</span>` : `<button type="button" aria-label="Снимок кадра"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 5h3l1-2h4l1 2h3v8H2V5Z" stroke="currentColor"/><circle cx="8" cy="8.5" r="2.5" stroke="currentColor"/></svg></button><button type="button" data-action="video-fullscreen" aria-label="Полный экран" aria-pressed="false">⛶</button>`}</div></div>
    <p class="video-error" data-media-error role="status" hidden>Не удалось воспроизвести видео.</p></div></main>`;
}

export function renderFileContent(file, editing, state, content) {
  if (['docx', 'pdf'].includes(file.type)) return officePages(file, content);
  if (file.type === 'pptx') return presentation(file, state);
  if (file.type === 'sheet') return spreadsheet(state, content);
  if (file.type === 'photo') return `<main class="viewer-workspace photo-workspace"><img src="${asset(file.content)}" alt="Абстрактная композиция из округлых форм в кремовых, терракотовых и серых тонах"></main>`;
  if (file.type === 'video') return video(file);
  if (file.type === 'html') return `<main class="viewer-workspace html-workspace"><iframe class="html-document" src="${asset(file.content)}" title="${file.name}" sandbox></iframe></main>`;
  if (file.type === 'xml' || file.type === 'txt') return `<main class="viewer-workspace text-workspace" data-format="${file.type}"><pre class="text-document" aria-label="${file.name}" tabindex="0" aria-busy="true"><code></code></pre></main>`;
  if (file.type === 'section') return `<main class="viewer-workspace section-workspace"><article class="section-content"><div class="section-copy"><h1>Начните с того, что интересно, и найдите свой путь среди историй, тем и деталей</h1><p>Здесь собраны истории, материалы и детали, из которых складывается общая картина. Выберите направление и исследуйте дальше</p><button type="button" class="section-learn">Узнать больше</button><div class="section-author"><div class="section-avatar"><img src="${asset(file.content)}" alt=""></div><div><strong>Алексей</strong><small>Специалист поддержки, перезвонит в течение 10 минут</small></div></div></div><div class="section-photo"><img src="${asset(file.content)}" alt="Тёмные листья"></div></article></main>`;
  if (file.type === 'dashboard') return renderDashboard(editing);
  return '';
}

export function selectFileLocation(root, file, state, id) {
  if (file.type === 'pptx') {
    const index = file.navigation.findIndex(item => item.id === id);
    if (index < 0) return;
    state.selected = id;
    const image = root.querySelector('.slide-image');
    image.src = asset(file.content[index]);
    image.alt = `Слайд ${index + 1} из ${file.content.length}`;
    const previous = root.querySelector('[data-action="slide-prev"]');
    if (previous) previous.disabled = index === 0;
    const count = root.querySelector('.editor-slide-count');
    if (count) count.textContent = `Слайд ${index + 1} из ${file.content.length}`;
    root.querySelectorAll('[data-action="slide-select"]').forEach(button => {
      if (button.dataset.id === id) button.setAttribute('aria-current', 'page');
      else button.removeAttribute('aria-current');
    });
  } else if (file.type === 'docx' || file.type === 'pdf') {
    const page = root.querySelector(`[data-page-target="${id}"]`);
    const workspace = root.querySelector('.office-workspace');
    if (page) workspace.scrollTop += page.getBoundingClientRect().top - workspace.getBoundingClientRect().top;
  }
}

export function fitPhoto(workspace, photo, degrees, zoom = 1) {
  workspace.dataset.rotation = degrees;
  workspace.style.setProperty('--content-rotation', `${degrees}deg`);
  if (!photo.naturalWidth || !photo.naturalHeight) return;
  const style = getComputedStyle(workspace);
  const width = workspace.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const height = workspace.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const sideways = degrees % 180 !== 0;
  const rotatedWidth = sideways ? photo.naturalHeight : photo.naturalWidth;
  const rotatedHeight = sideways ? photo.naturalWidth : photo.naturalHeight;
  const fit = Math.max(0, Math.min(1, width / rotatedWidth, height / rotatedHeight)) * zoom;
  photo.style.width = `${photo.naturalWidth * fit}px`;
  photo.style.height = `${photo.naturalHeight * fit}px`;
}

function bindContentRotation(root, file, state, content) {
  if (!['docx', 'pdf', 'photo'].includes(file.type)) return;
  const workspace = root.querySelector('.viewer-workspace');
  const photo = file.type === 'photo' ? workspace.querySelector('img') : undefined;
  const pages = [...workspace.querySelectorAll('.docx-page')];
  const baseRotation = content?.rotation ?? 0;
  const sync = () => {
    const degrees = state.rotation ?? baseRotation;
    if (photo) {
      fitPhoto(workspace, photo, degrees);
      return;
    }
    const sideways = degrees % 180 !== 0;
    workspace.dataset.rotation = degrees;
    workspace.style.setProperty('--content-rotation', `${degrees}deg`);
    workspace.style.setProperty('--page-inline-size', `${sideways ? Math.max(1159, ...pages.map(page => page.offsetHeight)) : 876}px`);
    workspace.style.setProperty('--page-block-size', `${sideways ? 876 : 1159}px`);
    for (const page of pages) {
      const slot = page.parentElement;
      slot.style.width = `${sideways ? page.offsetHeight : 876}px`;
      slot.style.height = `${sideways ? 876 : page.offsetHeight}px`;
    }
  };
  const observer = photo || pages.length ? new ResizeObserver(sync) : undefined;
  if (photo) observer.observe(workspace);
  pages.forEach(page => observer.observe(page));
  photo?.addEventListener('load', sync);
  sync();
  return {
    rotate(direction) {
      state.rotation = ((state.rotation ?? baseRotation) + direction * 90 + 360) % 360;
      sync();
    },
    cleanup() {
      observer?.disconnect();
      photo?.removeEventListener('load', sync);
    },
  };
}

function highlightXML(source) {
  const fragment = document.createDocumentFragment();
  const markup = /(<!--[\s\S]*?-->|<!\[CDATA\[[\s\S]*?\]\]>|<\?[\s\S]*?\?>|<\/?[\w:.-]+(?:[^"'<>]|"[^"]*"|'[^']*')*>)/g;
  const token = /("[^"]*"|'[^']*'|<\??\/?|[?/]>|>|=|\s+)/g;
  const append = (text, kind) => {
    if (!kind) { fragment.append(text); return; }
    const span = document.createElement('span');
    span.className = `xml-${kind}`;
    span.textContent = text;
    fragment.append(span);
  };
  for (const [index, part] of source.split(markup).entries()) {
    if (index % 2 === 0) append(part);
    else if (part.startsWith('<!--')) append(part, 'comment');
    else if (part.startsWith('<![')) append(part);
    else for (const piece of part.split(token)) {
      if (!piece || /^\s+$/.test(piece)) append(piece);
      else if (/^["']/.test(piece)) append(piece, 'value');
      else if (/[<>=]/.test(piece)) append(piece, 'punctuation');
      else append(piece, 'tag');
    }
  }
  return fragment;
}

function bindTextDocument(root, file) {
  const paper = root.querySelector('.text-document');
  if (!paper) return;
  const controller = new AbortController();
  const code = paper.querySelector('code');
  fetch(asset(file.content), { signal: controller.signal }).then(async response => {
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const source = await response.text();
    if (!controller.signal.aborted) code.replaceChildren(file.type === 'xml' ? highlightXML(source) : source);
  }).catch(() => {
    if (controller.signal.aborted) return;
    paper.dataset.state = 'error';
    code.textContent = 'Не удалось открыть файл.';
  }).finally(() => paper.removeAttribute('aria-busy'));
  return () => controller.abort();
}

export function bindFileContent(root, file, state, onNavigate, content, editor) {
  const rotation = editor ? undefined : bindContentRotation(root, file, state, content);
  const cleanupText = bindTextDocument(root, file);
  const handleClick = event => {
    const action = event.target.closest('[data-action]');
    if (!action) return;
    if (action.dataset.action === 'rotate-left') rotation?.rotate(-1);
    if (action.dataset.action === 'rotate-right') rotation?.rotate(1);
    if (action.dataset.action === 'slide-prev') {
      const index = file.navigation.findIndex(item => item.id === state.selected);
      if (index > 0) onNavigate(file.navigation[index - 1].id);
    }
    if (action.dataset.action === 'slide-select') onNavigate(action.dataset.id);
    if (action.dataset.action === 'sheet-select') {
      const sheet = sheets.find(item => item.id === action.dataset.id);
      if (!sheet || sheet.id === state.sheet) return;
      state.sheetScroll ??= {};
      const scroll = root.querySelector('.sheet-scroll');
      state.sheetScroll[state.sheet ?? sheets[0].id] = [scroll.scrollLeft, scroll.scrollTop];
      state.sheet = sheet.id;
      scroll.innerHTML = sheetTable(sheet, content, Boolean(editor));
      scroll.setAttribute('aria-label', `Лист ${sheet.name}`);
      [scroll.scrollLeft, scroll.scrollTop] = state.sheetScroll[sheet.id] ?? [0, 0];
      root.querySelectorAll('[data-action="sheet-select"]').forEach(button => button.setAttribute('aria-pressed', button.dataset.id === sheet.id));
      editor?.sheetChanged();
    }
  };
  root.addEventListener('click', handleClick);
  const player = root.querySelector('.video-player');
  const cleanupMedia = player ? bindMediaTransport(player) : undefined;
  return () => {
    rotation?.cleanup();
    cleanupText?.();
    cleanupMedia?.();
    root.removeEventListener('click', handleClick);
  };
}
