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

    /* changes.md A-15: one fixed text for every post (db.js H.shareText), shown here; nothing to edit */
    (function () {
      var d = window.OTDB ? OTDB.deals()[0] : null, t = $('[data-spv-text]'), im = $('[data-spv-img]'); if (!t || !d) return;
      t.innerHTML = esc(OTDB.H.shareText(d)).replace(/\n/g, '<br>'); im.src = d.img;
    })();

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
    if (TAGS) $$('[data-tag-row]', tf).forEach(function (r) { var v = TAGS[r.dataset.tagRow]; if (!v) return; var a = $('[data-tag="amz"]', r); a.value = a.defaultValue = v.amz; });
    var d = dirtyForm(tf);
    function valid(a) { var v = a.value.trim(); if (!v) return fieldErr(a, a.hasAttribute('data-req') ? 'This link needs a tag.' : ''); return fieldErr(a, /^[a-z0-9][a-z0-9-]*-21$/i.test(v) ? '' : 'Amazon tags in India end in “-21”, e.g. offertag-21.'); }
    tf.addEventListener('input', function (e) { if (e.target.matches('[data-tag="amz"]') && e.target.getAttribute('aria-invalid')) valid(e.target); });
    tf.addEventListener('submit', function (e) {
      e.preventDefault(); var bad = $$('[data-tag="amz"]', tf).filter(function (a) { return !valid(a); });
      if (bad.length) { bad[0].focus(); return; }
      var out = {}; $$('[data-tag-row]', tf).forEach(function (r) { out[r.dataset.tagRow] = { amz: $('[data-tag="amz"]', r).value.trim() }; });
      A.store.set('adm-tags', JSON.stringify(out)); d.saved();
      toast('Tags saved. New links and shares use them; links already shared keep their old tag.');
    });
  })();

  /* =================== Inbox =================== */
  if (window.ADM_INBOX) (function () {
    // 2026-11-26: no handled / unhandled state on feedback; the Inbox just lists the messages
    var D = window.ADM_INBOX, tab = 'feedback', only = { checked: false, closest: function () { return null; }, addEventListener: function () {} }, list = $('[data-ibx]');
    var KIND = { Issue: 'k-issue', Suggestion: 'k-sugg', Appreciation: 'k-thanks' };
    // D-153 (plan.md B5): comments from the deal pages, seed + what people post in this browser. Kept apart from D: they need no "handled" step.
    var DAYMS = 864e5;
    function comments() {
      if (!window.OTDB) return [];
      return OTDB.comments().map(function (c) { var d = OTDB.deal(c.deal); return Object.assign({}, c, { dealT: d ? d.t : 'Deal removed', dealPage: d ? d.page : '' }); })
        .sort(function (a, b) { return b.at - a.at; });
    }
    function counts() { var tot = 0; Object.keys(D).forEach(function (k) { var n = k === 'feedback' ? D[k].length : D[k].filter(function (x) { return !x.done; }).length; tot += n; var c = $('[data-tcount="' + k + '"]'); if (c) { c.textContent = n; c.toggleAttribute('data-zero', !n); } }); A.setCount('inbox', tot); var cc = $('[data-tcount="comments"]'), nc = comments().filter(function (c) { return Date.now() - c.at < DAYMS; }).length; if (cc) { cc.textContent = nc; cc.toggleAttribute('data-zero', !nc); } }
    function item(x) {
      var h = '<li class="ib' + (x.done && tab !== 'feedback' ? ' is-done' : '') + '" data-id="' + x.id + '">';
      if (tab === 'comments') return '<li class="ib ib-cm" data-cid="' + esc(String(x.id)) + '"><div class="ib-top"><b class="ib-name">' + esc(x.name || 'Member') + '</b>' + (x.admin ? '<span class="kind k-sugg">OfferTag</span>' : '') + '<span class="ib-who">' + (x.parent ? 'Reply · ' : '') + esc(x.when) + '</span></div><p class="ib-msg">' + esc(x.text) + '</p><div class="ib-acts">' + (x.dealPage ? '<a class="btn btn-outline btn-sm" href="' + x.dealPage + '#comments" target="_blank" rel="noopener"><i data-lucide="external-link"></i>' + esc(x.dealT.length > 48 ? x.dealT.slice(0, 47) + '…' : x.dealT) + '</a>' : '<span class="pill">' + esc(x.dealT) + '</span>') + '<button class="btn btn-ghost btn-sm danger" type="button" data-cdel><i data-lucide="trash-2"></i>Delete</button></div></li>';
      if (tab === 'feedback') h += '<div class="ib-top"><span class="kind ' + KIND[x.kind] + '">' + x.kind + '</span><span class="ib-who">' + esc(x.who) + ' · ' + esc(x.when) + '</span></div><p class="ib-msg">' + esc(x.msg) + '</p>';
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
      em.hidden = rows.length > 0; em.textContent = 'Nothing here yet.';
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

  /* =================== Users and the page for one user (changes.md A-13) =================== */
  if (window.ADM_USERS) (function () {
    var U = (window.OTDB && OTDB.get('users')) || window.ADM_USERS;
    U = U.filter(function (u) { return u.role !== 'Member'; }).map(function (u) {   // older playground copies used Admin / Sub-admin
      var x = Object.assign({ active: true, last: '' }, u); if (x.role === 'Sub-admin') x.role = 'Admin'; else if (x.role === 'Admin' && x.id === 1) x.role = 'Super admin'; return x;
    });
    var ME = A.SUB ? 2 : 1, sheet = $('#user-edit'), F = $('[data-ue]'), cur = null;
    function byId(id) { return U.filter(function (u) { return u.id === +id; })[0]; }
    function persist() { if (window.OTDB) OTDB.set('users', U); }
    function log(text, uid) { if (window.ADM_PG && ADM_PG.log) ADM_PG.log('settings', text, null, uid); }
    function supers() { return U.filter(function (u) { return u.role === 'Super admin' && u.active; }); }
    function badge(u) { return '<span class="role r-' + (u.role === 'Super admin' ? 'admin' : 'subadmin') + '">' + u.role + '</span>'; }
    function status(u) { return u.active ? '<span class="pill pill-live">Active</span>' : '<span class="pill pill-withdrawn">Off</span>'; }
    function userHref(u) { return A.withRole('/admin/users/' + u.id); }

    // add / edit drawer, shared by both pages
    function openForm(u) {
      cur = u || null; F.reset(); $$('.err', F).forEach(function (x) { x.hidden = true; });
      $('#ue-title').textContent = u ? 'Edit ' + u.name : 'Add user';
      $('[data-ue-sub]').textContent = u ? 'Joined ' + u.joined : 'They sign in with a code sent to this email.';
      if (u) { F.elements.name.value = u.name; F.elements.email.value = u.email; F.elements.tag.value = u.tag || ''; F.elements.active.checked = u.active; $$('input[name="role"]', F).forEach(function (r) { r.checked = r.value === u.role; }); }
      $('[data-ue-del]').hidden = !u || u.id === ME;
      A.openSheet(sheet);
    }
    function err(name, on) { var e = $('.err', F.elements[name].closest('.fld')); if (e) e.hidden = !on; return on; }
    $('[data-ue-save]').addEventListener('click', function () {
      var f = F.elements, name = f.name.value.trim(), email = f.email.value.trim(), tag = f.tag.value.trim(), role = $('input[name="role"]:checked', F).value, active = f.active.checked, bad = false;
      bad = err('name', !name) || bad;
      bad = err('email', !/^\S+@\S+\.\S+$/.test(email) || U.some(function (x) { return x !== cur && x.email.toLowerCase() === email.toLowerCase(); })) || bad;
      bad = err('tag', !!tag && !/^[a-z0-9][a-z0-9-]*-21$/i.test(tag)) || bad;
      if (bad) { var first = $('.err:not([hidden])', F); if (first) first.closest('.fld').querySelector('input').focus(); return; }
      if (cur && cur.role === 'Super admin' && (role !== 'Super admin' || !active) && supers().length === 1 && supers()[0] === cur) { A.toast('Keep at least one active Super admin.', { icon: 'info' }); return; }
      var snap = JSON.stringify(U);
      if (cur) {
        if (cur.role !== role) log((role === 'Super admin' ? 'Made ' : 'Changed ') + cur.name + (role === 'Super admin' ? ' a Super admin' : ' to Admin'));
        if (cur.active !== active) log((active ? 'Turned on ' : 'Turned off ') + cur.name);
        if (cur.name !== name || cur.email !== email || (cur.tag || '') !== tag) log('Edited ' + name + '’s details');
        Object.assign(cur, { name: name, email: email, tag: tag, role: role, active: active });
      } else {
        var u = { id: U.reduce(function (m, x) { return Math.max(m, x.id); }, 0) + 1, name: name, email: email, phone: '', role: role, joined: new Date().toISOString().slice(0, 7), tag: tag, active: active, last: 'never' };
        U.push(u); log('Added ' + name + ' as ' + role);
      }
      persist(); A.closeSheet(); draw();
      A.toast(cur ? 'Saved' : name + ' added. They get a sign-in code at ' + email + '.', { action: 'Undo', onAction: function () { U = JSON.parse(snap); persist(); draw(); } });
    });
    F.addEventListener('submit', function (e) { e.preventDefault(); $('[data-ue-save]').click(); });
    function del(u, after) {
      if (u.id === ME) { A.toast('You can’t delete yourself.', { icon: 'info' }); return; }
      if (u.role === 'Super admin' && supers().length === 1 && supers()[0] === u) { A.toast('Keep at least one active Super admin.', { icon: 'info' }); return; }
      A.confirmBox('Delete ' + u.name + '?', 'They can’t sign in any more. The deals they posted stay on the site.', 'Delete user', function () {
        var snap = JSON.stringify(U); U = U.filter(function (x) { return x !== u; }); log('Deleted user ' + u.name); persist();
        if (after) after(); else draw();
        A.toast(u.name + ' deleted', { action: 'Undo', onAction: function () { U = JSON.parse(snap); persist(); draw(); } });
      }, true);
    }
    $('[data-ue-del]').addEventListener('click', function () { var u = cur; A.closeSheet(); setTimeout(function () { del(u, $('[data-user-page]') ? function () { location.href = A.withRole('/admin/users'); } : null); }, 260); });

    var draw = function () {};
    /* ---- the list ---- */
    if ($('[data-urows]')) {
      var q = $('[data-uq]'), role = $('[data-urole]'), body = $('[data-urows]');
      draw = function () {
        var s = q.value.trim().toLowerCase(), rows = U.filter(function (u) { return (!role.value || u.role === role.value) && (!s || (u.name + ' ' + u.email).toLowerCase().indexOf(s) > -1); });
        body.innerHTML = rows.map(function (u) {
          return '<tr data-u="' + u.id + '"' + (u.active ? '' : ' class="is-off"') + '><td class="c-title" data-l="Name"><a class="u-name" href="' + userHref(u) + '"><span class="avatar">' + esc(u.name.charAt(0)) + '</span><span><b>' + esc(u.name) + (u.id === ME ? ' <small>(you)</small>' : '') + '</b><small>' + esc(u.email) + '</small></span></a></td>' +
            '<td data-l="Role">' + badge(u) + '</td>' +
            '<td data-l="Status"><label class="switch" title="' + (u.active ? 'Turn off' : 'Turn on') + '"><input type="checkbox" data-uact' + (u.active ? ' checked' : '') + (u.id === ME ? ' disabled' : '') + ' aria-label="' + esc(u.name) + ' can sign in"><span></span></label></td>' +
            '<td class="d-when" data-l="Last signed in">' + esc(u.last || '—') + '</td>' +
            '<td data-l="Amazon tag">' + (u.tag ? '<span class="mono">' + esc(u.tag) + '</span>' : '<span class="d-none">website tag</span>') + '</td>' +
            '<td class="c-act"><a class="btn btn-ghost btn-sm" href="' + userHref(u) + '">Open</a><button class="btn btn-ghost btn-icon btn-sm" type="button" data-uedit aria-label="Edit ' + esc(u.name) + '"><i data-lucide="pencil"></i></button></td></tr>';
        }).join('');
        $('[data-uempty]').hidden = rows.length > 0; $('[data-ucount]').textContent = rows.length + ' of ' + U.length; A.icons();
      };
      q.addEventListener('input', draw); role.addEventListener('change', draw);
      $('[data-uclear]').addEventListener('click', function () { q.value = ''; role.value = ''; draw(); q.focus(); });
      $('[data-unew]').addEventListener('click', function () { openForm(null); });
      body.addEventListener('click', function (e) { var b = e.target.closest('[data-uedit]'); if (b) openForm(byId(b.closest('tr').dataset.u)); });
      body.addEventListener('change', function (e) {
        var c = e.target.closest('[data-uact]'); if (!c) return; var u = byId(c.closest('tr').dataset.u);
        if (!c.checked && u.role === 'Super admin' && supers().length === 1) { c.checked = true; A.toast('Keep at least one active Super admin.', { icon: 'info' }); return; }
        u.active = c.checked; log((u.active ? 'Turned on ' : 'Turned off ') + u.name); persist(); draw();
        A.toast(u.active ? u.name + ' can sign in again' : u.name + ' can’t sign in now. Their deals stay.', { action: 'Undo', onAction: function () { u.active = !u.active; persist(); draw(); } });
      });
      draw();
    }

    /* ---- one user: details, actions, activity log ---- */
    if ($('[data-user-page]')) {
      var m = location.pathname.match(/\/admin\/users\/(\d+)/), id = m ? +m[1] : 1, filter = '';
      draw = function () {
        var u = byId(id);
        if (!u) { $$('[data-user-page] > section').forEach(function (x) { x.hidden = true; }); $('[data-up-missing]').hidden = false; return; }
        document.title = u.name + ' · OfferTag Admin';
        $('[data-up-av]').textContent = u.name.charAt(0); $('[data-up-name]').textContent = u.name + (u.id === ME ? ' (you)' : '');
        $('[data-up-sub]').textContent = u.email + (u.phone ? ' · ' + u.phone : '') + ' · joined ' + u.joined + ' · last signed in ' + (u.last || '—');
        $('[data-up-badges]').innerHTML = badge(u) + status(u) + (u.tag ? '<span class="tchip mono">' + esc(u.tag) + '</span>' : '<span class="tchip">website tag</span>');
        var rb = $('[data-up="role"]'), ab = $('[data-up="active"]');
        $('span', rb).textContent = u.role === 'Super admin' ? 'Make Admin' : 'Make Super admin';
        $('span', ab).textContent = u.active ? 'Turn off' : 'Turn on';
        rb.hidden = ab.hidden = $('[data-up="del"]').hidden = u.id === ME;
        var L = window.ADM_PG && ADM_PG.logFor ? ADM_PG.logFor(u.id) : [], dealsN = L.filter(function (x) { return x.kind === 'deal' && /^Posted/.test(x.text); }).length;
        $('[data-up-stats]').innerHTML = [['Deals posted, 30 days', dealsN], ['Edits and changes', L.filter(function (x) { return x.kind === 'deal' && !/^Posted/.test(x.text); }).length], ['Sign-ins, 30 days', L.filter(function (x) { return x.kind === 'signin'; }).length]]
          .map(function (k) { return '<div class="panel dv-stat"><span class="dv-stat-l">' + k[0] + '</span><b class="dv-stat-n">' + k[1] + '</b></div>'; }).join('');
        var show = L.filter(function (x) { return !filter || x.kind === filter; }), ICON = { deal: 'tag', signin: 'log-in', settings: 'settings' }, day = '';
        $('[data-up-log]').innerHTML = show.map(function (x) {
          var d = new Date(x.at), dl = d.toDateString() === new Date().toDateString() ? 'Today' : d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' }), head = dl !== day ? '<li class="day">' + dl + '</li>' : ''; day = dl;
          return head + '<li><span class="t-time">' + d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) + '</span><i data-lucide="' + ICON[x.kind] + '"></i><span class="t-title">' + esc(x.text) + (x.link ? ' <a href="' + esc(x.link) + '">' + esc(x.linkText || 'Open') + '</a>' : '') + '</span></li>';
        }).join('');
        $('[data-up-empty]').hidden = show.length > 0; A.icons();
      };
      $('[data-user-page]').addEventListener('click', function (e) {
        var f = e.target.closest('[data-uf]'); if (f) { filter = f.dataset.uf; $$('[data-uf]').forEach(function (b) { b.setAttribute('aria-pressed', b === f); }); draw(); return; }
        var b = e.target.closest('[data-up]'); if (!b) return; var u = byId(id), k = b.dataset.up, snap = JSON.stringify(U);
        var undo = { action: 'Undo', onAction: function () { U = JSON.parse(snap); persist(); draw(); } };
        if (k === 'edit') openForm(u);
        if (k === 'del') del(u, function () { location.href = A.withRole('/admin/users'); });
        if (k === 'role') {
          if (u.role === 'Super admin' && supers().length === 1) { A.toast('Keep at least one active Super admin.', { icon: 'info' }); return; }
          u.role = u.role === 'Super admin' ? 'Admin' : 'Super admin'; log((u.role === 'Super admin' ? 'Made ' + u.name + ' a Super admin' : 'Changed ' + u.name + ' to Admin')); persist(); draw(); A.toast(u.name + ' is ' + (u.role === 'Admin' ? 'an Admin' : 'a Super admin') + ' now', undo);
        }
        if (k === 'active') {
          if (u.active && u.role === 'Super admin' && supers().length === 1) { A.toast('Keep at least one active Super admin.', { icon: 'info' }); return; }
          u.active = !u.active; log((u.active ? 'Turned on ' : 'Turned off ') + u.name); persist(); draw(); A.toast(u.active ? u.name + ' can sign in again' : u.name + ' can’t sign in now. Their deals stay.', undo);
        }
      });
      draw();
    }
  })();

  /* =================== Catalogue =================== */
  if (window.ADM_CAT) (function () {
    var C = window.ADM_CAT, tab = 'shops', q = $('[data-cq]'), only = $('[data-conly]'), sheet = $('#cat-edit'), form = $('[data-ce]'), editing = null;
    var ONE = { shops: 'shop', categories: 'category', dealtypes: 'deal type', types: 'type' };
    var NOTE = {
      shops: 'Drag the dots to set where a shop shows in store lists and filters. A shop with deals can’t be deleted.',
      categories: 'A category’s page address can’t be changed here, so old links keep working. Drag the dots to set the order on the site.',
      dealtypes: 'Every deal gets its tag from these rules on its own, when it is posted and whenever a rule changes. Drag the dots to set the tab order on the site, after Home.',  // P-14: the four tabs are fixed (name, on/off)
      types: 'Types group the lookup lists the site is built on. Read-only.'
    };
    var COLS = {
      shops: ['', 'Shop', 'Card label', ''],  // P-16: no deal counts
      categories: ['', 'Category', 'Address', ''],
      dealtypes: ['', 'Deal type', 'Rule', ''],
      types: ['Name', 'Alias', '']
    };
    // P-25: icons a category can use (lucide names; the site's map plus spares)
    var CAT_ICONS = ['monitor-smartphone','smartphone','battery-charging','shirt','clapperboard','utensils','shopping-basket','apple','brush','luggage','briefcase','cooking-pot','footprints','watch','car-taxi-front','tv','washing-machine','air-vent','scissors','headphones','laptop','spray-can','speaker','sofa','cable','heart-pulse','baby','car-front','book-open','wallet','shapes','gamepad-2','dumbbell','gift','camera','plane','pill','dog','gem','tag'];
    function nf(n) { return INR.format(n); }
    // changes.md A-14: the rules live in the playground data (db.js typeRules) and every page reads them
    var DB = window.OTDB;
    function rules() { return DB ? DB.typeRules() : { top: 25, loot: 75, pantry: ['Grocery'], push: 90 }; }
    function keyOf(x) { return x.key || ({ 'Top deals': 'Top', 'Top deal': 'Top', Loot: 'Loot', New: 'New', Pantry: 'Pantry' }[x.name]) || ''; }
    function ruleText(x) { var R = rules(), k = keyOf(x); return k === 'Top' ? 'Today\'s deals (resets at 12 am)' : k === 'Loot' ? R.loot + '% off or more' : k === 'New' ? 'Under ' + R.top + '% off' : k === 'Pantry' ? 'In ' + (R.pantry.join(', ') || 'no category') : ''; }
    function ed(x) { return '<button class="btn btn-ghost btn-sm" type="button" data-cedit aria-label="Edit ' + esc(x.name) + '">Edit</button>'; }
    function row(x) {
      var r = '<tr data-c="' + x.id + '"' + (x.on === false ? ' class="is-off"' : '') + '>';
      if (tab !== 'types') r += '<td class="c-drag"><button class="drag-h" type="button" data-cdrag aria-label="Move ' + esc(x.name) + ' (drag, or arrow keys)"' + (q.value.trim() ? ' disabled title="Clear the search to reorder"' : ' title="Drag to change the order on the site"') + '><i data-lucide="grip-vertical"></i></button><span class="c-pos">' + (sorted().indexOf(x) + 1) + '</span></td>';  // P-24: position number beside the grip: drag replaces the Order number
      if (tab === 'shops') r += '<td class="c-title" data-l="Shop"><span class="nm">' + (x.logo ? '<span class="lg"><img src="' + x.logo + '" alt=""></span>' : '<span class="lg ini">' + esc(x.name[0]) + '</span>') + '<b>' + esc(x.name) + '</b>' + (x.on === false ? ' <span class="pill">Hidden</span>' : '') + '</span></td><td data-l="Card label">' + esc(x.label) + '</td><td class="c-act">' + ed(x) + '</td>';
      else if (tab === 'categories') r += '<td class="c-title" data-l="Category"><span class="nm">' + '<span class="lg ico"><i data-lucide="' + esc(x.icon || 'tag') + '"></i></span>' + '<b>' + esc(x.name) + '</b>' + (x.on === false ? ' <span class="pill">Hidden</span>' : '') + '</span></td><td data-l="Address"><span class="mono d-none">/' + esc(x.slug) + '</span></td><td class="c-act">' + ed(x) + '</td>';
      else if (tab === 'dealtypes') r += '<td class="c-title" data-l="Deal type"><b>' + esc(x.name) + '</b></td><td data-l="Rule"><b class="rule-t">' + esc(ruleText(x)) + '</b></td><td class="c-act">' + ed(x) + '</td>';
      else r += '<td class="c-title" data-l="Name"><b>' + esc(x.name) + '</b></td><td data-l="Alias"><span class="mono">' + esc(x.alias) + '</span></td><td class="c-act"><span class="d-none">Read-only</span></td>';
      return r + '</tr>';
    }
    function sorted() { return C[tab].slice().sort(function (a, b) { return (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name); }); }
    function render() {
      var s = q.value.trim().toLowerCase(), all = sorted(), rows = all.filter(function (x) { return (!s || x.name.toLowerCase().indexOf(s) > -1) && (tab === 'types' || !only.checked || x.on); });
      $('[data-chead]').innerHTML = '<tr>' + COLS[tab].map(function (c, i) { return '<th' + (i === 0 && tab !== 'types' ? ' class="c-drag"' : i === COLS[tab].length - 1 ? ' class="c-act"' : '') + '>' + (i === 0 && tab !== 'types' ? '#' : c || '<span class="visually-hidden">Actions</span>') + '</th>'; }).join('') + '</tr>';
      $('[data-crows]').innerHTML = rows.map(row).join('');
      $('[data-cempty]').hidden = rows.length > 0; $('[data-ccount]').textContent = rows.length === all.length ? all.length + ' ' + (all.length === 1 ? ONE[tab] : tab === 'categories' ? 'categories' : ONE[tab] + 's') : rows.length + ' of ' + all.length;
      $('[data-cnote]').innerHTML = '<i data-lucide="info"></i><span>' + NOTE[tab] + '</span>';
      $('[data-cat-active]').hidden = true;  var add = $('[data-cat-add]'); add.hidden = tab === 'types' || tab === 'dealtypes'; $('[data-cat-add-l]').textContent = 'Add ' + ONE[tab];  // P-24/P-25: no 'Active only' filter; Show on site lives in the edit sheet
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
      if (o.fixed) return '<input type="hidden" name="' + name + '" value="' + esc(val || '') + '">';  // P-24: an existing name / page address is SEO-linked, so it isn't shown at all (the sheet title names it)
      if (o.area) return '<label class="fld"><span class="lab">' + label + req + (o.hint ? ' <small>' + o.hint + '</small>' : '') + '</span><textarea class="textarea" rows="' + (o.rows || 4) + '" name="' + name + '" id="' + id + '">' + esc(val || '') + '</textarea><span class="err" hidden></span></label>';
      return '<label class="fld"><span class="lab">' + label + req + (o.hint ? ' <small>' + o.hint + '</small>' : '') + '</span><input class="input' + (o.mono ? ' mono' : '') + '" type="' + (o.type || 'text') + '" name="' + name + '" id="' + id + '" value="' + esc(val == null ? '' : val) + '"' + (o.max ? ' maxlength="' + o.max + '"' : '') + (o.ro ? ' readonly' : '') + (o.ph ? ' placeholder="' + esc(o.ph) + '"' : '') + (o.type === 'number' ? ' min="1" step="1" inputmode="numeric"' : '') + ' autocomplete="off">' + (o.cnt ? '<span class="cnt"><span data-cnt="' + name + '">' + (val || '').length + '</span>/' + o.max + '</span>' : '') + '<span class="err" hidden></span></label>';
    }
    var logoImg = null;
    function openEdit(x) {
      editing = x; var n = !x; x = x || { name: '', label: '', aff: '', order: sorted().reduce(function (m, y) { return Math.max(m, y.order || 0); }, 0) + 1, on: true, steps: [], seo: '', slug: '', title: '', rule: '', n: 0, logo: '' };
      $('#ce-title').textContent = n ? 'Add ' + ONE[tab] : 'Edit ' + x.name;
      $('[data-ce-sub]').textContent = n && tab !== 'dealtypes' ? 'Shows on the site when saved and switched on.' : '';  // P-14/P-16: no deal counts
      var h = '';
      if (tab === 'shops') {
        logoImg = x.logo || null;
        h = fld('name', 'Name', x.name, n ? { req: 1 } : { fixed: 'can’t be changed: its page is ranked in search' }) + fld('label', 'Card label', x.label, { req: 1, max: 13, cnt: 1, hint: 'on deal cards' })
          + '<div class="fld"><span class="lab">Logo <small>square or wide, on a white or clear background</small></span><div class="logo-row"><span class="lg big" data-logo-pv>' + (x.logo ? '<img src="' + x.logo + '" alt="">' : '<i data-lucide="image"></i>') + '</span><label class="btn btn-outline btn-sm">' + (x.logo ? 'Replace' : 'Upload') + '<input type="file" accept="image/*" hidden data-logo-in></label></div></div>'
          + '<div class="grid2">' + '<input type="hidden" name="order" value="' + x.order + '">' + '<div class="fld"><span class="lab">Affiliate tag</span><small class="hint">Set in <a href="' + A.withRole('/admin/settings/tags') + '">Settings → Affiliate tags</a></small></div></div>'
          + '<label class="ckl"><span class="ck"><input type="checkbox" name="on"' + (x.on !== false ? ' checked' : '') + '><span class="box"><i data-lucide="check"></i></span></span><span>Show on site <small>untick to hide it without deleting it</small></span></label>'  // P-25: the old site's Active, as one tick
          + fld('seo', 'SEO description', x.seo, { area: 1, rows: 3, hint: 'shop page, search results' });
      } else if (tab === 'categories') {
        h = fld('name', 'Name', x.name, n ? { req: 1 } : { fixed: 'can’t be changed: its page is ranked in search' }) + fld('slug', 'Page address', x.slug, n ? { mono: 1, hint: 'made from the name; letters, numbers and _' } : { mono: 1, fixed: 'can’t be changed, so old links keep working' })
          + '<input type="hidden" name="order" value="' + x.order + '">'
          + '<div class="fld"><span class="lab">Icon <small>shown on the Categories page and in filters</small></span><div class="ico-pick" role="radiogroup" aria-label="Icon">' + CAT_ICONS.map(function (k) { return '<label title="' + k + '"><input type="radio" name="icon" value="' + k + '"' + ((x.icon || 'tag') === k ? ' checked' : '') + '><i data-lucide="' + k + '"></i></label>'; }).join('') + '</div></div>'
          + '<label class="ckl"><span class="ck"><input type="checkbox" name="on"' + (x.on !== false ? ' checked' : '') + '><span class="box"><i data-lucide="check"></i></span></span><span>Show on site <small>untick to hide it without deleting it</small></span></label>'
          + fld('title', 'SEO title', x.title, { hint: 'browser tab and search results' }) + fld('seo', 'SEO description', x.seo, { area: 1, rows: 3 });
      } else {
        var R = rules(), k = keyOf(x), rule = '';
        if (k === 'New' || k === 'Loot') rule = '<label class="fld"><span class="lab">Rule * <small>' + (k === 'New' ? 'deals under this discount are New deals' : 'deals at this discount or more are Loot') + '</small></span><span class="input-suffix rule-in"><input class="input num" type="number" min="1" max="99" name="pct" value="' + (k === 'New' ? R.top : R.loot) + '"><span>' + (k === 'New' ? '% off' : '% off or more') + '</span></span><span class="err" hidden></span></label>';
        else if (k === 'Top') rule = '<div class="fld"><span class="lab">Rule</span><p class="hint-line"><i data-lucide="info"></i><span>Deals posted today, any discount, newest first. The list starts fresh at 12 am. Pinned deals stay on it.</span></p></div>';
        else if (k === 'Pantry') rule = '<div class="fld"><span class="lab">Rule * <small>deals in these categories are Pantry</small></span><div class="cat-picks">' + C.categories.slice().sort(function (a, b) { return a.name.localeCompare(b.name); }).map(function (c) { return '<label class="ckl"><span class="ck"><input type="checkbox" name="pcat" value="' + esc(c.name) + '"' + (R.pantry.indexOf(c.name) > -1 ? ' checked' : '') + '><span class="box"><i data-lucide="check"></i></span></span><span>' + esc(c.name) + '</span></label>'; }).join('') + '</div><span class="err" hidden></span></div>';
        h = rule + '<input type="hidden" name="order" value="' + x.order + '">';  // P-14: the tab name and on/off are fixed, so neither is a field
      }
      form.innerHTML = h; A.icons();  // P-24: the four tabs are pages; they can't be deleted. P-35: categories and shops can't be deleted either (their page links and old deals depend on them); Show on site hides one
      var li = $('[data-logo-in]', form); if (li) li.addEventListener('change', function () { var file = li.files[0]; if (!file) return; var r = new FileReader(); r.onload = function () { logoImg = r.result; $('[data-logo-pv]', form).innerHTML = '<img src="' + r.result + '" alt="">'; }; r.readAsDataURL(file); });
      var lab = form.elements.label; if (lab) lab.addEventListener('input', function () { $('[data-cnt="label"]', form).textContent = lab.value.length; });
      if (n && tab === 'categories') form.elements.name.addEventListener('input', function () { form.elements.slug.value = form.elements.name.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''); });
      A.openSheet(sheet);
    }
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) fieldErr(e.target, ''); });
    $('[data-crows]').addEventListener('click', function (e) { if (e.target.closest('[data-cedit]')) openEdit(byId(e.target.closest('tr').dataset.c)); });
    $('[data-cat-add]').addEventListener('click', function () { openEdit(null); });
    // P-24: reorder by the 9-dot handle (pointer drag works with mouse and touch; arrow keys on the handle move one step)
    function saveOrder() { $$('[data-crows] tr').forEach(function (tr, i) { var x = byId(tr.dataset.c); if (x) x.order = i + 1; }); render(); toast('Order saved', { icon: 'check' }); }
    var tb = $('[data-crows]'), dr = null;
    tb.addEventListener('pointerdown', function (e) {
      var h = e.target.closest('[data-cdrag]'); if (!h || h.disabled || e.button > 0) return;
      e.preventDefault(); dr = h.closest('tr'); dr.classList.add('is-dragging'); h.setPointerCapture(e.pointerId);
    });
    tb.addEventListener('pointermove', function (e) {
      if (!dr) return;
      var over = document.elementFromPoint(e.clientX, e.clientY), tr = over && over.closest('[data-crows] tr'); if (!tr || tr === dr) return;
      var b = tr.getBoundingClientRect(); tb.insertBefore(dr, e.clientY > b.top + b.height / 2 ? tr.nextSibling : tr);
    });
    function endDrag() { if (!dr) return; dr.classList.remove('is-dragging'); dr = null; saveOrder(); }
    tb.addEventListener('pointerup', endDrag); tb.addEventListener('pointercancel', endDrag);
    tb.addEventListener('keydown', function (e) {
      var h = e.target.closest('[data-cdrag]'); if (!h || h.disabled || (e.key !== 'ArrowUp' && e.key !== 'ArrowDown')) return;
      e.preventDefault(); var tr = h.closest('tr'), id = tr.dataset.c, sib = e.key === 'ArrowUp' ? tr.previousElementSibling : tr.nextElementSibling; if (!sib) return;
      tb.insertBefore(tr, e.key === 'ArrowUp' ? sib : sib.nextSibling); saveOrder(); var nh = $('[data-crows] tr[data-c="' + id + '"] [data-cdrag]'); if (nh) nh.focus();
    });
    function saveEdit() {
      var F = form.elements, bad = [], name = F.name ? F.name.value.trim() : editing.name;
      if (!name) bad.push([F.name, 'Add a name.']);
      else if (C[tab].some(function (y) { return y !== editing && y.name.toLowerCase() === name.toLowerCase(); })) bad.push([F.name, 'A ' + ONE[tab] + ' with this name already exists.']);
      if (F.label && !F.label.value.trim()) bad.push([F.label, 'Add the label shown on cards.']);
      var ord = +F.order.value; if (!(ord >= 1) || ord % 1) bad.push([F.order, 'Use a whole number from 1.']);
      if (F.slug && !editing) { var sl = F.slug.value.trim(); if (!/^[a-z0-9_]+$/.test(sl)) bad.push([F.slug, 'Use lowercase letters, numbers and _ only.']); else if (C.categories.some(function (y) { return y.slug === sl; })) bad.push([F.slug, 'Another category uses this address.']); }
      $$('.err', form).forEach(function (e) { e.hidden = true; }); $$('[aria-invalid]', form).forEach(function (i) { i.removeAttribute('aria-invalid'); });
      if (bad.length) { bad.forEach(function (b) { fieldErr(b[0], b[1]); }); bad[0][0].focus(); return; }
      var o = { name: name, order: ord, on: F.on ? F.on.checked : true };
      if (tab === 'shops') { o.label = F.label.value.trim(); o.seo = F.seo.value.trim(); o.logo = logoImg || ''; }
      if (tab === 'categories') { o.icon = (form.querySelector('input[name="icon"]:checked') || {}).value || 'tag'; o.title = F.title.value.trim(); o.seo = F.seo.value.trim(); if (!editing) o.slug = F.slug.value.trim(); }
      if (tab === 'dealtypes') {
        var R0 = rules(), R1 = JSON.parse(JSON.stringify(R0)), k1 = keyOf(editing);
        if (k1 === 'New' || k1 === 'Loot') { var v = +F.pct.value; if (!(v >= 1 && v <= 99)) { fieldErr(F.pct, 'Use a number from 1 to 99.'); F.pct.focus(); return; } R1[k1 === 'New' ? 'top' : 'loot'] = v; if (R1.loot <= R1.top) { fieldErr(F.pct, 'Loot must be a bigger discount than New (' + (k1 === 'New' ? 'Loot is ' + R1.loot + '%' : 'New is under ' + R1.top + '%') + ').'); F.pct.focus(); return; } }
        if (k1 === 'Pantry') { R1.pantry = $$('input[name="pcat"]:checked', form).map(function (i) { return i.value; }); if (!R1.pantry.length) { toast('Pick at least one category for Pantry.', { icon: 'info' }); return; } }
        if (JSON.stringify(R0) !== JSON.stringify(R1) && DB) {
          DB.set('typeRules', R1);
          if (window.ADM_PG && ADM_PG.log) ADM_PG.log('settings', 'Changed the ' + editing.name + ' rule to ' + (k1 === 'Pantry' ? R1.pantry.join(', ') : (k1 === 'Top' ? R1.top : R1.loot) + '% off or more'));
          var undoR = R0; setTimeout(function () { toast('Rule saved. ' + DB.deals().filter(function (d) { return d.types.indexOf(k1) > -1; }).length + ' deals are ' + editing.name + ' now.', { action: 'Undo', onAction: function () { DB.set('typeRules', undoR); render(); } }); }, 2700);
        }
      }
      var t = tab, target = editing, prev = target ? JSON.parse(JSON.stringify(target)) : null, made;
      if (target) Object.assign(target, o); else { made = Object.assign({ id: Date.now(), n: 0 }, o); C[t].push(made); }
      A.closeSheet(); render(); flash($('[data-c="' + (target || made).id + '"]'));
      toast(target ? name + ' saved' : name + ' added', { action: 'Undo', onAction: function () { if (target) Object.assign(target, prev); else C[t].splice(C[t].indexOf(made), 1); render(); } });
    }
    $('[data-ce-save]').addEventListener('click', saveEdit); form.addEventListener('submit', function (e) { e.preventDefault(); saveEdit(); });
  })();
})();
