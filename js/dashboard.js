/* ══════════════════════════════════════════════════════════════
   DASHBOARD.JS — Dashboard-specific interactions
   Requires: core.js (SC namespace)
══════════════════════════════════════════════════════════════ */

/* ─────────────────────────────────────
   LEFT SIDEBAR
───────────────────────────────────── */
var sidebar    = document.getElementById('sidebar');
var sbToggle   = document.getElementById('sbToggle');
var mobOverlay = document.getElementById('mobOverlay');

function isMob() { return window.innerWidth <= 900; }

if (sbToggle) {
  sbToggle.addEventListener('click', function () {
    if (isMob()) {
      sidebar.classList.toggle('mob-open');
      mobOverlay.classList.toggle('show');
    } else {
      sidebar.classList.toggle('collapsed');
    }
  });
}

if (mobOverlay) {
  mobOverlay.addEventListener('click', function () {
    if (sidebar) sidebar.classList.remove('mob-open');
    if (rightSb) rightSb.classList.remove('rs-open');
    mobOverlay.classList.remove('show');
  });
}

/* ─────────────────────────────────────
   RIGHT SIDEBAR
───────────────────────────────────── */
var rightSb = document.getElementById('rightSb');
var rsClose = document.getElementById('rsClose');
var rsFab   = document.getElementById('rsFab');

function isTablet() { return window.innerWidth <= 1200; }

function openRightSb() {
  if (!rightSb) return;
  rightSb.classList.remove('closed');
  if (isTablet()) {
    rightSb.classList.add('rs-open');
    if (mobOverlay) mobOverlay.classList.add('show');
  }
}
function closeRightSb() {
  if (!rightSb) return;
  if (isTablet()) {
    rightSb.classList.remove('rs-open');
    if (mobOverlay) mobOverlay.classList.remove('show');
  } else {
    rightSb.classList.add('closed');
  }
}
function toggleRightSb() {
  if (!rightSb) return;
  (rightSb.classList.contains('closed') || (isTablet() && !rightSb.classList.contains('rs-open')))
    ? openRightSb() : closeRightSb();
}

if (rsClose) rsClose.addEventListener('click', closeRightSb);
if (rsFab)   rsFab.addEventListener('click', openRightSb);

/* Expose for inline onclick="toggleRightSb()" in HTML */
window.toggleRightSb = toggleRightSb;

/* ─────────────────────────────────────
   SALES CHART (Chart.js)
   Initialises after all resources load.
───────────────────────────────────── */
window.addEventListener('load', function () {
  var canvas = document.getElementById('salesChart');
  if (!canvas || typeof Chart === 'undefined') return;

  var ctx     = canvas.getContext('2d');
  var primary = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#2563eb';

  var grad = ctx.createLinearGradient(0, 0, 0, 180);
  grad.addColorStop(0, 'hsla(220,83%,50%,0.22)');
  grad.addColorStop(1, 'hsla(220,83%,50%,0.01)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        data: [4200,5800,4600,7200,6100,8900,7400,9200,7800,10500,9800,12540],
        borderColor: primary,
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: primary,
        tension: 0.42,
        fill: true,
        backgroundColor: grad
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          mode: 'index', intersect: false,
          backgroundColor: '#0f172a',
          titleColor: '#94a3b8',
          bodyColor: '#fff',
          padding: 10, cornerRadius: 8,
          callbacks: { label: function (c) { return ' $' + c.parsed.y.toLocaleString(); } }
        }
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 } } },
        y: { grid: { color: '#f1f5f9' }, border: { display: false }, ticks: { color: '#94a3b8', font: { size: 11 }, callback: function (v) { return '$' + (v / 1000).toFixed(0) + 'k'; } } }
      }
    }
  });
});

/* ─────────────────────────────────────
   DATA TABLE
───────────────────────────────────── */
var USERS = [
  { name:'Olivia Chen',   email:'olivia@shopcast.io',  role:'Admin',  status:'Active',   store:'Store #1', rev:'$4,210', joined:'Jan 12, 2024', av:'OC', c:'ca' },
  { name:'Marcus Bell',   email:'marcus@shopcast.io',  role:'Editor', status:'Active',   store:'Store #3', rev:'$3,580', joined:'Feb 05, 2024', av:'MB', c:'cb' },
  { name:'Sara Mendez',   email:'sara@shopcast.io',    role:'Viewer', status:'Active',   store:'Store #5', rev:'$1,920', joined:'Mar 18, 2024', av:'SM', c:'cc' },
  { name:'James Kim',     email:'james@shopcast.io',   role:'Editor', status:'Pending',  store:'Store #2', rev:'$2,750', joined:'Apr 02, 2024', av:'JK', c:'cd' },
  { name:'Priya Nair',    email:'priya@shopcast.io',   role:'Viewer', status:'Inactive', store:'Store #7', rev:'$0',     joined:'Apr 14, 2024', av:'PN', c:'ce' },
  { name:'Tom Fischer',   email:'tom@shopcast.io',     role:'Admin',  status:'Active',   store:'Store #4', rev:'$5,980', joined:'May 01, 2024', av:'TF', c:'cf' },
  { name:'Elena Sousa',   email:'elena@shopcast.io',   role:'Editor', status:'Active',   store:'Store #6', rev:'$3,100', joined:'May 20, 2024', av:'ES', c:'ca' },
  { name:'David Okafor',  email:'david@shopcast.io',   role:'Viewer', status:'Pending',  store:'Store #8', rev:'$890',   joined:'Jun 03, 2024', av:'DO', c:'cb' },
  { name:'Mei Lin',       email:'mei@shopcast.io',     role:'Editor', status:'Active',   store:'Store #1', rev:'$2,340', joined:'Jun 18, 2024', av:'ML', c:'cc' },
  { name:'Carlos Reyes',  email:'carlos@shopcast.io',  role:'Viewer', status:'Active',   store:'Store #3', rev:'$1,670', joined:'Jul 01, 2024', av:'CR', c:'cd' },
  { name:'Aisha Patel',   email:'aisha@shopcast.io',   role:'Admin',  status:'Active',   store:'Store #2', rev:'$6,450', joined:'Jul 14, 2024', av:'AP', c:'ce' },
  { name:"Ryan O'Brien",  email:'ryan@shopcast.io',    role:'Viewer', status:'Inactive', store:'Store #5', rev:'$0',     joined:'Aug 05, 2024', av:'RO', c:'cf' }
];

var PER_PAGE   = 6;
var curPage    = 1;
var curFilter  = 'all';
var srch       = '';

function getFiltered() {
  return USERS.filter(function (u) {
    var ms = curFilter === 'all' || u.status === curFilter;
    var mq = !srch
      || u.name.toLowerCase().indexOf(srch)  > -1
      || u.email.toLowerCase().indexOf(srch) > -1
      || u.store.toLowerCase().indexOf(srch) > -1;
    return ms && mq;
  });
}

function renderTable() {
  var body = document.getElementById('tblBody');
  if (!body) return;

  var list  = getFiltered();
  var total = list.length;
  var pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (curPage > pages) curPage = pages;
  var start = (curPage - 1) * PER_PAGE;
  var slice = list.slice(start, start + PER_PAGE);

  var html = '';
  if (slice.length === 0) {
    html = '<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--text-muted)">No users found</td></tr>';
  } else {
    slice.forEach(function (u) {
      var rbc = u.role === 'Admin' ? 'rb-admin' : u.role === 'Editor' ? 'rb-editor' : '';
      html +=
        '<tr>' +
        '<td><input type="checkbox"/></td>' +
        '<td><div class="uc"><div class="uav ' + u.c + '">' + u.av + '</div>' +
             '<div><div class="uname2">' + u.name + '</div><div class="uemail">' + u.email + '</div></div></div></td>' +
        '<td><span class="rb ' + rbc + '">' + u.role + '</span></td>' +
        '<td><span class="bs bs-' + u.status.toLowerCase() + '">' + u.status + '</span></td>' +
        '<td>' + u.store + '</td>' +
        '<td style="font-weight:600">' + u.rev + '</td>' +
        '<td style="color:var(--text-muted)">' + u.joined + '</td>' +
        '<td><div class="ac-cell">' +
          '<div class="ac-btn" data-tip="View Details" data-tip-pos="top" onclick=\'openUserModal(' + JSON.stringify(u) + ')\'><i class="fa-regular fa-eye"></i></div>' +
          '<div class="ac-btn" data-tip="Edit User" data-tip-pos="top" onclick="SC.Toast.show(\'success\',\'Edit Mode\',\'User editor opened.\')"><i class="fa-regular fa-pen-to-square"></i></div>' +
          '<div class="ac-btn del" data-tip="Delete User" data-tip-pos="top" onclick="SC.Toast.show(\'error\',\'User Deleted\',\'The user has been removed from the system.\')"><i class="fa-regular fa-trash-can"></i></div>' +
        '</div></td>' +
        '</tr>';
    });
  }
  body.innerHTML = html;

  /* Pagination info */
  var pagInfo = document.getElementById('pagInfo');
  if (pagInfo) {
    var end = Math.min(start + PER_PAGE, total);
    pagInfo.textContent = total
      ? 'Showing ' + (start + 1) + '\u2013' + end + ' of ' + total + ' users'
      : 'No results';
  }

  /* Pagination buttons */
  var pb = document.getElementById('pagBtns');
  if (!pb) return;
  pb.innerHTML = '';

  function addBtn(label, page, disabled) {
    var b = document.createElement('div');
    b.className = 'pg-btn' + (page === curPage ? ' active' : '') + (disabled ? ' disabled' : '');
    b.innerHTML = label;
    if (!disabled) {
      (function (p) { b.onclick = function () { curPage = p; renderTable(); }; })(page);
    }
    pb.appendChild(b);
  }

  addBtn('<i class="fa-solid fa-chevron-left"></i>', curPage - 1, curPage === 1);
  for (var p = 1; p <= pages; p++) addBtn(p, p, false);
  addBtn('<i class="fa-solid fa-chevron-right"></i>', curPage + 1, curPage === pages);
}

window.filterTable = function () {
  var el = document.getElementById('tblSearch');
  srch = el ? el.value.toLowerCase().trim() : '';
  curPage = 1;
  renderTable();
};

window.setFilter = function (btn, val) {
  document.querySelectorAll('.f-btn').forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');
  curFilter = val;
  curPage   = 1;
  renderTable();
};

window.toggleAll = function (cb) {
  document.querySelectorAll('#tblBody input[type=checkbox]').forEach(function (c) { c.checked = cb.checked; });
};

/* Run once on load */
renderTable();

/* ─────────────────────────────────────
   USER DETAIL MODAL
───────────────────────────────────── */
window.openUserModal = function (user) {
  var fields = {
    modalAv:     user.av,
    modalName:   user.name,
    modalEmail:  user.email,
    modalRole:   user.role,
    modalStatus: user.status,
    modalStore:  user.store,
    modalRev:    user.rev,
    modalJoined: user.joined,
    modalTagRole: user.role
  };
  Object.keys(fields).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = fields[id];
  });

  var colors = { ca:'#667eea', cb:'#0ea5e9', cc:'#10b981', cd:'#f59e0b', ce:'#8b5cf6', cf:'#ef4444' };
  var av = document.getElementById('modalAv');
  if (av) av.style.background = 'linear-gradient(135deg,' + (colors[user.c] || '#667eea') + ',#764ba2)';

  SC.Modal.open('userModal');
};

window.closeModal        = function () { SC.Modal.close('userModal'); };
window.closeModalOutside = function (e) { if (e.target.id === 'userModal') SC.Modal.close('userModal'); };