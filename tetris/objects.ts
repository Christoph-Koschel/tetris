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
import {VirtualPoint} from "./math";
import {Cube, Render} from "./rendering";
import {CELL_COUNT_X, CELL_COUNT_Y} from "./constants";

export type GameObjectDefinitions =
    typeof Box
    | typeof TBox
    | typeof ZBox
    | typeof RZBox
    | typeof LBox
    | typeof RLBox
    | typeof LineBox

export enum RotationIndex {
    TOP,
    LEFT,
    BOTTOM,
    RIGHT
}


export abstract class GameObject {
    protected mainShape: Cube;
    protected shapes: Cube[];
    protected rotationIndex: RotationIndex;

    protected constructor(_: VirtualPoint) {
        this.mainShape = null;
        this.shapes = [];
        this.rotationIndex = RotationIndex.BOTTOM;
    }

    public drawOffGrid(ctx: Render, cords: VirtualPoint): void {
        this.shapes.forEach(s => {
            let fake: Cube = new Cube(s.cords.calc(cords.vx, cords.vy));
            fake.setColor(this.shapes[0].getColor());
            fake.draw(ctx);
        });
    }

    public draw(ctx: Render): void {
        this.shapes.forEach(s => s.draw(ctx));
    }

    public down(): void {
        this.shapes.forEach(s => s.y = s.y + 1);
    }

    public left(): void {
        this.shapes.forEach(s => s.x = s.x - 1);
    }

    public right(): void {
        this.shapes.forEach(s => s.x = s.x + 1);
    }

    public abstract rotate(): void;

    public abstract canRotate(sealed: number[][]): boolean;

    public getBottom(): number {
        let y: number = -1;
        this.shapes.forEach(s => {
            if (y == -1) {
                y = s.y;
            } else if (s.y > y) {
                y = s.y;
            }
        });

        return y;
    }

    public getLeft(): number {
        let x: number = -1;
        this.shapes.forEach(s => {
            if (x == -1) {
                x = s.x;
            } else if (s.x < x) {
                x = s.x;
            }
        });

        return x;
    }

    public getRight(): number {
        let x: number = -1;
        this.shapes.forEach(s => {
            if (x == -1) {
                x = s.x;
            } else if (s.x > x) {
                x = s.x;
            }
        });

        return x;
    }

    public canGoDown(sealed: number[][]): boolean {
        let points: Map<number, Cube> = new Map<number, Cube>();
        this.shapes.forEach(s => {
            if (points.has(s.x)) {
                if (points.get(s.x).y < s.y) {
                    points.set(s.x, s);
                }
            } else {
                points.set(s.x, s);
            }
        });

        let can: boolean = true;
        points.forEach(s => {
            if (sealed[s.y + 1][s.x] == 1) {
                can = false;
            }
        });

        return can;
    }

    public canGoLeft(sealed: number[][]): boolean {
        let points: Map<number, Cube> = new Map<number, Cube>();
        this.shapes.forEach(s => {
            if (points.has(s.y)) {
                if (points.get(s.y).x > s.x) {
                    points.set(s.y, s);
                }
            } else {
                points.set(s.y, s);
            }
        });

        let can: boolean = true;
        points.forEach(s => {
            if (sealed[s.y][s.x - 1] == 1) {
                can = false;
            }
        });

        return can;
    }

    public canGoRight(sealed: number[][]): boolean {
        let points: Map<number, Cube> = new Map<number, Cube>();
        this.shapes.forEach(s => {
            if (points.has(s.y)) {
                if (points.get(s.y).x < s.x) {
                    points.set(s.y, s);
                }
            } else {
                points.set(s.y, s);
            }
        });

        let can: boolean = true;
        points.forEach(s => {
            if (sealed[s.y][s.x + 1] == 1) {
                can = false;
            }
        });

        return can;
    }

    public setColor(color: string): void {
        this.shapes.forEach(s => s.setColor(color));
    }

    public seal(sealed: number[][]): Cube[] {
        this.shapes.forEach(s => {
            sealed[s.y][s.x] = 1
        });
        return this.shapes;
    }

    protected check(sealed: number[][], p: VirtualPoint): boolean {
        return p.vx >= 0 && p.vx < CELL_COUNT_X && p.vy >= 0 && p.vy < CELL_COUNT_Y && sealed[p.vy][p.vx] != 1;
    }
}

export class Box extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords),
            new Cube(cords.calc(1, 0)),
            new Cube(cords.calc(0, 1)),
            new Cube(cords.calc(1, 1))
        );

        this.setColor("#ffff00");
    }

    rotate(): void {
    }

    canRotate(): boolean {
        return false;
    }
}

export class TBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords),
            new Cube(cords.calc(1, 0)),
            new Cube(cords.calc(2, 0)),
            new Cube(cords.calc(1, 1)),
        );
        this.mainShape = this.shapes[1];

        this.setColor("#9900ff");
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 0)),
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(0, -1)),
            ]
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(-1, 0)),
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(0, 1)),
            ]
        }

        this.setColor(this.mainShape.getColor());
    }

    public canRotate(sealed: number[][]): boolean {

        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0));
        }
        if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1));
        }
        if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0));
        }
        if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1));
        }

        return false;
    }
}

export class ZBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords.calc(1, 0)),
            new Cube(cords.calc(2, 0)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(0, 1))
        );
        this.mainShape = this.shapes[2];

        this.setColor("#ff0000");
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, 1)),
                new Cube(this.mainShape.cords.calc(0, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(-1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(-1, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(1, -1)),
                new Cube(this.mainShape.cords.calc(-1, 0))
            ];
        }
        this.setColor(this.mainShape.getColor());
    }


    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1));

        }
        if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1));

        }
        if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1));
        }
        if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0));
        }

        return false;
    }
}

export class RZBox extends GameObject {

    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords),
            new Cube(cords.calc(1, 0)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(2, 1))
        );

        this.mainShape = this.shapes[2];

        this.setColor("#00ff00");
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, -1)),
                new Cube(this.mainShape.cords.calc(0, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(-1, -1))
            ];
        }
        this.setColor(this.mainShape.getColor());
    }

    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1));
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1));
        } else if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1));
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1));
        }

        return false;
    }
}

export class LBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords.calc(0, 1)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(2, 1)),
            new Cube(cords.calc(2, 0))
        );

        this.mainShape = this.shapes[1];

        this.setColor("#ffaa00");
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(-1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(-1, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, -1))
            ];
        }
        this.setColor(this.mainShape.getColor());
    }

    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1));
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1));
        } else if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1));
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1));
        }

        return false;
    }
}

export class RLBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords),
            new Cube(cords.calc(0, 1)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(2, 1))
        );

        this.mainShape = this.shapes[2];

        this.setColor("#0000ff");
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(1, -1))
            ];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(-1, 1))
            ];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                this.mainShape,
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(-1, -1))
            ];
        }
        this.setColor(this.mainShape.getColor());
    }

    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1));
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1));
        } else if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1));
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords) &&
                this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1));
        }

        return false;
    }
}

export class LineBox extends GameObject {
    public constructor(cords: VirtualPoint) {
        super(cords);

        this.shapes.push(
            new Cube(cords.calc(0, 1)),
            new Cube(cords.calc(1, 1)),
            new Cube(cords.calc(2, 1)),
            new Cube(cords.calc(3, 1))
        );

        this.mainShape = this.shapes[1];

        this.setColor("#00ffff");
    }

    public rotate(): void {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            this.rotationIndex = RotationIndex.LEFT;

            this.shapes = [
                new Cube(this.mainShape.cords.calc(1, 0)),
                new Cube(this.mainShape.cords.calc(1, -1)),
                new Cube(this.mainShape.cords.calc(1, 1)),
                new Cube(this.mainShape.cords.calc(1, 2))
            ];
            this.setColor(this.mainShape.getColor());
            this.mainShape = this.shapes[0];
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            this.rotationIndex = RotationIndex.TOP;

            this.shapes = [
                new Cube(this.mainShape.cords.calc(0, 1)),
                new Cube(this.mainShape.cords.calc(1, 1)),
                new Cube(this.mainShape.cords.calc(-1, 1)),
                new Cube(this.mainShape.cords.calc(-2, 1))
            ];
            this.setColor(this.mainShape.getColor());
            this.mainShape = this.shapes[0];
        } else if (this.rotationIndex == RotationIndex.TOP) {
            this.rotationIndex = RotationIndex.RIGHT;

            this.shapes = [
                new Cube(this.mainShape.cords.calc(-1, 0)),
                new Cube(this.mainShape.cords.calc(-1, 1)),
                new Cube(this.mainShape.cords.calc(-1, -1)),
                new Cube(this.mainShape.cords.calc(-1, -2))
            ];
            this.setColor(this.mainShape.getColor());
            this.mainShape = this.shapes[0];
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            this.rotationIndex = RotationIndex.BOTTOM;

            this.shapes = [
                new Cube(this.mainShape.cords.calc(0, -1)),
                new Cube(this.mainShape.cords.calc(-1, -1)),
                new Cube(this.mainShape.cords.calc(1, -1)),
                new Cube(this.mainShape.cords.calc(2, -1))
            ];
            this.setColor(this.mainShape.getColor());
            this.mainShape = this.shapes[0];
        }
    }

    public canRotate(sealed: number[][]): boolean {
        if (this.rotationIndex == RotationIndex.BOTTOM) {
            return this.check(sealed, this.mainShape.cords.calc(1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 2));
        } else if (this.rotationIndex == RotationIndex.LEFT) {
            return this.check(sealed, this.mainShape.cords.calc(0, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-2, 1));
        } else if (this.rotationIndex == RotationIndex.TOP) {
            return this.check(sealed, this.mainShape.cords.calc(-1, 0)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, 1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -2));
        } else if (this.rotationIndex == RotationIndex.RIGHT) {
            return this.check(sealed, this.mainShape.cords.calc(0, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(-1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(1, -1)) &&
                this.check(sealed, this.mainShape.cords.calc(2, -1));
        }

        return false;
    }
}


export const GAME_OBJECTS: GameObjectDefinitions[] = [Box, TBox, ZBox, RZBox, LBox, RLBox, LineBox];