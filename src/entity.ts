import { Entity } from "./types";

export default (
  x: number,
  y: number,
  width: number,
  height: number,
): Entity => ({
  x,
  y,
  oldX: x,
  oldY: y,
  renderX: x,
  renderY: y,
  velocityX: 0,
  velocityY: 0,
  width,
  height,
});
