import { Echo, Map2D } from "./types";

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

export default (origin: number[], currentMap: Map2D): Echo => ({
  origin,
  tilesToCheck: [],
  tilesToDraw: [],
  currentMap,
  tmpMap: createMap(),
  firstRun: true,
  tilesChecked: 0,
  opacity: 1,
});

export const performStep = (echo: Echo): void => {
  if (echo.firstRun) {
    checkNeighbours(echo, echo.origin);
    echo.firstRun = false;
  } else if (echo.tilesChecked < 900) {
    const tiles = [...echo.tilesToCheck];
    echo.tilesToCheck = [];
    for (const tile of tiles) {
      checkNeighbours(echo, tile);
    }
  } else if (echo.opacity > 0) {
    echo.opacity -= 0.03;
  }
};

const checkNeighbours = (
  echo: Echo,
  coords: number[],
) => {
  const north = [coords[0] - 1, coords[1]];
  const east = [coords[0], coords[1] + 1];
  const south = [coords[0] + 1, coords[1]];
  const west = [coords[0], coords[1] - 1];

  const neighbours = [north, east, south, west];

  for (const neighbour of neighbours) {
    const tile = getTileType(echo, neighbour);
    switch (tile) {
      case 0:
        echo.tilesToCheck.push(neighbour);
        break;
      case 1:
        echo.tilesToDraw.push(neighbour);
    }
  }

  echo.tilesChecked += 4;
};

const getTileType = (
  echo: Echo,
  coords: number[],
) => {
  try {
    const tile = echo.currentMap[coords[0]][coords[1]];
    const tmpTile = echo.tmpMap[coords[0]][coords[1]];
    if (tmpTile == 2) {
      return -1;
    }
    echo.tmpMap[coords[0]][coords[1]] = 2;
    return tile;
  } catch {
    return -1;
  }
};
