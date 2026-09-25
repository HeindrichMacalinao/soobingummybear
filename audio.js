window.createAudioEngine = function createAudioEngine(isLoadingHidden) {
    let audioCtx = null;
    let loadingInterval = null;
    let audioInitialized = false;

    function getAudioContext() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    function initAudio() {
        const ctx = getAudioContext();
        if (!audioInitialized && ctx) {
            audioInitialized = true;
            playLoadingTicking();
        }
    }

    function playHover() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);

        gain.gain.setValueAtTime(0.015, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
    }

    function playLoadingTicking() {
        if (!audioCtx || loadingInterval) return;

        let tickCounter = 0;
        loadingInterval = setInterval(() => {
            if (isLoadingHidden()) {
                stopLoadingTicking();
                return;
            }

            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'triangle';
            const frequency = tickCounter % 2 === 0 ? 300 : 450;
            osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);

            gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start();
            osc.stop(audioCtx.currentTime + 0.05);
            tickCounter += 1;
        }, 150);
    }

    function stopLoadingTicking() {
        if (loadingInterval) {
            clearInterval(loadingInterval);
            loadingInterval = null;
        }
    }

    function playTabClick() {
        if (!audioCtx) return;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'square';
        osc.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
    }

    function playAppOpen() {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const notes = [440, 587.33];

        notes.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + index * 0.07);

            gain.gain.setValueAtTime(0.06, now + index * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.09);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now + index * 0.07);
            osc.stop(now + index * 0.07 + 0.09);
        });
    }

    function playAppClose() {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const notes = [587.33, 440];

        notes.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(freq, now + index * 0.07);

            gain.gain.setValueAtTime(0.06, now + index * 0.07);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.07 + 0.09);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(now + index * 0.07);
            osc.stop(now + index * 0.07 + 0.09);
        });
    }

    function playAppTerminate() {
        if (!audioCtx) return;
        const now = audioCtx.currentTime;
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(350, now);
        osc.frequency.linearRampToValueAtTime(60, now + 0.28);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start(now);
        osc.stop(now + 0.28);
    }

    return {
        initAudio,
        playHover,
        playLoadingTicking,
        stopLoadingTicking,
        playTabClick,
        playAppOpen,
        playAppClose,
        playAppTerminate
    };
};
