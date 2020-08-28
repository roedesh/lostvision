//      ______                _   __      __  ______                      __
//     / ____/_  _____  _____/ | / /___  / /_/ ____/___  __  ______  ____/ /
//    / __/ / / / / _ \/ ___/  |/ / __ \/ __/ /_  / __ \/ / / / __ \/ __  /
//   / /___/ /_/ /  __(__  ) /|  / /_/ / /_/ __/ / /_/ / /_/ / / / / /_/ /
//  /_____/\__, /\___/____/_/ |_/\____/\__/_/    \____/\__,_/_/ /_/\__,_/
//        /____/
//
//  Author: Ruud Schroën

import {
  JUMP_VELOCITY,
  MAX_SPEED,
  NATIVE_HEIGHT,
  NATIVE_WIDTH,
  STEP,
  TILE_SIZE,
} from "./constants";
import { renderText } from "./font";
import { levelOne } from "./maps";
import { Direction, Keys, Entity, ScreenType, Tiny2dContext } from "./types";

//-------------------------------------------------------------------------
// GAME LOOP
//-------------------------------------------------------------------------

const gameLoop = (newTime) => {
  let frameTime = newTime - currentTime;
  currentTime = newTime;

  while (frameTime > 0.0) {
    const delta = Math.min(frameTime, STEP);

    switch (screen) {
      /**
       * Main Menu
       */
      case ScreenType.MAIN_MENU:
        if (keys._) {
          loadMap(levelOne);
          screen = ScreenType.LEVEL;
        }
        break;
      case ScreenType.LEVEL: {
        updatePlayer(delta);
      }
    }

    if (timer64 == 64) {
      hideText = !hideText;
      timer64 = 0;
    } else {
      timer64++;
    }

    frameTime -= delta;
  }

  render();
  requestAnimationFrame(gameLoop);
};

//-------------------------------------------------------------------------
// GAME FUNCTIONS
//
// Functions that contain part of the game logic.
//-------------------------------------------------------------------------

const updatePlayer = (delta) => {
  let index: number;
  const direction = keys.r || 0 - keys.l || 0;

  if (player.velocityY == 0 && keys._ && !isFreeSpace(player.x, player.y + 1)) {
    player.velocityY = JUMP_VELOCITY;
  }

  // Move player horizontally
  moveSpeed +=
    direction != Direction.NONE && moveSpeed < MAX_SPEED
      ? 1
      : moveSpeed > 0
      ? -1
      : 0;

  // If user is pressing left or right, use current direction
  // Otherwise use last known direction to slow the player down
  const dirToUse = direction != Direction.NONE ? direction : lastDirection;

  for (index = moveSpeed; index > 0; index--) {
    if (isFreeSpace(player.x + index * direction, player.y)) {
      player.x += index * dirToUse;
      break;
    }
  }

  lastDirection = direction;

  if (isFreeSpace(player.x, player.y + 0.01 * delta)) {
    player.velocityY += 0.01;
  } else if (player.velocityY > 0) {
    player.velocityY = 0;
  }

  if (player.velocityY > 0) {
    for (index = player.velocityY; index > 0; index -= 0.01) {
      const newY = Math.round(player.y + index * delta);
      if (isFreeSpace(player.x, newY)) {
        player.y = newY;
        break;
      }
    }
  } else if (player.velocityY < 0) {
    for (index = player.velocityY; index < 0; index += 0.01) {
      const newY = Math.round(player.y + index * delta);
      if (isFreeSpace(player.x, newY)) {
        player.y = newY;
        break;
      }
    }
  }
};

const render = () => {
  // Setup rendering and scaling
  const dpr = devicePixelRatio || 1;
  const deviceWidth = (_.width = innerWidth * dpr);
  const deviceHeight = (_.height = innerHeight * dpr);
  const scale = Math.min(
    deviceWidth / NATIVE_WIDTH,
    deviceHeight / NATIVE_HEIGHT
  );
  context.sn(
    scale,
    0,
    0,
    scale,
    (deviceWidth - NATIVE_WIDTH * scale) / 2,
    (deviceHeight - NATIVE_HEIGHT * scale) / 2
  );
  context.imageSmoothingEnabled = true;
  context.globalCompositeOperation = "lighter";

  // Border around the playable game area
  context.strokeStyle = "white";
  context.sR(-1, -1, NATIVE_WIDTH + 2, NATIVE_HEIGHT + 2);

  switch (screen) {
    case ScreenType.MAIN_MENU:
      renderText(context, "EYES NOT FOUND", 68, 220, 80);
      renderText(
        context,
        !hideText ? "PRESS SPACE TO START" : "",
        320,
        350,
        24
      );
      renderText(context, "CREATED BY RUUD SCHROEN", 30, 724, 14);
      renderText(context, "JS13K 2020", 884, 724, 14);
      break;

    case ScreenType.LEVEL:
      context.fillStyle = "lightblue";
      context.fc(player.x, player.y, player.width, player.height);

      context.fillStyle = "white";
      for (const wall of walls) {
        context.fc(wall.x, wall.y, 16, 16);
      }
  }
};

//-------------------------------------------------------------------------
// UTILITIES
//-------------------------------------------------------------------------

export const createEntity = (
  x,
  y,
  width,
  height,
  velocityX = 0,
  velocityY = 0
): Entity => ({
  x: x,
  y: y,
  width: width,
  height: height,
  velocityX,
  velocityY,
});

const loadMap = (map) => {
  walls = [];
  currentMap = map;
  currentMap.forEach((row, y) => {
    row.forEach((tile, x) => {
      if (tile == "1") {
        walls.push(
          createEntity(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE)
        );
      }
    });
  });
};

export const getTimestamp = (): number => {
  return performance.now();
};

const collision = (r1: Entity, r2: Entity) => {
  if (
    r1.x + r1.width > r2.x &&
    r1.x < r2.x + r2.width &&
    r2.y + r2.height > r1.y &&
    r2.y < r1.y + r1.height
  ) {
    return true;
  }
  return false;
};

export const isFreeSpace = (newX: number, newY: number): boolean => {
  const temp = createEntity(newX, newY, player.width, player.height);
  for (let i = 0; i < walls.length; i++) {
    if (collision(temp, walls[i])) return false;
  }
  return true;
};

//-------------------------------------------------------------------------
// INITIALIZATION
//-------------------------------------------------------------------------

const context = _.getContext("2d") as Tiny2dContext;
const keys: Keys = {};
const player = createEntity(300, 300, 16, 16);

let currentMap;
let currentTime: number;
let hideText = false; // Flag for flashing text
let lastDirection: Direction = 0;
let moveSpeed = 0;
let screen: ScreenType = ScreenType.MAIN_MENU;
let timer64 = 0; // Get incremented every frame
let walls: Entity[] = [];

// Shortens context function names. Example: clearRect becomes ce
for (const func in context)
  context[func[0] + (func[6] || func[2])] = context[func];

/**
 * Taken from https://xem.github.io/articles/jsgamesinputs.html
 * Maps both WASD and ZQSD to Up, Down, Left and Right
 */
onkeydown = onkeyup = (event) =>
  (keys["lurdlRdTl*urEu*_e**s"[(event.which + 3) % 20]] = Number(
    event.type[3] < "u"
  ));

currentTime = getTimestamp();
requestAnimationFrame(gameLoop);
