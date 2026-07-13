    // ── Proof Contacts combobox ──
    const PC_CONTACTS = [
      { name: 'Diane Kovach',   role: 'Director of Food & Beverage',   email: 'd.kovach@marriott.com',     group: 'Marriott Downtown Cleveland' },
      { name: 'Marcus Trevino', role: 'General Manager',                email: 'm.trevino@marriott.com',    group: 'Marriott Downtown Cleveland' },
      { name: 'Susan Cho',      role: 'Purchasing Manager',             email: 's.cho@marriott.com',        group: 'Marriott Downtown Cleveland' },
      { name: 'Robert Ellison', role: 'Event Coordinator',              email: 'r.ellison@marriott.com',    group: 'Marriott Downtown Cleveland' },
      { name: 'Priya Nair',     role: 'Catering Director',              email: 'p.nair@marriott.com',       group: 'Marriott Downtown Cleveland' },
      { name: 'James Harmon',   role: 'Controller',                     email: 'j.harmon@marriott.com',     group: 'Marriott Downtown Cleveland' },
      { name: 'Claire Fontaine',role: 'VP, Food & Beverage',            email: 'c.fontaine@marriott-intl.com', group: 'Marriott International (Management Group)' },
      { name: 'Derek Ashworth', role: 'SVP, Operations',                email: 'd.ashworth@marriott-intl.com', group: 'Marriott International (Management Group)' },
      { name: 'Mia Solis',      role: 'Director, Corporate Procurement',email: 'm.solis@marriott-intl.com', group: 'Marriott International (Management Group)' },
      { name: 'Trevor Okafor',  role: 'VP, Finance',                    email: 't.okafor@marriott-intl.com', group: 'Marriott International (Management Group)' },
      { name: 'Naomi Vance',    role: 'Corporate Executive Chef',       email: 'n.vance@marriott-intl.com', group: 'Marriott International (Management Group)' },
    ];
    // pcAdded: Set of emails; pcReceives: email → Set of 'proofs'|'shipping'|'invoices'
    let pcAdded = new Set();
    const pcReceives = {};
    let pcHighlightIndex = -1;
    let pcFiltered = [];
    const PC_RECEIVES_LABELS = { proofs: 'Proofs', shipping: 'Shipping Notifications', invoices: 'Invoices' };
    function pcReceivesTagsHtml(email) {
      const rv = pcReceives[email] || new Set();
      if (!rv.size) return '<span class="pc-receives-none">None</span>';
      const labels = [...rv].map(r => PC_RECEIVES_LABELS[r]);
      const text = labels.length > 1 ? labels.slice(0, -1).join(', ') + ' & ' + labels.at(-1) : labels[0];
      return `<span class="pc-receives-text">${text}</span>`;
    }
    function pcRenderRow(contact, list) {
      const email = contact.email;
      const rv = pcReceives[email] || new Set();
      const chk = key => rv.has(key) ? 'checked' : '';
      const row = document.createElement('tr');
      row.dataset.email = email;
      row.innerHTML = `
        <td>
          <div class="pc-added-info">
            <span class="pc-added-name">${contact.name}</span>
            <span class="pc-added-email">${email}</span>
          </div>
        </td>
        <td>
          <div class="pc-receives-wrap">
            <div class="pc-receives-trigger" onclick="pcToggleReceives(event, this)">
              <span class="pc-receives-tags">${pcReceivesTagsHtml(email)}</span>
              <i class="fa-regular fa-angle-down pc-chevron"></i>
            </div>
            <div class="pc-receives-menu hidden-section">
              <label class="pc-receives-opt"><input type="checkbox" value="proofs" ${chk('proofs')} onchange="pcOnReceiveChange(this,'${email}')"> Proofs</label>
              <label class="pc-receives-opt"><input type="checkbox" value="shipping" ${chk('shipping')} onchange="pcOnReceiveChange(this,'${email}')"> Shipping Notifications</label>
              <label class="pc-receives-opt"><input type="checkbox" value="invoices" ${chk('invoices')} onchange="pcOnReceiveChange(this,'${email}')"> Invoices</label>
            </div>
          </div>
        </td>
        <td>
          <button class="icon-btn" title="Remove" onclick="pcRemove(this,'${email}')"><i class="fa-regular fa-trash-can"></i></button>
        </td>
      `;
      list.appendChild(row);
    }
    function pcToggleReceives(e, trigger) {
      e.stopPropagation();
      const menu = trigger.nextElementSibling;
      const wasOpen = !menu.classList.contains('hidden-section');
      document.querySelectorAll('.pc-receives-menu').forEach(m => m.classList.add('hidden-section'));
      document.querySelectorAll('.pc-row-open').forEach(r => r.classList.remove('pc-row-open'));
      if (!wasOpen) {
        menu.classList.remove('hidden-section');
        trigger.closest('tr')?.classList.add('pc-row-open');
      }
    }
    function pcOnReceiveChange(cb, email) {
      if (!pcReceives[email]) pcReceives[email] = new Set();
      cb.checked ? pcReceives[email].add(cb.value) : pcReceives[email].delete(cb.value);
      const row = cb.closest('tr');
      if (row) row.querySelector('.pc-receives-tags').innerHTML = pcReceivesTagsHtml(email);
      pcUpdateAllStrings();
    }
    function pcShowListHeader() {
      const tbl = document.getElementById('pcTable');
      if (tbl) tbl.classList.toggle('hidden-section', !pcAdded.size);
    }
    function pcOnInput(val) {
      const q = val.trim().toLowerCase();
      const dropdown = document.getElementById('pcDropdown');
      if (!q) { dropdown.classList.add('hidden-section'); return; }
      pcFiltered = PC_CONTACTS.filter(c =>
        !pcAdded.has(c.email) &&
        (c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.role.toLowerCase().includes(q))
      );
      pcHighlightIndex = pcFiltered.length ? 0 : -1;
      pcRenderDropdown(pcFiltered);
    }
    function pcRenderDropdown(results) {
      const dropdown = document.getElementById('pcDropdown');
      if (!results.length) {
        dropdown.innerHTML = '<div class="pc-dd-empty">No contacts found</div>';
        dropdown.classList.remove('hidden-section');
        return;
      }
      const groups = {};
      results.forEach(c => { (groups[c.group] = groups[c.group] || []).push(c); });
      let html = '', globalIdx = 0;
      Object.entries(groups).forEach(([group, contacts], gi) => {
        if (gi > 0) html += '<div class="pc-dd-divider"></div>';
        html += `<div class="pc-dd-group-label">${group}</div>`;
        contacts.forEach(c => {
          const hi = globalIdx === pcHighlightIndex ? ' highlighted' : '';
          html += `<div class="pc-dd-item${hi}" data-idx="${globalIdx}" onmousedown="pcSelect(${globalIdx})">
            <span class="pc-dd-item-name">${c.name}</span>
            <span class="pc-dd-item-email">${c.email}</span>
          </div>`;
          globalIdx++;
        });
      });
      dropdown.innerHTML = html;
      dropdown.classList.remove('hidden-section');
    }
    function pcOnKeydown(e) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        pcHighlightIndex = Math.min(pcHighlightIndex + 1, pcFiltered.length - 1);
        pcRenderDropdown(pcFiltered);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        pcHighlightIndex = Math.max(pcHighlightIndex - 1, 0);
        pcRenderDropdown(pcFiltered);
      } else if (e.key === 'Enter' && pcHighlightIndex >= 0) {
        e.preventDefault();
        pcSelect(pcHighlightIndex);
      } else if (e.key === 'Escape') {
        document.getElementById('pcDropdown').classList.add('hidden-section');
      }
    }
    function pcSelect(idx) {
      const contact = pcFiltered[idx];
      if (!contact || pcAdded.has(contact.email)) return;
      pcAdded.add(contact.email);
      pcReceives[contact.email] = new Set(['proofs']);
      pcRenderRow(contact, document.getElementById('pcList'));
      pcShowListHeader();
      document.getElementById('pcInput').value = '';
      document.getElementById('pcDropdown').classList.add('hidden-section');
      pcFiltered = [];
      pcHighlightIndex = -1;
      pcUpdateAllStrings();
    }
    function pcRemove(btn, email) {
      btn.closest('tr').remove();
      pcAdded.delete(email);
      delete pcReceives[email];
      pcShowListHeader();
      pcUpdateAllStrings();
    }
    // Pre-seed contacts with varied receives for demo
    [
      { email: 'd.kovach@marriott.com',     receives: ['proofs'] },
      { email: 'm.trevino@marriott.com',    receives: ['proofs', 'shipping'] },
      { email: 'c.fontaine@marriott-intl.com', receives: ['proofs', 'invoices'] },
    ].forEach(({ email, receives }) => {
      const contact = PC_CONTACTS.find(c => c.email === email);
      if (!contact) return;
      pcAdded.add(email);
      pcReceives[email] = new Set(receives);
      pcRenderRow(contact, document.getElementById('pcList'));
    });
    pcShowListHeader();
    pcUpdateAllStrings();
    function pcUpdateAllStrings() {
      // Production: proof contacts' emails
      const proofEmails = [...pcAdded].filter(e => pcReceives[e]?.has('proofs'));
      const prodWrap = document.getElementById('pcProdEmailStringWrap');
      const prodEl   = document.getElementById('pcProdEmailString');
      if (prodWrap) prodWrap.classList.toggle('hidden-section', !proofEmails.length);
      if (prodEl)   prodEl.textContent = proofEmails.join(', ');

      // Shipping: render name + email in sidebar widget
      const shipContacts = [...pcAdded]
        .filter(e => pcReceives[e]?.has('shipping'))
        .map(e => PC_CONTACTS.find(c => c.email === e))
        .filter(Boolean);
      const shipList = document.getElementById('shipCnContactsList');
      if (shipList) {
        shipList.classList.toggle('hidden-section', !shipContacts.length);
        shipList.innerHTML = shipContacts.map(c => `
          <div class="widget-contact-item">
            <span class="widget-contact-name">${c.name}</span>
            <span class="widget-contact-email">${c.email}</span>
          </div>`).join('');
      }

      // Billing: invoice contacts' names
      const billNames = [...pcAdded].filter(e => pcReceives[e]?.has('invoices'))
        .map(e => PC_CONTACTS.find(c => c.email === e)?.name).filter(Boolean);
      const billWrap = document.getElementById('pcBillWrap');
      const billEl   = document.getElementById('pcBillNames');
      if (billWrap) billWrap.classList.toggle('hidden-section', !billNames.length);
      if (billEl)   billEl.textContent = billNames.join(', ');
    }
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
    // Close dropdowns on outside click
    document.addEventListener('mousedown', e => {
      if (!e.target.closest('.pc-receives-wrap')) {
        document.querySelectorAll('.pc-receives-menu').forEach(m => m.classList.add('hidden-section'));
        document.querySelectorAll('.pc-row-open').forEach(r => r.classList.remove('pc-row-open'));
      }
      if (!document.getElementById('pcCombobox')?.contains(e.target)) {
        const dd = document.getElementById('pcDropdown');
        if (dd) dd.classList.add('hidden-section');
      }
    });
