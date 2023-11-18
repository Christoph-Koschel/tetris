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
type KeyManInt = () => void;

class KeyMan {
    private keys: Map<any, any>;

    public constructor() {
        this.keys = new Map<string, KeyManInt>
    }

    public init(): void {
        window.addEventListener("keyup", (e) => {
            if (this.keys.has(e.key)) {
                this.keys.get(e.key)();
            }
        });
    }

    public register(key: string, cb: KeyManInt): void {
        this.keys.set(key, cb);
    }
}

export const keyman: KeyMan = new KeyMan();