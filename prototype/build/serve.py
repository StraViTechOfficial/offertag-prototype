"""Local review preview for the prototype (Law 16). Sends no-store so a browser never shows an old copy.

Routing (D-105): every page lives in the folder of its real address, e.g. /fresh-deals → fresh-deals/index.html.
Addresses are served without a trailing slash (as on the live site); /x/ redirects to /x; an unknown address gets 404.html.

Run: python3 design-system/prototype/build/serve.py
Open: http://localhost:8090/
"""
import os
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlsplit, unquote

ROOT = Path(__file__).resolve().parent.parent
PORT = 8090


class Handler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _route(self):
        u = urlsplit(self.path)
        p = unquote(u.path)
        if p != "/" and p.endswith("/") and (ROOT / p.strip("/") / "index.html").is_file():
            return ("redirect", p.rstrip("/") + (("?" + u.query) if u.query else ""))
        f = ROOT / p.lstrip("/")
        if f.is_dir() and (f / "index.html").is_file():
            return ("file", f / "index.html")
        if f.is_file():
            return ("static", None)
        return ("404", ROOT / "404.html")

    def _send_file(self, f, code, head=False):
        data = f.read_bytes()
        self.send_response(code)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        if not head:
            self.wfile.write(data)

    def _handle(self, head=False):
        kind, target = self._route()
        if kind == "redirect":
            self.send_response(301); self.send_header("Location", target); self.end_headers(); return
        if kind == "file":
            return self._send_file(target, 200, head)
        if kind == "404":
            return self._send_file(target, 404, head)
        return super().do_HEAD() if head else super().do_GET()

    def do_GET(self):
        self._handle()

    def do_HEAD(self):
        self._handle(head=True)


ThreadingHTTPServer(("127.0.0.1", PORT), partial(Handler, directory=str(ROOT))).serve_forever()
