// ── Dashboard component loader ──
// Same include mechanism as loader.js on the job detail page: each
// data-include placeholder is replaced with the <body> of that file,
// then the component scripts run.

(function () {
  'use strict';

  const SCRIPTS = [
    'components/modal-shell.js',
    'modals/proof-contacts-modal/proof-contacts-modal.js',
    'modals/duplicate-job-modal/duplicate-job-modal.js',
    'modals/create-customer-modal/create-customer-modal.js',
  ];

  async function resolveInclude(el) {
    const path = el.getAttribute('data-include');
    try {
      const res = await fetch(path);
      if (!res.ok) throw new Error(res.status + ' ' + res.statusText);
      const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
      el.replaceWith(...doc.body.childNodes);
    } catch (err) {
      console.error('[loader] could not load ' + path, err);
      el.remove();
    }
  }

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
    if (assembled) return;
    assembled = true;

    await Promise.all(
      Array.from(document.querySelectorAll('[data-include]')).map(resolveInclude)
    );

    for (const src of SCRIPTS) {
      try {
        await loadScript(src);
      } catch (err) {
        console.error('[loader]', err);
      }
    }

    // Component scripts init on DOMContentLoaded, so it is re-fired once the
    // includes are in. The shared sidebar also listens for it, so drop the
    // duplicate it inserts on that second pass.
    document.dispatchEvent(new Event('DOMContentLoaded'));
    document.querySelectorAll('.sidebar').forEach((el, i) => { if (i > 0) el.remove(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', assemble, { once: true });
  } else {
    assemble();
  }
})();
