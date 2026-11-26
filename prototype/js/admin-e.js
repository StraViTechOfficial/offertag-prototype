/* admin-e.js — OfferTag admin prototype: Security (flagged IPs only, changes.md A-17).
   Loads after admin.js and uses its helpers (window.ADM). Sample data from build/admin_e.py. */
(function () {
  var A = window.ADM, S = window.ADM_SEC; if (!A || !S || !A.$('[data-fl]')) return;
  var $ = A.$, esc = A.esc, toast = A.toast;

  /* ---------- flagged IPs ---------- */
  var rows = S.ips.filter(function (r) { return r.status === 'flag'; });   // changes.md A-17: flagged only, no "Always allowed"
  function paintRows() {
    $('[data-fl-rows]').innerHTML = rows.map(function (r, i) {
      var act = '<button class="btn btn-outline btn-sm" type="button" data-let="' + i + '"><i data-lucide="log-in"></i>Let back in</button>';
      return '<tr><td class="c-title fl-ip">' + esc(r.ip) + '</td><td data-l="Status"><span class="pill pill-pending">Flagged</span></td>' +
        '<td class="fl-when" data-l="Added">' + esc(r.added) + '</td><td class="fl-when" data-l="Until">' + esc(r.until) + '</td><td class="c-act fl-act">' + act + '</td></tr>';
    }).join('');
    $('[data-fl-empty]').hidden = rows.length > 0;
    $('[data-fl-count]').textContent = rows.length + ' flagged';
    if (window.OTDB) OTDB.set('security', { ips: rows });
    A.icons();
  }
  $('[data-fl-rows]').addEventListener('click', function (e) {
    var b = e.target.closest('[data-let]'); if (!b) return;
    var r = rows[Number(b.dataset.let)];
    A.confirmBox('Let ' + r.ip + ' back in?', 'Its clicks carry our tag and count as views again at once. If the clicks keep coming, it is flagged again in the next 10 minutes.', 'Let back in',
      function () { var i = rows.indexOf(r); rows.splice(i, 1); paintRows(); toast(r.ip + ' is back in', { action: 'Undo', onAction: function () { rows.splice(i, 0, r); paintRows(); } }); });
  });

  paintRows();
})();
