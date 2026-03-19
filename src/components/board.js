import { BASES, CENTER_CELLS, HOME_PATHS, PLAYERS, SAFE_INDICES, TRACK_LOOKUP } from '../game/constants.js';
import { getTokenCoordinates } from '../game/engine.js';

const cellKeys = Array.from({ length: 15 * 15 }, (_, index) => {
  const row = Math.floor(index / 15);
  const col = index % 15;
  return [row, col];
});

export function renderBoard(state, movableIds) {
  const tokensByCell = new Map();

  state.tokens.forEach((token) => {
    if (token.status === 'finished') return;
    const coordinates = getTokenCoordinates(token);
    const key = coordinates.join(',');
    if (!tokensByCell.has(key)) tokensByCell.set(key, []);
    tokensByCell.get(key).push(token);
  });

  const finishedTokens = state.tokens.filter((token) => token.status === 'finished');

  return `
    <div class="board-shell">
      <div class="board-grid" aria-label="Lodu Royale board">
        ${cellKeys
          .map(([row, col]) => {
            const key = `${row},${col}`;
            const classNames = ['board-cell'];
            let label = '';

            if (TRACK_LOOKUP.has(key)) {
              classNames.push('track');
              if (SAFE_INDICES.has(TRACK_LOOKUP.get(key))) classNames.push('safe');
            }

            PLAYERS.forEach((player) => {
              const homeIndex = HOME_PATHS[player.key].findIndex(([r, c]) => r === row && c === col);
              if (homeIndex !== -1) {
                classNames.push('home-path', player.key);
                label = `<span class="cell-label">${homeIndex + 1}</span>`;
              }

              const area = BASES[player.key].area;
              if (row >= area.rowStart && row < area.rowEnd && col >= area.colStart && col < area.colEnd) {
                classNames.push('base-zone', player.key);
              }
            });

            if (Object.values(BASES).some((base) => base.slots.some(([r, c]) => r === row && c === col))) {
              classNames.push('base-slot');
            }

            if (CENTER_CELLS.has(key)) classNames.push('finish-zone');
            if (key === '7,7') classNames.push('finish-core-cell');

            const tokens = (tokensByCell.get(key) ?? [])
              .map(
                (token) => `
                  <button
                    type="button"
                    class="token ${token.player} ${movableIds.has(token.id) ? 'active' : ''}"
                    data-token-id="${token.id}"
                    ${movableIds.has(token.id) ? '' : 'disabled'}
                    aria-label="${token.player} token"
                  ></button>`
              )
              .join('');

            const finished =
              key === '7,7'
                ? finishedTokens.map((token) => `<span class="token ${token.player} mini"></span>`).join('')
                : '';

            return `
              <div class="${classNames.join(' ')}" data-cell-key="${key}">
                ${label}
                <div class="token-stack">${tokens}${finished}</div>
              </div>`;
          })
          .join('')}
      </div>
    </div>
  `;
}
