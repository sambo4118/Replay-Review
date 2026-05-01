import { Application } from 'pixi.js';
import { createMenu } from './ui/menu.js';
import { pickFile } from '../utils/pickFile.js';
import { loadReplaySession } from '../playback/loader.js';
import { createPlayfield } from './playfield.js';
import { createEngine } from '../playback/engine.js';
import { createCursor } from './cursor.js';
import "@pixi/layout";

export async function createApp() {
    const app = new Application();
    await app.init({ resizeTo: window, background: 0x000000 });
    document.getElementById('app').appendChild(app.canvas);

    const playfield = createPlayfield(app);
    app.stage.addChild(playfield.container);
    
    const cursor = createCursor();
    playfield.cursorLayer.addChild(cursor.node);

    const engine = createEngine(app);
    engine.onUpdate(({ x, y }) => cursor.setPosition(x, y));
    
    const menu = createMenu(app, {
        onOpenReplay: async () => {
            const session = await loadReplaySession();
            if (!session) return;
            playfield.show(session);
            engine.load(session.replay);
            engine.play();
        },
        onOpenSettings: () => {
            alert("Settings not implemented yet.");
        },
        onOpenAbout: () => {
            alert("check back latter");
        }
    });
    menu.x = 20;
    menu.y = 20;
    app.stage.addChild(menu);


    return app;
}