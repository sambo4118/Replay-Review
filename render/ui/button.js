import { Container, Graphics, Text } from "pixi.js";

export function createButton({ label, width = 160, height = 48, onClick, parent }) {
    const container = new Container();
    container.layout = { width, height };

    const background = new Graphics()
        .roundRect(0, 0, width, height, 8)
        .fill(0xdc98a4);


    const text = new Text({ 
        text: label, 
        style: { fill: 0xffffff, fontSize: 18 }
    });
    text.x = (width - text.width) / 2;
    text.y = (height - text.height) / 2;

    container.addChild(background, text);
    container.eventMode = "static";
    container.cursor = "pointer";
    container.on("pointerdown", onClick);

    container.label = { width, height }

    parent?.addChild(container);

    return container;
}