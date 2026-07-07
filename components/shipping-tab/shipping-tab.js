    // ── Shipping ──
    function switchShipField(btn, field) {
      document.querySelectorAll('.ship-field-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      // future: swap input type in bulk area based on field
    }
    function stepBulk(dir) {
      const input = document.getElementById('bulkQtyInput');
      input.value = Math.max(0, (parseInt(input.value) || 0) + dir);
      onBulkInput();
    }
    function onBulkInput() {
      const checkedCount = document.querySelectorAll('.ship-row-check:checked').length;
      document.getElementById('shipApplyBtn').disabled = checkedCount === 0;
    }
    function applyBulkShip() {
      const val = document.getElementById('bulkQtyInput').value;
      document.querySelectorAll('.ship-address-row').forEach(row => {
        if (row.querySelector('.ship-row-check:checked')) {
          row.querySelector('.ship-stepper-val').value = val;
        }
      });
    }
    function stepRow(btn, dir) {
      const input = btn.closest('.ship-stepper').querySelector('.ship-stepper-val');
      input.value = Math.max(0, (parseInt(input.value) || 0) + dir);
    }
    function updateAddrCount() {
      const total = document.querySelectorAll('#shipAddressList .ship-address-row').length;
      const el = document.getElementById('shipAddrCount');
      if (el) el.textContent = `${total} ADDRESS${total !== 1 ? 'ES' : ''}`;
    }
    function onRowCheck() {
      const checked = document.querySelectorAll('.ship-row-check:checked');
      const total = document.querySelectorAll('.ship-row-check').length;
      const selAll = document.getElementById('selectAllAddresses');
      selAll.checked = checked.length === total && total > 0;
      selAll.indeterminate = checked.length > 0 && checked.length < total;
      document.getElementById('shipBulkLabel').textContent =
        `APPLY TO ALL CHECKED (${checked.length} of ${total} checked)`;
      document.getElementById('shipApplyBtn').disabled = checked.length === 0
        || !document.getElementById('bulkQtyInput').value;
    }
    function toggleSelectAll(cb) {
      document.querySelectorAll('.ship-row-check').forEach(c => c.checked = cb.checked);
      onRowCheck();
    }
    function deleteAddressRow(btn) {
      btn.closest('.ship-address-row').remove();
      onRowCheck();
      updateAddrCount();
    }
    function filterAddresses(val) {
      const lower = val.toLowerCase();
      document.querySelectorAll('.ship-address-row').forEach(row => {
        const name = row.querySelector('.list-item-name')?.textContent.toLowerCase() || '';
        const addr = row.querySelector('.list-item-value')?.textContent.toLowerCase() || '';
        row.style.display = (name + addr).includes(lower) ? '' : 'none';
      });
    }
    let shipAddrCount = 3;
    function addShippingAddress() {
      shipAddrCount++;
      const row = document.createElement('div');
      row.className = 'list-item ship-address-row';
      row.dataset.id = shipAddrCount;
      row.innerHTML = `
        <input type="checkbox" class="item-cb ship-row-check" onchange="onRowCheck()">
        <div class="list-item-name">New Address</div>
        <div class="list-item-value">—</div>
        <div class="ship-stepper">
          <button class="ship-stepper-btn" onclick="stepRow(this,-1)">−</button>
          <input class="ship-stepper-val" type="number" value="0" min="0">
          <button class="ship-stepper-btn" onclick="stepRow(this,1)">+</button>
        </div>
        <div class="list-item-actions">
          <button class="icon-btn" title="Edit address"><i class="fa-regular fa-pen"></i></button>
          <button class="icon-btn" title="Delete address" onclick="deleteAddressRow(this)"><i class="fa-regular fa-trash-can"></i></button>
        </div>`;
      document.getElementById('shipAddressList').appendChild(row);
      onRowCheck();
      updateAddrCount();
    }
