import { pickFile } from '../utils/pickFile.js';
import { ReplayParser } from '../parser/replay.js';
import { parseBeatmap } from '../parser/beatmap.js';
import { fetchBeatmapByHash } from '../utils/mirror.js';

export async function loadReplaySession() {
    const file = await pickFile({ accept: '.osr' });
    if (!file) return null;

    const buffer = await file.arrayBuffer();
    const replay = ReplayParser.parse(buffer);
    await replay.decodeFrames();

    let beatmap = null;
    try {
        const { text } = await fetchBeatmapByHash(replay.mapHash);
        beatmap = parseBeatmap(text);
    } catch (err) {
        console.warn('Beatmap auto-fetch failed:', err);
    }

    return { replay, beatmap };
}