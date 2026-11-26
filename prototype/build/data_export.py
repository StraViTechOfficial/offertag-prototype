# data_export.py — S25 UAT playground (plan.md Part B). Runs last, inside build.py's namespace, after routes.py.
# Writes the seed data the browser starts from: prototype/data/*.json. js/db.js reads these files, adds what the
# person changed in this browser (localStorage), and every page draws its deals, home rows, deal page and admin lists from that.
# Times are stored as minutes before the snapshot ("ago") or days from the prototype's TODAY, so db.js can place them
# relative to the moment this browser first opened the playground.
import re as _re2, html  # routes.py rebinds the name html to a page string; the sanitiser needs the module

DATA = os.path.join(ROOT, 'data')
os.makedirs(DATA, exist_ok=True)
def _out(name, obj):
    json.dump(obj, open(os.path.join(DATA, name), 'w'), ensure_ascii=False, separators=(',', ':'))

def _route(page): return url_for(page) if page in ROUTE else page
def _asset(p): return '/' + p.lstrip('/') if p and not p.startswith(('http', 'data:', '/')) else p
def _ago(s):  # "2 min ago", "1 h", "3 d", "40 min" → minutes
    m = _re2.match(r'\s*(\d+)\s*(min|minute|h|hour|d|day)', s or '')
    if not m: return 0
    k, u = int(m.group(1)), m.group(2)
    return k if u.startswith('min') else k * 60 if u.startswith('h') else k * 1440
def _days(iso): return (_dt.date.fromisoformat(iso) - TODAY).days if iso else None

# ---------------- deals ----------------
_rows = {r['id']: r for r in ADM_ROWS}
def _deal(d, row=None):
    cleaned = clean_html(d['desc_raw'], d['t'])
    rec = dict(d)  # split_blocks fills highlights/specs/links/note on a fresh copy, exactly as the deal page build did (the page build already filled d's own fields)
    for k in ('highlights', 'specs', 'links'): rec[k] = []
    rec['offers'] = list(d['offers']); rec['step_exceptions'] = list(d['step_exceptions']); rec['note'] = ''
    desc = split_blocks(cleaned, rec)
    _, exc = steps_split(rec)
    photo, fill = td_img(d)
    r = row or {}
    return dict(
        id=str(d['id']), page=_route(d['page']), t=d['t'], p=d['p'], m=d['m'], pct=int(d['pct']), store=d['store'], cat=d['cat'],
        types=[t for t in d['types'] if t != 'Fresh'], pin=r.get('pin'), featured=bool(d.get('featured')),  # 2026-11-25: no status (changes.md A-03); types follow the rules (A-14)
        ago=d['agemin'],
        views=int(d.get('views') or 0), uniq=r.get('uniq', 0), clicks=r.get('clicks', 0), display=r.get('display', 1),
        img=_asset(dimg(d)), lg=_asset('assets/deals/lg/' + d['file']), td=_asset(photo), tdFill=fill,
        link=d['link'], posted=d['posted'], postedIso=posted_iso(d['posted']), order=d['order'], caption=rec['caption'], coupon=rec['coupon'], terms=rec['coupon_terms'], offers=rec['offers'], note=rec['note'],
        exc=exc, highlights=rec['highlights'], specs=rec['specs'], links=rec['links'], desc=desc, source='telegram', seed=True)

D_OUT = [_deal(d, _rows.get(d['id'])) for d in sorted(deals, key=lambda d: d['agemin'])]
D_OUT += [dict(_deal(d), detailOnly=True) for d in extras]  # the three multi-link sale posts: deal pages only, not in the feed
# 2026-11-25 (changes.md A-03): no Incoming queue; deals go straight to the site, so no pending sample deals are exported
_out('deals.json', D_OUT)

# ---------------- catalogue ----------------
_out('catalogue.json', dict(
    categories=[dict(id=c['id'], name=c['name'], slug=c['slug'], order=c['order'], total=c['total'], on=True, page=_route(c['page']), title=c['title'], description=c['description'],
                     about=clean_html(c['footer_html']), icon=caticon.get(c['name'], 'tag'), img=_asset(f"assets/cats/{c['slug']}.jpg") if os.path.exists(os.path.join(ROOT, 'assets', 'cats', c['slug'] + '.jpg')) else '') for c in CATS],
    shops=[dict(id=x['id'], name=x['name'], label=x['name'][:13], slug=x['slug'], order=x['order'], total=x['total'], on=True, page=_route(x['page']), title=x['title'], description=x['description'],
                about=clean_html(x['footer_html']), logo=_asset(store_logo(x['name']) or ''), aff=(x.get('affiliate') or '').strip(), tint=list(TD_TINT.get(x['name'], TD_TINT_DEFAULT)), btn=list(td_btn(x['name']))) for x in SHOPS],
    tintDefault=list(TD_TINT_DEFAULT), btnDefault=list(td_btn('Others')),
    steps=SHOP_STEPS['*'],
    combos=sorted({f"{x['slug']}/{c['slug']}" for x in SHOPS for c in CATS if any(d['store'] == x['name'] and d['cat'] == c['name'] for d in deals)}),
))

# ---------------- home: posters, sponsored, pins, promo, site settings ----------------
_spons = [dict(id=x['id'], adv=x['adv'], title=x['title'], line=x['line'], cta=x['cta'], link=x['href'].replace('#sponsored-', 'https://example.com/ad-'), img=f'/assets/posters/{x["img"]}.jpg',
               start=_days(x['start']), end=_days(x['end']), on=x['on'], views=x['views'], clicks=x['clicks'], sample=True) for x in SPONSORS]
_spons.append(dict(id=3, adv='FitZone Gym, Powai', title='FitZone: 3 months for the price of 2', line='Opening offer at our Powai branch.', cta='Join now', link='https://example.com/ad-3', img='/assets/posters/festive.jpg', start=_days('2026-10-01'), end=_days('2026-10-31'), on=True, views=24980, clicks=511, sample=True))
_out('home.json', dict(
    pinEvery=PIN_EVERY, trending=sorted(TD_TRENDING), sponsored=_spons,
    site=dict(blognew=True, chat=True,
              wa='https://chat.whatsapp.com/FpM8Z1mM898BmFOqd8ccqg', tg='https://t.me/OffertagLoot', fb='https://www.facebook.com/Offertag.in', ig='', li='',
              play='https://play.google.com/store/apps/details?id=app.offertag', mail='support@offertag.in'),
))

# ---------------- blog (the admin's list is the source; the public blog shows the published ones) ----------------
def _blog(p):
    q = dict(p)
    q['cover'] = _asset(q.get('cover') or '')
    q['body'] = [dict(b, img=_asset(b['img'])) if 'img' in b else b for b in q.get('body') or []]
    return q
_out('blog.json', [_blog(p) for p in BLOG_ADMIN])

# ---------------- community: comments, inbox, users, admin-only screens ----------------
def _rx(n, seed):  # the same split reactions_html() draws on the built pages: {emoji: [names]}
    h = sum(ord(c) for c in seed); split = {}
    for i in range(n):
        k = [0, 0, 0, 4, 4, 1, 3, 2, 5][(h + i * 7) % 9] if i else 0
        split[k] = split.get(k, 0) + 1
    out, at = {}, h % len(RX_NAMES)
    for k, (e, _l) in enumerate(RX):
        c = split.get(k)
        if not c: continue
        out[e] = [RX_NAMES[(at + j) % len(RX_NAMES)] for j in range(c)]; at += c
    return out
_cm = []
for di, rows_ in SAMPLE_COMMENTS.items():
    d = deals[di]
    for n, (name, text, when, likes, replies) in enumerate(rows_):
        cid = f'c{d["id"]}-{n}'
        _cm.append(dict(id=cid, deal=str(d['id']), parent=None, name=name, admin=False, text=trim_links(text), ago=_ago(when), rx=_rx(likes, name + trim_links(text)), seed=True))
        for k, (rn, ra, rt, rw, rl) in enumerate(replies):
            _cm.append(dict(id=f'{cid}-{k}', deal=str(d['id']), parent=cid, name=rn, admin=ra, text=trim_links(rt), ago=_ago(rw), rx=_rx(rl, rn + trim_links(rt)), seed=True))
_inbox = json.loads(_re2.search(r'window\.ADM_INBOX = (.*?);</script>', open(os.path.join(ROOT, 'admin', 'feedback', 'index.html')).read()).group(1).replace('<\\/', '</'))
for k in ('feedback', 'deletion'):
    for r in _inbox[k]: r['ago'] = _ago(r.get('when')); r['seed'] = True
_out('community.json', dict(
    comments=_cm, rx=[dict(e=e, label=l) for e, l in RX], rxNames=RX_NAMES,
    feedback=_inbox['feedback'], deletion=_inbox['deletion'],
    users=[dict(id=i + 1, name=n, email=e, phone=p, role=r, joined=j, tag=t, active=ac, last=l) for i, (n, e, p, r, j, t, ac, l) in enumerate(USERS)],
))
print('data/: deals', len(D_OUT), '· comments', len(_cm), '· sponsored', len(_spons), '· blog', len(BLOG_ADMIN))
