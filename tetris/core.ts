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
 * Represents the main control over the Tetris game, including the render loop and component management.
 * @implements {Game}
 */
export class Tetris implements Game {
    /**
     * RenderObject for the rectangle of the details panel.
     * @type {Rect}
     * @private
     */
    private detailsRect: Rect;

    /**
     * RenderObject for the score text in the details panel.
     * @type {Text}
     * @private
     */
    private pointsText: Text;

    /**
     * RenderObject of the GameGrid.
     * @type {Rect}
     * @private
     */
    private gameRect: Rect;

    /**
     * GameObjects of the cells in the grid.
     * @type {Rect[][]}
     * @private
     */
    private grid: Rect[][];

    /**
     * 2D-Int Array for sealed cells when they are blocked by a cube.
     * Is faster for body-collision detection than looping through the {@link buffered} RenderObjects.
     * @type {number[][]}
     * @private
     */
    private sealed: number[][];

    /**
     * Current movable shape.
     * @type {GameObject}
     * @private
     */
    private movable: GameObject;

    /**
     * Next movable shape in the queue.
     * @type {GameObject}
     * @private
     */
    private nextMovable: GameObject;

    /**
     * All cubes from the shapes after placing them.
     * @type {Cube[]}
     * @private
     */
    private buffered: Cube[];

    /**
     * The int handler for the JavaScript setInterval function.
     * @type {number}
     * @private
     */
    private speedLoop: number;

    /**
     * Points of the current score.
     * @type {number}
     * @private
     */
    private points: number;

    /**
     * Defines the number of lines that were cleared since the last level.
     * @type {number}
     * @private
     */
    private cleared: number;

    /**
     * Defines the number of lines that need to be cleared for the next level.
     * @type {number}
     * @private
     */
    private needToClear: number;

    /**
     * The current level.
     * @type {number}
     * @private
     */
    private level: number;

    /**
     * The number of combos increasing by cleared lines in a row.
     * @type {number}
     * @private
     */
    private combo: number;

    public start(ctx: Render): void {
        // Initialize the key manager for key interrupts
        keyman.init();

        // Smooth down
        keyman.register("s", () => {
            this.moveDown();
        });
        // Move right
        keyman.register("d", () => {
            if ((this.movable.getRight() < CELL_COUNT_X - 1) && this.movable.canGoRight(this.sealed)) {
                this.movable.right();
            }
        });
        // Move left
        keyman.register("a", () => {
            if ((this.movable.getLeft() > 0) && this.movable.canGoLeft(this.sealed)) {
                this.movable.left();
            }
        });
        // Rotation anticlockwise
        keyman.register("l", () => {
            if (this.movable.canRotate(this.sealed)) {
                this.movable.rotate();
            }
        });
        // FastDown
        keyman.register(" ", () => {
            while (true) {
                if (!this.moveDown()) {
                    break;
                }
            }
        });

        // Create the game background
        this.gameRect = new Rect(pointOf(BOARD_X, BOARD_Y), sizeOf(BOARD_WIDTH, BOARD_HEIGHT));
        this.gameRect.setColor("#CCCCCC");

        // Create the cells and the sealed 2D-int array
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

        // Create the details panel
        this.detailsRect = new Rect(pointOf(DETAILS_X, DETAILS_Y), sizeOf(DETAILS_WIDTH, DETAILS_HEIGHT));
        this.detailsRect.setColor("#CCCCCC");
        this.pointsText = new Text(pointOf(DETAILS_X + 20, DETAILS_Y + 40));
        this.pointsText.setFontSize(30);
        this.pointsText.text = "00000";

        // Initialize the first movable GameObject
        this.movable = this.newGameObject();
        this.moveRandom();
        this.nextMovable = this.newGameObject();

        // Rest configuration
        this.buffered = [];
        this.points = 0;
        this.level = 1;
        this.combo = 0;
        this.cleared = 0;
        this.needToClear = 5;
        this.resetSpeedInterval();
    }

    public loop(ctx: Render): void {
        // Draw everything on the requested frame
        this.detailsRect.draw(ctx);
        this.pointsText.draw(ctx);
        this.nextMovable.drawOffGrid(ctx, virtualOf(BoardPoint, CELL_COUNT_X + 2, 2));
        this.gameRect.draw(ctx);
        this.grid.forEach(row => row.forEach(cell => cell.draw(ctx)));
        this.buffered.forEach(cell => cell.draw(ctx));
        this.movable.draw(ctx);
    }

    /**
     * Resets the speed interval for the Tetris game.
     * @private
     * @returns {void}
     */
    private resetSpeedInterval(): void {
        if (!!this.speedLoop) {
            clearInterval(this.speedLoop);
        }

        this.speedLoop = setInterval((): void => {
            this.moveDown();
        }, 500 - (this.level - 1) * 10);
    }

    /**
     * Creates a new random GameObject from the GAME_OBJECTS array.
     * @private
     * @returns {GameObject} A new random GameObject.
     */
    private newGameObject(): GameObject {
        return new GAME_OBJECTS[Math.floor(Math.random() * (GAME_OBJECTS.length))](virtualOf(BoardPoint, 0, 0));
    }

    /**
     * Sets the current movable GameObject in a random horizontal position.
     * @private
     * @returns {void}
     */
    private moveRandom(): void {
        // Generate a random number between 0 and CELL_COUNT_X
        const rightMoving: number = Math.floor(Math.random() * (CELL_COUNT_X + 1));
        // Moves the GameObject as long as possible to the right
        for (let i: number = 0; i < rightMoving; i++) {
            if ((this.movable.getRight() < CELL_COUNT_X - 1) && this.movable.canGoRight(this.sealed)) {
                this.movable.right();
            } else {
                break;
            }
        }
    }

    /**
     * Checks and clears lines in the Tetris game grid.
     * Additionally, increases the point counter if needed.
     * @private
     * @returns {void}
     */
    private checkAndClearLine(): void {
        // Keep track of cleared lines
        let cleared: number = 0;
        this.sealed.forEach((l: number[], i: number) => {
            // A line is full if the sum of the sealed cells is equal to the width of the GameGrid
            let sum: number = l.reduce((a: number, b: number) => a + b);
            // When a line is cleared
            if (sum == CELL_COUNT_X) {
                // Removes the sealed line
                this.sealed.splice(i, 1);
                // Insert a new empty array at the removed point
                this.sealed.unshift(new Array(CELL_COUNT_X).fill(0));
                // Removes the unnecessary buffered RenderObjects from the array
                this.buffered = this.buffered.filter(b => b.y != i);
                // Moves all RenderObject above the cleared line one down
                this.buffered.forEach(b => b.y < i ? b.y += 1 : null);
                // And increases the cleared line counter
                cleared++;
            }
        });

        // Increases the points depending on the cleared lines
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
            // Increases the combo if a line was cleared
            this.combo++;

            this.pointsText.text = this.points.toString().padStart(5, "0");
        } else {
            // Sets the combo to zero when with the current GameObject no line cleared
            this.combo = 0;
        }

        // Adds the cleared line to the global cleared lines
        this.cleared += cleared;
        // Checks and increases the level when the needed clear count was reached
        if (this.cleared >= this.needToClear) {
            this.cleared = this.cleared - this.needToClear;
            this.level++;
            this.needToClear = this.level * 5;
            // Update the speed Interval
            this.resetSpeedInterval();
        }
    }

    /**
     * This method is a utility function for moving the GameObject down.
     * @private
     * @returns {boolean} Returns false when the GameObject cannot go down any further.
     */
    private moveDown(): boolean {
        this.movable.down();

        // Check if the movable GameObject can go further down
        if (this.movable.getBottom() == CELL_COUNT_Y - 1 || !this.movable.canGoDown(this.sealed)) {
            // Adds the Cubes of the GameObject to the buffered list
            this.buffered.push(...this.movable.seal(this.sealed));
            // Check for clearing lines
            this.checkAndClearLine();
            // Go in queue one further
            this.movable = this.nextMovable;
            this.moveRandom();
            this.nextMovable = this.newGameObject();
            // Check for GameOver
            if (this.sealed[0].reduce((a: number, b: number) => a + b) != 0 || this.sealed[1].reduce((a: number, b: number) => a + b) != 0) {
                clearInterval(this.speedLoop);
                alert("Game over\nPress F5 or the page reload button to restart the game");
            }
            return false;
        }

        return true;
    }
}