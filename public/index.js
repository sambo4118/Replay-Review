const canvas = document.getElementById("canvas");
const regl = createREGL({canvas: canvas});

const playfieldLayout = {
    offsetX: 0,
    offsetY: 0,
    scale: 1
};

function resizeCanvas() {
    const DevicePixelRatio = window.devicePixelRatio || 1;
    
    
    const displayWidth = Math.floor(canvas.clientWidth * DevicePixelRatio);
    const displayHeight = Math.floor(canvas.clientHeight * DevicePixelRatio);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }

    const scale = Math.min(displayWidth / 512, displayHeight / 384);
    const drawWidth = 512 * scale;
    const drawHeight = 384 * scale;
    
    playfieldLayout.offsetX = (displayWidth - drawWidth) / 2;
    playfieldLayout.offsetY = (displayHeight - drawHeight) / 2;
    playfieldLayout.scale = scale;
}

const cursorVert = `
    attribute vec2 a_position;
    uniform vec2 u_resolution;
    uniform vec2 u_center;
    uniform float u_radius;

    varying vec2 v_uv;

    void main() {
        v_uv = a_position;
        vec2 screenPos = u_center + a_position * u_radius;
        vec2 clip = (screenPos / u_resolution) * 2.0 - 1.0;
        gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
    }
`;

const cursorFrag = `
    precision mediump float;

    varying vec2 v_uv;

    void main() {
        float dist = length(v_uv);
        if (dist > 1.0) discard;
        float core = 1.0 - smoothstep(0.0, 0.4, dist);
        float ring = 1.0 - smoothstep(0.8, 1.0, dist);
        gl_FragColor = vec4(vec3(0.6 + core * 0.4), ring);
    }
`;

const quadVertices = [
    [-1, -1],
    [ 1, -1],
    [-1,  1],
    [ 1,  1]
];

const drawCursor = regl({
    vert: cursorVert,
    frag: cursorFrag,
    attributes: {
        a_position: quadVertices
    },
    uniforms: {
        u_resolution: () => [canvas.width, canvas.height],
        u_center: regl.prop("center"),
        u_radius: regl.prop("radius")
    },
    count: 4,
    primitive: "triangle strip",
    blend: {
        enable: true,
        func: {
            srcRGB: "src alpha",
            dstRGB: "one minus src alpha",
            srcAlpha: 1,
            dstAlpha: 1
        }
    }
});

function renderReplayframe(frame) {
    const screenX = playfieldLayout.offsetX + frame.x * playfieldLayout.scale;
    const screenY = playfieldLayout.offsetY + frame.y * playfieldLayout.scale;

    drawCursor({
        center: [screenX, screenY],
        radius: 10 * playfieldLayout.scale
    });
}

const openReplayButton = document.getElementById("open-replay");
const replayFileInput = document.getElementById("replay-file");
const playPauseButton = document.getElementById("play-pause");

openReplayButton.addEventListener("click", () => {
    replayFileInput.click();
});

const playbackState = {
    frames: [],
    currentFrameIndex: 0,
    isPlaying: false,
    lastTimestamp: null
};

function tick(timestamp) {
    if (playbackState.isPlaying) {
        if (playbackState.lastTimestamp !== null) {
            playbackState.currentFrameIndex += timestamp - playbackState.lastTimestamp;
        }
        playbackState.lastTimestamp = timestamp;
    }

    const frame = getFrameAtTime(playbackState.frames, playbackState.currentFrameIndex);

    if (frame) {
        regl.clear({ color: [0, 0, 0, 1], depth: 1 });
        renderReplayframe(frame);
    }

    requestAnimationFrame(tick);
}

function getFrameAtTime(frames, time) {
    if (frames.length === 0) return null;
    let lo = 0, hi = frames.length - 1;
    while (lo < hi) {
        const mid = (lo + hi + 1) >> 1;
        if (frames[mid].time <= time) lo = mid;
        else hi = mid - 1;
    }
    return frames[lo];
}

replayFileInput.addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const replay = await readOsr(file);
    playbackState.frames = replay.parseReplayFrames();
    playbackState.currentFrameIndex = 0;
    playbackState.isPlaying = false;
});

playPauseButton.addEventListener("click", () => {
    playbackState.isPlaying = !playbackState.isPlaying;
    playbackState.lastTimestamp = null;
    playPauseButton.textContent = playbackState.isPlaying ? "Pause" : "Play";
});

requestAnimationFrame(tick);

window.addEventListener("resize", resizeCanvas);
resizeCanvas();