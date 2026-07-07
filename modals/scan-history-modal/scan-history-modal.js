    // ── Scan History ──
    // ── Status pill & scan history status changer ──
    const STATUS_OPTIONS = [
      { code: '100', label: 'Colin' },
      { code: '200', label: 'Proof Out' },
      { code: '305', label: 'Blake Gantz' },
      { code: '400', label: 'Creative' },
      { code: '500', label: 'Proof Out' },
      { code: '600', label: 'Tape Machine' },
      { code: '700', label: 'Bindery' },
      { code: '800', label: 'Shipped' },
      { code: '900', label: 'Complete' },
      { code: '950', label: 'Cancelled' },
    ];
    let currentStatus = { code: '700', label: 'Bindery On Cart', display: 'IN PRODUCTION' };
    let pendingStatus = null;
    function filterStatusDropdown(val) {
      const match = STATUS_OPTIONS.find(o => o.label.toLowerCase() === val.toLowerCase());
      if (match && match.code !== currentStatus.code) {
        pendingStatus = match;
        document.getElementById('applyStatusBtn').disabled = false;
      } else {
        pendingStatus = null;
        document.getElementById('applyStatusBtn').disabled = true;
      }
    }
function initStatusModal() {
      pendingStatus = null;
      pendingDetailStatus = null;
      document.getElementById('statusSearchInput').value = currentStatus.label;
      document.getElementById('applyStatusBtn').disabled = true;
      document.getElementById('detailStatusSearchInput').value = currentStatus.label;
      document.getElementById('applyDetailStatusBtn').disabled = true;
    }
function commitStatus(pending) {
      if (!pending || pending.code === currentStatus.code) return;
      const from = currentStatus.label;
      const to = pending.label;
      const now = new Date();
      const ts = now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })
        + ' ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

      // Add row to Job tab table
      const tbody = document.querySelector('#scan-panel-job .scan-table tbody');
      const tr = document.createElement('tr');
      tr.innerHTML = `<td class="col-timestamp">${ts}</td><td>${from}</td><td class="col-arrow">→</td><td>${to}</td>`;
      tr.style.background = 'var(--status-success-bg, #ebfbee)';
      tbody.appendChild(tr);
      setTimeout(() => tr.style.background = '', 1500);

      // Update current status
      currentStatus = { code: pending.code, label: pending.label, display: pending.label.toUpperCase() };
      document.getElementById('statusPill').textContent = currentStatus.display;
      document.getElementById('statusPill').title = currentStatus.label;
      document.getElementById('statusSearchInput').value = currentStatus.label;
      document.getElementById('detailStatusSearchInput').value = currentStatus.label;
    }

    function applyStatusChange() {
      commitStatus(pendingStatus);
      pendingStatus = null;
      document.getElementById('applyStatusBtn').disabled = true;

      // Switch to Job tab to show the new entry
      const jobTabBtn = document.querySelector('.scan-tab');
      switchScanTab('job', jobTabBtn);
    }
    // ── Detail tab status changer ──
    let pendingDetailStatus = null;
    function filterDetailStatusDropdown(val) {
      const match = STATUS_OPTIONS.find(o => o.label.toLowerCase() === val.toLowerCase());
      if (match && match.code !== currentStatus.code) {
        pendingDetailStatus = match;
        document.getElementById('applyDetailStatusBtn').disabled = false;
      } else {
        pendingDetailStatus = null;
        document.getElementById('applyDetailStatusBtn').disabled = true;
      }
    }
function applyDetailStatusChange() {
      commitStatus(pendingDetailStatus);
      pendingDetailStatus = null;
      document.getElementById('applyDetailStatusBtn').disabled = true;
    }
    function switchScanTab(tab, btn) {
      document.querySelectorAll('.scan-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.scan-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('scan-panel-' + tab).classList.add('active');
      // Disable detail dropdown if only one detail exists
      if (tab === 'detail') {
        const sel = document.getElementById('detailFilterSelect');
        const detailCount = document.querySelectorAll('.detail-card').length;
        sel.disabled = detailCount <= 1;
      }
    }
    function filterDetailScans(sel) {
      const val = sel.value;
      document.querySelectorAll('#detailScanBody tr').forEach(row => {
        row.style.display = (val === 'all' || row.dataset.detail === val) ? '' : 'none';
      });
    }
