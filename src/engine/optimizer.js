import { POSITIONS, ADJACENCIES, getNeighbors, createBoard, canPlace, cloneBoard, placePlayer, getEmptySlots, getOccupiedSlots, isValidArrangement } from './grid.js';
import { calculateChemistry, getConnectionColor } from './chemistry.js';
import { TALENT_VALUES, DRAFT_ODDS, expectedTalent, ALL_PLAYERS, getBasePlayerKey, getRelatedPlayerIds } from '../data/players.js';

// Calculate total talent score for a board
export function calculateTalent(board) {
    let total = 0;
    for (const player of board.slots) {
        if (player) total += player.talent;
    }
    return total;
}

// Calculate total score (talent + chemistry)
export function calculateScore(board) {
    const talent = calculateTalent(board);
    const chem = calculateChemistry(board);
    return {
        talent,
        chemistry: chem.total,
        chemConnections: chem.connectionScore,
        chemDots: chem.dotScore,
        total: talent + chem.total,
    };
}

// Generate all valid permutations of players on the board
// This tries all possible rearrangements of existing players + the new player
function generateArrangements(board, newPlayer) {
    const results = [];
    const players = [];
    const emptySlots = [];

    // Collect current players
    for (let i = 0; i < 9; i++) {
        if (board.slots[i]) players.push(board.slots[i]);
        else emptySlots.push(i);
    }

    // Add the new player
    players.push(newPlayer);

    // 1. Direct placement: new player goes directly into an empty slot
    for (const emptySlot of emptySlots) {
        if (!canPlace(emptySlot, newPlayer)) continue;
        const simpleBoard = placePlayer(board, emptySlot, newPlayer);
        results.push({ board: simpleBoard, newSlot: emptySlot });
    }

    // 2. Single swap: new player takes an occupied slot, displaced player goes to empty slot
    // This is INDEPENDENT of whether the new player fits any empty slot
    const occupied = getOccupiedSlots(board);
    for (const occSlot of occupied) {
        if (!canPlace(occSlot, newPlayer)) continue;
        const displacedPlayer = board.slots[occSlot];

        for (const emptySlot of emptySlots) {
            if (!canPlace(emptySlot, displacedPlayer)) continue;

            const swapBoard = cloneBoard(board);
            swapBoard.slots[occSlot] = newPlayer;
            swapBoard.slots[emptySlot] = displacedPlayer;
            results.push({ board: swapBoard, newSlot: occSlot });
        }
    }

    // 3. Chain swap: new player takes slot A, player A moves to slot B, player B goes to empty
    for (const targetSlot of occupied) {
        if (!canPlace(targetSlot, newPlayer)) continue;
        const playerA = board.slots[targetSlot];

        for (const midSlot of occupied) {
            if (midSlot === targetSlot) continue;
            if (!canPlace(midSlot, playerA)) continue;
            const playerB = board.slots[midSlot];

            for (const emptySlot of emptySlots) {
                if (!canPlace(emptySlot, playerB)) continue;

                const chainBoard = cloneBoard(board);
                chainBoard.slots[targetSlot] = newPlayer;
                chainBoard.slots[midSlot] = playerA;
                chainBoard.slots[emptySlot] = playerB;
                if (isValidArrangement(chainBoard)) {
                    results.push({ board: chainBoard, newSlot: targetSlot });
                }
            }
        }
    }

    // 4. Full brute force for smaller boards (catches everything)
    if (players.length <= 6) {
        const bestFull = bruteForceArrange(players);
        if (bestFull) {
            results.push({ board: bestFull.board, newSlot: bestFull.newSlot, full: true });
        }
    }

    return results;
}

// Brute force: try all valid assignments of players to slots
function bruteForceArrange(players) {
    let bestScore = -Infinity;
    let bestBoard = null;

    function solve(playerIdx, currentSlots) {
        if (playerIdx === players.length) {
            const board = { slots: new Array(9).fill(null) };
            for (let i = 0; i < currentSlots.length; i++) {
                if (currentSlots[i] >= 0) {
                    board.slots[currentSlots[i]] = players[i];
                }
            }
            const score = calculateScore(board);
            if (score.total > bestScore) {
                bestScore = score.total;
                bestBoard = { board, newSlot: currentSlots[players.length - 1] };
            }
            return;
        }

        const player = players[playerIdx];
        for (let slot = 0; slot < 9; slot++) {
            if (!canPlace(slot, player)) continue;
            // Check slot not already taken
            let taken = false;
            for (let j = 0; j < playerIdx; j++) {
                if (currentSlots[j] === slot) { taken = true; break; }
            }
            if (taken) continue;

            currentSlots[playerIdx] = slot;
            solve(playerIdx + 1, currentSlots);
        }
    }

    solve(0, new Array(players.length).fill(-1));
    return bestBoard;
}

// Optimize the arrangement of existing players on the board (no new player)
export function optimizeArrangement(board) {
    const players = [];
    for (let i = 0; i < 9; i++) {
        if (board.slots[i]) players.push(board.slots[i]);
    }

    if (players.length === 0) return { board, score: calculateScore(board) };

    let bestScore = -Infinity;
    let bestBoard = board;

    function solve(playerIdx, currentSlots) {
        if (playerIdx === players.length) {
            const newBoard = { slots: new Array(9).fill(null) };
            for (let i = 0; i < currentSlots.length; i++) {
                newBoard.slots[currentSlots[i]] = players[i];
            }
            const score = calculateScore(newBoard);
            if (score.total > bestScore) {
                bestScore = score.total;
                bestBoard = newBoard;
            }
            return;
        }

        const player = players[playerIdx];
        for (let slot = 0; slot < 9; slot++) {
            if (!canPlace(slot, player)) continue;
            let taken = false;
            for (let j = 0; j < playerIdx; j++) {
                if (currentSlots[j] === slot) { taken = true; break; }
            }
            if (taken) continue;

            currentSlots[playerIdx] = slot;
            solve(playerIdx + 1, currentSlots);
        }
    }

    solve(0, new Array(players.length).fill(-1));
    return { board: bestBoard, score: calculateScore(bestBoard) };
}

// Main optimizer: evaluate 3 candidate players and return recommendations
export function evaluateCandidates(board, candidates, currentRound, seenPlayerKeys) {
    const results = [];

    for (const candidate of candidates) {
        // Generate all possible arrangements with this candidate
        const arrangements = generateArrangements(board, candidate);

        let bestArrangement = null;
        let bestEV = -Infinity;

        for (const arr of arrangements) {
            const score = calculateScore(arr.board);

            // Calculate EV bonus: expected talent + chemistry from future picks
            // This creates opportunity cost: filling a slot now means losing its future EV
            let futureEV = 0;
            if (currentRound < 9) {
                futureEV = estimateFutureEV(arr.board, currentRound + 1, seenPlayerKeys);
            }

            // EV = immediate score + estimated future value of remaining slots
            const totalEV = score.total + futureEV;

            if (totalEV > bestEV) {
                bestEV = totalEV;
                bestArrangement = {
                    board: arr.board,
                    newSlot: arr.newSlot,
                    immediateScore: score,
                    futureEV,
                    ev: totalEV,
                };
            }
        }

        if (bestArrangement) {
            results.push({
                candidate,
                ...bestArrangement,
            });
        }
    }

    // Sort by EV (immediate score + future chemistry potential)
    // This ensures picks with better future chemistry upside are preferred
    results.sort((a, b) => b.ev - a.ev);

    return results;
}

// Estimate total future EV for all remaining empty slots
// Includes BOTH expected talent AND expected chemistry from future picks.
// This creates proper opportunity cost: filling a high-connection slot now
// means losing its future EV, naturally normalizing the QB/TE bias.
// Each slot is weighted by 1/totalEmptySlots (game randomly picks one slot).
function estimateFutureEV(board, forRound, seenPlayerKeys) {
    const emptySlots = getEmptySlots(board);
    if (emptySlots.length === 0) return 0;

    const slotProb = 1 / emptySlots.length;
    const odds = DRAFT_ODDS[Math.min(forRound, 9)];
    let totalFutureEV = 0;

    for (const emptySlot of emptySlots) {
        const pos = POSITIONS[emptySlot];
        const neighbors = getNeighbors(emptySlot);
        const occupiedNeighbors = neighbors.filter(n => board.slots[n] !== null);

        // Pool of players that fit this specific slot
        const slotPool = ALL_PLAYERS.filter(p => {
            if (seenPlayerKeys.has(getBasePlayerKey(p))) return false;
            return pos.accepts.includes(p.pos);
        });

        if (slotPool.length === 0) continue;

        // 1. Expected TALENT from a future pick in this slot
        let expectedTalent = 0;
        if (odds) {
            const byRarity = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
            for (const p of slotPool) byRarity[p.skill]++;

            for (let r = 5; r >= 1; r--) {
                if (byRarity[r] === 0) continue;
                const poolProportion = byRarity[r] / slotPool.length;
                expectedTalent += odds[5 - r] * TALENT_VALUES[r] * poolProportion;
            }
        }

        // 2. Expected CHEMISTRY from a future pick in this slot
        let expectedChem = 0;
        if (occupiedNeighbors.length > 0) {
            const teams = new Set();
            const divs = new Set();
            const years = new Set();

            for (const n of occupiedNeighbors) {
                const player = board.slots[n];
                teams.add(player.team);
                divs.add(player.div);
                years.add(player.draftYear);
            }

            let greenMatches = 0;
            let yellowMatches = 0;

            for (const p of slotPool) {
                const sameTeam = teams.has(p.team);
                const sameDiv = divs.has(p.div);
                const sameYear = years.has(p.draftYear);

                if (sameTeam || (sameDiv && sameYear)) {
                    greenMatches++;
                } else if (sameDiv || sameYear) {
                    yellowMatches++;
                }
            }

            const greenProb = greenMatches / slotPool.length;
            const yellowProb = yellowMatches / slotPool.length;

            // Connection points (real count of occupied neighbors)
            expectedChem += (greenProb * 2 + yellowProb * 1) * occupiedNeighbors.length;
            // Dot points
            expectedChem += greenProb * 6 + yellowProb * 2;
        }

        // Weight by probability this slot gets chosen
        totalFutureEV += (expectedTalent + expectedChem) * slotProb;
    }

    return totalFutureEV;
}

// ===== POSITION STRATEGY =====

// Get which position types are "offered" based on currently empty slots
// The game only offers players whose position directly fits an empty slot
export function getOfferedPositions(board) {
    const offered = new Set();
    for (let i = 0; i < 9; i++) {
        if (board.slots[i] === null) {
            const pos = POSITIONS[i];
            for (const acceptedPos of pos.accepts) {
                offered.add(acceptedPos);
            }
        }
    }
    return [...offered];
}

// Check if a player can fit on the board after rearranging existing players
// Returns an arrangement if possible, or null
export function canFitWithRearrangement(board, player) {
    // Quick check: direct placement possible?
    for (let i = 0; i < 9; i++) {
        if (board.slots[i] === null && canPlace(i, player)) return true;
    }

    // Try rearranging: for each slot that accepts this player's position,
    // see if we can move the current occupant somewhere else
    for (let targetSlot = 0; targetSlot < 9; targetSlot++) {
        if (!canPlace(targetSlot, player)) continue;
        const occupant = board.slots[targetSlot];
        if (!occupant) continue;

        // Can the occupant move to any empty slot?
        for (let emptySlot = 0; emptySlot < 9; emptySlot++) {
            if (board.slots[emptySlot] !== null) continue;
            if (canPlace(emptySlot, occupant)) return true;
        }

        // Chain swap: occupant goes to another occupied slot, that player goes to empty
        for (let midSlot = 0; midSlot < 9; midSlot++) {
            if (midSlot === targetSlot) continue;
            const midOccupant = board.slots[midSlot];
            if (!midOccupant) continue;
            if (!canPlace(midSlot, occupant)) continue;

            for (let emptySlot = 0; emptySlot < 9; emptySlot++) {
                if (board.slots[emptySlot] !== null) continue;
                if (canPlace(emptySlot, midOccupant)) return true;
            }
        }
    }

    return false;
}

// Suggest optimal arrangement before next round to maximize pool quality
export function suggestPreRoundArrangement(board, nextRound, seenPlayerKeys) {
    const players = [];
    for (let i = 0; i < 9; i++) {
        if (board.slots[i]) players.push(board.slots[i]);
    }

    if (players.length === 0 || players.length >= 9) {
        return { board, offeredPositions: getOfferedPositions(board), score: 0 };
    }

    let bestBoard = board;
    let bestScore = -Infinity;

    function solve(playerIdx, currentSlots) {
        if (playerIdx === players.length) {
            const newBoard = { slots: new Array(9).fill(null) };
            for (let i = 0; i < currentSlots.length; i++) {
                newBoard.slots[currentSlots[i]] = players[i];
            }

            const arrangeScore = scoreArrangementForPool(newBoard, nextRound, seenPlayerKeys);
            if (arrangeScore > bestScore) {
                bestScore = arrangeScore;
                bestBoard = newBoard;
            }
            return;
        }

        const player = players[playerIdx];
        for (let slot = 0; slot < 9; slot++) {
            if (!canPlace(slot, player)) continue;
            let taken = false;
            for (let j = 0; j < playerIdx; j++) {
                if (currentSlots[j] === slot) { taken = true; break; }
            }
            if (taken) continue;
            currentSlots[playerIdx] = slot;
            solve(playerIdx + 1, currentSlots);
        }
    }

    solve(0, new Array(players.length).fill(-1));

    return {
        board: bestBoard,
        offeredPositions: getOfferedPositions(bestBoard),
        score: bestScore,
    };
}

// Score an arrangement by expected future value (reuses estimateFutureEV)
function scoreArrangementForPool(board, nextRound, seenPlayerKeys) {
    return estimateFutureEV(board, nextRound, seenPlayerKeys);
}
