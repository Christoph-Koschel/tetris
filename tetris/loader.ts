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

/**
 * Entry point of the game.
 * This function block should be the only one interacting with HTML.
 */
window.addEventListener("load", () => {
    // Fetch canvas
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    // Get drawable context of the canvas element
    const ctx: Render = canvas.getContext("2d");
    // Init the game Tetris
    const tetris: Game = new Tetris();

    // Set the actual screen width
    canvas.style.width = "500px";
    // Set the resolution
    canvas.width = SCREEN_WIDTH;
    canvas.height = SCREEN_HEIGHT;

    // Start the game
    tetris.start(ctx);

    // Frame loop
    function loop(): void {
        // Exec game loop
        tetris.loop(ctx);
        // Request next frame
        window.requestAnimationFrame(loop);
    }

    loop();
});