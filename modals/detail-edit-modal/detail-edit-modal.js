    // ── Detail section state (tracks which sections have data per card) ──
    const detailSectionState = {
      'detail-1': { general: true, paper: true, print: false, bindery: false, boards: false }
    };
    const DETAIL_SECTION_LABELS = {
      general: 'General',
      paper: 'Paper',
      print: 'Print Finishing',
      bindery: 'Bindery Finishing',
      boards: 'Interior Boards'
    };
    let currentDetailId = null;
    function openDetailEdit(cardId, tab) {
      currentDetailId = cardId;
      const card = document.getElementById(cardId);
      // Extract text content of title, skipping the number badge
      const titleEl = card?.querySelector('.detail-card-title');
      const titleText = titleEl
        ? [...titleEl.childNodes].filter(n => n.nodeType === Node.TEXT_NODE).map(n => n.textContent.trim()).join('').trim()
        : 'Detail';
      document.getElementById('detailEditTitle').textContent = 'Edit Detail — ' + titleText;

      // Switch to requested tab (default: general)
      const targetTab = tab || 'general';
      const tabBtn = document.querySelector(`.detail-edit-tab[data-tab="${targetTab}"]`);
      if (tabBtn) switchDetailTab(tabBtn, targetTab);

      openModal('detailEdit');
    }
    function switchDetailTab(btn, tab) {
      const modal = btn.closest('.modal-panel');
      modal.querySelectorAll('.detail-edit-tab').forEach(t => t.classList.remove('active'));
      modal.querySelectorAll('.detail-edit-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      // Support data-panel attribute (generic) or fall back to dep- prefix (detail-edit modal)
      const panel = modal.querySelector(`.detail-edit-panel[data-panel="${tab}"]`)
        || document.getElementById('dep-' + tab);
      if (panel) panel.classList.add('active');
    }
    function saveDetailEdit() {
      if (!currentDetailId) return;
      const activeTab = document.querySelector('.detail-edit-tab.active')?.dataset.tab;
      if (activeTab) {
        if (!detailSectionState[currentDetailId]) detailSectionState[currentDetailId] = {};
        detailSectionState[currentDetailId][activeTab] = true;
        updateDetailPills(currentDetailId);
      }
      closeModal('detailEdit');
      const t = document.getElementById('toast');
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 2500);
    }
    function updateDetailPills(cardId) {
      const num = cardId.replace('detail-', '');
      const state = detailSectionState[cardId] || {};

      // Update header pills
      const container = document.getElementById('detail-pills-' + num);
      if (container) {
        container.innerHTML = '';
        Object.entries(DETAIL_SECTION_LABELS).forEach(([key, label]) => {
          if (state[key]) {
            const pill = document.createElement('span');
            pill.className = 'section-pill active';
            pill.textContent = label;
            container.appendChild(pill);
          }
        });
      }

      // Show/hide section content vs empty state
      const sectionKeys = Object.keys(DETAIL_SECTION_LABELS);
      sectionKeys.forEach(key => {
        const el = document.getElementById(`ds-${key}-${num}`);
        if (!el) return;
        el.classList.remove('hidden-section');
        const empty = el.querySelector('.detail-empty-prompt');
        const fields = el.querySelector('.detail-fields');
        if (empty) empty.classList.toggle('hidden-section', !!state[key]);
        if (fields) fields.classList.toggle('hidden-section', !state[key]);
      });
    }
    // ── Collapsible sections ──
    // ── Interior Boards ──
    let insertSizeCount = 1;
function selectBoardType(type, btn) {
      const btns = document.querySelectorAll('#boardSegToggle .seg-toggle-btn');
      const wasActive = btn.classList.contains('active');
      btns.forEach(b => b.classList.remove('active'));
      if (!wasActive) btn.classList.add('active');
      const anyActive = document.querySelector('#boardSegToggle .seg-toggle-btn.active');
      document.getElementById('boardDetailsEmpty').style.display = anyActive ? 'none' : '';
    }
    function addInsertSize() {
      insertSizeCount++;
      const n = insertSizeCount;
      const list = document.getElementById('insertSizeList');
      const block = document.createElement('div');
      block.className = 'insert-size-block';
      block.dataset.insert = n;
      block.innerHTML = `
          <div class="insert-size-fields">
            <span class="insert-row-num">${n}</span>
            <div><input class="form-input" type="text" /></div>
            <div><input class="form-input" type="text" /></div>
            <div><input class="form-input" type="number" value="0" min="0" /></div>
            <div><input class="form-input" type="number" value="0" min="0" /></div>
            <button class="icon-btn" title="Remove" onclick="removeInsertSize(this)"><i class="fa-regular fa-trash-can"></i></button>
          </div>
        `;
      list.appendChild(block);
      renumberInsertSizes();
    }
    function removeInsertSize(btn) {
      btn.closest('.insert-size-block').remove();
      renumberInsertSizes();
    }
    function renumberInsertSizes() {
      document.querySelectorAll('#insertSizeList .insert-size-block').forEach((block, i) => {
        block.querySelector('.insert-row-num').textContent = i + 1;
      });
    }
    function addSpecialInstructions(btn) {
      const body = document.getElementById('specialInstructionsBody');
      btn.remove();
      const ta = document.createElement('textarea');
      ta.className = 'form-input';
      ta.rows = 4;
      ta.placeholder = 'Enter special instructions…';
      body.appendChild(ta);
    }
    function clearSpecialInstructions() {
      const body = document.getElementById('specialInstructionsBody');
      body.innerHTML = `<button class="btn-add-sub" onclick="addSpecialInstructions(this)"><i class="fa-solid fa-plus"></i> Add Special Instructions</button>`;
    }
    // ── Bindery conditional fields ──
    function onDecorationChange() {
      const any = document.querySelectorAll('.decoration-chk:checked').length > 0;
      document.getElementById('decorationColor').classList.toggle('collapsed', !any);
    }
    function onBindingChange() {
      const any = document.querySelectorAll('.binding-chk:checked').length > 0;
      document.getElementById('bindingDesc').classList.toggle('collapsed', !any);
    }
    function onClipChange(chk) {
      document.getElementById('clipColor').classList.toggle('collapsed', !chk.checked);
    }
    // ── Addon toggles (Lamination, UV Coat) ──
    function toggleAddon(id, row) {
      row.classList.toggle('on');
      document.getElementById(id).classList.toggle('collapsed', !row.classList.contains('on'));
    }
    // ── Round Corners toggle ──
    function toggleCornerSize(chk) {
      document.getElementById('cornerSize').classList.toggle('collapsed', !chk.checked);
    }
