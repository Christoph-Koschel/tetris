# Tetris

This project is a demo version of the classic game Tetris and written for a Projectwork called Tetris Arcade Machine.

## Languages

- TypeScript
- HTML

## Libraries / Frameworks

- [tsb](https://github.com/Christoph-Koschel/tsb) - _Christoph Koschel_ [GPL-3.0] \
  For parsing and bundling TypeScript into a browser-friendly JavaScript environment.

## Playing

To play the demo version, just download the latest release of the
Tetris [Repository](https://github.com/Christoph-Koschel/tetris), unzip the archive, and use any kind of preview server
or an actual server to open the HTML File.

> **Note:** The HTML File cannot be only opened in the browser because the JavaScript file would not be executed (
> Blocked by CORS).

## Building

Here is a step-by-step guide to building the demo version:

1. Download and install the [NodeJS Runtime](https://nodejs.org/en). At least the version 18.18.0 must be used.
2. Download the source code
   via. git
   ```shell
   git clone https://github.com/Christoph-Koschel/tetris
   ```
   or download the branch [zip archive](https://github.com/Christoph-Koschel/tetris/archive/refs/heads/master.zip) from GitHub.
3. Open a terminal in the project folder
4. Install the TSB Build Toolchain
   ```shell
   npm install ./utils/tsb-2.0.0.tgz --global
   ```
5. Install dependencies
   ```shell
   npm install typescript --global
   ```   
6. Verify the installations
   ```shell
   tsb
   ```
   ```shell
   node --version
   ```
   ```shell
   tsc --version
   ```
   If the `tsb` and `tsc` commands cannot be found on your system, then check if the global npm folder is in the PATH
   Environment Variable included. (Windows: %AppData%\npm).
7. Build the project
   ```shell
   tsb build
   ```
