export type Keys = {
  E?: boolean; // E
  R?: boolean; // R
  T?: boolean; // T
  _?: boolean; // Space
  s?: boolean; // Shift
  e?: boolean; // Enter
  u?: boolean; // Up
  d?: boolean; // Down
  l?: boolean; // Left
  r?: boolean; // Right
};

export const enum ScreenType {
  MAIN_MENU,
}

export interface Tiny2dContext extends CanvasRenderingContext2D {
  ce(x: number, y: number, w: number, h: number): void;
  fc(x: number, y: number, w: number, h: number): void;
  sn(a: number, b: number, c: number, d: number, e: number, f: number): void;
  fx(text: string, x: number, y: number, maxWidth?: number): void;
  ta(x: number, y: number): void
}
