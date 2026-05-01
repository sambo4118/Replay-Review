const BASE = "https://osu.direct";

export async function fetchBeatmapByHash(beatmapHash) {
    const metadataResponse = await fetch(`${BASE}/api/beatmaps/hash/${beatmapHash}`);
    if (!metadataResponse.ok) throw new Error(`Failed to fetch beatmap metadata: ${metadataResponse.statusText}`);
    const metadata = await metadataResponse.json();

    const osuResponce = await fetch(`${BASE}/api/osu/${metadata.id}/raw`);
    if (!osuResponce.ok) throw new Error(`Failed to fetch beatmap .osu file: ${osuResponce.statusText}`);
    const osuText = await osuResponce.text();

    return { metadata, osuText };
}