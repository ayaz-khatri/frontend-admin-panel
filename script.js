/* ═══════════════════════════════════════
   LEFT SIDEBAR
═══════════════════════════════════════ */
const sidebar    = document.getElementById('sidebar');
const sbToggle   = document.getElementById('sbToggle');
const mobOverlay = document.getElementById('mobOverlay');

function isMob() { return window.innerWidth <= 900; }

sbToggle.addEventListener('click', () => {
  if (isMob()) {
    sidebar.classList.toggle('mob-open');
    mobOverlay.classList.toggle('show');
  } else {
    sidebar.classList.toggle('collapsed');
  }
});

mobOverlay.addEventListener('click', () => {
  sidebar.classList.remove('mob-open');
  rightSb.classList.remove('rs-open');
  mobOverlay.classList.remove('show');
});

/* ═══════════════════════════════════════
   RIGHT SIDEBAR
═══════════════════════════════════════ */
const rightSb = document.getElementById('rightSb');
const rsClose = document.getElementById('rsClose');
const rsFab   = document.getElementById('rsFab');

function isTablet() { return window.innerWidth <= 1200; }

function openRightSb() {
  rightSb.classList.remove('closed');
  if (isTablet()) { rightSb.classList.add('rs-open'); mobOverlay.classList.add('show'); }
}
function closeRightSb() {
  if (isTablet()) { rightSb.classList.remove('rs-open'); mobOverlay.classList.remove('show'); }
  else { rightSb.classList.add('closed'); }
}
function toggleRightSb() {
  (rightSb.classList.contains('closed') || (!isTablet() && rightSb.classList.contains('closed')))
    ? openRightSb() : closeRightSb();
}

rsClose.addEventListener('click', closeRightSb);
rsFab.addEventListener('click', openRightSb);

/* ═══════════════════════════════════════
   TOPBAR DROPDOWNS
═══════════════════════════════════════ */
function toggleDd(id) {
  const el = document.getElementById(id);
  const wasOpen = el.classList.contains('open');
  document.querySelectorAll('.tb-dd').forEach(d => d.classList.remove('open'));
  if (!wasOpen) el.classList.add('open');
}
document.addEventListener('click', e => {
  if (!e.target.closest('.tb-dd')) {
    document.querySelectorAll('.tb-dd').forEach(d => d.classList.remove('open'));
  }
});

/* ═══════════════════════════════════════
   CHART — init after DOM + scripts load
═══════════════════════════════════════ */
window.addEventListener('load', function() {
  var canvas = document.getElementById('salesChart');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');

  var grad = ctx.createLinearGradient(0, 0, 0, 180);
  grad.addColorStop(0, 'rgba(37,99,235,0.22)');
  grad.addColorStop(1, 'rgba(37,99,235,0.01)');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets: [{
        data: [4200,5800,4600,7200,6100,8900,7400,9200,7800,10500,9800,12540],
        borderColor: '#2563eb',
        borderWidth: 2.5,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#2563eb',
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
          backgroundColor: '#0f172a', titleColor: '#94a3b8', bodyColor: '#fff',
          padding: 10, cornerRadius: 8,
          callbacks: { label: function(c){ return ' $' + c.parsed.y.toLocaleString(); } }
        }
      },
      scales: {
        x: { grid:{display:false}, border:{display:false}, ticks:{color:'#94a3b8',font:{size:11}} },
        y: { grid:{color:'#f1f5f9'}, border:{display:false}, ticks:{color:'#94a3b8',font:{size:11}, callback:function(v){ return '$'+(v/1000).toFixed(0)+'k'; }} }
      }
    }
  });
});

/* ═══════════════════════════════════════
   DATA TABLE
═══════════════════════════════════════ */
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

var PER_PAGE = 6, curPage = 1, curFilter = 'all', srch = '';

function getFiltered() {
  return USERS.filter(function(u) {
    var ms = curFilter === 'all' || u.status === curFilter;
    var mq = !srch || u.name.toLowerCase().indexOf(srch) > -1 || u.email.toLowerCase().indexOf(srch) > -1 || u.store.toLowerCase().indexOf(srch) > -1;
    return ms && mq;
  });
}

function renderTable() {
  var list = getFiltered();
  var total = list.length;
  var pages = Math.max(1, Math.ceil(total / PER_PAGE));
  if (curPage > pages) curPage = pages;
  var start = (curPage - 1) * PER_PAGE;
  var slice = list.slice(start, start + PER_PAGE);

  var html = '';
  if (slice.length === 0) {
    html = '<tr><td colspan="8" style="text-align:center;padding:28px;color:var(--text-muted)">No users found</td></tr>';
  } else {
    for (var i = 0; i < slice.length; i++) {
      var u = slice[i];
      var rbc = u.role === 'Admin' ? 'rb-admin' : u.role === 'Editor' ? 'rb-editor' : '';
      html += '<tr>' +
        '<td><input type="checkbox"/></td>' +
        '<td><div class="uc"><div class="uav ' + u.c + '">' + u.av + '</div><div><div class="uname2">' + u.name + '</div><div class="uemail">' + u.email + '</div></div></div></td>' +
        '<td><span class="rb ' + rbc + '">' + u.role + '</span></td>' +
        '<td><span class="bs bs-' + u.status.toLowerCase() + '">' + u.status + '</span></td>' +
        '<td>' + u.store + '</td>' +
        '<td style="font-weight:600">' + u.rev + '</td>' +
        '<td style="color:var(--text-muted)">' + u.joined + '</td>' +
        '<td><div class="ac-cell"><div class="ac-btn" title="View"><i class="fa-regular fa-eye"></i></div><div class="ac-btn" title="Edit"><i class="fa-regular fa-pen-to-square"></i></div><div class="ac-btn del" title="Delete"><i class="fa-regular fa-trash-can"></i></div></div></td>' +
        '</tr>';
    }
  }
  document.getElementById('tblBody').innerHTML = html;

  var end = Math.min(start + PER_PAGE, total);
  document.getElementById('pagInfo').textContent = total
    ? 'Showing ' + (start+1) + '\u2013' + end + ' of ' + total + ' users'
    : 'No results';

  var pb = document.getElementById('pagBtns');
  pb.innerHTML = '';

  function addPB(label, page, dis) {
    var b = document.createElement('div');
    b.className = 'pg-btn' + (page === curPage ? ' active' : '') + (dis ? ' disabled' : '');
    b.innerHTML = label;
    if (!dis) { (function(p){ b.onclick = function(){ curPage = p; renderTable(); }; })(page); }
    pb.appendChild(b);
  }
  addPB('<i class="fa-solid fa-chevron-left"></i>', curPage-1, curPage===1);
  for (var p = 1; p <= pages; p++) addPB(p, p, false);
  addPB('<i class="fa-solid fa-chevron-right"></i>', curPage+1, curPage===pages);
}

function filterTable() {
  srch = document.getElementById('tblSearch').value.toLowerCase().trim();
  curPage = 1; renderTable();
}

function setFilter(btn, val) {
  document.querySelectorAll('.f-btn').forEach(function(b){ b.classList.remove('active'); });
  btn.classList.add('active');
  curFilter = val; curPage = 1; renderTable();
}

function toggleAll(cb) {
  document.querySelectorAll('#tblBody input[type=checkbox]').forEach(function(c){ c.checked = cb.checked; });
}

// Run immediately — DOM is ready at this point (scripts are at bottom of body)
renderTable();