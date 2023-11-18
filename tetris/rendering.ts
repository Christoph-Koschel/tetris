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
import {Point, TransformBox, VirtualPoint} from "./math";
import {CELL_SIZE} from "./constants";

export type Render = CanvasRenderingContext2D;

export interface Game {
    start(ctx: Render): void;

    loop(ctx: Render): void;
}

export abstract class RenderObject {
    private color: string;

    protected constructor() {
        this.color = "#000000";
    }

    public setColor(color: string): void {
        this.color = color;
    }

    public getColor(): string {
        return this.color;
    }

    public draw(ctx: Render): void {
        ctx.fillStyle = this.color;
        this.onDraw(ctx);
    }

    protected abstract onDraw(ctx: Render): void;
}

export type RectType = "stroke" | "fill";

export class Rect extends RenderObject {
    public readonly cords: Readonly<Point>;
    public readonly size: Readonly<TransformBox>;
    private type: RectType;

    public constructor(cords: Point, size: TransformBox) {
        super();
        this.cords = cords;
        this.size = size;
        this.type = "fill";
    }

    public setType(type: RectType): void {
        this.type = type;
    }

    protected onDraw(ctx: Render): void {
        if (this.type == "fill") {
            ctx.fillRect(this.cords.x, this.cords.y, this.size.width, this.size.height);
        } else {
            ctx.strokeRect(this.cords.x, this.cords.y, this.size.width, this.size.height);
        }
    }
}

export class Cube extends RenderObject {
    private _cords: VirtualPoint;

    public constructor(p: VirtualPoint) {
        super();
        this._cords = p;
    }

    protected onDraw(ctx: Render): void {
        ctx.fillRect(this._cords.x, this._cords.y, CELL_SIZE, CELL_SIZE);
    }

    public get x(): number {
        return this._cords.vx;
    }

    public set x(n: number) {
        this._cords = this._cords.clone(n, this.y);
    }

    public get y(): number {
        return this._cords.vy;
    }

    public set y(n: number) {
        this._cords = this._cords.clone(this.x, n);
    }

    public get cords(): VirtualPoint {
        return this._cords;
    }
}

export class Text extends RenderObject {
    public text: string;
    public readonly cords: Readonly<Point>;
    private fontSize: number;
    private family: string;

    public constructor(cords: Point) {
        super();
        this.cords = cords;

        this.text = "";
        this.fontSize = 12;
        this.family = "Arial";
    }

    public setFontSize(px: number): void {
        this.fontSize = px;

    }

    public setFontFamily(family: string): void {
        this.family = family;

    }

    protected onDraw(ctx: Render): void {
        ctx.font = `${this.fontSize}px ${this.family}`;
        ctx.fillText(this.text, this.cords.x, this.cords.y);
    }

}