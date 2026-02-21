// Grid positions and their properties
// Layout:
// Row 1: [1][1]=RB    [1][2]=WR
// Row 2: [2][1]=FLX   [2][2]=QB   [2][3]=QB   [2][4]=FLX
// Row 3: [3][1]=WR    [3][2]=TE   [3][3]=RB

export const POSITIONS = [
  { id: 0, row: 1, col: 1, type: 'RB',  label: 'RB',  accepts: ['RB'] },
  { id: 1, row: 1, col: 2, type: 'WR',  label: 'WR',  accepts: ['WR'] },
  { id: 2, row: 2, col: 1, type: 'FLX', label: 'FLX', accepts: ['WR', 'RB', 'TE'] },
  { id: 3, row: 2, col: 2, type: 'QB',  label: 'QB',  accepts: ['QB'] },
  { id: 4, row: 2, col: 3, type: 'QB',  label: 'QB',  accepts: ['QB'] },
  { id: 5, row: 2, col: 4, type: 'FLX', label: 'FLX', accepts: ['WR', 'RB', 'TE'] },
  { id: 6, row: 3, col: 1, type: 'WR',  label: 'WR',  accepts: ['WR'] },
  { id: 7, row: 3, col: 2, type: 'TE',  label: 'TE',  accepts: ['TE'] },
  { id: 8, row: 3, col: 3, type: 'RB',  label: 'RB',  accepts: ['RB'] },
];

// Adjacency: each entry is [posA_id, posB_id]
export const ADJACENCIES = [
  [0, 1], // [1][1] - [1][2]
  [0, 2], // [1][1] - [2][1]
  [0, 3], // [1][1] - [2][2]
  [1, 4], // [1][2] - [2][3]
  [1, 5], // [1][2] - [2][4]
  [2, 3], // [2][1] - [2][2]
  [2, 6], // [2][1] - [3][1]
  [3, 6], // [2][2] - [3][1]
  [3, 7], // [2][2] - [3][2]
  [4, 5], // [2][3] - [2][4]
  [4, 7], // [2][3] - [3][2]
  [4, 8], // [2][3] - [3][3]
  [5, 8], // [2][4] - [3][3]
  [6, 7], // [3][1] - [3][2]
  [7, 8], // [3][2] - [3][3]
];

// Get neighbors for a position
export function getNeighbors(posId) {
  const neighbors = [];
  for (const [a, b] of ADJACENCIES) {
    if (a === posId) neighbors.push(b);
    if (b === posId) neighbors.push(a);
  }
  return neighbors;
}

// Board state management
export function createBoard() {
  return {
    slots: new Array(9).fill(null), // player in each slot (or null)
  };
}

export function canPlace(posId, player) {
  const pos = POSITIONS[posId];
  return pos.accepts.includes(player.pos);
}

// Get all valid slots for a player on the current board
export function getValidSlots(board, player) {
  const valid = [];
  for (let i = 0; i < 9; i++) {
    if (board.slots[i] === null && canPlace(i, player)) {
      valid.push(i);
    }
  }
  return valid;
}

// Get all possible positions that accept a given position type
export function getSlotsForPosition(posType) {
  return POSITIONS
    .filter(p => p.accepts.includes(posType))
    .map(p => p.id);
}

// Clone a board
export function cloneBoard(board) {
  return { slots: [...board.slots] };
}

// Place a player on the board
export function placePlayer(board, slotId, player) {
  const newBoard = cloneBoard(board);
  newBoard.slots[slotId] = player;
  return newBoard;
}

// Swap two players on the board
export function swapPlayers(board, slotA, slotB) {
  const newBoard = cloneBoard(board);
  const temp = newBoard.slots[slotA];
  newBoard.slots[slotA] = newBoard.slots[slotB];
  newBoard.slots[slotB] = temp;
  return newBoard;
}

// Check if a board arrangement is valid (all players in valid positions)
export function isValidArrangement(board) {
  for (let i = 0; i < 9; i++) {
    const player = board.slots[i];
    if (player && !canPlace(i, player)) return false;
  }
  return true;
}

// Get all empty slot ids
export function getEmptySlots(board) {
  return board.slots
    .map((p, i) => p === null ? i : -1)
    .filter(i => i >= 0);
}

// Get all occupied slot ids
export function getOccupiedSlots(board) {
  return board.slots
    .map((p, i) => p !== null ? i : -1)
    .filter(i => i >= 0);
}
