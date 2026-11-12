"""Local review preview for the prototype (Law 16). Sends no-store so a browser never shows an old copy.

Run: python3 design-system/prototype/build/serve.py
Open: http://localhost:8090/
"""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PORT = 8090


class NoStoreHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


ThreadingHTTPServer(("127.0.0.1", PORT), partial(NoStoreHandler, directory=str(ROOT))).serve_forever()
