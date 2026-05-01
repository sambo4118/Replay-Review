import { Reader } from '../utils/reader.js';
import { decompress } from 'lzma1';

export class ReplayParser {
    constructor() {
        this.gameMode = 0;
        this.gameVersion = 0;
        this.mapHash = "";
        this.playerName = "";
        this.replayHash = "";
        this.countGreats = 0;
        this.countGoods = 0;
        this.countOkays = 0;
        this.countGekis = 0;
        this.countKatus = 0;
        this.countMisses = 0;
        this.scoreTotal = 0;
        this.maxCombo = 0;
        this.Perfect = false;
        this.modsUsed = 0;
        this.lifeBar = [];
        this.timestamp = 0;
        this.replayData = [];
        this.scoreId = 0;
        this.additionalModData = 0;
        this.replayDataCompressed = null;
    }

    static parse(buffer) {
        const reader = new Reader(buffer);
        const replay = new ReplayParser();

        replay.Mode         = reader.u8();
        replay.gameVersion  = reader.i32();
        replay.mapHash      = reader.string();
        replay.playerName   = reader.string();
        replay.replayHash   = reader.string();
        replay.countGreats  = reader.u16();
        replay.countGoods   = reader.u16();
        replay.countOkays   = reader.u16();
        replay.countGekis   = reader.u16();
        replay.countKatus   = reader.u16();
        replay.countMisses  = reader.u16();
        replay.score        = reader.i32();
        replay.maxCombo     = reader.u16();
        replay.Perfect      = reader.u8() === 1;
        replay.mods         = reader.i32();
        replay.lifeBar      = reader.string().split(',').map(parseFloat);
        replay.timestamp    = reader.i64();

        const len = reader.i32();
        replay.replayDataCompressed = reader.take(len);
    
        return replay;
    }

    async decodeFrames() {
        const bytes = await decompress(this.replayDataCompressed);
        const csv = new TextDecoder().decode(bytes);
        this.frames = this.parseFrames(csv);
    }

    parseFrames(csv) {
        const frames = [];
        let time = 0;

        for (const part of csv.split(',')) {
            if (!part) continue;

            const [w, x, y, z] = part.split('|');
            if (!z) continue;
            const DeltaTime = parseInt(w, 10);

            if (DeltaTime === -12345) continue; // ignore the seed at the end
            time += DeltaTime;
            
            frames.push({
                t: time,
                x: parseFloat(x),
                y: parseFloat(y),
                keys: parseInt(z, 10)
            });
        }
        return frames;
    }
}
