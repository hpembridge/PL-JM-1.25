    // ── Modals ──
    function openModal(section) {
      document.getElementById('modal-' + section).classList.add('open');
      document.body.style.overflow = 'hidden';
      if (section === 'timeEntries') {
        const dateInput = document.getElementById('teDate');
        if (dateInput && !dateInput.value) {
          dateInput.value = new Date().toISOString().split('T')[0];
        }
      }
      if (section === 'scanHistory') {
        initStatusModal();
      }
    }
    function closeModal(section) {
      document.getElementById('modal-' + section).classList.remove('open');
      document.body.style.overflow = '';
    }
    function handleOverlayClick(e, section) {
      if (e.target === e.currentTarget) closeModal(section);
    }
    function saveModal(section) {
      closeModal(section);
      const t = document.getElementById('toast');
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    }
    // ── Escape key closes any open modal ──
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(m => {
          m.classList.remove('open');
        });
        document.body.style.overflow = '';
      }
    });
