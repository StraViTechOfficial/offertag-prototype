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
      return { id: String(d.id), t: d.t, store: d.store, cat: d.cat || '', p: d.p, m: d.m, pct: d.pct, types: (d.types || []).filter(function (t) { return t !== 'Fresh'; }), status: d.status, pin: d.pin || null,
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
          ['status', 'cat', 'store', 'display'].forEach(function (k) { if (r[k] !== d[k] && !(k === 'status' && d.status === 'live' && r.status === 'live')) patch[k] = r[k]; });
          if ((r.pin || null) !== (d.pin || null)) { patch.pin = r.pin || null; if (r.pin) patch.pinnedAt = Date.now(); }
          if (JSON.stringify(r.types) !== JSON.stringify((d.types || []).filter(function (t) { return t !== 'Fresh'; }))) patch.types = r.types;
          if (r._bump) { patch.postedAt = Date.now(); patch.status = 'live'; delete r._bump; }   // Bump to top
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
      saveInbox: function (D) { ['feedback', 'reports', 'deletion'].forEach(function (k) { DB.set(k, D[k].map(function (x) { var y = Object.assign({}, x); delete y.when; return y; })); }); },
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
    window.ADM_PG = PG;

    /* ---------- the sample lists the admin scripts start from ---------- */
    var R = rows(); R.forEach(function (r) { PG.known[r.id] = 1; });
    window.ADM_DEALS = R.map(function (r) { return Object.assign({}, r); });
    window.ADM_TODAY = DB.today();
    var seedPins = {}; ((window.ADM_PINS || {}).pins || []).forEach(function (x) { seedPins[x.id] = x.age; });
    window.ADM_PINS = { every: DB.pinEvery(), pins: DB.pins().map(function (d) { return { id: String(d.id), age: d.pinnedAt ? (H.ago((Date.now() - d.pinnedAt) / MIN) === 'now' ? '0 min' : H.ago((Date.now() - d.pinnedAt) / MIN)) : seedPins[d.id] || '1 d' }; }) };
    window.ADM_POSTERS = DB.get('posters').map(function (p) { return Object.assign({}, p, { img: show(p.img) }); });
    window.ADM_POSTER_DEALS = DB.deals().map(function (d) { return { id: String(d.id), t: d.t, img: d.td, store: d.store, price: inr(d.p), pct: String(d.pct) }; });
    window.ADM_SPONSORED = DB.get('sponsored').map(function (p) { return Object.assign({}, p, { img: show(p.img), mimg: show(p.mimg) }); });
    if (window.ADM_USERS) window.ADM_USERS = DB.get('users');
    var ib = {}; ['feedback', 'reports', 'deletion'].forEach(function (k) { ib[k] = DB.get(k).map(function (x) { return Object.assign({}, x, { when: DB.whenOf(x) }); }); });
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
    var pm = $('[data-promo] form');
    if (pm) { var pr = DB.get('promo') || {}; ['tag', 'text', 'cta', 'href', 'start', 'end'].forEach(function (k) { if (pm[k] && pr[k] != null) pm[k].value = pr[k]; }); if (pm.on) pm.on.checked = !!pr.on; }

    /* ---------- sidebar counts ---------- */
    var pending = DB.deals({ all: true }).filter(function (d) { return d.status === 'pending'; });
    function badge(key, n) {
      $$('[data-count="' + key + '"]').forEach(function (el) { el.textContent = n; if (el.classList.contains('adm-count')) { if (n) el.removeAttribute('data-zero'); else el.setAttribute('data-zero', ''); } });
      $$('.adm-nav a').forEach(function (a) { var t = a.textContent.trim(); if ((key === 'incoming' && /^Incoming/.test(t)) || (key === 'inbox' && /^Inbox/.test(t))) { var b = $('.adm-count', a); if (!b && n) a.insertAdjacentHTML('beforeend', '<span class="adm-count" data-count="' + key + '">' + n + '</span>'); } });
    }
    badge('incoming', pending.length); badge('inbox', DB.inboxOpen());

    /* ---------- Incoming (built as fixed rows; drawn from the pending deals) ---------- */
    var pend = $('[data-panel="pending"]');
    if (pend) {
      var site2 = DB.get('site') || {}, FP = +site2.feat_price || 10000, FPCT = +site2.feat_pct || 70;
      var SRC = { telegram: ['Telegram', 'send'], form: ['Quick post', 'mouse-pointer-click'] }, HOLD = { mrp: 'Check MRP', missing: 'Category missing' };
      var types = function (ts) { return ts.filter(function (t) { return t !== 'Fresh'; }).map(function (t) { return '<span class="tchip t-' + t.toLowerCase() + '">' + (t === 'Top' ? 'Top deal' : t) + '</span>'; }).join(''); };
      var inc = function (d, note) {
        var s = SRC[d.source] || SRC.form, sim = d.similar ? DB.deal(d.similar) : null;
        var flag = d.hold && HOLD[d.hold] ? '<span class="hold"><i data-lucide="triangle-alert"></i>' + HOLD[d.hold] + (d.hold === 'similar' && sim ? ' · <a href="' + E(sim.page) + '" target="_blank" rel="noopener">view</a>' : '') + '</span>' : '';
        var why = []; if (d.p >= FP) why.push(inr(FP) + '+'); if (d.pct && d.pct >= FPCT) why.push(FPCT + '%+ off');
        // D-155: no Featured badge on Incoming (planned as its own feature)
        var rec = d.receivedAt ? H.ago((Date.now() - d.receivedAt) / MIN) : d.agetxt;
        return '<article class="inc" data-inc data-id="' + E(d.id) + '" data-missing="' + (d.cat ? '' : '1') + '" data-pct="' + (d.pct || 0) + '" data-title="' + E(d.t) + '"' + (note ? ' data-done' : '') + '>' +
          '<label class="ck"><input type="checkbox" data-inc-check aria-label="Select ' + E(d.t.slice(0, 40)) + '"><span class="box"><i data-lucide="check"></i></span></label>' +
          '<img class="inc-img" src="' + E(d.img) + '" alt="" loading="lazy"><div class="inc-body"><div class="inc-top"><span class="src src-' + (d.source || 'form') + '"><i data-lucide="' + s[1] + '"></i>' + s[0] + '</span><span class="inc-time">received ' + (rec === 'now' ? 'just now' : rec + ' ago') + '</span>' + flag + (note ? '<span class="inc-done-note">' + E(note) + '</span>' : '') + '</div>' +
          '<h3>' + E(d.t) + '</h3><div class="inc-meta">' + E(d.store) + ' · ' + (d.cat ? E(d.cat) : '<span class="miss">Category?</span>') + '</div>' +
          '<div class="inc-price"><b>' + inr(d.p) + '</b> <span>' + (d.m ? 'MRP ' + inr(d.m) : '<span class="miss">MRP —</span>') + '</span> ' + (d.pct ? '<b class="pct">' + d.pct + '% off</b>' : '<span class="miss">—%</span>') + ' <span class="inc-types">' + types(d.types || ['New']) + '</span></div></div>' +
          '<div class="inc-acts"><button class="btn btn-default btn-sm" type="button" data-approve>Approve</button><a class="btn btn-outline btn-sm" href="/admin/deal/' + E(d.id) + '/edit">Edit</a><button class="btn btn-ghost btn-sm" type="button" data-reject>Reject</button></div></article>';
      };
      var all = DB.deals({ all: true }), dayStart = new Date(); dayStart.setHours(0, 0, 0, 0);
      $$('[data-inc]', pend).forEach(function (n) { n.remove(); });
      pend.insertAdjacentHTML('afterbegin', pending.sort(function (a, b) { return b.postedAt - a.postedAt; }).map(function (d) { return inc(d); }).join(''));
      var appr = $('[data-panel="approved"]'), rej = $('[data-panel="rejected"]');
      var ap = all.filter(function (d) { return d.approvedAt && d.approvedAt >= dayStart.getTime() && d.status !== 'pending'; }), rj = all.filter(function (d) { return d.status === 'rejected'; });
      if (appr) appr.insertAdjacentHTML('afterbegin', ap.map(function (d) { return inc(d, 'Live now'); }).join(''));
      if (rj.length && rej) rej.insertAdjacentHTML('afterbegin', rj.map(function (d) { return inc(d, d.rejectReason ? 'Rejected: ' + d.rejectReason : 'Rejected'); }).join(''));
      $$('[data-count="approved"]').forEach(function (e) { e.textContent = ap.length; }); $$('[data-count="rejected"]').forEach(function (e) { e.textContent = rj.length; });
      $$('[data-approve-all] [data-count="incoming"], [data-count="incoming"]').forEach(function (e) { e.textContent = pending.length; });
      PG.incoming = {
        approve: function (ids) { ids.forEach(function (id) { var d = DB.deal(id); if (!d) return; DB.saveDeal({ id: id, status: 'live', postedAt: Date.now(), approvedAt: Date.now(), receivedAt: d.receivedAt || d.postedAt, types: d.pct ? H.typesFor(d.pct, d.cat) : ['New'] }); }); },
        reject: function (ids, reason) { ids.forEach(function (id) { DB.saveDeal({ id: id, status: 'rejected', rejectReason: reason || '' }); }); },
        back: function (ids, snap) { DB.restoreDeals(snap); },
        snap: function () { return DB.dealSnapshot(); }
      };
    }

    /* ---------- Overview (built as fixed numbers; drawn from the data; D-160 layout) ---------- */
    var kpis = $('.kpis');
    if (kpis) {
      var sub = $('.page-h p'); if (sub && /today so far/.test(sub.textContent)) sub.textContent = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' }) + ' · today so far';
      var live = DB.deals(), today = live.filter(function (d) { return d.agemin <= 1440; }), pins = DB.pins(), every = DB.pinEvery();
      var setK = function (key, v) { var k = $('[data-kpi="' + key + '"] .kpi-n', kpis); if (k) k.textContent = v; };
      setK('today', today.length); setK('incoming', pending.length); setK('inbox', DB.inboxOpen()); setK('pinned', pins.length);
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
