import { Echo, Map2D, Tile, TileType } from "./types";

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

export default (origin: number[], currentMap: Map2D): Echo => ({
  origin,
  tilesToCheck: [],
  tilesToDraw: [],
  currentMap,
  tmpMap: createMap(),
  firstRun: true,
  tilesChecked: 0,
  opacity: 1.0,
  runs: 0,
});

export const performStep = (echo: Echo): void => {
  if (echo.firstRun) {
    checkNeighbours(echo, echo.origin);
    echo.firstRun = false;
  } else if (echo.runs < 8) {
    const tiles = [...echo.tilesToCheck];
    echo.tilesToCheck = [];
    for (const tile of tiles) {
      checkNeighbours(echo, tile);
    }
    echo.runs++;
  } else if (echo.opacity > 0) {
    echo.opacity -= 0.025;
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
    else if (tile == TileType.AIR) echo.tilesToCheck.push(neighbour);

    echo.tilesToDraw.push(createTile(tile, neighbour));
  }
};

const getTileType = (echo: Echo, [y, x]: number[]) => {
  try {
    const tile = echo.currentMap[y][x];
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
