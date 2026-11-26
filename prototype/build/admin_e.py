# admin_e.py — admin Security screen: flagged IPs only (changes.md A-17: no bot check, no Why column, no Always allowed).
# Runs inside build.py's namespace after admin_d.py. Rules: offertag-backend docs/project/features/security.md; APIs #77–80.

SEC_IPS = [  # SAMPLE: GET /admin/flagged-ips
    dict(ip='49.36.212.18', status='flag', why='412 clicks in 10 min', by='auto', added='13 Nov, 09:41', until='14 Nov, 09:41'),
    dict(ip='2409:40c2:1047:8f3a::/64', status='flag', why='96 clicks in 10 min', by='auto', added='13 Nov, 08:17', until='14 Nov, 08:17'),
    dict(ip='103.211.54.7', status='flag', why='318 clicks in 10 min', by='auto', added='12 Nov, 22:03', until='13 Nov, 22:03'),
    dict(ip='157.48.90.201', status='flag', why='1,204 clicks in 10 min', by='auto', added='12 Nov, 19:55', until='13 Nov, 19:55'),
]

def build_security():
    body = f'''      <div class="page-h">
        <div><h1>Security</h1><p>IPs the click counter flagged. Let one back in if real shoppers were caught.</p></div>
      </div>
      <section class="panel fl-panel" data-fl>
        <div class="panel-h"><h2>Flagged IPs</h2><span class="fl-count" data-fl-count></span></div>
        <p class="fl-intro">An IP with over 300 Shop Now clicks in 10 minutes is flagged. It still reaches the store, but without our Amazon tag, and its clicks don’t count as views. Nothing is blocked. A flag clears itself after a day.</p>
        <div class="tbl-wrap"><table class="tbl ltbl fl-tbl">
          <thead><tr><th>IP</th><th>Status</th><th>Added</th><th>Until</th><th><span class="visually-hidden">Action</span></th></tr></thead>
          <tbody data-fl-rows></tbody></table>
          <p class="empty" data-fl-empty hidden>No flagged IPs. A visitor with over 300 Shop Now clicks in 10 minutes shows up here.</p></div>
      </section>
      <p class="foot-note"><i data-lucide="info"></i><span>Many mobile users in India share one IP, so one flagged IP can be hundreds of real people. Let an IP back in when real shoppers are caught by mistake.</span></p>
{OVERLAY}
{CONFIRM}'''
    shell('admin-security.html', 'Security', 'security', admin_only('Security', body),
          scripts=f'<script>window.ADM_SEC = {jdump(dict(ips=SEC_IPS))};</script>\n', after='<script src="js/admin-e.js"></script>\n')

build_security()
print('Admin: Security (admin-security)')
