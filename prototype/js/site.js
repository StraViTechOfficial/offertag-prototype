/* site.js — OfferTag prototype: Embla carousels, Sheet / Dialog (generic), toast, dropdown menus, back-to-top, radius switch */
(function () {
  // radius switch: ?radius=0 | lg (persisted per browser)
  try {
    var q = new URLSearchParams(location.search).get('radius');
    if (q !== null) localStorage.setItem('ot-radius', q);
    var r = localStorage.getItem('ot-radius');
    if (r === '0' || r === 'lg') document.documentElement.dataset.radius = r;
  } catch (e) {}

  // icons
  function icons() { if (window.lucide && lucide.createIcons) lucide.createIcons(); }
  icons();

  // carousels
  if (window.EmblaCarousel) {
    document.querySelectorAll('.carousel').forEach(function (root) {
      var viewport = root.querySelector('.carousel-viewport');
      var embla = EmblaCarousel(viewport, { align: 'start', containScroll: 'trimSnaps', dragFree: root.dataset.free === 'true', slidesToScroll: 'auto' });
      var prev = root.querySelector('.carousel-prev'), next = root.querySelector('.carousel-next');
      // D-107: deal rows carry their arrows in the section header (beside View all), never on top of the cards
      var sec = root.closest('.deals'), head = sec && sec.querySelector('.section-head'), nav = null;
      if (head && prev && next && !root.closest('.hero') && !root.closest('.promo')) {
        var end = document.createElement('div'); end.className = 'sh-end';
        var va = head.querySelector(':scope > .view-all'); if (va) end.appendChild(va);
        nav = document.createElement('div'); nav.className = 'sh-nav'; nav.setAttribute('role', 'group'); nav.setAttribute('aria-label', 'Scroll this row');
        nav.appendChild(prev); nav.appendChild(next); end.appendChild(nav); head.appendChild(end); root.classList.add('has-head-nav');
      }
      function sync() { if (prev) prev.disabled = !embla.canScrollPrev(); if (next) next.disabled = !embla.canScrollNext(); if (nav) nav.hidden = !embla.canScrollPrev() && !embla.canScrollNext(); }
      if (prev) prev.addEventListener('click', function () { embla.scrollPrev(); });
      if (next) next.addEventListener('click', function () { embla.scrollNext(); });
      embla.on('select', sync); embla.on('reInit', sync); sync();
      if (root.dataset.dots === 'true') {  // poster dots (S16): one per slide, current one is a pill
        var dots = document.createElement('div'); dots.className = 'carousel-dots'; dots.setAttribute('role', 'group'); dots.setAttribute('aria-label', 'Choose poster');
        embla.scrollSnapList().forEach(function (_, i) {
          var d = document.createElement('button'); d.type = 'button'; d.setAttribute('aria-label', 'Poster ' + (i + 1));
          d.addEventListener('click', function () { embla.scrollTo(i); }); dots.appendChild(d);
        });
        root.appendChild(dots);
        var paintDots = function () { Array.prototype.forEach.call(dots.children, function (d, i) { d.setAttribute('aria-current', i === embla.selectedScrollSnap() ? 'true' : 'false'); }); };
        embla.on('select', paintDots); embla.on('reInit', paintDots); paintDots();
      }
    });
  }

  // Hot deals today (D-113): Embla slider, loops endlessly. Arrows slide one view (4 cards on desktop) at a time; phones swipe.
  // No autoplay (D-072). Reduced motion: the arrows jump instead of sliding.
  if (window.EmblaCarousel) document.querySelectorAll('[data-td]').forEach(function (root) {
    var still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var embla = EmblaCarousel(root.querySelector('.td-viewport'), { loop: true, align: 'start', slidesToScroll: 'auto', duration: 30 });
    var prev = root.querySelector('[data-td-prev]'), next = root.querySelector('[data-td-next]');
    prev.addEventListener('click', function () { embla.scrollPrev(still); });
    next.addEventListener('click', function () { embla.scrollNext(still); });
    function sync() { var many = embla.scrollSnapList().length > 1; prev.hidden = next.hidden = !many; }
    embla.on('reInit', sync); sync();
  });

  // sheet / dialog (generic): any element with [data-sheet-open="id"] opens that sheet; shared overlay #sheet-overlay
  var overlay = document.getElementById('sheet-overlay'), current = null, lastFocus;
  function openSheet(el) {
    if (!el || !overlay) return; if (current === el) return; if (current) closeSheet();
    lastFocus = document.activeElement; current = el; overlay.hidden = false; el.hidden = false;
    requestAnimationFrame(function () { requestAnimationFrame(function () { overlay.dataset.state = 'open'; el.dataset.state = 'open'; }); });
    document.body.style.overflow = 'hidden';
    var f = el.querySelector('[autofocus], input:not([type=radio]):not([type=hidden]), textarea, a, button:not(.sheet-close)'); if (f) setTimeout(function () { f.focus({ preventScroll: true }); }, 60);
    el.dispatchEvent(new CustomEvent('sheet:open'));
  }
  function closeSheet() {
    if (!current) return; var el = current; current = null; overlay.dataset.state = 'closed'; el.dataset.state = 'closed'; document.body.style.overflow = '';
    setTimeout(function () { if (current !== el) el.hidden = true; if (!current) overlay.hidden = true; if (lastFocus && lastFocus.focus) lastFocus.focus(); el.dispatchEvent(new CustomEvent('sheet:close')); }, 300);
  }
  var menuOpen = document.getElementById('menu-open'), menuSheet = document.getElementById('menu-sheet');
  if (menuOpen && menuSheet) menuOpen.addEventListener('click', function () { openSheet(menuSheet); });
  document.querySelectorAll('[data-sheet-open]').forEach(function (b) { b.addEventListener('click', function () { openSheet(document.getElementById(b.dataset.sheetOpen)); }); });
  if (overlay) overlay.addEventListener('click', closeSheet);
  document.querySelectorAll('[data-sheet-close]').forEach(function (b) { b.addEventListener('click', closeSheet); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && current) closeSheet(); });

  // toast (Sonner): OT.toast('Link copied', 'check')
  function toast(msg, icon) {
    var host = document.getElementById('toaster'); if (!host) { host = document.createElement('div'); host.className = 'toaster'; host.id = 'toaster'; host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    var t = document.createElement('div'); t.className = 'toast'; if (icon) { var i = document.createElement('i'); i.setAttribute('data-lucide', icon); t.appendChild(i); } var s = document.createElement('span'); s.textContent = msg; t.appendChild(s); host.appendChild(t); icons();
    requestAnimationFrame(function () { requestAnimationFrame(function () { t.classList.add('is-in'); }); });
    setTimeout(function () { t.classList.remove('is-in'); setTimeout(function () { t.remove(); }, 200); }, 2400);
  }

  // dropdown menus (shadcn DropdownMenu behaviour): one open at a time, outside click / Esc close, arrow keys move
  var openMenu = null;
  function closeMenu() { if (!openMenu) return; var m = openMenu; openMenu = null; m.menu.dataset.state = 'closed'; m.trigger.setAttribute('aria-expanded', 'false'); setTimeout(function () { if (openMenu !== m) m.menu.hidden = true; }, 240); }
  document.querySelectorAll('.dropdown').forEach(function (dd) {
    var trigger = dd.querySelector('[data-menu-trigger]'), menu = dd.querySelector('.menu'); if (!trigger || !menu) return;
    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (openMenu && openMenu.menu === menu) { closeMenu(); return; }
      closeMenu(); menu.hidden = false; requestAnimationFrame(function () { menu.dataset.state = 'open'; }); trigger.setAttribute('aria-expanded', 'true'); openMenu = { trigger: trigger, menu: menu };
      var f = menu.querySelector('[aria-checked="true"]') || menu.querySelector('[role^="menuitem"]'); if (f) f.focus();
    });
    menu.addEventListener('keydown', function (e) {
      var items = Array.prototype.slice.call(menu.querySelectorAll('[role^="menuitem"]')), i = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); (items[i + 1] || items[0]).focus(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); (items[i - 1] || items[items.length - 1]).focus(); }
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('[role^="menuitem"]')) closeMenu(); });
  });
  document.addEventListener('click', function (e) { if (openMenu && !openMenu.menu.contains(e.target)) closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && openMenu) { var t = openMenu.trigger; closeMenu(); t.focus(); } });

  // back to top
  var top = document.getElementById('to-top');
  if (top) { window.addEventListener('scroll', function () { top.classList.toggle('is-visible', window.scrollY > 900); }, { passive: true }); top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); }); }

  // search submit (prototype: no backend)
  document.querySelectorAll('form[data-search]').forEach(function (f) { f.addEventListener('submit', function (e) { e.preventDefault(); }); });

  // clipboard with fallback (older in-app browsers)
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) { var ta = document.createElement('textarea'); ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy') ? res() : rej(); } catch (e) { rej(e); } ta.remove(); });
  }

  window.OT = { openSheet: openSheet, closeSheet: closeSheet, toast: toast, icons: icons, copy: copy };
})();

/* ---- S13: search (sheet + header suggestions), community bar, hero toggle ---- */
(function () {
  var OT = window.OT, DEALS = window.OT_DEALS || [], CAT = window.OT_CAT || { cats: [], shops: [] };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function inr(v) { return '₹' + Number(v).toLocaleString('en-IN'); }
  function recent() { try { return JSON.parse(localStorage.getItem('ot-recent') || '[]'); } catch (e) { return []; } }
  function remember(q) { try { var r = recent().filter(function (x) { return x !== q; }); r.unshift(q); localStorage.setItem('ot-recent', JSON.stringify(r.slice(0, 5))); } catch (e) {} }
  function like(hay, q) { return hay.toLowerCase().indexOf(q) >= 0; }
  // the old site's rule: LIKE %q% on title, category name, store name (applySearchFilters); pinned dropped when q is present (W14)
  function matches(q) { q = q.toLowerCase(); return DEALS.filter(function (d) { return !d.pinned && (like(d.t, q) || like(d.cat, q) || like(d.store, q)); }); }
  function target(q) { return '/deals/search?q=' + encodeURIComponent(q); }

  // suggestion list renderer, shared by the phone sheet and the desktop popover
  function render(q) {
    q = (q || '').trim(); var h = '';
    if (q.length < 2) {
      var r = recent();
      if (r.length) h += '<div class="ss-sec"><span>Recent</span><button type="button" class="btn btn-link btn-sm" data-ss-clear-recent>Clear</button></div>' + r.map(function (x) { return '<a class="ss-row" href="' + target(x) + '" data-q="' + esc(x) + '"><i data-lucide="history"></i><span>' + esc(x) + '</span></a>'; }).join('');
      h += '<div class="ss-sec"><span>Stores</span></div><div class="ss-chips">' + CAT.shops.map(function (s) { return '<a class="chip" href="' + s.page + '">' + esc(s.name) + '</a>'; }).join('') + '</div>';
      var top = CAT.cats.slice().sort(function (a, b) { return b.total - a.total; }).slice(0, 4);
      h += '<div class="ss-sec"><span>Categories</span></div>' + top.map(function (c) { return '<a class="ss-row" href="' + c.page + '"><span>' + esc(c.name) + '</span><i data-lucide="chevron-right"></i></a>'; }).join('') + '<a class="ss-row" href="categories.html"><span>All categories</span><i data-lucide="chevron-right"></i></a>';
      return h;
    }
    var ql = q.toLowerCase(), hits = matches(ql);
    // completions: the first five words of matching titles, distinct, max 3
    var comp = []; hits.forEach(function (d) { var i = d.t.toLowerCase().indexOf(ql), t = d.t.split(/\s+/).slice(0, 5).join(' '); if (i >= 0 && comp.indexOf(t) < 0 && t.toLowerCase() !== ql) comp.push(t); });
    h += comp.slice(0, 3).map(function (t) { return '<a class="ss-row" href="' + target(t) + '" data-q="' + esc(t) + '"><i data-lucide="search"></i><span>' + esc(t) + '</span></a>'; }).join('');
    CAT.shops.filter(function (s) { return like(s.name, ql); }).slice(0, 2).forEach(function (s) { h += '<a class="ss-row" href="' + s.page + '"><i data-lucide="store"></i><span><small>Store</small> ' + esc(s.name) + '</span><i data-lucide="chevron-right"></i></a>'; });
    CAT.cats.filter(function (c) { return like(c.name, ql); }).slice(0, 2).forEach(function (c) { h += '<a class="ss-row" href="' + c.page + '"><i data-lucide="layout-grid"></i><span><small>Category</small> ' + esc(c.name) + '</span><i data-lucide="chevron-right"></i></a>'; });
    if (hits.length) {
      h += '<div class="ss-sec"><span>Deals</span></div>' + hits.slice(0, 3).map(function (d) { return '<a class="ss-deal" href="' + d.page + '"><img src="' + (d.thumb || '/assets/deals/' + d.file) + '" alt="" width="40" height="40" loading="lazy"><span class="t">' + esc(d.t) + '</span><b>' + inr(d.p) + '</b></a>'; }).join('');
      h += '<a class="ss-row ss-all" href="' + target(q) + '" data-q="' + esc(q) + '"><span>See all ' + hits.length + ' result' + (hits.length === 1 ? '' : 's') + ' for “' + esc(q) + '”</span><i data-lucide="chevron-right"></i></a>';
    } else {
      h += '<p class="ss-none">No deals for “' + esc(q) + '”. Try a store or category above, or <a href="/top-deals">today\'s Top deals</a>.</p>';
    }
    return h;
  }
  function wire(host) {
    host.addEventListener('click', function (e) {
      var cl = e.target.closest('[data-ss-clear-recent]'); if (cl) { try { localStorage.removeItem('ot-recent'); } catch (x) {} host.innerHTML = render(''); OT.icons(); return; }
      var a = e.target.closest('a[data-q]'); if (a) remember(a.dataset.q);
    });
  }
  function submit(form) { var q = (form.querySelector('input[name="q"]').value || '').trim(); if (!q) return; remember(q); location.href = target(q); }

  // phone: full-screen sheet; the inline header field (or the icon) opens it
  var sheet = document.getElementById('search-sheet'), sq = document.getElementById('ss-q'), sbody = document.getElementById('ss-body'), sclear = document.getElementById('ss-clear');
  if (sheet) {
    wire(sbody);
    function paint() { sbody.innerHTML = render(sq.value); sclear.hidden = !sq.value; OT.icons(); }
    sq.addEventListener('input', paint);
    sclear.addEventListener('click', function () { sq.value = ''; paint(); sq.focus(); });
    sheet.addEventListener('sheet:open', function () { paint(); setTimeout(function () { sq.focus(); }, 80); });
    sheet.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); submit(sheet.querySelector('form')); });
    document.querySelectorAll('[data-search-sheet-trigger], #search-mobile-btn').forEach(function (t) {
      t.addEventListener('focus', function () { if (window.innerWidth < 768) { t.blur(); OT.openSheet(sheet); } });
      t.addEventListener('click', function () { if (window.innerWidth < 768) { t.blur(); OT.openSheet(sheet); } });
    });
  }
  // desktop: the header field shows the same list as a popover; Enter submits
  var pop = document.getElementById('search-pop'), hf = document.querySelector('.header-search'), hq = hf && hf.querySelector('input[name="q"]');
  if (pop && hq) {
    wire(pop); var open = false;
    function show() { pop.innerHTML = render(hq.value); pop.hidden = false; requestAnimationFrame(function () { pop.dataset.state = 'open'; }); hq.setAttribute('aria-expanded', 'true'); open = true; OT.icons(); }
    function hide() { if (!open) return; open = false; pop.dataset.state = 'closed'; hq.setAttribute('aria-expanded', 'false'); setTimeout(function () { if (!open) pop.hidden = true; }, 240); }
    hq.addEventListener('focus', show); hq.addEventListener('input', show);
    document.addEventListener('click', function (e) { if (!hf.contains(e.target)) hide(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open) { hide(); hq.blur(); } });
    hf.addEventListener('submit', function (e) { e.preventDefault(); submit(hf); });
    var qs = new URLSearchParams(location.search).get('q'); if (qs) hq.value = qs;
  }
  document.querySelectorAll('form[data-search]').forEach(function (f) { if (f !== hf && !(sheet && sheet.contains(f))) f.addEventListener('submit', function (e) { e.preventDefault(); submit(f); }); });

  // ---- S16 header (D-097) ----
  var qs = new URLSearchParams(location.search), path = location.pathname.replace(/\/(index\.html)?$/, '') || '/';  // D-105: pages live at their real address
  function store(kind) { try { return window[kind]; } catch (e) { return null; } }
  var LS = store('localStorage'), SS = store('sessionStorage');
  function get(s, k) { try { return s ? s.getItem(k) : null; } catch (e) { return null; } }
  function set(s, k, v) { try { if (s) s.setItem(k, v); } catch (e) {} }

  // header type links: mark the current page (Blog for the index and every post)
  var cur = /^\/blog(\/|$)/.test(path) ? '/blog' : path;
  document.querySelectorAll('.hnav a').forEach(function (a) { if (a.getAttribute('href') === cur) a.setAttribute('aria-current', 'page'); });
  // D-151: the page you are on is marked in the side menu too
  document.querySelectorAll('#menu-sheet .sheet-nav a').forEach(function (a) { var h = (a.getAttribute('href') || '').replace(/\/$/, ''); if (h && h !== '#' && h === cur.replace(/\/$/, '')) a.setAttribute('aria-current', 'page'); });

  // Blog "New" pill: shown until this visitor opens the blog after the newest post went up.
  // Pulses 3 times on the first page of a visit, then stays still. Review: ?blog=new · ?blog=seen
  var blogLink = document.querySelector('[data-blog-link][data-latest]');
  if (blogLink) {
    var latest = blogLink.dataset.latest, SEEN = 'ot-blog-seen';
    if (qs.get('blog') === 'new') set(LS, SEEN, ''); if (qs.get('blog') === 'seen') set(LS, SEEN, latest);
    if (cur === '/blog') set(LS, SEEN, latest);
    if (get(LS, SEEN) !== latest) {
      var pulse = !get(SS, 'ot-blog-pulsed'); set(SS, 'ot-blog-pulsed', '1');
      document.querySelectorAll('[data-blog-new]').forEach(function (p) { p.hidden = false; if (pulse) p.classList.add('is-pulsing'); });
      document.querySelectorAll('[data-blog-link]').forEach(function (a) { a.classList.add('has-new'); a.setAttribute('aria-label', 'Blog, new post'); });
    }
  }

  // "New since your last visit" (Home): last visit = previous session's last page view on this device.
  // Review: ?since=120 (last visit 120 min ago) · ?since=first (first visit)
  var since = document.querySelector('[data-since]');
  var now = Date.now(), prev = get(SS, 'ot-prev-visit');
  if (prev === null) { prev = get(LS, 'ot-last-visit') || ''; set(SS, 'ot-prev-visit', prev); }
  set(LS, 'ot-last-visit', String(now));
  if (since) {
    var sp = qs.get('since'); if (sp === 'first') prev = ''; else if (sp && !isNaN(+sp)) prev = String(now - sp * 60000);
    var txt = since.querySelector('[data-since-text]');
    if (!prev) { txt.innerHTML = '<b>' + since.dataset.today + '</b> deals posted today'; since.hidden = false; }
    else {
      var gap = (now - +prev) / 60000, n = since.dataset.ages.split(',').filter(function (a) { return +a >= 0 && +a < gap; }).length;
      if (n) { txt.innerHTML = '<b>' + n + '</b> new deal' + (n === 1 ? '' : 's') + ' since your last visit'; since.hidden = false; }
    }
  }

  // Sponsored slots (DEV-030, D-108): one ad per page view; with several live, pick one at random and use the same one in both slots
  var spSlots = document.querySelectorAll('[data-sp-slot]');
  if (spSlots.length) {
    var spIds = [].map.call(spSlots[0].querySelectorAll('[data-sp]'), function (a) { return a.dataset.sp; });
    var spPick = spIds[Math.floor(Math.random() * spIds.length)];
    spSlots.forEach(function (sl) { sl.querySelectorAll('[data-sp]').forEach(function (a) { a.hidden = a.dataset.sp !== spPick; }); });
  }
  // Back-to-top dock: #to-top lives in .fstack, which rides up above the footer
  var fstack = document.querySelector('[data-fstack]');
  if (fstack) {
    var tt = document.getElementById('to-top'); if (tt) fstack.appendChild(tt);
    document.body.appendChild(fstack);  // out of the footer so position: fixed is never clipped
    var foot = document.querySelector('.site-footer'), ticking = false;
    var dock = function () { ticking = false; if (!foot) return; var over = window.innerHeight - foot.getBoundingClientRect().top; fstack.style.setProperty('--dock', Math.max(0, over) + 'px'); };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(dock); } }, { passive: true });
    window.addEventListener('resize', dock); dock();
  }
  // Edge join tab (D-107): opens on hover (CSS); on touch the tab toggles it; outside tap or Esc closes
  var fjoin = document.querySelector('[data-fjoin]');
  if (fjoin) {
    document.body.appendChild(fjoin);
    var ftab = fjoin.querySelector('[data-fjoin-tab]');
    var fset = function (on) { fjoin.classList.toggle('is-open', on); ftab.setAttribute('aria-expanded', on ? 'true' : 'false'); };
    ftab.addEventListener('click', function (e) { e.stopPropagation(); fset(!fjoin.classList.contains('is-open')); });
    fjoin.addEventListener('mouseleave', function () { fset(false); ftab.blur(); });
    document.addEventListener('click', function (e) { if (fjoin.classList.contains('is-open') && !fjoin.contains(e.target)) fset(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && fjoin.classList.contains('is-open')) { fset(false); ftab.focus(); } });
  }
  // Browser alerts (prototype: the real site asks the browser for permission first)
  document.querySelectorAll('[data-browser-alerts]').forEach(function (b) { b.addEventListener('click', function () { set(LS, 'ot-alerts', '1'); OT.toast('Browser alerts on for this device', 'check'); }); });

  // hero = the BRD hottest-deals carousel (B02); admin off → ?hero=0 (Q-038)
  if (new URLSearchParams(location.search).get('hero') === '0') { var hero = document.getElementById('hero'); if (hero) hero.hidden = true; }

  // embed mode (desktop slide-over, D-050): links leave the frame
  if (document.documentElement.classList.contains('is-embed')) { var base = document.createElement('base'); base.target = '_top'; document.head.appendChild(base); }
})();

/* ---- S14: sign in (page + sheet / pop-up), signed-in header and menu, account, public delete request. Prototype: no backend. Review states: ?step=code · ?error=send|code|locked · ?turnstile=1 · ?user=1 · ?user=admin|sub (staff: Admin panel link, D-055) ---- */
(function () {
  var OT = window.OT, q = new URLSearchParams(location.search), KEY = 'ot-user', FLASH = 'ot-flash', page = document.body.dataset.page;
  var SAMPLE = { name: 'Asha Verma', email: 'asha@example.com', mobile: '' }; // declared SAMPLE, data sheet auth-account.md
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/, TRIES = 5, RESEND = 30;
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function stored() { try { return JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return null; } }
  function user() { var r = q.get('user'); return stored() || (r ? Object.assign({}, SAMPLE, r === 'admin' || r === 'sub' ? { role: r } : {}) : null); }
  function save(u) { try { if (u) localStorage.setItem(KEY, JSON.stringify(u)); else localStorage.removeItem(KEY); } catch (e) {} }
  function flash(msg) { try { sessionStorage.setItem(FLASH, msg); } catch (e) {} }
  function show(el, msg) { if (!el) return; el.textContent = msg || ''; el.hidden = !msg; }
  OT.user = user;

  function paint() {
    var u = user();
    all('[data-when-user]').forEach(function (el) { el.hidden = !u; });
    all('[data-when-guest]').forEach(function (el) { el.hidden = !!u; });
    var staff = !!(u && (u.role === 'admin' || u.role === 'sub'));  // roles 1 and 3 only (D-055, W02)
    all('[data-when-staff]').forEach(function (el) { el.hidden = !staff; if (staff) el.href = u.role === 'sub' ? '/admin/deal?role=sub' : '/admin'; });
    if (!u) return;
    all('[data-user-name]').forEach(function (el) { el.textContent = u.name; });
    all('[data-user-initial]').forEach(function (el) { el.textContent = (u.name || u.email).charAt(0).toUpperCase(); });
    all('[data-user-email]').forEach(function (el) { el.textContent = u.email; });
  }
  paint();
  window.addEventListener('storage', function (e) { if (e.key === KEY) paint(); });
  try { var m = sessionStorage.getItem(FLASH); if (m) { sessionStorage.removeItem(FLASH); OT.toast(m, 'check'); } } catch (e) {}
  document.addEventListener('click', function (e) {
    if (!e.target.closest('[data-signout]')) return;
    save(null); flash('Signed out'); location.href = page === 'account' ? '/' : location.pathname;
  });

  function returnUrl() {
    var u = q.get('url'); if (u && /^\/(?!\/)[\w\-\/]*([?#].*)?$/.test(u)) return u;  // local paths only
    try { var r = new URL(document.referrer); if (r.origin === location.origin && !/^\/(login|relogin)(\/|$)/.test(r.pathname)) return r.pathname + r.search; } catch (e) {}
    return '/';
  }

  // one sign-in block; used by login.html and the shared sheet / pop-up
  function wire(root, done) {
    var title = root.querySelector('[data-signin-title]'), sub = root.querySelector('[data-signin-sub]'), start = root.querySelector('[data-step="start"]'), code = root.querySelector('[data-step="code"]');
    var form = root.querySelector('[data-email-form]'), email = form.querySelector('input[name="email"]'), emailErr = root.querySelector('[data-email-error]'), codeErr = root.querySelector('[data-code-error]'), resend = root.querySelector('[data-resend]');
    var box = root.querySelector('[data-turnstile]'), tick = root.querySelector('[data-turnstile-box]'), boxes = all('.otp input', root), timer = null, left = 0, tries = TRIES, sentTo = '';
    function clock() { var s = left < 10 ? '0' + left : left; resend.textContent = left > 0 ? 'Resend code in 0:' + s : 'Resend code'; resend.disabled = left > 0; }
    function count() { clearInterval(timer); left = RESEND; clock(); timer = setInterval(function () { left--; clock(); if (left <= 0) clearInterval(timer); }, 1000); }
    function clearBoxes() { boxes.forEach(function (b) { b.value = ''; }); }
    var help = root.querySelector('.signin-help');
    function lock() { clearInterval(timer); help.hidden = true; boxes.forEach(function (b) { b.disabled = true; }); resend.disabled = true; resend.textContent = 'Resend code'; show(codeErr, 'Too many tries. Please wait 15 minutes, then ask for a new code.'); }
    function toStart() { clearInterval(timer); code.hidden = true; start.hidden = false; title.textContent = 'Sign in'; sub.textContent = 'New here? Signing in creates your account.'; }
    function toCode(addr) {
      sentTo = addr; tries = TRIES; help.hidden = false; clearBoxes(); boxes.forEach(function (b) { b.disabled = false; }); show(codeErr, ''); start.hidden = true; code.hidden = false; title.textContent = 'Enter the code';
      sub.textContent = ''; sub.appendChild(document.createTextNode('Sent to ' + addr + ' · '));
      var ch = document.createElement('button'); ch.type = 'button'; ch.className = 'btn btn-link signin-change'; ch.textContent = 'Change'; ch.addEventListener('click', function () { toStart(); email.focus(); }); sub.appendChild(ch);
      count(); setTimeout(function () { boxes[0].focus(); }, 60);
    }
    function verify() {
      var v = boxes.map(function (b) { return b.value; }).join(''); if (v.length < 6) return;
      if (v !== '000000') { clearInterval(timer); done(sentTo); return; } // prototype: 000000 is the wrong code, any other works
      tries--; clearBoxes();
      if (tries <= 0) { lock(); return; }
      show(codeErr, 'That code is not right. ' + tries + (tries === 1 ? ' try' : ' tries') + ' left.'); boxes[0].focus();
    }
    function fill(from, text) { var d = text.replace(/\D/g, '').split(''), i = from; d.forEach(function (c) { if (i < 6) boxes[i++].value = c; }); boxes[Math.min(i, 5)].focus(); verify(); }
    boxes.forEach(function (b, i) {
      b.addEventListener('input', function () { show(codeErr, ''); var d = b.value.replace(/\D/g, ''); if (d.length > 1) { b.value = ''; fill(i, d); return; } b.value = d; if (d && i < 5) boxes[i + 1].focus(); verify(); });
      b.addEventListener('keydown', function (e) { if (e.key === 'Backspace' && !b.value && i > 0) { boxes[i - 1].focus(); boxes[i - 1].value = ''; e.preventDefault(); } });
      b.addEventListener('paste', function (e) { e.preventDefault(); fill(i, (e.clipboardData || window.clipboardData).getData('text')); });
    });
    resend.addEventListener('click', function () { count(); OT.toast('New code sent', 'check'); });
    root.querySelector('[data-google]').addEventListener('click', function () { done(SAMPLE.email); });
    form.addEventListener('submit', function (e) {
      e.preventDefault(); var v = email.value.trim(); show(emailErr, '');
      if (!EMAIL.test(v)) { show(emailErr, 'Enter a valid email address.'); email.focus(); return; }
      if (!box.hidden && !tick.checked) { show(emailErr, 'Please complete the check below first.'); return; }
      if (/fail/i.test(v)) { show(emailErr, 'We could not send the code. Try again or use Google.'); return; } // prototype: an address containing "fail"
      toCode(v);
    });
    return { reset: function () { toStart(); form.reset(); show(emailErr, ''); }, toCode: toCode, lock: lock, sendError: function () { show(emailErr, 'We could not send the code. Try again or use Google.'); }, codeError: function () { show(codeErr, 'That code is not right. 4 tries left.'); tries = 4; }, turnstile: function () { box.hidden = false; } };
  }

  function member(addr) { return { name: SAMPLE.name, email: addr || SAMPLE.email, mobile: '' }; }

  // sheet / pop-up (D-091): every [data-signin-open] opens it; login.html is the full page
  var sheet = document.getElementById('signin-sheet');
  if (sheet) {
    var fromComposer = false;
    var pop = wire(sheet.querySelector('[data-signin]'), function (addr) {
      save(member(addr)); paint(); OT.closeSheet(); OT.toast('Signed in', 'check');
      document.dispatchEvent(new CustomEvent('ot:signin', { detail: { fromComposer: fromComposer } }));
    });
    sheet.addEventListener('sheet:open', pop.reset);
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-signin-open]'); if (!t) return;
      e.preventDefault(); fromComposer = !!t.closest('#composer-out'); OT.openSheet(sheet);
    });
    if (q.get('turnstile') === '1') pop.turnstile();
  }

  // full page
  if (page === 'login') {
    // M-14 (D-106): staff who sign in here go to the admin; everyone else returns to where they were. Prototype: @offertag.in = staff, "sub…" = sub-admin (SAMPLE)
    var w = wire(document.querySelector('[data-signin]'), function (addr) {
      var u = member(addr), staff = /@offertag\.in$/i.test(addr), back = returnUrl();
      if (staff) u.role = /^sub/i.test(addr) ? 'sub' : 'admin';
      save(u); flash('Signed in');
      location.href = !staff ? back : /^\/admin(\/|$|\?)/.test(back) ? back : u.role === 'sub' ? '/admin/deal?role=sub' : '/admin';
    });
    if (q.get('turnstile') === '1') w.turnstile();
    var step = q.get('step'), err = q.get('error');
    if (err === 'send') w.sendError();
    if (step === 'code' || err === 'code' || err === 'locked') w.toCode(SAMPLE.email);
    if (err === 'code') w.codeError();
    if (err === 'locked') w.lock();
    var back = document.querySelector('[data-back]');
    if (back) back.addEventListener('click', function (e) { if (history.length > 1 && document.referrer) { e.preventDefault(); history.back(); } });
  }
  if (page === 'relogin') {
    var target = returnUrl(), s = document.querySelector('[data-relogin-signin]'), c = document.querySelector('[data-relogin-skip]');
    s.href = '/login?url=' + encodeURIComponent(target); c.href = target;
  }

  // account
  if (page === 'account') {
    var u = user();
    if (!u) { location.replace('/login?url=' + encodeURIComponent('/user/profile')); return; }
    var af = document.getElementById('account-form'), nm = af.elements.name, mob = af.elements.mobile, sw = document.getElementById('alerts-switch');
    nm.value = u.name; mob.value = u.mobile || '';
    function ferr(name, msg) { show(document.querySelector('[data-err="' + name + '"]'), msg); }
    af.addEventListener('submit', function (e) {
      e.preventDefault(); var n = nm.value.trim(), d = mob.value.trim(), ok = true; ferr('name', ''); ferr('mobile', '');
      if (!n) { ferr('name', 'Enter a display name.'); ok = false; }
      if (d && !/^\d{1,10}$/.test(d)) { ferr('mobile', 'Enter your mobile number, up to 10 digits.'); ok = false; }
      if (!ok) return;
      save({ name: n, email: u.email, mobile: d }); u = user(); paint(); OT.toast('Saved', 'check');
    });
    function setSw(on) { sw.setAttribute('aria-checked', on ? 'true' : 'false'); }
    try { setSw(localStorage.getItem('ot-alerts') === '1'); } catch (e) {}
    sw.addEventListener('click', function () { var on = sw.getAttribute('aria-checked') !== 'true'; setSw(on); try { localStorage.setItem('ot-alerts', on ? '1' : '0'); } catch (e) {} OT.toast(on ? 'Browser alerts on' : 'Browser alerts off', 'check'); });
    var open = document.getElementById('delete-open'), panel = document.getElementById('delete-confirm');
    open.addEventListener('click', function () { panel.hidden = false; open.hidden = true; document.getElementById('delete-no').focus(); });
    document.getElementById('delete-no').addEventListener('click', function () { panel.hidden = true; open.hidden = false; open.focus(); });
    document.getElementById('delete-yes').addEventListener('click', function () { save(null); flash('Your account has been deleted.'); location.href = '/'; });
  }

  // public delete request (B31): same success for unknown or repeat emails, membership is never revealed (D-061)
  if (page === 'delete-account') {
    var df = document.getElementById('delete-form'), box2 = df.querySelector('[data-turnstile]');
    if (q.get('turnstile') === '1') box2.hidden = false;
    function derr(name, msg) { show(df.querySelector('[data-err="' + name + '"]'), msg); return !msg; }
    df.addEventListener('submit', function (e) {
      e.preventDefault(); var el = df.elements;
      var a = derr('name', el.name.value.trim() ? '' : 'Enter your name.');
      var b = derr('email', EMAIL.test(el.email.value.trim()) ? '' : 'Enter a valid email address.');
      var c2 = derr('mobile_number', el.mobile_number.value.trim() ? '' : 'Enter your mobile number.');
      var t2 = derr('turnstile', box2.hidden || box2.querySelector('input').checked ? '' : 'Please complete the check first.');
      if (!(a && b && c2 && t2)) { var f = df.querySelector('.form-error:not([hidden])'); if (f && f.previousElementSibling) (f.previousElementSibling.querySelector('input') || f.previousElementSibling).focus(); return; }
      if (window.OTDB) { var em = el.email.value.trim(), mo = el.mobile_number.value.trim(); OTDB.addInbox('deletion', { name: el.name.value.trim(), email: em, phone: mo.length > 4 ? mo.slice(0, 2) + 'xxxxxx' + mo.slice(-2) : mo, reason: el.reason ? el.reason.value.trim() : '' }); }   // S25 playground: Admin → Inbox → Deletion requests
      df.hidden = true; document.getElementById('delete-done').hidden = false; document.querySelector('.form-lead').hidden = true; window.scrollTo(0, 0);
    });
  }

  // S15: feedback form (B30, A16). Prototype: no backend. Review state: ?turnstile=1
  if (page === 'contact') {
    var ff = document.getElementById('feedback-form'), done = document.getElementById('feedback-done'), box3 = ff.querySelector('[data-turnstile]');
    if (user()) ff.elements.email.value = user().email;
    if (q.get('turnstile') === '1') box3.hidden = false;
    function ferr(name, msg) { show(ff.querySelector('[data-err="' + name + '"]'), msg); return !msg; }
    ff.elements.description.addEventListener('input', function () { done.hidden = true; });
    ff.addEventListener('submit', function (e) {
      e.preventDefault(); var el = ff.elements; done.hidden = true;
      var a = ferr('email', EMAIL.test(el.email.value.trim()) ? '' : 'Enter a valid email address.');
      var b = ferr('description', el.description.value.trim() ? '' : 'Enter your message.');
      var c = ferr('turnstile', box3.hidden || box3.querySelector('input').checked ? '' : 'Please complete the check first.');
      if (!(a && b && c)) { var f = ff.querySelector('.form-error:not([hidden])'); if (f && f.previousElementSibling) (f.previousElementSibling.querySelector('input,textarea') || f.previousElementSibling).focus(); return; }
      if (window.OTDB) { var kv = (ff.querySelector('input[name="feedback"]:checked') || {}).value; OTDB.addInbox('feedback', { kind: { '1': 'Suggestion', '2': 'Issue', '3': 'Appreciation' }[kv] || 'Issue', who: el.email.value.trim(), msg: el.description.value.trim() }); }   // S25 playground: Admin → Inbox → Feedback
      el.description.value = ''; done.hidden = false;
    });
  }
  // error family: Try again / Retry
  all('[data-reload]').forEach(function (b) { b.addEventListener('click', function () { location.reload(); }); });
  // blog: copy link; review states ?empty=1 (no posts yet) and ?pager=1 (more than one page)
  all('[data-copy-link]').forEach(function (b) {
    b.addEventListener('click', function () { OT.copy(b.dataset.copyLink).then(function () {
      OT.toast('Link copied', 'check');
      if (b.classList.contains('sh-ic')) { b.classList.add('is-done'); b.dataset.tip = 'Link copied'; setTimeout(function () { b.classList.remove('is-done'); b.dataset.tip = 'Copy link'; }, 2000); }
    }, function () { OT.toast('Could not copy the link'); }); });
  });
  // blog share (D-111): hover/focus opens on desktop; tap toggles on touch; outside tap and Esc close
  all('[data-share]').forEach(function (s) {
    var t = s.querySelector('[data-share-trig]'); if (!t) return;  // S22: the deal page's Copy link button also carries data-share; only blog share menus have a trigger
    function set(o) { s.classList.toggle('is-open', o); t.setAttribute('aria-expanded', o ? 'true' : 'false'); }
    t.addEventListener('click', function () { set(!s.classList.contains('is-open')); });
    s.addEventListener('mouseleave', function () { set(false); });
    document.addEventListener('click', function (e) { if (!s.contains(e.target)) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && s.classList.contains('is-open')) { set(false); t.focus(); } });
  });
  if (page === 'blog') {
    if (q.get('empty') === '1') { document.getElementById('blog-list').hidden = true; document.getElementById('blog-empty').hidden = false; }
    if (q.get('pager') === '1') document.getElementById('blog-pager').hidden = false;
  }
})();

/* D-128: fold-out panels (<details>: filter groups, FAQ, How to get it, About text) roll open and closed instead of jumping.
   Public site only. Reduced motion keeps the instant toggle. A click mid-roll reverses from where it is. */
(function () {
  if (!document.documentElement.classList.contains('theme') || !Element.prototype.animate) return;
  var still = window.matchMedia('(prefers-reduced-motion: reduce)'), DUR = 260, EASE = 'cubic-bezier(.2,0,0,1)';
  document.addEventListener('click', function (e) {
    var s = e.target.closest('summary'), d = s && s.parentElement;
    if (!d || d.tagName !== 'DETAILS' || s !== d.querySelector(':scope > summary') || still.matches) return;
    e.preventDefault();
    var from = d.getBoundingClientRect().height, closing = d.open && !d.classList.contains('is-closing');
    if (d._roll) { d._roll.onfinish = null; d._roll.cancel(); }
    var to;
    if (closing) { d.classList.add('is-closing'); d.open = false; to = d.getBoundingClientRect().height; d.open = true; }
    else { d.classList.remove('is-closing'); d.open = true; to = d.getBoundingClientRect().height; }
    d.style.overflow = 'hidden';
    var a = d._roll = d.animate({ height: [from + 'px', to + 'px'] }, { duration: DUR, easing: EASE });
    a.onfinish = function () { if (closing) { d.open = false; d.classList.remove('is-closing'); } d.style.overflow = ''; d._roll = null; };
  });
})();
