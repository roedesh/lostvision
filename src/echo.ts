import { Echo } from "./types";

const createMap = () => {
  const array2d = [];
  for (let i = 0; i < 34; i++) {
    const subArray = [];
    for (let i = 0; i < 64; i++) {
      subArray.push[0];
    }
    array2d.push(subArray);
  }
  return array2d;
};

export default (origin: number[], currentMap: number[][]): Echo => ({
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
    checkNeighbours(echo, echo.origin, echo.currentMap, echo.tmpMap);
    echo.firstRun = false;
  } else if (echo.tilesChecked < 1200) {
    const tiles = [...echo.tilesToCheck, ...[]];
    echo.tilesToCheck = [];
    for (const tile of tiles) {
      checkNeighbours(echo, tile, echo.currentMap, echo.tmpMap);
    }
  } else if (echo.opacity > 0) {
    echo.opacity -= 0.025;
  }
};

const checkNeighbours = (
  echo: Echo,
  coords: number[],
  currentMap: number[][],
  tmpMap: number[][]
) => {
  const topNeighbour = [coords[0] - 1, coords[1]];
  const bottomNeighbour = [coords[0] + 1, coords[1]];
  const leftNeighbour = [coords[0], coords[1] - 1];
  const rightNeighbour = [coords[0], coords[1] + 1];

  const topTile = getTileType(topNeighbour, currentMap, tmpMap);
  const bottomTile = getTileType(bottomNeighbour, currentMap, tmpMap);
  const leftTile = getTileType(leftNeighbour, currentMap, tmpMap);
  const rightTile = getTileType(rightNeighbour, currentMap, tmpMap);

  if (topTile == 0) echo.tilesToCheck.push(topNeighbour);
  if (topTile == 1) echo.tilesToDraw.push(topNeighbour);
  if (bottomTile == 0) echo.tilesToCheck.push(bottomNeighbour);
  if (bottomTile == 1) echo.tilesToDraw.push(bottomNeighbour);
  if (leftTile == 0) echo.tilesToCheck.push(leftNeighbour);
  if (leftTile == 1) echo.tilesToDraw.push(leftNeighbour);
  if (rightTile == 0) echo.tilesToCheck.push(rightNeighbour);
  if (rightTile == 1) echo.tilesToDraw.push(rightNeighbour);

  echo.tilesChecked += 4;
};

const getTileType = (
  coords: number[],
  currentMap: number[][],
  tmpMap: number[][]
) => {
  try {
    const tile = currentMap[coords[0]][coords[1]];
    const tmpTile = tmpMap[coords[0]][coords[1]];
    if (tmpTile == 2) {
      return -1;
    }
    tmpMap[coords[0]][coords[1]] = 2;
    return tile;
  } catch {
    return -1;
  }
};
