"""
DeeprBlu local preview server
------------------------------
This lets you click through the site locally with working clean URLs
(the same behavior GitHub Pages gives you once it's live), instead of
double-clicking index.html directly.

HOW TO USE:
1. Put this file in the same folder as index.html, style.css, etc.
2. Open Terminal, and type:  cd  (with a space after it)
3. Drag that folder into the Terminal window, then press Enter.
4. Type:  python3 preview-server.py
5. Open your browser and go to:  http://localhost:8765

Now every link works exactly like it will on the live site.
Press Control+C in Terminal when you're done to stop the server.
"""

import http.server
import os

ROOT = os.path.dirname(os.path.abspath(__file__))
PORT = 8765

class GHPagesHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def do_GET(self):
        path = self.path.split('?')[0].split('#')[0]
        fs_path = os.path.join(ROOT, path.lstrip('/'))
        if path == '/' or path == '':
            self.path = '/index.html' + self.path[len(path):]
        elif os.path.isfile(fs_path):
            pass
        elif os.path.isfile(fs_path + '.html'):
            self.path = path + '.html' + self.path[len(path):]
        return super().do_GET()

if __name__ == "__main__":
    server = http.server.HTTPServer(("127.0.0.1", PORT), GHPagesHandler)
    print(f"\nPreview server running.\nOpen this in your browser: http://localhost:{PORT}\n\nPress Control+C to stop.\n")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopped.")
