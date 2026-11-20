import { asset, icon } from './ui.js';

const commands = {
  share: ['Ссылка/Поделиться', 'E6A7'], edit: ['Редактировать', 'E660'], editor: ['Перейти в редактор', 'E747'],
  'open-window': ['Открыть в новом окне', 'E63C'],
  download: ['Скачать', 'E628'], rename: ['Переименовать', 'E698'], convert: ['Конвертировать', 'E62C'],
  favorite: ['В избранное', 'E607'], move: ['Переместить', 'E63F'], cut: ['Вырезать', 'E969'], copy: ['Копировать', 'E669'],
  publish: ['Опубликовать', 'E631'], remove: ['Удалить', 'E65C'], unpublish: ['Снять с публикации', 'E62F'],
  print: ['Распечатать', 'E633'], flag: ['Пометить цветом', 'E9BD'], sign: ['Подписание', 'E68A'], encrypt: ['Зашифровать', 'E647'],
  discuss: ['Обсудить', 'E65D'], access: ['Доступ', 'E654'], history: ['Изменения', 'E9C3'], properties: ['Свойства', 'E64B'],
  gpt: ['SabyGPT', 'E9E2'], draft: ['Сохранить черновиком', 'EA0F'],
};

const compare = new Set(['sabydoc', 'sheet', 'pdf', 'docx', 'xml', 'html', 'txt']);
const textCommands = 'favorite move> cut copy remove unpublish print flag sign> encrypt';
const collaborationCommands = 'discuss access history';
const previewGroups = {
  video: ['share> edit download rename', 'favorite move> cut copy remove unpublish flag sign> encrypt', 'discuss access history'],
  photo: ['share> edit download rename convert>', 'favorite move> cut copy remove unpublish print flag sign> encrypt', 'discuss access history properties'],
  sabydoc: ['share> edit download> rename convert>', 'favorite move> cut copy remove unpublish print flag sign> encrypt', 'discuss access history'],
  site: ['share> edit download', 'favorite move> cut copy publish remove flag', 'discuss access history'],
  survey: ['share> edit rename', 'favorite move> cut copy unpublish remove flag sign>', 'discuss access history'],
  sheet: ['share> edit> download> rename', 'favorite move> cut copy remove unpublish print flag sign> encrypt', 'discuss access history'],
  pdf: ['share> download> rename convert>', 'favorite move> cut copy remove unpublish print flag sign> encrypt', 'discuss access history'],
  docx: ['share> edit> download> rename convert>', 'favorite move> cut copy remove unpublish print flag sign> encrypt', 'discuss access history'],
  diagram: ['share> edit> download rename', 'favorite move> cut copy remove unpublish flag', 'discuss access'],
  pptx: ['share> edit> download> rename', 'favorite move> cut copy remove unpublish print flag sign> encrypt', 'discuss access history'],
  dashboard: ['editor share> download rename', 'favorite move> cut copy remove unpublish flag', 'discuss access history'],
  section: ['share> edit download', 'favorite move> cut copy remove flag', 'discuss access history'],
  link: ['share> download rename', 'favorite move> copy publish remove flag', 'access'],
  audio: ['share> download> rename', 'favorite move> cut copy remove unpublish flag sign> encrypt', collaborationCommands],
  xml: ['share> edit> download> rename', textCommands, collaborationCommands],
  html: ['share> download> rename convert>', textCommands, collaborationCommands],
  txt: ['share> edit> download> rename', textCommands, collaborationCommands],
};
const textViewer = { read: ['share> download', 'access history'] };
const viewerGroups = {
  xml: textViewer,
  html: textViewer,
  txt: textViewer,
  site: {
    read: ['share> edit download', 'favorite cut copy publish remove flag', 'discuss access history'],
    edit: ['share> download', 'favorite cut copy publish remove flag', 'discuss access history'],
  },
  sabydoc: {
    read: ['share> edit download> rename convert> gpt', 'favorite cut copy remove unpublish print flag sign> encrypt', 'discuss access history'],
    edit: ['share> download> rename convert>', 'favorite cut copy remove draft print flag sign> encrypt', 'discuss access history'],
  },
  diagram: {
    read: ['share> edit download rename', 'favorite cut copy remove unpublish flag', 'discuss access'],
    edit: ['share> download rename', 'favorite cut copy remove unpublish flag', 'discuss access'],
  },
  dashboard: {
    read: previewGroups.dashboard.map(group => group.replace(/\bmove> ?/g, '')),
    edit: ['share> download rename', 'favorite cut copy remove unpublish flag', 'discuss access history'],
  },
};

export const maxCardCommands = 8;

export function cardCommands(file) {
  const groups = previewGroups[file.type];
  const primary = groups[0].split(' ').map(entry => entry.replace(/>$/, ''));
  const secondary = groups[1].split(' ')
    .map(entry => entry.replace(/>$/, ''))
    .filter(id => id !== 'move' && id !== 'remove');
  const additional = [
    'open-window',
    ...['download', 'edit', 'editor'].filter(id => primary.includes(id)),
    ...secondary,
  ].slice(0, maxCardCommands - 3);
  return ['share', ...additional, 'remove'].map(id => {
    const [label, glyph] = commands[id];
    return { id, label, glyph, optional: id !== 'share' && id !== 'remove' };
  });
}

function commandRow(entry, file) {
  const id = entry.replace(/>$/, '');
  const [label, glyph] = commands[id];
  const info = id === 'download' ? file.sizeLabel : '';
  return `<div class="command-row${id === 'remove' ? ' danger' : ''}">
    <button type="button" class="command-button" data-command="${id}">${icon(glyph, 24)}<span>${label}</span>
      ${info ? `<span class="command-info">${info}</span>` : ''}${entry.endsWith('>') ? `<span class="command-arrow">${icon('E9C2', 12)}</span>` : ''}
    </button>${id === 'history' && compare.has(file.type) ? '<button type="button" class="compare-button" data-command="compare">Сравнить</button>' : ''}
  </div>`;
}

export function commandList(file, mode) {
  const groups = mode ? viewerGroups[file.type]?.[mode] ?? previewGroups[file.type].map(group => group.replace(/\bmove> ?/g, '')) : previewGroups[file.type];
  return `<div class="command-scroll">${groups.map(group => `<div class="command-group">${group.split(' ').map(entry => commandRow(entry, file)).join('')}</div>`).join('<hr class="command-divider">')}
    ${mode ? `<div class="command-footer"><img src="${asset(file.type === 'diagram' ? 'b05e9.svg' : 'e0ddf.svg')}" alt=""></div>` : ''}</div>`;
}

export function panelClose(viewer) {
  return `<button type="button" class="panel-close" data-action="panel-close" aria-label="${viewer ? 'Закрыть меню' : 'Закрыть превью'}"><img src="${asset(viewer ? '02939.svg' : '3ad71.svg')}" alt=""></button>`;
}

const editorApps = { docx: 'Microsoft Word', pptx: 'Microsoft PowerPoint', sheet: 'Microsoft Excel' };

export function editorChoicePanel(file) {
  const app = editorApps[file.type];
  const rows = [
    [app ? `В приложении ${app}` : 'В приложении', file.icon ?? 'E72A', false],
    [app ? 'В браузере в MS Office' : 'В браузере', 'EB5C', true],
    ...(app ? [['OnlyOffice', '', false], ['Google Docs', '', false]] : []),
  ];
  return `<section class="floating-panel editor-choice" role="dialog" aria-labelledby="editor-choice-title" data-type="${file.type}">
    <h2 id="editor-choice-title">Редактировать</h2>
    <button type="button" class="panel-close" data-action="panel-close" aria-label="Закрыть меню"><img src="${asset('5ae62.svg')}" alt=""></button>
    <div class="command-group">${rows.map(([label, glyph, available]) => `
      <div class="command-row"><button type="button" class="command-button"
        ${available ? 'data-action="open-browser-editor"' : 'aria-disabled="true"'}>${glyph ? icon(glyph, 24) : '<span class="editor-choice-spacer" aria-hidden="true"></span>'}<span>${label}</span></button></div>`).join('')}</div>
  </section>`;
}

export function previewPanel(file) {
  return `<section class="floating-panel preview-panel" role="dialog" aria-label="Действия с файлом ${file.name}" data-preview="${file.id}" data-type="${file.type}">
    <div class="preview-body"><figure class="preview-figure"><div class="preview-image"><img src="${asset(file.preview)}" alt=""></div><figcaption title="${file.name}"><span>${file.name}</span></figcaption></figure>${commandList(file)}</div>
    ${panelClose(false)}
  </section>`;
}
