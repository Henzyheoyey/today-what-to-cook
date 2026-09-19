#!/usr/bin/env python3
import html
import json
import re
import sys
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET

HOST = "127.0.0.1"
PORT = 5174
PLAYER = "https://www.youtube.com/youtubei/v1/player?prettyPrint=false"


def fetch_player(video_id):
    body = json.dumps(
        {
            "context": {
                "client": {
                    "clientName": "ANDROID",
                    "clientVersion": "20.10.38",
                    "androidSdkVersion": 30,
                    "hl": "ko",
                    "gl": "KR",
                }
            },
            "videoId": video_id,
        }
    ).encode()
    req = Request(
        PLAYER,
        data=body,
        headers={
            "Content-Type": "application/json",
            "User-Agent": "com.google.android.youtube/20.10.38 (Linux; U; Android 13)",
        },
    )
    with urlopen(req, timeout=20) as res:
        return json.loads(res.read().decode())


def track_rank(track):
    lang = (track.get("languageCode") or "").lower()
    kind = track.get("kind") or ""
    rank = 80
    if lang.startswith("ko"):
        rank = 0
    elif lang.startswith("en"):
        rank = 10
    if kind == "asr":
        rank += 1
    return rank


def clean_caption(node):
    text = html.unescape("".join(node.itertext()))
    text = re.sub(r"\[.*?\]", "", text)
    return " ".join(text.split())


def parse_captions(xml_text):
    root = ET.fromstring(xml_text)
    segments = []
    nodes = list(root.iter("p")) or list(root.iter("text"))
    for node in nodes:
        text = clean_caption(node)
        if not text:
            continue
        start = node.get("t") or node.get("start") or 0
        duration = node.get("d") or node.get("dur") or 0
        segments.append(
            {
                "start": int(float(start)),
                "duration": int(float(duration)),
                "text": text,
            }
        )
    return segments


def fetch_transcript(video_id):
    player = fetch_player(video_id)
    details = player.get("videoDetails") or {}
    title = details.get("title") or ""
    tracks = (
        player.get("captions", {})
        .get("playerCaptionsTracklistRenderer", {})
        .get("captionTracks", [])
    )
    if not tracks:
        return {"error": "no_captions", "title": title}

    tracks = sorted(tracks, key=track_rank)
    req = Request(tracks[0]["baseUrl"], headers={"User-Agent": "Mozilla/5.0"})
    with urlopen(req, timeout=20) as res:
        xml_text = res.read().decode("utf-8", "replace")
    segments = parse_captions(xml_text)
    if not segments:
        return {"error": "no_captions", "title": title}
    return {
        "platform": "youtube",
        "videoId": video_id,
        "title": title,
        "author": details.get("author") or "",
        "language": tracks[0].get("languageCode") or "",
        "segments": segments,
        "text": " ".join(item["text"] for item in segments),
    }


class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/transcript":
            return SimpleHTTPRequestHandler.do_GET(self)

        video_id = (parse_qs(parsed.query).get("id") or [""])[0]
        if not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id):
            return self.send_json({"error": "unsupported"}, 400)
        try:
            payload = fetch_transcript(video_id)
        except (HTTPError, URLError, TimeoutError, ValueError, ET.ParseError):
            return self.send_json({"error": "extract_fail"}, 502)
        code = 200 if "error" not in payload else 422
        return self.send_json(payload, code)

    def send_json(self, payload, code):
        body = json.dumps(payload, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def log_message(self, fmt, *args):
        sys.stderr.write("%s - %s\n" % (self.address_string(), fmt % args))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--test":
        print(json.dumps(fetch_transcript(sys.argv[2]), ensure_ascii=False)[:2000])
        raise SystemExit
    server = ThreadingHTTPServer((HOST, PORT), Handler)
    print(f"Open http://{HOST}:{PORT}/", flush=True)
    server.serve_forever()
