// ___       ________  ________  _________        ___      ___ ___  ________  ___  ________  ________
// |\  \     |\   __  \|\   ____\|\___   ___\     |\  \    /  /|\  \|\   ____\|\  \|\   __  \|\   ___  \
// \ \  \    \ \  \|\  \ \  \___|\|___ \  \_|     \ \  \  /  / | \  \ \  \___|\ \  \ \  \|\  \ \  \\ \  \
//  \ \  \    \ \  \\\  \ \_____  \   \ \  \       \ \  \/  / / \ \  \ \_____  \ \  \ \  \\\  \ \  \\ \  \
//   \ \  \____\ \  \\\  \|____|\  \   \ \  \       \ \    / /   \ \  \|____|\  \ \  \ \  \\\  \ \  \\ \  \
//    \ \_______\ \_______\____\_\  \   \ \__\       \ \__/ /     \ \__\____\_\  \ \__\ \_______\ \__\\ \__\
//     \|_______|\|_______|\_________\   \|__|        \|__|/       \|__|\_________\|__|\|_______|\|__| \|__|
//                        \|_________|                                 \|_________|
//
//  Author: Ruud Schroën

import {
  ACCELERATION,
  GRAVITY,
  GREEN,
  JUMP_VELOCITY,
  MAX_SPEED,
  NATIVE_HEIGHT,
  NATIVE_WIDTH,
  PLAYER_WEIGHT,
  STORAGE_KEY,
  WHITE,
} from "./constants";
import createEcho, { performStep } from "./echo";
import createEntity from "./entity";
import { renderText } from "./font";
import { getLevel } from "./maps";
import {
  Echo,
  GameMode,
  Keys,
  Level,
  ScreenType,
  TileType,
  Tiny2dContext,
  LevelScore,
} from "./types";
import { collision, pixelToTileCoordinates } from "./utils";

import coinPng from "../assets/coin.png";
import flagPng from "../assets/flag.png";

//-------------------------------------------------------------------------
// MAIN LOOP
//-------------------------------------------------------------------------

const gameLoop = (currentTime: number): void => {
  window.requestAnimationFrame(gameLoop);

  if (process.env.NODE_ENV === "development") statsMonitor?.begin();

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

  if (process.env.NODE_ENV === "development") statsMonitor?.end();
};

//-------------------------------------------------------------------------
// UPDATE LOOP
//-------------------------------------------------------------------------

const update = () => {
  ++counter;

  switch (screen) {
    case ScreenType.MAIN_MENU:
      checkMenuSelector(1);
      if (!previousKeys.e && keys.e) {
        if (menuSelector) {
          screen = ScreenType.HOW_TO_PLAY;
        } else {
          screen = ScreenType.GAME_MODE_SELECTION;
          // levelObject = getLevel(level);
          // player.x = levelObject.startPosition.x;
          // player.y = levelObject.startPosition.y;
        }
        menuSelector = 0;
      }
      break;
    case ScreenType.GAME_MODE_SELECTION:
      checkMenuSelector(1);
      if (!previousKeys.e && keys.e) {
        gameMode = menuSelector;
        levelObject = getLevel(level);
        player.x = levelObject.startPosition.x;
        player.y = levelObject.startPosition.y;
        screen = ScreenType.GAME_LEVEL;
      }
      break;
    case ScreenType.HOW_TO_PLAY:
      if (!previousKeys.e && keys.e) {
        menuSelector = 0;
        screen = ScreenType.MAIN_MENU;
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
          if (echo.opacity <= 0) echo = null;
        }
      }
  }

  previousKeys = { ...keys };
};

const checkMenuSelector = (max: number) => {
  if (!previousKeys.u && keys.u) menuSelector--;
  if (!previousKeys.d && keys.d) menuSelector++;
  if (menuSelector > max) menuSelector = 0;
  if (menuSelector < 0) menuSelector = 1;
};

const updatePlayer = () => {
  player.oldX = player.x;
  player.oldY = player.y;

  // Update position
  player.x += player.velocityX;
  player.y += player.velocityY;

  if (player.y > NATIVE_HEIGHT) {
    player.velocityX = player.velocityY = 0;
    player.x = levelObject.startPosition.x;
    player.y = levelObject.startPosition.y;
    if (gameMode == GameMode.MEMORIZER) {
      const [tileX, tileY] = pixelToTileCoordinates(player.x, player.y);
      echo = createEcho(
        [tileY - 2, tileX],
        levelObject,
        gameMode == GameMode.MEMORIZER
      );
    } else {
      echo = null;
    }

    return;
  }

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
  for (const box of levelObject.boxes) {
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

  for (const coin of levelObject.coins) {
    if (!coin.collected && collision(player, coin)) coin.collected = true;
  }

  if (levelObject.flag && collision(player, levelObject.flag)) {
    levelScores.push({
      seconds: elapsedSeconds,
      coinsCollected: levelObject.coins.filter((coin) => coin.collected).length,
    });
    level++;
    saveToStorage();
    elapsedSeconds = 0;
    counter = 0;
    levelObject = getLevel(level);
    player.x = levelObject.startPosition.x;
    player.y = levelObject.startPosition.y;
  }

  if (
    (gameMode == GameMode.EXPLORER && !previousKeys._ && keys._) ||
    (gameMode == GameMode.MEMORIZER && !memorizerEchoUsed)
  ) {
    const [tileX, tileY] = pixelToTileCoordinates(player.x, player.y);
    echo = createEcho(
      [tileY - 2, tileX],
      levelObject,
      gameMode == GameMode.MEMORIZER
    );
  }
  if (!memorizerEchoUsed) memorizerEchoUsed = true;
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

    bufferContext.imageSmoothingEnabled = false;

    // Enable image smoothing for low res screens
    context.imageSmoothingEnabled = scaleToFit < 1;

    bufferContext.scale(dpr, dpr);
  }

  /**
   * We never clear the canvases since we draw a background every frame,
   * which will overwrite the previous content.
   */
  bufferContext.fillStyle = "#121212";
  bufferContext.fc(0, 0, NATIVE_WIDTH, NATIVE_HEIGHT);

  switch (screen) {
    case ScreenType.MAIN_MENU: {
      renderText(bufferContext, "LOST VISION", 130, 180, 80);

      renderMenu(400, 309, menuSelector, ["START GAME", "HOW TO PLAY"]);

      renderText(
        bufferContext,
        "CREATED BY RUUD SCHROEN",
        30,
        NATIVE_HEIGHT - 44,
        14
      );
      renderText(bufferContext, "JS13K 2020", 884, NATIVE_HEIGHT - 44, 14);
      break;
    }
    case ScreenType.GAME_MODE_SELECTION: {
      renderText(bufferContext, "SELECT GAME MODE", 80, 60, 30);
      renderMenu(85, 140, menuSelector, ["EXPLORER", "MEMORIZER"]);
      break;
    }
    case ScreenType.HOW_TO_PLAY:
      renderText(bufferContext, "HOW TO PLAY", 80, 60, 30);
      renderText(
        bufferContext,
        "YOU HAVE LOST YOUR SIGHT, BUT GAINED THE POWER OF ECHOLOCATING.",
        80,
        140,
        16
      );
      renderText(
        bufferContext,
        "WHEN YOU START, YOU WILL NOT BE ABLE TO SEE THE PATH YOU NEED TO TAKE.",
        80,
        190,
        16
      );
      renderText(bufferContext, "BY PRESSING", 80, 220, 16);
      renderText(bufferContext, "SPACE", 226, 220, 16, GREEN);
      renderText(
        bufferContext,
        "YOU CAN TEMPORARILY REVEAL THE SPACE AROUND YOU.",
        296,
        220,
        16
      );

      renderText(
        bufferContext,
        "WHEN YOU KNOW WHERE TO GO, USE THE",
        80,
        270,
        16
      );
      renderText(
        bufferContext,
        "WASD, ZQSD OR ARROW KEYS",
        502,
        270,
        16,
        GREEN
      );
      renderText(bufferContext, "TO MOVE", 808, 270, 16);
      renderText(
        bufferContext,
        "AND JUMP AROUND. YOU NEED TO REACH THE",
        80,
        300,
        16
      );
      bufferContext.da(flagImage, 540, 300);
      renderText(bufferContext, "TO ADVANCE TO THE NEXT LEVEL.", 562, 300, 16);

      renderText(
        bufferContext,
        "THERE ARE ALSO HIDDEN COINS TO BE FOUND, WHICH YOU CAN REVEAL",
        80,
        350,
        16
      );
      renderText(bufferContext, "WITH YOUR ECHO.", 80, 380, 16);

      renderText(
        bufferContext,
        "PRESS ENTER TO RETURN TO THE MAIN MENU",
        80,
        430,
        16,
        GREEN
      );
      break;
    case ScreenType.GAME_LEVEL: {
      if (echo) {
        bufferContext.fillStyle = `rgba(225,225,225,${echo.opacity})`;
        bufferContext.ba();
        for (const tile of echo.tilesToDraw) {
          if (tile.type == 1) {
            bufferContext.rc(
              tile.coords[1] * 16,
              32 + tile.coords[0] * 16,
              16,
              16
            );
          }
        }
        bufferContext.fill();

        bufferContext.fillStyle = `rgba(31,31,31,${echo.opacity})`;
        bufferContext.ba();
        for (const tile of echo.tilesToDraw) {
          if (
            [TileType.AIR, TileType.FLAG, TileType.COIN].includes(tile.type)
          ) {
            bufferContext.rc(
              tile.coords[1] * 16,
              32 + tile.coords[0] * 16,
              16,
              16
            );
          }
        }
        bufferContext.fill();
      }

      const timeString = new Date(elapsedSeconds * 1000)
        .toISOString()
        .substr(11, 8);
      renderText(bufferContext, `TIME: ${timeString}`, 8, 8, 14);

      renderText(bufferContext, `LEVEL: ${level + 1}`, 200, 8, 14);

      renderText(
        bufferContext,
        `COINS: ${levelObject.coins.filter((coin) => coin.collected).length}/${
          levelObject.coins.length
        }}`,
        350,
        8,
        14
      );

      levelObject.flag &&
        bufferContext.da(flagImage, levelObject.flag.x, levelObject.flag.y);

      for (const coin of levelObject.coins) {
        if (!coin.hidden && !coin.collected)
          bufferContext.da(coinImage, coin.x, coin.y);
      }

      bufferContext.fillStyle = bufferContext.strokeStyle = WHITE;
      bufferContext.ba();
      bufferContext.mv(0, 32);
      bufferContext.ln(NATIVE_WIDTH, 32);
      bufferContext.rc(player.x, player.y, player.width, player.height);
      bufferContext.sr();
      bufferContext.fill();
    }
  }

  context.da(bufferCanvas, 0, 0, NATIVE_WIDTH * dpr, NATIVE_HEIGHT * dpr);
};

const renderMenu = (
  x: number,
  y: number,
  selectedIndex: number,
  menuEntries: string[]
) => {
  bufferContext.fillStyle = bufferContext.strokeStyle = WHITE;
  menuEntries.forEach((entry, idx) => {
    bufferContext.sR(x, y + idx * 45, 20, 20);
    if (idx == selectedIndex) {
      bufferContext.fc(x + 3, y + idx * 45 + 3, 14, 14);
    }
    renderText(bufferContext, entry, x + 30, y + idx * 45 + 1, 18);
  });
};

const interpolate = (lagOffset: number) => {
  player.renderX = (player.x - player.oldX) * lagOffset + player.oldX;
  player.renderY = (player.y - player.oldY) * lagOffset + player.oldY;
};

//-------------------------------------------------------------------------
// INITIALIZATION
//-------------------------------------------------------------------------

const saveToStorage = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      currentLevel: level,
      levelScores,
    })
  );
};

const loadFromStorage = () => {
  const gameStateString = localStorage.getItem(STORAGE_KEY);
  if (gameStateString) {
    try {
      const gameState = JSON.parse(gameStateString);
      levelScores = gameState.levelScores;
      level = gameState.currentLevel;
    } catch {
      return;
    }
  }
};

const bufferCanvas = document.createElement("canvas");
const bufferContext = bufferCanvas.getContext("2d", {
  alpha: false,
}) as Tiny2dContext;
const context = _.getContext("2d", { alpha: false }) as Tiny2dContext;
const dt = 0.01;
const keys: Keys = {};
const player = createEntity(100, 100, 16, 16);

// Assets
const coinImage = new Image();
coinImage.src = coinPng;
const flagImage = new Image();
flagImage.src = flagPng;

let accumulator = 0;
let counter = 0;
let echo: Echo;
let elapsedSeconds = 0;
let dpr = 0;
let innerW,
  innerH = 0;
let gameMode: GameMode;
let level = 0;
let levelObject: Level = null;
let levelScores: LevelScore[] = [];
let memorizerEchoUsed = false;
let menuSelector = 0;
let previousKeys: Keys = {};
let previousTime = 0;
let screen: ScreenType = ScreenType.MAIN_MENU;
let statsMonitor = null;

/**
 * Shortens context function names (e.g. clearRect becomes ce)
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

loadFromStorage();

if (process.env.NODE_ENV === "development") {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  import("stats.js").then(({ default: Stats }) => {
    statsMonitor = new Stats();
    statsMonitor.dom.style.left = "auto";
    statsMonitor.dom.style.right = "0px";
    document.body.appendChild(statsMonitor.dom);
  });
}

window.requestAnimationFrame(gameLoop);
