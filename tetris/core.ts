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
import {Cube, Game, Rect, Render, Text} from "./rendering";
import {
    BOARD_HEIGHT,
    BOARD_WIDTH,
    BOARD_X,
    BOARD_Y,
    CELL_COUNT_X,
    CELL_COUNT_Y,
    CELL_SIZE,
    DETAILS_HEIGHT,
    DETAILS_WIDTH,
    DETAILS_X,
    DETAILS_Y
} from "./constants";
import {BoardPoint, pointOf, sizeOf, virtualOf} from "./math";
import {GAME_OBJECTS, GameObject} from "./objects";
import {keyman} from "./keyman";


/**
 * Representing the Main Control over the Game including the render loop and component management
 * @implements Game
 */
export class Tetris implements Game {
    private detailsRect: Rect;
    private pointsText: Text;

    private gameRect: Rect;
    private grid: Rect[][];
    private sealed: number[][];
    private movable: GameObject;
    private nextMovable: GameObject;
    private buffered: Cube[];

    private speedLoop: number;
    private points: number;
    private cleared: number;
    private needToClear: number;
    private level: number;
    private combo: number;

    public start(ctx: Render): void {
        keyman.init();
        keyman.register("s", () => {
            this.moveDown();
        });
        keyman.register("d", () => {
            if ((this.movable.getRight() < CELL_COUNT_X - 1) && this.movable.canGoRight(this.sealed)) {
                this.movable.right();
            }
        });
        keyman.register("a", () => {
            if ((this.movable.getLeft() > 0) && this.movable.canGoLeft(this.sealed)) {
                this.movable.left();
            }
        });
        keyman.register("l", () => {
            if (this.movable.canRotate(this.sealed)) {
                this.movable.rotate();
            }
        });
        keyman.register(" ", () => {
            while (true) {
                if (!this.moveDown()) {
                    break;
                }
            }
        });

        this.gameRect = new Rect(pointOf(BOARD_X, BOARD_Y), sizeOf(BOARD_WIDTH, BOARD_HEIGHT));
        this.gameRect.setColor("#CCCCCC");

        this.grid = [];
        this.sealed = Array.from({length: CELL_COUNT_Y}, () => new Array(CELL_COUNT_X).fill(0));
        for (let i: number = 0, x: number = 0; i < CELL_COUNT_X; i++, x += CELL_SIZE) {
            let row: Rect[] = [];
            for (let k: number = 0, y: number = 0; k < CELL_COUNT_Y; k++, y += CELL_SIZE) {
                let cell: Rect = new Rect(pointOf(x + BOARD_X, y + BOARD_Y), sizeOf(CELL_SIZE, CELL_SIZE));
                cell.setColor("#000000");
                cell.setType("stroke");

                row.push(cell);
            }

            this.grid.push(row);
        }

        this.detailsRect = new Rect(pointOf(DETAILS_X, DETAILS_Y), sizeOf(DETAILS_WIDTH, DETAILS_HEIGHT));
        this.detailsRect.setColor("#CCCCCC");
        this.pointsText = new Text(pointOf(DETAILS_X + 20, DETAILS_Y + 40));
        this.pointsText.setFontSize(30);
        this.pointsText.text = "00000";

        this.movable = this.newGameObject();
        this.moveRandom();
        this.nextMovable = this.newGameObject();
        this.buffered = [];

        this.points = 0;
        this.level = 1;
        this.combo = 0;
        this.cleared = 0;
        this.needToClear = 5;
        this.resetSpeedInterval();
    }

    public loop(ctx: Render): void {
        this.detailsRect.draw(ctx);
        this.pointsText.draw(ctx);
        this.nextMovable.drawOffGrid(ctx, virtualOf(BoardPoint, CELL_COUNT_X + 2, 2));
        this.gameRect.draw(ctx);
        this.grid.forEach(row => row.forEach(cell => cell.draw(ctx)));
        this.buffered.forEach(cell => cell.draw(ctx));
        this.movable.draw(ctx);
    }

    private resetSpeedInterval(): void {
        if (!!this.speedLoop) {
            clearInterval(this.speedLoop);
        }

        this.speedLoop = setInterval((): void => {
            this.moveDown();
        }, 500 - (this.level - 1) * 10);
    }

    private newGameObject(): GameObject {
        return new GAME_OBJECTS[Math.floor(Math.random() * (GAME_OBJECTS.length))](virtualOf(BoardPoint, 0, 0));
    }

    private moveRandom(): void {
        const rightMoving: number = Math.floor(Math.random() * (CELL_COUNT_X + 1));
        for (let i: number = 0; i < rightMoving; i++) {
            if ((this.movable.getRight() < CELL_COUNT_X - 1) && this.movable.canGoRight(this.sealed)) {
                this.movable.right();
            } else {
                break;
            }
        }
    }

    private checkAndClearLine(): void {
        let cleared: number = 0;
        this.sealed.forEach((l: number[], i: number) => {
            let sum: number = l.reduce((a: number, b: number) => a + b);
            if (sum == CELL_COUNT_X) {
                this.sealed.splice(i, 1);
                this.sealed.unshift(new Array(CELL_COUNT_X).fill(0));
                this.buffered = this.buffered.filter(b => b.y != i);
                this.buffered.forEach(b => b.y < i ? b.y += 1 : null);
                cleared++;
            }
        });

        if (cleared != 0) {
            // https://tetris.wiki/Scoring
            switch (cleared) {
                case 1:
                    this.points += 100 * this.level;
                    break;
                case 2:
                    this.points += 300 * this.level;
                    break;
                case 3:
                    this.points += 500 * this.level;
                    break;
                default:
                    this.points += 1200 * this.level;
            }
            this.points += 50 * this.combo * this.level;
            this.combo++;

            this.pointsText.text = this.points.toString().padStart(5, "0");
        } else {
            this.combo = 0;
        }

        this.cleared += cleared;
        if (this.cleared >= this.needToClear) {
            this.cleared = this.cleared - this.needToClear;
            this.level++;
            this.needToClear = this.level * 5;
            this.resetSpeedInterval();
        }
    }

    private moveDown(): boolean {
        this.movable.down();

        if (this.movable.getBottom() == CELL_COUNT_Y - 1 || !this.movable.canGoDown(this.sealed)) {
            this.buffered.push(...this.movable.seal(this.sealed));
            this.checkAndClearLine();
            this.movable = this.nextMovable;
            this.moveRandom();
            this.nextMovable = this.newGameObject();
            if (this.sealed[0].reduce((a: number, b: number) => a + b) != 0 || this.sealed[1].reduce((a: number, b: number) => a + b) != 0) {
                clearInterval(this.speedLoop);
                alert("Game over\nPress F5 or the page reload button to restart the game");
            }
            return false;
        }

        return true;
    }
}