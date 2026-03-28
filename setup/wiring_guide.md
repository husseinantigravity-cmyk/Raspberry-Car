# 📟 Kopplingsschema för L298N & Pi Zero 2 WH

För att din **My Pi Car** ska kunna rulla behöver du koppla ihop din Raspberry Pi med din **L298N motordrivare** enligt tabellen nedan.

### 🔌 GPIO-kopplingar

| L298N Pin | Pi GPIO Pin | Funktion | Färgförslag |
| :--- | :--- | :--- | :--- |
| **ENA** | **GPIO 12 (Pin 32)** | Bak Motor (Hastighet/PWM) | Orange |
| **IN1** | **GPIO 17 (Pin 11)** |  Bak Motor (Framåt) | Gul |
| **IN2** | **GPIO 27 (Pin 13)** |  Bak Motor (Bakåt) | Grön |
| **IN3** | **GPIO 22 (Pin 15)** | Frame Motor (Höger) | Blå |
| **IN4** | **GPIO 23 (Pin 16)**   Frame Motor (Vänster) | Lila |
| **ENB** | **GPIO 13 (Pin 33)** | Frame Motor (Hastighet/PWM) | Grå |
| **LAMP** | **GPIO 26 (Pin 37)** | Positiv pol till LED-halvljus | Vit |
| **GND** | **GND (Pin 6/9/14)** | Gemensam jord mellan Pi & L298N | **Svart** |

---

### 🔋 Strömförsörjning (Viktigt!)
1.  **L298N 12V terminal**: Koppla till din powerbanks pluspol (eller batteripack).
2.  **L298N GND terminal**: Koppla till powerbanks minuspol **OCH** till en GND-pinne på Raspberry Pi. (Gemensam jord är ett måste!).
3.  **Raspberry Pi Power**: Strömförsörj Pi:n separat via micro-USB från samma powerbank (om den har två utgångar) för att undvika störningar.

---

### ⚠️ Kontrollera före start:
*   Se till att "Jumpers" (de små svarta plastbitarna) sitter kvar på ENA och ENB om du INTE använder hastighetskontroll. **Men vi använder PWM**, så du måste ta bort dessa jumpers och koppla kablarna från GPIO 12/13 direkt till de översta pinnarna på ENA/ENB.
*   Dra åt skruvarna på L298N ordentligt så kablarna inte hoppar ur när bilen kör.

> [!TIP]
> Dubbelkolla alltid kopplingen innan du slår på strömmen!
