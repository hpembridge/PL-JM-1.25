    // ── Ship Edit Modal ──
    // Add / Edit / Bulk-edit a shipping address row in the shipping table
    // (components/shipping-tab). Relies on table helpers defined there:
    // onRowCheck(), updateAddrCount(), updateQtyBadge().

    let _shipEditTargetRow = null;
    let _shipEditMode = 'edit'; // 'edit' | 'add' | 'bulk'
    let _shipNextId = 21;

    function closeShipEdit() {
      if (_shipEditMode === 'bulk') clearShipSelection();
      closeModal('shipEdit');
    }

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
