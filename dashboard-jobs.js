// ── Dashboard board ───────────────────────────────────────────────────
// The kanban board from PL-JOBS-DASHBOARDS, with job status as the lane
// instead of scan location. Everything here is prototype mock data and
// rendering; in Angular the lanes are an @for over the status list and
// the cards an @for over the jobs in each status.

// Lanes, in board order.
const DASHBOARD_STATUSES = [
  'On Deck',
  'On Hold',
  'In Progress',
  'Proof Out',
  'Revisions Needed',
  'Approved for Production',
  'Completed Production',
  'Prototype Production',
  'Prototype Completed',
  'Prototype Out',
];

// Production type → stripe colour class (dashboard-board.css)
const DASH_PROD_CLASS = {
  'Bindery': 'prod-bindery',
  'Printing': 'prod-printing',
  'PDF Only': 'prod-pdf',
  'Paper': 'prod-paper',
  'Woodshop Only': 'prod-wood',
  'Menu Hardware': 'prod-hardware',
};

const DASH_PROD_TYPES = Object.keys(DASH_PROD_CLASS);

// ── Mock jobs ──
const DASH_CUSTOMERS = [
  { customer: 'Pizza Hut AIGP', mgmtGroup: 'Pizza Hut Corporation' },
  { customer: 'Marriott Downtown Cleveland', mgmtGroup: 'Marriott International' },
  { customer: 'D A R', mgmtGroup: 'Coltons Management Group' },
  { customer: 'Omni Severin Hotel', mgmtGroup: 'Omni Hotels & Resorts' },
  { customer: 'Village Inn #218', mgmtGroup: 'VI Operating Co.' },
];

const DASH_DESCRIPTIONS = [
  'Dinner Menu — Spring Refresh', 'Wine List — Revised Covers', 'Banquet Event Order — Q2 Template',
  'Leather Menu Covers — 8.5×11 — Qty 120', 'Room Service Insert — Holiday Edition',
  'Wooden Menu Board — Lobby Display', 'Breakfast Menu — Weekday', 'Kids Menu — Activity Back',
  'Cocktail List — Seasonal', 'Dessert Menu — Insert Card', 'Takeout Menu — Trifold',
  'Bar Menu — Laminated Insert', 'Brunch Menu — Weekend', 'Allergen Card — Reprint',
  'Private Dining Menu — Custom Cover', 'Table Tent — Specials', 'Menu Binder — Refill Pages',
  'Wine Spiral — Reprint', 'Poolside Menu — Laminated', 'Catering Menu — Corporate Package',
];

// How many jobs sit in each lane — enough variety to see a full board,
// a couple of quiet lanes and one empty one.
const DASH_LANE_COUNTS = [4, 2, 5, 3, 2, 3, 1, 2, 0, 1];

const DASH_JOBS = [];
(function seedJobs() {
  let jobNumber = 232390;
  DASHBOARD_STATUSES.forEach((status, s) => {
    for (let i = 0; i < DASH_LANE_COUNTS[s]; i++) {
      const n = DASH_JOBS.length;
      const prodType = DASH_PROD_TYPES[(s + i) % DASH_PROD_TYPES.length];
      const who = DASH_CUSTOMERS[(s + i) % DASH_CUSTOMERS.length];
      jobNumber -= 3 + (n % 7);
      DASH_JOBS.push({
        job: jobNumber,
        desc: DASH_DESCRIPTIONS[n % DASH_DESCRIPTIONS.length],
        customer: who.customer,
        mgmtGroup: who.mgmtGroup,
        status,
        prodType,
        prodClass: DASH_PROD_CLASS[prodType],
        jobType: ['New Job', 'Rerun w/ Changes', 'Pull-Plate'][(n) % 3],
        date: (1 + (n % 9)) + '/' + (2 + (n % 26)) + '/26',
      });
    }
  });
})();

// ── Rendering ──
const dashExpandedLanes = new Set();   // empty lanes the user has opened

function dashLegendHTML() {
  return DASH_PROD_TYPES.map(t =>
    `<span class="legend-item"><span class="legend-swatch ${DASH_PROD_CLASS[t]}"></span>${t}</span>`
  ).join('');
}

function dashCardHTML(j) {
  return `
    <div class="job-card ${j.prodClass}" onclick="dashOpenJob(${j.job})"
         title="${j.prodType} · ${j.jobType} · created ${j.date}">
      <div class="card-body">
        <div class="card-job">${j.job}</div>
        <div class="card-desc">${j.desc}</div>
        <div class="card-customer">${j.customer}</div>
        <div class="card-mgmt">${j.mgmtGroup}</div>
      </div>
      <div class="card-stripe"></div>
    </div>`;
}

function dashLaneHTML(status, jobs) {
  const collapsed = jobs.length === 0 && !dashExpandedLanes.has(status);
  return `
    <div class="lane${collapsed ? ' is-collapsed' : ''}">
      <div class="lane-header" onclick="dashToggleLane('${status}')" title="${status}">
        <span class="lane-title">${status}</span>
        <span class="lane-count">${jobs.length}</span>
        <i class="fa-solid fa-chevron-${collapsed ? 'right' : 'down'} lane-collapse-icon"></i>
      </div>
      <div class="lane-cards">
        ${jobs.length ? jobs.map(dashCardHTML).join('') : '<div class="lane-empty">Nothing here</div>'}
      </div>
    </div>`;
}

function dashRenderBoard() {
  const board = document.getElementById('dashboard-board');
  if (!board) return;

  const q = (document.getElementById('dashboard-search')?.value || '').toLowerCase().trim();
  const visible = DASH_JOBS.filter(j =>
    !q || String(j.job).includes(q) || j.desc.toLowerCase().includes(q) ||
    j.customer.toLowerCase().includes(q) || j.mgmtGroup.toLowerCase().includes(q));

  board.innerHTML = DASHBOARD_STATUSES
    .map(status => dashLaneHTML(status, visible.filter(j => j.status === status)))
    .join('');
}

function dashToggleLane(status) {
  if (dashExpandedLanes.has(status)) dashExpandedLanes.delete(status);
  else dashExpandedLanes.add(status);
  dashRenderBoard();
}

function dashOpenJob(jobNumber) {
  window.location.href = 'job-detail-page.html';
}

// ── Drag to pan ───────────────────────────────────────────────────────
// Trello-style: grab the board anywhere that is not a card or a lane
// header and drag it sideways. Pointer capture keeps the drag alive even
// when the cursor leaves the board, and a drag of more than a few pixels
// swallows the click so panning never opens a job.
function dashInitPanning() {
  const board = document.getElementById('dashboard-board');
  if (!board) return;

  let panning = false;
  let startX = 0;
  let startScroll = 0;
  let moved = 0;

  board.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    if (e.target.closest('.job-card, .lane-header')) return;   // those have their own jobs

    panning = true;
    moved = 0;
    startX = e.clientX;
    startScroll = board.scrollLeft;
    board.setPointerCapture(e.pointerId);
    board.classList.add('is-panning');
  });

  board.addEventListener('pointermove', e => {
    if (!panning) return;
    const dx = e.clientX - startX;
    moved = Math.max(moved, Math.abs(dx));
    board.scrollLeft = startScroll - dx;
  });

  function endPan(e) {
    if (!panning) return;
    panning = false;
    board.releasePointerCapture(e.pointerId);
    board.classList.remove('is-panning');
    // Swallow the click that follows a real drag
    if (moved > 4) {
      board.addEventListener('click', ev => { ev.stopPropagation(); ev.preventDefault(); },
        { capture: true, once: true });
    }
  }

  board.addEventListener('pointerup', endPan);
  board.addEventListener('pointercancel', endPan);
}

document.addEventListener('DOMContentLoaded', () => {
  const legend = document.getElementById('dashboard-legend');
  if (legend) legend.innerHTML = dashLegendHTML();
  dashRenderBoard();
  dashInitPanning();
  document.getElementById('dashboard-search')?.addEventListener('input', dashRenderBoard);
});
