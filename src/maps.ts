const emptyColumns = (amount) => new Array(amount);

const emptyRows = (amount) => {
  const arr = [];
  for (let i = 0; i < amount + 1; i++) {
    arr.push([...new Array(64)]);
  }
  return arr;
};

// LEVEL ONE
export const levelOne = [
  ...emptyRows(24),
  [
    ...emptyColumns(16),
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    1,
    0,
    0,
    1,
    1,
    1,
    ...emptyColumns(28),
  ],
  ...emptyRows(21),
];
