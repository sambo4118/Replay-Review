import { Container, Graphics, Text } from 'pixi.js';
import '@pixi/layout';
import { createButton } from './button.js';

export function createMenu(app, callbacks) {
    const menuContainer = new Container();
    menuContainer.layout = {
        width: 200,
        height: app.screen.height,
        flexDirection: 'column',
        gap: 20,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    }

    const background = new Graphics()
        .rect(0, 0, menuContainer.layout.width, menuContainer.layout.height)
        .fill({ color: 0x1a1a1a, alpha: 0.9 });
    background.layout = false;
    menuContainer.addChild(background);
    
    const buttons = {
        openReplay: createButton({ label: "Open Replay", onClick: callbacks.onOpenReplay }),
        settings:   createButton({ label: "Settings",    onClick: callbacks.onOpenSettings }),
        about:      createButton({ label: "About",       onClick: callbacks.onOpenAbout })
    };
    menuContainer.addChild(...Object.values(buttons));
    
    return menuContainer;
}