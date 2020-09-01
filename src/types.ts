export type Collision = {
  bottom: boolean;
  left: boolean;
  right: boolean;
  top: boolean;
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
};

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

export type Map2D = number[][];

export const enum ScreenType {
  MAIN_MENU,
  GAME_LEVEL,
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
}
