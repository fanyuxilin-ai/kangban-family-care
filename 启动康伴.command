#!/bin/bash
cd "$(dirname "$0")"
PORT=4181
if lsof -nP -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; then
  PORT=4182
fi
python3 -m http.server "$PORT" --bind 0.0.0.0 &
SERVER_PID=$!
sleep 1
open "http://127.0.0.1:$PORT/"
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || true)
if [ -n "$LAN_IP" ]; then
  echo "康伴手机演示地址：http://$LAN_IP:$PORT/"
fi
wait "$SERVER_PID"
