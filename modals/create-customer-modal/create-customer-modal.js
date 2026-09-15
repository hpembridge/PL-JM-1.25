// ── Create New Customer modal ─────────────────────────────────────────
// Three steps: General, Add Contact, Add Address. Navigation follows the
// same rule as the Duplicate Job modal — always free to go back, never
// forward past a step that is missing something.

const CC_STEPS = ['general', 'contact', 'address'];
const CC_REQUIRED = { general: ['cc-customer-name', 'cc-short-name', 'cc-main-phone'], contact: [], address: [] };
const ccTouched = new Set();

function ccCurrentStep() {
  return document.querySelector('#modal-createCustomer .dj-panel.active')?.dataset.panel || CC_STEPS[0];
}

function ccGoToStep(step) {
  const modal = document.getElementById('modal-createCustomer');
  if (!modal) return;
  const index = CC_STEPS.indexOf(step);

  modal.querySelectorAll('.dj-step').forEach(btn => {
    const i = CC_STEPS.indexOf(btn.dataset.step);
    btn.classList.toggle('active', i === index);
    btn.classList.toggle('complete', i < index);
  });
  modal.querySelectorAll('.dj-panel').forEach(p => {
    p.classList.toggle('active', p.dataset.panel === step);
  });

  const fill = document.getElementById('cc-steps-rail-fill');
  if (fill) fill.style.width = ((index + 1) / CC_STEPS.length * 100) + '%';

  modal.querySelector('.modal-body').scrollTop = 0;
  ccUpdateFooter();
  ccValidate();
}

function ccUpdateFooter() {
  const i = CC_STEPS.indexOf(ccCurrentStep());
  const last = i === CC_STEPS.length - 1;
  document.getElementById('cc-back-btn')?.classList.toggle('hidden-section', i === 0);
  document.getElementById('cc-next-btn')?.classList.toggle('hidden-section', last);
  document.getElementById('cc-create-btn')?.classList.toggle('hidden-section', !last);
}

function ccValidate() {
  const invalid = { general: [], contact: [], address: [] };

  Object.entries(CC_REQUIRED).forEach(([step, ids]) => {
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const ok = !!el.value.trim();
      const show = !ok && ccTouched.has(step);
      el.classList.toggle('dj-invalid', show);
      el.parentElement.querySelector('.dj-field-error')?.classList.toggle('hidden-section', !show);
      if (!ok) invalid[step].push(id);
    });
  });

  CC_STEPS.forEach(step => {
    const flag = document.querySelector('#modal-createCustomer .dj-step[data-step="' + step + '"] .dj-step-flag');
    if (flag) flag.classList.toggle('hidden-section', invalid[step].length === 0 || !ccTouched.has(step));
  });

  return invalid;
}

function ccRequestStep(target) {
  const step = ccCurrentStep();
  const forward = CC_STEPS.indexOf(target) > CC_STEPS.indexOf(step);

  if (forward) {
    ccTouched.add(step);
    if (ccValidate()[step].length) return false;
  }

  ccGoToStep(target);
  return true;
}

function ccNext() {
  ccRequestStep(CC_STEPS[CC_STEPS.indexOf(ccCurrentStep()) + 1]);
}

function ccBack() {
  const i = CC_STEPS.indexOf(ccCurrentStep());
  if (i > 0) ccRequestStep(CC_STEPS[i - 1]);
}

function openCreateCustomer() {
  ccTouched.clear();
  ccGoToStep('general');
  openModal('createCustomer');
}

function ccCreate() {
  CC_STEPS.forEach(step => ccTouched.add(step));
  const invalid = ccValidate();
  const firstBad = CC_STEPS.find(step => invalid[step].length);
  if (firstBad) { ccGoToStep(firstBad); return; }
  saveModal('createCustomer');
}

// ── Contact email / phone rows — same helpers customer maintenance uses ──
const CONTACT_METHOD_MAX = 6;

function addContactMethod(type) {
  const emailRows = document.getElementById('contact-email-rows');
  const phoneRows = document.getElementById('contact-phone-rows');
  const total = emailRows.querySelectorAll('.contact-method-row').length
              + phoneRows.querySelectorAll('.contact-method-row').length;
  if (total >= CONTACT_METHOD_MAX) return;

  const container = type === 'email' ? emailRows : phoneRows;
  const template = container.querySelector('.contact-method-row');
  const row = template.cloneNode(true);
  row.querySelectorAll('input').forEach(i => (i.value = ''));
  container.appendChild(row);
}

function removeContactMethodRow(btn) {
  const container = btn.closest('.contact-method-row').parentElement;
  if (container.querySelectorAll('.contact-method-row').length > 1) {
    btn.closest('.contact-method-row').remove();
  }
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('modal-createCustomer')) ccGoToStep('general');
});
