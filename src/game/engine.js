import { BASES, HOME_PATHS, PLAYERS, SAFE_INDICES, TRACK } from './constants.js';

export function createInitialState() {
  return {
    currentPlayerIndex: 0,
    diceValue: null,
    canRoll: true,
    winner: null,
    activity: ['Welcome to Lodu Royale. Roll the dice to launch the match.'],
    mode: 'Classic Royale',
    tokens: PLAYERS.flatMap((player) =>
      Array.from({ length: 4 }, (_, tokenIndex) => ({
        id: `${player.key}-${tokenIndex}`,
        player: player.key,
        status: 'base',
        progress: -1,
      }))
    ),
  };
}

export function getCurrentPlayer(state) {
  return PLAYERS[state.currentPlayerIndex];
}

export function tokensForPlayer(state, playerKey) {
  return state.tokens.filter((token) => token.player === playerKey);
}

export function getTokenCoordinates(token) {
  if (token.status === 'base') {
    const index = Number(token.id.split('-')[1]);
    return BASES[token.player].slots[index];
  }

  if (token.status === 'track') return TRACK[token.progress];
  if (token.status === 'home') return HOME_PATHS[token.player][token.progress - 52];
  return null;
}

export function getTokenStateAfterMove(token, steps) {
  if (!steps) return null;

  if (token.status === 'base') {
    if (steps !== 6) return null;
    return {
      status: 'track',
      progress: PLAYERS.find((player) => player.key === token.player).startIndex,
    };
  }

  const player = PLAYERS.find((item) => item.key === token.player);
  let pathIndex = 0;

  if (token.status === 'track') {
    pathIndex = (token.progress - player.startIndex + 52) % 52;
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

export function getMovableTokens(state) {
  if (!state.diceValue || state.winner) return [];
  return tokensForPlayer(state, getCurrentPlayer(state).key).filter((token) => getTokenStateAfterMove(token, state.diceValue));
}

export function rollDice(state) {
  if (!state.canRoll || state.winner) return state;
  const value = Math.floor(Math.random() * 6) + 1;
  const current = getCurrentPlayer(state);
  const nextState = {
    ...state,
    diceValue: value,
    canRoll: false,
    activity: [`${current.name} rolled a ${value}.`, ...state.activity].slice(0, 8),
  };

  const movable = getMovableTokens(nextState);
  if (movable.length) return nextState;

  const extraTurn = value === 6;
  return advanceTurn({
    ...nextState,
    activity: [
      `${current.name} rolled ${value} but had no legal move.${extraTurn ? ' Bonus turn stays active.' : ''}`,
      ...state.activity,
    ].slice(0, 8),
  }, extraTurn);
}

function advanceTurn(state, keepTurn = false) {
  return {
    ...state,
    diceValue: null,
    canRoll: true,
    currentPlayerIndex: keepTurn ? state.currentPlayerIndex : (state.currentPlayerIndex + 1) % PLAYERS.length,
  };
}

export function moveToken(state, tokenId) {
  if (state.winner || state.canRoll) return state;
  const token = state.tokens.find((item) => item.id === tokenId);
  const candidate = getTokenStateAfterMove(token, state.diceValue);
  if (!candidate) return state;

  const updatedTokens = state.tokens.map((item) =>
    item.id === tokenId ? { ...item, ...candidate } : item
  );

  const movedToken = updatedTokens.find((item) => item.id === tokenId);
  let captured = [];

  if (movedToken.status === 'track' && !SAFE_INDICES.has(movedToken.progress)) {
    captured = updatedTokens.filter(
      (item) => item.player !== movedToken.player && item.status === 'track' && item.progress === movedToken.progress
    );
    captured.forEach((item) => {
      item.status = 'base';
      item.progress = -1;
    });
  }

  const player = PLAYERS.find((entry) => entry.key === movedToken.player);
  const playerWon = updatedTokens.filter((item) => item.player === movedToken.player).every((item) => item.status === 'finished');
  const extraTurn = state.diceValue === 6 && !playerWon;

  const resultState = {
    ...state,
    tokens: updatedTokens,
    winner: playerWon ? player : null,
    activity: [
      playerWon
        ? `${player.name} completed all tokens and won the match.`
        : captured.length
          ? `${player.name} captured ${captured.length} token${captured.length > 1 ? 's' : ''}.`
          : movedToken.status === 'finished'
            ? `${player.name} moved a token into the crown zone.`
            : `${player.name} advanced a token by ${state.diceValue}.`,
      ...state.activity,
    ].slice(0, 8),
  };

  if (playerWon) {
    return {
      ...resultState,
      canRoll: false,
      diceValue: null,
    };
  }

  return advanceTurn(resultState, extraTurn);
}
