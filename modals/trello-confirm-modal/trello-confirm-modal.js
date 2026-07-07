    // ── Trello flow ──
    function trelloAction() {
      const btn = document.getElementById('trello-btn');
      // If already sent, open Trello (no-op in prototype)
      if (btn.dataset.state === 'done') return;
      openModal('trelloConfirm');
    }
    function confirmTrello() {
      closeModal('trelloConfirm');
      const btn = document.getElementById('trello-btn');
      // Loading state
      btn.disabled = true;
      btn.innerHTML = 'Sending…<i class="fa-solid fa-spinner-third fa-spin"></i>';
      setTimeout(() => {
        // Confirm state
        btn.innerHTML = 'Sent! <i class="fa-solid fa-circle-check" ></i> ';
        setTimeout(() => {
          // Final state
          btn.innerHTML = ' View on Trello';
          btn.disabled = false;
          btn.dataset.state = 'done';
        }, 1200);
      }, 1800);
    }
