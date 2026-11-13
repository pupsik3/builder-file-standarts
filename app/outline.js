import { icon, iconButton } from './ui.js';

export function flattenNavigation(items = []) {
  return items.flatMap(item => [item, ...flattenNavigation(item.children)]);
}

export function createOutlineState(file) {
  return {
    placement: 'collapsed',
    selected: file.navigation?.[0]?.id,
    expanded: new Set(flattenNavigation(file.navigation).filter(item => item.children).map(item => item.id)),
  };
}

function navigationRows(file, state, items = file.navigation, level = 0) {
  const doc = file.type === 'sabydoc';
  return items.map(item => {
    const selected = state.selected === item.id;
    const expanded = state.expanded.has(item.id);
    return `<div class="outline-row${selected ? ' current' : ''}${item.wrap ? ' wrap-row' : ''}" data-navigation-row="${item.id}" style="--outline-level:${level}">
      ${doc ? item.children ? iconButton(`${expanded ? 'Свернуть' : 'Раскрыть'} «${item.title}»`, expanded ? 'EB8A' : 'EB89', { size: 12, className: 'outline-expander', action: 'outline-branch', extra: `data-id="${item.id}" aria-expanded="${expanded}" aria-controls="branch-${item.id}"` }) : '<span class="outline-expander-space"></span>' : ''}
      <button type="button" class="outline-select" data-action="outline-select" data-id="${item.id}"${selected ? ` aria-current="${doc ? 'location' : 'page'}"` : ''}>${item.title}</button>
      ${doc ? '' : `<span class="outline-home" aria-hidden="true">${icon('E64C')}</span><span class="outline-row-tools">${iconButton('Видимость страницы', 'E651', { size: 24 })}${iconButton('Действия страницы', 'E9D9')}</span>`}
    </div>${item.children ? `<div id="branch-${item.id}"${expanded ? '' : ' hidden'}>${navigationRows(file, state, item.children, level + 1)}</div>` : ''}`;
  }).join('');
}

function expandAllButton(state) {
  const collapse = state.expanded.size > 1;
  return iconButton(collapse ? 'Свернуть все' : 'Раскрыть все', collapse ? 'E961' : 'E962', { size: 16, className: 'outline-expand-all', action: 'outline-all', extra: `aria-pressed="${collapse}"` });
}

export function renderOutline(file, state) {
  const doc = file.type === 'sabydoc';
  const title = doc ? 'Оглавление' : 'Страницы';
  const docked = state.placement === 'docked';
  return `<aside class="viewer-outline" aria-label="${title}" data-outline="${file.type}" data-placement="${state.placement}">
    <button type="button" class="outline-trigger" data-action="outline-open" aria-label="Открыть ${title.toLowerCase()}" aria-expanded="${state.placement !== 'collapsed'}" aria-controls="outline-panel">
      <span class="outline-markers" aria-hidden="true">${flattenNavigation(file.navigation).map(item => `<span${state.selected === item.id ? ' class="selected"' : ''}></span>`).join('')}</span>
    </button>
    <div class="outline-flyout" id="outline-panel"${state.placement === 'collapsed' ? ' inert' : ''}>
      <div class="outline-heading"><div class="outline-heading-title"><strong>${title}</strong>${doc ? expandAllButton(state) : iconButton('Добавить страницу', 'EADD', { className: 'outline-add' })}</div>
        ${iconButton(docked ? 'Открепить панель' : 'Закрепить панель', docked ? 'EBFA' : 'EBFB', { size: 24, className: 'outline-pin', action: 'outline-pin', extra: `aria-pressed="${docked}"` })}
      </div>
      <nav class="outline-content" aria-label="${title}">${navigationRows(file, state)}</nav>
    </div>
  </aside>`;
}

// Patch navigation alone so pinning, expansion and selection never replace the document.
export function syncOutline(root, file, state) {
  const outline = root.querySelector('.viewer-outline');
  if (!outline) return;
  // Resize reference frames: 1180 px with the toolbar, 820 px with both sidebars.
  // Editing reserves space for the right sidebar even while it is closed.
  const editing = root.querySelector('.viewer-shell').dataset.mode === 'edit';
  const canDock = root.clientWidth - 366 - (editing ? 414 : 54) >= (editing ? 820 : 1180) * .7;
  if (!canDock && state.placement === 'docked') state.placement = 'collapsed';
  outline.dataset.placement = state.placement;
  outline.closest('.viewer-main').dataset.outlinePlacement = state.placement;
  outline.querySelector('.outline-trigger').setAttribute('aria-expanded', state.placement !== 'collapsed');
  outline.querySelector('.outline-flyout').inert = state.placement === 'collapsed';
  const pin = outline.querySelector('.outline-pin');
  pin.disabled = !canDock;
  const docked = state.placement === 'docked';
  const label = docked ? 'Открепить панель' : 'Закрепить панель';
  pin.setAttribute('aria-pressed', docked);
  pin.setAttribute('aria-label', label);
  pin.title = canDock ? label : 'Недостаточно места для закрепления панели';
  pin.querySelector('.icon').textContent = String.fromCodePoint(parseInt(docked ? 'EBFA' : 'EBFB', 16));
  for (const row of outline.querySelectorAll('[data-navigation-row]')) {
    const selected = row.dataset.navigationRow === state.selected;
    row.classList.toggle('current', selected);
    const button = row.querySelector('.outline-select');
    if (selected) button.setAttribute('aria-current', file.type === 'site' ? 'page' : 'location');
    else button.removeAttribute('aria-current');
    const expander = row.querySelector('.outline-expander');
    if (expander) {
      const expanded = state.expanded.has(row.dataset.navigationRow);
      expander.setAttribute('aria-expanded', expanded);
      expander.setAttribute('aria-label', `${expanded ? 'Свернуть' : 'Раскрыть'} «${button.textContent}»`);
      expander.querySelector('.icon').textContent = String.fromCodePoint(parseInt(expanded ? 'EB8A' : 'EB89', 16));
      root.querySelector(`#branch-${row.dataset.navigationRow}`).hidden = !expanded;
    }
  }
  const all = outline.querySelector('.outline-expand-all');
  if (all) {
    const collapse = state.expanded.size > 1;
    const label = collapse ? 'Свернуть все' : 'Раскрыть все';
    all.setAttribute('aria-label', label);
    all.title = label;
    all.setAttribute('aria-pressed', collapse);
    all.querySelector('.icon').textContent = String.fromCodePoint(parseInt(collapse ? 'E961' : 'E962', 16));
  }
  outline.querySelectorAll('.outline-markers span').forEach((marker, index) => {
    marker.classList.toggle('selected', flattenNavigation(file.navigation)[index].id === state.selected);
  });
}

export function bindOutline(root, file, state) {
  const outline = root.querySelector('.viewer-outline');
  if (!outline) return;
  let pointerInside = false;
  const sync = () => syncOutline(root, file, state);
  const open = () => { if (state.placement === 'collapsed') { state.placement = 'overlay'; sync(); } };
  const close = () => { if (state.placement === 'overlay' && !pointerInside && !outline.matches(':has(:focus-visible)')) { state.placement = 'collapsed'; sync(); } };
  outline.addEventListener('pointerenter', () => { pointerInside = true; open(); });
  outline.addEventListener('pointerleave', () => { pointerInside = false; close(); });
  outline.addEventListener('focusin', open);
  outline.addEventListener('focusout', event => {
    if (!outline.contains(event.relatedTarget) && state.placement === 'overlay' && !pointerInside) {
      state.placement = 'collapsed'; sync();
    }
  });
  outline.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const action = button.dataset.action;
    if (action === 'outline-open') open();
    if (action === 'outline-pin') {
      state.placement = state.placement === 'docked' ? 'overlay' : 'docked';
    }
    if (action === 'outline-branch') {
      if (state.expanded.has(button.dataset.id)) state.expanded.delete(button.dataset.id);
      else state.expanded.add(button.dataset.id);
    }
    if (action === 'outline-all') {
      const collapse = state.expanded.size > 1;
      state.expanded = new Set(collapse ? [] : flattenNavigation(file.navigation).filter(item => item.children).map(item => item.id));
    }
    if (action === 'outline-select') {
      state.selected = button.dataset.id;
      if (file.type === 'site') root.querySelector('.site-page').dataset.page = state.selected;
      else {
        const target = [...root.querySelectorAll(`[data-heading="${state.selected}"]`)].find(element => element.getClientRects().length);
        const workspace = root.querySelector('.document-paper');
        workspace.scrollTop += target.getBoundingClientRect().top - workspace.getBoundingClientRect().top - 12;
      }
    }
    sync();
  });
  const observer = new ResizeObserver(sync);
  observer.observe(root);
  sync();
  return () => observer.disconnect();
}
