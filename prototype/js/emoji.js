/* emoji.js — comment emoji (D-147): picker, ":" shortcode search, smileys that turn into emoji, a 300-character count where an emoji is 1,
   and the six reactions (one per member per comment) with counts and who reacted. Prototype: no backend; reactions start from SAMPLE data. */
(function () {
  'use strict';
  var PICKER_VER = '1.29.1';
  var CDN = 'https://cdn.jsdelivr.net/npm/emoji-picker-element@' + PICKER_VER + '/';
  var MAX = 300;
  var REACTIONS = [['👍', 'Like'], ['❤️', 'Love'], ['😂', 'Haha'], ['😮', 'Wow'], ['🔥', 'Hot deal'], ['😢', 'Sad']];
  var LABEL = {}; REACTIONS.forEach(function (r) { LABEL[r[0]] = r[1]; });
  var SMILEYS = { ':)': '🙂', ':-)': '🙂', ':D': '😄', ':-D': '😄', ';)': '😉', ';-)': '😉', ':P': '😛', ':p': '😛', ':(': '🙁', ':-(': '🙁', ":'(": '😢', ':o': '😮', ':O': '😮', '<3': '❤️', 'xD': '😆', 'XD': '😆', '(y)': '👍', ':*': '😘', 'B)': '😎' };
  var touch = window.matchMedia('(hover: none)').matches;
  var phone = function () { return window.matchMedia('(max-width: 639px)').matches; };
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var body = document.body;
  var signedIn = function () { return body.classList.contains('is-signed-in'); };
  var me = function () { return body.classList.contains('is-admin') ? 'OfferTag' : 'You'; };

  // ---- length: what people see (an emoji or flag is 1)
  var seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter('en', { granularity: 'grapheme' }) : null;
  function len(s) { if (!seg) return Array.from(s).length; var n = 0; for (var it = seg.segment(s)[Symbol.iterator](), x = it.next(); !x.done; x = it.next()) n++; return n; }

  // ---- emoji data (the picker's own database, loaded once)
  var dbP = null;
  function db() {
    if (!dbP) dbP = import(CDN + 'database.js').then(function (m) { return new (m.default || m.Database)(); });
    return dbP;
  }
  function loadPicker() { if (!customElements.get('emoji-picker')) import(CDN + 'picker.js'); }

  function insertAt(ta, text, s, e) {
    s = s == null ? ta.selectionStart : s; e = e == null ? ta.selectionEnd : e;
    ta.focus(); ta.setRangeText(text, s, e, 'end');
    ta.dispatchEvent(new Event('input', { bubbles: true }));
  }

  // ---- picker: popover on desktop, bottom sheet on phones; stays open for several picks
  var pop, picker, target, caret = [0, 0], opener, scrim;
  function buildPicker() {
    loadPicker();
    pop = document.createElement('div'); pop.className = 'emoji-pop'; pop.hidden = true; pop.setAttribute('role', 'dialog'); pop.setAttribute('aria-label', 'Emoji');
    pop.innerHTML = '<div class="ep-head"><b>Emoji</b><button class="btn btn-ghost btn-sm" type="button" data-ep-done>Done</button></div>';
    picker = document.createElement('emoji-picker');
    picker.setAttribute('class', document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    pop.appendChild(picker);
    scrim = document.createElement('div'); scrim.className = 'emoji-scrim'; scrim.hidden = true;
    document.body.append(scrim, pop);
    picker.addEventListener('emoji-click', function (e) {
      if (!target) return;
      insertAt(target, e.detail.unicode, caret[0], caret[1]);
      caret = [target.selectionStart, target.selectionEnd];
      if (phone()) closePicker();
    });
    pop.querySelector('[data-ep-done]').addEventListener('click', function () { closePicker(); });
    scrim.addEventListener('click', function () { closePicker(); });
    document.addEventListener('mousedown', function (e) { if (!pop.hidden && !pop.contains(e.target) && e.target !== opener && !(opener && opener.contains(e.target))) closePicker(true); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pop.hidden) { closePicker(); } });
    window.addEventListener('resize', function () { if (!pop.hidden) place(); });
  }
  function place() {
    if (phone()) { pop.classList.add('is-sheet'); pop.style.left = pop.style.top = ''; return; }
    pop.classList.remove('is-sheet');
    var r = opener.getBoundingClientRect(), w = 352, h = 400, left = Math.min(Math.max(8, r.left), window.innerWidth - w - 8);
    var top = r.bottom + 6 + h > window.innerHeight && r.top - 6 - h > 0 ? r.top - 6 - h : r.bottom + 6;
    pop.style.left = left + 'px'; pop.style.top = Math.max(8, top) + 'px';
  }
  function openPicker(btn, ta) {
    if (!pop) buildPicker();
    if (!pop.hidden && opener === btn) return closePicker();
    target = ta; opener = btn; caret = [ta.selectionStart, ta.selectionEnd];
    picker.setAttribute('class', document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    pop.hidden = false; place(); scrim.hidden = !phone(); btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { pop.dataset.state = 'open'; var s = picker.shadowRoot && picker.shadowRoot.querySelector('input'); if (s && !touch) s.focus(); });
  }
  function closePicker(keepFocus) {
    if (!pop || pop.hidden) return;
    pop.hidden = true; scrim.hidden = true; pop.dataset.state = 'closed';
    if (opener) opener.setAttribute('aria-expanded', 'false');
    if (!keepFocus && target) { target.focus(); target.setSelectionRange(caret[0], caret[1]); }
  }

  // ---- ":" search: ":fi" suggests 🔥 :fire:, arrows to move, Enter or Tab to pick, Esc to close
  var sc = null, scItems = [], scAt = 0, scFor = null, scRange = null, scSeq = 0;
  function scBuild() {
    sc = document.createElement('ul'); sc.className = 'sc-pop'; sc.setAttribute('role', 'listbox'); sc.id = 'sc-pop'; sc.hidden = true;
    document.body.appendChild(sc);
    sc.addEventListener('mousedown', function (e) { var li = e.target.closest('li'); if (!li) return; e.preventDefault(); scPick(+li.dataset.i); });
  }
  function scClose() { if (sc) { sc.hidden = true; scItems = []; } if (scFor) { scFor.removeAttribute('aria-activedescendant'); scFor.setAttribute('aria-expanded', 'false'); } }
  function scPick(i) {
    var it = scItems[i]; if (!it || !scFor) return;
    insertAt(scFor, it.unicode, scRange[0], scRange[1]); scClose();
  }
  function scShow() {
    sc.innerHTML = scItems.map(function (e, i) { return '<li role="option" id="sc-' + i + '" data-i="' + i + '" aria-selected="' + (i === scAt) + '"><span class="sc-e">' + e.unicode + '</span><span class="sc-n">:' + e.code + ':</span></li>'; }).join('');
    var r = scFor.getBoundingClientRect();
    sc.style.left = Math.min(r.left, window.innerWidth - 248) + 'px';
    sc.style.top = (r.bottom + 4 + 260 > window.innerHeight ? r.top - 4 - Math.min(260, scItems.length * 40 + 8) : r.bottom + 4) + 'px';
    sc.hidden = false; scFor.setAttribute('aria-expanded', 'true'); scFor.setAttribute('aria-activedescendant', 'sc-' + scAt);
  }
  function scQuery(ta) {
    var pos = ta.selectionStart, before = ta.value.slice(0, pos), m = before.match(/(^|\s):([a-z0-9_+-]{2,24})$/i);
    if (!m || ta.selectionStart !== ta.selectionEnd) return scClose();
    var term = m[2].toLowerCase(), seq = ++scSeq; scFor = ta; scRange = [pos - term.length - 1, pos];
    db().then(function (d) { return d.getEmojiBySearchQuery(term); }).then(function (list) {
      if (seq !== scSeq) return;
      var out = [];
      list.forEach(function (e) {
        var codes = (e.shortcodes || []).concat([e.annotation.replace(/\s+/g, '_')]);
        var code = codes.find(function (c) { return c.indexOf(term) === 0; }) || codes[0];
        out.push({ unicode: e.unicode, code: code, starts: codes.some(function (c) { return c.indexOf(term) === 0; }) });
      });
      out.sort(function (a, b) { return (b.starts - a.starts) || (a.code.length - b.code.length); });
      scItems = out.slice(0, 6); scAt = 0;
      if (!scItems.length) return scClose();
      if (!sc) scBuild(); scShow();
    }).catch(scClose);
  }

  // ---- attach to a text box: counter, ":" search, smileys
  function attach(ta, counter, emojiBtn) {
    if (!ta || ta.dataset.emojiOn) return; ta.dataset.emojiOn = 1;
    ta.removeAttribute('maxlength'); ta.setAttribute('aria-autocomplete', 'list'); ta.setAttribute('aria-controls', 'sc-pop'); ta.setAttribute('aria-expanded', 'false');
    var last = null; // the smiley just converted, so Backspace can undo it
    ta.addEventListener('input', function (e) {
      if (e.inputType === 'insertText' && e.data === ' ') {
        var pos = ta.selectionStart, before = ta.value.slice(0, pos - 1), m = before.match(/(^|\s)(\S{2,3})$/);
        if (m && SMILEYS[m[2]]) {
          var s = pos - 1 - m[2].length, em = SMILEYS[m[2]];
          ta.setRangeText(em + ' ', s, pos, 'end'); last = { at: s + em.length + 1, text: m[2], emoji: em };
        } else last = null;
      } else if (e.inputType !== 'deleteContentBackward') last = null;
      if (counter) { var n = len(ta.value); counter.textContent = n + '/' + MAX; counter.classList.toggle('is-over', n > MAX); }
      scQuery(ta);
    });
    ta.addEventListener('keydown', function (e) {
      if (sc && !sc.hidden && scFor === ta) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); scAt = (scAt + (e.key === 'ArrowDown' ? 1 : scItems.length - 1)) % scItems.length; scShow(); return; }
        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); scPick(scAt); return; }
        if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); scClose(); return; }
      }
      if (e.key === 'Backspace' && last && ta.selectionStart === last.at && ta.selectionStart === ta.selectionEnd) {
        e.preventDefault(); var s = last.at - last.emoji.length - 1; ta.setRangeText(last.text + ' ', s, last.at, 'end'); last = null;
        ta.dispatchEvent(new Event('input'));
      }
    });
    ta.addEventListener('blur', function () { setTimeout(function () { if (document.activeElement !== ta) scClose(); }, 120); });
    if (emojiBtn) {
      emojiBtn.setAttribute('aria-haspopup', 'dialog'); emojiBtn.setAttribute('aria-expanded', 'false');
      emojiBtn.addEventListener('mousedown', function (e) { e.preventDefault(); });
      emojiBtn.addEventListener('click', function () { openPicker(emojiBtn, ta); });
    }
  }
  function tooLong(ta) { return len(ta.value.trim()) > MAX; }

  // ---- reactions: pills with counts, the six on a bar, one per member per comment
  var tip = null, tipT = 0;
  function showTip(pill) {
    if (!tip) { tip = document.createElement('div'); tip.className = 'rx-tip'; tip.setAttribute('role', 'tooltip'); tip.id = 'rx-tip'; document.body.appendChild(tip); }
    var who = (pill.dataset.who || '').split('|').filter(Boolean), n = +pill.querySelector('b').textContent;
    var names = who.slice(0, 3), rest = n - names.length;
    tip.textContent = (names.length ? names.join(', ') + (rest > 0 ? ' and ' + rest + ' other' + (rest > 1 ? 's' : '') : '') : n + ' people') + ' reacted ' + LABEL[pill.dataset.e];
    var r = pill.getBoundingClientRect(); tip.hidden = false;
    tip.style.left = Math.max(8, Math.min(r.left + r.width / 2 - tip.offsetWidth / 2, window.innerWidth - tip.offsetWidth - 8)) + 'px';
    tip.style.top = (r.top - tip.offsetHeight - 6) + 'px'; pill.setAttribute('aria-describedby', 'rx-tip');
  }
  function hideTip() { if (tip) tip.hidden = true; }

  function pillHTML(e, n, who, mine) {
    return '<button class="rx-pill" type="button" data-e="' + e + '" data-who="' + who.join('|') + '" aria-pressed="' + !!mine + '" aria-label="' + LABEL[e] + ', ' + n + ' reaction' + (n === 1 ? '' : 's') + (mine ? ', you reacted' : '') + '"><span class="rx-e" aria-hidden="true">' + e + '</span><b>' + n + '</b></button>';
  }
  function mineOf(li) { var p = li.querySelector(':scope > .c-acts .rx-pill[aria-pressed="true"]'); return p ? p.dataset.e : null; }
  function setReaction(li, e) {
    var box = li.querySelector(':scope > .c-acts .rx-pills'), old = mineOf(li), name = me(), state = {};
    box.querySelectorAll('.rx-pill').forEach(function (p) { state[p.dataset.e] = { n: +p.querySelector('b').textContent, who: (p.dataset.who || '').split('|').filter(Boolean) }; });
    if (old) { state[old].n--; state[old].who = state[old].who.filter(function (w) { return w !== name; }); }
    var next = e === old ? null : e;
    if (next) { state[next] = state[next] || { n: 0, who: [] }; state[next].n++; state[next].who.unshift(name); }
    box.innerHTML = REACTIONS.filter(function (r) { return state[r[0]] && state[r[0]].n > 0; }).map(function (r) { return pillHTML(r[0], state[r[0]].n, state[r[0]].who, r[0] === next); }).join('');
    var add = li.querySelector(':scope > .c-acts .rx-add');
    add.classList.toggle('has-mine', !!next); add.querySelector('.rx-add-e').textContent = next || '';
    add.setAttribute('aria-label', next ? 'Your reaction: ' + LABEL[next] + '. Change reaction' : 'React');
    if (next && !reduce) { var p = box.querySelector('[data-e="' + next + '"]'); if (p) { p.classList.add('is-pop'); setTimeout(function () { p.classList.remove('is-pop'); }, 400); } }
    hideTip();
  }

  var bar = null, barFor = null, barT = 0;
  function buildBar() {
    bar = document.createElement('div'); bar.className = 'rx-bar'; bar.setAttribute('role', 'menu'); bar.setAttribute('aria-label', 'Reactions'); bar.hidden = true;
    bar.innerHTML = REACTIONS.map(function (r) { return '<button type="button" role="menuitemradio" aria-checked="false" data-e="' + r[0] + '" aria-label="' + r[1] + '" data-tip="' + r[1] + '"><span aria-hidden="true">' + r[0] + '</span></button>'; }).join('');
    document.body.appendChild(bar);
    bar.addEventListener('click', function (ev) { var b = ev.target.closest('button'); if (!b || !barFor) return; var li = barFor.closest('.comment'); setReaction(li, b.dataset.e); closeBar(true); });
    bar.addEventListener('keydown', function (ev) {
      var bs = Array.prototype.slice.call(bar.querySelectorAll('button')), i = bs.indexOf(document.activeElement);
      if (ev.key === 'ArrowRight' || ev.key === 'ArrowLeft') { ev.preventDefault(); bs[(i + (ev.key === 'ArrowRight' ? 1 : bs.length - 1)) % bs.length].focus(); }
      if (ev.key === 'Escape') { ev.preventDefault(); closeBar(true); }
    });
    bar.addEventListener('mouseenter', function () { clearTimeout(barT); });
    bar.addEventListener('mouseleave', function () { barT = setTimeout(function () { closeBar(); }, 300); });
    document.addEventListener('pointerdown', function (ev) { if (!bar.hidden && !bar.contains(ev.target) && !(barFor && barFor.contains(ev.target))) closeBar(); });
    window.addEventListener('scroll', function () { if (!bar.hidden) closeBar(); }, { passive: true });
  }
  function openBar(btn, focus) {
    if (!bar) buildBar();
    clearTimeout(barT); barFor = btn;
    var mine = mineOf(btn.closest('.comment'));
    bar.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', b.dataset.e === mine); });
    bar.hidden = false; var r = btn.getBoundingClientRect();
    bar.style.left = Math.max(8, Math.min(r.left - 8, window.innerWidth - bar.offsetWidth - 8)) + 'px';
    bar.style.top = (r.top - bar.offsetHeight - 8 < 8 ? r.bottom + 8 : r.top - bar.offsetHeight - 8) + 'px';
    btn.setAttribute('aria-expanded', 'true');
    requestAnimationFrame(function () { bar.dataset.state = 'open'; if (focus) (bar.querySelector('[aria-checked="true"]') || bar.querySelector('button')).focus(); });
  }
  function closeBar(refocus) {
    if (!bar || bar.hidden) return;
    bar.hidden = true; bar.dataset.state = 'closed';
    if (barFor) { barFor.setAttribute('aria-expanded', 'false'); if (refocus) barFor.focus(); }
  }
  function askSignIn() {
    OT.toast('Sign in to react', 'log-in');
    var s = document.querySelector('#composer-out [data-signin-open]'); if (s) s.click();
  }

  function wireReactions(root) {
    root.querySelectorAll('.rx-add').forEach(function (b) {
      if (b.dataset.wired) return; b.dataset.wired = 1;
      var held = false, holdT = 0;
      b.addEventListener('click', function () {
        if (held) { held = false; return; }
        if (!signedIn()) return askSignIn();
        if (touch) return bar && !bar.hidden && barFor === b ? closeBar() : openBar(b);
        var li = b.closest('.comment'); setReaction(li, mineOf(li) || '👍');   // one click: 👍 on, or your reaction off
      });
      b.addEventListener('keydown', function (e) { if ((e.key === 'ArrowUp' || e.key === 'ArrowDown') && signedIn()) { e.preventDefault(); openBar(b, true); } });
      if (!touch) {
        b.addEventListener('mouseenter', function () { if (!signedIn()) return; clearTimeout(barT); barT = setTimeout(function () { openBar(b); }, 450); });
        b.addEventListener('mouseleave', function () { clearTimeout(barT); barT = setTimeout(function () { closeBar(); }, 300); });
      }
      b.addEventListener('contextmenu', function (e) { if (touch) e.preventDefault(); });
      b.addEventListener('pointerdown', function () { held = false; clearTimeout(holdT); holdT = setTimeout(function () { held = true; if (signedIn()) openBar(b); else askSignIn(); }, 500); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach(function (t) { b.addEventListener(t, function () { clearTimeout(holdT); }); });
    });
    // pills: tap toggles that reaction (or switches to it); hover or long-press shows who reacted
    root.querySelectorAll('.rx-pills').forEach(function (box) {
      if (box.dataset.wired) return; box.dataset.wired = 1;
      var holdT = 0, held = false;
      box.addEventListener('click', function (e) { var p = e.target.closest('.rx-pill'); if (!p) return; if (held) { held = false; return; } if (!signedIn()) return askSignIn(); setReaction(p.closest('.comment'), p.dataset.e); });
      box.addEventListener('mouseover', function (e) { var p = e.target.closest('.rx-pill'); if (p && !touch) { clearTimeout(tipT); tipT = setTimeout(function () { showTip(p); }, 250); } });
      box.addEventListener('mouseout', function () { clearTimeout(tipT); hideTip(); });
      box.addEventListener('focusin', function (e) { var p = e.target.closest('.rx-pill'); if (p) showTip(p); });
      box.addEventListener('focusout', hideTip);
      box.addEventListener('pointerdown', function (e) { var p = e.target.closest('.rx-pill'); if (!p || !touch) return; held = false; holdT = setTimeout(function () { held = true; showTip(p); setTimeout(hideTip, 2200); }, 450); });
      box.addEventListener('pointerup', function () { clearTimeout(holdT); });
      box.addEventListener('contextmenu', function (e) { if (touch) e.preventDefault(); });
    });
  }
  // the reaction block of a new comment
  var ACTS = '<span class="rx-pills" role="group" aria-label="Reactions"></span><button class="btn btn-ghost rx-add" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="React"><i data-lucide="smile-plus"></i><span class="rx-add-e" aria-hidden="true"></span></button>';

  OT.emoji = { attach: attach, tooLong: tooLong, len: len, wireReactions: wireReactions, ACTS: ACTS, MAX: MAX };
})();
