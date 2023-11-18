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
const {ConfigBuilder} = require("./engine/config");
const {PLUGINS} = require("./engine/plugins");
let builder = new ConfigBuilder();

builder.add_module("tetris", [
    "./tetris"
])
    .use(PLUGINS.TSB.MINIFIER)
    .add_loader("./tetris/loader.ts");

exports.default = builder.build();