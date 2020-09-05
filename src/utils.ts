import { TILE_SIZE } from "./constants";
import { Collision, Entity } from "./types";

export const collision = (e1: Entity, e2: Entity): Collision => {
  if (
    e1.x + e1.width >= e2.x &&
    e1.x <= e2.x + e2.width &&
    e1.y + e1.height >= e2.y &&
    e1.y <= e2.y + e2.height
  ) {
    const topDiff = e2.y + e2.height - e1.y;
    const bottomDiff = e1.y + e1.height - e2.y;
    const leftDiff = e2.x + e2.width - e1.x;
    const rightDiff = e1.x + e1.width - e2.x;

    const min = Math.min(bottomDiff, topDiff, leftDiff, rightDiff);

    return {
      bottom: bottomDiff == min,
      right: rightDiff == min,
      left: leftDiff == min,
      top: topDiff == min,
    };
  }
  return null;
};

export const pixelToTileCoordinates = (x: number, y: number): number[] => {
  return [Math.round(x / TILE_SIZE), Math.round(y / TILE_SIZE)];
};
