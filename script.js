const boardElement = document.getElementById('board');
const diceButton = document.getElementById('diceButton');
const rollDiceBtn = document.getElementById('rollDiceBtn');
const newGameBtn = document.getElementById('newGameBtn');
const diceFace = document.getElementById('diceFace');
const diceValueLabel = document.getElementById('diceValueLabel');
const currentPlayerBadge = document.getElementById('currentPlayerBadge');
const turnInstruction = document.getElementById('turnInstruction');
const playerStats = document.getElementById('playerStats');
const playerStatTemplate = document.getElementById('playerStatTemplate');

const players = [
  { key: 'red', name: 'Red', colorClass: 'player-red', startIndex: 0, homeEntryIndex: 50 },
  { key: 'green', name: 'Green', colorClass: 'player-green', startIndex: 13, homeEntryIndex: 11 },
  { key: 'yellow', name: 'Yellow', colorClass: 'player-yellow', startIndex: 26, homeEntryIndex: 24 },
  { key: 'blue', name: 'Blue', colorClass: 'player-blue', startIndex: 39, homeEntryIndex: 37 },
];

const track = [
  [6, 1], [6, 2], [6, 3], [6, 4], [6, 5], [5, 6], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 7], [0, 8],
  [1, 8], [2, 8], [3, 8], [4, 8], [5, 8], [6, 9], [6, 10], [6, 11], [6, 12], [6, 13], [6, 14], [7, 14], [8, 14],
  [8, 13], [8, 12], [8, 11], [8, 10], [8, 9], [9, 8], [10, 8], [11, 8], [12, 8], [13, 8], [14, 8], [14, 7], [14, 6],
  [13, 6], [12, 6], [11, 6], [10, 6], [9, 6], [8, 5], [8, 4], [8, 3], [8, 2], [8, 1], [8, 0], [7, 0], [6, 0],
];

const homePaths = {
  red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6]],
  green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7], [6, 7]],
  yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9], [7, 8]],
  blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7], [8, 7]],
};

const bases = {
  red: { area: { rowStart: 1, rowEnd: 6, colStart: 1, colEnd: 6 }, slots: [[2, 2], [2, 4], [4, 2], [4, 4]] },
  green: { area: { rowStart: 1, rowEnd: 6, colStart: 10, colEnd: 15 }, slots: [[2, 10], [2, 12], [4, 10], [4, 12]] },
  yellow: { area: { rowStart: 10, rowEnd: 15, colStart: 10, colEnd: 15 }, slots: [[10, 10], [10, 12], [12, 10], [12, 12]] },
  blue: { area: { rowStart: 10, rowEnd: 15, colStart: 1, colEnd: 6 }, slots: [[10, 2], [10, 4], [12, 2], [12, 4]] },
};

const safeIndices = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
const cellLookup = new Map();
const trackLookup = new Map(track.map((coords, index) => [coords.join(','), index]));
const centerCells = new Set(['6,6', '6,7', '6,8', '7,6', '7,7', '7,8', '8,6', '8,7', '8,8']);
const baseSlotLookup = new Map(
  Object.entries(bases).flatMap(([playerKey, config]) =>
    config.slots.map((coords, index) => [coords.join(','), { playerKey, index }])
  )
);

let state = {};

function createInitialState() {
  return {
    currentPlayerIndex: 0,
    diceValue: null,
    canRoll: true,
    winner: null,
    tokens: players.flatMap((player) =>
      Array.from({ length: 4 }, (_, tokenIndex) => ({
        id: `${player.key}-${tokenIndex}`,
        player: player.key,
        status: 'base',
        progress: -1,
      }))
    ),
  };
}

function createBoard() {
  boardElement.innerHTML = '';
  cellLookup.clear();

  for (let row = 0; row < 15; row += 1) {
    for (let col = 0; col < 15; col += 1) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.gridRow = row + 1;
      cell.style.gridColumn = col + 1;
      const key = `${row},${col}`;
      cell.dataset.key = key;
      configureCell(cell, row, col);
      boardElement.appendChild(cell);
      cellLookup.set(key, cell);
    }
  }
}

function configureCell(cell, row, col) {
  const key = `${row},${col}`;

  if (trackLookup.has(key)) {
    cell.classList.add('track');
    if (safeIndices.has(trackLookup.get(key))) {
      cell.classList.add('safe');
    }
  }

  for (const player of players) {
    const homeIndex = homePaths[player.key].findIndex(([r, c]) => r === row && c === col);
    if (homeIndex !== -1) {
      cell.classList.add('home-path', player.key);
      cell.innerHTML = `<span class="cell-label">${homeIndex + 1}</span>`;
      return;
    }
  }

  for (const player of players) {
    const area = bases[player.key].area;
    if (row >= area.rowStart && row < area.rowEnd && col >= area.colStart && col < area.colEnd) {
      cell.classList.add('base-zone', player.key);
      const slotMeta = baseSlotLookup.get(key);
      if (slotMeta) {
        cell.classList.add('base-slot');
      }
      return;
    }
  }

  if (centerCells.has(key)) {
    cell.classList.add('finish-zone');
    if (key === '7,7') {
      cell.classList.add('finish');
      cell.innerHTML = '<div class="finish-core"><div id="finishStack" class="token-stack"></div></div>';
    }
  }
}

function getCurrentPlayer() {
  return players[state.currentPlayerIndex];
}

function tokensForPlayer(playerKey) {
  return state.tokens.filter((token) => token.player === playerKey);
}

function getTokenCoordinates(token) {
  if (token.status === 'base') {
    const slots = bases[token.player].slots;
    const index = Number(token.id.split('-')[1]);
    return slots[index];
  }

  if (token.status === 'track') {
    return track[token.progress];
  }

  if (token.status === 'home') {
    const homeStep = token.progress - 52;
    return homePaths[token.player][homeStep];
  }

  return null;
}

function getTokenStateAfterMove(token, steps) {
  if (token.status === 'base') {
    if (steps !== 6) return null;
    return { status: 'track', progress: players.find((player) => player.key === token.player).startIndex };
  }

  const player = players.find((item) => item.key === token.player);
  const currentOverall = token.progress;
  let pathIndex;

  if (token.status === 'track') {
    const distanceFromStart = (currentOverall - player.startIndex + 52) % 52;
    pathIndex = distanceFromStart;
  } else if (token.status === 'home') {
    pathIndex = 52 + (token.progress - 52);
  }

  const target = pathIndex + steps;
  if (target > 57) return null;

  if (target < 52) {
    return {
      status: 'track',
      progress: (player.startIndex + target) % 52,
    };
  }

  if (target === 57) {
    return { status: 'finished', progress: 57 };
  }

  return { status: 'home', progress: target };
}

function getMovableTokens() {
  if (!state.diceValue || state.winner) return [];
  return tokensForPlayer(getCurrentPlayer().key).filter((token) => getTokenStateAfterMove(token, state.diceValue));
}

function renderTokens() {
  document.querySelectorAll('.token-stack').forEach((container) => {
    container.innerHTML = '';
  });

  const movableIds = new Set(getMovableTokens().map((token) => token.id));

  state.tokens.forEach((token) => {
    const piece = document.createElement('button');
    piece.className = `token ${token.player}`;
    piece.type = 'button';
    piece.setAttribute('aria-label', `${token.player} token`);

    if (movableIds.has(token.id)) {
      piece.classList.add('clickable', 'active');
      piece.addEventListener('click', () => moveToken(token.id));
    } else {
      piece.disabled = true;
    }

    if (token.status === 'finished') {
      document.getElementById('finishStack')?.appendChild(piece);
      return;
    }

    const coords = getTokenCoordinates(token);
    const cell = cellLookup.get(coords.join(','));
    if (!cell) {
      return;
    }

    let stack = cell.querySelector('.token-stack');
    if (!stack) {
      stack = document.createElement('div');
      stack.className = 'token-stack';
      cell.appendChild(stack);
    }
    stack.appendChild(piece);
  });
}

function updatePlayerStats() {
  playerStats.innerHTML = '';
  players.forEach((player) => {
    const node = playerStatTemplate.content.firstElementChild.cloneNode(true);
    const badge = node.querySelector('.player-badge');
    const progressText = node.querySelector('.player-progress');
    const meterFill = node.querySelector('.player-meter-fill');
    const finished = tokensForPlayer(player.key).filter((token) => token.status === 'finished').length;
    const homeRun = tokensForPlayer(player.key).filter((token) => token.status === 'home').length;
    const boardCount = tokensForPlayer(player.key).filter((token) => token.status === 'track').length;

    badge.className = `player-badge ${player.colorClass}`;
    badge.textContent = player.name;
    progressText.textContent = `${finished}/4 finished · ${boardCount} on board · ${homeRun} in home lane`;
    meterFill.style.width = `${(finished / 4) * 100}%`;
    meterFill.style.background = `var(--${player.key})`;
    playerStats.appendChild(node);
  });
}

function updateStatus(message = '') {
  const currentPlayer = getCurrentPlayer();
  currentPlayerBadge.className = `player-badge ${currentPlayer.colorClass}`;
  currentPlayerBadge.textContent = currentPlayer.name;

  if (state.winner) {
    turnInstruction.textContent = `${state.winner.name} wins the royale. Start a new match to play again.`;
    return;
  }

  const movableCount = getMovableTokens().length;
  if (message) {
    turnInstruction.textContent = message;
  } else if (!state.diceValue) {
    turnInstruction.textContent = `${currentPlayer.name}, roll the dice to make your move.`;
  } else if (movableCount === 0) {
    turnInstruction.textContent = `No valid move for ${currentPlayer.name}. Turn will pass automatically.`;
  } else {
    turnInstruction.textContent = `${currentPlayer.name}, choose one of the glowing tokens.`;
  }
}

function nextTurn(extraTurn = false) {
  state.diceValue = null;
  state.canRoll = true;
  if (!extraTurn) {
    state.currentPlayerIndex = (state.currentPlayerIndex + 1) % players.length;
  }
  diceValueLabel.textContent = 'Waiting...';
  diceFace.textContent = '?';
}

function handleCapture(movedToken) {
  if (movedToken.status !== 'track') return false;
  if (safeIndices.has(movedToken.progress)) return false;

  const opponents = state.tokens.filter(
    (token) => token.player !== movedToken.player && token.status === 'track' && token.progress === movedToken.progress
  );

  opponents.forEach((token) => {
    token.status = 'base';
    token.progress = -1;
  });

  return opponents.length > 0;
}

function moveToken(tokenId) {
  const token = state.tokens.find((item) => item.id === tokenId);
  const nextState = getTokenStateAfterMove(token, state.diceValue);
  if (!nextState) return;

  token.status = nextState.status;
  token.progress = nextState.progress;

  const captured = handleCapture(token);
  const finished = token.status === 'finished';

  if (tokensForPlayer(token.player).every((item) => item.status === 'finished')) {
    state.winner = players.find((player) => player.key === token.player);
  }

  const extraTurn = state.diceValue === 6 && !state.winner;
  const summary = finished
    ? `${getCurrentPlayer().name} reached the finish lane!`
    : captured
      ? `${getCurrentPlayer().name} captured an opponent token!`
      : extraTurn
        ? `${getCurrentPlayer().name} earned another roll with a 6.`
        : `${getCurrentPlayer().name} completed the move.`;

  nextTurn(extraTurn);
  render();
  updateStatus(summary);
}

function rollDice() {
  if (!state.canRoll || state.winner) return;

  state.canRoll = false;
  diceButton.classList.add('rolling');
  const value = Math.floor(Math.random() * 6) + 1;

  window.setTimeout(() => {
    diceButton.classList.remove('rolling');
    state.diceValue = value;
    diceFace.textContent = value;
    diceValueLabel.textContent = `Rolled ${value}`;

    const movable = getMovableTokens();
    if (movable.length === 0) {
      render();
      updateStatus(`No move for ${getCurrentPlayer().name} after rolling ${value}.`);
      const extraTurn = value === 6;
      window.setTimeout(() => {
        nextTurn(extraTurn);
        render();
        updateStatus(extraTurn ? `${getCurrentPlayer().name} rolled a 6 and keeps the turn.` : 'Turn changed.');
      }, 900);
      return;
    }

    render();
    updateStatus();
  }, 620);
}

function resetGame() {
  state = createInitialState();
  render();
  updateStatus('Fresh premium match started. Roll to begin.');
}

function render() {
  renderTokens();
  updatePlayerStats();
  const disabled = !state.canRoll || Boolean(state.winner);
  diceButton.disabled = disabled;
  rollDiceBtn.disabled = disabled;
}

createBoard();
resetGame();

diceButton.addEventListener('click', rollDice);
rollDiceBtn.addEventListener('click', rollDice);
newGameBtn.addEventListener('click', resetGame);
