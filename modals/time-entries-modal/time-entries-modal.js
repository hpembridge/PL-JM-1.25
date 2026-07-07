    // ── Time Entries ──
    function teAddEntry() {
      const date = document.getElementById('teDate').value;
      const hours = document.getElementById('teHours').value.padStart(2, '0');
      const minutes = document.getElementById('teMinutes').value.padStart(2, '0');
      const proof = document.getElementById('teProofSent').value.trim();
      const task = document.getElementById('teTask').value.trim();
      if (!date && !task) return;

      const list = document.getElementById('teList');
      const row = document.createElement('div');
      row.className = 'te-entry';

      // Format date as MM/DD/YY
      let displayDate = date;
      if (date) {
        const d = new Date(date + 'T00:00:00');
        displayDate = `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}/${String(d.getFullYear()).slice(2)}`;
      }
      const displayTime = (hours !== '00' || minutes !== '00') ? `${hours}:${minutes}` : '—';

      row.innerHTML = `
        <div class="te-initials">HP</div>
        <span class="te-val">${displayDate || '—'}</span>
        <span class="te-val">${displayTime}</span>
        <span class="te-val-sec">${proof || '—'}</span>
        <span class="te-val">${task || '—'}</span>
        <button class="icon-btn" title="Remove" onclick="this.closest('.te-entry').remove()"><i class="fa-regular fa-trash-can"></i></button>
      `;
      list.appendChild(row);

      // Clear inputs, reset date to today
      document.getElementById('teDate').value = new Date().toISOString().split('T')[0];
      document.getElementById('teHours').value = '';
      document.getElementById('teMinutes').value = '';
      document.getElementById('teProofSent').value = '';
      document.getElementById('teTask').value = '';
      document.getElementById('teTask').focus();
    }
