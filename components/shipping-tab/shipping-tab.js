    // ── Shipping ──

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

    // Called by the Ship Settings modal (modals/ship-settings-modal) whenever a
    // column is hidden/shown, to keep the table-vs-empty-state visibility in sync.
    function _syncShipEmptyState() {
      const table    = document.querySelector('.ship-table');
      const allGone  = ['addr', 'delivery', 'notes', 'qty'].every(c => table.classList.contains(`hide-col-${c}`));
      document.querySelector('.ship-table-wrap').classList.toggle('hidden-section', allGone);
      document.getElementById('shipEmptyState').classList.toggle('hidden-section', !allGone);
    }

    // Run on load
    initDeliverySpans();
