import { asset, fileIconColor, icon } from './ui.js';
import { canOpenFromStrip, canReadFile } from './files.js';

export function fileNeighbors(list, currentId) {
  const available = list.filter(canReadFile);
  const index = available.findIndex(file => file.id === currentId);
  return { previous: index > 0 ? available[index - 1] : undefined, next: index >= 0 ? available[index + 1] : undefined };
}

function thumbnail(file, currentId) {
  // The photo's square preview uses the full-resolution source already in the project.
  const source = file.type === 'photo' ? file.content : file.thumbnail;
  return `<button type="button" class="file-preview${file.contained ? ' contained-preview' : ''}" data-type="${file.type}" data-action="navigate-file" data-id="${file.id}" aria-label="${file.name}"${file.id === currentId ? ' aria-current="true"' : ''}${canOpenFromStrip(file) ? '' : ' aria-disabled="true"'}>
    ${source ? `<img class="file-preview-image" src="${asset(source)}" alt="">` : ''}<span class="file-preview-shade" aria-hidden="true"></span>
    ${file.icon ? `<span class="file-preview-type" style="--file-color:${fileIconColor(file)}" aria-hidden="true">${icon(file.icon)}</span>` : ''}
    ${file.type === 'video' ? `<img class="file-preview-play" src="${asset('90da0.svg')}" alt="">` : ''}
  </button>`;
}

export function renderFileNavigation(list, currentId, state) {
  const { previous, next } = fileNeighbors(list, currentId);
  const arrow = (file, direction, label) => file ? `<button type="button" class="file-nav-arrow ${direction}" data-action="${direction}-file" data-id="${file.id}" aria-label="${label}"><img src="${asset('39494.svg')}" alt=""></button>` : '';
  return `<nav class="file-navigation" aria-label="Навигация между файлами">
    ${arrow(previous, 'previous', 'Предыдущий файл')}${arrow(next, 'next', 'Следующий файл')}
    <div class="file-switcher" data-open="${state.open}">
      <button type="button" class="file-strip-toggle" data-action="toggle-file-strip" aria-label="${state.open ? 'Скрыть файлы' : 'Показать файлы'}" aria-expanded="${state.open}" aria-controls="file-strip">${icon(state.open ? 'E9D7' : 'E9D8', 24)}</button>
      <div id="file-strip" class="file-strip" tabindex="0" role="group" aria-label="Файлы текущего реестра"${state.open ? '' : ' inert'}>${list.map(file => thumbnail(file, currentId)).join('')}</div>
    </div>
  </nav>`;
}

export function bindFileNavigation(root, state, onOpen) {
  const navigation = root.querySelector('.file-navigation');
  if (!navigation) return;
  const switcher = navigation.querySelector('.file-switcher');
  const strip = navigation.querySelector('.file-strip');
  const toggle = navigation.querySelector('.file-strip-toggle');
  strip.scrollLeft = state.scrollLeft;
  const revealCurrent = () => {
    if (!state.open) return;
    const current = strip.querySelector('[aria-current]');
    if (!current) return;
    const bounds = strip.getBoundingClientRect();
    const item = current.getBoundingClientRect();
    if (item.left < bounds.left + 8) strip.scrollLeft += item.left - bounds.left - 8;
    else if (item.right > bounds.right - 8) strip.scrollLeft += item.right - bounds.right + 8;
    state.scrollLeft = strip.scrollLeft;
  };
  const setOpen = open => {
    state.open = open;
    switcher.dataset.open = open;
    strip.inert = !open;
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Скрыть файлы' : 'Показать файлы');
    toggle.innerHTML = icon(open ? 'E9D7' : 'E9D8', 24);
    revealCurrent();
  };
  const click = event => {
    const button = event.target.closest('[data-action]');
    if (!button || button.getAttribute('aria-disabled') === 'true') return;
    if (button === toggle) setOpen(!state.open);
    else onOpen(button.dataset.id, button.dataset.action);
  };
  const rememberScroll = () => { state.scrollLeft = strip.scrollLeft; };
  navigation.addEventListener('click', click);
  strip.addEventListener('scroll', rememberScroll, { passive: true });
  const observer = new ResizeObserver(revealCurrent);
  observer.observe(strip);
  revealCurrent();
  return () => {
    state.scrollLeft = strip.scrollLeft;
    observer.disconnect();
    navigation.removeEventListener('click', click);
    strip.removeEventListener('scroll', rememberScroll);
  };
}
