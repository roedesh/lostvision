import { TILE_SIZE } from "./constants";
import createEntity from "./entity";
import { Map2D, Entity, Level } from "./types";

const emptyRow = `1${"0".repeat(62)}1`;

export const levelOne = {
  startPosition: { x: 100, y: 200 },
  tiles: [
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
    emptyRow,
    "1111111111100001111111111111111111111111111111111000011111111111",
    emptyRow,
    emptyRow,
    emptyRow,
    emptyRow,
    emptyRow,
    emptyRow,
    "1000000000000000000000000000000000000000000000000003000000000001",
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
  ],
};

const levels = [levelOne];

const getMap = (levelObject): Map2D => {
  const map2d = [];
  for (const row of levelObject.tiles) {
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

export const getLevel = (level: number): Level => {
  const levelObject = levels[level];
  const map = getMap(levelObject);
  const boxes: Entity[] = [];
  let flag: Entity = null;
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
      if (column == 3) {
        flag = createEntity(
          indexX * TILE_SIZE,
          32 + indexY * TILE_SIZE,
          TILE_SIZE,
          TILE_SIZE
        );
      }
    });
  });
  return {
    map,
    boxes,
    flag,
    startPosition: levelObject.startPosition,
  };
};
