export function createEngine(app) {
    let frames = [];
    let currentTime = 0;
    let playing = false;
    let speed = 1;
    let frameIdx = 0;
    const listeners = new Set();

    function tick(ticker) {
        if (!playing || frames.length === 0) return;
        currentTime += ticker.deltaMS * speed;
        emit();
    }

    function emit() {
        // advance frameIdx forward to the last frame whose t <= currentTime
        while (frameIdx + 1 < frames.length && frames[frameIdx + 1].t <= currentTime) {
            frameIdx++;
        }
        // rewind if currentTime moved backward (after seek)
        while (frameIdx > 0 && frames[frameIdx].t > currentTime) {
            frameIdx--;
        }

        const a = frames[frameIdx];
        const b = frames[Math.min(frameIdx + 1, frames.length - 1)];
        const span = b.t - a.t;
        const t = span > 0 ? Math.min(1, Math.max(0, (currentTime - a.t) / span)) : 0;
        const x = a.x + (b.x - a.x) * t;
        const y = a.y + (b.y - a.y) * t;
        const keys = a.keys;

        for (const fn of listeners) fn({ x, y, keys, time: currentTime });
    }

    app.ticker.add(tick);

    return {
        load(replay) {
            frames = replay.frames ?? [];
            currentTime = frames[0]?.t ?? 0;
            frameIdx = 0;
            emit();
        },
        play()  { playing = true; },
        pause() { playing = false; },
        toggle() { playing = !playing; },
        seek(ms) { currentTime = ms; frameIdx = 0; emit(); },
        setSpeed(s) { speed = s; },
        onUpdate(fn) { listeners.add(fn); return () => listeners.delete(fn); },
        get time() { return currentTime; },
        get playing() { return playing; },
    };
}