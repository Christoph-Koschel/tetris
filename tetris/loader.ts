/*
 * Copyright (C) 2023 Christoph Koschel - All Rights Reserved
 *
 * You may use, distribute, and modify this code under the
 * terms of the MIT license, which can be found
 * in the accompanying LICENSE.txt.
 *
 * You should have received a copy of the MIT license
 * along with this file. If not, please visit https://github.com/Christoph-Koschel/tetris.
 */
import {Tetris} from "./core";
import {SCREEN_HEIGHT, SCREEN_WIDTH} from "./constants";
import {Game, Render} from "./rendering";

window.addEventListener("load", () => {
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    const tetris: Game = new Tetris();
    const ctx: Render = canvas.getContext("2d");

    const style: CSSStyleDeclaration = getComputedStyle(document.body);
    console.log("Load");
    canvas.style.width = "500px";
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    tetris.start(ctx);

    function loop(): void {
        tetris.loop(ctx);
        window.requestAnimationFrame(loop);
    }

    loop();
});