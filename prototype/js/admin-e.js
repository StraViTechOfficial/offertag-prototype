/* admin-e.js — OfferTag admin prototype: Security (flagged IPs only, changes.md A-17).
   Loads after admin.js and uses its helpers (window.ADM). Sample data from build/admin_e.py. */
(function () {
  var A = window.ADM, S = window.ADM_SEC; if (!A || !S || !A.$('[data-fl]')) return;
  var $ = A.$, esc = A.esc, toast = A.toast;

  /* ---------- flagged IPs ---------- */
  var rows = S.ips.filter(function (r) { return r.status === 'flag'; });   // changes.md A-17: flagged only, no "Always allowed"
  function paintRows() {
    $('[data-fl-rows]').innerHTML = rows.map(function (r, i) {
      return '<tr><td class="c-title fl-ip">' + esc(r.ip) + '</td><td data-l="Status"><span class="pill pill-pending">Flagged</span></td>' +
        '<td class="fl-when" data-l="Added">' + esc(r.added) + '</td><td class="fl-when" data-l="Until">' + esc(r.until) + '</td></tr>';   // P-50: tag always kept, so no Let back in
    }).join('');
    $('[data-fl-empty]').hidden = rows.length > 0;
    $('[data-fl-count]').textContent = rows.length + ' flagged';
    if (window.OTDB) OTDB.set('security', { ips: rows });
    A.icons();
  }
  paintRows();
})();
