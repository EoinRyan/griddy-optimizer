import { POSITIONS, ADJACENCIES, createBoard, canPlace, cloneBoard, placePlayer, getEmptySlots, getNeighbors } from './engine/grid.js';
import { getConnectionColor, getDotColor, calculateChemistry, getConnectionDetails, getDotDetails } from './engine/chemistry.js';
import { ALL_PLAYERS, TALENT_VALUES, RARITY_NAMES, RARITY_COLORS, DRAFT_ODDS, searchPlayers, getPlayerById, getBasePlayerKey, getRelatedPlayerIds, DIV_NAMES, TEAM_NAMES } from './data/players.js';
import { calculateScore, evaluateCandidates, optimizeArrangement, getOfferedPositions, canFitWithRearrangement, suggestPreRoundArrangement } from './engine/optimizer.js';

// ===== APP STATE =====
const state = {
  screen: 'home', // 'home' | 'draft' | 'complete'
  board: createBoard(),
  round: 1,
  candidates: [null, null, null], // selected candidates for this round
  seenPlayerKeys: new Set(), // base keys of all previously shown/picked players
  pickedPlayers: [], // players on the board
  recommendations: [],
  pickApplied: false, // true after a recommendation is applied, prevents re-analysis
  swapSource: null, // slot being swapped
  score: { talent: 0, chemistry: 0, total: 0 },
};

const app = document.getElementById('app');

// ===== SLOT POSITIONS (pixel coords for the grid visualization) =====
const SLOT_COORDS = [
  { x: 60, y: 20 },  // [1][1] RB
  { x: 320, y: 20 },  // [1][2] WR
  { x: 20, y: 145 },  // [2][1] FLX
  { x: 140, y: 145 },  // [2][2] QB
  { x: 260, y: 145 },  // [2][3] QB
  { x: 380, y: 145 },  // [2][4] FLX
  { x: 60, y: 270 },  // [3][1] WR
  { x: 200, y: 270 },  // [3][2] TE
  { x: 340, y: 270 },  // [3][3] RB
];

// ===== RENDER =====
function render() {
  if (state.screen === 'home') renderHome();
  else if (state.screen === 'draft') renderDraft();
  else if (state.screen === 'complete') renderComplete();
}

// ===== HOME SCREEN =====
function renderHome() {
  app.innerHTML = `
    <div class="home-screen">
      <div class="home-logo">
        <h1>GRIDDY</h1>
      </div>
      <p class="home-subtitle">Draft Optimizer -- Maximize Your Score</p>
      <div class="home-card">
        <h2>Scoring Reference</h2>
        <table class="scoring-table">
          <tr><td>Green Connection</td><td>+2 pts</td></tr>
          <tr><td>Yellow Connection</td><td>+1 pt</td></tr>
          <tr><td>Red Connection</td><td>0 pts</td></tr>
          <tr><td>Green Dot</td><td>+11 pts</td></tr>
          <tr><td>Yellow Dot</td><td>+6 pts</td></tr>
          <tr><td>Red Dot</td><td>0 pts</td></tr>
        </table>
        <h2>Talent by Rarity</h2>
        <table class="scoring-table">
          <tr><td><span style="color:${RARITY_COLORS[5]}">Hero</span></td><td>+15</td></tr>
          <tr><td><span style="color:${RARITY_COLORS[4]}">Platinum</span></td><td>+11</td></tr>
          <tr><td><span style="color:${RARITY_COLORS[3]}">Gold</span></td><td>+8</td></tr>
          <tr><td><span style="color:${RARITY_COLORS[2]}">Silver</span></td><td>+5</td></tr>
          <tr><td><span style="color:${RARITY_COLORS[1]}">Bronze</span></td><td>+3</td></tr>
        </table>
        <button class="btn-primary" id="btn-start">Start Draft</button>
      </div>
    </div>
  `;
  document.getElementById('btn-start').addEventListener('click', startDraft);
}

function startDraft() {
  state.screen = 'draft';
  state.board = createBoard();
  state.round = 1;
  state.candidates = [null, null, null];
  state.seenPlayerKeys = new Set();
  state.pickedPlayers = [];
  state.recommendations = [];
  state.pickApplied = false;
  state.swapSource = null;
  state.score = { talent: 0, chemistry: 0, total: 0 };
  render();
}

// ===== DRAFT SCREEN =====
function renderDraft() {
  const score = calculateScore(state.board);
  state.score = score;

  const odds = DRAFT_ODDS[state.round];
  const isComplete = state.round > 9;

  if (isComplete) {
    state.screen = 'complete';
    render();
    return;
  }

  app.innerHTML = `
    <div class="draft-screen">
      <!-- Header -->
      <div class="draft-header">
        <span class="draft-title">GRIDDY OPTIMIZER</span>
        <div class="round-indicator">
          <span class="round-badge">Round ${state.round} / 9</span>
        </div>
        <div class="score-display">
          <div class="score-item talent">
            <span class="label">Talent</span>
            <span class="value">${score.talent}</span>
          </div>
          <div class="score-item chemistry">
            <span class="label">Chem</span>
            <span class="value">${score.chemistry}</span>
          </div>
          <div class="score-item total">
            <span class="label">Total</span>
            <span class="value">${score.total}</span>
          </div>
        </div>
      </div>

      <!-- Odds bar -->
      <div class="odds-display">
        <span class="odds-label">Round ${state.round} Odds</span>
        <div class="odds-bars">
          <div class="odds-bar"><span class="odds-bar-label" style="color:${RARITY_COLORS[5]}">Hero</span><span class="odds-bar-value">${Math.round(odds[0] * 100)}%</span></div>
          <div class="odds-bar"><span class="odds-bar-label" style="color:${RARITY_COLORS[4]}">Plat</span><span class="odds-bar-value">${Math.round(odds[1] * 100)}%</span></div>
          <div class="odds-bar"><span class="odds-bar-label" style="color:${RARITY_COLORS[3]}">Gold</span><span class="odds-bar-value">${Math.round(odds[2] * 100)}%</span></div>
          <div class="odds-bar"><span class="odds-bar-label" style="color:${RARITY_COLORS[2]}">Silv</span><span class="odds-bar-value">${Math.round(odds[3] * 100)}%</span></div>
          <div class="odds-bar"><span class="odds-bar-label" style="color:${RARITY_COLORS[1]}">Brnz</span><span class="odds-bar-value">${Math.round(odds[4] * 100)}%</span></div>
        </div>
      </div>

      <!-- Position Strategy -->
      <div class="position-strategy-bar">
        <div class="offered-positions">
          <span class="strat-label">Positions Offered:</span>
          ${getOfferedPositions(state.board).map(p => `<span class="pos-tag">${p}</span>`).join('')}
        </div>
        <button class="btn-arrange" id="btn-arrange" ${state.round > 8 ? 'disabled' : ''}>Optimize Positions for Next Round</button>
      </div>

      <!-- Main content -->
      <div class="draft-content">
        <!-- Grid -->
        <div class="grid-section">
          <div class="grid-container" id="grid-container">
            ${renderGridSVG()}
            ${renderSlots()}
          </div>
        </div>

        <!-- Right panel -->
        <div class="panel-section">
          <!-- Player selection -->
          <div class="selection-card">
            <h3>Select 3 Players Offered</h3>
            <div class="player-search-group">
              ${renderSearchInputs()}
            </div>
          </div>

          <!-- Recommendations -->
          <div class="recommendation-card">
            <h3>Recommendation</h3>
            ${renderRecommendations()}
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="draft-actions">
        <button class="btn-action btn-optimize" id="btn-optimize" ${state.pickApplied || state.candidates.filter(c => c).length < 1 ? 'disabled' : ''}>Analyze Picks</button>
        <button class="btn-action btn-next" id="btn-next" ${!state.recommendations.length ? 'disabled' : ''}>Confirm Pick & Next Round</button>
        <button class="btn-action btn-reset" id="btn-reset">Reset Draft</button>
      </div>
    </div>
  `;

  setupEventListeners();
}

function renderGridSVG() {
  const conns = getConnectionDetails(state.board);
  const slotW = 100, slotH = 120;

  let lines = '';
  for (const conn of conns) {
    const ax = SLOT_COORDS[conn.a].x + slotW / 2;
    const ay = SLOT_COORDS[conn.a].y + slotH / 2;
    const bx = SLOT_COORDS[conn.b].x + slotW / 2;
    const by = SLOT_COORDS[conn.b].y + slotH / 2;
    const cls = `conn-${conn.color}`;
    lines += `<line x1="${ax}" y1="${ay}" x2="${bx}" y2="${by}" class="${cls}" />`;
  }

  return `<svg class="grid-svg" viewBox="0 0 480 400">${lines}</svg>`;
}

function renderSlots() {
  const dots = getDotDetails(state.board);
  let html = '';

  for (let i = 0; i < 9; i++) {
    const pos = POSITIONS[i];
    const coord = SLOT_COORDS[i];
    const player = state.board.slots[i];
    const dot = dots[i];
    const isSwapSource = state.swapSource === i;
    const isHighlighted = state.recommendations.length > 0 &&
      state.recommendations[0] && state.recommendations[0].newSlot === i;

    let classes = 'slot';
    if (player) classes += ' filled';
    else classes += ' empty';
    if (isSwapSource) classes += ' swap-source';
    if (isHighlighted && !player) classes += ' highlighted';

    let content = '';
    if (player) {
      content = `
        <div class="rarity-bar" style="background:${player.rarityColor}"></div>
        <div class="player-name">${player.displayName}</div>
        <div class="player-info">${player.rarity}</div>
        <div class="player-team">${player.team} | ${player.div} | '${String(player.draftYear).padStart(2, '0')}</div>
        <div class="chem-dot dot-${dot.color}"></div>
      `;
    } else {
      content = `<span class="slot-label">${pos.label}</span>`;
    }

    html += `<div class="${classes}" style="left:${coord.x}px;top:${coord.y}px" data-slot="${i}">${content}</div>`;
  }

  return html;
}

function renderSearchInputs() {
  let html = '';
  for (let i = 0; i < 3; i++) {
    const player = state.candidates[i];
    const inputValue = player ? player.searchName : '';
    const inputClass = player ? 'search-input selected' : 'search-input';

    html += `
      <div class="player-input-row">
        <div class="pick-number">${i + 1}</div>
        <div class="search-wrapper">
          <input type="text" class="${inputClass}" 
            data-pick="${i}" placeholder="Search player..."
            value="${inputValue}" 
            ${player ? 'readonly' : ''}
            id="search-input-${i}" />
          <div class="search-dropdown" id="dropdown-${i}"></div>
        </div>
        ${player ? `<button class="clear-btn" data-clear="${i}">X</button>` : ''}
      </div>
    `;
  }
  return html;
}

function renderRecommendations() {
  if (state.recommendations.length === 0) {
    return '<div class="rec-empty">Enter 3 players and click "Analyze Picks" to get recommendations</div>';
  }

  let html = '<div class="rec-list">';
  for (let i = 0; i < state.recommendations.length; i++) {
    const rec = state.recommendations[i];
    const rank = i === 0 ? 'Best Pick' : i === 1 ? '2nd Choice' : '3rd Choice';
    const pos = POSITIONS[rec.newSlot];
    const futureEVDisplay = rec.futureEV ? rec.futureEV.toFixed(1) : '0.0';
    const evDisplay = rec.ev.toFixed(1);

    html += `
      <div class="rec-item" data-rec="${i}">
        <div class="rec-item-header">
          <span class="rec-rank">${rank}</span>
          <span class="rec-score">${evDisplay} EV</span>
        </div>
        <div class="rec-player-name" style="color:${rec.candidate.rarityColor}">${rec.candidate.searchName}</div>
        <div class="rec-details">
          <span class="rec-detail-item">Slot: ${pos.label} [${pos.row}][${pos.col}]</span>
          <span class="rec-detail-item">Score: ${rec.immediateScore.total}</span>
          <span class="rec-detail-item">Future EV: +${futureEVDisplay}</span>
        </div>
      </div>
    `;
  }
  html += '</div>';
  return html;
}

// ===== EVENT LISTENERS =====
function setupEventListeners() {
  // Search inputs
  for (let i = 0; i < 3; i++) {
    const input = document.getElementById(`search-input-${i}`);
    const dropdown = document.getElementById(`dropdown-${i}`);

    if (!input || state.candidates[i]) continue;

    input.addEventListener('input', () => {
      const query = input.value;
      if (query.length < 1) {
        dropdown.classList.remove('visible');
        return;
      }

      // Get available players (not already seen/picked/selected as candidate)
      const availableIds = new Set(ALL_PLAYERS.map(p => p.id));

      // Remove seen players
      for (const key of state.seenPlayerKeys) {
        ALL_PLAYERS.filter(p => getBasePlayerKey(p) === key)
          .forEach(p => availableIds.delete(p.id));
      }

      // Remove currently selected candidates
      for (let j = 0; j < 3; j++) {
        if (j !== i && state.candidates[j]) {
          getRelatedPlayerIds(state.candidates[j]).forEach(id => availableIds.delete(id));
        }
      }

      const results = searchPlayers(query, availableIds);
      renderDropdown(dropdown, results, i);
    });

    input.addEventListener('focus', () => {
      if (input.value.length >= 1) {
        input.dispatchEvent(new Event('input'));
      }
    });
  }

  // Clear buttons
  document.querySelectorAll('.clear-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.clear);
      state.candidates[idx] = null;
      state.recommendations = [];
      render();
    });
  });

  // Analyze button
  const analyzeBtn = document.getElementById('btn-optimize');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', () => {
      if (state.pickApplied) return; // Prevent re-analysis after pick is applied
      const candidates = state.candidates.filter(c => c !== null);
      if (candidates.length === 0) return;

      // Filter out candidates that are already on the board
      const boardKeys = new Set();
      for (const p of state.board.slots) {
        if (p) boardKeys.add(getBasePlayerKey(p));
      }
      const validCandidates = candidates.filter(c => !boardKeys.has(getBasePlayerKey(c)));
      if (validCandidates.length === 0) return;

      state.recommendations = evaluateCandidates(
        state.board, validCandidates, state.round, state.seenPlayerKeys
      );
      render();
    });
  }

  // Apply recommendation
  document.querySelectorAll('.rec-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.dataset.rec);
      applyRecommendation(idx);
    });
  });

  // Confirm pick & next round
  const nextBtn = document.getElementById('btn-next');
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.recommendations.length > 0) {
        // Apply the first (best) recommendation if not already applied
        confirmPick();
      }
    });
  }

  // Optimize positions for next round (also advances the round)
  const arrangeBtn = document.getElementById('btn-arrange');
  if (arrangeBtn) {
    arrangeBtn.addEventListener('click', () => {
      const nextRound = state.round; // Suggest for current round's offerings
      const result = suggestPreRoundArrangement(state.board, nextRound, state.seenPlayerKeys);
      state.board = result.board;

      // Mark all current candidates as seen
      for (const candidate of state.candidates) {
        if (candidate) {
          state.seenPlayerKeys.add(getBasePlayerKey(candidate));
        }
      }

      // Advance round
      state.round++;
      state.candidates = [null, null, null];
      state.recommendations = [];
      state.pickApplied = false;
      state.swapSource = null;

      render();
    });
  }

  // Reset
  const resetBtn = document.getElementById('btn-reset');
  if (resetBtn) {
    resetBtn.addEventListener('click', startDraft);
  }

  // Slot clicks for swapping
  document.querySelectorAll('.slot.filled').forEach(slot => {
    slot.addEventListener('click', () => {
      const slotId = parseInt(slot.dataset.slot);
      handleSlotClick(slotId);
    });
  });

  // Close dropdowns on outside click
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-wrapper')) {
      document.querySelectorAll('.search-dropdown').forEach(d => d.classList.remove('visible'));
    }
  });
}

function renderDropdown(dropdown, results, pickIdx) {
  if (results.length === 0) {
    dropdown.classList.remove('visible');
    return;
  }

  dropdown.innerHTML = results.map(player => `
    <div class="search-option" data-player-id="${player.id}">
      <span class="rarity-dot" style="background:${player.rarityColor}"></span>
      <span>${player.displayName} (${player.rarity})</span>
      <span class="player-pos">${player.pos} | ${player.team} | '${String(player.draftYear).padStart(2, '0')}</span>
    </div>
  `).join('');

  dropdown.classList.add('visible');

  dropdown.querySelectorAll('.search-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const playerId = parseInt(opt.dataset.playerId);
      const player = getPlayerById(playerId);
      if (player) {
        state.candidates[pickIdx] = player;
        state.recommendations = [];
        render();
      }
    });
  });
}

function applyRecommendation(idx) {
  const rec = state.recommendations[idx];
  if (!rec) return;

  state.board = rec.board;
  state.recommendations = [rec];
  state.pickApplied = true; // Lock analysis
  render();
}

function confirmPick() {
  if (state.recommendations.length === 0) return;

  const rec = state.recommendations[0];
  state.board = rec.board;

  // Mark all candidates as seen (all 3 shown players get removed from pool)
  for (const candidate of state.candidates) {
    if (candidate) {
      state.seenPlayerKeys.add(getBasePlayerKey(candidate));
    }
  }

  // Advance round
  state.round++;
  state.candidates = [null, null, null];
  state.recommendations = [];
  state.pickApplied = false;
  state.swapSource = null;

  render();
}

function handleSlotClick(slotId) {
  if (state.swapSource === null) {
    state.swapSource = slotId;
    render();
  } else if (state.swapSource === slotId) {
    state.swapSource = null;
    render();
  } else {
    // Try to swap
    const playerA = state.board.slots[state.swapSource];
    const playerB = state.board.slots[slotId];

    if (playerA && playerB) {
      // Check both can go in the other's slot
      if (canPlace(slotId, playerA) && canPlace(state.swapSource, playerB)) {
        const newBoard = cloneBoard(state.board);
        newBoard.slots[state.swapSource] = playerB;
        newBoard.slots[slotId] = playerA;
        state.board = newBoard;
      }
    } else if (playerA && !playerB) {
      if (canPlace(slotId, playerA)) {
        const newBoard = cloneBoard(state.board);
        newBoard.slots[slotId] = playerA;
        newBoard.slots[state.swapSource] = null;
        state.board = newBoard;
      }
    }

    state.swapSource = null;
    state.recommendations = [];
    state.pickApplied = false;
    render();
  }
}

// ===== COMPLETE SCREEN =====
function renderComplete() {
  // Final optimization
  const optimized = optimizeArrangement(state.board);
  state.board = optimized.board;
  const score = calculateScore(state.board);

  app.innerHTML = `
    <div class="draft-screen">
      <div class="draft-header">
        <span class="draft-title">GRIDDY OPTIMIZER</span>
        <span class="round-badge">Draft Complete</span>
        <div></div>
      </div>

      <div class="draft-content">
        <div class="grid-section">
          <div class="grid-container" id="grid-container">
            ${renderGridSVG()}
            ${renderSlots()}
          </div>
        </div>

        <div class="panel-section">
          <div class="draft-complete">
            <h2>Draft Complete</h2>
            <p style="color: var(--text-secondary)">Final optimized arrangement applied</p>
            <div class="final-score-display">
              <div class="final-score-box">
                <div class="label">Talent</div>
                <div class="value" style="color: var(--accent)">${score.talent}</div>
              </div>
              <div class="final-score-box">
                <div class="label">Chemistry</div>
                <div class="value" style="color: var(--green)">${score.chemistry}</div>
              </div>
              <div class="final-score-box">
                <div class="label">Total</div>
                <div class="value">${score.total}</div>
              </div>
            </div>
            <button class="btn-primary" id="btn-new-draft" style="max-width:300px">New Draft</button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Slot clicks still work for manual swaps
  document.querySelectorAll('.slot.filled').forEach(slot => {
    slot.addEventListener('click', () => {
      const slotId = parseInt(slot.dataset.slot);
      handleSlotClick(slotId);
    });
  });

  document.getElementById('btn-new-draft').addEventListener('click', startDraft);
}

// ===== INIT =====
render();
