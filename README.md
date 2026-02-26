# Griddy Draft Optimizer

A real-time draft advisor for the **Griddy** football puzzle game. Input the three players you're offered each round and get instant recommendations on who to pick and where to place them to maximize your final score.

## How It Works

Griddy is a 9-round draft game played on a 3-row grid:

```
Row 1:  [ RB ]         [ WR ]
Row 2:  [ FLX ] [ QB ] [ QB ] [ FLX ]
Row 3:  [ WR ]  [ TE ] [ RB ]
```

Each round you're shown 3 random NFL players. You pick one and place them in a valid slot. Adjacent players score **chemistry points** based on shared attributes (team, division, draft year), and each player earns **talent points** based on their rarity tier.

### Scoring

| Type | Points |
|------|--------|
| Green Connection | +2 |
| Yellow Connection | +1 |
| Red Connection | +0 |
| Green Dot | +11 |
| Yellow Dot | +6 |
| Red Dot | +0 |

| Rarity | Talent |
|--------|--------|
| Hero | +15 |
| Platinum | +11 |
| Gold | +8 |
| Silver | +5 |
| Bronze | +3 |

## Features

- **EV-Based Pick Analysis** — Evaluates every candidate × slot combination, factoring in immediate score gain, chemistry potential, and expected value from future rounds.
- **Forward-Looking Strategy** — Considers how each pick affects the positions offered in later rounds and the probability-weighted value of those future picks.
- **Position Optimization** — Suggests board rearrangements before each round to strategically open up the most valuable slot combinations.
- **Rearrangement-Aware Placement** — Can recommend players even when no direct slot is open, if a board rearrangement can make space.
- **Player Search & Filtering** — Search the full player pool by name, team, or position. Previously seen players are automatically excluded.
- **Manual Swap Support** — Click any two filled slots to swap players and experiment with arrangements.

## Tech Stack

- Vanilla **HTML / CSS / JavaScript** (ES modules)
- No build step — open `index.html` directly or serve with any static file server
- **Inter** font from Google Fonts

## Project Structure

```
├── index.html              # Entry point
├── style.css               # All styling
└── src/
    ├── main.js             # App state, rendering, event handling
    ├── data/
    │   └── players.js      # Player pool, rarity tiers, draft odds, search
    └── engine/
        ├── grid.js         # Board model, positions, adjacency, placement
        ├── chemistry.js    # Connection & dot scoring logic
        └── optimizer.js    # EV calculation, candidate evaluation, arrangement optimization
```

## Getting Started

```bash
# Clone the repo
git clone https://github.com/EoinRyan/griddy-optimizer.git
cd griddy-optimizer

# Serve locally (any static server works)
npx serve .
# or just open index.html in your browser
```

## Usage

1. Click **Start Draft** on the home screen.
2. Each round, search for the 3 players you were offered and select them.
3. Click **Analyze Picks** to see the optimizer's recommendation.
4. Click on a recommendation to preview it on the board.
5. Click **Confirm Pick & Next Round** to advance.
6. Optionally use **Optimize Positions for Next Round** to rearrange your board before the next pick.
7. After 9 rounds, view your final optimized score.