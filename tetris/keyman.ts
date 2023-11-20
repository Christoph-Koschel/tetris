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

/**
 * Type definition for a KeyMan interrupt function.
 * Represents a function that can be invoked as an interrupt.
 * @type {KeyManInt}
 */
type KeyManInt = () => void;

/**
 * KeyMan represents the handler for keyboard interrupts
 * @class
 */
class KeyMan {
    /**
     * Stores interrupt pairs.
     * @type {Map<string, KeyManInt>}
     * @private
     */
    private keys: Map<string, KeyManInt>;

    public constructor() {
        this.keys = new Map<string, KeyManInt>
    }

    /**
     * Initializes the global event listener for KeyMan.
     * @public
     * @returns {void}
     */
    public init(): void {
        window.addEventListener("keyup", (e) => {
            if (this.keys.has(e.key)) {
                this.keys.get(e.key)();
            }
        });
    }

    /**
     * Registers a new interrupt with a key and its callback.
     * If a key has already an interrupt it will be overwritten with the new handler
     * @public
     * @param {string} key - The key to register.
     * @param {KeyManInt} cb - The callback function to associate with the key.
     * @returns {void}
     */
    public register(key: string, cb: KeyManInt): void {
        this.keys.set(key, cb);
    }
}

/**
 * The exported constant variable for KeyMan.
 * @type {KeyMan}
 */
export const keyman: KeyMan = new KeyMan();