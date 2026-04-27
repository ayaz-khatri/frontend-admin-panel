/* ══════════════════════════════════════════════════════════════
   COMPONENTS.JS — Reusable interactive UI behaviours
   Requires: core.js (SC namespace)
   Load after core.js, before auth.js / dashboard.js.
══════════════════════════════════════════════════════════════ */

var SC = window.SC || {};

/* ─────────────────────────────────────
   PASSWORD VISIBILITY TOGGLE
   Works on any .toggle-pw icon inside .form-floating-custom.
   Auto-initialised on DOMContentLoaded; call
   SC.Components.initPasswordToggles(root) to re-init
   inside dynamically injected markup.
───────────────────────────────────── */
SC.Components = SC.Components || {};

SC.Components.initPasswordToggles = function (root) {
  root = root || document;
  root.querySelectorAll('.toggle-pw').forEach(function (icon) {
    if (icon._pwInit) return;
    icon._pwInit = true;
    icon.addEventListener('click', function () {
      var input = this.closest('.form-floating-custom');
      if (!input) return;
      input = input.querySelector('input');
      if (!input) return;
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      this.classList.toggle('fa-eye',       !show);
      this.classList.toggle('fa-eye-slash',  show);
    });
  });
};

/* ─────────────────────────────────────
   PASSWORD STRENGTH METER
   Attach by adding data-strength="meterId" to a password <input>.
   The meter div with that id is toggled and updated automatically.

   Public API:
     SC.Components.checkStrength(password, meterEl) → score 0-5
   Also emits a custom event 'sc:strength' on the input with detail {score}.
───────────────────────────────────── */
SC.Components.checkStrength = function (pw, meter) {
  var rules = {
    length:  pw.length >= 8,
    upper:   /[A-Z]/.test(pw),
    lower:   /[a-z]/.test(pw),
    number:  /[0-9]/.test(pw),
    special: /[^A-Za-z0-9]/.test(pw)
  };
  var score = Object.values(rules).filter(Boolean).length;

  /* Update rule indicators */
  Object.keys(rules).forEach(function (key) {
    var el = meter.querySelector('[data-rule="' + key + '"]');
    if (!el) return;
    var icon = el.querySelector('.rule-icon');
    el.classList.toggle('pass', rules[key]);
    el.classList.toggle('fail', !rules[key]);
    if (icon) icon.innerHTML = rules[key]
      ? '<i class="fa-solid fa-check"></i>'
      : '<i class="fa-solid fa-xmark"></i>';
  });

  /* Strength bars */
  var bars  = meter.querySelectorAll('.strength-bar');
  var label = meter.querySelector('.strength-label');
  var lvl   = score <= 2 ? 'weak' : score === 3 ? 'fair' : score === 4 ? 'good' : 'strong';
  var fills = { weak: 1, fair: 2, good: 3, strong: 4 };
  var labels = { weak: 'Weak', fair: 'Fair', good: 'Good', strong: 'Strong' };

  bars.forEach(function (bar, i) {
    bar.className = 'strength-bar';
    if (i < fills[lvl]) bar.classList.add(lvl);
  });
  if (label) {
    label.className = 'strength-label ' + lvl;
    label.textContent = labels[lvl];
  }
  return score;
};

SC.Components.initStrengthMeters = function (root) {
  root = root || document;
  root.querySelectorAll('[data-strength]').forEach(function (input) {
    if (input._strengthInit) return;
    input._strengthInit = true;
    var meter = document.getElementById(input.getAttribute('data-strength'));
    if (!meter) return;
    input.addEventListener('input', function () {
      if (!this.value) { meter.classList.remove('visible'); return; }
      meter.classList.add('visible');
      var score = SC.Components.checkStrength(this.value, meter);
      this.dispatchEvent(new CustomEvent('sc:strength', { detail: { score: score }, bubbles: true }));
    });
  });
};

/* ─────────────────────────────────────
   GENDER / SEGMENTED SELECTOR
   Works on .gender-group containing .gender-option labels.
───────────────────────────────────── */
SC.Components.initGenderSelectors = function (root) {
  root = root || document;
  root.querySelectorAll('.gender-group').forEach(function (group) {
    if (group._genderInit) return;
    group._genderInit = true;
    group.querySelectorAll('.gender-option').forEach(function (opt) {
      opt.addEventListener('click', function () {
        group.querySelectorAll('.gender-option').forEach(function (o) {
          o.classList.remove('selected');
          var inp = o.querySelector('input');
          if (inp) inp.checked = false;
        });
        this.classList.add('selected');
        var inp = this.querySelector('input');
        if (inp) inp.checked = true;
      });
    });
  });
};

/* ─────────────────────────────────────
   LIVE PASSWORD MATCH CHECKER
   Usage:
     SC.Components.initPasswordMatch(passwordInputId, confirmInputId, msgElId)
   Adds is-valid/is-invalid classes and fills the message element.
───────────────────────────────────── */
SC.Components.initPasswordMatch = function (pwId, confirmId, msgId) {
  var pw      = document.getElementById(pwId);
  var confirm = document.getElementById(confirmId);
  var msg     = document.getElementById(msgId);
  if (!pw || !confirm) return;

  function check() {
    if (!confirm.value) {
      confirm.classList.remove('is-invalid', 'is-valid');
      if (msg) { msg.className = 'field-msg'; msg.textContent = ''; }
      return;
    }
    var match = pw.value === confirm.value;
    confirm.classList.toggle('is-valid',   match);
    confirm.classList.toggle('is-invalid', !match);
    if (msg) {
      msg.className   = 'field-msg ' + (match ? 'success' : 'error');
      msg.textContent = match ? 'Passwords match' : 'Passwords do not match';
    }
  }
  confirm.addEventListener('input', check);
  pw.addEventListener('input', check);
};

/* ─────────────────────────────────────
   BUTTON LOADING STATE
   Usage:
     SC.Components.setLoading(btn, true)   // start
     SC.Components.setLoading(btn, false)  // stop
   The button needs: <span class="btn-label">…</span> + <div class="spinner"></div>
───────────────────────────────────── */
SC.Components.setLoading = function (btn, state) {
  btn.classList.toggle('loading', state);
  btn.disabled = state;
};

/* Backwards compat alias */
window.setLoading = SC.Components.setLoading;

/* ─────────────────────────────────────
   DOM READY — wire all components
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  SC.Components.initPasswordToggles();
  SC.Components.initStrengthMeters();
  SC.Components.initGenderSelectors();
});