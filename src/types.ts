export type Collision = {
  bottom: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
};

export type Echo = {
  firstRun: boolean;
  level: Level;
  opacity: number;
  origin: number[];
  runs: number;
  tilesToCheck: number[][];
  tilesToDraw: Tile[];
  tmpMap: number[][];
  noLimit?: boolean;
};

export type Entity = {
  x: number;
  y: number;
  oldX: number;
  oldY: number;
  renderX: number;
  renderY: number;
  velocityX: number;
  velocityY: number;
  width: number;
  height: number;
  hidden: boolean;
  collected: boolean;
};

export const enum GameMode {
  EXPLORER,
  MEMORIZER,
}

export type Keys = {
  E?: number; // E
  R?: number; // R
  T?: number; // T
  _?: number; // Space
  s?: number; // Shift
  e?: number; // Enter
  u?: number; // Up
  d?: number; // Down
  l?: number; // Left
  r?: number; // Right
};

export type Level = {
  coins: Entity[];
  boxes: Entity[];
  flag: Entity;
  map: Map2D;
  startPosition: {
    x: number;
    y: number;
  };
};

export type LevelScore = {
  seconds: number;
  coinsCollected: number;
};

export type Map2D = number[][];

export const enum ScreenType {
  MAIN_MENU,
  GAME_MODE_SELECTION,
  HOW_TO_PLAY,
  GAME_LEVEL,
}

export type Tile = {
  type: TileType;
  coords: number[];
};

export const enum TileType {
  AIR,
  GROUND,
  FLAG,
  COIN,
}

export interface Tiny2dContext extends CanvasRenderingContext2D {
  /**
   * Alias to beginPath
   */
  ba(): void;

  /**
   * Alias to drawImage
   */
  da(
    image: CanvasImageSource,
    dx: number,
    dy: number,
    dw: number,
    dh: number
  ): void;

  /**
   * Alias to drawImage
   */
  da(image: CanvasImageSource, dx: number, dy: number): void;

  /**
   * Alias to fillRect
   */
  fc(x: number, y: number, w: number, h: number): void;

  /**
   * Alias to rect
   */
  rc(x: number, y: number, w: number, h: number): void;

  /**
   * Alias to setTransform
   */
  sn(a: number, b: number, c: number, d: number, e: number, f: number): void;

  /**
   * Alias to strokeRect
   */
  sR(x: number, y: number, w: number, h: number): void;

  /**
   * Alias to moveTo
   */
  mv(x: number, y: number): void;

  /**
   * Alias to stroke
   */
  sr(): void;

  /**
   * Alias to lineTo
   */
  ln(x: number, y: number): void;
}
