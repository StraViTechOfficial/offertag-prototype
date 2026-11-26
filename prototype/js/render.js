/* render.js — the public pages drawn from the playground data (S25, plan.md Part B).
   Runs after db.js has the data and before the page's own scripts (site.js, listing.js, detail.js) start, so those scripts
   work on these cards and blocks exactly as they did on the built ones. Every piece mirrors the Python that built the page
   (build/build.py: card, td_card, sponsor_card, the deal page blocks, the blog), so a deal nobody changed looks the same. */
(function () {
  'use strict';
  var DB = window.OTDB; if (!DB) return;
  var H = DB.H, E = H.esc, inr = H.inr;
  var CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>';
  var CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>';
  var TD_STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>';
  var TD_UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>';
  var TYPELABEL = { Top: 'Top deal', Loot: 'Loot', New: 'New', Pantry: 'Pantry', Fresh: 'Posted today' };
  var SITE = 'https://www.offertag.in';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function quote(s) { return encodeURIComponent(s).replace(/[!'()*]/g, function (c) { return '%' + c.charCodeAt(0).toString(16).toUpperCase(); }).replace(/%2F/g, '/'); }  // Python urllib.parse.quote
  function path() { var q = new URLSearchParams(location.search).get('path'); return (q || location.pathname).replace(/\/(index\.html)?$/, '') || '/'; }

  /* ---------------- pieces ---------------- */
  function storeChip(store, cls) {
    var lg = DB.logo(store);
    return lg ? '<img class="' + (cls || 'store-chip') + '" src="' + E(lg) + '" alt="' + E(store) + '" loading="lazy">' : '<span class="' + (cls || 'store-chip') + ' is-text">' + E(store) + '</span>';
  }
  function card(d, wrap) {  // build.py card(); 2026-11-25 (changes.md P-01, P-02): category · age + store logo on top, price · MRP · % off on one line, saving below, Pinned chip
    var price = d.sale ? '<span class="price">Up to ' + d.pct + '% off</span>' : '<span class="price">' + inr(d.p) + '</span>' + (d.save ? '<span class="was">' + inr(d.m) + '</span><span class="pct">' + d.pct + '% off</span>' : '');
    var pin = d.pin ? '<span class="pin-chip"><i data-lucide="pin" aria-hidden="true"></i>Pinned</span>' : '';
    var inner = '<article class="card deal" data-id="' + E(d.id) + '" data-page="' + E(d.page) + '" data-q="' + E((d.t + ' ' + d.cat + ' ' + d.store).toLowerCase()) + '"' + (d.pin ? ' data-pinned="1"' : '') +
      ' data-cat="' + E(d.cat) + '" data-store="' + E(d.store) + '" data-pct="' + d.pct + '" data-price="' + d.p + '" data-save="' + d.save + '" data-age="' + d.agemin + '" data-views="' + (d.views || 0) + '" data-types="' + E(d.typesAll.join(',')) + '"' + (d.coupon ? ' data-coupon="1"' : '') + '>\n' +
      '  <a class="img" href="' + E(d.page) + '" aria-label="' + E(d.t) + '"><img src="' + E(d.img) + '" alt="" loading="lazy" width="300" height="300">' + pin + '</a>\n' +
      '  <button class="btn btn-icon card-share" type="button" aria-label="Share"><i data-lucide="share-2"></i></button>\n' +
      '  <div class="body">\n' +
      '    <div class="topline"><span class="meta"><span class="m-cat">' + E(d.cat || 'Others') + '</span><span class="m-dot" aria-hidden="true">·</span><span class="m-age">' + (d.agemin < 1 ? 'Just now' : E(d.agetxt) + '<span class="m-ago"> ago</span>') + '</span></span>' + storeChip(d.store) + '</div>\n' +
      '    <a class="title" href="' + E(d.page) + '" title="' + E(d.t) + '">' + E(d.t) + '</a>\n' +
      '    <div class="priceline">' + price + '</div>\n' +
      '    <div class="saveline">' + (d.save && !d.sale ? '<span class="save">You save ' + inr(d.save) + '</span>' : '') + '</div>\n' +
      '    <div class="acts"><a class="btn btn-buy" href="' + E(d.link || '#buy') + '" target="_blank" rel="nofollow sponsored noopener" aria-label="Buy now at ' + E(d.store) + '" data-buy-id="' + E(d.id) + '">Buy now<i data-lucide="arrow-up-right" aria-hidden="true"></i></a></div>\n' +
      '  </div></article>';
    return wrap === false ? inner : '<div class="carousel-item">' + inner + '</div>';
  }
  function carousel(items, free) {
    return '<div class="carousel"' + (free ? ' data-free="true"' : '') + '>\n        <div class="carousel-viewport"><div class="carousel-container">' + items + '</div></div>\n        <button class="carousel-prev" aria-label="Previous">' + CHEV_L + '</button>\n        <button class="carousel-next" aria-label="Next">' + CHEV_R + '</button>\n      </div>';
  }
  function tint(store) { var s = DB.shop(store); return s && s.tint ? s.tint : DB.get('tintDefault'); }
  function btnColors(store) { var s = DB.shop(store); return s && s.btn ? s.btn : DB.get('btnDefault'); }
  function tdCard(store, photo, fill, title, priceline, href, o) {  // build.py td_card()
    o = o || {}; var t = tint(store), b = btnColors(store), lg = DB.logo(store);
    var st = lg ? '<img class="td-st" src="' + E(lg) + '" alt="' + E(store) + '">' : '<span class="td-st-t">' + E(store) + '</span>';
    var chips = (o.featured ? '<span class="td-feat">' + TD_STAR + 'Featured</span>' : '') + (o.trending ? '<span class="td-trend">' + TD_UP + 'Trending</span>' : '');
    var ext = /^https?:/.test(href) ? ' target="_blank" rel="noopener"' : '';
    return '<div class="td-slide"><a class="td-card" style="--cb:' + t[0] + ';--cbd:' + t[1] + ';--bb:' + b[0] + ';--bf:' + b[1] + '" href="' + E(href) + '"' + ext + '>' +
      '<span class="td-photo"><img' + (fill ? ' class="fill"' : '') + ' src="' + E(photo) + '" alt="' + E(o.alt || '') + '" loading="lazy">' + chips + '</span>' +
      '<span class="td-txt"><span class="td-store">' + st + '</span><span class="td-title">' + E(title) + '</span><span class="td-price">' + priceline + '</span></span>' +
      '<span class="td-view">View deal<i data-lucide="arrow-right"></i></span></a></div>';
  }
  function tdDeal(d, o) { return tdCard(d.store, d.td, d.tdFill, d.t, d.sale ? '<b>Up to ' + d.pct + '% off</b>' : '<b>' + inr(d.p) + '</b><s>' + inr(d.m) + '</s><em>' + d.pct + '% off</em>', d.page, o); }
  function liveByDates(x) { var t = DB.today(); return x.on && (!x.start || x.start <= t) && (!x.end || t <= x.end); }
  function sponsorCard(x, where) {  // changes.md A-07: the advertiser's picture and one button, labelled Sponsored
    var img = DB.imgSrc(x.img), tel = /^tel:/.test(x.link || '');
    return '<a class="sp-card sp-pic sp-' + where + '" href="' + E(x.link || '#') + '"' + (tel ? '' : ' target="_blank" rel="sponsored nofollow noopener"') + ' data-sp="' + E(x.id) + '" aria-label="Sponsored: ' + E(x.cta || 'Visit') + '">' +
      '<span class="sp-img"><img src="' + E(img) + '" alt="" loading="lazy"></span>' +
      '<span class="sp-body"><span class="sp-tag">Sponsored' + (x.sample ? '<span class="sp-sample"> · Sample</span>' : '') + '</span>' +
      '<span class="sp-cta">' + E(x.cta || 'Visit') + '<i data-lucide="' + (tel ? 'phone' : 'arrow-right') + '"></i></span></span></a>';
  }
  function byViews(a, b) { return (b.views || 0) - (a.views || 0); }

  /* ---------------- lists ---------------- */
  var LISTS = {
    '/top-deals': function (all) { return all.filter(function (d) { return d.typesAll.indexOf('Fresh') > -1 || d.pin; }); },  // P-13: today's deals (since 12 am), any discount; pinned deals stay whatever their date
    '/loot-deals': function (all) { return all.filter(function (d) { return d.typesAll.indexOf('Loot') > -1; }).sort(function (a, b) { return b.pct - a.pct; }); },
    '/new-deals': function (all) { return all.filter(function (d) { return d.typesAll.indexOf('New') > -1; }); },
    '/pantry-deals': function (all) { return all.filter(function (d) { return d.typesAll.indexOf('Pantry') > -1; }); },
    '/deals/search': function (all) { return all; }
  };
  function listFor(p, all) {
    if (LISTS[p]) return { items: LISTS[p](all) };
    var m;
    if ((m = p.match(/^\/products\/(.+)-deals$/))) { var c = DB.get('categories').filter(function (x) { return x.slug === m[1]; })[0]; return c ? { items: all.filter(function (d) { return d.cat === c.name; }), cat: c } : null; }
    if ((m = p.match(/^\/shops\/([^\/]+)\/([^\/]+)$/))) {
      var s2 = DB.get('shops').filter(function (x) { return x.slug === m[1]; })[0], c2 = DB.get('categories').filter(function (x) { return x.slug === m[2]; })[0];
      return s2 && c2 ? { items: all.filter(function (d) { return d.store === s2.name && d.cat === c2.name; }), shop: s2, cat: c2, combo: true } : null;
    }
    if ((m = p.match(/^\/shops\/([^\/]+)$/))) { var s = DB.get('shops').filter(function (x) { return x.slug === m[1]; })[0]; return s ? { items: all.filter(function (d) { return d.store === s.name; }), shop: s } : null; }
    return null;
  }
  function ensureOption(group, value) {
    var box = $('.opts[data-group="' + group + '"]'); if (!box || $('input[name="' + group + '"][value="' + CSS.escape(value) + '"]', box)) return;
    var c = group === 'cat' ? DB.cat(value) : DB.shop(value), s = c ? c.slug : H.slug(value);
    var tpl = $('.opt', box); if (!tpl) return; var n = tpl.cloneNode(true), i = $('input', n);
    i.value = value; i.checked = false; i.setAttribute('data-s', s); $('.txt', n).textContent = value; box.appendChild(n);
  }
  function renderListing() {
    var p = path(), all = DB.deals(), L = listFor(p, all); if (!L) return false;
    var R = DB.typeRules(), RULE = { '/top-deals': 'Today\'s deals, newest first', '/loot-deals': R.loot + '% off or more', '/new-deals': 'Under ' + R.top + '% off, newest first', '/pantry-deals': R.pantry.join(', ') + ' essentials' };
    if (RULE[p]) { if ($('#page-rule')) $('#page-rule').textContent = RULE[p]; var mdr = $('meta[name="description"]'); if (mdr) mdr.content = RULE[p] + '. Live prices from Amazon, Flipkart and more.'; }
    var results = $('#results'), empty = $('#empty'); if (!results || !empty) return false;
    $$('.deal', results).forEach(function (c) { c.remove(); });
    var frag = document.createElement('div'); frag.innerHTML = L.items.map(function (d) { return card(d, false); }).join('');
    while (frag.firstChild) results.insertBefore(frag.firstChild, empty);
    var cnt = $('#count'), sc = $('#sheet-count'); if (cnt) cnt.textContent = L.items.length; if (sc) sc.textContent = L.items.length;
    L.items.forEach(function (d) { ensureOption('cat', d.cat); ensureOption('store', d.store); });
    // pinned slots on Top deals (D-104): N and the order come from the Pinned board
    if (p === '/top-deals') { document.body.dataset.pinEvery = DB.pinEvery(); document.body.dataset.pins = DB.pins().map(function (d) { return d.id; }).join(','); }
    // category / store names follow Catalogue; pages for a new category or store are drawn on a shell page
    var who = L.combo ? L.cat.name + ' deals from ' + L.shop.name : L.cat ? L.cat.name + ' deals' : L.shop ? L.shop.name + ' deals' : null;
    if (who) {
      var h1 = $('#page-title'); if (h1) h1.textContent = who;
      var lock = $('#locked'); if (lock) lock.innerHTML = (L.combo ? [L.shop.name, L.cat.name] : [(L.cat || L.shop).name]).map(function (n) { return '<span class="chip-x is-locked"><i data-lucide="lock"></i>' + E(n) + '</span>'; }).join('');
      var rule = $('#page-rule'); if (rule && !L.combo) rule.textContent = L.cat ? 'All stores' : 'All categories';   // D-155: no deal counts
      if (rule && L.combo) rule.textContent = 'All deals from this store in this category';  // P-16: no counts
      var cr = $('.crumbs');
      if (cr) cr.innerHTML = '<a href="/">Home</a><i data-lucide="chevron-right"></i>' + (L.combo ? '<a href="/stores">Stores</a><i data-lucide="chevron-right"></i><a href="' + E(DB.shopPage(L.shop.name)) + '">' + E(L.shop.name) + '</a><i data-lucide="chevron-right"></i><span>' + E(L.cat.name) + '</span>'
        : L.cat ? '<a href="/categories">Categories</a><i data-lucide="chevron-right"></i><span>' + E(L.cat.name) + '</span>' : '<a href="/stores">Stores</a><i data-lucide="chevron-right"></i><span>' + E(L.shop.name) + '</span>');
      var x = L.cat && !L.combo ? L.cat : L.shop && !L.combo ? L.shop : null;
      document.title = x && x.title ? x.title : who + ' — OfferTag';
      var md = $('meta[name="description"]'); if (md && x && x.description) md.content = x.description;
      if (document.body.dataset.shell) {  // a page made from the shell: show the right facets for its kind
        var g = function (k) { var b = $('.opts[data-group="' + k + '"]'); return b && b.closest('.fgroup'); };
        if (g('cat')) g('cat').hidden = !!L.cat; if (g('store')) g('store').hidden = !!L.shop;
        document.body.dataset.kind = L.combo ? 'combo' : L.cat ? 'category' : 'store';
      }
    }
    return true;
  }

  /* ---------------- Home ---------------- */
  function renderHome() {
    var td = $('.td-container'); if (!td) return false;
    var site = DB.get('site') || {}, all = DB.deals(), items = '', featured = {};
    // 2026-11-25 (changes.md P-08, A-06): the hero opens with the deals marked Featured in the admin; sale posters are gone
    DB.featured().forEach(function (d) { featured[d.id] = 1; items += tdDeal(d, { featured: true }); });
    var trend = DB.get('trending') || [];
    all.filter(function (d) { return !featured[d.id]; }).sort(byViews).slice(0, 10).forEach(function (d, i) { items += tdDeal(d, { trending: trend.indexOf(i) > -1 }); });
    td.innerHTML = items;
    // P-34: four rails (Top, Loot, New, Pantry), 16 deals each, then a View all slide
    [['#fresh', '/top-deals'], ['#loot', '/loot-deals'], ['#new', '/new-deals'], ['#pantry', '/pantry-deals']].forEach(function (x) {
      var sec = $(x[0]), old = sec && $('.carousel', sec), list = LISTS[x[1]](all); if (!old) return;
      if (!list.length) { sec.hidden = true; return; }
      var more = list.length > 16 ? '<div class="carousel-item"><a class="rail-more" href="' + x[1] + '"><span class="rm-ico"><i data-lucide="arrow-right"></i></span><b>View all</b></a></div>' : '';
      var t = document.createElement('div'); t.innerHTML = carousel(list.slice(0, 16).map(function (d) { return card(d); }).join('') + more); old.replaceWith(t.firstChild);
    });
    // "N deals posted today" / "new since your last visit" (site.js reads these)
    var since = $('[data-since]');
    if (since) {
      var today = all.filter(function (d) { return d.agemin <= 1440; });
      since.dataset.today = today.length; since.dataset.ages = all.map(function (d) { return d.agemin; }).join(',');
      var meta = $('.since-meta', since); if (meta && all.length) meta.textContent = 'Last deal posted ' + (all[0].agemin < 1 ? 'just now' : all[0].agetxt + ' ago');
    }
    // sponsored: one live ad per visit, the same in both slots (no view or click counts, 2026-11-26)
    $$('[data-sp-slot]').forEach(function (s) { var sec = s.closest('.sp-inline'); (sec || s).remove(); });
    var live = DB.get('sponsored').filter(liveByDates);
    if (live.length) {
      var pick = live[Math.floor(Math.random() * live.length)], side = $('.home-side');
      if (side) side.insertAdjacentHTML('afterbegin', '<div class="sp-slot sp-slot-side" data-sp-slot>' + sponsorCard(pick, 'side') + '</div>');
      var hero = $('#hero'); if (hero) hero.insertAdjacentHTML('afterend', '<section class="section sp-inline" aria-label="Sponsored"><div class="container"><div class="sp-slot sp-slot-inline" data-sp-slot>' + sponsorCard(pick, 'inline') + '</div></div></section>');
    }
    return true;
  }

  /* ---------------- deal page ---------------- */
  function postedText(t) { var d = new Date(t); return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + ' ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }); }
  function isoLocal(t) { var d = new Date(t), z = -d.getTimezoneOffset(), s = z >= 0 ? '+' : '-'; z = Math.abs(z); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2) + 'T' + ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2) + ':00' + s + ('0' + Math.floor(z / 60)).slice(-2) + ':' + ('0' + z % 60).slice(-2); }
  function blocksOf(d) {  // build.py: the deal page blocks, each empty when its field is blank
    var link = d.buy, steps = DB.steps(), exc = d.exc || [];
    var hl = d.highlights && d.highlights.length ? '<section class="block highlights" aria-labelledby="h-hl"><h2 id="h-hl">Highlights</h2><ul>' + d.highlights.map(function (h) { return '<li>' + E(h) + '</li>'; }).join('') + '</ul></section>' : '';
    var ln = d.links && d.links.length ? '<section class="block links" aria-labelledby="h-links"><h2 id="h-links">Links</h2><ul class="link-rows">' + d.links.map(function (l) { return '<li><a href="' + E(H.tagLink(l.url)) + '" target="_blank" rel="nofollow sponsored noopener"><span class="lbl">' + E(l.label) + '</span><span class="dom">' + E(H.domain(l.url)) + '</span><i data-lucide="chevron-right"></i></a></li>'; }).join('') + '</ul></section>' : '';
    var desc = (d.desc || '').trim(), hasDesc = desc && (desc.replace(/<[^>]+>/g, '').trim() || /<img/.test(desc));
    var de = hasDesc ? '<section class="block prose" aria-labelledby="h-desc"><h2 id="h-desc">Description</h2><div>' + desc + '</div></section>' : '';
    var sp = d.specs && d.specs.length ? '<section class="block specs" aria-labelledby="h-specs"><h2 id="h-specs">Specs</h2><dl>' + d.specs.map(function (s) { return s.label ? '<div><dt>' + E(s.label) + '</dt><dd>' + E(s.value) + '</dd></div>' : '<div class="one"><dd>' + E(s.value) + '</dd></div>'; }).join('') + '</dl></section>' : '';
    var items = exc.map(function (t) { return '<li class="exc">' + E(t) + '</li>'; }).join('') + steps.map(function (t, k) { return k === 0 ? '<li><a href="' + E(link) + '" target="_blank" rel="nofollow sponsored noopener">' + E(t) + '</a> on ' + E(d.store) + '</li>' : '<li>' + E(t) + '</li>'; }).join('');
    var st = '';  // 2026-11-25: no "How to get it" block on the deal page
    return hl + ln + de + sp + st;
  }
  function rxHTML(c) {
    var me = document.body.classList.contains('is-admin') ? 'OfferTag' : 'You', pills = '', mine = '';
    DB.rx.forEach(function (r) {
      var who = c.rx[r.e] || []; if (!who.length) return; var my = who.indexOf(me) > -1; if (my) mine = r.e;
      pills += '<button class="rx-pill" type="button" data-e="' + r.e + '" data-who="' + E(who.join('|')) + '" aria-pressed="' + my + '" aria-label="' + r.label + ', ' + who.length + ' reaction' + (who.length === 1 ? '' : 's') + (my ? ', you reacted' : '') + '"><span class="rx-e" aria-hidden="true">' + r.e + '</span><b>' + who.length + '</b></button>';
    });
    return '<span class="rx-pills" role="group" aria-label="Reactions">' + pills + '</span><button class="btn btn-ghost rx-add' + (mine ? ' has-mine' : '') + '" type="button" aria-haspopup="menu" aria-expanded="false" aria-label="' + (mine ? 'Your reaction. Change reaction' : 'React') + '"><i data-lucide="smile-plus"></i><span class="rx-add-e" aria-hidden="true">' + mine + '</span></button>';
  }
  function fmtText(s) { return E(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>'); }   // bold, italic (D-162)
  function commentLi(c, reply, hidden) {
    var acts = '<div class="c-acts">' + rxHTML(c) + (reply ? '' : '<button class="btn btn-ghost reply-btn" type="button"><i data-lucide="reply"></i>Reply</button>') + '<button class="btn btn-ghost c-del" type="button"><i data-lucide="trash-2"></i>Delete</button></div>';
    return '<li class="comment" data-cid="' + E(c.id) + '"' + (hidden ? ' hidden' : '') + '><div class="avatar' + (c.admin ? ' is-admin' : '') + '" aria-hidden="true">' + E(c.name.charAt(0).toUpperCase()) + '</div><div class="who"><b>' + E(c.name) + '</b>' + (c.admin ? '<span class="badge badge-secondary">OfferTag</span>' : '') + '<time>' + E(c.when) + '</time></div><p class="text">' + fmtText(c.text) + '</p>' + acts;
  }
  function commentsHTML(dealId) {
    var all = DB.comments(dealId), top = all.filter(function (c) { return !c.parent; }).sort(function (a, b) { return b.at - a.at; });
    return { n: top.length, html: top.map(function (c, n) {
      var reps = all.filter(function (r) { return r.parent === c.id; }).sort(function (a, b) { return a.at - b.at; });
      var li = commentLi(c, false, n >= 10) + '<ol class="replies">' + reps.map(function (r, k) { return commentLi(r, true, k >= 2) + '</li>'; }).join('') + '</ol>';
      if (reps.length > 2) li += '<button class="btn btn-link more-replies" type="button">View ' + (reps.length - 2) + ' more ' + (reps.length - 2 === 1 ? 'reply' : 'replies') + '</button>';
      return li + '</li>';
    }).join('') };
  }
  function related(d) {
    var pool = DB.deals().filter(function (x) { return x.id !== d.id; }).sort(function (a, b) { return (a.order == null ? -1 : a.order) - (b.order == null ? -1 : b.order) || b.postedAt - a.postedAt; }), cat = pool.filter(function (x) { return x.cat === d.cat; }), st = pool.filter(function (x) { return x.store === d.store && cat.indexOf(x) < 0; });
    return cat.concat(st).slice(0, 8);
  }
  function renderDetail() {
    var main = $('main.detail-page'); if (!main) return false;
    var d = DB.dealByPath(path());
    if (!d) { notFound(main); return true; }
    var sale = d.sale, pct = d.pct, store = d.store, link = d.buy;
    var shareText = H.shareText(d);   // the one fixed format (changes.md A-15, A-19)
    var types = d.typesAll.filter(function (t) { return t !== 'Fresh' && t !== 'Top'; }).map(function (t) { return TYPELABEL[t]; });  // P-13: every deal is on Top deals, so no Top tag
    var posted = d.posted || postedText(d.postedAt), postedIso = d.posted ? d.postedIso || '' : isoLocal(d.postedAt);
    var waIcon = ($('.sh-wa svg') || { outerHTML: '' }).outerHTML, tgIcon = ($('.sh-tg svg') || { outerHTML: '' }).outerHTML;
    var coupon = '<div class="coupon"' + (d.coupon ? '' : ' hidden') + '><span class="lbl">Code</span><span class="code">' + E(d.coupon || 'SAVE20') + '</span><button class="btn btn-outline btn-sm" type="button" data-copy="' + E(d.coupon || 'SAVE20') + '"><i data-lucide="copy"></i><span>Copy</span></button></div>' + (d.terms ? '<p class="coupon-terms">' + E(d.terms) + '</p>' : '');
    var cm = commentsHTML(d.id);
    document.title = d.t + ' at ' + (sale ? 'Up to ' + pct + '% off' : inr(d.p)) + ' (' + pct + '% off) — OfferTag';
    var md = $('meta[name="description"]'); if (md) md.content = d.t + ' for ' + (sale ? 'Up to ' + pct + '% off' : inr(d.p)) + ' at ' + store + ', MRP ' + inr(d.m) + '. Posted ' + d.agetxt + ' ago on OfferTag.';
    var cr = $('.crumbs', main); if (cr) cr.innerHTML = '<a href="/">Home</a><i data-lucide="chevron-right"></i><a href="' + E(DB.catPage(d.cat)) + '">' + E(d.cat || 'Others') + '</a><i data-lucide="chevron-right"></i><span class="crumb-title">' + E(d.t.length <= 48 ? d.t : d.t.slice(0, 47).replace(/\s+$/, '') + '…') + '</span>';
    var well = $('.deal-image', main);
    if (well) well.innerHTML = '<img src="' + E(d.lg) + '" alt="' + E(d.t) + '" width="300" height="300" itemprop="image">' + (sale || !pct ? '' : '<span class="off-tag" aria-label="' + pct + '% off"><i data-lucide="arrow-down" aria-hidden="true"></i>' + pct + '%</span>') + '<span class="zoom-hint"><i data-lucide="zoom-in"></i></span>';
    var core = $('.panel-core', main);
    if (core) core.innerHTML = '<div class="kicker">' + (d.pin ? '<span class="pin-chip"><i data-lucide="pin" aria-hidden="true"></i>Pinned</span>' : '') + types.map(function (t) { return '<span class="badge badge-outline">' + t + '</span>'; }).join('') + '<span class="kstore" itemprop="brand"><i data-lucide="store"></i>' + E(store) + '</span><span class="dot">·</span><time datetime="' + postedIso + '" title="Posted ' + E(posted) + '">' + (d.agemin < 1 ? 'Just now' : E(d.agetxt) + ' ago') + '</time></div>' +
      '<h1 class="deal-title" itemprop="name">' + E(d.t) + '</h1>' +
      (d.caption ? '<div class="caption"><i data-lucide="trending-down"></i>' + E(d.caption) + '</div>' : '') +
      '<div class="pricebox" itemprop="offers" itemscope itemtype="https://schema.org/Offer"><meta itemprop="priceCurrency" content="INR"><meta itemprop="price" content="' + d.p + '">' +
      (sale ? '<div class="price-now sale">Up to ' + pct + '% off</div><div class="price-was">Sale post, prices vary by item</div>' : '<div class="price-now">' + inr(d.p) + '</div>' + (d.save ? '<div class="price-was"><span class="mrp">MRP <s>' + inr(d.m) + '</s></span><span class="save">Save ' + inr(d.save) + ' (' + pct + '%)</span></div>' : '')) + '</div>' +
      coupon + (d.offers && d.offers.length ? '<ul class="offers">' + d.offers.map(function (o) { return '<li><i data-lucide="badge-percent"></i>' + E(o) + '</li>'; }).join('') + '</ul>' : '') +
      '<div class="buy-row">' + storeChip(store) + '<a class="btn btn-default btn-lg btn-buy buy" id="buy" href="' + E(link) + '" target="_blank" rel="nofollow sponsored noopener" itemprop="url" aria-label="Buy now at ' + E(store) + '" data-buy-id="' + E(d.id) + '"><span class="buy-label">Buy now</span><i data-lucide="arrow-up-right"></i></a></div>' +
      (d.note ? '<p class="note"><i data-lucide="circle-alert"></i>' + E(d.note) + '</p>' : '') +
      '<div class="deal-stats"><a class="comment-link" href="#comments"><i data-lucide="message-square"></i>Comments<i data-lucide="arrow-down"></i></a>' +
      '<div class="post-share sh-exp" data-share><button class="sh-trig" type="button" aria-expanded="false" aria-controls="sh-items" data-share-trig><i data-lucide="share-2"></i>Share</button><span class="sh-items" id="sh-items">' +
      '<a class="sh-ic sh-wa" href="https://wa.me/?text=' + quote(shareText) + '" target="_blank" rel="noopener" aria-label="Share on WhatsApp" data-tip="WhatsApp">' + waIcon + '</a>' +
      '<a class="sh-ic sh-tg" href="https://t.me/share/url?url=' + quote(H.buyShort(d.id)) + '&amp;text=' + quote(shareText) + '" target="_blank" rel="noopener" aria-label="Share on Telegram" data-tip="Telegram">' + tgIcon + '</a>' +
      '<button class="sh-ic sh-copy" type="button" id="copy-link" aria-label="Copy link" data-tip="Copy link" data-share="' + E(shareText) + '"><i data-lucide="link"></i></button></span></div></div>';
    var body = $('.deal-body', main);
    if (body) { $$(':scope > .block', body).forEach(function (b) { b.remove(); }); $('#comments', body).insertAdjacentHTML('beforebegin', blocksOf(d)); }
    var list = $('#comment-list'); if (list) list.innerHTML = cm.html;
    var cc = $('#comment-count'); if (cc) cc.textContent = '(' + cm.n + ')';
    var ce = $('#comments-empty'); if (ce) ce.hidden = cm.n > 0;
    var more = $('#comments-more'); if (more) more.hidden = cm.n <= 10;
    var rel = related(d), rs = $('.related-side', main);
    if (rs) {
      $('ul', rs).innerHTML = rel.map(function (x) { return '<li><a href="' + E(x.page) + '"><span class="rs-img"><img src="' + E(x.img) + '" alt="" loading="lazy" width="300" height="300"></span><span class="rs-body"><span class="rs-title">' + E(x.t) + '</span>' + (x.sale ? '<span class="rs-price">Up to ' + x.pct + '% off</span>' : '<span class="rs-price">' + inr(x.p) + '<s>' + inr(x.m) + '</s><em>' + x.pct + '% off</em></span>') + '</span></a></li>'; }).join('');
      var all = $('.rs-all', rs); if (all) { all.href = DB.catPage(d.cat); all.firstChild.textContent = 'See all in ' + (d.cat || 'Others'); }
    }
    var rsec = $('#related');
    if (rsec) {
      var oldc = $('.carousel', rsec), t = document.createElement('div'); t.innerHTML = carousel(rel.map(function (x) { return card(x); }).join('')); if (oldc) oldc.replaceWith(t.firstChild);
      var p = $('.section-head p', rsec); if (p) p.textContent = 'Same category, then more from ' + store;
      var rl = $('.related-links', rsec);
      if (rl) rl.innerHTML = '<a href="' + E(DB.catPage(d.cat)) + '">See all in ' + E(d.cat || 'Others') + ' <i data-lucide="chevron-right"></i></a><a href="' + E(DB.shopPage(store)) + '">More from ' + E(store) + ' <i data-lucide="chevron-right"></i></a><span class="quiet">Search this on <a href="https://www.amazon.in/s?k=' + quote(d.t) + '&amp;tag=offertag-21" target="_blank" rel="nofollow sponsored noopener">Amazon</a> · <a href="https://www.flipkart.com/search?q=' + quote(d.t) + '" target="_blank" rel="nofollow sponsored noopener">Flipkart</a></span>';
    }
    var bb = $('#buybar .container');
    if (bb) bb.innerHTML = '<div class="coupon"' + (d.coupon ? '' : ' hidden') + '><span class="code">' + E(d.coupon || 'SAVE20') + '</span><button class="btn btn-ghost btn-sm btn-icon" type="button" data-copy="' + E(d.coupon || 'SAVE20') + '" aria-label="Copy code"><i data-lucide="copy"></i></button></div>' +
      (sale ? '<div class="bb-price"><b>Up to ' + pct + '% off</b></div>' : '<div class="bb-price"><b>' + inr(d.p) + '</b>' + (d.save ? '<s>' + inr(d.m) + '</s>' : '') + '</div>') +
      '<a class="btn btn-default buy" href="' + E(link) + '" target="_blank" rel="nofollow sponsored noopener" data-buy-id="' + E(d.id) + '"><span class="buy-label">Buy at ' + E(store) + '</span></a>';
    var lbi = $('#lightbox img'); if (lbi) { lbi.src = d.lg; lbi.alt = d.t; }
    document.body.dataset.dealId = d.id;
    // count this view (D-148) once the page is shown; the number on the page is the one before this visit, as on the live site
    DB.bumpView(d.id);
    return true;
  }
  function notFound(main) {
    document.title = 'Deal not found — OfferTag';
    main.innerHTML = '<div class="container narrow"><div class="nf"><h1>We couldn\'t find that deal.</h1><p>It may have been removed. These are on now.</p><a class="btn btn-default" href="/top-deals">Go to Top deals</a></div>' +
      '<section class="section deals"><div class="section-head"><div><h2>Top deals</h2></div></div>' + carousel(LISTS['/top-deals'](DB.deals()).slice(0, 12).map(function (d) { return card(d); }).join('')) + '</section></div>';
    var bb = $('#buybar'); if (bb) bb.remove();
  }

  /* ---------------- blog ---------------- */
  function postDeals(p) {
    var ids = []; if (p.html != null) p.html.replace(/data-deal="([^"]+)"/g, function (m, id) { ids.push(id); }); else (p.body || []).forEach(function (b) { if (b.deal) ids.push(String(b.deal)); });
    return ids.map(function (id) { return DB.deal(id); }).filter(Boolean);
  }
  function postWords(p) { var t = p.html != null ? p.html.replace(/<[^>]+>/g, ' ') : (p.body || []).map(function (b) { return b.p || b.h || ''; }).join(' '); return t.split(/\s+/).filter(Boolean).length; }
  function postMeta(p) { var dt = p.date ? new Date(p.date + 'T00:00') : null; return '<time datetime="' + E(p.date || '') + '">' + (dt ? dt.getDate() + ' ' + dt.toLocaleString('en-GB', { month: 'short' }) : '') + '</time> · ' + Math.max(1, Math.round(postWords(p) / 200)) + ' min read'; }
  function postCover(p) { var ds = postDeals(p); return p.cover ? DB.imgSrc(p.cover) : ds[0] ? ds[0].lg : ''; }
  function postCard(p) {
    var f = postCover(p);
    return '<article class="post-card">' + (f ? '<div class="post-cover"><img src="' + E(f) + '" alt="" loading="lazy" width="300" height="300"></div>' : '') + '<div class="post-txt"><h2><a href="/blog/' + E(p.name) + '">' + E(p.title) + '</a></h2><p>' + E(p.summary || '') + '</p><div class="post-meta">' + postMeta(p) + '</div><span class="btn btn-outline btn-view" aria-hidden="true">View blog<i data-lucide="arrow-right"></i></span></div></article>';
  }
  function published() { return DB.blog().filter(function (p) { return p.status === 'published'; }).sort(function (a, b) { return (b.date || '').localeCompare(a.date || ''); }); }
  function renderBlogIndex() {
    var box = $('#blog-list .post-cards'); if (!box) return false;
    var ps = published(); box.innerHTML = ps.map(postCard).join('');
    var e = $('#blog-empty'), l = $('#blog-list'); if (!ps.length && e && l && !/[?&]empty=1/.test(location.search)) { l.hidden = true; e.hidden = false; }
    return true;
  }
  function embed(d) {
    var buy = d.buy;
    return '<article class="deal-embed is-rail"><a class="img" href="' + E(d.page) + '" aria-label="' + E(d.t) + '"><img src="' + E(d.lg) + '" alt="" loading="lazy" width="300" height="300"></a><div class="body"><div class="meta">' + E(d.store) + ' · ' + d.pct + '% off</div><a class="title" href="' + E(d.page) + '">' + E(d.t) + '</a><div class="priceline"><span class="price">' + inr(d.p) + '</span><span class="was">' + inr(d.m) + '</span></div><div class="emb-acts"><a class="btn btn-outline btn-buy" href="' + E(buy) + '" target="_blank" rel="nofollow sponsored noopener" aria-label="Buy now at ' + E(d.store) + '" data-buy-id="' + E(d.id) + '">Buy now<i data-lucide="arrow-up-right"></i></a>' + storeChip(d.store, 'emb-store') + '</div></div></article>';
  }
  function postBody(p) {
    if (p.html != null) {  // written in the admin editor: deal cards show in the rail (D-130), images and text stay
      var t = document.createElement('div'); t.innerHTML = p.html;
      $$('[data-deal]', t).forEach(function (n) { n.remove(); });
      $$('figure[data-img]', t).forEach(function (f) {   // D-162: caption and size (full, or left/right with text beside)
        var fig = document.createElement('figure'), cap = f.getAttribute('data-cap') || '', size = f.getAttribute('data-size') || 'full';
        fig.className = 'post-fig post-fig--' + (/^(full|left|right)$/.test(size) ? size : 'full');
        fig.innerHTML = '<img class="post-img" src="' + E(f.getAttribute('data-img')) + '" alt="' + E(f.getAttribute('data-alt') || '') + '" loading="lazy">' + (cap ? '<figcaption>' + E(cap) + '</figcaption>' : '');
        f.replaceWith(fig);
      });
      $$('figure[data-yt]', t).forEach(function (f) { var id = (f.getAttribute('data-yt') || '').replace(/[^\w-]/g, ''); var x = document.createElement('div'); x.className = 'post-video'; x.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="Video" loading="lazy" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>'; f.replaceWith(x); });
      $$('div[data-cta-href]', t).forEach(function (f) { var h = f.getAttribute('data-cta-href') || '#', st = /(amazon\.|amzn\.|flipkart\.|fkrt\.|myntra\.|ajio\.)/i.test(h); var x = document.createElement('p'); x.className = 'post-cta'; x.innerHTML = '<a class="btn btn-default" href="' + E(h) + '"' + (/^https?:/i.test(h) ? ' target="_blank" rel="' + (st ? 'sponsored nofollow noopener' : 'noopener') + '"' : '') + '>' + E(f.getAttribute('data-cta-label') || 'Open') + '</a>'; f.replaceWith(x); });
      var first = $('p', t), lead = first ? first.innerHTML : ''; if (first) first.remove();
      return { lead: lead, body: t.innerHTML };
    }
    var body = p.body || [], leadI = -1; body.some(function (b, i) { if (b.p != null) { leadI = i; return true; } return false; });
    var secOf = [], sec = -1; body.forEach(function (b) { if (b.h) sec++; secOf.push(sec); });
    var dealSecs = {}; body.forEach(function (b, i) { if (b.deal && secOf[i] >= 0) dealSecs[secOf[i]] = 1; });
    var parts = body.map(function (b, i) {
      if (i === leadI || dealSecs[secOf[i]]) return '';
      if (b.p != null) return '<p>' + E(b.p) + '</p>'; if (b.h) return '<h2>' + E(b.h) + '</h2>'; if (b.img) return '<img class="post-img" src="' + E(DB.imgSrc(b.img)) + '" alt="' + E(b.alt || '') + '" loading="lazy" width="300" height="300">'; return '';
    }).join('');
    return { lead: leadI > -1 ? E(body[leadI].p) : '', body: parts };
  }
  function renderBlogPost() {
    var art = $('article.post'); if (!art) return false;
    var m = path().match(/^\/blog\/([^\/]+)$/); if (!m) return false;
    var name = decodeURIComponent(m[1]), p = DB.blog().filter(function (x) { return x.name === name; })[0];
    var main = $('main');
    if (!p || p.status !== 'published') {
      document.title = 'Post not available — OfferTag';
      main.innerHTML = '<div class="container narrow blog-wrap"><div class="nf"><h1>This post is no longer available.</h1><p>See the latest on the blog.</p><a class="btn btn-default" href="/blog">Go to the blog</a></div></div>';
      return true;
    }
    var b = postBody(p), cover = postCover(p), url = SITE + '/blog/' + p.name, ds = postDeals(p);
    var short = p.title.length <= 48 ? p.title : p.title.slice(0, 47).replace(/\s+$/, '') + '…';
    document.title = p.title + ' — OfferTag';
    var cr = $('.crumbs', main); if (cr) cr.innerHTML = '<a href="/">Home</a><i data-lucide="chevron-right"></i><a href="/blog">Blog</a><i data-lucide="chevron-right"></i><span>' + E(short) + '</span>';
    var head = $('.post-head', art), share = $('.post-share', head), shareHTML = share ? share.outerHTML : '';
    var shareText = p.title + '\n' + url;
    shareHTML = shareHTML.replace(/href="https:\/\/wa\.me[^"]*"/, 'href="https://wa.me/?text=' + quote(shareText) + '"').replace(/href="https:\/\/t\.me[^"]*"/, 'href="https://t.me/share/url?url=' + quote(url) + '&amp;text=' + quote(p.title) + '"').replace(/data-copy-link="[^"]*"/, 'data-copy-link="' + E(url) + '"');
    head.className = 'post-head' + (cover ? '' : ' no-pic');
    head.innerHTML = (cover ? '<div class="post-hero"><img src="' + E(cover) + '" alt="" width="300" height="300"></div>' : '') + '<div class="post-head-txt"><h1>' + E(p.title) + '</h1><div class="post-meta">OfferTag · ' + postMeta(p) + '</div>' + (b.lead ? '<p class="post-lead">' + b.lead + '</p>' : '') + shareHTML + '</div>';
    $('.post-body', art).innerHTML = b.body;
    var rail = $('.post-rail .rail-list'); if (rail) rail.innerHTML = ds.map(embed).join('');
    var railBox = $('.post-rail'); if (railBox) railBox.hidden = !ds.length;
    // 2026-11-25 (changes.md P-04): no "More in {category}" deal row; the article ends with More blogs
    var ms = $('section[aria-labelledby="h-more"]'); if (ms) ms.remove();
    var rp = $('section[aria-labelledby="h-rel"] .post-cards'); if (rp) rp.innerHTML = published().filter(function (x) { return x.name !== p.name; }).map(postCard).join('');
    return true;
  }

  /* ---------------- indexes: Categories and Stores follow Catalogue (names, on/off, new ones) ---------------- */
  function renderIndex() {
    var p = path(); if (p !== '/categories' && p !== '/stores') return false;
    var ul = $('#index-list'); if (!ul) return false;
    var cat = p === '/categories', list = cat ? DB.cats() : DB.shops();
    var top = list.slice().sort(function (a, b) { return (a.name === 'Others') - (b.name === 'Others') || (a.order || 0) - (b.order || 0) || a.name.localeCompare(b.name); }), rest = [];  // P-24: admin order, Others last
    if (cat) {  // P-22: categories are icon tiles; keep each built tile's icon, new categories get a tag
      var ico = {}; $$('.cat-tile a', ul).forEach(function (a) { var i = a.querySelector('[data-lucide]'); if (i) ico[a.getAttribute('href')] = i.getAttribute('data-lucide'); });
      ul.innerHTML = top.concat(rest).map(function (r) { var h = DB.catPage(r.name); return '<li class="cat-tile' + (r.total === 0 ? ' is-zero' : '') + '"><a href="' + E(h) + '"><span class="ct-ico"><i data-lucide="' + E(r.icon || ico[h] || 'tag') + '"></i></span><span class="nm">' + E(r.name) + '</span></a></li>'; }).join('');
      return true;
    }
    ul.innerHTML = top.concat(rest).map(function (r) { return '<li class="' + (r.total === 0 ? 'is-zero' : '') + '"><a href="' + E(cat ? DB.catPage(r.name) : DB.shopPage(r.name)) + '">' + (cat ? '' : '<span class="avatar" aria-hidden="true">' + E(r.name.charAt(0)) + '</span>') + '<span class="nm">' + E(r.name) + '</span><i data-lucide="chevron-right"></i></a></li>'; }).join('');
    return true;
  }

  /* ---------------- every public page: Site & app settings, Buy clicks ---------------- */
  function applySite() {
    var s = DB.get('site') || {}, seed = DB.seedSite || {};
    // 2026-11-25 (changes.md A-16): the join / announcement buttons are always shown; no admin switch
    // D-157: the Blog ribbon always shows (no admin switch)
    ['wa', 'tg', 'fb', 'ig', 'li', 'play'].forEach(function (k) {
      var from = seed[k], to = s[k]; if (!from || from === to) return;
      $$('a[href="' + CSS.escape(from) + '"]').forEach(function (a) { if (to) a.href = to; else a.remove(); });
    });
    if (seed.mail && s.mail && seed.mail !== s.mail) $$('a[href="mailto:' + seed.mail + '"]').forEach(function (a) { a.href = 'mailto:' + s.mail; if (a.textContent.trim() === seed.mail) a.textContent = s.mail; });
  }
  document.addEventListener('click', function (e) { var a = e.target.closest('[data-buy-id]'); if (a) DB.bumpClick(a.dataset.buyId); }, true);

  DB.ready(function () {
    if (document.documentElement.classList.contains('admin')) return;
    DB.rx = DB.rxList();
    DB.seedSite = DB.seedColl().site || {};
    var page = document.body.dataset.page;
    try {
      if (page === 'home' || $('.td-container')) renderHome();
      if ($('#results')) renderListing();
      if (page === 'detail') renderDetail();
      if ($('#blog-list')) renderBlogIndex();
      if ($('article.post')) renderBlogPost();
      renderIndex();
      applySite();
    } catch (e) { console.error('[playground] render', e); }
  });
  window.OTR = { card: card, carousel: carousel };
})();
