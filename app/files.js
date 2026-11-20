const records = [
  { id: 'video', type: 'video', name: 'Видео.mp4', thumbnail: '945e2.png', sizeLabel: '2.7 МБ', media: true, duration: '0:05', content: 'sample-5s.mp4' },
  { id: 'photo', type: 'photo', name: 'Фото.jpg', thumbnail: 'e82b3.jpg', sizeLabel: '1 МБ', media: true, content: 'e82b3.png' },
  { id: 'sabydoc', type: 'sabydoc', name: 'Как нанять удаленного сотрудника', thumbnail: '6e31d.png', sizeLabel: '16 КБ', icon: 'EBF1', color: '#5a49ab', content: '5b089.png' },
  { id: 'site', type: 'site', name: 'С чистого листа', title: 'Онлайн-сервис доставки еды', thumbnail: '14bac.png', sizeLabel: '2 КБ', icon: 'EB5F', content: 'cbbfc.png' },
  { id: 'survey', type: 'survey', name: 'Опрос.sabyform', thumbnail: 'bb1dc.png', icon: 'E66D' },
  { id: 'sheet', type: 'sheet', name: 'Найм сотрудников.xlsx', thumbnail: '3b316.png', sizeLabel: '11 КБ', icon: 'E737', color: '#298e3c', content: 'hiring' },
  { id: 'pdf', type: 'pdf', name: 'Как нанять удаленного сотрудника.pdf', thumbnail: '34f41.png', sizeLabel: '31 КБ', icon: 'E734', color: '#c2140a', content: '5b089.png' },
  { id: 'docx', type: 'docx', name: 'Как нанять удаленного сотрудника.docx', thumbnail: '90786.png', sizeLabel: '18 КБ', icon: 'E736', content: 'hiring-docx' },
  { id: 'diagram', type: 'diagram', name: 'Схема 1', title: 'Схема', thumbnail: '734eb.png', sizeLabel: '267 КБ', icon: 'EBF2', content: { grid: 'dcf6b.png', connector: '808a7.svg' } },
  { id: 'pptx', type: 'pptx', name: 'Открытая мастерская.pptx', thumbnail: 'a29a3.png', sizeLabel: '2.1 МБ', icon: 'E733', color: '#db4200', contained: true, content: ['269fd.png', 'workshop-slide-2.png', 'workshop-slide-3.png'] },
  { id: 'dashboard', type: 'dashboard', name: 'Дашборд', thumbnail: 'f0ea7.png', sizeLabel: '3 КБ', icon: 'E747', content: 'dashboard' },
  { id: 'section', type: 'section', name: 'Новая секция', thumbnail: '36bf5.png', sizeLabel: '1 КБ', icon: 'EBDF', contained: true, content: '9aabf.png' },
  { id: 'link', type: 'link', name: 'Saby - система для управления бизнесом', thumbnail: 'eefe8.png', favicon: '9b037.svg', url: 'https://saby.ru/', description: 'Ведите бизнес в одной системе — Saby. Обменивайтесь документами, ведите бухгалтерию и финансы, автоматизируйте бизнес, проводите совещания, ставьте задачи и рассчитывайте выплаты сотрудникам (ранее СБИС или sbis).' },
  { id: 'mp3', type: 'audio', name: 'Да я люблю тебя.mp3', trackTitle: 'Да Я Люблю Тебя (Мем)', preview: '241a1.svg', sizeLabel: '1 МБ', icon: 'E73C', content: 'da_ya_lyublyu_tebya_mem-mob4ik.com.mp3' },
  { id: 'xml', type: 'xml', name: 'План адаптации сотрудника.xml', thumbnail: '3bf72.png', sizeLabel: '2 КБ', icon: 'E738', color: '#ccc', content: 'onboarding-plan.xml' },
  { id: 'html', type: 'html', name: 'План адаптации сотрудника.html', thumbnail: '4a731.png', sizeLabel: '3 КБ', icon: 'EAB7', color: '#db4200', content: 'onboarding-plan.html' },
  { id: 'txt', type: 'txt', name: 'Чек-лист первого рабочего дня.txt', thumbnail: 'a8c99.png', sizeLabel: '1 КБ', icon: 'E732', color: '#ccc', content: 'first-day-checklist.txt' },
];

const navigation = {
  docx: [{ id: 'docx-page-1', title: 'Страница 1' }, { id: 'docx-page-2', title: 'Страница 2' }],
  pdf: [{ id: 'pdf-page-1', title: 'Страница 1' }, { id: 'pdf-page-2', title: 'Страница 2' }],
  pptx: [1, 2, 3].map(number => ({ id: `slide-${number}`, title: `Слайд ${number}` })),
  site: [{ id: 'site-page-1', title: 'Страница 1', home: true }],
  // Anchor offsets are measured in the 844 × 1646 document asset used by L07–L12.
  sabydoc: [
    { id: 'remote-work', title: 'Что считается удаленной работой', anchorY: 194 },
    { id: 'remote-employee', title: 'Оформляем удаленного сотрудника', anchorY: 637, children: [
      { id: 'document-exchange', title: 'Как обмениваться документами', anchorY: 741 },
      { id: 'electronic-hiring', title: 'Инструкция по электронному приему на работу', anchorY: 1304, wrap: true, children: [
        { id: 'electronic-signature', title: 'Оформляем электронную подпись', anchorY: 1351 },
      ] },
    ] },
  ],
};

const readerTypes = new Set(['video', 'photo', 'sabydoc', 'site', 'sheet', 'pdf', 'docx', 'diagram', 'pptx', 'dashboard', 'section', 'xml', 'html', 'txt']);
export const canReadFile = file => Boolean(file?.content && readerTypes.has(file.type));
export const canOpenFromStrip = file => canReadFile(file) || file?.type === 'link' || file?.type === 'audio';

export const browserEditorEntry = Object.freeze({
  docx: 'chooser', pptx: 'chooser', sheet: 'chooser', photo: 'chooser', video: 'direct',
});

export const files = records.map(file => ({ preview: file.thumbnail, ...file, editable: ['site', 'sabydoc', 'diagram', 'dashboard'].includes(file.type), navigation: navigation[file.type] }));
