    // ── Ship Settings Modal ──
    // Column/field visibility toggles for the shipping table
    // (components/shipping-tab). Applies hide-col-*/hide-field-* classes to
    // .ship-table (styled in shipping-tab.css) and defers the empty-state
    // check to _syncShipEmptyState(), defined alongside the table itself.

    function toggleShipCol(col, hidden) {
      document.querySelector('.ship-table')?.classList.toggle(`hide-col-${col}`, hidden);
      // Disable child field toggles when the column is hidden
      const subSelector = col === 'addr' ? '.addr-subfield' : col === 'delivery' ? '.delivery-subfield' : null;
      if (subSelector) {
        document.querySelectorAll(subSelector).forEach(input => {
          input.disabled = hidden;
        });
      }
      _syncShipEmptyState();
    }

    function toggleShipField(field, hidden) {
      document.querySelector('.ship-table')?.classList.toggle(`hide-field-${field}`, hidden);
    }

    // Eye-icon visibility toggle used in place of on/off switches — clicking
    // flips the icon between shown (eye) and hidden (eye-closed) and delegates
    // to the col/field toggle logic above.
    function toggleShipVisibility(btn, kind, name) {
      const hidden = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(hidden));
      btn.title = hidden ? 'Show' : 'Hide';
      btn.querySelector('i').className = hidden ? 'fa-regular fa-eye-closed' : 'fa-regular fa-eye';
      if (kind === 'col') toggleShipCol(name, hidden);
      else toggleShipField(name, hidden);
    }
