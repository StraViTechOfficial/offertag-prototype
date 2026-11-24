/* admin.js — OfferTag admin prototype (S16 batch A, D-098): shell, Overview, Incoming deals, All deals.
   Standalone: the public site.js is not loaded on admin pages. Data sheet: design-system/ia/data-sheets/admin-batch-a.md */
(function () {
  // D-153: a blank End says so, instead of the start/end order message
  function endMsg(f) { var e = f.end.closest('.fld') && f.end.closest('.fld').querySelector('.err'); if (e) e.textContent = !f.end.value ? 'Add an end date.' : !f.start.value ? 'Add a start date first.' : 'End must be on or after the start.'; }

  var html = document.documentElement, $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function icons() { if (window.lucide && lucide.createIcons) lucide.createIcons(); }
  var store = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  var params = new URLSearchParams(location.search);
  // D-105: pages live at their real addresses; edit / clone / blog-post / tab routes carry their key in the path
  (function () {
    var p = location.pathname, m;
    if ((m = p.match(/^\/admin\/deal\/(\d+)\/(edit|clone)\/?$/))) params.set(m[2] === 'edit' ? 'id' : 'clone', m[1]);
    if ((m = p.match(/^\/admin\/blog\/([^\/]+)\/edit\/?$/))) params.set('post', decodeURIComponent(m[1]));
    if (window.ADM_TAB && !params.get('tab')) params.set('tab', window.ADM_TAB);
  })();
  var ROUTES = {
    edit: function (id) { return '/admin/deal/' + id + '/edit'; }, clone: function (id) { return '/admin/deal/' + id + '/clone'; },
    post: '/admin/deal/create', blogEdit: function (n) { return '/admin/blog/' + encodeURIComponent(n) + '/edit'; }, blogNew: '/admin/blog/create',
    alerts: function (id) { return '/admin/admin-notifications?deal=' + id; }
  };
  var INR = new Intl.NumberFormat('en-IN');
  function rs(v) { return '₹' + INR.format(v); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- role preview (?role=sub, D-057) ---------- */
  var SUB = params.get('role') === 'sub';
  if (SUB) {
    html.classList.add('role-sub');
    $$('[data-role-label]').forEach(function (el) { el.textContent = 'Sub-admin'; });
    $$('a[href^="admin"]').forEach(function (a) { var h = a.getAttribute('href'); a.setAttribute('href', h + (h.indexOf('?') > -1 ? '&' : '?') + 'role=sub'); });
    $$('form.adm-search').forEach(function (f) { var i = document.createElement('input'); i.type = 'hidden'; i.name = 'role'; i.value = 'sub'; f.appendChild(i); });
  }

  function withRole(h) { return SUB ? h.replace(/(#|$)/, (h.indexOf('?') > -1 ? '&' : '?') + 'role=sub$1') : h; }

  /* ---------- sidebar: collapse (desktop) and drawer (phone) ---------- */
  if (store.get('adm-min') === '1') html.classList.add('side-min');
  $$('[data-side-collapse]').forEach(function (b) { b.addEventListener('click', function () { var on = html.classList.toggle('side-min'); store.set('adm-min', on ? '1' : '0'); b.setAttribute('aria-label', on ? 'Expand menu' : 'Collapse menu'); }); });
  var overlay = $('.adm-overlay'), lastFocus = null;
  function openSide() { lastFocus = document.activeElement; html.classList.add('side-open'); overlay.hidden = false; var c = $('.adm-close'); if (c) c.focus(); }
  function closeSide() { if (!html.classList.contains('side-open')) return; html.classList.remove('side-open'); overlay.hidden = true; if (lastFocus) lastFocus.focus(); }
  $$('[data-side-open]').forEach(function (b) { b.addEventListener('click', openSide); });
  $$('[data-side-close]').forEach(function (b) { b.addEventListener('click', closeSide); });
  var sbtn = $('[data-search-toggle]');
  if (sbtn) sbtn.addEventListener('click', function () { html.classList.add('search-open'); $('[data-global-search]').focus(); });
  var gs = $('[data-global-search]');
  if (gs) gs.addEventListener('blur', function () { setTimeout(function () { html.classList.remove('search-open'); }, 150); });

  /* ---------- dropdown menus ---------- */
  var openDD = null;
  function closeDD() { if (!openDD) return; var m = openDD; openDD = null; m.menu.dataset.state = 'closed'; m.trigger.setAttribute('aria-expanded', 'false'); setTimeout(function () { if (openDD !== m) m.menu.hidden = true; }, 120); }
  $$('.dropdown').forEach(function (dd) {
    var t = $('[data-menu-trigger]', dd), m = $('.menu', dd); if (!t || !m) return;
    t.addEventListener('click', function (e) { e.stopPropagation(); if (openDD && openDD.menu === m) { closeDD(); return; } closeDD(); closeRowMenu(); m.hidden = false; requestAnimationFrame(function () { m.dataset.state = 'open'; }); t.setAttribute('aria-expanded', 'true'); openDD = { trigger: t, menu: m }; var f = $('[role^="menuitem"]', m); if (f && e.detail === 0) f.focus(); });
    m.addEventListener('click', function (e) { if (e.target.closest('[role^="menuitem"]')) closeDD(); });
  });
  document.addEventListener('click', function (e) { if (openDD && !openDD.menu.contains(e.target)) closeDD(); });

  /* ---------- toast with optional action (Sonner) ---------- */
  function toast(msg, opt) {
    opt = opt || {}; var host = $('#toaster');
    var t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status');
    t.innerHTML = (opt.icon === false ? '' : '<i data-lucide="' + (opt.icon || 'check') + '"></i>') + '<span>' + esc(msg) + '</span>';
    if (opt.action) { var a = document.createElement(opt.href ? 'a' : 'button'); a.className = 'toast-act'; a.textContent = opt.action; if (opt.href) a.href = opt.href; else a.type = 'button'; a.addEventListener('click', function () { if (opt.onAction) opt.onAction(); kill(); }); t.appendChild(a); t.style.pointerEvents = 'auto'; }
    host.appendChild(t); icons();
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('is-in'); }); });
    var timer = setTimeout(kill, opt.ms || (opt.action ? 10000 : 2600));
    function kill() { clearTimeout(timer); t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 200); }
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) { var ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } ta.remove(); });
  }

  /* ---------- sheets: drawer + confirm dialog ---------- */
  var sheetOverlay = $('[data-overlay]'), openSheetEl = null, sheetFocus = null;
  function openSheet(el) {
    sheetFocus = document.activeElement; openSheetEl = el; el.hidden = false; sheetOverlay.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.dataset.state = 'open'; sheetOverlay.dataset.state = 'open'; }); });
    setTimeout(function () { var f = $('[data-confirm-go]', el) || $('input, select, button:not(.sheet-close)', el); if (f) f.focus(); }, 60);
  }
  function closeSheet() {
    if (!openSheetEl) return; var el = openSheetEl; openSheetEl = null; el.dataset.state = 'closed'; sheetOverlay.dataset.state = 'closed';
    setTimeout(function () { el.hidden = true; if (!openSheetEl) sheetOverlay.hidden = true; if (sheetFocus) sheetFocus.focus(); }, 250);
  }
  if (sheetOverlay) sheetOverlay.addEventListener('click', closeSheet);
  $$('[data-close]').forEach(function (b) { b.addEventListener('click', closeSheet); });
  var confirmCb = null;
  function confirmBox(title, desc, go, cb, danger) {
    var d = $('#confirm'); $('#cf-title').textContent = title; $('#cf-desc').textContent = desc;
    var b = $('[data-confirm-go]', d); b.textContent = go; b.classList.toggle('destructive', !!danger); confirmCb = cb; openSheet(d);
  }
  var cgo = $('[data-confirm-go]'); if (cgo) cgo.addEventListener('click', function () { var cb = confirmCb; confirmCb = null; closeSheet(); if (cb) cb(); });

  /* ---------- counts (sidebar, tabs, buttons) ---------- */
  function setCount(key, n) { $$('[data-count="' + key + '"]').forEach(function (el) { el.textContent = n; if (el.classList.contains('adm-count')) { if (n) el.removeAttribute('data-zero'); else el.setAttribute('data-zero', ''); } }); }

  /* ---------- keyboard: / search, Esc closes ---------- */
  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase(), typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable;
    if (e.key === '/' && !typing) { var s = $('[data-f="q"]') || $('[data-global-search]'); if (s) { e.preventDefault(); if (s.matches('[data-global-search]') && getComputedStyle(s.closest('.adm-search')).display === 'none') html.classList.add('search-open'); s.focus(); } }
    if (e.key === 'Escape' && html.classList.contains('dc-open')) return;
    if (e.key === 'Escape') { if (openDD) { var t = openDD.trigger; closeDD(); t.focus(); } else if (rowMenu && !rowMenu.hidden) closeRowMenu(true); else if (rejectPop && !rejectPop.hidden) closeReject(); else if (openSheetEl) closeSheet(); else closeSide(); }
  });

  /* ---------- placeholder page ---------- */
  var st = $('[data-soon-title]'); if (st && params.get('s')) { st.textContent = params.get('s'); document.title = params.get('s') + ' · OfferTag Admin'; }

  /* =================== Incoming deals =================== */
  var rejectPop = $('#reject-pop'), rejectRow = null;
  function closeReject() { if (!rejectPop) return; rejectPop.dataset.state = 'closed'; setTimeout(function () { rejectPop.hidden = true; }, 120); var b = rejectRow && $('[data-reject]', rejectRow); rejectRow = null; if (b) b.focus(); }
  if ($('[data-panel="pending"]')) (function () {
    var pend = $('[data-panel="pending"]'), appr = $('[data-panel="approved"]'), rej = $('[data-panel="rejected"]'), bar = $('[data-inc-bar]');
    var counts = { approved: 0, rejected: 0 };
    function pendingRows() { return $$('[data-inc]', pend); }
    function refresh() {
      var rows = pendingRows(), sel = rows.filter(function (r) { return $('[data-inc-check]', r).checked; });
      setCount('incoming', rows.length); setCount('approved', counts.approved); setCount('rejected', counts.rejected);
      $$('[data-approve-all]').forEach(function (b) { b.disabled = !rows.length; });
      var all = $('[data-inc-all]'); all.checked = rows.length > 0 && sel.length === rows.length; all.indeterminate = sel.length > 0 && sel.length < rows.length;
      $('[data-inc-sel]').textContent = sel.length ? sel.length + ' selected' : 'Select all';
      $('[data-inc-bulk]').hidden = !sel.length;
      rows.forEach(function (r) { r.classList.toggle('is-sel', $('[data-inc-check]', r).checked); });
      if (!rows.length && !$('.empty', pend)) pend.insertAdjacentHTML('beforeend', '<p class="empty">All caught up. New Telegram and quick-post deals land here.</p>');
      if (rows.length) { var e = $('.empty', pend); if (e) e.remove(); }
      [appr, rej].forEach(function (p) { var e = $('.empty', p); if (e) e.hidden = !!$('[data-inc]', p); });
    }
    function moveRows(rows, target, note) {
      var undo = rows.map(function (r) { return { r: r, next: r.nextElementSibling }; });
      rows.forEach(function (r) { r.classList.add('is-out'); });
      setTimeout(function () {
        rows.forEach(function (r) { $('[data-inc-check]', r).checked = false; r.classList.remove('is-out', 'is-sel'); r.setAttribute('data-done', ''); var n = $('.inc-done-note', r); if (!n) { n = document.createElement('span'); n.className = 'inc-done-note'; $('.inc-top', r).appendChild(n); } n.textContent = note; target.insertBefore(r, target.firstChild); });
        counts[target === appr ? 'approved' : 'rejected'] += rows.length; refresh();
      }, 200);
      return function () {
        undo.forEach(function (u) { var r = u.r; r.removeAttribute('data-done'); var n = $('.inc-done-note', r); if (n) n.remove(); if (u.next && u.next.parentNode === pend) pend.insertBefore(r, u.next); else pend.insertBefore(r, $('.empty', pend) || null); });
        counts[target === appr ? 'approved' : 'rejected'] -= rows.length; refresh();
      };
    }
    function approve(rows) {
      var ok = rows.filter(function (r) { return !r.dataset.missing; }), held = rows.length - ok.length;
      if (!ok.length) { toast('Add a category before this deal can go live.', { icon: 'triangle-alert', action: 'Edit', href: withRole(ROUTES.edit(rows[0].dataset.id)) }); return; }
      var push = ok.filter(function (r) { return +r.dataset.pct >= 90; }).length;
      var IG = window.ADM_PG && ADM_PG.incoming, snap = IG && IG.snap(); if (IG) IG.approve(ok.map(function (r) { return r.dataset.id; }));
      var undo0 = moveRows(ok, appr, 'Live now'), undo = function () { if (IG) IG.back(null, snap); undo0(); };
      var msg = (ok.length === 1 ? 'Deal approved, live now' : ok.length + ' deals approved, live now') + (push ? ' · push alert sent' : '') + (held ? ' · ' + held + ' needs a category' : '');
      toast(msg, { action: 'Undo', onAction: undo });
    }
    function reject(rows, reason) {
      var IG = window.ADM_PG && ADM_PG.incoming, snap = IG && IG.snap(); if (IG) IG.reject(rows.map(function (r) { return r.dataset.id; }), reason);
      var undo0 = moveRows(rows, rej, reason ? 'Rejected: ' + reason : 'Rejected'), undo = function () { if (IG) IG.back(null, snap); undo0(); };
      toast(rows.length === 1 ? 'Deal rejected' : rows.length + ' deals rejected', { action: 'Undo', onAction: undo });
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-approve]'); if (b) { approve([b.closest('[data-inc]')]); return; }
      b = e.target.closest('[data-reject]');
      if (b) {
        e.stopPropagation(); rejectRow = b.closest('[data-inc]'); rejectRow._many = null; var r = b.getBoundingClientRect();
        rejectPop.style.position = 'fixed'; rejectPop.style.top = Math.min(r.bottom + 6, innerHeight - 160) + 'px'; rejectPop.style.left = Math.max(12, Math.min(r.right - 300, innerWidth - 312)) + 'px';
        $('[data-reject-reason]').value = ''; rejectPop.hidden = false; requestAnimationFrame(function () { rejectPop.dataset.state = 'open'; }); $('[data-reject-reason]').focus(); return;
      }
      if (rejectPop && !rejectPop.hidden && !rejectPop.contains(e.target)) closeReject();
    });
    $('[data-reject-cancel]').addEventListener('click', closeReject);
    function doReject() { var rows = rejectRow && rejectRow._many ? rejectRow._many : [rejectRow]; var reason = $('[data-reject-reason]').value.trim(); rejectPop.dataset.state = 'closed'; rejectPop.hidden = true; rejectRow = null; reject(rows, reason); }
    $('[data-reject-go]').addEventListener('click', doReject);
    $('[data-reject-reason]').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); doReject(); } });
    pend.addEventListener('change', function (e) { if (e.target.matches('[data-inc-check]')) refresh(); });
    $('[data-inc-all]').addEventListener('change', function (e) { pendingRows().forEach(function (r) { $('[data-inc-check]', r).checked = e.target.checked; }); refresh(); });
    function selected() { return pendingRows().filter(function (r) { return $('[data-inc-check]', r).checked; }); }
    $('[data-bulk-approve]').addEventListener('click', function () { approve(selected()); });
    $('[data-bulk-reject]').addEventListener('click', function (e) {
      e.stopPropagation(); var rows = selected(); if (!rows.length) return; rejectRow = rows[0]; rejectRow._many = rows; var r = e.currentTarget.getBoundingClientRect();
      rejectPop.style.position = 'fixed'; rejectPop.style.top = (r.bottom + 6) + 'px'; rejectPop.style.left = Math.max(12, Math.min(r.right - 300, innerWidth - 312)) + 'px';
      $('[data-reject-reason]').value = ''; rejectPop.hidden = false; requestAnimationFrame(function () { rejectPop.dataset.state = 'open'; }); $('[data-reject-reason]').focus();
    });
    $$('[data-approve-all]').forEach(function (b) { b.addEventListener('click', function () { approve(pendingRows()); }); });
    $$('[data-tab]').forEach(function (t) {
      t.addEventListener('click', function () {
        $$('[data-tab]').forEach(function (x) { var on = x === t; x.dataset.state = on ? 'active' : ''; x.setAttribute('aria-selected', on); });
        $$('[data-panel]').forEach(function (p) { p.hidden = p.dataset.panel !== t.dataset.tab; });
        bar.hidden = t.dataset.tab !== 'pending';
      });
    });
    refresh();
  })();

  /* =================== All deals =================== */
  var rowMenu = $('#row-menu'), menuId = null, menuBtn = null;
  function closeRowMenu(refocus) { if (!rowMenu || rowMenu.hidden) return; rowMenu.dataset.state = 'closed'; setTimeout(function () { rowMenu.hidden = true; }, 120); if (refocus && menuBtn) menuBtn.focus(); menuBtn = null; }
  if (window.ADM_DEALS && $('[data-rows]')) (function () {
    var model = window.ADM_DEALS.map(function (d) { return Object.assign({}, d); });
    var S = { q: params.get('q') || '', f: {}, sort: 'age', dir: 1, page: 1, per: 25, sel: new Set() };
    if (params.get('posted') === 'today') S.f.posted = 'today';
    var LABEL = { status: { live: 'Live', pending: 'Pending', rejected: 'Rejected', withdrawn: 'Withdrawn' }, type: { Top: 'Top deal', Loot: 'Loot', New: 'New', Pantry: 'Pantry' }, pin: { yes: 'Pinned', no: 'Not pinned' }, display: { '1': 'Web + App', '2': 'Web only', '3': 'App only' }, posted: { today: 'Posted today', week: 'Last 7 days' } };
    var ST_ORDER = { live: 1, pending: 2, withdrawn: 3, rejected: 4 };
    var byId = function (id) { return model.filter(function (d) { return d.id === id; })[0]; };
    var qIn = $('[data-f="q"]'); qIn.value = S.q;
    $$('select[data-f]').forEach(function (s) { if (S.f[s.dataset.f]) s.value = S.f[s.dataset.f]; });

    function match(d) {
      var q = S.q.trim().toLowerCase();
      if (q && (d.t + ' ' + d.link + ' ' + d.store).toLowerCase().indexOf(q) < 0) return false;
      var f = S.f;
      if (f.status && d.status !== f.status) return false;
      if (f.type && d.types.indexOf(f.type) < 0) return false;
      if (f.store && d.store !== f.store) return false;
      if (f.cat && d.cat !== f.cat) return false;
      if (f.pin === 'yes' && !d.pin) return false;
      if (f.pin === 'no' && d.pin) return false;
      if (f.display && String(d.display) !== f.display) return false;
      if (f.posted === 'today' && !(d.age >= 0 && d.age <= 1440)) return false;
      if (f.posted === 'week' && !(d.age >= 0 && d.age <= 10080)) return false;
      return true;
    }
    function cmp(a, b) {
      var k = S.sort, x, y;
      if (k === 'status') { x = ST_ORDER[a.status]; y = ST_ORDER[b.status]; }
      else { x = a[k]; y = b[k]; }
      return (x < y ? -1 : x > y ? 1 : 0) * S.dir;
    }
    function typesH(ts) { return ts.map(function (t) { return '<span class="tchip t-' + t.toLowerCase() + '">' + LABEL.type[t] + '</span>'; }).join(''); }
    function pill(s) { return '<span class="pill pill-' + s + '">' + LABEL.status[s] + '</span>'; }
    var MAIN = ['Loot', 'Top', 'Pantry', 'New'];   // D-160: one type label per row, the strongest one
    function mainType(ts) { for (var i = 0; i < MAIN.length; i++) if (ts.indexOf(MAIN[i]) > -1) return MAIN[i]; return ts[0]; }
    function rowH(d) {
      var ck = S.sel.has(d.id) ? ' checked' : '', mt = mainType(d.types), t40 = esc(d.t.slice(0, 40));
      var pin = d.pin ? ' <span class="d-pin" title="Pinned, slot ' + d.pin + ' on Top deals"><i data-lucide="pin"></i>' + d.pin + '</span>' : '';
      var edit = withRole(ROUTES.edit(d.id));
      return '<tr data-id="' + d.id + '"' + (S.sel.has(d.id) ? ' class="is-sel"' : '') + '>' +
        '<td class="c-ck"><label class="ck"><input type="checkbox" data-sel' + ck + ' aria-label="Select ' + t40 + '"><span class="box"><i data-lucide="check"></i></span></label></td>' +
        '<td class="c-deal"><div class="d-cell"><img src="' + d.img + '" alt="" loading="lazy"><div><a href="' + edit + '" title="Edit this deal">' + esc(d.t) + '</a>' +
          '<span class="d-sub">' + esc(d.store) + ' · ' + esc(d.cat) + (mt ? ' <span class="tchip t-' + mt.toLowerCase() + '">' + LABEL.type[mt] + '</span>' : '') + '</span></div></div></td>' +
        '<td class="m num d-price"><b>' + rs(d.p) + '</b><span><s>' + rs(d.m) + '</s> <span class="d-pct">' + d.pct + '%</span></span></td>' +
        '<td class="m d-st">' + pill(d.status) + pin + '</td>' +
        '<td class="m d-when">' + esc(d.when) + '</td>' +
        '<td class="m num" title="' + INR.format(d.views) + ' total views · ' + INR.format(d.clicks) + ' Buy clicks">' + INR.format(d.uniq) + '</td>' +
        '<td class="c-act"><div class="row-acts">' +
          '<button class="btn btn-ghost btn-icon btn-sm q-act" type="button" data-quick="wa" title="Copy for WhatsApp" aria-label="Copy for WhatsApp: ' + t40 + '"><i data-lucide="message-circle"></i></button>' +
          '<button class="btn btn-ghost btn-icon btn-sm q-act" type="button" data-quick="bump" title="Bump to top" aria-label="Bump to top: ' + t40 + '"><i data-lucide="arrow-up-to-line"></i></button>' +
          '<button class="btn btn-ghost btn-icon btn-sm" type="button" data-row-menu aria-haspopup="menu" title="More actions" aria-label="More actions for ' + t40 + '"><i data-lucide="ellipsis"></i></button></div></td>' +
        '<td class="c-meta"><b>' + rs(d.p) + '</b> <span class="d-pct">' + d.pct + '%</span> ' + pill(d.status) + pin + ' <span>' + esc(d.when) + '</span></td></tr>';
    }
    var flashIds = [];
    function render() {
      if (window.ADM_PG) ADM_PG.syncRows(model);   // S25 playground: what changed in the table is saved
      var list = model.filter(match).sort(cmp), total = list.length, pages = Math.max(1, Math.ceil(total / S.per));
      if (S.page > pages) S.page = pages;
      var start = (S.page - 1) * S.per, view = list.slice(start, start + S.per);
      $('[data-rows]').innerHTML = view.map(rowH).join('');
      flashIds.forEach(function (id) { var tr = $('tr[data-id="' + id + '"]'); if (tr) tr.classList.add('is-new'); }); flashIds = [];
      $('[data-empty]').hidden = total > 0; $('[data-tbl]').hidden = total === 0;
      $('[data-count-line]').textContent = total ? (start + 1) + '–' + (start + view.length) + ' of ' + total + ' deal' + (total === 1 ? '' : 's') : '0 deals';
      // chips
      var nf = Object.keys(S.f).filter(function (k) { return S.f[k] && k !== 'status'; }).length, fc = $('[data-fcount]');
      if (fc) { fc.textContent = nf; fc.hidden = !nf; }
      $$('[data-st]').forEach(function (b) { b.setAttribute('aria-pressed', String((S.f.status || '') === b.dataset.st)); });
      $$('[data-st-n]').forEach(function (n) { var v = n.dataset.stN, c = model.filter(function (d) { return !v || d.status === v; }).length; n.textContent = c; });
      var chips = Object.keys(S.f).filter(function (k) { return S.f[k] && k !== 'status'; }).map(function (k) { return '<button type="button" class="chip" data-chip="' + k + '">' + esc(LABEL[k] ? LABEL[k][S.f[k]] : S.f[k]) + '<i data-lucide="x"></i></button>'; });
      if (S.q) chips.unshift('<button type="button" class="chip" data-chip="q">“' + esc(S.q) + '”<i data-lucide="x"></i></button>');
      $('[data-chips]').innerHTML = chips.join('') + (chips.length ? '<button type="button" class="btn-link" data-clear>Clear all</button>' : '');
      $$('select[data-f]').forEach(function (s) { s.classList.toggle('is-set', !!s.value); });
      // pager
      var pg = '<button type="button" data-page="' + (S.page - 1) + '"' + (S.page === 1 ? ' disabled' : '') + ' aria-label="Previous page"><i data-lucide="chevron-left"></i></button>';
      for (var i = 1; i <= pages; i++) pg += '<button type="button" data-page="' + i + '"' + (i === S.page ? ' aria-current="page"' : '') + '>' + i + '</button>';
      pg += '<button type="button" data-page="' + (S.page + 1) + '"' + (S.page === pages ? ' disabled' : '') + ' aria-label="Next page"><i data-lucide="chevron-right"></i></button>';
      $('[data-pager]').innerHTML = total > S.per ? pg : '';
      // sort header
      $$('[data-sort]').forEach(function (b) { if (b.dataset.sort === S.sort) b.setAttribute('aria-sort', S.dir === 1 ? 'ascending' : 'descending'); else b.removeAttribute('aria-sort'); });
      // select-all + bulk bar
      var ids = view.map(function (d) { return d.id; }), n = ids.filter(function (id) { return S.sel.has(id); }).length, all = $('[data-all]');
      all.checked = ids.length > 0 && n === ids.length; all.indeterminate = n > 0 && n < ids.length;
      var bb = $('[data-bulkbar]'); bb.hidden = S.sel.size === 0; $('[data-bulk-n]').textContent = S.sel.size + ' selected';
      icons();
    }
    function snapshot() { var m = JSON.stringify(model), sel = Array.from(S.sel); return function () { model = JSON.parse(m); S.sel = new Set(sel); render(); }; }
    function done(msg, undo) { render(); toast(msg, undo ? { action: 'Undo', onAction: undo } : {}); }
    function waText(d) { return d.t + '\n\nDeal price: ' + rs(d.p) + ' (MRP ' + rs(d.m) + ', ' + d.pct + '% off)\n' + new URL(d.page, location.href).href; }
    function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 's'); }

    var ACT = {
      bump: function (ds) { var u = snapshot(); ds.forEach(function (d) { d.age = 0; d.when = 'now'; d._bump = true; flashIds.push(d.id); }); S.sort = 'age'; S.dir = 1; S.page = 1; done(ds.length === 1 ? 'Bumped to the top of the feed' : plural(ds.length, 'deal') + ' bumped to the top', u); },
      wa: function (ds) { copy(ds.map(waText).join('\n\n— — —\n\n')).then(function () { toast(ds.length === 1 ? 'Copied for WhatsApp' : plural(ds.length, 'deal') + ' copied for WhatsApp'); }); },
      link: function (ds) { copy(ds[0].link).then(function () { toast('Buy link copied'); }); },
      pin: function (ds) {
        var d = ds[0], u = snapshot();
        if (d.pin) { var s = d.pin; d.pin = null; done('Unpinned from slot ' + s, u); return; }
        if (d.status !== 'live') { toast('Only live deals can be pinned.', { icon: 'info' }); return; }
        var free = model.reduce(function (m, x) { return Math.max(m, x.pin || 0); }, 0) + 1;  // D-104: slots are open-ended; a new pin takes the next slot
        d.pin = free; done('Pinned to slot ' + free + ' on Top deals', u);
      },
      push: function (ds) { confirmBox('Send a push alert?', 'An alert for “' + ds[0].t.slice(0, 60) + '…” goes to every web and app subscriber now. It can’t be taken back.', 'Send alert', function () { toast('Push alert sent'); }); },
      del: function (ds) {
        var n = ds.length;
        confirmBox('Delete ' + plural(n, 'deal') + '?', (n === 1 ? 'It leaves' : 'They leave') + ' the site and the image files are removed. You can undo for 10 seconds.', 'Delete ' + plural(n, 'deal'), function () {
          var u = snapshot(), ids = ds.map(function (d) { return d.id; }); model = model.filter(function (d) { return ids.indexOf(d.id) < 0; }); ids.forEach(function (id) { S.sel.delete(id); }); done(plural(n, 'deal') + ' deleted', u);
        }, true);
      },
      status: function (ds, s) { var u = snapshot(); ds.forEach(function (d) { d.status = s; if (s !== 'live' && d.pin) d.pin = null; }); done((ds.length === 1 ? 'Status' : plural(ds.length, 'deal') + ':') + ' set to ' + LABEL.status[s] + (s !== 'live' ? '' : ''), u); }
    };

    // filters
    var qt; qIn.addEventListener('input', function () { clearTimeout(qt); qt = setTimeout(function () { S.q = qIn.value; S.page = 1; render(); }, 120); });
    $$('select[data-f]').forEach(function (s) { s.addEventListener('change', function () { S.f[s.dataset.f] = s.value; S.page = 1; render(); }); });
    $('[data-per]').addEventListener('change', function (e) { S.per = +e.target.value; S.page = 1; render(); });
    $('[data-filters-toggle]').addEventListener('click', function (e) { var on = $('.dl-tools').classList.toggle('is-open'); e.currentTarget.setAttribute('aria-expanded', on); });
    function clearAll() { S.q = ''; qIn.value = ''; S.f = {}; $$('select[data-f]').forEach(function (s) { s.value = ''; }); S.page = 1; render(); }
    document.addEventListener('click', function (e) {
      var c = e.target.closest('[data-chip]'); if (c) { var k = c.dataset.chip; if (k === 'q') { S.q = ''; qIn.value = ''; } else { S.f[k] = ''; $('select[data-f="' + k + '"]').value = ''; } S.page = 1; render(); return; }
      if (e.target.closest('[data-clear]')) { clearAll(); return; }
      var p = e.target.closest('[data-page]'); if (p && !p.disabled) { S.page = +p.dataset.page; render(); $('.tbl-wrap').scrollIntoView({ block: 'start', behavior: 'smooth' }); return; }
      var so = e.target.closest('[data-sort]'); if (so) { var k2 = so.dataset.sort; if (S.sort === k2) S.dir = -S.dir; else { S.sort = k2; S.dir = (k2 === 'age' || k2 === 'status') ? 1 : -1; } render(); return; }
      var st = e.target.closest('[data-st]'); if (st) { S.f.status = st.dataset.st; S.page = 1; S.sel.clear(); render(); return; }
      var qa = e.target.closest('[data-quick]'); if (qa) { var qd = byId(qa.closest('tr').dataset.id); if (qd) ACT[qa.dataset.quick]([qd]); return; }
      var mb = e.target.closest('[data-row-menu]'); if (mb) { e.stopPropagation(); openRowMenu(mb); return; }
      if (rowMenu && !rowMenu.hidden && !rowMenu.contains(e.target)) closeRowMenu();
    });
    // selection
    $('[data-rows]').addEventListener('change', function (e) { if (!e.target.matches('[data-sel]')) return; var id = e.target.closest('tr').dataset.id; if (e.target.checked) S.sel.add(id); else S.sel.delete(id); render(); });
    $('[data-all]').addEventListener('change', function (e) { $$('tr[data-id]').forEach(function (tr) { if (e.target.checked) S.sel.add(tr.dataset.id); else S.sel.delete(tr.dataset.id); }); render(); });
    // row menu
    function openRowMenu(btn) {
      if (menuBtn === btn && !rowMenu.hidden) { closeRowMenu(); return; }
      closeDD(); menuId = btn.closest('tr').dataset.id; menuBtn = btn; var d = byId(menuId);
      $('[data-pin-label]').textContent = d.pin ? 'Unpin (slot ' + d.pin + ')' : 'Pin';
      $('[data-act="open"]').href = d.page;
      $('[data-act="edit"]').href = withRole(ROUTES.edit(d.id)); $('[data-act="clone"]').href = withRole(ROUTES.clone(d.id));
      $('[data-act="share"]').href = withRole(ROUTES.edit(d.id)) + '#share'; $('[data-act="push"]').href = withRole(ROUTES.alerts(d.id));
      $$('[data-act^="st-"]').forEach(function (b) { b.setAttribute('aria-checked', b.dataset.act === 'st-' + d.status); });
      rowMenu.hidden = false; var r = btn.getBoundingClientRect(), h = rowMenu.offsetHeight, w = rowMenu.offsetWidth;
      rowMenu.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + 'px';
      rowMenu.style.top = (r.bottom + 4 + h > innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4) + 'px';
      requestAnimationFrame(function () { rowMenu.dataset.state = 'open'; }); var f = $('[role^="menuitem"]', rowMenu); if (f) f.focus({ preventScroll: true });
    }
    rowMenu.addEventListener('keydown', function (e) {
      var items = $$('[role^="menuitem"]', rowMenu), i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
    });
    window.addEventListener('scroll', function () { closeRowMenu(); }, { passive: true });
    rowMenu.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act]'); if (!b) return; var a = b.dataset.act, d = byId(menuId);
      if (a === 'edit' || a === 'clone' || a === 'share' || a === 'open' || a === 'push') { closeRowMenu(); return; }
      e.preventDefault(); closeRowMenu();
      if (a === 'delete') ACT.del([d]); else if (a.indexOf('st-') === 0) ACT.status([d], a.slice(3)); else ACT[a]([d]);
    });
    // bulk
    function selDeals() { return model.filter(function (d) { return S.sel.has(d.id); }); }
    $('[data-bulkbar]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-bulk]'); if (!b) return; var a = b.dataset.bulk, ds = selDeals();
      if (a === 'clear') { S.sel.clear(); render(); return; }
      if (a === 'edit') { $$('[data-be-n]').forEach(function (x) { x.textContent = ds.length; }); $$('[data-be]').forEach(function (c) { c.checked = false; c.closest('.be-row').classList.remove('is-on'); }); $$('.be-types button').forEach(function (t) { t.setAttribute('aria-pressed', 'false'); }); openSheet($('#bulk-edit')); return; }
      if (a === 'share') {  // B13: share several deals at once; only live deals can go out
        var live = ds.filter(function (d) { return d.status === 'live'; }), skip = ds.length - live.length, sk = $('[data-bs-skip]');
        if (!live.length) { toast('Only live deals can be shared. None of the selected deals is live.', { icon: 'info' }); return; }
        $('[data-bs-n]').textContent = live.length; sk.hidden = !skip; $('span', sk).textContent = skip + (skip === 1 ? ' selected deal is' : ' selected deals are') + ' not live and will be skipped.';
        openSheet($('#bulk-share')); return;
      }
      if (a === 'delete') ACT.del(ds); else if (a.indexOf('st-') === 0) ACT.status(ds, a.slice(3)); else ACT[a](ds);
    });
    var bsGo = $('[data-bs-go]');
    if (bsGo) bsGo.addEventListener('click', function () {
      var NAMES = { fb: 'Facebook Page', pin: 'Pinterest', th: 'Threads' }, chs = $$('[data-bs-ch]').filter(function (c) { return c.checked && !c.disabled; }).map(function (c) { return NAMES[c.dataset.bsCh]; });
      if (!chs.length) { toast('Tick at least one place to share.', { icon: 'info' }); return; }
      var n = selDeals().filter(function (d) { return d.status === 'live'; }).length; closeSheet();
      toast('Sharing ' + n + (n === 1 ? ' deal' : ' deals') + ' to ' + chs.join(' and ') + '. Results show in Social sharing → History.', { action: 'View', href: withRole('/admin/social/history'), ms: 6000 });
    });
    // bulk edit drawer
    $$('[data-be]').forEach(function (c) { c.addEventListener('change', function () { c.closest('.be-row').classList.toggle('is-on', c.checked); }); });
    $$('.be-row .select select, .be-types button').forEach(function (el) { el.addEventListener(el.tagName === 'SELECT' ? 'change' : 'click', function () { var c = $('[data-be]', el.closest('.be-row')); c.checked = true; c.closest('.be-row').classList.add('is-on'); if (el.tagName === 'BUTTON') el.setAttribute('aria-pressed', el.getAttribute('aria-pressed') !== 'true'); }); });
    $('[data-be-apply]').addEventListener('click', function () {
      var on = {}; $$('[data-be]').forEach(function (c) { on[c.dataset.be] = c.checked; });
      if (!Object.keys(on).some(function (k) { return on[k]; })) { toast('Tick at least one field to change.', { icon: 'info' }); return; }
      var ds = selDeals(), u = snapshot(), v = function (k) { return $('[data-bev="' + k + '"]').value; };
      var types = $$('.be-types button[aria-pressed="true"]').map(function (b) { return b.value; });
      if (on.types && !types.length) { toast('Pick at least one deal type, or untick Deal types.', { icon: 'info' }); return; }
      ds.forEach(function (d) {
        if (on.status) { d.status = v('status'); if (d.status !== 'live') d.pin = null; }
        if (on.types) d.types = types.slice();
        if (on.cat) d.cat = v('cat');
        if (on.store) d.store = v('store');
        if (on.display) d.display = +v('display');
        if (on.unpin) d.pin = null;
      });
      closeSheet(); done(plural(ds.length, 'deal') + ' updated' + (on.push ? ' · ' + plural(ds.length, 'push alert') + ' sent' : ''), u);
    });
    render();
  })();

  /* =================== Batch B helpers =================== */
  var DEALS = window.ADM_DEALS || [];
  function dealById(id) { return DEALS.filter(function (d) { return d.id === id; })[0]; }
  function typesFor(pct, cat) { var t = []; if (pct > 25) t.push('Top'); if (pct > 80) t.push('Loot'); if (cat === 'Grocery' || cat === 'Kitchen') t.push('Pantry'); t.push('New'); return t; }  // D-117
  function num(v) { v = String(v || '').replace(/[^\d]/g, ''); return v === '' ? null : +v; }
  function readImg(file, cb) { if (!file) return; var r = new FileReader(); r.onload = function () { cb(r.result); }; r.readAsDataURL(file); }
  // D-161: one deal search for every "pick a deal" place (pinned board, alerts, sale posters). Built for a catalogue of
  // tens of thousands: nothing is listed until it helps. Empty box = the newest few; typing = every word must match
  // title, store, category, link or deal ID; a pasted deal link or ID finds that exact deal. Shows 8 at a time and says
  // how many matched, so the admin narrows by typing instead of scrolling. In the build this is one search call (limit 8).
  var LIVE_TOTAL = +(document.documentElement.dataset.totalDeals || 0);
  function isLinkish(q) { var t = q.trim(); return /^\d{4,}$/.test(t) || /^https?:\/\/|offertag\.in|oftg\.in|\/deal\//i.test(t); }
  function exactDeal(q, pool) {  // a pasted store link, OfferTag link, short link or deal ID → that one deal
    var t = q.trim(); if (!t) return null;
    if (/^\d{4,}$/.test(t)) return pool.filter(function (d) { return d.id === t; })[0] || null;
    if (!/^https?:\/\/|offertag\.in|oftg\.in|\/deal\//i.test(t)) return null;
    var bare = t.replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase();
    return pool.filter(function (d) { var l = String(d.link || '').replace(/[?#].*$/, '').replace(/\/$/, '').toLowerCase(), pg = String(d.page || '').toLowerCase(); return (l && (l === bare || bare.indexOf(l) > -1)) || (pg && bare.slice(-pg.length) === pg) || bare.indexOf('/' + d.id) > -1; })[0] || null;
  }
  function picker(input, list, opt) {
    var LIMIT = 8, timer = null, uid = 'pk' + Math.random().toString(36).slice(2, 7);
    if (!list.id) list.id = uid;
    input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list'); input.setAttribute('aria-controls', list.id); input.setAttribute('aria-expanded', 'false'); input.setAttribute('autocomplete', 'off');
    function words(q) { return q.toLowerCase().split(/\s+/).filter(Boolean); }
    function hay(d) { return (d.t + ' ' + d.store + ' ' + (d.cat || '') + ' ' + d.id + ' ' + (d.link || '') + ' ' + (d.page || '')).toLowerCase(); }
    var exact = exactDeal;   // D-162: shared with the full window
    function find(q) {
      var pool = DEALS.filter(function (d) { return !opt.filter || opt.filter(d); });
      var newest = function (a, b) { return (a.age < 0 ? 1e9 : a.age) - (b.age < 0 ? 1e9 : b.age); };
      if (!q.trim()) return { items: pool.slice().sort(newest).slice(0, LIMIT), total: pool.length, empty: true };
      var hit = exact(q, pool); if (hit) return { items: [hit], total: 1, exact: true };
      var w = words(q), m = pool.filter(function (d) { var h = hay(d); return w.every(function (x) { return h.indexOf(x) > -1; }); });
      m.sort(function (a, b) { var at = a.t.toLowerCase().indexOf(w[0]) === 0 ? 0 : 1, bt = b.t.toLowerCase().indexOf(w[0]) === 0 ? 0 : 1; return at - bt || newest(a, b); });
      return { items: m.slice(0, LIMIT), total: m.length };
    }
    function mark(text, q) {
      var out = esc(text), w = words(q).filter(function (x) { return x.length > 1; }).map(function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); });
      return w.length ? out.replace(new RegExp('(' + w.join('|') + ')', 'gi'), '<mark>$1</mark>') : out;
    }
    function draw() {
      var q = input.value, r = find(q), n = r.items.length, total = LIVE_TOTAL && r.empty ? LIVE_TOTAL : r.total;
      var head = r.empty ? 'Newest deals · type a title, store, link or deal ID to search ' + (total ? INR.format(total) + ' deals' : 'every deal')
        : r.exact ? 'Exact match' : !n ? '' : r.total > n ? INR.format(r.total) + ' matches · showing ' + n + ', add a word to narrow' : r.total + (r.total === 1 ? ' match' : ' matches');
      var h = r.items.map(function (d) {
        var st = d.status && d.status !== 'live' ? ' · <span class="pk-st">' + esc(d.status[0].toUpperCase() + d.status.slice(1)) + '</span>' : '';
        return '<li role="option" tabindex="-1" id="' + list.id + '-' + d.id + '" data-pick="' + d.id + '"><img src="' + d.img + '" alt=""><span class="pk-body"><span class="pk-t">' + mark(d.t, r.empty || r.exact ? '' : q) + '</span>' +
          '<span class="pk-m">' + esc(d.store) + ' · <b>' + rs(d.p) + '</b>' + (d.pct ? ' · <span class="d-pct">' + d.pct + '% off</span>' : '') + ' · ' + esc(d.when || '') + st + ' · <span class="pk-id">#' + d.id + '</span></span></span></li>';
      }).join('');
      if (opt.url && /^https?:\/\//i.test(q.trim()) && !r.exact) h = '<li role="option" tabindex="-1" data-pick-url><i data-lucide="link"></i><span class="pk-body"><span class="pk-t">Attach this link</span><span class="pk-m">' + esc(q.trim().slice(0, 60)) + '</span></span></li>' + h;
      list.innerHTML = (head ? '<li class="pk-head" role="presentation">' + head + '</li>' : '') + (h || '<li class="none" role="presentation">No deals match “' + esc(q.trim().slice(0, 40)) + '”. Try fewer words, the store name or paste the link.</li>') +
        '<li role="option" tabindex="-1" class="pk-browse" data-pick-browse><i data-lucide="table-properties"></i><span>Browse all deals in a full list</span><i data-lucide="arrow-right"></i></li>';
      list.hidden = false; input.setAttribute('aria-expanded', 'true'); icons();
    }
    function later() { clearTimeout(timer); timer = setTimeout(draw, 120); }
    function close() { list.hidden = true; input.setAttribute('aria-expanded', 'false'); }
    input.addEventListener('input', later); input.addEventListener('focus', draw);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); if (list.hidden) draw(); var f = $('[role=option]', list); if (f) f.focus(); }
      if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); draw(); var f2 = $('[role=option]', list); if (f2) f2.click(); }
      if (e.key === 'Escape' && !list.hidden) { e.stopPropagation(); close(); }
    });
    list.addEventListener('keydown', function (e) {
      var o = $$('[role=option]', list), i = o.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); if (o[i + 1]) o[i + 1].focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); (o[i - 1] || input).focus(); } if (e.key === 'Enter') { e.preventDefault(); document.activeElement.click(); }
      if (e.key === 'Escape') { e.stopPropagation(); close(); input.focus(); }
    });
    list.addEventListener('click', function (e) {
      if (e.target.closest('[data-pick-browse]')) { var qv = input.value; close(); chooser({ q: isLinkish(qv) || qv.trim().length > 1 ? qv : '', filter: opt.filter, title: opt.title, opener: input, onUse: function (ds) { opt.onPick(ds[0]); } }); return; }
      var li = e.target.closest('[data-pick],[data-pick-url]'); if (!li) return; if (li.hasAttribute('data-pick-url')) opt.onUrl(input.value.trim()); else opt.onPick(dealById(li.dataset.pick)); });
    draw.close = close;
    return draw;
  }

  /* =================== D-162: Choose a deal (full window) =================== */
  // The whole catalogue in a table: search (every word), paste a link or ID, Store · Category · Posted · Sort, numbered pages,
  // 25/50/100 per page. One deal (posters, pins, alerts) or several (blog). Selection survives paging and filters.
  // In the build each change is one paged API call; nothing here loads the whole catalogue.
  var CH = null;
  function chooserEl() {
    if (CH) return CH;
    var opts = function (vals) { return vals.map(function (v) { return '<option value="' + esc(v) + '">' + esc(v) + '</option>'; }).join(''); };
    var stores = [], cats = []; DEALS.forEach(function (d) { if (stores.indexOf(d.store) < 0) stores.push(d.store); if (d.cat && cats.indexOf(d.cat) < 0) cats.push(d.cat); }); cats.sort();
    var sel = function (attr, label, first, o) { return '<label class="select"><span class="visually-hidden">' + label + '</span><select ' + attr + '><option value="">' + first + '</option>' + o + '</select><i data-lucide="chevron-down"></i></label>'; };
    var wrap = document.createElement('div');
    wrap.innerHTML = '<div class="dc-overlay" data-dc-close hidden></div>' +
      '<section class="dc" role="dialog" aria-modal="true" aria-labelledby="dc-title" hidden>' +
        '<header class="dc-h"><div><h2 id="dc-title">Choose a deal</h2><p data-dc-sub></p></div><button class="btn btn-ghost btn-icon" type="button" data-dc-close aria-label="Close"><i data-lucide="x"></i></button></header>' +
        '<div class="dc-tools"><label class="input-wrap dc-search"><i data-lucide="search"></i><span class="visually-hidden">Search deals</span><input class="input" type="search" data-dc-q placeholder="Search title, store or deal ID, or paste a deal link" autocomplete="off"></label>' +
          '<div class="dc-sels">' + sel('data-dc-f="store"', 'Store', 'All stores', opts(stores)) + sel('data-dc-f="cat"', 'Category', 'All categories', opts(cats)) +
          sel('data-dc-f="posted"', 'Posted', 'Posted: any time', '<option value="1440">Today</option><option value="10080">Last 7 days</option><option value="43200">Last 30 days</option>') +
          sel('data-dc-sort', 'Sort', 'Newest first', '<option value="pct">Biggest discount</option><option value="p">Lowest price</option><option value="uniq">Most viewed</option>') + '</div></div>' +
        '<div class="dc-note" data-dc-note hidden></div>' +
        '<div class="dc-row"><span class="count" data-dc-count></span><label class="select per"><span class="visually-hidden">Rows per page</span><select data-dc-per><option>25</option><option>50</option><option>100</option></select><i data-lucide="chevron-down"></i></label></div>' +
        '<div class="dc-body"><table class="tbl dc-tbl"><thead><tr><th class="c-ck"><span class="visually-hidden">Pick</span></th><th>Deal</th><th class="num">Price</th><th>Posted</th><th class="num">Views</th></tr></thead><tbody data-dc-rows></tbody></table>' +
          '<p class="empty" data-dc-empty hidden></p></div>' +
        '<nav class="pager dc-pager" data-dc-pager aria-label="Pages"></nav>' +
        '<footer class="dc-f"><span class="dc-sel" data-dc-sel>Nothing picked yet</span><button class="btn btn-outline" type="button" data-dc-close>Cancel</button><button class="btn btn-default" type="button" data-dc-use disabled>Use this deal</button></footer>' +
      '</section>';
    document.body.appendChild(wrap);
    var el = $('.dc', wrap), ov = $('.dc-overlay', wrap), q = $('[data-dc-q]', el), rows = $('[data-dc-rows]', el), S = null, timer = null;
    function pool() { return DEALS.filter(function (d) { return !S.opt.filter || S.opt.filter(d); }); }
    function results() {
      var all = pool(), t = q.value.trim(), note = '';
      if (t && isLinkish(t)) {
        var hit = exactDeal(t, all);
        if (hit) { if (!S.opt.multi) { S.picked = {}; S.order = []; } S.picked[hit.id] = hit; if (S.order.indexOf(hit.id) < 0) S.order.push(hit.id); note = '<i data-lucide="circle-check"></i><span>Found the deal for this link and picked it.</span>'; S.noteKind = 'ok'; return { list: [hit], note: note }; }
        var anyStatus = exactDeal(t, DEALS);
        S.noteKind = 'warn';
        note = anyStatus ? '<i data-lucide="triangle-alert"></i><span>That deal is ' + esc(anyStatus.status) + ', so it can’t be used here. Pick a live deal.</span>'
          : '<i data-lucide="link-2-off"></i><span>This link isn’t on OfferTag yet.</span> <a href="' + withRole(ROUTES.post) + '?link=' + encodeURIComponent(t) + '" target="_blank" rel="noopener">Post it as a deal first <i data-lucide="external-link"></i></a>';
        return { list: [], note: note };
      }
      var w = t.toLowerCase().split(/\s+/).filter(Boolean), f = S.f;
      var list = all.filter(function (d) {
        if (f.store && d.store !== f.store) return false; if (f.cat && d.cat !== f.cat) return false; if (f.posted && !(d.age >= 0 && d.age <= +f.posted)) return false;
        if (!w.length) return true; var h = (d.t + ' ' + d.store + ' ' + (d.cat || '') + ' ' + d.id).toLowerCase(); return w.every(function (x) { return h.indexOf(x) > -1; });
      });
      var k = S.sort; list.sort(function (a, b) { return k === 'pct' ? b.pct - a.pct : k === 'p' ? a.p - b.p : k === 'uniq' ? b.uniq - a.uniq : a.age - b.age; });
      return { list: list, note: '' };
    }
    function mark(text) { var w = q.value.trim().toLowerCase().split(/\s+/).filter(function (x) { return x.length > 1 && !isLinkish(x); }).map(function (x) { return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }); var o = esc(text); return w.length ? o.replace(new RegExp('(' + w.join('|') + ')', 'gi'), '<mark>$1</mark>') : o; }
    function render() {
      var r = results(), n = S.per, total = r.list.length, pages = Math.max(1, Math.ceil(total / n)); if (S.page > pages) S.page = pages;
      var st = (S.page - 1) * n, view = r.list.slice(st, st + n), type = S.opt.multi ? 'checkbox' : 'radio';
      rows.innerHTML = view.map(function (d) {
        var on = !!S.picked[d.id];
        return '<tr data-id="' + d.id + '"' + (on ? ' class="is-sel"' : '') + '><td class="c-ck"><label class="' + (S.opt.multi ? 'ck' : 'rd') + '"><input type="' + type + '" name="dc-pick" value="' + d.id + '"' + (on ? ' checked' : '') + ' aria-label="Pick ' + esc(d.t.slice(0, 50)) + '"><span class="box"><i data-lucide="check"></i></span></label></td>' +
          '<td class="c-deal"><div class="d-cell"><img src="' + d.img + '" alt="" loading="lazy"><div><b class="dc-t">' + mark(d.t) + '</b><span class="d-sub">' + esc(d.store) + ' · ' + esc(d.cat || '') + ' · #' + d.id + '</span></div></div></td>' +
          '<td class="num d-price"><b>' + rs(d.p) + '</b><span><s>' + rs(d.m) + '</s> <span class="d-pct">' + d.pct + '%</span></span></td>' +
          '<td class="d-when">' + esc(d.when) + '</td><td class="num">' + INR.format(d.uniq || 0) + '</td></tr>';
      }).join('');
      var note = $('[data-dc-note]', el); note.hidden = !r.note; note.className = 'dc-note' + (S.noteKind ? ' is-' + S.noteKind : ''); note.innerHTML = r.note;
      var em = $('[data-dc-empty]', el); em.hidden = total > 0 || !!r.note; em.innerHTML = 'No deals match. <button class="btn-link" type="button" data-dc-clear>Clear search and filters</button>';
      $('.dc-tbl', el).hidden = !total;
      var filtered = q.value.trim() || S.f.store || S.f.cat || S.f.posted;
      $('[data-dc-count]', el).textContent = total ? (st + 1) + '–' + (st + view.length) + ' of ' + INR.format(total) + (filtered ? ' matching' : '') + ' deal' + (total === 1 ? '' : 's') : '';
      var pg = '';
      if (pages > 1) {
        pg += '<button type="button" data-dc-page="' + (S.page - 1) + '"' + (S.page === 1 ? ' disabled' : '') + ' aria-label="Previous page"><i data-lucide="chevron-left"></i></button>';
        for (var i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - S.page) <= 1) pg += '<button type="button" data-dc-page="' + i + '"' + (i === S.page ? ' aria-current="page"' : '') + '>' + i + '</button>'; else if (Math.abs(i - S.page) === 2) pg += '<span class="pg-gap">…</span>';
        pg += '<button type="button" data-dc-page="' + (S.page + 1) + '"' + (S.page === pages ? ' disabled' : '') + ' aria-label="Next page"><i data-lucide="chevron-right"></i></button>';
      }
      $('[data-dc-pager]', el).innerHTML = pg;
      var ids = Object.keys(S.picked), use = $('[data-dc-use]', el);
      use.disabled = !ids.length;
      use.textContent = S.opt.multi ? (ids.length > 1 ? 'Insert ' + ids.length + ' deals' : 'Insert deal') : (S.opt.useLabel || 'Use this deal');
      $('[data-dc-sel]', el).innerHTML = !ids.length ? 'Nothing picked yet' : ids.length === 1 ? 'Picked: <b>' + esc(S.picked[ids[0]].t.slice(0, 70)) + '</b> · ' + rs(S.picked[ids[0]].p) : '<b>' + ids.length + ' deals picked</b> · they go in this order';
      icons();
    }
    function close(used) {
      el.hidden = true; ov.hidden = true; html.classList.remove('dc-open'); var o = S && S.opt.opener; var cb = S && S.opt.onUse, picked = S && S.order.map(function (id) { return S.picked[id]; }).filter(Boolean);
      S = null; if (used && cb) cb(picked); else if (o && o.focus) o.focus();
    }
    function toggle(id) {
      var d = dealById(id); if (!d) return;
      if (S.opt.multi) { if (S.picked[id]) { delete S.picked[id]; S.order = S.order.filter(function (x) { return x !== id; }); } else { S.picked[id] = d; S.order.push(id); } }
      else { S.picked = {}; S.picked[id] = d; S.order = [id]; }
      render();
    }
    q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(function () { S.page = 1; S.noteKind = ''; render(); }, 150); });
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); clearTimeout(timer); S.page = 1; render(); var r1 = $('tr[data-id]', rows); if (r1 && !S.opt.multi && $$('tr[data-id]', rows).length === 1) toggle(r1.dataset.id); } });
    $$('[data-dc-f]', el).forEach(function (x) { x.addEventListener('change', function () { S.f[x.dataset.dcF] = x.value; S.page = 1; render(); }); });
    $('[data-dc-sort]', el).addEventListener('change', function (e) { S.sort = e.target.value; S.page = 1; render(); });
    $('[data-dc-per]', el).addEventListener('change', function (e) { S.per = +e.target.value; S.page = 1; render(); });
    rows.addEventListener('click', function (e) { var tr = e.target.closest('tr[data-id]'); if (!tr) return; if (e.target.matches('input')) { e.preventDefault(); } toggle(tr.dataset.id); var inp = $('tr[data-id="' + tr.dataset.id + '"] input', rows); if (inp) inp.focus(); });
    rows.addEventListener('dblclick', function (e) { var tr = e.target.closest('tr[data-id]'); if (tr && !S.opt.multi) { S.picked = {}; S.picked[tr.dataset.id] = dealById(tr.dataset.id); S.order = [tr.dataset.id]; close(true); } });
    rows.addEventListener('keydown', function (e) { if (e.key === 'Enter' && e.target.matches('input')) { e.preventDefault(); if (!S.opt.multi) { toggle(e.target.value); close(true); } } });
    el.addEventListener('click', function (e) {
      if (e.target.closest('[data-dc-close]')) { close(false); return; }
      if (e.target.closest('[data-dc-use]')) { close(true); return; }
      if (e.target.closest('[data-dc-clear]')) { q.value = ''; S.f = {}; $$('[data-dc-f]', el).forEach(function (x) { x.value = ''; }); S.page = 1; render(); q.focus(); return; }
      var pb = e.target.closest('[data-dc-page]'); if (pb && !pb.disabled) { S.page = +pb.dataset.dcPage; render(); $('.dc-body', el).scrollTop = 0; }
    });
    ov.addEventListener('click', function () { close(false); });
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(false); return; }
      if (e.key === 'Tab') { var f = $$('button:not([disabled]), input, select, a[href]', el).filter(function (x) { return x.offsetParent; }); if (!f.length) return; var a = f[0], z = f[f.length - 1]; if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); } }
    });
    CH = { el: el, ov: ov, q: q, render: render, start: function (opt) {
      S = { opt: opt, f: {}, sort: '', page: 1, per: 25, picked: {}, order: [], noteKind: '' };
      $$('[data-dc-f]', el).forEach(function (x) { x.value = ''; }); $('[data-dc-sort]', el).value = ''; $('[data-dc-per]', el).value = '25';
      (opt.selected || []).forEach(function (id) { var d = dealById(String(id)); if (d) { S.picked[d.id] = d; S.order.push(d.id); } });
      $('#dc-title').textContent = opt.title || (opt.multi ? 'Insert deals' : 'Choose a deal');
      $('[data-dc-sub]', el).textContent = (LIVE_TOTAL ? 'Searching ' + INR.format(LIVE_TOTAL) + ' deals on the live site · this prototype holds ' + DEALS.length : DEALS.length + ' deals') + (opt.filter ? ' · live deals only' : '') + (opt.multi ? ' · tick as many as you need' : '');
      q.value = opt.q || ''; html.classList.add('dc-open'); ov.hidden = false; el.hidden = false; render(); q.focus(); q.select();
    } };
    return CH;
  }
  function chooser(opt) { chooserEl().start(opt || {}); }

  /* =================== Post / edit deal =================== */
  if ($('[data-post]')) (function () {
    var F = $('[data-form]'), el = function (n) { return F.elements[n]; }, CFG = window.ADM_CFG;
    var editId = params.get('id'), cloneId = params.get('clone'), src = dealById(editId || cloneId), EDIT = !!(editId && src);
    var state = { img: '', typesTouched: false, notifyTouched: false, matched: null };
    var tbtns = $$('[data-types] button');
    function setTypes(ts) { tbtns.forEach(function (b) { b.setAttribute('aria-pressed', ts.indexOf(b.value) > -1); }); }
    function getTypes() { return tbtns.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.value; }); }

    // optional blocks
    function addRow(box, kind, val) {
      var max = +(box.closest('[data-blk]') ? box.closest('[data-blk]').dataset.max : 5);
      if ($$('.brow', box).length >= max) { toast('That’s the most this block takes.', { icon: 'info' }); return; }
      var ph = box.closest('[data-blk]') ? $('template', box.closest('[data-blk]')).innerHTML : 'e.g. Apply code at checkout';
      var parts = ph.split('|'), v = val || ['', ''], row = document.createElement('div'); row.className = 'brow';
      row.innerHTML = kind === 'pairs'
        ? '<input class="input" type="text" placeholder="' + parts[0] + '" value="' + esc(v[0] || '') + '" aria-label="Label"><input class="input" type="text" placeholder="' + (parts[1] || '') + '" value="' + esc(v[1] || '') + '" aria-label="Value">'
        : '<input class="input" type="text" maxlength="' + (kind === 'one' ? 140 : 120) + '" placeholder="' + ph + '" value="' + esc(typeof val === 'string' ? val : '') + '" aria-label="Line">';
      if (kind !== 'one') row.insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-ghost btn-icon btn-sm" data-row-x aria-label="Remove row"><i data-lucide="x"></i></button>');
      box.appendChild(row); icons(); return row;
    }
    function openBlk(k, vals) {
      var b = $('[data-blk="' + k + '"]'); b.hidden = false; $('[data-blk-add="' + k + '"]').hidden = true; var box = $('.blk-rows', b);
      (vals && vals.length ? vals : [null]).forEach(function (v) { addRow(box, b.dataset.kind, v); }); return b;
    }
    F.addEventListener('click', function (e) {
      var t = e.target.closest('[data-blk-add]'); if (t) { var r = $('input', openBlk(t.dataset.blkAdd)); if (r) r.focus(); return; }
      t = e.target.closest('[data-blk-remove]'); if (t) { var b = t.closest('[data-blk]'); $('.blk-rows', b).innerHTML = ''; b.hidden = true; $('[data-blk-add="' + b.dataset.blk + '"]').hidden = false; return; }
      t = e.target.closest('[data-add-row]'); if (t) { var bb = t.closest('[data-blk]'); $('input', addRow($('.blk-rows', bb), bb.dataset.kind)).focus(); return; }
      t = e.target.closest('[data-row-x]'); if (t) { var row = t.closest('.brow'), blk = row.closest('[data-blk]'); row.remove(); if (blk && !$('.brow', blk)) { blk.hidden = true; $('[data-blk-add="' + blk.dataset.blk + '"]').hidden = false; } return; }
      t = e.target.closest('[data-add-exc]'); if (t) { if ($$('.brow', $('[data-exc]')).length >= 5) { toast('Up to 5 extra steps.', { icon: 'info' }); return; } $('input', addRow($('[data-exc]'), 'lines')).focus(); return; }
      t = e.target.closest('[data-types] button'); if (t) { t.setAttribute('aria-pressed', t.getAttribute('aria-pressed') !== 'true'); state.typesTouched = true; return; }
    });

    // image
    function setImg(u) { state.img = u; var i = $('[data-img]'); i.src = u || ''; i.hidden = !u; $('[data-img-well]').classList.toggle('has', !!u); $('[data-img-err]').hidden = true; preview(); }
    $('[data-img-file]').addEventListener('change', function (e) { readImg(e.target.files[0], function (u) { if (window.OTDB) OTDB.shrink(u, setImg); else setImg(u); }); });
    $('[data-img-fetch]').addEventListener('click', function () {
      var m = matchLink(el('link').value);
      if (!m) { toast(el('link').value ? 'Couldn’t fetch an image from this link. Upload one instead.' : 'Paste the deal link first.', { icon: 'info' }); return; }
      setImg(m.img); ['title', 'p', 'm'].forEach(function (k) { if (!el(k).value) el(k).value = k === 'title' ? m.t : m[k]; });
      if (!el('store').value) el('store').value = m.store; el('cat').value = m.cat; calc(); dupCheck(); toast('Fetched image, title and prices from the store');
    });
    function matchLink(v) { v = (v || '').trim(); if (!v) return null; return DEALS.filter(function (d) { return d.link && d.link !== '#buy' && (v === d.link || v.split('?')[0] === d.link.split('?')[0]); })[0] || null; }

    // link → store, duplicates
    function hostStore(v) { try { var h = new URL(v).hostname.replace(/^www\.|^dl\./, ''); for (var k in CFG.hosts) if (h.indexOf(k) === 0 || h.indexOf('.' + k) > -1) return CFG.hosts[k]; } catch (e) {} return null; }
    function dupCheck() {
      var m = matchLink(el('link').value), tl = el('title').value.trim().toLowerCase();
      if (!m && tl) m = DEALS.filter(function (d) { return d.t.toLowerCase() === tl; })[0];
      if (m && EDIT && m.id === editId) m = null;
      $('[data-dup]').hidden = !m; if (m) $('[data-dup-link]').href = m.page; state.matched = m;
    }
    el('link').addEventListener('input', function () {
      var s = hostStore(el('link').value);
      if (s && [].some.call(el('store').options, function (o) { return o.value === s; })) { el('store').value = s; $('[data-store-hint]').hidden = false; } else $('[data-store-hint]').hidden = true;
      dupCheck(); preview();
    });
    el('title').addEventListener('change', dupCheck);
    el('clean').addEventListener('change', function () { if (el('clean').checked && el('link').value.indexOf('?') > -1) { el('link').value = el('link').value.split('?')[0]; toast('Link cleaned'); } });

    // prices → % → types, notify
    function calc() {
      var p = num(el('p').value), m = num(el('m').value), pct = p !== null && m && m > p ? Math.round((m - p) / m * 100) : null;
      el('pct').value = pct === null ? '' : pct;
      if (!state.typesTouched) setTypes(pct === null ? ['New'] : typesFor(pct, el('cat').value));
      if (!state.notifyTouched) el('notify').checked = pct !== null && pct >= 90;
      preview();
    }
    ['p', 'm'].forEach(function (k) { el(k).addEventListener('input', function () { el(k).value = el(k).value.replace(/[^\d]/g, ''); calc(); }); });
    el('cat').addEventListener('change', calc);
    el('notify').addEventListener('change', function () { state.notifyTouched = true; });
    el('pin').addEventListener('change', function () { el('slot').disabled = !el('pin').checked; });
    function label() { var t = EDIT ? 'Save changes' : 'Publish'; $('[data-submit]').textContent = t; $('[data-submit-proxy]').textContent = t; }

    // rich text (bold, italic, lists, links only)
    $$('[data-cmd]').forEach(function (b) { b.addEventListener('mousedown', function (e) { e.preventDefault(); }); b.addEventListener('click', function () { var c = b.dataset.cmd; if (c === 'createLink') { var u = prompt('Link address'); if (u) document.execCommand('createLink', false, u); } else document.execCommand(c); $('[data-desc]').focus(); }); });
    $('[data-desc]').addEventListener('paste', function (e) { e.preventDefault(); var t = (e.clipboardData || window.clipboardData).getData('text/plain'); document.execCommand('insertText', false, t); });

    // live preview
    function preview() {
      var p = num(el('p').value), m = num(el('m').value), pct = el('pct').value, st = el('store').value;
      var pi = $('[data-pv-img]'); pi.src = state.img || ''; pi.hidden = !state.img;
      $('[data-pv-store]').textContent = 'Just now';
      $('[data-pv-title]').textContent = el('title').value || 'Deal title shows here';
      $('[data-pv-p]').textContent = p === 0 ? 'Up to ' + (pct || '—') + '% off' : p !== null ? rs(p) : '₹—';
      $('[data-pv-m]').textContent = m && p ? rs(m) : '';
      var pp = $('[data-pv-pct]'); pp.innerHTML = pct ? '<i data-lucide="arrow-down"></i>' + pct + '%' : ''; if (pct) icons(); pp.hidden = !pct;
      $('[data-pv-save]').textContent = m && p && m > p ? 'Save ' + rs(m - p) : '';
      var cap = $('[data-pv-cap]'); cap.textContent = el('caption').value; cap.hidden = !el('caption').value;
      var cp = $('[data-pv-coupon]'); cp.textContent = el('coupon').value ? 'Code ' + el('coupon').value.toUpperCase() : ''; cp.hidden = !el('coupon').value;
      var lg = CFG.logos[st]; $('[data-pv-chip]').innerHTML = lg ? '<img src="' + lg + '" alt="' + esc(st) + '">' : st ? '<span>' + esc(st) + '</span>' : '';
      sharePv(); saveDraft();
    }
    F.addEventListener('input', preview);
    F.addEventListener('input', function (e) { var t = e.target; if (t.getAttribute('aria-invalid') === 'true') setErr(t, ''); });
    F.addEventListener('change', function (e) { var t = e.target; if (t.getAttribute('aria-invalid') === 'true') setErr(t, ''); });
    $$('[data-dens]').forEach(function (b) { b.addEventListener('click', function () { $$('[data-dens]').forEach(function (x) { x.setAttribute('aria-pressed', x === b); }); $('[data-pv]').classList.toggle('compact', b.dataset.dens === 'k'); }); });

    // share panel (edit only)
    var shortUrl = 'offertag.in/v/' + (EDIT ? editId.slice(-5) : Math.random().toString(36).slice(2, 7));
    function shareText(ch) {
      var p = num(el('p').value), m = num(el('m').value), pct = el('pct').value, t = el('title').value;
      var line = (pct ? pct + '% off ' : '') + t + (p ? '\nDeal price ' + rs(p) + (m ? ' (MRP ' + rs(m) + ')' : '') : '') + (el('coupon').value ? '\nCode: ' + el('coupon').value.toUpperCase() : '') + '\n' + shortUrl;
      return ch === 'pin' ? (pct ? pct + '% off ' : '') + t + ' · ' + shortUrl : line;
    }
    function sharePv() { var w = $('[data-share-pv]'); if (!w) return; w.innerHTML = (state.img ? '<img src="' + state.img + '" alt="">' : '') + '<p>' + esc(shareText($('[data-share-for]').value)).replace(/\n/g, '<br>') + '</p>'; }
    if ($('[data-share-for]')) $('[data-share-for]').addEventListener('change', sharePv);
    var NAMES = { fb: 'Facebook Page', pin: 'Pinterest', th: 'Threads' };
    $('[data-share-now]').addEventListener('click', function () {
      var chs = $$('[data-ch]').filter(function (c) { return c.checked; }).map(function (c) { return c.dataset.ch; });
      if (!chs.length) { toast('Tick at least one place to share.', { icon: 'info' }); return; }
      chs.forEach(function (c) { $('[data-hist]').insertAdjacentHTML('afterbegin', '<li><span class="t-title">' + NAMES[c] + '</span><span class="t-meta">now</span><span class="ok-t"><i data-lucide="check"></i>Posted</span><a class="side-a" href="#">View</a></li>'); });
      icons(); toast('Shared to ' + chs.map(function (c) { return NAMES[c]; }).join(' and '));
    });
    $('[data-hist]').addEventListener('click', function (e) { var r = e.target.closest('[data-retry]'); if (!r) return; var li = r.closest('li'); $('.bad-t', li).outerHTML = '<span class="ok-t"><i data-lucide="check"></i>Posted</span>'; r.outerHTML = '<a class="side-a" href="#">View</a>'; $('.t-meta', li).textContent = 'now'; icons(); toast('Posted to Facebook Page'); });

    // draft (new deals only, this device)
    var DK = 'adm-draft';
    function saveDraft() { if (EDIT || cloneId || F.dataset.loading) return; var o = {}; ['link', 'title', 'store', 'cat', 'p', 'm', 'caption', 'coupon', 'terms'].forEach(function (k) { o[k] = el(k).value; }); o.img = state.img && state.img.length < 200000 ? state.img : ''; store.set(DK, JSON.stringify(o)); $('[data-saved]').textContent = 'Draft saved on this device'; }

    // fill from a deal (edit / clone) or a draft
    function fill(d, clone) {
      F.dataset.loading = '1';
      if (!clone) { el('link').value = d.link === '#buy' ? '' : d.link; setImg(d.img); }
      el('title').value = d.t; el('store').value = d.store; el('cat').value = d.cat; el('p').value = d.p; el('m').value = d.m;
      el('caption').value = d.caption || ''; el('coupon').value = d.coupon || ''; el('terms').value = d.terms || '';
      if (d.offers && d.offers.length) openBlk('offers', d.offers);
      if (d.highlights && d.highlights.length) openBlk('highlights', d.highlights);
      if (d.links && d.links.length) openBlk('links', d.links.map(function (l) { return [l.label, l.url]; }));
      if (d.note) openBlk('note', [d.note]);
      if (d.specs && d.specs.length) openBlk('specs', d.specs.map(function (x) { return [x.label, x.value]; }));
      if (d.desc) $('[data-desc]').innerHTML = d.desc;
      (d.exc || []).forEach(function (x) { addRow($('[data-exc]'), 'lines', x); });
      el('display').value = String(d.display || 1);
      if (d.pin) { el('pin').checked = true; el('slot').value = d.pin; }
      calc(); state.typesTouched = true; setTypes(d.types);
      delete F.dataset.loading;
    }
    el('slot').disabled = true;
    if (EDIT) {
      fill(src);
      $('[data-form-title]').textContent = 'Edit deal'; $('[data-form-sub]').textContent = 'Last edited by Adil, 2 h ago · ' + (src.status === 'live' ? 'Live' : src.status[0].toUpperCase() + src.status.slice(1));
      document.title = 'Edit deal · OfferTag Admin'; $$('[data-edit-only]').forEach(function (x) { x.hidden = false; });
      $('[data-v-uniq]').textContent = INR.format(src.uniq); $('[data-v-total]').textContent = INR.format(src.views); $('[data-v-clicks]').textContent = INR.format(src.clicks);   // D-148 $('[data-open-page]').href = src.page;
      $('[data-saved]').hidden = true;
    } else if (src) {
      fill(src, true); $('[data-form-title]').textContent = 'Clone deal'; $('[data-form-sub]').textContent = 'Copied from “' + src.t.slice(0, 60) + '…”. Add the new link and image.';
    } else {
      try { var dr = JSON.parse(store.get(DK) || 'null'); if (dr && (dr.link || dr.title)) { F.dataset.loading = '1'; Object.keys(dr).forEach(function (k) { if (k !== 'img' && el(k)) el(k).value = dr[k]; }); if (dr.img) setImg(dr.img); delete F.dataset.loading; calc(); toast('Your unsent draft is back', { icon: 'file-text', action: 'Discard', onAction: function () { store.set(DK, ''); location.reload(); } }); } } catch (e) {}
      calc();
    }
    if (!EDIT && !src && params.get('link')) { el('link').value = params.get('link'); el('link').dispatchEvent(new Event('input', { bubbles: true })); el('link').dispatchEvent(new Event('change', { bubbles: true })); }   // D-162: from "Post it as a deal first"
    label(); preview();
    // D-160: "More details" opens by itself when the deal already uses any of its fields
    (function () {
      var more = $('[data-more]'); if (!more) return;
      var has = ['caption', 'coupon', 'terms'].some(function (k) { return el(k).value.trim(); }) || $$('[data-blk]').some(function (b) { return !b.hidden; }) || $('[data-desc]').textContent.trim() || $$('input', $('[data-exc]')).length;
      if (has) more.open = true;
    })();
    if (location.hash === '#share' && EDIT) setTimeout(function () { $('#share').scrollIntoView({ block: 'start' }); }, 50);

    // validation + submit
    function setErr(input, msg) { var f = input.closest('.fld'), e = f && $('.err', f); input.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (e) { e.textContent = msg || ''; e.hidden = !msg; } }
    function validate() {
      var bad = [];
      function req(n, msg, ok) { var v = el(n).value.trim(), good = ok ? ok(v) : !!v; setErr(el(n), good ? '' : msg); if (!good) bad.push(el(n)); }
      req('link', 'Paste the store link (starting with https://).', function (v) { return /^https?:\/\/\S+\.\S+/.test(v); });
      if (!state.img) { $('[data-img-err]').hidden = false; bad.push($('[data-img-fetch]')); }
      req('title', 'Add the product title.');
      req('store', 'Pick the store.');
      req('p', 'Add the deal price, or 0 for a sale post.', function (v) { return v !== ''; });
      var p = num(el('p').value), m = num(el('m').value);
      setErr(el('m'), m !== null && p !== null && m < p ? 'MRP can’t be lower than the price.' : ''); if (m !== null && p !== null && m < p) bad.push(el('m'));
      return bad;
    }
    F.addEventListener('submit', function (e) {
      e.preventDefault(); var bad = validate();
      if (bad.length) { bad[0].focus(); toast(bad.length === 1 ? 'One field needs a look.' : bad.length + ' fields need a look.', { icon: 'triangle-alert' }); return; }
      var saved = window.ADM_PG ? ADM_PG.saveDeal(record()) : null;   // S25 playground: the deal is saved and shows on the site
      if (EDIT) { $('[data-form-sub]').textContent = 'Last edited by Adil, just now · ' + (saved && saved.status !== 'live' ? saved.status[0].toUpperCase() + saved.status.slice(1) : 'Live'); toast('Changes saved', { action: 'View', href: saved ? saved.page : src.page }); return; }
      store.set(DK, '');
      var m = state.matched || DEALS[0];
      $('[data-done-title]').textContent = 'Deal is live';
      $('[data-done-sub]').textContent = 'It’s at the top of Top deals and in its type lists' + (el('notify').checked ? ', and the push alert is on its way.' : '.');
      $('[data-done-page]').value = 'offertag.in/deal/' + el('title').value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60);
      $('[data-done-open]').href = saved ? saved.page : state.matched ? state.matched.page : '/top-deals';
      if (saved) { $('[data-done-page]').value = 'offertag.in' + saved.page; m = saved; }
      $('[data-done-short]').value = shortUrl; $('[data-done-share]').href = withRole(ROUTES.edit(m.id)) + '#share'; $('[data-another]').href = withRole(ROUTES.post);
      $('[data-post]').hidden = true; $('[data-sticky]').hidden = true; $('.page-h').hidden = true; var d = $('[data-done]'); d.hidden = false; d.focus(); window.scrollTo(0, 0);
    });
    $('[data-submit-proxy]').addEventListener('click', function () { F.requestSubmit ? F.requestSubmit() : F.dispatchEvent(new Event('submit')); });
    // S25 playground: the form as a deal record
    function rows(k) { var b = $('[data-blk="' + k + '"]'); if (!b || b.hidden) return []; return $$('.brow', b).map(function (r) { return $$('input', r).map(function (i) { return i.value.trim(); }); }).filter(function (v) { return v.some(Boolean); }); }
    function record() {
      var p = num(el('p').value) || 0, m = num(el('m').value) || 0;
      var o = { t: el('title').value.trim(), link: el('link').value.trim(), store: el('store').value, cat: el('cat').value || 'Others', p: p, m: m || p, pct: m > p ? Math.round((m - p) / m * 100) : (+el('pct').value || 0),
        types: getTypes().filter(function (t) { return t !== 'Fresh'; }), caption: el('caption').value.trim(), coupon: el('coupon').value.trim().toUpperCase(), terms: el('terms').value.trim(),
        offers: rows('offers').map(function (r) { return r[0]; }), highlights: rows('highlights').map(function (r) { return r[0]; }), note: (rows('note')[0] || [''])[0],
        links: rows('links').map(function (r) { return { label: r[0] || (window.OTDB ? OTDB.H.domain(r[1]) : r[1]), url: r[1] }; }).filter(function (l) { return l.url; }),
        specs: rows('specs').map(function (r) { return { label: r[0], value: r[1] }; }).filter(function (x) { return x.value; }),
        exc: $$('.brow input', $('[data-exc]')).map(function (i) { return i.value.trim(); }).filter(Boolean),
        desc: sanitize($('[data-desc]').innerHTML), display: +el('display').value || 1, pin: el('pin').checked ? +el('slot').value || 1 : null };
      if (!o.types.length) o.types = ['New'];
      if (state.img) o.img = window.ADM_PG ? ADM_PG.pack(state.img) : state.img;
      if (EDIT) o.id = src.id;
      else { o.status = 'live'; o.postedAt = Date.now(); o.source = 'form'; o.views = 0; o.uniq = 0; o.clicks = 0; if (o.pin) o.pinnedAt = Date.now(); }
      return o;
    }
    function sanitize(h) {  // the editor allows bold, italic, lists and links only (contract §2)
      var t = document.createElement('div'); t.innerHTML = h;
      $$('*', t).forEach(function (n) {
        var tag = n.tagName.toLowerCase(), keep = { p: 1, br: 1, ul: 1, ol: 1, li: 1, strong: 1, em: 1, b: 1, i: 1, a: 1 };
        if (!keep[tag]) { if (tag === 'div') { var p = document.createElement('p'); p.innerHTML = n.innerHTML; n.replaceWith(p); } else n.replaceWith.apply(n, Array.prototype.slice.call(n.childNodes)); return; }
        Array.prototype.slice.call(n.attributes).forEach(function (a) { if (!(tag === 'a' && a.name === 'href')) n.removeAttribute(a.name); });
        if (tag === 'a') { n.target = '_blank'; n.rel = 'nofollow sponsored noopener'; }
      });
      var out = t.innerHTML.replace(/<b>/g, '<strong>').replace(/<\/b>/g, '</strong>').replace(/<i>/g, '<em>').replace(/<\/i>/g, '</em>').trim();
      return t.textContent.trim() ? (/^<(p|ul|ol)/.test(out) ? out : '<p>' + out + '</p>') : '';
    }
    $('[data-copy-short]').addEventListener('click', function () { copy('https://' + shortUrl).then(function () { toast('Short link copied'); }); });
    $('[data-copy-wa]').addEventListener('click', function () { copy(shareText('fb')).then(function () { toast('Copied for WhatsApp'); }); });
    $('[data-bump]').addEventListener('click', function () {
      var before = src && window.OTDB ? OTDB.raw(src.id) : null; if (src && window.ADM_PG) ADM_PG.saveDeal({ id: src.id, postedAt: Date.now(), status: 'live' });
      toast('Bumped to the top of the feed', { action: 'Undo', onAction: function () { if (before && window.OTDB) OTDB.saveDeal({ id: src.id, postedAt: before.postedAt == null ? undefined : before.postedAt, status: before.status }); } });
    });
    $('[data-del]').addEventListener('click', function () { confirmBox('Delete this deal?', 'It leaves the site and its image files are removed. You can undo for 10 seconds on All deals.', 'Delete deal', function () { if (src && window.ADM_PG) ADM_PG.deleteDeal(src.id); toast('Deal deleted'); setTimeout(function () { location.href = withRole('/admin/deal'); }, 900); }, true); });
  })();

  /* =================== Pinned board =================== */
  if ($('[data-slots]')) (function () {
    // D-104: open-ended slot list. Slot k shows on Top deals at card k × N (N = "every" setting). Last tile is always an empty "+ Pin a deal".
    var P = window.ADM_PINS, order = P.pins.slice(), every = P.every, lifted = null, dragFrom = null;
    if (!window.ADM_PG) try { var se = +localStorage.getItem('adm-pin-every'); if (se >= 2) every = se; var sp = JSON.parse(localStorage.getItem('adm-pins-full') || 'null'); if (sp && sp.length) order = sp; } catch (e) {}
    var gapSel = $('[data-pin-every]'); gapSel.value = String(every);
    function persist() { if (window.ADM_PG) { ADM_PG.savePins(order, every); return; } try { localStorage.setItem('adm-pin-every', String(every)); localStorage.setItem('adm-pins', JSON.stringify(order.map(function (x) { return x.id; }))); localStorage.setItem('adm-pins-full', JSON.stringify(order)); } catch (e) {} }
    function snap() { var o = JSON.stringify(order), ev = every; return function () { order = JSON.parse(o); every = ev; gapSel.value = String(every); persist(); render(); }; }
    function saved(msg, u) { persist(); render(); toast(msg || 'Slot order saved', { action: 'Undo', onAction: u }); }
    function card(k) { return k * every; }
    function slotSel(cur) { var o = ''; for (var k = 1; k <= order.length; k++) o += '<option value="' + k + '"' + (k === cur ? ' selected' : '') + '>Slot ' + k + '</option>'; return '<label class="select slot-sel"><span class="visually-hidden">Move to slot</span><select data-move>' + o + '</select><i data-lucide="chevron-down"></i></label>'; }
    function render() {
      var html = order.map(function (x, i) {
        var s = i + 1, d = dealById(x.id); if (!d) return '';
        return '<div class="slot" role="listitem" data-slot="' + s + '" draggable="true" tabindex="0" aria-roledescription="Pinned deal" aria-label="Slot ' + s + ', card ' + card(s) + ' on Top deals: ' + esc(d.t) + '. Press Space to move."' + (lifted === s ? ' data-lifted' : '') + '>' +
          '<div class="slot-h"><span>Slot ' + s + ' <small>· card ' + card(s) + '</small></span><i data-lucide="grip-vertical"></i></div><img src="' + d.img + '" alt=""><div class="slot-t">' + esc(d.t) + '</div>' +
          '<div class="slot-p"><b>' + rs(d.p) + '</b> <span class="d-pct">' + d.pct + '%</span></div><div class="slot-age">pinned ' + x.age + ' ago</div>' +
          '<div class="slot-acts"><a href="' + withRole(ROUTES.edit(d.id)) + '">Edit</a><button type="button" data-unpin="' + s + '">Unpin</button>' + slotSel(s) + '</div></div>';
      }).join('');
      var n = order.length + 1;
      html += '<div class="slot empty" role="listitem" data-slot="' + n + '"><div class="slot-h"><span>Slot ' + n + ' <small>· card ' + card(n) + '</small></span></div><button type="button" class="slot-add" data-pin-add="' + n + '"><i data-lucide="plus"></i>Pin a deal</button></div>';
      $('[data-slots]').innerHTML = html;
      var pos = []; for (var k = 1; k <= Math.min(order.length, 4); k++) pos.push(card(k));
      $('[data-pin-gap-h]').innerHTML = order.length
        ? order.length + ' pinned deal' + (order.length === 1 ? '' : 's') + ' at cards ' + pos.join(', ') + (order.length > 4 ? ' … ' + card(order.length) : '') + '. Once they run out, those spots show normal fresh deals.'
        : 'No pinned deals. Top deals shows normal deals only.';
      icons();
      if (lifted) { var c = $('[data-slot="' + lifted + '"]'); if (c) c.focus(); }
    }
    function swap(a, b) { var t = order[a - 1]; order[a - 1] = order[b - 1]; order[b - 1] = t; }
    gapSel.addEventListener('change', function () { var u = snap(); every = +gapSel.value; saved('A pinned deal now shows every ' + every + ' cards on Top deals', u); });
    var box = $('[data-slots]');
    box.addEventListener('dragstart', function (e) { var c = e.target.closest('.slot[draggable]'); if (!c) return; dragFrom = +c.dataset.slot; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragFrom); c.classList.add('is-drag'); });
    box.addEventListener('dragend', function () { $$('.slot').forEach(function (x) { x.classList.remove('is-drag', 'is-over'); }); });
    box.addEventListener('dragover', function (e) { var c = e.target.closest('.slot[draggable]'); if (!c || dragFrom === null) return; e.preventDefault(); $$('.slot').forEach(function (x) { x.classList.toggle('is-over', x === c); }); });
    box.addEventListener('drop', function (e) { var c = e.target.closest('.slot[draggable]'); if (!c || dragFrom === null) return; e.preventDefault(); var to = +c.dataset.slot, from = dragFrom; dragFrom = null; if (to === from) { render(); return; } var u = snap(); swap(from, to); saved('Moved to slot ' + to, u); });
    box.addEventListener('keydown', function (e) {
      var c = e.target.closest('.slot[draggable]'); if (!c || e.target !== c) return; var s = +c.dataset.slot;
      if (e.key === ' ') { e.preventDefault(); if (lifted) { lifted = null; persist(); render(); toast('Slot order saved'); } else { lifted = s; render(); } return; }
      if (lifted && (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowUp')) { e.preventDefault(); var j = s + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1); if (j < 1 || j > order.length) return; swap(s, j); lifted = j; render(); }
      if (e.key === 'Escape' && lifted) { lifted = null; render(); }
    });
    box.addEventListener('change', function (e) { var sel = e.target.closest('[data-move]'); if (!sel) return; var from = +sel.closest('.slot').dataset.slot, to = +sel.value; if (from === to) return; var u = snap(); swap(from, to); saved('Moved to slot ' + to, u); });
    box.addEventListener('click', function (e) {
      var b = e.target.closest('[data-unpin]'); if (b) { var s = +b.dataset.unpin, u = snap(); order.splice(s - 1, 1); saved('Unpinned. Later slots moved up one', u); return; }
      b = e.target.closest('[data-pin-add]'); if (b) { e.stopPropagation(); openPick(b); }
    });
    // + Pin a deal (always the next slot)
    var pop = $('#pick-pop');
    var draw = picker($('[data-pick-q]'), $('[data-pick-list]'), { filter: function (d) { return d.status === 'live' && !order.some(function (x) { return x.id === d.id; }); }, onPick: function (d) { var u = snap(); order.push({ id: d.id, age: '0 min' }); closePick(); saved('Pinned to slot ' + order.length + ' (card ' + card(order.length) + ' on Top deals)', u); } });
    function openPick(btn) { var r = btn.getBoundingClientRect(); pop.style.position = 'fixed'; pop.style.top = Math.min(r.bottom + 6, innerHeight - 380) + 'px'; pop.style.left = Math.max(12, Math.min(r.left, innerWidth - 412)) + 'px'; pop.hidden = false; requestAnimationFrame(function () { pop.dataset.state = 'open'; }); $('[data-pick-q]').value = ''; draw(); $('[data-pick-q]').focus(); }
    function closePick() { pop.dataset.state = 'closed'; pop.hidden = true; }
    document.addEventListener('click', function (e) { if (!pop.hidden && !pop.contains(e.target)) closePick(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) closePick(); });
    render();
  })();

  /* =================== Alerts =================== */
  if ($('[data-al-form]')) (function () {
    var att = null, msg = $('[data-al-msg]'), list = $('[data-al-list]');
    function show() {
      var box = $('[data-al-att]');
      if (!att) { box.hidden = true; $('[data-al-pick]').hidden = false; }
      else { box.hidden = false; $('[data-al-pick]').hidden = true; box.innerHTML = (att.img ? '<img src="' + att.img + '" alt="">' : '<i data-lucide="link"></i>') + '<span>' + esc(att.t) + '</span>' + (att.p ? '<b>' + rs(att.p) + '</b>' : '') + '<button type="button" class="btn btn-ghost btn-icon btn-sm" data-al-x aria-label="Remove"><i data-lucide="x"></i></button>'; }
      pv(); icons();
    }
    function pv() { $('[data-al-n]').textContent = msg.value.length; $('[data-nt]').textContent = msg.value || 'Your message shows here'; $('[data-nb]').textContent = att ? (att.p ? rs(att.p) + (att.pct ? ' · ' + att.pct + '% off' : '') : att.t) : ''; var i = $('[data-ni]'); i.hidden = !(att && att.img); if (att && att.img) i.src = att.img; }
    function attach(d) { att = d; list.hidden = true; if (!msg.value && d.p) msg.value = (d.pct + '% off ' + d.t).slice(0, 117) + ((d.pct + '% off ' + d.t).length > 117 ? '…' : ''); show(); msg.focus(); }
    picker($('[data-al-q]'), list, { url: true, onPick: attach, onUrl: function (u) { attach({ t: u.replace(/^https?:\/\//, ''), url: u }); } });
    document.addEventListener('click', function (e) { if (!e.target.closest('[data-al-pick]')) list.hidden = true; var x = e.target.closest('[data-al-x]'); if (x) { att = null; show(); $('[data-al-q]').value = ''; $('[data-al-q]').focus(); } });
    msg.addEventListener('input', pv);
    var pre = dealById(params.get('deal')); if (pre) attach(pre); else show();
    (function () {  // S25 playground: alerts sent earlier in this browser
      var al = window.OTDB && OTDB.get('alerts'); if (!al || !al.length) return; var h = $('[data-al-hist]'), day0 = new Date().setHours(0, 0, 0, 0);
      var rowsH = al.map(function (x) { var d = new Date(x.at), tm = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2); return { today: x.at >= day0, h: '<li><span class="t-time">' + (x.at >= day0 ? tm : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) + ' ' + tm) + '</span><span class="t-title">' + esc(x.text) + '</span><span class="share-res">' + (x.web ? '<span class="ok"><i data-lucide="check"></i>Web</span>' : '') + (x.app ? '<span class="ok"><i data-lucide="check"></i>App</span>' : '') + '</span><button class="btn btn-ghost btn-sm" type="button" data-resend>Resend</button></li>' }; });
      var first = $('.day', h), todayRows = rowsH.filter(function (r) { return r.today; }).map(function (r) { return r.h; }).join(''), older = rowsH.filter(function (r) { return !r.today; }).map(function (r) { return r.h; }).join('');
      if (todayRows) { if (first && first.textContent === 'Today') first.insertAdjacentHTML('afterend', todayRows); else h.insertAdjacentHTML('afterbegin', '<li class="day">Today</li>' + todayRows); }
      if (older) h.insertAdjacentHTML('beforeend', '<li class="day">Earlier in this playground</li>' + older);
      icons();
    })();
    $('[data-al-form]').addEventListener('submit', function (e) {
      e.preventDefault(); var w = $('[data-al-web]').checked, a = $('[data-al-app]').checked, me = $('.err', msg.closest('.fld'));
      me.hidden = !!msg.value.trim(); $('[data-al-to-err]').hidden = w || a; if (!msg.value.trim()) { msg.focus(); return; } if (!w && !a) return;
      var to = w && a ? 'the website and the app' : w ? 'the website' : 'the app';
      confirmBox('Send this alert now?', 'It goes to everyone who turned on alerts on ' + to + '. It can’t be taken back.', 'Send alert', function () {
        var now = new Date(), tm = ('0' + now.getHours()).slice(-2) + ':' + ('0' + now.getMinutes()).slice(-2), h = $('[data-al-hist]'), first = $('.day', h);
        var row = '<li class="is-new"><span class="t-time">' + tm + '</span><span class="t-title">' + esc(msg.value.trim()) + '</span><span class="share-res">' + (w ? '<span class="ok"><i data-lucide="check"></i>Web</span>' : '') + (a ? '<span class="ok"><i data-lucide="check"></i>App</span>' : '') + '</span><button class="btn btn-ghost btn-sm" type="button" data-resend>Resend</button></li>';
        if (first && first.textContent === 'Today') first.insertAdjacentHTML('afterend', row); else h.insertAdjacentHTML('afterbegin', '<li class="day">Today</li>' + row);
        if (window.OTDB) { var al = OTDB.get('alerts') || []; al.unshift({ at: Date.now(), text: msg.value.trim(), web: w, app: a }); OTDB.set('alerts', al); }   // S25 playground
        icons(); toast('Alert sent'); msg.value = ''; att = null; $('[data-al-q]').value = ''; show();
      });
    });
    $('[data-al-hist]').addEventListener('click', function (e) {
      var r = e.target.closest('[data-retry]'); if (r) { var li = r.closest('li'), bad = $('.bad', li); bad.className = 'ok'; bad.querySelector('i, svg').outerHTML = '<i data-lucide="check"></i>'; r.outerHTML = '<button class="btn btn-ghost btn-sm" type="button" data-resend>Resend</button>'; icons(); toast('Sent to the app'); return; }
      var s = e.target.closest('[data-resend]'); if (s) { var t = $('.t-title', s.closest('li')).textContent; confirmBox('Send this alert again?', '“' + t.slice(0, 80) + '” goes to every subscriber again now.', 'Send again', function () { toast('Alert sent again'); }); }
    });
  })();

  /* =================== Promo message (M-03, D-106): one admin-edited line above the posters =================== */
  if ($('[data-promo]')) (function () {
    var F = $('[data-promo] form');
    function out() {
      ['tag', 'text', 'cta'].forEach(function (k) { var o = $('[data-pm-out="' + k + '"]'); o.textContent = F[k].value.trim() || (k === 'cta' ? 'Open' : ''); });
      $('[data-pm-out="tag"]').hidden = !F.tag.value.trim(); $('[data-pm-n]').textContent = F.text.value.length;
      $('.pm-prev').classList.toggle('is-off', !F.on.checked);
    }
    function err(i, m) { var e = i.closest('.fld').querySelector('.err'); if (e) { e.hidden = !m; if (m) e.textContent = m; } i.setAttribute('aria-invalid', m ? 'true' : 'false'); return !m; }
    F.addEventListener('input', function (e) { if (e.target.name) err(e.target, ''); out(); });
    F.addEventListener('change', out);
    F.addEventListener('submit', function (e) {
      e.preventDefault(); var ok = true;
      if (!F.text.value.trim()) ok = err(F.text, 'Write the message.') && ok;
      if (!F.href.value.trim()) ok = err(F.href, 'Add where it opens.') && ok;
      if (F.start.value && F.end.value && F.end.value < F.start.value) ok = err(F.end, 'End must be after start.') && ok;
      if (!ok) { var b = $('[aria-invalid="true"]', F); if (b) b.focus(); return; }
      if (window.OTDB) OTDB.set('promo', { on: F.on.checked, tag: F.tag.value.trim(), text: F.text.value.trim(), cta: F.cta.value.trim(), href: F.href.value.trim(), start: F.start.value, end: F.end.value });
      toast(F.on.checked ? 'Promo message saved. It shows on Home' + (F.start.value ? ' from ' + F.start.value : '') + '.' : 'Promo message saved and hidden from Home.');
    });
    out();
  })();

  /* =================== Sale posters =================== */
  if ($('[data-posters]')) (function () {
    var list = window.ADM_POSTERS.slice(), T = window.ADM_TODAY, tab = 'cur', editing = null, imgs = {};
    function status(p) { return !p.on ? 'off' : p.end < T ? 'ended' : p.start > T ? 'scheduled' : 'live'; }
    var SL = { live: 'Live', scheduled: 'Scheduled', ended: 'Ended', off: 'Off' }, PL = { live: 'live', scheduled: 'scheduled', ended: 'withdrawn', off: 'withdrawn' };
    function fmt(d) { return new Date(d + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
    function snap() { var s = JSON.stringify(list); return function () { list = JSON.parse(s); render(); }; }
    function render() {
      var cur = list.filter(function (p) { return status(p) !== 'ended'; }), past = list.filter(function (p) { return status(p) === 'ended'; }), show = tab === 'cur' ? cur : past;
      if (window.ADM_PG) ADM_PG.saveList('posters', list, ['img']);   // S25 playground
      $('[data-pcount="cur"]').textContent = cur.length; $('[data-pcount="past"]').textContent = past.length;
      $('[data-posters]').innerHTML = show.length ? show.map(function (p, i) {
        var st = status(p), ord = tab === 'cur';
        return '<li class="poster-row" data-pid="' + p.id + '">' + (ord ? '<span class="p-ord">' + (i + 1) + '</span>' : '') +
          '<img class="p-img" src="' + p.img + '" alt="">' +
          '<div class="p-main"><b>' + esc(p.title) + '</b><span><span class="p-kind">' + (p.kind === 'deal' ? 'Featured deal' : 'Custom poster') + '</span>' + esc(p.store || '') + ' · ' + fmt(p.start) + ' – ' + fmt(p.end) + ' · opens ' + esc(p.link) + '</span></div>' +
          '<span class="pill pill-' + PL[st] + '">' + SL[st] + '</span>' +
          (st !== 'ended' ? '<label class="switch" title="Show on Home"><input type="checkbox" data-p-on' + (p.on ? ' checked' : '') + ' aria-label="Show ' + esc(p.title) + ' on Home"><span></span></label>' : '') +
          '<div class="p-acts">' + (ord ? '<button type="button" class="btn btn-ghost btn-icon btn-sm" data-p-up aria-label="Move up"' + (i === 0 ? ' disabled' : '') + '><i data-lucide="arrow-up"></i></button><button type="button" class="btn btn-ghost btn-icon btn-sm" data-p-down aria-label="Move down"' + (i === show.length - 1 ? ' disabled' : '') + '><i data-lucide="arrow-down"></i></button>' : '') +
          '<button type="button" class="btn btn-ghost btn-sm" data-p-edit>Edit</button><button type="button" class="btn btn-ghost btn-icon btn-sm danger" data-p-del aria-label="Delete poster"><i data-lucide="trash-2"></i></button></div></li>';
      }).join('') : '<li class="empty">' + (tab === 'cur' ? 'No posters live or coming up. Hot deals today shows only the most-viewed deals.' : 'No ended posters.') + '</li>';
      icons();
    }
    $$('[data-ptab]').forEach(function (t) { t.addEventListener('click', function () { tab = t.dataset.ptab; $$('[data-ptab]').forEach(function (x) { x.dataset.state = x === t ? 'active' : ''; x.setAttribute('aria-selected', x === t); }); render(); }); });
    function byPid(id) { return list.filter(function (p) { return p.id === id; })[0]; }
    $('[data-posters]').addEventListener('click', function (e) {
      var row = e.target.closest('[data-pid]'); if (!row) return; var p = byPid(+row.dataset.pid);
      if (e.target.closest('[data-p-up]') || e.target.closest('[data-p-down]')) {
        var cur = list.filter(function (x) { return status(x) !== 'ended'; }), i = cur.indexOf(p), j = i + (e.target.closest('[data-p-up]') ? -1 : 1), u = snap();
        var a = list.indexOf(cur[i]), b = list.indexOf(cur[j]); list[a] = cur[j]; list[b] = cur[i]; render(); toast('Order saved', { action: 'Undo', onAction: u });
        var again = $('[data-pid="' + p.id + '"] ' + (j < i ? '[data-p-up]' : '[data-p-down]')); if (again && !again.disabled) again.focus(); return;
      }
      if (e.target.closest('[data-p-edit]')) { openEdit(p); return; }
      if (e.target.closest('[data-p-del]')) { confirmBox('Delete this poster?', '“' + p.title + '” is removed from Home and from this list.', 'Delete poster', function () { var u = snap(); list.splice(list.indexOf(p), 1); render(); toast('Poster deleted', { action: 'Undo', onAction: u }); }, true); }
    });
    $('[data-posters]').addEventListener('change', function (e) { var c = e.target.closest('[data-p-on]'); if (!c) return; var p = byPid(+c.closest('[data-pid]').dataset.pid), u = snap(); p.on = c.checked; render(); toast(p.on ? 'Poster is on' : 'Poster is off. It stays here but Home won’t show it', { action: 'Undo', onAction: u }); });
    // drawer
    var D = $('[data-pe]'), sheet = $('#poster-edit');
    function setDrop(k, url) { var z = $('[data-drop="' + k + '"]'), i = $('img', z); imgs[k] = url || ''; i.src = url || ''; i.hidden = !url; z.classList.toggle('has', !!url); }
    $$('[data-drop]').forEach(function (z) { $('input', z).addEventListener('change', function (e) { readImg(e.target.files[0], function (u0) { (window.OTDB ? OTDB.shrink : function (x, cb) { cb(x); })(u0, function (u) { setDrop(z.dataset.drop, u); var er = $('.err', z.closest('.fld')); if (er) er.hidden = true; }, 1200); }); }); });
    function openEdit(p) {
      editing = p || null; $('#pe-title').textContent = p ? 'Edit poster' : 'Add poster'; D.reset(); $$('.err', D).forEach(function (x) { x.hidden = true; });
      var kind = p ? p.kind : 'deal'; setKind(kind);
      setDrop('d', p && p.kind === 'custom' ? p.img : '');
      setDeal(p && p.kind === 'deal' ? p.deal : '');
      if (p) { if (p.kind === 'deal') {} else { D.elements.title.value = p.title; D.elements.link.value = p.link; D.elements.store.value = p.store; } D.elements.start.value = p.start; D.elements.end.value = p.end; D.elements.on.checked = p.on; }
      else { D.elements.start.value = T; D.elements.end.value = ''; }
      openSheet(sheet);
    }
    // D-161: Deal field = search box + chosen deal card (a list of every deal does not scale)
    var dq = $('[data-dq]'), dlist = $('[data-dlist]'), dsel = $('[data-dsel]'), dpick = $('[data-dpick]');
    function setDeal(id) {
      var d = id ? dealById(String(id)) : null; D.elements.deal.value = d ? d.id : '';
      dsel.hidden = !d; dpick.hidden = !!d; dq.value = ''; dlist.hidden = true;
      if (d) dsel.innerHTML = '<img src="' + d.img + '" alt=""><span class="pk-body"><span class="pk-t">' + esc(d.t) + '</span><span class="pk-m">' + esc(d.store) + ' · <b>' + rs(d.p) + '</b>' + (d.pct ? ' · <span class="d-pct">' + d.pct + '% off</span>' : '') + ' · <span class="pk-id">#' + d.id + '</span></span></span><button type="button" class="btn btn-outline btn-sm" data-dchange>Change</button>';
      var er = $('.err', dsel.closest('.fld')); if (er && d) er.hidden = true;
    }
    var dOpt = { filter: function (d) { return d.status === 'live'; }, title: 'Choose a deal for the poster', onPick: function (d) { setDeal(d.id); var c = $('[data-dchange]'); if (c) c.focus(); } };
    picker(dq, dlist, dOpt);
    $('[data-dbrowse]').addEventListener('click', function () { dlist.hidden = true; chooser({ q: dq.value, filter: dOpt.filter, title: dOpt.title, opener: $('[data-dbrowse]'), selected: D.elements.deal.value ? [D.elements.deal.value] : [], onUse: function (ds) { dOpt.onPick(ds[0]); } }); });
    dsel.addEventListener('click', function (e) { if (e.target.closest('[data-dchange]')) { setDeal(''); dq.focus(); } });
    document.addEventListener('click', function (e) { if (!e.target.closest('[data-dpick]') && !e.target.closest('[data-dchange]')) dlist.hidden = true; });
    function setKind(k) { $$('[name="kind"]', D).forEach(function (r) { r.checked = r.value === k; }); $$('[data-kind]', D).forEach(function (x) { x.hidden = x.dataset.kind !== k; }); }
    $$('[name="kind"]', D).forEach(function (r) { r.addEventListener('change', function () { setKind(r.value); }); });
    $('[data-poster-new]').addEventListener('click', function () { openEdit(null); });
    D.addEventListener('input', function (e) { var f = e.target.closest('.fld'), er = f && $('.err', f); if (er) er.hidden = true; });
    $('[data-pe-save]').addEventListener('click', function () {
      var f = D.elements, bad = [];
      function chk(ok, node) { var e = $('.err', node.closest('.fld')); if (e) e.hidden = ok; if (!ok) bad.push(node); }
      var kind = $('[name="kind"]:checked', D).value, dl = null;
      if (kind === 'deal') { dl = window.ADM_POSTER_DEALS.filter(function (x) { return x.id === f.deal.value; })[0]; if (!dl && f.deal.value) { var dd = dealById(f.deal.value); if (dd) dl = { id: dd.id, t: dd.t, img: dd.img, store: dd.store }; } chk(!!dl, f.deal); }
      else { chk(!!imgs.d, $('[data-drop="d"]')); chk(!!f.title.value.trim(), f.title); chk(!!f.link.value.trim(), f.link); }
      endMsg(f); chk(!!f.start.value && !!f.end.value && f.end.value >= f.start.value, f.end);
      if (bad.length) { (bad[0] === f.deal ? dq : bad[0].matches('label') ? $('input', bad[0]) : bad[0]).focus(); return; }
      var u = snap(), o = kind === 'deal' ? { kind: 'deal', deal: dl.id, title: dl.t, img: dl.img, store: dl.store, link: 'Deal page', start: f.start.value, end: f.end.value, on: f.on.checked, href: null }
        : { kind: 'custom', title: f.title.value.trim(), link: f.link.value.trim(), store: f.store.value, start: f.start.value, end: f.end.value, on: f.on.checked, img: imgs.d, href: null, ends: null };
      if (editing) Object.assign(editing, o); else { o.id = Date.now(); list.unshift(o); }
      closeSheet(); tab = status(o) === 'ended' ? 'past' : 'cur'; $$('[data-ptab]').forEach(function (x) { x.dataset.state = x.dataset.ptab === tab ? 'active' : ''; x.setAttribute('aria-selected', x.dataset.ptab === tab); });
      render(); toast(editing ? 'Poster saved' : 'Poster added' + (status(o) === 'scheduled' ? '. It shows from ' + fmt(o.start) : status(o) === 'live' ? ' and live on Home' : ''), { action: 'Undo', onAction: u });
    });
    render();
  })();


  /* =================== Sponsored (DEV-030, D-108) =================== */
  if ($('[data-sp-list]')) (function () {
    var list = window.ADM_SPONSORED.slice(), T = window.ADM_TODAY, tab = 'cur', editing = null, imgs = {};
    function status(p) { return !p.on ? 'off' : p.end < T ? 'ended' : p.start > T ? 'scheduled' : 'live'; }
    var SL = { live: 'Live', scheduled: 'Scheduled', ended: 'Ended', off: 'Off' }, PL = { live: 'live', scheduled: 'scheduled', ended: 'withdrawn', off: 'withdrawn' };
    function fmt(d) { return new Date(d + 'T00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }); }
    function n(x) { return (x || 0).toLocaleString('en-IN'); }
    function ctr(p) { return p.views ? (100 * p.clicks / p.views).toFixed(1) + '%' : '–'; }
    function snap() { var s = JSON.stringify(list); return function () { list = JSON.parse(s); render(); }; }
    function render() {
      var cur = list.filter(function (p) { return status(p) !== 'ended'; }), past = list.filter(function (p) { return status(p) === 'ended'; }), show = tab === 'cur' ? cur : past;
      if (window.ADM_PG) ADM_PG.saveList('sponsored', list, ['img', 'mimg']);   // S25 playground
      $('[data-scount="cur"]').textContent = cur.length; $('[data-scount="past"]').textContent = past.length;
      var live = list.filter(function (p) { return status(p) === 'live'; }), v = 0, c = 0; list.forEach(function (p) { v += p.views || 0; c += p.clicks || 0; });
      $('[data-sp-stats]').innerHTML = '<div><span>Live now</span><b>' + live.length + '</b></div><div><span>Views, all ads</span><b>' + n(v) + '</b></div><div><span>Clicks, all ads</span><b>' + n(c) + '</b></div><div><span>Click rate</span><b>' + (v ? (100 * c / v).toFixed(1) + '%' : '–') + '</b></div>';
      $('[data-sp-list]').innerHTML = show.length ? show.map(function (p) {
        var st = status(p);
        return '<li class="poster-row" data-sid="' + p.id + '"><img class="p-img sp-thumb" src="' + p.img + '" alt="">' +
          '<div class="p-main"><b>' + esc(p.title) + '</b><span>' + esc(p.adv) + ' · ' + fmt(p.start) + ' – ' + fmt(p.end) + '</span></div>' +
          '<div class="sp-nums"><span><b>' + n(p.views) + '</b> views</span><span><b>' + n(p.clicks) + '</b> clicks</span><span><b>' + ctr(p) + '</b> rate</span></div>' +
          '<span class="pill pill-' + PL[st] + '">' + SL[st] + '</span>' +
          (st !== 'ended' ? '<label class="switch" title="Show on Home"><input type="checkbox" data-s-on' + (p.on ? ' checked' : '') + ' aria-label="Show ' + esc(p.title) + ' on Home"><span></span></label>' : '') +
          '<div class="p-acts"><button type="button" class="btn btn-ghost btn-sm" data-s-copy title="Copy a short report for the advertiser">Report</button><button type="button" class="btn btn-ghost btn-sm" data-s-edit>Edit</button><button type="button" class="btn btn-ghost btn-icon btn-sm danger" data-s-del aria-label="Delete ad"><i data-lucide="trash-2"></i></button></div></li>';
      }).join('') : '<li class="empty">' + (tab === 'cur' ? 'No sponsored ads live or coming up. Home shows no ad card.' : 'No ended ads.') + '</li>';
      icons();
    }
    $$('[data-stab]').forEach(function (t) { t.addEventListener('click', function () { tab = t.dataset.stab; $$('[data-stab]').forEach(function (x) { x.dataset.state = x === t ? 'active' : ''; x.setAttribute('aria-selected', x === t); }); render(); }); });
    function byId(id) { return list.filter(function (p) { return p.id === id; })[0]; }
    $('[data-sp-list]').addEventListener('click', function (e) {
      var row = e.target.closest('[data-sid]'); if (!row) return; var p = byId(+row.dataset.sid);
      if (e.target.closest('[data-s-edit]')) { openEdit(p); return; }
      if (e.target.closest('[data-s-copy]')) {
        var txt = p.adv + ' on OfferTag, ' + fmt(p.start) + ' – ' + fmt(p.end) + ': ' + n(p.views) + ' views, ' + n(p.clicks) + ' clicks (' + ctr(p) + ').';
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast('Report copied'); }, function () { toast(txt); }); return;
      }
      if (e.target.closest('[data-s-del]')) { confirmBox('Delete this ad?', '“' + p.title + '” is removed from Home and from this list. Its view and click counts go too.', 'Delete ad', function () { var u = snap(); list.splice(list.indexOf(p), 1); render(); toast('Ad deleted', { action: 'Undo', onAction: u }); }, true); }
    });
    $('[data-sp-list]').addEventListener('change', function (e) { var c = e.target.closest('[data-s-on]'); if (!c) return; var p = byId(+c.closest('[data-sid]').dataset.sid), u = snap(); p.on = c.checked; render(); toast(p.on ? 'Ad is on' : 'Ad is off. It stays here but Home won’t show it', { action: 'Undo', onAction: u }); });
    var D = $('[data-se]'), sheet = $('#sp-edit');
    function setDrop(k, url) { var z = $('[data-drop="' + k + '"]', D), i = $('img', z); imgs[k] = url || ''; i.src = url || ''; i.hidden = !url; z.classList.toggle('has', !!url); }
    $$('[data-drop]', D).forEach(function (z) { $('input', z).addEventListener('change', function (e) { readImg(e.target.files[0], function (u0) { (window.OTDB ? OTDB.shrink : function (x, cb) { cb(x); })(u0, function (u) { setDrop(z.dataset.drop, u); var er = $('.err', z.closest('.fld')); if (er) er.hidden = true; }, 1200); }); }); });
    function openEdit(p) {
      editing = p || null; $('#se-title').textContent = p ? 'Edit sponsored ad' : 'Add sponsored ad'; D.reset(); $$('.err', D).forEach(function (x) { x.hidden = true; });
      setDrop('d', p ? p.img : ''); setDrop('m', p && p.mimg ? p.mimg : '');
      if (p) { ['adv', 'title', 'line', 'cta', 'link', 'start', 'end'].forEach(function (k) { D.elements[k].value = p[k] || ''; }); D.elements.on.checked = p.on; }
      else { D.elements.start.value = T; D.elements.end.value = ''; }
      openSheet(sheet);
    }
    $('[data-sp-new]').addEventListener('click', function () { openEdit(null); });
    D.addEventListener('input', function (e) { var f = e.target.closest('.fld'), er = f && $('.err', f); if (er) er.hidden = true; });
    $('[data-se-save]').addEventListener('click', function () {
      var f = D.elements, bad = [];
      function chk(ok, node) { var e = $('.err', node.closest('.fld')); if (e) e.hidden = ok; if (!ok) bad.push(node); }
      chk(!!f.adv.value.trim(), f.adv); chk(!!imgs.d, $('[data-drop="d"]', D)); chk(!!f.title.value.trim(), f.title); chk(!!f.cta.value.trim(), f.cta);
      chk(/^https?:\/\/\S+\.\S+/.test(f.link.value.trim()), f.link); endMsg(f); chk(!!f.start.value && !!f.end.value && f.end.value >= f.start.value, f.end);
      if (bad.length) { (bad[0].matches('label') ? $('input', bad[0]) : bad[0]).focus(); return; }
      var u = snap(), o = { adv: f.adv.value.trim(), title: f.title.value.trim(), line: f.line.value.trim(), cta: f.cta.value.trim(), link: f.link.value.trim(), start: f.start.value, end: f.end.value, on: f.on.checked, img: imgs.d, mimg: imgs.m };
      if (editing) Object.assign(editing, o); else { o.id = Date.now(); o.views = 0; o.clicks = 0; list.unshift(o); }
      closeSheet(); tab = status(o) === 'ended' ? 'past' : 'cur'; $$('[data-stab]').forEach(function (x) { x.dataset.state = x.dataset.stab === tab ? 'active' : ''; x.setAttribute('aria-selected', x.dataset.stab === tab); });
      render(); toast(editing ? 'Ad saved' : 'Ad added' + (status(o) === 'scheduled' ? '. It shows from ' + fmt(o.start) : status(o) === 'live' ? ' and live on Home' : ''), { action: 'Undo', onAction: u });
    });
    render();
  })();

  /* phone pass (screen 35): two-pane previews start folded on phones (admin-pinned-blog §4) */
  if (matchMedia('(max-width: 899px)').matches) $$('[data-fold-phone]').forEach(function (d) { d.open = false; });

  /* shared helpers for admin-c.js (batch C pages) */
  window.ADM = { chooser: chooser, routes: ROUTES, $: $, $$: $$, icons: icons, store: store, params: params, rs: rs, INR: INR, esc: esc, withRole: withRole, toast: toast, copy: copy, openSheet: openSheet, closeSheet: closeSheet, confirmBox: confirmBox, setCount: setCount, SUB: SUB };

  icons();
})();
