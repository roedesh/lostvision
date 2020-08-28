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
  renderX: number;
  renderY: number;
  oldX: number;
  oldY: number;
  velocityX?: number;
  velocityY?: number;
  width: number;
  height: number;
};

export const enum Direction {
  LEFT = -1,
  NONE = 0,
  RIGHT = 1,
}

export const enum ScreenType {
  MAIN_MENU,
  LEVEL,
}

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
