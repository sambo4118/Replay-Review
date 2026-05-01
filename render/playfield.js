import { Container, Graphics } from 'pixi.js';

const PLAYFIELD_WIDTH = 512;
const PLAYFIELD_HEIGHT = 384;

export function createPlayfield(app) {
    const container = new Container();
    
    const background = new Graphics()
        .rect(0, 0, PLAYFIELD_WIDTH, PLAYFIELD_HEIGHT)
        .fill({ color: 0x111111, alpha: 0.6 })
        .stroke({ color: 0x444444, width: 1 });
    container.addChild(background);

    const hitObjectsLayer = new Container();
    const cursorLayer = new Container();
    container.addChild(hitObjectsLayer, cursorLayer);

    const MENU_WIDTH = 240;
    const PADDING = 20;

    function fitToScreen() {
        const availableWidth  = app.screen.width  - MENU_WIDTH - PADDING;
        const availableHeight = app.screen.height - PADDING * 2;

        const scale = Math.min(
            availableWidth  / PLAYFIELD_WIDTH,
            availableHeight / PLAYFIELD_HEIGHT
        );
        container.scale.set(scale);

        container.x = MENU_WIDTH + (availableWidth  - PLAYFIELD_WIDTH  * scale) / 2;
        container.y = PADDING    + (availableHeight - PLAYFIELD_HEIGHT * scale) / 2;
        
    }

    fitToScreen();
    app.renderer.on('resize', fitToScreen);

    function show(session) {
        hitObjectsLayer.removeChildren();

        const cs = session.beatmap.difficulty._CS ?? 5;
        const radius = 54.4 - 4.48 * cs;
        console.log(session.beatmap.hitObjects[0]);
        for (const obj of session.beatmap.hitObjects) {
            const pos = obj.startPosition; // { x, y } in osu-classes
            const circle = new Graphics()
                .circle(pos.x, pos.y, radius)
                .fill({ color: 0xffaa00, alpha: 0.5 })
                .stroke({ color: 0xffffff, width: 2 });
            hitObjectsLayer.addChild(circle);
        }
    }

    return { container, hitObjectsLayer, cursorLayer, show };
}