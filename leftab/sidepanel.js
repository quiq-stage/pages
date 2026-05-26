let allTabs = [];
let pinnedPages = []; // [{ url, title, favIconUrl }]
let searchQuery = '';
let currentView = 'tabs';
let dragSrcIndex = null;
let dragSrcTab = null;

const viewTabs      = document.getElementById('view-tabs');
const viewBookmarks = document.getElementById('view-bookmarks');
const pinnedSection = document.getElementById('pinned-section');
const pinnedTiles   = document.getElementById('pinned-tiles');
const searchInput   = document.getElementById('search');
const newTabBtn     = document.getElementById('new-tab-btn');
const navTabs       = document.getElementById('nav-tabs');
const navBookmarks  = document.getElementById('nav-bookmarks');

// ── Pinned pages ──────────────────────────────────────────────────────────────

async function loadPinned() {
  const result = await chrome.storage.local.get('pinnedPages');
  pinnedPages = result.pinnedPages || [];
  renderPinned();
}

async function savePinned() {
  await chrome.storage.local.set({ pinnedPages });
  renderPinned();
  renderTabs(); // refresh pin button states
}

function isPinned(url) {
  return pinnedPages.some(p => p.url === url);
}

function pin(tab) {
  if (!isPinned(tab.url)) {
    pinnedPages.push({ url: tab.url, title: tab.title, favIconUrl: tab.favIconUrl });
    savePinned();
  }
}

function unpin(url) {
  pinnedPages = pinnedPages.filter(p => p.url !== url);
  savePinned();
}

function renderPinned() {
  pinnedTiles.innerHTML = '';

  if (pinnedPages.length === 0) {
    pinnedSection.classList.remove('has-pins');
    return;
  }

  pinnedSection.classList.add('has-pins');
  const openUrls = new Set(allTabs.map(t => t.url));

  pinnedPages.forEach((page, index) => {
    const tile = document.createElement('div');
    tile.className = 'pin-tile' + (openUrls.has(page.url) ? ' is-open' : '');
    tile.title = page.title || page.url;
    tile.draggable = true;

    // Favicon
    const faviconUrl = page.favIconUrl && !page.favIconUrl.startsWith('chrome://')
      ? page.favIconUrl
      : `https://www.google.com/s2/favicons?domain=${encodeURIComponent(tryHostname(page.url))}&sz=32`;

    const img = document.createElement('img');
    img.src = faviconUrl;
    img.onerror = () => img.replaceWith(makeLetterTile(page.title));

    // Unpin button
    const unpinBtn = document.createElement('button');
    unpinBtn.className = 'pin-unpin';
    unpinBtn.textContent = '×';
    unpinBtn.title = 'Unpin';
    unpinBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      unpin(page.url);
    });

    tile.append(img, unpinBtn);

    // Click to switch/open
    tile.addEventListener('click', () => {
      const existing = allTabs.find(t => t.url === page.url);
      if (existing) {
        chrome.tabs.update(existing.id, { active: true });
        chrome.windows.update(existing.windowId, { focused: true });
      } else {
        chrome.tabs.create({ url: page.url });
      }
    });

    // Drag to reorder
    tile.addEventListener('dragstart', (e) => {
      dragSrcIndex = index;
      e.dataTransfer.effectAllowed = 'move';
      // Defer so the tile doesn't visually disappear before ghost is created
      requestAnimationFrame(() => tile.classList.add('dragging'));
    });

    tile.addEventListener('dragend', () => {
      tile.classList.remove('dragging');
      clearDropIndicators();
    });

    tile.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      clearDropIndicators();
      const { left, width } = tile.getBoundingClientRect();
      const before = e.clientX < left + width / 2;
      tile.classList.add(before ? 'drop-before' : 'drop-after');
    });

    tile.addEventListener('dragleave', () => clearDropIndicators());

    tile.addEventListener('drop', (e) => {
      e.preventDefault();
      if (dragSrcIndex === null || dragSrcIndex === index) return;
      const { left, width } = tile.getBoundingClientRect();
      const before = e.clientX < left + width / 2;
      const targetIndex = before ? index : index + 1;
      const [moved] = pinnedPages.splice(dragSrcIndex, 1);
      const insertAt = targetIndex > dragSrcIndex ? targetIndex - 1 : targetIndex;
      pinnedPages.splice(insertAt, 0, moved);
      dragSrcIndex = null;
      clearDropIndicators();
      savePinned();
    });

    pinnedTiles.appendChild(tile);
  });
}

function clearDropIndicators() {
  pinnedTiles.querySelectorAll('.drop-before, .drop-after')
    .forEach(el => el.classList.remove('drop-before', 'drop-after'));
}

function makeLetterTile(title) {
  const el = document.createElement('div');
  el.className = 'letter-icon';
  el.textContent = (title || '?')[0].toUpperCase();
  return el;
}

function tryHostname(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

// ── View switching ────────────────────────────────────────────────────────────

function switchView(view) {
  currentView = view;
  searchInput.value = '';
  searchQuery = '';

  viewTabs.classList.toggle('active', view === 'tabs');
  viewBookmarks.classList.toggle('active', view === 'bookmarks');
  navTabs.classList.toggle('active', view === 'tabs');
  navBookmarks.classList.toggle('active', view === 'bookmarks');
  newTabBtn.classList.toggle('visible', view === 'tabs');

  if (view === 'bookmarks') renderBookmarks();
  else renderTabs();
}

navTabs.addEventListener('click', () => switchView('tabs'));
navBookmarks.addEventListener('click', () => switchView('bookmarks'));

// ── Search ────────────────────────────────────────────────────────────────────

searchInput.addEventListener('input', () => {
  searchQuery = searchInput.value;
  if (currentView === 'tabs') renderTabs();
  else renderBookmarks();
});

// ── Tabs ──────────────────────────────────────────────────────────────────────

async function loadTabs() {
  const win = await chrome.windows.getCurrent();
  allTabs = await chrome.tabs.query({ windowId: win.id });
  if (currentView === 'tabs') renderTabs();
  renderPinned(); // keep open-state dots in sync
}

function renderTabs() {
  const q = searchQuery.toLowerCase();
  const unpinned = allTabs.filter(t => !isPinned(t.url));
  const filtered = q
    ? unpinned.filter(t =>
        (t.title || '').toLowerCase().includes(q) ||
        (t.url || '').toLowerCase().includes(q))
    : unpinned;

  if (filtered.length === 0) {
    viewTabs.innerHTML = `<div class="empty-state">${q ? 'No matching tabs.' : 'No tabs open.'}</div>`;
    return;
  }

  viewTabs.innerHTML = '';
  for (const tab of filtered) {
    viewTabs.appendChild(makeTabItem(tab));
  }
}

function makeTabItem(tab) {
  const item = document.createElement('div');
  item.className = 'tab-item' +
    (tab.active ? ' active' : '') +
    (tab.status === 'loading' ? ' loading' : '');

  const favicon = makeFavicon(tab);

  const title = document.createElement('span');
  title.className = 'tab-title';
  title.textContent = tab.title || tab.url || 'New Tab';
  title.title = tab.url || '';

  // Action buttons (shown on hover)
  const actions = document.createElement('div');
  actions.className = 'tab-actions';

  const pinBtn = document.createElement('button');
  pinBtn.className = 'tab-btn' + (isPinned(tab.url) ? ' pinned' : '');
  pinBtn.title = isPinned(tab.url) ? 'Unpin' : 'Pin to top';
  pinBtn.innerHTML = `<svg viewBox="0 0 16 16" width="13" height="13" fill="currentColor">
    <path d="M9.828 1a1 1 0 0 1 .707.293l4.172 4.172a1 1 0 0 1-.05 1.464l-2.5 2.157a1 1 0 0 1-.364.198l-2.05.547-.9 3.15a.5.5 0 0 1-.822.216L5.96 10.96 2.28 14.64a.5.5 0 0 1-.707-.708l3.681-3.681-2.236-2.063a.5.5 0 0 1 .216-.822l3.15-.9.547-2.05a1 1 0 0 1 .198-.364l2.157-2.5A1 1 0 0 1 9.828 1z"/>
  </svg>`;
  pinBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (isPinned(tab.url)) unpin(tab.url);
    else pin(tab);
  });

  const closeBtn = document.createElement('button');
  closeBtn.className = 'tab-btn close';
  closeBtn.title = 'Close tab';
  closeBtn.textContent = '×';
  closeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    chrome.tabs.remove(tab.id);
  });

  actions.append(pinBtn, closeBtn);
  item.append(favicon, title, actions);

  item.addEventListener('click', () => {
    chrome.tabs.update(tab.id, { active: true });
    chrome.windows.update(tab.windowId, { focused: true });
  });

  item.draggable = true;

  item.addEventListener('dragstart', (e) => {
    dragSrcTab = tab;
    e.dataTransfer.effectAllowed = 'move';
    requestAnimationFrame(() => item.classList.add('dragging'));
  });

  item.addEventListener('dragend', () => {
    dragSrcTab = null;
    item.classList.remove('dragging');
    clearTabDropIndicators();
  });

  item.addEventListener('dragover', (e) => {
    if (!dragSrcTab || dragSrcTab.id === tab.id) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    clearTabDropIndicators();
    const { top, height } = item.getBoundingClientRect();
    item.classList.add(e.clientY < top + height / 2 ? 'drop-above' : 'drop-below');
  });

  item.addEventListener('dragleave', () => clearTabDropIndicators());

  item.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!dragSrcTab || dragSrcTab.id === tab.id) return;
    const { top, height } = item.getBoundingClientRect();
    const before = e.clientY < top + height / 2;
    const src = dragSrcTab.index;
    const tgt = tab.index;
    const index = before
      ? (src < tgt ? tgt - 1 : tgt)
      : (src < tgt ? tgt : tgt + 1);
    chrome.tabs.move(dragSrcTab.id, { index });
    clearTabDropIndicators();
  });

  return item;
}

function clearTabDropIndicators() {
  viewTabs.querySelectorAll('.drop-above, .drop-below')
    .forEach(el => el.classList.remove('drop-above', 'drop-below'));
}

function makeFavicon(tab) {
  const url = tab.favIconUrl;
  if (url && !url.startsWith('chrome://')) {
    const img = document.createElement('img');
    img.className = 'tab-favicon';
    img.src = url;
    img.onerror = () => img.replaceWith(makeLetterIcon(tab.title));
    return img;
  }
  return makeLetterIcon(tab.title);
}

function makeLetterIcon(title) {
  const el = document.createElement('div');
  el.className = 'favicon-placeholder';
  el.textContent = (title || '?')[0].toUpperCase();
  return el;
}

newTabBtn.addEventListener('click', () => chrome.tabs.create({}));

chrome.tabs.onCreated.addListener(loadTabs);
chrome.tabs.onRemoved.addListener(loadTabs);
chrome.tabs.onActivated.addListener(loadTabs);
chrome.tabs.onMoved.addListener(loadTabs);
chrome.tabs.onUpdated.addListener((_id, change) => {
  if (change.title || change.favIconUrl || change.status) loadTabs();
});

// ── Bookmarks ─────────────────────────────────────────────────────────────────

async function renderBookmarks() {
  const q = searchQuery.toLowerCase();
  viewBookmarks.innerHTML = '';

  if (q) {
    const results = await chrome.bookmarks.search(q);
    if (results.length === 0) {
      viewBookmarks.innerHTML = '<div class="empty-state">No bookmarks found.</div>';
      return;
    }
    for (const bm of results) {
      if (bm.url) viewBookmarks.appendChild(makeBookmarkLink(bm));
    }
    return;
  }

  const [root] = await chrome.bookmarks.getTree();
  for (const topFolder of root.children) {
    for (const child of topFolder.children || []) {
      if (child.children) viewBookmarks.appendChild(makeFolderEl(child, true));
      else if (child.url) viewBookmarks.appendChild(makeBookmarkLink(child));
    }
  }
}

function makeFolderEl(node, startOpen = false) {
  const wrapper = document.createElement('div');
  wrapper.className = 'bm-folder' + (startOpen ? ' open' : '');

  const label = document.createElement('div');
  label.className = 'bm-folder-label';
  label.innerHTML = `
    <span class="arrow">▶</span>
    <span class="bm-folder-icon">📁</span>
    <span style="flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${escHtml(node.title || 'Folder')}</span>
  `;
  label.addEventListener('click', () => wrapper.classList.toggle('open'));

  const children = document.createElement('div');
  children.className = 'bm-children';

  for (const child of node.children || []) {
    if (child.children) children.appendChild(makeFolderEl(child));
    else if (child.url) children.appendChild(makeBookmarkLink(child));
  }

  wrapper.append(label, children);
  return wrapper;
}

function makeBookmarkLink(node) {
  const a = document.createElement('a');
  a.className = 'bm-link';
  a.title = node.url;

  const faviconUrl = `https://www.google.com/s2/favicons?domain=${encodeURIComponent(tryHostname(node.url))}&sz=16`;
  const img = document.createElement('img');
  img.className = 'bm-favicon';
  img.src = faviconUrl;
  img.onerror = () => img.remove();

  const title = document.createElement('span');
  title.className = 'bm-title';
  title.textContent = node.title || node.url;

  a.append(img, title);
  a.addEventListener('click', (e) => {
    e.preventDefault();
    chrome.tabs.create({ url: node.url });
  });

  return a;
}

function escHtml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ── Init ──────────────────────────────────────────────────────────────────────

Promise.all([loadPinned(), loadTabs()]).then(() => {
  const active = viewTabs.querySelector('.tab-item.active');
  if (active) active.scrollIntoView({ block: 'nearest' });
});
