import subprocess
import os
import time

# Tröskelvärde för låg spänning (Bit 0 i get_throttled)
# https://www.raspberrypi.com/documentation/computers/os.html#get_throttled
UNDERVOLTAGE_MASK = 0x1

def check_power():
    """
    Kollar om systemet har larmat för låg spänning via vcgencmd.
    """
    try:
        # Kör systemkommandot vcgencmd
        output = subprocess.check_output(['vcgencmd', 'get_throttled']).decode()
        # Output ser ut som: throttled=0x50000
        val_hex = output.split('=')[1].strip()
        val = int(val_hex, 16)
        
        # Om bit 0 är "1", betyder det under-voltage just nu (Under 4.63V)
        if val & UNDERVOLTAGE_MASK:
            return True
        return False
    except Exception as e:
        print(f"⚠️ Fel vid kontroll av spänning: {e}")
        return False

print("🛡️ Raspberry Pi Low-Voltage Guardian STARTAD")
print("   Bevakar strömförsörjning var 10:e sekund...")

while True:
    if check_power():
        print("🚨 KRITISK VARNING: Låg spänning (Under-voltage) detekterad!")
        print("   Väntar 5 sekunder för att se om det stabiliseras...")
        time.sleep(5)
        
        if check_power():
            print("🛑 Spänningen är fortfarande för låg. Stänger av för att skydda SD-kortet!")
            # Skriv till loggen innan avstängning
            with open("/home/hupi/My_pi_Car/setup/shutdown_log.txt", "a") as f:
                f.write(f"{time.ctime()}: Emergency shutdown due to low voltage\n")
            
            os.system("sudo shutdown -h now")
            break
        else:
            print("✅ Spänningen återställd. Återgår till bevakning.")
            
    time.sleep(10) # Kolla var 10:e sekund för att spara CPU
