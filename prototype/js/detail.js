/* detail.js — deal detail page: review states, coupon + link copy, share, likes, replies, composer, report sheet, zoom, alerts */
(function () {
  var OT = window.OT, q = new URLSearchParams(location.search), body = document.body;

  // ---- review states (prototype only): ?state=withdrawn · ?user=1 | admin · ?coupon=1
  var DB = window.OTDB, DEAL = body.dataset.dealId || null;
  if (q.get('state') === 'withdrawn' || body.dataset.state === 'withdrawn') {
    body.classList.add('is-withdrawn'); var b = document.getElementById('withdrawn-banner'); if (b) b.hidden = false;
    document.querySelectorAll('.buy').forEach(function (a) { a.querySelector('.buy-label').textContent = 'See similar deals'; a.href = '#related'; a.removeAttribute('target'); a.removeAttribute('rel'); var ic = a.querySelector('.lucide, i'); if (ic) ic.remove(); });
  }
  var user = q.get('user') || (OT.user() ? '1' : null);
  function showSignedIn() { body.classList.add('is-signed-in'); var o = document.getElementById('composer-out'), i = document.getElementById('composer-in'); if (o) o.hidden = true; if (i) i.hidden = false; return i; }
  if (user) { showSignedIn(); if (user === 'admin') body.classList.add('is-admin'); }
  // signed in from the pop-up / sheet: stay on the deal, back to the composer if that was the origin (D-061, D-091)
  document.addEventListener('ot:signin', function (e) { var i = showSignedIn(); if (e.detail && e.detail.fromComposer && i) setTimeout(function () { var f = i.querySelector('textarea'); if (f) f.focus(); }, 360); });
  if (q.get('coupon') === '1') document.querySelectorAll('.coupon[hidden]').forEach(function (c) { c.hidden = false; });

  // ---- coupon copy (B05): copies, label flips to "Copied" for 2 s, toast; failure → select-all fallback inside OT.copy
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var code = btn.dataset.copy, lbl = btn.querySelector('span') || btn, old = lbl.textContent;
      OT.copy(code).then(function () { lbl.textContent = 'Copied'; btn.classList.add('is-done'); OT.toast('Code ' + code + ' copied', 'check'); setTimeout(function () { lbl.textContent = old; btn.classList.remove('is-done'); }, 2000); }, function () { OT.toast('Could not copy. Long-press the code to select it.', 'circle-alert'); });
    });
  });

  // ---- share: copy link (fixed template, D-058) · native share on phone
  var copyLink = document.getElementById('copy-link');
  if (copyLink) copyLink.addEventListener('click', function () { OT.copy(copyLink.dataset.share).then(function () { OT.toast('Link copied', 'check'); }, function () { OT.toast('Could not copy', 'circle-alert'); }); });
  var native = document.getElementById('share-native');
  if (native) native.addEventListener('click', function () {
    var text = copyLink ? copyLink.dataset.share : document.title;
    if (navigator.share) navigator.share({ title: document.title, text: text }).catch(function () {}); else copyLink && copyLink.click();
  });

  // ---- alerts opt-in trigger (D-055): prototype toggles the label only
  var alerts = document.getElementById('alerts-toggle');
  if (alerts) alerts.addEventListener('click', function () { var on = alerts.getAttribute('aria-pressed') !== 'true'; alerts.setAttribute('aria-pressed', on); alerts.querySelector('span').textContent = on ? 'Alerts on' : 'Browser alerts'; OT.toast(on ? 'Browser alerts on for new loot' : 'Browser alerts off', on ? 'bell-ring' : 'bell-off'); });

  // ---- image zoom
  var lb = document.getElementById('lightbox'), zoom = document.getElementById('zoom-open');
  function openLb() { lb.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { lb.dataset.state = 'open'; }); }); body.style.overflow = 'hidden'; }
  function closeLb() { lb.dataset.state = 'closed'; body.style.overflow = ''; setTimeout(function () { lb.hidden = true; zoom.focus(); }, 150); }
  if (zoom && lb) { zoom.addEventListener('click', openLb); lb.addEventListener('click', closeLb); document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !lb.hidden) closeLb(); }); }

  // ---- comments
  var list = document.getElementById('comment-list'), countEls = [document.getElementById('comment-count')], empty = document.getElementById('comments-empty'), more = document.getElementById('comments-more');
  var linkCount = document.querySelector('.comment-link'); var total = list ? list.querySelectorAll(':scope > .comment').length : 0;
  function setCount() { countEls[0].textContent = '(' + total + ')'; if (linkCount) linkCount.childNodes[1].textContent = total + ' comments'; if (empty) empty.hidden = total > 0; }
  function rel(name, admin) { return '<div class="avatar' + (admin ? ' is-admin' : '') + '" aria-hidden="true">' + name.charAt(0).toUpperCase() + '</div><div class="who"><b></b>' + (admin ? '<span class="badge badge-secondary">OfferTag</span>' : '') + '<time>Just now</time></div>'; }
  function esc(s) { return s.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // D-149: a pasted link is plain text, never clickable: http(s)://, www. and the host's .com are removed ("https://www.amazon.com/dp/B0X" → "amazon/dp/B0X").
  // [text](url) reads "text (url)". The API runs the same trim when a comment is saved, so the site and the app show the same text.
  function trimLinks(s) {
    return s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1 ($2)')
      .replace(/(?<![\w.\/@-])(?:https?:\/\/)?(?:www\.)?((?:[a-z0-9-]+\.)*[a-z0-9-]+)\.com(?:\/(?=[\s.,;:!?)]|$))?(?![\w-]|\.[a-z0-9])/gi, '$1')
      .replace(/\bhttps?:\/\/(?:www\.)?/gi, '')
      .replace(/(?<![\w.\/-])www\./gi, '');
  }
  OT.trimLinks = trimLinks;
  function fmt(s) { // bold **x** only; links are plain text (D-149)
    return esc(trimLinks(s)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  }
  function makeComment(text, name, admin, reply) {
    var li = document.createElement('li'); li.className = 'comment'; li.innerHTML = rel(name, admin) + '<p class="text">' + fmt(text) + '</p><div class="c-acts">' + OT.emoji.ACTS + (reply ? '' : '<button class="btn btn-ghost reply-btn" type="button"><i data-lucide="reply"></i>Reply</button>') + '<button class="btn btn-ghost c-del" type="button"><i data-lucide="trash-2"></i>Delete</button></div>' + (reply ? '' : '<ol class="replies"></ol>');
    li.querySelector('.who b').textContent = name; return li;
  }
  function wire(root) {
    OT.emoji.wireReactions(root);   // D-147: six reactions replace the heart like
    root.querySelectorAll('.reply-btn').forEach(function (b) { if (b.dataset.wired) return; b.dataset.wired = 1; b.addEventListener('click', function () { openReply(b.closest('.comment')); }); });
    root.querySelectorAll('.c-del').forEach(function (b) { if (b.dataset.wired) return; b.dataset.wired = 1; b.addEventListener('click', function () { var li = b.closest('.comment'); var isTop = li.parentNode === list; if (DB && li.dataset.cid) DB.deleteComment(li.dataset.cid); li.remove(); if (isTop) { total--; setCount(); } OT.toast('Comment deleted', 'trash-2'); }); });
    root.querySelectorAll('.more-replies').forEach(function (b) { if (b.dataset.wired) return; b.dataset.wired = 1; b.addEventListener('click', function () { b.closest('.comment').querySelectorAll('.replies > [hidden]').forEach(function (r) { r.hidden = false; }); b.remove(); }); });
    OT.icons();
  }
  var openForm = null;
  function openReply(li) {
    if (!body.classList.contains('is-signed-in')) { OT.toast('Sign in to reply', 'log-in'); document.getElementById('composer').scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (openForm) openForm.remove();
    var f = document.createElement('form'); f.className = 'reply-form'; f.innerHTML = '<div class="ta-wrap"><textarea class="textarea" rows="1" placeholder="Write a reply…" aria-label="Write a reply"></textarea><button type="button" class="btn btn-ghost btn-sm btn-icon ta-emoji" aria-label="Emoji"><i data-lucide="smile"></i></button></div><div class="acts"><button class="btn btn-default btn-sm" type="submit">Post</button><button class="btn btn-ghost btn-sm" type="button" data-cancel>Cancel</button></div>';
    li.querySelector('.replies').before(f); openForm = f; OT.icons(); OT.emoji.attach(f.querySelector('textarea'), null, f.querySelector('.ta-emoji')); f.querySelector('textarea').focus();
    f.querySelector('[data-cancel]').addEventListener('click', function () { f.remove(); openForm = null; });
    f.addEventListener('submit', function (e) { e.preventDefault(); var t = f.querySelector('textarea').value.trim(); if (!t) return; if (OT.emoji.tooLong(f.querySelector('textarea'))) { OT.toast('Keep it to 300 characters', 'circle-alert'); return; } var r = makeComment(t, body.classList.contains('is-admin') ? 'OfferTag' : 'You', body.classList.contains('is-admin'), true); if (DB && DEAL) r.dataset.cid = DB.addComment({ deal: DEAL, parent: li.dataset.cid || null, name: body.classList.contains('is-admin') ? 'OfferTag' : 'You', admin: body.classList.contains('is-admin'), text: trimLinks(t) }).id; li.querySelector('.replies').appendChild(r); wire(r); f.remove(); openForm = null; });
  }
  if (list) { wire(list); setCount(); }
  document.addEventListener('ot:react', function (e) { var li = e.detail.li; if (DB && li && li.dataset.cid) DB.setReactions(li.dataset.cid, e.detail.rx); });
  if (more) more.querySelector('button').addEventListener('click', function () { var hid = list.querySelectorAll(':scope > .comment[hidden]'); Array.prototype.slice.call(hid, 0, 10).forEach(function (c) { c.hidden = false; }); if (list.querySelectorAll(':scope > .comment[hidden]').length === 0) more.hidden = true; });

  // composer (signed in): bold wrap, counter, post
  var cin = document.getElementById('composer-in'), ta = document.getElementById('comment-text'), chars = document.getElementById('chars'), err = document.getElementById('comment-error');
  if (cin) {
    OT.emoji.attach(ta, chars, cin.querySelector('[data-emoji]'));   // D-147: picker, ":" search, smileys, count where an emoji is 1
    cin.querySelectorAll('[data-wrap]').forEach(function (b) { b.addEventListener('click', function () {
      var s = ta.selectionStart, e = ta.selectionEnd, sel = ta.value.slice(s, e) || 'text', w = '**' + sel + '**';
      ta.setRangeText(w, s, e, 'end'); ta.focus(); ta.dispatchEvent(new Event('input'));
    }); });
    cin.addEventListener('submit', function (e) {
      e.preventDefault(); var t = ta.value.trim(); if (!t) { ta.focus(); return; }
      if (OT.emoji.tooLong(ta)) { OT.toast('Keep it to 300 characters', 'circle-alert'); ta.focus(); return; }
      if (q.get('fail') === '1') { err.hidden = false; return; } err.hidden = true;
      var li = makeComment(t, body.classList.contains('is-admin') ? 'OfferTag' : 'You', body.classList.contains('is-admin')); if (DB && DEAL) li.dataset.cid = DB.addComment({ deal: DEAL, parent: null, name: body.classList.contains('is-admin') ? 'OfferTag' : 'You', admin: body.classList.contains('is-admin'), text: trimLinks(t) }).id; list.prepend(li); wire(li); total++; setCount(); ta.value = ''; chars.textContent = '0/300'; OT.toast('Comment posted', 'check');
    });
  }

  // ---- report a problem (DEV-013): bottom sheet on phone, dialog on desktop; feeds the feedback table as type 2 (Issue)
  var rs = document.getElementById('report-sheet'), rf = document.getElementById('report-form'), rd = document.getElementById('report-done'), ro = document.getElementById('report-open');
  if (rs && ro && rf) {
    ro.addEventListener('click', function () { OT.openSheet(rs); });
    if (q.get('report') === '1') setTimeout(function () { OT.openSheet(rs); }, 50);
    rf.addEventListener('submit', function (e) { e.preventDefault();
      if (DB && DEAL) { var dd = DB.deal(DEAL), rr = rf.querySelector('input[name="reason"]:checked'); DB.addInbox('reports', { reason: rr ? rr.closest('.opt').querySelector('.txt').textContent : 'Something else', deal: dd ? dd.t : document.title, did: DEAL, page: dd ? dd.page : location.pathname, who: rf.elements.email.value.trim() || (OT.user() ? OT.user().email : 'Signed out'), note: rf.elements.note.value.trim() }); }   // S25 playground: Admin → Inbox → Reports
      rf.hidden = true; rs.querySelector('.sheet-footer').hidden = true; rd.hidden = false; OT.icons(); });
    rs.addEventListener('sheet:close', function () { rf.reset(); rf.hidden = false; rs.querySelector('.sheet-footer').hidden = false; rd.hidden = true; });
  }
})();
