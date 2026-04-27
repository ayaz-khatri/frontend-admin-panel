/* ══════════════════════════════════════════════════════════════
   CORE.JS — Global helpers & reusable UI primitives
   Load on every page (before components.js / auth.js / dashboard.js)
   No page-specific logic here.
══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────
   THEME — persists across pages
   Reads/writes localStorage key 'sc-theme'
   Apply early (inline script in <head>) to avoid flash:
     <script>(function(){document.documentElement.setAttribute('data-theme',localStorage.getItem('sc-theme')||'light');})()</script>
───────────────────────────────────── */
var SC = window.SC || {};

SC.Theme = (function () {
  var KEY = 'sc-theme';

  function get()     { return document.documentElement.getAttribute('data-theme') || 'light'; }
  function set(t)    { document.documentElement.setAttribute('data-theme', t); localStorage.setItem(KEY, t); }
  function toggle()  { set(get() === 'dark' ? 'light' : 'dark'); }
  function init()    { set(localStorage.getItem(KEY) || 'light'); }

  return { get: get, set: set, toggle: toggle, init: init };
})();

SC.Theme.init();

/* ─────────────────────────────────────
   TOAST NOTIFICATION SYSTEM
   Usage: SC.Toast.show('success', 'Title', 'Optional message', 4000)
   Types: 'success' | 'error' | 'warning' | 'info'
   The #toast-container div is auto-created if absent.
───────────────────────────────────── */
SC.Toast = (function () {
  var CONFIGS = {
    success: { icon: 'fa-circle-check',        color: '#10b981', bg: 'rgba(16,185,129,.12)' },
    error:   { icon: 'fa-circle-xmark',         color: '#ef4444', bg: 'rgba(239,68,68,.12)'  },
    warning: { icon: 'fa-triangle-exclamation', color: '#f59e0b', bg: 'rgba(245,158,11,.12)' },
    info:    { icon: 'fa-circle-info',          color: 'var(--primary)', bg: 'var(--primary-light)' }
  };

  function getContainer() {
    var c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      document.body.appendChild(c);
    }
    return c;
  }

  function dismiss(el) {
    if (!el || el._dismissed) return;
    el._dismissed = true;
    clearTimeout(el._timer);
    el.classList.add('leaving');
    setTimeout(function () { if (el.parentElement) el.parentElement.removeChild(el); }, 300);
  }

  function show(type, title, message, duration) {
    var dur = duration || 4000;
    var cfg = CONFIGS[type] || CONFIGS.info;
    var el  = document.createElement('div');
    el.className = 'toast-item';
    el.style.setProperty('--toast-color',   cfg.color);
    el.style.setProperty('--toast-icon-bg', cfg.bg);
    el.style.setProperty('--toast-dur',     dur + 'ms');

    el.innerHTML =
      '<div class="toast-icon"><i class="fa-solid ' + cfg.icon + '"></i></div>' +
      '<div class="toast-body">' +
        '<div class="toast-title">' + title + '</div>' +
        (message ? '<div class="toast-msg">' + message + '</div>' : '') +
      '</div>' +
      '<button class="toast-close" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>';

    el.querySelector('.toast-close').addEventListener('click', function () { dismiss(el); });
    getContainer().appendChild(el);
    el._timer = setTimeout(function () { dismiss(el); }, dur);
  }

  return { show: show, dismiss: dismiss };
})();

/* Backwards compat alias (dashboard.js called showToast directly) */
window.showToast = function (type, title, message, duration) {
  SC.Toast.show(type, title, message, duration);
};

/* ─────────────────────────────────────
   TOOLTIP ENGINE
   Usage: add data-tip="Text" [data-tip-pos="top|bottom|left|right"]
   on any element. No JS init needed — delegation handles everything.
   The tooltip node is injected automatically.
───────────────────────────────────── */
SC.Tooltip = (function () {
  var tip, showTimer, hideTimer;
  var DELAY  = 320;  /* ms before appearing */
  var OFFSET = 10;   /* gap between element and tooltip */

  function ensureNode() {
    if (tip) return;
    tip = document.getElementById('sc-tooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'sc-tooltip';
      document.body.appendChild(tip);
    }
    tip.style.display = 'none';
  }

  function place(el, pos) {
    var r  = el.getBoundingClientRect();
    var tw = tip.offsetWidth;
    var th = tip.offsetHeight;
    var vw = window.innerWidth;
    var vh = window.innerHeight;

    function coords(p) {
      switch (p) {
        case 'bottom': return { x: r.left + r.width  / 2 - tw / 2, y: r.bottom + OFFSET };
        case 'top':    return { x: r.left + r.width  / 2 - tw / 2, y: r.top - th - OFFSET };
        case 'right':  return { x: r.right + OFFSET,                y: r.top + r.height / 2 - th / 2 };
        case 'left':   return { x: r.left - tw - OFFSET,            y: r.top + r.height / 2 - th / 2 };
      }
    }

    /* Auto-flip if clipped */
    var pt = coords(pos);
    if (pos === 'bottom' && pt.y + th > vh) pos = 'top';
    if (pos === 'top'    && pt.y < 0)       pos = 'bottom';
    if (pos === 'right'  && pt.x + tw > vw) pos = 'left';
    if (pos === 'left'   && pt.x < 0)       pos = 'right';

    pt = coords(pos);

    /* Clamp to viewport */
    pt.x = Math.max(8, Math.min(pt.x, vw - tw - 8));
    pt.y = Math.max(8, Math.min(pt.y, vh - th - 8));

    tip.setAttribute('data-pos', pos);
    tip.style.left = pt.x + 'px';
    tip.style.top  = pt.y + 'px';
  }

  function show(el) {
    ensureNode();
    var text = el.getAttribute('data-tip');
    var pos  = el.getAttribute('data-tip-pos') || 'top';
    if (!text) return;

    /* For sidebar nav items: only show when sidebar is collapsed */
    if (el.classList.contains('nav-link-item') || el.classList.contains('sb-user')) {
      var sb = document.getElementById('sidebar');
      if (!sb || !sb.classList.contains('collapsed') || sb.classList.contains('mob-open')) return;
    }

    /* Suppress when a dropdown is open */
    if (document.querySelector('.tb-dd.open')) return;

    clearTimeout(hideTimer);
    clearTimeout(showTimer);

    showTimer = setTimeout(function () {
      tip.textContent = text;
      tip.style.display = 'block';
      requestAnimationFrame(function () {
        place(el, pos);
        requestAnimationFrame(function () { tip.classList.add('tip-visible'); });
      });
    }, DELAY);
  }

  function hide() {
    ensureNode();
    clearTimeout(showTimer);
    tip.classList.remove('tip-visible');
    hideTimer = setTimeout(function () { tip.style.display = 'none'; }, 160);
  }

  function init() {
    ensureNode();
    document.addEventListener('mouseover',  function (e) { var el = e.target.closest('[data-tip]'); if (el) show(el); });
    document.addEventListener('mouseout',   function (e) { var el = e.target.closest('[data-tip]'); if (el && !el.contains(e.relatedTarget)) hide(); });
    document.addEventListener('scroll',     hide, true);
    document.addEventListener('mousedown',  hide, true);
    document.addEventListener('click',      function (e) { if (e.target.closest('[data-tip]')) hide(); });
    window.addEventListener('resize',       hide);
  }

  return { init: init, show: show, hide: hide };
})();

/* ─────────────────────────────────────
   MODAL HELPERS
   Usage:
     SC.Modal.open('myModalId')
     SC.Modal.close('myModalId')
   The overlay must have class="modal-overlay"
   and contain a .modal-box child.
   Esc key and clicking the backdrop auto-close.
───────────────────────────────────── */
SC.Modal = (function () {
  function open(id) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function close(id) {
    var el = typeof id === 'string' ? document.getElementById(id) : id;
    if (!el) return;
    el.classList.remove('open');
    document.body.style.overflow = '';
  }
  function init() {
    /* Close on backdrop click */
    document.addEventListener('click', function (e) {
      if (e.target.classList.contains('modal-overlay')) close(e.target);
    });
    /* Close on Escape */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal-overlay.open').forEach(function (m) { close(m); });
      }
    });
  }
  return { open: open, close: close, init: init };
})();

/* ─────────────────────────────────────
   DROPDOWN TOGGLE
   Usage: SC.Dropdown.toggle('ddWrapperId')
   Wrappers must have class="tb-dd"
   Clicking outside closes all.
───────────────────────────────────── */
SC.Dropdown = (function () {
  function closeAll() {
    document.querySelectorAll('.tb-dd.open').forEach(function (d) { d.classList.remove('open'); });
  }
  function toggle(id) {
    var el = document.getElementById(id);
    if (!el) return;
    var wasOpen = el.classList.contains('open');
    closeAll();
    if (!wasOpen) el.classList.add('open');
  }
  function init() {
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.tb-dd')) closeAll();
    });
  }
  return { toggle: toggle, closeAll: closeAll, init: init };
})();

/* Backwards compat alias */
window.toggleDd = function (id) { SC.Dropdown.toggle(id); };

/* ─────────────────────────────────────
   THEME TOGGLE BUTTON (auth pages)
   Wires the #themeToggle button and updates
   its icon. Also works for the dashboard's
   dual-icon sun/moon button automatically.
───────────────────────────────────── */
SC.ThemeButton = (function () {
  function updateIcon(btn) {
    if (!btn) return;
    var isDark = SC.Theme.get() === 'dark';
    /* Auth-style single-icon button */
    if (!btn.querySelector('.icon-sun')) {
      btn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
    }
    /* Dashboard dual-icon button: CSS handles it via [data-theme] */
  }
  function init() {
    var btn = document.getElementById('themeToggle');
    if (!btn) return;
    updateIcon(btn);
    btn.addEventListener('click', function () {
      SC.Theme.toggle();
      updateIcon(btn);
    });
  }
  return { init: init, updateIcon: updateIcon };
})();

/* ─────────────────────────────────────
   DOM READY — wire all passive globals
───────────────────────────────────── */
document.addEventListener('DOMContentLoaded', function () {
  SC.Tooltip.init();
  SC.Modal.init();
  SC.Dropdown.init();
  SC.ThemeButton.init();
});