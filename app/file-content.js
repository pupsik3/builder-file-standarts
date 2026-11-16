import { asset, icon, iconButton } from './ui.js';
import { docxPages } from './office-pages.js';
import { sheets } from './sheet-data.js';
import { renderDashboard } from './dashboard.js';

const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');

function officePages(file) {
  return `<main class="viewer-workspace office-workspace"><div class="office-pages">${[0, 1].map(index => {
    const target = `${file.type}-page-${index + 1}`;
    const content = file.type === 'pdf' ? `<div class="pdf-page-image page-image-${index + 1}"><img src="${asset(file.content)}" alt="Страница ${index + 1} документа ${file.name}"></div>` : `<div class="docx-flow">${docxPages[index].map(block => block.kind === 'p' ? `<p${block.bold ? ' class="docx-heading"' : ''}>${escape(block.text)}</p>` : `<${block.kind}${block.kind === 'ol' ? ` start="${block.start}"` : ''}><li>${escape(block.text)}</li></${block.kind}>`).join('')}</div>`;
    const page = `<article class="office-page ${file.type}-page"${file.type !== 'pdf' ? ` data-page-target="${target}"` : ''} aria-label="Страница ${index + 1}">${content}</article>`;
    return file.type === 'pdf' ? `<div class="office-page-slot" data-page-target="${target}">${page}</div>` : page;
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

function sheetTable(sheet) {
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
      let value = cell?.value ?? '';
      if (sheet.name === 'Воронка' && j === 7 && i >= 4 && i <= 9 && value !== '') value = `${(Number(value) * 100).toFixed(1)}%`;
      const numeric = value !== '' && Number.isFinite(Number(cell?.value));
      const cls = j >= dataColumns || i > 9 ? '' : i === 0 ? 'sheet-title' : i === 1 ? 'sheet-note' : i === 3 || i === 9 ? 'sheet-emphasis' : i >= 4 ? `sheet-data${i % 2 ? ' striped' : ''}${numeric ? ' numeric' : ''}${['6','7'].includes(cell?.style) ? ' sheet-blue' : ''}` : '';
      return `<td class="${cls}${ref === 'A1' ? ' active-cell' : ''}"${merged && j === 0 ? ` colspan="${dataColumns}"` : ''}>${escape(value)}</td>`;
    }).join('')}</tr>`;
  }).join('')}</tbody></table>`;
}

function spreadsheet(state) {
  const sheet = sheets.find(item => item.id === state.sheet) ?? sheets[0];
  return `<main class="viewer-workspace sheet-workspace"><div class="sheet-scroll" tabindex="0" aria-label="Лист ${sheet.name}">${sheetTable(sheet)}</div><nav class="sheet-tabs" aria-label="Листы книги"><span class="sheet-tab-arrows" aria-hidden="true">‹　‹　›　›</span>${sheets.map(item => `<button type="button" data-action="sheet-select" data-id="${item.id}" aria-pressed="${item.id === sheet.id}">${item.name}</button>`).join('')}</nav></main>`;
}

function video(file) {
  return `<main class="viewer-workspace video-workspace"><div class="video-player"><video src="${asset(file.content)}" width="1920" height="1080" preload="metadata" playsinline aria-label="Видео.mp4"></video>
    <div class="video-controls"><input class="video-progress" type="range" min="0" max="0" step="0.01" value="0" aria-label="Позиция воспроизведения"><div class="video-control-row">
      <button type="button" class="video-step" aria-label="Назад">◀◀</button><button type="button" class="video-play" data-action="video-play" aria-label="Воспроизвести">▶</button><button type="button" class="video-step" aria-label="Вперёд">▶▶</button>
      <button type="button" class="video-rate" aria-label="Скорость воспроизведения 1x">1x</button><div class="video-sound"><button type="button" data-action="video-mute" aria-label="Выключить звук"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 6h3l3-3v10l-3-3H2V6Z" fill="currentColor"/><path d="M10 5c2 2 2 4 0 6m2-8c3 3 3 7 0 10" stroke="currentColor" stroke-linecap="round"/></svg></button><input class="video-volume" type="range" min="0" max="1" step="0.05" value="1" aria-label="Громкость"></div>
      <output class="video-time" aria-live="off">0:00 / 0:00</output><span class="video-control-spacer"></span><button type="button" aria-label="Снимок кадра"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M2 5h3l1-2h4l1 2h3v8H2V5Z" stroke="currentColor"/><circle cx="8" cy="8.5" r="2.5" stroke="currentColor"/></svg></button><button type="button" data-action="video-fullscreen" aria-label="Полный экран" aria-pressed="false">⛶</button></div></div>
    <p class="video-error" hidden>Не удалось воспроизвести видео.</p></div></main>`;
}

export function renderFileContent(file, editing, state) {
  if (['docx', 'pdf'].includes(file.type)) return officePages(file);
  if (file.type === 'pptx') return presentation(file, state);
  if (file.type === 'sheet') return spreadsheet(state);
  if (file.type === 'photo') return `<main class="viewer-workspace photo-workspace"><img src="${asset(file.content)}" alt="Абстрактная композиция из округлых форм в кремовых, терракотовых и серых тонах"></main>`;
  if (file.type === 'video') return video(file);
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
    root.querySelector('[data-action="slide-prev"]').disabled = index === 0;
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

function bindContentRotation(root, file, state) {
  if (!['pdf', 'photo'].includes(file.type)) return;
  const workspace = root.querySelector('.viewer-workspace');
  const photo = file.type === 'photo' ? workspace.querySelector('img') : undefined;
  const sync = () => {
    const degrees = state.rotation ?? 0;
    const sideways = degrees % 180 !== 0;
    workspace.dataset.rotation = degrees;
    workspace.style.setProperty('--content-rotation', `${degrees}deg`);
    if (!photo) {
      workspace.style.setProperty('--page-inline-size', `${sideways ? 1159 : 876}px`);
      workspace.style.setProperty('--page-block-size', `${sideways ? 876 : 1159}px`);
      return;
    }
    if (!photo.naturalWidth || !photo.naturalHeight) return;
    const style = getComputedStyle(workspace);
    const width = workspace.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const height = workspace.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const rotatedWidth = sideways ? photo.naturalHeight : photo.naturalWidth;
    const rotatedHeight = sideways ? photo.naturalWidth : photo.naturalHeight;
    const fit = Math.max(0, Math.min(1, width / rotatedWidth, height / rotatedHeight));
    photo.style.width = `${photo.naturalWidth * fit}px`;
    photo.style.height = `${photo.naturalHeight * fit}px`;
  };
  const observer = photo ? new ResizeObserver(sync) : undefined;
  observer?.observe(workspace);
  photo?.addEventListener('load', sync);
  sync();
  return {
    rotate(direction) {
      state.rotation = ((state.rotation ?? 0) + direction * 90 + 360) % 360;
      sync();
    },
    cleanup() {
      observer?.disconnect();
      photo?.removeEventListener('load', sync);
    },
  };
}

export function bindFileContent(root, file, state, onNavigate) {
  const rotation = bindContentRotation(root, file, state);
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
      scroll.innerHTML = sheetTable(sheet);
      scroll.setAttribute('aria-label', `Лист ${sheet.name}`);
      [scroll.scrollLeft, scroll.scrollTop] = state.sheetScroll[sheet.id] ?? [0, 0];
      root.querySelectorAll('.sheet-tabs button').forEach(button => button.setAttribute('aria-pressed', button.dataset.id === sheet.id));
    }
  };
  root.addEventListener('click', handleClick);
  const media = root.querySelector('video');
  if (!media) return () => {
    rotation?.cleanup();
    root.removeEventListener('click', handleClick);
  };
  const player = media.parentElement;
  const seek = player.querySelector('.video-progress');
  const volume = player.querySelector('.video-volume');
  const play = player.querySelector('.video-play');
  const mute = player.querySelector('[data-action="video-mute"]');
  const time = seconds => `${Math.floor((seconds || 0) / 60)}:${String(Math.floor((seconds || 0) % 60)).padStart(2, '0')}`;
  const sync = () => {
    seek.max = Number.isFinite(media.duration) ? media.duration : 0;
    seek.value = media.currentTime;
    seek.setAttribute('aria-valuetext', `${time(media.currentTime)} из ${time(media.duration)}`);
    seek.style.setProperty('--progress', `${media.duration ? media.currentTime / media.duration * 100 : 0}%`);
    player.querySelector('.video-time').textContent = `${time(media.currentTime)} / ${time(media.duration)}`;
    play.textContent = media.paused ? '▶' : 'Ⅱ';
    play.setAttribute('aria-label', media.paused ? 'Воспроизвести' : 'Пауза');
    mute.setAttribute('aria-label', media.muted ? 'Включить звук' : 'Выключить звук');
    mute.setAttribute('aria-pressed', media.muted);
    volume.value = media.muted ? 0 : media.volume;
    volume.setAttribute('aria-valuetext', `${Math.round(Number(volume.value) * 100)}%`);
  };
  const mediaClick = async event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'video-play') {
      if (media.paused) {
        try { await media.play(); } catch { player.querySelector('.video-error').hidden = false; }
      } else media.pause();
    }
    if (action === 'video-mute') media.muted = !media.muted;
    if (action === 'video-fullscreen') {
      try {
        if (document.fullscreenElement) await document.exitFullscreen();
        else if (player.requestFullscreen) await player.requestFullscreen();
        else if (media.webkitEnterFullscreen) media.webkitEnterFullscreen();
      } catch {
        const error = player.querySelector('.video-error');
        error.textContent = 'Браузер не разрешил полноэкранный режим.';
        error.hidden = false;
      }
    }
  };
  const seekInput = () => { if (Number.isFinite(media.duration)) media.currentTime = Number(seek.value); };
  const volumeInput = () => { media.volume = Number(volume.value); media.muted = media.volume === 0; };
  player.addEventListener('click', mediaClick);
  const fullscreenChange = () => {
    const fullscreen = document.fullscreenElement === player;
    const button = player.querySelector('[data-action="video-fullscreen"]');
    button.setAttribute('aria-pressed', fullscreen);
    button.setAttribute('aria-label', fullscreen ? 'Выйти из полноэкранного режима' : 'Полный экран');
  };
  document.addEventListener('fullscreenchange', fullscreenChange);
  seek.addEventListener('input', seekInput);
  volume.addEventListener('input', volumeInput);
  const events = ['loadedmetadata', 'durationchange', 'timeupdate', 'play', 'pause', 'ended', 'volumechange'];
  events.forEach(event => media.addEventListener(event, sync));
  sync();
  return () => {
    media.pause();
    if (document.fullscreenElement === player) document.exitFullscreen().catch(() => {});
    document.removeEventListener('fullscreenchange', fullscreenChange);
    events.forEach(event => media.removeEventListener(event, sync));
    player.removeEventListener('click', mediaClick);
    root.removeEventListener('click', handleClick);
  };
}
