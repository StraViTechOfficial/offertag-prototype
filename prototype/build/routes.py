# routes.py — S18 routing (D-105). Runs last, inside build.py's namespace.
# The build writes flat pages (fresh.html, admin-deals.html, deal-123.html …). This step moves every page to the folder of its
# real address (fresh.html → /fresh-deals/index.html), rewrites every link, asset path and script reference to root paths,
# adds the extra addresses one page answers to (tab routes, edit/clone routes), and deletes the flat files.
# Addresses come from the live code (`offer-tag/routes/web.php`) and the data sheets; new ones are logged in DEV-025.
# Route map for people: design-system/ia/routes.md.
import glob as _glob, re as _re, shutil as _shutil

R_MANIFEST = os.path.join(HERE, 'routes.json')

# ---- 1. one address per flat page ----
ROUTE = {
    'index.html': '/',
    # deal types: /{dealType}, lookup name hyphenated (DealsController@dealPage; W05)
    'fresh.html': '/fresh-deals', 'top-picks.html': '/top-deals', 'loot.html': '/loot-deals', 'new.html': '/new-deals', 'pantry.html': '/pantry-deals',
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
    'admin.html': '/admin', 'admin-incoming.html': '/admin/incoming', 'admin-deals.html': '/admin/deal', 'admin-post.html': '/admin/deal/create',
    'admin-pinned.html': '/admin/pinned', 'admin-alerts.html': '/admin/admin-notifications', 'admin-posters.html': '/admin/posters',
    'admin-social.html': '/admin/social', 'admin-tags.html': '/admin/settings/tags', 'admin-inbox.html': '/admin/feedback',
    'admin-site.html': '/admin/settings/site', 'admin-roles.html': '/admin/role', 'admin-users.html': '/admin/users',
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
    'admin-social.html': ('data-stab', {'channels': '/admin/social', 'formats': '/admin/social/formats', 'history': '/admin/social/history'}),
    'admin-inbox.html': ('data-itab', {'feedback': '/admin/feedback', 'reports': '/admin/reports', 'deletion': '/admin/deletion-requests'}),
    'admin-catalogue.html': ('data-ctab', {'shops': '/admin/shop', 'categories': '/admin/category', 'dealtypes': '/admin/lookup', 'types': '/admin/type'}),
}

# ---- 2. link rewriting ----
def url_for(fname, query='', frag=''):
    q = [kv for kv in query.lstrip('?').split('&') if kv] if query else []
    kv = dict(x.split('=', 1) if '=' in x else (x, '') for x in q)
    path = ROUTE[fname]
    if fname in TABS and kv.get('tab') in TABS[fname][1]: path = TABS[fname][1][kv.pop('tab')]
    elif fname == 'admin-post.html' and kv.get('id'): path = f"/admin/deal/{kv.pop('id')}/edit"
    elif fname == 'admin-post.html' and kv.get('clone'): path = f"/admin/deal/{kv.pop('clone')}/clone"
    elif fname == 'admin-blog-edit.html' and kv.get('post'): path = f"/admin/blog/{kv.pop('post')}/edit"
    rest = '&'.join(k + ('=' + v if v != '' else '') for k, v in kv.items())
    return path + ('?' + rest if rest else '') + frag

_LINK = _re.compile(r'''(?<![\w/.-])([a-z0-9][a-z0-9_-]*\.html)(\?[^"'\s#<>)]*)?(#[^"'\s<>)]*)?''')
_ASSET = _re.compile(r'''(?<=["'(=])(css|js|assets)/''')
def rewrite(html):
    html = _LINK.sub(lambda m: url_for(m.group(1), m.group(2) or '', m.group(3) or '') if m.group(1) in ROUTE else m.group(0), html)
    html = _ASSET.sub(r'/\1/', html)
    return html.replace('action="search.html"', 'action="/deals/search"')

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
for top in ('admin', 'deal', 'products', 'shops', 'blog', 'user', 'deals', '_design'):   # generated trees only; never css/js/assets/build
    t = os.path.join(ROOT, top)
    if os.path.isdir(t): _shutil.rmtree(t)

written, missing = [], []
def put(route, html):
    f = out_path(route); os.makedirs(os.path.dirname(f), exist_ok=True); open(f, 'w').write(html); written.append(route)

flat = [os.path.basename(f) for f in _glob.glob(os.path.join(ROOT, '*.html'))]
for fname in sorted(flat):
    if fname in ('look-review.html',): continue   # hand-made S16 colour review sheet, not a site page; stays at /look-review.html, never deleted
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
        for r in ADM_ROWS: put(f"/admin/deal/{r['id']}/edit", html); put(f"/admin/deal/{r['id']}/clone", html)
    if fname == 'admin-blog-edit.html':
        for p in BLOG_ADMIN: put(f"/admin/blog/{p['name']}/edit", html)
    if ROUTE[fname] not in ('/', '/404.html', '/500.html'): os.remove(os.path.join(ROOT, fname))

# generated data file (search suggestions) carries deal / category / store pages
di = os.path.join(ROOT, 'js', 'deals-index.js'); open(di, 'w').write(rewrite(open(di).read()).replace('"/assets/', '"/assets/'))

json.dump(sorted(set(written)), open(R_MANIFEST, 'w'), indent=0)
print(f'Routes: {len(set(written))} addresses from {len(flat)} pages' + (f'; NOT ROUTED: {missing}' if missing else ''))
