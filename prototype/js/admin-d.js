/* admin-d.js — OfferTag admin prototype, batch D (S16): Blog posts list and Blog editor.
   Loads after admin.js (window.ADM). Edits are kept in this browser (localStorage 'adm-blog') so the list and the editor agree.
   Data sheet: design-system/ia/data-sheets/admin-batch-d.md */
(function () {
  var A = window.ADM; if (!A || !window.ADM_BLOG) return;
  var $ = A.$, $$ = A.$$, esc = A.esc, toast = A.toast;
  var ORIG = {}; window.ADM_BLOG.forEach(function (p) { ORIG[p.name] = true; });
  var PUBLIC = { 'lunch-boxes-and-tiffins-worth-packing': 1, 'running-shoes-from-puma-and-reebok': 1, 'laptop-backpacks-for-work-and-college': 1, 'why-bldc-ceiling-fans-cost-more': 1 };
  function load() {
    var saved = {}; try { saved = JSON.parse(A.store.get('adm-blog')) || {}; } catch (e) {}
    var list = window.ADM_BLOG.map(function (p) { return saved[p.name] ? Object.assign({}, p, saved[p.name]) : Object.assign({}, p); });
    Object.keys(saved).forEach(function (k) { if (!ORIG[k] && !saved[k].deleted) list.unshift(Object.assign({}, saved[k])); });
    return list.filter(function (p) { return !(saved[p.name] && saved[p.name].deleted); });
  }
  function persist(p) { var s = {}; try { s = JSON.parse(A.store.get('adm-blog')) || {}; } catch (e) {} s[p.name] = p; A.store.set('adm-blog', JSON.stringify(s)); }
  function drop(name) { var s = {}; try { s = JSON.parse(A.store.get('adm-blog')) || {}; } catch (e) {} if (ORIG[name]) s[name] = { deleted: true }; else delete s[name]; A.store.set('adm-blog', JSON.stringify(s)); }
  var MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d, t) { if (!d) return ''; var x = d.split('-'); return (+x[2]) + ' ' + MON[+x[1] - 1] + (t ? ' ' + t : ''); }
  function today() { var n = new Date(); return n.getFullYear() + '-' + ('0' + (n.getMonth() + 1)).slice(-2) + '-' + ('0' + n.getDate()).slice(-2); }
  function dealCount(p) { if (p.html != null) return (p.html.match(/data-deal="/g) || []).length; return (p.body || []).filter(function (b) { return b.deal; }).length; }
  function pill(s) { return s === 'published' ? '<span class="pill pill-live">Published</span>' : s === 'scheduled' ? '<span class="pill pill-scheduled">Scheduled</span>' : '<span class="pill">Draft</span>'; }
  function publicHref(p) { return p.status === 'published' && p.name ? '/blog/' + p.name : ''; }   // S25 playground: every published post has its page

  /* =================== Blog posts list =================== */
  if ($('[data-brows]')) (function () {
    var posts = load(), tab = 'all', q = $('[data-bq]'), menu = $('#blog-menu'), cur = null, mbtn = null;
    function counts() { ['draft', 'scheduled', 'published'].forEach(function (s) { var c = $('[data-tcount="' + s + '"]'); if (c) c.textContent = posts.filter(function (p) { return p.status === s; }).length; }); $('[data-tcount="all"]').textContent = posts.length; }
    function render() {
      var s = q.value.trim().toLowerCase(), rows = posts.filter(function (p) { return (tab === 'all' || p.status === tab) && (!s || p.title.toLowerCase().indexOf(s) > -1); });
      $('[data-brows]').innerHTML = rows.map(function (p) {
        var when = p.status === 'draft' ? '<span class="d-when">edited ' + esc(p.edited || 'just now') + '</span>' : '<span class="d-when">' + fmtDate(p.date, p.status === 'scheduled' ? p.time : '') + '</span>';
        return '<tr data-p="' + esc(p.name) + '"><td class="c-title"><a class="b-title" href="' + A.withRole(A.routes.blogEdit(p.name)) + '">' + esc(p.title || 'Untitled draft') + '</a>' + (p.summary ? '<small class="b-sum">' + esc(p.summary) + '</small>' : '') + '</td>'
          + '<td data-l="Status">' + pill(p.status) + '</td><td data-l="Date">' + when + '</td><td class="num" data-l="Deals">' + dealCount(p) + '</td>'
          + '<td class="c-act"><button class="btn btn-ghost btn-icon btn-sm" type="button" data-bmenu aria-haspopup="menu" aria-label="Actions for ' + esc(p.title || 'draft') + '"><i data-lucide="ellipsis"></i></button></td></tr>';
      }).join('');
      var em = $('[data-bempty]'); em.hidden = rows.length > 0;
      em.innerHTML = s ? 'No posts match. <button class="btn-link" type="button" data-bclear>Clear search</button>' : tab === 'draft' ? 'No drafts.' : tab === 'scheduled' ? 'Nothing scheduled.' : 'No posts yet. <a class="btn-link" href="/admin/blog/create">Write the first one</a>';
      counts(); A.icons();
    }
    function closeMenu(refocus) { if (menu.hidden) return; menu.dataset.state = 'closed'; setTimeout(function () { menu.hidden = true; }, 120); if (refocus && mbtn) mbtn.focus(); mbtn = null; }
    function openMenu(btn, ev) {
      if (mbtn === btn) { closeMenu(); return; }
      cur = posts.filter(function (p) { return p.name === btn.closest('tr').dataset.p; })[0]; mbtn = btn;
      $('[data-bm="edit"]').href = A.withRole(A.routes.blogEdit(cur.name));
      var v = $('[data-bm="view"]'), ph = publicHref(cur); v.hidden = !ph; v.href = ph || '#';
      $('[data-bm="pub"]').hidden = cur.status === 'published'; $('[data-bm="unpub"]').hidden = cur.status !== 'published';
      menu.hidden = false; var r = btn.getBoundingClientRect(), h = menu.offsetHeight, w = menu.offsetWidth;
      menu.style.left = Math.max(8, Math.min(r.right - w, innerWidth - w - 8)) + 'px'; menu.style.top = (r.bottom + h + 8 > innerHeight ? Math.max(8, r.top - h - 4) : r.bottom + 4) + 'px';
      requestAnimationFrame(function () { menu.dataset.state = 'open'; }); if (ev && ev.detail === 0) { var f = $('[role^="menuitem"]:not([hidden])', menu); if (f) f.focus(); }
    }
    $('[data-brows]').addEventListener('click', function (e) { var b = e.target.closest('[data-bmenu]'); if (b) { e.stopPropagation(); openMenu(b, e); } });
    document.addEventListener('click', function (e) { if (!menu.contains(e.target)) closeMenu(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(true); });
    window.addEventListener('scroll', function () { closeMenu(); }, true);
    $('[data-bempty]').addEventListener('click', function (e) { if (e.target.closest('[data-bclear]')) { q.value = ''; render(); q.focus(); } });
    menu.addEventListener('click', function (e) {
      var b = e.target.closest('[data-bm]'); if (!b) return; var a = b.dataset.bm, p = cur; closeMenu();
      if (a === 'edit' || a === 'view') return;
      if (a === 'dup') {
        var base = p.name.replace(/-copy(-\d+)?$/, '') + '-copy', name = base, i = 2; while (posts.some(function (x) { return x.name === name; })) name = base + '-' + i++;
        var c = Object.assign({}, p, { name: name, title: 'Copy of ' + p.title, status: 'draft', date: '', time: '', edited: 'just now' }); posts.unshift(c); persist(c); render();
        toast('Copy saved as a draft', { action: 'Edit', href: A.withRole(A.routes.blogEdit(name)) });
      } else if (a === 'pub') {
        if (!p.title || !p.summary || !dealCount(p) && !(p.body || []).length) { toast('Add a title and summary before publishing.', { icon: 'info', action: 'Edit', href: A.withRole(A.routes.blogEdit(p.name)) }); return; }
        A.confirmBox('Publish “' + p.title + '” now?', 'It goes live at offertag.in/blog/' + p.name + ' and shows first on the blog.', 'Publish now', function () {
          var prev = { status: p.status, date: p.date, time: p.time }; p.status = 'published'; p.date = today(); p.time = ''; persist(p); render();
          toast('Published', { action: 'Undo', onAction: function () { Object.assign(p, prev); persist(p); render(); } });
        });
      } else if (a === 'unpub') {
        A.confirmBox('Unpublish “' + p.title + '”?', 'It leaves the blog. Its address stays and shows “This post is no longer available”, so shared links don’t break.', 'Unpublish', function () {
          p.status = 'draft'; p.edited = 'just now'; persist(p); render();
          toast('Unpublished. It’s a draft now.', { icon: 'eye-off', action: 'Undo', onAction: function () { p.status = 'published'; persist(p); render(); } });
        }, true);
      } else if (a === 'del') {
        A.confirmBox('Delete “' + (p.title || 'Untitled draft') + '”?', p.status === 'published' ? 'It leaves the blog and its address stops working. Unpublish instead to keep the address.' : 'The draft and its text are removed.', 'Delete', function () {
          var i = posts.indexOf(p); posts.splice(i, 1); drop(p.name); render();
          toast('Post deleted', { icon: 'trash-2', action: 'Undo', onAction: function () { posts.splice(i, 0, p); persist(p); render(); } });
        }, true);
      }
    });
    var tabBtns = $$('[data-btab]');
    tabBtns.forEach(function (b) { b.addEventListener('click', function () { tab = b.dataset.btab; tabBtns.forEach(function (x) { var on = x === b; x.dataset.state = on ? 'active' : ''; x.setAttribute('aria-selected', on); }); render(); }); });
    q.addEventListener('input', render);
    render();
  })();

  /* =================== Blog editor =================== */
  if ($('[data-bbody]')) (function () {
    var DEALS = window.ADM_DEALS || [], body = $('[data-bbody]'), F = {}; ['title', 'summary', 'slug', 'cat', 'seo', 'meta'].forEach(function (n) { F[n] = $('[name="' + n + '"]'); });
    function dealById(id) { return DEALS.filter(function (d) { return String(d.id) === String(id); })[0]; }
    var name = A.params.get('post'), all = load(), post = all.filter(function (p) { return p.name === name; })[0], isNew = !post;
    if (name && !post) toast('That post was not found, so this is a new one.', { icon: 'info' });
    post = post || { name: '', title: '', summary: '', status: 'draft', date: '', time: '', cover: '', cat: '', seo: '', meta: '', body: [{ p: '' }] };
    var slugTouched = !isNew, dirty = false, savedAt = null, coverImg = post.cover || '';

    function dealCard(id) {
      var d = dealById(id); if (!d) return '';
      var gone = d.status === 'withdrawn' || d.status === 'rejected';
      return '<div class="be-deal' + (gone ? ' is-gone' : '') + '" contenteditable="false" data-deal="' + d.id + '"><img src="' + d.img + '" alt=""><div class="be-deal-t"><small>' + esc(d.store) + ' · ' + d.pct + '% off</small><b>' + esc(d.t) + '</b><span>' + A.rs(d.p) + (d.m ? ' <s>' + A.rs(d.m) + '</s>' : '') + '</span></div>'
        + '<span class="be-deal-st">' + (gone ? '<span class="pill pill-withdrawn">No longer available</span>' : '<span class="pill pill-live">Live</span>') + '</span>'
        + '<span class="be-deal-acts"><button class="btn btn-ghost btn-sm" type="button" data-deal-change>Change</button><button class="btn btn-ghost btn-icon btn-sm" type="button" data-deal-x aria-label="Remove deal"><i data-lucide="x"></i></button></span></div>';
    }
    // D-162: every non-text block (deal, image, video, button) is a locked card in the editor and a small marker in the saved HTML.
    function imgFig(src, alt, cap, size) {
      size = size || 'full';
      return '<figure class="be-img be-img--' + size + (alt ? '' : ' is-noalt') + '" contenteditable="false" data-size="' + size + '"><img src="' + src + '" alt="' + esc(alt || '') + '">' +
        '<figcaption contenteditable="true" data-ph="Add a caption (optional)">' + esc(cap || '') + '</figcaption>' +
        '<span class="be-blk-tools"><button class="btn btn-ghost btn-sm" type="button" data-img-edit><i data-lucide="sliders-horizontal"></i>Alt text &amp; size</button><button class="btn btn-ghost btn-icon btn-sm" type="button" data-img-x aria-label="Remove image"><i data-lucide="x"></i></button></span></figure>';
    }
    function videoFig(id) {
      return '<figure class="be-video" contenteditable="false" data-yt="' + esc(id) + '"><img src="https://i.ytimg.com/vi/' + esc(id) + '/hqdefault.jpg" alt="YouTube video"><span class="be-play"><i data-lucide="play"></i></span>' +
        '<span class="be-blk-tools"><button class="btn btn-ghost btn-icon btn-sm" type="button" data-blk-x aria-label="Remove video"><i data-lucide="x"></i></button></span></figure>';
    }
    function ctaBlock(label, href) {
      return '<div class="be-cta" contenteditable="false" data-href="' + esc(href) + '" data-label="' + esc(label) + '"><span class="be-cta-btn">' + esc(label) + ' <i data-lucide="arrow-right"></i></span><small>' + esc(href) + '</small>' +
        '<span class="be-blk-tools"><button class="btn btn-ghost btn-sm" type="button" data-cta-edit>Edit</button><button class="btn btn-ghost btn-icon btn-sm" type="button" data-blk-x aria-label="Remove button"><i data-lucide="x"></i></button></span></div>';
    }
    function fromBlocks(bs) { return (bs || []).map(function (b) { return b.p != null ? '<p>' + (esc(b.p) || '<br>') + '</p>' : b.h ? '<h2>' + esc(b.h) + '</h2>' : b.deal ? dealCard(b.deal) : b.img ? imgFig(b.img, b.alt) : ''; }).join(''); }
    function hydrate(html) {
      var t = document.createElement('div'); t.innerHTML = html;
      var swap = function (n, h) { var x = document.createElement('div'); x.innerHTML = h; if (x.firstChild) n.replaceWith(x.firstChild); else n.remove(); };
      $$('div[data-deal]', t).forEach(function (n) { swap(n, dealCard(n.getAttribute('data-deal'))); });
      $$('figure[data-img]', t).forEach(function (n) { swap(n, imgFig(n.getAttribute('data-img'), n.getAttribute('data-alt'), n.getAttribute('data-cap'), n.getAttribute('data-size'))); });
      $$('figure[data-yt]', t).forEach(function (n) { swap(n, videoFig(n.getAttribute('data-yt'))); });
      $$('div[data-cta-href]', t).forEach(function (n) { swap(n, ctaBlock(n.getAttribute('data-cta-label'), n.getAttribute('data-cta-href'))); });
      return t.innerHTML;
    }
    function serial() {
      var c = body.cloneNode(true), mk = function (tag, attrs) { var x = document.createElement(tag); Object.keys(attrs).forEach(function (k) { x.setAttribute(k, attrs[k]); }); return x; };
      $$('.be-deal', c).forEach(function (n) { n.replaceWith(mk('div', { 'data-deal': n.dataset.deal })); });
      $$('.be-img', c).forEach(function (n) { var i = $('img', n), cap = $('figcaption', n); n.replaceWith(mk('figure', { 'data-img': i.getAttribute('src'), 'data-alt': i.getAttribute('alt') || '', 'data-cap': cap ? cap.textContent.trim() : '', 'data-size': n.dataset.size || 'full' })); });
      $$('.be-video', c).forEach(function (n) { n.replaceWith(mk('figure', { 'data-yt': n.dataset.yt })); });
      $$('.be-cta', c).forEach(function (n) { n.replaceWith(mk('div', { 'data-cta-href': n.dataset.href, 'data-cta-label': n.dataset.label })); });
      $$('[data-ph-empty]', c).forEach(function (n) { n.removeAttribute('data-ph-empty'); });
      return c.innerHTML;
    }

    // fill
    F.title.value = post.title; F.summary.value = post.summary; F.slug.value = post.name; F.seo.value = post.seo || ''; F.meta.value = post.meta || '';
    if (post.cat) F.cat.value = post.cat;
    body.innerHTML = post.html != null ? hydrate(post.html) : fromBlocks(post.body);
    if (!body.innerHTML.trim()) body.innerHTML = '<p><br></p>';
    var cv = $('[data-bcover]'); function showCover() { var i = $('img', cv); i.hidden = !coverImg; if (coverImg) i.src = coverImg; cv.classList.toggle('has', !!coverImg); } showCover();
    $('input', cv).addEventListener('change', function (e) { var f = e.target.files[0]; if (!f) return; var r = new FileReader(); r.onload = function () { (window.OTDB ? OTDB.shrink : function (x, cb) { cb(x); })(r.result, function (u) { coverImg = u; showCover(); touch(); }, 900); }; r.readAsDataURL(f); });

    function slugify(t) { return t.toLowerCase().replace(/₹/g, 'rs ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 70).replace(/-+$/, ''); }
    function setState() {
      $('[data-bstatus]').outerHTML = '<span data-bstatus>' + pill(post.status) + '</span>';
      var pub = $('[data-bpublish] span'); pub.textContent = post.status === 'published' ? 'Update' : 'Publish now';
      $('[data-bsched-btn] span').textContent = post.status === 'scheduled' ? fmtDate(post.date, post.time) : 'Schedule';
      $('[data-bsched-btn]').hidden = post.status === 'published';
      F.slug.readOnly = post.status === 'published'; $('[data-bslug-hint]').textContent = post.status === 'published' ? 'Fixed now the post is published, so links keep working.' : 'Made from the title. Fixed once published, so links keep working.';
      var ph = publicHref(post); var pv = $('[data-bpreview]'); pv.href = ph || '#';
    }
    function dealsSide() {
      var ids = $$('.be-deal', body).map(function (n) { return n.dataset.deal; });
      $('[data-bdeal-n]').textContent = ids.length;
      $('[data-bdeals]').innerHTML = ids.length ? ids.map(function (id, i) { var d = dealById(id); return d ? '<li><button type="button" data-goto="' + i + '"><img src="' + d.img + '" alt=""><span>' + esc(d.t) + '</span>' + (d.status === 'withdrawn' ? '<small class="miss">gone</small>' : '<small>' + A.rs(d.p) + '</small>') + '</button></li>' : ''; }).join('') : '<li class="none">No deals yet. Use “+ Deal” in the toolbar.</li>';
      if (!F.cat.dataset.touched && ids.length) { var c = {}; ids.forEach(function (id) { var d = dealById(id); if (d) c[d.cat] = (c[d.cat] || 0) + 1; }); var top = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; })[0]; if (top && $$('option', F.cat).some(function (o) { return o.value === top; })) F.cat.value = top; }
    }
    $('[data-bdeals]').addEventListener('click', function (e) { var b = e.target.closest('[data-goto]'); if (!b) return; var n = $$('.be-deal', body)[+b.dataset.goto]; n.scrollIntoView({ block: 'center', behavior: 'smooth' }); n.classList.remove('is-flash'); void n.offsetWidth; n.classList.add('is-flash'); });
    F.cat.addEventListener('change', function () { F.cat.dataset.touched = '1'; });

    // autosave every 10 s (§3)
    function save(quiet) {
      if (!post.name) { var s = F.slug.value.trim() || slugify(F.title.value) || 'draft-' + Date.now().toString(36); post.name = s; F.slug.value = s; try { history.replaceState(null, '', A.withRole(A.routes.blogEdit(s))); } catch (e) {} }
      post.title = F.title.value.trim(); post.summary = F.summary.value.trim(); post.seo = F.seo.value.trim(); post.meta = F.meta.value.trim(); post.cat = F.cat.value; post.cover = coverImg; post.html = serial(); post.edited = 'just now';
      persist(post); dirty = false; savedAt = Date.now(); tick();
    }
    function tick() { var el = $('[data-bsaved]'); if (dirty && !savedAt) { el.textContent = 'Unsaved changes'; return; } if (!savedAt) return; var s = Math.round((Date.now() - savedAt) / 1000); el.textContent = dirty ? 'Unsaved changes' : s < 5 ? 'Saved just now' : s < 60 ? 'Saved ' + s + ' s ago' : 'Saved ' + Math.round(s / 60) + ' min ago'; }
    function touch() { dirty = true; tick(); }
    setInterval(function () { if (dirty && post.status !== 'published' && (F.title.value.trim() || body.textContent.trim())) save(true); else tick(); }, 10000);   // a live post changes only with Update
    setInterval(tick, 1000);
    window.addEventListener('beforeunload', function (e) { if (!dirty) return; if (post.status === 'published') { e.preventDefault(); e.returnValue = ''; } else save(true); });
    $('[data-bsaved]').textContent = isNew ? 'Not saved yet' : post.status === 'draft' ? 'Draft, edited ' + (post.edited || 'earlier') : 'Saved';

    F.title.addEventListener('input', function () { if (!slugTouched && post.status !== 'published') F.slug.value = slugify(F.title.value); clearErr(F.title); touch(); });
    F.slug.addEventListener('input', function () { slugTouched = true; clearErr(F.slug); touch(); });
    F.summary.addEventListener('input', function () { $('[data-bsum-n]').textContent = F.summary.value.length; clearErr(F.summary); touch(); });
    $('[data-bsum-n]').textContent = F.summary.value.length;
    [F.seo, F.meta, F.cat].forEach(function (i) { i.addEventListener('input', touch); i.addEventListener('change', touch); });
    body.addEventListener('input', function () { $('[data-bbody-err]').hidden = true; touch(); dealsSide(); });
    function clearErr(i) { i.removeAttribute('aria-invalid'); var e = $('.err', i.closest('.fld')); if (e) e.hidden = true; }
    function err(i, msg) { i.setAttribute('aria-invalid', 'true'); var e = $('.err', i.closest('.fld')); if (e) { e.textContent = msg; e.hidden = false; } }

    // ===== D-162 editor: toolbar, floating bar, "/" blocks, typing shortcuts, links, images, tables, video, button, paste, preview =====
    var lastRange = null;
    try { document.execCommand('defaultParagraphSeparator', false, 'p'); } catch (e) {}   // new lines are paragraphs, not divs
    function isPara(n) { return n && (n.nodeName === 'P' || (n.nodeName === 'DIV' && !n.className)) && n.parentNode === body; }
    function inBody(n) { return n && (n === body || body.contains(n)); }
    function keepRange() { var s = getSelection(); if (s.rangeCount && inBody(s.anchorNode)) lastRange = s.getRangeAt(0).cloneRange(); }
    document.addEventListener('selectionchange', function () { keepRange(); syncBar(); floatBar(); tableBar(); });
    function restore() { body.focus(); if (lastRange) { var s = getSelection(); s.removeAllRanges(); s.addRange(lastRange); } }
    function blockOf(n) { while (n && n !== body && !(n.nodeType === 1 && /^(P|H2|H3|H4|BLOCKQUOTE|LI|TD|TH|FIGCAPTION|DIV)$/.test(n.nodeName))) n = n.parentNode; return n === body ? null : n; }
    function topOf(n) { while (n && n.parentNode !== body) n = n.parentNode; return n; }
    function caretIn(el, end) { var r = document.createRange(), s = getSelection(); r.selectNodeContents(el); r.collapse(!end); s.removeAllRanges(); s.addRange(r); }
    function exec(cmd, val) { restore(); document.execCommand(cmd, false, val == null ? null : val); touch(); syncBar(); }
    var STORE_RE = /(amazon\.|amzn\.|flipkart\.|fkrt\.|myntra\.|ajio\.|jiomart\.|bigbasket\.|meesho\.|blinkit\.|swiggy\.|nykaa\.|tatacliq\.|zepto)/i;
    function linkAttrs(a, newTab) { if (newTab) a.setAttribute('target', '_blank'); else a.removeAttribute('target'); var rel = STORE_RE.test(a.getAttribute('href') || '') ? 'sponsored nofollow noopener' : newTab ? 'noopener' : ''; if (rel) a.setAttribute('rel', rel); else a.removeAttribute('rel'); }

    // --- small floating form used by link, image, video and button
    var ask = document.createElement('div'); ask.className = 'popover be-ask'; ask.hidden = true; ask.setAttribute('role', 'dialog'); document.body.appendChild(ask);
    var askCb = null;
    function openAsk(o) {  // o: { title, at (rect), fields: [{ n, label, v, ph, type, opts }], checks: [{ n, label, on }], ok, extra, onOk(v) → error text or nothing, remove: { label, fn } }
      var f = (o.fields || []).map(function (x) {
        if (x.type === 'seg') return '<div class="fld"><span class="lab">' + x.label + '</span><span class="seg be-ask-seg" data-seg="' + x.n + '">' + x.opts.map(function (p) { return '<button type="button" value="' + p[0] + '" aria-pressed="' + (p[0] === x.v) + '">' + p[1] + '</button>'; }).join('') + '</span></div>';
        return '<label class="fld"><span class="lab">' + x.label + '</span><input class="input" name="' + x.n + '" value="' + esc(x.v || '') + '" placeholder="' + esc(x.ph || '') + '" autocomplete="off" spellcheck="false"></label>';
      }).join('') + (o.checks || []).map(function (x) { return '<label class="ckl be-ask-ck"><input type="checkbox" name="' + x.n + '"' + (x.on ? ' checked' : '') + '> ' + x.label + '</label>'; }).join('');
      ask.innerHTML = '<form novalidate><b class="be-ask-h">' + o.title + '</b>' + f + (o.extra || '') + '<p class="err" hidden></p><div class="pop-acts">' + (o.remove ? '<button class="btn btn-ghost btn-sm danger" type="button" data-ask-rm>' + o.remove.label + '</button>' : '') + '<span class="sp"></span><button class="btn btn-ghost btn-sm" type="button" data-ask-x>Cancel</button><button class="btn btn-default btn-sm" type="submit">' + (o.ok || 'Apply') + '</button></div></form>';
      ask.hidden = false; var r = o.at || body.getBoundingClientRect(), w = ask.offsetWidth, h = ask.offsetHeight;
      ask.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px'; ask.style.top = (r.bottom + 8 + h > innerHeight ? Math.max(8, r.top - h - 8) : r.bottom + 8) + 'px';
      askCb = o; var first = $('input', ask); if (first) { first.focus(); first.select(); }
      $$('.be-ask-seg button', ask).forEach(function (b) { b.addEventListener('click', function () { $$('button', b.parentNode).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); }); });
      $('form', ask).addEventListener('submit', function (e) {
        e.preventDefault(); var v = {}; $$('input', ask).forEach(function (i) { v[i.name] = i.type === 'checkbox' ? i.checked : i.value.trim(); }); $$('[data-seg]', ask).forEach(function (sg) { var p = $('[aria-pressed="true"]', sg); v[sg.dataset.seg] = p ? p.value : ''; });
        var bad = o.onOk(v); if (bad) { var er = $('.err', ask); er.textContent = bad; er.hidden = false; return; } closeAsk(); touch();
      });
      $('[data-ask-x]', ask).addEventListener('click', function () { closeAsk(true); });
      if (o.remove) $('[data-ask-rm]', ask).addEventListener('click', function () { o.remove.fn(); closeAsk(); touch(); });
    }
    function closeAsk(back) { if (ask.hidden) return false; ask.hidden = true; askCb = null; if (back) restore(); return true; }
    document.addEventListener('mousedown', function (e) { if (!ask.hidden && !ask.contains(e.target)) closeAsk(); });

    // --- links (toolbar, Ctrl+K, floating bar, or click a link in the text)
    function openLink(existing) {
      keepRange(); var s = getSelection(), rect = s.rangeCount ? s.getRangeAt(0).getBoundingClientRect() : null, text = s.toString();
      var a = existing || (s.anchorNode && s.anchorNode.parentElement && s.anchorNode.parentElement.closest('a'));
      if (a && !inBody(a)) a = null;
      if (a) rect = a.getBoundingClientRect();
      if (!rect || (!rect.width && !rect.height)) rect = body.getBoundingClientRect();
      openAsk({ title: a ? 'Edit link' : 'Add a link', at: rect, ok: a ? 'Save' : 'Add link',
        fields: [{ n: 'url', label: 'Link address', v: a ? a.getAttribute('href') : '', ph: 'https://…, or a page on offertag.in' }].concat(a || text ? [] : [{ n: 'text', label: 'Text to show', v: '', ph: 'e.g. see the deal' }]),
        checks: [{ n: 'tab', label: 'Open in a new tab', on: a ? a.getAttribute('target') === '_blank' : true }],
        extra: '<p class="be-ask-note"><i data-lucide="info"></i>Store links (Amazon, Flipkart…) are marked as sponsored automatically.</p>',
        remove: a ? { label: 'Remove link', fn: function () { var t = document.createTextNode(a.textContent); a.replaceWith(t); } } : null,
        onOk: function (v) {
          var u = v.url; if (!u) return 'Add the link address.';
          if (!/^(https?:\/\/|\/|mailto:)/i.test(u)) u = /offertag\.in/i.test(u) ? 'https://' + u : /\./.test(u) ? 'https://' + u : '';
          if (!u) return 'That doesn’t look like a link. Start with https://';
          if (a) { a.setAttribute('href', u); linkAttrs(a, v.tab); return; }
          restore();
          if (!getSelection().toString()) { var label = v.text || u.replace(/^https?:\/\/(www\.)?/, ''); document.execCommand('insertHTML', false, '<a href="' + esc(u) + '">' + esc(label) + '</a>&nbsp;'); }
          else document.execCommand('createLink', false, u);
          $$('a[href="' + u.replace(/"/g, '\\"') + '"]', body).forEach(function (x) { linkAttrs(x, v.tab); });
        } });
      A.icons();
    }
    body.addEventListener('click', function (e) { var a = e.target.closest('a'); if (a && inBody(a)) { e.preventDefault(); openLink(a); } });

    // --- block inserts
    function insertBlock(h, inside) {
      restore(); var s = getSelection(), node = topOf(s.rangeCount ? s.anchorNode : null);
      var tmp = document.createElement('div'); tmp.innerHTML = h; var el = tmp.firstChild;
      if (node && node.nextSibling) body.insertBefore(el, node.nextSibling); else if (node) body.appendChild(el); else body.appendChild(el);
      if (!el.nextSibling || !/^(P|H2|H3|H4)$/.test(el.nextSibling.nodeName)) { var p = document.createElement('p'); p.innerHTML = '<br>'; body.insertBefore(p, el.nextSibling); }
      if (node && node.nodeName === 'P' && !node.textContent.trim() && !node.querySelector('img')) node.remove();
      if (inside) caretIn(inside(el), true); else caretIn(el.nextSibling, false);
      A.icons(); touch(); dealsSide(); return el;
    }
    function readImg(file, cb) { var r = new FileReader(); r.onload = function () { if (window.OTDB) OTDB.shrink(r.result, cb, 900); else cb(r.result); }; r.readAsDataURL(file); }
    function addImage(src, alt) { var el = insertBlock(imgFig(src, alt || '')); toast('Image added. Add a short description (alt text) so search engines and screen readers know what it shows.', { icon: 'image', ms: 5000 }); return el; }
    function insertTable() {
      var th = '<th>Heading</th><th>Heading</th><th>Heading</th>', td = '<td><br></td><td><br></td><td><br></td>';
      insertBlock('<table class="be-table"><thead><tr>' + th + '</tr></thead><tbody><tr>' + td + '</tr><tr>' + td + '</tr></tbody></table>', function (t) { return $('th', t); });
    }
    function insertNote() { insertBlock('<aside class="be-note"><p><b>Tip:</b>&nbsp;</p></aside>', function (n) { return $('p', n); }); }
    function askVideo(at) {
      openAsk({ title: 'Add a YouTube video', at: at, ok: 'Add video', fields: [{ n: 'url', label: 'YouTube link', ph: 'https://www.youtube.com/watch?v=…' }],
        onOk: function (v) { var m = v.url.match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/); if (!m) return 'Paste a YouTube link, like youtube.com/watch?v=… or youtu.be/…'; insertBlock(videoFig(m[1])); } });
    }
    function askButton(at, el) {
      openAsk({ title: el ? 'Edit button' : 'Add a button', at: at, ok: el ? 'Save' : 'Add button',
        fields: [{ n: 'label', label: 'Button text', v: el ? el.dataset.label : '', ph: 'e.g. Shop the sale' }, { n: 'url', label: 'Opens', v: el ? el.dataset.href : '', ph: 'https://… or /top-deals' }],
        onOk: function (v) {
          if (!v.label) return 'Add the button text.'; var u = v.url; if (!u) return 'Add where the button goes.'; if (!/^(https?:\/\/|\/)/i.test(u)) u = 'https://' + u;
          if (el) { var t = document.createElement('div'); t.innerHTML = ctaBlock(v.label, u); el.replaceWith(t.firstChild); A.icons(); } else insertBlock(ctaBlock(v.label, u));
        } });
    }
    function askImage(fig) {
      var i = $('img', fig);
      openAsk({ title: 'Image', at: fig.getBoundingClientRect(), ok: 'Save',
        fields: [{ n: 'alt', label: 'Alt text (what the image shows)', v: i.getAttribute('alt') || '', ph: 'e.g. Puma running shoe, side view' },
                 { n: 'size', label: 'Size', type: 'seg', v: fig.dataset.size || 'full', opts: [['full', 'Full width'], ['left', 'Left, text beside'], ['right', 'Right, text beside']] }],
        onOk: function (v) { i.setAttribute('alt', v.alt); fig.classList.toggle('is-noalt', !v.alt); fig.dataset.size = v.size || 'full'; fig.className = fig.className.replace(/be-img--\w+/, 'be-img--' + fig.dataset.size); } });
    }

    // --- deals: the full "Choose a deal" window (several at once)
    function addDeals(replacing) {
      keepRange();
      A.chooser({ multi: !replacing, title: replacing ? 'Swap this deal' : 'Insert deals', filter: function (d) { return d.status === 'live'; }, selected: replacing ? [replacing.dataset.deal] : [],
        opener: $('[data-bdeal-btn]'),
        onUse: function (ds) {
          if (!ds.length) return;
          if (replacing) { var t = document.createElement('div'); t.innerHTML = dealCard(ds[0].id); replacing.replaceWith(t.firstChild); A.icons(); touch(); dealsSide(); toast('Deal swapped'); return; }
          ds.forEach(function (d) { insertBlock(dealCard(d.id)); keepRange(); });
          toast(ds.length === 1 ? 'Deal added. Its price stays live on the post.' : ds.length + ' deals added. Their prices stay live on the post.');
        } });
    }

    // --- toolbar
    // lists built by hand: the browser's list command nests lists inside paragraphs
    function toggleList(tag) {
      restore(); var sel = getSelection(); if (!sel.rangeCount) return; var r = sel.getRangeAt(0);
      var a = topOf(r.startContainer), z = topOf(r.endContainer); if (!a) return;
      if (/^(UL|OL)$/.test(a.nodeName) && a === z) {
        if (a.nodeName.toLowerCase() === tag) { var first = null; Array.prototype.slice.call(a.children).forEach(function (li) { var pp = document.createElement('p'); pp.innerHTML = li.innerHTML || '<br>'; a.parentNode.insertBefore(pp, a); first = first || pp; }); a.remove(); if (first) caretIn(first, true); }
        else { var nl = document.createElement(tag); nl.innerHTML = a.innerHTML; a.replaceWith(nl); caretIn(nl.lastElementChild, true); }
        touch(); return;
      }
      var blocks = [], n = a; while (n) { if (isPara(n) || /^(H2|H3|H4)$/.test(n.nodeName)) blocks.push(n); if (n === z) break; n = n.nextElementSibling; }
      if (!blocks.length) return;
      var l = document.createElement(tag); blocks[0].parentNode.insertBefore(l, blocks[0]);
      blocks.forEach(function (bk) { var li = document.createElement('li'); li.innerHTML = bk.innerHTML || '<br>'; l.appendChild(li); bk.remove(); });
      caretIn(l.lastElementChild, true); touch();
    }
    var CMDS = { undo: 'undo', redo: 'redo', bold: 'bold', italic: 'italic', underline: 'underline', strike: 'strikeThrough', left: 'justifyLeft', center: 'justifyCenter', right: 'justifyRight' };
    function run(c, btn) {
      var at = btn ? btn.getBoundingClientRect() : null;
      if (c === 'ul' || c === 'ol') return toggleList(c);
      if (CMDS[c]) return exec(CMDS[c]);
      if (c === 'clear') { exec('removeFormat'); exec('formatBlock', '<p>'); return; }
      if (/^(p|h2|h3|h4|blockquote)$/.test(c)) return exec('formatBlock', '<' + c + '>');
      if (c === 'link') return openLink();
      if (c === 'table') return insertTable();
      if (c === 'note') return insertNote();
      if (c === 'hr') return insertBlock('<hr>');
      if (c === 'video') return askVideo(at);
      if (c === 'button') return askButton(at);
      if (c === 'image') return $('[data-bimg]').click();
      if (c === 'deal') return addDeals(null);
    }
    $$('[data-bcmd]').forEach(function (b) { b.addEventListener('mousedown', function (e) { e.preventDefault(); }); b.addEventListener('click', function () { run(b.dataset.bcmd, b); }); });
    var blockSel = $('[data-bblock]');
    blockSel.addEventListener('change', function () { exec('formatBlock', '<' + blockSel.value + '>'); });
    function syncBar() {
      var s = getSelection(); if (!s.rangeCount || !inBody(s.anchorNode)) return;
      ['bold', 'italic', 'underline', 'strikeThrough'].forEach(function (c) { var b = $('[data-bcmd="' + (c === 'strikeThrough' ? 'strike' : c) + '"]'); if (b) b.setAttribute('aria-pressed', String(document.queryCommandState(c))); });
      var bl = blockOf(s.anchorNode), tag = bl ? bl.nodeName.toLowerCase() : 'p'; if (bl && bl.closest('blockquote')) tag = 'blockquote';
      blockSel.value = /^(h2|h3|h4|blockquote)$/.test(tag) ? tag : 'p';
    }
    $('[data-bimg]').addEventListener('change', function (e) { var f = e.target.files[0]; if (!f) return; readImg(f, function (src) { addImage(src, ''); }); e.target.value = ''; });

    // --- floating bar on selected text
    var fb = document.createElement('div'); fb.className = 'be-float'; fb.hidden = true; fb.setAttribute('role', 'toolbar'); fb.setAttribute('aria-label', 'Format selection');
    fb.innerHTML = [['bold', 'bold', 'Bold'], ['italic', 'italic', 'Italic'], ['underline', 'underline', 'Underline'], ['link', 'link', 'Link'], ['h2', 'heading-2', 'Heading'], ['h3', 'heading-3', 'Subheading'], ['blockquote', 'text-quote', 'Quote']].map(function (x) { return '<button type="button" data-fcmd="' + x[0] + '" aria-label="' + x[2] + '" title="' + x[2] + '"><i data-lucide="' + x[1] + '"></i></button>'; }).join('');
    document.body.appendChild(fb);
    fb.addEventListener('mousedown', function (e) { e.preventDefault(); });
    fb.addEventListener('click', function (e) { var b = e.target.closest('[data-fcmd]'); if (b) run(b.dataset.fcmd, b); });
    function floatBar() {
      var s = getSelection();
      if (!s.rangeCount || s.isCollapsed || !inBody(s.anchorNode) || !ask.hidden || !$('[data-bpv]').hidden) { fb.hidden = true; return; }
      var r = s.getRangeAt(0).getBoundingClientRect(); if (!r.width) { fb.hidden = true; return; }
      fb.hidden = false; fb.style.left = Math.max(8, Math.min(r.left + r.width / 2 - fb.offsetWidth / 2, innerWidth - fb.offsetWidth - 8)) + 'px'; fb.style.top = Math.max(8, r.top - fb.offsetHeight - 8) + 'px';
    }
    window.addEventListener('scroll', function () { fb.hidden = true; tb.hidden = true; }, { passive: true });

    // --- table tools when the caret is in a table
    var tb = document.createElement('div'); tb.className = 'be-float be-tbar'; tb.hidden = true; tb.setAttribute('role', 'toolbar'); tb.setAttribute('aria-label', 'Table');
    tb.innerHTML = '<button type="button" data-t="row">+ Row</button><button type="button" data-t="col">+ Column</button><button type="button" data-t="delrow">− Row</button><button type="button" data-t="delcol">− Column</button><button type="button" data-t="del" class="danger">Delete table</button>';
    document.body.appendChild(tb);
    tb.addEventListener('mousedown', function (e) { e.preventDefault(); });
    function curCell() { var s = getSelection(); var n = s.rangeCount ? s.anchorNode : null; n = n && (n.nodeType === 1 ? n : n.parentElement); return n && inBody(n) ? n.closest('td,th') : null; }
    function tableBar() {
      var c = curCell(); if (!c) { tb.hidden = true; return; }
      var t = c.closest('table'), r = t.getBoundingClientRect(); tb.hidden = false; tb.style.left = Math.max(8, r.left) + 'px'; tb.style.top = Math.max(8, r.top - tb.offsetHeight - 6) + 'px';
    }
    tb.addEventListener('click', function (e) {
      var b = e.target.closest('[data-t]'); if (!b) return; var c = curCell(); if (!c) return; var t = c.closest('table'), tr = c.parentNode, idx = Array.prototype.indexOf.call(tr.children, c), k = b.dataset.t;
      if (k === 'row') { var nr = document.createElement('tr'); for (var i = 0; i < tr.children.length; i++) nr.insertAdjacentHTML('beforeend', '<td><br></td>'); (tr.parentNode.nodeName === 'THEAD' ? $('tbody', t) : tr.parentNode).insertBefore(nr, tr.parentNode.nodeName === 'THEAD' ? $('tbody', t).firstChild : tr.nextSibling); caretIn(nr.firstChild); }
      if (k === 'col') $$('tr', t).forEach(function (row) { var ref = row.children[idx]; var n = document.createElement(row.parentNode.nodeName === 'THEAD' ? 'th' : 'td'); n.innerHTML = row.parentNode.nodeName === 'THEAD' ? 'Heading' : '<br>'; ref.after(n); });
      if (k === 'delrow') { if (tr.parentNode.nodeName === 'THEAD' || $$('tbody tr', t).length < 2) { toast('A table keeps its heading row and at least one row.', { icon: 'info' }); return; } var nx = tr.nextElementSibling || tr.previousElementSibling; tr.remove(); if (nx) caretIn(nx.firstElementChild); }
      if (k === 'delcol') { if (tr.children.length < 2) { toast('A table keeps at least one column.', { icon: 'info' }); return; } $$('tr', t).forEach(function (row) { if (row.children[idx]) row.children[idx].remove(); }); caretIn($('th,td', t)); }
      if (k === 'del') { var nx2 = t.nextElementSibling; t.remove(); tb.hidden = true; if (nx2) caretIn(nx2); }
      touch(); tableBar();
    });

    // --- "/" block menu and typing shortcuts
    var SLASH = [['h2', 'Heading', 'heading-2', 'big section title'], ['h3', 'Subheading', 'heading-3', ''], ['h4', 'Small heading', 'heading-4', ''], ['ul', 'Bullet list', 'list', ''], ['ol', 'Numbered list', 'list-ordered', ''],
      ['blockquote', 'Quote', 'text-quote', ''], ['note', 'Note box', 'sticky-note', 'tip or warning'], ['table', 'Table', 'table', 'specs, comparisons'], ['hr', 'Divider', 'minus', ''], ['image', 'Image', 'image', 'upload'],
      ['video', 'YouTube video', 'youtube', ''], ['button', 'Button', 'mouse-pointer-click', 'link that stands out'], ['deal', 'Deals', 'tag', 'live deal cards']];
    var sm = document.createElement('div'); sm.className = 'popover be-slash'; sm.hidden = true; sm.setAttribute('role', 'listbox'); sm.setAttribute('aria-label', 'Insert a block'); document.body.appendChild(sm);
    var smItems = [], smI = 0, smBlock = null;
    function slashCheck() {
      var s = getSelection(); var bl = s.rangeCount ? blockOf(s.anchorNode) : null;
      var m = isPara(bl) ? bl.textContent.match(/^\/([\w ]{0,20})$/) : null;
      if (!m) { sm.hidden = true; smBlock = null; return; }
      var q = m[1].toLowerCase(); smItems = SLASH.filter(function (x) { return !q || (x[1] + ' ' + x[3]).toLowerCase().indexOf(q) > -1; }); smI = 0; smBlock = bl;
      if (!smItems.length) { sm.innerHTML = '<div class="be-slash-none">No block called “' + esc(q) + '”</div>'; } else drawSlash();
      sm.hidden = false; var r = bl.getBoundingClientRect(); sm.style.left = r.left + 'px'; sm.style.top = (r.bottom + 6 + sm.offsetHeight > innerHeight ? r.top - sm.offsetHeight - 6 : r.bottom + 6) + 'px';
    }
    function drawSlash() { sm.innerHTML = smItems.map(function (x, i) { return '<button type="button" role="option" data-slash="' + x[0] + '" aria-selected="' + (i === smI) + '"><i data-lucide="' + x[2] + '"></i><span><b>' + x[1] + '</b>' + (x[3] ? '<small>' + x[3] + '</small>' : '') + '</span></button>'; }).join(''); A.icons(); var on = $('[aria-selected="true"]', sm); if (on) on.scrollIntoView({ block: 'nearest' }); }
    function pickSlash(k) { var bl = smBlock; sm.hidden = true; smBlock = null; if (!bl) return; bl.innerHTML = '<br>'; caretIn(bl); keepRange(); run(k, null); }
    sm.addEventListener('mousedown', function (e) { e.preventDefault(); });
    sm.addEventListener('click', function (e) { var b = e.target.closest('[data-slash]'); if (b) pickSlash(b.dataset.slash); });
    body.addEventListener('keydown', function (e) {
      if (!sm.hidden && smItems.length) {
        if (e.key === 'ArrowDown') { e.preventDefault(); smI = (smI + 1) % smItems.length; drawSlash(); return; }
        if (e.key === 'ArrowUp') { e.preventDefault(); smI = (smI - 1 + smItems.length) % smItems.length; drawSlash(); return; }
        if (e.key === 'Enter') { e.preventDefault(); pickSlash(smItems[smI][0]); return; }
      }
      if (e.key === 'Escape' && !sm.hidden) { e.stopPropagation(); sm.hidden = true; return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openLink(); return; }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); toast('Saved'); return; }
      var s = getSelection(), bl = s.rangeCount ? blockOf(s.anchorNode) : null;
      if (e.key === ' ' && isPara(bl)) {
        var t = bl.textContent, map = { '#': 'h2', '##': 'h2', '###': 'h3', '####': 'h4', '>': 'blockquote', '-': 'ul', '*': 'ul', '1.': 'ol' };
        if (map[t]) { e.preventDefault(); bl.innerHTML = '<br>'; caretIn(bl); keepRange(); run(map[t]); }
      }
      if (e.key === 'Enter' && isPara(bl) && bl.textContent === '---') { e.preventDefault(); bl.innerHTML = '<br>'; caretIn(bl); keepRange(); insertBlock('<hr>'); }
    });
    body.addEventListener('input', slashCheck);

    // --- paste: images become image blocks; text from Docs/Word keeps headings, lists, bold, links and tables, and drops the rest
    var KEEP = { P: 1, H2: 1, H3: 1, H4: 1, STRONG: 1, B: 1, EM: 1, I: 1, U: 1, S: 1, A: 1, UL: 1, OL: 1, LI: 1, BLOCKQUOTE: 1, BR: 1, TABLE: 1, THEAD: 1, TBODY: 1, TR: 1, TH: 1, TD: 1, HR: 1 };
    function clean(h) {
      var t = document.createElement('div'); t.innerHTML = h.replace(/<!--[\s\S]*?-->/g, '');
      $$('script,style,meta,link,title,img,svg,iframe,object', t).forEach(function (n) { n.remove(); });
      (function walk(n) {
        Array.prototype.slice.call(n.childNodes).forEach(function (c) {
          if (c.nodeType !== 1) return; walk(c);
          var tag = c.nodeName === 'H1' ? 'H2' : /^H[5-6]$/.test(c.nodeName) ? 'H4' : c.nodeName === 'DIV' ? 'P' : c.nodeName;
          if (!KEEP[tag]) { while (c.firstChild) c.parentNode.insertBefore(c.firstChild, c); c.remove(); return; }
          var x = c; if (tag !== c.nodeName) { x = document.createElement(tag); while (c.firstChild) x.appendChild(c.firstChild); c.replaceWith(x); }
          var href = x.getAttribute('href'); Array.prototype.slice.call(x.attributes).forEach(function (a) { x.removeAttribute(a.name); });
          if (tag === 'A' && href && /^https?:\/\//i.test(href)) { x.setAttribute('href', href); linkAttrs(x, true); } else if (tag === 'A') { while (x.firstChild) x.parentNode.insertBefore(x.firstChild, x); x.remove(); }
          if (tag === 'TABLE') x.className = 'be-table';
        });
      })(t);
      return t.innerHTML;
    }
    body.addEventListener('paste', function (e) {
      var cd = e.clipboardData || window.clipboardData, files = cd && cd.files ? Array.prototype.slice.call(cd.files).filter(function (f) { return /^image\//.test(f.type); }) : [];
      if (e.target.closest && e.target.closest('figcaption')) { e.preventDefault(); document.execCommand('insertText', false, cd.getData('text/plain')); return; }
      e.preventDefault();
      if (files.length) { files.forEach(function (f) { readImg(f, function (src) { addImage(src, ''); }); }); return; }
      var h = cd.getData('text/html');
      if (h) document.execCommand('insertHTML', false, clean(h)); else document.execCommand('insertText', false, cd.getData('text/plain'));
      touch(); dealsSide();
    });
    body.addEventListener('dragover', function (e) { e.preventDefault(); });
    body.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) { e.preventDefault(); readImg(f, function (src) { addImage(src, ''); }); } });

    // --- block card buttons (remove with undo, edit, swap)
    body.addEventListener('click', function (e) {
      var x = e.target.closest('[data-deal-x],[data-img-x],[data-blk-x]');
      if (x) { var blk = x.closest('.be-deal,.be-img,.be-video,.be-cta'), next = blk.nextSibling, par = blk.parentNode; blk.remove(); touch(); dealsSide(); toast('Removed', { icon: 'trash-2', action: 'Undo', onAction: function () { par.insertBefore(blk, next); touch(); dealsSide(); } }); return; }
      var ie = e.target.closest('[data-img-edit]'); if (ie) { askImage(ie.closest('.be-img')); return; }
      var ce = e.target.closest('[data-cta-edit]'); if (ce) { var c = ce.closest('.be-cta'); askButton(c.getBoundingClientRect(), c); return; }
      var ch = e.target.closest('[data-deal-change]'); if (ch) { addDeals(ch.closest('.be-deal')); }
    });

    // --- words, read time, outline
    function stats() {
      var words = (body.innerText || '').split(/\s+/).filter(function (w) { return /[\wऀ-ॿ₹]/.test(w); }).length;
      $('[data-bwords]').textContent = words + ' word' + (words === 1 ? '' : 's') + ' · ' + Math.max(1, Math.round(words / 200)) + ' min read';
      var hs = $$('h2,h3,h4', body).filter(function (h) { return h.textContent.trim(); });
      $('[data-boutline-n]').textContent = hs.length;
      var ol = $('[data-boutline]'); if (!ol.hidden) ol.innerHTML = hs.length ? hs.map(function (h, i) { return '<li class="o-' + h.nodeName.toLowerCase() + '"><button type="button" data-oi="' + i + '">' + esc(h.textContent.trim()) + '</button></li>'; }).join('') : '<li class="none">Add headings (type ## and a space) to build the outline.</li>';
      // empty paragraph hint
      $$('[data-ph-empty]', body).forEach(function (n) { n.removeAttribute('data-ph-empty'); });
      var only = body.children.length === 1 && body.firstElementChild.nodeName === 'P' && !body.textContent.trim(); if (only) body.firstElementChild.setAttribute('data-ph-empty', '');
    }
    $('[data-boutline-btn]').addEventListener('click', function (e) { var ol = $('[data-boutline]'); ol.hidden = !ol.hidden; e.currentTarget.setAttribute('aria-expanded', String(!ol.hidden)); stats(); });
    $('[data-boutline]').addEventListener('click', function (e) { var b = e.target.closest('[data-oi]'); if (!b) return; var h = $$('h2,h3,h4', body).filter(function (x) { return x.textContent.trim(); })[+b.dataset.oi]; if (h) { h.scrollIntoView({ block: 'center', behavior: 'smooth' }); caretIn(h, true); } });
    body.addEventListener('input', stats);

    // --- preview: the post as readers see it, desktop or phone
    function readerHTML() {
      var t = document.createElement('div'); t.innerHTML = serial();
      $$('div[data-deal]', t).forEach(function (n) { var d = dealById(n.getAttribute('data-deal')); var x = document.createElement('div'); x.innerHTML = d ? '<div class="pv-deal"><img src="' + d.img + '" alt=""><div><small>' + esc(d.store) + ' · ' + d.pct + '% off</small><b>' + esc(d.t) + '</b><span><b>' + A.rs(d.p) + '</b> <s>' + A.rs(d.m) + '</s></span></div><span class="be-pv-buy">Buy now</span></div>' : ''; n.replaceWith(x.firstChild || document.createTextNode('')); });
      $$('figure[data-img]', t).forEach(function (f) { var x = document.createElement('figure'); x.className = 'post-fig post-fig--' + (f.getAttribute('data-size') || 'full'); x.innerHTML = '<img src="' + f.getAttribute('data-img') + '" alt="' + esc(f.getAttribute('data-alt') || '') + '">' + (f.getAttribute('data-cap') ? '<figcaption>' + esc(f.getAttribute('data-cap')) + '</figcaption>' : ''); f.replaceWith(x); });
      $$('figure[data-yt]', t).forEach(function (f) { var x = document.createElement('div'); x.className = 'post-video'; x.innerHTML = '<img src="https://i.ytimg.com/vi/' + esc(f.getAttribute('data-yt')) + '/hqdefault.jpg" alt=""><span class="be-play"><i data-lucide="play"></i></span>'; f.replaceWith(x); });
      $$('div[data-cta-href]', t).forEach(function (f) { var x = document.createElement('p'); x.className = 'post-cta'; x.innerHTML = '<a href="#" class="pv-cta">' + esc(f.getAttribute('data-cta-label')) + ' →</a>'; f.replaceWith(x); });
      return t.innerHTML;
    }
    function showPreview(on) {
      $('[data-bpv]').hidden = !on; body.hidden = on; $('[data-bbar]').classList.toggle('is-preview', on); fb.hidden = true; tb.hidden = true;
      $$('[data-bmode]').forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.bmode === 'preview') === on)); });
      if (!on) { body.focus(); return; }
      var cover = coverImg ? '<img class="pv-cover" src="' + coverImg + '" alt="">' : '';
      $('[data-bpv-post]').innerHTML = '<p class="pv-kicker">Blog · ' + esc(F.cat.value || '') + '</p><h1>' + (esc(F.title.value.trim()) || '<span class="miss">Add a title</span>') + '</h1><p class="pv-lead">' + esc(F.summary.value.trim()) + '</p><p class="pv-by">OfferTag · ' + $('[data-bwords]').textContent.split('·')[1].trim() + '</p>' + cover + '<div class="be-pv-body">' + readerHTML() + '</div>';
      A.icons();
    }
    $$('[data-bmode]').forEach(function (b) { b.addEventListener('click', function () { showPreview(b.dataset.bmode === 'preview'); }); });
    $$('[data-bdev]').forEach(function (b) { b.addEventListener('click', function () { $$('[data-bdev]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); }); $('[data-bpv-frame]').classList.toggle('is-phone', b.dataset.bdev === 'phone'); }); });

    // --- before publishing: things worth fixing (shown inside the one Publish confirm, never a second dialog)
    function warnings() {
      var w = [], noAlt = $$('.be-img', body).filter(function (f) { return !$('img', f).getAttribute('alt'); }).length;
      if (noAlt) w.push(noAlt + ' image' + (noAlt > 1 ? 's have' : ' has') + ' no alt text');
      var words = (body.innerText || '').split(/\s+/).filter(Boolean).length;
      if (words > 250 && !$('h2', body)) w.push('no headings, so the post is one long block');
      if ($$('h2,h3,h4', body).some(function (h) { return !h.textContent.trim(); })) w.push('an empty heading');
      return w;
    }
    function closeFloating() { if (!sm.hidden) { sm.hidden = true; return true; } if (closeAsk(true)) return true; if (!$('[data-bpv]').hidden) { showPreview(false); return true; } return false; }

    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !body.contains(e.target)) { e.preventDefault(); save(); toast('Saved'); } });

    // validation + publish / schedule
    function check() {
      var bad = [];
      if (!F.title.value.trim()) { err(F.title, 'Add a title.'); bad.push(F.title); }
      if (!F.summary.value.trim()) { err(F.summary, 'Add a one-line summary.'); bad.push(F.summary); }
      if (!F.slug.value.trim() && F.title.value.trim()) F.slug.value = slugify(F.title.value);
      var sl = F.slug.value.trim();
      if (!sl) { /* address follows the title; the title error covers it */ }
      else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(sl)) { err(F.slug, 'Use lowercase letters, numbers and dashes.'); bad.push(F.slug); }
      else if (load().some(function (p) { return p.name === sl && p.name !== post.name; })) { err(F.slug, 'Another post uses this address.'); bad.push(F.slug); }
      if (!body.textContent.trim() && !$('.be-deal', body)) { $('[data-bbody-err]').hidden = false; bad.push(body); }
      if (bad.length) { if (bad.some(function (b) { return b === F.slug; }) && innerWidth < 900) openSide(); bad[0].focus(); bad[0].scrollIntoView({ block: 'center' }); }
      return !bad.length;
    }
    function rename() { var sl = F.slug.value.trim(); if (post.name && sl !== post.name && post.status !== 'published') { drop(post.name); post.name = sl; try { history.replaceState(null, '', A.withRole(A.routes.blogEdit(sl))); } catch (e) {} } }
    $('[data-bpublish]').addEventListener('click', function () {
      if (!check()) return;
      if (post.status === 'published') { save(); var w0 = warnings(); toast(w0.length ? 'Post updated. Worth fixing: ' + w0.join('; ') + '.' : 'Post updated on the blog', w0.length ? { icon: 'triangle-alert', ms: 6000 } : publicHref(post) ? { action: 'View', href: publicHref(post) } : {}); return; }
      rename();
      var w = warnings();
      A.confirmBox(w.length ? 'Publish with ' + w.length + ' thing' + (w.length > 1 ? 's' : '') + ' to check?' : 'Publish now?', (w.length ? 'Worth fixing first: ' + w.join('; ') + '. ' : '') + 'It goes live at offertag.in/blog/' + F.slug.value.trim() + ' and shows first on the blog.', w.length ? 'Publish anyway' : 'Publish', function () {
        var prev = { status: post.status, date: post.date, time: post.time };
        post.status = 'published'; post.date = today(); post.time = ''; save(); setState();
        toast('Published', { action: 'Undo', onAction: function () { Object.assign(post, prev); save(); setState(); } });
      });
    });
    var sp = $('[data-bsched]'), sb = $('[data-bsched-btn]'), sat = $('[data-bsched-at]');
    sb.addEventListener('click', function (e) { e.stopPropagation(); var open = sp.hidden; sp.hidden = !open; sb.setAttribute('aria-expanded', open); if (open) { var t = new Date(Date.now() + 864e5); t.setHours(9, 0, 0, 0); sat.min = new Date(Date.now() - new Date().getTimezoneOffset() * 6e4).toISOString().slice(0, 16); if (!sat.value) sat.value = new Date(t - t.getTimezoneOffset() * 6e4).toISOString().slice(0, 16); sat.focus(); } });
    $('[data-bsched-cancel]').addEventListener('click', function () { sp.hidden = true; sb.setAttribute('aria-expanded', 'false'); sb.focus(); });
    document.addEventListener('click', function (e) { if (!sp.hidden && !sp.contains(e.target) && e.target !== sb) { sp.hidden = true; sb.setAttribute('aria-expanded', 'false'); } });
    $('[data-bsched-go]').addEventListener('click', function () {
      var v = sat.value; if (!v || new Date(v) <= new Date()) { err(sat, 'Pick a time in the future.'); sat.focus(); return; } clearErr(sat);
      sp.hidden = true; if (!check()) return; rename();
      var prev = { status: post.status, date: post.date, time: post.time };
      post.status = 'scheduled'; post.date = v.slice(0, 10); post.time = v.slice(11, 16); save(); setState();
      toast('Scheduled for ' + fmtDate(post.date, post.time), { icon: 'calendar-clock', action: 'Undo', onAction: function () { Object.assign(post, prev); save(); setState(); } });
    });
    $('[data-bpreview]').addEventListener('click', function (e) { if (!publicHref(post)) { e.preventDefault(); toast('Publish the post first; the preview opens it as readers see it.', { icon: 'info', ms: 5000 }); } });

    // phone: settings as a sheet (§3)
    var side = $('[data-bside]');
    function openSide() { document.documentElement.classList.add('bset-open'); var b = $('[data-bside-close]'); if (b) b.focus(); }
    function closeSide() { document.documentElement.classList.remove('bset-open'); $('[data-bsettings]').focus(); }
    $('[data-bsettings]').addEventListener('click', openSide); $('[data-bside-close]').addEventListener('click', closeSide);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (document.documentElement.classList.contains('dc-open')) return; if (closeFloating()) {} else if (!sp.hidden) { sp.hidden = true; sb.focus(); } else if (document.documentElement.classList.contains('bset-open')) closeSide(); } });

    setState(); dealsSide(); stats(); A.icons();
    if (isNew) F.title.focus();
  })();
})();
