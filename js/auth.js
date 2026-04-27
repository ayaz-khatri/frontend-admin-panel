/* ══════════════════════════════════════════════════════════════
   AUTH.JS — Form validation & submission logic for auth pages
   Requires: core.js · components.js (SC namespace)
══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', function () {

  /* ─────────────────────────────────────
     VALIDATION HELPERS
  ───────────────────────────────────── */

  function isValidEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
  }

  /**
   * Validate a single field.
   * @param  {HTMLInputElement} input
   * @param  {HTMLElement|null} msgEl
   * @param  {Object}          [opts]  - { minLength, label }
   * @return {boolean}
   */
  function validateField(input, msgEl, opts) {
    opts = opts || {};
    var val  = input.value.trim();
    var ok   = true;
    var msg  = '';
    var label = opts.label || 'This field';

    if (!val) {
      ok = false; msg = label + ' is required.';
    } else if (input.type === 'email' && !isValidEmail(val)) {
      ok = false; msg = 'Enter a valid email address.';
    } else if ((input.id === 'password' || input.id === 'newPassword') && val.length < 8) {
      ok = false; msg = 'Password must be at least 8 characters.';
    } else if (opts.minLength && val.length < opts.minLength) {
      ok = false; msg = label + ' must be at least ' + opts.minLength + ' characters.';
    }

    input.classList.toggle('is-invalid', !ok);
    input.classList.toggle('is-valid',   ok && val.length > 0);
    if (msgEl) {
      msgEl.className  = 'field-msg' + (ok ? '' : ' error');
      msgEl.textContent = ok ? '' : msg;
    }
    return ok;
  }

  /**
   * Show an inline alert inside a container.
   * @param {string} id      - Element id of the alert placeholder
   * @param {string} type    - 'success' | 'danger' | 'warning' | 'info'
   * @param {string} icon    - FA solid class e.g. 'fa-circle-check'
   * @param {string} message - Plain text / HTML message
   */
  function showAlert(id, type, icon, message) {
    var el = document.getElementById(id);
    if (!el) return;
    el.innerHTML =
      '<i class="fa-solid ' + icon + ' alert-icon"></i>' +
      '<span>' + message + '</span>';
    el.className   = 'alert-auth alert-' + type;
    el.style.display = 'flex';
  }
  /* Expose for external use */
  window.showAlert = showAlert;

  /**
   * Hide an inline alert.
   * @param {string} id
   */
  function hideAlert(id) {
    var el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  }
  window.hideAlert = hideAlert;

  /* ─────────────────────────────────────
     LOGIN FORM
  ───────────────────────────────────── */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    var emailInput = document.getElementById('loginEmail');
    var pwdInput   = document.getElementById('loginPassword');

    /* Blur-time validation */
    emailInput.addEventListener('blur', function () { validateField(this, document.getElementById('emailMsg')); });
    pwdInput.addEventListener('blur',   function () { validateField(this, document.getElementById('pwdMsg')); });

    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert('loginAlert');

      var emailOk = validateField(emailInput, document.getElementById('emailMsg'));
      var pwdOk   = validateField(pwdInput,   document.getElementById('pwdMsg'));
      if (!emailOk || !pwdOk) return;

      var btn = document.getElementById('loginBtn');
      SC.Components.setLoading(btn, true);

      /* ── Replace with real API call ── */
      setTimeout(function () {
        SC.Components.setLoading(btn, false);
        showAlert('loginAlert', 'danger', 'fa-circle-xmark',
          'Invalid credentials. Please check your email and password.');
      }, 1800);
    });
  }

  /* ─────────────────────────────────────
     REGISTER FORM
  ───────────────────────────────────── */
  var regForm = document.getElementById('registerForm');
  if (regForm) {
    /* Wire live password-match checker */
    SC.Components.initPasswordMatch('password', 'confirmPassword', 'confirmPasswordMsg');

    regForm.addEventListener('submit', function (e) {
      e.preventDefault();
      hideAlert('regAlert');

      var allOk = true;

      /* Field validation */
      var fields = [
        { id: 'regName',  msgId: 'regNameMsg'  },
        { id: 'regEmail', msgId: 'regEmailMsg' },
        { id: 'password', msgId: 'passwordMsg' },
        { id: 'confirmPassword', msgId: 'confirmPasswordMsg' }
      ];
      fields.forEach(function (f) {
        var el  = document.getElementById(f.id);
        var msg = document.getElementById(f.msgId);
        if (el && !validateField(el, msg)) allOk = false;
      });

      /* Gender */
      var genderMsg = document.getElementById('genderMsg');
      if (!regForm.querySelector('.gender-option.selected')) {
        allOk = false;
        if (genderMsg) { genderMsg.className = 'field-msg error'; genderMsg.textContent = 'Please select a gender.'; }
      } else {
        if (genderMsg) { genderMsg.className = 'field-msg'; genderMsg.textContent = ''; }
      }

      /* Password match */
      var p1 = document.getElementById('password');
      var p2 = document.getElementById('confirmPassword');
      if (p1 && p2 && p1.value !== p2.value) {
        allOk = false;
        p2.classList.add('is-invalid');
        var cm = document.getElementById('confirmPasswordMsg');
        if (cm) { cm.className = 'field-msg error'; cm.textContent = 'Passwords do not match.'; }
      }

      /* Terms checkbox */
      var terms = document.getElementById('termsCheck');
      if (terms && !terms.checked) {
        allOk = false;
        showAlert('regAlert', 'danger', 'fa-circle-xmark', 'Please accept the Terms of Service to continue.');
      }

      if (!allOk) return;

      var btn = document.getElementById('registerBtn');
      SC.Components.setLoading(btn, true);

      /* ── Replace with real API call ── */
      setTimeout(function () {
        SC.Components.setLoading(btn, false);
        showAlert('regAlert', 'success', 'fa-circle-check',
          'Account created! Redirecting to login\u2026');
        setTimeout(function () { window.location.href = 'login.html'; }, 2200);
      }, 1800);
    });
  }

  /* ─────────────────────────────────────
     FORGOT PASSWORD FORM
  ───────────────────────────────────── */
  var forgotForm = document.getElementById('forgotForm');
  if (forgotForm) {
    forgotForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var el = document.getElementById('forgotEmail');
      var ok = validateField(el, document.getElementById('forgotEmailMsg'));
      if (!ok) return;

      var btn = document.getElementById('forgotBtn');
      SC.Components.setLoading(btn, true);

      /* ── Replace with real API call ── */
      setTimeout(function () {
        SC.Components.setLoading(btn, false);
        var wrap = document.getElementById('forgotFormWrap');
        var succ = document.getElementById('forgotSuccess');
        if (wrap) wrap.style.display = 'none';
        if (succ) succ.classList.add('visible');
      }, 1600);
    });

    /* Resend button — expose globally so inline onclick works too */
    window.showForgotForm = function () {
      var wrap = document.getElementById('forgotFormWrap');
      var succ = document.getElementById('forgotSuccess');
      if (wrap) wrap.style.display = '';
      if (succ) succ.classList.remove('visible');
    };
  }

  /* ─────────────────────────────────────
     RESET PASSWORD FORM
  ───────────────────────────────────── */
  var resetForm = document.getElementById('resetForm');
  if (resetForm) {
    /* Live confirm watcher */
    SC.Components.initPasswordMatch('newPassword', 'resetConfirm', 'resetConfirmMsg');

    resetForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var p1   = document.getElementById('newPassword');
      var p2   = document.getElementById('resetConfirm');
      var msg2 = document.getElementById('resetConfirmMsg');

      var ok1   = validateField(p1, document.getElementById('newPasswordMsg'));
      var match = p1.value === p2.value;

      if (!match) {
        p2.classList.add('is-invalid');
        p2.classList.remove('is-valid');
        if (msg2) { msg2.className = 'field-msg error'; msg2.textContent = 'Passwords do not match.'; }
      } else {
        p2.classList.remove('is-invalid');
        p2.classList.add('is-valid');
        if (msg2) { msg2.className = 'field-msg'; msg2.textContent = ''; }
      }

      if (!ok1 || !match) return;

      var btn = document.getElementById('resetBtn');
      SC.Components.setLoading(btn, true);

      /* ── Replace with real API call ── */
      setTimeout(function () {
        SC.Components.setLoading(btn, false);
        var wrap = document.getElementById('resetFormWrap');
        var succ = document.getElementById('resetSuccess');
        if (wrap) wrap.style.display = 'none';
        if (succ) succ.classList.add('visible');
      }, 1600);
    });
  }

});