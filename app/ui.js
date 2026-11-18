export const asset = name => `./assets/${name}`;

export function icon(code, size = 16) {
  return `<span class="icon${size === 24 ? ' icon-large' : ''}" style="--icon-size:${size}px" aria-hidden="true">&#x${code};</span>`;
}

export function iconButton(label, code, { action = '', size = 16, className = '', extra = '' } = {}) {
  return `<button type="button" class="icon-button ${className}" aria-label="${label}" title="${label}" ${action ? `data-action="${action}"` : ''} ${extra}>${icon(code, size)}</button>`;
}

export const messagesButton = () => iconButton('Сообщения', 'E65D', { className: 'support-button' });

export function viewerClose(media = false) {
  return `<button type="button" class="viewer-close${media ? ' media-close' : ''}" data-action="viewer-close" aria-label="Закрыть окно конструктора"><img src="${asset(media ? '7c222.svg' : 'da5ab.svg')}" alt=""></button>`;
}

export function saveFileButton(media = false) {
  return media
    ? `<button type="button" class="media-save" data-command="save" aria-label="Сохранить">${icon('E75E', 20)}</button>`
    : `<button type="button" class="header-pill save" data-command="save">Сохранить <span>${icon('E75E')}</span></button>`;
}

