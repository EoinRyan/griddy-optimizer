// Talent values per rarity tier
export const TALENT_VALUES = {
    5: 15, // Hero
    4: 11, // Platinum
    3: 8,  // Gold
    2: 5,  // Silver
    1: 3,  // Bronze
};

export const RARITY_NAMES = {
    5: 'Hero',
    4: 'Platinum',
    3: 'Gold',
    2: 'Silver',
    1: 'Bronze',
};

export const RARITY_COLORS = {
    5: '#a855f7', // purple for Hero
    4: '#06b6d4', // cyan for Platinum
    3: '#eab308', // gold
    2: '#9ca3a5', // silver
    1: '#cd7f32', // bronze
};

// Draft odds per round: [Hero, Platinum, Gold, Silver, Bronze]
export const DRAFT_ODDS = [
    null, // index 0 unused
    [0.02, 0.80, 0.18, 0.00, 0.00], // Round 1
    [0.02, 0.50, 0.45, 0.03, 0.00], // Round 2
    [0.02, 0.10, 0.65, 0.23, 0.00], // Round 3
    [0.02, 0.08, 0.45, 0.40, 0.05], // Round 4
    [0.02, 0.08, 0.25, 0.60, 0.05], // Round 5
    [0.02, 0.07, 0.10, 0.50, 0.31], // Round 6
    [0.02, 0.07, 0.10, 0.41, 0.40], // Round 7
    [0.02, 0.05, 0.07, 0.21, 0.65], // Round 8
    [0.02, 0.04, 0.06, 0.18, 0.70], // Round 9
];

// Expected talent for a future round
export function expectedTalent(round) {
    if (round < 1 || round > 9) return 0;
    const odds = DRAFT_ODDS[round];
    return odds[0] * 15 + odds[1] * 11 + odds[2] * 8 + odds[3] * 5 + odds[4] * 3;
}

// Division full names for display
export const DIV_NAMES = {
    'AE': 'AFC East', 'AN': 'AFC North', 'AS': 'AFC South', 'AW': 'AFC West',
    'NE': 'NFC East', 'NN': 'NFC North', 'NS': 'NFC South', 'NW': 'NFC West',
};

// Team full names
export const TEAM_NAMES = {
    'ARI': 'Cardinals', 'ATL': 'Falcons', 'BAL': 'Ravens', 'BUF': 'Bills',
    'CAR': 'Panthers', 'CHI': 'Bears', 'CIN': 'Bengals', 'CLE': 'Browns',
    'DAL': 'Cowboys', 'DEN': 'Broncos', 'DET': 'Lions', 'GB': 'Packers',
    'HOU': 'Texans', 'IND': 'Colts', 'JAX': 'Jaguars', 'KC': 'Chiefs',
    'LAC': 'Chargers', 'LAR': 'Rams', 'LV': 'Raiders', 'MIA': 'Dolphins',
    'MIN': 'Vikings', 'NE': 'Patriots', 'NO': 'Saints', 'NYG': 'Giants',
    'NYJ': 'Jets', 'PHI': 'Eagles', 'PIT': 'Steelers', 'SEA': 'Seahawks',
    'SF': '49ers', 'TB': 'Buccaneers', 'TEN': 'Titans', 'WAS': 'Commanders',
};

// Raw player data parsed from the CSV
// Each entry: [Pos, Skill, Initial, Name, Div, Team, DraftYear]
const RAW_DATA = [
    ["QB", 5, "S", "darnold", "NW", "SEA", 18], ["QB", 5, "T", "lawrence", "AS", "JAX", 21], ["QB", 5, "B", "nix", "AW", "DEN", 24], ["QB", 5, "D", "maye", "AE", "NE", 24], ["QB", 5, "B", "purdy", "NW", "SF", 22], ["QB", 5, "J", "love", "NN", "GB", 20], ["QB", 5, "J", "hurts", "NE", "PHI", 20], ["QB", 5, "M", "stafford", "NW", "LAR", 9], ["QB", 5, "J", "daniels", "NE", "WAS", 24], ["QB", 5, "J", "goff", "NN", "DET", 16], ["QB", 5, "B", "mayfield", "NS", "TB", 18], ["QB", 5, "L", "jackson", "AN", "BAL", 18], ["QB", 5, "J", "allen", "AE", "BUF", 18], ["QB", 5, "P", "mahomes", "AW", "KC", 17], ["QB", 5, "C", "williams", "NN", "CHI", 24], ["QB", 5, "J", "burrow", "AN", "CIN", 20], ["QB", 5, "J", "herbert", "AW", "LAC", 20],
    ["QB", 4, "P", "mahomes", "AW", "KC", 17], ["QB", 4, "L", "jackson", "AN", "BAL", 18], ["QB", 4, "M", "stafford", "NW", "LAR", 9], ["QB", 4, "J", "burrow", "AN", "CIN", 20], ["QB", 4, "D", "maye", "AE", "NE", 24], ["QB", 4, "J", "allen", "AE", "BUF", 18],
    ["QB", 3, "B", "purdy", "NW", "SF", 22], ["QB", 3, "T", "lawrence", "AS", "JAX", 21], ["QB", 3, "J", "love", "NN", "GB", 20], ["QB", 3, "J", "hurts", "NE", "PHI", 20], ["QB", 3, "J", "herbert", "AW", "LAC", 20], ["QB", 3, "C", "williams", "NN", "CHI", 24], ["QB", 3, "B", "mayfield", "NS", "TB", 18], ["QB", 3, "J", "goff", "NN", "DET", 16], ["QB", 3, "D", "prescott", "NE", "DAL", 16], ["QB", 3, "J", "daniels", "NE", "WAS", 24], ["QB", 3, "B", "nix", "AW", "DEN", 24],
    ["QB", 2, "T", "shough", "NS", "NO", 25], ["QB", 2, "J", "dart", "NE", "NYG", 25], ["QB", 2, "A", "rodgers", "AN", "PIT", 5], ["QB", 2, "B", "young", "NS", "CAR", 23], ["QB", 2, "C", "stroud", "AS", "HOU", 23], ["QB", 2, "K", "murray", "NW", "ARI", 19], ["QB", 2, "S", "darnold", "NW", "SEA", 18],
    ["QB", 1, "R", "leonard", "AS", "IND", 25], ["QB", 1, "B", "cook", "AE", "NYJ", 25], ["QB", 1, "K", "pickett", "AW", "LV", 22], ["QB", 1, "C", "ward", "AS", "TEN", 25], ["QB", 1, "S", "sanders", "AN", "CLE", 25], ["QB", 1, "J", "mccarthy", "NN", "MIN", 24], ["QB", 1, "M", "penix", "NS", "ATL", 24], ["QB", 1, "T", "tagovaiola", "AE", "MIA", 20],
    ["RB", 5, "R", "stevenson", "AE", "NE", 21], ["RB", 5, "J", "warren", "AN", "PIT", 22], ["RB", 5, "T", "henderson", "AE", "NE", 25], ["RB", 5, "R", "dowdle", "NS", "CAR", 20], ["RB", 5, "D", "achane", "AE", "MIA", 23], ["RB", 5, "J", "cook", "AE", "BUF", 22], ["RB", 5, "K", "walker", "NW", "SEA", 22], ["RB", 5, "K", "williams", "NW", "LAR", 22], ["RB", 5, "J", "gibbs", "NN", "DET", 23], ["RB", 5, "B", "robinson", "NS", "ATL", 23], ["RB", 5, "A", "jones", "NN", "MIN", 17], ["RB", 5, "D", "montgomery", "NN", "DET", 19], ["RB", 5, "C", "brown", "AN", "CIN", 23], ["RB", 5, "J", "conner", "NW", "ARI", 17], ["RB", 5, "B", "irving", "NS", "TB", 24], ["RB", 5, "J", "williams", "NE", "DAL", 21], ["RB", 5, "B", "hall", "AE", "NYJ", 22], ["RB", 5, "O", "hampton", "AW", "LAC", 25], ["RB", 5, "A", "jeanty", "AW", "LV", 25], ["RB", 5, "T", "pollard", "AS", "TEN", 19], ["RB", 5, "J", "jacobs", "NN", "GB", 19], ["RB", 5, "S", "barkley", "NE", "PHI", 18], ["RB", 5, "A", "kamara", "NS", "NO", 17], ["RB", 5, "C", "mccaffery", "NW", "SF", 17], ["RB", 5, "T", "etienne", "AS", "JAX", 21], ["RB", 5, "Q", "judkins", "AN", "CLE", 21], ["RB", 5, "D", "swift", "NN", "CHI", 20], ["RB", 5, "J", "taylor", "AS", "IND", 20], ["RB", 5, "D", "henry", "AN", "BAL", 16], ["RB", 5, "C", "skattebo", "NE", "NYG", 25], ["RB", 5, "J", "dobbins", "AW", "DEN", 20],
    ["RB", 4, "B", "irving", "NS", "TB", 24], ["RB", 4, "A", "jeanty", "AW", "LV", 25], ["RB", 4, "J", "cook", "AE", "BUF", 22], ["RB", 4, "K", "walker", "NW", "SEA", 22], ["RB", 4, "J", "gibbs", "NN", "DET", 23], ["RB", 4, "B", "robinson", "NS", "ATL", 23], ["RB", 4, "J", "taylor", "AS", "IND", 20], ["RB", 4, "K", "williams", "NW", "LAR", 22], ["RB", 4, "J", "jacobs", "NN", "GB", 19], ["RB", 4, "S", "barkley", "NE", "PHI", 18], ["RB", 4, "C", "mccaffery", "NW", "SF", 17], ["RB", 4, "D", "henry", "AN", "BAL", 16], ["RB", 4, "D", "achane", "AE", "MIA", 23],
    ["RB", 3, "B", "hall", "AE", "NYJ", 22], ["RB", 3, "C", "skattebo", "NE", "NYG", 25], ["RB", 3, "C", "brown", "AN", "CIN", 23], ["RB", 3, "T", "henderson", "AE", "NE", 25], ["RB", 3, "Q", "judkins", "AN", "CLE", 25], ["RB", 3, "R", "stevenson", "AE", "NE", 21], ["RB", 3, "J", "williams", "NE", "DAL", 21], ["RB", 3, "R", "dowdle", "NS", "CAR", 20], ["RB", 3, "D", "swift", "NN", "CHI", 20], ["RB", 3, "J", "dobbins", "AW", "DEN", 20], ["RB", 3, "O", "hampton", "AW", "LAC", 25], ["RB", 3, "T", "pollard", "AS", "TEN", 19], ["RB", 3, "D", "montgomery", "NN", "DET", 19], ["RB", 3, "A", "jones", "NN", "MIN", 17], ["RB", 3, "T", "etienne", "AS", "JAX", 21], ["RB", 3, "J", "conner", "NW", "ARI", 17], ["RB", 3, "A", "kamara", "NS", "NO", 17],
    ["RB", 2, "J", "warren", "AN", "PIT", 22], ["RB", 2, "D", "neal", "NS", "NO", 25], ["RB", 2, "J", "croskey merritt", "NE", "WAS", 25], ["RB", 2, "W", "marks", "AS", "HOU", 25], ["RB", 2, "K", "monganai", "NN", "CHI", 25], ["RB", 2, "R", "harvey", "AW", "DEN", 25], ["RB", 2, "T", "tracy", "NE", "NYG", 24], ["RB", 2, "K", "vidal", "AW", "LAC", 24], ["RB", 2, "T", "spears", "AS", "TEN", 23], ["RB", 2, "I", "pacheco", "AW", "KC", 22], ["RB", 2, "T", "allegier", "NS", "ATL", 22], ["RB", 2, "R", "white", "NS", "TB", 22], ["RB", 2, "Z", "charbonnet", "NW", "SEA", 23], ["RB", 2, "C", "hubbard", "NN", "CHI", 21], ["RB", 2, "N", "harris", "AW", "LAC", 21], ["RB", 2, "N", "chubb", "AS", "HOU", 18], ["RB", 2, "K", "hunt", "AW", "KC", 17], ["RB", 2, "J", "mason", "NN", "MIN", 22], ["RB", 2, "B", "robinson", "NW", "SF", 22],
    ["RB", 1, "B", "corum", "NW", "LAR", 24], ["RB", 1, "K", "gainwell", "AN", "PIT", 21], ["RB", 1, "K", "mitchell", "AN", "BAL", 23], ["RB", 1, "D", "sampson", "AN", "CLE", 25], ["RB", 1, "C", "rodriguez", "NE", "WAS", 23], ["RB", 1, "T", "etienne", "NS", "CAR", 25], ["RB", 1, "J", "hunter", "NW", "LAR", 25], ["RB", 1, "B", "smith", "AW", "KC", 25], ["RB", 1, "D", "giddens", "AS", "IND", 25], ["RB", 1, "B", "tuten", "AS", "JAX", 25], ["RB", 1, "J", "james", "NW", "SF", 25], ["RB", 1, "T", "brooks", "AN", "CIN", 25], ["RB", 1, "T", "johnson", "AE", "BUF", 19], ["RB", 1, "O", "gordon", "AE", "MIA", 25], ["RB", 1, "J", "blue", "NE", "DAL", 25], ["RB", 1, "K", "johnson", "AN", "PIT", 25], ["RB", 1, "I", "davis", "AE", "NYJ", 24], ["RB", 1, "W", "shipley", "NE", "PHI", 24], ["RB", 1, "R", "davis", "AE", "BUF", 24], ["RB", 1, "B", "allen", "AE", "NYJ", 24], ["RB", 1, "J", "wright", "AE", "MIA", 24], ["RB", 1, "E", "demercado", "NW", "ARI", 23], ["RB", 1, "R", "johnson", "NN", "CHI", 23], ["RB", 1, "E", "wilson", "NN", "GB", 23], ["RB", 1, "J", "mclaughlin", "AW", "DEN", 23], ["RB", 1, "T", "benson", "NW", "ARI", 24], ["RB", 1, "S", "tucker", "NS", "TB", 23], ["RB", 1, "T", "goodson", "AS", "IND", 23], ["RB", 1, "H", "haskins", "AW", "LAC", 22], ["RB", 1, "D", "pierce", "AW", "KC", 22], ["RB", 1, "J", "ford", "AN", "CLE", 22], ["RB", 1, "T", "bigsby", "NE", "PHI", 23], ["RB", 1, "J", "patterson", "AW", "LAC", 23], ["RB", 1, "M", "carter", "NW", "ARI", 21], ["RB", 1, "T", "chandler", "NN", "MIN", 22], ["RB", 1, "A", "dillon", "NE", "PHI", 20], ["RB", 1, "I", "guerendo", "NW", "SF", 24], ["RB", 1, "D", "singletary", "NE", "NYG", 19], ["RB", 1, "J", "hill", "AN", "BAL", 19], ["RB", 1, "T", "badie", "AW", "DEN", 22], ["RB", 1, "J", "mcnichols", "NE", "WAS", 17], ["RB", 1, "S", "perine", "AN", "CIN", 17], ["RB", 1, "A", "abdullah", "AS", "IND", 15], ["RB", 1, "Z", "white", "AW", "LV", 22], ["RB", 1, "B", "knight", "NW", "ARI", 22], ["RB", 1, "R", "mostert", "AW", "LV", 15], ["RB", 1, "Z", "scott", "NN", "MIN", 23],
    ["WR", 5, "M", "wilson", "NW", "ARI", 23], ["WR", 5, "M", "harrison", "NW", "ARI", 24], ["WR", 5, "M", "nabers", "NE", "NYG", 24], ["WR", 5, "P", "nacua", "NW", "LAR", 23], ["WR", 5, "D", "london", "NS", "ATL", 22], ["WR", 5, "G", "pickens", "NE", "DAL", 22], ["WR", 5, "Z", "flowers", "AN", "BAL", 23], ["WR", 5, "G", "wilson", "AE", "NYJ", 22], ["WR", 5, "J", "waddle", "AE", "MIA", 21], ["WR", 5, "C", "olave", "NS", "NO", 22], ["WR", 5, "A", "st brown", "NN", "DET", 21], ["WR", 5, "J", "chase", "AN", "CIN", 21], ["WR", 5, "J", "jefferson", "NN", "MIN", 20], ["WR", 5, "T", "mclaurin", "NE", "WAS", 19], ["WR", 5, "C", "godwin", "NS", "TB", 17], ["WR", 5, "J", "williams", "NN", "DET", 22], ["WR", 5, "R", "rice", "AW", "KC", 23], ["WR", 5, "B", "thomas", "AS", "JAX", 24], ["WR", 5, "L", "mcconkey", "AW", "LAC", 24], ["WR", 5, "J", "smith njigba", "NW", "SEA", 23], ["WR", 5, "C", "lamb", "NE", "DAL", 20], ["WR", 5, "C", "sutton", "AW", "DEN", 18], ["WR", 5, "R", "odunze", "NN", "CHI", 24], ["WR", 5, "D", "metcalf", "AN", "PIT", 19], ["WR", 5, "D", "moore", "NN", "CHI", 18], ["WR", 5, "T", "hill", "AE", "MIA", 16], ["WR", 5, "S", "diggs", "AE", "NE", 15], ["WR", 5, "M", "evans", "NS", "TB", 14], ["WR", 5, "E", "egbuka", "NS", "TB", 25], ["WR", 5, "D", "adams", "NW", "LAR", 14], ["WR", 5, "N", "collins", "AS", "HOU", 21], ["WR", 5, "M", "pittman", "AS", "IND", 20], ["WR", 5, "D", "smith", "NE", "PHI", 21], ["WR", 5, "T", "higgins", "AN", "CIN", 20], ["WR", 5, "A", "brown", "NE", "PHI", 19], ["WR", 5, "D", "samuel", "NE", "WAS", 19],
    ["WR", 4, "P", "nacua", "NW", "LAR", 23], ["WR", 4, "M", "evans", "NS", "TB", 14], ["WR", 4, "M", "nabers", "NE", "NYG", 24], ["WR", 4, "D", "london", "NS", "ATL", 22], ["WR", 4, "J", "smith njigba", "NW", "SEA", 23], ["WR", 4, "G", "pickens", "NE", "DAL", 22], ["WR", 4, "G", "wilson", "AE", "NYJ", 22], ["WR", 4, "A", "st brown", "NN", "DET", 21], ["WR", 4, "J", "chase", "AN", "CIN", 21], ["WR", 4, "C", "lamb", "NE", "DAL", 20], ["WR", 4, "J", "jefferson", "NN", "MIN", 20], ["WR", 4, "C", "olave", "NS", "NO", 22], ["WR", 4, "R", "rice", "AW", "KC", 23], ["WR", 4, "N", "collins", "AS", "HOU", 21], ["WR", 4, "D", "adams", "NW", "LAR", 14],
    ["WR", 3, "D", "samuel", "NE", "WAS", 19], ["WR", 3, "C", "sutton", "AW", "DEN", 18], ["WR", 3, "T", "hill", "AE", "MIA", 16], ["WR", 3, "E", "egbuka", "NS", "TB", 25], ["WR", 3, "T", "mcmillan", "NS", "CAR", 25], ["WR", 3, "R", "odunze", "NN", "CHI", 24], ["WR", 3, "L", "mcconkey", "AW", "LAC", 24], ["WR", 3, "M", "harrison", "NW", "ARI", 24], ["WR", 3, "B", "thomas", "AS", "JAX", 24], ["WR", 3, "M", "wilson", "NW", "ARI", 23], ["WR", 3, "J", "williams", "NN", "DET", 22], ["WR", 3, "W", "robinson", "NE", "NYG", 22], ["WR", 3, "J", "waddle", "AE", "MIA", 21], ["WR", 3, "M", "pittman", "AS", "IND", 20], ["WR", 3, "T", "higgins", "AN", "CIN", 20], ["WR", 3, "D", "smith", "NE", "PHI", 21], ["WR", 3, "A", "brown", "NE", "PHI", 19], ["WR", 3, "T", "mclaurin", "NE", "WAS", 19], ["WR", 3, "J", "meyers", "AS", "JAX", 19], ["WR", 3, "D", "metcalf", "AN", "PIT", 19], ["WR", 3, "D", "moore", "NN", "CHI", 18], ["WR", 3, "Z", "flowers", "AN", "BAL", 23], ["WR", 3, "C", "godwin", "NS", "TB", 17], ["WR", 3, "S", "diggs", "AE", "NE", 15],
    ["WR", 2, "C", "dike", "AS", "TEN", 25], ["WR", 2, "J", "jeudy", "AN", "CLE", 20], ["WR", 2, "H", "brown", "AW", "KC", 19], ["WR", 2, "D", "hopkins", "AN", "BAL", 13], ["WR", 2, "J", "higgins", "AS", "HOU", 25], ["WR", 2, "C", "tillman", "AN", "CLE", 23], ["WR", 2, "C", "kupp", "NW", "SEA", 17], ["WR", 2, "K", "allen", "AW", "LAC", 13], ["WR", 2, "L", "burden", "NN", "CHI", 25], ["WR", 2, "M", "golden", "NN", "GB", 25], ["WR", 2, "T", "hunter", "AS", "JAX", 25], ["WR", 2, "X", "worthy", "NW", "SEA", 24], ["WR", 2, "R", "flournoy", "NE", "DAL", 24], ["WR", 2, "J", "coker", "NS", "CAR", 24], ["WR", 2, "M", "washington", "NN", "CHI", 24], ["WR", 2, "R", "pearsall", "NN", "GB", 24], ["WR", 2, "A", "mitchell", "AW", "KC", 24], ["WR", 2, "T", "franklin", "AE", "MIA", 24], ["WR", 2, "T", "dell", "AS", "HOU", 23], ["WR", 2, "P", "washington", "AE", "BUF", 23], ["WR", 2, "C", "watson", "AE", "NYJ", 22], ["WR", 2, "A", "pierce", "AW", "DEN", 22], ["WR", 2, "J", "reed", "NW", "ARI", 23], ["WR", 2, "K", "shakir", "AE", "BUF", 22], ["WR", 2, "R", "doubs", "AS", "JAX", 22], ["WR", 2, "J", "addison", "NN", "GB", 23], ["WR", 2, "K", "boutte", "AE", "NE", 23], ["WR", 2, "R", "bateman", "AN", "BAL", 21], ["WR", 2, "J", "jennings", "NW", "SF", 20], ["WR", 2, "R", "shaheed", "NW", "SEA", 22], ["WR", 2, "M", "mims", "AW", "DEN", 23], ["WR", 2, "D", "mooney", "NS", "ATL", 20], ["WR", 2, "M", "hollins", "AE", "NE", 17], ["WR", 2, "Q", "johnston", "AW", "LAC", 23], ["WR", 2, "C", "ridley", "AS", "TEN", 18], ["WR", 2, "C", "kirk", "AS", "HOU", 18], ["WR", 2, "T", "lockett", "AW", "LV", 15], ["WR", 2, "J", "downs", "AS", "IND", 23],
    ["WR", 1, "K", "mumpfield", "NW", "LAR", 25], ["WR", 1, "T", "palmer", "NS", "TB", 23], ["WR", 1, "J", "royals", "AW", "KC", 25], ["WR", 1, "K", "lambert", "AW", "LAC", 25], ["WR", 1, "L", "wester", "AN", "BAL", 25], ["WR", 1, "E", "chism", "AE", "NE", 25], ["WR", 1, "A", "smith", "AE", "NYJ", 25], ["WR", 1, "N", "brown", "NE", "WAS", 17], ["WR", 1, "T", "johnson", "NS", "TB", 25], ["WR", 1, "E", "ayomanor", "AS", "TEN", 25], ["WR", 1, "J", "horn", "NS", "CAR", 25], ["WR", 1, "M", "hardman", "AE", "BUF", 19], ["WR", 1, "T", "harris", "AW", "LAC", 25], ["WR", 1, "T", "tucker", "AW", "LV", 23], ["WR", 1, "G", "dortch", "NW", "ARI", 21], ["WR", 1, "I", "bond", "AN", "CLE", 25], ["WR", 1, "O", "zaccheaus", "NN", "CHI", 19], ["WR", 1, "T", "wallace", "AN", "BAL", 21], ["WR", 1, "T", "horton", "NW", "SEA", 25], ["WR", 1, "R", "chosen", "NE", "WAS", 16], ["WR", 1, "J", "noel", "AS", "HOU", 25], ["WR", 1, "S", "williams", "NN", "GB", 25], ["WR", 1, "T", "felton", "NN", "MIN", 25], ["WR", 1, "J", "bech", "AW", "LV", 25], ["WR", 1, "I", "teslaa", "NN", "DET", 25], ["WR", 1, "J", "mcmillan", "NS", "TB", 24], ["WR", 1, "K", "williams", "AE", "NE", 25], ["WR", 1, "J", "whittington", "NW", "LAR", 24], ["WR", 1, "C", "washington", "NS", "ATL", 24], ["WR", 1, "R", "wilson", "AN", "PIT", 24], ["WR", 1, "X", "legette", "NS", "CAR", 24], ["WR", 1, "D", "walker", "AN", "BAL", 24], ["WR", 1, "J", "thrash", "AN", "CLE", 24], ["WR", 1, "K", "coleman", "AE", "BUF", 24], ["WR", 1, "D", "thornton", "AW", "LV", 25], ["WR", 1, "T", "shavers", "AE", "BUF", 24], ["WR", 1, "D", "douglas", "AE", "NE", 23], ["WR", 1, "J", "hyatt", "NE", "NYG", 23], ["WR", 1, "A", "iosivas", "AN", "CIN", 23], ["WR", 1, "K", "tupin", "NE", "DAL", 22], ["WR", 1, "P", "bryant", "AW", "DEN", 25], ["WR", 1, "T", "thornton", "AW", "KC", 22], ["WR", 1, "S", "moore", "NW", "SF", 22], ["WR", 1, "J", "burton", "AN", "CIN", 24], ["WR", 1, "J", "metchie", "AE", "NYJ", 23], ["WR", 1, "J", "palmer", "AE", "BUF", 21], ["WR", 1, "T", "atwell", "NW", "LAR", 21], ["WR", 1, "E", "moore", "AW", "DEN", 21], ["WR", 1, "J", "tolbert", "NE", "DAL", 22], ["WR", 1, "V", "jefferson", "AS", "TEN", 20], ["WR", 1, "D", "duvernay", "NN", "CHI", 20], ["WR", 1, "T", "johnson", "AE", "NYJ", 20], ["WR", 1, "J", "dotson", "NE", "PHI", 22], ["WR", 1, "B", "skowronek", "AN", "PIT", 21], ["WR", 1, "D", "brown", "AS", "JAX", 21], ["WR", 1, "N", "westbrook ikhine", "AE", "MIA", 20], ["WR", 1, "A", "dulin", "AS", "IND", 19], ["WR", 1, "D", "vele", "NS", "NO", 24], ["WR", 1, "A", "lazard", "AE", "NYJ", 19], ["WR", 1, "J", "watson", "AS", "HOU", 18], ["WR", 1, "L", "mccaffrey", "NE", "WAS", 24], ["WR", 1, "J", "smith schuster", "AW", "KC", 17], ["WR", 1, "M", "tipton", "NS", "NO", 24], ["WR", 1, "J", "bobo", "NW", "SEA", 23], ["WR", 1, "D", "slayton", "NE", "NYG", 19], ["WR", 1, "K", "hodge", "NS", "ATL", 18], ["WR", 1, "C", "wilson", "AE", "MIA", 18], ["WR", 1, "B", "berrios", "AS", "HOU", 18], ["WR", 1, "R", "mccloud", "NE", "NYG", 18], ["WR", 1, "J", "nailor", "NN", "MIN", 22], ["WR", 1, "M", "valdes scanting", "AN", "PIT", 18], ["WR", 1, "D", "wicks", "NN", "GB", 23], ["WR", 1, "K", "bourne", "NW", "SF", 17], ["WR", 1, "J", "reynolds", "AE", "NYJ", 18], ["WR", 1, "Z", "jones", "NW", "ARI", 17], ["WR", 1, "K", "raymond", "NN", "DET", 17], ["WR", 1, "C", "moore", "NE", "WAS", 16], ["WR", 1, "S", "shepard", "NS", "TB", 16], ["WR", 1, "C", "austin", "AN", "PIT", 22], ["WR", 1, "B", "cooks", "AE", "BUF", 14], ["WR", 1, "A", "thielen", "AN", "PIT", 13], ["WR", 1, "D", "robinson", "NW", "SF", 16], ["WR", 1, "T", "patrick", "AS", "JAX", 18],
    ["TE", 5, "H", "fannin", "AN", "CLE", 25], ["TE", 5, "T", "mcbride", "NW", "ARI", 22], ["TE", 5, "K", "pitts", "NS", "ATL", 21], ["TE", 5, "D", "goedert", "NE", "PHI", 18], ["TE", 5, "T", "kelce", "AW", "KC", 13], ["TE", 5, "B", "bowers", "AW", "LV", 24], ["TE", 5, "D", "kincaid", "AE", "BUF", 23], ["TE", 5, "S", "laporta", "NN", "DET", 23], ["TE", 5, "C", "loveland", "NN", "CHI", 25], ["TE", 5, "T", "warren", "AS", "IND", 25], ["TE", 5, "G", "kittle", "NW", "SF", 17], ["TE", 5, "J", "johnson", "NS", "NO", 20], ["TE", 5, "T", "kraft", "NN", "GB", 23], ["TE", 5, "J", "ferguson", "NE", "DAL", 22],
    ["TE", 4, "T", "mcbride", "NW", "ARI", 22], ["TE", 4, "T", "warren", "AS", "IND", 25], ["TE", 4, "B", "bowers", "AW", "LV", 24], ["TE", 4, "G", "kittle", "NW", "SF", 17], ["TE", 4, "T", "kelce", "AW", "KC", 13],
    ["TE", 3, "H", "fannin", "AN", "CLE", 25], ["TE", 3, "C", "loveland", "NN", "CHI", 25], ["TE", 3, "D", "kincaid", "AE", "BUF", 23], ["TE", 3, "S", "laporta", "NN", "DET", 23], ["TE", 3, "J", "ferguson", "NE", "DAL", 22], ["TE", 3, "J", "johnson", "NS", "NO", 20], ["TE", 3, "T", "kraft", "NN", "GB", 23], ["TE", 3, "D", "goedert", "NE", "PHI", 18], ["TE", 3, "K", "pitts", "NS", "ATL", 21],
    ["TE", 2, "D", "waller", "AE", "MIA", 15], ["TE", 2, "I", "likely", "AN", "BAL", 22], ["TE", 2, "B", "strange", "AS", "JAX", 23], ["TE", 2, "C", "otton", "NS", "TB", 22], ["TE", 2, "P", "friermuth", "AN", "PIT", 21], ["TE", 2, "C", "parkinson", "NW", "LAR", 20], ["TE", 2, "C", "kmet", "NN", "CHI", 20], ["TE", 2, "T", "hockenson", "NN", "MIN", 19], ["TE", 2, "J", "tonges", "NW", "SF", 22], ["TE", 2, "D", "schultz", "AS", "HOU", 18], ["TE", 2, "M", "gesicki", "AN", "CIN", 18], ["TE", 2, "J", "smith", "AN", "PIT", 17], ["TE", 2, "E", "engram", "AW", "DEN", 17], ["TE", 2, "T", "johnson", "NE", "NYG", 24], ["TE", 2, "D", "njoku", "AN", "CLE", 17], ["TE", 2, "T", "higbee", "NW", "LAR", 16], ["TE", 2, "H", "henry", "AE", "NE", 16], ["TE", 2, "M", "andrews", "AN", "BAL", 18], ["TE", 2, "Z", "ertz", "NE", "WAS", 13], ["TE", 2, "O", "gadsden", "AW", "LAC", 25],
    ["TE", 1, "T", "ferguson", "AE", "BUF", 25], ["TE", 1, "M", "taylor", "AE", "NYJ", 25], ["TE", 1, "N", "fant", "AN", "CIN", 19], ["TE", 1, "T", "conklin", "AW", "LAC", 18], ["TE", 1, "E", "arroyo", "NW", "SEA", 25], ["TE", 1, "J", "sanders", "NS", "CAR", 24], ["TE", 1, "A", "barner", "NW", "SEA", 24], ["TE", 1, "B", "sinnott", "NE", "WAS", 24], ["TE", 1, "C", "stover", "AS", "HOU", 24], ["TE", 1, "E", "higgins", "NW", "ARI", 23], ["TE", 1, "J", "hill", "AE", "MIA", 23], ["TE", 1, "L", "musgrave", "NN", "GB", 23], ["TE", 1, "D", "allen", "NW", "LAR", 23], ["TE", 1, "D", "bellinger", "NE", "NYG", 22], ["TE", 1, "C", "okonkwo", "AS", "TEN", 22], ["TE", 1, "M", "mayer", "AW", "LV", 23], ["TE", 1, "D", "washington", "AN", "PIT", 23], ["TE", 1, "T", "tremble", "NS", "CAR", 21], ["TE", 1, "J", "ruckert", "AE", "NYJ", 22], ["TE", 1, "H", "long", "AS", "JAX", 21], ["TE", 1, "F", "moreau", "NS", "NO", 19], ["TE", 1, "J", "oliver", "NN", "MIN", 19], ["TE", 1, "D", "knox", "AE", "BUF", 19], ["TE", 1, "D", "smythe", "NN", "CHI", 18], ["TE", 1, "W", "dissly", "AW", "LAC", 18], ["TE", 1, "M", "alie cox", "AS", "IND", 18], ["TE", 1, "J", "bates", "NE", "WAS", 21], ["TE", 1, "A", "hooper", "AE", "NE", 16], ["TE", 1, "G", "helm", "AS", "TEN", 25], ["TE", 1, "N", "gray", "AW", "KC", 21], ["TE", 1, "G", "dulich", "AE", "MIA", 22], ["TE", 1, "M", "evans", "NS", "CAR", 25], ["TE", 1, "J", "hawes", "AE", "BUF", 25],
];

// Process raw data into player objects
let nextId = 0;

function capitalize(str) {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export const ALL_PLAYERS = RAW_DATA.map(([pos, skill, initial, name, div, team, draftYear]) => {
    const displayName = `${initial.toUpperCase()}. ${capitalize(name)}`;
    const searchName = `${displayName} (${RARITY_NAMES[skill]})`;
    return {
        id: nextId++,
        pos,
        skill,
        initial: initial.toUpperCase(),
        name,
        displayName,
        searchName,
        div,
        team,
        draftYear,
        talent: TALENT_VALUES[skill],
        rarity: RARITY_NAMES[skill],
        rarityColor: RARITY_COLORS[skill],
    };
});

// Group players by base identity (initial + name + pos) for the "already seen" mechanic
// When any version of a player is picked or shown, ALL versions are removed
export function getBasePlayerKey(player) {
    return `${player.pos}_${player.initial}_${player.name}`;
}

// Get all player IDs that share the same base identity
export function getRelatedPlayerIds(player) {
    const key = getBasePlayerKey(player);
    return ALL_PLAYERS.filter(p => getBasePlayerKey(p) === key).map(p => p.id);
}

// Search players by name
export function searchPlayers(query, availableIds = null) {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return ALL_PLAYERS.filter(p => {
        if (availableIds !== null && !availableIds.has(p.id)) return false;
        return p.searchName.toLowerCase().includes(q) ||
            p.team.toLowerCase().includes(q) ||
            (RARITY_NAMES[p.skill] || '').toLowerCase().includes(q);
    }).slice(0, 20);
}

// Get player by ID
export function getPlayerById(id) {
    return ALL_PLAYERS.find(p => p.id === id) || null;
}

// Get all players filtered by position
export function getPlayersByPosition(pos) {
    return ALL_PLAYERS.filter(p => p.pos === pos);
}
