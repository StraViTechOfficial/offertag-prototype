/* listing.js — client-side filters, sort, hybrid loading (D-032) and phone sheets for the listing pages */
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

  /* ---- 2026-11-25 (changes.md P-03): Discount slider with stops, Amazon-style price range slider ---- */
  var discIn = form.querySelector('input[name="disc"]'), discOut = document.getElementById('disc-val');
  var STOPS = discIn ? discIn.dataset.stops.split(',').map(Number) : [0];
  function discValue() { return discIn ? STOPS[+discIn.value] || 0 : 0; }
  function discLabel() { var v = discValue(), t = v ? v + '% off or more' : 'Any discount'; if (discOut) discOut.textContent = t; if (discIn) { discIn.setAttribute('aria-valuetext', t); discIn.style.setProperty('--p', (+discIn.value / (STOPS.length - 1) * 100) + '%'); } }
  function setDisc(v) { if (!discIn) return; var k = 0; STOPS.forEach(function (x, i) { if (v >= x) k = i; }); discIn.value = k; discLabel(); }
  if (discIn) discIn.addEventListener('input', discLabel);
  // price: the ends are the cheapest and the dearest deal on this page; the scale is logarithmic, so cheap items get fine steps
  var plo = document.getElementById('plo'), phi = document.getElementById('phi'), pfill = document.getElementById('prng-fill'), pOut = document.getElementById('price-val');
  var pminIn = form.querySelector('input[name="pmin"]'), pmaxIn = form.querySelector('input[name="pmax"]');
  var prices = cards.map(function (c) { return +c.dataset.price; }).filter(function (v) { return v > 0; });
  var PMIN = prices.length ? Math.min.apply(null, prices) : 0, PMAX = prices.length ? Math.max.apply(null, prices) : 0, STEPS = 1000;
  function nice(v) { var st = v < 500 ? 10 : v < 2000 ? 50 : v < 10000 ? 100 : v < 50000 ? 500 : 1000; return Math.round(v / st) * st; }
  function toPrice(t) { if (t <= 0) return PMIN; if (t >= STEPS) return PMAX; var lo = Math.max(1, PMIN); return Math.min(PMAX, Math.max(PMIN, nice(lo * Math.pow(PMAX / lo, t / STEPS)))); }
  function toPos(v) { if (v == null) return null; var lo = Math.max(1, PMIN); if (v <= PMIN) return 0; if (v >= PMAX) return STEPS; return Math.round(Math.log(v / lo) / Math.log(PMAX / lo) * STEPS); }
  function priceText(a, b) { return a == null && b == null ? 'Any price' : a == null ? 'Up to ' + inr(b) : b == null ? inr(a) + ' and above' : inr(a) + ' – ' + inr(b); }
  function paint() {
    if (!plo) return;
    var a = +plo.value, b = +phi.value;
    pfill.style.left = (a / STEPS * 100) + '%'; pfill.style.right = (100 - b / STEPS * 100) + '%';
    var lo = a <= 0 ? null : toPrice(a), hi = b >= STEPS ? null : toPrice(b);
    pOut.textContent = lo == null && hi == null ? inr(PMIN) + ' – ' + inr(PMAX) : (lo == null ? inr(PMIN) : inr(lo)) + ' – ' + (hi == null ? inr(PMAX) + (PMAX ? '' : '') : inr(hi));
    plo.setAttribute('aria-valuetext', lo == null ? inr(PMIN) : inr(lo)); phi.setAttribute('aria-valuetext', hi == null ? inr(PMAX) : inr(hi));
    plo.style.zIndex = a > STEPS - 50 ? 3 : 2;   // a handle pushed to the far right stays grabbable
  }
  function fromSlider(which) {
    var a = +plo.value, b = +phi.value, gap = 10;
    if (a > b - gap) { if (which === 'lo') { plo.value = a = Math.max(0, b - gap); } else { phi.value = b = Math.min(STEPS, a + gap); } }
    pminIn.value = a <= 0 ? '' : toPrice(a); pmaxIn.value = b >= STEPS ? '' : toPrice(b); paint();
  }
  function setPrice(a, b) { pminIn.value = a == null ? '' : a; pmaxIn.value = b == null ? '' : b; if (plo) { plo.value = a == null ? 0 : toPos(a); phi.value = b == null ? STEPS : toPos(b); paint(); } }
  function applyTyped() {
    var a = pminIn.value === '' ? null : Math.max(0, +pminIn.value), b = pmaxIn.value === '' ? null : Math.max(0, +pmaxIn.value);
    if (a != null && b != null && a > b) { var t = a; a = b; b = t; }
    setPrice(a, b); reset();
  }
  if (plo) {
    document.getElementById('prng-min').textContent = inr(PMIN); document.getElementById('prng-max').textContent = inr(PMAX);
    [plo, phi].forEach(function (el) {
      el.addEventListener('input', function () { fromSlider(el === plo ? 'lo' : 'hi'); });
      el.addEventListener('change', function (e) { e.stopPropagation(); reset(); });   // filter on release
    });
    if (PMAX <= PMIN) { plo.disabled = phi.disabled = true; }
    paint();
  }
  var go = document.getElementById('price-go'); if (go) go.addEventListener('click', applyTyped);
  discLabel();

  function state() {
    var s = { cat: [], store: [], disc: 0, price: null, pmin: null, pmax: null, type: [], coupon: false };
    form.querySelectorAll('input[name="cat"]:checked').forEach(function (i) { s.cat.push(i.value); });
    form.querySelectorAll('input[name="store"]:checked').forEach(function (i) { s.store.push(i.value); });
    s.disc = discValue();
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

  // D-104, D-114: on Top deals only, pinned deals fill every Nth card (N set by the admin on the Pinned board, default 3) down the whole feed,
  // in pinned-slot order; slots with no pinned deal left take the next normal deal. Applies to the default view; a sort or filter shows plain order.
  var PIN_EVERY = +(document.body.dataset.pinEvery || 0), PIN_IDS = (document.body.dataset.pins || '').split(',').filter(Boolean);
  if (PIN_EVERY && !window.OTDB) { try { var ae = +localStorage.getItem('adm-pin-every'); if (ae >= 2) PIN_EVERY = ae; var ap = JSON.parse(localStorage.getItem('adm-pins') || 'null'); if (ap && ap.length) PIN_IDS = ap.map(String); } catch (e) {} }
  function placePins(vis, s) {
    var plain = s.cat.length + s.store.length + s.type.length + s.disc + (s.pmin !== null || s.pmax !== null ? 1 : 0) + (s.coupon ? 1 : 0) === 0;
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
    var nFilters = s.cat.length + s.store.length + s.type.length + (s.disc ? 1 : 0) + (s.pmin !== null || s.pmax !== null ? 1 : 0) + (s.coupon ? 1 : 0);
    if (KIND === 'search' && rule) rule.textContent = Q ? vis.length + ' result' + (vis.length === 1 ? '' : 's') + ', newest first' : 'All deals, newest first';
    if (!vis.length) {
      emptyText.textContent = nFilters ? 'No deals match these filters.' : (KIND === 'search' && Q ? 'No deals for \u201c' + Q + '\u201d.' : 'No ' + (h1.textContent.replace(/ deals.*$/, '')) + ' deals right now.');
      emptyClear.hidden = !nFilters;
    }
    if (emptyFeed) emptyFeed.hidden = vis.length > 0 || KIND === 'type';
    placeAlerts(vis);
    renderLoadState(vis.length);
    writeUrl(s, nFilters);
    // applied chips
    chips.innerHTML = ''; var n = 0;
    s.cat.forEach(function (v) { n++; chips.appendChild(chip(v, function () { form.querySelector('input[name="cat"][value="' + v + '"]').checked = false; reset(); })); });
    s.store.forEach(function (v) { n++; chips.appendChild(chip(v, function () { form.querySelector('input[name="store"][value="' + v + '"]').checked = false; reset(); })); });
    if (s.disc) { n++; chips.appendChild(chip(s.disc + '% off or more', function () { setDisc(0); reset(); })); }
    if (s.pmin !== null || s.pmax !== null) { n++; chips.appendChild(chip(priceText(s.pmin, s.pmax), function () { setPrice(null, null); reset(); })); }
    s.type.forEach(function (v) { n++; var tl = form.querySelector('input[name="type"][value="' + v + '"]'); chips.appendChild(chip(tl ? tl.closest('.opt').querySelector('.txt').textContent : v, function () { form.querySelector('input[name="type"][value="' + v + '"]').checked = false; reset(); })); });
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
    if (left === 0) return;  // D-125: no end-of-list line; the last row of cards runs into the footer
    if (batch % (AUTO + 1) === 0) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-outline btn-lg'; b.textContent = 'Show more deals (' + left + ' more)';
      b.addEventListener('click', nextBatch); loadState.appendChild(b);
      var hint = document.createElement('span'); hint.textContent = 'Page ' + (batch + 1); loadState.appendChild(hint);
    } else {
      var sp = document.createElement('div'); sp.className = 'loader'; sp.setAttribute('role', 'status'); sp.setAttribute('aria-label', 'Loading more deals'); loadState.appendChild(sp);
    }
  }
  function nextBatch() { limit += PAGE; batch += 1; apply(); }

  // D-118: the filters live in the page link. One key per group, fixed order, values sorted and comma-joined:
  // ?q= · cat · store · type · disc · price · coupon · sort · page. The path never changes; history is replaced, not pushed,
  // so Back leaves the page. A filtered link points Google at the clean page (canonical) and is not indexed (noindex, follow).
  var SORT_URL = { 'price-asc': 'price-low', 'price-desc': 'price-high' }, SORT_IN = { 'price-low': 'price-asc', 'price-high': 'price-desc' };
  function slugOf(name, v) { var i = form.querySelector('input[name="' + name + '"][value="' + v.replace(/"/g, '\\"') + '"]'); return i ? i.dataset.s : v; }
  function head(sel, make) { var el = document.head.querySelector(sel); if (!el) { el = make(); document.head.appendChild(el); } return el; }
  function writeUrl(s, nFilters) {
    var p = [];
    if (Q) p.push('q=' + encodeURIComponent(Q));
    ['cat', 'store', 'type'].forEach(function (g) { if (s[g].length) p.push(g + '=' + s[g].map(function (v) { return encodeURIComponent(slugOf(g, v)); }).sort().join(',')); });
    if (s.disc) p.push('disc=' + s.disc);
    if (s.pmin !== null || s.pmax !== null) p.push('price=' + (s.pmin !== null ? s.pmin : '') + '-' + (s.pmax !== null ? s.pmax : ''));
    if (s.coupon) p.push('coupon=1');
    if (sortMode !== (document.body.dataset.defaultSort || 'recommended')) p.push('sort=' + (SORT_URL[sortMode] || sortMode));
    if (batch > 1) p.push('page=' + batch);
    var url = location.pathname + (p.length ? '?' + p.join('&') : '') + location.hash;
    if (url !== location.pathname + location.search + location.hash) { try { history.replaceState(history.state, '', url); } catch (e) {} }
    head('link[rel="canonical"]', function () { var l = document.createElement('link'); l.rel = 'canonical'; return l; }).href = location.origin + location.pathname + (KIND === 'search' && Q ? '?q=' + encodeURIComponent(Q) : '');
    var rb = head('meta[name="robots"]', function () { var m = document.createElement('meta'); m.name = 'robots'; return m; });
    rb.content = nFilters || sortMode !== (document.body.dataset.defaultSort || 'recommended') || KIND === 'search' ? 'noindex, follow' : 'index, follow';
  }
  function readUrl() {
    var u = new URLSearchParams(location.search);
    ['cat', 'store', 'type'].forEach(function (g) {
      (u.get(g) || '').split(',').filter(Boolean).forEach(function (sv) { var i = form.querySelector('input[name="' + g + '"][data-s="' + sv.replace(/"/g, '') + '"]'); if (i && !i.closest('[hidden]')) i.checked = true; });
    });
    setDisc(+u.get('disc') || 0);
    var pr = u.get('price');
    if (pr && /^\d*-\d*$/.test(pr)) { var r = pr.split('-'); setPrice(r[0] === '' ? null : +r[0], r[1] === '' ? null : +r[1]); }
    var cp = form.querySelector('input[name="coupon"]'); if (cp && u.get('coupon') === '1') cp.checked = true;
    var so = SORT_IN[u.get('sort')] || u.get('sort'); if (so && sortNames[so]) sortMode = so;
    var pg = +u.get('page'); if (pg > 1) { batch = pg; limit = PAGE * pg; }
  }
  readUrl();
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      if (!entries[0].isIntersecting || loading || !loadState.querySelector('.loader')) return;
      // re-observe after each batch: if the list end is still within reach, the observer reports again and the next batch loads
      loading = true; setTimeout(function () { nextBatch(); loading = false; io.unobserve(loadState); io.observe(loadState); }, 350);
    }, { rootMargin: '1200px 0px' });
    io.observe(loadState);  // D-125: load about 3 rows ahead so the list never runs out under a fast scroll
  }

  function reset() { limit = PAGE; batch = 1; apply(); }
  function clearAll() {
    form.querySelectorAll('input[type="checkbox"]').forEach(function (i) { i.checked = false; });
    form.querySelectorAll('input[type="radio"]').forEach(function (i) { i.checked = i.value === '' || i.value === '0'; });
    setDisc(0); setPrice(null, null);
    reset();
  }
  form.addEventListener('change', function (e) { if (e.target.type !== 'number' && !e.target.classList.contains('prng-input')) reset(); });
  form.querySelectorAll('input[type="number"]').forEach(function (i) {
    i.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); applyTyped(); } });
    i.addEventListener('change', function (e) { e.stopPropagation(); applyTyped(); });
  });
  document.getElementById('clear-all').addEventListener('click', clearAll);
  document.querySelectorAll('[data-clear]').forEach(function (b) { b.addEventListener('click', clearAll); });
  sortItems.forEach(function (b) { b.addEventListener('click', function () { sortMode = b.dataset.sort; reset(); }); });
  mobileSort.forEach(function (r) { r.addEventListener('change', function () { sortMode = r.value; reset(); closeSheet(); }); });
  // store search inside the group
  form.querySelectorAll('[data-find]').forEach(function (inp) { inp.addEventListener('input', function () { var q = inp.value.trim().toLowerCase(); form.querySelectorAll('[data-group="' + inp.dataset.find + '"] .opt').forEach(function (o) { o.hidden = q && o.textContent.toLowerCase().indexOf(q) < 0; }); }); });


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
  // D-158: a side popup tied to the scroll. Once the 16th card comes into view, scrolling on draws it in from the right (scroll back and it
  // slides back); fully out, it locks, stays 10 s (the timer line pauses while the pointer is on it), then glides back out for this page view.
  // × hides it for 30 days; "Turn on" for a year; "Not now" just tucks it away. Reduced motion: it fades in and out instead.
  var AC = { state: 'wait', mark: null, startY: 0, DIST: 320 }, rootEl = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (alertsCard) { document.body.appendChild(alertsCard); alertsCard.classList.add('is-pop'); alertsCard.setAttribute('role', 'dialog'); }
  function acLift(on) { rootEl.style.setProperty('--pop-lift', on ? (alertsCard.offsetHeight + 12) + 'px' : '0px'); }
  function acSet(p) { alertsCard.style.setProperty('--p', p.toFixed(3)); }
  function acLock() {
    AC.state = 'in'; acSet(1); alertsCard.classList.add('is-in'); acLift(true);
    var timer = alertsCard.querySelector('.ac-timer');
    if (timer) timer.addEventListener('animationend', function () { if (AC.state === 'in') acTuck(); }, { once: true });
    else setTimeout(function () { if (AC.state === 'in') acTuck(); }, 10000);
  }
  function acTuck() {   // back out for this page view
    if (AC.state === 'gone') return; AC.state = 'gone'; alertsCard.classList.remove('is-in'); alertsCard.classList.add('is-out'); acLift(false);
    setTimeout(function () { alertsCard.hidden = true; }, 500);
  }
  function acScroll() {
    if (!alertsCard || AC.state === 'in' || AC.state === 'gone' || !alertsOk) return;
    if (AC.state === 'wait') {
      if (!AC.mark || !AC.mark.isConnected || AC.mark.getBoundingClientRect().top > innerHeight) return;
      AC.state = 'track'; AC.startY = window.scrollY; alertsCard.hidden = false; acSet(0); acLift(true);
      if (reduce) { acLock(); return; }
    }
    var p = Math.max(0, Math.min(1, (window.scrollY - AC.startY) / AC.DIST));
    acSet(p);
    if (p >= 1) acLock();
  }
  window.addEventListener('scroll', function () { requestAnimationFrame(acScroll); }, { passive: true });
  function placeAlerts(vis) {
    if (!alertsCard || !alertsOk || AC.state !== 'wait') return;
    AC.mark = vis.length >= 16 ? vis[15] : null; acScroll();
  }
  function hideAlerts() { alertsOk = false; acTuck(); }
  if (alertsCard) {
    document.getElementById('alerts-card-x').addEventListener('click', function () { hideAlerts(); try { localStorage.setItem('ot-alerts-hide', Date.now() + 30 * 864e5); } catch (e) {} });
    document.getElementById('alerts-card-on').addEventListener('click', function () { hideAlerts(); window.OT.toast('Browser alerts on for new loot', 'bell-ring'); try { localStorage.setItem('ot-alerts-hide', Date.now() + 365 * 864e5); } catch (e) {} });
    var later = alertsCard.querySelector('[data-alerts-later]'); if (later) later.addEventListener('click', acTuck);
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

/* D-136: mark the frozen heading row so a hovered card never lifts over it while frozen */
(function () {
  var head = document.querySelector('.list-head'); if (!head) return;
  function size() { document.body.style.setProperty('--head-h', head.offsetHeight + 'px'); check(); }
  function check() { var top = parseFloat(getComputedStyle(head).top) || 0; head.classList.toggle('is-stuck', getComputedStyle(head).position === 'sticky' && window.scrollY > 0 && head.getBoundingClientRect().top <= top + 0.5); }
  window.addEventListener('scroll', check, { passive: true });
  window.addEventListener('resize', size); if (window.ResizeObserver) new ResizeObserver(size).observe(head); size();
})();
