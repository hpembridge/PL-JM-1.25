// ── Exploration: Detail Select ────────────────────────────────────────
// Prototype interactions only: selecting a detail in the rail swaps which
// pane panel is visible, plus a couple of layout controls.

function dsSelectDetail(id, btn) {
  document.querySelectorAll('.ds-list-item').forEach(i => i.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.ds-pane-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.panel === String(id));
  });
}

// Prototype convenience — adds a placeholder row so the list can be seen longer.
function dsAddDetail() {
  const list = document.getElementById('ds-list');
  const addBtn = list.querySelector('.add-list-btn');
  const items = list.querySelectorAll('.ds-list-item');
  const next = items.length + 1;
  const item = items[items.length - 1].cloneNode(true);
  item.classList.remove('active', 'has-content');
  item.dataset.detail = next;
  item.querySelector('.ds-list-item-num').textContent = next;
  item.querySelector('.ds-list-item-name').textContent = 'New Detail';
  item.setAttribute('onclick', 'dsSelectDetail(' + next + ', this)');
  list.insertBefore(item, addBtn);
  document.getElementById('ds-list-count').textContent = next;
}

// ── Full-screen actions sheet (small viewports) ──
function dsOpenMenu() {
  const sheet = document.getElementById('ds-menu-sheet');
  sheet.hidden = false;
  document.body.style.overflow = 'hidden';
  document.querySelector('.ds-menu-btn')?.setAttribute('aria-expanded', 'true');
}

function dsCloseMenu() {
  const sheet = document.getElementById('ds-menu-sheet');
  sheet.hidden = true;
  document.body.style.overflow = '';
  document.querySelector('.ds-menu-btn')?.setAttribute('aria-expanded', 'false');
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') dsCloseMenu();
});
