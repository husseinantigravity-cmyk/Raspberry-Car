// My Pi Car - HUD Controller
document.addEventListener('DOMContentLoaded', () => {
    const hudControls = document.getElementById('hud-controls');
    const toggleBtn = document.getElementById('toggle-hud');
    const btnLight = document.getElementById('btn-light');
    const btnHorn = document.getElementById('btn-horn');

    // --- Control State ---
    const controlState = {
        speed: 0,
        steer: 0,
        light: false,
        started: false,
        horn: false
    };

    let isCarOnline = false; // NEW: Track if we actually have a car connection

    // UI state for display only
    let hudVisible = false;

    // --- HUD Toggle Logic ---
    toggleBtn.addEventListener('click', () => {
        hudVisible = !hudVisible;
        if (hudVisible) {
            hudControls.classList.remove('hidden');
            toggleBtn.style.color = 'var(--accent-color)';
            controlState.started = true;
            sendCommand({ type: 'start', value: true });
        } else {
            hudControls.classList.add('hidden');
            toggleBtn.style.color = 'white';
            controlState.started = false;
            sendCommand({ type: 'start', value: false });
        }
    });

    // --- Action Buttons ---
    btnLight.addEventListener('click', () => {
        controlState.light = !controlState.light;
        btnLight.classList.toggle('active', controlState.light);
        sendCommand({ type: 'light', value: controlState.light });
    });

    // --- Horn Button (Momentary) ---
    const startHorn = () => {
        controlState.horn = true;
        btnHorn.classList.add('active');
        sendCommand({ type: 'horn', value: true });
    };

    const stopHorn = () => {
        controlState.horn = false;
        btnHorn.classList.remove('active');
        sendCommand({ type: 'horn', value: false });
    };

    btnHorn.addEventListener('mousedown', startHorn);
    btnHorn.addEventListener('touchstart', (e) => { e.preventDefault(); startHorn(); });
    btnHorn.addEventListener('mouseup', stopHorn);
    btnHorn.addEventListener('touchend', stopHorn);
    btnHorn.addEventListener('mouseleave', stopHorn);

    // --- STEERING WHEEL LOGIC ---
    const wheel = document.getElementById('steering-wheel');
    let isRotating = false;
    let startAngle = 0;
    let currentRotation = 0;
    let wheelTouchId = null;

    function getAngle(x, y) {
        const rect = wheel.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        return Math.atan2(y - centerY, x - centerX) * (180 / Math.PI);
    }

    const startRotate = (e) => {
        const touch = e.touches ? e.changedTouches[0] : e;
        if (e.touches) wheelTouchId = touch.identifier;
        
        isRotating = true;
        startAngle = getAngle(touch.clientX, touch.clientY) - currentRotation;
        e.preventDefault();
    };

    const onRotate = (e) => {
        if (!isRotating) return;
        let touch = null;
        
        if (e.touches) {
            // Find the specific finger that started the rotation
            for (let i = 0; i < e.touches.length; i++) {
                if (e.touches[i].identifier === wheelTouchId) {
                    touch = e.touches[i];
                    break;
                }
            }
        } else {
            touch = e;
        }
        
        if (!touch) return;
        
        const angle = getAngle(touch.clientX, touch.clientY);
        currentRotation = angle - startAngle;

        // Limit rotation (+/- 180 degrees)
        if (currentRotation > 180) currentRotation = 180;
        if (currentRotation < -180) currentRotation = -180;

        wheel.style.transform = `rotate(${currentRotation}deg)`;
        
        // Skicka diskret styrning: -1 (vänster), 0 (center), +1 (höger)
        // Triggas vid 20° för snabb respons
        let steerValue = 0;
        if (currentRotation > 20) steerValue = 1;
        else if (currentRotation < -20) steerValue = -1;
        
        controlState.steer = steerValue;
    };

    const stopRotate = (e) => {
        if (!isRotating) return;
        
        // If it's a touch event, check if the finger we care about was lifted
        if (e && e.changedTouches) {
            let found = false;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === wheelTouchId) {
                    found = true;
                    break;
                }
            }
            if (!found) return; // Not our finger
        }

        isRotating = false;
        wheelTouchId = null;
        currentRotation = 0;
        wheel.style.transform = `rotate(0deg)`;
        controlState.steer = 0;
    };

    wheel.addEventListener('mousedown', startRotate);
    wheel.addEventListener('touchstart', startRotate, { passive: false });
    window.addEventListener('mousemove', onRotate);
    window.addEventListener('touchmove', onRotate, { passive: false });
    window.addEventListener('mouseup', stopRotate);
    window.addEventListener('touchend', stopRotate);

    // --- PEDAL LOGIC ---
    const gasPedal = document.getElementById('pedal-gas');
    const brakePedal = document.getElementById('pedal-brake');
    const pedalTouchIds = { gas: null, brake: null };

    const startPedal = (e, pedal, type) => {
        const touch = e.touches ? e.changedTouches[0] : e;
        if (e.touches) pedalTouchIds[type] = touch.identifier;

        // Use closest() to find the speed-segment even if a child element was touched
        const segment = e.target.closest ? e.target.closest('.speed-segment') : null;
        let speed = type === 'gas' ? 0.8 : -0.8;

        // Clear all active segments first
        pedal.querySelectorAll('.speed-segment').forEach(s => s.classList.remove('active'));

        if (segment && segment.dataset.speed) {
            speed = parseFloat(segment.dataset.speed);
            segment.classList.add('active');
        }
        controlState.speed = speed;
        e.preventDefault();
    };

    const stopPedal = (e, type) => {
        // Multi-touch safety
        if (e && e.changedTouches && pedalTouchIds[type] !== null) {
            let found = false;
            for (let i = 0; i < e.changedTouches.length; i++) {
                if (e.changedTouches[i].identifier === pedalTouchIds[type]) {
                    found = true;
                    break;
                }
            }
            if (!found) return;
        }

        pedalTouchIds[type] = null;
        
        // Only set speed to 0 if NO pedals are being touched
        if (pedalTouchIds.gas === null && pedalTouchIds.brake === null) {
            controlState.speed = 0;
            document.querySelectorAll('.speed-segment').forEach(s => s.classList.remove('active'));
        }
    };

    gasPedal.addEventListener('mousedown', (e) => startPedal(e, gasPedal, 'gas'));
    gasPedal.addEventListener('touchstart', (e) => startPedal(e, gasPedal, 'gas'), { passive: false });
    gasPedal.addEventListener('mouseup', (e) => stopPedal(e, 'gas'));
    gasPedal.addEventListener('touchend', (e) => stopPedal(e, 'gas'));
    gasPedal.addEventListener('mouseleave', (e) => stopPedal(e, 'gas'));

    brakePedal.addEventListener('mousedown', (e) => startPedal(e, brakePedal, 'brake'));
    brakePedal.addEventListener('touchstart', (e) => startPedal(e, brakePedal, 'brake'), { passive: false });
    brakePedal.addEventListener('mouseup', (e) => stopPedal(e, 'brake'));
    brakePedal.addEventListener('touchend', (e) => stopPedal(e, 'brake'));
    brakePedal.addEventListener('mouseleave', (e) => stopPedal(e, 'brake'));

    // --- KEYBOARD CONTROLS ---
    const keysDown = {};
    window.addEventListener('keydown', (e) => {
        keysDown[e.key.toLowerCase()] = true;
        if (e.key.toLowerCase() === 'h') startHorn();
        updateKeyboardState();
    });
    window.addEventListener('keyup', (e) => {
        delete keysDown[e.key.toLowerCase()];
        if (e.key.toLowerCase() === 'h') stopHorn();
        updateKeyboardState();
    });

    function updateKeyboardState() {
        // Speed
        if (keysDown['w'] || keysDown['arrowup']) controlState.speed = 0.8;
        else if (keysDown['s'] || keysDown['arrowdown']) controlState.speed = -0.8;
        else if (!isRotating && controlState.speed !== 0) {
            // Only reset if no pedal is pressed (pedal logic might overlap)
            // But for simplicity, keyboard has priority or resets to 0
            if(!Object.keys(keysDown).some(k => ['w','s','arrowup','arrowdown'].includes(k))) {
                 controlState.speed = 0;
            }
        }

        // Steer
        if (keysDown['a'] || keysDown['arrowleft']) controlState.steer = -1;
        else if (keysDown['d'] || keysDown['arrowright']) controlState.steer = 1;
        else if (!isRotating) {
            if(!Object.keys(keysDown).some(k => ['a','d','arrowleft','arrowright'].includes(k))) {
                controlState.steer = 0;
            }
        }
    }

    function sendCommand(cmd) {
        // Blokkerar kommandon om bilen inte är online
        if (socket && socket.readyState === WebSocket.OPEN && isCarOnline) {
            socket.send(JSON.stringify(cmd));
        }
    }

    // --- COMMUNICATION (WebSocket Logic) ---
    // Nu använder vi den fasta adressen från config.js!
    // Smart anslutning: Använder bilens lokala IP om vi är på samma nätverk, eller ngrok om vi är ute på nätet!
    // Smart anslutning: Om vi är på GitHub (.github.io), använder vi ngrok-länken från config.js.
    // Annars (vid Wi-Fi hemma) använder vi bilens lokala IP-adress direkt.
    let PI_URL;
    if (window.location.host.includes('.github.io')) {
        PI_URL = `wss://${CONFIG.CAR_URL}`;
    } else {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        PI_URL = `${protocol}//${window.location.host}`;
    }
    const fpvVideo = document.getElementById('fpv-video');
    const statusOverlay = document.getElementById('status-overlay');
    const btnReconnect = document.getElementById('btn-reconnect');
    let videoWatchdog;

    let drivingStartTime = null;
    let driveTimerInterval = null;

    function formatTime(seconds) {
        const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${h}:${m}:${s}`;
    }

    // Timer Logic - Always running heartbeat
    setInterval(() => {
        if (isCarOnline && drivingStartTime) {
            const elapsedSeconds = Math.floor((Date.now() - drivingStartTime) / 1000);
            const timeEl = document.getElementById('drive-time');
            if (timeEl) timeEl.innerText = formatTime(elapsedSeconds);
        }
    }, 1000);

    function showOffline() {
        console.log("HUD Offline: No car detected");
        isCarOnline = false;
        drivingStartTime = null;
        statusOverlay.classList.remove('hidden');
        fpvVideo.classList.add('hidden-video');
        const timeEl = document.getElementById('drive-time');
        if (timeEl) timeEl.innerText = "00:00:00";
    }

    function showOnline() {
        if (!isCarOnline) {
            console.log("HUD Online: Car connected!");
            isCarOnline = true;
            drivingStartTime = Date.now();
            statusOverlay.classList.add('hidden');
            fpvVideo.classList.remove('hidden-video');
        }
    }

    // Initialize as offline
    showOffline();

    let socket;
    function connect() {
        if (socket) {
            socket.close();
        }

        console.log(`Ansluter till bilen vid: ${PI_URL}...`);
        
        try {
            socket = new WebSocket(PI_URL);
            socket.binaryType = 'arraybuffer';
            
            socket.onopen = () => {
                console.log('--- CONNECTED TO TUNNEL ---');
                socket.send(JSON.stringify({ type: 'info', value: 'HUD connected' }));
            };

            socket.onclose = () => {
                console.log('--- TUNNEL CLOSED ---');
                showOffline();
            };

            socket.onerror = (e) => {
                console.warn('Ej kontakt med bilen.');
                showOffline();
            };

            socket.onmessage = (event) => {
                if (event.data instanceof ArrayBuffer) {
                    showOnline();
                    clearTimeout(videoWatchdog);
                    videoWatchdog = setTimeout(showOffline, 3000);

                    const blob = new Blob([event.data], { type: 'image/jpeg' });
                    const url = URL.createObjectURL(blob);
                    const oldUrl = fpvVideo.src;
                    fpvVideo.src = url;
                    
                    if (oldUrl.startsWith('blob:')) {
                        URL.revokeObjectURL(oldUrl);
                    }
                } else {
                    try {
                        const data = JSON.parse(event.data);
                        if (data.type === 'telemetry') {
                            // Förberett för AD-omvandlaren:
                            if (data.battery !== undefined) {
                                document.getElementById('battery-val').innerText = data.battery + '%';
                            }
                        }
                    } catch (e) {}
                }
            };
        } catch (e) {
            console.error("Socket error", e);
            showOffline();
        }
    }

    // Första anslutningen
    connect();

    // Återanslut-knapp i det röda fältet
    btnReconnect.addEventListener('click', () => {
        btnReconnect.innerText = "جاري الاتصال...";
        setTimeout(() => {
            btnReconnect.innerHTML = "اعادة محاولة 🔃";
        }, 1000);
        connect();
    });

    function sendCommand(cmd) {
        if (socket && socket.readyState === WebSocket.OPEN && isCarOnline) {
            socket.send(JSON.stringify(cmd));
        }
    }

    // --- UNIFIED CONTROL LOOP (Game Loop) ---
    // Sends speed and steer together every 50ms for smooth control
    let lastSentState = { speed: 0, steer: 0 };
    
    setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN && isCarOnline) {
            // Only send if state has changed or if it's non-zero (to keep heartbeat)
            if (controlState.speed !== lastSentState.speed || 
                controlState.steer !== lastSentState.steer || 
                controlState.speed !== 0 || 
                controlState.steer !== 0) {
                
                sendCommand({
                    type: 'move',
                    speed: controlState.speed,
                    steer: controlState.steer
                });
                
                lastSentState.speed = controlState.speed;
                lastSentState.steer = controlState.steer;
            }
        }
    }, 50); // 20 times per second

    // Telemetri hanteras nu asynkront via AD-omvandlaren/servern!
});
