/* admin-db.js — the admin reads and writes the playground data (S25, plan.md Part B).
   Runs after db.js has the data and before admin.js / admin-c.js / admin-d.js / admin-e.js start: it replaces the sample
   lists those scripts start from (window.ADM_*) with the playground's, draws the screens that were built as fixed HTML
   (Overview, Incoming), and gives the scripts window.ADM_PG to save what the person changes. */
(function () {
  'use strict';
  var DB = window.OTDB; if (!DB) return;
  DB.ready(function () {
    var root = document.documentElement; if (!root.classList.contains('admin')) return;
    var H = DB.H, E = H.esc, inr = H.inr, MIN = 60000;
    function $(s, r) { return (r || document).querySelector(s); }
    function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
    function clone(x) { return JSON.parse(JSON.stringify(x)); }

    /* ---------- images: the screens show pictures, the data keeps a small reference ---------- */
    var refOf = {};
    function show(v) { if (v && /^pgimg:/.test(v)) { var s = DB.imgSrc(v); refOf[s] = v; return s; } return v || ''; }
    function pack(v) { if (!v) return ''; if (refOf[v]) return refOf[v]; if (/^data:/.test(v)) { var r = DB.putImage(v); if (r) refOf[v] = r; return r || ''; } return v; }

    /* ---------- deals as the admin lists them ---------- */
    function row(d) {
      return { id: String(d.id), t: d.t, store: d.store, cat: d.cat || '', p: d.p, m: d.m, pct: d.pct, types: (d.types || []).filter(function (t) { return t !== 'Fresh'; }), pin: d.pin || null, featured: !!d.featured, pos: d.pos, postedAt: d.postedAt, status: 'live',   /* no statuses (changes.md A-03); kept so older pickers that ask for live deals still work */
        age: d.agemin, when: d.agemin < 1 ? 'now' : d.agetxt, views: d.views || 0, uniq: d.uniq || 0, clicks: d.clicks || 0, img: d.img, page: d.page, link: d.link === '#buy' ? '#buy' : d.link,
        display: d.display || 1, caption: d.caption || '', coupon: d.coupon || '', terms: d.terms || '', offers: d.offers || [], note: d.note || '', exc: d.exc || [], logo: DB.logo(d.store),
        highlights: d.highlights || [], specs: d.specs || [], desc: d.desc || '' };
    }
    function rows() { return DB.deals({ all: true }).filter(function (d) { return !d.detailOnly; }).map(row); }

    var trash = {};  // deals deleted on this page, so Undo can bring them back
    var PG = {
      show: show, pack: pack, row: row, rows: rows,
      // All deals: the table's model after any change → the data
      syncRows: function (model) {
        var ids = {}; model.forEach(function (r) { ids[r.id] = 1; });
        DB.deals({ all: true }).forEach(function (d) { if (!d.detailOnly && !ids[d.id] && PG.known[d.id]) { trash[d.id] = DB.raw(d.id); DB.deleteDeal(d.id); } });
        model.forEach(function (r) {
          var d = DB.deal(r.id);
          if (!d) { if (trash[r.id]) { PG.undelete(r.id); d = DB.deal(r.id); } if (!d) return; }
          var patch = {};
          ['cat', 'store', 'display'].forEach(function (k) { if (r[k] !== d[k]) patch[k] = r[k]; });
          if ((r.pin || null) !== (d.pin || null)) { patch.pin = r.pin || null; if (r.pin) patch.pinnedAt = Date.now(); }
          if (!!r.featured !== !!d.featured) patch.featured = !!r.featured;
          if (r.pos && r.pos !== d.pos) patch.sortAt = r.pos;   // dragged up or down, or moved to the top (changes.md A-02)
          if (Object.keys(patch).length) DB.saveDeal(Object.assign({ id: r.id }, patch));
        });
      },
      known: {},
      undelete: function (id) { var d = trash[id]; if (!d) return; DB.restoreDeal(id); if (!DB.deal(id)) DB.saveDeal(d); delete trash[id]; },
      // Post / edit a deal
      saveDeal: function (rec) { return DB.saveDeal(rec); },
      deleteDeal: function (id) { DB.deleteDeal(id); },
      // Pinned board: the slot order → pin numbers on the deals, N → Top deals
      savePins: function (order, every) {
        var want = {}; order.forEach(function (x, i) { want[x.id] = i + 1; });
        DB.deals({ all: true }).forEach(function (d) { var p = want[d.id] || null; if ((d.pin || null) !== p) DB.saveDeal({ id: d.id, pin: p, pinnedAt: p && !d.pin ? Date.now() : d.pinnedAt }); });
        DB.set('pinEvery', every);
      },
      saveList: function (name, list, imgKeys) {
        var out = clone(list); (imgKeys || []).forEach(function (k) { out.forEach(function (x) { if (x[k]) x[k] = pack(x[k]); }); });
        DB.set(name, out);
      },
      saveInbox: function (D) { ['feedback', 'deletion'].forEach(function (k) { DB.set(k, D[k].map(function (x) { var y = Object.assign({}, x); delete y.when; return y; })); }); },
      saveCatalogue: function (C) {
        var old = {}; DB.get('categories').forEach(function (c) { old[c.id] = c.name; });
        var oldS = {}; DB.get('shops').forEach(function (s) { oldS[s.id] = s.name; });
        DB.set('categories', C.categories.map(function (c) { var b = DB.get('categories').filter(function (x) { return x.id === c.id; })[0] || {}; return Object.assign({}, b, { id: c.id, name: c.name, slug: c.slug, order: c.order, on: c.on !== false, total: c.n || 0, title: c.title || b.title || '', description: c.seo != null ? c.seo : b.description, page: b.page || '/products/' + c.slug + '-deals', icon: b.icon || 'tag', img: b.img || '' }); }));
        DB.set('shops', C.shops.map(function (s) { var b = DB.get('shops').filter(function (x) { return x.id === s.id; })[0] || {}; return Object.assign({}, b, { id: s.id, name: s.name, label: s.label, slug: b.slug || H.slug(s.name).replace(/-/g, ''), order: s.order, on: s.on !== false, total: s.n || 0, aff: s.aff, steps: s.steps, description: s.seo != null ? s.seo : b.description, logo: pack(s.logo) || b.logo || '', page: b.page || '/shops/' + (b.slug || H.slug(s.name).replace(/-/g, '')), tint: b.tint, btn: b.btn }); }));
        DB.set('dealtypes', C.dealtypes);
        // a renamed category or shop: its deals move with it
        C.categories.forEach(function (c) { if (old[c.id] && old[c.id] !== c.name) DB.deals({ all: true }).forEach(function (d) { if (d.cat === old[c.id]) DB.saveDeal({ id: d.id, cat: c.name }); }); });
        C.shops.forEach(function (s) { if (oldS[s.id] && oldS[s.id] !== s.name) DB.deals({ all: true }).forEach(function (d) { if (d.store === oldS[s.id]) DB.saveDeal({ id: d.id, store: s.name }); }); });
      },
      saveSite: function (form) {
        var s = DB.get('site') || {};
        $$('input, select, textarea', form).forEach(function (i) { if (!i.name) return; s[i.name] = i.type === 'checkbox' ? i.checked : i.type === 'number' ? +i.value : i.value.trim(); });
        DB.set('site', s);
      },
      today: DB.today
    };
    /* ---------- activity log (changes.md A-13): who did what, shown on each user's page ---------- */
    var ME = /[?&]role=sub\b/.test(location.search) ? 2 : 1;
    function audit() { return DB.get('audit') || []; }
    PG.log = function (kind, text, link, uid, linkText) {
      var L = audit(), last = L[0];
      if (last && last.text === text && Date.now() - last.at < 1500) return;
      L.unshift({ at: Date.now(), uid: uid || ME, kind: kind, text: text, link: link || null, linkText: linkText || null });
      DB.set('audit', L.slice(0, 500));
    };
    function seedLog(uid) {   // SAMPLE history so every page has something to read before anyone changes anything
      var out = [], now = Date.now(), H6 = 36e5, day = 864e5, all = DB.deals();
      var u = (DB.get('users') || []).filter(function (x) { return x.id === uid; })[0];
      if (!u || u.active === false) { out.push({ at: now - 92 * day, uid: uid, kind: 'signin', text: 'Signed in on the web' }); return out; }
      for (var k = 0; k < 6; k++) out.push({ at: now - k * day - (uid * 37 + k * 11) % 180 * 60000 - 2 * H6, uid: uid, kind: 'signin', text: k % 3 === 2 ? 'Signed in on the app' : 'Signed in on the web' });
      all.forEach(function (d, i) { if (i % 3 === uid - 1 && i < 60) out.push({ at: d.postedAt, uid: uid, kind: 'deal', text: 'Posted “' + d.t.slice(0, 70) + (d.t.length > 70 ? '…' : '') + '”', link: '/admin/deal/' + d.id, linkText: 'Open deal' }); });
      all.slice(0, 30).forEach(function (d, i) { if (i % 7 === uid) out.push({ at: Math.min(now - 60000, d.postedAt + 40 * 60000), uid: uid, kind: 'deal', text: (i % 2 ? 'Pinned “' : 'Edited “') + d.t.slice(0, 60) + '”', link: '/admin/deal/' + d.id, linkText: 'Open deal' }); });
      if (uid === 1) { out.push({ at: now - day - 3 * H6, uid: 1, kind: 'settings', text: 'Changed the Amazon tag for WhatsApp links' }); out.push({ at: now - 4 * day, uid: 1, kind: 'settings', text: 'Changed the Loot rule to 75% off or more' }); }
      return out;
    }
    PG.logFor = function (uid) { return audit().filter(function (x) { return x.uid === uid; }).concat(seedLog(uid)).sort(function (a, b) { return b.at - a.at; }); };
    // every deal change made in the admin is logged against whoever is signed in
    var _save = DB.saveDeal, _del = DB.deleteDeal, QUIET = { views: 1, uniq: 1, clicks: 1, id: 1, pinnedAt: 1 };
    DB.saveDeal = function (rec) {
      var before = rec.id ? DB.raw(rec.id) : null, out = _save.apply(DB, arguments);
      try {
        var keys = Object.keys(rec).filter(function (k) { return !QUIET[k]; }); if (!keys.length || !out) return out;
        var t = '“' + out.t.slice(0, 60) + (out.t.length > 60 ? '…' : '') + '”', text;
        if (!before) text = 'Posted ' + t;
        else if (keys.length === 1 && keys[0] === 'pin') text = (rec.pin ? 'Pinned ' : 'Unpinned ') + t;
        else if (keys.length === 1 && keys[0] === 'featured') text = (rec.featured ? 'Featured ' : 'Unfeatured ') + t;
        else if (keys.length === 1 && keys[0] === 'sortAt') text = 'Moved ' + t + ' on the site';
        else text = 'Edited ' + t;
        PG.log('deal', text, '/admin/deal/' + out.id, null, 'Open deal');
      } catch (e) {}
      return out;
    };
    DB.deleteDeal = function (id) { var d = DB.raw(id); _del.apply(DB, arguments); if (d) PG.log('deal', 'Deleted “' + d.t.slice(0, 60) + '”'); };

    window.ADM_PG = PG;

    /* ---------- the sample lists the admin scripts start from ---------- */
    var R = rows(); R.forEach(function (r) { PG.known[r.id] = 1; });
    window.ADM_DEALS = R.map(function (r) { return Object.assign({}, r); });
    window.ADM_TODAY = DB.today();
    var seedPins = {}; ((window.ADM_PINS || {}).pins || []).forEach(function (x) { seedPins[x.id] = x.age; });
    window.ADM_PINS = { every: DB.pinEvery(), pins: DB.pins().map(function (d) { return { id: String(d.id), age: d.pinnedAt ? (H.ago((Date.now() - d.pinnedAt) / MIN) === 'now' ? '0 min' : H.ago((Date.now() - d.pinnedAt) / MIN)) : seedPins[d.id] || '1 d' }; }) };
    window.ADM_POSTER_DEALS = DB.deals().map(function (d) { return { id: String(d.id), t: d.t, img: d.td, store: d.store, price: inr(d.p), pct: String(d.pct) }; });
    window.ADM_SPONSORED = DB.get('sponsored').map(function (p) { return Object.assign({}, p, { img: show(p.img), mimg: show(p.mimg) }); });
    if (window.ADM_USERS) window.ADM_USERS = DB.get('users');
    var ib = {}; ['feedback', 'deletion'].forEach(function (k) { ib[k] = DB.get(k).map(function (x) { return Object.assign({}, x, { when: DB.whenOf(x) }); }); });
    if (window.ADM_INBOX) window.ADM_INBOX = ib;
    if (window.ADM_CAT) {
      var seedC = window.ADM_CAT, byId = function (l, id) { return l.filter(function (x) { return x.id === id; })[0] || {}; };
      window.ADM_CAT = {
        shops: DB.shops(true).map(function (s) { var b = byId(seedC.shops, s.id); return Object.assign({}, b, { id: s.id, name: s.name, label: s.label || s.name.slice(0, 13), slug: s.slug, aff: s.aff != null ? s.aff : b.aff, order: s.order, n: s.total || 0, on: s.on !== false, logo: show(s.logo) || b.logo || '', steps: s.steps || b.steps || DB.steps(), seo: s.description != null ? s.description : b.seo }); }),
        categories: DB.cats(true).map(function (c) { var b = byId(seedC.categories, c.id); return Object.assign({}, b, { id: c.id, name: c.name, slug: c.slug, order: c.order, n: c.total || 0, on: c.on !== false, img: c.img || b.img || '', title: c.title, seo: c.description }); }),
        dealtypes: DB.get('dealtypes') || seedC.dealtypes, types: seedC.types
      };
    }
    if (window.ADM_SEC) window.ADM_SEC = DB.get('security') || window.ADM_SEC;
    if (window.ADM_SOCIAL) { var so = DB.get('social'); if (so) { window.ADM_SOCIAL.channels = so.channels; window.ADM_SOCIAL.hist = so.hist; } }
    if (window.ADM_BLOG) window.ADM_BLOG = DB.seedBlog();
    if (window.ADM_CFG) { DB.shops(true).forEach(function (s) { window.ADM_CFG.logos[s.name] = DB.logo(s.name); }); }

    /* ---------- store and category choices follow Catalogue (new ones appear in every picker) ---------- */
    var shopNames = DB.shops(true).map(function (s) { return s.name; }), catNames = DB.cats(true).map(function (c) { return c.name; });
    $$('select').forEach(function (s) {
      var vals = $$('option', s).map(function (o) { return o.value || o.textContent; }), add = null;
      if (vals.some(function (v) { return v === 'Amazon'; }) && vals.some(function (v) { return v === 'Flipkart'; })) add = shopNames;
      else if (vals.some(function (v) { return v === 'Kitchen'; }) && vals.some(function (v) { return v === 'Footwear'; })) add = catNames;
      if (add) add.forEach(function (n) { if (vals.indexOf(n) < 0) { var o = document.createElement('option'); o.value = n; o.textContent = n; s.appendChild(o); } });
    });

    /* ---------- Site & app: the saved values fill the form before its save bar takes its starting point ---------- */
    var sf = $('[data-site]');
    if (sf) { var site = DB.get('site') || {}; $$('input, select, textarea', sf).forEach(function (i) { if (!(i.name in site)) return; if (i.type === 'checkbox') i.checked = i.defaultChecked = !!site[i.name]; else i.value = i.defaultValue = site[i.name]; }); }

    /* ---------- sidebar counts ---------- */
    function badge(key, n) {
      $$('[data-count="' + key + '"]').forEach(function (el) { el.textContent = n; if (el.classList.contains('adm-count')) { if (n) el.removeAttribute('data-zero'); else el.setAttribute('data-zero', ''); } });
      $$('.adm-nav a').forEach(function (a) { var t = a.textContent.trim(); if ((key === 'incoming' && /^Incoming/.test(t)) || (key === 'inbox' && /^Inbox/.test(t))) { var b = $('.adm-count', a); if (!b && n) a.insertAdjacentHTML('beforeend', '<span class="adm-count" data-count="' + key + '">' + n + '</span>'); } });
    }
    badge('inbox', DB.inboxOpen());

    /* ---------- Overview (built as fixed numbers; drawn from the data; D-160 layout) ---------- */
    var kpis = $('.kpis');
    if (kpis) {
      var sub = $('.page-h p'); if (sub && /today so far/.test(sub.textContent)) sub.textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) + ' · today so far';
      var live = DB.deals(), today = live.filter(function (d) { return d.agemin <= 1440; }), pins = DB.pins(), every = DB.pinEvery();
      var setK = function (key, v) { var k = $('[data-kpi="' + key + '"] .kpi-n', kpis); if (k) k.textContent = v; };
      setK('today', today.length); setK('inbox', DB.inboxOpen()); setK('pinned', pins.length);
      var pp = $('[data-ov-pins]');
      if (pp) {
        $('.pin-sum', pp).innerHTML = pins.length ? '<b>' + pins.length + '</b> pinned, one every <b>' + every + '</b> cards on Top deals.' : 'Nothing pinned. Pin a deal from All deals or the Pinned board.';
        $('ul', pp).innerHTML = pins.slice(0, 6).map(function (d, i) { return '<li><span class="fn-pos">' + (i + 1) + '</span><img src="' + E(d.img) + '" alt="" loading="lazy"><span class="t-title">' + E(d.t) + '</span><span class="t-meta">card ' + every * (i + 1) + '</span></li>'; }).join('');
      }
      var latest = $('[data-ov-latest] ul');
      if (latest) latest.innerHTML = live.slice(0, 6).map(function (d) { var t = d.typesAll.filter(function (x) { return x !== 'Fresh'; })[0] || 'New'; return '<li><span class="t-time">' + (d.agemin < 1 ? 'now' : E(d.agetxt)) + '</span><img src="' + E(d.img) + '" alt="" loading="lazy"><a class="t-title" href="' + E(d.page) + '" target="_blank" rel="noopener">' + E(d.t) + '</a><span class="t-meta">' + E(d.store) + '</span><span class="tchip t-' + t.toLowerCase() + '">' + (t === 'Top' ? 'Top deal' : t) + '</span></li>'; }).join('');
    }

    /* ---------- the playground note and Reset, on every admin page ---------- */
    var foot = $('.adm-side-foot');
    if (foot) {
      foot.insertAdjacentHTML('afterbegin', '<div class="pg-note" data-pg-note><i data-lucide="flask-conical"></i><span><b>Playground</b><small data-pg-count></small></span><button type="button" class="btn btn-ghost btn-sm" data-pg-reset>Reset</button></div>');
      var cnt = function () { var n = DB.changeCount(); $('[data-pg-count]').textContent = n ? 'Your changes are saved in this browser' : 'Sample data, nothing changed yet'; };
      cnt(); DB.on(cnt);
      $('[data-pg-reset]').addEventListener('click', function () { openReset(); });
    }
    function openReset() {
      var d = document.createElement('div'); d.className = 'pg-modal'; d.setAttribute('role', 'alertdialog'); d.setAttribute('aria-modal', 'true'); d.setAttribute('aria-labelledby', 'pg-h');
      d.innerHTML = '<div class="pg-box"><h2 id="pg-h">Reset the playground?</h2><p>Every deal, poster, ad, pin, blog post, comment, report and setting you changed or added in this browser goes back to the sample data. This can’t be undone.</p><div class="pg-acts"><button type="button" class="btn btn-outline" data-x>Cancel</button><button type="button" class="btn btn-default destructive" data-go>Reset playground</button></div></div>';
      document.body.appendChild(d); $('[data-go]', d).focus();
      d.addEventListener('click', function (e) { if (e.target === d || e.target.closest('[data-x]')) d.remove(); if (e.target.closest('[data-go]')) { DB.reset(); location.href = '/admin'; } });
      d.addEventListener('keydown', function (e) { if (e.key === 'Escape') d.remove(); });
    }
  });
})();
