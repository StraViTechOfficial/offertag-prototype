/* db.js — the UAT playground's small "backend" (S25, plan.md Part B).
   Seed data: /data/*.json, made by build/data_export.py from the same files the pages are built from.
   What a person changes (deals, posters, ads, pins, blog, catalogue, comments, reports, settings …) is kept in THIS browser's
   localStorage under keys that start with "pg:". Seed + changes = what every page shows.
   Boot order on every page: load the seed → apply the changes → page hooks draw the deal lists, deal page, Home rows and admin
   lists from the data → then the page's own scripts run (they are marked type="ot/defer" by build/routes.py).
   Reset: Admin → "Reset playground", or add ?pg=reset to any address. */
(function () {
  'use strict';
  var P = 'pg:', LS = null;
  try { LS = window.localStorage; LS.setItem('pg:t', '1'); LS.removeItem('pg:t'); } catch (e) { LS = null; }
  var mem = {};  // fallback when storage is blocked (private mode): changes last until the page closes
  function get(k) { try { return LS ? LS.getItem(P + k) : (k in mem ? mem[k] : null); } catch (e) { return null; } }
  function set(k, v) {
    try { if (LS) LS.setItem(P + k, v); else mem[k] = v; return true; }
    catch (e) { if (DB.onFull) DB.onFull(); return false; }
  }
  function del(k) { try { if (LS) LS.removeItem(P + k); else delete mem[k]; } catch (e) {} }
  function getJ(k, d) { try { var v = get(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function setJ(k, v) { return set(k, JSON.stringify(v)); }
  function clone(x) { return x == null ? x : JSON.parse(JSON.stringify(x)); }

  if (/[?&]pg=reset\b/.test(location.search)) { resetAll(); }
  function resetAll() {
    try { if (LS) Object.keys(LS).forEach(function (k) { if (k.indexOf(P) === 0 || k === 'adm-blog' || k === 'adm-pins' || k === 'adm-pins-full' || k === 'adm-pin-every' || k === 'adm-draft' || k === 'adm-fmt' || k === 'adm-tags') LS.removeItem(k); }); } catch (e) {}
    mem = {};
  }

  // the moment this browser first opened the playground: seed times ("10 min ago") are placed relative to it
  var EPOCH = +get('epoch'); if (!EPOCH) { EPOCH = Date.now(); set('epoch', String(EPOCH)); }
  var MIN = 60000, DAY = 864e5;
  function now() { return Date.now(); }
  function isoDay(t) { var d = new Date(t); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function dayFromEpoch(n) { return n == null ? '' : isoDay(EPOCH + n * DAY); }
  function today() { return isoDay(now()); }

  /* ---------------- small helpers shared by the public pages and the admin ---------------- */
  var H = {
    esc: function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); },
    inr: function (v) { return '₹' + Number(v || 0).toLocaleString('en-IN'); },
    slug: function (t) { return String(t || '').toLowerCase().replace(/₹/g, 'rs ').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, ''); },
    ago: function (min) { min = Math.max(0, Math.floor(min)); return min < 1 ? 'now' : min < 60 ? min + ' min' : min < 1440 ? Math.floor(min / 60) + ' h' : Math.floor(min / 1440) + ' d'; },
    typesFor: function (pct, cat) { var t = []; if (pct > 25) t.push('Top'); if (pct > 80) t.push('Loot'); if (cat === 'Grocery' || cat === 'Kitchen') t.push('Pantry'); t.push('New'); return t; },  // D-117
    tagLink: function (href) {  // contract §4.6: strip affiliate params, add the store tag by host
      try {
        var u = new URL(href), host = u.hostname.toLowerCase().replace(/^www\./, '');
        ['tag', 'ascsubtag', 'affid', 'affExtParam1'].forEach(function (k) { u.searchParams.delete(k); });
        if (/(^|\.)amazon\.in$/.test(host)) u.searchParams.append('tag', 'offertag-21');
        else if (/(^|\.)flipkart\.com$/.test(host)) u.searchParams.append('affid', 'offertag');
        return u.toString();
      } catch (e) { return href; }
    },
    domain: function (href) { try { return new URL(href).hostname.replace(/^www\./, ''); } catch (e) { return href; } }
  };

  /* ---------------- state ---------------- */
  var SEED = {}, DB = { ready: false, epoch: EPOCH, H: H, now: now, today: today, dayFromEpoch: dayFromEpoch, onFull: null };
  var cbs = [];
  DB.ready = function (fn) { if (DB.isReady) fn(DB); else cbs.push(fn); };

  // ---- deals: seed + a change map {id: record | null (deleted)} ----
  var dealChanges = {};
  function rawDeals() {
    var out = [], seen = {};
    SEED.deals.forEach(function (d) { seen[d.id] = 1; var c = dealChanges[d.id]; if (c === null) return; out.push(c ? Object.assign({}, d, c) : d); });
    Object.keys(dealChanges).forEach(function (id) { if (!seen[id] && dealChanges[id]) out.push(dealChanges[id]); });
    return out;
  }
  function tomorrow9(from) { var d = new Date(from + DAY); d.setHours(9, 0, 0, 0); return d.getTime(); }
  function resolve(d) {
    var x = Object.assign({}, d), t = now();
    if (x.postedAt == null) x.postedAt = EPOCH - (x.ago || 0) * MIN;
    if (x.status === 'scheduled' && x.schedAt == null) x.schedAt = x.sched === 'tomorrow-9' ? tomorrow9(EPOCH) : x.postedAt;
    if (x.status === 'scheduled' && x.schedAt <= t) { x.status = 'live'; x.postedAt = x.schedAt; }  // a scheduled deal goes live on its time
    x.live = x.status === 'live';
    x.agemin = Math.max(0, Math.floor((t - x.postedAt) / MIN));
    x.agetxt = H.ago(x.agemin);
    x.typesAll = (x.agemin <= 1440 ? ['Fresh'] : []).concat((x.types || []).filter(function (k) { return k !== 'Fresh'; }));
    x.save = x.m && x.m > x.p ? x.m - x.p : 0;
    x.sale = !(x.p > 0);
    x.img = imgSrc(x.img); x.lg = imgSrc(x.lg || x.img); x.td = imgSrc(x.td || x.lg || x.img);
    x.buy = x.link && /^https?:/.test(x.link) ? H.tagLink(x.link) : (x.link || '#buy');
    if (!x.page) x.page = '/deal/' + (H.slug(x.t) || 'deal') + '-' + x.id;
    return x;
  }
  DB.deals = function (opt) {
    opt = opt || {};
    var list = rawDeals().map(resolve);
    if (!opt.all) list = list.filter(function (d) { return d.live && !d.detailOnly; });
    return list.sort(function (a, b) { return b.postedAt - a.postedAt; });
  };
  DB.deal = function (id) { id = String(id); var d = rawDeals().filter(function (x) { return String(x.id) === id; })[0]; return d ? resolve(d) : null; };
  DB.dealByPath = function (path) {
    path = decodeURIComponent(path).replace(/\/$/, '');
    var all = rawDeals().map(resolve), hit = all.filter(function (d) { return d.page === path; })[0];
    if (hit) return hit;
    var m = path.match(/-(\d+)$/); return m ? all.filter(function (d) { return String(d.id) === m[1]; })[0] || null : null;
  };
  DB.raw = function (id) { id = String(id); var d = rawDeals().filter(function (x) { return String(x.id) === id; })[0]; return d ? clone(d) : null; };
  DB.isSeedDeal = function (id) { return SEED.deals.some(function (d) { return String(d.id) === String(id); }); };
  DB.saveDeal = function (rec) {
    var id = String(rec.id || newId());
    var base = DB.isSeedDeal(id) ? SEED.deals.filter(function (d) { return String(d.id) === id; })[0] : null;
    var cur = dealChanges[id] || (base ? {} : {});
    var next = Object.assign({}, cur, rec, { id: id });
    // keep the record small: only fields that differ from the seed are stored for seed deals
    if (base) Object.keys(next).forEach(function (k) { if (k !== 'id' && JSON.stringify(next[k]) === JSON.stringify(base[k])) delete next[k]; });
    else { next.seed = false; if (!next.page) next.page = '/deal/' + (H.slug(next.t) || 'deal') + '-' + id; }
    dealChanges[id] = next; setJ('deals', dealChanges); emit('deals');
    return DB.deal(id);
  };
  DB.deleteDeal = function (id) {
    id = String(id); var d = dealChanges[id];
    if (DB.isSeedDeal(id)) dealChanges[id] = null; else delete dealChanges[id];
    if (d && d.img && /^pgimg:/.test(d.img)) dropImg(d.img);
    setJ('deals', dealChanges); emit('deals');
  };
  DB.restoreDeal = function (id, snapshot) { dealChanges[String(id)] = snapshot === undefined ? undefined : snapshot; if (dealChanges[id] === undefined) delete dealChanges[id]; setJ('deals', dealChanges); emit('deals'); };
  DB.dealSnapshot = function () { return clone(dealChanges); };
  DB.restoreDeals = function (snap) { dealChanges = clone(snap) || {}; setJ('deals', dealChanges); emit('deals'); };
  function newId() { var n = +get('seq') || 480000; n++; set('seq', String(n)); return String(n); }
  DB.newId = newId;
  DB.bumpView = function (id, firstTime) {  // D-148: public count = every view; admin "unique" = once per visitor (this browser)
    var d = DB.deal(id); if (!d) return null;
    var seen = getJ('seen', {}), uniq = !seen[id]; seen[id] = 1; setJ('seen', seen);
    return DB.saveDeal({ id: id, views: (d.views || 0) + 1, uniq: (d.uniq || 0) + (uniq ? 1 : 0) });
  };
  DB.bumpClick = function (id) { var d = DB.deal(id); if (d) DB.saveDeal({ id: id, clicks: (d.clicks || 0) + 1 }); };

  // ---- images the person uploads: shrunk in the browser, kept under their own key so the deal record stays small ----
  function imgSrc(v) { if (v && /^pgimg:/.test(v)) return get('img:' + v.slice(6)) || '/assets/placeholder.svg'; return v || '/assets/placeholder.svg'; }
  function dropImg(ref) { del('img:' + ref.slice(6)); }
  DB.imgSrc = imgSrc;
  DB.putImage = function (dataUrl) {
    if (!dataUrl || !/^data:/.test(dataUrl)) return dataUrl || '';
    var key = 'i' + now().toString(36) + Math.random().toString(36).slice(2, 6);
    return set('img:' + key, dataUrl) ? 'pgimg:' + key : '';
  };
  DB.shrink = function (src, cb, max) {  // any picture → JPEG, longest side max px (default 600), about 50–80 KB
    max = max || 600;
    var img = new Image(); img.onload = function () {
      var w = img.naturalWidth, h = img.naturalHeight, k = Math.min(1, max / Math.max(w, h)), c = document.createElement('canvas');
      c.width = Math.round(w * k); c.height = Math.round(h * k);
      var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
      try { cb(c.toDataURL('image/jpeg', 0.82)); } catch (e) { cb(src); }
    };
    img.onerror = function () { cb(src); };
    img.src = src;
  };

  // ---- whole-list collections (posters, sponsored, catalogue, inbox, users, settings …): seed until first change, then a full copy ----
  var COLL = {};
  DB.get = function (name) { if (!(name in COLL)) COLL[name] = getJ('c:' + name, undefined); var v = COLL[name]; return clone(v === undefined ? SEED.coll[name] : v); };
  DB.set = function (name, val) { COLL[name] = clone(val); setJ('c:' + name, val); emit(name); };
  DB.changed = function (name) { return getJ('c:' + name, undefined) !== undefined; };

  // ---- comments: seed + added + deleted + reactions ----
  var CM = { add: [], del: {}, rx: {} };
  DB.comments = function (dealId) {
    var t = now(), list = SEED.comments.concat(CM.add).filter(function (c) { return !CM.del[c.id] && (dealId == null || String(c.deal) === String(dealId)); });
    return list.map(function (c) {
      var x = Object.assign({}, c); if (x.at == null) x.at = EPOCH - (x.ago || 0) * MIN;
      x.rx = CM.rx[c.id] || x.rx || {}; x.agemin = Math.max(0, Math.floor((t - x.at) / MIN)); x.when = x.agemin < 1 ? 'Just now' : H.ago(x.agemin); return x;
    });
  };
  DB.addComment = function (c) { c = Object.assign({ id: 'u' + now().toString(36), at: now(), rx: {} }, c); CM.add.push(c); setJ('comments', CM); emit('comments'); return c; };
  DB.deleteComment = function (id) { CM.del[id] = 1; setJ('comments', CM); emit('comments'); };
  DB.restoreComment = function (id) { delete CM.del[id]; setJ('comments', CM); emit('comments'); };   // D-153: Undo after Delete
  DB.setReactions = function (id, rx) { CM.rx[id] = rx; setJ('comments', CM); emit('comments'); };

  // ---- inbox items sent from the public site (reports, contact, delete-account requests) ----
  DB.addInbox = function (kind, item) {
    var list = DB.get(kind) || [];
    item = Object.assign({ id: now(), at: now(), done: false }, item); list.unshift(item); DB.set(kind, list); return item;
  };
  DB.inboxOpen = function () { return ['feedback', 'reports', 'deletion'].reduce(function (n, k) { return n + (DB.get(k) || []).filter(function (r) { return !r.done; }).length; }, 0); };
  DB.whenOf = function (r) { var at = r.at != null ? r.at : EPOCH - (r.ago || 0) * MIN; return H.ago((now() - at) / MIN); };

  // ---- catalogue (Admin → Catalogue writes here; the public pages read names, order and on/off) ----
  DB.cats = function (all) { var c = DB.get('categories'); return c.filter(function (x) { return all || x.on !== false; }).sort(function (a, b) { return a.order - b.order; }); };
  DB.shops = function (all) { var s = DB.get('shops'); return s.filter(function (x) { return all || x.on !== false; }).sort(function (a, b) { return a.order - b.order; }); };
  DB.shop = function (name) { return DB.get('shops').filter(function (s) { return s.name === name; })[0] || null; };
  DB.cat = function (name) { return DB.get('categories').filter(function (s) { return s.name === name; })[0] || null; };
  DB.catPage = function (name) { var c = DB.cat(name); return c ? (c.page || '/products/' + c.slug + '-deals') : '/categories'; };
  DB.shopPage = function (name) { var s = DB.shop(name); return s ? (s.page || '/shops/' + s.slug) : '/stores'; };
  DB.logo = function (name) { var s = DB.shop(name); return s && s.logo ? imgSrc(s.logo) : ''; };
  DB.steps = function () { return SEED.steps; };
  DB.seedBlog = function () { return clone(SEED.blog); };
  DB.rxList = function () { return SEED.rxList || []; };
  DB.seedColl = function () { return clone(SEED.coll); };

  // ---- blog: the admin's list (admin-d.js keeps its edits in "adm-blog"; same merge rule) ----
  DB.blog = function () {
    var saved = {}; try { saved = JSON.parse(localStorage.getItem('adm-blog') || '{}') || {}; } catch (e) {}
    var orig = {}; SEED.blog.forEach(function (p) { orig[p.name] = 1; });
    var list = SEED.blog.map(function (p) { return saved[p.name] ? Object.assign({}, p, saved[p.name]) : Object.assign({}, p); });
    Object.keys(saved).forEach(function (k) { if (!orig[k] && !saved[k].deleted) list.unshift(Object.assign({}, saved[k])); });
    var t = now();
    return list.filter(function (p) { return !(saved[p.name] && saved[p.name].deleted); }).map(function (p) {
      if (p.status === 'scheduled' && p.date && new Date(p.date + 'T' + (p.time || '09:00')).getTime() <= t) p.status = 'published';
      return p;
    });
  };

  // ---- pins (one list for the Pinned board, All deals and Top deals) ----
  DB.pinEvery = function () { var v = DB.get('pinEvery'); return v >= 2 ? v : 3; };
  DB.pins = function () { return DB.deals().filter(function (d) { return d.pin; }).sort(function (a, b) { return a.pin - b.pin; }); };

  /* ---------------- change events (also across tabs: admin in one tab, the site in another) ---------------- */
  var listeners = [];
  DB.on = function (fn) { listeners.push(fn); };
  function emit(what) { listeners.forEach(function (fn) { try { fn(what); } catch (e) {} }); }
  window.addEventListener('storage', function (e) { if (e.key && (e.key.indexOf(P) === 0 || e.key === 'adm-blog')) { loadChanges(); COLL = {}; emit('external'); } });

  DB.reset = function () { resetAll(); };
  // What the person changed. Counters the site keeps by itself while someone browses (deal views, unique views, Buy clicks,
  // ad views and clicks) are not changes, so "Sample data, nothing changed yet" stays true after a Reset until they edit something.
  var COUNTERS = { views: 1, uniq: 1, clicks: 1 };
  function noCounters(v) {
    if (Array.isArray(v)) return v.map(noCounters);
    if (v && typeof v === 'object') { var o = {}; Object.keys(v).sort().forEach(function (k) { if (!COUNTERS[k]) o[k] = noCounters(v[k]); }); return o; }
    return v;
  }
  DB.changeCount = function () {
    var n = 0, dc = getJ('deals', {}), cm = getJ('comments', { add: [], del: {}, rx: {} });
    Object.keys(dc).forEach(function (id) { var c = dc[id]; if (c === null || Object.keys(c).some(function (k) { return k !== 'id' && !COUNTERS[k]; })) n++; });
    n += (cm.add || []).length + Object.keys(cm.del || {}).length + Object.keys(cm.rx || {}).length;
    try { if (LS) Object.keys(LS).forEach(function (k) {
      if (k.indexOf(P + 'c:') !== 0) return;
      var name = k.slice((P + 'c:').length);
      if (JSON.stringify(noCounters(getJ('c:' + name, null))) !== JSON.stringify(noCounters(SEED.coll[name] === undefined ? null : SEED.coll[name]))) n++;
    }); } catch (e) {}
    try { n += Object.keys(JSON.parse(localStorage.getItem('adm-blog') || '{}')).length; } catch (e) {}
    return n;
  };

  function loadChanges() {
    dealChanges = getJ('deals', {}) || {};
    CM = getJ('comments', { add: [], del: {}, rx: {} }); CM.add = CM.add || []; CM.del = CM.del || {}; CM.rx = CM.rx || {};
  }

  /* ---------------- boot ---------------- */
  function fetchJ(u) { return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); }); }
  Promise.all(['deals', 'catalogue', 'home', 'blog', 'community'].map(function (n) { return fetchJ('/data/' + n + '.json'); })).then(function (r) {
    var deals = r[0], cat = r[1], home = r[2], blog = r[3], com = r[4];
    // seed blog dates are calendar dates around the prototype's "today" (13 Nov 2026): move them by the same gap
    function shiftBlog(list) {
      var gap = Math.round((new Date(isoDay(EPOCH) + 'T00:00') - new Date('2026-11-13T00:00')) / DAY);
      return list.map(function (p) { var q = Object.assign({}, p); if (q.date) q.date = isoDay(new Date(q.date + 'T00:00').getTime() + gap * DAY); return q; });
    }
    // seed dates for posters and ads are days from the prototype's "today"; place them around the real today
    function dated(list) { return list.map(function (x) { var y = Object.assign({}, x); y.start = dayFromEpoch(x.start); y.end = dayFromEpoch(x.end); return y; }); }
    SEED = {
      deals: deals, blog: shiftBlog(blog), comments: com.comments, steps: cat.steps, rxList: com.rx,
      coll: {
        categories: cat.categories, shops: cat.shops, combos: cat.combos, tintDefault: cat.tintDefault, btnDefault: cat.btnDefault,
        posters: dated(home.posters), sponsored: dated(home.sponsored), pinEvery: home.pinEvery, trending: home.trending, promo: home.promo, site: home.site,
        feedback: com.feedback, reports: com.reports, deletion: com.deletion, users: com.users
      }
    };
    loadChanges();
    DB.isReady = true;
    // search suggestions in the header and the phone sheet read these (site.js)
    window.OT_DEALS = DB.deals().map(function (d) { return { id: d.id, page: d.page, t: d.t, p: d.p, m: d.m, pct: d.pct, store: d.store, cat: d.cat, thumb: d.img, age: d.agemin, pinned: !!d.pin }; });
    window.OT_CAT = { cats: DB.cats().map(function (c) { return { name: c.name, slug: c.slug, total: c.total, page: DB.catPage(c.name) }; }), shops: DB.shops().map(function (s) { return { name: s.name, slug: s.slug, total: s.total, page: DB.shopPage(s.name) }; }) };
    var q = cbs; cbs = []; q.forEach(function (fn) { try { fn(DB); } catch (e) { console.error('[playground]', e); } });
    runDeferred();
  }).catch(function (e) {
    console.error('[playground] could not load the seed data', e);
    runDeferred();  // the page still works as built, without the person's changes
  });

  // the page's own scripts, in their original order, once the data is drawn
  function runDeferred() {
    var list = Array.prototype.slice.call(document.querySelectorAll('script[type="ot/defer"]'));
    (function next(i) {
      if (i >= list.length) { document.dispatchEvent(new Event('ot:booted')); return; }
      var s = document.createElement('script'), src = list[i].getAttribute('data-src');
      s.src = src; s.async = false; s.onload = s.onerror = function () { next(i + 1); };
      list[i].parentNode.insertBefore(s, list[i].nextSibling);
    })(0);
  }

  window.OTDB = DB;
})();
