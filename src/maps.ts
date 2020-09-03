import { TILE_SIZE } from "./constants";
import createEntity from "./entity";
import { Map2D, Entity } from "./types";

const emptyRow = `1${"0".repeat(62)}1`;

export const levelOne = [
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  "1000000000000000000000000000000000000000000000000000000000000001",
  "1111111111100001111111111111111111111111111111111000011111111111",
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  "1000000000000000000000000000000000000000000000000111100000000001",
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
  emptyRow,
];

const levels = [levelOne];

export const getMap = (level: number): Map2D => {
  const levelArray = levels[level];
  const map2d = [];
  for (const row of levelArray) {
    map2d.push(row.split("").map((numberString) => Number(numberString)));
  }
  return map2d;
};

export const getBoxes = (map: Map2D): Entity[] => {
  const boxes = [];
  map.forEach((row, indexY) => {
    row.forEach((column, indexX) => {
      if (column == 1) {
        boxes.push(
          createEntity(
            indexX * TILE_SIZE,
            32 + indexY * TILE_SIZE,
            TILE_SIZE,
            TILE_SIZE
          )
        );
      }
    });
  });
  return boxes;
};
