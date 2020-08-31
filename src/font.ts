// Taken from https://github.com/darkwebdev/tinyfont.js
// Removed some unneeded code to save space
import { Tiny2dContext } from "./types";

// eslint-disable-next-line no-sparse-arrays
export const chars = [
  ...Array(33),

  29, // ! 11101 // " // # // $ // % // &
  ,
  ,
  ,
  ,
  ,
  12, // ' 01100 // ( // ) // *
  ,
  ,
  ,
  "ᇄ", // 4548    + 00100 01110 00100
  3, // 3       , 00011
  "ႄ", // 4228    - 00100 00100 00100
  1, // 1       . 00001
  1118480, // 1118480 / 00001 00010 00100 01000 10000
  "縿", // 32319   0 11111 10001 11111
  31, // 31      1 11111
  "庽", // 24253   2 10111 10101 11101
  "嚿", // 22207   3 10101 10101 11111
  "炟", // 28831   4 11100 00100 11111
  "皷", // 30391   5 11101 10101 10111
  "纷", // 32439   6 11111 10101 10111
  "䈟", // 16927   7 10000 10000 11111
  "线", // 32447   8 11111 10101 11111
  "皿", // 30399   9 11101 10101 11111
  17, // 17      : 10001 // ; // <
  ,
  ,
  "⥊", // = 01010 01010 01010 // >
  ,
  "䊼", // ? 10000 10101 11100 // @
  ,
  "㹏", // 15951  A 01111 10010 01111
  "纮", // 32430  B 11111 10101 01110
  "縱", // 32305   C 11111 10001 10001
  "縮", // 32302   D 11111 10001 01110
  "纵", // 32437   E 11111 10101 10101
  "纐", // 32400   F 11111 10100 10000
  "񴚦", // 476838  G 01110 10001 10101 00110
  "粟", // 31903   H 11111 00100 11111
  "䟱", // 18417   I 10001 11111 10001
  "丿", // 20031   J 10011 10001 11111
  1020241, // 1020241 K 11111 00100 01010 10001
  "簡", // 31777   L 11111 00001 00001
  33059359, // 33059359 M 11111 10000 11100 10000 11111
  1024159, // 1024159 N 11111 01000 00100 11111
  "縿", // 32319   O 11111 10001 11111
  "纜", // 32412   P 11111 10100 11100
  "񼙯", // 509551  Q 01111 10001 10011 01111
  "繍", // 32333   R 11111 10010 01101
  "皷", // 30391   S 11101 10101 10111
  "䏰", // 17392   T 10000 11111 10000
  "簿", // 31807   U 11111 00001 11111
  25363672, // 25363672 V 11000 00110 00001 00110 11000
  32541759, // 32541759 W 11111 00001 00011 00001 11111
  18157905, // 18157905 X 10001 01010 00100 01010 10001
  "惸", // 24824   Y 11000 00111 11000
  18470705, // 18470705 Z 10001 10011 10101 11001 10001 // [ // \ // ] // ^
  ,
  ,
  ,
  ,
  "С", // 1057 _ 00001 00001 00001
  //, // `
  //// #97:
  //, // a
  //,,,,,,,,,,,,,,,,,,,,,,,,,
  //// #123:
  //, // {
  //, // |
  //, // }
  //, // ~
];

export const renderText = (
  ctx: Tiny2dContext,
  string: string,
  x: number,
  y: number,
  size: number,
  color = "lightgray"
): void => {
  const bin2arr = (bin, width) => bin.match(RegExp(`.{${width}}`, "g"));
  const isNumber = (code) => code > 0;

  const renderChar = (charX, char) => {
    const pixelSize = size / 5;
    const fontCode = chars[char.charCodeAt()] || "";
    const binaryChar = isNumber(fontCode) ? fontCode : fontCode.codePointAt();

    const binary = (binaryChar || 0).toString(2);

    const width = Math.ceil(binary.length / 5);
    const marginX = charX + pixelSize;
    const formattedBinary = binary.padStart(width * 5, 0);
    const binaryCols = bin2arr(formattedBinary, 5);

    binaryCols.map((column, colPos) =>
      [...column].map((pixel, pixPos) => {
        ctx.fillStyle = !+pixel ? "transparent" : color; // pixel == 0 ?
        ctx.fc(
          x + marginX + colPos * pixelSize,
          y + pixPos * pixelSize,
          pixelSize,
          pixelSize
        );
      })
    );

    return charX + (width + 1) * pixelSize;
  };

  const oldComposition = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  [...string].reduce(renderChar, 0);
  ctx.globalCompositeOperation = oldComposition;
};
