export class Reader {
    constructor(buffer) {
        this.view = new DataView(buffer);
        this.bytes = new Uint8Array(buffer);
        this.offset = 0;
    }

    u8() {
        const v = this.view.getUint8(this.offset);
        this.offset += 1;
        return v;
    }

    u16() {
        const v = this.view.getUint16(this.offset, true);
        this.offset += 2;
        return v;
    }

    u32() {
        const v = this.view.getUint32(this.offset, true);
        this.offset += 4;
        return v;
    }

    i32() {
        const v = this.view.getInt32(this.offset, true);
        this.offset += 4;
        return v;
    }

    i64() {
        const v = this.view.getBigInt64(this.offset, true);
        this.offset += 8;
        return v;
    }

    f64() {
        const v = this.view.getFloat64(this.offset, true);
        this.offset += 8;
        return v;
    }

    take(n) {
        const slice = this.bytes.subarray(this.offset, this.offset + n);
        this.offset += n;
        return slice;
    }

    uleb128() {
        let result = 0;
        let shift = 0;
        while (true) {
            const byte = this.u8();
            result |= (byte & 0x7f) << shift;
            if ((byte & 0x80) === 0) return result;
            shift += 7;
        }
    }

    string() {
        const tag = this.u8();
        if (tag === 0x00) return '';
        if (tag !== 0x0b) {
            throw new Error(`Bad string tag 0x${tag.toString(16)} at offset ${this.offset - 1}`);
        }
        const len = this.uleb128();
        const slice = this.take(len);
        return new TextDecoder('utf-8').decode(slice);
    }
}