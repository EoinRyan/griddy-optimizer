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

            // Calculate EV bonus for future rounds based on chemistry potential
            let chemPotential = 0;
            if (currentRound < 9) {
                const empties = getEmptySlots(arr.board);
                chemPotential = estimateChemPotential(arr.board, empties, seenPlayerKeys);
            }

            // EV = immediate score + estimated future chemistry gains
            const totalEV = score.total + chemPotential;

            if (totalEV > bestEV) {
                bestEV = totalEV;
                bestArrangement = {
                    board: arr.board,
                    newSlot: arr.newSlot,
                    immediateScore: score,
                    chemPotential,
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

// Estimate chemistry potential for empty slots based on remaining pool
// Weighted by slot probability: the game randomly picks one open slot,
// so each slot's contribution is weighted by 1/totalEmptySlots
function estimateChemPotential(board, emptySlots, seenPlayerKeys) {
    if (emptySlots.length === 0) return 0;

    const slotProb = 1 / emptySlots.length;
    let potential = 0;

    for (const emptySlot of emptySlots) {
        const neighbors = getNeighbors(emptySlot);
        const occupiedNeighbors = neighbors.filter(n => board.slots[n] !== null);

        if (occupiedNeighbors.length === 0) continue;

        // Collect attributes of all occupied neighbors
        const teams = new Set();
        const divs = new Set();
        const years = new Set();

        for (const n of occupiedNeighbors) {
            const player = board.slots[n];
            teams.add(player.team);
            divs.add(player.div);
            years.add(player.draftYear);
        }

        // Count available pool players that could fill this slot AND share attributes
        const pos = POSITIONS[emptySlot];
        let greenMatches = 0; // same team or same div+year
        let yellowMatches = 0; // same div or same year (but not green)

        const poolPlayers = ALL_PLAYERS.filter(p => {
            if (seenPlayerKeys.has(getBasePlayerKey(p))) return false;
            if (!pos.accepts.includes(p.pos)) return false;
            return true;
        });

        const totalPool = poolPlayers.length || 1;

        for (const p of poolPlayers) {
            const sameTeam = teams.has(p.team);
            const sameDiv = divs.has(p.div);
            const sameYear = years.has(p.draftYear);

            if (sameTeam || (sameDiv && sameYear)) {
                greenMatches++;
            } else if (sameDiv || sameYear) {
                yellowMatches++;
            }
        }

        // Expected chemistry points from this empty slot's connections
        // Weight by probability of getting a matching player
        const greenProb = greenMatches / totalPool;
        const yellowProb = yellowMatches / totalPool;

        // Expected connection points per neighbor: green=2, yellow=1
        const expectedConnPoints = (greenProb * 2 + yellowProb * 1) * occupiedNeighbors.length;

        // Also estimate dot contribution
        const expectedDotPoints = greenProb * 6 + yellowProb * 2;

        // Weight by the probability this slot gets chosen by the game
        potential += (expectedConnPoints + expectedDotPoints) * slotProb;
    }

    return potential;
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

// Score an arrangement by the expected quality of players offered
// Uses per-slot probability: game randomly picks one empty slot, then generates
// 3 players for that slot. Each slot is weighted by 1/totalEmptySlots.
function scoreArrangementForPool(board, nextRound, seenPlayerKeys) {
    const odds = DRAFT_ODDS[nextRound];
    if (!odds) return 0;

    const emptySlots = getEmptySlots(board);
    if (emptySlots.length === 0) return 0;

    const slotProb = 1 / emptySlots.length;
    let totalEV = 0;

    // Evaluate each empty slot independently, weighted by its selection probability
    for (const emptySlot of emptySlots) {
        const pos = POSITIONS[emptySlot];

        // Get the pool of players that fit THIS specific slot
        const slotPool = ALL_PLAYERS.filter(p => {
            if (seenPlayerKeys.has(getBasePlayerKey(p))) return false;
            return pos.accepts.includes(p.pos);
        });

        if (slotPool.length === 0) continue;

        // Expected talent for this slot's pool
        let slotTalentEV = 0;
        const byRarity = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        for (const p of slotPool) byRarity[p.skill]++;
        const total = slotPool.length;

        for (let r = 5; r >= 1; r--) {
            if (byRarity[r] === 0) continue;
            const poolProportion = byRarity[r] / total;
            slotTalentEV += odds[5 - r] * TALENT_VALUES[r] * poolProportion * total;
        }
        slotTalentEV = slotTalentEV / (total || 1);

        // Chemistry potential for this specific slot
        let slotChemEV = 0;
        const neighbors = getNeighbors(emptySlot);
        const occupiedNeighbors = neighbors.filter(n => board.slots[n] !== null);

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

            let matches = 0;
            for (const p of slotPool) {
                if (teams.has(p.team) || divs.has(p.div) || years.has(p.draftYear)) {
                    matches++;
                }
            }

            const matchRate = matches / slotPool.length;
            slotChemEV = matchRate * occupiedNeighbors.length * 2;
        }

        // Weight this slot's EV by its probability of being chosen
        totalEV += (slotTalentEV + slotChemEV) * slotProb;
    }

    return totalEV;
}
