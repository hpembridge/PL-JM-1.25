/* manage-notes-modal.js */

(function () {

  function _editorIsOpen() {
    return document.getElementById('notesEditorPane').classList.contains('editor-active');
  }

  function _setEditorOpen(open) {
    document.getElementById('notesEditorPane').classList.toggle('editor-active', open);
    document.getElementById('notesCardList').style.display = open ? 'none' : '';
    const btn = document.getElementById('notesAddBtn');
    btn.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-plus';
    btn.title = open ? 'Cancel' : 'Add note';
  }

  // ── Filter pills ──
  function filterNotes(type, btn) {
    const wasActive = btn.classList.contains('active');
    document.querySelectorAll('.notes-filter-bar .notes-pill').forEach(p => p.classList.remove('active'));

    if (wasActive && type !== 'all') {
      const allBtn = document.querySelector('.notes-filter-bar .notes-pill[data-type="all"]');
      if (allBtn) allBtn.classList.add('active');
      type = 'all';
    } else {
      btn.classList.add('active');
    }

    document.querySelectorAll('.notes-card').forEach(card => {
      card.style.display = (type === 'all' || card.dataset.noteType === type) ? '' : 'none';
    });
  }

  // ── Search ──
  function filterNotesList(query) {
    const q = query.toLowerCase();
    document.querySelectorAll('.notes-card').forEach(card => {
      const text = card.querySelector('.notes-card-text')?.textContent.toLowerCase() ?? '';
      card.style.display = text.includes(q) ? '' : 'none';
    });
  }

  // ── Toggle add/cancel via the + / × button ──
  function toggleNoteEditor() {
    if (_editorIsOpen()) {
      _clearFields();
      _setEditorOpen(false);
    } else {
      _clearFields();
      _setEditorOpen(true);
    }
  }

  // ── Edit existing note ──
  function editNote(btn) {
    const card = btn.closest('.notes-card');
    document.querySelectorAll('.notes-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    document.getElementById('noteTypeSelect').value = card.dataset.noteType ?? '';
    document.getElementById('noteTextarea').value = card.querySelector('.notes-card-text')?.textContent.trim() ?? '';
    _setEditorOpen(true);
  }

  // ── Delete note ──
  function deleteNote(btn) {
    btn.closest('.notes-card').remove();
  }

  // ── Clear fields only ──
  function _clearFields() {
    document.getElementById('noteTypeSelect').value = '';
    document.getElementById('noteTextarea').value = '';
    document.getElementById('notePrivate').checked = false;
    document.getElementById('notePrintOnTicket').checked = false;
    document.querySelectorAll('.notes-card').forEach(c => c.classList.remove('active'));
  }

  // ── Cancel / close editor ──
  function clearNoteEditor() {
    _clearFields();
    _setEditorOpen(false);
  }

  // ── Save note ──
  function saveNote() {
    const type = document.getElementById('noteTypeSelect').value;
    const text = document.getElementById('noteTextarea').value.trim();
    if (!type || !text) return;

    const activeCard = document.querySelector('.notes-card.active');
    if (activeCard) {
      activeCard.querySelector('.notes-card-text').textContent = text;
      activeCard.querySelector('.notes-type-pill').textContent =
        type.charAt(0).toUpperCase() + type.slice(1);
      activeCard.dataset.noteType = type;
    } else {
      const today = new Date();
      const date = `${(today.getMonth()+1).toString().padStart(2,'0')}/${today.getDate().toString().padStart(2,'0')}/${String(today.getFullYear()).slice(-2)}`;
      const card = document.createElement('div');
      card.className = 'notes-card';
      card.dataset.noteType = type;
      card.innerHTML = `
        <div class="notes-card-header">
          <span class="notes-type-pill">${type.charAt(0).toUpperCase() + type.slice(1)}</span>
          <div class="notes-card-actions">
            <button class="icon-btn" title="Edit" onclick="editNote(this)"><i class="fa-regular fa-pen"></i></button>
            <button class="icon-btn" title="Delete" onclick="deleteNote(this)"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        </div>
        <p class="notes-card-text">${text}</p>
        <div class="notes-card-meta"><span>You</span><span>${date}</span></div>`;
      document.getElementById('notesCardList').prepend(card);
    }

    _clearFields();
    _setEditorOpen(false);
  }

  const NOTE_TYPE_HELP = {
    general:  'Appears in the General Notes section on the Production tab.',
    shipping: 'Appears as a notice on the Shipping tab.',
    detail:   'Appears in the detail card body and within the Detail Edit modal.',
    billing:  'Saved to the job record. Not currently surfaced anywhere in the UI.',
  };

  function updateNoteTypeHelp(select) {
    const help = document.getElementById('noteTypeHelp');
    if (!help) return;
    const msg = NOTE_TYPE_HELP[select.value];
    if (msg) {
      help.textContent = msg;
      help.classList.remove('hidden-section');
    } else {
      help.classList.add('hidden-section');
    }
  }

  // Expose to inline handlers
  window.filterNotes        = filterNotes;
  window.filterNotesList    = filterNotesList;
  window.toggleNoteEditor   = toggleNoteEditor;
  window.editNote           = editNote;
  window.deleteNote         = deleteNote;
  window.clearNoteEditor    = clearNoteEditor;
  window.saveNote           = saveNote;
  window.updateNoteTypeHelp = updateNoteTypeHelp;

})();
