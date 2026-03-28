#!/bin/bash
# SETUP/INSTALL_NGROK.SH - Automatisera ngrok-installationen på Pi

NGROK_TOKEN="3BOy4WHjMZ2f6tF3RBeuTXIXvOD_7K3s89rqYz38VLcfbM4PR"

echo "--- INSTALLERAR NGROK ---"

# 1. Ladda ner ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null && \
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list && \
sudo apt update && sudo apt install ngrok

# 2. Sätt authtoken
ngrok config add-authtoken $NGROK_TOKEN

echo "--- NGROK INSTALLERAD! ---"

# 3. Skapa systemd-tjänst för automatisk start
sudo tee /etc/systemd/system/picar_ngrok.service <<EOF
[Unit]
Description=My Pi Car Ngrok Tunnel
After=network.target

[Service]
ExecStart=/usr/local/bin/ngrok http 3000
Restart=always
User=pi

[Install]
WantedBy=multi-user.target
EOF

# 4. Aktivera tjänsten
sudo systemctl enable picar_ngrok
sudo systemctl start picar_ngrok

echo "--- TUNNELN ÄR AKTIVERAD VID BOOT! ---"
echo "Du hittar din URL på: https://dashboard.ngrok.com"
