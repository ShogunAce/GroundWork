#!/bin/bash
set -euo pipefail
dnf install -y nginx unzip tar xz
curl -fsSLo /tmp/node.tar.xz https://nodejs.org/dist/v24.14.1/node-v24.14.1-linux-x64.tar.xz
tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1
fallocate -l 2G /swapfile
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
useradd --system --create-home groundwork
mkdir -p /opt/groundwork
for attempt in $(seq 1 120); do
  if aws s3 cp s3://${Artifacts}/source.zip /tmp/source.zip --region ${AWS::Region}; then break; fi
  sleep 10
done
unzip -q /tmp/source.zip -d /opt/groundwork
cd /opt/groundwork
printf 'LLM_PROVIDER=bedrock\nAWS_REGION=${AWS::Region}\nBEDROCK_MODEL_ID=amazon.nova-micro-v1:0\nALLOW_ANTHROPIC_FALLBACK=false\n' > .env
chown -R groundwork:groundwork /opt/groundwork
sudo -u groundwork env PATH=/usr/local/bin:/usr/bin:/bin npm ci
sudo -u groundwork env PATH=/usr/local/bin:/usr/bin:/bin NEXT_TELEMETRY_DISABLED=1 npm run build
cat > /etc/systemd/system/groundwork.service <<'UNIT'
[Unit]
Description=Groundwork web and MCP
After=network-online.target
Wants=network-online.target
[Service]
User=groundwork
WorkingDirectory=/opt/groundwork
Environment=PATH=/usr/local/bin:/usr/bin:/bin
Environment=NODE_ENV=production
Environment=NEXT_TELEMETRY_DISABLED=1
ExecStart=/usr/local/bin/npm run start
Restart=always
RestartSec=5
NoNewPrivileges=true
[Install]
WantedBy=multi-user.target
UNIT
cat > /etc/nginx/conf.d/groundwork.conf <<'NGINX'
server {
 listen 80 default_server;
 server_name _;
 client_max_body_size 300k;
 location / {
  proxy_pass http://127.0.0.1:3000;
  proxy_http_version 1.1;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto https;
  proxy_buffering off;
  proxy_read_timeout 90s;
 }
}
NGINX
# Remove the packaged default listener while retaining global nginx settings.
python3 - <<'PY'
from pathlib import Path
p=Path('/etc/nginx/nginx.conf')
s=p.read_text()
start=s.find('    server {')
if start>=0:
    depth=0
    for i in range(s.index('{',start),len(s)):
        depth += (s[i]=='{')-(s[i]=='}')
        if depth==0:
            s=s[:start]+s[i+1:]
            break
p.write_text(s)
PY
nginx -t
systemctl daemon-reload
systemctl enable --now groundwork nginx
