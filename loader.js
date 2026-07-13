// ── Component loader ──
// Assembles the job detail page from its building blocks at runtime.
//
// How it works:
//   1. Every section of the page lives in its own standalone .html file
//      (see the components/ and modals/ folders). Each file is a complete,
//      openable document so you can preview and edit one piece in isolation.
//   2. In job-detail-page.html, each section is represented by a placeholder:
//        <div data-include="components/topbar/topbar.html"></div>
//   3. On load, this script fetches each placeholder's file, takes the markup
//      inside its <body>, and swaps it in where the placeholder sits — so the
//      final page is identical to one big hand-written file, just assembled
//      from parts.
//   4. Once all the HTML is in place, the component scripts are loaded in order
//      and DOMContentLoaded is re-fired so each one initialises normally.
//
// NOTE: fetch() only works when the page is served over http (e.g.
// `python3 -m http.server`), not by double-clicking the file (file://).

(function () {
  'use strict';

  // Component scripts, loaded in order AFTER the HTML is assembled.
  // (The devs won't touch these — the JS just makes the prototype work.)
  const SCRIPTS = [
    'components/modal-shell.js',
    'components/topbar/topbar.js',
    'job-detail.js',
    'components/production-tab/production-tab.js',
    'components/shipping-tab/shipping-tab.js',
    'modals/detail-edit-modal/detail-edit-modal.js',
    'modals/edit-job-modal/edit-job-modal.js',
    'modals/trello-confirm-modal/trello-confirm-modal.js',
    'modals/proof-contacts-modal/proof-contacts-modal.js',
    'modals/scan-history-modal/scan-history-modal.js',
    'modals/manage-notes-modal/manage-notes-modal.js',
  ];

  // Replace one placeholder with the <body> contents of its component file.
  async function resolveInclude(el) {
    const path = el.getAttribute('data-include');
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const markup = await res.text();
      const doc = new DOMParser().parseFromString(markup, 'text/html');
      el.replaceWith(...doc.body.childNodes);
    } catch (err) {
      console.error('[loader] could not load ' + path, err);
      el.replaceWith(
        Object.assign(document.createElement('div'), {
          style: 'padding:12px;color:#b00;font:13px system-ui',
          textContent: 'Failed to load component: ' + path,
        })
      );
    }
  }

  // Load one script and wait for it to finish executing.
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src;
      s.onload = resolve;
      s.onerror = () => reject(new Error('Failed to load script: ' + src));
      document.body.appendChild(s);
    });
  }

  let assembled = false;
  async function assemble() {
    if (assembled) return; // never run twice (we re-fire DOMContentLoaded below)
    assembled = true;

    // 1. Resolve every include (in parallel — each swaps in at its own spot).
    const placeholders = Array.from(document.querySelectorAll('[data-include]'));
    await Promise.all(placeholders.map(resolveInclude));

    // 2. Now that the DOM is complete, run the component scripts in order.
    for (const src of SCRIPTS) {
      try {
        await loadScript(src);
      } catch (err) {
        console.error('[loader]', err);
      }
    }

    // 3. Re-fire DOMContentLoaded so scripts that init on it wire up correctly.
    document.dispatchEvent(new Event('DOMContentLoaded'));
  }

  // {once:true} so re-firing DOMContentLoaded (to init the component scripts)
  // doesn't re-trigger assemble itself.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', assemble, { once: true });
  } else {
    assemble();
  }
})();
