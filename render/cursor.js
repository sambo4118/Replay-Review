import { Graphics } from 'pixi.js';

export function createCursor() {
    const cursor = new Graphics()
        .circle(0, 0, 6)
        .fill(0xff0000)
        .stroke({ color: 0xffffff, width: 2 });

    return {
        node: cursor,
        setPosition(x, y) {
            cursor.x = x;
            cursor.y = y;
        }
    };
}