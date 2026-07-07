    // ── Tabs ──
    function switchTab(btn, panel) {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden-section'));
      const el = document.getElementById('tab-panel-' + panel);
      if (el) el.classList.remove('hidden-section');
    }
