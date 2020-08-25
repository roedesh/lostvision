//      ______                _   __      __  ______                      __
//     / ____/_  _____  _____/ | / /___  / /_/ ____/___  __  ______  ____/ /
//    / __/ / / / / _ \/ ___/  |/ / __ \/ __/ /_  / __ \/ / / / __ \/ __  /
//   / /___/ /_/ /  __(__  ) /|  / /_/ / /_/ __/ / /_/ / /_/ / / / / /_/ /
//  /_____/\__, /\___/____/_/ |_/\____/\__/_/    \____/\__,_/_/ /_/\__,_/
//        /____/
//
//  Author: Ruud Schroën

import { NATIVE_HEIGHT, NATIVE_WIDTH } from "./constants";
import { renderText } from "./font";
import { Keys, ScreenType, Tiny2dContext } from "./types";

declare var _: HTMLCanvasElement;

const context = _.getContext("2d") as Tiny2dContext;
const keys: Keys = {};

let hideText = 0; // Flag for flashing text
let timer64 = 0; // Get incremented every frame
let screen: ScreenType = ScreenType.MAIN_MENU;

// Shortens context function names. Example: clearRect becomes ce
for (let prop in context)
  context[prop[0] + (prop[6] || prop[2])] = context[prop];

/**
 * Taken from https://xem.github.io/articles/jsgamesinputs.html
 * Maps both WASD and ZQSD to Up, Down, Left and Right
 */
onkeydown = onkeyup = (event) =>
  (keys["lurdlRdTl*urEu*_e**s"[(event.which + 3) % 20]] = event.type[3] < "u");

const gameLoop = () => {
  // Setup rendering and scaling
  let dpr = window.devicePixelRatio || 1;
  let deviceWidth = (_.width = innerWidth * dpr);
  let deviceHeight = (_.height = innerHeight * dpr);

  let scale = Math.min(
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
  context.imageSmoothingEnabled = !1;
  context.globalCompositeOperation = "lighter";

  // Main game loop
  switch (screen) {
    /**
     * Main Menu
     */
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
  }

  if (timer64 == 64) {
    hideText ^= 1;
    timer64 = 0;
  } else {
    timer64++;
  }

  requestAnimationFrame(gameLoop);
};

requestAnimationFrame(gameLoop);
