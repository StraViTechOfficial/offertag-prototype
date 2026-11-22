/* admin-e.js — OfferTag admin prototype: Security (bot check switch, flagged IPs).
   Loads after admin.js and uses its helpers (window.ADM). Sample data from build/admin_e.py. */
(function () {
  var A = window.ADM, S = window.ADM_SEC; if (!A || !S || !A.$('[data-bc]')) return;
  var $ = A.$, esc = A.esc, toast = A.toast;

  /* ---------- bot check: turning on asks first, turning off does not ---------- */
  var bc = S.bot, busy = false, sw = $('[data-bc-switch]');
  function now() { var d = new Date(); return d.getDate() + ' ' + d.toLocaleString('en-IN', { month: 'short' }) + ', ' + d.toTimeString().slice(0, 5); }
  function paint() {
    sw.checked = bc.on; sw.disabled = busy;
    var pill = $('[data-bc-pill]');
    pill.className = 'pill ' + (busy ? 'pill-scheduled' : bc.on ? 'pill-pending' : 'pill-withdrawn');
    pill.textContent = busy ? (bc.on ? 'Turning off…' : 'Turning on…') : bc.on ? 'On' : 'Off';
    $('[data-bc-meta]').textContent = 'Last changed by ' + bc.by + ' · ' + bc.at;
    $('[data-bc-alert]').hidden = !bc.on || busy;
    $('[data-bc]').classList.toggle('is-on', bc.on && !busy);
  }
  function set(on) {
    busy = true; paint();
    setTimeout(function () { busy = false; bc.on = on; bc.by = 'Adil'; bc.at = now(); paint(); toast(on ? 'Bot check is on' : 'Bot check is off', { icon: on ? 'shield-check' : 'check' }); }, 1400);
  }
  sw.addEventListener('change', function () {
    var want = sw.checked; sw.checked = bc.on;
    if (want) A.confirmBox('Turn on the bot check?', 'Every visitor to a web page sees a 1–3 second check before it opens. Google, Bing, Shop Now and the app keep working. It starts in about 25 seconds.', 'Turn on', function () { set(true); });
    else set(false);
  });

  /* ---------- flagged IPs ---------- */
  var rows = S.ips, STATUS = { flag: ['pill-pending', 'Flagged'], allow: ['pill-live', 'Always allowed'] };
  function paintRows() {
    $('[data-fl-rows]').innerHTML = rows.map(function (r, i) {
      var s = STATUS[r.status];
      var act = r.status === 'flag'
        ? '<button class="btn btn-outline btn-sm" type="button" data-let="' + i + '"><i data-lucide="log-in"></i>Let back in</button>'
        : '<button class="btn btn-ghost btn-sm" type="button" data-let="' + i + '">Remove</button>';
      return '<tr><td class="c-title fl-ip">' + esc(r.ip) + '</td><td data-l="Status"><span class="pill ' + s[0] + '">' + s[1] + '</span></td>' +
        '<td data-l="Why"><span>' + esc(r.why) + '<small class="fl-by">' + (r.by === 'auto' ? 'by the click counter' : 'by ' + esc(r.by)) + '</small></span></td>' +
        '<td class="fl-when" data-l="Added">' + esc(r.added) + '</td><td class="fl-when" data-l="Until">' + esc(r.until) + '</td><td class="c-act fl-act">' + act + '</td></tr>';
    }).join('');
    $('[data-fl-empty]').hidden = rows.length > 0;
    $('[data-fl-count]').textContent = rows.filter(function (r) { return r.status === 'flag'; }).length + ' flagged';
    A.icons();
  }
  $('[data-fl-rows]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-let]'); if (!b) return;
    var r = rows[Number(b.dataset.let)], flagged = r.status === 'flag';
    A.confirmBox(flagged ? 'Let ' + r.ip + ' back in?' : 'Remove ' + r.ip + '?',
      flagged ? 'Its clicks carry our tag and count as views again at once. If the clicks keep coming, it is flagged again in the next 10 minutes.' : 'Its clicks are counted again, and it can be flagged like any other IP.',
      flagged ? 'Let back in' : 'Remove',
      function () { rows.splice(rows.indexOf(r), 1); paintRows(); toast(flagged ? r.ip + ' is back in' : r.ip + ' removed'); });
  });

  paint(); paintRows();
})();
