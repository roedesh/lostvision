import createEntity from "./entity";
import { Echo, Level, Tile, TileType } from "./types";
import { collision } from "./utils";

const createMap = () => {
  const array2d = [];
  for (let i = 0; i < 35; i++) {
    const subArray = [];
    for (let j = 0; j < 65; j++) {
      subArray.push[0];
    }
    array2d.push(subArray);
  }
  return array2d;
};

const createTile = (type: number, coords: number[]): Tile => ({
  type,
  coords,
});

export default (origin: number[], level: Level, noLimit?: boolean): Echo => ({
  origin,
  tilesToCheck: [],
  tilesToDraw: [],
  level,
  tmpMap: createMap(),
  firstRun: true,
  opacity: 1.0,
  runs: 0,
  noLimit,
});

export const performStep = (echo: Echo): void => {
  if (echo.firstRun) {
    checkNeighbours(echo, echo.origin);
    echo.firstRun = false;
  } else if ((echo.noLimit && echo.tilesToCheck.length > 0) || (echo.runs < 8)) {
    const tiles = [...echo.tilesToCheck];
    echo.tilesToCheck = [];
    for (const tile of tiles) {
      checkNeighbours(echo, tile);
    }
    echo.runs++;
  } else if (echo.opacity > 0) {
    echo.opacity -= 0.05;
  }
};

const checkNeighbours = (echo: Echo, [y, x]: number[]) => {
  const north = [y - 1, x];
  const northEast = [y - 1, x + 1];
  const east = [y, x + 1];
  const southEast = [y + 1, x + 1];
  const south = [y + 1, x];
  const southWest = [y + 1, x - 1];
  const west = [y, x - 1];
  const northWest = [y - 1, x - 1];

  const neighbours = [
    north,
    northEast,
    east,
    southEast,
    south,
    southWest,
    west,
    northWest,
  ];

  for (const neighbour of neighbours) {
    const tile = getTileType(echo, neighbour);
    if (tile == -1) continue;
    else if ([TileType.AIR, TileType.COIN, TileType.FLAG].includes(tile))
      echo.tilesToCheck.push(neighbour);

    if (tile == TileType.COIN) {
      const temp = createEntity(
        neighbour[1] * 16,
        neighbour[0] * 16 + 32,
        16,
        16
      );
      for (const coin of echo.level.coins) {
        if (collision(temp, coin)) {
          coin.hidden = false;
        }
      }
    }

    echo.tilesToDraw.push(createTile(tile, neighbour));
  }
};

const getTileType = (echo: Echo, [y, x]: number[]) => {
  try {
    const tile = echo.level.map[y][x];
    const tmpTile = echo.tmpMap[y][x];
    if (tmpTile == 2) {
      return -1;
    }
    echo.tmpMap[y][x] = 2;
    return tile;
  } catch {
    return -1;
  }
};
