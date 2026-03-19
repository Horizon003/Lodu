import { renderBoard } from './components/board.js';
import { PLAYERS } from './game/constants.js';
import {
  createInitialState,
  getCurrentPlayer,
  getMovableTokens,
  moveToken,
  rollDice,
  tokensForPlayer,
} from './game/engine.js';

const modeCards = [
  { title: 'Classic Royale', detail: 'Traditional 4-player race with premium UI flow.', active: true },
  { title: 'Power Match', detail: 'Boost cells, combo captures, and live modifiers can be layered next.', active: false },
  { title: 'Online Arena', detail: 'The modular structure is ready for backend multiplayer and rooms.', active: false },
];

function renderPlayerStats(state) {
  return PLAYERS.map((player) => {
    const tokens = tokensForPlayer(state, player.key);
    const finished = tokens.filter((token) => token.status === 'finished').length;
    const onBoard = tokens.filter((token) => token.status === 'track').length;
    const inLane = tokens.filter((token) => token.status === 'home').length;

    return `
      <article class="stat-card">
        <div class="stat-header">
          <span class="player-pill ${player.theme}">${player.name}</span>
          <span class="stat-summary">${finished}/4 finish</span>
        </div>
        <div class="progress-bar">
          <span style="width: ${finished * 25}%; background: var(${player.colorVar});"></span>
        </div>
        <p class="stat-detail">${onBoard} on board · ${inLane} in home lane</p>
      </article>
    `;
  }).join('');
}

function renderActivity(state) {
  return state.activity
    .map(
      (item) => `
        <div class="activity-item">
          <span class="activity-dot"></span>
          <p>${item}</p>
        </div>
      `
    )
    .join('');
}

function renderModes() {
  return modeCards
    .map(
      (mode) => `
        <article class="mode-card ${mode.active ? 'active' : ''}">
          <h3>${mode.title}</h3>
          <p>${mode.detail}</p>
        </article>
      `
    )
    .join('');
}

function renderApp(state, soundOn) {
  const currentPlayer = getCurrentPlayer(state);
  const movableTokens = getMovableTokens(state);
  const movableIds = new Set(movableTokens.map((token) => token.id));

  const instruction = state.winner
    ? `${state.winner.name} wins the match. Reset to play again.`
    : state.canRoll
      ? `${currentPlayer.name}, roll the dice to start your move.`
      : movableTokens.length
        ? `${currentPlayer.name}, choose a highlighted token.`
        : `${currentPlayer.name} has no legal move.`;

  return `
    <main class="app-shell">
      <section class="hero-panel glass-panel">
        <div class="hero-copy-block">
          <p class="eyebrow">Option 2 rebuild · modular game architecture</p>
          <h1>Lodu Royale</h1>
          <p class="hero-copy">
            Rebuilt into a multi-module web game foundation instead of a one-file mockup, with a reusable board renderer,
            centralized rules engine, scalable UI sections, and cleaner match flow.
          </p>
        </div>

        <div class="hero-actions">
          <button class="primary-btn" data-action="reset">New Match</button>
          <button class="secondary-btn" data-action="roll" ${!state.canRoll || state.winner ? 'disabled' : ''}>Roll Dice</button>
          <button class="toggle-btn" data-action="sound">${soundOn ? 'Sound On' : 'Sound Off'}</button>
        </div>
      </section>

      <section class="content-grid">
        <aside class="sidebar-stack">
          <section class="glass-panel panel status-panel">
            <div class="panel-heading">
              <div>
                <p class="eyebrow small">Match status</p>
                <h2>${state.mode}</h2>
              </div>
              <span class="player-pill ${currentPlayer.theme}">${currentPlayer.name}</span>
            </div>

            <div class="status-hero">
              <div>
                <p class="label">Turn guidance</p>
                <p class="instruction">${instruction}</p>
              </div>
              <button class="dice-orb ${!state.canRoll || state.winner ? 'locked' : ''}" data-action="roll" ${!state.canRoll || state.winner ? 'disabled' : ''}>
                ${state.diceValue ?? '🎲'}
              </button>
            </div>
          </section>

          <section class="glass-panel panel">
            <div class="panel-heading compact">
              <div>
                <p class="eyebrow small">Roadmap-ready modes</p>
                <h2>Experience Layers</h2>
              </div>
            </div>
            <div class="mode-list">${renderModes()}</div>
          </section>

          <section class="glass-panel panel">
            <div class="panel-heading compact">
              <div>
                <p class="eyebrow small">Live telemetry</p>
                <h2>Squad Progress</h2>
              </div>
            </div>
            <div class="stats-grid">${renderPlayerStats(state)}</div>
          </section>
        </aside>

        <section class="glass-panel panel board-panel">
          <div class="panel-heading board-heading">
            <div>
              <p class="eyebrow small">Advanced board presentation</p>
              <h2>Premium Arena</h2>
            </div>
            <p class="board-copy">
              The game rules, board rendering, and state flow now live in separate modules so the project can grow into
              richer visuals, events, multiplayer, and backend-connected modes.
            </p>
          </div>

          ${renderBoard(state, movableIds)}
        </section>

        <aside class="sidebar-stack right">
          <section class="glass-panel panel">
            <div class="panel-heading compact">
              <div>
                <p class="eyebrow small">Session feed</p>
                <h2>Activity Log</h2>
              </div>
            </div>
            <div class="activity-feed">${renderActivity(state)}</div>
          </section>

          <section class="glass-panel panel feature-panel">
            <p class="eyebrow small">Why this is better</p>
            <h2>Rebuild Direction</h2>
            <ul>
              <li>Multi-file modular structure instead of a monolithic single page.</li>
              <li>Centralized rules engine for easier AI, effects, and multiplayer.</li>
              <li>More market-ready dashboard layout and session flow.</li>
              <li>Cleaner path for assets, backend APIs, animations, and future game modes.</li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  `;
}

export function mountApp(root) {
  let state = createInitialState();
  let soundOn = true;

  function rerender() {
    root.innerHTML = renderApp(state, soundOn);

    root.querySelectorAll('[data-action="roll"]').forEach((button) => {
      button.addEventListener('click', () => {
        state = { ...rollDice(state) };
        rerender();
      });
    });

    root.querySelector('[data-action="reset"]')?.addEventListener('click', () => {
      state = createInitialState();
      rerender();
    });

    root.querySelector('[data-action="sound"]')?.addEventListener('click', () => {
      soundOn = !soundOn;
      rerender();
    });

    root.querySelectorAll('[data-token-id]').forEach((button) => {
      button.addEventListener('click', () => {
        state = { ...moveToken(state, button.dataset.tokenId) };
        rerender();
      });
    });
  }

  rerender();
}
