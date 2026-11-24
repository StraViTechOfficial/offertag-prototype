/* admin-c.js — OfferTag admin prototype, batch C (S16): Social sharing, Affiliate tags, Inbox, Site & app, Users, Catalogue.
   Loads after admin.js and uses its helpers (window.ADM). Data sheet: design-system/ia/data-sheets/admin-batch-c.md */
(function () {
  var A = window.ADM; if (!A) return;
  var $ = A.$, $$ = A.$$, esc = A.esc, toast = A.toast, INR = A.INR;
  function J(k, d) { try { return JSON.parse(A.store.get(k)) || d; } catch (e) { return d; } }
  function flash(el) { if (!el) return; el.classList.remove('is-new'); void el.offsetWidth; el.classList.add('is-new'); }

  /* ---------- tabs with ?tab= in the address and the sidebar kept in step ---------- */
  function tabbed(attr, initial, onSwitch) {
    var btns = $$('[' + attr + ']'); if (!btns.length) return null;
    var keys = btns.map(function (b) { return b.getAttribute(attr); });
    var TR = window.ADM_TABS || null;  // D-105: each tab has its own address
    function set(k, write) {
      btns.forEach(function (b) { var on = b.getAttribute(attr) === k; b.dataset.state = on ? 'active' : ''; b.setAttribute('aria-selected', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
      if (write) { try { if (TR && TR[k]) history.replaceState(null, '', A.withRole(TR[k])); else { var u = new URL(location.href); u.searchParams.set('tab', k); history.replaceState(null, '', u); } } catch (e) {} }
      onSwitch(k);
    }
    btns.forEach(function (b, i) {
      b.addEventListener('click', function () { set(keys[i], true); });
      b.addEventListener('keydown', function (e) { var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return; e.preventDefault(); var n = btns[(i + d + btns.length) % btns.length]; n.focus(); n.click(); });
    });
    var q = A.params.get('tab'); set(keys.indexOf(q) > -1 ? q : initial, false);
    return set;
  }

  /* ---------- save bar for settings-style forms (dirty → Save / Discard) ---------- */
  function formState(form) { return $$('input, select, textarea', form).map(function (i) { return i.type === 'checkbox' ? i.checked : i.value; }).join('\u0001'); }
  function dirtyForm(form, onReset) {
    var bar = $('[data-savebar]', form), base = formState(form);
    function check() { bar.hidden = formState(form) === base; }
    form.addEventListener('input', check); form.addEventListener('change', check);
    $('[data-discard]', form).addEventListener('click', function () { form.reset(); onReset && onReset(); $$('.err', form).forEach(function (e) { e.hidden = true; }); $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); }); check(); toast('Changes discarded', { icon: 'undo-2' }); });
    window.addEventListener('beforeunload', function (e) { if (!bar.hidden) { e.preventDefault(); e.returnValue = ''; } });
    return { saved: function () { $$('input, textarea', form).forEach(function (i) { if (i.type === 'checkbox') i.defaultChecked = i.checked; else i.defaultValue = i.value; }); base = formState(form); check(); } };
  }
  function fieldErr(input, msg) { var e = $('.err', input.closest('.fld')); if (msg) { input.setAttribute('aria-invalid', 'true'); if (e) { e.textContent = msg; e.hidden = false; } } else { input.removeAttribute('aria-invalid'); if (e) e.hidden = true; } return !msg; }

  var TAGS = J('adm-tags', null);  // saved on the Affiliate tags page (this browser only)
  function tagFor(k) { var t = TAGS && TAGS[k] && TAGS[k].amz; if (t) return t; return { fb: 'offertagfb-21' }[k] || ''; }

  /* =================== Social sharing =================== */
  if (window.ADM_SOCIAL) (function () {
    var S = window.ADM_SOCIAL, pending = A.params.get('approval') === 'pending';
    var NAMES = { fb: 'Facebook Page', pin: 'Pinterest', th: 'Threads' }, LIMIT = { pin: 500, th: 500 };
    var st = {}; S.channels.forEach(function (c) { st[c.k] = { on: c.state === 'on', note: c.note }; });
    var panels = $$('[data-spanel]');
    tabbed('data-stab', 'channels', function (k) { panels.forEach(function (p) { p.hidden = p.dataset.spanel !== k; }); });

    function renderCh() {
      $$('[data-ch]').forEach(function (li) {
        var k = li.dataset.ch, s = st[k]; li.dataset.state = pending ? 'wait' : s.on ? 'on' : 'off';
        $('[data-ch-status]', li).innerHTML = pending ? '<span class="pill pill-pending">Awaiting platform approval</span>'
          : s.on ? '<span class="pill pill-live">Connected</span>' + (s.note ? '<small>' + esc(s.note) + '</small>' : '') : '<span class="pill">Not connected</span>';
        $('[data-ch-acts]', li).innerHTML = pending ? '<button class="btn btn-outline btn-sm" type="button" disabled>Connect</button>'
          : s.on ? (k === 'fb' ? '<button class="btn btn-outline btn-sm" type="button" data-reconnect>Reconnect</button>' : '') + '<button class="btn btn-ghost btn-sm" type="button" data-disconnect>Disconnect</button>'
          : '<button class="btn btn-default btn-sm" type="button" data-connect>Connect</button>';
        var sel = $('select', li); if (sel) sel.disabled = pending || !s.on;
      });
      if (window.OTDB) OTDB.set('social', { channels: S.channels.map(function (c) { return Object.assign({}, c, { state: st[c.k].on ? 'on' : 'off', note: st[c.k].note }); }), hist: S.hist });   // S25 playground
      var n = $('[data-approval-note]'); if (n) n.classList.toggle('is-warn', pending);
    }
    $('[data-chs]').addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return; var li = b.closest('[data-ch]'), k = li.dataset.ch, s = st[k];
      if (b.matches('[data-connect]')) { s.on = true; s.note = k === 'fb' ? 'expires in 60 days' : ''; renderCh(); toast(NAMES[k] + ' connected. Deals can be shared there now.'); }
      else if (b.matches('[data-reconnect]')) { s.note = 'expires in 60 days'; renderCh(); toast('Facebook Page reconnected for 60 days'); }
      else if (b.matches('[data-disconnect]')) A.confirmBox('Disconnect ' + NAMES[k] + '?', 'Deals stop sharing there until you connect again. Posts already shared stay up.', 'Disconnect', function () {
        var was = { on: s.on, note: s.note }; s.on = false; s.note = ''; renderCh();
        toast(NAMES[k] + ' disconnected', { icon: 'unplug', action: 'Undo', onAction: function () { s.on = was.on; s.note = was.note; renderCh(); } });
      }, true);
    });
    var board = $('[data-pin-board]'); if (board) board.addEventListener('change', function () { toast('Pins now go to the “' + board.value + '” board'); });
    renderCh();

    /* formats */
    var saved = J('adm-fmt', {}), pv = S.pv, cur = 'fb';
    function fill(tpl) {
      var map = { title: pv.title, price: INR.format(pv.price), mrp: INR.format(pv.mrp || pv.price), pct: pv.pct, store: pv.store, coupon_line: pv.coupon ? 'Code: ' + pv.coupon.toUpperCase() : '', short_link: pv.short };
      var out = tpl.replace(/\{(\w+)\}/g, function (m, k) { return k in map ? map[k] : m; });
      return out.split('\n').filter(function (l, i, a) { return l.trim() !== '' || (i > 0 && i < a.length - 1 && a[i - 1].trim() !== ''); }).join('\n').trim();
    }
    function card(k) { return $('[data-fmt="' + k + '"]'); }
    function showPv(k) {
      cur = k; var c = card(k), t = fill($('[data-fmt-text]', c).value), img = $('[data-fmt-img]', c).checked;
      $('[data-pv-name]').textContent = NAMES[k]; $('[data-spv-img]').hidden = !img; $('[data-spv-text]').innerHTML = esc(t).replace(/\n/g, '<br>');
      var tag = tagFor(k) || (tagFor('web') || 'offertag-21') + ' (website tag)';
      $('[data-spv-meta]').innerHTML = 'Link carries tag <b>' + esc(tag) + '</b>' + (LIMIT[k] ? ' · <span class="' + (t.length > LIMIT[k] ? 'over' : '') + '">' + t.length + '/' + LIMIT[k] + ' characters</span>' : '');
    }
    $$('[data-fmt]').forEach(function (c) {
      var k = c.dataset.fmt, ta = $('[data-fmt-text]', c), im = $('[data-fmt-img]', c), save = $('[data-fmt-save]', c), dirty = $('[data-fmt-dirty]', c);
      var base = saved[k] || { text: S.defaults[k], img: true };
      ta.value = base.text; im.checked = base.img;
      var tagEl = $('[data-fmt-tag="' + k + '"]', c); tagEl.textContent = tagFor(k) || 'none yet, uses the website tag';
      function upd() { var d = ta.value !== base.text || im.checked !== base.img; save.disabled = !d; dirty.hidden = !d; if (ta.value.indexOf('{short_link}') > -1) fieldErr(ta, ''); showPv(k); }
      ta.addEventListener('input', upd); im.addEventListener('change', upd); ta.addEventListener('focus', function () { showPv(k); });
      c.addEventListener('toggle', function () { if (c.open) showPv(k); });
      $$('[data-ins]', c).forEach(function (b) { b.addEventListener('click', function () { var s = ta.selectionStart || ta.value.length, e2 = ta.selectionEnd || s; ta.value = ta.value.slice(0, s) + b.dataset.ins + ta.value.slice(e2); ta.focus(); ta.selectionStart = ta.selectionEnd = s + b.dataset.ins.length; upd(); }); });
      save.addEventListener('click', function () {
        if (ta.value.indexOf('{short_link}') < 0) { fieldErr(ta, 'Keep {short_link} so the post links back to the deal.'); ta.focus(); return; }
        var t = fill(ta.value); if (LIMIT[k] && t.length > LIMIT[k]) { fieldErr(ta, NAMES[k] + ' allows ' + LIMIT[k] + ' characters. This one has ' + t.length + ' with the sample deal.'); ta.focus(); return; }
        var prev = base; base = { text: ta.value, img: im.checked }; saved[k] = base; A.store.set('adm-fmt', JSON.stringify(saved)); upd();
        toast(NAMES[k] + ' format saved. The next share uses it.', { action: 'Undo', onAction: function () { base = prev; saved[k] = prev; A.store.set('adm-fmt', JSON.stringify(saved)); ta.value = prev.text; im.checked = prev.img; upd(); } });
      });
      $('[data-fmt-reset]', c).addEventListener('click', function () { ta.value = S.defaults[k]; im.checked = true; upd(); toast('Default text restored. Save to keep it.', { icon: 'rotate-ccw' }); });
    });
    showPv('fb');
    if (matchMedia('(max-width: 899px)').matches) $('[data-fmt-pvwrap]').open = false;  // phone: preview folded (admin-pinned-blog §4)

    /* history */
    var H = S.hist, fch = $('[data-hf="ch"]'), fres = $('[data-hf="res"]');
    function renderH() {
      var rows = H.filter(function (h) { return (!fch.value || h.ch === fch.value) && (!fres.value || (fres.value === 'ok') === (h.res === 'ok')); });
      $('[data-hist]').innerHTML = rows.map(function (h) {
        var i = H.indexOf(h), ok = h.res === 'ok';
        return '<tr data-h="' + i + '"><td class="d-when" data-l="When">' + esc(h.when) + '</td><td class="c-title" data-l="Deal"><a href="' + h.page + '" target="_blank" rel="noopener">' + esc(h.t) + '</a></td><td data-l="Platform"><span class="ch-mark ch-' + h.ch + ' sm" aria-hidden="true">' + { fb: 'f', pin: 'P', th: '@' }[h.ch] + '</span>' + NAMES[h.ch] + '</td>'
          + '<td data-l="Result">' + (ok ? '<span class="res ok"><i data-lucide="check"></i>Posted</span>' : '<span class="res bad"><i data-lucide="x"></i>' + esc(h.res) + '</span> <button class="btn btn-outline btn-sm" type="button" data-retry>Retry</button>') + '</td><td data-l="By">' + esc(h.by) + '</td></tr>';
      }).join('');
      $('[data-hist-empty]').hidden = rows.length > 0; A.icons();
      if (window.OTDB) OTDB.set('social', { channels: S.channels.map(function (c) { return Object.assign({}, c, { state: st[c.k].on ? 'on' : 'off', note: st[c.k].note }); }), hist: H });
    }
    fch.addEventListener('change', renderH); fres.addEventListener('change', renderH);
    $('[data-hist]').addEventListener('click', function (e) {
      var b = e.target.closest('[data-retry]'); if (!b) return; var h = H[+b.closest('tr').dataset.h];
      if (!st[h.ch].on || pending) { toast(NAMES[h.ch] + ' is not connected. Connect it in Channels first.', { icon: 'info' }); return; }
      b.disabled = true; b.textContent = 'Retrying…';
      setTimeout(function () { h.res = 'ok'; h.when = 'now'; renderH(); flash($('[data-h="' + H.indexOf(h) + '"]')); toast('Posted to ' + NAMES[h.ch]); }, 700);
    });
    renderH();
  })();

  /* =================== Affiliate tags =================== */
  var tf = $('[data-tags]');
  if (tf) (function () {
    if (TAGS) $$('[data-tag-row]', tf).forEach(function (r) { var v = TAGS[r.dataset.tagRow]; if (!v) return; var a = $('[data-tag="amz"]', r), f = $('[data-tag="fk"]', r); a.value = a.defaultValue = v.amz; f.value = f.defaultValue = v.fk; });
    var d = dirtyForm(tf);
    function valid(a) { var v = a.value.trim(); if (!v) return fieldErr(a, a.hasAttribute('data-req') ? 'This link needs a tag.' : ''); return fieldErr(a, /^[a-z0-9][a-z0-9-]*-21$/i.test(v) ? '' : 'Amazon tags in India end in “-21”, e.g. offertag-21.'); }
    tf.addEventListener('input', function (e) { if (e.target.matches('[data-tag="amz"]') && e.target.getAttribute('aria-invalid')) valid(e.target); });
    tf.addEventListener('submit', function (e) {
      e.preventDefault(); var bad = $$('[data-tag="amz"]', tf).filter(function (a) { return !valid(a); });
      if (bad.length) { bad[0].focus(); return; }
      var out = {}; $$('[data-tag-row]', tf).forEach(function (r) { out[r.dataset.tagRow] = { amz: $('[data-tag="amz"]', r).value.trim(), fk: $('[data-tag="fk"]', r).value.trim() }; });
      A.store.set('adm-tags', JSON.stringify(out)); d.saved();
      toast('Tags saved. New links and shares use them; links already shared keep their old tag.');
    });
  })();

  /* =================== Inbox =================== */
  if (window.ADM_INBOX) (function () {
    var D = window.ADM_INBOX, tab = 'feedback', only = $('[data-unhandled]'), list = $('[data-ibx]');
    var KIND = { Issue: 'k-issue', Suggestion: 'k-sugg', Appreciation: 'k-thanks' };
    // D-153 (plan.md B5): comments from the deal pages, seed + what people post in this browser. Kept apart from D: they need no "handled" step.
    var DAYMS = 864e5;
    function comments() {
      if (!window.OTDB) return [];
      return OTDB.comments().map(function (c) { var d = OTDB.deal(c.deal); return Object.assign({}, c, { dealT: d ? d.t : 'Deal removed', dealPage: d ? d.page : '' }); })
        .sort(function (a, b) { return b.at - a.at; });
    }
    function counts() { var tot = 0; Object.keys(D).forEach(function (k) { var n = D[k].filter(function (x) { return !x.done; }).length; tot += n; var c = $('[data-tcount="' + k + '"]'); if (c) { c.textContent = n; c.toggleAttribute('data-zero', !n); } }); A.setCount('inbox', tot); var cc = $('[data-tcount="comments"]'), nc = comments().filter(function (c) { return Date.now() - c.at < DAYMS; }).length; if (cc) { cc.textContent = nc; cc.toggleAttribute('data-zero', !nc); } }
    function hsw(x) { return '<label class="hnd"><span class="switch"><input type="checkbox" role="switch" data-hnd' + (x.done ? ' checked' : '') + ' aria-label="Handled"><span></span></span>Handled</label>'; }
    function item(x) {
      var h = '<li class="ib' + (x.done ? ' is-done' : '') + '" data-id="' + x.id + '">';
      if (tab === 'comments') return '<li class="ib ib-cm" data-cid="' + esc(String(x.id)) + '"><div class="ib-top"><b class="ib-name">' + esc(x.name || 'Member') + '</b>' + (x.admin ? '<span class="kind k-sugg">OfferTag</span>' : '') + '<span class="ib-who">' + (x.parent ? 'Reply · ' : '') + esc(x.when) + '</span></div><p class="ib-msg">' + esc(x.text) + '</p><div class="ib-acts">' + (x.dealPage ? '<a class="btn btn-outline btn-sm" href="' + x.dealPage + '#comments" target="_blank" rel="noopener"><i data-lucide="external-link"></i>' + esc(x.dealT.length > 48 ? x.dealT.slice(0, 47) + '…' : x.dealT) + '</a>' : '<span class="pill">' + esc(x.dealT) + '</span>') + '<button class="btn btn-ghost btn-sm danger" type="button" data-cdel><i data-lucide="trash-2"></i>Delete</button></div></li>';
      if (tab === 'feedback') h += '<div class="ib-top"><span class="kind ' + KIND[x.kind] + '">' + x.kind + '</span><span class="ib-who">' + esc(x.who) + ' · ' + esc(x.when) + '</span></div><p class="ib-msg">' + esc(x.msg) + '</p><div class="ib-acts">' + hsw(x) + '</div>';
      else if (tab === 'reports') h += '<div class="ib-top"><span class="kind k-rep">' + esc(x.reason) + '</span><span class="ib-who">' + esc(x.who) + ' · ' + esc(x.when) + '</span></div><p class="ib-msg"><a href="' + x.page + '" target="_blank" rel="noopener">' + esc(x.deal) + ' <i data-lucide="arrow-up-right"></i></a>' + (x.note ? '<q>' + esc(x.note) + '</q>' : '') + '</p><div class="ib-acts"><a class="btn btn-outline btn-sm" href="' + A.withRole('admin-post.html?id=' + x.did) + '"><i data-lucide="pencil"></i>Edit deal</a>' + hsw(x) + '</div>';
      else h += '<div class="ib-top"><b class="ib-name">' + esc(x.name) + '</b><span class="ib-who">' + esc(x.email) + ' · ' + esc(x.phone) + ' · ' + esc(x.when) + '</span></div><p class="ib-msg">“' + esc(x.reason || 'No reason given') + '”</p><div class="ib-acts">'
        + (x.done ? '<span class="pill' + (x.result && x.result.indexOf('Deleted') === 0 ? ' pill-live' : '') + '">' + esc(x.result || 'Handled') + '</span><button class="btn btn-ghost btn-sm" type="button" data-reopen>Reopen</button>'
          : '<button class="btn btn-default btn-sm" type="button" data-mark-del>Mark deleted</button><button class="btn btn-ghost btn-sm" type="button" data-dismiss>Dismiss</button>') + '</div>';
      return h + '</li>';
    }
    function render() {
      var cm = tab === 'comments', ol = only.closest('label'); if (ol) ol.hidden = cm;
      var notes = document.querySelectorAll('[data-ibx-note]');
      for (var i = 0; i < notes.length; i++) notes[i].hidden = notes[i].getAttribute('data-ibx-note') !== tab;
      if (cm) { var all = comments(), who = (A.params.get('q') || '').trim().toLowerCase(); if (who) all = all.filter(function (c) { return (c.name || '').toLowerCase().indexOf(who) === 0; }); list.innerHTML = (who ? '<li class="ib-filter">Comments by <b>' + esc(A.params.get('q')) + '</b> · <a href="' + A.withRole('/admin/comments') + '">Show all comments</a></li>' : '') + all.map(item).join(''); var e0 = $('[data-ibx-empty]'); e0.hidden = all.length > 0; e0.textContent = 'No comments yet.'; counts(); A.icons(); return; }
      var rows = D[tab].filter(function (x) { return !only.checked || !x.done; });
      list.innerHTML = rows.map(item).join(''); var em = $('[data-ibx-empty]');
      em.hidden = rows.length > 0; em.textContent = only.checked && D[tab].length ? 'All caught up. Untick “Unhandled only” to see handled ones.' : 'Nothing here yet.';
      counts(); A.icons();
      if (window.ADM_PG) ADM_PG.saveInbox(D);   // S25 playground
    }
    function byId(id) { return D[tab].filter(function (x) { return x.id === +id; })[0]; }
    function setDone(x, done, result, msg) {
      var was = { done: x.done, result: x.result }, li = $('[data-id="' + x.id + '"]', list);
      x.done = done; x.result = result;
      if (li && only.checked && done) { li.classList.add('is-out'); setTimeout(render, 200); } else render();
      toast(msg, { action: 'Undo', onAction: function () { x.done = was.done; x.result = was.result; render(); } });
    }
    tabbed('data-itab', 'feedback', function (k) { tab = k; render(); });
    only.addEventListener('change', render);
    list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cdel]'); if (!b || !window.OTDB) return;
      var li = b.closest('[data-cid]'), id = li.dataset.cid; OTDB.deleteComment(id); li.classList.add('is-out'); setTimeout(render, 200);
      toast('Comment deleted from the deal page', { action: 'Undo', onAction: function () { OTDB.restoreComment(id); render(); } });
    });
    if (window.OTDB && OTDB.on) OTDB.on(function (w) { if (tab === 'comments' && (w === 'comments' || w === 'external')) render(); });
    list.addEventListener('change', function (e) { if (!e.target.matches('[data-hnd]')) return; var x = byId(e.target.closest('[data-id]').dataset.id); setDone(x, e.target.checked, null, e.target.checked ? 'Marked handled' : 'Moved back to unhandled'); });
    list.addEventListener('click', function (e) {
      var b = e.target.closest('button'), row = b && b.closest('[data-id]'); if (!row) return; var x = byId(row.dataset.id);   // D-153: comment rows (data-cid) have their own handler
      var day = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      if (b.matches('[data-mark-del]')) A.confirmBox('Record ' + x.name + '’s account as deleted?', 'Do this after the account is removed on the server. This button records it; it does not delete anything.', 'Record as deleted', function () { setDone(x, true, 'Deleted ' + day, 'Recorded as deleted'); });
      else if (b.matches('[data-dismiss]')) setDone(x, true, 'Dismissed ' + day, 'Request dismissed');
      else if (b.matches('[data-reopen]')) setDone(x, false, null, 'Request reopened');
    });
  })();

  /* =================== Site & app =================== */
  var sf = $('[data-site]');
  if (sf) (function () {
    var d = dirtyForm(sf), E = sf.elements;
    function check(i) {
      var v = i.value.trim();
      if (i.type === 'email') return fieldErr(i, !v ? 'Add a support email.' : /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) ? '' : 'Check the email address.');
      if (v && !/^https:\/\/[^\s.]+\.[^\s]+$/i.test(v)) return fieldErr(i, 'Use a full link starting with https://');
      if ((i.name === 'wa' || i.name === 'tg') && E.strip.checked && !E.wa.value.trim() && !E.tg.value.trim()) return fieldErr(i, 'The join button needs a WhatsApp or Telegram link.');
      if (i.name === 'play' && !v) return fieldErr(i, 'The app links need the Play Store address.');
      return fieldErr(i, '');
    }
    sf.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) check(e.target); });
    sf.addEventListener('submit', function (e) {
      e.preventDefault(); var bad = $$('input[type="url"], input[type="email"]', sf).filter(function (i) { return !check(i); });
      if (bad.length) { bad[0].focus(); bad[0].scrollIntoView({ block: 'center' }); return; }
      if (window.ADM_PG) ADM_PG.saveSite(sf);   // S25 playground
      d.saved(); toast('Settings saved. The website shows them now; the app picks them up the next time it opens.');
    });
  })();

  /* =================== Users =================== */
  if (window.ADM_USERS) (function () {
    var U = window.ADM_USERS, q = $('[data-uq]'), role = $('[data-urole]'), body = $('[data-urows]'), sheet = $('#user-edit'), cur = null;
    function staff(u) { return u.role !== 'Member'; }
    function render() {
      var s = q.value.trim().toLowerCase(), rows = U.filter(function (u) { return staff(u) && (!role.value || u.role === role.value) && (!s || (u.name + ' ' + u.email).toLowerCase().indexOf(s) > -1); });
      body.innerHTML = rows.map(function (u) {
        var tag = staff(u) ? (u.tag ? '<span class="mono">' + esc(u.tag) + '</span>' : '<span class="d-none">website tag</span>') + ' <button class="btn btn-ghost btn-icon btn-sm" type="button" data-uedit aria-label="Edit Amazon tag for ' + esc(u.name) + '"><i data-lucide="pencil"></i></button>' : '<span class="d-none">—</span>';
        return '<tr data-u="' + u.id + '"><td class="c-title" data-l="Name"><button class="btn-link u-name" type="button" data-uedit>' + esc(u.name) + '</button></td><td data-l="Email">' + esc(u.email) + '</td>'
          + '<td data-l="Role"><span class="role r-' + u.role.toLowerCase().replace(/[^a-z]/g, '') + '">' + u.role + '</span></td><td class="d-when" data-l="Joined">' + u.joined + '</td><td data-l="Amazon tag">' + tag + '</td></tr>';
      }).join('');
      $('[data-uempty]').hidden = rows.length > 0; $('[data-ucount]').textContent = rows.length + ' of ' + U.filter(staff).length; A.icons();
      if (window.OTDB) OTDB.set('users', U);   // S25 playground
    }
    q.addEventListener('input', render); role.addEventListener('change', render);
    $('[data-uclear]').addEventListener('click', function () { q.value = ''; role.value = ''; render(); q.focus(); });
    var f = $('[data-ue]'), inp = f.elements.tag;
    body.addEventListener('click', function (e) {
      if (!e.target.closest('[data-uedit]')) return; cur = U.filter(function (u) { return u.id === +e.target.closest('tr').dataset.u; })[0];
      $('#ue-title').textContent = cur.name; $('[data-ue-sub]').textContent = cur.role + ' · joined ' + cur.joined;
      $('[data-ue-kv]').innerHTML = [['Email', cur.email], ['Phone', cur.phone || '—'], ['Role', cur.role + ' <small>roles are set by the developer</small>']].map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + (r[0] === 'Role' ? r[1] : esc(r[1])) + '</dd>'; }).join('');

      inp.value = cur.tag; fieldErr(inp, ''); A.openSheet(sheet);
    });
    inp.addEventListener('input', function () { if (inp.getAttribute('aria-invalid')) fieldErr(inp, !inp.value.trim() || /^[a-z0-9][a-z0-9-]*-21$/i.test(inp.value.trim()) ? '' : 'Amazon tags in India end in “-21”.'); });
    function save() {
      var v = inp.value.trim(); if (v && !fieldErr(inp, /^[a-z0-9][a-z0-9-]*-21$/i.test(v) ? '' : 'Amazon tags in India end in “-21”.')) { inp.focus(); return; }
      if (v && U.some(function (u) { return u !== cur && u.tag.toLowerCase() === v.toLowerCase(); })) { fieldErr(inp, 'Another person already uses this tag.'); inp.focus(); return; }
      var u = cur, prev = u.tag; u.tag = v; A.closeSheet(); render(); flash($('[data-u="' + u.id + '"]'));
      toast(v ? 'Amazon tag saved for ' + u.name : u.name + ' now uses the website tag', { action: 'Undo', onAction: function () { u.tag = prev; render(); } });
    }
    $('[data-ue-save]').addEventListener('click', save); f.addEventListener('submit', function (e) { e.preventDefault(); save(); });
    render();
  })();

  /* =================== Members (D-161) =================== */
  // Read-only list of everyone who signed up. Built like the live one: search + three filters + sort + pages,
  // never a full list. In the build every change here is one paged query (name/email/phone index, created_at).
  if (window.ADM_MEMBERS) (function () {
    var M = window.ADM_MEMBERS, T = new Date(window.ADM_MEMBERS_TODAY + 'T00:00'), q = $('[data-mq]'), jn = $('[data-mjoined]'), al = $('[data-malerts]'), so = $('[data-msort]'), per = $('[data-mper]'), body = $('[data-mrows]');
    var page = 1, timer = null, sheet = $('#member-view');
    var qs = A.params.get('q'); if (qs) q.value = qs;
    function days(m) { return Math.round((T - new Date(m.joined + 'T00:00')) / 864e5); }
    function joinedTxt(m) { var d = new Date(m.joined + 'T00:00'); return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); }
    function initials(n) { return n.split(' ').map(function (x) { return x[0]; }).join('').slice(0, 2).toUpperCase(); }
    function list() {
      var s = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean), j = jn.value, a = al.value;
      var r = M.filter(function (m) {
        var h = (m.name + ' ' + m.email + ' ' + m.phone).toLowerCase();
        if (s.length && !s.every(function (w) { return h.indexOf(w) > -1; })) return false;
        var d = days(m); if (j === 'old' ? d <= 365 : j && d > +j) return false;
        if (a && (a === 'on') !== m.alerts) return false;
        return true;
      });
      var k = so.value;
      r.sort(function (x, y) { return k === 'old' ? (x.joined < y.joined ? -1 : 1) : k === 'name' ? x.name.localeCompare(y.name) : k === 'com' ? (y.comments - x.comments) || (x.joined < y.joined ? 1 : -1) : (x.joined < y.joined ? 1 : -1); });
      return r;
    }
    function render() {
      var r = list(), n = +per.value, pages = Math.max(1, Math.ceil(r.length / n)); if (page > pages) page = pages;
      var st = (page - 1) * n, view = r.slice(st, st + n);
      body.innerHTML = view.map(function (m) {
        return '<tr data-m="' + m.id + '"><td class="c-title" data-l="Member"><button type="button" class="mb-who" data-mopen><span class="avatar sm">' + initials(m.name) + '</span><span><b>' + esc(m.name) + '</b><small>' + esc(m.email) + '</small></span></button>' + (m.deletion ? ' <span class="pill pill-pending" title="Asked to delete their account">Deletion asked</span>' : '') + '</td>' +
          '<td data-l="Phone"' + (m.phone ? '' : ' class="na"') + '>' + (m.phone ? esc(m.phone) : '<span class="d-none">—</span>') + '</td>' +
          '<td class="d-when" data-l="Joined">' + joinedTxt(m) + '</td>' +
          '<td data-l="Deal alerts">' + (m.alerts ? '<span class="ok-t"><i data-lucide="bell"></i>On</span>' : '<span class="d-none">Off</span>') + '</td>' +
          '<td class="num" data-l="Comments">' + (m.comments || '<span class="d-none">0</span>') + '</td>' +
          '<td class="c-act"><button class="btn btn-ghost btn-icon btn-sm" type="button" data-mopen aria-label="Open ' + esc(m.name) + '"><i data-lucide="chevron-right"></i></button></td></tr>';
      }).join('');
      $('[data-mempty]').hidden = r.length > 0; $('.mb-tbl').hidden = !r.length;
      var filtered = q.value.trim() || jn.value || al.value;
      $('[data-mcount]').textContent = r.length ? (st + 1) + '–' + (st + view.length) + ' of ' + r.length + (filtered ? ' matching' : '') + ' member' + (r.length === 1 ? '' : 's') + ' in this sample' : '0 members';
      var pg = '';
      if (pages > 1) {
        pg += '<button type="button" data-mpage="' + (page - 1) + '"' + (page === 1 ? ' disabled' : '') + ' aria-label="Previous page"><i data-lucide="chevron-left"></i></button>';
        for (var i = 1; i <= pages; i++) if (i === 1 || i === pages || Math.abs(i - page) <= 1) pg += '<button type="button" data-mpage="' + i + '"' + (i === page ? ' aria-current="page"' : '') + '>' + i + '</button>'; else if (Math.abs(i - page) === 2) pg += '<span class="pg-gap">…</span>';
        pg += '<button type="button" data-mpage="' + (page + 1) + '"' + (page === pages ? ' disabled' : '') + ' aria-label="Next page"><i data-lucide="chevron-right"></i></button>';
      }
      $('[data-mpager]').innerHTML = pg; A.icons();
    }
    function again() { page = 1; render(); }
    q.addEventListener('input', function () { clearTimeout(timer); timer = setTimeout(again, 150); });
    [jn, al, so, per].forEach(function (x) { x.addEventListener('change', again); });
    $('[data-mclear]').addEventListener('click', function () { q.value = ''; jn.value = ''; al.value = ''; again(); q.focus(); });
    $('[data-mpager]').addEventListener('click', function (e) { var b = e.target.closest('[data-mpage]'); if (!b || b.disabled) return; page = +b.dataset.mpage; render(); $('.mb-tools').scrollIntoView({ block: 'start', behavior: 'smooth' }); });
    body.addEventListener('click', function (e) {
      if (!e.target.closest('[data-mopen]')) return; var m = M.filter(function (x) { return x.id === +e.target.closest('tr').dataset.m; })[0];
      $('#mv-title').textContent = m.name; $('[data-mv-sub]').textContent = 'Member since ' + joinedTxt(m);
      $('[data-mv-kv]').innerHTML = [['Email', esc(m.email)], ['Phone', m.phone ? esc(m.phone) : '—'], ['Joined', joinedTxt(m)], ['Deal alerts', m.alerts ? 'On' : 'Off'], ['Comments', String(m.comments)], ['Signs in with', 'A code sent to their email']].map(function (r) { return '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>'; }).join('');
      $('[data-mv-more]').innerHTML = (m.comments ? '<a class="btn btn-outline btn-block" href="' + A.withRole('/admin/comments?q=' + encodeURIComponent(m.name.split(' ')[0])) + '"><i data-lucide="message-square"></i>See their comments in Inbox</a>' : '') +
        (m.deletion ? '<p class="hint-line"><i data-lucide="user-x"></i>This member asked to delete their account. <a href="' + A.withRole('/admin/deletion-requests') + '">Open the request</a></p>' : '');
      A.openSheet(sheet); A.icons();
    });
    render();
  })();

  /* =================== Catalogue =================== */
  if (window.ADM_CAT) (function () {
    var C = window.ADM_CAT, tab = 'shops', q = $('[data-cq]'), only = $('[data-conly]'), sheet = $('#cat-edit'), form = $('[data-ce]'), editing = null;
    var ONE = { shops: 'shop', categories: 'category', dealtypes: 'deal type', types: 'type' };
    var NOTE = {
      shops: 'Order sets where a shop shows in store lists and filters. A shop with deals can’t be deleted; switch it off to hide it.',
      categories: 'A category’s page address can’t be changed here, so old links keep working. Order sets the order of the category tiles.',
      dealtypes: 'Order sets the tab order on the site, after Home. Switching a type off hides its tab; its deals stay.',
      types: 'Types group the lookup lists the site is built on. Read-only.'
    };
    var COLS = {
      shops: ['Shop', 'Card label', 'Affiliate value', 'Order', 'Deals', 'Active', ''],
      categories: ['Category', 'Address', 'Order', 'Deals', 'Active', ''],
      dealtypes: ['Deal type', 'Rule line', 'Order', 'Deals in snapshot', 'Active', ''],
      types: ['Name', 'Alias', '']
    };
    function nf(n) { return INR.format(n); }
    function swc(x) { return '<label class="switch"><input type="checkbox" role="switch" data-con' + (x.on ? ' checked' : '') + ' aria-label="Active: ' + esc(x.name) + '"><span></span></label>'; }
    function ed(x) { return '<button class="btn btn-ghost btn-sm" type="button" data-cedit aria-label="Edit ' + esc(x.name) + '">Edit</button>'; }
    function row(x) {
      var r = '<tr data-c="' + x.id + '"' + (x.on === false ? ' class="is-off"' : '') + '>';
      if (tab === 'shops') r += '<td class="c-title" data-l="Shop"><span class="nm">' + (x.logo ? '<span class="lg"><img src="' + x.logo + '" alt=""></span>' : '<span class="lg ini">' + esc(x.name[0]) + '</span>') + '<b>' + esc(x.name) + '</b></span></td><td data-l="Card label">' + esc(x.label) + '</td><td data-l="Affiliate value">' + (x.aff ? '<span class="mono">' + esc(x.aff) + '</span>' : '<span class="d-none">—</span>') + '</td><td class="num" data-l="Order">' + x.order + '</td><td class="num" data-l="Deals">' + nf(x.n) + '</td><td data-l="Active">' + swc(x) + '</td><td class="c-act">' + ed(x) + '</td>';
      else if (tab === 'categories') r += '<td class="c-title" data-l="Category"><span class="nm">' + (x.img ? '<span class="lg ph"><img src="' + x.img + '" alt="" loading="lazy"></span>' : '<span class="lg ini">' + esc(x.name[0]) + '</span>') + '<b>' + esc(x.name) + '</b></span></td><td data-l="Address"><span class="mono d-none">/' + esc(x.slug) + '</span></td><td class="num" data-l="Order">' + x.order + '</td><td class="num" data-l="Deals">' + nf(x.n) + '</td><td data-l="Active">' + swc(x) + '</td><td class="c-act">' + ed(x) + '</td>';
      else if (tab === 'dealtypes') r += '<td class="c-title" data-l="Deal type"><b>' + esc(x.name) + '</b></td><td data-l="Rule line">' + esc(x.rule) + '</td><td class="num" data-l="Order">' + x.order + '</td><td class="num" data-l="Deals">' + nf(x.n) + '</td><td data-l="Active">' + swc(x) + '</td><td class="c-act">' + ed(x) + '</td>';
      else r += '<td class="c-title" data-l="Name"><b>' + esc(x.name) + '</b></td><td data-l="Alias"><span class="mono">' + esc(x.alias) + '</span></td><td class="c-act"><span class="d-none">Read-only</span></td>';
      return r + '</tr>';
    }
    function sorted() { return C[tab].slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name); }); }
    function render() {
      var s = q.value.trim().toLowerCase(), all = sorted(), rows = all.filter(function (x) { return (!s || x.name.toLowerCase().indexOf(s) > -1) && (tab === 'types' || !only.checked || x.on); });
      $('[data-chead]').innerHTML = '<tr>' + COLS[tab].map(function (c, i) { return '<th' + ((c === 'Order' || c.indexOf('Deals') === 0) ? ' class="num"' : i === COLS[tab].length - 1 ? ' class="c-act"' : '') + '>' + (c || '<span class="visually-hidden">Actions</span>') + '</th>'; }).join('') + '</tr>';
      $('[data-crows]').innerHTML = rows.map(row).join('');
      $('[data-cempty]').hidden = rows.length > 0; $('[data-ccount]').textContent = rows.length === all.length ? all.length + ' ' + (all.length === 1 ? ONE[tab] : tab === 'categories' ? 'categories' : ONE[tab] + 's') : rows.length + ' of ' + all.length;
      $('[data-cnote]').innerHTML = '<i data-lucide="info"></i><span>' + NOTE[tab] + '</span>';
      $('[data-cat-active]').hidden = tab === 'types'; var add = $('[data-cat-add]'); add.hidden = tab === 'types'; $('[data-cat-add-l]').textContent = 'Add ' + ONE[tab];
      var tc = $('[data-tcount="' + tab + '"]'); if (tc) tc.textContent = C[tab].length;
      A.icons();
      if (window.ADM_PG) ADM_PG.saveCatalogue(C);   // S25 playground: names, order, on/off and new ones reach the site
    }
    function byId(id) { return C[tab].filter(function (x) { return x.id === +id; })[0]; }
    tabbed('data-ctab', 'shops', function (k) { tab = k; q.value = ''; render(); });
    q.addEventListener('input', render); only.addEventListener('change', render);
    $('[data-cclear]').addEventListener('click', function () { q.value = ''; render(); q.focus(); });

    $('[data-crows]').addEventListener('change', function (e) {
      if (!e.target.matches('[data-con]')) return; var x = byId(e.target.closest('tr').dataset.c); x.on = e.target.checked;
      var tr = e.target.closest('tr'); if (only.checked && !x.on) { tr.classList.add('is-out'); setTimeout(render, 200); } else render();
      var what = tab === 'dealtypes' ? 'tab' : tab === 'shops' ? 'store page and filter' : 'page and tile';
      toast(x.on ? x.name + ' shows on the site again' : x.name + ' hidden: its ' + what + ' are off. Its deals stay in All deals.', { icon: x.on ? 'eye' : 'eye-off', action: 'Undo', onAction: function () { x.on = !x.on; render(); } });
    });

    /* edit drawer */
    function fld(name, label, val, o) {
      o = o || {}; var id = 'ce-' + name, req = o.req ? ' *' : '';
      if (o.area) return '<label class="fld"><span class="lab">' + label + req + (o.hint ? ' <small>' + o.hint + '</small>' : '') + '</span><textarea class="textarea" rows="' + (o.rows || 4) + '" name="' + name + '" id="' + id + '">' + esc(val || '') + '</textarea><span class="err" hidden></span></label>';
      return '<label class="fld"><span class="lab">' + label + req + (o.hint ? ' <small>' + o.hint + '</small>' : '') + '</span><input class="input' + (o.mono ? ' mono' : '') + '" type="' + (o.type || 'text') + '" name="' + name + '" id="' + id + '" value="' + esc(val == null ? '' : val) + '"' + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.ro ? ' readonly' : '') + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.type === 'number' ? ' min="1" step="1" inputmode="numeric"' : '') + ' autocomplete="off">' + (o.cnt ? '<span class="cnt"><span data-cnt="' + name + '">' + (val || '').length + '</span>/' + o.max + '</span>' : '') + '<span class="err" hidden></span></label>';
    }
    var logoImg = null;
    function openEdit(x) {
      editing = x; var n = !x; x = x || { name: '', label: '', aff: '', order: sorted().reduce(function (m, y) { return Math.max(m, y.order || 0); }, 0) + 1, on: true, steps: [], seo: '', slug: '', title: '', rule: '', n: 0, logo: '' };
      $('#ce-title').textContent = n ? 'Add ' + ONE[tab] : 'Edit ' + x.name;
      $('[data-ce-sub]').textContent = n ? 'Shows on the site when saved and switched on.' : (x.n ? nf(x.n) + ' deals' + (tab === 'dealtypes' ? ' in this snapshot' : ' on the live site') : 'No deals yet');
      var h = '';
      if (tab === 'shops') {
        logoImg = x.logo || null;
        h = fld('name', 'Name', x.name, { req: 1 }) + fld('label', 'Card label', x.label, { req: 1, max: 13, cnt: 1, hint: 'on deal cards' })
          + '<div class="fld"><span class="lab">Logo <small>square or wide, on a white or clear background</small></span><div class="logo-row"><span class="lg big" data-logo-pv>' + (x.logo ? '<img src="' + x.logo + '" alt="">' : '<i data-lucide="image"></i>') + '</span><label class="btn btn-outline btn-sm">' + (x.logo ? 'Replace' : 'Upload') + '<input type="file" accept="image/*" hidden data-logo-in></label></div></div>'
          + '<div class="grid2">' + fld('aff', 'Affiliate value', x.aff, { mono: 1, ph: 'tag=… or affid=…', hint: 'added to every link' }) + fld('order', 'Order', x.order, { type: 'number', req: 1 }) + '</div>'
          + '<label class="ckl"><span class="ck"><input type="checkbox" name="on"' + (x.on ? ' checked' : '') + '><span class="box"><i data-lucide="check"></i></span></span><span>Active <small>shows its store page and filter</small></span></label>'
          + fld('steps', 'Default “How to get it” steps', (x.steps || []).join('\n'), { area: 1, rows: 5, hint: 'one per line; new deals from this shop start with these' })
          + fld('seo', 'SEO description', x.seo, { area: 1, rows: 3, hint: 'shop page, search results' });
      } else if (tab === 'categories') {
        h = fld('name', 'Name', x.name, { req: 1 }) + fld('slug', 'Page address', x.slug, { mono: 1, ro: !n, hint: n ? 'made from the name; letters, numbers and _' : 'fixed, so old links keep working' })
          + '<div class="grid2">' + fld('order', 'Order', x.order, { type: 'number', req: 1 }) + '<div class="fld"><span class="lab">&nbsp;</span><label class="ckl"><span class="ck"><input type="checkbox" name="on"' + (x.on ? ' checked' : '') + '><span class="box"><i data-lucide="check"></i></span></span><span>Active</span></label></div></div>'
          + fld('title', 'SEO title', x.title, { hint: 'browser tab and search results' }) + fld('seo', 'SEO description', x.seo, { area: 1, rows: 3 });
      } else {
        h = fld('name', 'Name', x.name, { req: 1, hint: 'the tab label' }) + fld('rule', 'Rule line', x.rule, { hint: 'shown under the page title' })
          + '<div class="grid2">' + fld('order', 'Order', x.order, { type: 'number', req: 1 }) + '<div class="fld"><span class="lab">&nbsp;</span><label class="ckl"><span class="ck"><input type="checkbox" name="on"' + (x.on ? ' checked' : '') + '><span class="box"><i data-lucide="check"></i></span></span><span>Active</span></label></div></div>';
      }
      form.innerHTML = h; $('[data-ce-del]').hidden = n; A.icons();
      var li = $('[data-logo-in]', form); if (li) li.addEventListener('change', function () { var file = li.files[0]; if (!file) return; var r = new FileReader(); r.onload = function () { logoImg = r.result; $('[data-logo-pv]', form).innerHTML = '<img src="' + r.result + '" alt="">'; }; r.readAsDataURL(file); });
      var lab = form.elements.label; if (lab) lab.addEventListener('input', function () { $('[data-cnt="label"]', form).textContent = lab.value.length; });
      if (n && tab === 'categories') form.elements.name.addEventListener('input', function () { form.elements.slug.value = form.elements.name.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); });
      A.openSheet(sheet);
    }
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) fieldErr(e.target, ''); });
    $('[data-crows]').addEventListener('click', function (e) { if (e.target.closest('[data-cedit]')) openEdit(byId(e.target.closest('tr').dataset.c)); });
    $('[data-cat-add]').addEventListener('click', function () { openEdit(null); });
    function saveEdit() {
      var F = form.elements, bad = [], name = F.name.value.trim();
      if (!name) bad.push([F.name, 'Add a name.']);
      else if (C[tab].some(function (y) { return y !== editing && y.name.toLowerCase() === name.toLowerCase(); })) bad.push([F.name, 'A ' + ONE[tab] + ' with this name already exists.']);
      if (F.label && !F.label.value.trim()) bad.push([F.label, 'Add the label shown on cards.']);
      var ord = +F.order.value; if (!(ord >= 1) || ord % 1) bad.push([F.order, 'Use a whole number from 1.']);
      if (F.slug && !editing) { var sl = F.slug.value.trim(); if (!/^[a-z0-9_]+$/.test(sl)) bad.push([F.slug, 'Use lowercase letters, numbers and _ only.']); else if (C.categories.some(function (y) { return y.slug === sl; })) bad.push([F.slug, 'Another category uses this address.']); }
      $$('.err', form).forEach(function (e) { e.hidden = true; }); $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      if (bad.length) { bad.forEach(function (b) { fieldErr(b[0], b[1]); }); bad[0][0].focus(); return; }
      var o = { name: name, order: ord, on: F.on.checked };
      if (tab === 'shops') { o.label = F.label.value.trim(); o.aff = F.aff.value.trim(); o.steps = F.steps.value.split('\n').map(function (s) { return s.trim(); }).filter(Boolean); o.seo = F.seo.value.trim(); o.logo = logoImg || ''; }
      if (tab === 'categories') { o.title = F.title.value.trim(); o.seo = F.seo.value.trim(); if (!editing) o.slug = F.slug.value.trim(); }
      if (tab === 'dealtypes') o.rule = F.rule.value.trim();
      var t = tab, target = editing, prev = target ? JSON.parse(JSON.stringify(target)) : null, made;
      if (target) Object.assign(target, o); else { made = Object.assign({ id: Date.now(), n: 0 }, o); C[t].push(made); }
      A.closeSheet(); render(); flash($('[data-c="' + (target || made).id + '"]'));
      toast(target ? name + ' saved' : name + ' added', { action: 'Undo', onAction: function () { if (target) Object.assign(target, prev); else C[t].splice(C[t].indexOf(made), 1); render(); } });
    }
    $('[data-ce-save]').addEventListener('click', saveEdit); form.addEventListener('submit', function (e) { e.preventDefault(); saveEdit(); });
    $('[data-ce-del]').addEventListener('click', function () {
      var x = editing; if (!x) return;
      if (x.n) { toast(x.name + ' has ' + nf(x.n) + ' deals, so it can’t be deleted. Switch it off to hide it.', { icon: 'info', ms: 5000 }); return; }
      A.closeSheet();
      setTimeout(function () { A.confirmBox('Delete ' + x.name + '?', 'It has no deals. This can’t be undone after you leave the page.', 'Delete', function () {
        var t = tab, i = C[t].indexOf(x); C[t].splice(i, 1); render(); toast(x.name + ' deleted', { icon: 'trash-2', action: 'Undo', onAction: function () { C[t].splice(i, 0, x); render(); } });
      }, true); }, 270);
    });
  })();
})();
