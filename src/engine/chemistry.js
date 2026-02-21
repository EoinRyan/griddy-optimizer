import { ADJACENCIES, getNeighbors } from './grid.js';

// Connection color between two players
// Green: same team OR (same division AND same draft year)
// Yellow: same division OR same draft year
// Red: default (no match)
export function getConnectionColor(playerA, playerB) {
    if (!playerA || !playerB) return 'red';

    const sameTeam = playerA.team === playerB.team;
    const sameDiv = playerA.div === playerB.div;
    const sameYear = playerA.draftYear === playerB.draftYear;

    if (sameTeam || (sameDiv && sameYear)) return 'green';
    if (sameDiv || sameYear) return 'yellow';
    return 'red';
}

// Connection point value
export function connectionPoints(color) {
    if (color === 'green') return 2;
    if (color === 'yellow') return 1;
    return 0;
}

// Calculate dot color for a player at a given position on the board
// Green dot: 4+ yellow connections OR 2+ green connections OR (2+ yellow AND 1+ green)
// Yellow dot: 2+ yellow connections OR 1+ green connection
// Red dot: default
export function getDotColor(board, slotId) {
    const player = board.slots[slotId];
    if (!player) return 'red';

    const neighbors = getNeighbors(slotId);
    let greenCount = 0;
    let yellowCount = 0;

    for (const neighborId of neighbors) {
        const neighbor = board.slots[neighborId];
        if (!neighbor) continue;
        const color = getConnectionColor(player, neighbor);
        if (color === 'green') greenCount++;
        if (color === 'yellow') yellowCount++;
    }

    // Green dot conditions
    if (yellowCount >= 4 || greenCount >= 2 || (yellowCount >= 2 && greenCount >= 1)) {
        return 'green';
    }
    // Yellow dot conditions
    if (yellowCount >= 2 || greenCount >= 1) {
        return 'yellow';
    }
    return 'red';
}

// Dot point value
export function dotPoints(color) {
    if (color === 'green') return 11;
    if (color === 'yellow') return 6;
    return 0;
}

// Calculate total chemistry score for a board
export function calculateChemistry(board) {
    let connectionScore = 0;
    let dotScore = 0;

    // Connection scores (each adjacency pair counted once)
    for (const [a, b] of ADJACENCIES) {
        const playerA = board.slots[a];
        const playerB = board.slots[b];
        if (playerA && playerB) {
            const color = getConnectionColor(playerA, playerB);
            connectionScore += connectionPoints(color);
        }
    }

    // Dot scores
    for (let i = 0; i < 9; i++) {
        if (board.slots[i]) {
            const dot = getDotColor(board, i);
            dotScore += dotPoints(dot);
        }
    }

    return { connectionScore, dotScore, total: connectionScore + dotScore };
}

// Get all connection details for rendering
export function getConnectionDetails(board) {
    return ADJACENCIES.map(([a, b]) => {
        const playerA = board.slots[a];
        const playerB = board.slots[b];
        const color = (playerA && playerB) ? getConnectionColor(playerA, playerB) : 'none';
        return { a, b, color };
    });
}

// Get dot details for each position
export function getDotDetails(board) {
    return board.slots.map((player, i) => {
        if (!player) return { slotId: i, color: 'none' };
        return { slotId: i, color: getDotColor(board, i) };
    });
}
