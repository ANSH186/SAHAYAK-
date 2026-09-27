#!/usr/bin/env python3
import http.server
import socketserver
import json
import os
import sys

PORT = 5173
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE = os.path.join(BASE_DIR, "data", "nie_north.geojson")

class CampusHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def do_POST(self):
        if self.path == '/api/save':
            content_length = int(self.headers.get('Content-Length', 0))
            post_data = self.rfile.read(content_length)
            
            try:
                data = json.loads(post_data.decode('utf-8'))
                
                # Ensure data directory exists
                os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
                
                # Write formatted GeoJSON directly to data/nie_north.geojson
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(data, f, indent=2, ensure_ascii=False)
                
                print(f"[Auto-Save] Successfully saved {len(data.get('features', []))} features to {DATA_FILE}")

                # Return success response
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                response = {"status": "success", "message": "Changes saved directly to code (data/nie_north.geojson)"}
                self.wfile.write(json.dumps(response).encode('utf-8'))
                return
            except Exception as e:
                print(f"[Error saving]: {e}", file=sys.stderr)
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "error", "message": str(e)}).encode('utf-8'))
                return
        
        self.send_response(404)
        self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

if __name__ == '__main__':
    # Allow socket address reuse to restart quickly without TIME_WAIT issues
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CampusHTTPRequestHandler) as httpd:
        print(f"🚀 NIE North Campus Server running at http://localhost:{PORT}")
        print(f"📁 Auto-saving directly to: {DATA_FILE}")
        httpd.serve_forever()
