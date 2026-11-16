import { asset, icon } from './ui.js';

function chart(kind) {
  const assets = kind === 'discount' ? ['24f7c.svg','dcd6e.svg','222e2.svg','2915b.svg'] : ['c85ab.svg','d3781.svg','b6e05.svg','ddcd2.svg'];
  return `<div class="dashboard-ring" role="img" aria-label="${kind === 'discount' ? 'Скидка 51.2%' : 'Компании: СБИС, Контур, Другие, Не подключен'}">${assets.map((name,index) => `<img class="ring-part part-${index}" src="${asset(name)}" alt="">`).join('')}${kind === 'discount' ? '<div class="ring-label"><small>Скидка</small><span>51.2%</span></div>' : ''}</div>`;
}

const discounts = [
  ['#d9d9d9','5% постоянные покупатели','141','58 204'], ['#7cb5ec','10 VIP','213','34 680'],
  ['#ff9c6c','20% в день','96','26 998'], ['#555bb2','Новогодние праздники','120','14 654'],
];
const companies = [['#0c94ff','СБИС','18 204'],['#00c5a8','Контур','845'],['#fec63f','Другие','945'],['#999','Не подключен','2 856']];
const accounts = [
  ['РЖД, ПАО','Ярославль','78421847848'], ['Абрау-Дюрсо, ООО','Гагры','78464564565'],
  ['Альберто, ООО','Ярославль','78453543333'], ['Транснефть, ПАО','Москва','7825706086'],
  ['ПАО СБЕРБАНК','Москва','7707083893'], ['ТК "Мегаполис", АО','Булат...','7825706086'],
  ['БАНК ВТБ (ПАО)','Санкт-Пе...','7825706086'], ['Новатэк, ПАО','Тарко-Сале','7825706086'],
];
const heading = title => `<h2><img src="${asset(title === 'Входящие' ? 'd4473.svg' : 'a302e.svg')}" alt="">${title}</h2>`;
const agencyIcon = `<span class="agency-icon"><img src="${asset('33324.png')}" alt=""></span>`;

function outgoing() {
  return `<section class="dashboard-widget outgoing">${heading('Исходящие')}<div class="dashboard-widget-body">${[
    ['ТД "Аргус"','Мосводоканал','Заказ от покупателя 16.05.20 №6',''],
    ['Основа','Белый ветер Цифровой','Акт на сумму 1 600 р.',''],
    ['ОАО "Азимут"','','Заказ от покупателя 16.05.20','Мили'],
  ].map(([name,company,description,tag])=>`<div class="dashboard-document"><div><div><strong>${name}</strong> <span class="faded">${company}</span></div><small>${description}</small></div><span class="document-tag">${tag}</span><span class="dashboard-amount">${icon('E694',12)}456<small>.82</small></span></div>`).join('')}</div></section>`;
}

function incoming() {
  return `<section class="dashboard-widget incoming">${heading('Входящие')}<div class="dashboard-widget-body">${[
    ['Основа','Акт 31.05.21 №65, Счет на оплат..','Ромашка','456'],
    ['ТД "Аргус"','Акт № 4568, Счет на оплату, Фа...','Белый ветер Цифровой','323'],
    ['Цитроникс','Скан от 2021-06-0 09-45-22.jpg, Скан от','Золотое Дно','316'],
  ].map(([name,description,company,amount], index)=>`${index === 2 ? '<div class="dashboard-processed"><span>Обработанные</span></div>' : ''}<div class="dashboard-document"><div><strong>${name}</strong><small>${description}</small></div><span class="document-tag">${company}</span><div class="incoming-status"><span class="dashboard-amount">${icon('E694',12)}${amount}<small>.82</small></span>${index < 2 ? '<span class="approval">Утверждение</span>' : ''}</div></div>`).join('')}</div></section>`;
}

export function renderDashboard(editing) {
  return `<main class="viewer-workspace dashboard-workspace"><div class="dashboard-layout">
    <div class="dashboard-top"><section class="dashboard-widget discounts"><div class="discount-totals"><div><small>Сумма скидки</small> <span>128 256</span></div><div><small>Продажи</small><small>Сумма</small><span class="faded">1 024</span><span>512 384</span></div></div><div class="dashboard-chart-row">${chart('discount')}<div class="dashboard-legend">${discounts.map(([color,label,sales,sum])=>`<div><span class="legend-label"><i style="background:${color}"></i>${label}</span><span class="faded">${sales}</span><span>${sum}</span></div>`).join('')}</div></div></section>
    <section class="dashboard-widget company-chart">${heading('Компании')}<div class="dashboard-chart-row"><div class="dashboard-legend">${companies.map(([color,label,sum])=>`<div><span class="legend-label"><i style="background:${color}"></i>${label}</span><span>${sum}</span></div>`).join('')}</div>${chart('companies')}</div></section></div>
    <div class="dashboard-middle">${outgoing()}<section class="dashboard-widget company-list">${heading('Компании')}<div class="dashboard-widget-body">${accounts.map(([name,location,number])=>`<div><span>${name} <span class="faded">${location}</span></span><span class="faded">${number}</span></div>`).join('')}</div></section>
    <section class="dashboard-widget reporting"><div class="dashboard-widget-body"><div><span class="report-warning">надо сдать</span> 1056</div><div class="report-item">${agencyIcon}<div><span class="report-agency">Статистика</span><small>3-Ф Просроченная задолженность по ЗП за Фев’22<br>‘ГБ’ г.Кувандыка, ГБУЗ</small></div><span>00:12</span></div><p class="report-deadline">Необходимо отправить до 1 марта</p><div><span class="report-warning">изменения календаря отчетности</span> 72</div><div class="report-item">${agencyIcon}<div><span class="report-agency">Статистика</span><small>Форма 11 Основные фонды за 2021</small></div><span>16 фев</span></div><p class="report-deadline">Необходимо отправить до 1 апр.</p></div></section></div>
    <div class="dashboard-bottom">${incoming()}${editing ? `<div class="dashboard-insert" aria-label="Добавление блока"><button type="button">${icon('EAEE',24)}<span>Колонки</span></button><button type="button" class="insert-widget">${icon('E6D3',32)}<span>Виджет</span></button><button type="button">${icon('EAC3',24)}<span>Строки</span></button></div>` : ''}</div>
  </div></main>`;
}
