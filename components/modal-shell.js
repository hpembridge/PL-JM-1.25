    // ── Modals ──
    function openModal(section) {
      document.getElementById('modal-' + section).classList.add('open');
      document.body.style.overflow = 'hidden';
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
      showToast('Detail saved');
    }

    // ── Toast ── one shared #toast element; the message is set per call
    let _toastTimer = null;
    function showToast(message) {
      const t = document.getElementById('toast');
      if (!t) return;
      t.textContent = message;
      t.classList.add('show');
      clearTimeout(_toastTimer);
      _toastTimer = setTimeout(() => t.classList.remove('show'), 2500);
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
