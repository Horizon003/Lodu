export const PLAYERS = [
  { key: 'red', name: 'Red', theme: 'player-red', colorVar: '--red', startIndex: 0 },
  { key: 'green', name: 'Green', theme: 'player-green', colorVar: '--green', startIndex: 13 },
  { key: 'yellow', name: 'Yellow', theme: 'player-yellow', colorVar: '--yellow', startIndex: 26 },
  { key: 'blue', name: 'Blue', theme: 'player-blue', colorVar: '--blue', startIndex: 39 },
];

export const TRACK = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0],
];

export const HOME_PATHS = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

export const BASES = {
  red: { area: { rowStart: 1, rowEnd: 6, colStart: 1, colEnd: 6 }, slots: [[2, 2], [2, 4], [4, 2], [4, 4]] },
  green: { area: { rowStart: 1, rowEnd: 6, colStart: 10, colEnd: 15 }, slots: [[2, 10], [2, 12], [4, 10], [4, 12]] },
  yellow: { area: { rowStart: 10, rowEnd: 15, colStart: 10, colEnd: 15 }, slots: [[10, 10], [10, 12], [12, 10], [12, 12]] },
  blue: { area: { rowStart: 10, rowEnd: 15, colStart: 1, colEnd: 6 }, slots: [[10, 2], [10, 4], [12, 2], [12, 4]] },
};

export const SAFE_INDICES = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
export const CENTER_CELLS = new Set(['6,6', '6,7', '6,8', '7,6', '7,7', '7,8', '8,6', '8,7', '8,8']);
export const TRACK_LOOKUP = new Map(TRACK.map((coords, index) => [coords.join(','), index]));
