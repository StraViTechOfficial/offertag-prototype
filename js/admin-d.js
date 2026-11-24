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
    function imgFig(src, alt) { return '<figure class="be-img" contenteditable="false"><img src="' + src + '" alt="' + esc(alt || '') + '"><button class="btn btn-ghost btn-icon btn-sm" type="button" data-img-x aria-label="Remove image"><i data-lucide="x"></i></button></figure>'; }
    function fromBlocks(bs) { return (bs || []).map(function (b) { return b.p != null ? '<p>' + (esc(b.p) || '<br>') + '</p>' : b.h ? '<h2>' + esc(b.h) + '</h2>' : b.deal ? dealCard(b.deal) : b.img ? imgFig(b.img, b.alt) : ''; }).join(''); }
    function hydrate(html) { return html.replace(/<div data-deal="([^"]+)"><\/div>/g, function (m, id) { return dealCard(id); }).replace(/<figure data-img="([^"]+)" data-alt="([^"]*)"><\/figure>/g, function (m, s, a) { return imgFig(s, a); }); }
    function serial() {
      var c = body.cloneNode(true);
      $$('.be-deal', c).forEach(function (n) { var x = document.createElement('div'); x.setAttribute('data-deal', n.dataset.deal); n.replaceWith(x); });
      $$('.be-img', c).forEach(function (n) { var x = document.createElement('figure'); var i = $('img', n); x.setAttribute('data-img', i.getAttribute('src')); x.setAttribute('data-alt', i.getAttribute('alt') || ''); n.replaceWith(x); });
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
    setInterval(function () { if (dirty && (F.title.value.trim() || body.textContent.trim())) save(true); else tick(); }, 10000);
    setInterval(tick, 1000);
    window.addEventListener('beforeunload', function (e) { if (dirty) { save(true); } });
    $('[data-bsaved]').textContent = isNew ? 'Not saved yet' : post.status === 'draft' ? 'Draft, edited ' + (post.edited || 'earlier') : 'Saved';

    F.title.addEventListener('input', function () { if (!slugTouched && post.status !== 'published') F.slug.value = slugify(F.title.value); clearErr(F.title); touch(); });
    F.slug.addEventListener('input', function () { slugTouched = true; clearErr(F.slug); touch(); });
    F.summary.addEventListener('input', function () { $('[data-bsum-n]').textContent = F.summary.value.length; clearErr(F.summary); touch(); });
    $('[data-bsum-n]').textContent = F.summary.value.length;
    [F.seo, F.meta, F.cat].forEach(function (i) { i.addEventListener('input', touch); i.addEventListener('change', touch); });
    body.addEventListener('input', function () { $('[data-bbody-err]').hidden = true; touch(); dealsSide(); });
    function clearErr(i) { i.removeAttribute('aria-invalid'); var e = $('.err', i.closest('.fld')); if (e) e.hidden = true; }
    function err(i, msg) { i.setAttribute('aria-invalid', 'true'); var e = $('.err', i.closest('.fld')); if (e) { e.textContent = msg; e.hidden = false; } }

    // toolbar
    var lastRange = null;
    function keepRange() { var s = getSelection(); if (s.rangeCount && body.contains(s.anchorNode)) lastRange = s.getRangeAt(0).cloneRange(); }
    document.addEventListener('selectionchange', keepRange);
    function restore() { body.focus(); if (lastRange) { var s = getSelection(); s.removeAllRanges(); s.addRange(lastRange); } }
    $$('[data-bcmd]').forEach(function (b) {
      b.addEventListener('mousedown', function (e) { e.preventDefault(); });
      b.addEventListener('click', function () {
        restore(); var c = b.dataset.bcmd;
        if (c === 'h2' || c === 'h3' || c === 'p') document.execCommand('formatBlock', false, '<' + c + '>');
        else if (c === 'createLink') { var u = prompt('Link address (https://…)'); if (u) { if (!/^https?:\/\//i.test(u)) u = 'https://' + u; document.execCommand('createLink', false, u); } }
        else document.execCommand(c);
        touch();
      });
    });
    function insertBlock(html) {
      restore(); var s = getSelection(), node = s.rangeCount ? s.anchorNode : null;
      while (node && node.parentNode !== body) node = node.parentNode;
      var tmp = document.createElement('div'); tmp.innerHTML = html; var el = tmp.firstChild;
      if (node && node.nextSibling) body.insertBefore(el, node.nextSibling); else body.appendChild(el);
      if (!el.nextSibling || el.nextSibling.nodeName !== 'P') { var p = document.createElement('p'); p.innerHTML = '<br>'; body.insertBefore(p, el.nextSibling); }
      if (node && node.nodeName === 'P' && !node.textContent.trim() && !node.querySelector('img')) node.remove();
      var r = document.createRange(); r.setStart(el.nextSibling, 0); r.collapse(true); s.removeAllRanges(); s.addRange(r);
      A.icons(); touch(); dealsSide(); return el;
    }
    function readImg(file, cb) { var r = new FileReader(); r.onload = function () { if (window.OTDB) OTDB.shrink(r.result, cb, 900); else cb(r.result); }; r.readAsDataURL(file); }
    $('[data-bimg]').addEventListener('change', function (e) { var f = e.target.files[0]; if (!f) return; readImg(f, function (src) { insertBlock(imgFig(src, f.name.replace(/\.[a-z]+$/i, '').replace(/[-_]/g, ' '))); toast('Image added. Write its description in the settings later.', { icon: 'image' }); }); e.target.value = ''; });
    body.addEventListener('paste', function (e) {
      var cd = e.clipboardData || window.clipboardData, files = cd && cd.files ? Array.prototype.slice.call(cd.files).filter(function (f) { return /^image\//.test(f.type); }) : [];
      e.preventDefault();
      if (files.length) { files.forEach(function (f) { readImg(f, function (src) { insertBlock(imgFig(src, '')); }); }); toast('Image pasted', { icon: 'image' }); return; }
      document.execCommand('insertText', false, cd.getData('text/plain'));
    });
    body.addEventListener('dragover', function (e) { e.preventDefault(); });
    body.addEventListener('drop', function (e) { var f = e.dataTransfer && e.dataTransfer.files[0]; if (f && /^image\//.test(f.type)) { e.preventDefault(); readImg(f, function (src) { insertBlock(imgFig(src, '')); }); } });
    body.addEventListener('click', function (e) {
      var x = e.target.closest('[data-deal-x],[data-img-x]'); if (x) { var blk = x.closest('.be-deal,.be-img'), next = blk.nextSibling, par = blk.parentNode; blk.remove(); touch(); dealsSide(); toast(x.matches('[data-deal-x]') ? 'Deal removed' : 'Image removed', { icon: 'trash-2', action: 'Undo', onAction: function () { par.insertBefore(blk, next); touch(); dealsSide(); } }); return; }
      var ch = e.target.closest('[data-deal-change]'); if (ch) { replacing = ch.closest('.be-deal'); openPick(ch); }
    });
    body.addEventListener('keydown', function (e) { if (e.key === 'Tab') return; if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') { e.preventDefault(); save(); toast('Saved'); } });
    document.addEventListener('keydown', function (e) { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && !body.contains(e.target)) { e.preventDefault(); save(); toast('Saved'); } });

    // deal picker (§3)
    var pick = $('#be-pick'), pq = $('[data-bpick-q]'), plist = $('[data-bpick-list]'), replacing = null, pickBtn = null;
    function drawPick() {
      var s = pq.value.trim().toLowerCase(), items = DEALS.filter(function (d) { return !s || (d.t + ' ' + d.link + ' ' + d.store).toLowerCase().indexOf(s) > -1; }).slice(0, 8);
      plist.innerHTML = items.map(function (d) { var gone = d.status === 'withdrawn' || d.status === 'rejected'; return '<li role="option" tabindex="-1" data-pick="' + d.id + '"' + (gone ? ' class="is-gone"' : '') + '><img src="' + d.img + '" alt=""><span>' + esc(d.t) + '</span><b>' + A.rs(d.p) + '</b>' + (gone ? '<small class="pill pill-withdrawn">Withdrawn</small>' : '') + '</li>'; }).join('') || '<li class="none">No deals match.</li>';
    }
    function openPick(btn) {
      keepRange(); pickBtn = btn; pq.value = ''; drawPick(); pick.hidden = false;
      var r = btn.getBoundingClientRect(), w = pick.offsetWidth; pick.style.position = 'fixed'; pick.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + 'px'; pick.style.top = Math.min(r.bottom + 6, innerHeight - pick.offsetHeight - 8) + 'px';
      requestAnimationFrame(function () { pick.dataset.state = 'open'; }); pq.focus();
    }
    function closePick(refocus) { if (pick.hidden) return; pick.dataset.state = 'closed'; pick.hidden = true; replacing = null; if (refocus && pickBtn) pickBtn.focus(); }
    $('[data-bdeal-btn]').addEventListener('mousedown', function (e) { e.preventDefault(); });
    $('[data-bdeal-btn]').addEventListener('click', function (e) { e.stopPropagation(); replacing = null; openPick(e.currentTarget); });
    $('[data-bpick-close]').addEventListener('click', function () { closePick(true); });
    pq.addEventListener('input', drawPick);
    pq.addEventListener('keydown', function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); var f = $('[role=option]', plist); if (f) f.focus(); } if (e.key === 'Enter') { e.preventDefault(); var f2 = $('[role=option]', plist); if (f2) f2.click(); } if (e.key === 'Escape') { e.stopPropagation(); closePick(true); } });
    plist.addEventListener('keydown', function (e) { var o = $$('[role=option]', plist), i = o.indexOf(document.activeElement); if (e.key === 'ArrowDown') { e.preventDefault(); if (o[i + 1]) o[i + 1].focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); (o[i - 1] || pq).focus(); } if (e.key === 'Enter') { e.preventDefault(); document.activeElement.click(); } if (e.key === 'Escape') closePick(true); });
    plist.addEventListener('click', function (e) {
      var li = e.target.closest('[data-pick]'); if (!li) return; var d = dealById(li.dataset.pick), rep = replacing; closePick();
      if (rep) { var t = document.createElement('div'); t.innerHTML = dealCard(d.id); rep.replaceWith(t.firstChild); A.icons(); touch(); dealsSide(); }
      else insertBlock(dealCard(d.id));
      if (d.status === 'withdrawn') toast('This deal is withdrawn. Readers will see “No longer available” in its place.', { icon: 'triangle-alert', ms: 6000 });
      else if (!rep) toast('Deal added. Its price stays live on the post.');
    });
    document.addEventListener('click', function (e) { if (!pick.hidden && !pick.contains(e.target) && !e.target.closest('[data-deal-change],[data-bdeal-btn]')) closePick(); });

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
      if (post.status === 'published') { save(); toast('Post updated on the blog', publicHref(post) ? { action: 'View', href: publicHref(post) } : {}); return; }
      rename();
      A.confirmBox('Publish now?', 'It goes live at offertag.in/blog/' + F.slug.value.trim() + ' and shows first on the blog.', 'Publish', function () {
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
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { if (!pick.hidden) closePick(true); else if (!sp.hidden) { sp.hidden = true; sb.focus(); } else if (document.documentElement.classList.contains('bset-open')) closeSide(); } });

    setState(); dealsSide(); A.icons();
    if (isNew) F.title.focus();
  })();
})();
