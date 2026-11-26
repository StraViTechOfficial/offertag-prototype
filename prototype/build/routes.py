# routes.py — S18 routing (D-105). Runs last, inside build.py's namespace.
# The build writes flat pages (fresh.html, admin-deals.html, deal-123.html …). This step moves every page to the folder of its
# real address (fresh.html → /fresh-deals/index.html), rewrites every link, asset path and script reference to root paths,
# adds the extra addresses one page answers to (tab routes, edit/clone routes), and deletes the flat files.
# Addresses come from the live code (`offer-tag/routes/web.php`) and the data sheets; new ones are logged in DEV-025.
# Route map for people: design-system/ia/routes.md.
import glob as _glob, re as _re, shutil as _shutil

R_MANIFEST = os.path.join(HERE, 'routes.json')
exec(open(os.path.join(HERE, 'theme_head.py')).read())  # D-150: add_theme()

# ---- 1. one address per flat page ----
ROUTE = {
    'index.html': '/',
    # deal types: /{dealType}, lookup name hyphenated (DealsController@dealPage; W05)
    'fresh.html': '/top-deals',  # D-114: Fresh renamed Top deals; /fresh-deals 301s here (dev); Top picks page removed
    'loot.html': '/loot-deals', 'new.html': '/new-deals', 'pantry.html': '/pantry-deals',
    'search.html': '/deals/search',
    'categories.html': '/categories', 'stores.html': '/stores',               # new (DEV-025)
    'login.html': '/login',   # forced re-login retired (D-106): no /relogin
    'account.html': '/user/profile', 'delete-account.html': '/delete-account',
    'contact.html': '/contact', 'privacy.html': '/privacy', 'disclaimer.html': '/disclaimer',
    'terms.html': '/terms', 'faq.html': '/faq',                               # new (DEV-020, DEV-025)
    'blog.html': '/blog',
    '403.html': '/forbidden', '404.html': '/404.html', '500.html': '/500.html', 'offline.html': '/offline',
    'email-otp.html': '/_design/email-otp', 'share-card.html': '/_design/share-card',
    # admin (routes/web.php admin group; new screens logged in DEV-025)
    'admin-login.html': '/admin/login',
    'admin.html': '/admin', 'admin-deals.html': '/admin/deal', 'admin-deal-view.html': '/admin/deal/' + str(ADM_ROWS[0]['id']), 'admin-post.html': '/admin/deal/create',
    'admin-pinned.html': '/admin/pinned', 'admin-incoming.html': '/admin/incoming', 'admin-alerts.html': '/admin/admin-notifications', 'admin-sponsored.html': '/admin/sponsored',
    'admin-social.html': '/admin/social', 'admin-tags.html': '/admin/settings/tags', 'admin-inbox.html': '/admin/feedback',
    'admin-site.html': '/admin/settings/site', 'admin-users.html': '/admin/users', 'admin-user.html': '/admin/users/1', 'admin-security.html': '/admin/security',
    'admin-catalogue.html': '/admin/shop', 'admin-blog.html': '/admin/blog', 'admin-blog-edit.html': '/admin/blog/create', 'admin-soon.html': '/admin/soon',
}
for d in deals + extras: ROUTE[d['page']] = d['slug'] if d['slug'].startswith('/deal/') else '/deal/' + d['slug'].lstrip('/')  # snapshot slug is the live path
for c in CATS: ROUTE[c['page']] = '/products/' + c['slug'] + '-deals'
for x in SHOPS:
    ROUTE[x['page']] = '/shops/' + x['slug']
    for c in CATS: ROUTE[f"store-{x['slug']}-{c['slug']}.html"] = f"/shops/{x['slug']}/{c['slug']}"
for p in BLOG_ADMIN:
    if p['status'] == 'published': ROUTE['blog-' + p['name'] + '.html'] = '/blog/' + p['name']

# tabbed admin pages answer to one address per tab (live names where they exist)
TABS = {
    'admin-inbox.html': ('data-itab', {'feedback': '/admin/feedback', 'deletion': '/admin/deletion-requests'}),   # 2026-11-25: no Reports; comments live on each deal's page (changes.md A-11)
    'admin-catalogue.html': ('data-ctab', {'shops': '/admin/shop', 'categories': '/admin/category', 'dealtypes': '/admin/lookup', 'types': '/admin/type'}),
}

# ---- 2. link rewriting ----
def url_for(fname, query='', frag=''):
    q = [kv for kv in query.lstrip('?').split('&') if kv] if query else []
    kv = dict(x.split('=', 1) if '=' in x else (x, '') for x in q)
    path = ROUTE[fname]
    if fname in TABS and kv.get('tab') in TABS[fname][1]: path = TABS[fname][1][kv.pop('tab')]
    elif fname == 'admin-post.html' and kv.get('id'): path = f"/admin/deal/{kv.pop('id')}/edit"
    elif fname == 'admin-blog-edit.html' and kv.get('post'): path = f"/admin/blog/{kv.pop('post')}/edit"
    rest = '&'.join(k + ('=' + v if v != '' else '') for k, v in kv.items())
    return path + ('?' + rest if rest else '') + frag

_LINK = _re.compile(r'''(?<![\w/.-])([a-z0-9][a-z0-9_-]*\.html)(\?[^"'\s#<>)]*)?(#[^"'\s<>)]*)?''')
_ASSET = _re.compile(r'''(?<=["'(=])(css|js|assets)/''')
_SCRIPT = _re.compile(r'<script src="(/js/[a-z0-9-]+\.js)"></script>')
PLAYGROUND = '<script src="/js/db.js"></script>\n<script src="/js/render.js"></script>\n<script src="/js/admin-db.js"></script>\n'
def playground(html):
    # S25 (plan.md Part B): the page's own scripts wait for the playground data (js/db.js starts them in order once it has drawn the page)
    if '/js/db.js' in html or not _SCRIPT.search(html): return html
    html = html.replace('<script src="/js/deals-index.js"></script>\n', '').replace('<script src="/js/deals-index.js"></script>', '')  # db.js sets OT_DEALS / OT_CAT from the data
    html = _SCRIPT.sub(lambda m: f'<script type="ot/defer" data-src="{m.group(1)}"></script>', html)
    i = html.index('<script type="ot/defer"')
    return html[:i] + PLAYGROUND + html[i:]
# S25 hosting (D-153): the shared UAT link must not be indexed, must not depend on a CDN at runtime, and needs a tab icon.
# Libraries and the Geist font are served from /vendor (copies of the exact versions the pages used); every page gets
# noindex + the icons. The same no-index rule is sent as a header by _headers and robots.txt (written below).
_VENDOR = (
    (_re.compile(r'<link rel="preconnect" href="https://fonts\.(?:googleapis|gstatic)\.com"[^>]*>\n?'), ''),
    (_re.compile(r'<link [^>]*href="https://fonts\.googleapis\.com/css2\?family=Geist[^"]*"[^>]*>'), '<link rel="stylesheet" href="/vendor/geist/geist.css">'),
    (_re.compile(r'https://cdn\.jsdelivr\.net/npm/lucide@0\.468\.0/dist/umd/lucide\.min\.js'), '/vendor/lucide.min.js'),
    (_re.compile(r'https://cdn\.jsdelivr\.net/npm/embla-carousel@8\.3\.0/embla-carousel\.umd\.js'), '/vendor/embla-carousel.umd.js'),
)
_HEAD_TAGS = ('<meta name="robots" content="noindex, nofollow">\n<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">\n'
              '<link rel="icon" href="/favicon.ico" sizes="any">\n<link rel="apple-touch-icon" href="/apple-touch-icon.png">\n<link rel="manifest" href="/site.webmanifest">')
def hosting(html):
    for pat, rep in _VENDOR: html = pat.sub(rep, html)
    if '<head>' in html and 'name="robots" content="noindex, nofollow"' not in html:
        html = _re.sub(r'<meta name="robots" content="[^"]*">\n?', '', html)
        html = html.replace('<head>', '<head>\n' + _HEAD_TAGS, 1)
    return html
def rewrite(html):
    html = _LINK.sub(lambda m: url_for(m.group(1), m.group(2) or '', m.group(3) or '') if m.group(1) in ROUTE else m.group(0), html)
    html = _ASSET.sub(r'/\1/', html)
    return playground(add_theme(hosting(html.replace('action="search.html"', 'action="/deals/search"'))))   # D-150: theme set before the page draws

def out_path(route):
    if route == '/': return os.path.join(ROOT, 'index.html')
    if route.endswith('.html'): return os.path.join(ROOT, route.lstrip('/'))
    return os.path.join(ROOT, route.strip('/'), 'index.html')

# ---- 3. clear the previous build's route folders, then write ----
try: _prev = json.load(open(R_MANIFEST))
except Exception: _prev = []
for p in _prev:
    f = out_path(p)
    if p not in ('/',) and not p.endswith('.html') and os.path.exists(f): os.remove(f)
for top in ('admin', 'deal', 'products', 'shops', 'blog', 'user', 'deals', '_design', '_shell'):   # generated trees only; never css/js/assets/build
    t = os.path.join(ROOT, top)
    if os.path.isdir(t): _shutil.rmtree(t)

written, missing = [], []
def put(route, html):
    f = out_path(route); os.makedirs(os.path.dirname(f), exist_ok=True); open(f, 'w').write(html); written.append(route)

flat = [os.path.basename(f) for f in _glob.glob(os.path.join(ROOT, '*.html'))]
for fname in sorted(flat):
    if fname in ('look-review.html', 'poster-options.html'): continue   # hand-made S16 colour review sheet, not a site page; stays at /look-review.html, never deleted
    if fname not in ROUTE: missing.append(fname); continue
    src = open(os.path.join(ROOT, fname)).read()
    html = rewrite(src)
    if fname in TABS:
        attr, tabs_ = TABS[fname]
        for k, r in tabs_.items():
            put(r, html.replace('</head>', f'<script>window.ADM_TABS = {json.dumps(tabs_)}; window.ADM_TAB = "{k}";</script>\n</head>', 1))
    else:
        put(ROUTE[fname], html)
    if fname == 'admin-post.html':
        for r in ADM_ROWS: put(f"/admin/deal/{r['id']}/edit", html)   # 2026-11-25: no clone pages (changes.md A-01)
    if fname == 'admin-deal-view.html':
        for r in ADM_ROWS: put(f"/admin/deal/{r['id']}", html)
    if fname == 'admin-user.html':
        for k in range(1, len(USERS) + 1): put(f"/admin/users/{k}", html)
    if fname == 'admin-blog-edit.html':
        for p in BLOG_ADMIN: put(f"/admin/blog/{p['name']}/edit", html)
    if ROUTE[fname] not in ('/', '/404.html', '/500.html'): os.remove(os.path.join(ROOT, fname))

# generated data file (search suggestions) carries deal / category / store pages
di = os.path.join(ROOT, 'js', 'deals-index.js'); open(di, 'w').write(rewrite(open(di).read()).replace('"/assets/', '"/assets/'))

json.dump(sorted(set(written)), open(R_MANIFEST, 'w'), indent=0)
print(f'Routes: {len(set(written))} addresses from {len(flat)} pages' + (f'; NOT ROUTED: {missing}' if missing else ''))

# ---- D-114: old address of Fresh. Live site: 301 /fresh-deals → /top-deals (dev); the prototype stands in with a redirect page ----
os.makedirs(os.path.join(ROOT, 'fresh-deals'), exist_ok=True)
open(os.path.join(ROOT, 'fresh-deals', 'index.html'), 'w').write('<!doctype html><meta charset="utf-8"><meta name="robots" content="noindex, nofollow"><title>Moved to Top deals</title><link rel="canonical" href="/top-deals"><meta http-equiv="refresh" content="0; url=/top-deals"><script>location.replace("/top-deals" + location.search + location.hash)</script><p>Fresh deals is now <a href="/top-deals">Top deals</a>.</p>\n')

# ---- S25 (plan.md Part B): shells for pages the playground creates (a new deal, category, store or blog post).
# The local server (build/serve.py), Netlify / Cloudflare Pages (_redirects) and, on any other host, 404.html serve these
# for an address that has no built page; js/render.js draws the page from the playground data. ----
SHELLS = {'deal': ROUTE[deals[0]['page']], 'products': ROUTE[cat_page('Others')], 'shops': ROUTE[SHOPS[0]['page']], 'blog': '/blog/' + LATEST_POST['name'],
          'adm-deal': '/admin/deal/create', 'adm-view': '/admin/deal/' + str(ADM_ROWS[0]['id']), 'adm-user': '/admin/users/1', 'adm-blog': '/admin/blog/create'}
_combo = next((f"/shops/{x['slug']}/{c['slug']}" for x in SHOPS for c in CATS if any(d['store'] == x['name'] and d['cat'] == c['name'] for d in deals)), None)
if _combo: SHELLS['combo'] = _combo
for k, r in SHELLS.items():
    src = open(out_path(r)).read().replace('<body ', '<body data-shell="1" ', 1)
    os.makedirs(os.path.join(ROOT, '_shell', k), exist_ok=True); open(os.path.join(ROOT, '_shell', k, 'index.html'), 'w').write(src)
open(os.path.join(ROOT, '_redirects'), 'w').write(
    '# Netlify / Cloudflare Pages: addresses with no built page fall back to a playground shell (served only when no file matches)\n'
    '/deal/*            /_shell/deal/index.html      200\n'
    '/products/*        /_shell/products/index.html  200\n'
    '/shops/:shop/:cat  /_shell/combo/index.html     200\n'
    '/shops/*           /_shell/shops/index.html     200\n'
    '/blog/*            /_shell/blog/index.html      200\n'
    '/admin/deal/:id/edit  /_shell/adm-deal/index.html  200\n'
    '/admin/deal/*      /_shell/adm-view/index.html  200\n'
    '/admin/blog/*      /_shell/adm-blog/index.html  200\n'
    '/admin/users/*     /_shell/adm-user/index.html  200\n')
# S25 hosting (D-153): the UAT link stays out of search engines, and the playground data is always fresh after a redeploy
open(os.path.join(ROOT, 'robots.txt'), 'w').write('# OfferTag prototype (UAT playground): not for search engines. The live site is https://www.offertag.in\nUser-agent: *\nDisallow: /\n')
open(os.path.join(ROOT, '_headers'), 'w').write(
    '# Netlify / Cloudflare Pages response headers\n'
    '/*\n  X-Robots-Tag: noindex, nofollow\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n'
    '/data/*\n  Cache-Control: no-cache\n'
    '/js/*\n  Cache-Control: no-cache\n'
    '/css/*\n  Cache-Control: no-cache\n'
    '/vendor/*\n  Cache-Control: public, max-age=31536000, immutable\n')
json.dump({'name': 'OfferTag prototype', 'short_name': 'OfferTag', 'start_url': '/', 'display': 'browser', 'background_color': '#ffffff', 'theme_color': '#0b2a5b',
           'icons': [{'src': '/icon-512.png', 'sizes': '512x512', 'type': 'image/png'}, {'src': '/apple-touch-icon.png', 'sizes': '180x180', 'type': 'image/png'}]},
          open(os.path.join(ROOT, 'site.webmanifest'), 'w'), indent=1)
_FALLBACK = ('<script>/* S25: an address the playground created (new deal, category, store, blog post) on a host without rewrites */'
             '(function(){var p=location.pathname.replace(/\\/$/,""),s=/^\\/deal\\/[^\\/]+$/.test(p)?"deal":/^\\/products\\/[^\\/]+-deals$/.test(p)?"products":/^\\/shops\\/[^\\/]+\\/[^\\/]+$/.test(p)?"combo":/^\\/shops\\/[^\\/]+$/.test(p)?"shops":/^\\/blog\\/[^\\/]+$/.test(p)?"blog":/^\\/admin\\/deal\\/[^\\/]+\\/edit$/.test(p)?"adm-deal":/^\\/admin\\/deal\\/\\d+$/.test(p)?"adm-view":/^\\/admin\\/users\\/\\d+$/.test(p)?"adm-user":/^\\/admin\\/blog\\/[^\\/]+\\/edit$/.test(p)?"adm-blog":"";'
             'if(!s)return;document.documentElement.style.visibility="hidden";fetch("/_shell/"+s+"/").then(function(r){return r.text()}).then(function(h){document.open();document.write(h);document.close();}).catch(function(){document.documentElement.style.visibility=""})})();</script>')
_nf = os.path.join(ROOT, '404.html'); _h = open(_nf).read()
if 'S25: an address' not in _h: open(_nf, 'w').write(_h.replace('<head>', '<head>\n' + _FALLBACK, 1))
print('Playground shells:', ', '.join(SHELLS))
