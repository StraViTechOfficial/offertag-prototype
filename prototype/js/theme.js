/* theme.js — Look B (D-095) hooks for css/theme.css on every page: rotating soft tints, section icon chips,
   store monograms (placeholder until client logos arrive), and the once-only rise-in of cards. */
(function () {
  var root = document.documentElement;
  var TINTS = ['t-sky', 't-mint', 't-peach'];

  // Home posters and category tiles rotate the three tints
  document.querySelectorAll('.hero-card').forEach(function (el, i) { el.classList.add(TINTS[i % 3]); });
  document.querySelectorAll('.cat .tile').forEach(function (el, i) { el.classList.add(TINTS[i % 3]); });
  // store tiles: letter monogram until client logos arrive
  document.querySelectorAll('.store').forEach(function (el, i) {
    var b = el.querySelector('b'); if (!b || el.querySelector('.mono') || el.classList.contains('has-logo')) return;
    var m = document.createElement('span'); m.className = 'mono ' + TINTS[i % 3]; m.textContent = b.textContent.trim().charAt(0);
    el.insertBefore(m, b);
  });

  // icon chips: Home section heads, and the matching page head on each type page
  var ICONS = { 'h-cats': ['layout-grid', 't-peach'], 'h-fresh': ['star', 't-sky'], 'h-top': ['star', 't-mint'], 'h-stores': ['store', 't-sky'], 'h-loot': ['flame', 't-peach'], 'h-new': ['sparkles', 't-mint'] };
  var PAGE_ICON_EXTRA = { '/faq': ['circle-help', 't-sky'] };
  var PAGE_ICON = { '/loot-deals': 'h-loot', '/top-deals': 'h-fresh', '/new-deals': 'h-new', '/categories': 'h-cats', '/stores': 'h-stores' };
  function chip(h, key, loot) {
    if (!h || h.querySelector('.sh-ico')) return;
    var s = document.createElement('span'); s.className = 'sh-ico ' + ICONS[key][1]; s.innerHTML = '<i data-lucide="' + ICONS[key][0] + '"></i>';
    h.insertBefore(s, h.firstChild);
    // D-141: "+80% off" sticker on the heading's top-right corner; beside the heading (in a .loot-sup wrapper), never inside it
    if (loot) {
      var t = document.createElement('span'); t.className = 'loot-tag'; t.textContent = ((window.OTDB && OTDB.typeRules ? OTDB.typeRules().loot : 75)) + '%+ off';   // follows Catalogue → Deal types (changes.md A-14)
      var box = h.tagName === 'H1' ? document.createElement('div') : h.parentElement;
      if (h.tagName === 'H1') { h.parentNode.insertBefore(box, h); box.appendChild(h); }
      box.classList.add('loot-sup'); box.appendChild(t);
    }
  }
  Object.keys(ICONS).forEach(function (id) { chip(document.getElementById(id), id, id === 'h-loot'); });
  var file = location.pathname.replace(/\/(index\.html)?$/, '') || '/';  // D-105: real addresses
  if (PAGE_ICON_EXTRA[file]) { ICONS.faq = PAGE_ICON_EXTRA[file]; chip(document.querySelector('.page-head h1'), 'faq'); }
  if (PAGE_ICON[file]) chip(document.querySelector('.page-head h1'), PAGE_ICON[file], file === '/loot-deals');
  if (window.lucide && lucide.createIcons) lucide.createIcons();

  // rise-in: cards in each row fade up once as the row scrolls into view; 45 ms stagger, capped at 6
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return; io.unobserve(e.target);
        e.target.querySelectorAll('.reveal').forEach(function (c, i) { c.style.setProperty('--d', Math.min(i, 6) * 45 + 'ms'); c.classList.add('is-in'); });
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('.carousel-container, .deal-grid, .stores-grid').forEach(function (g) {
      g.querySelectorAll(':scope > .carousel-item > .card, :scope > .card, :scope > .carousel-item > .cat').forEach(function (c) { c.classList.add('reveal'); });
      io.observe(g);
    });
  }
})();
