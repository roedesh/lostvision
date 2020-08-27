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

export type Entity = {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const enum ScreenType {
  MAIN_MENU,
  LEVEL,
}

export const enum SolidType {
  INTANGIBLE,
  SOLID,
  SLOPE,
}

export const enum TileType {
  VOID,
  WALL,
  SLOPE_45_LEFT,
  SLOPE_45_RIGHT,
  SLOPE_MINUS_45_LEFT,
  SLOPE_MINUS_45_RIGHT,
}

export type Tiles = {
  [key: string]: Tile;
};

export type Tile = {
  type: TileType;
  solidType: SolidType;
  calculateSolidity?: (x: number, y: number) => boolean;
};

export interface Tiny2dContext extends CanvasRenderingContext2D {
  /**
   * Alias to fillRect
   */
  fc(x: number, y: number, w: number, h: number): void;

  /**
   * Alias to setTransform
   */
  sn(a: number, b: number, c: number, d: number, e: number, f: number): void;

  /**
   * Alias to strokeRect
   */
  sR(x: number, y: number, w: number, h: number): void;
}
