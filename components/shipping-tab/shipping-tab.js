    // ── Shipping ──

    const SHIP_JOB_QTY = 300; // total job quantity to compare against

    function updateQtyBadge() {
      const rows          = Array.from(document.querySelectorAll('#shipAddressList .ship-address-row'));
      const total         = rows.reduce((sum, row) => sum + (parseInt(row.dataset.qty) || 0), 0);
      const qtyCells      = document.querySelectorAll('#shipAddressList .ship-address-row td:nth-child(5)');
      const footerQtyCell = document.getElementById('shipQtyFooter');

      // Reset
      qtyCells.forEach(td => td.classList.remove('ship-col-qty--over'));
      if (footerQtyCell) footerQtyCell.innerHTML = '';

      if (rows.length === 0 || total === SHIP_JOB_QTY) return;

      const diff        = Math.abs(total - SHIP_JOB_QTY);
      const remainder   = SHIP_JOB_QTY % rows.length;
      const label       = total > SHIP_JOB_QTY ? 'Over' : 'Under';

      if (diff > remainder) {
        // Distributable — highlight column and show clickable icon
        qtyCells.forEach(td => td.classList.add('ship-col-qty--over'));
        const tipRemainder = remainder > 0 ? ` (remainder: ${remainder})` : '';
        const tip = `Click to evenly distribute quantity${tipRemainder}`;
        if (footerQtyCell) {
          footerQtyCell.innerHTML = `<button class="ship-qty-icon" title="${tip}" onclick="applyEvenQty()"><i class="fa-solid fa-triangle-exclamation"></i></button>`;
        }
      } else {
        // Minor mismatch — non-interactive span so title still shows on hover
        const tip = `${label} job quantity by ${diff}`;
        if (footerQtyCell) {
          footerQtyCell.innerHTML = `<span class="ship-qty-icon ship-qty-icon--disabled" title="${tip}"><i class="fa-solid fa-triangle-exclamation"></i></span>`;
        }
      }
    }

    function applyEvenQty() {
      const rows    = Array.from(document.querySelectorAll('#shipAddressList .ship-address-row'));
      const perAddr = Math.floor(SHIP_JOB_QTY / rows.length);
      rows.forEach(row => {
        row.dataset.qty = perAddr;
        row.querySelectorAll('td')[4].textContent = perAddr;
      });
      updateQtyBadge();
    }

    let _shipEditTargetRow = null;
    let _shipEditMode = 'edit'; // 'edit' | 'add' | 'bulk'

    function onRowCheck() {
      const visibleChecks = Array.from(document.querySelectorAll('.ship-address-row:not(.row-hidden) .ship-row-check'));
      const checked       = visibleChecks.filter(c => c.checked);
      const selAll        = document.getElementById('selectAllAddresses');
      selAll.checked      = checked.length === visibleChecks.length && visibleChecks.length > 0;
      selAll.indeterminate = checked.length > 0 && checked.length < visibleChecks.length;
      updateFooterLeft();
    }

    function updateFooterLeft() {
      const allRows     = document.querySelectorAll('#shipAddressList .ship-address-row');
      const visibleRows = document.querySelectorAll('#shipAddressList .ship-address-row:not(.row-hidden)');
      const checked     = document.querySelectorAll('.ship-address-row:not(.row-hidden) .ship-row-check:checked');
      const countEl     = document.getElementById('shipAddrCount');
      const footerLeft  = document.querySelector('.ship-footer-left');

      if (checked.length > 0) {
        countEl.textContent = `${checked.length} SELECTED`;
        footerLeft.classList.add('multi-select');
      } else {
        const v = visibleRows.length, t = allRows.length;
        countEl.textContent = v < t
          ? `${v} OF ${t} ADDRESS${t !== 1 ? 'ES' : ''}`
          : `${t} ADDRESS${t !== 1 ? 'ES' : ''}`;
        footerLeft.classList.remove('multi-select');
      }
    }

    function toggleSelectAll(cb) {
      document.querySelectorAll('.ship-address-row:not(.row-hidden) .ship-row-check')
        .forEach(c => c.checked = cb.checked);
      onRowCheck();
    }

    function deleteAddressRow(btn) {
      btn.closest('.ship-address-row').remove();
      onRowCheck();
      updateAddrCount();
      updateQtyBadge();
    }

    function clearShipSelection() {
      document.querySelectorAll('.ship-row-check:checked').forEach(cb => cb.checked = false);
      document.getElementById('selectAllAddresses').checked = false;
      document.getElementById('selectAllAddresses').indeterminate = false;
      const searchInput = document.querySelector('.ship-address-list .search-list-header input');
      if (searchInput && searchInput.value) {
        searchInput.value = '';
        filterAddresses('');
      }
      updateFooterLeft();
    }

    function openDeleteSelectedConfirm() {
      const count = document.querySelectorAll('.ship-row-check:checked').length;
      if (count === 0) return;
      document.getElementById('shipDeleteConfirmTitle').textContent =
        `Delete ${count} address${count !== 1 ? 'es' : ''}?`;
      openModal('shipDeleteConfirm');
    }

    function confirmDeleteSelected() {
      document.querySelectorAll('.ship-row-check:checked').forEach(cb => {
        cb.closest('.ship-address-row').remove();
      });
      closeModal('shipDeleteConfirm');
      onRowCheck();
      updateAddrCount();
      updateQtyBadge();
    }

    function deleteSelectedRows() {
      openDeleteSelectedConfirm();
    }

    function updateAddrCount() {
      updateFooterLeft();
    }

    function filterAddresses(val) {
      const lower = val.toLowerCase();
      document.querySelectorAll('.ship-address-row').forEach(row => {
        const text = Array.from(row.querySelectorAll('td')).map(td => td.textContent.toLowerCase()).join(' ');
        row.classList.toggle('row-hidden', lower.length > 0 && !text.includes(lower));
      });
      // Reset select-all to only reflect visible rows
      onRowCheck();
      updateFooterLeft();
    }

    function closeShipEdit() {
      if (_shipEditMode === 'bulk') clearShipSelection();
      closeModal('shipEdit');
    }

    function cancelShipDelete() {
      clearShipSelection();
      closeModal('shipDeleteConfirm');
    }

    // ── Ship Edit Modal ──

    function openShipAdd() {
      _shipEditTargetRow = null;
      _shipEditMode = 'add';
      document.getElementById('modal-shipEdit').querySelector('.modal-panel').classList.remove('bulk-edit');
      document.getElementById('shipEditTitle').textContent = 'Add Shipping Address';
      document.getElementById('shipEditQty').value     = 0;
      document.getElementById('shipEditCarrier').value = 'UPS';
      document.getElementById('shipEditMethod').value  = 'Ground';
      document.getElementById('shipEditAccount').value = 'CMP UPS Account';
      document.getElementById('shipEditAttn').value    = '';
      document.getElementById('shipEditNotes').value   = '';
      openModal('shipEdit');
    }

    function openShipEdit(row) {
      _shipEditTargetRow = row;
      _shipEditMode = 'edit';
      document.getElementById('shipEditTitle').textContent = 'Edit Shipping Address';
      document.getElementById('modal-shipEdit').querySelector('.modal-panel').classList.remove('bulk-edit');

      // Populate from row data attributes
      document.getElementById('shipEditQty').value      = row.dataset.qty      || 0;
      document.getElementById('shipEditCarrier').value  = row.dataset.carrier  || '';
      document.getElementById('shipEditMethod').value   = row.dataset.method   || '';
      document.getElementById('shipEditAccount').value  = row.dataset.account  || '';
      document.getElementById('shipEditAttn').value     = row.dataset.attn     || '';
      document.getElementById('shipEditNotes').value    = row.dataset.notes    || '';

      // Address description — match the row's name cell
      const addrName = row.querySelector('.ship-addr-name')?.textContent || '';
      const addrSel  = document.getElementById('shipEditAddrDesc');
      const opt = Array.from(addrSel.options).find(o => o.text === addrName);
      if (opt) addrSel.value = opt.value;

      openModal('shipEdit');
    }

    function openShipEditSelected() {
      const checked = document.querySelectorAll('.ship-row-check:checked');
      if (checked.length === 0) return;
      if (checked.length === 1) {
        openShipEdit(checked[0].closest('.ship-address-row'));
      } else {
        // Bulk edit — open with blank/mixed state
        _shipEditTargetRow = null;
        _shipEditMode = 'bulk';
        document.getElementById('shipEditTitle').textContent = `Edit ${checked.length} Addresses`;
        document.getElementById('modal-shipEdit').querySelector('.modal-panel').classList.add('bulk-edit');

        document.getElementById('shipEditQty').value     = '';
        document.getElementById('shipEditCarrier').value = '';
        document.getElementById('shipEditMethod').value  = '';
        document.getElementById('shipEditAccount').value = '';
        document.getElementById('shipEditAttn').value    = '';
        document.getElementById('shipEditNotes').value   = '';
        openModal('shipEdit');
      }
    }

    function stepShipEdit(dir) {
      const input = document.getElementById('shipEditQty');
      input.value = Math.max(0, (parseInt(input.value) || 0) + dir);
    }

    let _shipNextId = 21;

    function saveShipEdit() {
      const carrier = document.getElementById('shipEditCarrier').value;
      const method  = document.getElementById('shipEditMethod').value;
      const account = document.getElementById('shipEditAccount').value;
      const attn    = document.getElementById('shipEditAttn').value;
      const notes   = document.getElementById('shipEditNotes').value;
      const qty     = document.getElementById('shipEditQty').value;

      if (_shipEditMode === 'add') {
        const addrName = document.getElementById('shipEditAddrDesc').value || 'New Address';
        const row = document.createElement('tr');
        row.className       = 'ship-address-row';
        row.dataset.id      = _shipNextId++;
        row.dataset.carrier = carrier;
        row.dataset.method  = method;
        row.dataset.account = account;
        row.dataset.attn    = attn;
        row.dataset.notes   = notes;
        row.dataset.qty     = qty || '0';
        const attnLine     = attn    ? `<span class="ship-addr-attn">ATTN: ${attn}</span>` : '';
        const accountLine  = account && account !== '—' ? `<span class="ship-delivery-account">${account}</span>` : '';
        const carrierSpan  = carrier && carrier !== '—' ? `<span class="ship-delivery-carrier">${carrier}</span>` : '';
        const methodSpan   = method  && method  !== '—' ? `<span class="ship-delivery-type"> ${method}</span>`  : '';
        const deliveryLine = carrierSpan || methodSpan ? carrierSpan + methodSpan : '—';
        row.innerHTML = `
          <td><label class="cb-cell-label"><input type="checkbox" class="item-cb ship-row-check" onchange="onRowCheck()"></label></td>
          <td>${attnLine}<span class="ship-addr-name">${addrName}</span></td>
          <td><span class="ship-delivery-method">${deliveryLine}</span>${accountLine}</td>
          <td>${notes || '—'}</td>
          <td class="ship-col-qty">${qty || '0'}</td>
          <td class="ship-row-actions">
            <button class="icon-btn" title="Edit address" onclick="openShipEdit(this.closest('tr'))"><i class="fa-regular fa-pen"></i></button>
            <button class="icon-btn" title="Delete address" onclick="deleteAddressRow(this)"><i class="fa-regular fa-trash-can"></i></button>
          </td>`;
        document.getElementById('shipAddressList').appendChild(row);
        onRowCheck();
        updateAddrCount();
        closeModal('shipEdit');
        updateQtyBadge();
        return;
      }

      const targets = _shipEditTargetRow
        ? [_shipEditTargetRow]
        : Array.from(document.querySelectorAll('.ship-row-check:checked')).map(cb => cb.closest('.ship-address-row'));

      targets.forEach(row => {
        const cells = row.querySelectorAll('td');
        // col order: cb(0) addr(1) delivery(2) notes(3) qty(4) actions(5)
        if (carrier) row.dataset.carrier = carrier;
        if (method)  row.dataset.method  = method;
        if (account) row.dataset.account = account;
        if (attn !== undefined) row.dataset.attn = attn;
        if (notes !== undefined) row.dataset.notes = notes;

        const newCarrier = row.dataset.carrier;
        const newMethod  = row.dataset.method;
        const newAccount = row.dataset.account;
        const newAttn    = row.dataset.attn;

        if (qty !== '') { cells[4].textContent = qty; row.dataset.qty = qty; }

        const newCarrierSpan  = newCarrier && newCarrier !== '—' ? `<span class="ship-delivery-carrier">${newCarrier}</span>` : '';
        const newMethodSpan   = newMethod  && newMethod  !== '—' ? `<span class="ship-delivery-type"> ${newMethod}</span>`  : '';
        const newDeliveryLine = newCarrierSpan || newMethodSpan ? newCarrierSpan + newMethodSpan : '—';
        const accountLine     = newAccount && newAccount !== '—' ? `<span class="ship-delivery-account">${newAccount}</span>` : '';
        cells[2].innerHTML = `<span class="ship-delivery-method">${newDeliveryLine}</span>${accountLine}`;

        const attnLine  = newAttn ? `<span class="ship-addr-attn">ATTN: ${newAttn}</span>` : '';
        const nameEl    = cells[1].querySelector('.ship-addr-name');
        const streetHtml = Array.from(cells[1].querySelectorAll('.ship-addr-street')).map(el => el.outerHTML).join('');
        if (nameEl) cells[1].innerHTML = attnLine + nameEl.outerHTML + streetHtml;

        cells[3].textContent = notes || row.dataset.notes || '—';
      });

      if (_shipEditMode === 'bulk') clearShipSelection();
      closeModal('shipEdit');
      updateQtyBadge();
    }

    // ── Shipping Table Settings ──

    // Split existing delivery cells into carrier/type spans so field-level hiding works.
    // Uses data-carrier / data-method attributes already on each row.
    function initDeliverySpans() {
      document.querySelectorAll('#shipAddressList .ship-address-row').forEach(row => {
        const deliveryTd = row.querySelectorAll('td')[2]; // cb(0) addr(1) delivery(2)
        if (!deliveryTd || deliveryTd.querySelector('.ship-delivery-carrier')) return;
        const carrier    = row.dataset.carrier || '';
        const method     = row.dataset.method  || '';
        const methodSpan = deliveryTd.querySelector('.ship-delivery-method');
        if (!methodSpan) return;
        const carrierPart = carrier && carrier !== '—' ? `<span class="ship-delivery-carrier">${carrier}</span>` : '';
        const methodPart  = method  && method  !== '—' ? `<span class="ship-delivery-type"> ${method}</span>`  : '';
        methodSpan.innerHTML = carrierPart || methodPart ? carrierPart + methodPart : '—';
      });
    }

    function toggleShipCol(col, hidden) {
      document.querySelector('.ship-table')?.classList.toggle(`hide-col-${col}`, hidden);
      // Disable child field toggles when the column is hidden
      const subSelector = col === 'addr' ? '.addr-subfield' : col === 'delivery' ? '.delivery-subfield' : null;
      if (subSelector) {
        document.querySelectorAll(subSelector).forEach(input => {
          input.disabled = hidden;
        });
      }
      _syncShipEmptyState();
    }

    function _syncShipEmptyState() {
      const table    = document.querySelector('.ship-table');
      const allGone  = ['addr', 'delivery', 'notes', 'qty'].every(c => table.classList.contains(`hide-col-${c}`));
      document.querySelector('.ship-table-wrap').classList.toggle('hidden-section', allGone);
      document.getElementById('shipEmptyState').classList.toggle('hidden-section', !allGone);
    }

    function toggleShipField(field, hidden) {
      document.querySelector('.ship-table')?.classList.toggle(`hide-field-${field}`, hidden);
    }

    // Run on load
    updateQtyBadge();
    initDeliverySpans();
