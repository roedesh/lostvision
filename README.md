## Lost Vision

This is my submission for the JS13k 2020 game jam.

It is a platformer where you don't see the level, because your character lost their vision. You can temporarily reveal the space around you using echolocating (similar to what bats do). With that power, you need to reach the exit of the level.

## Controls

Walking/jumping = WASD/ZWSD/Arrow keys

Perform echo = Space

## Requirements

The commands assume [Yarn](https://yarnpkg.com/en/docs/install) is installed.

## Commands

### `yarn install`

Installs dependencies.

### `yarn start`

Starts [webpack-dev-server](https://webpack.js.org/configuration/dev-server/) at `http://0.0.0.0:8080`.

### `yarn build`

Builds, minifies, and inlines the game to `./dist/index.html`.

### `yarn party`

Builds, minifies, inlines, and zips the game to `./zipped/game.zip`.
