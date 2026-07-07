    // ── Job Type conditional ──
    function onJobTypeChange(sel) {
      document.getElementById('oldJobNumField').classList.toggle('collapsed', sel.value === 'new');
    }
