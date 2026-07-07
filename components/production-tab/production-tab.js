    // ── Add Detail ──
    let detailCount = 1;
    function addDetail() {
      detailCount++;
      const panel = document.getElementById('tab-panel-production');
      const n = detailCount;
      const id = `detail-${n}`;
      const card = document.createElement('div');
      card.className = 'detail-card';
      card.id = id;
      card.innerHTML = `
        <div class="detail-card-header">
          <div class="detail-card-title">
            <span class="detail-num">${n}</span>
            New Detail
          </div>
          <div class="detail-pills" id="detail-pills-${n}"></div>
          <div class="detail-card-actions">
            <button class="icon-btn" title="Edit detail" onclick="openDetailEdit('${id}')">
              <i class="fa-regular fa-pen"></i>
            </button>
            <button class="icon-btn" title="Remove detail" onclick="this.closest('.detail-card').remove()">
              <i class="fa-regular fa-trash-can"></i>
            </button>
          </div>
        </div>
        <div class="detail-card-body">
          <div class="detail-section hidden-section" id="ds-general-${n}">
            <div class="detail-section-header"><span class="detail-section-title">General</span></div>
            <div class="detail-empty-prompt">No general info specified.</div>
          </div>
          <div class="detail-section hidden-section" id="ds-paper-${n}">
            <div class="detail-section-header"><span class="detail-section-title">Paper</span></div>
            <div class="detail-empty-prompt">No paper info specified.</div>
          </div>
          <div class="detail-section hidden-section" id="ds-print-${n}">
            <div class="detail-section-header"><span class="detail-section-title">Print Finishing</span></div>
            <div class="detail-empty-prompt">No print finishing specified.</div>
          </div>
          <div class="detail-section hidden-section" id="ds-bindery-${n}">
            <div class="detail-section-header"><span class="detail-section-title">Bindery Finishing</span></div>
            <div class="detail-empty-prompt">No bindery finishing specified.</div>
          </div>
          <div class="detail-section hidden-section" id="ds-boards-${n}">
            <div class="detail-section-header"><span class="detail-section-title">Interior Boards</span></div>
            <div class="detail-empty-prompt">No interior boards specified.</div>
          </div>
        </div>
      `;
      detailSectionState[id] = { general: false, paper: false, print: false, bindery: false, boards: false };
      panel.appendChild(card);
    }
