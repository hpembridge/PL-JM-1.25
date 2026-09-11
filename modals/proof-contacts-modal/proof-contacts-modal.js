// ══════════════════════════════════════════════════
// JOB CONTACTS MODAL
// Three independent channel lists — Proofs, Invoices, Shipping Notifications.
// The unit that gets added to a list is an EMAIL ADDRESS, not a contact:
// one person can have several addresses and any of them can be picked.
// ══════════════════════════════════════════════════

// ── Directory ──
const JC_CONTACTS = [
  { name: 'Diane Kovach',    role: 'VP of Food & Beverage',            group: 'Marriott Downtown Cleveland',
    emails: ['dainamo@gmail.com', 'gm@marriottboston.com', 'd.kovach@marriott.com'] },
  { name: 'Marcus Trevino',  role: 'General Manager',                  group: 'Marriott Downtown Cleveland',
    emails: ['m.trevino@marriott.com', 'mtrevino@gmail.com'] },
  { name: 'Susan Cho',       role: 'Purchasing Manager',               group: 'Marriott Downtown Cleveland',
    emails: ['s.cho@marriott.com', 'chomazing@gmail.com'] },
  { name: 'Robert Ellison',  role: 'Event Coordinator',                group: 'Marriott Downtown Cleveland',
    emails: ['r.ellison@marriott.com'] },
  { name: 'Priya Nair',      role: 'Catering Director',                group: 'Marriott Downtown Cleveland',
    emails: ['p.nair@marriott.com', 'priya.nair@gmail.com'] },
  { name: 'James Harmon',    role: 'Controller',                       group: 'Marriott Downtown Cleveland',
    emails: ['j.harmon@marriott.com', 'ap@marriottboston.com'] },
  { name: 'Claire Fontaine', role: 'VP, Food & Beverage',              group: 'Marriott International (Management Group)',
    emails: ['c.fontaine@marriott-intl.com', 'cfontaine@gmail.com'] },
  { name: 'Derek Ashworth',  role: 'SVP, Operations',                  group: 'Marriott International (Management Group)',
    emails: ['d.ashworth@marriott-intl.com'] },
  { name: 'Mia Solis',       role: 'Director, Corporate Procurement',  group: 'Marriott International (Management Group)',
    emails: ['m.solis@marriott-intl.com', 'msolis@gmail.com'] },
  { name: 'Trevor Okafor',   role: 'VP, Finance',                      group: 'Marriott International (Management Group)',
    emails: ['t.okafor@marriott-intl.com', 'invoices@marriott-intl.com'] },
  { name: 'Naomi Vance',     role: 'Corporate Executive Chef',         group: 'Marriott International (Management Group)',
    emails: ['n.vance@marriott-intl.com'] },
];

// email → contact
const JC_BY_EMAIL = {};
JC_CONTACTS.forEach(c => c.emails.forEach(e => { JC_BY_EMAIL[e] = c; }));

// ── State: one ordered list of emails per channel ──
const JC_CHANNELS = ['proofs', 'invoices', 'shipping'];
const jcSelected = { proofs: [], invoices: [], shipping: [] };
const jcSearch = { proofs: [], invoices: [], shipping: [] };   // flat, keyboard-navigable results
const jcHighlight = { proofs: -1, invoices: -1, shipping: -1 };

// ── Element helpers ──
function jcCard(channel)     { return document.querySelector(`.jc-card[data-channel="${channel}"]`); }
function jcEl(channel, sel)  { return jcCard(channel)?.querySelector(sel); }

function jcFocusInput(channel) {
  jcEl(channel, '.jc-search')?.focus();
}

function jcCloseDropdown(channel) {
  jcEl(channel, '.jc-dropdown')?.classList.add('hidden-section');
  jcSearch[channel] = [];
  jcHighlight[channel] = -1;
}

// ── Search ──
// Every address the directory holds is a row of its own — one person with
// three addresses is three rows, each showing that person's name. Addresses
// already on this list are left out.
function jcOnInput(channel, val) {
  const q = val.trim().toLowerCase();

  const results = [];
  JC_CONTACTS.forEach(c => {
    const personMatch = c.name.toLowerCase().includes(q) || c.role.toLowerCase().includes(q);
    c.emails.forEach(email => {
      if (jcSelected[channel].includes(email)) return;
      if (!q || personMatch || email.toLowerCase().includes(q)) results.push({ contact: c, email });
    });
  });

  jcSearch[channel] = results;
  jcHighlight[channel] = results.length ? 0 : -1;
  jcRenderDropdown(channel);
}

function jcStepHighlight(channel, dir) {
  const i = jcHighlight[channel] + dir;
  if (i < 0 || i > jcSearch[channel].length - 1) return;
  jcHighlight[channel] = i;
}

function jcOnKeydown(e, channel) {
  const input = e.target;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    jcStepHighlight(channel, 1);
    jcRenderDropdown(channel);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    jcStepHighlight(channel, -1);
    jcRenderDropdown(channel);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (jcHighlight[channel] >= 0) jcAdd(channel, jcHighlight[channel]);
  } else if (e.key === 'Backspace' && !input.value) {
    // empty field: backspace peels off the last chip, as in Outlook
    const last = jcSelected[channel][jcSelected[channel].length - 1];
    if (last) jcRemove(channel, last);
  } else if (e.key === 'Escape') {
    jcCloseDropdown(channel);
  }
}

// Droplist: one row per address — name on the left, address on the right.
function jcRenderDropdown(channel) {
  const dd = jcEl(channel, '.jc-dropdown');
  if (!dd) return;
  const results = jcSearch[channel];

  if (!results.length) {
    dd.innerHTML = '<div class="jc-dd-empty">No addresses found</div>';
    dd.classList.remove('hidden-section');
    return;
  }

  dd.innerHTML = results.map((r, idx) => `
    <div class="jc-dd-row${idx === jcHighlight[channel] ? ' highlighted' : ''}"
         data-idx="${idx}" onmousedown="jcAdd('${channel}', ${idx})"
         onmouseenter="jcHoverRow('${channel}', ${idx})">
      <span class="jc-dd-row-name">${r.contact.name}</span>
      <span class="jc-dd-row-email">${r.email}</span>
      <span class="jc-dd-row-role">${r.contact.role}</span>
    </div>`).join('');

  dd.classList.remove('hidden-section');
}

function jcHoverRow(channel, idx) {
  jcHighlight[channel] = idx;
  jcCard(channel)?.querySelectorAll('.jc-dd-row').forEach(row => {
    row.classList.toggle('highlighted', Number(row.dataset.idx) === idx);
  });
}

// ── Add / remove ──
function jcAdd(channel, idx) {
  const hit = jcSearch[channel][idx];
  if (!hit || jcSelected[channel].includes(hit.email)) return;
  jcSelected[channel].push(hit.email);
  jcRenderList(channel);
  const input = jcEl(channel, '.jc-search');
  if (input) { input.value = ''; input.focus(); }
  jcOnInput(channel, '');
  jcUpdateAllStrings();
}

function jcRemove(channel, email) {
  jcSelected[channel] = jcSelected[channel].filter(e => e !== email);
  jcRenderList(channel);
  jcUpdateAllStrings();
}

// ── Render the chips ──
function jcRenderList(channel) {
  const chips = jcEl(channel, '.jc-chips');
  if (!chips) return;
  const emails = jcSelected[channel];

  chips.innerHTML = emails.map(email => {
    const c = JC_BY_EMAIL[email];
    return `<span class="jc-chip" title="${c ? c.name + ' — ' : ''}${email}">
              <span class="jc-chip-name">${c ? c.name : email}</span>
              <span class="jc-chip-email">${email}</span>
              <button class="jc-chip-remove" aria-label="Remove ${email}"
                onclick="event.stopPropagation(); jcRemove('${channel}', '${email}')">
                <i class="fa-solid fa-xmark"></i>
              </button>
            </span>`;
  }).join('');

  const count = jcEl(channel, '.jc-count');
  if (count) count.textContent = `${emails.length} ADDRESS${emails.length === 1 ? '' : 'ES'}`;
}

// ── Push selections out to the page widgets ──
function jcUpdateAllStrings() {
  // Production: copyable string of proof addresses
  const prodWrap = document.getElementById('pcProdEmailStringWrap');
  const prodEl   = document.getElementById('pcProdEmailString');
  if (prodWrap) prodWrap.classList.toggle('hidden-section', !jcSelected.proofs.length);
  if (prodEl)   prodEl.textContent = jcSelected.proofs.join(', ');

  // Shipping: name + address in the sidebar widget
  const shipList = document.getElementById('shipCnContactsList');
  if (shipList) {
    shipList.classList.toggle('hidden-section', !jcSelected.shipping.length);
    shipList.innerHTML = jcSelected.shipping.map(email => `
      <div class="widget-contact-item">
        <span class="widget-contact-name">${JC_BY_EMAIL[email]?.name || ''}</span>
        <span class="widget-contact-email">${email}</span>
      </div>`).join('');
  }

  // Billing: names on the invoice list (de-duped — one person, several addresses)
  const billNames = [...new Set(jcSelected.invoices.map(e => JC_BY_EMAIL[e]?.name).filter(Boolean))];
  const billWrap = document.getElementById('pcBillWrap');
  const billEl   = document.getElementById('pcBillNames');
  if (billWrap) billWrap.classList.toggle('hidden-section', !billNames.length);
  if (billEl)   billEl.textContent = billNames.join(', ');
}

// ── Demo seed ──
jcSelected.proofs   = ['d.kovach@marriott.com', 'dainamo@gmail.com', 'm.trevino@marriott.com'];
jcSelected.invoices = ['ap@marriottboston.com', 'invoices@marriott-intl.com'];
jcSelected.shipping = ['m.trevino@marriott.com', 'r.ellison@marriott.com'];
JC_CHANNELS.forEach(jcRenderList);
jcUpdateAllStrings();

// ── Copy helpers (used by the production + billing widgets) ──
function pcCopyText(textElId, btnId) {
  const text = document.getElementById(textElId).textContent;
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(btnId);
    btn.innerHTML = '<i class="fa-solid fa-check icon-success"></i>';
    setTimeout(() => { btn.innerHTML = '<i class="fa-regular fa-copy"></i>'; }, 1800);
  });
}

function pcCopyContacts(textElId, wrapId) {
  const text = document.getElementById(textElId).textContent;
  const wrap = document.getElementById(wrapId);
  navigator.clipboard.writeText(text).then(() => {
    wrap.classList.add('copy-wrap-copied');
    setTimeout(() => wrap.classList.remove('copy-wrap-copied'), 1800);
  });
}

// ── Close an open droplist on any click outside its field ──
document.addEventListener('mousedown', e => {
  JC_CHANNELS.forEach(channel => {
    const field = jcEl(channel, '.jc-field');
    if (field && !field.contains(e.target)) jcCloseDropdown(channel);
  });
});
