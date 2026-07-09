    // ── Add Detail ──
    let detailCount = 1;
    function addDetail() {
      detailCount++;
      const n = detailCount;
      const id = `detail-${n}`;
      const card = document.createElement('div');
      card.className = 'detail-card';
      card.id = id;

      const sections = [
        { key: 'general',  title: 'General',           empty: 'No general info specified.' },
        { key: 'paper',    title: 'Paper',              empty: 'No paper info specified.' },
        { key: 'print',    title: 'Print Finishing',    empty: 'No print finishing specified.' },
        { key: 'bindery',  title: 'Bindery Finishing',  empty: 'No bindery finishing specified.' },
        { key: 'boards',   title: 'Interior Boards',    empty: 'No interior boards specified.' },
      ];

      card.innerHTML = `
        <div class="detail-card-header">
          <div class="detail-card-title">
            <span class="detail-num">${n}</span>
            New Detail
          </div>
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
          ${sections.map(s => `
          <div class="detail-section" id="ds-${s.key}-${n}">
            <div class="detail-fields hidden-section">
              <div class="detail-section-header">
                <i class="fa-solid fa-circle-check detail-section-icon"></i>
                <span class="detail-section-title">${s.title}</span>
              </div>
              <div class="spec-tiles"></div>
            </div>
            <div class="detail-empty-prompt">
              <i class="fa-regular fa-circle-minus"></i>
              <span>${s.empty}</span>
            </div>
          </div>`).join('')}
        </div>
      `;

      detailSectionState[id] = { general: false, paper: false, print: false, bindery: false, boards: false };
      document.getElementById('detail-grid').appendChild(card);
      openDetailEdit(id);
    }
