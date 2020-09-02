//      ______                _   __      __  ______                      __
//     / ____/_  _____  _____/ | / /___  / /_/ ____/___  __  ______  ____/ /
//    / __/ / / / / _ \/ ___/  |/ / __ \/ __/ /_  / __ \/ / / / __ \/ __  /
//   / /___/ /_/ /  __(__  ) /|  / /_/ / /_/ __/ / /_/ / /_/ / / / / /_/ /
//  /_____/\__, /\___/____/_/ |_/\____/\__/_/    \____/\__,_/_/ /_/\__,_/
//        /____/
//
//  Author: Ruud Schroën

import {
  ACCELERATION,
  GRAVITY,
  JUMP_VELOCITY,
  MAX_SPEED,
  NATIVE_HEIGHT,
  NATIVE_WIDTH,
  PLAYER_WEIGHT,
  TILE_SIZE,
} from "./constants";
import createEntity from "./entity";
import createEcho, { performStep } from "./echo";
import { renderText } from "./font";
import { getMap, getBoxes } from "./maps";
import {
  Collision,
  Keys,
  Echo,
  Entity,
  ScreenType,
  Tiny2dContext,
} from "./types";

import heartPng from "../assets/heart.png";

//-------------------------------------------------------------------------
// MAIN LOOP
//-------------------------------------------------------------------------

const gameLoop = (currentTime: number): void => {
  window.requestAnimationFrame(gameLoop);

  let frameTime = currentTime / 1000 - previousTime;
  if (frameTime > 0.25) {
    frameTime = 0.25;
  }
  previousTime = currentTime / 1000;

  accumulator += frameTime;

  while (accumulator >= dt) {
    update();
    accumulator -= dt;
  }

  interpolate(accumulator / dt);
  render();
};

//-------------------------------------------------------------------------
// UPDATE LOOP
//-------------------------------------------------------------------------

const update = () => {
  ++counter;

  switch (screen) {
    case ScreenType.MAIN_MENU:
      if (keys.e) {
        screen = ScreenType.GAME_LEVEL;
        currentMap = getMap(level);
        boxes = getBoxes(currentMap);
      }
      break;
    case ScreenType.GAME_LEVEL:
      if (counter % 120 == 0) {
        elapsedSeconds++;
      }
      updatePlayer();
      if (counter % 4 == 0) {
        if (echo) {
          performStep(echo);
          if (echo.opacity == 0) echo = null;
        }
      }
  }

  previousKeys = { ...keys };
};

const updatePlayer = () => {
  player.oldX = player.x;
  player.oldY = player.y;

  // Update position
  player.x += player.velocityX;
  player.y += player.velocityY;

  // Check user input and update velocity
  const direction = (keys.r || 0) - (keys.l || 0);
  player.velocityX += direction * ACCELERATION;
  player.velocityX = Math.min(
    Math.max(player.velocityX, -MAX_SPEED),
    MAX_SPEED
  );

  // Apply friction
  player.velocityX *= 0.85;
  player.velocityX =
    player.velocityX >= -0.05 && player.velocityX <= 0.05
      ? 0
      : player.velocityX;

  if (!previousKeys.u && keys.u && player.velocityY == 0) {
    player.velocityY = JUMP_VELOCITY;
  }

  // Apply gravity
  if (player.velocityY < GRAVITY) player.velocityY += PLAYER_WEIGHT;

  // Check collisions
  for (const box of boxes) {
    const boxCollision = collision(player, box);

    if (
      boxCollision?.bottom &&
      player.y + player.height < box.y + player.velocityY
    ) {
      player.y = box.y - player.height;
      player.velocityY = 0;
    }

    if (
      boxCollision?.left &&
      player.x + player.velocityX < box.x + box.width + player.velocityX
    ) {
      player.x = box.x + box.width;
      player.velocityX = 0;
    }

    if (
      boxCollision?.right &&
      player.x + player.width + player.velocityX > box.x + player.velocityX
    ) {
      player.x = box.x - player.width;
      player.velocityX = 0;
    }
  }

  if (!previousKeys._ && keys._) {
    const [tileX, tileY] = pixelToTileCoordinates(player.x, player.y);
    echo = createEcho([tileY - 1, tileX], currentMap);
  }

  
};

//-------------------------------------------------------------------------
// RENDER LOOP
//-------------------------------------------------------------------------

const render = () => {
  const newInnerW = innerWidth,
    newInnerH = innerHeight,
    newDpr = devicePixelRatio || 1;

  // If the screen size or device pixel ratio has changed,
  // re-initialize the canvases.
  if (innerW != newInnerW || innerH != newInnerH || dpr != newDpr) {
    innerW = newInnerW;
    innerH = newInnerH;
    dpr = newDpr;

    const gameWidth = NATIVE_WIDTH * dpr;
    const gameHeight = NATIVE_HEIGHT * dpr;
    _.width = bufferCanvas.width = gameWidth;
    _.height = bufferCanvas.height = gameHeight;

    // Use CSS transforms to leverage the GPU
    const scaleX = innerW / gameWidth;
    const scaleY = innerH / gameHeight;
    const scaleToFit = Math.min(scaleX, scaleY);
    _.style.transform = `scale(${scaleToFit}) translate(-50%,-50%)`;

    // Enable image smoothing for low res screens
    bufferContext.imageSmoothingEnabled = false;
    context.imageSmoothingEnabled = scaleToFit < 1;

    // Set canvas drawing scale
    bufferContext.scale(dpr, dpr);
  } else {
    // If the canvas was not reinitialized, just clear it
    context.clearRect(0, 0, innerW, innerH);
    bufferContext.clearRect(0, 0, innerW * dpr, innerH * dpr);
  }

  bufferContext.fillStyle = "#121212";
  bufferContext.fc(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

  switch (screen) {
    case ScreenType.MAIN_MENU:
      renderText(bufferContext, "LOST VISION", 130, 180, 80);
      renderText(bufferContext, "PRESS ENTER TO START", 320, 310, 24);
      renderText(
        bufferContext,
        "CREATED BY RUUD SCHROEN",
        30,
        NATIVE_HEIGHT - 44,
        14
      );
      renderText(bufferContext, "JS13K 2020", 884, NATIVE_HEIGHT - 44, 14);
      break;
    case ScreenType.GAME_LEVEL: {
      bufferContext.fillStyle = "lightgray";
      bufferContext.strokeStyle = "lightgray";
      bufferContext.beginPath();
      bufferContext.moveTo(0, 32);
      bufferContext.lineTo(NATIVE_WIDTH, 32);
      bufferContext.rc(player.x, player.y, player.width, player.height);
      bufferContext.stroke();
      bufferContext.fill();

      // for (const box of boxes) {
      //   bufferContext.rc(box.x, box.y, box.width, box.height);
      // }
      if (echo) {

        bufferContext.beginPath();
        bufferContext.fillStyle = `rgba(225,225,225,${echo.opacity})`;
        for (const coords of echo.tilesToDraw) {
          bufferContext.rc(coords[1] * 16, 33 + coords[0] * 16, 16, 16);
        }
        bufferContext.fill();
      }
      
      

      bufferContext.fillStyle = "lightgray";
      const timeString = new Date(elapsedSeconds * 1000)
        .toISOString()
        .substr(11, 8);
      renderText(bufferContext, `TIME: ${timeString}`, 8, 8, 14);

      bufferContext.drawImage(heartImage, 175, 7);
      renderText(bufferContext, "X", 195, 11, 8);
      renderText(bufferContext, `3`, 208, 8, 14);
    }
  }

  context.da(bufferCanvas, 0, 0, NATIVE_WIDTH * dpr, NATIVE_HEIGHT * dpr);
};

const interpolate = (lagOffset: number) => {
  player.renderX = (player.x - player.oldX) * lagOffset + player.oldX;
  player.renderY = (player.y - player.oldY) * lagOffset + player.oldY;
};

//-------------------------------------------------------------------------
// UTILITIES
//-------------------------------------------------------------------------

const collision = (e1: Entity, e2: Entity): Collision => {
  if (
    e1.x + e1.width >= e2.x &&
    e1.x <= e2.x + e2.width &&
    e1.y + e1.height >= e2.y &&
    e1.y <= e2.y + e2.height
  ) {
    const topDiff = e2.y + e2.height - e1.y;
    const bottomDiff = e1.y + e1.height - e2.y;
    const leftDiff = e2.x + e2.width - e1.x;
    const rightDiff = e1.x + e1.width - e2.x;

    const min = Math.min(bottomDiff, topDiff, leftDiff, rightDiff);

    return {
      bottom: bottomDiff == min,
      right: rightDiff == min,
      left: leftDiff == min,
      top: topDiff == min,
    };
  }
  return null;
};

const pixelToTileCoordinates = (x: number, y: number): number[] => {
  return [Math.round(x / TILE_SIZE), Math.round(y / TILE_SIZE)];
};

//-------------------------------------------------------------------------
// INITIALIZATION
//-------------------------------------------------------------------------

const bufferCanvas = document.createElement("canvas");
const bufferContext = bufferCanvas.getContext("2d", {
  alpha: false,
}) as Tiny2dContext;
const context = _.getContext("2d", { alpha: false }) as Tiny2dContext;
const dt = 0.01;
const keys: Keys = {};
const player = createEntity(100, 100, 16, 16);

// Assets
const heartImage = new Image();
heartImage.src = heartPng;

let accumulator = 0;
let boxes: Entity[] = [];
let counter = 0;
let currentMap = [];
let elapsedSeconds = 0;
let dpr = 0;
let innerW,
  innerH = 0;
let level = 0;
let echo: Echo;
let previousKeys: Keys = {};
let previousTime = 0;
let screen: ScreenType = ScreenType.MAIN_MENU;

/**
 * Shortens context function names. Example: clearRect becomes ce
 */
for (const func in context) {
  context[func[0] + (func[6] || func[2])] = context[func];
  bufferContext[func[0] + (func[6] || func[2])] = bufferContext[func];
}

/**
 * Taken from https://xem.github.io/articles/jsgamesinputs.html
 * Maps both WASD and ZQSD to Up, Down, Left and Right
 */
onkeydown = onkeyup = (event) =>
  (keys["lurdlRdTl*urEu*_e**s"[(event.which + 3) % 20]] = Number(
    event.type[3] < "u"
  ));

window.requestAnimationFrame(gameLoop);
