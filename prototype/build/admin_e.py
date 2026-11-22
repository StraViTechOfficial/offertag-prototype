# admin_e.py — admin Security screen (Muiz, 22 Nov): the bot check switch first, flagged IPs below.
# Runs inside build.py's namespace after admin_d.py. Rules: offertag-backend docs/project/features/security.md; APIs #77–80.

SEC_BOT = dict(on=False, by='Adil', at='12 Nov, 14:05')  # SAMPLE: GET /admin/bot-check
SEC_IPS = [  # SAMPLE: GET /admin/flagged-ips
    dict(ip='49.36.212.18', status='flag', why='412 clicks in 10 min', by='auto', added='13 Nov, 09:41', until='14 Nov, 09:41'),
    dict(ip='2409:40c2:1047:8f3a::/64', status='flag', why='96 clicks in 10 min', by='auto', added='13 Nov, 08:17', until='14 Nov, 08:17'),
    dict(ip='103.211.54.7', status='flag', why='318 clicks in 10 min', by='auto', added='12 Nov, 22:03', until='13 Nov, 22:03'),
    dict(ip='157.48.90.201', status='flag', why='1,204 clicks in 10 min', by='auto', added='12 Nov, 19:55', until='13 Nov, 19:55'),
    dict(ip='122.161.66.30', status='allow', why='Office network', by='Adil', added='5 Nov, 11:20', until='Always'),
]

def build_security():
    body = f'''      <div class="page-h">
        <div><h1>Security</h1><p>Tools for when fake visitors flood the site. Real visitors, Google and Shop Now keep working.</p></div>
      </div>
      <section class="panel bc-panel" data-bc>
        <div class="panel-h"><h2>Bot check</h2><span class="tag-sample">Sample</span></div>
        <div class="set-row"><div class="set-l"><b>Bot check for all visitors</b><small>Every visitor to a web page passes Cloudflare’s automatic check first. Real visitors see a 1–3 second check. Google, Bing, Shop Now links and the app are never affected.</small></div><div class="set-c">{sw('data-bc-switch', False, 'Bot check for all visitors')}</div></div>
        <div class="bc-status"><span class="pill pill-withdrawn" data-bc-pill>Off</span><span class="bc-meta" data-bc-meta></span></div>
        <div class="bc-alert" data-bc-alert hidden><i data-lucide="shield-alert"></i><p><b>The bot check is on.</b> Every visitor waits 1–3 seconds before a page opens. Turn it off when the site is back to normal.</p></div>
        <div class="bc-help"><p class="hint-line"><i data-lucide="info"></i>Turn it on when the site slows down from a flood of fake visits. It starts in about 25 seconds and stops in about 15.</p></div>
      </section>
      <section class="panel fl-panel">
        <div class="panel-h"><h2>Flagged IPs</h2><span class="fl-count" data-fl-count></span></div>
        <p class="fl-intro">An IP with over 300 Shop Now clicks in 10 minutes is flagged. It still reaches the store, but without our Amazon tag, and its clicks don’t count as views. Nothing is blocked. A flag clears itself after a day.</p>
        <div class="tbl-wrap"><table class="tbl ltbl fl-tbl">
          <thead><tr><th>IP</th><th>Status</th><th>Why</th><th>Added</th><th>Until</th><th><span class="visually-hidden">Action</span></th></tr></thead>
          <tbody data-fl-rows></tbody></table>
          <p class="empty" data-fl-empty hidden>No flagged IPs. A visitor with over 300 Shop Now clicks in 10 minutes shows up here.</p></div>
      </section>
      <p class="foot-note"><i data-lucide="info"></i><span>Many mobile users in India share one IP, so one flagged IP can be hundreds of real people. Let an IP back in when real shoppers are caught by mistake.</span></p>
{OVERLAY}
{CONFIRM}'''
    shell('admin-security.html', 'Security', 'security', admin_only('Security', body),
          scripts=f'<script>window.ADM_SEC = {jdump(dict(bot=SEC_BOT, ips=SEC_IPS))};</script>\n', after='<script src="js/admin-e.js"></script>\n')

build_security()
print('Admin: Security (admin-security)')
