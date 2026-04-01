#!/bin/bash
# ============================================================
#  SETUP SCRIPT - My Pi Car (Raspberry Pi Zero 2 W)
#  Kör detta på din Pi efter att filerna har kopierats över.
# ============================================================

set -e # Avbryt vid fel

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}--- STARTING SYSTEM SETUP ---${NC}"

# 1. Update and Upgrade
echo -e "${YELLOW}[1/4] Uppdaterar systemet...${NC}"
sudo apt update && sudo apt upgrade -y
echo -e "${GREEN}✅ Systemet är uppdaterat!${NC}"

# 2. Install Node.js (v20 LTS)
echo -e "${YELLOW}[2/4] Installerar Node.js...${NC}"
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
echo -e "${GREEN}✅ Node.js $(node -v) installerat!${NC}"

# 3. Install Python Dependencies (gpiozero + picamera2 dependencies)
echo -e "${YELLOW}[3/4] Installerar Python-bibliotek (gpiozero)...${NC}"
sudo apt install -y python3-gpiozero python3-pigpio
echo -e "${GREEN}✅ Python-bibliotek installerade!${NC}"

# 4. Enable Camera (libcamera-vid support)
echo -e "${YELLOW}[4/4] Aktiverar kamera-interfacet...${NC}"
sudo raspi-config nonint do_camera 0
echo -e "${GREEN}✅ Kamera aktiverad!${NC}"

# 5. Setup Project Folder
echo -e "${YELLOW}--- SETTING UP PROJECT DEPENDENCIES ---${NC}"
cd ~/My_pi_Car/server
npm install express ws
echo -e "${GREEN}✅ Node-paket installerade!${NC}"

# 6. Setup Battery Guard Service
echo -e "${YELLOW}--- KONFIGURERAR BATTERIVAKT (Guardian) ---${NC}"
sudo cp ~/My_pi_Car/setup/battery_guard.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable battery_guard.service
sudo systemctl start battery_guard.service
echo -e "${GREEN}✅ Batterivakt installerad och startad!${NC}"

echo -e "
╔══════════════════════════════════════════════╗
║              SETUP KLART! 🏎️💨                ║
║                                              ║
║  1. Starta om Pi:n: sudo reboot              ║
║  2. Batterivakt körs nu i bakgrunden.        ║
║  3. Efter start, kör servern:                ║
║     cd ~/My_pi_Car/server                    ║
║     node index.js                            ║
╚══════════════════════════════════════════════╝
"

echo -e "${YELLOW}Vill du starta om nu? (j/n)${NC}"
read answer
if [[ "$answer" == "j" || "$answer" == "J" ]]; then
    sudo reboot
fi
