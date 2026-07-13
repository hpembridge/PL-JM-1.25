    // ── Print button ──
    // Checks whether interior boards (or future print items) are specified
    // and toggles between the simple button and the split button accordingly.
    function initPrintButton() {
      const boardsFields = document.querySelector('#ds-boards-1 .detail-fields');
      const hasBoards = boardsFields && !boardsFields.classList.contains('hidden-section');
      document.getElementById('print-btn-simple').style.display = hasBoards ? 'none' : 'inline-flex';
      document.getElementById('print-btn-split').style.display  = hasBoards ? 'inline-flex' : 'none';
    }

    function togglePrintMenu(e) {
      e.stopPropagation();
      document.getElementById('print-menu').classList.toggle('open');
    }

    // Close print menu on outside click
    document.addEventListener('click', function () {
      const menu = document.getElementById('print-menu');
      if (menu) menu.classList.remove('open');
    });

    document.addEventListener('DOMContentLoaded', initPrintButton);

    // ── Tabs ──
    function switchTab(btn, panel) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden-section'));
      const el = document.getElementById('tab-panel-' + panel);
      if (el) el.classList.remove('hidden-section');
    }
