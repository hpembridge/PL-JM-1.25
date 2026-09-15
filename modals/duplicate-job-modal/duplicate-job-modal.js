// ── Duplicate Job modal ───────────────────────────────────────────────
// Prototype behaviour only:
//   1. Step tabs + progress rail.
//   2. Content tab: copy list filtered to what the job defines; children
//      collapse when their parent is unchecked; everything defaults to on.
//   3. Production / Job Contacts / Billing prefill from the job record.
//   4. Create is disabled until a Job Type is chosen (it never prefills).

// ══ Mock job definition ══════════════════════════════════════════════
// Stands in for the job record the page is showing. Drives BOTH the copy
// list (keys map to data-copy="…") and the prefilled values below.
const DUPLICATE_JOB_DEFINITION = {
  description: '2018 Standard Menu Single Fold Jan 2018 Ws',
  notes: ['billing', 'detail'],        // billing | shipping | paper | detail
  contacts: ['billing', 'shipping', 'proofing'],
  shipping: true,                      // shipping distribution rows exist
  details: [
    { id: 'detail-1', name: 'Folder', quantity: 200, sections: ['general', 'paper'] }
    // { id: 'detail-2', name: 'Cover', quantity: 500, sections: ['general', 'print'] }
  ],
  productionType: 'printing',
  customer: { number: '13730', name: 'Pizza Hut AIGP' },
  jobContacts: {
    proofs: ['d.kovach@marriott.com', 'dainamo@gmail.com', 'm.trevino@marriott.com'],
    invoices: ['ap@marriottboston.com', 'invoices@marriott-intl.com'],
    shipping: ['m.trevino@marriott.com', 'r.ellison@marriott.com']
  },
  billing: {
    poNumber: 'PO-2024-0042',
    poName: 'Q2 Print Run',
    note: 'Invoice to AP department at corporate — do not send to location contact directly.\nNet 30 terms. Reference PO number on all invoices.'
  }
};

// Customers the picker can find (mock directory)
const DJ_CUSTOMERS = [
  { number: '13730', name: 'Pizza Hut AIGP' },
  { number: '2030', name: 'Pizza Hut Corporation' },
  { number: '21372', name: 'D A R ( Coltons Management Group )' },
  { number: '18440', name: 'Marriott Downtown Cleveland' },
  { number: '9921', name: 'Omni Hotels & Resorts' },
];

// Job Type descriptions (Production step)
const DUPLICATE_JOB_TYPE_DESC = {
  '': '',
  'new': 'Create a new product from scratch.',
  'rerun': 'Reproduce an existing product with changes.',
  'pull-plate': 'Reproduce an existing product exactly as previously produced.',
  'inventory-release': 'Ship previously produced inventory to the customer.',
  'replacement': 'Replace a previously produced product.'
};

const DJ_ALL_STEPS = ['content', 'production', 'contacts', 'billing'];
const DJ_CREATE_STEPS = ['production', 'contacts', 'billing'];

// Which steps this run of the modal uses — Duplicate Job has the Content
// step, Create New Job does not (there is nothing to copy from).
let DJ_STEPS = DJ_ALL_STEPS;
let djMode = 'duplicate';
const DJ_DETAIL_SECTIONS = ['general', 'paper', 'print', 'bindery', 'boards'];

// ══ Steps ════════════════════════════════════════════════════════════
function djGoToStep(step) {
  const modal = document.getElementById('modal-duplicateJob');
  if (!modal) return;
  const index = DJ_STEPS.indexOf(step);

  modal.querySelectorAll('.dj-step').forEach(btn => {
    const i = DJ_STEPS.indexOf(btn.dataset.step);
    btn.classList.toggle('active', i === index);
    btn.classList.toggle('complete', i < index);
  });
  modal.querySelectorAll('.dj-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.panel === step);
  });

  const fill = document.getElementById('dj-steps-rail-fill');
  if (fill) fill.style.width = ((index + 1) / DJ_STEPS.length * 100) + '%';

  modal.querySelector('.modal-body').scrollTop = 0;
  djUpdateFooter();
  djValidate();
}

// ══ Content step: show only what the job defines ═════════════════════
function djBuildCopyList() {
  const list = document.getElementById('dj-copy-list');
  if (!list) return;
  const job = DUPLICATE_JOB_DEFINITION;

  const show = (el, on) => el && el.classList.toggle('dj-hidden', !on);
  const group = key => list.querySelector('.dj-copy-group[data-copy="' + key + '"]');
  const row = key => list.querySelector('.dj-copy-row[data-copy="' + key + '"]');

  // Notes / Job Contacts — parent shows only if at least one child is defined
  [['notes', ['billing', 'shipping', 'paper', 'detail']],
   ['contacts', ['billing', 'shipping', 'proofing']]].forEach(([key, children]) => {
    const defined = job[key] || [];
    children.forEach(c => show(row(key + '.' + c), defined.includes(c)));
    show(group(key), defined.length > 0);
  });

  // Shipping Distribution
  show(group('shipping'), !!job.shipping);

  // Details — one group per detail, sections filtered per detail
  ['detail-1', 'detail-2', 'detail-3'].forEach((id, i) => {
    const detail = (job.details || [])[i];
    const g = group(id);
    show(g, !!detail);
    if (!detail || !g) return;
    const label = g.querySelector('.dj-detail-label');
    if (label) label.textContent = 'Detail ' + (i + 1) + ' • ' + detail.name;
    DJ_DETAIL_SECTIONS.forEach(section => {
      show(row(id + '.' + section), detail.sections.includes(section));
    });
  });

  // Nothing is selected by default — the user opts in to what gets copied
  list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.indeterminate = false;
  });
  list.querySelectorAll('[data-copy-parent]').forEach(p => djToggleChildren(p));

  const anyVisible = !!list.querySelector('.dj-copy-group:not(.dj-hidden)');
  list.classList.toggle('hidden-section', !anyVisible);
  document.getElementById('dj-copy-empty')?.classList.toggle('hidden-section', anyVisible);
}

// Children are only visible while their parent is checked
function djToggleChildren(parent) {
  const key = parent.dataset.copyParent;
  const wrap = document.querySelector('.dj-copy-children[data-children="' + key + '"]');
  if (wrap) wrap.classList.toggle('dj-collapsed', !parent.checked);
}

function djSyncParent(groupKey) {
  const list = document.getElementById('dj-copy-list');
  const parent = list.querySelector('[data-copy-parent="' + groupKey + '"]');
  const children = [...list.querySelectorAll('[data-copy-child="' + groupKey + '"]')]
    .filter(c => !c.closest('.dj-copy-row').classList.contains('dj-hidden'));
  const checked = children.filter(c => c.checked).length;
  parent.checked = checked > 0;
  parent.indeterminate = checked > 0 && checked < children.length;
}

function djInitCopyListEvents() {
  const list = document.getElementById('dj-copy-list');
  if (!list) return;

  list.querySelectorAll('[data-copy-parent]').forEach(parent => {
    parent.addEventListener('change', () => {
      const key = parent.dataset.copyParent;
      list.querySelectorAll('[data-copy-child="' + key + '"]').forEach(child => {
        if (!child.closest('.dj-copy-row').classList.contains('dj-hidden')) {
          child.checked = parent.checked;
        }
      });
      parent.indeterminate = false;
      djToggleChildren(parent);
    });
  });

  list.querySelectorAll('[data-copy-child]').forEach(child => {
    child.addEventListener('change', () => djSyncParent(child.dataset.copyChild));
  });

  // Any change to what is being copied re-applies the prefilled values
  list.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => { djApplyPrefill(); djUpdateFooter(); });
  });
}

// ══ Production step ══════════════════════════════════════════════════
function djOnJobTypeChange(select) {
  const desc = document.getElementById('dj-job-type-desc');
  if (desc) desc.textContent = DUPLICATE_JOB_TYPE_DESC[select.value] || '';
  // Only a real change from the user counts as touching the field — opening
  // the modal resets it through here too, and that should not show an error.
  if (select instanceof HTMLElement) djTouched.add('dj-job-type');
  djValidate();
}

function djAddDetailRow() {
  const rows = document.getElementById('dj-detail-rows');
  const clone = rows.firstElementChild.cloneNode(true);
  clone.querySelector('.dj-detail-num').textContent = rows.children.length + 1;
  clone.querySelectorAll('input').forEach(i => (i.value = ''));
  rows.appendChild(clone);
  djValidate();
}

// ══ Prefill ══════════════════════════════════════════════════════════
// A field only prefills while its row is checked on the Content tab.
// Unchecking a row clears the field again, so what you see on the later
// steps always matches what you chose to copy.
function djIsCopied(key) {
  const row = document.querySelector('.dj-copy-list [data-copy="' + key + '"]');
  if (!row || row.classList.contains('dj-hidden')) return false;
  if (row.closest('.dj-copy-children.dj-collapsed')) return false;
  const cb = row.querySelector('input[type="checkbox"]');
  return !!cb && cb.checked;
}

function djApplyPrefill() {
  const job = DUPLICATE_JOB_DEFINITION;
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };

  // The new description is always entered by hand; the original is shown
  // above it for reference only.
  const source = document.getElementById('dj-source-description');
  if (source) source.textContent = job.description || '—';
  document.querySelector('.dj-source-description')?.classList.remove('hidden-section');
  set('dj-description', '');

  // Billing information
  set('dj-po-number', djIsCopied('billing.poNumber') ? job.billing.poNumber : '');
  set('dj-po-name', djIsCopied('billing.poName') ? job.billing.poName : '');
  set('dj-billing-note', djIsCopied('notes.billing') ? job.billing.note : '');

  // The customer comes across only while job contacts are being copied;
  // setting it clears any recipients, so the channels are seeded after.
  const keepingContacts = ['contacts.proofing', 'contacts.billing', 'contacts.shipping'].some(djIsCopied);
  djSetCustomer(keepingContacts ? job.customer : null);

  // Job contacts — one copy row per channel
  const channelRow = { proofs: 'contacts.proofing', invoices: 'contacts.billing', shipping: 'contacts.shipping' };
  DJC_CHANNELS.forEach(channel => {
    const copied = djIsCopied(channelRow[channel]);
    djcSelected[channel] = copied ? [...((job.jobContacts || {})[channel] || [])] : [];
    djcRenderList(channel);
  });

  // Production details — one row per copied detail, otherwise a single blank row
  const rows = document.getElementById('dj-detail-rows');
  if (rows) {
    const template = rows.firstElementChild.cloneNode(true);
    const copied = (job.details || []).filter((d, i) => djIsCopied('detail-' + (i + 1)));
    rows.innerHTML = '';
    (copied.length ? copied : [{ name: '', quantity: '' }]).forEach((detail, i) => {
      const row = template.cloneNode(true);
      row.querySelector('.dj-detail-num').textContent = i + 1;
      row.querySelector('.dj-detail-name').value = detail.name || '';
      row.querySelector('.dj-detail-quantity').value = detail.quantity ?? '';
      rows.appendChild(row);
    });
  }

  // Production type follows the job; job type is never prefilled.
  const prodType = document.getElementById('dj-production-type');
  if (prodType && !prodType.value && job.productionType) prodType.value = job.productionType;

  djValidate();
}

// ══ Validation ═══════════════════════════════════════════════════════
// Required: job description, job type, production type and one detail with
// a non-zero quantity (Production); PO number + billing note (Billing).
// Messages only appear once a field has been edited or its step has been
// left with Next — nothing is red before the user has been there.
const DJ_REQUIRED = {
  production: ['dj-description', 'dj-job-type', 'dj-production-type'],
  billing: ['dj-po-number', 'dj-billing-note']
};
const djTouched = new Set();

function djValidate() {
  const invalid = { content: [], production: [], contacts: [], billing: [] };

  // Content: at least one thing has to be selected to copy (duplicate only)
  if (DJ_STEPS.includes('content')) {
    const copyOk = djAnyCopySelected();
    if (!copyOk) invalid.content.push('copy-list');
    document.getElementById('dj-copy-error')
      ?.classList.toggle('hidden-section', copyOk || !djTouched.has('content'));
  }

  Object.entries(DJ_REQUIRED).forEach(([step, ids]) => {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const ok = !!el.value.trim();
      const show = !ok && (djTouched.has(step) || djTouched.has(id));
      el.classList.toggle('dj-invalid', show);
      const msg = el.parentElement.querySelector('.dj-field-error');
      if (msg) msg.classList.toggle('hidden-section', !show);
      if (!ok) invalid[step].push(id);
    });
  });

  // A customer has to be chosen before the job can be created
  if (!djCustomer) invalid.contacts.push('customer');
  document.getElementById('dj-customer-error')
    ?.classList.toggle('hidden-section', !!djCustomer || !djTouched.has('contacts'));

  // At least one detail with a non-zero quantity (negatives are valid)
  const quantities = [...document.querySelectorAll('.dj-detail-quantity')];
  const detailsOk = quantities.some(q => q.value.trim() !== '' && Number(q.value) !== 0);
  if (!detailsOk) invalid.production.push('details');
  document.getElementById('dj-details-error')
    ?.classList.toggle('hidden-section', detailsOk || !djTouched.has('production'));

  // Flag the steps that still need something
  DJ_STEPS.forEach(step => {
    const flag = document.querySelector('.dj-step[data-step="' + step + '"] .dj-step-flag');
    if (flag) flag.classList.toggle('hidden-section', invalid[step].length === 0 || !djTouched.has(step));
  });

  return invalid;
}

function djAnyCopySelected() {
  return [...document.querySelectorAll('#dj-copy-list input[type="checkbox"]')]
    .some(cb => cb.checked && !cb.closest('.dj-copy-row').classList.contains('dj-hidden'));
}

function djCurrentStep() {
  return document.querySelector('.dj-panel.active')?.dataset.panel || DJ_STEPS[0];
}

// ══ Wizard navigation ════════════════════════════════════════════════
function djUpdateFooter() {
  const i = DJ_STEPS.indexOf(djCurrentStep());
  const last = i === DJ_STEPS.length - 1;
  document.getElementById('dj-back-btn')?.classList.toggle('hidden-section', i === 0);
  document.getElementById('dj-next-btn')?.classList.toggle('hidden-section', last);
  document.getElementById('dj-create-btn')?.classList.toggle('hidden-section', !last);
}

// One rule for every way of moving: you can always go back, but you cannot
// move forward past a step that is missing something. Next, the step tabs
// and Create all go through here, so they behave the same.
function djRequestStep(target) {
  const step = djCurrentStep();
  const forward = DJ_STEPS.indexOf(target) > DJ_STEPS.indexOf(step);

  if (forward) {
    djTouched.add(step);
    const invalid = djValidate();
    if (invalid[step].length) return false;   // stay put and show what is missing
  }

  djGoToStep(target);
  return true;
}

function djNext() {
  djRequestStep(DJ_STEPS[DJ_STEPS.indexOf(djCurrentStep()) + 1]);
}

function djBack() {
  const i = DJ_STEPS.indexOf(djCurrentStep());
  if (i > 0) djRequestStep(DJ_STEPS[i - 1]);
}

// ══ Customer picker (Job Contacts step) ═════════════════════════════
// Empty on a new job. On a duplicate it carries the original's customer
// while Job Contacts is being copied, and clears when that is unchecked.
let djCustomer = null;
let djCustomerMatches = [];
let djCustomerHighlight = -1;

function djSetCustomer(customer) {
  const previous = djCustomer;
  djCustomer = customer;

  // Recipients belong to a customer, so they only make sense once one is
  // chosen — and anything picked for a different customer is dropped.
  if (!customer || previous?.number !== customer.number) djcClearAll();
  djcSetPickersEnabled(!!customer);

  const chosen = !!customer;
  document.getElementById('dj-customer-selected')?.classList.toggle('hidden-section', !chosen);
  document.getElementById('dj-customer-search')?.classList.toggle('hidden-section', chosen);

  if (chosen) {
    document.getElementById('dj-customer-number').textContent = customer.number;
    document.getElementById('dj-customer-name').textContent = customer.name;
  }

  const input = document.getElementById('dj-customer-input');
  if (input) input.value = '';
  djCloseCustomerDropdown();
  djValidate();
}

function djClearCustomer() {
  djSetCustomer(null);
  document.getElementById('dj-customer-input')?.focus();
}

function djCustomerInput(val) {
  const q = val.trim().toLowerCase();
  djCustomerMatches = DJ_CUSTOMERS.filter(c =>
    !q || c.number.includes(q) || c.name.toLowerCase().includes(q));
  djCustomerHighlight = djCustomerMatches.length ? 0 : -1;
  djRenderCustomerDropdown();
}

function djRenderCustomerDropdown() {
  const dd = document.getElementById('dj-customer-dropdown');
  if (!dd) return;

  dd.innerHTML = djCustomerMatches.length
    ? djCustomerMatches.map((c, i) =>
        '<div class="jc-dd-row' + (i === djCustomerHighlight ? ' highlighted' : '') + '"' +
        ' data-idx="' + i + '" onmousedown="djPickCustomer(' + i + ')">' +
          '<span class="jc-dd-row-name">' + c.number + '</span>' +
          '<span class="jc-dd-row-email">' + c.name + '</span>' +
        '</div>').join('')
    : '<div class="jc-dd-empty">No customers found</div>';

  dd.classList.remove('hidden-section');
}

function djCloseCustomerDropdown() {
  document.getElementById('dj-customer-dropdown')?.classList.add('hidden-section');
  djCustomerMatches = [];
  djCustomerHighlight = -1;
}

function djPickCustomer(idx) {
  const hit = djCustomerMatches[idx];
  if (hit) djSetCustomer(hit);
}

function djCustomerKeydown(e) {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (djCustomerHighlight < djCustomerMatches.length - 1) djCustomerHighlight++;
    djRenderCustomerDropdown();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (djCustomerHighlight > 0) djCustomerHighlight--;
    djRenderCustomerDropdown();
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (djCustomerHighlight >= 0) djPickCustomer(djCustomerHighlight);
  } else if (e.key === 'Escape') {
    djCloseCustomerDropdown();
  }
}

document.addEventListener('mousedown', e => {
  const wrap = document.getElementById('dj-customer-search');
  if (wrap && !wrap.contains(e.target)) djCloseCustomerDropdown();
});

// ══ Job Contacts step ════════════════════════════════════════════════
// Same token-field picker as modals/proof-contacts-modal, scoped to this
// modal (data-dj-channel) so the two instances keep separate state.
const DJC_CHANNELS = ['proofs', 'invoices', 'shipping'];
const djcSelected = { proofs: [], invoices: [], shipping: [] };
const djcSearch = { proofs: [], invoices: [], shipping: [] };
const djcHighlight = { proofs: -1, invoices: -1, shipping: -1 };

function djcCard(channel) { return document.querySelector('.jc-card[data-dj-channel="' + channel + '"]'); }
function djcEl(channel, sel) { return djcCard(channel)?.querySelector(sel); }

function djcFocusInput(channel) {
  djcEl(channel, '.jc-search')?.focus();
}

function djcCloseDropdown(channel) {
  djcEl(channel, '.jc-dropdown')?.classList.add('hidden-section');
  djcSearch[channel] = [];
  djcHighlight[channel] = -1;
}

// One row per address; addresses already chosen here are left out.
function djcOnInput(channel, val) {
  const q = val.trim().toLowerCase();
  if (typeof JC_CONTACTS === 'undefined') return;

  const results = [];
  JC_CONTACTS.forEach(c => {
    const personMatch = c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
    c.emails.forEach(email => {
      if (djcSelected[channel].includes(email)) return;
      if (!q || personMatch || email.toLowerCase().includes(q)) results.push({ contact: c, email });
    });
  });

  djcSearch[channel] = results;
  djcHighlight[channel] = results.length ? 0 : -1;
  djcRenderDropdown(channel);
}

function djcStepHighlight(channel, dir) {
  const i = djcHighlight[channel] + dir;
  if (i < 0 || i > djcSearch[channel].length - 1) return;
  djcHighlight[channel] = i;
}

function djcOnKeydown(e, channel) {
  const input = e.target;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    djcStepHighlight(channel, 1);
    djcRenderDropdown(channel);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    djcStepHighlight(channel, -1);
    djcRenderDropdown(channel);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (djcHighlight[channel] >= 0) djcAdd(channel, djcHighlight[channel]);
  } else if (e.key === 'Backspace' && !input.value) {
    const last = djcSelected[channel][djcSelected[channel].length - 1];
    if (last) djcRemove(channel, last);
  } else if (e.key === 'Escape') {
    djcCloseDropdown(channel);
  }
}

function djcRenderDropdown(channel) {
  const dd = djcEl(channel, '.jc-dropdown');
  if (!dd) return;
  const results = djcSearch[channel];

  dd.innerHTML = results.length
    ? results.map((r, idx) =>
        '<div class="jc-dd-row' + (idx === djcHighlight[channel] ? ' highlighted' : '') + '"' +
        ' data-idx="' + idx + '" onmousedown="djcAdd(\'' + channel + '\', ' + idx + ')"' +
        ' onmouseenter="djcHoverRow(\'' + channel + '\', ' + idx + ')">' +
          '<span class="jc-dd-row-name">' + r.contact.name + '</span>' +
          '<span class="jc-dd-row-email">' + r.email + '</span>' +
          '<span class="jc-dd-row-role">' + r.contact.role + '</span>' +
        '</div>').join('')
    : '<div class="jc-dd-empty">No addresses found</div>';

  dd.classList.remove('hidden-section');
}

function djcHoverRow(channel, idx) {
  djcHighlight[channel] = idx;
  djcCard(channel)?.querySelectorAll('.jc-dd-row').forEach(row => {
    row.classList.toggle('highlighted', Number(row.dataset.idx) === idx);
  });
}

function djcAdd(channel, idx) {
  const hit = djcSearch[channel][idx];
  if (!hit || djcSelected[channel].includes(hit.email)) return;
  djcSelected[channel].push(hit.email);
  djcRenderList(channel);
  const input = djcEl(channel, '.jc-search');
  if (input) { input.value = ''; input.focus(); }
  djcOnInput(channel, '');
}

function djcRemove(channel, email) {
  djcSelected[channel] = djcSelected[channel].filter(e => e !== email);
  djcRenderList(channel);
}

// Recipient fields are only usable once a customer is chosen.
function djcSetPickersEnabled(enabled) {
  DJC_CHANNELS.forEach(channel => {
    const field = djcEl(channel, '.jc-field');
    const input = djcEl(channel, '.jc-search');
    field?.classList.toggle('jc-field-disabled', !enabled);
    if (input) {
      input.disabled = !enabled;
      input.placeholder = enabled ? 'Add a recipient…' : 'Choose a customer first';
    }
    if (!enabled) djcCloseDropdown(channel);
  });
}

function djcClearAll() {
  DJC_CHANNELS.forEach(channel => {
    djcSelected[channel] = [];
    djcRenderList(channel);
  });
}

function djcRenderList(channel) {
  const chips = djcEl(channel, '.jc-chips');
  if (!chips) return;
  const emails = djcSelected[channel];
  const byEmail = (typeof JC_BY_EMAIL !== 'undefined') ? JC_BY_EMAIL : {};

  chips.innerHTML = emails.map(email => {
    const c = byEmail[email];
    return '<span class="jc-chip" title="' + email + '">' +
             '<span class="jc-chip-name">' + (c ? c.name : email) + '</span>' +
             '<span class="jc-chip-email">' + email + '</span>' +
             '<button class="jc-chip-remove" aria-label="Remove ' + email + '"' +
               ' onclick="event.stopPropagation(); djcRemove(\'' + channel + '\', \'' + email + '\')">' +
               '<i class="fa-solid fa-xmark"></i>' +
             '</button>' +
           '</span>';
  }).join('');

  const count = djcEl(channel, '.jc-count');
  if (count) count.textContent = emails.length + ' ADDRESS' + (emails.length === 1 ? '' : 'ES');
}

// ══ Open ═════════════════════════════════════════════════════════════
// Shared setup for both modes: reset touched state, clear the job type and
// show only the steps this mode uses.
function djSetMode(mode) {
  djMode = mode;
  DJ_STEPS = mode === 'create' ? DJ_CREATE_STEPS : DJ_ALL_STEPS;

  const isCreate = mode === 'create';
  document.getElementById('dj-modal-title').textContent = isCreate ? 'Create New Job' : 'Duplicate Job';
  document.getElementById('dj-step-content')?.classList.toggle('hidden-section', isCreate);
  document.getElementById('dj-panel-content')?.classList.toggle('hidden-section', isCreate);

  djTouched.clear();

  // Creating from scratch is a New Job by definition, so that is the default;
  // duplicating leaves it unchosen, since the whole point is picking how the
  // new job relates to the original.
  const jobType = document.getElementById('dj-job-type');
  const value = isCreate ? 'new' : '';
  if (jobType) jobType.value = value;
  djOnJobTypeChange({ value });
}

function openDuplicateJob() {
  djSetMode('duplicate');
  djBuildCopyList();
  djApplyPrefill();
  djGoToStep('content');
  openModal('duplicateJob');
}

// Create New Job — same modal, no Content step and nothing prefilled.
function openCreateJob() {
  djSetMode('create');
  djClearFields();
  djGoToStep('production');
  openModal('duplicateJob');
}

function djClearFields() {
  ['dj-description', 'dj-po-number', 'dj-po-name', 'dj-billing-note', 'dj-production-type']
    .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });

  const source = document.getElementById('dj-source-description');
  if (source) source.textContent = '';
  document.querySelector('.dj-source-description')?.classList.add('hidden-section');

  djSetCustomer(null);

  DJC_CHANNELS.forEach(channel => {
    djcSelected[channel] = [];
    djcRenderList(channel);
  });

  const rows = document.getElementById('dj-detail-rows');
  if (rows) {
    const row = rows.firstElementChild.cloneNode(true);
    row.querySelector('.dj-detail-num').textContent = 1;
    row.querySelectorAll('input').forEach(i => (i.value = ''));
    rows.innerHTML = '';
    rows.appendChild(row);
  }

  djValidate();
}

function djCreate() {
  DJ_STEPS.forEach(step => djTouched.add(step));
  const invalid = djValidate();
  const firstBad = DJ_STEPS.find(step => invalid[step].length);
  if (firstBad) { djGoToStep(firstBad); return; }   // never skips past a problem
  saveModal('duplicateJob');
}

document.addEventListener('DOMContentLoaded', () => {
  djBuildCopyList();
  djInitCopyListEvents();
  djApplyPrefill();
  djGoToStep('content');
});

// Close an open droplist on any click outside its field
document.addEventListener('mousedown', e => {
  DJC_CHANNELS.forEach(channel => {
    const field = djcEl(channel, '.jc-field');
    if (field && !field.contains(e.target)) djcCloseDropdown(channel);
  });
});
