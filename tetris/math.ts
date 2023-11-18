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
import {BOARD_X, BOARD_Y, CELL_SIZE} from "./constants";

export type Point = {
    x: number;
    y: number;
}

export type TransformBox = {
    height: number;
    width: number;
}

export abstract class VirtualPoint {
    public readonly vx: number;
    public readonly vy: number;

    public constructor(x: number, y: number) {
        this.vx = x;
        this.vy = y;
    }

    public abstract get x(): number;

    public abstract get y(): number;

    public calc(x: number, y: number): VirtualPoint {
        // @ts-ignore
        return new this.constructor(this.vx + x, this.vy + y);
    }

    public clone(x: number, y: number): VirtualPoint {
        // @ts-ignore
        return new this.constructor(x, y);
    }
}

export function pointOf(x: number, y: number): Point {
    return {
        x: x,
        y: y
    }
}

export function sizeOf(width: number, height: number): TransformBox {
    return {
        width: width,
        height: height
    }
}

export function virtualOf(constr: typeof VirtualPoint, x: number, y: number): VirtualPoint {
    // @ts-ignore
    return new constr(x, y);
}

export class BoardPoint extends VirtualPoint {
    get x(): number {
        return this.vx * CELL_SIZE + BOARD_X;
    }

    get y(): number {
        return this.vy * CELL_SIZE + BOARD_Y;
    }

}