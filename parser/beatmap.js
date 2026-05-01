import { BeatmapDecoder } from 'osu-parsers';

const decoder = new BeatmapDecoder();

export function parseBeatmap(osuText) {
    return decoder.decodeFromString(osuText);
}