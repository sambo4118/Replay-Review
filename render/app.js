import { Application } from 'pixi.js';
import { createMenu } from './ui/menu.js';
import { pickFile } from '../utils/pickFile.js';
import { loadReplaySession } from '../playback/loader.js';
import "@pixi/layout";

export async function createApp() {
    const app = new Application();
    await app.init({ resizeTo: window, background: 0x000000 });
    document.getElementById('app').appendChild(app.canvas);

    const menu = createMenu(app, {
        onOpenReplay:async () => {
            const session = await loadReplaySession();
            if (!session) return;
            console.log(session);
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