//      ______                _   __      __  ______                      __
//     / ____/_  _____  _____/ | / /___  / /_/ ____/___  __  ______  ____/ /
//    / __/ / / / / _ \/ ___/  |/ / __ \/ __/ /_  / __ \/ / / / __ \/ __  /
//   / /___/ /_/ /  __(__  ) /|  / /_/ / /_/ __/ / /_/ / /_/ / / / / /_/ /
//  /_____/\__, /\___/____/_/ |_/\____/\__/_/    \____/\__,_/_/ /_/\__,_/
//        /____/
//
//  Author: Ruud Schroën

import {
  JUMP_HEIGHT,
  MAX_GRAVITY,
  NATIVE_HEIGHT,
  NATIVE_WIDTH,
  STEP,
  SPEED,
  TILE_SIZE,
} from "./constants";
import { renderText } from "./font";
import { levelOne } from "./maps";
import { Keys, Entity, ScreenType, Tiny2dContext } from "./types";

//-------------------------------------------------------------------------
// GAME LOOP
//-------------------------------------------------------------------------

const gameLoop = () => {
  now = getTimestamp();
  deltaTime += Math.min(1, (now - last) / 1000);

  while (deltaTime > STEP) {
    deltaTime -= STEP;

    // Main game loop
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
        updatePlayer();
      }
    }

    if (timer64 == 64) {
      hideText = !hideText;
      timer64 = 0;
    } else {
      timer64++;
    }
  }

  render();
  last = now;
  requestAnimationFrame(gameLoop);
};

//-------------------------------------------------------------------------
// GAME FUNCTIONS
//-------------------------------------------------------------------------

const updatePlayer = () => {
  const dir = keys.r || 0 - keys.l || 0;
  if (!jumpSpeed && keys._ && !isFreeSpace(player.x, player.y + 1)) {
    gravity = 0;
    jumpSpeed = JUMP_HEIGHT;
  }
  let i: number;

  // Move player horizontally
  for (i = SPEED; i > 0; i--) {
    if (isFreeSpace(player.x + i * dir, player.y)) {
      player.x += i * dir;
      break;
    }
  }

  // Handle jumping and falling
  if (jumpSpeed > 0) {
    for (i = jumpSpeed; i > 0; i--) {
      if (isFreeSpace(player.x, player.y - i)) {
        player.y -= i;
        break;
      }
    }
    jumpSpeed--;
  } else {
    gravity =
      gravity != MAX_GRAVITY && isFreeSpace(player.x, player.y + 1)
        ? gravity + 1
        : 0;

    for (i = gravity; i > 0; i--) {
      if (isFreeSpace(player.x, player.y + i)) {
        player.y += i;
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

export const createEntity = (x, y, width, height): Entity => ({
  x: x,
  y: y,
  width: width,
  height: height,
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
let deltaTime = 0;
let hideText = false; // Flag for flashing text
let gravity = 0;
let jumpSpeed = 0;
let now,
  last = getTimestamp();
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

gameLoop();
