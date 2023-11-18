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


export const SCREEN_WIDTH: number = 1080;
export const SCREEN_HEIGHT: number = 1920;

export const CELL_COUNT_X: number = 10;
export const CELL_COUNT_Y: number = 20;

export const BOARD_WIDTH: number = 500;
export const CELL_SIZE: number = BOARD_WIDTH / CELL_COUNT_X;
export const BOARD_HEIGHT: number = CELL_SIZE * CELL_COUNT_Y;
export const BOARD_X: number = SCREEN_WIDTH / 2 - BOARD_WIDTH / 2;
export const BOARD_Y: number = (SCREEN_HEIGHT - BOARD_HEIGHT) / 2;

export const DETAILS_MARGIN: number = CELL_SIZE;

export const DETAILS_X: number = BOARD_X + BOARD_WIDTH + DETAILS_MARGIN;
export const DETAILS_Y: number = BOARD_Y;

export const DETAILS_WIDTH: number = 250;
export const DETAILS_HEIGHT: number = DETAILS_WIDTH;
