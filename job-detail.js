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

    // ── Collapsible widget (Production + Shipping) ──
    // Prototype only: in Angular this is an `isCollapsed` boolean on the widget
    // component (default true) bound to [class.widget--collapsed] / [attr.aria-expanded].
    function setWidgetCollapsed(widget, collapsed) {
      widget.classList.toggle('widget--collapsed', collapsed);
      const toggle = widget.querySelector('.widget-toggle');
      toggle.setAttribute('aria-expanded', String(!collapsed));
      toggle.title = collapsed ? 'Expand panel' : 'Collapse panel';
    }

    function toggleWidget(btn) {
      const widget = btn.closest('.widget');
      setWidgetCollapsed(widget, !widget.classList.contains('widget--collapsed'));
    }

    // Rail icons (contacts, notes) open the full widget
    function expandWidget(btn) {
      setWidgetCollapsed(btn.closest('.widget'), false);
    }

    // Rail badge counts. Contacts come from the Job Contacts modal state;
    // notes are counted from the widget's note list. A 0 count disables the icon.
    function setRailCount(badgeId, count) {
      const badge = document.getElementById(badgeId);
      if (!badge) return;
      badge.textContent = count;
      badge.closest('.widget-rail-btn').disabled = count === 0;
    }

    function updateWidgetCounts() {
      if (typeof jcSelected !== 'undefined') {
        setRailCount('prodContactsCount', jcSelected.proofs.length);
        setRailCount('shipContactsCount', jcSelected.shipping.length);
      }
      setRailCount('prodNotesCount', document.querySelectorAll('#prodNotesList .widget-note-item').length);
      setRailCount('shipNotesCount', document.querySelectorAll('#shipNotesList .widget-note-item').length);
    }

    document.addEventListener('DOMContentLoaded', updateWidgetCounts);
