/* listing.js — client-side filters, sort, density, hybrid loading (D-032) and phone sheets for the listing pages */
(function () {
  var results = document.getElementById('results'); if (!results) return;
  var cards = Array.prototype.slice.call(results.querySelectorAll('.deal'));
  cards.forEach(function (c, i) { c.dataset.order = i; });
  var form = document.getElementById('filter-form'), filters = document.getElementById('filters');
  var countEl = document.getElementById('count'), sheetCount = document.getElementById('sheet-count'), chips = document.getElementById('chips');
  var loadState = document.getElementById('load-state'), empty = document.getElementById('empty'), filterCount = document.getElementById('filter-count');
  var sortLabel = document.getElementById('sort-label'), sortLabelM = document.getElementById('sort-label-m');
  var PAGE = 16, limit = PAGE, batch = 1, AUTO = 2, loading = false; // auto-load 2 batches, then a button, then auto again
  var sortMode = document.body.dataset.defaultSort || 'recommended';
  // S13: search page (kind=search) applies the old LIKE rule on title + category + store, pinned dropped when q is present (W14)
  var KIND = document.body.dataset.kind || 'type', Q = (new URLSearchParams(location.search).get('q') || '').trim(), QL = Q.toLowerCase();
  var h1 = document.getElementById('page-title'), rule = document.getElementById('page-rule'), emptyText = document.getElementById('empty-text'), emptyClear = document.getElementById('empty-clear'), emptyFeed = document.getElementById('empty-feed');
  if (KIND === 'search' && Q) { h1.textContent = 'Results for \u201c' + Q + '\u201d'; document.title = 'Search: ' + Q + ' \u2014 OfferTag'; try { localStorage.setItem('ot-recent', JSON.stringify([Q].concat(JSON.parse(localStorage.getItem('ot-recent') || '[]').filter(function (x) { return x !== Q; })).slice(0, 5))); } catch (e) {} }
  var sortNames = { recommended: 'Recommended', newest: 'Newest', disc: 'Discount', saving: 'Biggest saving', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', views: 'Most viewed' };
  var sortItems = document.querySelectorAll('#sort-menu [data-sort]'), mobileSort = document.querySelectorAll('input[name="sortm"]');

  function state() {
    var s = { cat: [], store: [], disc: 0, price: null, posted: null, pmin: null, pmax: null, type: [], coupon: false };
    form.querySelectorAll('input[name="cat"]:checked').forEach(function (i) { s.cat.push(i.value); });
    form.querySelectorAll('input[name="store"]:checked').forEach(function (i) { s.store.push(i.value); });
    var d = form.querySelector('input[name="disc"]:checked'); s.disc = d ? +d.value : 0;
    var p = form.querySelector('input[name="price"]:checked'); s.price = p && p.value ? p.value.split('-').map(function (x) { return x === '' ? null : +x; }) : null;
    var t = form.querySelector('input[name="posted"]:checked'); s.posted = t && t.value ? +t.value : null;
    var mn = form.querySelector('input[name="pmin"]'), mx = form.querySelector('input[name="pmax"]');
    s.pmin = mn && mn.value !== '' ? +mn.value : null; s.pmax = mx && mx.value !== '' ? +mx.value : null;
    form.querySelectorAll('input[name="type"]:checked').forEach(function (i) { s.type.push(i.value); });
    var cp = form.querySelector('input[name="coupon"]'); s.coupon = !!(cp && cp.checked);
    return s;
  }
  function match(c, s, skip) {
    var d = c.dataset;
    if (QL && (d.pinned || (d.q || '').indexOf(QL) < 0)) return false;
    if (skip !== 'cat' && s.cat.length && s.cat.indexOf(d.cat) < 0) return false;
    if (skip !== 'store' && s.store.length && s.store.indexOf(d.store) < 0) return false;
    if (skip !== 'disc' && s.disc && +d.pct < s.disc) return false;
    if (skip !== 'price') {
      var pr = +d.price;
      if (s.price) { if (s.price[0] !== null && pr < s.price[0]) return false; if (s.price[1] !== null && pr > s.price[1]) return false; }
      if (s.pmin !== null && pr < s.pmin) return false; if (s.pmax !== null && pr > s.pmax) return false;
    }
    if (skip !== 'posted' && s.posted && +d.age > s.posted) return false;
    if (skip !== 'type' && s.type.length && !s.type.some(function (t) { return (d.types || '').split(',').indexOf(t) >= 0; })) return false;
    if (skip !== 'coupon' && s.coupon && !d.coupon) return false;
    return true;
  }
  var sorters = {
    newest: function (a, b) { return +a.dataset.age - +b.dataset.age; },
    disc: function (a, b) { return +b.dataset.pct - +a.dataset.pct; },
    saving: function (a, b) { return +b.dataset.save - +a.dataset.save; },
    'price-asc': function (a, b) { return +a.dataset.price - +b.dataset.price; },
    'price-desc': function (a, b) { return +b.dataset.price - +a.dataset.price; },
    views: function (a, b) { return +(b.dataset.views || 0) - +(a.dataset.views || 0); }
  };
  function sortCards(list, mode) { var k = sorters[mode]; return k ? list.slice().sort(k) : list.slice().sort(function (a, b) { return +a.dataset.order - +b.dataset.order; }); }
  function chip(label, onX) { var el = document.createElement('span'); el.className = 'chip-x'; el.textContent = label; var b = document.createElement('button'); b.type = 'button'; b.setAttribute('aria-label', 'Remove ' + label); b.innerHTML = '<i data-lucide="x"></i>'; b.addEventListener('click', onX); el.appendChild(b); return el; }
  function inr(v) { return '₹' + v.toLocaleString('en-IN'); }

  // D-104: on Fresh only, pinned deals fill every Nth card (N set by the admin on the Pinned board, default 3) down the whole feed,
  // in pinned-slot order; slots with no pinned deal left take the next normal deal. Applies to the default view; a sort or filter shows plain order.
  var PIN_EVERY = +(document.body.dataset.pinEvery || 0), PIN_IDS = (document.body.dataset.pins || '').split(',').filter(Boolean);
  if (PIN_EVERY) { try { var ae = +localStorage.getItem('adm-pin-every'); if (ae >= 2) PIN_EVERY = ae; var ap = JSON.parse(localStorage.getItem('adm-pins') || 'null'); if (ap && ap.length) PIN_IDS = ap.map(String); } catch (e) {} }
  function placePins(vis, s) {
    var plain = s.cat.length + s.store.length + s.type.length + s.disc + (s.price ? 1 : 0) + (s.posted ? 1 : 0) + (s.pmin !== null || s.pmax !== null ? 1 : 0) + (s.coupon ? 1 : 0) === 0;
    cards.forEach(function (c) { delete c.dataset.slot; });
    if (!PIN_EVERY || !plain || QL || sortMode !== (document.body.dataset.defaultSort || 'recommended')) return vis;
    var byId = {}; vis.forEach(function (c) { byId[c.dataset.id] = c; });
    var pins = PIN_IDS.map(function (id) { return byId[id]; }).filter(Boolean), rest = vis.filter(function (c) { return pins.indexOf(c) < 0; }), out = [], n = 0;
    while (rest.length || pins.length) {
      if ((out.length + 1) % PIN_EVERY === 0 && pins.length) { var p = pins.shift(); p.dataset.slot = ++n; out.push(p); }
      else if (rest.length) out.push(rest.shift());
      else { var q = pins.shift(); q.dataset.slot = ++n; out.push(q); }
    }
    return out;
  }

  function apply() {
    var s = state();
    var vis = placePins(sortCards(cards.filter(function (c) { return match(c, s); }), sortMode), s);
    cards.forEach(function (c) { c.hidden = true; });
    vis.forEach(function (c, i) { results.insertBefore(c, empty); c.hidden = i >= limit; });
    countEl.textContent = vis.length; if (sheetCount) sheetCount.textContent = vis.length;
    empty.hidden = vis.length > 0;
    var nFilters = s.cat.length + s.store.length + s.type.length + (s.disc ? 1 : 0) + (s.price ? 1 : 0) + (s.posted ? 1 : 0) + (s.pmin !== null || s.pmax !== null ? 1 : 0) + (s.coupon ? 1 : 0);
    if (KIND === 'search') rule.textContent = Q ? vis.length + ' result' + (vis.length === 1 ? '' : 's') + ', newest first' : 'All deals, newest first';
    if (!vis.length) {
      emptyText.textContent = nFilters ? 'No deals match these filters.' : (KIND === 'search' && Q ? 'No deals for \u201c' + Q + '\u201d.' : 'No ' + (h1.textContent.replace(/ deals.*$/, '')) + ' deals right now.');
      emptyClear.hidden = !nFilters;
    }
    if (emptyFeed) emptyFeed.hidden = vis.length > 0 || KIND === 'type';
    placeAlerts(vis);
    renderLoadState(vis.length);
    // facet counts: each option counted with every other group applied
    form.querySelectorAll('[data-group="cat"] .opt, [data-group="store"] .opt').forEach(function (o) {
      var inp = o.querySelector('input'), g = inp.name, n = cards.filter(function (c) { return match(c, s, g) && c.dataset[g] === inp.value; }).length;
      o.querySelector('.cnt').textContent = n; o.classList.toggle('is-zero', n === 0);
    });
    form.querySelectorAll('[data-cnt]').forEach(function (el) {
      var parts = el.dataset.cnt.split(':'), g = parts[0], v = parts[1];
      el.textContent = cards.filter(function (c) {
        if (!match(c, s, g)) return false; var d = c.dataset;
        if (g === 'disc') return +d.pct >= +v;
        if (g === 'posted') return +d.age <= +v;
        if (g === 'price') { var r = v.split('-'), lo = r[0] === '' ? null : +r[0], hi = r[1] === '' ? null : +r[1]; return (lo === null || +d.price >= lo) && (hi === null || +d.price <= hi); }
        if (g === 'coupon') return !!d.coupon;
        return true;
      }).length;
    });
    // applied chips
    chips.innerHTML = ''; var n = 0;
    s.cat.forEach(function (v) { n++; chips.appendChild(chip(v, function () { form.querySelector('input[name="cat"][value="' + v + '"]').checked = false; reset(); })); });
    s.store.forEach(function (v) { n++; chips.appendChild(chip(v, function () { form.querySelector('input[name="store"][value="' + v + '"]').checked = false; reset(); })); });
    if (s.disc) { n++; chips.appendChild(chip('≥ ' + s.disc + '% off', function () { form.querySelector('input[name="disc"][value="0"]').checked = true; reset(); })); }
    if (s.price) { n++; chips.appendChild(chip(s.price[1] === null ? inr(s.price[0]) + ' and above' : 'Under ' + inr(s.price[1]), function () { form.querySelector('input[name="price"][value=""]').checked = true; reset(); })); }
    if (s.pmin !== null || s.pmax !== null) { n++; chips.appendChild(chip((s.pmin !== null ? inr(s.pmin) : '₹0') + ' – ' + (s.pmax !== null ? inr(s.pmax) : 'any'), function () { form.querySelector('input[name="pmin"]').value = ''; form.querySelector('input[name="pmax"]').value = ''; reset(); })); }
    if (s.posted) { n++; chips.appendChild(chip(s.posted === 1440 ? 'Last 24 hours' : 'Last 7 days', function () { form.querySelector('input[name="posted"][value=""]').checked = true; reset(); })); }
    s.type.forEach(function (v) { n++; chips.appendChild(chip(v, function () { form.querySelector('input[name="type"][value="' + v + '"]').checked = false; reset(); })); });
    if (s.coupon) { n++; chips.appendChild(chip('Has a coupon', function () { form.querySelector('input[name="coupon"]').checked = false; reset(); })); }
    if (n) { var ca = document.createElement('button'); ca.type = 'button'; ca.className = 'btn btn-link btn-sm'; ca.textContent = 'Clear all'; ca.addEventListener('click', clearAll); chips.appendChild(ca); }
    filterCount.hidden = n === 0; filterCount.textContent = n;
    // sort labels + checked states
    sortLabel.textContent = 'Sort: ' + sortNames[sortMode]; if (sortLabelM) sortLabelM.textContent = 'Sort: ' + sortNames[sortMode];
    sortItems.forEach(function (b) { b.setAttribute('aria-checked', b.dataset.sort === sortMode ? 'true' : 'false'); });
    mobileSort.forEach(function (r) { r.checked = r.value === sortMode; });
    if (window.lucide) lucide.createIcons();
  }

  // hybrid loading
  function renderLoadState(total) {
    var left = Math.max(0, total - limit);
    loadState.innerHTML = '';
    if (total === 0) return;
    if (left === 0) {
      var end = document.createElement('div'); end.className = 'end';
      end.innerHTML = '<span>That\'s all for now.</span><a class="btn btn-outline btn-sm" href="top-picks.html">See Top picks</a><a class="btn btn-ghost btn-sm" href="#top">Back to top</a>';
      loadState.appendChild(end); return;
    }
    if (batch % (AUTO + 1) === 0) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-outline btn-lg'; b.textContent = 'Show more deals (' + left + ' more)';
      b.addEventListener('click', nextBatch); loadState.appendChild(b);
      var hint = document.createElement('span'); hint.textContent = 'Page ' + (batch + 1); loadState.appendChild(hint);
    } else {
      var sp = document.createElement('div'); sp.className = 'loader'; sp.setAttribute('role', 'status'); sp.setAttribute('aria-label', 'Loading more deals'); loadState.appendChild(sp);
    }
  }
  function nextBatch() { limit += PAGE; batch += 1; try { history.replaceState(null, '', location.pathname + '?page=' + batch + location.hash); } catch (e) {} apply(); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || loading || !loadState.querySelector('.loader')) return;
      loading = true; setTimeout(function () { nextBatch(); loading = false; }, 350);
    }, { rootMargin: '400px 0px' }).observe(loadState);
  }

  function reset() { limit = PAGE; batch = 1; apply(); }
  function clearAll() {
    form.querySelectorAll('input[type="checkbox"]').forEach(function (i) { i.checked = false; });
    form.querySelectorAll('input[type="radio"]').forEach(function (i) { i.checked = i.value === '' || i.value === '0'; });
    form.querySelectorAll('input[type="number"]').forEach(function (i) { i.value = ''; });
    reset();
  }
  form.addEventListener('change', function (e) { if (e.target.type !== 'number') reset(); });
  form.querySelectorAll('input[type="number"]').forEach(function (i) {
    i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); i.blur(); } });
    i.addEventListener('change', function (e) { e.stopPropagation(); reset(); });
  });
  document.getElementById('clear-all').addEventListener('click', clearAll);
  document.querySelectorAll('[data-clear]').forEach(function (b) { b.addEventListener('click', clearAll); });
  sortItems.forEach(function (b) { b.addEventListener('click', function () { sortMode = b.dataset.sort; reset(); }); });
  mobileSort.forEach(function (r) { r.addEventListener('change', function () { sortMode = r.value; reset(); closeSheet(); }); });
  // store search inside the group
  form.querySelectorAll('[data-find]').forEach(function (inp) { inp.addEventListener('input', function () { var q = inp.value.trim().toLowerCase(); form.querySelectorAll('[data-group="' + inp.dataset.find + '"] .opt').forEach(function (o) { o.hidden = q && o.textContent.toLowerCase().indexOf(q) < 0; }); }); });

  // density
  document.querySelectorAll('[data-density]').forEach(function (b) { b.addEventListener('click', function () { document.querySelectorAll('[data-density]').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); results.classList.toggle('is-list', b.dataset.density === 'list'); try { localStorage.setItem('ot-density', b.dataset.density); } catch (e) {} }); });
  try { if (localStorage.getItem('ot-density') === 'list') document.querySelector('[data-density="list"]').click(); } catch (e) {}

  // phone sheets: the filter form moves into the bottom sheet while it is open, then back
  var overlay = document.getElementById('sheet-overlay'), fsheet = document.getElementById('filter-sheet'), ssheet = document.getElementById('sort-sheet'), fbody = document.getElementById('filter-sheet-body'), current = null, lastFocus;
  function openSheet(el) { lastFocus = document.activeElement; current = el; if (el === fsheet) fbody.appendChild(form); overlay.hidden = false; el.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { overlay.dataset.state = 'open'; el.dataset.state = 'open'; }); }); document.body.style.overflow = 'hidden'; }
  function closeSheet() { if (!current) return; var el = current; current = null; overlay.dataset.state = 'closed'; el.dataset.state = 'closed'; document.body.style.overflow = ''; setTimeout(function () { el.hidden = true; overlay.hidden = true; if (el === fsheet) filters.appendChild(form); if (lastFocus) lastFocus.focus(); }, 300); }
  document.getElementById('open-filters').addEventListener('click', function () { openSheet(fsheet); });
  document.getElementById('open-sort').addEventListener('click', function () { openSheet(ssheet); });
  overlay.addEventListener('click', closeSheet);
  fsheet.querySelectorAll('[data-sheet-close]').forEach(function (b) { b.addEventListener('click', closeSheet); });
  ssheet.querySelectorAll('[data-sheet-close]').forEach(function (b) { b.addEventListener('click', closeSheet); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeSheet(); });

  // alerts opt-in card (B23, D-055): after the 16th card, second visit onwards, × hides for 30 days; ?visit=2 forces it
  var alertsCard = document.getElementById('alerts-card'), visits = 0, alertsOk = false;
  try { visits = +(localStorage.getItem('ot-visits') || 0) + 1; localStorage.setItem('ot-visits', visits); var hid = +(localStorage.getItem('ot-alerts-hide') || 0); alertsOk = (visits >= 2 || new URLSearchParams(location.search).get('visit') === '2') && Date.now() > hid; } catch (e) {}
  function placeAlerts(vis) {
    if (!alertsCard || !alertsOk || vis.length < 16) { if (alertsCard) alertsCard.hidden = true; return; }
    var after = vis[15]; if (after && after.parentNode === results) { after.after(alertsCard); alertsCard.hidden = false; }
  }
  if (alertsCard) {
    document.getElementById('alertsCardX'.replace('CardX', '-card-x')).addEventListener('click', function () { alertsCard.hidden = true; alertsOk = false; try { localStorage.setItem('ot-alerts-hide', Date.now() + 30 * 864e5); } catch (e) {} });
    document.getElementById('alerts-card-on').addEventListener('click', function () { alertsCard.hidden = true; alertsOk = false; window.OT.toast('Browser alerts on for new loot', 'bell-ring'); try { localStorage.setItem('ot-alerts-hide', Date.now() + 365 * 864e5); } catch (e) {} });
  }

  apply();
})();

/* ---- S13: desktop slide-over (D-050, D-065): the deal page in a 480 px panel at ≥ 1024; URL moves to the deal; Esc / ✕ / backdrop / Back close ---- */
(function () {
  var so = document.getElementById('slideover'), ov = document.getElementById('slideover-overlay'), fr = document.getElementById('so-frame'), full = document.getElementById('so-full'), ttl = document.getElementById('so-title'), results = document.getElementById('results');
  if (!so || !results) return;
  var openCard = null, listUrl = location.href, pushed = false;
  function open(card) {
    var page = card.dataset.page, title = card.querySelector('.title').textContent;
    fr.src = page + '?embed=1'; full.href = page; ttl.textContent = title;
    if (openCard) openCard.classList.remove('is-selected'); openCard = card; card.classList.add('is-selected');
    ov.hidden = false; so.hidden = false; requestAnimationFrame(function () { requestAnimationFrame(function () { ov.dataset.state = 'open'; so.dataset.state = 'open'; }); });
    document.body.style.overflow = 'hidden';
    if (!pushed) { try { history.pushState({ so: page }, '', page); pushed = true; } catch (e) { pushed = false; } } else { try { history.replaceState({ so: page }, '', page); } catch (e) {} }
    setTimeout(function () { document.getElementById('so-close').focus(); }, 60);
  }
  function close(fromPop) {
    if (so.hidden) return;
    ov.dataset.state = 'closed'; so.dataset.state = 'closed'; document.body.style.overflow = '';
    setTimeout(function () { so.hidden = true; ov.hidden = true; fr.src = 'about:blank'; }, 220);
    if (openCard) { openCard.classList.remove('is-selected'); openCard.querySelector('.title').focus({ preventScroll: true }); openCard = null; }
    if (pushed && !fromPop) { pushed = false; history.back(); } else pushed = false;
  }
  results.addEventListener('click', function (e) {
    if (window.innerWidth < 1024) return;
    var a = e.target.closest('a.img, a.title'); if (!a) return; var card = a.closest('.deal'); if (!card || !card.dataset.page) return;
    e.preventDefault(); open(card);
  });
  document.getElementById('so-close').addEventListener('click', function () { close(false); });
  ov.addEventListener('click', function () { close(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !so.hidden) close(false); });
  window.addEventListener('popstate', function () { if (!so.hidden) { close(true); } });
})();
