    // ── Ship Delete Confirm Modal ──
    // Relies on table helpers defined in components/shipping-tab:
    // clearShipSelection(), onRowCheck(), updateAddrCount(), updateQtyBadge().

    function openDeleteSelectedConfirm() {
      const count = document.querySelectorAll('.ship-row-check:checked').length;
      if (count === 0) return;
      document.getElementById('shipDeleteConfirmTitle').textContent =
        `Delete ${count} address${count !== 1 ? 'es' : ''}?`;
      openModal('shipDeleteConfirm');
    }

    function confirmDeleteSelected() {
      document.querySelectorAll('.ship-row-check:checked').forEach(cb => {
        cb.closest('.ship-address-row').remove();
      });
      closeModal('shipDeleteConfirm');
      onRowCheck();
      updateAddrCount();
      updateQtyBadge();
    }

    function cancelShipDelete() {
      clearShipSelection();
      closeModal('shipDeleteConfirm');
    }
