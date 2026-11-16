/* admin-login.js — screen 37, Admin sign-in (D-105). Prototype rules (data sheet admin-login.md, SAMPLE):
   any @offertag.in address is staff, one starting "sub" is a sub-admin, everything else has no admin access;
   000000 is the wrong code, any other 6 digits work; Google signs in as Adil (admin). */
(function () {
  function $(s) { return document.querySelector(s); }
  var steps = document.querySelectorAll('[data-alog-step]'), EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, timer = null, left = 0, tries = 5, sentTo = '';
  var qs = new URLSearchParams(location.search), back = qs.get('url');
  function show(name) { steps.forEach(function (s) { s.hidden = s.dataset.alogStep !== name; }); var f = $('[data-alog-step="' + name + '"] input'); if (f) setTimeout(function () { f.focus(); }, 30); }
  function err(sel, msg) { var e = $(sel); e.textContent = msg; e.hidden = !msg; var i = e.previousElementSibling; if (i && i.matches('input')) i.setAttribute('aria-invalid', msg ? 'true' : 'false'); }
  function clock() { var r = $('[data-alog-resend]'); r.textContent = left > 0 ? 'Resend code in 0:' + (left < 10 ? '0' : '') + left : 'Resend code'; r.disabled = left > 0; }
  function count() { clearInterval(timer); left = 30; clock(); timer = setInterval(function () { left--; clock(); if (left <= 0) clearInterval(timer); }, 1000); }
  function toast(msg) { var t = document.getElementById('toaster'), el = document.createElement('div'); el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg; t.appendChild(el); requestAnimationFrame(function () { el.classList.add('is-in'); }); setTimeout(function () { el.remove(); }, 3500); }
  function enter(addr) {
    var staff = /@offertag\.in$/i.test(addr), sub = /^sub/i.test(addr);
    if (!staff) { $('[data-alog-who]').textContent = addr; show('denied'); return; }
    var safe = back && /^\/admin(\/|$|\?)/.test(back) ? back : null;   // only return to an admin address
    location.href = sub ? '/admin/deal?role=sub' : (safe || '/admin');
  }
  function toCode(addr) { sentTo = addr; tries = 5; $('[data-alog-to]').textContent = addr; $('[data-alog-code] input').value = ''; err('[data-alog-code-err]', ''); show('code'); count(); }

  $('[data-alog-email]').addEventListener('submit', function (e) {
    e.preventDefault(); var v = this.email.value.trim();
    if (!EMAIL.test(v)) { err('[data-alog-email-err]', 'Enter a valid email address.'); this.email.focus(); return; }
    err('[data-alog-email-err]', ''); toCode(v);
  });
  $('[data-alog-email] input').addEventListener('input', function () { err('[data-alog-email-err]', ''); });
  $('[data-alog-code]').addEventListener('submit', function (e) {
    e.preventDefault(); var v = this.code.value.replace(/\D/g, '');
    if (v.length < 6) { err('[data-alog-code-err]', 'Enter all 6 digits.'); return; }
    if (v === '000000') {
      tries--; this.code.value = '';
      if (tries <= 0) { err('[data-alog-code-err]', 'Too many tries. Wait 15 minutes, then ask for a new code.'); this.code.disabled = true; return; }
      err('[data-alog-code-err]', 'That code is not right. ' + tries + (tries === 1 ? ' try' : ' tries') + ' left.'); this.code.focus(); return;
    }
    clearInterval(timer); enter(sentTo);
  });
  $('[data-alog-code] input').addEventListener('input', function () { this.value = this.value.replace(/\D/g, '').slice(0, 6); err('[data-alog-code-err]', ''); if (this.value.length === 6) $('[data-alog-code]').requestSubmit(); });
  $('[data-alog-resend]').addEventListener('click', function () { count(); toast('New code sent to ' + sentTo); });
  $('[data-alog-change]').addEventListener('click', function () { clearInterval(timer); show('start'); });
  $('[data-alog-again]').addEventListener('click', function () { $('[data-alog-email]').reset(); show('start'); });
  $('[data-alog-google]').addEventListener('click', function () { enter('adil@offertag.in'); });

  var st = qs.get('state');
  if (st === 'code') toCode('adil@offertag.in');
  else if (st === 'denied') { $('[data-alog-who]').textContent = 'mohit.k@gmail.com'; show('denied'); }
  else { if (st === 'out') $('[data-alog-out]').hidden = false; show('start'); }
  if (window.lucide) lucide.createIcons();
})();
