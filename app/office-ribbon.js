import { icon } from './ui.js';

const tabs = {
  docx: ['Главная', 'Вставка', 'Разметка страницы', 'Рецензирование', 'Вид'],
  pptx: ['Главная', 'Вставка', 'Конструктор', 'Переходы', 'Анимации', 'Рецензирование', 'Вид'],
  sheet: ['Главная', 'Вставка', 'Данные', 'Рецензирование', 'Вид'],
};

function button(label, glyph, options = {}) {
  const { text = false, large = false, selected = false, disabled = false } = options;
  return `<button type="button" class="ribbon-button${large ? ' ribbon-large' : ''}" title="${label}" aria-label="${label}"${selected ? ' aria-pressed="true"' : ''} ${disabled ? 'disabled' : 'aria-disabled="true" tabindex="-1"'}>
    ${glyph.startsWith('E') ? icon(glyph, large ? 24 : 16) : glyph}${text ? `<span>${label}</span>` : ''}</button>`;
}

const group = (label, body) => `<div class="ribbon-group"><div class="ribbon-group-tools">${body}</div><span class="ribbon-group-name">${label}</span></div>`;
const row = (...items) => `<div class="ribbon-row">${items.join('')}</div>`;
const stack = (...items) => `<div class="ribbon-stack">${items.join('')}</div>`;
const large = (label, glyph, disabled = false) => button(label, glyph, { text: true, large: true, disabled });
const text = (label, glyph, disabled = false) => button(label, glyph, { text: true, disabled });
const value = (label, displayed, disabled = false) => `<button type="button" class="ribbon-value" aria-label="${label}" ${disabled ? 'disabled' : 'aria-disabled="true" tabindex="-1"'}>${displayed}<span aria-hidden="true">⌄</span></button>`;
const lines = direction => `<span class="ribbon-lines align-${direction}" aria-hidden="true"><i></i><i></i><i></i></span>`;

function clipboard(type) {
  return group('Буфер обмена', large('Вставить', 'E74F') + stack(
    text('Вырезать', 'E807', type !== 'sheet'),
    text('Копировать', 'E623', type === 'docx'),
    text('Форматирование по образцу', 'E6A4', type === 'pptx'),
  ));
}

function font(type) {
  const inactive = type === 'pptx';
  const doc = type === 'docx';
  const format = (label, glyph, selected = false) => button(label, glyph, { selected, disabled: inactive });
  return group('Шрифт', stack(
    row(value('Шрифт', doc ? 'Calibri (основной …)' : inactive ? '' : 'Arial', inactive),
      value('Размер шрифта', doc ? '11' : inactive ? '' : '16', inactive),
      format('Увеличить размер шрифта', 'A⁺'), format('Уменьшить размер шрифта', 'A⁻'),
      doc ? format('Очистить форматирование', 'E6B0') : ''),
    row(format('Полужирный', '<b>Ж</b>', !inactive), format('Курсив', '<i>К</i>'),
      format('Подчёркивание', '<u>Ч</u>'),
      format(doc ? 'Зачёркивание' : 'Границы', doc ? '<s>abc</s>' : '▦'),
      doc ? format('Подстрочный знак', 'x₂') + format('Надстрочный знак', 'x²') : '',
      format('Цвет выделения', '<span class="ribbon-highlight">▰</span>'),
      format('Цвет шрифта', '<span class="ribbon-color">A</span>')),
  ));
}

function paragraph(type) {
  const inactive = type === 'pptx';
  const sheet = type === 'sheet';
  const control = (label, glyph, selected = false) => button(label, glyph, { selected, disabled: inactive });
  const horizontal = row(control('По левому краю', lines('left'), !inactive && !sheet),
    control('По центру', lines('center')), control('По правому краю', lines('right')), control('По ширине', lines('justify')),
    control('Междустрочный интервал', 'EA47'), control('Границы', '▦'));
  return group(sheet ? 'Выравнивание' : 'Абзац', stack(
    sheet ? row(control('По верхнему краю', lines('top')), control('По середине', lines('middle')), control('По нижнему краю', lines('bottom'), true)) :
      row(control('Маркеры', 'E6C7'), control('Нумерация', 'E6C8'), control('Многоуровневый список', 'E6C7'), control('Уменьшить отступ', '⇤'), control('Увеличить отступ', '⇥'), control('Знаки форматирования', '¶')),
    horizontal,
  ) + (sheet ? stack(text('Переносить текст', '↵'),
    button('Объединить и поместить в центре', 'E958', { text: true, selected: true })) : ''));
}

function docGroups() {
  const styles = ['Обычный', 'Без интервала', 'Заголовок 1', 'Заголовок 2', 'Заголовок 3'];
  return font('docx') + paragraph('docx') + group('Стили',
    styles.map((name, i) => `<button type="button" class="ribbon-style" aria-disabled="true" tabindex="-1"${i === 0 ? ' aria-pressed="true"' : ''}><span>АаБбВв</span>${name}</button>`).join('')) +
    group('Редактирование', stack(text('Найти', 'E662'), text('Заменить', 'E6B0')));
}

function slideGroups() {
  return group('Удалить', large('Удалить', 'E660', true)) +
    group('Слайды', large('Новый слайд', 'EADD') + stack(text('Макет', 'E747'), text('Дублировать слайд', 'E623'), text('Скрыть слайд', 'E651'))) +
    font('pptx') + paragraph('pptx') +
    group('Рисование', large('Фигуры', 'E94E') + large('Упорядочить', 'E747', true) +
      large('Экспресс-стили', 'E664', true) + stack(text('Заливка фигуры', 'E664', true), text('Контур фигуры', 'E660', true), text('Дублировать', 'E623', true))) +
    group('Редактирование', stack(text('Найти', 'E662')));
}

function sheetGroups() {
  return font('sheet') + paragraph('sheet') + group('Число', stack(
    row(value('Числовой формат', 'Общий')),
    row(button('Денежный формат', '$'), button('Процентный формат', '%'), button('Разделитель разрядов', ','), button('Увеличить разрядность', '.0'), button('Уменьшить разрядность', '.00')),
  )) + group('Таблицы', large('Условное форматирование', 'E747') + large('Форматировать как таблицу', 'E747')) +
    group('Ячейки', large('Вставить', 'EADD') + large('Удалить', 'E660') + large('Форматирование', 'E747')) +
    group('Редактирование', stack(text('Автосумма', 'Σ'), text('Очистить', 'E6B0')) +
      large('Сортировка и фильтрация', 'E94C') + large('Найти и выделить', 'E662'));
}

export function officeRibbon(type) {
  const groups = type === 'docx' ? docGroups() : type === 'pptx' ? slideGroups() : sheetGroups();
  return `<div class="office-ribbon" aria-label="Лента инструментов">
    <nav class="ribbon-tabs" aria-label="Вкладки ленты">
      ${tabs[type].map((label, i) => `<button type="button" aria-disabled="true" tabindex="-1"${i === 0 ? ' aria-current="page"' : ''}>${label}</button>`).join('')}
      ${type !== 'sheet' ? `<span class="ribbon-search">${icon('E7A1')}Что вы хотите сделать?</span>` : ''}
      ${type === 'docx' ? '<button class="ribbon-comments" type="button" aria-disabled="true" tabindex="-1">Комментарии</button>' : ''}
    </nav>
    <div class="ribbon-scroll" tabindex="0" aria-label="Команды вкладки Главная">
      ${group('Отменить', stack(button('Отменить', 'E6CF', { disabled: true }), button('Повторить', 'E6CA', { disabled: true })))}
      ${clipboard(type)}${groups}
    </div>
  </div>`;
}
