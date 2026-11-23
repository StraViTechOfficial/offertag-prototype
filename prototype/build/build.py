#!/usr/bin/env python3
"""Build OfferTag prototype pages from real deal data.
usage: python3 build/build.py   (run from design-system/prototype/)
Outputs index.html and the five listing pages. Templates and data live in build/."""
import json, html, re, os
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
deals = json.load(open(os.path.join(HERE, 'deals-clean.json')))
details = {r['file']: r for r in json.load(open(os.path.join(HERE, 'deal-details.json')))}  # scraped from the 42 live detail pages: description, steps, buy link, posted date
def n(x): return int(x.replace(',', ''))
def inr(v):
    x = str(v)
    if v < 1000: return '₹' + x
    last3 = x[-3:]; rest = x[:-3]; parts = []
    while len(rest) > 2: parts.insert(0, rest[-2:]); rest = rest[:-2]
    if rest: parts.insert(0, rest)
    return '₹' + ','.join(parts) + ',' + last3
def age_min(a):
    m = re.match(r'(\d+) (minute|hour|day)', a or '')
    if not m: return 60
    k = int(m.group(1)); u = m.group(2)
    return k if u == 'minute' else k * 60 if u == 'hour' else k * 1440
extras = json.load(open(os.path.join(HERE, 'deals-extra.json')))  # three multi-link sale posts, detail pages only (not in the feed)
# Catalogue (Law 15): active categories and shops as stored on the live site, with live totals and the W19 SEO text → build/catalogue.json
CATALOGUE = json.load(open(os.path.join(HERE, 'catalogue.json')))
CATS = CATALOGUE['categories']; SHOPS = CATALOGUE['shops']
cat_by_name = {c['name']: c for c in CATS}; shop_by_name = {x['name']: x for x in SHOPS}; shop_by_slug = {x['slug']: x for x in SHOPS}
for c in CATS: c['page'] = 'category-' + c['slug'] + '.html'
for x in SHOPS: x['page'] = 'store-' + x['slug'] + '.html'
def cat_page(name): c = cat_by_name.get(name); return c['page'] if c else 'categories.html'
def store_page(name): x = shop_by_name.get(name); return x['page'] if x else 'stores.html'
def shop_name(raw):  # store names as stored in shops.name ("Jiomart", not "JioMart"); unknown → "Others" (shop id 45)
    if raw in shop_by_name: return raw
    x = shop_by_slug.get(raw.lower().replace(' ', '')) or next((v for k, v in shop_by_name.items() if raw.lower().startswith(k.lower())), None)
    return x['name'] if x else 'Others'
for i, d in enumerate(deals + extras):
    d['p'] = n(d['price']); d['m'] = n(d['mrp']); d['save'] = d['m'] - d['p']
    d['t'] = re.sub(r'\s+', ' ', re.sub(r'\s*\|.*$', '', details.get(d['file'], {}).get('title') or d['title'])).strip()  # full title from the live detail page, first segment
    if d.get('detail_only'):  # extras carry an absolute posted time; age relative to the feed snapshot (Tue, Nov 10, 2026 11:20 PM IST)
        from datetime import datetime as _dt
        mins = int((_dt(2026, 11, 10, 23, 20) - _dt.strptime(d['age'], '%a, %b %d, %Y %I:%M %p')).total_seconds() // 60); mins = max(mins, 1)
        d['age'] = (f'{mins} minutes ago' if mins < 60 else f'{mins // 60} hours ago' if mins < 1440 else f'{mins // 1440} days ago')
    d['agemin'] = age_min(d['age'])
    d['agetxt'] = (d['age'] or '1 hour ago').replace(' minutes ago', ' min').replace(' minute ago', ' min').replace(' hours ago', ' h').replace(' hour ago', ' h').replace(' days ago', ' d').replace(' day ago', ' d')
    d['cat'] = d['cat'] if d['cat'] in cat_by_name else 'Others'   # catalogue spelling as stored (Law 15, Q-037)
    d['store'] = shop_name(d['store'])
    d['order'] = i
    # D-117: every deal is New; more than 25% off is also Top; more than 80% off is also Loot; grocery/kitchen +Pantry; today's posts are Fresh (replaces the W44 rule <25 New, ≥25 Top, ≥75 Loot)
    pct = int(d['pct']); t = ['Fresh'] if d['agemin'] <= 1440 else []
    if pct > 25: t.append('Top')
    if pct > 80: t.append('Loot')
    if d['cat'] in ('Grocery', 'Kitchen'): t.append('Pantry')
    t.append('New')
    d['types'] = t
    d['stem'] = d['file'].rsplit('.', 1)[0]; d['page'] = 'deal-' + d['stem'] + '.html'
    d['id'] = d['slug'].rsplit('-', 1)[-1]
    r = details.get(d['file'], d); d['desc_raw'] = r.get('desc_raw', ''); d['steps_raw'] = r.get('steps_raw', ''); d['link'] = r.get('link') or '#buy'; d['posted'] = r.get('posted', '')
    for k in ('coupon', 'coupon_terms', 'note', 'caption'): d[k] = ''
    for k in ('offers', 'highlights', 'links', 'specs', 'step_exceptions'): d[k] = []
# Sample data where the live site has none yet: coupon (BRD B05, no column today) and caption (deal_caption exists, unused) on two deals; comments on three (table has 432 rows, none on these deals)
deals[0].update(coupon='WELCOME100', coupon_terms='On orders above ₹4,999', caption='Lowest ever', offers=['10% instant discount with HDFC Bank cards, up to ₹1,500', 'No-cost EMI from ₹1,500/month'], step_exceptions=['Apply code WELCOME100 at checkout'])
deals[13].update(coupon='BANK10', caption='Price drop', offers=['Extra 10% off with Axis Bank cards'])
E = lambda s: html.escape(s, quote=True)
CN = lambda c: c  # names render as stored in categories.category_name (Law 15); spelling fixes are an admin task (Q-037)

def dimg(d):  # sharpest copy we hold: deals-hd (fetched larger originals) > deals/lg (300 px) > deals (200 px)
    for sub in ('deals-hd/', 'deals/lg/'):
        if os.path.exists(os.path.join(ROOT, 'assets', sub, d['file'])): return 'assets/' + sub + d['file']
    return 'assets/deals/' + d['file']
def store_logo(name):  # SAMPLE store logos (S16): public wordmarks until the client sends files; Catalogue → Shops (shop_logo) on the live site
    x = shop_by_name.get(name)
    if not x: return None
    for ext in ('svg', 'png'):
        f = f"assets/stores/{x['slug']}.{ext}"
        if os.path.exists(os.path.join(ROOT, f)): return f
def buy_btn(d, cls='btn btn-outline btn-sm btn-buy'):
    lg = store_logo(d['store'])
    inner = f'<span>Buy on</span><img class="buy-logo" src="{lg}" alt="{E(d["store"])}">' if lg else f'Buy at {E(d["store"])}'
    return f'<a class="{cls}" href="{E(d["link"])}" target="_blank" rel="nofollow sponsored noopener" aria-label="Buy at {E(d["store"])}">{inner}</a>'
def card(d, wrap=True):  # S16 fix round (D-099): store logo sits on the Save line; full-width bigger Buy; share on the photo corner
    lg = store_logo(d['store'])
    chip = f'<img class="store-chip" src="{lg}" alt="{E(d["store"])}" loading="lazy">' if lg else f'<span class="store-chip is-text">{E(d["store"])}</span>'
    inner = f'''<article class="card deal" data-id="{d['id']}" data-page="{d['page']}" data-q="{E((d['t'] + ' ' + d['cat'] + ' ' + d['store']).lower())}"{' data-pinned="1"' if d.get('pinned') else ''} data-cat="{E(d['cat'])}" data-store="{E(d['store'])}" data-pct="{d['pct']}" data-price="{d['p']}" data-save="{d['save']}" data-age="{d['agemin']}" data-views="{d.get('views') or 0}" data-types="{E(','.join(d['types']))}">
  <a class="img" href="{d['page']}" aria-label="{E(d['t'])}"><img src="{dimg(d)}" alt="" loading="lazy" width="300" height="300"><span class="badge badge-default">{d['pct']}% off</span></a>
  <button class="btn btn-icon card-share" type="button" aria-label="Share"><i data-lucide="share-2"></i></button>
  <div class="body">
    <div class="meta">{E(CN(d['cat']))} · {E(d['agetxt'])}</div>
    <a class="title" href="{d['page']}">{E(d['t'])}</a>
    <div class="priceline"><span class="price">{inr(d['p'])}</span><span class="was">{inr(d['m'])}</span></div>
    <div class="saveline"><span class="save">Save {inr(d['save'])}</span>{chip}</div>
    <div class="acts"><a class="btn btn-outline btn-buy" href="{E(d["link"])}" target="_blank" rel="nofollow sponsored noopener" aria-label="Buy now at {E(d["store"])}">Buy now<i data-lucide="shopping-basket"></i></a></div>
  </div></article>'''
    return f'<div class="carousel-item">{inner}</div>' if wrap else inner
def hero(d, label):
    return f'''<div class="carousel-item"><article class="card hero-card">
  <div class="body">
    <div class="k"><span class="badge badge-outline">{E(label)}</span><span>{E(d['store'])} · {E(CN(d['cat']))}</span></div>
    <h3><a href="{d['page']}">{E(d['t'])}</a></h3>
    <div><span class="price">{inr(d['p'])}</span><span class="was">{inr(d['m'])}</span></div>
    <div class="save">Save <b>{inr(d['save'])}</b> · {d['pct']}% off</div>
    <div class="acts"><a class="btn btn-default" href="{E(d['link'])}" target="_blank" rel="nofollow sponsored noopener">Buy at {E(d['store'])}</a><button class="btn btn-outline btn-icon" aria-label="Share"><i data-lucide="share-2"></i></button></div>
  </div>
  <a class="img" href="{d['page']}" aria-hidden="true" tabindex="-1"><img src="assets/deals/{d['file']}" alt="" width="200" height="200"></a>
</article></div>'''
CHEV_L = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>'
CHEV_R = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6 6-6"/></svg>'.replace('6-6 6-6', '6-6-6-6')
def carousel(items, free=False):
    return f'''<div class="carousel"{' data-free="true"' if free else ''}>
        <div class="carousel-viewport"><div class="carousel-container">{items}</div></div>
        <button class="carousel-prev" aria-label="Previous">{CHEV_L}</button>
        <button class="carousel-next" aria-label="Next">{CHEV_R}</button>
      </div>'''

by_pct = sorted(deals, key=lambda d: -int(d['pct']))
by_save = sorted(deals, key=lambda d: -d['save'])
pinned = list({d['file']: d for d in [by_save[0], by_pct[0], by_save[2], by_pct[3], by_save[5], by_pct[6], by_save[8], by_pct[9]]}.values())[:8]  # SAMPLE: the scrape has no is_pinned; eight picks stand in for the pinned set (README). Order = pinned slot 1, 2, 3…
PIN_EVERY = 3  # D-104, D-114: pinned deals fill every Nth card on Top deals only; admin sets N on the Pinned board (default 3)
for d in pinned: d['pinned'] = True
PAGES = {
    # D-114: Fresh is renamed Top deals and served at /top-deals (the live site's address); the separate Top picks page is removed.
    'fresh':     dict(title='Top deals', rule='More than 25% off, newest first', sort='newest', items=sorted([d for d in deals if 'Top' in d['types']], key=lambda d: d['agemin'])),
    'loot':      dict(title='Loot deals', rule='More than 80% off', sort='recommended', items=[d for d in by_pct if 'Loot' in d['types']]),
    'new':       dict(title='New deals', rule='Every deal, newest first', sort='newest', items=sorted(deals, key=lambda d: d['agemin'])),
    'pantry':    dict(title='Pantry', rule='Grocery and kitchen essentials', sort='recommended', items=[d for d in deals if d['cat'] in ('Grocery', 'Kitchen')]),
}
cats = [c['name'] for c in CATS]  # 31 active categories, catalogue order (order_no)
caticon = {"Electronics":"cpu","Mobile":"smartphone","Recharge":"smartphone-charging","Clothing":"shirt","Movies":"clapperboard","Food & Beverage":"utensils","Amazon Pantry":"shopping-basket","Grocery":"shopping-basket","Beauty":"sparkles","Luggage":"luggage","Bags":"briefcase","Kitchen":"cooking-pot","Footwear":"footprints","Watch":"watch","Cab":"car","TV & Appliances":"tv","Washing Machine":"washing-machine","AC":"air-vent","Personal Care":"scissors","Earphones & Headphones":"headphones","Computers & Laptops":"laptop","Deodrants & Perfumes":"spray-can","Speaker":"speaker","Home & Decore":"lamp","Accessories":"cable","Health":"heart-pulse","Baby":"baby","Automotive":"car-front","Books":"book-open","Cashback":"badge-percent","Others":"tag"}
def catimg(c):
    for d in deals:
        if d['cat'] == c: return d['file']
stores = [(x['name'], x['total']) for x in SHOPS]  # 14 active shops, catalogue order, live totals (catalogue.json)

def nav(active):  # S16 (D-097): text only, no icons; on wide screens the same links sit in the header row (.hnav) and this row hides
    items = [('index.html','Home'),('fresh.html','Top deals'),('loot.html','Loot'),('new.html','New'),('pantry.html','Pantry')]
    li = ''.join(f'<li><a href="{h}"{" aria-current=\"page\"" if h == active else ""}>{t}</a></li>' for h, t in items)
    return f'<nav class="typenav" aria-label="Deal types"><div class="container"><ul>{li}</ul></div></nav>'

tpl_home = open(os.path.join(HERE, 'home.template.html')).read()
def _icon(m):
    svg = open(os.path.join(ROOT, 'assets', 'social', m.group(1) + '.svg')).read()
    return re.sub(r'<title>.*?</title>', '', svg).replace('<svg role="img"', '<svg aria-hidden="true" fill="currentColor"', 1)
tpl_home = tpl_home.replace('{{FOOTER_BLOCK}}', re.sub(r'\{\{ICON:(\w+)\}\}', _icon, open(os.path.join(HERE, 'footer.html')).read()))
tpl_home = re.sub(r'\{\{ICON:(\w+)\}\}', _icon, tpl_home)  # header alerts menu uses the same brand marks
# Blog "New" pill (D-097): newest post by date; site.js shows the pill until this visitor has opened the blog since it went up
LATEST_POST = max(json.load(open(os.path.join(HERE, 'blog.json'))), key=lambda p: p['date'])
tpl_home = tpl_home.replace('{{BLOG_LATEST_TITLE}}', E(LATEST_POST['title'])).replace('data-blog-link', f'data-blog-link data-latest="{E(LATEST_POST["name"])}"')
tpl_list = open(os.path.join(HERE, 'listing.template.html')).read()
# shared blocks are cut from the home template
HEADER = tpl_home[tpl_home.index('<header'):tpl_home.index('</header>') + 9]
FOOTER = tpl_home[tpl_home.index('<footer'):tpl_home.index('</footer>') + 9]
_m = tpl_home.index('<aside class="sheet" id="menu-sheet"'); MENU = tpl_home[_m:tpl_home.index('</aside>', _m) + 8]  # S22: search from the menu's own start (the Home side panel's </aside> comes first)

SEARCH_SHEET = '''<!-- Search sheet (phone, full screen; D-064): recent · stores · categories, suggestions while typing; site.js renders the body -->
<aside class="sheet sheet-full" id="search-sheet" hidden data-state="closed" role="dialog" aria-modal="true" aria-label="Search">
  <form class="ss-head" data-search role="search">
    <button class="btn btn-ghost btn-icon" type="button" data-sheet-close aria-label="Back"><i data-lucide="chevron-left"></i></button>
    <label class="input-wrap"><i data-lucide="search"></i><input class="input" type="search" name="q" id="ss-q" placeholder="Search deals, stores, categories…" autocomplete="off" enterkeyhint="search"></label>
    <button class="btn btn-ghost btn-icon" type="button" id="ss-clear" aria-label="Clear" hidden><i data-lucide="x"></i></button>
  </form>
  <div class="sheet-body ss-body" id="ss-body"></div>
</aside>'''
# ---- S14: sign in, shared by /login and the pop-up (D-061, D-091; data sheet auth-account.md) ----
G_ICON = '<svg class="g-icon" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.5 5.5 0 0 1-2.4 3.6v3h3.9c2.2-2.1 3.5-5.2 3.5-8.8z"/><path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z"/><path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6h-4a12 12 0 0 0 0 10.8l4-3.1z"/><path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1c.9-2.9 3.6-4.9 6.7-4.9z"/></svg>'
TURNSTILE = '<label class="turnstile" data-turnstile hidden><input type="checkbox" data-turnstile-box><span>Verify you are human</span><small>Cloudflare Turnstile</small></label>'
def signin_block(title):
    boxes = ''.join(f'<input class="input" type="text" inputmode="numeric" pattern="[0-9]*" aria-label="Digit {i + 1}"{" autocomplete=one-time-code" if i == 0 else " autocomplete=off"}>' for i in range(6))
    return f'''<div class="signin" data-signin>
  <div class="signin-head">{title}<p class="signin-sub" data-signin-sub>New here? Signing in creates your account.</p></div>
  <div class="signin-step" data-step="start">
    <button class="btn btn-outline signin-google" type="button" data-google>{G_ICON}Continue with Google</button>
    <div class="signin-or"><span>or</span></div>
    <form class="signin-form" data-email-form novalidate>
      <label class="field-label">Email<input class="input" type="email" name="email" inputmode="email" autocomplete="email" maxlength="255" placeholder="you@example.com"></label>
      <p class="form-error" data-email-error role="alert" hidden></p>
      {TURNSTILE}
      <button class="btn btn-default" type="submit">Send code</button>
    </form>
    <p class="signin-legal">By continuing you agree to the <a href="terms.html">Terms</a> and <a href="privacy.html">Privacy policy</a>.</p>
  </div>
  <div class="signin-step" data-step="code" hidden>
    <div class="otp" role="group" aria-label="6-digit code">{boxes}</div>
    <p class="form-error" data-code-error role="alert" hidden></p>
    <p class="signin-help">Valid for 10 minutes</p>
    <button class="btn btn-link signin-resend" type="button" data-resend disabled>Resend code in 0:30</button>
  </div>
</div>'''
SIGNIN_SHEET = f'''<!-- Sign in: bottom sheet on phone, centred pop-up on desktop (D-091) -->
<aside class="sheet sheet-bottom dialog-md" id="signin-sheet" hidden data-state="closed" role="dialog" aria-modal="true" aria-labelledby="signin-title">
  <div class="handle"></div>
  <button class="sheet-close" data-sheet-close aria-label="Close"><i data-lucide="x"></i></button>
  <div class="sheet-body">{signin_block('<div class="sheet-title" id="signin-title" data-signin-title>Sign in</div>')}</div>
</aside>'''
SEARCH_SHEET += '\n' + SIGNIN_SHEET
def community(wrap):  # BRD B09 · D-055, reworked S16 (D-097): always shown, says why to join; brand marks; links from Site & app settings (B33)
    wa, tg = _icon(re.match(r'(\w+)', 'whatsapp')), _icon(re.match(r'(\w+)', 'telegram'))
    inner = (f'<span class="cm-text"><span class="cm-long">Get every deal on WhatsApp or Telegram the minute it’s posted. Free, no account.</span>'
             f'<span class="cm-short">Get deal alerts, free</span></span>'
             f'<span class="cm-acts"><a class="cm-btn cm-wa" href="#wa" target="_blank" rel="noopener">{wa}WhatsApp</a>'
             f'<a class="cm-btn cm-tg" href="#tg" target="_blank" rel="noopener">{tg}Telegram</a></span>')
    return ''  # M-04 / D-106: the strip under the header is replaced by the corner join button (footer.html)
    return f'<div class="community" data-community aria-label="Join the OfferTag community">{"<div class=\"container\">" + inner + "</div>" if wrap else inner}</div>'
def fill(tpl, **kw):
    for k, v in kw.items(): tpl = tpl.replace('{{' + k + '}}', str(v))
    return tpl

home = tpl_home
# "New since your last visit" line (D-097): ages come from the feed snapshot; site.js counts deals newer than this visitor's last visit
SINCE = (f'<div class="since" data-since data-today="{len(deals)}" data-ages="{",".join(str(d["agemin"]) for d in deals)}" hidden>'
         f'<a class="since-link" href="fresh.html"><span class="since-dot" aria-hidden="true"></span><span data-since-text></span><span class="since-go">See them →</span></a>'
         f'<span class="since-meta">Last deal posted {min(deals, key=lambda d: d["agemin"])["agetxt"]} ago</span></div>')
home = home.replace('{{SINCE}}', SINCE)
home = home.replace('{{NAV}}', nav('index.html')).replace('{{COMMUNITY}}', community(True)).replace('{{SEARCH_SHEET}}', SEARCH_SHEET)
# Hot deals today (D-113, DEV-031; replaces the Sale poster duo of D-096 / D-107 (7)).
# Order: owner posters first (Admin → Sale posters: a featured deal or a custom poster), then the 10 most-viewed deals of the last 24 h.
# No rank and no view count on the cards. Card tint = soft store colour; View deal = the store's own button colour (text dark or white by contrast).
# Photos come from assets/deals-trim/ (empty margins cut by build/trim_photos.py; fill.json lists room photos that fill the frame).
TD_TINT = {  # store → (card, border)
    'Amazon': ('#FFF1D6', '#EDCB86'), 'Flipkart': ('#E6EEFC', '#B3C6EE'), 'Myntra': ('#FFE7EC', '#F5B3C2'), 'Ajio': ('#ECEFF3', '#C6CFDA'),
    'Meesho': ('#F6E7F3', '#DDB3D3'), 'Jiomart': ('#E4EEF3', '#B1CBD8'), 'Bigbasket': ('#EEF6E2', '#C6DEA0'), 'Blinkit': ('#FFF8D1', '#E6D57A'),
    'Zepto': ('#EFE7F8', '#CDB6E8'), 'Swiggy': ('#FFE9DC', '#F2BC9B'), 'Paytm': ('#E1F5FC', '#A6DDF0'), 'Shopsy': ('#ECEBFB', '#C3C0EE'),
    'Bookmyshow': ('#FDE9EC', '#F0B3BD')}
TD_TINT_DEFAULT = ('#E6EEFC', '#B3C6EE')  # sky (default and Others)
TD_BTN = {'Amazon': '#FFA41C', 'Flipkart': '#FFE11B', 'Myntra': '#D6285A', 'Ajio': '#D5A249', 'Meesho': '#9F2089', 'Jiomart': '#0078AD',
          'Bigbasket': '#84C225', 'Blinkit': '#0C831F', 'Zepto': '#7B2CBF', 'Swiggy': '#FC8019', 'Paytm': '#002E6E', 'Shopsy': '#4D4AE8', 'Bookmyshow': '#DC354B'}
def _lum(h):
    c = [int(h.lstrip('#')[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
def _cr(a, b): la, lb = sorted((_lum(a), _lum(b)), reverse=True); return (la + 0.05) / (lb + 0.05)
def td_btn(store):
    bg = TD_BTN.get(store, '#082454')
    return bg, ('#FFFFFF' if _cr(bg, '#FFFFFF') >= _cr(bg, '#101B36') else '#101B36')
_fill = os.path.join(ROOT, 'assets', 'deals-trim', 'fill.json')
TD_FILL = set(json.load(open(_fill))) if os.path.exists(_fill) else set()
def td_img(d):
    t = d['stem'] + '.jpg'
    return (f'assets/deals-trim/{t}', t in TD_FILL) if os.path.exists(os.path.join(ROOT, 'assets', 'deals-trim', t)) else (dimg(d), False)
TD_STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></svg>'
TD_UP = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>'
def td_card(store, photo, fill, title, priceline, href, featured=False, trending=False, alt='', ext=False):
    bg, bd = TD_TINT.get(store, TD_TINT_DEFAULT); bb, bf = td_btn(store); lg = store_logo(store)
    st = f'<img class="td-st" src="{lg}" alt="{E(store)}">' if lg else f'<span class="td-st-t">{E(store)}</span>'
    chips = (f'<span class="td-feat">{TD_STAR}Featured</span>' if featured else '') + (f'<span class="td-trend">{TD_UP}Trending</span>' if trending else '')
    tgt = ' target="_blank" rel="noopener"' if ext else ''
    return (f'<div class="td-slide"><a class="td-card" style="--cb:{bg};--cbd:{bd};--bb:{bb};--bf:{bf}" href="{E(href)}"{tgt}>'
            f'<span class="td-photo"><img{" class=\"fill\"" if fill else ""} src="{photo}" alt="{E(alt)}" loading="lazy">{chips}</span>'
            f'<span class="td-txt"><span class="td-store">{st}</span><span class="td-title">{E(title)}</span><span class="td-price">{priceline}</span></span>'
            f'<span class="td-view">View deal<i data-lucide="shopping-basket"></i></span></a></div>')
def td_deal(d, **kw):
    photo, fill = td_img(d)
    pl = f'<b>{inr(d["p"])}</b><s>{inr(d["m"])}</s><em>{d["pct"]}% off</em>'
    return td_card(d['store'], photo, fill, d['t'], pl, d['page'], **kw)
# SAMPLE owner posters (Admin → Sale posters): one custom poster and one featured deal. The live site reads them from the poster manager.
TD_CUSTOM = [dict(store='Flipkart', img='assets/posters/electronics.jpg', title='Big Billion Days: up to 80% off electronics', ends='Ends 8 Oct', href=store_page('Flipkart'))]
by_views = sorted(deals, key=lambda d: (-(d.get('views') or 0), d['order']))
TD_FEATURED = [by_views[12]]  # SAMPLE featured deal
TD_TOP = [d for d in by_views if d not in TD_FEATURED][:10]  # stand-in for "most viewed, last 24 h": the snapshot has all-time views only
TD_TRENDING = {0, 5}  # SAMPLE: live, Trending shows when views in the last 3 h ≥ 2 × the 3 h before and ≥ 50
td_items = ''.join(td_card(x['store'], x['img'], True, x['title'], f'<b>Sale</b><em class="td-end">{E(x["ends"])}</em>', x['href'], featured=True, alt=x['title']) for x in TD_CUSTOM)
td_items += ''.join(td_deal(d, featured=True) for d in TD_FEATURED)
td_items += ''.join(td_deal(d, trending=i in TD_TRENDING) for i, d in enumerate(TD_TOP))
home = home.replace('{{TOP_DEALS}}', td_items)
def cat_tile(c):  # S16: real photo per category (SAMPLE stock photos, assets/cats); falls back to a deal photo, then an icon
    slug = cat_by_name[c]['slug']; ph = f'assets/cats/{slug}.jpg'
    if os.path.exists(os.path.join(ROOT, ph)): inner, cls = f'<img src="{ph}" alt="" loading="lazy">', ' has-photo'
    elif catimg(c): inner, cls = f'<img src="assets/deals/{catimg(c)}" alt="" loading="lazy">', ''
    else: inner, cls = f'<i data-lucide="{caticon.get(c, "tag")}"></i>', ''
    return f'<div class="carousel-item"><a class="cat" href="{cat_page(c)}"><span class="tile{cls}">{inner}</span><span>{E(CN(c))}</span></a></div>'
home = home.replace('{{CATS}}', carousel(''.join(cat_tile(c) for c in cats[:16]), free=True))
home = home.replace('{{FRESH}}', carousel(''.join(card(d) for d in PAGES['fresh']['items'][:12])))
home = home.replace('{{LOOT}}', carousel(''.join(card(d) for d in PAGES['loot']['items'][:10])))
def store_tile(name, total):  # S16: the store's logo fills the tile; hover turns it navy and shows the count (phones always show the count)
    lg = store_logo(name)
    mark = f'<span class="store-logo"><img src="{lg}" alt=""></span><b class="visually-hidden">{E(name)}</b>' if lg else f'<span class="store-logo store-word">{E(name)}</span><b class="visually-hidden">{E(name)}</b>'
    return f'<a class="card store has-logo" href="{store_page(name)}" aria-label="{E(name)}, {total:,} deals">{mark}<span class="store-count">{total:,} deals</span></a>'
home = home.replace('{{STORES}}', ''.join(store_tile(s_, c_) for s_, c_ in stores))
home = home.replace('{{COUNT}}', str(len(deals)))
# M-10 side panel (right side, D-107): top categories and stores by live total (same rows as the strips and the index pages)
def side_panel():
    top_c = sorted(CATS, key=lambda c: -c['total'])[:10]
    cl = ''.join(f'<li><a href="{c["page"]}"><i data-lucide="{caticon.get(c["name"], "tag")}"></i><span>{E(CN(c["name"]))}</span><small>{c["total"]:,}</small></a></li>' for c in top_c)
    sl = ''.join(store_tile(n_, t_) for n_, t_ in sorted(stores, key=lambda s: -s[1])[:8])  # D-107: the Home store tiles (logo, navy hover, count), 2 per row
    return (f'<nav class="hs-box" aria-labelledby="hs-cats"><h2 id="hs-cats">Shop by category</h2><ul>{cl}</ul><a class="hs-all" href="categories.html">All categories <i data-lucide="chevron-right"></i></a></nav>'
            f'<nav class="hs-box" aria-labelledby="hs-stores"><h2 id="hs-stores">Shop by store</h2><div class="hs-stores">{sl}</div><a class="hs-all" href="stores.html">All stores <i data-lucide="chevron-right"></i></a></nav>')
# DEV-030 / D-108: paid sponsored slots. SAMPLE advertisers (fictional); the owner sells the space and adds ads in Admin → Sponsored.
# One ad shows per page view; with more than one live, site.js picks one at random (rotation). Links are rel="sponsored nofollow" (ASCI label).
SPONSORS = [
    dict(id=1, adv='Sharma Electronics, Andheri', img='electronics', title='Sharma Electronics: up to 40% off headphones', line='Walk-in store deals this week. Free delivery across Mumbai.', cta='Visit store', href='#sponsored-1', start='2026-11-10', end='2026-11-30', on=True, views=18420, clicks=402),
    dict(id=2, adv='HomeNest Interiors', img='home', title='HomeNest: modular kitchens from ₹89,000', line='Free design visit and 10-year warranty. Book this month.', cta='Book a visit', href='#sponsored-2', start='2026-11-12', end='2026-12-14', on=True, views=6210, clicks=97),
]
def sponsor_card(x, where):
    return (f'<a class="sp-card sp-{where}" href="{x["href"]}" target="_blank" rel="sponsored nofollow noopener" data-sp="{x["id"]}" aria-label="Sponsored: {E(x["title"])}">'
            f'<span class="sp-img" style="background-image:url(assets/posters/{x["img"]}.jpg)"></span>'
            f'<span class="sp-body"><span class="sp-tag">Sponsored<span class="sp-sample"> · Sample</span></span><b class="sp-title">{E(x["title"])}</b><span class="sp-line">{E(x["line"])}</span>'
            f'<span class="sp-cta">{E(x["cta"])}<i data-lucide="arrow-right"></i></span></span></a>')
def sponsor_slot(where):
    today = '2026-11-13'  # prototype date, same as admin TODAY
    live = [x for x in SPONSORS if x['on'] and x['start'] <= today <= x['end']]  # only live ads reach Home (same rule as the admin status)
    if not live: return ''
    return f'<div class="sp-slot sp-slot-{where}" data-sp-slot>' + ''.join(sponsor_card(x, where) for x in live) + '</div>'
home = home.replace('{{SIDE}}', sponsor_slot('side') + side_panel())
_spi = sponsor_slot('inline')  # D-121: no live ad, no section, so Top deals moves up under Hot deals
home = home.replace('{{SPONSOR_INLINE}}', f'<section class="section sp-inline" aria-label="Sponsored"><div class="container">{_spi}</div></section>' if _spi else '')
home = home.replace('{{PROMO_STRIP}}', '')  # D-107: promo strip withdrawn (DEV-027); Sale posters carry promotions (meeting §1.3)
open(os.path.join(ROOT, 'index.html'), 'w').write(home)
print('index.html', len(deals), 'deals')

def build_listings():
    """Listing pages, search, category / store feeds, indexes, deal index. Runs after the detail section because about_block uses clean_html."""
    CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12 5 5L20 7"/></svg>'
    SLUG = {**{c['name']: c['slug'] for c in CATS}, **{'s:' + x['name']: x['slug'] for x in SHOPS}, 's:Others': 'others'}
    def opt(name, value, label, n=None):  # D-118: no deal counts in the filters; data-s is the option's name in the page link
        s = SLUG.get(('s:' if name == 'store' else '') + value) if name in ('cat', 'store') else value.lower().replace('fresh', 'today')
        s = s or re.sub(r'[^a-z0-9]+', '-', value.lower()).strip('-')
        return f'<label class="opt"><input type="checkbox" name="{name}" value="{E(value)}" data-s="{E(s)}"><span class="box">{CHECK}</span><span class="txt">{E(label)}</span></label>'
    nearby_cats = sorted(CATS, key=lambda c: -c['total'])
    def nearby_links(exclude=None):
        return ' · '.join(f'<a href="{c["page"]}">{E(c["name"])}</a>' for c in [c for c in nearby_cats if c['name'] != exclude][:3])
    fresh_rail = carousel(''.join(card(d) for d in PAGES['fresh']['items'][:12]))
    def about_block(title, html_text):
        return f'<details><summary>About {E(title)}</summary><div class="about-text">{clean_html(html_text)}</div></details>' if html_text else ''

    def build_listing(fname, title, rule, sort, items, kind='listing', crumbs=None, lock=(), hide=(), seo_title=None, seo_desc=None, about=None, nearby_exclude=None):
        """One listing component for type pages, search, category, store and store+category feeds (D-045, D-075)."""
        catcounts = {}; storecounts = {}
        for d in items: catcounts[d['cat']] = catcounts.get(d['cat'], 0) + 1; storecounts[d['store']] = storecounts.get(d['store'], 0) + 1
        allcats = sorted(catcounts, key=lambda c: -catcounts[c]) + [c for c in cats if c not in catcounts]
        cat_opts = ''.join(opt('cat', c, CN(c), catcounts.get(c, 0)) for c in allcats)
        store_opts = ''.join(opt('store', x, x, storecounts.get(x, 0)) for x in [n for n, _ in stores])
        types = ['Fresh', 'Top', 'Loot', 'Pantry']  # D-117: every deal is New, so New is not a filter; the Fresh type reads "Posted today"
        type_opts = ''.join(opt('type', t, TYPELABEL[t], sum(1 for d in items if t in d['types'])) for t in types)
        crumbs = crumbs or [('index.html', 'Home'), (None, title)]
        crumb_html = '<i data-lucide="chevron-right"></i>'.join(f'<a href="{h}">{E(t)}</a>' if h else f'<span>{E(t)}</span>' for h, t in crumbs)
        locked = ''.join(f'<span class="chip-x is-locked"><i data-lucide="lock"></i>{E(l)}</span>' for l in lock)
        footer = FOOTER
        if about: footer = re.sub(r'<details><summary>About OfferTag deals</summary>.*?</details>', lambda m: about, footer, count=1, flags=re.S)
        out = fill(tpl_list, TITLE=E(title), RULE=E(rule), SORT=sort, SLUG=fname.rsplit('.', 1)[0], COUNT=str(len(items)), HEADER=HEADER, FOOTER=footer, MENU_SHEET=MENU, SEARCH_SHEET=SEARCH_SHEET, NAV=nav(fname), COMMUNITY=community(False),
                   PAGE_KIND='listing" data-kind="' + kind, CRUMBS=crumb_html, LOCKED=locked, CAT_OPTS=cat_opts, STORE_OPTS=store_opts, TYPE_OPTS=type_opts,
                   CAT_HIDDEN='hidden' if 'cat' in hide else '', STORE_HIDDEN='hidden' if 'store' in hide else '', TYPE_HIDDEN='hidden' if 'type' in hide else '',
                   NEARBY=nearby_links(nearby_exclude), FRESH_RAIL=fresh_rail, CARDS=''.join(card(d, wrap=False) for d in items))
        if seo_title: out = out.replace('<title>' + E(title) + ' — OfferTag</title>', '<title>' + E(seo_title) + '</title>', 1)
        if seo_desc: out = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="' + E(seo_desc) + '">', out, count=1)
        if fname == 'fresh.html':  # D-104: pinned slots repeat every PIN_EVERY cards on Fresh only; listing.js places them
            out = out.replace('<body data-page=', f'<body data-pin-every="{PIN_EVERY}" data-pins="{",".join(str(d["id"]) for d in pinned)}" data-page=', 1)
        open(os.path.join(ROOT, fname), 'w').write(out)
        return len(items)

    # type pages (unchanged set): Deal type facet hidden (D-075)
    for slug, pg in PAGES.items():
        n = build_listing(slug + '.html', pg['title'], pg['rule'], pg['sort'], pg['items'], kind='type', hide=('type',))
        print(slug + '.html', n, 'deals')

    # search results (/deals/search?q=): all deals; listing.js applies the old LIKE rule on title + category + store and drops pinned when q is present (W14)
    build_listing('search.html', 'Search', 'Deals, stores and categories', 'newest', sorted(deals, key=lambda d: d['agemin']), kind='search', crumbs=[('index.html', 'Home'), (None, 'Search')])
    print('search.html')

    # category feeds (/products/{cat}-deals): one per active category; SEO title/description = old formulas (W19); About = categories.description
    for c in CATS:
        items = [d for d in sorted(deals, key=lambda d: d['agemin']) if d['cat'] == c['name']]
        build_listing(c['page'], f"{c['name']} deals", f"All stores · {c['total']:,} listed all time", 'recommended', items, kind='category', crumbs=[('index.html', 'Home'), ('categories.html', 'Categories'), (None, c['name'])],
                      lock=(c['name'],), hide=('cat',), seo_title=c['title'], seo_desc=c['description'], about=about_block(c['name'], c['footer_html']), nearby_exclude=c['name'])
    print('category pages', len(CATS))

    # store feeds (/shops/{shop}) and store+category (/shops/{shop}/{cat}) for pairs with a deal in the snapshot
    combos = 0
    for x in SHOPS:
        items = [d for d in sorted(deals, key=lambda d: d['agemin']) if d['store'] == x['name']]
        build_listing(x['page'], f"{x['name']} deals", f"All categories · {x['total']:,} listed all time", 'recommended', items, kind='store', crumbs=[('index.html', 'Home'), ('stores.html', 'Stores'), (None, x['name'])],
                      lock=(x['name'],), hide=('store',), seo_title=x['title'], seo_desc=x['description'], about=about_block(x['name'], x['footer_html']))
        for c in CATS:
            sub = [d for d in items if d['cat'] == c['name']]
            if not sub: continue
            # old buildFooterDescription: category text + shop text only for Amazon/Flipkart × its 21-category whitelist, else category text, else shop text
            wl = x['name'] in ('Amazon', 'Flipkart') and c['slug'] in ('tv_appliances','mobile','amazon_pantry','kitchen','luggage','footwear','beauty','personal_care','bags','computers_laptops','earphones_headphones','health','clothing','deodrants_perfumes','baby','grocery','home_decore','pen_drive','accessories','watch','electronics')
            ab = about_block(f"{c['name']} from {x['name']}", (c['footer_html'] + x['footer_html']) if wl else (c['footer_html'] or x['footer_html']))
            t = f"OfferTag: {c['name']} Loot Deals & Hot Shopping Deals Online From {x['name']}"
            de = f"{c['name']} Loot Deals & Hot Shopping Deals Online From {x['name']}. Grab Best Discount Deals & Latest Discount Offers On {c['name']} From {x['name']} At OfferTag. Shop Now"
            build_listing(f"store-{x['slug']}-{c['slug']}.html", f"{c['name']} deals from {x['name']}", f"{len(sub)} today", 'recommended', sub, kind='combo', crumbs=[('index.html', 'Home'), ('stores.html', 'Stores'), (x['page'], x['name']), (None, c['name'])],
                          lock=(x['name'], c['name']), hide=('store', 'cat'), seo_title=t, seo_desc=de, about=ab, nearby_exclude=c['name']); combos += 1
    print('store pages', len(SHOPS), '+ combos', combos)

    # categories index and stores index (D-065): top 8 by live total, then A–Z; zero greyed, still linked
    tpl_index = open(os.path.join(HERE, 'index-list.template.html')).read()
    def index_rows(rows, avatar=False):
        top = sorted(rows, key=lambda r: -r['total'])[:8]; rest = sorted([r for r in rows if r not in top], key=lambda r: r['name'].lower())
        return ''.join(f'<li class="{"is-zero" if r["total"] == 0 else ""}"><a href="{r["page"]}">{("<span class=\"avatar\" aria-hidden=\"true\">" + E(r["name"][0]) + "</span>") if avatar else ""}<span class="nm">{E(r["name"])}</span><span class="cnt">{r["total"]:,}</span><i data-lucide="chevron-right"></i></a></li>' for r in top + rest)
    open(os.path.join(ROOT, 'categories.html'), 'w').write(fill(tpl_index, TITLE='Categories', DESC='Every deal category on OfferTag with the number of deals listed.', RULE=f'{len(CATS)} categories', FIND='<label class="input-wrap index-find"><i data-lucide="search"></i><input class="input" type="search" id="index-find" placeholder="Find a category" aria-label="Find a category"></label>', ROWS=index_rows(CATS), NOTE='Counts are deals listed all time on offertag.in (live totals, 11 Nov 2026); the first eight are the largest, the rest A–Z. Categories with no deals stay listed so links and search results keep working.', HEADER=HEADER, NAV=nav('categories.html'), COMMUNITY=community(True), FOOTER=FOOTER, MENU_SHEET=MENU, SEARCH_SHEET=SEARCH_SHEET))
    open(os.path.join(ROOT, 'stores.html'), 'w').write(fill(tpl_index, TITLE='Stores', DESC='Every store OfferTag tracks with the number of deals listed.', RULE=f'{len(SHOPS)} stores', FIND='', ROWS=index_rows(SHOPS, avatar=True), NOTE='Counts are deals listed all time on offertag.in (live totals, 11 Nov 2026); the first eight are the largest, the rest A–Z. Store logos come from Catalogue → Shops (shop_logo); the prototype shows the initial.', HEADER=HEADER, NAV=nav('stores.html'), COMMUNITY=community(True), FOOTER=FOOTER, MENU_SHEET=MENU, SEARCH_SHEET=SEARCH_SHEET))
    print('categories.html', len(CATS), '· stores.html', len(SHOPS))

    # deal index for the search sheet and header suggestions (same fields the cards carry)
    idx = [dict(id=d['id'], page=d['page'], t=d['t'], p=d['p'], m=d['m'], pct=int(d['pct']), store=d['store'], cat=d['cat'], file=d['file'], age=d['agemin'], pinned=bool(d.get('pinned'))) for d in sorted(deals, key=lambda d: d['agemin'])]
    open(os.path.join(ROOT, 'js', 'deals-index.js'), 'w').write('/* deals-index.js — generated by build.py: the 42 snapshot deals + catalogue for search suggestions (Law 15: same data as the cards) */\nwindow.OT_DEALS = ' + json.dumps(idx, ensure_ascii=False) + ';\nwindow.OT_CAT = ' + json.dumps(dict(cats=[dict(name=c['name'], slug=c['slug'], total=c['total'], page=c['page']) for c in CATS], shops=[dict(name=x['name'], slug=x['slug'], total=x['total'], page=x['page']) for x in SHOPS]), ensure_ascii=False) + ';\n')
    print('js/deals-index.js')




# ---------------- Deal detail pages (S12; contract design-system/ia/deal-content-contract.md, D-077–D-081) ----------------
from datetime import datetime
from urllib.parse import quote, urlsplit, urlunsplit, parse_qsl, urlencode
from html.parser import HTMLParser
tpl_detail = open(os.path.join(HERE, 'detail.template.html')).read()
HEADER_DETAIL = HEADER.replace('<a class="logo"', '<a class="btn btn-ghost header-back" href="index.html"><i data-lucide="chevron-left"></i>Deals</a>\n      <a class="logo"', 1).replace('<a class="btn btn-outline" href="login.html" data-signin-open data-when-guest>', '<button class="btn btn-ghost btn-icon share-native" id="share-native" type="button" aria-label="Share"><i data-lucide="share-2"></i></button>\n        <a class="btn btn-outline" href="login.html" data-signin-open data-when-guest>', 1)
TYPELABEL = {'Top': 'Top deal', 'Loot': 'Loot', 'New': 'New', 'Pantry': 'Pantry', 'Fresh': 'Posted today'}
STORE_TAG = {'amazon.in': ('tag', 'offertag-21'), 'flipkart.com': ('affid', 'offertag'), 'dl.flipkart.com': ('affid', 'offertag')}
STRIP_PARAMS = {'tag', 'ascsubtag', 'affid', 'affExtParam1'}
# store default steps (Catalogue → Shops, `shop_steps`): what the live site shows today, step 1 reworded per D-080
SHOP_STEPS = {'*': ['Open the deal page', 'Add to cart', 'Login or Register', 'Update your shipping details', 'Pay by Credit/Debit card, Net banking or COD']}

def tag_link(href):
    """§4.6 — strip affiliate params, add the store tag by host."""
    try: u = urlsplit(href)
    except Exception: return href
    host = u.netloc.lower().replace('www.', '')
    q = [(k, v) for k, v in parse_qsl(u.query, keep_blank_values=True) if k not in STRIP_PARAMS]
    for h, (k, v) in STORE_TAG.items():
        if host.endswith(h): q.append((k, v)); break
    return urlunsplit((u.scheme, u.netloc, u.path, urlencode(q), u.fragment))
def domain(href):
    try: return urlsplit(href).netloc.lower().replace('www.', '') or href
    except Exception: return href

ALLOWED = {'p', 'br', 'ul', 'ol', 'li', 'strong', 'em', 'a', 'h3', 'img'}
MAP = {'b': 'strong', 'i': 'em', 'h1': 'h3', 'h2': 'h3', 'h4': 'h3', 'h5': 'h3', 'h6': 'h3'}
DROP = {'script', 'style', 'iframe', 'form', 'input', 'button', 'select', 'textarea', 'noscript', 'svg'}
class Sanitizer(HTMLParser):
    """§4.1, §4.3, §4.6, §4.7 — streaming allow-list sanitiser; emits well-formed HTML."""
    def __init__(self): super().__init__(convert_charrefs=True); self.out = []; self.stack = []; self.drop = 0
    def handle_starttag(self, tag, attrs):
        tag = tag.lower()
        if self.drop or tag in DROP: self.drop += 1 if tag in DROP else 0; return
        tag = MAP.get(tag, tag)
        if tag not in ALLOWED: return
        a = dict(attrs)
        if tag == 'a':
            href = (a.get('href') or '').strip()
            if not href.startswith(('http://', 'https://')): return
            self.out.append('<a href="%s" target="_blank" rel="nofollow sponsored noopener">' % html.escape(tag_link(href), quote=True)); self.stack.append('a'); return
        if tag == 'img':
            src = (a.get('src') or '').strip()
            if src.startswith('http'): self.out.append('<img src="%s" alt="%s" loading="lazy">' % (html.escape(src, quote=True), html.escape(a.get('alt') or '', quote=True)))
            return
        if tag == 'br': self.out.append('<br>'); return
        self.out.append('<%s>' % tag); self.stack.append(tag)
    def handle_endtag(self, tag):
        tag = tag.lower()
        if tag in DROP: self.drop = max(0, self.drop - 1); return
        if self.drop: return
        tag = MAP.get(tag, tag)
        if tag in ALLOWED and tag in self.stack:
            while self.stack:
                t = self.stack.pop(); self.out.append('</%s>' % t)
                if t == tag: break
    def handle_data(self, data):
        if not self.drop: self.out.append(html.escape(data, quote=False))
    def result(self):
        while self.stack: self.out.append('</%s>' % self.stack.pop())
        return ''.join(self.out)

def clean_html(raw, title=''):
    """§4 — same function for new content on save and legacy rows on render."""
    x = raw or ''
    x = re.sub(r'<(script|style|iframe|noscript)[^>]*>[\s\S]*?</\1>', '', x, flags=re.I)                                                    # 4.1
    x = re.sub(r'<(div|p|span)[^>]*>\s*<a[^>]*href="[^"]*(whatsapp\.com|t\.me)[^"]*"[^>]*>[\s\S]*?</a>\s*(&nbsp;|\s)*</\1>', '', x, flags=re.I)  # 4.2 pasted channel buttons
    x = re.sub(r'<a[^>]*href="[^"]*(whatsapp\.com|t\.me)[^"]*"[^>]*>[\s\S]*?</a>', '', x, flags=re.I)
    x = re.sub(r'<p[^>]*>(?:(?!</p>)[\s\S])*?(Associates Program|affiliate advertising)[\s\S]*?</p>', '', x, flags=re.I)                   # 4.2 affiliate paragraphs
    sz = Sanitizer(); sz.feed(x); x = sz.result()                                                                                           # 4.3, 4.6, 4.7
    x = re.sub(r'\s+', ' ', x)
    x = re.sub(r'<(p|li|h3)>(?:\s|&nbsp;|<br>)*</\1>', '', x)                                                                              # 4.5 empty blocks
    x = re.sub(r'(?:<br>\s*){2,}', '</p><p>', x)                                                                                            # 4.5 br runs → paragraph break
    x = re.sub(r'<p>\s*</p>', '', x)
    # link text that is a URL → domain
    x = re.sub(r'(<a href="[^"]*"[^>]*>)\s*(https?://[^<\s]+)\s*(</a>)', lambda m: m.group(1) + domain(m.group(2)) + m.group(3), x)
    # 4.4 leading h3 equal to the title (or its first 60 chars)
    tt = re.sub(r'[^a-z0-9]+', ' ', title.lower()).strip()
    for _ in range(2):  # leading h3 or paragraph that repeats the title (or a truncation / "Flat …" variant of it)
        m = re.match(r'\s*<(h3|p)>(.*?)</\1>', x)
        if not m: break
        t = re.sub(r'[^a-z0-9]+', ' ', html.unescape(re.sub(r'<[^>]+>', '', m.group(2))).lower()).strip()
        if t and (t == tt or t == tt[:60].strip() or tt.startswith(t[:40]) or t.endswith(tt) or (len(t) < 90 and tt in t)): x = x[m.end():]
        else: break
    return x.strip()[:20000]

GENERIC = {'click here', 'buy now', 'link', 'here', 'shop now', 'grab deal', 'buy'}
def text_of(h): return html.unescape(re.sub(r'<[^>]+>', '', h)).strip()
def blocks_of(x):
    """cleaned HTML → list of (kind, html) blocks: h3 · p · ul/ol · img · other"""
    out = []
    for m in re.finditer(r'<(h3|p|ul|ol)>([\s\S]*?)</\1>|<img [^>]*>', x):
        if m.group(1): out.append((m.group(1), m.group(2)))
        else: out.append(('img', m.group(0)))
    return out
def split_blocks(x, d):
    """§5 — fills blank structured fields from the cleaned description; returns the remaining description HTML."""
    bl = blocks_of(x); keep = []
    i = 0
    while i < len(bl):
        kind, body = bl[i]
        if kind == 'h3' and i + 1 < len(bl) and bl[i + 1][0] in ('ul', 'ol'):
            head = text_of(body).lower().rstrip(':'); items = [text_of(li) for li in re.findall(r'<li>([\s\S]*?)</li>', bl[i + 1][1])]
            if head in ('key practical uses', 'highlights', 'key features', 'features') and not d['highlights']: d['highlights'] = items; i += 2; continue
            if head in ('specifications', 'specs', 'specification') and not d['specs']:
                d['specs'] = [dict(label=t.split(':', 1)[0].strip(), value=t.split(':', 1)[1].strip()) if ':' in t else dict(label='', value=t) for t in items]; i += 2; continue
        keep.append((kind, body)); i += 1
    # links: ≥ 3 generic-label anchors
    anchors = re.findall(r'<a href="([^"]*)"[^>]*>([\s\S]*?)</a>', x)
    generic = [a for a in anchors if text_of(a[1]).lower().strip('.: ') in GENERIC or re.match(r'^[a-z0-9.-]+\.[a-z]{2,}$', text_of(a[1]).lower())]
    if len(generic) >= 3 and not d['links']:
        rows = []; nk = []
        for kind, body in keep:
            if kind != 'p': nk.append((kind, body)); continue
            lines = re.split(r'<br>', body); left = []
            for ln in lines:
                am = re.search(r'<a href="([^"]*)"[^>]*>([\s\S]*?)</a>', ln)
                if am and (text_of(am.group(2)).lower().strip('.: ') in GENERIC or re.match(r'^[a-z0-9.-]+\.[a-z]{2,}$', text_of(am.group(2)).lower())):
                    label = text_of(ln[:am.start()]); label = re.sub(r'^\s*\d+[.)]\s*', '', label).strip(' :-–—'); rows.append(dict(label=label or domain(am.group(1)), url=am.group(1)))
                else: left.append(ln)
            body2 = '<br>'.join(l for l in left if text_of(l) or '<img' in l)
            if text_of(body2) or '<img' in body2: nk.append(('p', body2))
        if rows:
            if len({r['label'] for r in rows}) == 1 and len(rows) > 1: rows = [dict(label=f"{r['label']} {k + 1}", url=r['url']) for k, r in enumerate(rows)]  # identical labels → numbered
            d['links'] = rows; keep = nk
    # note
    if not d['note']:
        nk = []
        for kind, body in keep:
            t = text_of(body) if kind == 'p' else ''
            m = re.match(r'^\s*note\s*[:\-–—]?\s*(.+)$', t, flags=re.I)
            if m and not d['note']: d['note'] = m.group(1).strip()[:140]; continue
            nk.append((kind, body))
        keep = nk
    # coupon detection
    if not d['coupon']:
        m = re.search(r'\b(?:code|coupon)[:\s]+([A-Z0-9]{4,15})\b', text_of(x))
        if m: d['coupon'] = m.group(1)
    return ''.join('<%s>%s</%s>' % (k, b, k) if k != 'img' else b for k, b in keep)

def steps_split(d):
    """§6 — legacy deal_step → exception lines (lines not in the store default)."""
    default = SHOP_STEPS.get(d['store'], SHOP_STEPS['*'])
    norm = lambda t: re.sub(r'^(click on |click here to visit the |visit the |open the )', '', t.lower().strip(' .')).replace('deal page', '')
    dn = {norm(t) for t in default}
    lines = []
    raw = re.sub(r'<p[^>]*>(?:(?!</p>)[\s\S])*?(Associates Program|affiliate advertising)[\s\S]*?</p>', '', d.get('steps_raw') or '', flags=re.I)
    for part in re.split(r'<br\s*/?>|</p>|</li>', raw):
        t = text_of(part)
        if t: lines.append(t)
    exc = [t for t in lines if norm(t) not in dn and not re.match(r'^(we are a participant|offertag is a participant)', t.lower())]
    return default, (d['step_exceptions'] or exc)

SAMPLE_COMMENTS = {
    0: [  # 12 comments on the first deal: replies, likes, collapsed replies, "Show more" after 10
        ('Rahul', 'Price back to ₹9,500 now, still a good deal for a king size.', '1 h', 3, [('OfferTag', True, 'Still ₹9,000 for us with the coupon applied at checkout.', '40 min', 1), ('Rahul', False, 'Got it, worked with the code. Thanks!', '35 min', 0), ('Sneha', False, 'Same here, ₹9,000 on the app.', '20 min', 0)]),
        ('Priya', 'Does it come with the mattress or only the frame?', '2 h', 0, [('OfferTag', True, 'Frame, headboard and MDF base only. Mattress is separate.', '1 h', 2)]),
        ('Amit', 'Ordered one. Delivery shows 6 days to Pune.', '3 h', 1, []),
        ('Deepak', 'MRP is inflated, but ₹9k for engineered wood king is fine.', '3 h', 4, []),
        ('Kavya', 'Any idea if the beige colour is same as photo? Seller photos here: https://www.amazon.com/dp/B0GQBSVK7M/', '4 h', 0, [('Arjun', False, 'Looks lighter in person. Also listed on https://www.flipkart.com/about-space-bed/p/itm123 and www.pepperfry.in/beds', '3 h', 1)]),
        ('Mohit', 'Out of stock for 400001 pincode.', '5 h', 2, []),
        ('Neha', 'Coupon worked, paid ₹8,900 with bank offer.', '5 h', 6, []),
        ('Suresh', 'Assembly took about 40 minutes, two people needed.', '6 h', 1, []),
        ('Ankit', 'Good deal. Was ₹11,200 last week.', '7 h', 0, []),
        ('Ritu', 'Returns allowed? Page says 10 days.', '8 h', 0, []),
        ('Vikram', 'Thanks OfferTag, bought for the guest room.', '9 h', 2, []),
        ('Pooja', 'Price alert please if it drops under ₹8k.', '10 h', 0, []),
    ],
    1: [('Sameer', 'Great price for a 9 W, bought 6.', '30 min', 2, []), ('Farah', 'Only 1 per order for me.', '1 h', 0, [])],
}
# D-149: links in comments are plain text; the same trim as js/detail.js trimLinks() and the API on save
_TL_MD = re.compile(r'\[([^\]]+)\]\(([^)\s]+)\)')
_TL_COM = re.compile(r'(?<![\w./@-])(?:https?://)?(?:www\.)?((?:[a-z0-9-]+\.)*[a-z0-9-]+)\.com(?:/(?=[\s.,;:!?)]|$))?(?![\w-]|\.[a-z0-9])', re.I)
_TL_PROTO = re.compile(r'\bhttps?://(?:www\.)?', re.I)
_TL_WWW = re.compile(r'(?<![\w./-])www\.', re.I)
def trim_links(s):
    return _TL_WWW.sub('', _TL_PROTO.sub('', _TL_COM.sub(r'\1', _TL_MD.sub(r'\1 (\2)', s))))
def comment_li(name, text, when, likes, admin=False, reply=False, hidden=False):
    text = trim_links(text)
    init = name[0].upper()
    acts = f'<div class="c-acts"><button class="btn btn-ghost like" type="button" aria-pressed="false"><i data-lucide="heart"></i><span>{likes}</span></button>' + ('' if reply else '<button class="btn btn-ghost reply-btn" type="button"><i data-lucide="reply"></i>Reply</button>') + '<button class="btn btn-ghost c-del" type="button"><i data-lucide="trash-2"></i>Delete</button></div>'
    role = '<span class="badge badge-secondary">OfferTag</span>' if admin else ''
    return f'<li class="comment"{" hidden" if hidden else ""}><div class="avatar{" is-admin" if admin else ""}" aria-hidden="true">{init}</div><div class="who"><b>{E(name)}</b>{role}<time>{when}</time></div><p class="text">{E(text)}</p>{acts}'
def comments_html(idx):
    out = []
    for n, (name, text, when, likes, replies) in enumerate(SAMPLE_COMMENTS.get(idx, [])):
        li = comment_li(name, text, when, likes, hidden=n >= 10)
        rs = ''.join(comment_li(rn, rt, rw, rl, admin=ra, reply=True, hidden=k >= 2) + '</li>' for k, (rn, ra, rt, rw, rl) in enumerate(replies))
        li += f'<ol class="replies">{rs}</ol>'
        if len(replies) > 2: li += f'<button class="btn btn-link more-replies" type="button">View {len(replies) - 2} more {"reply" if len(replies) - 2 == 1 else "replies"}</button>'
        out.append(li + '</li>')
    return ''.join(out)
def posted_iso(p):
    try: return datetime.strptime(p, '%a, %b %d, %Y %I:%M %p').strftime('%Y-%m-%dT%H:%M:00+05:30')
    except Exception: return ''

audit = []
for idx, d in enumerate(deals + extras):
    pool = deals
    same_cat = [x for x in pool if x is not d and x['cat'] == d['cat']]
    same_store = [x for x in pool if x is not d and x['store'] == d['store'] and x not in same_cat]
    related = (same_cat + same_store)[:8]
    # ---- contract: clean → split → steps
    cleaned = clean_html(d['desc_raw'], d['t'])
    desc = split_blocks(cleaned, d) if not any((d['highlights'], d['specs'], d['links'])) else cleaned
    default_steps, exceptions = steps_split(d)
    audit.append((d['file'], len(d['highlights']), len(d['specs']), len(d['links']), bool(d['note']), d['coupon'], len(text_of(desc))))
    types = [TYPELABEL[t] for t in d['types'] if t not in ('Fresh', 'New')] or ['New']
    sale = d['p'] <= 0
    share_text = f"{d['t']}\nhttps://www.offertag.in/d/{d['id']}\n" + (f"Up to {d['pct']}% off" if sale else f"MRP {inr(d['m'])} → {inr(d['p'])} ({d['pct']}% off)")
    link = tag_link(d['link']) if d['link'].startswith('http') else d['link']
    # ---- blocks (each empty string when blank)
    coupon = f'<div class="coupon"{"" if d["coupon"] else " hidden"}><span class="lbl">Code</span><span class="code">{E(d["coupon"] or "SAVE20")}</span><button class="btn btn-outline btn-sm" type="button" data-copy="{E(d["coupon"] or "SAVE20")}"><i data-lucide="copy"></i><span>Copy</span></button></div>' + (f'<p class="coupon-terms">{E(d["coupon_terms"])}</p>' if d['coupon_terms'] else '')
    coupon_bar = f'<div class="coupon"{"" if d["coupon"] else " hidden"}><span class="code">{E(d["coupon"] or "SAVE20")}</span><button class="btn btn-ghost btn-sm btn-icon" type="button" data-copy="{E(d["coupon"] or "SAVE20")}" aria-label="Copy code"><i data-lucide="copy"></i></button></div>'
    caption = f'<div class="caption"><i data-lucide="trending-down"></i>{E(d["caption"])}</div>' if d['caption'] else ''
    offers = ('<ul class="offers">' + ''.join(f'<li><i data-lucide="badge-percent"></i>{E(o)}</li>' for o in d['offers']) + '</ul>') if d['offers'] else ''
    note = f'<p class="note"><i data-lucide="circle-alert"></i>{E(d["note"])}</p>' if d['note'] else ''
    highlights = ('<section class="block highlights" aria-labelledby="h-hl"><h2 id="h-hl">Highlights</h2><ul>' + ''.join(f'<li>{E(h)}</li>' for h in d['highlights']) + '</ul></section>') if d['highlights'] else ''
    links = ('<section class="block links" aria-labelledby="h-links"><h2 id="h-links">Links</h2><ul class="link-rows">' + ''.join(f'<li><a href="{E(tag_link(l["url"]))}" target="_blank" rel="nofollow sponsored noopener"><span class="lbl">{E(l["label"])}</span><span class="dom">{E(domain(l["url"]))}</span><i data-lucide="chevron-right"></i></a></li>' for l in d['links']) + '</ul></section>') if d['links'] else ''
    description = f'<section class="block prose" aria-labelledby="h-desc"><h2 id="h-desc">Description</h2><div>{desc}</div></section>' if text_of(desc) or '<img' in desc else ''
    specs = ('<section class="block specs" aria-labelledby="h-specs"><h2 id="h-specs">Specs</h2><dl>' + ''.join(f'<div><dt>{E(sp["label"])}</dt><dd>{E(sp["value"])}</dd></div>' if sp['label'] else f'<div class="one"><dd>{E(sp["value"])}</dd></div>' for sp in d['specs']) + '</dl></section>') if d['specs'] else ''
    step_items = ''.join(f'<li class="exc">{E(t)}</li>' for t in exceptions) + ''.join((f'<li><a href="{E(link)}" target="_blank" rel="nofollow sponsored noopener">{E(t)}</a> on {E(d["store"])}</li>' if k == 0 else f'<li>{E(t)}</li>') for k, t in enumerate(default_steps))
    steps = f'<details class="block howto"{" open" if exceptions else ""}><summary><h2>How to get it</h2><span class="hint">{len(default_steps) + len(exceptions)} steps at {E(d["store"])}</span><i data-lucide="chevron-down"></i></summary><ol class="steps">{step_items}</ol></details>'
    pricebox = (f'<div class="price-now sale">Up to {d["pct"]}% off</div><div class="price-was">Sale post, prices vary by item</div>' if sale else f'<div class="price-now">{inr(d["p"])}</div><div class="price-was"><span class="mrp">MRP <s>{inr(d["m"])}</s></span><span class="badge badge-secondary">Save {inr(d["save"])} ({d["pct"]}%)</span></div>')
    bar_price = f'<div class="bb-price"><b>Up to {d["pct"]}% off</b></div>' if sale else f'<div class="bb-price"><b>{inr(d["p"])}</b><s>{inr(d["m"])}</s></div>'
    # As the website: the store's logo beside Buy now; related deals as a list in the right column (RelatedSide.tsx)
    slg = store_logo(d['store'])
    store_chip = f'<img class="store-chip" src="{slg}" alt="{E(d["store"])}" loading="lazy">' if slg else f'<span class="store-chip is-text">{E(d["store"])}</span>'
    related_side = ''.join(f'<li><a href="{x["page"]}"><span class="rs-img"><img src="{dimg(x)}" alt="" loading="lazy" width="300" height="300"></span><span class="rs-body"><span class="rs-title">{E(x["t"])}</span>'
                           + (f'<span class="rs-price">Up to {x["pct"]}% off</span>' if x['p'] <= 0 else f'<span class="rs-price">{inr(x["p"])}<s>{inr(x["m"])}</s><em>{x["pct"]}% off</em></span>')
                           + '</span></a></li>' for x in related)
    ncom = len(SAMPLE_COMMENTS.get(idx, [])) if idx < len(deals) else 0
    out = tpl_detail
    for k, v in dict(TITLE=E(d['t']), TITLE_SHORT=E(d['t'] if len(d['t']) <= 48 else d['t'][:47].rstrip() + '…'), FILE=d['file'], PRICE=('Up to ' + d['pct'] + '% off') if sale else inr(d['p']), PRICE_RAW=str(d['p']), MRP=inr(d['m']), PCT=d['pct'], STORE=E(d['store']), CAT=E(CN(d['cat'])), AGE=E(d['agetxt']), POSTED=E(d['posted']), POSTED_ISO=posted_iso(d['posted']),
                     TYPE=''.join(f'<span class="badge badge-outline">{t}</span>' for t in types), LINK=E(link), PRICEBOX=pricebox, BAR_PRICE=bar_price, BADGE=('' if sale else f'<span class="badge badge-default">{d["pct"]}% off</span>'),
                     CAPTION=caption, COUPON=coupon, COUPON_BAR=coupon_bar, OFFERS=offers, NOTE=note, HIGHLIGHTS=highlights, LINKS=links, DESCRIPTION=description, SPECS=specs, STEPS=steps,
                     WA_ICON=_icon(re.match(r'(\w+)', 'whatsapp')), TG_ICON=_icon(re.match(r'(\w+)', 'telegram')), WA='https://wa.me/?text=' + quote(share_text), TG='https://t.me/share/url?url=' + quote(f"https://www.offertag.in/d/{d['id']}") + '&text=' + quote(share_text), SHARE_TEXT=E(share_text),
                     AMZ_SEARCH='https://www.amazon.in/s?k=' + quote(d['t']) + '&tag=offertag-21', FK_SEARCH='https://www.flipkart.com/search?q=' + quote(d['t']) + '&affid=offertag',
                     RELATED=carousel(''.join(card(x) for x in related)), RELATED_SIDE=related_side, STORE_CHIP=store_chip, COMMENTS=comments_html(idx), COMMENT_COUNT=str(ncom), VIEWS=f"{int(d.get('views') or 0):,}", COMMENTS_EMPTY_HIDDEN='' if ncom == 0 else 'hidden', COMMENTS_MORE_HIDDEN='' if ncom > 10 else 'hidden',
                     CAT_PAGE=cat_page(d['cat']), STORE_PAGE=store_page(d['store']), HEADER=HEADER_DETAIL, FOOTER=FOOTER, MENU_SHEET=MENU, SEARCH_SHEET=SEARCH_SHEET).items():
        out = out.replace('{{' + k + '}}', str(v))
    open(os.path.join(ROOT, d['page']), 'w').write(out)
print('detail pages', len(deals) + len(extras))
print('clean/split audit (file, highlights, specs, links, note, coupon, desc chars):'); [print(' ', a) for a in audit if a[3] or a[4] or a[5] or a[1] == 0]

build_listings()

# ---- S14: sign in, forced re-login, account, public delete request (data sheet auth-account.md) ----
def build_auth():
    tpl = open(os.path.join(HERE, 'auth.template.html')).read()
    logo = '<a class="auth-logo" href="index.html" aria-label="OfferTag home"><img src="assets/logo.png" alt="OfferTag"></a>'
    sheets = '<button class="btn btn-outline btn-icon to-top" id="to-top" aria-label="Back to top"><i data-lucide="arrow-up"></i></button>\n<div class="sheet-overlay" id="sheet-overlay" hidden data-state="closed"></div>\n' + MENU + '\n' + SEARCH_SHEET
    def field(label, name, attrs, hint=''):
        h = f' <span>{hint}</span>' if hint else ''
        return f'<label class="field-label">{label}{h}<input class="input" name="{name}" {attrs}></label><p class="form-error" data-err="{name}" role="alert" hidden></p>'
    login = f'''<main class="auth-main"><div class="auth-card">
  <a class="btn btn-ghost btn-icon auth-back" href="index.html" data-back aria-label="Back"><i data-lucide="chevron-left"></i></a>
  {logo}
  {signin_block('<h1 class="auth-title" data-signin-title>Sign in</h1>')}
  <p class="auth-returning"><i data-lucide="info"></i>Used OfferTag before? Sign in once more with Google or an email code. Your account and comments are safe.</p>
</div></main>'''
    relogin = f'''<main class="auth-main"><div class="auth-card auth-card-center">
  {logo}
  <h1 class="auth-title">We moved to a safer sign-in.</h1>
  <p class="signin-sub">Please sign in once more. Your account and comments are safe.</p>
  <a class="btn btn-default auth-cta" href="login.html" data-relogin-signin>Sign in</a>
  <a class="btn btn-link auth-skip" href="index.html" data-relogin-skip>Continue browsing without signing in</a>
</div></main>'''
    account = f'''<main><div class="container narrow"><div class="form-col">
  <div class="crumbs"><a href="index.html">Home</a><i data-lucide="chevron-right"></i><span>Account</span></div>
  <div class="page-head"><h1>Account</h1></div>
  <form class="card form-sec" id="account-form" novalidate>
    {field('Display name', 'name', 'type="text" maxlength="255" autocomplete="name"', 'Shown on your comments')}
    <div class="field-label">Email <span>Your sign-in email</span><p class="form-static" data-user-email></p></div>
    {field('Mobile', 'mobile', 'type="tel" inputmode="numeric" maxlength="10" autocomplete="tel-national"', 'Optional')}
    <div><button class="btn btn-default" type="submit">Save</button></div>
  </form>
  <section class="card form-sec">
    <div class="switch-row"><div><b id="alerts-label">Browser alerts</b><p>Get new deals as alerts on this device.</p></div><button class="switch" type="button" role="switch" aria-checked="false" aria-labelledby="alerts-label" id="alerts-switch"><span></span></button></div>
    <p class="form-note">App alerts are managed in the app.</p>
  </section>
  <section class="card form-sec">
    <div><b>Delete account</b><p class="form-note">Removes your account and comments. Cannot be undone.</p></div>
    <div><button class="btn btn-outline" type="button" id="delete-open">Delete my account</button></div>
    <div class="confirm-panel" id="delete-confirm" hidden>
      <p>This removes your account and comments. It cannot be undone.</p>
      <div class="confirm-actions"><button class="btn btn-default" type="button" id="delete-yes">Delete my account</button><button class="btn btn-ghost" type="button" id="delete-no">Keep my account</button></div>
    </div>
  </section>
</div></div></main>'''
    delete = f'''<main><div class="container narrow"><div class="form-col">
  <div class="crumbs"><a href="index.html">Home</a><i data-lucide="chevron-right"></i><span>Delete account</span></div>
  <div class="page-head"><h1>Delete your OfferTag account</h1></div>
  <p class="form-lead">Signed in? <a href="account.html">Delete from Account</a></p>
  <form class="card form-sec" id="delete-form" novalidate>
    {field('Name', 'name', 'type="text" maxlength="255" autocomplete="name"')}
    {field('Email', 'email', 'type="email" inputmode="email" maxlength="255" autocomplete="email"')}
    {field('Mobile', 'mobile_number', 'type="tel" maxlength="20" autocomplete="tel"')}
    <label class="field-label">Reason <span>Optional</span><textarea class="textarea" name="reason" rows="3"></textarea></label>
    {TURNSTILE}
    <p class="form-error" data-err="turnstile" role="alert" hidden></p>
    <div><button class="btn btn-default" type="submit">Request deletion</button></div>
    <p class="form-note">We delete accounts within 7 days and email you when done.</p>
  </form>
  <div class="card form-sec form-done" id="delete-done" role="status" hidden><i data-lucide="circle-check"></i><b>Request received.</b><p>We delete accounts within 7 days and email you when done.</p><a class="btn btn-outline" href="index.html">Back to deals</a></div>
</div></div></main>'''
    pages = [('login.html', 'Sign in', 'login', 'is-focus', login, False), ('account.html', 'Account', 'account', '', account, True), ('delete-account.html', 'Delete account', 'delete-account', '', delete, True)]
    for fname, title, page, cls, body, chrome in pages:
        open(os.path.join(ROOT, fname), 'w').write(fill(tpl, TITLE=title, PAGE=page, BODY_CLASS=cls, BODY=body, HEADER=HEADER if chrome else '', FOOTER=FOOTER if chrome else '', SHEETS=sheets if chrome else ''))
build_auth()

# ---- S15: contact, error family, legal, blog, OTP email, share card (data sheet static-blog.md; D-061, D-093) ----
def build_static():
    tpl = open(os.path.join(HERE, 'page.template.html')).read()
    sheets = '<button class="btn btn-outline btn-icon to-top" id="to-top" aria-label="Back to top"><i data-lucide="arrow-up"></i></button>\n<div class="sheet-overlay" id="sheet-overlay" hidden data-state="closed"></div>\n' + MENU + '\n' + SEARCH_SHEET
    CH = '<i data-lucide="chevron-right"></i>'
    SITE = 'https://www.offertag.in'
    fresh = PAGES['fresh']['items']
    def write(fname, title, page, body, desc='', head='', chrome=True):
        open(os.path.join(ROOT, fname), 'w').write(fill(tpl, TITLE=E(title), DESC=E(desc), HEAD=head, PAGE=page, BODY_CLASS='', HEADER=HEADER if chrome else '', BODY=body, FOOTER=FOOTER if chrome else '', SHEETS=sheets if chrome else ''))
    def crumbs(*parts): return '<div class="crumbs">' + CH.join(f'<a href="{h}">{E(t)}</a>' if h else f'<span>{E(t)}</span>' for h, t in parts) + '</div>'
    HOME = ('index.html', 'Home')
    grid = '<div class="deal-grid">' + ''.join(card(d, wrap=False) for d in fresh[:12]) + '</div>'
    fresh_section = f'<section class="section" aria-labelledby="h-fresh"><div class="section-head"><h2 id="h-fresh">Top deals</h2><a class="view-all" href="fresh.html">See all{CH}</a></div>{grid}</section>'

    # Contact & feedback (B30, A16)
    seg = ''.join(f'<label><input class="visually-hidden" type="radio" name="feedback" value="{v}"{" checked" if v == 2 else ""}><span>{t}</span></label>' for v, t in ((2, 'Issue'), (1, 'Suggestion'), (3, 'Appreciation')))
    contact = f'''<main><div class="container narrow"><div class="form-col">
  {crumbs(HOME, (None, 'Contact'))}
  <div class="page-head"><h1>Contact</h1></div>
  <section class="card form-sec" aria-label="Ways to reach us">
    <a class="contact-mail" href="mailto:support@offertag.in"><i data-lucide="mail"></i>support@offertag.in</a>
    <div class="contact-actions"><a class="btn btn-default" href="#chat"><i data-lucide="message-circle"></i>Chat with us</a><a class="btn btn-outline" href="#wa" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn-outline" href="#tg" target="_blank" rel="noopener">Telegram</a></div>
  </section>
  <form class="card form-sec" id="feedback-form" novalidate aria-labelledby="h-feedback">
    <h2 class="form-title" id="h-feedback">Send feedback</h2>
    <div class="seg" role="radiogroup" aria-label="Type of feedback">{seg}</div>
    <label class="field-label">Email<input class="input" type="email" name="email" inputmode="email" autocomplete="email" maxlength="255" placeholder="you@example.com"></label><p class="form-error" data-err="email" role="alert" hidden></p>
    <label class="field-label">Message<textarea class="textarea" name="description" rows="5"></textarea></label><p class="form-error" data-err="description" role="alert" hidden></p>
    {TURNSTILE}
    <p class="form-error" data-err="turnstile" role="alert" hidden></p>
    <div><button class="btn btn-default" type="submit">Send</button></div>
    <p class="form-success" id="feedback-done" role="status" hidden><i data-lucide="circle-check"></i>Thanks, we read every message.</p>
  </form>
</div></div></main>'''
    write('contact.html', 'Contact — OfferTag', 'contact', contact, 'Contact OfferTag or send feedback.')

    # FAQ (S16, D-096, DEV-020): new page, same look as Contact; answers follow approved decisions (D-032, D-061, D-094)
    FAQ = [
        ('Deals and prices', [
            ('What is OfferTag?', 'OfferTag finds the best online deals, loot offers and price drops from Amazon, Flipkart, Myntra, Ajio, JioMart and other Indian stores, and posts them through the day.'),
            ('Does OfferTag sell products?', 'No. We only list deals. When you tap Buy, you go to the store’s own website, and the store handles payment, delivery, returns and warranty.'),
            ('Is OfferTag free?', 'Yes. Links on OfferTag are affiliate links: when you buy through them, the store pays us a small commission at no extra cost to you. <a href="disclaimer.html">How we earn</a>'),
            ('Why is the price different on the store?', 'Store prices and stock change fast, sometimes within minutes. Each deal shows when it was posted; always check the final price on the store before you pay.'),
            ('What are Top deals and Loot deals?', 'New deals is every deal we post, newest first. Top deals are the ones more than 25% off, with a few deals our team picks placed along the way. Loot deals are more than 80% off.'),
            ('A deal has expired. How do I tell you?', 'Send us a message from the <a href="contact.html">Contact</a> page with the deal name, and we will remove or update it.'),
        ]),
        ('Alerts and app', [
            ('How do I get deal alerts?', 'Join our WhatsApp or Telegram channel, turn on browser alerts with the bell at the top of the page, or install the Android app. All of them are free.'),
            ('Is there an OfferTag app?', 'Yes, on Android. Get it from Google Play using the link at the bottom of any page.'),
        ]),
        ('Your account', [
            ('Do I need an account?', 'No. You can browse and buy without one. Sign in with Google or your email only if you want to comment on deals.'),
            ('How do I delete my account?', 'Open <a href="delete-account.html">Delete account</a>. Your account and comments are deleted within 7 days.'),
        ]),
    ]
    faq_body = ''.join(f'<section class="faq-group" aria-labelledby="faq-{i}"><h2 id="faq-{i}">{E(g)}</h2>' + ''.join(f'<details class="card faq-item"><summary>{E(q)}<i data-lucide="chevron-down"></i></summary><div class="faq-a">{a}</div></details>' for q, a in items) + '</section>' for i, (g, items) in enumerate(FAQ))
    faq_page = f'''<main><div class="container narrow"><div class="form-col">
  {crumbs(HOME, (None, 'FAQs'))}
  <div class="page-head"><h1>Frequently asked questions</h1><p>Quick answers about deals, alerts and your account</p></div>
  {faq_body}
  <section class="card form-sec faq-more" aria-label="More help"><div><b>Still need help?</b><p>Write to us and we usually reply within a day.</p></div><div class="contact-actions"><a class="btn btn-default" href="contact.html"><i data-lucide="mail"></i>Contact us</a><a class="btn btn-outline" href="#chat"><i data-lucide="message-circle"></i>Chat with us</a></div></section>
</div></div></main>'''
    write('faq.html', 'FAQs — OfferTag', 'faq', faq_page, 'Answers to common questions about OfferTag deals, alerts and accounts.')

    # Error family (B20, D-061): one layout
    search = '<form class="error-search" data-search role="search"><label class="input-wrap"><i data-lucide="search"></i><span class="visually-hidden">Search deals</span><input class="input" type="search" name="q" placeholder="Search deals…" autocomplete="off"></label></form>'
    link = lambda href, t: f'<a class="btn btn-default" href="{href}">{t}</a>'
    retry = lambda t: f'<button class="btn btn-default" type="button" data-reload>{t}</button>'
    for fname, title, sentence, action, extra in (
        ('404.html', 'Page not found', "We couldn't find that page.", link('fresh.html', 'Go to Top deals'), search),
        ('403.html', 'No access', "You don't have access to this.", link('index.html', 'Back to deals'), ''),
        ('500.html', 'Something broke', 'Something broke on our side.', retry('Try again'), ''),
        ('offline.html', 'Offline', "You're offline", retry('Retry'), '')):
        body = f'<main><div class="container narrow"><section class="error-hero"><h1>{E(sentence)}</h1>{action}{extra}</section>{fresh_section}</div></main>'
        write(fname, title + ' — OfferTag', 'error', body)

    # Legal template (D-034: layout only, text as stored; build/legal.json)
    LEGAL = json.load(open(os.path.join(HERE, 'legal.json')))
    LINKS = {'/delete-account': 'delete-account.html', '/disclaimer': 'disclaimer.html'}
    inline = lambda x: re.sub(r'\[\[([^|\]]+)\|([^\]]+)\]\]', lambda m: f'<a href="{LINKS.get(m.group(1), m.group(1))}">{m.group(2)}</a>', E(x))
    slug = lambda x: re.sub(r'[^a-z0-9]+', '-', x.lower()).strip('-')[:60]
    for key, L in LEGAL.items():
        parts = []; toc = []
        for b in L['blocks']:
            if b['t'] == 'p': parts.append(f'<p>{inline(b["x"])}</p>'); continue
            hid = b.get('id') or slug(b['x'])
            if b['t'] == 'h2': toc.append(f'<li><a href="#{hid}">{E(b["x"])}</a></li>')
            parts.append(f'<{b["t"]} id="{hid}">{E(b["x"])}</{b["t"]}>')
        updated = f'<p class="legal-date">{E(L["updated"])}</p>' if L['updated'] else ''
        side = f'<nav class="legal-toc" aria-label="On this page"><div class="legal-toc-title">On this page</div><ol>{"".join(toc)}</ol></nav>' if len(toc) > 1 else ''
        body = f'<main><div class="container narrow">{crumbs(HOME, (None, L["title"]))}<div class="page-head"><h1>{E(L["title"])}</h1></div>{updated}<div class="legal-grid"><article class="legal-body">{"".join(parts)}</article>{side}</div></div></main>'
        write(key + '.html', L['title'] + ' — OfferTag', 'legal', body)

    # Blog (B08, D-061, D-093). Posts are SAMPLE; every deal shown is snapshot data
    POSTS = json.load(open(os.path.join(HERE, 'blog.json')))
    for p in POSTS:
        p['deals'] = [deals[b['deal']] for b in p['body'] if 'deal' in b]
        p['words'] = sum(len((b.get('p') or b.get('h') or '').split()) for b in p['body'])
        p['mins'] = max(1, round(p['words'] / 200))
        p['file'] = f"blog-{p['name']}.html"; p['url'] = f"{SITE}/blog/{p['name']}"
        dt = datetime.strptime(p['date'], '%Y-%m-%d'); p['when'] = f"{dt.day} {dt:%b}"
        p['cover_file'] = deals[p['cover']]['file'] if p['cover'] is not None else None
        p['meta'] = f'<time datetime="{p["date"]}">{p["when"]}</time> · {p["mins"]} min read'
    POSTS.sort(key=lambda p: p['date'], reverse=True)
    def row(p):
        cover = f'<a class="post-cover" href="{p["file"]}" aria-hidden="true" tabindex="-1"><img src="assets/deals/lg/{p["cover_file"]}" alt="" loading="lazy" width="300" height="300"></a>' if p['cover_file'] else ''
        return f'<article class="post-row">{cover}<div class="post-txt"><h2><a href="{p["file"]}">{E(p["title"])}</a></h2><p>{E(p["summary"])}</p><div class="post-meta">{p["meta"]}</div></div></article>'
    def post_card(p):
        # D-109 rev: earlier row size, each post its own card, 2 per row; no cover -> first linked deal's picture
        f = p['cover_file'] or (p['deals'][0]['file'] if p['deals'] else None)
        pic = f'<div class="post-cover"><img src="assets/deals/lg/{f}" alt="" loading="lazy" width="300" height="300"></div>' if f else ''
        return f'<article class="post-card">{pic}<div class="post-txt"><h2><a href="{p["file"]}">{E(p["title"])}</a></h2><p>{E(p["summary"])}</p><div class="post-meta">{p["meta"]}</div><span class="btn btn-outline btn-view" aria-hidden="true">View blog<i data-lucide="arrow-right"></i></span></div></article>'
    pager = f'<nav class="pager" id="blog-pager" aria-label="Pages" hidden><a href="#" aria-label="Previous page"><i data-lucide="chevron-left"></i></a><a href="#" aria-current="page">1</a><a href="#">2</a><a href="#">3</a><a href="#" aria-label="Next page"><i data-lucide="chevron-right"></i></a></nav>'
    index = f'''<main><div class="container narrow blog-wrap">
  {crumbs(HOME, (None, 'Blog'))}
  <div class="page-head"><h1>Blog</h1></div>
  <div id="blog-list"><div class="post-cards">{''.join(post_card(p) for p in POSTS)}</div>{pager}</div>
  <div id="blog-empty" hidden><p class="blog-empty">First posts coming soon</p>{fresh_section}</div>
</div></main>'''
    write('blog.html', 'Blog — OfferTag', 'blog', index, 'Guides and round-ups from OfferTag, with live prices.')

    SH_WA, SH_TG = _icon(re.match(r'(\w+)', 'whatsapp')), _icon(re.match(r'(\w+)', 'telegram'))
    def buy(d): return tag_link(d['link']) if d['link'].startswith('http') else d['link']
    def price(d): return f'<span class="price">{inr(d["p"])}</span><span class="was">{inr(d["m"])}</span>'
    def embed(d, cls=''):  # D-110: picture left, info right; Buy now + basket, store logo beside it; image, title and Buy are the hit areas (D-050)
        lg = store_logo(d['store'])
        st = f'<img class="emb-store" src="{lg}" alt="{E(d["store"])}" loading="lazy">' if lg else f'<span class="emb-store is-text">{E(d["store"])}</span>'
        return f'<article class="deal-embed {cls}"><a class="img" href="{d["page"]}" aria-label="{E(d["t"])}"><img src="assets/deals/lg/{d["file"]}" alt="" loading="lazy" width="300" height="300"></a><div class="body"><div class="meta">{E(d["store"])} · {d["pct"]}% off</div><a class="title" href="{d["page"]}">{E(d["t"])}</a><div class="priceline">{price(d)}</div><div class="emb-acts"><a class="btn btn-outline btn-buy" href="{E(buy(d))}" target="_blank" rel="nofollow sponsored noopener" aria-label="Buy now at {E(d["store"])}">Buy now<i data-lucide="shopping-basket"></i></a>{st}</div></div></article>'
    for p in POSTS:
        parts = []
        lead_i = next((i for i, b in enumerate(p['body']) if 'p' in b), None)
        # D-131: a section (heading and what follows) that introduced deal cards is dropped with them; advice sections and the lead stay
        sec_of, sec = [], -1
        for b in p['body']:
            if 'h' in b: sec += 1
            sec_of.append(sec)
        deal_secs = {sec_of[i] for i, b in enumerate(p['body']) if 'deal' in b and sec_of[i] >= 0}
        for i, b in enumerate(p['body']):
            if i == lead_i or sec_of[i] in deal_secs: continue
            if 'p' in b: parts.append(f'<p>{E(b["p"])}</p>')
            elif 'h' in b: parts.append(f'<h2>{E(b["h"])}</h2>')
            elif 'deal' in b: continue  # D-130: no deal cards inside the article; the post's deals show in the right rail (Deals in this post)
            elif 'img' in b: parts.append(f'<img class="post-img" src="assets/deals/lg/{deals[b["img"]]["file"]}" alt="{E(b["alt"])}" loading="lazy" width="300" height="300">')
        share_text = f"{p['title']}\n{p['url']}"
        # D-111 (option C): one Share button; hover/focus (tap on phones) slides out WhatsApp, Telegram, Copy link
        share = (f'<div class="post-share sh-exp" data-share><button class="sh-trig" type="button" aria-expanded="false" aria-controls="sh-items" data-share-trig><i data-lucide="share-2"></i>Share</button>'
                 f'<span class="sh-items" id="sh-items">'
                 f'<a class="sh-ic sh-wa" href="https://wa.me/?text={quote(share_text)}" target="_blank" rel="noopener" aria-label="Share on WhatsApp" data-tip="WhatsApp">{SH_WA}</a>'
                 f'<a class="sh-ic sh-tg" href="https://t.me/share/url?url={quote(p["url"])}&text={quote(p["title"])}" target="_blank" rel="noopener" aria-label="Share on Telegram" data-tip="Telegram">{SH_TG}</a>'
                 f'<button class="sh-ic sh-copy" type="button" aria-label="Copy link" data-tip="Copy link" data-copy-link="{E(p["url"])}"><i data-lucide="link"></i></button></span></div>')
        count = {}
        for d in p['deals']: count[d['cat']] = count.get(d['cat'], 0) + 1
        top_cat = max(count, key=count.get)
        more = [d for d in fresh if d['cat'] == top_cat and d not in p['deals']][:8]
        if len(more) >= 4: m_title, m_link = f'More in {E(top_cat)}', cat_page(top_cat)
        else:  # D-110: too few in the category, top up from Top deals so the row never looks empty
            more += [d for d in fresh if d not in more and d not in p['deals']][:8 - len(more)]
            m_title, m_link = 'More deals', 'fresh.html'
        more_html = f'<section class="section deals" aria-labelledby="h-more"><div class="section-head"><h2 id="h-more">{m_title}</h2><a class="view-all" href="{m_link}">See all{CH}</a></div>{carousel("".join(card(d) for d in more))}</section>' if more else ''
        related = ''.join(post_card(x) for x in POSTS if x is not p)
        cf = p['cover_file'] or (p['deals'][0]['file'] if p['deals'] else None)
        cover = f'<div class="post-hero"><img src="assets/deals/lg/{cf}" alt="" width="300" height="300"></div>' if cf else ''
        lead = f'<p class="post-lead">{E(p["body"][lead_i]["p"])}</p>' if lead_i is not None else ''
        rail = ''.join(embed(d, 'is-rail') for d in p['deals'])
        short = p['title'] if len(p['title']) <= 48 else p['title'][:47].rstrip() + '…'
        image = f"{SITE}/storage/deal/thumbnail/{p['cover_file'] or p['deals'][0]['file']}"
        ld = json.dumps({'@context': 'https://schema.org', '@type': 'Article', 'headline': p['title'], 'description': p['summary'], 'datePublished': p['date'], 'image': image, 'url': p['url'], 'author': {'@type': 'Organization', 'name': 'OfferTag'}, 'publisher': {'@type': 'Organization', 'name': 'OfferTag'}}, ensure_ascii=False).replace('</', '<\\/')
        head = f'\n<link rel="canonical" href="{p["url"]}">\n<meta property="og:type" content="article">\n<meta property="og:title" content="{E(p["title"])}">\n<meta property="og:description" content="{E(p["summary"])}">\n<meta property="og:image" content="{image}">\n<meta property="og:url" content="{p["url"]}">\n<script type="application/ld+json">{ld}</script>'
        body = f'''<main><div class="container narrow blog-wrap">
  {crumbs(HOME, ('blog.html', 'Blog'), (None, short))}
  <div class="post-grid">
    <div class="post-main">
      <article class="post">
        <header class="post-head{'' if cover else ' no-pic'}">{cover}<div class="post-head-txt"><h1>{E(p['title'])}</h1><div class="post-meta">OfferTag · {p['meta']}</div>{lead}{share}</div></header>
        <div class="post-body">{''.join(parts)}</div>
      </article>
      {more_html}
      <section class="section" aria-labelledby="h-rel"><div class="section-head"><h2 id="h-rel">Related posts</h2></div><div class="post-cards">{related}</div></section>
    </div>
    <aside class="post-rail" aria-labelledby="h-rail"><h2 id="h-rail">Deals in this post</h2><div class="rail-list">{rail}</div></aside>
  </div>
</div></main>'''
        write(p['file'], p['title'] + ' — OfferTag', 'blog-post', body, p['summary'], head)

    # OTP email (B37, D-061): tables and inline styles only, the one image is the logo. Code is the ASCII's SAMPLE
    FONT = "Jost,Arial,Helvetica,sans-serif"
    open(os.path.join(ROOT, 'email-otp.html'), 'w').write(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Your OfferTag sign-in code</title></head>
<body style="margin:0;padding:0;background:#ffffff;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;"><tr><td align="center" style="padding:32px 16px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:480px;">
    <tr><td style="padding:0 0 24px;"><img src="assets/logo.png" alt="OfferTag" height="32" style="display:block;height:32px;width:auto;border:0;"></td></tr>
    <tr><td style="font-family:{FONT};font-size:20px;line-height:28px;font-weight:600;color:#0a0a0a;">Your OfferTag sign-in code</td></tr>
    <tr><td align="center" style="padding:32px 0;font-family:{FONT};font-size:32px;line-height:40px;font-weight:600;letter-spacing:8px;color:#0a0a0a;">482917</td></tr>
    <tr><td style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:22px;color:#404040;">Valid for 10 minutes. If you did not request this, ignore this email.</td></tr>
    <tr><td style="padding:24px 0 0;"><div style="border-top:1px solid #e5e5e5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
    <tr><td style="padding:16px 0 0;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:18px;color:#737373;">OfferTag · <a href="mailto:support@offertag.in" style="color:#737373;">support@offertag.in</a></td></tr>
  </table>
</td></tr></table>
</body></html>
''')

    # Share card (D-050): 1200 × 630 link-preview image; sized in container units so one template scales for review
    def og(d, note):
        sale = d['p'] <= 0
        pr = f'<div class="og-price"><b>Up to {d["pct"]}% off</b></div>' if sale else f'<div class="og-price"><b>{inr(d["p"])}</b><s>{inr(d["m"])}</s><span>{d["pct"]}% off</span></div>'
        return f'<figure class="og-wrap"><div class="og"><div class="og-img"><img src="assets/deals/lg/{d["file"]}" alt=""></div><div class="og-body"><img class="og-logo" src="assets/logo.png" alt="OfferTag"><div class="og-store">{E(d["store"])}</div><div class="og-title">{E(d["t"])}</div>{pr}</div></div><figcaption>{E(note)}</figcaption></figure>'
    cards = og(deals[0], 'Regular deal, long title') + og(deals[19], 'Small price') + og(extras[0], 'Sale post with no single price')
    write('share-card.html', 'Share card — OfferTag', 'share-card', f'<main class="og-page"><h1>Share card</h1><p>1200 × 630, generated per deal.</p>{cards}</main>', chrome=False)
    print('S15 pages: contact, 4 errors, 3 legal, blog +', len(POSTS), 'posts, email-otp, share-card')
build_static()
exec(open(os.path.join(HERE, 'admin.py')).read())  # admin pages (S16 batch A, D-098) — builder session owns build/admin.py
exec(open(os.path.join(HERE, 'routes.py')).read())  # S18 (D-105): every page to the folder of its real address; must run last
