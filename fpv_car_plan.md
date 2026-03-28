# Projektplan: Global FPV-Bil (Pi Zero 2 W) 🏎️🌍

Denna plan beskriver bygget av en fjärrstyrd bil som styrs över internet (ngrok) via mobilnätet (4G/SIM). Systemet är designat för att fungera globalt (t.ex. styra från Irak) med minimal fördröjning.

## 1. Systemöversikt & Hårdvara
*   **Hjärna**: Raspberry Pi Zero 2 W (Snabb, kompakt, strömsnål).
*   **Ögon**: Camera Module 3 (12MP, Full HD, Autofokus).
*   **Uppkoppling**: 4G USB-modem för SIM-kort (Självständig internetåtkomst).
*   **Tunnel**: **ngrok** för att exponera den lokala servern till en publik URL.
*   **Ström**: Powerbank med hög kapacitet (minst 2.1A output).

## 2. Web App Dashboard (Visionsgränssnitt)
Appen ska byggas som en modern "HUD" (Heads-Up Display) som ligger ovanpå videoströmmen.
*   **Bakgrund**: Live 1080p Video i fullskärm.
*   **Kontroller (Glassmorphism design)**:
    *   **Vänster Joystick**: Analog kontroll för Fram/Bak (Hastighetsreglering via PWM).
    *   **Höger Joystick**: Digital/Analog kontroll för Sväng (Höger/Vänster).
    *   **Quick Action Buttons**: 
        *   Tänd/Släck lampa (Neon-effekt).
        *   Starta/Stoppa inspelning.
        *   Kamerainställningar.
*   **Telemetri-data**: Overlay som visar FPS, latens och uppkopplingstyp (WiFi/4G).

## 3. Mjukvaruarkitektur
*   **Backend (Node.js)**: 
    *   WebSocket-server för omedelbara kommandon.
    *   Relay-server för JPEG-frames (som vår nuvarande setup).
*   **Logic (Python)**:
    *   Styr GPIO-pinnarna för motorerna.
    *   Hanterar PWM-signaler för att bilen ska kunna köra mjukt i olika hastigheter.
*   **Nätverk**:
    *   Automatisk växling mellan WiFi och 4G.
    *   Auto-start av ngrok vid boot för att alltid ha en aktiv länk.

## 4. Att göra-lista (När hårdvaran är klar)
1.  **Chassi-bygge**: Montera motorer och motordrivare (t.ex. L298N).
2.  **Modem-setup**: Se till att Pi:n känner igen SIM-kortet och kopplar upp sig vid boot.
3.  **Utveckla HUD**: Skapa HTML/JS-gränssnittet med `nipplejs` för Joysticks.
4.  **GPIO-motorstyrning**: Skriva Python-servon som översätter Joysticks till rörelse.
5.  **Testkörning**: Kalibrera styrvinklar och hastighetsnivåer.

---
> [!TIP]
> **Spara detta dokument!** När du har alla delar hemma, skicka bara meddelandet: *"Starta planen: Global FPV-Bil"* så tar vi vid där vi slutade.

> [!IMPORTANT]
> Se till att köpa ett **Snabbt SD-kort (Class 10 / A1)** och en **bra motordrivare** för att systemet ska kännas så snabbt och responsivt som möjligt.
