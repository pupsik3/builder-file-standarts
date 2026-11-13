export const asset = name => `./assets/${name}`;

export function icon(code, size = 16) {
  return `<span class="icon${size === 24 ? ' icon-large' : ''}" style="--icon-size:${size}px" aria-hidden="true">&#x${code};</span>`;
}

export function iconButton(label, code, { action = '', size = 16, className = '', extra = '' } = {}) {
  return `<button type="button" class="icon-button ${className}" aria-label="${label}" title="${label}" ${action ? `data-action="${action}"` : ''} ${extra}>${icon(code, size)}</button>`;
}

export const messagesButton = () => iconButton('Сообщения', 'E65D', { className: 'support-button' });

