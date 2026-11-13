const records = [
  { id: 'video', type: 'video', name: 'Видео.mp4', thumbnail: '945e2.png', sizeLabel: '2.7 МБ', media: true, duration: '0:05' },
  { id: 'photo', type: 'photo', name: 'Фото.jpg', thumbnail: 'e82b3.jpg', sizeLabel: '1 МБ', media: true },
  { id: 'sabydoc', type: 'sabydoc', name: 'Как нанять удаленного сотрудника', thumbnail: '6e31d.png', sizeLabel: '16 КБ', icon: 'EBF1', color: '#5a49ab', content: '5b089.png' },
  { id: 'site', type: 'site', name: 'С чистого листа', title: 'Онлайн-сервис доставки еды', thumbnail: '14bac.png', sizeLabel: '2 КБ', icon: 'EB5F', content: 'cbbfc.png' },
  { id: 'survey', type: 'survey', name: 'Опрос.sabyform', thumbnail: 'bb1dc.png', icon: 'E66D' },
  { id: 'sheet', type: 'sheet', name: 'Найм сотрудников.xlsx', thumbnail: '3b316.png', sizeLabel: '11 КБ', icon: 'E737', color: '#298e3c' },
  { id: 'pdf', type: 'pdf', name: 'Как нанять удаленного сотрудника.pdf', thumbnail: '34f41.png', sizeLabel: '31 КБ', icon: 'E734', color: '#c2140a' },
  { id: 'docx', type: 'docx', name: 'Как нанять удаленного сотрудника.docx', thumbnail: '90786.png', sizeLabel: '18 КБ', icon: 'E736' },
  { id: 'diagram', type: 'diagram', name: 'Схема 1', title: 'Схема', thumbnail: '734eb.png', sizeLabel: '267 КБ', icon: 'EBF2', content: { grid: 'dcf6b.png', connector: '808a7.svg' } },
  { id: 'pptx', type: 'pptx', name: 'Открытая мастерская.pptx', thumbnail: 'a29a3.png', sizeLabel: '2.1 МБ', icon: 'E733', color: '#db4200', contained: true },
  { id: 'dashboard', type: 'dashboard', name: 'Дашборд', thumbnail: 'f0ea7.png', sizeLabel: '3 КБ', icon: 'E747' },
  { id: 'section', type: 'section', name: 'Новая секция', thumbnail: '36bf5.png', sizeLabel: '1 КБ', icon: 'EBDF', contained: true },
];

const navigation = {
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

export const files = records.map(file => ({ preview: file.thumbnail, ...file, navigation: navigation[file.type] }));
