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
} from "./constants";
import createEntity from "./entity";
import { renderText } from "./font";
import { Collision, Keys, Entity, ScreenType, Tiny2dContext } from "./types";

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

  render(accumulator / dt);
};

//-------------------------------------------------------------------------
// UPDATE LOOP
//-------------------------------------------------------------------------

const update = () => {
  switch (screen) {
    case ScreenType.MAIN_MENU:
      if (keys.e) screen = ScreenType.GAME_LEVEL;
      break;
    case ScreenType.GAME_LEVEL:
      updatePlayer();
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

    if (boxCollision?.left && player.x + player.velocityX < box.x + box.width) {
      player.x = box.x + box.width;
      player.velocityX = 0;
    }

    if (
      boxCollision?.right &&
      player.x + player.width < box.x + player.velocityX
    ) {
      player.x = box.x - player.width;
      player.velocityX = 0;
    }
  }
};

//-------------------------------------------------------------------------
// RENDER LOOP
//-------------------------------------------------------------------------

const render = (lagOffset: number) => {
  player.renderX = (player.x - player.oldX) * lagOffset + player.oldX;
  player.renderY = (player.y - player.oldY) * lagOffset + player.oldY;

  if (
    innerW != innerWidth ||
    innerH != innerHeight ||
    dpr != (devicePixelRatio || 1)
  ) {
    innerW = innerWidth;
    innerH = innerHeight;
    dpr = devicePixelRatio || 1;

    const gameWidth = NATIVE_WIDTH * dpr;
    const gameHeight = NATIVE_HEIGHT * dpr;

    _.width = buffer.width = gameWidth;
    _.height = buffer.height = gameHeight;
    const scaleX = innerW / gameWidth;
    const scaleY = innerH / gameHeight;
    const scaleToFit = Math.min(scaleX, scaleY);
    _.style.transform = `scale(${scaleToFit}) translate(-50%,-50%)`;
    context.imageSmoothingEnabled = false;
    bufferContext.scale(dpr, dpr);
  } else {
    context.clearRect(0, 0, innerW, innerH);
    bufferContext.clearRect(0, 0, innerW * dpr, innerH * dpr);
  }

  bufferContext.fillStyle = "#121212";
  bufferContext.fc(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

  switch (screen) {
    case ScreenType.MAIN_MENU:
      renderText(bufferContext, "EYES NOT FOUND", 68, 180, 80);
      renderText(bufferContext, "PRESS SPACE TO START", 320, 310, 24);
      renderText(
        bufferContext,
        "CREATED BY RUUD SCHROEN",
        30,
        NATIVE_HEIGHT - 44,
        14
      );
      renderText(bufferContext, "JS13K 2020", 884, NATIVE_HEIGHT - 44, 14);
      break;
    case ScreenType.GAME_LEVEL:
      bufferContext.fillStyle = "lightgray";
      bufferContext.strokeStyle = "lightgray";
      bufferContext.beginPath();
      bufferContext.moveTo(0, 32);
      bufferContext.lineTo(NATIVE_WIDTH, 32);
      bufferContext.rc(player.x, player.y, player.width, player.height);
      for (let i = 0; i < boxes.length; i++) {
        bufferContext.rc(
          boxes[i].x,
          boxes[i].y,
          boxes[i].width,
          boxes[i].height
        );
      }
      bufferContext.fill();
      bufferContext.stroke();
  }

  context.da(buffer, 0, 0, NATIVE_WIDTH * dpr, NATIVE_HEIGHT * dpr);
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

//-------------------------------------------------------------------------
// INITIALIZATION
//-------------------------------------------------------------------------

const boxes: Entity[] = [];
const buffer = document.createElement("canvas");
const bufferContext = buffer.getContext("2d") as Tiny2dContext;
const context = _.getContext("2d") as Tiny2dContext;
const dt = 0.01;
const keys: Keys = {};
const player = createEntity(100, 100, 16, 16);

let accumulator = 0;
let dpr = 0;
let innerW,
  innerH = 0;
let previousKeys: Keys = {};
let previousTime = 0;
let screen: ScreenType = ScreenType.MAIN_MENU;

// dimensions
boxes.push(createEntity(0, NATIVE_HEIGHT - 50, NATIVE_WIDTH, 50));
boxes.push(createEntity(0, NATIVE_HEIGHT - 100, 50, 100));
boxes.push(createEntity(200, NATIVE_HEIGHT - 100, 50, 100));

/**
 * Shortens context function names. Example: clearRect becomes ce
 */
for (const func in context)
  context[func[0] + (func[6] || func[2])] = context[func];
for (const func in bufferContext)
  bufferContext[func[0] + (func[6] || func[2])] = bufferContext[func];

/**
 * Taken from https://xem.github.io/articles/jsgamesinputs.html
 * Maps both WASD and ZQSD to Up, Down, Left and Right
 */
onkeydown = onkeyup = (event) =>
  (keys["lurdlRdTl*urEu*_e**s"[(event.which + 3) % 20]] = Number(
    event.type[3] < "u"
  ));

window.requestAnimationFrame(gameLoop);
