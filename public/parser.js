async function readOsr(file) {
    return Replay.fromFile(file);
}

function decompressReplayData(data) {
    const compressedData = data.slice();
    const decompressedData = window.LZMA.decompressFile(compressedData.buffer);
    const replayText = new TextDecoder("utf-8").decode(decompressedData);
    return replayText.replace(/\0+$/, "");
}

class Replay {
    constructor(data) {
        this.rawData = data;
        this.reader = new BytesReader(this.rawData);
        this.header = this.headerData();
        this.replayDataString = decompressReplayData(this.reader.readBytes(this.header.dataLength))

        this.header.scoreId = this.reader.readLong();
        try {
            this.header.modInfo = this.reader.readDouble();
        } catch (e) {
            this.header.modInfo = null;
        }
    }

    static async fromFile(file) {
        const buffer = await file.arrayBuffer();
        return new Replay(new Uint8Array(buffer));
    }

    headerData() {
        const header = {};
        header.gameMode = this.reader.readByte();
        header.gameVersion = this.reader.readInt();
        header.beatmapHash = this.reader.readString();
        header.playerName = this.reader.readString();
        header.replayHash = this.reader.readString();
        header.GreatCount = this.reader.readShort();
        header.goodCount = this.reader.readShort();
        header.okCount = this.reader.readShort();
        header.mehCount = this.reader.readShort();
        header.gekisCount = this.reader.readShort();
        header.katuCount = this.reader.readShort();
        header.missCount = this.reader.readShort();
        header.score = this.reader.readInt();
        header.maxCombo = this.reader.readShort();
        header.perfect = this.reader.readByte() === 1;
        header.mods = this.reader.readInt();
        header.lifeBarGraphLength = this.reader.readString();
        header.timestamp = this.reader.readLong();
        header.dataLength = this.reader.readInt();
        return header;
    }

    parseReplayFrames() {
        const frames = [];
        let currentTime = 0;

        for (const chunk of this.replayDataString.split(",")) {
            if (!chunk) continue;

            const [deltaRaw, xRaw, yRaw, keysRaw] = chunk.split("|");
            if (keysRaw === undefined) continue;

            const deltaTime = Number(deltaRaw);
            const x = Number(xRaw);
            const y = Number(yRaw);
            const keys = Number(keysRaw);

            if (
                Number.isNaN(deltaTime) ||
                Number.isNaN(x) ||
                Number.isNaN(y) ||
                Number.isNaN(keys)
            ) {
                continue;
            }

            currentTime += deltaTime;
            frames.push({ 
                deltaTime:deltaTime,
                time: currentTime,
                x:x, 
                y:y, 
                keys:keys
            });
        }
        return frames;
    }
}

class BytesReader {
    constructor(data) {
        this.data = data;
        this.view = new DataView(data.buffer, data.byteOffset, data.byteLength);
        this.offset = 0;
    }

    readByte() {
        const value = this.data[this.offset];
        this.offset += 1;
        return value;
    }

    readShort() {
        const value = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return value;
    }

    readInt() {
        const value = this.view.getInt32(this.offset, true);
        this.offset += 4;
        return value;
    }

    readLong() {
        const lowPart = BigInt(this.view.getUint32(this.offset, true));
        const highPart = BigInt(this.view.getUint32(this.offset + 4, true));
        this.offset += 8;
        return (highPart << 32n) | lowPart;
    }

    readDouble() {
        const value = this.view.getFloat64(this.offset, true);
        this.offset += 8;
        return value;
    }

    readBytes(length) {
        const value = this.data.slice(this.offset, this.offset + length);
        this.offset += length;
        return value;
    }

    readString() {
        const marker = this.readByte();

        if (marker === 0x00) return "";
        if (marker !== 0x0b) {
            throw new Error(`Invalid string marker: ${marker}`);
        }

        const length = this.readULEBheader();
        if (length === 0) return "";
        const slice = this.data.subarray(this.offset, this.offset + length);
        this.offset += length;
        return new TextDecoder("utf-8").decode(slice);
    }

    readULEBheader() {
        let result = 0;
        let shift = 0;

        while (true) {
            const byte = this.readByte();

            result += (byte & 0x7F) * (2 ** shift);

            if ((byte & 0x80) === 0) break;
            
            shift += 7;

        }
        if (shift > 53) throw new Error("ULEB128 value is too large to be represented as a JavaScript number");
        return result;
    }
}

const ReplayKeys = {
    m1: 1,
    m2: 2,
    k1: 4,
    k2: 8,
    smoke: 16
};

function decodeKeys(keys) {
    return {
        m1: (keys & ReplayKeys.m1) !== 0,
        m2: (keys & ReplayKeys.m2) !== 0,
        k1: (keys & ReplayKeys.k1) !== 0,
        k2: (keys & ReplayKeys.k2) !== 0,
        smoke: (keys & ReplayKeys.smoke) !== 0
    };
}