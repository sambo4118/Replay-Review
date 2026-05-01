const BASE = "https://osu.direct";

export async function fetchBeatmapByHash(beatmapHash) {
    const metadataResponse = await fetch(`${BASE}/api/md5/${beatmapHash}`);
    if (!metadataResponse.ok) throw new Error(`Failed to fetch beatmap metadata: ${metadataResponse.status}`);
    const metadata = await metadataResponse.json();
    const osuResponce = await fetch(`${BASE}/api/osu/${metadata.BeatmapID}/raw`);
    if (!osuResponce.ok) throw new Error(`Failed to fetch beatmap .osu file: ${osuResponce.status}`);
    const osuText = await osuResponce.text();

    return { metadata, osuText };
}